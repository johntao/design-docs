# design book

the vimkeys-game
this game is a combination of VIM keybindings and Snake-like game

the basic gameplay:
the player use VIM keybindings to move in a grid-like map
the game scatter collectables at fixed (or random) positions across the map
if a timer is used, the game ends when the timer hit zero
else, the game ends when the last collectable is picked up

what makes this game unique and fun:
the game contains rich movement actions and gameplay options
the player can configure all the keybindings and gameplay as their wish
the goal is to let the players to learn what keybindings and gameplay works the best for themselves

the major components of this game:

- 100: action-movement
- 200: config-gameplay (picker mode)
  - keywords: picker, filler, timer, remain-counter, win-loss-condition
- 300: config-keybinding
  - keywords: keybinding
- 400: visual-background
  - keywords: map, grid, view
- 500: visual-foreground
  - keywords: item, player, collectable, sigil, obstacle, portal
  - quick definition: foreground is items rendered in a cell
  - to-be-defined: type and max amount of items that can be rendered in the same cell
- 600: visual-hud
  - keywords: score board, configuration modal
- 700: config-gameplay (filler mode)

keywords and definitions:
- item => anything render inside a cell is an item (visual foreground)
- cell => the smallest unit of the visual background
- collectable or droppable => an item that is cleared once the player step onto it
  - player gain score whenever clear out a collectable
- picker or pickup mode => player move inside the map and pick up all the collectables
  - win the game once all the collectables were cleared
- filler or fill-up mode => the player move inside the map; player movement will leave tracks on the map
  - win the game once the track of the movement matches to the given pattern of the level
  - there will be a threshold for each level, player win the game once the "match ratio" pass the threshold
- view or map => the entire area that is visible and actionable to the player
  - a view may contains one or many grids at a time
  - there should have margins between two different grids
- grid => a grid is consisted by N*M cells
- cell => the smallest unit of a visual element where the player may step into
  - a cell may contains one to many ASCII printable characters
  - a character may represent collectable items
  - a character may represent sigils with special functions
  - a character may represent hyperlinks
  - a character may represent obstacles (player cannot step onto an obstacle)
- hyperlink => link to a cell of the current view
  - link to another view

p.s. filler mode is not including in this spec document

## design principle

- this should be a fast-pace gameplay
  - i.e. every keystroke should impact the game progress at some degree
  - thus, the gameplay should eliminate non-movement actions if possible
  - e.g. do not make the player tap space to pick up an item
  - do not make the player tap something to enter a portal
- randomize purposely
  - random-generate level and fixed level should be designed differently
  - some of the features works the best with random-generated level, and some does not
  - even though it is possible to maximize the "configurable" part of the gameplay
  - the game should still treat these config options wisely if it doesn't make sense in the first place
- an obvious shortcut doesn't improve the gameplay experience
  - do not introduce an universally well-rounded functions to the player
  - SPAMming an obvious same strategy to beat every levels will significantly decrease the gaming experience
  - e.g. a "go back" shortcut that allow the player to navigate back to previous map anytime and anywhere

## tech stack

- standalone html/ css/ js
- zero framework and library

## 100: action-movement

the basic movement is `hjkl` which moves the player one cell at a time inside the grid
`hjkl` borrow the conventional direction from VIM: left, down, up, right

### 110: collision

there are a few meaning of "collision" in this game
the basic concept is that player move from cell A to cell B, if cell B contains other item, then, the player "collides" onto the item
let's expand this statement further:
- 111: if the distance of A and B is greater than 1, which indicate the movement moves multiple cells at a time
  - which indicate the collision might occur multiple times during the process
- 112: a movement action might be teleportable
  - if the movement action is teleportable, then, only the destination cell is considered collidable
  - i.e. all collision in-between cell A and cell B are ignored
- 113: it is possible to set an item non-collidable, which means it doesn't trigger a collide event even if the collision happened
  - player is always considered collidable
  - collectable, obstacle are collidable
  - sigil is non-collidable
- 114: collisions are basically an event defined by the engine
  - when a player collide on a collectable: the player pick up the collectable
    - remove the collectable from the screen, score + 1
  - when a player collide on an obstacle: push back the player to the opposite direction where the player came from
    - i.e. player cannot step onto an obstacle
- 115: if cell B is out of the boundary of the current grid, it should also trigger a boundary-collision event
  - the default behavior is to move the player to the boundary (a viable cell) of the grid

#### an example

player move from cell A to cell C, cell B sit in-between A and C
cell B contains an obstacle
the movement type is teleport
expectation: player should teleport to cell C without blocking by the obstacle in cell B

