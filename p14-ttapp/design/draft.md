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
- modal popups for configuration and help

## toolbar

- ring menu component for task selection (replaces text input)
  - menu items are predefined by the user
  - configured via the configuration modal
- a start/stop toggle button
- when running: show elapsed time ticking live
- two icon buttons at the end of the toolbar:
  - '🔧' opens configuration modal
  - '?' opens help text modal

## ring menu

- circular menu for selecting predefined task names
- designed to minimize taps/clicks for task switching
- items configured by user through configuration modal

## history list

- each entry shows: task name, start time, end time, duration
- ordered by start time descending (newest first)
- entries persist across page reloads via localStorage
- inline edit: tap a field to modify task name, start time, or end time
- delete: remove an entry from history

## configuration modal

- manage ring menu items (add, remove, reorder predefined tasks)
- data import/export (JSON) to manage records across multiple days

## help modal

- brief usage instructions for the app

## data model

- entry: { id, taskName, startTime, endTime }
- duration is derived (endTime - startTime)
- ring menu config: array of task name strings

## web components

- `<tt-app>` — top-level shell
- `<tt-toolbar>` — toolbar with ring menu, timer, buttons
- `<tt-ring-menu>` — circular task selector
- `<tt-history>` — list of time entries
- `<tt-entry>` — single editable entry row
- `<tt-modal>` — reusable modal popup

## open questions

- ring menu: how many items max? layout (full circle, semicircle)?
- ring menu: keyboard/gesture interaction model?
- time editing: what optimized control for editing times?
- entry edit: inline editing or edit via modal?
