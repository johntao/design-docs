# structure

tree data model for the mandala chart.

## mc-record

```
{
  title: string          (required)
  description?: string   (optional)
  status: 'na' | 'now' | 'done'   (default: 'na')
  children?: (mc-record | null)[]  (optional, max 8 elements)
}
```

## tree levels

the tree has exactly 3 levels (0, 1, 2):

- **lvl0** (root): single record, center of the grid
  - has 0-8 lvl1 children
- **lvl1**: up to 8 records, one per outer grid cell
  - has 0-8 lvl2 children each
- **lvl2** (leaf): up to 8 records per lvl1 parent
  - no children in this version (lvl3 not supported)

## null semantics

- root is `null` when no data exists
- lvl1 slots: `null` means the slot is reserved but unoccupied
  - initialized as null when root is created
- lvl2 slots: `null` means the slot is reserved but unoccupied
  - initialized as null when parent lvl1 is created
- `undefined` / missing: the slot has not been initialized yet
  - lvl1 is undefined before root creation
  - lvl2 is undefined before its lvl1 parent creation

distinction matters for the create command:
- `null` cell: open creation popup directly
- `undefined` cell: teleport to nearest uninitialized parent first

## children array

ig stand as inner-grid or subgrid
always exactly 8 slots when initialized:
```
children[0] = ig[0,0]
children[1] = ig[0,1]
children[2] = ig[0,2]
children[3] = ig[1,0]
children[4] = ig[1,2]
children[5] = ig[2,0]
children[6] = ig[2,1]
children[7] = ig[2,2]
```

note: ig[1,1] (center) is the parent itself, so only 8 slots exist.

## constraints

- max 8 children per node
- max tree depth of 2 (root + lvl1 + lvl2)
- title is required and must not be blank/whitespace
- status defaults to `na` when omitted (backward compat)
