# design draft of feat#01: hotstring

## overview

users use NeoVim to edit plain text files (markdown).
files are centralized in a folder called `data` with this structure:
```
data (the root folder)
- 000-journal/
- p01-apple/
  - pie/
- p02-bee/
  - honey/
```

the feature detects user input in realtime during insert mode
and transforms `=` into `␅` under specific conditions.

## transformation rule

replace `=` with `␅` when BOTH conditions are met:
1. the `=` is at the **start of the line** (column 1)
2. the `=` is immediately followed by a **word character** (`\w`)

### examples
```
# NO transform — equal sign not at start of line
pine != pen

# NO transform — followed by space, not \w
= pineapple

# NO transform — nothing follows the equal sign
=

# YES transform → ␅pen
=pen

# YES transform → ␅3apple
=3apple
```

## scope: when the feature activates

the hook only applies when ALL conditions are met:
- the file is under the `data/` root folder tree
- the file extension is `.md`
- the file name does NOT start with underscore (e.g. `_draft.md` is excluded)

NeoVim must NOT activate this feature outside the data folder tree.

## technical decisions

### language: lua

lua is the native scripting language for NeoVim.
no external dependencies, best performance, direct access to NeoVim API.

### hook mechanism: `TextChangedI` autocmd

the `TextChangedI` event fires after each text change in insert mode.
this is the best fit because:
- it runs **after** the character appears on screen
- it can inspect the current line content and cursor position
- it can modify the buffer via `nvim_buf_set_text`

alternative considered: insert-mode keymap on `=`.
rejected because it intercepts every `=` keystroke across the line,
adding latency and complexity for a case that only matters at column 1.

### activation logic (pseudo-code)

```
on BufEnter / BufRead:
  path = full path of current buffer
  if path matches data root
  and file extension is .md
  and basename does not start with _
    attach TextChangedI autocmd to this buffer
```

### transform logic (pseudo-code)

```
on TextChangedI:
  line = current line text
  if line matches pattern ^=\w
    replace first char of line with ␅
    (cursor position stays unchanged)
```

## file structure

```
p16-noapp/
- plugin/
  - hotstring.lua      # entry point: autocmd setup + scope check
- lua/
  - hotstring/
    - init.lua          # transform logic
```

## edge cases

- pasting text that starts with `=\w`: should trigger (TextChangedI fires on paste)
- undo after transform: standard vim undo (`u`) should restore original `=`
- multiple `=` on same line: only column 1 matters, rest are ignored
- empty file: no issue, pattern won't match

## future considerations

- additional transformation rules can be added to the pattern matcher
- a config table could map different trigger patterns to replacements
- keep rule definitions in a separate data file if the list grows large
