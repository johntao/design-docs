# Design Document

## The Vimkeys Game
This game is a combination of VIM keybindings and Snake-like gameplay.

### The Basic Gameplay:
The player uses VIM keybindings to move in a grid-like map.
The game scatters collectables at fixed (or random) positions across the view.
If a timer is used, the game ends when the timer hits zero.
Otherwise, the game ends when the last collectable is picked up.

### What Makes This Game Unique and Fun:
The game contains rich movement actions and gameplay options.
The player can configure all the keybindings and gameplay as they wish.
The goal is to let players learn what keybindings and gameplay work best for themselves.

### The Major Components of This Game:

- 100: action-movement
- 200: config-gameplay (picker mode)
  - keywords: picker, filler, timer, remain-counter, win-loss-condition
- 300: config-keybinding
  - keywords: keybinding
- 400: visual-background
  - keywords: map, grid, view
- 500: visual-foreground
  - keywords: item, player, collectable, sigil, obstacle, portal
  - quick definition: foreground refers to items rendered in a cell
  - to-be-defined: type and maximum amount of items that can be rendered in the same cell
- 600: visual-hud
  - keywords: score board, configuration modal
- 700: config-gameplay (filler mode)

### Keywords and Definitions:
- **item** => anything rendered inside a cell is an item (visual foreground)
  - e.g. collectable items, sigils with special functions
    - hyperlinks, portals, obstacles (the player cannot step onto an obstacle)
- **cell** => the smallest unit of the visual background
  - The player may step onto a cell unless it contains an obstacle
  - A cell may contain one to many ASCII printable characters as items
  - Note: If a cell contains an obstacle, it cannot contain any other items
- **collectable or droppable** => an item that is cleared once the player steps onto it
  - The player gains score whenever they clear a collectable
- **picker or pickup mode** => the player moves inside the view and picks up all the collectables
  - Win the game once all the collectables are cleared
- **filler or fill-up mode** => the player moves inside the view; player movement leaves tracks on the view
  - Win the game once the track of the movement matches the given pattern of the level
  - There is a threshold for each level; the player wins the game once the "match ratio" passes the threshold
- **view** => the entire area that is visible and actionable to the player
  - A view may contain one or many grids at a time
  - There should be margins between two different grids
- **grid** => a grid consists of N×M cells
  
- **hyperlink** => links to a cell of the current view
  - Or links to another view


## Design Principles

- **This should be fast-paced gameplay**
  - i.e., every keystroke should impact the game progress to some degree
  - Thus, the gameplay should eliminate non-movement actions if possible
  - e.g., do not make the player tap space to pick up an item
    - Do not make the player tap something to enter a portal
- **Randomize purposefully**
  - Randomly generated levels and fixed levels should be designed differently
  - Some features work best with randomly generated levels, and some do not
  - Even though it is possible to maximize the "configurable" part of the gameplay
  - The game should still treat these config options wisely if they don't make sense in the first place
- **An obvious shortcut doesn't improve the gameplay experience**
  - Do not introduce universally well-rounded functions to the player
  - Spamming the same obvious strategy to beat every level will significantly decrease the gaming experience
  - e.g., a "go back" shortcut that allows the player to navigate back to the previous view anytime and anywhere

## Tech Stack

- Standalone HTML/CSS/JS
- Zero frameworks and libraries

## 100: Action-Movement

The basic movement is `hjkl`, which moves the player one cell at a time inside the grid.
`hjkl` borrows the conventional directions from VIM: left, down, up, right.

### 110: Collision

There are a few meanings of "collision" in this game.
The basic concept is that the player moves from cell A to cell B; if cell B contains another item, then the player "collides" with the item.
Let's expand on this statement:
- **111**: If the distance between A and B is greater than 1, this indicates the movement traverses multiple cells at a time
  - This indicates the collision might occur multiple times during the process
- **112**: A movement action might be teleportable
  - If the movement action is teleportable, then only the destination cell is considered collidable
  - i.e., all collisions between cell A and cell B are ignored
- **113**: It is possible to set an item as non-collidable, which means it doesn't trigger a collision event even if the collision occurs
  - Collectables and obstacles are collidable
  - Sigils are non-collidable
  - If multiple collidable items occupy the same cell, all collision events for that cell are triggered
