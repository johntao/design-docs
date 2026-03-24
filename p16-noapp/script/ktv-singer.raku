#!/usr/bin/env raku

# feat#11 data track — unique singer list
# see design/feat11-data-track.md for full spec

use v6.d;

constant \KTV = $*HOME.add('Desktop/data/m02-artifact/ktv');

sub MAIN() {
    my @files = KTV.dir
        .grep({ .f && !.basename.starts-with('_') })
        .sort(*.basename);

    my SetHash $seen;
    my @sections;
    my $total = 0;

    for @files -> $file {
        my @unique;
        for $file.lines.grep(*.trim.chars > 0) -> $line {
            my @fields = $line.split(';');
            my $singer = @fields[5] // next;
            next if $singer.trim.chars == 0;
            next if $seen{$singer};
            $seen{$singer} = True;
            @unique.push: $singer;
        }
        $total += @unique.elems;
        @sections.push: "{$file.basename} {@unique.elems}\n{@unique.join("\n")}\n";
    }

    my $out = KTV.add('_singer');
    $out.spurt: "KTV singers $total\n{@sections.join("\n")}";
    note "ktv-singer: wrote {$out} ($total unique singers from {@files.elems} files)";
}
