# feat10 WMY review

this feature aims to enhance the existing main log track

a new cron job is registered

which runs a Raku script on a daily basis (at 01:00 GMT+8)

the script checks the day of the week, the ISO weeks calendar, and generate files accordingly
- two files are created, the first file is dataview that concat group of files into a single file
- the second file is a template file for users to comment retrospective summary

if the day of the week equals Monday, then, generate a weekly review file
- a file is created at `data/001-journal/0logs/2603/23-w13v.md`
  - 2603 stands as YYMM (year and month)
  - 23 stands as dd (date of the month)
  - w13 stands as the week of the year
  - v stands as dataview
  - concatenate log files of the previous week into this file
    - i.e. concate `(16..22).md` file content into `23-w13v.md`
    - use ISO weeks
- a file is created at `data/001-journal/0logs/2603/23-w13.md`
  - insert text `# w13: 03-16..03-22` in the start of the file

if the current week contains the 1st date of a month, then, generate a monthly review file
- example 1
  - a file is created at `data/001-journal/0logs/2602/23-m02v.md` on date 2026-02-23
  - 2602 stands as YYMM (year and month)
  - 23 stands as dd (date of the month)
  - m02 stands as the month
  - v stands as dataview
  - concatenate previous weekly log files into this file
    - the range starts from the week (exclusive) contains the 1st date of a month (previous iteration); ends by the week (inclusive) contains the 1st date of a month (current iteration)
    - 2602/02-w06 2602/09-w07 2602/16-w08 2602/23-w09
    - concate the above md files into `23-m02v.md`
  - a file is created at `data/001-journal/0logs/2602/23-m02.md`
  - insert text `# m02: 01-26..02-22` in the start of the file
- example 2
  - a file is created at `data/001-journal/0logs/2603/30-m03v.md` on date 2026-03-30
  - concatenate previous weekly log files into this file
    - 2603/02-w10 2603/09-w11 2603/16-w12 2603/23-w13 2603/30-w14
    - concate the above md files into `30-m03v.md`
  - a file is created at `data/001-journal/0logs/2603/30-m03.md`
  - insert text `# m03: 02-23..03-29` in the start of the file
- example 3
  - a file is created at `data/001-journal/0logs/2604/27-m04v.md` on date 2026-04-27
  - concatenate previous weekly log files into this file
    - 2604/06-w15 2604/13-w16 2604/20-w17 2604/27-w18
    - concate the above md files into `27-m04v.md`
  - a file is created at `data/001-journal/0logs/2604/27-m04.md`
  - insert text `# m04: 03-30..04-26` in the start of the file

if the current week contains the 1st date of a year, then, generate a yearly review file
- example 1
  - a file is created at `data/001-journal/0logs/2512/29-y25v.md` on date 2025-12-29
  - 2512 stands as YYMM (year and month)
  - 29 stands as dd (date of the month)
  - y25 stands as the year 2025
  - v stands as dataview
  - concatenate previous monthly log files into this file
    - regex pattern: `25([01]\d)/[0-3]\d-m\1.md`
    - match files: `2510/27-m10.md`, `2512/01-m11.md`, `2512/29-m12.md`...etc
      - note that the monthly report of November in 2025 is created in folder `2512/` instead of `2511/`
      - this happens when the 1st date of a month is also Monday (the first day of a week)
    - concate the above md files into `2512/29-y25v.md`
  - a file is created at `data/001-journal/0logs/2512/29-y25.md`
  - insert text `# y25: 241230..251228` in the start of the file
- example 2
  - a file is created at `data/001-journal/0logs/2612/28-y26v.md` on date 2026-12-28
  - 2612 stands as YYMM (year and month)
  - 28 stands as dd (date of the month)
  - y26 stands as the year 2026
  - v stands as dataview
  - concatenate previous monthly log files into this file
    - regex pattern: `26([01]\d)/[0-3]\d-m\1.md`
    - match files: `2602/23-m02.md`, `2603/30-m03.md`, `2604/27-m04.md`...etc
    - concate the above md files into `2612/28-y26v.md`
  - a file is created at `data/001-journal/0logs/2612/28-y26.md`
  - insert text `# y26: 251229..261227` in the start of the file
