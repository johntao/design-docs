# mandala chart

this is a draft for a mandala chart application
the app is composed by these web components:
- mc-app
  - the root of the app
  - orchestrate mc-grid and mc-cell to handle the mandala-specific rendering logic
  - contains all the app configs including keybindings
  - contains the data entries as a tree structure
    - each node is a mc-record (aka mr)
- mc-grid
  - render total 9x9 cells
  - 9x9 cells are grouped by 3x3 outergrid (aka og) containing a 3x3 innergrid (aka ig) in each outercell
    - the center cell can be denoted by `cells[4,4]` or `og[1,1][1,1]`
  - each cell contains a mc-cell component
  - expose keybindings to focus different cell
- mc-cell
  - each mc-cell contains zero-to-one mr
  - expose keybindings to CUD mr
- mc-modal
  - invoked by mc-cell to create or update a mr
- mc-notifier
  - invoked by mc-modal or mc-cell to notify validation errors or undoable deletion
- mc-help-bar
  - render current keybindings as a bar
- mc-help-modal
  - render descriptive current keybindings in a toggleable modal
- mc-data-migration
  - expose two buttons: import, export

## data guide

- use localStorage to persist data after page refresh
- 

### mc-record

- (required) title
- (optional) description
- (optional) childnodes
  - a child node is also a mr
  - 8 nodes at max

## global implementation guide

- defaults to light theme with minimal styling
  - no need to implement dark mode
- modals are implemented by html5 `<dialog>`
- prefer least click event registration
  - register the event on the outer element
  - use `event.target` to dispatch the logic

### keydown event and focusable element

- use browser default behavior to implement keydown event and focusable elements
  - do not introduce homemade focus implementation
  - all keyboard shortcuts require a "focused" element to trigger
- use `:focus` to style each focused element
  - declare these styles explicitly (made it clear which elements are focusable)
  - use outline to style focused elements
- use `tabindex="0"` to define if an element is focusable
- register one click event per component, use `event.target` to dispatch the logic
- define focusable elements explicitly; prefer the least focusable elements
  - each focusable element implement a set of keydown functions
  - dedup focusable elements whenever possible
  - prefer the outer element if duplication found
  - e.g. both "mc-cell" and "mr" represent the mr => keep "mc-cell" as focusable, make "mr" non-focusable

## mc-app

is the root of the application
here's the mockup or refer to file @v6/example.html
```html
<mc-grid></mc-grid>
<mc-help-bar></mc-help-bar>
<mc-data-migration></mc-data-migration>
<mc-help-modal></mc-help-modal>
<mc-modal></mc-modal>
<mc-notifier></mc-notifier>
```

### special rendering logic

- the data structure is a tree with levels of 2 (starting from lvl0 the root)
- the center of mc-grid (i.e. `cells[4,4]` or `og[1,1][1,1]`) contains the mr which is the root of the tree
- the parent node is placed in the center of a subgrid
  - parent node are rendered and sync automatically

#### list of lvl1 nodes

here's the list of the parent node (lvl1):
- `og[1,1][0,0]` sync to `og[0,0][1,1]`
- `og[1,1][0,1]` sync to `og[0,1][1,1]`
- `og[1,1][0,2]` sync to `og[0,2][1,1]`
- `og[1,1][1,0]` sync to `og[1,0][1,1]`
- `og[1,1][1,2]` sync to `og[1,2][1,1]`
- `og[1,1][2,0]` sync to `og[2,0][1,1]`
- `og[1,1][2,1]` sync to `og[2,1][1,1]`
- `og[1,1][2,2]` sync to `og[2,2][1,1]`

#### general mr placement order

newly created mr nodes are placed in the following order
1. `ig[0,0]`
2. `ig[0,1]`
3. `ig[0,2]`
4. `ig[1,0]`
5. `ig[1,2]`
6. `ig[2,0]`
7. `ig[2,1]`
8. `ig[2,2]`

### check availability

