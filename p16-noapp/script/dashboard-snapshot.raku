#!/usr/bin/env raku

# feat#06 dashboard snapshot
# see design/feat06-dashboard.md for full spec

use v6.d;

constant \ROOT = $*HOME.add('Desktop/data');

# exclusion patterns for file counting
my @exclude-ext = <.html .css .js .ods .odt .pdf>;

sub MAIN() {
    my $target-date = Date.today;
    my $date-str    = sprintf('%02d%02d%02d', $target-date.year % 100, $target-date.month, $target-date.day);

    note "dashboard-snapshot: run for date $date-str";

    # discover all observed folders (immediate subfolders with _index.spec)
    my @observed;
    for ROOT.dir.sort -> $dir {
        next unless $dir.d;
        my $spec-file = $dir.add('_index.spec');
        next unless $spec-file.e;

        my @metrics = $spec-file.lines.grep(*.trim.chars > 0).map(*.trim);
        next unless @metrics;

        @observed.push: %(
            path    => $dir,
            name    => $dir.basename,
            spec    => $spec-file,
            metrics => @metrics,
        );
    }

    note "  found { +@observed } observed folders";

    # phase 1: per-folder snapshots
    for @observed -> %obs {
        process-folder(%obs, $date-str);
    }

    # phase 2: root dataview
    update-root-dataview(@observed, $date-str);

    note "dashboard-snapshot: done";
}

# --- per-folder processing ---

sub process-folder(%obs, Str $date-str) {
    my $dir     = %obs<path>;
    my @metrics = %obs<metrics>.flat;
    my $db-file = $dir.add('_index.tdb');

    note "  processing { %obs<name> }";

    # idempotency: skip if date already recorded
    if $db-file.e {
        my @lines = $db-file.lines;
        if @lines.elems > 1 {
            for @lines[1..*] -> $line {
                my @cols = $line.split("\t");
                if @cols[0] eq $date-str {
                    note "    skip: $date-str already in _index.tdb";
                    return;
                }
            }
        }
    }

    # calculate metrics
    my %values = calculate-metrics($dir, @metrics);

    # append to _index.tdb
    append-db($db-file, @metrics, %values, $date-str);

    # update _index (delta view)
    update-delta-view($dir, @metrics);
}

sub calculate-metrics(IO::Path $dir, @metrics --> Hash) {
    my @files = collect-files($dir);

    my %result;
    for @metrics -> $m {
        given $m {
            when 'file' { %result<file> = +@files }
            when 'line' {
                my $total = 0;
                for @files -> $f {
                    $total += try { $f.lines.elems } // 0;
                }
                %result<line> = $total;
            }
            when 'word' {
                my $total = 0;
                for @files -> $f {
                    $total += try { $f.slurp.words.elems } // 0;
                }
                %result<word> = $total;
            }
            default {
                note "    warning: unknown metric '$m', using 0";
                %result{$m} = 0;
            }
        }
    }

    %result;
}

sub collect-files(IO::Path $dir --> Array) {
    my @result;
    collect-files-recursive($dir, @result);
    @result;
}

sub collect-files-recursive(IO::Path $dir, @result) {
    for $dir.dir.sort -> $entry {
        my $name = $entry.basename;

        # skip dotfiles and dotfolders
        next if $name.starts-with('.');

        # skip _index* files
        next if $name.starts-with('_index');

        if $entry.d {
            collect-files-recursive($entry, @result);
        } elsif $entry.f {
            # skip excluded extensions
            my $ext = $entry.extension;
            next if $ext && ".{$ext}" ∈ @exclude-ext;

            @result.push: $entry;
        }
    }
}

sub append-db(IO::Path $db-file, @metrics, %values, Str $date-str) {
    my $header = ("date", |@metrics).join("\t");

    unless $db-file.e {
        $db-file.spurt: $header ~ "\n";
        note "    created _index.tdb";
    }

    my $row = ($date-str, |@metrics.map({ %values{$_} })).join("\t");
    $db-file.spurt: $row ~ "\n", :append;
    note "    appended to _index.tdb: $row";
}

