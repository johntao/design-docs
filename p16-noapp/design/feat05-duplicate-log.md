# design draft for feat#05: logs

## motivation

a minimal way to evaluate project progress without context switching.
counting file creation is an easy progress metric.
introduce a command that duplicates a block of content to a target project,
keeping the user in their current context (the main track).

## folder structure

```
data/
- 000-journal/
  - 0logs/          <- main track (subfolder per month)
    - 2603/
      - 05.md
- p01-apple/
  - 0logs/          <- project track (flat naming)
    - 260305.md
- p02-bee/
  - 0logs/
    - 260305.md
```

naming schemes are intentionally different:
- main track: `0logs/YYMM/DD.md` (e.g. `0logs/2603/05.md`)
- project track: `0logs/YYMMDD.md` (e.g. `0logs/260305.md`)

## command syntax

```
␅lp01types of apples
```

- `l` = command-id for "log"
- `p01` = project prefix (matches `p01-*` folder under data root)
- `types of apples` = heading text (rendered as h2 with AP-style title case)

**trigger:** onEnter (feat#04). the h2 heading and binding lines render
immediately when the user presses enter.

### examples

```
input:  ␅lp01types of apples
output: ## Types of Apples
        ;;{h2 GUID}
        ;;{alt file GUID}
        ;;/p01-apple/0logs/260305.md

(and the block heading is duplicated to /p01-apple/0logs/260305.md)
```

## block definition

a "block" is the content between two h2 boundaries:
- **starts** at the h2 heading line (inclusive)
- **ends** at the next h2 heading or EOF (exclusive of the next h2)
- a `␅l` command line is itself an h2 boundary (it renders into one)

## first-time execution (onEnter)

when a `␅l` command is processed on enter:

1. render the command into `## Title Case Heading`
2. generate a SHA-1 GUID for the h2 synced block
3. resolve the destination file path:
   - find the folder matching the project prefix (e.g. `p01` -> `p01-apple/`)
   - derive the date-based filename from today's date
   - create the file and parent directories if they don't exist
4. if the alt file does not have a file GUID yet:
   - generate a SHA-1 GUID for the alt file
   - insert a row into the file table: (GUID, alt_file_path)
5. insert binding lines below the h2 in the current file:
   - `;;{h2 GUID}`
   - `;;{alt file GUID}`
   - `;;{alt file path}` (relative from data root)
6. duplicate the h2 heading + binding lines to the alt file
   - the alt file gets the same `;;` lines but with the current file's
     GUID and path as the alternate
7. insert a synced block record in the metadata db:
   (GUID, content_hash, file1, startLn1, file2, startLn2)

## binding syntax

```
;;{h2 GUID}
;;{alt file GUID}
;;{alt file path}
```

- line 1: `;;` + SHA-1 GUID of this synced block
- line 2: `;;` + SHA-1 GUID of the paired file
- line 3: `;;` + relative path from data root to the paired file

GUIDs replace the old random 3-char hex hash format.

## bidirectional sync (onSave)

edits on either side (main or project) sync to the other on save.

### detecting dirty blocks

on `BufWritePre`, for each h2 block with `;;` binding lines:
- extract the synced block GUID from the first `;;` line
- query the metadata db for the stored `content_hash`
- compute the current block's content hash
- if hashes differ -> mark as dirty

### sync algorithm

```
for each dirty block:
  dest_path = parse path from ;; line 3
  open dest file (read from disk)
  find the h2 block in dest that has a ;; line with matching GUID
  replace that block's content with the dirty block's content
  write dest file to disk
  update content_hash in the synced block table
```

### sync edge cases

- dest file doesn't exist: warn the user, skip sync for that block
- matching GUID not found in dest: warn the user, skip sync
- dest file is the current buffer: not possible (main != project path)
- both sides edited simultaneously: last save wins (acceptable for single-user)
- block has no ;; lines: not a synced block, skip entirely
- ;; lines themselves are never synced (each side keeps its own pointers)

## error handling

on entering a newline, if `␅l` line has invalid syntax:
1. the newline still inserts (no blocking)
2. show an error message identifying the offending line
3. invalid cases: no project prefix, no text, prefix doesn't match any folder

## data structures

```lua
-- parsed h2 block
{
  heading    = "## Types of Apples",
  start_ln   = 10,       -- 1-indexed, line of the h2
  end_ln     = 25,       -- 1-indexed, last line of the block
  binding    = {          -- nil if no ;; lines
    block_guid = "5106bda3...",
    alt_file_guid = "9bfb3ae7...",
    alt_file_path = "/p01-apple/0logs/260305.md",
  },
  body_lines = { ... },  -- content lines (excluding h2 and ;; lines)
  is_dirty   = false,
}
```

## execution order

```
onEnter (feat#04):
  ␅l renders into h2 + inserts ;; binding lines + duplicates to dest

onSave (BufWritePre):
  sync pass: detect dirty bound blocks via metadata hash, push to paired files
```

first-time execution is on enter. ongoing sync is on save.

## file structure

```
lua/noapp/
  commands/
    heading.lua       # feat#02 heading command
    log.lua           # feat#05 log command (first-time duplication)
  on_enter.lua        # feat#04 onEnter dispatch
  exec.lua            # onSave dispatch (sync)
  sync.lua            # bidirectional sync logic
  block.lua           # h2 block parser (shared utility)
  db.lua              # feat#03 metadata db
  init.lua            # scope check
  hotstring.lua       # feat#01
```
