# feat#07 dashboard web charts

display dashboard dataviews (from feat#06) as charts in a static web page

## requirements

- standalone web page at `src/main/index.html`
- vanilla JS, light theme, minimal styles
- chart library: **Chart.js** via CDN (no npm)
- use `showDirectoryPicker` API to load data

## data loading

user picks the root folder (`~/Desktop/data/`) via `showDirectoryPicker`

files are read using hardcoded relative paths (no recursive traversal):

| slot  | path                      | chart type   |
| ----- | ------------------------- | ------------ |
| (0,0) | `_index`                  | root (mixed) |
| (0,1) | `002-relation/_index`     | project      |
| (0,2) | `p07-vimkeys-game/_index` | project      |
| (1,0) | `p13-mandala/_index`      | project      |
| (1,1) | `p14-ttapp/_index`        | project      |
| (1,2) | `p16-noapp/_index`        | project      |

all files are TSV; parse with `split("\t")`

skip the first data row in every file (it represents the initial absolute snapshot, not a true delta)

## layout

grid: 2 rows x 3 cols

each cell contains one `<canvas>` for Chart.js;
chart title = the project name (derived from the path, e.g. `p13-mandala`)
root chart title = `root`

## x-axis (shared)

- values from the `date` column (`YYMMDD`)
- display as-is (no reformatting)

## root chart (mixed: grouped bar + line)

example data:
```tsv
date	total	p01-foo	p02-bar
260301	3000	70%	30%
260302	1500	60%	40%
260303	0	0%	0%
260304	2000	60%	40%
```

datasets:
- each project column (`p01-foo`, `p02-bar`, ...) → **bar**, grouped; values are percentages (strip `%`, parse as int)
- `total` → **line**, drawn on top of bars

y-axes:
- left axis (bars): fixed range `0–100`, label `%`
- right axis (line): range `0–max(total)`, label `words`

## project chart (grouped bar)

example data:
```tsv
date	file	line	word
260301	9	300	2100
260302	2	120	900
260303	0	0	0
260304	3	180	1200
```

datasets:
- `file`, `line`, `word` → **bar**, grouped

y-axes:
- left axis: for `file`, range `0–max(file)`
- right axis: for `word`, range `0–max(word)`

## flow

1. page loads → show a single "Load data" button
2. user clicks → `showDirectoryPicker()` opens
3. for each hardcoded path, resolve via `dirHandle.getDirectoryHandle()` / `getFileHandle()`
4. read each `_index` file, parse TSV, skip first data row
5. render all 6 charts into the grid
6. if a file is missing, show placeholder text in that cell