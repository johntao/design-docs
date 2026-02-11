# synchronization

cell-to-record mapping and synced cell behavior.

## grid-to-tree mapping

the 9x9 grid maps to the tree structure with special placement logic.

### root (lvl0)

`og[1,1][1,1]` (= `cells[4,4]`) holds the root record.
this is the center cell of the entire grid.

### lvl1 nodes

each lvl1 node appears in two cells simultaneously:
- once in the center subgrid `og[1,1]` (surrounding the root)
- once in the center of its own outer grid cell

| children index | center subgrid    | synced outer cell  |
|----------------|-------------------|--------------------|
| 0              | `og[1,1][0,0]`    | `og[0,0][1,1]`     |
| 1              | `og[1,1][0,1]`    | `og[0,1][1,1]`     |
| 2              | `og[1,1][0,2]`    | `og[0,2][1,1]`     |
| 3              | `og[1,1][1,0]`    | `og[1,0][1,1]`     |
| 4              | `og[1,1][1,2]`    | `og[1,2][1,1]`     |
| 5              | `og[1,1][2,0]`    | `og[2,0][1,1]`     |
| 6              | `og[1,1][2,1]`    | `og[2,1][1,1]`     |
| 7              | `og[1,1][2,2]`    | `og[2,2][1,1]`     |

both cells reference the **same record object**, so edits in either location are reflected in both.

### lvl2 nodes

lvl2 nodes appear once each, placed around their lvl1 parent in the outer grid cell.
they follow the standard placement order (see structure.md children array).

example for lvl1 at `og[0,0]`:
- lvl2 children occupy: `og[0,0][0,0]`, `og[0,0][0,1]`, `og[0,0][0,2]`, `og[0,0][1,0]`, `og[0,0][1,2]`, `og[0,0][2,0]`, `og[0,0][2,1]`, `og[0,0][2,2]`
- `og[0,0][1,1]` is reserved for the lvl1 parent (synced copy)

## `_getCellTreeInfo(cellIndex)`

given a flat cell index (0-80), returns:
- `record`: the mc-record at that position (or null)
- `level`: 0, 1, or 2
- `parent`: the parent record (for lvl1/lvl2)
- `childIndex`: position in parent's children array

this function is the central lookup used by all CRUD and status commands.

## render flow

on `_renderTree()`:
1. iterate all 81 cells
2. for each cell, call `_getCellTreeInfo` to find its record
3. pass the record to the mc-cell component
4. synced cells (lvl1) automatically show the same data since they share the same object reference

## consistency guarantees

- no data duplication: synced cells point to the same object
- mutations go through the tree, not individual cells
- save and re-render after every mutation ensures visual consistency
