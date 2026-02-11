# help-modal

mc-help-modal web component: descriptive keyboard shortcut reference.

## trigger

press `?` on any focused cell to open.
press `Esc` or click backdrop to close.

## implementation

uses HTML5 `<dialog>` element with `.showModal()`.
read-only; no data manipulation.

## content sections

### navigation

| key | description |
|-----|-------------|
| `h` | move left |
| `j` | move down |
| `k` | move up |
| `l` | move right |
| `H` | jump 3 left |
| `J` | jump 3 down |
| `K` | jump 3 up |
| `L` | jump 3 right |
| `wersdfxcv` | jump within subgrid |
| `WERSDFXCV` | jump between subgrids |

### editing

| key | description |
|-----|-------------|
| `u` | create new record |
| `i` | inline edit title |
| `o` | open detail editor |
| `Del` | delete record |
| `y` | cycle status: na -> now -> done |

### other

| key | description |
|-----|-------------|
| `?` | toggle this help modal |

## layout

each section has a heading and a list of shortcut items.
each item: `<kbd>` key display + description text.

## dvorak awareness

when dvorak mode is active, keys update to show dvorak equivalents.

## styling

- modal overlay with centered content
- organized in columns or sections
- `<kbd>` elements styled consistently with help-bar
