# action-movement

The basic movement is `hjkl`, which moves the player one cell at a time inside the grid.
`hjkl` borrows the conventional directions from VIM: left, down, up, right.
TODO:
- movement collision table
- stage 1..5
- collectable table?

## 000:Collision

There are a few meanings of "collision" in this game.
The basic concept is that the player moves from cell A to cell B; if cell B contains another item, then the player "collides" with the item.
Let's expand on this statement further

### 010:multiple collision

If the distance between A and B is greater than 1, this indicates the movement traverses multiple cells at a time
This indicates the collision might occur multiple times during the process

### 020:teleportable movement

If the movement action is teleportable, then only the destination cell is considered collidable
i.e., all collisions between cell A and cell B are ignored

### 030:non-collidable item

It is possible to set an item as non-collidable, which means it doesn't trigger a collision event even if the collision occurs
- Collectables and obstacles are collidable
- Sigils are non-collidable
- If multiple collidable items occupy the same cell, all collision events for that cell are triggered

### 040:collision as event

Collisions are basically events defined by the engine
- When a player collides with a collectable: the player picks up the collectable
  - Remove the collectable from the screen, score + 1
- When a player collides with an obstacle: push back the player in the opposite direction from where they came
  - i.e., the player cannot step onto an obstacle

### 050:collide on boundary

If cell B is out of bounds of the current grid, it should also trigger a boundary-collision event
The default behavior of the event is to move the player to a viable cell which is closest to the boundary

### 060:A Test Case

The player moves from cell A to cell C; cell B sits between A and C.
Cell B contains an obstacle.
The movement type is teleport.
Expectation: The player should teleport to cell C without being blocked by the obstacle in cell B.

## 100:Basic Movement

Props:
- collidible: true

### 110:A Test Case

Define what happens when the player hits the boundary of a grid:
- Stay in the previous cell without moving
- Teleport to the closest grid in the same direction of the movement
  - If the player moves in the left direction and there's a grid available on the left side
  - Move the player to the right boundary of the left grid
  - e.g., new-row-index == old-row-index; new-col-index == new-cols.at(-1)

## 200:Grid Movement

A view may contain multiple grids.
A grid movement means the player teleports from grid A to grid B.

Props:
- collidible: false
- default keybindings: `<c-h> <c-j> <c-k> <c-l>`
  - `<c-h>` teleports the player to the grid in the left direction
  - If there's no grid on the left, the player stays in the current cell without moving
  - If there's a grid on the left
    - The player teleports to the cell of the left grid
    - The cell has the identical row-col index as before the teleport
    - e.g., from cur-grid(3,4) to dest-grid(3,4)

## 300:Sigil

A sigil is an item that is not collidable but is interactable with certain movement actions.

Props:
- collidable: false

### 310:Sigil Properties Reference

All foreground item properties are defined in section 500 (Visual-Foreground). See:
- items#520 for sigil/rune properties
- items#540 for obstacle properties
- items#532 for portal properties
- Collectable properties are defined inline within items#200 (Config-Gameplay)

### 320:Angle Bracket

Render angle brackets '<' and '>' directly in the cell.
This is somewhat similar to the classic VIM "word boundary" feature, except that the word boundary is now visualized and rendered as a character directly in a cell.
(On the other hand, VIM word boundary is a zero-width assertion.)
Players may use `qwer` to teleport to the existing angle brackets on the view:
- `q` teleports to the nearest left angle bracket '<' in backward direction (from n,n to 0,0)
- `w` teleports to the nearest right angle bracket '>' in backward direction (from n,n to 0,0)
- `e` teleports to the nearest left angle bracket '<' in forward direction (from 0,0 to n,n)
- `r` teleports to the nearest right angle bracket '>' in forward direction (from 0,0 to n,n)

### 330:Alphabets

Render alphabets in the cell.
This feature is similar to how normal characters work in VIM editor.
Basically, the player can use a find command followed by a character to jump to the cell.
The only difference is that in VIM, alphabets are normally rendered everywhere in a text file, and the concept of word boundary is built on top of it.
Here in the game, alphabets are rendered sparsely, and they have nothing to do with word boundaries since word boundaries are represented by angle brackets explicitly.

Players may use `f` to search for an alphabet in the forward direction (use `d` to search backward), press the key that represents the alphabet, then teleport to the cell (the first occurence of the alphabet) directly.
Note that `f` works differently comparing to the implementation in VIM, here the function search across multiple lines, whereas VIM search only in the same line.

## 400:Macro

