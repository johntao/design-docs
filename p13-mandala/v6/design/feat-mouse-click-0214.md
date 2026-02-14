# new feature

let's introduce mouse click actions to this application

here are the principles to implement a mouse click action
1. make the cursor looks differently while hovering on an element that is interactable to mouse click event
2. all the mouse click events should only work on a focused cell
   - for example: users should first focus a `mc-cell`, then, clickable events for this element is activated
   - this also applies to the previous principle where an interactable element should change the appearance of the cursor
   - if the element is not yet focused, then, no need to change the apperance of the cursor
3. use `UIEvent.detail` to differentiate a single click event and a double click event

## support click actions on a mc-cell

### 'y' status toggle

when users hover on the status icon, change the cursor to 'pointer' hinting users to toggle the status

### 'i' inline editing

when users hover on the title field, change the cursor to 'text' hinting users to edit the field

### the rest of the area

- when users single click on a mc-cell, trigger 'o' action to open an update modal
  - if users is targeting an empty cell, 'u' action is triggered instead (this works similar to the shortcut version)
- when users double click on a mc-cell, trigger 'u' action to open a creation modal popup


## revision 1

the last final fix:
fix the error message while trying to invoke creation modal popup on a lvl2 node
replace "Maximum children reached (8)" by something like "invalid operation on inserting a lvl3 node"
or "lvl3 node is not currently support yet"