### 120: basic movement

props:
- collidible: true

#### an example

define when the player hit the boundary of a grid:
- stay in the previous cell without moving
- teleport to the cloest grid in the same direction of the movement
  - if the player move in the left direction and there's a grid available in the left side
  - move the player to the right boundary of the left grid
  - e.g. new-row-index == old-row-index; new-col-index == new-cols.at(-1)

### 130: grid movement

a map may contains multiple grids
a grid movement means the player teleport from grid A to grid B

props
- collidible: false
- default keybindings `<c-h> <c-j> <c-k> <c-l>`
  - `<c-h>` teleport the player to the grid in the left-direction
  - if there's no grid in the left, the player stay in the current cell without moving
  - if there's a grid in the left
    - the player teleport to the cell of the left grid
    - the cell having the identical row-col index before the teleport
    - e.g. from cur-grid(3,4) to dest-grid(3,4)

### 140: sigil

a sigil is an item that is not collidable, but it is interactable with certain movement actions

props
- collidable: false

#### TBD

need to find a place to define all the properties of foreground items: sigils and collectables and powerups

#### 141: ankle bracket

render ankle bracket '<' and '>' directly in the cell
this is somehow similar to the classic VIM "word boundary" feature except that the word boundary is now visualized and rendered as a character directly in a cell
(in the other hand, VIM word boundary is a zero-width assertion)
players may use `qwer` to teleport to the existing ankle brackets on the map
- e teleport to the nearest left ankle bracket '<' in forward direction (from 0,0 to n,n)
- r teleport to the nearest right ankle bracket '>' in forward direction (from 0,0 to n,n)
- w teleport to the nearest left ankle bracket '<' in backward direction (from n,n to 0,0)
- q teleport to the nearest right ankle bracket '>' in backward direction (from n,n to 0,0)

#### 142: alphabets

render alphabets in the cell
this feature is similar to how normal characters work in VIM editor
basically, the player can use a find command follow by a character to jump to the cell
the only difference is that in VIM, alphabets noramlly rendered everywhere in a text file, and the concept of word boundary is built on top of it
here in the game, alphabets rendered sparsely, and it has nothing to do with the word boundary since word boundary are represented by ankle brackets explicitly

players may use `f` to search an alphabet, press the key that represent the alphabet, then teleport to the cell directly

### 150: macro

a macro is a set of pre-defined actions allowing the player to do multiple actions in one keystroke
it is mostly equivalent to how macros work in VIM except:
- player cannot record macros by themselves
- macro is triggered by a single keystroke instead of `@` followed by another keystroke
- there are two different ways to define a macro
  1. define it in the keybinding configuration menu (with limitation)
  2. on picking up powerups while playing the game

#### TBD

macro is so powerful that it should have some "limitation"-make sure that macro will not break the gameplay (i.e. make the game extremely easy)
name a few possible macros:
- move left 5 times (i.e. hhhhh)
- move left 3 times, then, down 3 times (i.e. hhhjjj)

#### design background

the first version was a dead simple configurable basic movement with a configurable multiplier
however, after a few gameplays the design was boring
then, I came up with the idea to of moving in L-shape similar to how knights move in chess
and alternative, make macro a collectable powerup, which makes the macro only executable once the player picking up the powerup in-game
still, need more evaluation to check if this is actually fun to play

### 160: pattern movement

a pattern move is something similar to how `#*(){}[]%` works in VIM:
- player may teleport to the next symbol under the cursor using `#*`
- player may teleport to the next sentence using `()`
- player may teleport to the next paragraph using `{}`
- player may teleport to the next section using `[]`
- player may teleport to the next pair constructs using `%`
however, I think this movement over-complicate the gameplay
we should keep this in the backlog without actually implementing it

#### more patterns

it is possible to define more patterns by introducing LSP and AST
again, it would over-complicate the gameplay to introduce these features

### 170: repeater

this feature is a group of three keys
e.g. `m,<.`
- press `m` allow player to repeat the last used non-basic movement in backward direction (from n,n to 0,0)
- press `,` allow player to repeat the last used non-basic movement in the last used direction
- press `<` allow player to repeat the last used non-basic movement in the opposite of the last used direction
- press `.` allow player to repeat the last used non-basic movement in forward direction (from 0,0 to n,n)

#### 171: sub-movement modal mode

