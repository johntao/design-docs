# time tracking app

a web prototype to verify some concepts
a quick dirty implementation is good enough. no need to do much architecture stuff
however, web component is a must. encapsulate the logic into separate components would be much appreciate

the main purpose of this app is to reduce input friction for users
this is achieved by three major features:
- predefined tasks allowing users for quick input
- optimized ring menu user control
- optimized time editing user control

---

## tech stack

- vanilla js + web components (no framework)
- single html file or minimal file structure
- localStorage for persistence
- consider reusing a published dial/knob web component if available

## layout

- single page, vertical layout
- toolbar at top (fixed)
- history list below (scrollable)
- modal popups for configuration, entry editing, and help

---

## toolbar

### structure (left to right)

1. ring menu trigger (task selector)
2. timer display
3. playback buttons: play '▶' / stop '⏹'
4. merge button '⇅' (conditional)
5. config button '🔧'
6. help button '?'

### ring menu trigger

- displays the currently selected task name (truncated with ellipsis at 20 chars)
- tap/hold to open the ring menu overlay
- when no task is selected: show placeholder text

### timer display

- when idle: show "00:00"
- when tracking (count up): show elapsed time ticking (mm:ss, then h:mm:ss)
- when tracking (countdown): show remaining time ticking down
  - when countdown reaches zero: play sound + send browser Notification

### playback buttons

- play '▶': start tracking the selected task; disabled when no task selected
- stop '⏹': end current entry, save to history; disabled when idle
- play and stop are always visible; enabled/disabled based on state

### merge button '⇅'

- visible only when ALL conditions are met:
  - currently tracking (not idle)
  - previous entry in history exists
  - previous entry's taskName matches current entry's taskName
- action: merge silently (no confirmation)
  - set previous entry's endTime to current time
  - discard current tracking entry
  - continue in idle state
- use case: user accidentally tapped stop then play, wants to undo the split

### config and help buttons

- '🔧' opens configuration modal
- '?' opens help modal

---

## ring menu

- full circle layout, 8 items max
- items evenly distributed around the circle (360° / item count)
- each item displays the predefined task name (truncated with ellipsis at 20 chars)
- only tasks available in the current time segment are shown
- if no tasks are available for current segment: ring menu is empty (show message)

### gesture interaction

- hold to open the menu; release to close
- menu opens immediately on tap (no threshold delay)
- drag pointer to an item, then release to activate
- the selected task becomes the active task in the toolbar

### visual feedback

- highlight the currently focused item while dragging
- center of the circle is the cancel zone
  - dragging to center and releasing cancels the selection
  - visual indicator for cancel zone (e.g. dimmed center area)

---

## predefined tasks

- each task has:
  - name (required): label shown in ring menu and history; max 20 chars
  - timesegs (optional): list of time segment enums; defaults to null (all-day)
  - estimationDuration (optional): duration in minutes; defaults to null (count up)
- timesegs controls when a task appears in the ring menu
  - only tasks whose timesegs include the current segment are shown
  - null means the task is always shown
- estimationDuration replaces elapsed timer with countdown when task is started
  - timer notifies user when countdown reaches zero

---

## time segments

five segments covering the full 24-hour day:

| enum | range                        | label     |
|------|------------------------------|-----------|
| seg0 | 00:00–06:00 & 22:00–23:59   | night     |
| seg1 | 06:00–10:00                  | morning   |
| seg2 | 10:00–14:00                  | midday    |
| seg3 | 14:00–18:00                  | afternoon |
| seg4 | 18:00–22:00                  | evening   |

- the current segment is determined by the current wall-clock time
- seg0 wraps around midnight (two disjoint ranges)

---

## history list

- each entry row shows: task name, start time, end time, duration
- ordered by start time descending (newest first)
- entries persist across page reloads via localStorage
- tap an entry row to open the entry edit modal
- swipe or button to delete an entry

---

## entry edit modal

opened by tapping an entry in the history list

### task name field

- select from predefined tasks (dropdown or similar)
- displays current task name; tap to change

### temporal fields

displays three values: startTime, endTime, duration

#### editing modes

1. **no lock**: change startTime or endTime directly via dial; duration updates automatically
2. **lock startTime**: change duration via dial; endTime updates accordingly
3. **lock endTime**: change duration via dial; startTime updates accordingly

#### lock behavior

- tap startTime to lock it; tap endTime to lock it
- lock is mutually exclusive: locking one unlocks the other
- default state on open: lock startTime (mode 2)
- locked field shows a lock icon indicator

#### interaction flow

- tap a temporal field (startTime, endTime, or duration) to open the dial control
- the dial operates in time mode or duration mode depending on which field was tapped
- when the locked field is tapped, it stays locked and opens in time mode (user can still view/adjust it, but the lock determines which other field recalculates)

### save and cancel

- save: apply changes and close modal
- cancel: discard changes and close modal

---

## dial control

a shared dial-like user control used for both time editing and duration editing
do not reinvent the wheel — reuse a published web component if a suitable one exists

### visual design

- circular dial face
- 12 step markers around the perimeter (each step = 5 minutes)
- a draggable minute hand from center to perimeter
- center zone visually distinct (cancel zone)
- current value displayed as text in the dial face

### common behavior

