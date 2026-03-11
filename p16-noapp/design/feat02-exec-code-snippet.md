# design draft of feat#02: executable code snippets

## overview

users embed executable code snippets in markdown notes.
lines starting with `␅` are commands that transform into rendered output.
after execution, all `␅` lines are replaced with their output — no traces remain.

files are centralized in a `data` folder:
```
data (the root folder)
- 000-journal/
- p01-apple/
- p02-bee/
```

## scope: when the feature activates

same rules as feat#01 (hotstring):
- the file is under the `data/` root folder tree
- the file extension is `.md`
- the file name does NOT start with underscore

## command syntax

a line starting with `␅` is a command. general form:

```
␅<command-id><argument>
```

the system dispatches by `<command-id>` to a handler function.

## command: heading (`␅<N>text`)

`<command-id>` = a single digit 1–6
`<argument>` = the heading text

**trigger:** onEnter (feat#04). the heading renders immediately when the user
presses enter, instead of waiting for the next file save.

**transform:** renders N hashtags + space + AP-style title case text

**special case for h1 (`␅1`):** also inserts a `;;{GUID}` line below the
rendered h1 heading, and creates a file record in the metadata db (feat#03).
headings `␅2` through `␅6` do not get GUIDs.

### AP-style title case rules
- capitalize the first and last word always
- capitalize words of 4+ letters
- lowercase minor words: a, an, and, as, at, but, by, for, in, nor, of, on, or, so, the, to, up, yet

### examples
```
input:  ␅3random title
output: ### Random Title

input:  ␅1the art of the deal
output: # The Art of the Deal
        ;;5106bda3ce7c91946a2a577b6c045653358d47ea

input:  ␅2war and peace
output: ## War and Peace
```

## error handling

on entering a newline, if `␅` present and does not match a known command:
1. the newline still inserts (no blocking)
2. show an error message identifying the offending line number and content
3. the user may choose to fix it and trigger it again,
   or just remove the command

## execution flow

```
on <CR> in insert mode (feat#04 onEnter):
  line = current line text
  if line does not start with ␅ → normal <CR>

  parse command-id and argument
  if unrecognized → show error, insert newline, return

  result_lines = execute command handler
  replace current line with result_lines
  move cursor to end of last result line
  insert newline
```

## extensibility

commands are registered in a dispatch table:

```lua
-- lua pseudo-code
local commands = {
  heading = { pattern = "^(%d)(.+)$", handler = heading_handler },
  -- future commands registered here
}
```

each handler receives the captures from its pattern and returns the replacement line(s).
a command may return multiple lines (e.g. a table generator).

## technical decisions

### language: lua

same rationale as feat#01 — native to NeoVim, no dependencies.

### hook: onEnter `<CR>` keymap (feat#04)

the heading command was originally on `BufWritePre` (onSave).
it has been migrated to onEnter for instant rendering on enter.
the `BufWritePre` path is retained only for commands that need
batch processing (e.g. sync in feat#05).

### file structure

```
lua/
  noapp/
    init.lua          # shared scope check
    hotstring.lua     # feat#01 transform
    on_enter.lua      # feat#04 onEnter dispatch
    exec.lua          # feat#02 onSave dispatch (retained for sync)
    db.lua            # feat#03 metadata db
    commands/
      heading.lua     # heading command handler
```

## edge cases

- empty argument after digit (`␅3`): invalid — show error, allow newline
- digit outside 1–6 (`␅9title`): invalid — show error, allow newline
- multiple `␅` lines in one file: each processed individually on its own enter
- undo after execution: standard vim undo restores the `␅` line
- the `␅` character in non-first-column positions: ignored, not a command
