# UI overview

three major parts of the UI

- left panel: manage tags
- mid canvas: group of tags
  - at the top of the canvas, there should be a thin bar displaying numbers 1 2 3 4 5
  - users click on these number to switch between different domain
- right panel: manage notes

the width ratio defaults to 1:4:1 (left:mid:right)

## the left panel

shows all the available tags

users may create/ update/ delete tags in this panel

## the right panel

shows all the available notes

users may create/ update/ delete notes in this panel

## the middle canvas

this section expose functional overview without covering the behavioral details

### domain and tab bar

a tab bar at the top of the canvas, displaying numbers 1, 2, 3, 4, 5

users may switch between different domain by clicking the numbers

show all the tags of the selected domain (defaults to the first domain)

### interaction with tags and left panel

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

even though only one tag is allowed dropping from the left panel

it is possible to render multiple tags in a maincell via auto-expansion

### maincell rendering

a maincell is also a 3x3 grid (aka subgrid), additional celdo not use characters that looks alikels (aka subcell) are ignore (i.e. 10+ subcells are ignored)

if a tag is presented, it is rendered in the center of the subgrid (i.e. `subgrid[1,1]`)

a tag and a subcell is 1-to-1 relation

#### auto-expansion

if a tag contains children, then the children are expanded to the surrounding subcells automatically

e.g.  
given tag #animal which contains children tag #animal/dog and #animal/cat  
#animal is placed in the middle `subgrid[1,1]`  
#animal/dog is placed in the first cell of the first row `subgrid[0,0]`  
#animal/cat is placed in the second cell of the first row `subgrid[0,1]`

noted that the first layer of children auto-expands and cannot be collapsed; deeper layers (grandchildren) are collapsed by default and can be toggled by the user

### interaction with notes and right panel

users may drag and drop notes from the right panel to the canvas
- drop onto a tag would insert note into it directly
- users may remove an unwanted note from the tag (which doesn't delete the actual note)
- users may drag to reorder the notes in a tag

### subcell rendering

a subcell is a flexible layout exposing partial info of a tag

in the bottom of the layout is a container for notes illustrating how many notes are currently using this tag

each note is rendered as a colorful dot which contains a printable character
- the colorful dot is generated dynamically per domain
  - the color should be a high contrast color
  - use these 6 colors evenly: 8931EF, F2CA19, FF00BD, 0057E9, 87E911, E11845
- the printable character should be unique per domain
  - use a preset of ~100 characters
  - exclude characters that look alike
- thus, the dot is treated as an identifier in the current domain to represent a note
- in the right panel, the same dot 
- the dots are rendered in a 3x3 layout, hence, the displaying notes are capped at 9