refer to file @v4/design/composition.txt and @v4/test/composition.html

I would like to use this version as a starting point, then, implement the full manadala chart app

please use the following instructions to implement:

## main html

we have three cell component (`cell-test`) in the previous version
```html
<main>
  <cell-test></cell-test>
  <cell-test></cell-test>
  <cell-test></cell-test>
</main>
<modal-test></modal-test>
<notify-test></notify-test>
```

the new version should display 81 cell components in a 9x9 grid  
a single 9x9 grid is sufficient; no need to use css subgrid feature  
we can detail the styles in the next iteration

`modal-test` is the modal popup component used by `cell-test`
`notify-test` is the notification component used by `cell-test` and `modal-test`

## cell web component

### feature 1, the layout

use light theme and minimal styling

- the host `cell-test` is a wrapper of a master record (mr)
  - a wrapper may contains zero-to-one mr
- the first row of the mr is an editable title
- the second row of the mr is a list of detail records (dr)
  - a mr may contains zero-to-many drs
  - display 5 records at max
- each dr (list-item) exposes a single editable field "title"

### feature 2, rules of focus

1. use the built-in focus method and behavior
   - do not introduce homemade focus implementation
   - all keyboard shortcuts require a "focused" element to trigger
2. define focusable elements explicitly; prefer the least focusable elements
   - make each focusable element have unique function
   - dedup focusable elements whenever possible
   - prefer the outer element if duplication found
   - e.g. both "cell component" and "mr title" represent the mr => keep "cell componenet" as focusable, make "mr title" non-focusable
3. use `:focus` to style each focused element
   - declare these styles explicitly (made it clear which elements are focusable)
   - use outline to style focused elements
4. use `tabindex="0"` to define if an element is focusable
5. register one click event per component, use `event.target` to dispatch the logic

refer to file `../test/component-focus.html` as an example

#### types of focus

in the example file, the `cell-test` is also focused when a dr is focused  
thus, there are two types of focus
- type1: a `cell-test` and a dr is focused
  - in this case "feature 4,5,6" operates on the dr
- type2: a `cell-test` is focused without any other dr is focused
  - in this case "feature 4,5,6" operates on the mr

#### UI layout examples

case 1
- cell-test (focusable)
  - empty

case 2
- cell-test (focusable)
  - mr
    - mr title (not focusable)

case 3
- cell-test (focusable)
  - mr
    - mr title (not focusable)
    - drs
      - dr (focusable)
      - dr (focusable)
      - dr (focusable)
      - dr (focusable)

### feature 3, creating records

#### case 1

if the `cell-test` is focused and `cell-test` doesn't contain a mr

user hit `u` to create a mr, which then, opens a creation modal popup

if create successfully, a mr is inserted into the `cell-test`

#### case 2

if the `cell-test` is focused and `cell-test` already contain a mr

user hit `u` to create a dr of the mr, which then, opens a creation modal popup

if create successfully, a dr is inserted into the mr

### feature 4, deleting records

#### case 1

if the `cell-test` is focused and `cell-test` doesn't contain a mr

user hit `<del>` => nothing happen

#### case 2

if the `cell-test` is focused and `cell-test` already contain a mr

user hit `<del>` to delete the mr including all the drs belong to the mr

use `notify-test` to notify deletion with an undo button

#### case 3

if a dr is focused

user hit `<del>` to delete the dr from the mr

use `notify-test` to notify deletion with an undo button

### feature 5, inline editing

hit `i` on a focused element allows user to edit the title directly
- user may hit `<enter>` to apply the changes
- user may hit `<esc>` to discard the changes

### feature 6, detail editing

hit `o` on a focused element allowing users to open an update modal popup to edit the details of the entity
- inherit logic from creation modal; refer to [previous section](#feature-4-creating-records)
  - except that a mr update modal also list all the related drs
  - users may drag and drop to reorder the dr
  - restore the focus after closing the modal

### feature 7, navigation

#### list item rotation

given a mr with 8 drs, and mr is currently focused

- hit `n`: pop the last drs, then, unshift it back to the list; repeat 1 times
- hit `m`: shift the first drs, then, push it back to the list; repeat 2 times

should remains the posistion of the current focus element after the rotation

#### arrow keys to focus different dr

given a mr with 8 drs, and the 3rd dr is currently focused

- hit arrow keys up/ down to focus up/ down elements related to the current focused element
  - stop navigation on boundary
  - the start boundary: focusing `cell-test` without focusing any dr
  - the end boundary: the last dr

#### cell jump local

layout 81 `cell-test` into a 3x3 maingrid (mg); each maincell contains a 3x3 subgrid (sg)

a local jump-jump inside the current sg

where each lowercase letter maps to a cell of the sg

given current focused element position `mg[1,2];sg[0,0]`
- hitting w, position not change
- hitting e, move to `mg[1,2];sg[0,1]`
- hitting r, move to `mg[1,2];sg[0,2]`
- hitting f, move to `mg[1,2];sg[1,2]`
- hitting x, move to `mg[1,2];sg[2,0]`
- conclusion: move sg; mg doesn't change

#### cell jump global

a global jump-jump inside the mg

where each uppercase letter maps to a cell of the mg

given current focused element position `mg[0,0];sg[1,2]`
- hitting W, position not change
- hitting E, move to `mg[0,1];sg[1,2]`
- hitting R, move to `mg[0,2];sg[1,2]`
- hitting F, move to `mg[1,2];sg[1,2]`
- hitting X, move to `mg[2,0];sg[1,2]`
- conclusion: move mg; sg doesn't change

#### cell walk

shortcut keys hjkl which change the focused elements by 9x9 `cell-test` indices
- h move left; cells[i,--j]
- j move down; cells[++i,j]
- k move up; cells[--i,j]
- l move right; cells[i,++j]
cancel the action if out of boundary

### misc

there are four types of actions:
1. actions without operands
2. actions that take a master record as operand
3. actions that take the current focused element as operand
  - this type of action is covered in [previous section](#types-of-focus)


| feature | action           | key           | operate on                 | action type |
| ------- | ---------------- | ------------- | -------------------------- | ----------- |
| 7       | cell-jump-local  | wersdfxcv     | #N/A                       | 1           |
| 7       | cell-jump-global | WERSDFXCV     | #N/A                       | 1           |
| 7       | cell-walk        | hjkl          | #N/A                       | 1           |
| 3       | create           | u             | master record or cell-test | 2           |
| 7       | rotate           | nm            | master record              | 2           |
| 7       | incell-nav       | `<up>/<down>` | focused element            | 3           |
| 5       | inline-edit      | i             | focused element            | 3           |
| 6       | detail-edit      | o             | focused element            | 3           |
| 4       | delete           | `<del>`       | focused element            | 3           |

## modal component

there are two types of modal: creation and update
here's the shared properties of a modal popup
- containing a title (required) field and a description field
- hit `<esc>` to cancel the operation, and close the modal
- hit `<enter>` to confirm the operation
  - if the title is blank or whitespace, does nothing, use `notify-test` to notify users for violation
  - if the title is not blank or whitespace, create the record, close the modal

use `<dialog>` to implement the modal

## notification component

notify deletion and fields validation

---

