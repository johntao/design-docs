# action-move

The basic move is `hjkl`, which moves the player one cell at a time inside the grid.
`hjkl` borrows the conventional directions from VIM: left, down, up, right.

## Collision

There are a few meanings of "collision" in this game.
The basic concept is that the player moves from cell A to cell B; if cell B contains another item, then the player "collides" with the item.
Let's expand this statement further

### multiple collision

If the distance between A and B is greater than 1, this indicates the move traverses multiple cells at a time
This indicates the collision might occur multiple times during the process

### collidable move

If the move action is non-collidable (ignore collision in-between the destination and the origin), then only the destination cell is considered collidable

here's the table to illustrate if an action is teleport
| action             | player  | command | collidable |
| ------------------ | ------- | ------- | ---------- |
| basic move         | active  | hjkl    | o          |
| sigil move         | active  | asdf    | x          |
| grid move          | active  | HJKL    | x          |
| portal             | passive |         | x          |
| swap head and tail | passive |         | x          |
| Body-driven move   | passive |         | o          |

### non-collidable item

It is possible to set an item as non-collidable, which means it doesn't trigger a collision event even if the collision occurs
- Collectables and obstacles are collidable
- Sigils are non-collidable
- If multiple collidable items occupy the same cell, all collision events for that cell are triggered

### collision as event

Collisions are basically events defined by the engine
- When a player collides with a coin: the player picks up the coin
  - Remove the coin from the screen, score + 1
- When a player collides with an obstacle: push back the player in the opposite direction from where they came
  - i.e., the player cannot step onto an obstacle

### collide on boundary

If cell B is out of bounds of the current grid, it should also trigger a boundary-collision event
The default behavior of the event is to move the player to a viable cell which is closest to the boundary

### Case Study

The player moves from cell A to cell C; cell B sits between A and C.
Cell B contains an obstacle.
The move type is teleport.
Expectation: The player should teleport to cell C without being blocked by the obstacle in cell B.

## Basic move

basic move are cached and repeatable by some command
cache defaults to left basic move if null

### Case Study

Define what happens when the player hits the boundary of a grid:
- Stay in the previous cell without moving
- Teleport to the closest grid in the same direction of the move
  - If the player moves in the left direction and there's a grid available on the left side
  - Move the player to the right boundary of the left grid
  - e.g., new-row-index == old-row-index; new-col-index == new-cols.at(-1)

## Grid move

A view may contain multiple grids.
A grid move means the player teleports from grid A to grid B.

Props:
- default keybindings: `HJKL` (capitalized letters)
  - `H` teleports the player to the grid in the left direction
  - If there's no grid on the left, the player stays in the current cell without moving
  - If there's a grid on the left
    - The player teleports to the cell of the left grid
    - The cell has the identical row-col index as before the teleport
    - e.g., from cur-grid(3,4) to dest-grid(3,4)

## Sigil

A sigil is an item that is not collidable but is interactable with certain move actions.

### Sigil Properties Reference

All foreground item (sigil, obstacle, portal, coins) properties are defined in [Visual Foreground](./6-visual-foreground.md)

### Alphabets

Render alphabets in the cell.
This feature is similar to how word motion and `f` motion works in VIM.
Basically, the player hit an alphabet keystroke, then teleport to the nearest correspond sigil.

Difference:
- no need to hit `f` before hitting the target alphabet
  - you just hit `q` to teleport to the next (forward) alphabet q; hit `Q` to teleport to the previous (backward) alphabet q
  - forward means from 0,0 to n,n
  - backward means from n,n to 0,0
- VIM normally open a text file containing dozens of alphabet, here the sigil are rendered with limited amount
- there's no word wrap concept in this game, since most of the sigils are scattered randomly in the view, instead of continuos literature
- the sigil move jump across multiple lines, instead of one line

Similarity:
- one keystroke to teleport is similar to how word motions work in VIM

Extra notes:
- the sigil move doesn't stop on the last occurrence of the direction
  - i.e. given 4 "q" sigils, and the player is standing at the last "q", hitting `q` would bring the player to the first "q"
- the default keystroke of sigil moves are `asdf`
  - i.e. the game only render these alphabet sigils

## snake feature set

picking up a coin let the player increase the body length by one just like the classic snake game

the part that is reacting to player's actions is the head; the rest of the part is body; the last bit of the body is the tail part

body length
- case 1
  - (head)
- case 2
  - (head, tail)
- case 3
  - (head, body, tail)
- case 4
  - (head, body, body, tail)

there's a special behavior call detachment where the head detach from the body
there are several methods to cause a detachment
if detached, the player's body length is set to one, and the body part is left behind

thus, body part connecting to the player is call attached body part; body part that is left behind is call detached body part

the player can reattach to its body by hitting onto the detached body part, an attach event is fired
default attach event:
- attach
- swap
- get one score

in the other hand, if the player hit onto the attached body part, an attack event is fired
default attack event:
- swap
- body length reduce by one

### swap head and tail

both attach event and attack event cause the player to swap its head and tail position

if attach to a detached body part, then the current head position is swap with the previous tail position of the detached body part

if attack to a attached body part, then, the current head position is swap with the current tail position, then, the body length is reduced by one

### rigid mode

this is a special mode when the player pick up a special powerup
normally, the body part is dragged by the head part, where only the head part react to player's action
in this mode, the whole body part including the head react to player's action (i.e. whole body driven)
thus, the player may trigger multiple collision events at once

extra notes for body-driven mode:
- picking up a coin doesn't increase body length
- hitting a detached body part doesn't reattach
  - instead, you get score equals to the length of the detached part
- the head position is marked before entering the rigid mode
  - the sigil move works by using the part marked as head
- grid movement is available
- hitting portals or obstacles would cause a "split"
  - the player lose body-driven mode after the split
  - the body part that hitting onto the portals or obstacles are vanished
  - the player restore head-driven mode via an algorithm
    - select the longest segments after the split
    - select randomly if multiple longest segments presented
    - restore the head to the randomly end of the segment
    - if all body parts vanished after the split, then, respawn to a random position before the split

### detach

in normal mode, the player is detached if the head hit onto portals or activating sigil moves

the body is left behind while the head teleport to the new position accordingly

extra note:
- no extra score given

in rigid mode, the player is detached by colliding onto portals or obstacles, this behavior is known as split where the body part splitting into multiple parts and the part hitting onto the items vanished

### attach

in normal mode, the player is attached if the head hitting onto detached body parts

extra note:
- the head is then teleport to the tail position of the detached parts
- give one score

in rigid mode, there's no attachment for hitting detached body parts, it simply give extra scores

### attack

in normal mode, the player is attacked if the head hitting onto attached body parts

extra note:
- the head is then teleport to the tail position of the detached parts
- the body length is reduced by one

in rigid mode, it is impossible to hit onto attached body parts

### increase body length

in normal mode, the player's body length is increased by one for picking up a coin

### decrease body length

in normal mode, the player's body length is decreased by one for attacking its body

in rigid mode, the player's body length is decreased by hitting onto portals and obstacles (i.e. a split event)
