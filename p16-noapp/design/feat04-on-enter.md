# design draft for feat#04: new trigger (onEnter)

## motivation

avoid putting too many logic in the same trigger by introducing a new trigger.
separate workload into two categories:
- lighter workload to onEnter (instant feedback)
- heavier workload to onSave (batch processing)

current triggers: hotstring, onSave

expected triggers: hotstring, onEnter, onSave

## activation

- how to activate: user hits enter or inputs a newline character
- operation scope: the command in the current line is executed
- after execution: the `␅` character and the command are consumed
  and replaced with the rendered output

## scope: when the feature activates

all conditions must be met:
- the line starts with `␅`
- the file is under the `data/` root folder tree
- the file extension is `.md`
- the file name does NOT start with underscore

## hook mechanism

use a keymap on `<CR>` in insert mode (buffer-local).
the keymap fires before the newline is inserted:
1. check if current line starts with `␅`
2. if yes: parse and execute the command, replace the line with output,
   then insert the newline below the rendered output
3. if no: pass through the normal `<CR>` behavior

this differs from feat#01 (which uses `TextChangedI`) and feat#02 (which uses `BufWritePre`).

## commands migrated to onEnter

- heading command (`␅<N>text`) — previously onSave via feat#02
- log command (`␅l<prefix><text>`) — previously onSave via feat#05

these commands benefit from instant rendering at the moment of entry,
rather than waiting for the next save.

## error handling

on entering a newline, scan for `␅` prefix. if `␅` present
and does not match a known command:
1. no-op (the newline still inserts)
2. show an error message identifying the offending line number and content
3. the user may choose to fix it and trigger it again,
   or just remove the command

## execution flow (pseudo-code)

```
on <CR> in insert mode:
  line = current line text
  if line does not start with ␅ → normal <CR>

  parse command-id and argument
  if unrecognized → show error, insert newline, return

  result_lines = execute command handler
  replace current line with result_lines
  move cursor to end of last result line
  insert newline
```

## interaction with other features

- feat#01 (hotstring): runs first, transforms `=` into `␅`
- feat#04 (this): runs on enter, transforms `␅` commands into output
- feat#02/feat#05 onSave: retains sync and batch operations only
- feat#03 (metadata db): onEnter commands that generate GUIDs
  write metadata entries to the db at execution time
