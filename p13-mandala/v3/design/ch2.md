# UI interaction

UI interaction is composed by three parts:
- an interactable object
- an user-input
- an app function

## shared design logic

- focusable
  - mouse left click would focus the target element
  - not every UI element is focusable
  - a focused element is highlighted by high-constrast colorful borders
  - keyboard input only works on a focused element
  - left panel, mid canvas and right panel keep the previous focused element
    - thus, there will be at max three focused elements in the same time
    - one current focus + two previous focused elements
    - the previous focused element is required for some operations
- draggable
  - hold mouse left click on an element to start dragging
  - not every UI element is draggable
  - even if an element is draggable, it should be focused first to enable dragging
  - the mouse cursor changes its appearance on a draggable element
  - there are three types of cursor: grab (defaults), copy (hold ctrl), move (hold shift)

### function overview

| fn           | required focus | user-input              | desc                                                    | applies to      |
| ------------ | -------------- | ----------------------- | ------------------------------------------------------- | --------------- |
| focus        |                | mouse left click        |                                                         | A, B, B1, B2, C |
| inspect      | yes            | hit `<space>`           | open a update modal popup                               | A, B, B1, B2, C |
| delete       | yes            | hit `<delete>`          | fires a toast containing an undo button for 5 seconds   | A, B, B1, B2, C |
| nav-into     | yes            | hit `<enter>`           | navigate into B1, view the children nodes               | B1              |
| nav-up       | yes            | hit `<backspace>`       | go back to parent node                                  | B1              |
| load-details | yes            | hit `<enter>`           | load details into canvas                                | B               |
| insert       | yes            | hit `<enter>`           | insert into the previous focused position in the canvas | A, C            |
| insert       |                | mouse double left click | insert into the previous focused position in the canvas | A, C            |
| reorder      |                | drag and drop           |                                                         | B1, B2          |
| open-modal   |                | mouse left click        | open a modal popup                                      | A, B, C         |

### shared modal function

| fn       | user-input       | desc                                     | applies to             |
| -------- | ---------------- | ---------------------------------------- | ---------------------- |
| creation | mouse left click | run duplication check; create the entity | creation modal         |
| update   | mouse left click | run duplication check; update the entity | update modal           |
| cancel   | mouse left click | cancel operation                         | creation/ update modal |
| cancel   | hit `<esc>`      | cancel operation                         | creation/ update modal |

- duplication check
  - if found, then, notify the user and cancel the operation

## left panel

UI elements & fnuctions:
- a list of typeA entities
  - focus, inspect, delete, insert
- an "add button" on the top of the list
  - open-modal (a creation modal popup for typeA entity)

Remarks for "insert":
- viable insertion position: maincell, subcell
- create a typeB1 entity at the position
  - if the target position is a maincell, then, typeB1 is generated at `subgrid[1,1]`
- if canvas focused on a subcell previously, then
  - check duplication, if found, cancel the operation
  - insert into the position of the subcell
  - push back the rest of the occupied subcells by one cell unit
- if canvas focused on a maincell previously, then
  - check duplication, if found, cancel the operation
  - insert into the position of the maincell
  - push back the rest of the occupied maincells by one cell unit
- if no available previous focused position presented, then, insert into `maingrid[0,0]`
  - check duplication, if found, cancel the operation
  - push back the rest of the occupied maincells by one cell unit

## mid panel

### top tab bar

UI elements & fnuctions:
- a list of typeB entities
  - focus, inspect, delete, load-details
- an "add button" on the left of the list
  - open-modal (a creation modal popup for typeB entity)

Remarks for "delete":
- in addition to toast, also prompt confirm to delete

### canvas

UI elements & fnuctions:
- composed by maingrid and subgrid
- the outer grid stands as maingrid which is composed by 3x3 maincell
- each maincell contains a subgrid
- a subgrid is composed by 3x3 subcell
- each subcell 0-to-one typeB1 entity
  - typeB1 functions: focus, inspect, nav-into, nav-up, delete, reorder, move/cut, clone
- each typeB1 entity contains 0-to-many typeB2 entities
  - typeB2 functions: focus, inspect, delete, reorder, move/cut, clone

Remarks for 3x3:
- 10+ items are ignored

Remarks for typeB1 rendering:
- descendants of typeB1 are always expanded in the same maincell
- the parent typeB1 is placed in the center of the subgrid (i.e. `subgrid[1,1]`)
- children typeB1 are expanded automatically around the center of the subgrid

Remarks for "nav-into":
- if the target typeB1 is expandable, then, replace the center parent typeB1 by the target typeB1
  - replace the surrounding subcells by the children of the target typeB1
Remarks for "nav-up":
- if the centered typeB1 "xxx" has a parent "yyy", then, replace the center xxx by yyy
  - replace the surrounding subcells by the siblings of xxx
Remarks for "reorder":
- users may drag and drop to reorder occupied maincell, occupied subcell and typeB2 entities
- while dragging, change the cursor to "grab"
Remarks for "clone":
Remarks for "move/cut":


## right panel

UI elements & fnuctions:
- a list of typeC entities
  - focus, inspect, delete
- an "add button" on the top of the list
  - open-modal (a creation modal popup for typeC entity)

Remarks for "insert":
- viable insertion position: occupied maincell, occupied subcell
- create a typeB2 at the target typeB1
- if no available previously focused position presented, then, cancel the operation
- check duplication, if found, cancel the operation
- if previously focused on a maincell, then, this function works on the center subcell of the maincell
- if previously focused on a subcell, then, this function works on subcell directly