# visual-foreground

## 000:Player Initialization

When a game starts, the player must be initialized with the following properties:

### 010:Starting Position
- **Picker Mode (Random Level):** Player spawns at a random unoccupied cell, or at the center of the grid if unoccupied
- **Picker Mode (Fixed Level):** Player spawns at a predefined position specified in the level data
- **Filler Mode:** Player spawns at a predefined position specified in the level data

### 020:Initial State
| Property         | Initial Value | Notes                                 |
| ---------------- | ------------- | ------------------------------------- |
| Body Length      | 1             | Single cell occupied                  |
| Active Part      | Head          | For body length > 1 scenarios         |
| Score            | 0             | -                                     |
| Combo Streak     | 0             | If combo system is enabled            |
| Current Color    | None          | For Filler mode only                  |

### 030:Spawn Constraints
- The spawn cell must not contain an obstacle
- The spawn cell must not contain a portal (to avoid immediate teleportation)
- For random levels, ensure at least one collectable is reachable from spawn position

Index
- 000:game-core:intro
- b00:game-core:flow
- 100:action-movement:core
- c00:action-movement:backlog
- d00:action-movement:snake
- a00:config-gameplay:core
- 200:config-gameplay:picker-mode
  - keywords: picker, filler, timer, remain-counter, win-loss-condition
- 700:config-gameplay:filler-mode
- e00:config-gameplay:snake-mode
- 800:level-design
- 300:config-keybinding
  - keywords: keybinding
- 400:visual-background
  - keywords: map, grid, view
- 500:visual-foreground
  - keywords: item, player, collectable, sigil, obstacle, portal
  - quick definition: foreground refers to items rendered in a cell
  - to-be-defined: type and maximum amount of items that can be rendered in the same cell
- 600:visual-hud
  - keywords: score board, configuration modal

## 100:collectable

## 200:Obstacle

The player cannot step onto a cell that contains an obstacle.

The game engine should not render an obstacle and any other item in the same cell at the same time.
- If a cell contains an obstacle, it cannot contain collectables, sigils, portals, or any other items
- This ensures clear collision behavior and prevents ambiguous game states

## 300:Sigil/Rune

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

## 400:Teleport Links

I would like to introduce the concept of hyperlinks into the game.
Two proposals available:

### 410:Design Notes

Originally, I was trying to make links identical to how anchors work in a browser.
Thus, it would require the player to hit some key to trigger the link.
However, this design contradicts the first design principle where the game should eliminate non-movement actions if possible.
Similarly, a keystroke to bring the player back to the previous view like how "go back" works in a browser also disobeys the third design principle.

### 420:Hyperlink-Like (Dropped)

**Reason for dropping:** Violates the first design principle (non-movement actions).

An HTML anchor where the player uses a keystroke to enter and then teleport to somewhere else on the view. Requiring the player to hit a key (e.g., `t`) to enter a link is a non-movement action that would slow down the fast-paced gameplay.

### 430:Portal-Like

A pair of portals that teleports the player on collision.
=> The pair of portals may sit inside the same view or different views.

## 500:Fog of War

The current gameplay displays the whole view entirely.

This item would implement a feature to make the player only discover collectables in a small area, which is the sight vision of the player.

Make sure the radius of the sight vision is configurable.

Make sure both filler and picker mode implement fog of war properly.

### 510:Design Notes

This config works best in randomly generated levels (timer + score-based mode).
The reason is that playing a static level in speed-based mode means the game should eliminate noise in the gameplay so that the player can explore pure speed easily.
