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
  - 0logs/          ← main track (subfolder per month)
    - 2603/
      - 05.md
- p01-apple/
  - 0logs/          ← project track (flat naming)
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

executed on file save, same as feat#02. always renders as an h2 heading.

### examples

```
input:  ␅lp01types of apples
output: ## Types of Apples
        ;;/p01-apple/0logs/260305.md#741

(and the block is duplicated to /p01-apple/0logs/260305.md)
```

## block definition

a "block" is the content between two h2 boundaries:
- **starts** at the h2 heading line (inclusive)
- **ends** at the next h2 heading or EOF (exclusive of the next h2)
- a `␅l` command line is itself an h2 boundary (it renders into one)

## first-time execution (duplication)

when a `␅l` command is processed during save:

1. render the command into `## Title Case Heading`
2. determine the block content (from this h2 to the next h2 or EOF)
3. resolve the destination file path:
   - find the folder matching the project prefix (e.g. `p01` → `p01-apple/`)
   - derive the date-based filename from today's date
   - create the file and parent directories if they don't exist
4. append the block at the end of the destination file
5. insert binding lines below the h2 in both files:
   - main track gets: `;;/p01-apple/0logs/260305.md#<hash>`
   - project track gets: `;;/000-journal/0logs/2603/05.md#<hash>`
6. the `;;` line is always the first line after the h2 heading

## binding syntax

```
;;<relative-path>#<hash>
```

- `;;` = prefix marking a block attribute (not rendered as visible content)
- `<relative-path>` = path from data root to the paired file
- `#` = delimiter
- `<hash>` = random 3-char hex string, shared by both sides of the binding

the hash distinguishes multiple bindings in the same file.

## bidirectional sync

edits on either side (main or project) sync to the other on save.

### detecting dirty blocks

diff source: compare on-disk file (before save) vs buffer (about to be saved).

on `BufWritePre`:

```
1. read the on-disk version of the file
2. parse h2 blocks from both on-disk and buffer versions
3. for each block with a ;; binding:
   - compare block content (excluding the ;; line) between on-disk and buffer
   - if different → mark as dirty
```

### sync algorithm

```
for each dirty block with a ;; binding:
  dest_path = parse path from ;; line
  hash = parse hash from ;; line
  open dest file (read from disk)
  find the h2 block in dest that has a ;; line with matching hash
  replace that block's content with the dirty block's content
  write dest file to disk
```

### sync edge cases

- dest file doesn't exist: warn the user, skip sync for that block
- matching hash not found in dest: warn the user, skip sync
- dest file is the current buffer: not possible (main ≠ project path)
- both sides edited simultaneously: last save wins (acceptable for single-user)
- block has no ;; line: not a synced block, skip entirely
- ;; line itself is never synced (each side keeps its own pointer)

## error handling

follows feat#02 conventions:
- if `␅l` line has invalid syntax (no project prefix, no text): abort save, alert user
- if the project prefix doesn't match any folder: abort save, alert user

## data structures

```lua
-- parsed h2 block
{
  heading    = "## Types of Apples",
  start_ln   = 10,       -- 1-indexed, line of the h2
  end_ln     = 25,       -- 1-indexed, last line of the block
  binding    = {          -- nil if no ;; line
    path = "/p01-apple/0logs/260305.md",
    hash = "741",
    ln   = 11,           -- line number of the ;; line
  },
  body_lines = { ... },  -- content lines (excluding h2 and ;; lines)
  is_dirty   = false,
}
```

## execution order within feat#02 pipeline

```
on BufWritePre:
  1. run feat#02 command dispatch (process all ␅ lines, including ␅l)
     - ␅l renders into h2 + inserts ;; binding + duplicates block to dest
  2. run sync pass (detect dirty bound blocks, push changes to paired files)
  3. save proceeds
```

step 1 handles new commands. step 2 handles edits to existing bound blocks.
both run in the same BufWritePre callback, sequentially.

## file structure

```
lua/noapp/
  commands/
    heading.lua       # feat#02 heading command
    log.lua           # feat#03 log command (first-time duplication)
  exec.lua            # command dispatch (shared by feat#02 and feat#03)
  sync.lua            # bidirectional sync logic
  block.lua           # h2 block parser (shared utility)
  init.lua            # scope check
  hotstring.lua       # feat#01
```

## future considerations

- sync conflict detection could show a diff to the user instead of last-write-wins
- the `;;` attribute line could carry additional metadata (e.g. last-sync timestamp)
- batch sync: if multiple blocks point to the same dest file, batch the writes
