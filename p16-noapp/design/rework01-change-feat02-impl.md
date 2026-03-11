# rework01: change feat#02 to adapt feat#03 and feat#04

this file describes how we should rework the design draft and implementation
of feat#02 to adapt the latest changes from feat#03 (metadata db) and feat#04 (onEnter).

changes will be applied to the feat#02 draft file and implementation
in the next iteration. this document only captures what needs to change.

## change 1: migrate trigger from onSave to onEnter

the heading command (`␅<N>text`) currently executes on `BufWritePre` (onSave).

move it to onEnter so the heading renders immediately when the user presses enter,
instead of waiting for the next file save.

before (onSave):
```
user types: ␅3random title
user saves file
output:     ### Random Title
```

after (onEnter):
```
user types: ␅3random title
user presses enter
output:     ### Random Title
            (cursor on new line below)
```

### what changes in feat#02

- remove the heading command from the `BufWritePre` dispatch table
- register it in the onEnter dispatch table instead (feat#04 mechanism)
- the command handler logic (AP-style title case) stays the same
- error handling shifts from "abort save" to "show error, allow newline"

## change 2: h1 heading inserts GUID (feat#03 integration)

when the heading command is `␅1<text>` (h1 specifically), the rendered output
must also insert a `;;{GUID}` line below the h1 heading.

before:
```
␅1today's headline
→ # Today's Headline
```

after:
```
␅1today's headline
→ # Today's Headline
  ;;5106bda3ce7c91946a2a577b6c045653358d47ea
```

### metadata db side effects

- generate a new SHA-1 GUID for the file
- insert a row into the file table: (GUID, file_path)
- this only applies to `␅1` (h1). headings `␅2` through `␅6` do not get GUIDs

## change 3: update feat#02 error handling

align with feat#04 error handling conventions:
- previously: unrecognized `␅` lines abort the save
- now: unrecognized `␅` lines on enter show an error message
  but do not block the newline insertion
- the onSave error path in feat#02 can be simplified or removed
  for commands that have migrated to onEnter

## summary of impacted files

```
design/feat02-exec-code-snippet.md  — update trigger, add GUID logic for ␅1
lua/noapp/exec.lua                  — remove heading from onSave dispatch
lua/noapp/commands/heading.lua      — add GUID generation for ␅1
```
