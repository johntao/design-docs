# help-bar

mc-help-bar web component: a succinct bar showing keyboard shortcuts.

## purpose

always-visible quick reference for available shortcuts.
displayed below the grid.

## layout

a single horizontal bar with shortcuts listed inline.

format: `<kbd>key</kbd> action | <kbd>key</kbd> action | ...`

## shortcut entries

```
u new | i edit | o detail | Del delete | y status | hjklHJKL move | wersdfxcv jump | WERSDFXCV grid | ? help
```

## styling

- minimal, small font
- `<kbd>` elements styled with subtle border/background
- bar sits between the grid and the toolbar
- does not take focus; purely informational

## dvorak awareness

when dvorak mode is active, the displayed keys update to match the remapped bindings.
e.g. `u` becomes `g`, `hjkl` becomes `htns`, etc.
