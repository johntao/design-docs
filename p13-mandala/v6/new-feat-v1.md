# new feature: status tracking with progress rollup

## overview

each mc-record gains a `status` field: `na` | `now` | `done`
- default status for new records: `na`
- users cycle status via a keyboard shortcut on a focused cell
- items marked with `na` are backward compatible, doesn't affected by the new features
- items marked with `now` or `done` are "tasks" which enables the new feature
  - i.e. tasks == `children.filter(c => c.status !== 'na')`

## progress rollup

- lvl2 records (leaf nodes): progress is binary — `done` = 100%, else 0%
- lvl1 records: progress = count of `done` tasks / total tasks
- lvl0 root: progress = count of `done` lvl1 tasks / total lvl1 tasks
- a parent with zero tasks has its own binary progress (like a leaf)

## display

- mc-cell shows the progress as a whole number percentage (e.g. `75%`)
- mc-cell shows the current status label (e.g. `now` as 🔧; `done` as ✅)
- status is visible alongside the existing title and description

## interaction

- keyboard shortcut to cycle status: press `y` on a focused cell
  - cycles: `na` → `now` → `done` → `na`
- the mc-modal (detail edit `o`) also exposes a status dropdown

## persistence

- status is stored as part of the mc-record in localStorage
- import/export: status maps to the metadata field in the text format

## iteration 2: detailed design

### data model change

mc-record grows one field:
```
{ title, description?, children?, status: 'na' | 'now' | 'done' }
```
- `status` defaults to `'na'` when omitted (backward compat with existing data)
- the rollup percentage is **computed on render**, not stored

### rollup calculation (function `calcProgress(record)`)

```
if record has no tasks → return record.status === 'done' ? 100 : 0
else → return Math.round(tasks.filter(c => c.status === 'done').length / tasks.length * 100)
```

edge cases:
- parent marks by `na`, disable all the new features
- parent marks by `now` with 0 tasks: behaves as leaf (binary 0 or 100)
- parent marks by `now` with some tasks but parent itself marked `done` manually:
  the displayed percentage still comes from tasks, but the status label shows `done`
  (status and rollup are independent — status is user-set, rollup is auto-calculated)
- synced cells (lvl1 shown in both center-grid and outer-grid center):
  both copies show the same status and rollup since they reference the same record object

### mc-cell layout change

current cell content (top to bottom):
```
[title]
[description]
[N children]
```

new cell content:
```
[title]
[status] [progress%]
[description]
```

- status is rendered as an unicode char: `na` (nothing), `now` (🔧), `done` (✅)
- progress is rendered as `75%` in the same line, right-aligned
- `[N children]` line is replaced by the status/progress line
- if no sub-tasks and status is `na`, hide the progress line
- if no sub-tasks and status is `now`, the progress line shows `now 0%`
- if status is `done` and no sub-tasks, shows `done 100%`

### keyboard shortcut `y`

- registered in mc-app's keydown handler alongside `u`, `i`, `o`, `Del`
- pressing `y` on a cell with a record cycles: `na` → `now` → `done` → `na`
- pressing `y` on an empty cell: no-op
- after cycling, triggers save + re-render (same as inline edit)

### mc-modal changes

- add a `<select>` dropdown for status below the description field
  - options: `na`, `now`, `done`
  - pre-populated with current status in update mode
  - defaults to `na` in create mode
- the confirmed detail includes `status` in the event payload

### mc-help-bar / mc-help-modal update

- add `y` shortcut to both: `<kbd>t</kbd> cycle status`

### import/export mapping

the existing text format has: `{title}\x1f{metadata}\x1f{description}`
- metadata field now carries the status value: `na`, `now`, or `done` (represent as 0|1|2 separatedly)
- on import: if metadata is empty or unrecognized, default to `na`
- on export: write the status string into the metadata position

## iteration 3: file-by-file implementation plan

### files to modify

#### 1. `v6/components/utility.js` — add `calcProgress` helper

```js
const STATUSES = ['na', 'now', 'done'];

function calcProgress(record) {
  const children = record.children || [];
  const active = children.filter(c => (c.status || 'na') !== 'na');
  if (active.length === 0) {
    return (record.status || 'na') === 'done' ? 100 : 0;
  }
  const doneCount = active.filter(c => (c.status || 'na') === 'done').length;
  return Math.round(doneCount / active.length * 100);
}

function nextStatus(current) {
  const i = STATUSES.indexOf(current || 'na');
  return STATUSES[(i + 1) % STATUSES.length];
}
```

