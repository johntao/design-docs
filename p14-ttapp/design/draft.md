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
- two playback buttons: (play '▶' / pause '⏸') | (stop '⏹')
  - play: start or resume tracking the selected task
  - pause: pause the current timer (time stops accumulating)
  - stop: end the current entry and save to history
- two icon buttons at the end of the toolbar:
  - '🔧' opens configuration modal
  - '?' opens help text modal

## ring menu

- full circle layout, 8 items max
- gesture interaction:
  - hold to open the menu; release to close
  - menu opens immediately on tap (no threshold delay)
  - drag pointer to an item, then release to activate
- items evenly distributed around the circle
- each item displays the predefined task name

## predefined tasks

- each task has:
  - name (required): label shown in ring menu and history
  - timesegs (optional): list of time segment enums; defaults to null (all-day)
  - estimationDuration (optional): duration in minutes; defaults to null (count up)
- timesegs controls when a task appears in the ring menu
  - only tasks available in the current time segment are shown
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
    1. change startTime or endTime directly; duration updates automatically
    2. lock startTime, change duration; endTime updates
    3. lock endTime, change duration; startTime updates
  - tap startTime or endTime to lock it (lock is mutually exclusive)
  - startTime/endTime uses one optimized user control
  - duration uses a different optimized user control

## configuration modal

- manage predefined tasks:
  - add, remove, reorder tasks
  - set task name, timesegs, estimationDuration per task
- data import/export:
  - export all time entries as JSON
  - import JSON; entries deduplicated by uuid

## help modal

- brief usage instructions for the app

## data model

- time entry: { uuid, taskName, startTime, endTime }
  - uuid: universally unique id, used for deduplication on import
  - duration is derived (endTime - startTime)
- predefined task: { name, timesegs, estimationDuration }
  - timesegs: array of seg enums or null
  - estimationDuration: minutes or null

## web components

- `<tt-app>` — top-level shell
- `<tt-toolbar>` — toolbar with ring menu, timer, playback buttons, config/help buttons
- `<tt-ring-menu>` — circular gesture-driven task selector
- `<tt-history>` — scrollable list of time entries
- `<tt-entry>` — single entry row in the list
- `<tt-modal>` — reusable modal popup shell
- `<tt-entry-edit>` — entry editing form inside modal
- `<tt-time-control>` — optimized control for startTime/endTime editing
- `<tt-duration-control>` — optimized control for duration editing

## open questions

- ring menu: visual feedback while dragging? cancel zone?
- time control: what widget for editing startTime/endTime? (dial, scroller, etc.)
- duration control: what widget for editing duration? (stepper, slider, etc.)
- pause behavior: does paused time create a gap, or is it stitched together?
- countdown notification: sound, visual flash, or both?