- **114**: Collisions are basically events defined by the engine
  - When a player collides with a collectable: the player picks up the collectable
    - Remove the collectable from the screen, score + 1
  - When a player collides with an obstacle: push back the player in the opposite direction from where they came
    - i.e., the player cannot step onto an obstacle
- **115**: If cell B is out of bounds of the current grid, it should also trigger a boundary-collision event
  - The default behavior is to move the player to the boundary (a viable cell) of the grid

#### Edge Case

The player moves from cell A to cell C; cell B sits between A and C.
Cell B contains an obstacle.
The movement type is teleport.
Expectation: The player should teleport to cell C without being blocked by the obstacle in cell B.

### 120: Basic Movement

Props:
- collidible: true

#### Edge Case

Define what happens when the player hits the boundary of a grid:
- Stay in the previous cell without moving
- Teleport to the closest grid in the same direction of the movement
  - If the player moves in the left direction and there's a grid available on the left side
  - Move the player to the right boundary of the left grid
  - e.g., new-row-index == old-row-index; new-col-index == new-cols.at(-1)

### 130: Grid Movement

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

### 140: Sigil

A sigil is an item that is not collidable but is interactable with certain movement actions.

Props:
- collidable: false

#### TBD

Need to find a place to define all the properties of foreground items: sigils, collectables, and powerups.

#### 141: Angle Bracket

Render angle brackets '<' and '>' directly in the cell.
This is somewhat similar to the classic VIM "word boundary" feature, except that the word boundary is now visualized and rendered as a character directly in a cell.
(On the other hand, VIM word boundary is a zero-width assertion.)
Players may use `qwer` to teleport to the existing angle brackets on the view:
- `e` teleports to the nearest left angle bracket '<' in forward direction (from 0,0 to n,n)
- `r` teleports to the nearest right angle bracket '>' in forward direction (from 0,0 to n,n)
- `w` teleports to the nearest left angle bracket '<' in backward direction (from n,n to 0,0)
- `q` teleports to the nearest right angle bracket '>' in backward direction (from n,n to 0,0)

#### 142: Alphabets

Render alphabets in the cell.
This feature is similar to how normal characters work in VIM editor.
Basically, the player can use a find command followed by a character to jump to the cell.
The only difference is that in VIM, alphabets are normally rendered everywhere in a text file, and the concept of word boundary is built on top of it.
Here in the game, alphabets are rendered sparsely, and they have nothing to do with word boundaries since word boundaries are represented by angle brackets explicitly.

Players may use `f` to search for an alphabet, press the key that represents the alphabet, then teleport to the cell directly.

### 150: Macro

A macro is a set of pre-defined actions allowing the player to perform multiple actions in one keystroke.
It is mostly equivalent to how macros work in VIM, except:
- The player cannot record macros by themselves
- A macro is triggered by a single keystroke instead of `@` followed by another keystroke
- There are two different ways to define a macro:
  1. Define it in the keybinding configuration menu (with limitations)
  2. By picking up powerups while playing the game

#### Limitations

Macros are so powerful that they should have some "limitations" to ensure they don't break the gameplay (i.e., make the game extremely easy).

For macros defined in the keybinding configuration menu:
- The configuration popup should allow the player to define a maximum of 6 basic movements in a single macro
- This limitation ensures macros remain balanced and don't trivialize the gameplay

Some possible macros:
- Move left 5 times (i.e., hhhhh)
- Move left 3 times, then down 3 times (i.e., hhhjjj)

#### Design Background

The first version was a dead simple configurable basic movement with a configurable multiplier.
However, after a few playthroughs, the design felt boring.
Then, I came up with the idea of moving in an L-shape similar to how knights move in chess.
As an alternative, make macros collectable powerups, which makes the macro only executable once the player picks up the powerup in-game.
Still need more evaluation to check if this is actually fun to play.

### 160: Pattern Movement

A pattern move is something similar to how `#*(){}[]%` works in VIM:
- The player may teleport to the next symbol under the cursor using `#*`
- The player may teleport to the next sentence using `()`
- The player may teleport to the next paragraph using `{}`
- The player may teleport to the next section using `[]`
- The player may teleport to the next pair construct using `%`

However, I think this movement over-complicates the gameplay.
We should keep this in the backlog without actually implementing it.

#### More Patterns

It is possible to define more patterns by introducing LSP and AST.
Again, it would over-complicate the gameplay to introduce these features.

### 170: Repeater

