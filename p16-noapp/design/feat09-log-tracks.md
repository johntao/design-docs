# feat09 log tracks rework

rework of log tracks (previously feat05, related: feat02, feat04)
also known as synced block or duplicate log

## overview

two tracks:
- **main track**: daily journal (`001-journal/0logs/YYMM/DD.md`)
- **project track**: project-specific log (`<project>/0logs/YYMMDD.md`)

main track blocks hold an abstract/summary; project track blocks hold actual content
blocks are linked by a `;;path` metadata line — navigate between them with `gf`

### what's removed (vs feat05)

- NO data sync between tracks
- NO database — no GUIDs, no content hashing, no synced_blocks table
- NO title sync
- NO reverse direction (project → main) sync

reasons:
1. log file names follow a fixed format — no rename tracking needed
2. no sync → no need for content hashes or diff
3. `gf` on `;;path` replaces line-number jumps

## file path conventions

main track (journal):
```
~/Desktop/data/001-journal/0logs/YYMM/DD.md
```

project track:
```
~/Desktop/data/<project>/0logs/YYMMDD.md
```

project prefix resolves to folder: `p16` → `p16-noapp`
date is derived from the current file's path, or today's date as fallback

## block format

main track block (h2, abstract):
```
## Types of Apple
;;p16-noapp/0logs/260320.md
food for thought
```

project track block (h1, actual content):
```
# Types of Apple
;;001-journal/0logs/2603/20.md
line 1
line 2
line 3
```

`;;path` is relative to data root (`~/Desktop/data/`)

## commands

all commands use feat08 command mode (`:]<args>`)

### 1. create project block (`:]l<prefix><title>`)

`<prefix>` = project prefix (e.g., `p16`)
`<title>` = block title text

example: `:]lp16types of apple`

steps:
1. resolve `<prefix>` to project folder (e.g., `p16` → `p16-noapp`)
2. derive date from current file's path (fallback: today)
3. derive project track path: `<project>/0logs/YYMMDD.md`
4. insert in current buffer at cursor:
   ```
   ## Types of Apple
   ;;p16-noapp/0logs/260320.md
   ```
5. if project track file does not exist, create it with h1 date heading (e.g., `# 260320`)
6. append to project track file:
   ```
   # Types of Apple
   ;;001-journal/0logs/2603/20.md
   ```
7. open project track file in vsplit
8. focus the vsplit window

title case: AP-style, same rules as feat08 heading command

errors:
- prefix doesn't match any folder: show error, no insertion
- current file is not a recognized log file: show error

### 2. update title (`:]u<title>`)

cursor must be on a block heading line (h1 or h2) with a `;;path` metadata line below it

example: `:]uvarieties of apple`

steps:
1. read the heading at cursor, read `;;path` on the line below
2. update the heading in current buffer to title-cased `<title>` (preserve heading level)
3. open the linked file (from `;;path`)
4. search for old title text in that file
5. update the matching heading (preserve its heading level too)
6. save the linked file

errors:
- cursor not on a heading line: show error
- line below heading is not a `;;path` metadata line: show error
- matching heading not found in linked file: show error

### 3. jump to main (`:]j`)

cursor must be on or inside a project track block that has a `;;path` metadata line

example: `:]j`

steps:
1. scan upward from cursor to find the nearest heading (h1 or h2)
2. read the `;;path` metadata line below it
3. open the main track file
4. search for the block title text in that file

errors:
- no heading found above cursor: show error
- no `;;path` metadata below heading: show error

### 4. move content to project (`:]m<prefix><title>`)

visual selection required

example: select lines, then `:]mp16types of apple`

steps:
1. resolve `<prefix>` to project folder
2. derive date, derive project track path
3. capture the selected lines, then remove them from current buffer
4. insert at the original selection position in current buffer:
   ```
   ## Types of Apple
   ;;p16-noapp/0logs/260320.md
   ```
5. if project track file does not exist, create it with h1 date heading
6. append to project track file:
   ```
   # Types of Apple
   ;;001-journal/0logs/2603/20.md
   <moved content>
   ```
7. open project track file in vsplit (do NOT focus the vsplit window)

errors:
- no visual selection: show error
- prefix doesn't match any folder: show error

## file structure

```
lua/noapp/command.lua              # dispatcher (feat08, register new commands)
lua/noapp/commands/heading.lua     # heading expansion (feat08)
lua/noapp/commands/log.lua         # reworked: create project block
lua/noapp/commands/log_update.lua  # update title command
lua/noapp/commands/log_jump.lua    # jump to main command
lua/noapp/commands/log_move.lua    # move content command
```

## migration

feat08 already removed feat01 (hotstring) and retired the ␅ dispatch flow

feat09 completes the cleanup:
- remove feat02 (exec on save) — no longer needed without sync
- remove feat03 (metadata db) — replaced by `;;path` links
- remove feat04 (onEnter) — ␅ dispatch fully replaced by command mode
- remove feat05 (sync) — no more data sync

retained:
- feat08 command mode (`:]`) — foundation for all new commands
- `commands/heading.lua` — unchanged, `title_case()` reused by log commands

## verdict

4 commands total: create (`:]l`), update title (`:]u`), jump (`:]j`), move (`:]m`)
the old implementation feat01, feat02, feat03, feat04 are safe to remove at this point
