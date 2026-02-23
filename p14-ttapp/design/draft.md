# time tracking app

a web prototype to verify some concepts
a quick dirty implementation is good enough. no need to do much architecture stuff
however, web component is a must. encapsulate the logic into separate components would be much appreciate

## tech stack

- vanilla js + web components (no framework)
- single html file or minimal file structure
- localStorage for persistence

## layout

- single page, vertical layout
- toolbar at top
- history list below

## toolbar

- a text input for task name/label
- a start/stop toggle button
- when running: show elapsed time ticking live

## history list

- each entry shows: task name, start time, end time, duration
- ordered by start time descending (newest first)
- entries persist across page reloads via localStorage

## data model

- entry: { id, taskName, startTime, endTime }
- duration is derived (endTime - startTime)

## open questions

- delete or edit entries?
- grouping by day?
- any summary/stats view?