- user drags the minute hand around the dial
- step snap: hand snaps to nearest 5-minute increment
- dragging the minute hand to the center of the dial cancels the action
- value is committed on release (not during drag)
- dragging past 12 marker multiple times accumulates hours (no clamp)

### time mode (editing startTime or endTime)

- minute hand initialized at the current minute value
- displays current time value (HH:MM) in the center
- dragging clockwise past the 12 marker: hour += 1
- dragging counter-clockwise past the 12 marker: hour -= 1
- multiple crossings accumulate (e.g. two clockwise crossings = +2 hours)
- on release: commit the new time value
- validation: startTime must not surpass endTime; endTime must not precede startTime
  - if invalid: reject change, revert to previous value

### duration mode (editing duration)

two sub-modes activated by how the user taps the duration field:

#### single tap → additive mode

- minute hand initialized at 12 marker (representing +0)
- drag clockwise to add time
- drag counter-clockwise to subtract time
- crossing 12 marker accumulates hours (same as time mode)
- result = current duration + dial delta
- on release: apply delta to duration

#### double tap → assignment mode

- minute hand initialized at current duration value (minute portion)
- can only drag clockwise (counter-clockwise movement is ignored)
- crossing 12 marker accumulates hours
- result = dial value directly (absolute assignment)
- on release: set duration to dial value

#### duration validation

- final duration must be positive (> 0)
- if result would be zero or negative: reject change, revert

---

## configuration modal

### predefined task management

- list of current predefined tasks
- add a new task (up to 8 max)
- remove a task
- reorder tasks (drag to reorder or up/down buttons)
- per task fields:
  - name: text input, max 20 chars
  - timesegs: multi-select checkboxes for seg0–seg4; unchecked = null (all-day)
  - estimationDuration: number input in minutes; empty = null (count up)

### data export

- export time entries only (not predefined task config)
- format: JSON array of time entry objects
- trigger: export button → browser file download

### data import

- import time entries from JSON file
- entries deduplicated by uuid (existing uuids are skipped)
- trigger: import button → file picker → parse and merge

### config persistence

- predefined task config stored separately in localStorage
- config is not included in entry export/import
- to transfer config: use a separate config export/import mechanism

---

## help modal

- brief usage instructions covering:
  - how to use the ring menu (hold, drag, release)
  - how to start/stop tracking
  - how the merge button works
  - how the dial control works (time mode vs duration mode)
  - how time segments filter tasks
  - how to configure predefined tasks
  - how to import/export data

---

## data model

### time entry

```json
{
  "uuid": "string",
  "taskName": "string",
  "startTime": 1234567890000,
  "endTime":   1234567890000
}
```

- uuid: crypto.randomUUID() on creation; used for dedup on import
- taskName: matches a predefined task name
- startTime / endTime: epoch milliseconds
- duration: derived (endTime - startTime), not stored

### predefined task

```json
{
  "name": "string",
  "timesegs": ["seg1", "seg2"],
  "estimationDuration": 50
}
```

- name: max 20 chars
- timesegs: array of seg enum strings, or null for all-day
- estimationDuration: number (minutes), or null for count-up

### app state

```json
{
  "tasks": [],
  "entries": [],
  "currentEntry": null
}
```

- tasks: predefined task array (max 8)
- entries: all time entry records
- currentEntry: `{ taskName, startTime }` when tracking, null when idle

### localStorage keys

- `tt-tasks`: JSON string of predefined tasks array
- `tt-entries`: JSON string of time entries array
- `tt-current`: JSON string of current tracking entry or null

---

## web components

| component        | responsibility                                              |
|------------------|-------------------------------------------------------------|
| `<tt-app>`       | top-level shell, owns app state, coordinates modals         |
| `<tt-toolbar>`   | toolbar layout: ring menu, timer, playback, merge, buttons  |
| `<tt-ring-menu>` | circular gesture-driven task selector (8 items, full circle)|
| `<tt-history>`   | scrollable list of time entries                             |
| `<tt-entry>`     | single entry row in the list (tap to edit)                  |
| `<tt-modal>`     | reusable modal popup shell (backdrop, close behavior)       |
| `<tt-entry-edit>`| entry editing form: task name selector + temporal fields     |
| `<tt-dial>`      | shared dial control for time and duration editing           |
| `<tt-config>`    | configuration form: task management + import/export         |
| `<tt-help>`      | help text content                                           |

### component communication

- parent → child: attributes and properties
- child → parent: custom events (bubbling)
- app state lives in `<tt-app>`, passed down as props
- modals managed by `<tt-app>` (open/close state)

### event flow examples

- ring menu selects task → `tt-ring-menu` dispatches `task-selected` → `tt-toolbar` updates display → `tt-app` updates selected task
- play pressed → `tt-toolbar` dispatches `tracking-start` → `tt-app` creates currentEntry
- stop pressed → `tt-toolbar` dispatches `tracking-stop` → `tt-app` finalizes entry, saves to entries
- merge pressed → `tt-toolbar` dispatches `tracking-merge` → `tt-app` merges with previous entry
- entry tapped → `tt-entry` dispatches `entry-edit` → `tt-app` opens entry edit modal
- dial released → `tt-dial` dispatches `dial-commit` with value → `tt-entry-edit` applies to temporal field