alternative, implement `nm,.` as below:
- press `n` allow player to repeat the last used non-basic movement in backward direction (from n,n to 0,0)
- press `m` allow player to repeat the last used non-basic movement in forward direction (from n,n to 0,0)
  - this is effectively equivalent to executing normal command `j0*` in VIM
  - where the player should move downward one row, and set the column to zero
  - then, repeat the last used non-basic movement similar to how `*` works in VIM
  - keep the player in the same cell if the non-basic movement failed
- press `,` allow player to repeat the last used non-basic movement in backward direction (from 0,0 to n,n)
  - this is effectively equivalent to executing normal command `k$#` in VIM
  - where the player should move upward one row, and set the column to the last
  - then, repeat the last used non-basic movement similar to how `#` works in VIM
  - keep the player in the same cell if the non-basic movement failed
- press `.` allow player to repeat the last used non-basic movement in forward direction (from 0,0 to n,n)

possible non-basic movement
- grid movement
- sigil: ankle bracket
- sigil: alphabet

### 180: expand/ shrink the body

this is a very special feature to let players expand or shrink their body length (by default, the length of the body is 1)
this is expected to change the gameplay enormously where a player might clear out a level in a short period of time
thus, the game engine should implement this feature with extra care
note that increasing the body length of the player will make the gameplay looks very similar to the Snake, except that:
1. there's no loss condition if the head of the player collide onto his body
2. vimkeys-game will allow user to switch the active part of the player: head, tail, body
  - while activating either head or tail, it means the player is in the variable-length mode.
    - the body length increase by 1 (capped at max. length) if the player stepping on cells that doesn't contains the body
    - the body length decrease by 1 (capped at min. length) if the player stepping on cells containing its body
  - while activating body mode, it means the player is in the fixed-length mode
    - the player moves its entire body at once on the map, thus it is possible to trigger multiple collision event at once in a single movement action
methods to handle maximum player length:
- min: 1; max: 5
- the level may drop random powerup to increase the value of maximum length

note that: the player will lose some interactive functions when the body length is longer than 1
- player cannot trigger portal
- player cannot use sigil movement if body length > 1 AND activating the body part
  - i.e. sigil movement still works if the player is activating either head or tail part

#### 181: keybindings proposal 1

register two keystroke `zx`
- 'z' switch between head or tail (variable-mode)
  - if the player is currently activating body part, hitting 'z' would also effectively activate the switch
  - e.g. (cur)head => z => (cur)tail
  - e.g. (cur)tail => z => (cur)head
  - e.g. (cur)tail => x => (cur)body => z => (cur)head
- 'x' switch between variable or fixed mode
  - e.g. (cur)head => x => (cur)body
  - e.g. (cur)tail => x => (cur)body => x => (cur)tail
pros and cons:
- pros
  - use less keystrokes
- cons
  - cognitive load for the "toggling"
should have visual difference beween variable-length and fixed-length mode
should introduce visual marker for active head/ tail part
should introduce visual marker for previous active head/ tail part (if currently activating body part)

#### 182: keybindings proposal 2

register two keystroke `zxc`
- 'z' switch to head part (variable mode)
- 'x' switch to body part (fixed mode)
- 'c' switch to tail part (variable mode)
pros and cons:
- pros
  - less "toggling" cognitive load
- cons
  - require more keystrokes
  - still have cognitive load if the player lose track on the location of the head and tail
should have visual difference beween variable-length and fixed-length mode
should introduce distinctive visual difference for head and tail part

### dropped feature: search

VIM provide extraordinary search function
however, I suspect a full-fledged search function would slow-down the game pace
also, it disobey the first design principle where a search function require an extra enter key to activate
for now, the find alphabet command from item#142 is good enough

### dropped feature: scrolling

VIM users are mostly dealing with files that overflow the current viewport
however, it is not the case of vimkeys-game
thus, there's no need to implement scrolling features as long as the game doesn't overflow the grids

## 200: config-gameplay (picker mode)

picker (or pick-up) mode is the basic game mode where the game drop collectables at random or fixed position on the map

sub-mode 1 (fixed collectable, variable time):
render all collectables at once on game start
the game ends once all the collectables are picked up, the score is determined by how fast the player end the game (less time spent the better)

sub-mode 2 (fixed time, variable collectable):
render collectables dynamically along with the game progress (the render amount is capped at max_display)
the game ends once the timer ends, the score is determined by how many collectables the player picked

### TBD

