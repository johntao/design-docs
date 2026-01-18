# UX

## define HMI actions

- mouse
  - click
  - double click
  - click & drag
- keyboard
  - plain shortcuts
  - hold ctrl 1
  - hold shift 2
  - hold alt 3
  - hold 12 23 13 123
- state
  - navigation
  - inspect
  - create
  - delete
  - update

## define possible functions



### left panel

- create new tag
  - click "add" button
- inspect/ update a tag
  - click tag
  - open a modal popup (update)
- delete a tag
  - double click tag
- clone a tag
  - ctrl drag drop
- insert into canvas
  - drag drop

### right panel

- create new note
  - click "add" button
- inspect/ update a note
  - click note
  - open a modal popup (update)
- delete a note
  - double click note
- clone a note
  - ctrl drag drop
- insert into canvas
  - drag drop

### mid canvas

- double click
  - cut a tag or note
- click
  - activate a tag or note
- hold ctrl + click
  - paste a tag or note
- toggle a tag (required activation)
  - use enter to toggle
- inspect a tag or note (require activation)
  - use space to inspect
- reorder (require activation and state)
  - drag drop maincell (one-to-many tags) within domain
  - drag drop subcell (one tag) within maincell (you cannot drag the center subcell)
  - drag drop note (one tag) within subcell
- move
  - drag drop subcell to differnet maincell
    - change the parent of a tag
  - drag drop note to different subcell
    - change the parent of a note
- move (clone), hold ctrl
  - drag drop subcell to differnet maincell
    - change the parent of a tag
  - drag drop note to different subcell
    - change the parent of a note

#### next version

- iterate (move left)
  - within domain: hide the first maincell in the last position, move the rest of the maincell one unit left
  - within maincell: hide the first subcell in the last position, move the rest of the subcell one unit left
  - within subcell: hide the first note in the last position, move the rest of the note one unit left
- iterate (move right)
  - within domain: show the last maincell in the first position, move the rest of the maincell one unit right
  - within maincell: show the last subcell in the first position, move the rest of the subcell one unit right
  - within subcell: show the last note in the first position, move the rest of the note one unit right

combine shortcut with activation

## keyboard shortcuts

definition
- jump: the destination is always the same
- walk: the destination depends on previous position
- cursor: highlight an element, may be left in the background, also known as an object of an action
- focus: highlight the panel, the current working foreground, also known as an subject of an action

move cursor without moving focus: layer jump
q: maincell
a: subcell
z: note

move cursor without moving focus: grid jump
wer
sdf
xcv

move cursor without moving focus: grid jump alt (alternate between maincell and subcell)
WER
SDF
XCV

move cursor without moving focus: walk left/ down/ up/ right
hjkl
hl have no effect in left/ right panel

move focus without moving cursor: walk left/ down/ up/ right
HJKL

move focus without moving cursor: jump left/ mid/ right
UIO

switch domain without moving focus
12345

inspect a tag or note (require focus and cursor)
`<space>`

toggle a tag (require focus and cursor)
`<enter>`

cut/ delete a maincell, tag, note (require focus and cursor)
y

paste a maincell, tag, note (require focus and cursor)
u

iterate a maincell, tag, note (require focus and cursor)
i

rev-iterate a maincell, tag, note (require focus and cursor)
o