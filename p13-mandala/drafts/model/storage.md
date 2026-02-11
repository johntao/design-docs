# storage

data persistence layer using localStorage.

## storage key

all app data is stored under a single localStorage key.
value is serialized JSON of the root mc-record tree.

## data format

the stored value is the full tree:
```json
{
  "title": "root title",
  "description": "...",
  "status": "na",
  "children": [
    { "title": "lvl1-a", "status": "now", "children": [...] },
    null,
    { "title": "lvl1-c", "status": "done", "children": [...] },
    ...
  ]
}
```

- root is `null` when no data exists (initial state)
- children array has exactly 8 slots for lvl1
- each lvl1 children array has exactly 8 slots for lvl2
- unoccupied slots are `null`

## save

called after every mutation:
- record creation
- inline edit
- detail edit (modal confirm)
- status cycle
- delete
- drag-and-drop reorder
- import

serialize the root tree to JSON and write to localStorage.

## load

called on app initialization:
- read from localStorage
- parse JSON
- if null or missing: app starts with no data (root = null)
- backward compat: records missing `status` field default to `na`

## plain-text file format

used by import/export (see migration.md for details).
format: `{indentation}{nodetype-token}{title}␟{metadata}␟{description}`
- `␟` = unit separator (`\x1f`)
- metadata = status encoded as `0|1|2`
- first line is always root context (file name = root title)
