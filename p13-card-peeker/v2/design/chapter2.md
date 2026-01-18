# function details

this doc would define the essential functions to use the app properly

a function is composed by three parts:
- an interactable object
- an user-input
- an app-command

i.e., a function is an interactable object, taking input from an user that triggers an application command

here are the possible user-input:
- mouse input
  1. mouse left click drag drop
  2. mouse left click
  3. mouse left double click
- mouse x keyboard input
  1. hold ctrl + mouse left click drag drop
  2. hold ctrl + mouse left click
  3. hold ctrl + mouse left double click
  4. hold shift + mouse left click drag drop
  5. hold shift + mouse left click
  6. hold shift + mouse left double click
- keyboard input
  1.  hit `<space>`
  2.  hit `<enter>`
  3.  hit `<delete>`

this document go through each UI section:
1. describe the UI components
2. list interactable objects
3. define available functions

## shared design logic

- mouse left click would focus the target element (if available)
  - a focused element is highlighted by high-constrast colorful borders
  - keyboard input only works on a focused element
- not every UI elements are draggable
  - even if an element is draggable, it should be focused first to enable dragging
  - the mouse cursor changes its appearance on a draggable element
  - there are three types of cursor: grab (defaults), copy (hold ctrl), move (hold shift)
- all deletion fires a toast containing an undo button for a duration of 5 seconds
- name confliction check
  - if conflicts, then, the newly cloned entities suffix its title with an underscore
  - name check is fired by clone items or nodes hierarchical changes
- node hierarchical changes
  - e.g. from #animal/dog/shiba to #shiba
  - from #animal/dog to #mammal/dog

### common app-command

- focus
- inspect (open modal popup)
- clone
- move
- reorder
- delete
- creation
- toggle between expand and collapse (enter or leave)

## the left panel

UI:
- a list of tags
- an "add button" on the top of the list

interactable objects:
- each tag
- the "add button"

### tag

- mouse left double click (creation)
  - insert the tag into the canvas
    - place it at the center subcell of the first maincell
    - push all the occupied maincell back by one cell unit
  - display an indicator if the tag is already added in the canvas
  - if the tag is already existed in the canvas, then, nothing happened
- mouse left click (focus)
  - focus the tag
- hit `<delete>` on a focused tag (delete)
  - the tag is deleted
- hit `<space>` on a focused tag (inspect)
  - trigger a inspect function that opens a modal popup displaying information of the tag
  - fields are editable, users may save to apply the changes
- hold ctrl + mouse left click drag drop (clone)
  - clone the tag

### add button

- mouse left click (inspect)
  - open a modal popup
  - user may save to create a new tag

## the right panel

UI:
- a list of notes
- an "add button" on the top of the list

interactable objects:
- each note
- the "add button"

### note

- mouse left double click (creation)
  - insert the note into the focused tag
  - if no tags were focused, nothing happen
  - if the note is already added to the tag, nothing happen
  - place it at the first position
  - push the rest of the notes back by one unit
- mouse left click (focus)
  - focus the note
- hit `<delete>` on a focused note (delete)
  - the note is deleted
- hit `<space>` on a focused note (inspect)
  - trigger a inspect function that opens a modal popup displaying information of the note
  - fields are editable, users may save to apply the changes
- hold ctrl + mouse left click drag drop (clone)
  - clone the note

### add button

- mouse left click (inspect)
  - open a modal popup
  - user may save to create a new note

## the middle canvas

UI:
- a tab bar showing domains by tabs
- an "add button" on the left of the tabs
- the main canvas below the tab bar
- inside the canvas is a 3x3 maingrid, each cell stands as maincell
- inside the maincell is a 3x3 subgrid, each cell stands as subcell
- you can place a tag in a subcell (one tag per subcell)
- inside the tag there's a note container in the bottom
  - the container display 9 notes at max
  - the notes are placed in a 3x3 layout

interactable objects:
- the domain tab (draggable)
- the "add button"
- the maincell inside the canvas
- the subcell inside a maincell
- the tag inside the subcell
- the note inside the tag

### the domain tab

1. mouse left click drag drop (reorder)
   - reorder the domains, require prior focus
2. mouse left click (focus)
   - focus the tab
4. hold ctrl + mouse left click drag drop (clone)
   - clone the domain
5.  hit `<space>` on a focused domain (inspect)
  - trigger a inspect function that opens a modal popup displaying information of the domain
  - fields are editable, users may save to apply the changes
