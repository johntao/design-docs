# task-mgmt

task status tracking with progress rollup.

## status field

each mc-record has a `status` field: `na` | `now` | `done`
- default: `na`
- `na` records are backward compatible; new features do not apply
- `now` and `done` records are "tasks" which enable progress tracking
  - tasks = `children.filter(c => c.status !== 'na')`

## status display

unicode labels:
- `na`: nothing shown
- `now`: 🔧
- `done`: ✅

## progress rollup

progress is computed on render, never stored.

### calculation: `calcProgress(record)`

```
tasks = children.filter(c => c.status !== 'na')
if no tasks:
  return record.status === 'done' ? 100 : 0
else:
  return round(tasks.filter(done).length / tasks.length * 100)
```

### by level

- lvl2 (leaf): binary progress. `done` = 100%, else 0%
- lvl1: progress = done tasks / total tasks
- lvl0 (root): progress = done lvl1 tasks / total lvl1 tasks
- parent with zero tasks: binary progress like a leaf

### edge cases

- parent `na`: all new features disabled, no progress shown
- parent `now` with 0 tasks: binary (0% or 100%)
- parent `done` manually but has tasks: progress still from task ratio
  - status label and rollup are independent
- synced cells (lvl1 in center grid and outer grid center): same record object, same display

## cell layout

```
[title]
[status-icon] [progress%]    (replaces the old [N children] line)
[description]
```

visibility rules:
- `na` with no sub-tasks: hide status/progress line
- `now` with no sub-tasks: show `🔧 0%`
- `done` with no sub-tasks: show `✅ 100%`

## keyboard interaction

`y` on a focused cell with a record: cycle `na` -> `now` -> `done` -> `na`
`y` on empty cell: no-op

after cycling: save to storage and re-render.

## modal integration

the update modal (`o`) includes a `<select>` dropdown for status:
- options: `na`, `now`, `done`
- pre-populated with current value in update mode
- defaults to `na` in create mode

## persistence

- status stored as part of mc-record in localStorage
- import/export: status maps to the metadata field in the text format
  - `na` = `0`, `now` = `1`, `done` = `2`
  - empty or unrecognized metadata defaults to `na`

## helper functions (utility.js)

```js
const STATUSES = ['na', 'now', 'done'];

function calcProgress(record) { ... }
function nextStatus(current) { ... }
```
