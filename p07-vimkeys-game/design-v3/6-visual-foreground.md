# visual-foreground

an item is rendered in the foreground of a cell

all items are basically printable characters

collision: when the player moves and overlap on another item, a collision event is triggered

## 100:type properties

this table illustrate the basic properties of each type of items
| Type-props     | collidable | actionable | collision event                 | Sub-item            |
| -------------- | ---------- | ---------- | ------------------------------- | ------------------- |
| collectable    | o          | x          | pick up (item vanish afterward) | coin, volatile coin |
| portal         | o          | x          | teleport                        |                     |
| obstacle       | o          | x          | block, cancel the movement      |                     |
| sigil          | x          | o          | NONE                            | letter              |
| detached parts | o          | x          | attach, swap, get one score     |                     |
| attached parts | o          | x          | attack, swap                    |                     |

## 200:spawn rules

this table illustrate if two different type of items could be spawned in the same cell
| spawn     | portal | sg-angle | sg-letter | obstacle | player | coin |
| --------- | ------ | -------- | --------- | -------- | ------ | ---- |
| portal    | #N/A   | o        | o         | x        | x      | x    |
| sg-angle  | o      | #N/A     | o         | x        | o      | o    |
| sg-letter | o      | o        | #N/A      | x        | o      | o    |
| obstacle  | x      | x        | x         | #N/A     | x      | x    |
| player    | x      | o        | o         | x        | #N/A   | x    |
| coin      | x      | o        | o         | x        | x      | #N/A |

## 300:item display

this table illustrate the printable character to represent each item type
| display       | char | desc                               |
| ------------- | ---- | ---------------------------------- |
| portal        | ○    | hollow circle                      |
| sigil-letter  | asdf | configurable ascii letters         |
| obstacle      | ▮    | high vertical block                |
| player        | ▢    | hollow square with rounded corners |
| coin          | •    | dot                                |
| volatile coin | ⋆    | star                               |

## 400:step rules

this table illustrate if the player could step onto another item type (i.e. collidable) 
| player state         | portal | sg-letter | obstacle | player | coin |
| -------------------- | ------ | --------- | -------- | ------ | ---- |
| len eq 1             | o      | o         | x        | o      | o    |
| len gt 1             | o[^2]  | o         | x        | o      | o    |
| len gt 1, rigid mode | o[^1]  | o         | o[^1]    | o      | o    |

[^1]: cause split
[^2]: detach head, then, teleport

## 500:collectable_coin

picking up a coin would give player one score and increase player's body length by 1

extra notes:
- spawning logic
  - spawning at least one coin per grid at any given time
  - per N player's actions, spawning a new one (N defaults 4)

## 700:collectable_volatile coin

a volatile coin also display a decremental counter on the coin
picking up a volatile coin give player's (one + counter) score, and make the player enter rigid mode

extra notes:
- a decremental counter is rendered on top of the coin
- the coin vanish once the counter runs below 1

## 800:Player Initialization

When a game starts, the player must be initialized with the following properties:

### 810:Starting Position

- for random level, the player spawn at a random unoccupied cell
- for predefined level, the player spawn at a predefined position specified in the level data

### 830:Spawn Constraints

- The spawn cell must not contain an obstacle
- The spawn cell must not contain a portal (to avoid immediate teleportation)
- For random levels, ensure at least one collectable is reachable from spawn position

## 900:Obstacle

The player cannot step onto a cell that contains an obstacle.

The game engine should not render an obstacle and any other item in the same cell at the same time.
- If a cell contains an obstacle, it cannot contain collectables, sigils, portals, or any other items
- This ensures clear collision behavior and prevents ambiguous game states

## a00:sigil_letter

Sigils are printable characters that players may use special actions to interact with

Extra info:
- one sigil letter per cell
- each letter should render at least 4 times per grid
- letters are generating in the following sequence sigil-letter-1, sigil-letter-2, sigil-letter-3, sigil-letter-4
  - e.g. if a level rendered (5,4,4) sigils and the sigil sequence is defined as `asdf`
  - then "a" appears 5 times, "s" appear 4 times, "d" appear 4 times, "f" appear 0 time

## c00:portals

A pair of portals that teleports the player on collision.

Extra notes:
- The pair of portals may sit inside the same view or different views. (if multiple grids in-use)
- for now, only simple bi-directional portals are supported
- if multiple pairs of portals presented, each pair should use a distinctive colors
  - e.g. A <=> A' colored red; B <=> B' colored blue;
- in snake mode, hitting portals by the body part would remove the body part directly instead of teleporting

## d00:Fog of War

The current gameplay displays the whole view entirely.

This item would implement a feature limiting the player's sight to a smaller area.

extra notes:
- the area is configured by a radius value (defaults to 5)
- use a proper algorithm to simulate a circular area within a grid