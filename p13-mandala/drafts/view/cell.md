# cell

mc-cell web component: the focusable, interactable unit of the grid.

## role

- wrapper for zero-to-one mc-record
- primary focusable element for keyboard interactions
- displays record title, status, progress, and description

## focusability

- `tabindex="0"` on the host element
- styled with `:focus { outline: ... }` to indicate focus
- the mr content inside is not separately focusable
  - avoids duplication: mc-cell and mr represent the same entity

## shadow DOM layout

### empty cell

```html
<mc-cell tabindex="0">
  <!-- shadow root -->
  <div class="cell-content">
    <!-- empty -->
  </div>
</mc-cell>
```

### occupied cell

```html
<mc-cell tabindex="0">
  <!-- shadow root -->
  <div class="cell-content">
    <div class="mr-title">{title}</div>
    <div class="mr-status">
      <span class="status-{status}">{status-icon}</span>
      <span>{progress}%</span>
    </div>
    <div class="mr-desc">{description}</div>
  </div>
</mc-cell>
```

## status/progress line

replaces the old `[N children]` display.

| status | icon | progress display            |
|--------|------|-----------------------------|
| `na`   | —    | hidden if no sub-tasks      |
| `now`  | 🔧   | `{progress}%`               |
| `done` | ✅   | `{progress}%`               |

progress is computed via `calcProgress(record)` on each render.

## styling

- status colors: `na` = #999, `now` = #e67e00, `done` = #2e7d32
- status line: `font-size: 10px; display: flex; justify-content: space-between;`
- light theme, minimal styling
- title text may overflow with ellipsis for long titles

## inline edit mode

triggered by `i` key:
- title becomes an editable input field
- `Enter` commits the change
- `Esc` discards and restores original
- focus returns to the mc-cell after exit

## API

### properties

- `cellIndex`: flat position in the 9x9 grid (0-80)
- `record`: the mc-record to display (or null for empty)

### methods

- `setRecord(record)`: update displayed record and re-render
- `startInlineEdit()`: enter inline edit mode for title