export `STATUSES`, `calcProgress`, `nextStatus`

#### 2. `v6/components/mc-cell.js` — display status + progress

**shadow DOM template changes:**
- replace `.mr-children` div with `.mr-status` div
- add style: `.mr-status { font-size: 10px; padding: 1px 4px; display: flex; justify-content: space-between; }`
- add status color styles: `.status-na { color: #999; }`, `.status-now { color: #e67e00; }`, `.status-done { color: #2e7d32; }`

**`_render()` changes** (line 89-101):
- replace the `this._mrChildren.textContent = ...` block with:
  ```js
  const status = this._record.status || 'na';
  const progress = calcProgress(this._record);
  this._mrStatus.innerHTML =
    `<span class="status-${status}">${status}</span><span>${progress}%</span>`;
  ```

**imports:** add `import { calcProgress } from './utility.js';`

#### 3. `v6/components/mc-app.js` — add `y` keydown handler

**`_onKeydown` switch block** (line 183-200):
- add case after `'Delete'`:
  ```js
  case 'y':
    e.preventDefault();
    this._handleCycleStatus(focused);
    break;
  ```

**new method `_handleCycleStatus(cell)`:**
```js
_handleCycleStatus(cell) {
  const info = this._getCellTreeInfo(cell.cellIndex);
  if (!info.record) return;
  info.record.status = nextStatus(info.record.status);
  this._saveToStorage();
  this._renderTree();
}
```

**imports:** add `nextStatus` from `./utility.js`

**`_handleCreate` adjustments:**
- when creating new records, include `status: 'na'` in the record object

**`_handleDetailEdit` adjustments:**
- pass `status: info.record.status || 'na'` to modal open data
- on confirm, set `info.record.status = detail.status;`

**import/export adjustments:**
- `_exportData` line 379: change `''` (empty metadata) to `child.status || 'na'`
- `_importData`: read `parts[1]` as status, default to `'na'` if empty/unrecognized

#### 4. `v6/components/mc-modal.js` — add status dropdown

**shadow DOM template changes:**
- add a new `.field` div between description and child-section:
  ```html
  <div class="field field-status" hidden>
    <label>Status</label>
    <select class="input-status">
      <option value="na">na</option>
      <option value="now">now</option>
      <option value="done">done</option>
    </select>
  </div>
  ```
- add style: `select { width: 100%; padding: 8px; ... }` (match input style)

**`open()` method:**
- show status field in both create and update mode: `this._statusField.hidden = false;`
- set value: `this._inputStatus.value = data.status || 'na';`

**`_confirm()` method:**
- include `status: this._inputStatus.value` in the detail payload

#### 5. `v6/components/mc-help-bar.js` — add `y` to bar

line 14: add `<kbd>y</kbd> status |` after the delete entry

#### 6. `v6/components/mc-help-modal.js` — add `y` to editing section

add after the `Del` shortcut item (line 30):
```html
<div class="shortcut-item"><div class="keys"><kbd>y</kbd></div><div class="desc">Cycle status: na → now → done</div></div>
```

### verification

1. open the app, create root + children
2. press `y` on cells to cycle through `na → now → done → na`
3. verify progress% updates: parent shows `done / (now + done)` as integer
4. press `o` to detail edit, verify status dropdown present and pre-filled
5. import `demo1.txt`, verify all records default to `na` status
6. export, verify metadata field contains status values
7. refresh page, verify status persisted in localStorage

## revision 1

### quality of life 1

on creating new items, check the status of the parent node first
if the status equals to 'na', then the status of the new item defaults to 'na'
else, defaults to 'now'

### quality of life 2

problem:
user hit 'u' for creating new items
when users focused on a cell without a properly existing parent node or root node, the action fail silently

solution:
teleport user to the nearest empty parent node, then trigger the 'u' function again

case 1:
- focus on a lvl2 node (e.g. `og[0,1][2,2]`)
  - the lvl2 node doesn't have a lvl1 parent node
  - the root is already set
expected: teleport to the position `og[0,1][1,1]`

