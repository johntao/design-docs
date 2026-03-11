# rework02: change feat#05 to adapt feat#03 and feat#04

this file describes how we should rework the design draft of feat#05
to adapt the latest changes from feat#03 (metadata db) and feat#04 (onEnter).

changes will be applied to the feat#05 draft file in the next iteration.
this document only captures what needs to change.

## change 1: migrate trigger from onSave to onEnter

the log command (`␅l<prefix><text>`) currently executes on `BufWritePre` (onSave).

move it to onEnter so the h2 heading and binding lines render immediately
when the user presses enter.

before (onSave):
```
user types: ␅lp01types of apples
user saves file
output:     ## Types of Apples
            ;;/p01-apple/0logs/260305.md#741
```

after (onEnter):
```
user types: ␅lp01types of apples
user presses enter
output:     ## Types of Apples
            ;;{h2 GUID}
            ;;{alt file GUID}
            ;;/p01-apple/0logs/260305.md
            (cursor on new line below)
```

## change 2: replace binding lines with metadata-based format (feat#03)

the old binding format used `;;path#hash` with a random 3-char hex hash.
the new format uses GUIDs from the metadata db instead.

lines inserted below the rendered h2 heading:
1. `;;{h2 GUID}` — GUID of this synced block
2. `;;{alt file GUID}` — GUID of the alternate (paired) file
3. `;;{alt file path}` — relative path to the alternate file

### metadata db side effects on first execution

- generate a SHA-1 GUID for the h2 synced block
- if the alt file does not exist yet:
  - create the file and parent directories
  - generate a SHA-1 GUID for the alt file
  - insert a row into the file table: (GUID, alt_file_path)
- insert a row into the synced block table with all fields:
  (GUID, content_hash, file1, startLn1, file2, startLn2)
- duplicate the block content into the alt file with matching `;;` lines

alt file path examples (depends on current working context):
- `/p01-apple/0logs/260305.md` for project track
- `/000-journal/0logs/2603/05.md` for main track

## change 3: adjust onSave sync algorithm

keep the onSave sync function, but adapt the diff algorithm:
- old: text-based comparison of on-disk vs buffer block content
- new: query the synced block table for the stored `content_hash`,
  compare against the current block's hash
- if hashes differ, the block is dirty and triggers sync to the paired file
- after sync, update `content_hash` in the synced block table

this simplifies the sync logic and avoids re-parsing the on-disk file.

## summary of impacted sections in feat#05 draft

```
command syntax         — binding lines change from ;;path#hash to ;;GUID format
first-time execution   — add GUID generation and metadata db writes
binding syntax         — replace random hash with GUID-based identifiers
bidirectional sync     — replace text diff with metadata hash comparison
data structures        — update parsed block structure to include GUIDs
execution order        — first-time execution moves to onEnter, sync stays onSave
```
