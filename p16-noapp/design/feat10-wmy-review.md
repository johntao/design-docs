# feat10 WMY review

weekly, monthly, and yearly review file generation for the main journal log track

## overview

a daily cron job (01:00 GMT+8) runs a Raku script
on Mondays, it generates review files based on ISO 8601 week calendar (Monday = first day)
all files live under `001-journal/0logs/`

each review level produces two files:
- **dataview** (`*v.md`): static concatenation of source files (read-only reference)
- **review** (`*.md`): template for user-written retrospective (never overwritten if exists)

## schedule

cron: daily at 01:00 GMT+8
trigger: Monday only (script exits on other days)

on every Monday:
1. always generate weekly review
2. if the ISO week (Mon–Sun) contains the 1st of a new month → also generate monthly review
3. if the ISO week (Mon–Sun) contains Jan 1 → also generate yearly review

## path conventions

all paths relative to `data/001-journal/0logs/`

| type    | dataview          | review           |
| ------- | ----------------- | ---------------- |
| weekly  | `YYMM/DD-wWWv.md` | `YYMM/DD-wWW.md` |
| monthly | `YYMM/DD-mMMv.md` | `YYMM/DD-mMM.md` |
| yearly  | `YYMM/DD-yYYv.md` | `YYMM/DD-yYY.md` |

- `YYMM` = year+month of the trigger Monday
- `DD` = day-of-month of the trigger Monday
- `WW` = ISO week number (zero-padded)
- `MM` = month of the trigger Monday (zero-padded)
- `YY` = year being reviewed

## weekly review

trigger: every Monday
source: previous week's daily log files (Mon–Sun, 7 files)

dataview — concatenate into `DD-wWWv.md`:

    source files: (DD-7).md .. (DD-1).md  (may span two YYMM folders)

review — create `DD-wWW.md` with heading:

    # wWW: MM-DD..MM-DD

range = previous Monday .. previous Sunday

example: Monday 2026-03-23 (w13)
- dataview source: `2603/16.md` .. `2603/22.md`
- dataview output: `2603/23-w13v.md`
- review heading: `# w13: 03-16..03-22`
- review output: `2603/23-w13.md`

## monthly review

trigger: Monday of the ISO week that contains the 1st of a new month
the review is named `mMM` where MM is the trigger Monday's month

source: weekly **review** files between two consecutive monthly boundaries

### range logic

- previous boundary: the Monday that triggered the last monthly review
- current boundary: today (the Monday triggering this review)
- collect: all `DD-wWW.md` where Monday ∈ (previous boundary, current boundary)

the heading date range is derived from the collected weekly reviews:
first day covered by the first weekly review .. last day covered by the last weekly review

dataview — concatenate collected weekly review files into `DD-mMMv.md`
review — create `DD-mMM.md` with heading: `# mMM: MM-DD..MM-DD`

### examples

example 1: Monday 2026-02-23 → week Feb 23–Mar 1 contains Mar 1 → m02
- collected: `2602/02-w06.md` `2602/09-w07.md` `2602/16-w08.md` `2602/23-w09.md`
- dataview: `2602/23-m02v.md`
- heading: `# m02: 01-26..02-22`
- review: `2602/23-m02.md`

example 2: Monday 2026-03-30 → week Mar 30–Apr 5 contains Apr 1 → m03
- collected: `2603/02-w10.md` `2603/09-w11.md` `2603/16-w12.md` `2603/23-w13.md` `2603/30-w14.md`
- dataview: `2603/30-m03v.md`
- heading: `# m03: 02-23..03-29`
- review: `2603/30-m03.md`

example 3: Monday 2026-04-27 → week Apr 27–May 3 contains May 1 → m04
- collected: `2604/06-w15.md` `2604/13-w16.md` `2604/20-w17.md` `2604/27-w18.md`
- dataview: `2604/27-m04v.md`
- heading: `# m04: 03-30..04-26`
- review: `2604/27-m04.md`

## yearly review

trigger: Monday of the ISO week that contains Jan 1
the review is named `yYY` where YY is the year being reviewed

source: monthly **review** files for the reviewed year

### collection

find all files matching `YY[01]\d/[0-3]\d-m[01]\d.md` under `0logs/`

note: a monthly review may reside in a different month's folder when the
1st of a month falls on Monday (e.g. `2512/01-m11.md` — November review
created Dec 1 because the week of Dec 1 contains Dec 1 as the new month)

sort collected files chronologically before concatenation

the heading date range uses YYMMDD format (cross-year span):
first day covered by first monthly review .. last day covered by last monthly review

dataview — concatenate into `DD-yYYv.md`
review — create `DD-yYY.md` with heading: `# yYY: YYMMDD..YYMMDD`

### examples

example 1: Monday 2025-12-29 → week Dec 29–Jan 4 contains Jan 1 → y25
- pattern: `25[01]\d/[0-3]\d-m[01]\d.md`
- dataview: `2512/29-y25v.md`
- heading: `# y25: 241230..251228`
- review: `2512/29-y25.md`

example 2: Monday 2026-12-28 → week Dec 28–Jan 3 contains Jan 1 → y26
- pattern: `26[01]\d/[0-3]\d-m[01]\d.md`
- dataview: `2612/28-y26v.md`
- heading: `# y26: 251229..261227`
- review: `2612/28-y26.md`

## algorithm

```
today = current date
exit unless today.day-of-week == Monday

yy, mm, dd = today formatted
ww = ISO week number

# 1. weekly review (always)
prev_week = (today-7 .. today-1)
daily_files = prev_week.map -> YYMM/DD.md
write dataview: YYMM/DD-wWWv.md ← concat(daily_files)
write review:   YYMM/DD-wWW.md  ← "# wWW: {prev_week.first}..{prev_week.last}"

# 2. monthly review (if week contains 1st of a new month)
if (today .. today+6).any: .day == 1
    find previous monthly boundary (last Monday that triggered monthly)
    collect wWW.md files in (prev_boundary .. today)
    derive heading range from collected reviews' coverage
    write dataview: YYMM/DD-mMMv.md ← concat(weekly_reviews)
    write review:   YYMM/DD-mMM.md  ← "# mMM: {range}"

# 3. yearly review (if week contains Jan 1)
if (today .. today+6).any: .month == 1 and .day == 1
    reviewed_year = if today.month == 12 then today.year else today.year - 1
    collect mMM.md files matching YY pattern
    derive heading range from collected reviews' coverage
    write dataview: YYMM/DD-yYYv.md ← concat(monthly_reviews)
    write review:   YYMM/DD-yYY.md  ← "# yYY: {range}"
```

## file structure

```
scripts/wmy-review.raku    # generation script
001-journal/0logs/YYMM/    # all output files
```

## notes

- all week boundaries follow ISO 8601 (Monday–Sunday)
- dataview files are always regenerated; review files are created only if absent
- source files are concatenated in chronological order
- when daily files span two YYMM folders (e.g. month boundary), collect from both
- the "previous monthly boundary" for the very first run must be seeded or derived
  from the earliest available weekly review file
