# feat11 data track

introduces structural data tracks alongside the existing prose (logs) track

## context

KTV song records sit in `data/m02-artifact/ktv/`
each file groups songs by era/category (e.g. `1990`, `2000`, `en`)
each line is one record with semicolon-delimited fields:

    score1;score2;score3;year;title;singer;tags

files and directories prefixed with `_` are generated or internal — excluded from collection

## implementation

two Raku scripts, both located at `data/p16-noapp/script/`
both are idempotent (safe to re-run; output files are fully regenerated each time)

## script 1: concat all songs

script: `ktv-all.raku`
output: `data/m02-artifact/ktv/_all`

collect all direct children **files** under `data/m02-artifact/ktv/`
skip entries starting with `_`
sort files alphabetically

output format:

```
KTV songs {total_record_count}
{file1_name} {file1_line_count}
{file1_content}
{file2_name} {file2_line_count}
{file2_content}
...
```

- `total_record_count` = sum of all non-empty lines across all files
- `file_line_count` = non-empty line count per file
- `file_content` = raw content of the file (preserved as-is)
- files are separated by their header line (`name count`), no extra blank lines

example (truncated):

```
KTV songs 97
1970 9
2;2;2;1975;乎你啦;陳小雲;
2;1;2;1976;心事誰人知;沈文程;
...
1980 16
3;3;3;1985;大約在冬季;齊秦;^
2;1;1;1988;是否;蘇芮;
...
```

## script 2: list of singers

script: `ktv-singer.raku`
output: `data/m02-artifact/ktv/_singer`

collect the same source files as script 1
parse field index 5 (zero-indexed, semicolon-delimited) as the singer name

produce a **globally unique** singer list:
- process files in alphabetical order
- within each file, process lines top-to-bottom
- if a singer has already appeared in a previous file (or earlier in the same file),
  skip that line
- a "unique singer" for a file = singers appearing for the first time in that file

output format:

```
KTV singers {total_unique_singer_count}
{file1_name} {file1_unique_count}
{singer_a}
{singer_b}
{file2_name} {file2_unique_count}
{singer_c}
...
```

- `total_unique_singer_count` = number of distinct singers across all files
- each file section lists only the singers first encountered in that file
- singer names are listed one per line, in order of first appearance

example (truncated):

```
KTV singers 78
1970 9
陳小雲
沈文程
鄧麗君
鳳飛飛
蔡琴
青山
劉文正
余天
林慧萍
1980 14
齊秦
蘇芮
...
```

## scheduling

both scripts are intended for manual or on-demand execution (no cron)
they can be wired into a save hook or run ad-hoc after editing song files

## file structure

```
p16-noapp/script/ktv-all.raku       # concat all songs
p16-noapp/script/ktv-singer.raku    # unique singer list
m02-artifact/ktv/_all               # generated output
m02-artifact/ktv/_singer            # generated output
m02-artifact/ktv/1970               # source data
m02-artifact/ktv/1980               # source data
m02-artifact/ktv/1990               # source data
m02-artifact/ktv/2000               # source data
m02-artifact/ktv/2010               # source data
m02-artifact/ktv/en                 # source data
```
