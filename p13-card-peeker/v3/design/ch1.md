# UI overview

Layout: (left:mid:right) panel; width ratio (1:5:1)
Use light theme instead of dark theme

## left panel

store and manage typeA entities

## mid panel

in the mid panel there's a tab bar on the top

below the top bar is the canvas

### top tab bar

store and manage typeB entities

switch tab to load typeB details onto the canvas

### canvas

store and manage typeB entity details
- typeB have details of typeB1 and typeB2

a typeB entity may contains multiple typeB entities in a hierarchical structure
- users drag-drop typeB entity onto the canvas to create the hierarchy
- the root of the hierarchy is the pinned typeB entity
- each node in the hierarchy is also stand as a typeB1 entity
  - typeB is the parent record of typeB1 entity
  - deleting a typeB entity with children is not allowed
  - deleting a typeB1 entity doesn't affect typeB

a typeB1 entity may stores multiple typeC entities
- users drag-drop typeC entity onto a typeB1 entity to create many-to-many relations
  - the relation also stands as typeB2 entity
- deleting a typeC also delete all the typeB2 entities
- deleting a typeB1 also delete all the typeB2 entities

## right panel

store and manage typeC entity