sub update-delta-view(IO::Path $dir, @metrics) {
    my $db-file    = $dir.add('_index.tdb');
    my $index-file = $dir.add('_index');

    my @db-lines = $db-file.lines;
    return if @db-lines.elems < 2;  # header only

    my $header = @db-lines[0];

    # read existing _index to find last recorded date
    my $last-delta-date = '';
    if $index-file.e {
        my @idx-lines = $index-file.lines;
        if @idx-lines.elems > 1 {
            my @last-cols = @idx-lines[*-1].split("\t");
            $last-delta-date = @last-cols[0];
        }
    }

    # parse all db rows as arrays of strings
    my @rows;
    for @db-lines[1..*] -> $line {
        my $cols = $line.split("\t").Array;
        @rows.push: $cols;
    }

    # find which rows need delta calculation
    my $start-idx = 0;
    if $last-delta-date {
        for ^@rows.elems -> $i {
            if @rows[$i][0] eq $last-delta-date {
                $start-idx = $i + 1;
                last;
            }
        }
    }

    return if $start-idx >= @rows.elems;  # nothing new

    # if _index doesn't exist, write header and compute from beginning
    unless $index-file.e {
        $index-file.spurt: $header ~ "\n";
        $start-idx = 0;
    }

    for $start-idx ..^ @rows.elems -> $i {
        my $cur = @rows[$i];
        my @parts = $cur[0];  # date

        for 1 ..^ $cur.elems -> $c {
            my $cur-val  = $cur[$c].Int;
            my $prev-val = $i > 0 ?? @rows[$i - 1][$c].Int !! 0;
            @parts.push: ~($cur-val - $prev-val);
        }

        $index-file.spurt: @parts.join("\t") ~ "\n", :append;
    }

    note "    updated _index (delta view)";
}

# --- root dataview ---

sub update-root-dataview(@observed, Str $date-str) {
    my $root-index = ROOT.add('_index');

    note "  updating root _index";

    # read word deltas from each project's _index for the target date
    my %project-deltas;
    for @observed -> %obs {
        my $index-file = %obs<path>.add('_index');
        next unless $index-file.e;

        my @lines = $index-file.lines;
        next if @lines.elems < 2;

        # find word column index from header
        my @hdr = @lines[0].split("\t");
        my $word-idx = @hdr.first('word', :k);
        next unless $word-idx.defined;

        # find row matching target date
        for @lines[1..*] -> $line {
            my @cols = $line.split("\t");
            if @cols[0] eq $date-str {
                %project-deltas{%obs<name>} = @cols[$word-idx].Int;
                last;
            }
        }

        %project-deltas{%obs<name>} //= 0;
    }

    my $total = [+] %project-deltas.values;

    # read existing root _index to check for last date and project columns
    my @existing-lines;
    my @existing-projects;
    if $root-index.e {
        @existing-lines = $root-index.lines;
        if @existing-lines.elems > 0 {
            my @hdr = @existing-lines[0].split("\t");
            @existing-projects = @hdr[2..*];  # skip date, total

            # check idempotency
            if @existing-lines.elems > 1 {
                my @last = @existing-lines[*-1].split("\t");
                if @last[0] eq $date-str {
                    note "    skip: $date-str already in root _index";
                    return;
                }
            }
        }
    }

    # determine project column order: preserve existing, append new
    my @projects = @existing-projects;
    for %project-deltas.keys.sort -> $p {
        @projects.push($p) unless $p ∈ @projects;
    }

    # if project list changed or file doesn't exist, rewrite header
    my $header = ("date", "total", |@projects).join("\t");
    my $projects-changed = @projects.sort.join(',') ne @existing-projects.sort.join(',');

    if !$root-index.e || $projects-changed {
        if $projects-changed && @existing-lines.elems > 1 {
            # rewrite with new header, backfill new project columns with 0%
            my @new-content = $header;
            for @existing-lines[1..*] -> $line {
                my @cols = $line.split("\t");
                my %old-vals;
                for @existing-projects.kv -> $i, $p {
                    %old-vals{$p} = @cols[$i + 2] // '0%';
                }
                my @new-row = @cols[0], @cols[1];  # date, total
                for @projects -> $p {
                    @new-row.push: %old-vals{$p} // '0%';
                }
                @new-content.push: @new-row.join("\t");
            }
            $root-index.spurt: @new-content.join("\n") ~ "\n";
        } else {
            $root-index.spurt: $header ~ "\n";
        }
    }

    # build the new row
    my @row = $date-str, $total;
    for @projects -> $p {
        my $delta = %project-deltas{$p} // 0;
        if $total == 0 {
            @row.push: '0%';
        } else {
            my $pct = round($delta / $total * 100);
            @row.push: "{$pct}%";
        }
    }

    $root-index.spurt: @row.join("\t") ~ "\n", :append;
    note "    appended to root _index: { @row.join("\t") }";
}
