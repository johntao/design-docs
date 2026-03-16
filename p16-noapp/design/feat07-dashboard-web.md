# feat#07 dashboard web charts

this feature extends the previously implemented dashboard to display dataviews as charts in a static web page

here are the requirements:
- implement in a standalone web page
- no need to use any framework, vanilla js is sufficient
- no need to use fancy styles, prefer light theme
- use the most popular library to draw charts
	- prefer mature one
	- prefer CDN script without `npm install`
- use `showDirectoryPicker` API to load dataviews into the web page
	- prefer using hardcoded paths for the dataviews (no need to traverse the folder recursively)
	- currently available paths:
		- /_index (the root)
		- /002-relation/_index
		- /p07-vimkeys-game/_index
		- /p13-mandala/_index
		- /p14-ttapp/_index
		- /p16-noapp/_index
	- place three charts per row (2rows x 3cols)
	- place the root dataview at (0,0)
- create the web page inside this folder `@src/main/`

## the root dataview

example data:
```tsv
date	total	p01-foo	p02-bar
260301	3000	70%	30%
260302	1500	60%	40%
260303	0	0%	0%
260304	2000	60%	40%
```

x-axis display date
y-axis display grouped column x line chart:
- display p01-foo, p02-bar... as grouped columns
- display total as line chart
- line chart and grouped columns use separated y-axis
  - the y-axis for grouped column is 0-100%
  - the y-axis for line is 0-MAX(total)

skip the first record (i.e. exclude record 260301 in this example)

## the project dataview

example data:
```tsv
date	file	line	word
260301	9	300	2100
260302	2	120	900
260303	0	0	0
260304	3	180	1200
```

x-axis display date
y-axis display grouped column chart:
- display file, line and word as grouped columns
- file, line and word use separated y-axis

skip the first record (i.e. exclude record 260301 in this example)