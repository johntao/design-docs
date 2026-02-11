# act-click

click event handling strategy.

## design principle

- register one click event per web component on the outermost element
- use `event.target` to dispatch logic within the handler
- prefer least click event registration overall
- focus management relies on browser native behavior, not custom click-to-focus

## mc-cell

clicking a `mc-cell` focuses it; thanks to `tabindex="0"`
no custom click handler needed for basic focus

## mc-modal

registered on the `<dialog>` element.

dispatch targets:
- confirm button: validate fields and fire confirm event
- cancel button / backdrop: close modal without saving

the drag-and-drop child reorder also lives inside the modal's event scope.

## mc-toast

registered on the toast container.

dispatch targets:
- undo button: fire undo event, dismiss the toast
- rest of toast body: no-op

## mc-toolbar

registered on the toolbar container.

dispatch targets:
- export button: trigger data export to file
- import button: open hidden `<input type="file">`
- file input `change`: parse and import data

## mc-help-modal

clicking the backdrop or close area dismisses the modal.

