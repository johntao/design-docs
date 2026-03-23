#!/usr/bin/env raku

# feat#10 WMY review
# see design/feat10-wmy-review.md for full spec

use v6.d;

constant \ROOT = $*HOME.add('Desktop/data');
constant \LOGS = ROOT.add('001-journal/0logs');

sub MAIN(Str :$date) {
    my $today = $date ?? Date.new($date) !! Date.today;

    unless $today.day-of-week == 1 {
        note "wmy-review: not Monday ({$today}), skipping";
        exit;
    }

    note "wmy-review: run for {$today}";

    generate-weekly($today);

    if week-contains($today, -> $d { $d.day == 1 }) {
        generate-monthly($today);
    }

    if week-contains($today, -> $d { $d.month == 1 && $d.day == 1 }) {
        generate-yearly($today);
    }

    note "wmy-review: done";
}

# --- date helpers ---

sub yymm(Date $d --> Str)   { sprintf '%02d%02d', $d.year % 100, $d.month }
sub dd(Date $d --> Str)     { sprintf '%02d', $d.day }
sub mmdd(Date $d --> Str)   { sprintf '%02d-%02d', $d.month, $d.day }
sub yymmdd(Date $d --> Str) { sprintf '%02d%02d%02d', $d.year % 100, $d.month, $d.day }
sub ww(Date $d --> Str)     { sprintf 'w%02d', $d.week-number }

sub week-contains(Date $monday, &check --> Bool) {
    so (0..6).first(-> $i { check($monday + $i) }).defined
}

sub monday-of(Date $d --> Date) {
    $d - ($d.day-of-week - 1)
}

sub find-prev-monthly-boundary(Date $today --> Date) {
    my $m = $today - 7;
    while $today - $m < 366 {
        return $m if week-contains($m, -> $d { $d.day == 1 });
        $m -= 7;
    }
    die "wmy-review: cannot find previous monthly boundary";
}

# --- file helpers ---

sub log-path(*@parts --> IO::Path) {
    LOGS.add(@parts.join('/'))
}

sub concat-files(@paths --> Str) {
    my @parts;
    for @paths -> $p {
        if $p.e {
            @parts.push: $p.slurp.chomp;
        } else {
            note "  skip (not found): $p";
        }
    }
    @parts.join("\n\n") ~ "\n"
}

sub write-dataview(IO::Path $path, Str $content) {
    $path.parent.mkdir;
    $path.spurt: $content;
    note "  dataview: $path";
}

sub write-review(IO::Path $path, Str $heading) {
    $path.parent.mkdir;
    if $path.e {
        note "  review (exists, skip): $path";
        return;
    }
    $path.spurt: "$heading\n";
    note "  review: $path";
}

# --- weekly ---

sub generate-weekly(Date $today) {
    my $prev-mon = $today - 7;
    my $tag = ww($today);

    my @daily = (0..6).map(-> $i {
        my $d = $prev-mon + $i;
        log-path(yymm($d), dd($d) ~ '.md')
    });

    write-dataview(
        log-path(yymm($today), dd($today) ~ "-{$tag}v.md"),
        concat-files(@daily),
    );
    write-review(
        log-path(yymm($today), dd($today) ~ "-{$tag}.md"),
        "# {$tag}: {mmdd($prev-mon)}..{mmdd($today - 1)}",
    );
}

# --- monthly ---

sub generate-monthly(Date $today) {
    my $prev = find-prev-monthly-boundary($today);
    my $mm = sprintf 'm%02d', $today.month;

    my @weekly;
    my $m = $prev + 7;
    while $m <= $today {
        @weekly.push: log-path(yymm($m), dd($m) ~ "-{ww($m)}.md");
        $m += 7;
    }

    write-dataview(
        log-path(yymm($today), dd($today) ~ "-{$mm}v.md"),
        concat-files(@weekly),
    );
    write-review(
        log-path(yymm($today), dd($today) ~ "-{$mm}.md"),
        "# {$mm}: {mmdd($prev)}..{mmdd($today - 1)}",
    );
}

# --- yearly ---

sub generate-yearly(Date $today) {
    my $year = $today.month == 12 ?? $today.year !! $today.year - 1;
    my $yy = sprintf '%02d', $year % 100;
    my $tag = "y$yy";

    my @monthly;
    for LOGS.dir.sort -> $folder {
        next unless $folder.d && $folder.basename ~~ /^ $yy <[01]>\d $/;
        for $folder.dir.sort -> $file {
            next unless $file.f;
            next unless $file.basename ~~ /^ <[0..3]>\d '-m' <[01]>\d '.md' $/;
            @monthly.push: $file;
        }
    }

    my $range-start = monday-of(Date.new($year, 1, 1));

    write-dataview(
        log-path(yymm($today), dd($today) ~ "-{$tag}v.md"),
        concat-files(@monthly),
    );
    write-review(
        log-path(yymm($today), dd($today) ~ "-{$tag}.md"),
        "# {$tag}: {yymmdd($range-start)}..{yymmdd($today - 1)}",
    );
}
