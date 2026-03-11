# design draft for feat#03: metadata db

design principle:
- stores all the frequently referenced objects as table rows
- objects of the same physical meaning are stored in the same table
  - e.g. h2 heading duplicates sit in the same table
  - e.g. files sit in the same table
- the only purpose of the metadata db is to optimize the lookup speed in this edition
  - thus, deleting a metadata db should not break the app
  - furthermore, the app should support rebuilding a metadata db on demand
- use sqlite db
- leave old data the same. only the new data will use this feature

## table schemas

### file (h1 heading)

Columns:
- GUID
- file path

Text Representation:
```
# Today's Headline
;;5106bda3ce7c91946a2a577b6c045653358d47ea
```

file GUID is written below the h1 heading with a prefix ';;'

### synced block (h2 heading)

Columns:
- GUID
- content hash (for diff purpose)
- file1 (GUID of main track file)
- startLn1 (block starting line of main track file)
- file2 (GUID of main track file)
- startLn2 (block starting line of main track file)

Text Representation:
```
## Types of Apple
;;5106bda3ce7c91946a2a577b6c045653358d47ea
;;9bfb3ae79db461d00942dd458050db2d9e816044
;;/path/to/alternate-file.md
```

prefixed lines:
1. h2 GUID is written below the h1 heading with a prefix ';;'
2. alternate file GUID
3. alternate file path

## additional functions

add a hook to listening to file rename
whenever users rename a file, check if the file contains a GUID
if true, update the file path entry in the metadata db accordingly

add a hook to listening to file deletion
whenever users delete a file, check if the file contains a GUID
if true, update the file path entry in the metadata db accordingly