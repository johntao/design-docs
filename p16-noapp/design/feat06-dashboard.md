# feat#06 dashboard

observe the health status of a folder over a period of time

## overview

four files are involved:

| file          | location                 | purpose                              |
| ------------- | ------------------------ | ------------------------------------ |
| `_index.spec` | each observed folder     | defines which metrics to track       |
| `_index.db`   | each observed folder     | raw cumulative snapshots (TSV)       |
| `_index`      | each observed folder     | daily delta view (TSV)               |
| `_index`      | root (`~/Desktop/data/`) | cross-project progression view (TSV) |

the root `_index` is a different dataview from the per-folder `_index`

## _index.spec

plain-text file, one metric name per line

supported metrics:

| metric | definition                           |
| ------ | ------------------------------------ |
| `file` | count of regular files in the folder |
| `line` | total line count across those files  |
| `word` | total word count across those files  |

example `_index.spec`:
```
file
line
word
```

### observer spec

iterate subfolders of the root

a subfolder is only observed if it contains an `_index.spec` file;
folders without one are skipped entirely

the observer scan recursively, excluding:
- `_index*`
- `.*` (dot files and folders)
- `.html` `.css` `.js` (web source code)
- `.ods` `.odt` `.pdf` (commonly seen document type)

## _index.db

raw cumulative snapshots stored as TSV

- header row is generated from `_index.spec`: `date` followed by metric names in spec order
- each subsequent row is one daily snapshot
- date format: `YYMMDD`
  - the date value equals to the timestamp when the background service triggered (trim time portion)
- values are absolute (cumulative) numbers
- rows are appended in chronological order; no row is ever overwritten

example:
```tsv
date	file	line	word
260301	9	300	2100
260302	11	420	3000
260303	11	420	3000
260304	14	600	4200
```

### first run

if `_index.db` does not exist, create it with the header row then append the first snapshot

### spec changes

if a metric is added to or removed from `_index.spec`, regenerate the header and
backfill existing rows with `0` for newly added columns (or drop removed columns)
— this is a rare manual operation, not handled automatically for now

## dataview (_index)

per-folder daily delta view, derived from `_index.db`

calculation: for each row, subtract the previous row's values (column-wise, skipping `date`)
the first row has no previous row, so its delta equals its absolute values

this file is NOT **regenerated in full** on each run (just append a row in daily basis)

example (derived from the `_index.db` example above):
```tsv
date	file	line	word
260301	9	300	2100
260302	2	120	900
260303	0	0	0
260304	3	180	1200
```

## root dataview

location: `~/Desktop/data/_index`

cross-project progression view showing how daily work is distributed

### column definitions

- `date` — `YYMMDD`
  - the date value equals to the timestamp when the background service triggered (trim time portion)
- `total` — sum of all per-folder `word` deltas for that date (i.e. total new words across all projects)
- one column per observed project — the project's share of `total` as a percentage

### project naming

column names are derived from the folder path relative to `~/Desktop/data/`
e.g.
- `~/Desktop/data/p01-foo/` → `p01-foo`
- `~/Desktop/data/p02-bar/` → `p02-bar`

### calculation

for each observed folder:
1. read each folder's `_index` (delta view) to get the `word` delta for that date
2. sum all deltas → `total`
3. each project's percentage = `project_word_delta / total * 100`, rounded to nearest integer
4. if `total` is 0 for a date, all percentages are `0%`

this file is NOT **regenerated in full** on each run (just append a row in daily basis)

example:
```tsv
date	total	p01-foo	p02-bar
260301	3000	70%	30%
260302	1500	60%	40%
260303	0	0%	0%
260304	2000	60%	40%
```

## background service

### implementation

Raku script located at `~/Desktop/data/p16-noapp/script/dashboard-snapshot.raku`

### scheduling

- run via cron, daily
- preferred window: `01:00 - 05:00 GMT+8`
- the snapshot date is **yesterday** (`today - 1`), so a run at 01:00 on Mar 15 records data for Mar 14

### execution steps

1. scan `~/Desktop/data/` recursively for all `_index.spec` files
2. for each spec found:
   a. read the spec to determine metrics
   b. calculate metrics for the containing folder
   c. append a row to `_index.db` (create if missing)
   d. create or update `_index` (delta view)
3. create or update root `_index` at `~/Desktop/data/_index`

### idempotency

if a row for the target date already exists in `_index.db`, skip that folder
this allows safe re-runs without duplicate entries

### error handling

- if a folder in the spec scan is unreadable, log a warning and skip
- write a run log to stdout/stderr (cron captures it)