This feature is a group of three keystrokes:
e.g., `m,<.`
Note: On a QWERTY keyboard, `,` and `<` share the same key, so this uses three keystrokes (m, ,/<, .) rather than four keys.
- Press `m` to allow the player to repeat the last used non-basic movement in backward direction (from n,n to 0,0)
- Press `,` to allow the player to repeat the last used non-basic movement in the last used direction
- Press `<` to allow the player to repeat the last used non-basic movement in the opposite of the last used direction
- Press `.` to allow the player to repeat the last used non-basic movement in forward direction (from 0,0 to n,n)

#### 171: Sub-movement Modal Mode

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

Possible non-basic movements:
- Grid movement
- Sigil: angle bracket
- Sigil: alphabet

### 180: Expand/Shrink the Body

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

Note that the player will lose some interactive functions when the body length is longer than 1:
- The player cannot trigger portals when body length > 1
  - Reason: To maintain game balance and prevent overly easy traversal with extended body
- The player cannot use sigil movement if body length > 1 AND activating the body part
  - i.e., sigil movement still works if the player is activating either the head or tail part
  - Reason 1: Maintaining sigil movement for head/tail modes makes the game more versatile and fun
  - Reason 2: Sigil movement requires a specific cursor position to calculate the target; while activating the body part, there's no obvious way to determine which part should be the active cursor

#### 181: Keybindings Proposal 1

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

#### 182: Keybindings Proposal 2

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

### Dropped Feature: Search

VIM provides an extraordinary search function.
However, I suspect a full-fledged search function would slow down the game pace.
Also, it disobeys the first design principle where a search function requires an extra enter key to activate.
For now, the find alphabet command from items#142 is good enough.

### Dropped Feature: Scrolling

VIM users are mostly dealing with files that overflow the current viewport.
However, this is not the case for vimkeys-game.
Thus, there's no need to implement scrolling features as long as the game doesn't overflow the grids.

## 200: Config-Gameplay (Picker Mode)

Picker (or pick-up) mode is the basic game mode where the game drops collectables at random or fixed positions on the view.

**Sub-mode 1 (fixed collectable, variable time):**
Render all collectables at once on game start.
The game ends once all the collectables are picked up; the score is determined by how fast the player ends the game (less time spent is better).

**Sub-mode 2 (fixed time, variable collectable):**
Render collectables dynamically along with the game progress (the render amount is capped at max_display).
The game ends once the timer ends; the score is determined by how many collectables the player picked.

### TBD

