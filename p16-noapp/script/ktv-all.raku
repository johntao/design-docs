#!/usr/bin/env raku

# feat#11 data track — concat all songs
# see design/feat11-data-track.md for full spec

use v6.d;

constant \KTV = $*HOME.add('Desktop/data/m02-artifact/ktv');

sub MAIN() {
    my @files = KTV.dir
        .grep({ .f && !.basename.starts-with('_') })
        .sort(*.basename);

    my @sections;
    my $total = 0;

    for @files -> $file {
        my @lines = $file.lines.grep(*.trim.chars > 0);
        $total += @lines.elems;
        @sections.push: "{$file.basename} {@lines.elems}\n{@lines.join("\n")}\n";
    }

    my $out = KTV.add('_all');
    $out.spurt: "KTV songs $total\n{@sections.join("\n")}";
    note "ktv-all: wrote {$out} ($total records from {@files.elems} files)";
}