6.  hit `<enter>` on a focused domain  (toggle)
  - switch to the focused domain
  - refresh the canvas
7.  hit `<delete>` on a focused domain (delete)
  - the domain is deleted

### the "add button"

1. mouse left click (inspect)
  - open a modal popup
  - user may save to create a new domain

### maincell (occupied)

- mouse left click (focus)
  - focus the maincell
- mouse left click drag drop (reorder)
  - reorder the maincell, require prior focus
- hit `<space>` on a focused maincell (inspect)
  - inspect the tag at the center of the subgrid of the current focused maingrid
- hit `<enter>` on a focused maincell (toggle)
  - toggle the tag at the center of the subgrid of the current focused maingrid
  - if the tag doesn't have children tags, then, nothing happen
- hit `<delete>` on a focused maincell
  - remove tags from the focused maincell
  - the rest of the occupied maincell are push forward by one cell unit

### subcell (occupied)

- mouse left click (focus)
  - focus the subcell
- mouse left click drag drop (reorder)
  - reorder the sibling tags in a hierarchy, require prior focus
  - if the center subcell is focused, nothing happen
- hold ctrl + mouse left click drag drop (clone)
  - clone the tag, add it to another hierarchy, require prior focus
  - if the center subcell is focused, nothing happen
  - if drop at an empty maincell, then, a new tag is created
    - the ancestors of the tag are removed
    - run name check
  - if drop at an occupied maincell, then, a new tag is created
    - change the tag's hierarchy by the occupied one
    - run name check
- hold shift + mouse left click drag drop (move)
  - change the hierarchy of the tag, require prior focus
  - if the center subcell is focused, nothing happen
  - if drop at an empty maincell, then
    - the ancestors of the tag are removed
    - run name check
  - if drop at an occupied maincell, then
    - change the tag's hierarchy by the occupied one
    - run name check
- hit `<space>` on a focused subcell (inspect)
  - inspect the tag inside the subcell
- hit `<enter>` on a focused subcell (toggle)
  - toggle the tag inside the subcell
  - if the tag doesn't have children tags, then, nothing happen
- hit `<delete>` on a focused subcell
  - if the subcell is at the center of the subgrid, then, the deletion is identical to delete a focused maincell
  - if the subcell is NOT at the center of the subgrid, then, remove tag from the focused subcell
    - i.e. the subcell is containing a tag that is a child node in a hierarchy
  - the rest of the occupied subcell are push forward by one cell unit
  - the tag is updated where the ancestors of the tag are removed
    - run name check
  - the deletion only remove the hierarchy relation, it doesn't delete the actual tag and existing tag-note mappings

### the note inside the tag

- mouse left click (focus)
  - focus the subcell
- mouse left click drag drop (reorder)
  - reorder the sibling tags in a hierarchy, require prior focus
  - if the center subcell is focused, nothing happen
- hold ctrl + mouse left click drag drop (clone)
  - clone the tag, add it to another hierarchy, require prior focus
  - if the center subcell is focused, nothing happen
  - if drop at an empty maincell, then, a new tag is created
    - the ancestors of the tag are removed
    - run name check
  - if drop at an occupied maincell, then, a new tag is created
    - change the tag's hierarchy by the occupied one
    - run name check
- hold shift + mouse left click drag drop (move)
  - change the hierarchy of the tag, require prior focus
  - if the center subcell is focused, nothing happen
  - if drop at an empty maincell, then
    - the ancestors of the tag are removed
    - run name check
  - if drop at an occupied maincell, then
    - change the tag's hierarchy by the occupied one
    - run name check
- hit `<space>` on a focused subcell (inspect)
  - inspect the tag inside the subcell
- hit `<enter>` on a focused subcell (toggle)
  - toggle the tag inside the subcell
  - if the tag doesn't have children tags, then, nothing happen
- hit `<delete>` on a focused subcell
  - if the subcell is at the center of the subgrid, then, the deletion is identical to delete a focused maincell
  - if the subcell is NOT at the center of the subgrid, then, remove tag from the focused subcell
    - i.e. the subcell is containing a tag that is a child node in a hierarchy
  - the rest of the occupied subcell are push forward by one cell unit
  - the tag is updated where the ancestors of the tag are removed
    - run name check
  - the deletion only remove the hierarchy relation, it doesn't delete the actual tag and existing tag-note mappings