Gameplay of filler mode (refer to items#700)

### Implementation Proposal 1

**Core Rule:** Only one of `timer` or `remain_counter` can be non-null at a time. They are mutually exclusive parameters that determine the game mode.

Data:
- `int? timer` - timer (defaults to null, which means sub-mode 1)
  - When set to a non-nullable integer, `remain_counter` must be null
  - Setting to 10 will create a 10-second timer (which means sub-mode 2)
    - Game ends once the timer hits zero seconds
  - Generate collectables dynamically along with the game progress
  - Newly generated positions will be added to prev_positions automatically
  - Use max_display to determine how many collectables to show at a time
- `int? max_display` - determines the maximum amount of collectables to be shown at a time (defaults to null)
  - Set to null if remain_counter is non-null
  - Null value means render all remaining collectables at once
  - Defaults to 9 if timer is non-null
- `int? remain_counter` - number of collectables to be spawned (defaults to 9)
  - When set to a non-nullable integer, `timer` must be null
  - Setting to 10 will create a remain_counter of 10
    - Game ends once the counter hits zero
  - If remain_counter gt positions.Count, the game should generate new collectables at random positions automatically until the counter hits zero
    - Newly generated positions should be added back to prev_positions
- `List<(int, int)> prev_positions` - previous collectable positions (defaults to xxx)
- `bool` - replace the previous positions, i.e., randomly spawn (defaults to false)
  - Reuse the previous positions if set to false

### 210: Window-Pickup

The game displays all the collectables at a time by default.
This feature implements a config to restrict the maximum displaying collectables to a value (e.g., max 5 at a time).

### 220: Speed-Based

Speed-based endgame condition means whoever ends the game earlier scores better.
=> In other words, fixed amount of collectable scores AND a variable timer.

### 230: Score-Based

The players try to gain as many scores as possible in a fixed amount of time.

#### 231: Score Boost

This feature works with score-based scoring mode.
Implement a few rules allowing players to get extra scores while meeting the conditions.
Here are a few possible score-boost rules:
Note that all these rules should be configurable.

#### 232: Combo Streak

A combo streak state: the streak refreshes if the player picks up a collectable within 4 steps (i.e., within steps 1, 2, 3, or 4).

The player loses the combo streak if they make 5 or more consecutive steps without picking up a collectable.

The player will gain extra scores picking up a collectable while maintaining the streak.

e.g., get one more score if surpassing x2 combo; get two more scores if surpassing x5 combo; get three more scores if surpassing x9 combo; capped extra scores at three.

#### 233: Decremental Counter

Make every newly spawned collectable worth an extra score of 5, then reduce the extra score each time the player moves.
This mode synergizes well with feature #xxx.

#### 234: Ordered Collectables

Mark all the collectables with an ordinal sequence.

The player gains extra score while picking up collectables in the correct order.

This mode also maintains a combo streak; lose extra score if the streak breaks.

The extra score grows arithmetically (e.g., +1, +2, +3...).

#### 235: Expiration

Randomly drop time-sensitive collectables.
This one is similar to items#233 except that the collectable disappears automatically if the counter runs below 1.
Make sure it is configurable.

### 240: Game Version

The game provides settings for users to configure their keybindings or gameplay.

The game should provide saving slots for users to store their settings.

Note that saving slots should manage keybinding and gameplay settings separately.

## 300: Config-Keybinding

All keybindings should be configurable.
Keybindings are basically actions to trigger a movement.
Thus, they should be defined in section items#100.

## 400: Visual-Background

### 410: Maps

The current gameplay only renders a single grid map at a time.

The player moves around inside the grid exclusively via these keybindings: hjkl.

I would like to expand the idea further to render multiple grids at a time.

Players could choose to use "hjkl" to move around different grids once they touch the boundaries between each grid.

Also, the game should introduce new keybindings to make the player teleport between each grid using one keystroke.

#### Examples

Given 9 grids on the screen at a time in a 3×3 layout:

The player is positioned on the top-left grid (0,0).

Player pressing HJKL (capitalized) would expect the following results:
- H => nothing happens
- J => move to the downside grid (1,0)
- K => nothing happens
- L => move to the rightside grid (0,1)

## 500: Visual-Foreground

### 510: Fog of War

The current gameplay displays the whole view entirely.

This item would implement a feature to make the player only discover collectables in a small area, which is the sight vision of the player.

Make sure the radius of the sight vision is configurable.

Make sure both filler and picker mode implement fog of war properly.

#### Design Notes

This config works best in randomly generated levels (timer + score-based mode).
The reason is that playing a static level in speed-based mode means the game should eliminate noise in the gameplay so that the player can explore pure speed easily.

### 520: Sigil/Rune

I would like to spread a few random printable ASCII characters across the view.
First, render these printable characters into different cells.
Then, attach different functions based on these characters.
NO need to implement all the features at this moment; we will leave these features to the next phase.

Possible features:
- **Sigils consumable:**
  - Consumed once the player steps onto it
  - Consumed sigils might be respawned based on certain rules or not
  - Consumed sigils might give the player extra scores or super powers
- **Sigils non-consumable:**
  - Players might have special movement to teleport to nearby sigils based on certain rules
  - Give users temporary power once they step onto it or not

### 530: Deep Link

I would like to introduce the concept of hyperlinks into the game.
Two proposals available:

#### Design Notes

Originally, I was trying to make links identical to how anchors work in a browser.
Thus, it would require the player to hit some key to trigger the link.
However, this design contradicts the first design principle where the game should eliminate non-movement actions if possible.
Similarly, a keystroke to bring the player back to the previous view like how "go back" works in a browser also disobeys the third design principle.

#### 531: Hyperlink-Like (Dropped)

**This feature has been dropped.**

Reason: This design violates the first design principle which states that "the gameplay should eliminate non-movement actions if possible." Requiring the player to hit a key (e.g., `t`) to enter a link is a non-movement action that would slow down the fast-paced gameplay.

Original proposal:
An HTML anchor where the player uses a keystroke to enter and then teleport to somewhere else on the view:
1. Teleport to another grid cell in the current view
  - Similar to how an anchor links to an element on the same page via `href="#id-of-an-elem"`
2. Teleport to another view
  - Similar to how an anchor links to another page
  - The player may use a keystroke to navigate back to the previous view
  - Or the player may use another anchor link (if presented) to navigate back to the previous view

Default keybinding to enter a link: `t`

#### 532: Portal-Like

A pair of portals that teleports the player on collision.
=> The pair of portals may sit inside the same view or different views.

### 540: Obstacle

The player cannot step onto a cell that contains an obstacle.

The game engine should not render an obstacle and any other item in the same cell at the same time.
- If a cell contains an obstacle, it cannot contain collectables, sigils, portals, or any other items
- This ensures clear collision behavior and prevents ambiguous game states

## 600: Visual-HUD

Information about score and configuration modal popup.

### 610: Score Board

While in-game: display current score.
While not in-game: display previous game score, best score of all time.

### 620: Modal Popup

Two simple buttons: the first configures gameplay, the second configures keybindings.
Should also place saving slots somewhere on the screen, and make sure the player can click to apply the configuration.

## 700: Config-Gameplay (Filler Mode)

Filler (or fill-up) mode is a special gameplay mode extended from the base gameplay of vimkeys-game (extended from picker mode).

This document reviews all the features inherited from the base gameplay, which then explicitly includes or excludes each feature.

Plus, it adds new features introduced by the filler mode.

Filler mode is an alternative game mode with the following features:
- **Render differently:**
  - The player now leaves track colors
  - Picked up collectables will change the background color of the cell
- **Extra pick-up rules:**
  - Now all collectables have a pre-defined condition; the player must meet the condition before the collectable can be picked up
  - e.g., a collectable may have condition "red"; then the player must pick up a "red color" first before they can pick up red collectables
    - Colors are special collectables that don't give extra score, and they will keep respawning in a few steps (configurable)

All the levels in filler mode are pre-defined; thus, there's no score-based gameplay. The only endgame condition is to clear the level in as few seconds as possible (i.e., the shortest time possible).

### Exclusion

- Filler mode should disable items#180
  - The reason is that filler mode introduces more collectable interaction
  - Allowing the player to extend body length will make the game over-complicated
- All maps are statically generated; doesn't support randomly generated maps
  - Thus, there will be no score-based gameplay available
  - Only speed-based gameplay is available
- No need to implement items#510
  - The reason is that fog of war works best with randomly generated maps
  - No need to handicap players for speed-based mode

### Implementation Proposal 1

Data:
- `int remain_counter` - counting down the amount of collectables to pick to win the game
- `List<Level> levels` - define a list of levels
  - The player can choose which level to play
  - Each level should have its own scoreboard
- Level Props:
  - `string name` - name of the level
  - `List<(int, int, Color)> colors` - colors respawning position and the color attached to it
  - `List<(int, int, Color)> collectables` - collectables spawning position and the color condition to pick up

### Dropped Feature: Explicit Fill-Up Command

Originally, I tried to let the player hit space to fill up a cell.
Additionally, I also wanted to make the player feel as if they were actually filling up the glyph provided by the level.

Thus, I made the player fill in the tracks for visited cells.
This would make the screen look messy if the player visited every cell.
Then, I introduced hitting "space" to toggle the filling tracks behavior.

However, at this point I've already found out the fact that:
- Both making the player explicitly hit space to fill up a cell
- And hitting space to let the player toggle filling up visited cells
- Violate the first design principle because it makes players hit extra spaces to complete the game

Besides the space issue, I also introduced a concept of threshold:
- The player cannot beat the level if there are too many unrelated cells colored
- Thus, if the player clears all the collectables, they still need to un-color cells that were colored by the visited cells behavior

The threshold feature also feels tedious after a few playthroughs.

### Dropped Feature: Stroke Width

A feature to fill in multiple cells at once; it can be done by implementing items#180.
However, it would over-complicate the gameplay, so just drop it.

### Dropped Feature: Stroke Depth

A feature to make different levels of the filling colors.
It happens when a collectable appears twice in the same cell.
After the second fill-up, the color should be brighter or darker.
However, filler mode renders all collectables on starting the game; respawning collectables introduces unnecessary complexity to the game without actually improving the gaming experience.

### The Final Design

Each collectable now comes with a condition to match (e.g., color).
The player can pick up a color item to match the condition.

A color item respawns automatically after the player moves a few steps, which ensures the player can always beat the level.
Picking up a new color item would replace the previous color directly.

Coloring visited cells is still a viable option; however, it should provide only visual feedback without changing the gameplay.