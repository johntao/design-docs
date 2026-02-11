# index

this folder contains design drafts for the mandala chart app

definition of controller:
"command" (aka, cmd) is an application function that triggered by users' action (aka, act)

definition of controller/ model/ view:
define the infrastructure of the application

definition of feature:
features that build on top of multiple infra-components (cross cutting concerns)

outline:
- controller
  - act-click.md
  - act-keydown.md
  - cmd-crud.md
  - cmd-nav.md
- feature
  - task-mgmt.md
- model
  - migration.md
  - storage.md
  - structure.md
  - synchronization.md
- view
  - cell.md
  - grid.md
  - help-bar.md
  - help-modal.md
  - modal.md
  - toast.md
  - toolbar.md

## controller/act-click.md

define how the application react to users mouse click
this one isn't fully defined yet.

## controller/act-keydown.md

define how the application react to users keydown event
this one is fully implemented
use the browser built-in behavior (focus to interact)
all interactable elements are explicitly defined

## controller/cmd-crud.md

list of available CRUD commands
- u as new data entry
- i as inline edit
- o as open update modal
- DEL as delete a data entry

## controller/cmd-nav.md

list of available navigation commands
- `wersdfxcv` to jump within subgrid
- `WERSDFXCV` to jump between different subgrids
- `hjkl` to walk one unit LEFT/DOWN/UP/RIGHT
  - stop on overflow
- `HJKL` to walk three unit LEFT/DOWN/UP/RIGHT
  - stop on overflow

## feature/task-mgmt.md

introduce task status and progress calculation to the app

## data/migration.md

data export/ import functions

## data/storage.md

store as plain-text file
use customized format: `{level}{node-type}{title}␟{metadata}␟{description}`
first line is always the root node

use localStorage in the frontend

## data/structure.md

is a tree structure
props: title (required), description (optional), children

## data/synchronization.md

the grid load up tree nodes (root, lvl1, lvl2) with special logic
some of the cell share the same node

## view/cell.md

a focusable/ interactable cell

## view/grid.md

a 9x9 grid composed by nesting grid:
- 3x3 outer grid
- for each outer cell containing a 3x3 subgrid

## view/help-bar.md

display shortcut keys help text in a minimal sense

## view/help-modal.md

display shortcut keys help text in a more descriptive sense

## view/modal.md

two types of modal popup: creation and update

## view/toast.md

show on deleting a data entry or invalidating something

## view/toolbar.md

show buttons: export/ import/ dvorak emulator