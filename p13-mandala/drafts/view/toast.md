# toast

mc-notifier web component: transient notification messages.

## purpose

notify users about:
- record deletion (with undo action)
- validation errors (e.g. blank title, max children reached)

## usage

### deletion toast

triggered when a record is deleted via `Del` key.

content: deletion confirmation message + undo button.
- undo button: restores the deleted record and its children, saves, re-renders
- auto-dismiss after timeout (e.g. 5 seconds)
- manual dismiss on undo click

### validation toast

triggered by:
- mc-modal: blank/whitespace title on confirm attempt
- mc-cell: attempting to add child when parent already has 8

content: error message text.
- auto-dismiss after timeout
- no undo action

## behavior

- appears at a fixed position (e.g. bottom-center or top-right)
- stacks if multiple toasts fire in quick succession
- does not steal focus from the grid
- clicking outside the toast does not dismiss it (only timeout or undo click)

## shadow DOM

```html
<div class="toast-container">
  <div class="toast">
    <span class="toast-message">{message}</span>
    <button class="toast-undo" hidden>Undo</button>
  </div>
</div>
```

## API

### methods

- `show(message, options?)`: display a toast
  - `options.undo`: callback function for undo action (shows undo button if provided)
  - `options.duration`: auto-dismiss time in ms

## styling

- subtle background with border
- small font, non-intrusive
- undo button styled as inline link/button
