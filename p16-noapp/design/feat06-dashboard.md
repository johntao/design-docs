# feat#06 dashboard

I would like to introduce a new feature to observe the health status of a folder over a period of time

three files will be introduced per folder
- _index.db
- _index
- _index.spec
- _index (root)

## _index.spec

define spec of observing metrics

examples
```
- file count
- line count
- word count
```

run a background service snapshoting these metrics in daily basis, then, store it into _index.db

### background service

prefer implementing as Raku script; running by cron or daemon
running in daily basis; prefer run in the sleeping time `01:00 - 05:00 GMT+8`
make all the calculation, then, store the data (snapshot) by the date of yesterday (i.e. `today - 1`)

#### calculation

scope to the folder `~/Desktop/data/`; find all `_index.spec` recursively
run calculation based on the spec and the containing folder, then, append it to the `_index.db` within the same folder
run dataview calculation, append the result to `_index`
run dataview (root) calculation, append the result to `_index` (the root one)

## _index.db

data are stored as Tab-separated values

examples
```tsv
date	file	line	word
260301	9	300	2100
260302	11	420	3000
260303	11	420	3000
260304	14	600	4200
```

## dataview (_index)

a fixed format dataview that is calculated based on the `_index.db` file

run daily delta on every columns except for the date column, append the result to file `_index`

examples
```tsv
date	file	line	word
260301	9	300	2100
260302	2	120	900
260303	0	0	0
260304	3	180	1200
```

## the root dataview

a fixed format dataview that shows the progression across different projects

examples
```tsv
date	total	proj1	proj2
260301	3000	70%	30%
260302	1500	60%	40%
260303	1000	0%	100%
260304	2000	60%	40%
```