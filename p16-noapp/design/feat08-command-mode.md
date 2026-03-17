# feat08 command mode interface

replace the hotstring + exec-code-snippet flow (feat01 `=`→`␅`, feat02 `␅` dispatch)
with a single command-mode interface

## overview

current flow: type `=` at line start → auto-converts to `␅` → press Enter → command fires
new flow: enter command mode → type command → Enter → fires directly

after feat08 is live, feat01 (hotstring) and feat02 (exec on Enter) are retired;
feat04 (onEnter) remains but no longer dispatches `␅` commands

## command mode mechanism

hit `:` to enter NeoVim command-line mode

NeoVim user commands must start with an uppercase letter;
register a command `]` is not possible directly

**approach:** register a user command (e.g. `J`) and alias `]` to it via `cabbrev`:

```
cabbrev ] J
command! -nargs=1 J lua require('noapp.command').run(<q-args>)
```

so `:] 3some title` becomes `:J 3some title` and dispatches to Lua

### scope

same activation rules as feat01/feat02:
- file is under `~/Desktop/data/`
- file extension is `.md`
- filename does not start with `_`

the `J` command and `]` abbreviation are only registered for buffers matching these rules

## commands

### heading expansion (`<N><text>`)

`<N>` = single digit 1–6
`<text>` = heading text (rest of the argument)

example: `:] 3some title` → inserts below cursor:
```
### Some Title
```

example: `:] 1the art of the deal` → inserts below cursor:
```
# The Art of the Deal
;;{generated GUID}
```

#### title case rules (AP-style)

ported from feat02:
- capitalize the first and last word always
- capitalize words of 4+ letters
- lowercase minor words: a, an, and, as, at, but, by, for, in, nor, of, on, or, so, the, to, up, yet

#### h1 special case (GUID + metadata)

ported from feat02/feat03:
- generate a SHA-1 GUID
- insert `;;{GUID}` on the line below the heading
- create a row in the metadata db file table (`GUID`, `file_path`)

h2–h6 do not get GUIDs

#### error handling

- missing text after digit (e.g. `:] 3`): show error message, no insertion
- digit outside 1–6 (e.g. `:] 9title`): show error message, no insertion

### synced block

not ported — subject to an upcoming rework

### future commands

register in a dispatch table in `command.lua`; each entry is a pattern + handler

## file structure

```
plugin/command.lua              # registers J command + ] abbreviation on BufEnter
lua/noapp/command.lua           # dispatcher: parse args, match pattern, call handler
lua/noapp/commands/heading.lua  # heading expansion + GUID logic
```

## migration

- remove feat01 (hotstring) and feat02 (`␅` dispatch from onEnter)
- keep feat03 (metadata db), feat04 (onEnter), feat05 (duplicate log) unchanged