case 2:
- focus on a lvl2 node (e.g. `og[0,1][2,2]`)
  - the lvl2 node doesn't have a lvl1 parent node
  - the root is not set
expected: teleport to the root position `og[1,1][1,1]`

case 3:
- focus on a lvl1 node (e.g. `og[0,1][1,1]`)
  - the root is not set
expected: teleport to the root position `og[1,1][1,1]`

case 4:
- focus on a lvl1 node (e.g. `og[1,1][0,1]`)
  - the root is not set
expected: teleport to the root position `og[1,1][1,1]`

### quality of life 3

problem:
the app is not dvorak-friendly

solution:
provide a select box aside to the `mc-data-migration` widget
allowing users to switch keyboard emulating options (QWERTY and dvorak)
option defaults to QWERTY
on change the option, remap all the keybindings

use the following mappings:
QWERTY --> Dvorak
```txt
u --> g
i --> c
o --> r
y --> f
hjkl --> htns
wersdfxcv --> ,.poeuqjk
WERSDFXCV --> <>POEUQJK
? --> Z
```

## revision 2

I found out the error message "Records must be created in order" to be annoying
please help eliminate this message from the app

possible solution:
1. make root node always existing with a blank title field
2. fill in lvl1 node with `null` value if unset
this would allow users to create records on arbitrary positions
(i.e. the position of existing items are now persists)
this changes also reflect to import/ export
this changes also reflect to the reorder function
refer to file @v6/demo1.txt as a reference

### deletion behavior

delete now only set records to `null` instead of wipe it out entirely
- delete the root
  - clean up the fields of the root
  - wipe out all lvl2 nodes
  - set all lvl1 nodes to `null`
- delete a lvl1 node
  - wipe out all containing lvl2 nodes
  - set lvl1 to null
- delete a lvl2 node
  - set lvl2 to null

### creation behavior

case 1:
- the root is already set
- one of the lvl1 is unset
- focus on a lvl2 node having its' parent node unset
- hit 'u' on the lvl2 node (e.g. `og[0,1][2,2]`)
expected:
- on initializing the app, all the unset lvl1 nodes are filled with `null`
- teleport to `og[0,1][1,1]`, open the creation popup

case 2:
- the root is not set
- all of the lvl1 are unset
- focus on a lvl2 node (e.g. `og[0,1][2,2]`)
expected:
- on initializing the app, root is created with empty fields, all the unset lvl1 nodes are filled with `null`
- teleport to the root position `og[1,1][1,1]`
- open the update popup

## revision 3

we need to rework `_getCellTreeInfo` and `_handleCreate` in `v6/components/mc-app.js`
I was wrong about the previous revision
stuffing nulls on its own should be enough to eliminate the annoying message "Records must be created in order"
the previou decision that makes the root node always existing leads to inconsistency

here's the latest design:
- introduce `null` value. the root is initialized as `null`
  - the rest of the nodes are undefined and initialized on demands
- trying to create a record on an undefined node run checks on the tree structure, then, change focus based on the following cases

### case 1

given:
the root is null; you are currently focusing on a lvl1 or lvl2 node

expected:
focus to position `og[1,1][1,1]`; open the creation popup for the root node
on creating the root node, initialize all lvl1 node with null value

### case 2

given:
the lvl1 is null; you are currently focusing on a lvl2 node (e.g. `og[0,1][2,2]`) having its lvl1 parent node uninitialized

expected:
focus to the position `og[0,1][1,1]`; open the creation popup for the lvl1 node
on creating the lvl1 node, initialize all its lvl2 children node with null value

### case 3

given:
you are currently focusing on a lvl2 node with null value

expected:
open the creation popup for the lvl2 node as usual. nothing special here

## revision 4

we need to revisit how `v6/components/mc-modal.js` handles null values
let's make a draggable item displaying `[blank node]` for each null values
this would ensure the drag and drop works properly with the latest changes

## revision 5

we're not planning to serve lvl3 nodes in this version
please hide the draggable list while opening the popup modal on a lvl2 node

## revision 6

our final QOL feature which implements a fool-proof alias on null or undefined cells

problem:
previously users hit `io` on a blank cell would fail silently (since these two commands only works on a cell with existing data entry)

solution:
now users hitting `io` on a blank cell would also open a creation popup without failing silently