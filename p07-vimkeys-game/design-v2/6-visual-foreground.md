# visual-foreground

an item is rendered in the foreground of a cell

all items are basically printable characters

collision: when the player moves and overlap on another item, a collision event is triggered

## type properties

this table illustrate the basic properties of each type of items
| Type-props  | collidable | actionable | collision event                 | Sub-item                   |
| ----------- | ---------- | ---------- | ------------------------------- | -------------------------- |
| collectable | o          | x          | pick up (item vanish afterward) | coin, spray, volatile coin |
| portal      | o          | x          | teleport                        |                            |
| obstacle    | o          | x          | block, cancel the movement      |                            |
| sigil       | x          | o          | NONE                            | alphabet, angle bracket    |

## spawn rules

this table illustrate if two different type of items could be spawned in the same cell
| spawn     | portal | sg-angle | sg-letter | obstacle | player | coin |
| --------- | ------ | -------- | --------- | -------- | ------ | ---- |
| portal    | #N/A   | o        | o         | x        | x      | x    |
| sg-angle  | o      | #N/A     | o         | x        | o      | o    |
| sg-letter | o      | o        | #N/A      | x        | o      | o    |
| obstacle  | x      | x        | x         | #N/A     | x      | x    |
| player    | x      | o        | o         | x        | #N/A   | x    |
| coin      | x      | o        | o         | x        | x      | #N/A |

## item display

this table illustrate the printable character to represent each item type
| display   | char | desc                               |
| --------- | ---- | ---------------------------------- |
| portal    | ○    | hollow circle                      |
| sg-angle  | <>   | ascii angle brackets               |
| sg-letter | a..z | ascii alphabets                    |
| obstacle  | ▮    | high vertical block                |
| player    | ▢    | hollow square with rounded corners |
| coin      | •    | dot                                |

## step rules

this table illustrate if the player could step onto another item type (i.e. collidable) 
| player stepping         | portal | sg-angle | sg-letter | obstacle | player | coin |
| ----------------------- | ------ | -------- | --------- | -------- | ------ | ---- |
| non snake mode          | o      | o        | o         | x        | #N/A   | o    |
| snake mode, head-driven | o      | o        | o         | x        | o      | o    |
| snake mode, body-driven | o      | o        | o         | o        | #N/A   | o    |

## collectable_coin

picking up a coin would give player one score

extra notes:
- if decremental counter is enabled, render a number aside or on top of the coin
  - a number to represent the decremental counter
- if combo_ocd is enabled, render a number aside or on top of the coin
  - a number to represent the correct order to keep the combo streak
- if filler feature set is enabled, successfully picking up a coin would also paint the cell with the correspond color

## collectable_color spray

this is a collectable item in filler mode

extra notes:
- it doesn't give score
- it respawn after a few movement actions

## collectable_volatile coin

this is a collectable item in score-booster mode

extra notes:
- a decremental counter is rendered aside or on top of the coin
- the coin vanish once the counter run below 1

## Player Initialization

When a game starts, the player must be initialized with the following properties:

### Starting Position
- **Picker Mode (Random Level):** Player spawns at a random unoccupied cell, or at the center of the grid if unoccupied
- **Picker Mode (Fixed Level):** Player spawns at a predefined position specified in the level data
- **Filler Mode:** Player spawns at a predefined position specified in the level data

### Initial State
| Property      | Initial Value | Notes                         |
| ------------- | ------------- | ----------------------------- |
| Body Length   | 1             | Single cell occupied          |
| Active Part   | Head          | For body length > 1 scenarios |
| Score         | 0             | -                             |
| Combo Streak  | 0             | If combo system is enabled    |
| Current Color | None          | For Filler mode only          |

### Spawn Constraints
- The spawn cell must not contain an obstacle
- The spawn cell must not contain a portal (to avoid immediate teleportation)
- For random levels, ensure at least one collectable is reachable from spawn position

## Obstacle

The player cannot step onto a cell that contains an obstacle.

The game engine should not render an obstacle and any other item in the same cell at the same time.
- If a cell contains an obstacle, it cannot contain collectables, sigils, portals, or any other items
- This ensures clear collision behavior and prevents ambiguous game states

## sigil_alphabet

Sigils are printable characters that players may use special actions to interact with

Extra info:
- one alphabet per cell
- each letter should render at least 4 times per grid
  - this would make the repeater action more useful
- render alphbets starts from a

## sigil_angle bracket

Sigils are printable characters that players may use special actions to interact with

Extra info:
- doesn't trigger collision events
- it is possible to spawn different types of sigils in the same cell
- the game should render angle bracket in pairs without nesting
  - this simulate the how word boundaries works in VIM originally

### design notes

this concept originate from VIM word boundary motion

| sigil | player act | VIM ori cmd | desc                                                       |
| ----- | ---------- | ----------- | ---------------------------------------------------------- |
| <     | w          | w           | Move forward to the start of the next word                 |
| <     | q          | b           | Move backward to the start of the current or previous word |
| >     | r          | e           | Move forward to the end of the current or next word        |
| >     | e          | ge          | Move backward to the end of the previous word              |

the difference:
- VIM imply the word boundary concept behind the scene
  - in the other hand, this game visualize this concept with literal characters

the similarity:
- the game supports rendering alphabet and angle brackets in the same cell
  - which is similar to VIM that the user may use either word motion or find char to navigate to the same position
- render in pairs without nesting

## portals

A pair of portals that teleports the player on collision.

Extra notes:
- The pair of portals may sit inside the same view or different views. (if multiple grids in-use)
- for now, only simple bi-directional portals are supported
- if multiple pairs of portals presented, each pair should use a distinctive colors
  - e.g. A <=> A' colored red; B <=> B' colored blue;
- in snake mode, hitting portals by the body part would remove the body part directly instead of teleporting

## Fog of War

The current gameplay displays the whole view entirely.

This item would implement a feature limiting the player's sight to a smaller area.

extra notes:
- the area is configured by a radius value (defaults to 5)
- use a proper algorithm to simulate a circular area within a grid

### Design Notes

This config works best in randomly generated levels (timer + score-based mode).
The reason is that playing a static level in speed-based mode means the game should eliminate noise of the gameplay to ensure better player experience.

## game mode specific

noted that some of the game mode specific instructions are already included below the "extra note" of each feature

### shared

- dummy blank
- [type properties](#type-properties)
- [spawn rules](#spawn-rules)
- [item display](#item-display)
- [step rules](#step-rules)
- [collectable coin](#collectable_coin)
- [player](#player-initialization)
- [obstacle](#obstacle)
- [sigil alphabet](#sigil_alphabet)
- [sigil angle bracket](#sigil_angle-bracket)
- [portals](#portals)
- [fog of war](#fog-of-war)

### picker

inherit all from [shared](#shared)

### filler

inherit all from [shared](#shared)
implement these additional features:
- [collectable color spray](#collectable_color-spray)

### score-booster

inherit all from [shared](#shared)
implement these additional features:
- [collectable volatile coin](#collectable_volatile-coin)

### snake

inherit all from [shared](#shared)
implement these additional features:
- [collectable volatile coin](#collectable_volatile-coin)

## appendix_dropped features

### Hyperlink-Like

**Reason for dropping:** Violates the first design principle (non-movement actions).

An HTML anchor where the player uses a keystroke to enter and then teleport to somewhere else on the view. Requiring the player to hit a key (e.g., `t`) to enter a link is a non-movement action that would slow down the fast-paced gameplay.

Similarly, a keystroke to bring the player back to the previous view like how "go back" works in a browser also disobeys the third design principle.