# feat08 command mode interface

this feature aims to replace the existing hotstring and exec-code-snippet features (i.e. feat01 and feat02)

the current implementation:
user start a line with `=` then, converted into `␅` via feat01 (i.e. TextChangedI autocmd)
user enter a line with `␅` then, exec commands if applicable

the new implementation:
user enter command mode, type the command directly, enter, then fire

## implementation details

hit `:` to enter command mode, commands starts with `]` are user-defined functions

### heading expansion

insert h1-h6 heading under the cursor

given: `]3some title`
insert this text under the cursor: `### Some Title\n`

given: `]1foo bar baz`
insert this text under the cursor: `### Foo Bar Baz\n`

remember to port the existing GUID and metadata logic to h1 heading
refer to feat02 and feat03

### synced block

no need to port this one
this one is subject to an upcoming rework

