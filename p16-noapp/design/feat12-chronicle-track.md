# feat12 chronicle track

structured date-prefixed records, similar to data track (feat11)
every line starts with a `YYMMDD` date, fields separated by semicolons

records live in `data/007-chronicle/*.txt`
files/directories prefixed with `_` are generated — excluded from collection

## write command

nvim command to insert a chronicle record from the journal

syntax: `:]c{name}{date} {text}`

### name (optional, 3 alpha chars)

- exactly 3 lowercase letters, matched against filenames from the start
- `rhy` → matches `rhythm.txt`, `pod` → matches `podcast.txt`
- error if zero or multiple files match
- omit → defaults to `any.txt`

### date (optional, digits + trailing dashes)

- omit → current date (YYMMDD)
- `YYMMDD` (6 digits) → as-is
- `MMDD` (4 digits) → prepend current YY
- `DD` (2 digits) → prepend current YYMM
- `YY--` (2 digits + 2 dashes) → YY0000
- `YYMM-` (4 digits + 1 dash) → YYMM00

dashes are placeholders for `0` in approximate/partial dates

### behavior

1. resolve target file from name (or default to `any.txt`)
2. resolve date to 6-char YYMMDD
3. prepend `YYMMDD;text\n` to the target file (insert at line 1)

### examples

```
:]crhy260322 you are my radar detector
  → prepend "260322;you are my radar detector" to rhythm.txt

:]crhy22 something
  → date "22" → 260322 (current YYMM + 22)
  → prepend "260322;something" to rhythm.txt

:]c some note
  → no name (default any.txt), no date (default today)
  → prepend "260324;some note" to any.txt

:]cgod26-- found something
  → prepend "260000;found something" to god.txt
```

### implementation

new file: `lua/noapp/commands/chronicle.lua`
pattern: `^c(.+)$` — parse name, date, text in handler
register in `command.lua` dispatcher

## read (web viewer)

standalone HTML page to browse chronicle records

location: `p16-noapp/src/chronicle/index.html`

### features

- `<input type="file" webkitdirectory>` to pick the `007-chronicle/` folder
- reads all `.txt` files (skip `_`-prefixed)
- parses each line as semicolon-delimited fields
- displays records in a grid/table:
  - first column: source filename (without `.txt`)
  - remaining columns: parsed fields (date, text, ...)
  - files may have different column counts — pad shorter rows
- checkbox list to filter records by filename
- sort by date (first field) descending by default
- vanilla JS, minimal CSS, light theme

## move command

visual-mode command to move selected content to a chronicle file

syntax: `:'<,'>]m{prefix}/{name}`

example: `:'<,'>]m007/rhy`

### behavior

1. resolve `007` to folder `007-chronicle` (prefix match, same as project resolution)
2. resolve `rhy` to `rhythm.txt` (3-letter start match, same as write command)
3. error if zero or multiple matches at either step
4. prepend selected lines to the target file (insert at beginning)
5. replace the selection in the journal with:

```
## Insert Data Records
;;007-chronicle/rhythm.txt
```

6. open the target file in vsplit (reuse `open_in_vsplit`)

### implementation

new file: `lua/noapp/commands/chronicle_move.lua`
pattern: `^m(%w%w%w)/(%a%a%a)$` — does not conflict with log_move's `^m(%w%w%w)$`
register in `command.lua` dispatcher (before log_move for first-match ordering)

## file structure

```
~/.config/nvim/lua/noapp/commands/chronicle.lua       # :]c write command
~/.config/nvim/lua/noapp/commands/chronicle_move.lua   # :]m move command
p16-noapp/src/chronicle/index.html                     # web viewer
```