A macro is a set of pre-defined actions allowing the player to perform multiple actions in one keystroke.
It is mostly equivalent to how macros work in VIM, except:
- The player cannot record macros by themselves
- A macro is triggered by a single keystroke instead of `@` followed by another keystroke
- There are two different ways to define a macro:
  1. Define it in the keybinding configuration menu (with limitations)
  2. By picking up powerups while playing the game

### 410:Limitations

Macros are so powerful that they should have some "limitations" to ensure they don't break the gameplay (i.e., make the game extremely easy).

For macros defined in the keybinding configuration menu:
- The configuration popup should allow the player to define a maximum of 6 basic movements in a single macro
- This limitation ensures macros remain balanced and don't trivialize the gameplay

Some possible macros:
- Move left 5 times (i.e., hhhhh)
- Move left 3 times, then down 3 times (i.e., hhhjjj)

### 420:Design Background

The first version was a dead simple configurable basic movement with a configurable multiplier.
However, after a few playthroughs, the design felt boring.
Then, I came up with the idea of moving in an L-shape similar to how knights move in chess.
As an alternative, make macros collectable powerups, which makes the macro only executable once the player picks up the powerup in-game.
Still need more evaluation to check if this is actually fun to play.

## 500:Repeater

### 510:design notes

this one is inspired by VIM `;,` to repeat the last inline command and `np` to repeat the last find command
here, I tamper the design by introducing two more concepts:
1. make the repeater adapt to any types of movement action beside basic movement (in VIM, repeater only works for inline find and search command)
2. the VIM version used register only two keystrokes and the repeater repeat both the "direction" and the movement
  - I suggest the repeater should only repeat the movement, and let the keystroke itself to determine the direction
  - the change would make the direction of a keystroke deterministic, which seems to reduce the cognitive load for the player
there are currently two proposals available

Available non-basic movements:
- Grid movement items#130
- Sigil: angle bracket items#141
- Sigil: alphabet items#142

### 520:proposal 1 (dropped)

This feature is a group of three keystrokes:
e.g., `m,<.`
Note: On a QWERTY keyboard, `,` and `<` share the same key, so this uses three keystrokes (m, ,/<, .) rather than four keys.
- Press `m` to allow the player to repeat the last used non-basic movement in backward direction (from n,n to 0,0)
- Press `,` to allow the player to repeat the last used non-basic movement in the last used direction
- Press `<` to allow the player to repeat the last used non-basic movement in the opposite of the last used direction
- Press `.` to allow the player to repeat the last used non-basic movement in forward direction (from 0,0 to n,n)

Dropped reason: indeterministic direction increase cognitive load

### 530:proposal 2 (adopted)

Alternatively, implement `nm,.` as below:
- Press `n` to allow the player to repeat the last used non-basic movement in backward direction (from n,n to 0,0)
- Press `m` to allow the player to repeat the last used non-basic movement in forward direction (from n,n to 0,0)
  - This is effectively equivalent to executing the normal command `j0*` in VIM
  - Where the player should move downward one row and set the column to zero
  - Then repeat the last used non-basic movement similar to how `*` works in VIM
  - Keep the player in the same cell if the non-basic movement fails
- Press `,` to allow the player to repeat the last used non-basic movement in backward direction (from 0,0 to n,n)
  - This is effectively equivalent to executing the normal command `k$#` in VIM
  - Where the player should move upward one row and set the column to the last
  - Then repeat the last used non-basic movement similar to how `#` works in VIM
  - Keep the player in the same cell if the non-basic movement fails
- Press `.` to allow the player to repeat the last used non-basic movement in forward direction (from 0,0 to n,n)


## 600:changing body length

This is a very special feature to let players expand or shrink their body length (by default, the body length is 1).
This is expected to change the gameplay enormously, where a player might clear a level in a short period of time.
Thus, the game engine should implement this feature with extra care.
Note that increasing the body length of the player will make the gameplay look very similar to Snake, except that:
1. There's no loss condition if the head of the player collides with their body
2. Vimkeys-game will allow the user to switch the active part of the player: head, tail, or body
  - While activating either head or tail, it means the player is in variable-length mode
    - The body length increases by 1 (capped at max length) when the player moves to a cell that is unoccupied by the body
    - The body length decreases by 1 (capped at min length) when the player moves to a cell already occupied by their own body
  - While activating body mode, it means the player is in fixed-length mode
    - The player moves their entire body at once on the view, thus it is possible to trigger multiple collision events at once in a single movement action

Methods to handle maximum player length:
- min: 1; max: 5
- The level may drop random powerups to increase the value of maximum length

