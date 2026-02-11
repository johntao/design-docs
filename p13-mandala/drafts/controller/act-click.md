# act-click

click event handling strategy.

## design principle

- register one click event per web component on the outermost element
- use `event.target` to dispatch logic within the handler
- prefer least click event registration overall

## mc-cell

clicking a `mc-cell` focuses it via browser default (`tabindex="0"`).
no custom click handler needed for basic focus.

## mc-modal

registered on the `<dialog>` element.

dispatch targets:
- confirm button: validate fields and fire confirm event
- cancel button / backdrop: close modal without saving

the drag-and-drop child reorder also lives inside the modal's event scope.

## mc-notifier

registered on the toast container.

dispatch targets:
- undo button: fire undo event, dismiss the toast
- rest of toast body: no-op

## mc-data-migration

registered on the toolbar container.

dispatch targets:
- export button: trigger data export to file
- import button: open hidden `<input type="file">`
- file input `change`: parse and import data

## mc-help-modal

clicking the backdrop or close area dismisses the modal.

## notes

- click events are secondary to keyboard interactions
- the app is keyboard-first
- focus management relies on browser native behavior, not custom click-to-focus
