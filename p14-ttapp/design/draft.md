# time tracking app

a web prototype to verify some concepts
a quick dirty implementation is good enough. no need to do much architecture stuff
however, web component is a must. encapsulate the logic into separate components would be much appreciate

the main purpose of this app is to reduce input friction for users
this is achieved by three major features:
- predefined tasks allowing users for quick input
- optimized ring menu user control
- optimized time editing user control

## tech stack

- vanilla js + web components (no framework)
- single html file or minimal file structure
- localStorage for persistence
- consider reusing a published dial/knob web component if available

## layout

- single page, vertical layout
- toolbar at top
- history list below
- modal popups for configuration, entry editing, and help

## toolbar

- ring menu component for task selection
  - menu items are predefined by the user
  - configured via the configuration modal
- timer display
  - default: shows elapsed time ticking up
  - if task has estimation duration: shows countdown timer instead
  - countdown timer notifies user when it reaches zero
    - notification via sound and browser Notification API
- playback buttons: (play '▶' / stop '⏹')
  - play: start tracking the selected task
  - stop: end the current entry and save to history
- merge button '⇅'
  - visible only when the previous entry's taskName matches the current entry's taskName
  - merges current entry with the previous one (extends prev endTime to now, discards current)
  - use case: user accidentally double-tapped stop then play, wants to undo the split
- two icon buttons at the end of the toolbar:
  - '🔧' opens configuration modal
  - '?' opens help text modal

## ring menu

- full circle layout, 8 items max
- items evenly distributed around the circle
- each item displays the predefined task name
- only tasks available in the current time segment are shown

### gesture interaction

- hold to open the menu; release to close
- menu opens immediately on tap (no threshold delay)
- drag pointer to an item, then release to activate

### visual feedback

- highlight the currently focused item while dragging
- center of the circle is the cancel zone
  - dragging to center and releasing cancels the selection

## predefined tasks

- each task has:
  - name (required): label shown in ring menu and history
  - timesegs (optional): list of time segment enums; defaults to null (all-day)
  - estimationDuration (optional): duration in minutes; defaults to null (count up)
- timesegs controls when a task appears in the ring menu
  - only tasks whose timesegs include the current segment are shown
  - null means the task is always shown
- estimationDuration replaces elapsed timer with countdown when task is started
  - timer notifies user when countdown reaches zero

## time segments

- seg0: 00:00–06:00 & 22:00–23:59 (night)
- seg1: 06:00–10:00 (morning)
- seg2: 10:00–14:00 (midday)
- seg3: 14:00–18:00 (afternoon)
- seg4: 18:00–22:00 (evening)

## history list

- each entry shows: task name, start time, end time, duration
- ordered by start time descending (newest first)
- entries persist across page reloads via localStorage
- tap an entry to open the entry edit modal
- delete: remove an entry from history

## entry edit modal

- edit task name (select from predefined tasks)
- edit temporal values: startTime, endTime, duration
  - three editing modes:
    1. change startTime or endTime directly; duration updates automatically (no lock required)
    2. lock startTime, change duration; endTime updates
    3. lock endTime, change duration; startTime updates
  - tap startTime or endTime to lock it
  - lock is mutually exclusive: locking one unlocks the other
  - default state: lock startTime (mode 2)

## dial control

a shared dial-like user control used for both time editing and duration editing
do not reinvent the wheel — reuse a published web component if a suitable one exists

### common behavior

- circular dial face with 12 steps (each step = 5 minutes)
- user drags the minute hand around the dial
- dragging the minute hand to the center of the dial cancels the action
- value is committed on release

### time mode (editing startTime or endTime)

- minute hand initialized at the current minute value
- dragging clockwise past the 12 marker: hour += 1
- dragging counter-clockwise past the 12 marker: hour -= 1
- validation: startTime must not surpass endTime; endTime must not precede startTime

### duration mode (editing duration)

- two sub-modes activated by tap gesture:
  - single tap: additive mode
    - minute hand initialized at 12 marker (representing +0)
    - drag clockwise to add time, counter-clockwise to subtract
    - result = current duration + dial value (can be negative delta)
  - double tap: assignment mode
    - minute hand initialized at current duration value
    - can only drag clockwise (no negative values)
    - result = dial value directly
- validation: duration must be a positive value

## configuration modal

- manage predefined tasks:
  - add, remove, reorder tasks
  - set task name per task
  - set timesegs per task (multi-select from seg0–seg4, or null for all-day)
  - set estimationDuration per task (minutes, or null for count-up)
- data import/export:
  - export all time entries as JSON
  - import JSON; entries deduplicated by uuid
  - uuid ensures no duplicate entries on repeated imports

## help modal

- brief usage instructions for the app
- explain ring menu gesture
- explain dial control interaction
- explain time segment system
- explain merge button

## data model

### time entry

```
{
  uuid: string,        // universally unique id, for dedup on import
  taskName: string,    // name of the predefined task
  startTime: number,   // epoch ms
  endTime: number      // epoch ms
}
```

- duration is derived: endTime - startTime

### predefined task

```
{
  name: string,                    // display label
  timesegs: string[] | null,       // e.g. ["seg1", "seg2"] or null
  estimationDuration: number | null // minutes, or null
}
```

### app state

```
{
  tasks: predefinedTask[],    // ring menu items (max 8)
  entries: timeEntry[],       // all history entries
  currentEntry: {             // active tracking, null when idle
    taskName: string,
    startTime: number
  } | null
}
```

## web components

- `<tt-app>` — top-level shell, owns app state
- `<tt-toolbar>` — toolbar layout: ring menu, timer, playback, merge, config/help buttons
- `<tt-ring-menu>` — circular gesture-driven task selector (8 items, full circle)
- `<tt-history>` — scrollable list of time entries
- `<tt-entry>` — single entry row in the list (tap to edit)
- `<tt-modal>` — reusable modal popup shell
- `<tt-entry-edit>` — entry editing form inside modal (task name + temporal fields)
- `<tt-dial>` — shared dial control for time and duration editing
  - mode: "time" | "duration"
  - sub-mode (duration only): "additive" | "assignment"

## open questions

- dial control: should dragging past 12 multiple times accumulate hours, or clamp at ±1 hour per gesture?
- merge button: merge silently, or show a confirmation?
- ring menu: any visual indicator for tasks with estimation duration?
- configuration: max length for task names? truncation in ring menu?
- import/export: export only entries, or include predefined task config too?
