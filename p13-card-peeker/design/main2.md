I want to create an app.
here's the spec

## UI

split the screen into two horizontal sections
left one is the main section
right one is the side panel
let the width ratio between left and right set to 7:3

## UI: Left Panel

the left panel also stands as the main canvas which is responsible for rendering cards

these cards are "top-down" cards

canvas are bound to a path, the default path is the root

switching the path would trigger a re-render and also load the cards of the path onto the canvas

top-down cards following star topology

here's the example data for the left panel:

```txt
user-type/dev
user-type/user
user-type/org
dev-type/generic
dev-type/support
dev-type/core
income-type/fast
income-type/slow_shiny
income-type/slow_relic
```

given the above data:
- each line represent a record for a top-down card
- each record contains a single field which stands as title
- a title may contains zero-to-many slashes which stands as namespace separator

left panel should render three graphs in star topology based on the data
each node (vertex) is a "top-down" card
edges are defined by parsing the title of each record
if a namespace is presented, then, the base segment of the namespace is treated as the center node in the star topology

expected result:
- the first graph render 'user-type' in the center surrounding by 'user', 'dev' and 'org'
- the second graph render 'dev-type' in the center surrounding by 'generic', 'support' and 'core'
- the third graph render 'income-type' in the center surrounding by 'fast', 'slow_shiny' and 'slow_relic'

## UI: Right Panel

the right panel stands as a functional tabbed panel

the default tab is "card library" where users can drag-n-drop bottom-up cards into the main canvas

one tab is enough for now, we'll introduce new tabs in the future

here's the example data for the right panel:

```txt
blog-post30
web-blog4
web-scrap3
game-snake2
vscode-ext1
bx-tool4
```

given the above data:
- each line represent a record for a bottom-up card
- each record contains a single field which stands as title

right panel should render all bottom-up cards based on the data

expected result:
- a list of bottom-up cards, users identify a card by its title

## Feature: Drag-n-drop

### action 1

users drag items from the right panel, then, drop it on a top-down card in the left panel

constraints:
- cannot drop cards on a level 1 top-down cards
  - level 1 means the center (parent) node of a star topology
  - e.g. user-type, dev-type, income-type
- cannot drop multiple times in the same star graph
  - you can drop a bottom-up card in multiple graphs, however, one drop per graph

if succeed:
- a smaller card (bottom-up card) is nested inside the parent node (i.e. the top-down card you dropped)
  - users may remove it later by double-click the nested card
- store the title of the top-down card you dropped into the bottom-up card in the right panel
  - e.g. drop "blog-post30" at "income-type/slow_relic"; then, add "tags: income-type/slow_relic" to "blog-post30" in the right panel
  - e.g. drop "vscode-ext1" at "income-type/slow_shiny", "dev-type/support", "user-type/dev";
    - then, add "tags: income-type/slow_relic, dev-type/support, user-type/dev" to "vscode-ext1" in the right panel

### action 2

users drag nested cards in the left panel, then, drop it on a top-down card in the left panel

action 2 is almost identical to action 1, except that the previous state is removed after a successful drop

constraints:
- inherit all the constraints from action 1, plus, action 2 should be smart enough to move around the nested card in-between the same graph

if succeed:
- inherit all the behaviors from action 1, plus, previous state is removed
  - in the left panel, the previous nested card is removed
  - in the right panel, the previous tags value is removed

### todo

- drop at background
- define data flow

## Feature: Inspection

### Inspect Bottom-up Cards

users click on a bottom-up card will open a popup in the middle of the screen displaying the content of the card
- applies to both nested bottom-up cards and cards in the right panel

three fields are included in the popup: title, tags, and content
- title: editable text box
- tags: non-editable
- content: editable textarea

form control:
- data save are trigger immediately in an onchange event

to leave a popup:
- press ESC
- click the backdrop area of the popup
- click the top-right "cross sign" on the popup

### todo

- inspect by hover
- define ellipsis
- Inspect Top-Down Cards
- top-down cards editable

## Future

- multiple levels