Note that the player will lose some interactive functions when the body length is longer than 
- The player cannot trigger portals when body length > 1
  - Reason: To maintain game balance and prevent overly easy traversal with extended body
- The player cannot use sigil movement if body length > 1 AND activating the body part
  - i.e., sigil movement still works if the player is activating either the head or tail part
  - Reason  Maintaining sigil movement for head/tail modes makes the game more versatile and fun
  - Reason  Sigil movement requires a specific cursor position to calculate the target; while activating the body part, there's no obvious way to determine which part should be the active cursor

### 610:Keybindings Proposal 1 (dropped)

Register two keystrokes: `zx`
- `z` switches between head or tail (variable mode)
  - If the player is currently activating the body part, hitting `z` would also effectively activate the switch
  - e.g., (cur)head => z => (cur)tail
  - e.g., (cur)tail => z => (cur)head
  - e.g., (cur)tail => x => (cur)body => z => (cur)head
- `x` switches between variable or fixed mode
  - e.g., (cur)head => x => (cur)body
  - e.g., (cur)tail => x => (cur)body => x => (cur)tail

Pros and cons:
- Pros:
  - Uses fewer keystrokes
- Cons:
  - Cognitive load for the "toggling"

Should have visual difference between variable-length and fixed-length mode.
Should introduce visual marker for active head/tail part.
Should introduce visual marker for previous active head/tail part (if currently activating body part).

### 620:Keybindings Proposal 2 (dropped)

Register three keystrokes: `zxc`
- `z` switches to head part (variable mode)
- `x` switches to body part (fixed mode)
- `c` switches to tail part (variable mode)

Pros and cons:
- Pros:
  - Less "toggling" cognitive load
- Cons:
  - Requires more keystrokes
  - Still has cognitive load if the player loses track of the location of the head and tail

Should have visual difference between variable-length and fixed-length mode.
Should introduce distinctive visual difference for head and tail parts.

### 630:Keybindings Proposal 3

Register three keystrokes: `zxc`
- `z` switches to tail part (variable mode); trigger `z` would also trigger a basic movement `h`
- `x` switches to body part (fixed mode)
- `c` switches to head part (variable mode); trigger `c` would also trigger a basic movement `l`

This version aims to comply to the first design principle
Thus, only 'x' action would violate the first desgin principle which is permitted for the better gaming experience

Additionally, this implementation mark head/ tail as end/ start of the grid cells
i.e. the body part that is closest to cell 0,0 is considered as tail; the body part that is closest to cell n,n is considered as head
This change would eliminate the problem where the player might swap head/ tail part potentially

Pros and cons:
- Pros:
  - Less "toggling" cognitive load
- Cons:
  - Requires more keystrokes


## 700:game mode specific

### 710:shared

implement these features:
- [collision](#000collision)
- [basic movement](#100basic-movement)
- [grid movement](#200grid-movement)
- [sigil](#300sigil)
- [macro](#400macro)
- [repeater](#500repeater)

### 720:picker

inherit all stuff from [shared](#710shared)

### 730:score-booster

inherit all stuff from [shared](#710shared)

### 740:filler

inherit all stuff from [shared](#710shared)

### 750:snake

inherit all stuff from [shared](#710shared)

implement [changing body length](#700changing-body-length)

## 800:appendix-candidates

- marker command
- Ggg0^$

### 810:Pattern Movement

A pattern move is something similar to how `#*(){}[]%` works in VIM:
- The player may teleport to the next symbol under the cursor using `#*`
- The player may teleport to the next sentence using `()`
- The player may teleport to the next paragraph using `{}`
- The player may teleport to the next section using `[]`
- The player may teleport to the next pair construct using `%`

However, I think this movement over-complicates the gameplay.
We should keep this in the backlog without actually implementing it.

#### 811:More Patterns

It is possible to define more patterns by introducing LSP and AST.
Again, it would over-complicate the gameplay to introduce these features.

## 900:appendix-dropped-ideas

### 910:Search

**Reason for dropping:** Would slow down game pace and violates the first design principle.

VIM provides an extraordinary search function. However, a full-fledged search function would slow down the game pace. Also, it disobeys the first design principle where a search function requires an extra enter key to activate. For now, the find alphabet command from items#142 is good enough.

### 920:Scrolling

**Reason for dropping:** Not applicable to fixed-view gameplay.

VIM users are mostly dealing with files that overflow the current viewport. However, this is not the case for vimkeys-game. Thus, there's no need to implement scrolling features as long as the game doesn't overflow the grids.