### domain and tab bar

a tab bar at the top of the canvas, displaying numbers 1, 2, 3, 4, 5

users may switch between different domain by clicking the numbers

show all the tags of the selected domain (defaults to the first domain)

### interaction with left panel

users may drag and drop tags from the left panel to the canvas
- drop onto the canvas would insert tag into the domain
- users may also remove an unwanted tag from the canvas (which doesn't delete the actual tag)
- users may drag to reorder the tag on the canvas

### tags constraint

- a same tag may not appear multiple times in the same domain
  - however, it is possible to have different tags with the same hierarchy appear in the same domain
- the hierarchy depth is capped at 3
  - e.g. this is valid #animal/dog/husky; this is invalid #animal/dog/shiba/black

### canvas rendering

canvas is a 3x3 grid (aka maingrid), additional cells (aka maincell) are ignore (i.e. 10+ maincells are ignored)

each maincell may contains a tag dropped from the left panel

users may click to activate a maincell or using keyboard shortcuts to activate it
- by default the first maincell is activated (i.e. `maingrid[0,0]`)
- uppercase `WER` activate the three maincells of the first row
- uppercase `SDF` activate the three maincells of the second row
- uppercase `XCV` activate the three maincells of the third row

### maincell rendering

a maincell is also a 3x3 grid (aka subgrid), additional cells (aka subcell) are ignore (i.e. 10+ subcells are ignored)

if a tag is presented, it is rendered in the center of the subgrid (i.e. `subgrid[1,1]`)

a tag and a subcell is 1-to-1 relation

users may click to activate a subcell or using keyboard shortcuts to activate it
- by default the center subcell is activated (i.e. `subgrid[1,1]`)
- shortcut only activate subcells inside the currently activated maincell
- lowercase `wer` activate the three subcells of the first row
- lowercase `sdf` activate the three subcells of the second row
- lowercase `xcv` activate the three subcells of the third row

if a tag contains children, then the children are expanded to the surrounding subcells automatically  
e.g.  
given tag #animal which contains children tag #animal/dog and #animal/cat  
#animal is placed in the middle `subgrid[1,1]`  
#animal/dog is placed in the first cell of the first row `subgrid[0,0]`  
#animal/cat is placed in the second cell of the first row `subgrid[0,1]`

noted that the tag hierarchy auto-expansion trigger automatically, it cannot be disabled or collapsed

### subcell interaction

users may click on an activated subcell or using keyboard shortcuts to navigate the additional hierarchy if available  
use lowercase q to enter/ leave one level depth of the hierarchy

#### example 1

given tag #animal/dog/shiba and #animal is placed at `maingrid[0,0]`
- #animal is rendered at `subgrid[1,1]`
- #animal/dog is auto-expanded at `subgrid[0,0]`
- `maingrid[0,0]` and `subgrid[0,0]` are activated

user hit the letter `q`
- #animal/dog is rendered at `subgrid[1,1]`
- #animal/dog/shiba is auto-expanded at `subgrid[0,0]`
- `maingrid[0,0]` and `subgrid[1,1]` are activated

user hit the letter `q`, again
- #animal is rendered at `subgrid[1,1]`
- #animal/dog is auto-expanded at `subgrid[0,0]`
- `maingrid[0,0]` and `subgrid[0,0]` are activated

#### example 2

given tag #animal/dog/shiba and #animal/dog is placed at `maingrid[0,0]`
- #animal/dog is rendered at `subgrid[1,1]`
- #animal/dog/shiba is auto-expanded at `subgrid[0,0]`
- `maingrid[0,0]` and `subgrid[0,0]` are activated

user hit the letter `q`
- nothing happened, since there's no additional hierarchy availble for #animal/dog/shiba

user hit the letter `d` to activate `subgrid[1,1]`  
user hit the letter `q`, again
- nothing happened, since the user place and "root" #animal/dog at `maingrid[0,0]`
- the application doesn't allow navigate up if the hierarchy is rooted in the first place
- this constraint would allow users to put different tags of a same hierarchy in the same canvas

### interaction with right panel

users may drag and drop notes from the right panel to the canvas
- drop onto the canvas would insert note into the activated tag
- drop onto a tag would insert note into it directly
- users may remove an unwanted note from the tag (which doesn't delete the actual note)
- users may drag to reorder the notes in a tag