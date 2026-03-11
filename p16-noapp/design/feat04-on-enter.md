# design draft for feat#04: new trigger

motivation: avoid putting too many logic in the same trigger by introducing a new trigger
by doing so, we can separate workload into two categories:
- leave lighter workload to onEnter
- leave heavier workload to onSave

current: hotstring, onSave

expected: hotstring, onEnter, onSave


## extra details

- how to activate? users hit enter or input a newline character in the line
- operation scope? the command in the line is executed
- after execution? the `␅` character is consumed

### scope: when the feature activates

- the line starts with `␅`
- the file is under the `data/` root folder tree
- the file extension is `.md`
- the file name does NOT start with underscore

### error handling

on entering a newline, scan for `␅` prefix. if `␅` present and does not match a known command:
1. no-op
2. **show an error message** identifying the offending line number and content
3. the user may choose to fix it and trigger it again
   - or just remove the command