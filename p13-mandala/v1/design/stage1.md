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
- each record contains a single field which is the title of the card
- a title may contains zero-to-many slashes which is a namespace separator

left panel should render three graphs in star topology based on the given data
each node (vertex) is a "top-down" card
if a namespace is presented, then, the base segment of the namespace is treated as the center node in a star topology

expected result:
- the first graph render 'user-type' in the center surrounding by 'user', 'dev' and 'org'
- the second graph render 'dev-type' in the center surrounding by 'generic', 'support' and 'core'
- the third graph render 'income-type' in the center surrounding by 'fast', 'slow_shiny' and 'slow_relic'

### data flow

- top-down cards are read-only
- on page load, read through the pre-defined data, then render all top-down cards

### rendernig logic

render the star topology in a simple grid

this would make the result looks very similar to mandala chart except the graph allows surrounding nodes to exceed over 8 items

refer the following text:
```txt
2 2 2 2 2
2 1 1 1 2
2 1 0 1 2
2 1 1 1 2
2 2 2 2 2
```
- 0: denotes the center of the star
- 1: denotes the first ring around the star
- 2: denotes the second ring around the star
  - items render in the second ring when all the seats in the first ring are unavailable

## UI: Right Panel

the right panel stands as a functional tabbed panel (only one tab is available for now)

the default tab is "card library" where users can drag-n-drop bottom-up cards into the main canvas

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
- each record contains a single field which is the title of the card

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

data/ visual flow:
- drag card1 from right panel
- drop card1 on cardA in the left panel
- right panel: the card1 now appear "tags: cardA" below the title
- left panel: nest card1 inside the cardA

### action 2

users drag nested cards in the left panel, then, drop it on another top-down card in the left panel

action 2 is almost identical to action 1, except that the previous state is removed after a successful drop

constraints:
- inherit all the constraints from action 1, plus, action 2 should be smart enough to move around the nested card in-between the same graph

if succeed:
- inherit all the behaviors from action 1, plus, previous state is removed
  - in the left panel, the previous nested card is removed
  - in the right panel, the previous tags value is removed

data/ visual flow: (assume cardA and cardB are in the same graph)
- drag card1 from left panel
- drop card1 on cardB in the left panel
- right panel:
  - "tags: cardA" is removed from card1
  - "tags: cardB" is inserted into card1
- left panel:
  - remove nested card1 from cardA
  - insert nested card1 into cardB

### action 3

users drag nested cards in the left panel, then, drop it in the background of left panel

then it is equivalent to double-click on a nested card (the card is removed)

data/ visual flow: (assume cardA and cardB are in the same graph)
- drag card1 from left panel
- drop card1 on the background of left panel
- right panel: "tags: cardA" is removed from card1
- left panel: remove nested card1 from cardA

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