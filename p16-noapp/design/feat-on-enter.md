# design draft for feat#03: new trigger

I think we can do it better by introducing more triggers

current: hotstring, onSave

expected: hotstring, onEnter, onSave

the reason is to avoid putting too many logic in the same trigger

thus, the first thing is to rework feat#02

let the command executed earlier onEnter instead of onSave

this change would separate workload into light and heavy:
- leave lighter workload to onEnter
- leave heavier workload to onSave

the first candidate of this feature is the one we've already implemented feat#02

the previous implementation only convert `␅3random title` to `### Random Title` on saving files

the expected behavior is to trigger the conversion on entering a newline

thus, we need to rework the design draft @design/feature-exec-code-snippet.md
to adpat the new change

## extra details

- how to trigger? users hit enter or input a newline character in the line
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
3. the user may fix it and enter again
   - or remove the invalid tokens