- the root mr may contains zero to eight lvl1 nodes placed in the [aforementioned positions](#list-of-lvl1-nodes)
  - if root already contains eight lvl1 nodes, return false
- lvl1 nodes may contains zero to eight lvl2 nodes placed by [the placement order](#general-mr-placement-order)
  - if lvl1 node already contains eight lvl2 nodes, return false
- lvl2 nodes always return false in this version

### data persistence

store all the data in the localStorage

ensure there will be no data loss on page refresh

## mc-grid

### implementation guide

- use css "subgrid" feature
- each cell containing a mc-cell componenet which contains zero-to-one mr

### exposed keybindings

these are the navigation features to focus a different element
- [hit `wersdfxcv` to jump in an ig](#feature-1-navigation-inner-jump)
- [hit `WERSDFXCV` to jump in an og](#feature-2-navigation-outer-jump)
- [hit `hjkl` to walk inside the `mc-grid`](#feature-3-navigation-cell-walk)

### feature 1, navigation inner jump

users jump within the current og cell  
the og cell containing an ig which contains 9 ig cells
each lowercase letter maps to a cell of the ig

e.g.
given current focused element position `og[1,2][0,0]`
- hitting w, position not change
- hitting e, move to `og[1,2][0,1]`
- hitting r, move to `og[1,2][0,2]`
- hitting f, move to `og[1,2][1,2]`
- hitting x, move to `og[1,2][2,0]`
- etc

conclusion: change ig position; og position doesn't change

### feature 2, navigation outer jump

users jump within the current og
the og containing 3x3 og cells
each uppercase letter maps to a cell of the og

given current focused element position `og[0,0][1,2]`
- hitting W, position not change
- hitting E, move to `og[0,1][1,2]`
- hitting R, move to `og[0,2][1,2]`
- hitting F, move to `og[1,2][1,2]`
- hitting X, move to `og[2,0][1,2]`
- etc

conclusion: change og position; ig doesn't change

### feature 3, navigation cell walk

shortcut keys hjkl which change the focused elements by 9x9 `mc-cell` indices
- h move left; cells[i,--j]
- j move down; cells[++i,j]
- k move up; cells[--i,j]
- l move right; cells[i,++j]

cancel the action if out of boundary

## mc-cell

- is a focusable element
- the host is a wrapper of a mr
  - a wrapper may contains zero-to-one mr
- mr expose an editable field "title"
- focus the element to enable the following shortcuts
  - shortcut functions are defined inside the web components

### UI layout examples

case 1
- `mc-cell` (focusable)
  - empty

case 2
- `mc-cell` (focusable)
  - mr (not focusable)
    - mr title (not focusable)

### exposed keybindings

- [hit `u` to create a mr](#feature-1-creating-records)
  - call `mc-modal` to open a creation popup
  - contains a required field title
- [hit `i` to inline edit the title of the mr](#feature-2-inline-editing)
- [hit `o` to update the details of the mr](#feature-3-detail-editing)
  - call `mc-modal` to open an update popup
- [hit `<del>` to delete the mr](#feature-4-deleting-records)
  - call `mc-notifier` to generate an undo toast

### feature 1, creating records

#### case 1

if the `mc-cell` is focused and `mc-cell` doesn't contain a mr

user hit `u` to create a mr, which then, opens a creation modal popup

if create successfully, a mr is inserted into the `mc-cell`

#### case 2

if the `mc-cell` is focused and `mc-cell` already contain a mr

user hit `u` to create a childnode for the mr, which then, check the availability

if available, opens a creation modal popup; else, call `mc-notifier` to inform invalidation

if create successfully, a childnode mr is inserted into the target mr

### feature 2, inline editing

hit `i` on a focused element allows user to edit the title directly
- user may hit `<enter>` to apply the changes
- user may hit `<esc>` to discard the changes

### feature 3, detail editing

hit `o` on a focused element allowing users to open an update modal popup to edit the details of the entity
- inherit logic from creation modal; refer to [previous section](#feature-1-creating-records)
  - except that a mr update modal also list all the childnodes
  - users may drag and drop to reorder the childnodes
  - restore the focus after closing the modal

### feature 4, deleting records

#### case 1

if the `mc-cell` is focused and `mc-cell` doesn't contain a mr

user hit `<del>` => nothing happen

#### case 2

if the `mc-cell` is focused and `mc-cell` already contain a mr

user hit `<del>` to delete the mr including all the belonging childnodes

use `mc-notifier` to notify deletion with an undo button

## mc-modal

used by `mc-cell`

there are two types of modal: creation and update
here's the shared properties of a modal popup
- containing a title (required) field and a description field
- hit `<esc>` to cancel the operation, and close the modal
- hit `<enter>` to confirm the operation
  - if the title is blank or whitespace, does nothing, use `mc-notifier` to notify users for violation
  - if the title is not blank or whitespace, create the record, close the modal

### implementation guide

- implement the modal using HTML5 `<dialog>`

## mc-notifier

used by `mc-cell` and `mc-modal`

notify users for deletion and fields validation

## mc-help-bar

a succinct bar containing all the keyboard shortcuts

## mc-help-modal

using key '?' to trigger the popup

is a read-only popup without any data manipulation

## mc-data-migration

expose two buttons import and export

import:
- clear all the existing data, import data from a file input
- this function should also update the localStorage

export:
- dump the localStorage to a text file

refer to file @v6/demo1.txt for example data
parse instruction:
1. set `cells[4,4]` (or `og[1,1][1,1]`) mr's title as the file name
2. the grammar is defined by the following five tokens: `{indentation}{nodetype-token}{title}us{metadata}us{description}`
  - us stands as an unit separator: ``
  - nodetype-token: mr equals to `- `
  - title: the title of a mr
  - metadata: the metadata of a mr
  - description: the description of a mr
3. list items without indentation (zero tab character) is lvl1 items
   - place them in the subgrid inside the maincell `og[1,1]`
   - items are placed in the following order
   - lvl1-item10: `og[1,1][0,0]`; sync to `og[0,0][1,1]`
   - lvl1-item20: `og[1,1][0,1]`; sync to `og[0,1][1,1]`
   - lvl1-item30: `og[1,1][0,2]`; sync to `og[0,2][1,1]`
   - lvl1-item40: `og[1,1][1,0]`; sync to `og[1,0][1,1]`
   - lvl1-item50: `og[1,1][1,2]`; sync to `og[1,2][1,1]`
   - lvl1-item60: `og[1,1][2,0]`; sync to `og[2,0][1,1]`
   - lvl1-item70: `og[1,1][2,1]`; sync to `og[2,1][1,1]`
   - lvl1-item80: `og[1,1][2,2]`; sync to `og[2,2][1,1]`
4. list items with indentation (one tab character) are lvl2 items
   - these items are placed at the rest of the subcells of the correspond maincell
   - lvl2-item11: `og[0,0][0,0]`
   - lvl2-item12: `og[0,0][0,1]`
   - lvl2-item13: `og[0,0][0,2]`
   - lvl2-item14: `og[0,0][1,0]`
   - lvl2-item15: `og[0,0][1,2]`
   - lvl2-item16: `og[0,0][2,0]`
   - lvl2-item17: `og[0,0][2,1]`
   - lvl2-item18: `og[0,0][2,2]`
5. throw parse exception if either lvl1 or lvl2 items exceed 8 rows