gameplay of filler mode (refer to items#700)

### implementation proposal 1

data:
- `int? timer` timer (defaults to null, which means sub-mode 1)
  - set to a non-nullable integer will also set remain_counter to null
  - set to 10 will create a 10-second timer (which means sub-mode 2)
    - game ends once the timer hits zero second
  - generate collectables dynamically along with the game progress
  - newly generated positions will be added to prev_positions automatically
  - use max_display to determine how many collectables to be shown at a time
- `int? max_display` determine the maximum amount of collectables to be shown at a time (defaults to null)
  - set to null if remain_counter is non-null
  - null value means render all remaining collectables at once
  - defaults to 9 if timer is non-null
- `int? remain_counter` numbers of collectables to be spawned (defaults to 9)
  - set to a non-nullable integer will also set timer to null
  - set to 10 will create a 10 remain_counter
    - game ends once the counter hits zero
  - if remain_counter gt positions.Count, the game should generate new collectables at random positions automatically until the counter hit zero
    - newly generated positions should added back to prev_positions
- `List<(int, int)> prev_positions` previous collectable positions (defaults to xxx)
- `bool` replace the previous positions i.e. randomly spawn (defaults to false)
  - reuse the previous positions if set to false

### 210: window-pickup

the game display all the collectables at a time by default
this feature implement a config to restrict the maximum displaying collectables to a value (e.g. max 5 at a time)

### 220: speed-based

speed-based endgame condition means who end the games earlier scores better
=> in other words, fixed amount of collectable scores AND a variable timer

### 230: score-based

the players try to gain as many scores as possible in a fixed amount of time

#### 231: score boost

this feature works with score-based scoring mode
implement a few rules allowing players to get extra scores while meeting the conditions
here are a few possible score-boost-rules
note that all these rules should be configurable

#### 232: combo streak

a combo streak state: refresh the state if the player pick up a collectable within 4 steps

i.e. if the player make 5 steps without picking up a collectable, the player will lost the combo steak

the player will gain extra scores picking up an collectable while maintaining the streak

e.g. get one more score if surpass x2 combo; get two more score if surpass x5 combo; get three more scores if surpass x9 combo; capped extra scores at three

#### 233: decremental counter

make every new-spawned collectables an extra score of 5, then, reduce the extra score each time the player move
this mode synergize well with feature#xxx

#### 234: ordered collectables

mark all the collectables with an ordinal sequence

player gain extra score while picking up collectables in the correct order

this mode also maintain a combo streak, lose extra score if the streak break

the extra score grows arithmetically (e.g. +1 +2 +3...)

#### 235: expiration

randomly drops time-sensitive collectables
this one is similar to item#233 except that the collectable disappear automatically if the counter run below 1
make sure it is configurable

### 240: game version

the game provide settings for user to configure their keybindings or gameplay

the game should provide saving slots for users to store their settings

note that saving slots should manage keybinding and gameplay settings separately

## 300: config-keybinding

all keybinding should be configurable
keybindings are basically actions to trigger a movement
thus, they should defined in this section item#100

## 400: visual-background

### 410: maps

the current gameplay only render a single grid map at a time

the player move around inside the grid exclusively via these keybindings: hjkl

I would like to expand the idea further to render multiple grids at a time

players could choose either "hjkl" to move around different grids once touch the boundaries between each grids

also, the game should introduce new keybindings to make the player teleport between each grids using one keystroke

#### examples

given 9 grids on the screen at a time in a 3x3 layout

player is positioned on the top-left grid (0,0)

player pressing HJKL (capitalized) would expect the following results:
- H => nothing happened
- J => move to the downside grid (1,0)
- K => nothing happened
- L => move to the rightside grid (0,1)

## 500: visual-foreground

### 510: fog of war

the current gameplay display the whole map entirely

this item would implement a feature to make the player only discover droppables in a small area which is the sight vision of the player

make sure the raidus of the sight vision is configurable

make sure both filler and picker mode implement fog of war properly

#### design notes

this config works the best in random-generated level (timer + score-based mode)
the reason is that playing a static level in speed-based mode
the game should eliminate the noise in the gameplay such that the player could explore the pure speed easily

### 520: sigil/ rune

I would like to spread a few random printable ASCII characters across the map
first, render these printable characters into different cells
then, attach different functions based on these characters
NO need to implement all the features at this moment, we will leave these features to the next phase
possible features:
- sigils consumable
  - consumed once the player step onto it
  - consumed sigils might be respawned based on certain rules or not
  - consumed sigils might give the player extra scores or super power
- sigils non-consumable
  - players might have special movement to teleport to nearby sigils based on certain rules
  - give users temporarily power once step onto it or not

### 530: deep link

I would like to introduce the concept of hyperlinks into the game
two proposoals available:

#### design notes

originally, I was trying to make links identical to how anchors work in a browser
thus, it would require the player to hit some key to trigger the link
however, this design contradict to the first design principle where the game should eliminate non-movement actions if possible
similarily, a keystroke to bring player back to previous map like how "go back" works in a browser also disobey the third design principle

#### 531: hyperlink-like

an HTML anchor where the player use a keystroke to enter and then teleport to somewhere else on the map
1. teleport to another grid cells in the current view of map
  - similar to how an anchor linking to an element on the same page via `href="#id-of-an-elem"`
2. teleport to another view
  - similar to how an anchor link to another page
  - player may use keystroke to navigate back to the previous view
  - or, player may use another anchor link (if presented) to navigate back to the previous view
default keybinding to enter a link: 't'

#### 532: portal-like

a pair of portals that teleports the player on collision
=> the pair of portals may sit inside the same view or different views

### 540: obstacle

the player cannot step onto a cell that contains an obstacle

the game engine should not render an obstacle and a collectable in a same cell at the same time

## 600: visual-hud

something about score and configuration modal popup

### 610: score board

while in-game: displaying current score
while !in-game: displaying previous game score, best score of all time

### 620: modal popup

two simple buttons, the first configure gameplay, the second configure keybindings
should also place saving slots somewhere on the screen, and make sure the player may click to apply the configuration

## 700: config-gameplay (filler mode)

filler (or fill-up) mode is a special gameplay mode extended from the base gameplay of vimkeys-game (extended from picker-mode)

this document review all the features inherited from the base gameplay, which then, explicitly include or exclude each feature

plus, adding new features introduced by the filler mode

filler mode is an alternative game mode with following features:
- render differently:
  - player now left track color
  - picked up collectable will change the background color of the cell
- extra pick-up rules:
  - now all collectables have a pre-defined condition, the player must meet the condition, then the collectable can be picked up
  - e.g. collectable may have condition "red", then, the player must pick up a "red color" first, then, the player may pick up red collectables
    - colors are special collectable where it doesn't give extra score, and it will keep respawning in a few steps (configurable)
all the levels in filler mode are pre-defined, thus, there's no score-based gameplay. the only endgame condition is to clear the level in fewer seconds

### exclusion

- filler mode should disable items#180
  - the reason is that filler mode introduec more collectable interaction
  - allowing player to extend body-length will make the game over-complicate
- all maps are static-generated, doesn't support random-generated maps
  - thus, there will be no score-based gameplay available
  - only speed-based gameplay is available
- no need to implement items#510
  - the reason is that fog of war works the best with random-generated maps
  - no need to handicap players for speed-based mode

### implementation proposal 1

data:
- `int remain_counter` counting down the amount of collectables to pick to win the game
- `List<Level> levels` define a list of levels
  - player can choose which level to play
  - each level should have its own score-board
- Level Props:
  - `string name` name of the level
  - `List<(int, int, Color)> colors` colors respawning position, and the color attach to it
  - `List<(int, int, Color)> collectables` collectables spawning position, and the color condition to pick up

### dropped feature: explicit fill-up command

originally, I tried to let the player hit space to fill-up a cell
additionally, I also want to make the player feels as if they were actually filling up the glyph provided by the level

thus, I make the player filling the tracks for visited cells
this would make the screen looks messy if the player visited every cells
then, I introduced hitting the "space" to toggle the filling tracks behavior

however, at this point I've already found out the fact that:
- both making player explicitly hitting space to fill-up a cell
- and hitting space to let the player toggling filling up visited cells
- violating the first design principle because it make players hitting extra spaces to complete the game

besides the space issue, I also introduce a concept of threshold:
- the player cannot beat the level if there were too many unrelated cells colored
- thus, if player clear all the collectables, they still need to un-color cells that was colored by visited cells behavior

the threshold feature also feels tedious after a few gameplay

### dropped feature: stroke width

a feature to fill in multiple cells at once, it can be done by implementing items#180
however, it would overcomplicate the gameplay, so just drop it

### dropped feature: stroke depth

a feature to make different levels of the filling colors
it happened when a collectable appeared twice in the same cell
after the second fill-up the color should be brighter or darker
however, filler mode render all collectables on starting the game, respawning collectables introduce unnecessary complexity to the game without actually improving the gaming experience

### the final design

each collectable now comes with a condition to match (e.g. color)
the player can pick up a color item to match the condition

a color item is respawn automatically after the player move a few steps, which ensure the player can always beat the level
pick up a new color item would replace the previous color directly

coloring visited cells is still a viable option, however, it should provide only visual feedback without changing the gameplay