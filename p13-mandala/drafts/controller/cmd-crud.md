# cmd-crud

CRUD commands triggered by keyboard shortcuts on focused mc-cell elements.

## commands

| key   | command       | description                          |
|-------|---------------|--------------------------------------|
| `u`   | create        | create a new record                  |
| `i`   | inline edit   | edit title directly in the cell      |
| `o`   | detail edit   | open update modal for full editing   |
| `Del` | delete        | delete the record and its children   |

## create (`u`)

### on empty cell (null value)

open the creation modal popup.
on confirm, insert a new record at the cell position.

### on empty cell (undefined / uninitialized)

run tree structure checks, then teleport focus:
- if root is null: teleport to `og[1,1][1,1]`, open creation popup for root
  - on creating root, initialize all lvl1 children as null
- if lvl1 parent is null: teleport to parent center cell, open creation popup for lvl1
  - on creating lvl1, initialize all its lvl2 children as null
- if lvl2 is null: open creation popup normally

### on occupied cell

check availability for a child node.
- if parent already has 8 children: notify user via toast
- if available: open creation modal; insert child at next open slot

### default status for new records

- if parent status is `na`: new record defaults to `na`
- if parent status is `now` or `done`: new record defaults to `now`

## inline edit (`i`)

### on occupied cell

make the title field editable in-place.
- `Enter`: apply changes, save, re-render
- `Esc`: discard changes, restore original title

### on empty cell

alias to create (`u`): open creation popup.

## detail edit (`o`)

### on occupied cell

open the update modal with current record data.
modal shows: title, description, status dropdown, draggable child list.
- child list allows drag-and-drop reorder
- null children display as `[blank node]` in the drag list
- hide child list for lvl2 nodes (no lvl3 support)
- restore focus to the cell after closing modal

### on empty cell

alias to create (`u`): open creation popup.

## delete (`Del`)

### on empty cell

no-op.

### on occupied cell

delete behavior depends on level:
- delete root: set root to null, wipe all its lvl1 children
- delete lvl1: set lvl1 to null, wipe all its lvl2 children
- delete lvl2: set lvl2 to null

notify via toast with undo button.
on undo: restore the deleted record and its children, save, re-render.
