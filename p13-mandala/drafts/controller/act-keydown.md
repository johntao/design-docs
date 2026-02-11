# act-keydown

keydown event handling strategy.

## design principle

- use browser built-in focus behavior
- all keyboard shortcuts require a focused element to trigger
- do not introduce homemade focus management
- use `tabindex="0"` to define focusable elements
- style focused elements with `:focus` using `outline`
- define focusable elements explicitly; prefer the least focusable elements
  - dedup: if both parent and child represent the same entity, keep the parent focusable
  - e.g. mc-cell is focusable, the mr inside it is not

## event registration

keydown is registered on `mc-app` (the root component).
the handler reads `document.activeElement` to determine context.

the handler dispatches to the appropriate command based on key and context:
- navigation commands (see cmd-nav.md)
- CRUD commands (see cmd-crud.md)
- task management commands (see feature/task-mgmt.md)
- help modal toggle

## keydown handler flow

```
1. identify focused element (must be a mc-cell)
2. read the pressed key
3. check dvorak remap if enabled
4. match key to command
5. execute command
6. prevent default if matched
```

## dvorak support

a keyboard layout selector (QWERTY / Dvorak) remaps all keybindings at the handler level.

QWERTY to Dvorak mapping:
```
u --> g       (create)
i --> c       (inline edit)
o --> r       (detail edit)
y --> f       (cycle status)
hjkl --> htns (cell walk)
HJKL --> HTNS (cell hop)
wersdfxcv --> ,.poeuqjk   (inner jump)
WERSDFXCV --> <>POEUQJK   (outer jump)
? --> Z       (help modal)
```

## focusable elements

explicit list of focusable elements in the app:
- `mc-cell` (81 cells in the 9x9 grid)
- `<input>` and `<textarea>` inside mc-modal (when modal is open)
- `<select>` inside mc-modal (status dropdown)
- `<button>` elements in mc-modal, mc-toast, mc-toolbar

mc-cell is the primary focusable element for all grid interactions.
modal/toast elements become focusable only when their dialog is open.
