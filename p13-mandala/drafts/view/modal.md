# modal

mc-modal web component: dialog popup for creating and updating records.

## implementation

uses HTML5 `<dialog>` element with `.showModal()`.

## two modes

### creation mode

opened when creating a new record (`u` on empty cell).

fields:
- title (required, text input)
- description (optional, textarea)
- status (select dropdown: na / now / done, defaults based on parent status)

### update mode

opened when detail-editing an existing record (`o` on occupied cell).

fields:
- title (required, pre-filled)
- description (optional, pre-filled)
- status (select dropdown, pre-filled with current value)
- child list (draggable, for reorder)

## child list (update mode only)

- displays children as draggable items
- null children shown as `[blank node]` (still draggable for reorder)
- drag-and-drop to reorder children
- hidden for lvl2 nodes (no lvl3 support)

## confirm / cancel

- `Enter` or confirm button: validate and submit
  - if title is blank/whitespace: no-op, notify via toast
  - if valid: dispatch confirm event with payload `{ title, description, status }`
- `Esc` or cancel button: close without saving

## focus behavior

- on open: auto-focus the title input
- on close: restore focus to the originating mc-cell

## shadow DOM

```html
<dialog>
  <form>
    <div class="field">
      <label>Title</label>
      <input class="input-title" required />
    </div>
    <div class="field">
      <label>Description</label>
      <textarea class="input-desc"></textarea>
    </div>
    <div class="field field-status">
      <label>Status</label>
      <select class="input-status">
        <option value="na">na</option>
        <option value="now">now</option>
        <option value="done">done</option>
      </select>
    </div>
    <div class="child-section">
      <!-- draggable child items, update mode only -->
    </div>
    <div class="actions">
      <button type="button" class="btn-cancel">Cancel</button>
      <button type="submit" class="btn-confirm">Confirm</button>
    </div>
  </form>
</dialog>
```

## API

### methods

- `open(mode, data)`: open modal in 'create' or 'update' mode with initial data
- `close()`: close without dispatching

### events

- `confirm`: dispatched with detail payload on successful submit
- `cancel`: dispatched on close without saving
