# design draft for feat#03: metadata db

## motivation

lookup operations across files are slow when done via text scanning.
a metadata db provides indexed access to frequently referenced objects,
improving speed for features like synced block diffing (feat#05) and GUID resolution.

## design principles

- stores all frequently referenced objects as table rows
- objects of the same physical meaning are stored in the same table
  - e.g. h2 heading duplicates sit in the same table
  - e.g. files sit in the same table
- the only purpose of the metadata db is to optimize lookup speed
  - deleting a metadata db should not break the app
  - the app should support rebuilding a metadata db on demand
- use sqlite db
- leave old data unchanged. only new data will use this feature

## table schemas

### file table (h1 heading)

columns:
- GUID (text, primary key)
- file_path (text)

text representation:
```
# Today's Headline
;;5106bda3ce7c91946a2a577b6c045653358d47ea
```

the file GUID is written below the h1 heading with a prefix `;;`

### synced block table (h2 heading)

columns:
- GUID (text, primary key)
- content_hash (text, for diff purpose)
- file1 (text, GUID of file where the block first appeared)
- startLn1 (integer, block starting line in file1)
- file2 (text, GUID of the paired file)
- startLn2 (integer, block starting line in file2)

text representation:
```
## Types of Apple
;;5106bda3ce7c91946a2a577b6c045653358d47ea
;;9bfb3ae79db461d00942dd458050db2d9e816044
;;/path/to/alternate-file.md
```

prefixed lines below h2:
1. `;;{h2 GUID}` — the GUID of this synced block
2. `;;{alt file GUID}` — the GUID of the alternate (paired) file
3. `;;{alt file path}` — the relative path to the alternate file

## GUID generation

- GUIDs are SHA-1 hex strings (40 characters)
- generated once at creation time, never changed afterward
- both file GUIDs and synced block GUIDs follow the same format

## db lifecycle

### creation
- the db is created automatically when the first GUID is generated
- stored at a fixed location relative to the data root

### rebuild
- scan all `.md` files under the data root
  - skip paths start with underscore '_'
- parse `;;` prefixed lines below h1 and h2 headings
- reconstruct all table rows from the parsed data
- this makes the db fully recoverable from the text files alone

## hooks

### file rename hook
- listen to file rename events
- when a file is renamed, check if it contains a file GUID
- if true, update the `file_path` column in the file table

### file deletion hook
- listen to file deletion events
- when a file is deleted, check if it contains a file GUID
- if true, remove the corresponding row from the file table
- optionally warn if synced block rows reference this file

## interaction with other features

- feat#05 (logs): synced block diffing replaces the old text-based diff
  with a hash comparison query against the synced block table
- rework01: h1 heading command (`␅1`) inserts a file GUID and creates
  a file table row
- rework02: log command (`␅l`) inserts synced block metadata and creates
  rows in both the file and synced block tables
