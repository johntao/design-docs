# design draft of feat#02: executable code snippets

## overview

users embed executable code snippets in markdown notes.
lines starting with `␅` are commands that transform into rendered output on file save.
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
unrecognized or malformed `␅` lines **abort the save** and alert the user.

## command: heading (`␅<N>text`)

`<command-id>` = a single digit 1–6
`<argument>` = the heading text

**transform:** renders N hashtags + space + AP-style title case text

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

input:  ␅2war and peace
output: ## War and Peace
```

## error handling

on save, scan all lines for `␅` prefix. if ANY `␅` line does not match a known command:
1. **abort the save** — the file is NOT written to disk
2. **show an error message** identifying the offending line number and content
3. the user must fix or remove the invalid line before saving again

## execution flow

```
on BufWritePre:
  if buffer not in scope → skip
  lines = all buffer lines
  collect indices of lines starting with ␅
  if none found → allow save (no-op)

  for each ␅ line:
    parse command-id and argument
    if unrecognized → abort save, notify user, return

  for each ␅ line (in reverse order to preserve indices):
    replace line with command output

  buffer is now modified with rendered output → save proceeds
```

processing in reverse order ensures line indices stay valid during replacement.

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

### hook: `BufWritePre` autocmd

fires before the file is written. this allows:
- inspecting and transforming buffer content before it hits disk
- aborting the save on error via `vim.cmd("echoerr ...")` + setting `vim.b.abort`

### file structure

reuses the existing `lua/hotstring/` module (rename to `lua/noapp/` if scope grows):
```
lua/
  noapp/
    init.lua          # shared scope check
    hotstring.lua     # feat#01 transform
    exec.lua          # feat#02 command dispatch + execution
    commands/
      heading.lua     # heading command handler
```

## edge cases

- empty argument after digit (`␅3`): invalid — abort save
- digit outside 1–6 (`␅9title`): invalid — abort save
- multiple `␅` lines in one file: all processed in single pass
- undo after save: standard vim undo restores the `␅` lines
- the `␅` character in non-first-column positions: ignored, not a command
