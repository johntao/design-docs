# game-level

This section defines how levels are structured, generated, and stored.

## Random Level Generation

For Picker mode with random generation:

### Algorithm Outline

1. Create empty grid of specified dimensions
2. Place player spawn point
3. Place obstacles (density: 0-20% of cells, configurable)
   - Ensure obstacles don't block all paths
4. Place collectables
   - Ensure all collectables are reachable from spawn
5. Place sigils (optional, based on config)
6. Place portals (optional, in pairs)

### Generation Parameters
| Parameter         | Type  | Default | Description                                     |
| ----------------- | ----- | ------- | ----------------------------------------------- |
| obstacle_density  | float | 0.10    | Percentage of cells with obstacles (0.0 - 0.20) |
| collectable_count | int   | 9       | Number of collectables to place                 |
| sigil_count       | int   | 0       | Number of sigils to place                       |
| portal_pairs      | int   | 0       | Number of portal pairs to place                 |
| seed              | int?  | null    | Random seed for reproducibility (null = random) |

## Fixed Level Format

Fixed levels are stored as JSON with the following structure:

```json
{
  "id": "level_001",
  "name": "Tutorial 1",
  "mode": "picker",
  "grid": {
    "rows": 15,
    "cols": 15
  },
  "player_spawn": { "row": 5, "col": 7 },
  "items": [
    { "type": "collectable", "row": 2, "col": 3 },
    { "type": "collectable", "row": 8, "col": 12 },
    { "type": "obstacle", "row": 4, "col": 5 },
    { "type": "sigil", "subtype": "angle_left", "row": 3, "col": 10 },
    { "type": "portal", "pair_id": 1, "row": 1, "col": 1 },
    { "type": "portal", "pair_id": 1, "row": 9, "col": 14 }
  ],
  "filler_config": {
    "colors": [
      { "row": 0, "col": 0, "color": "red" }
    ],
    "collectables": [
      { "row": 5, "col": 5, "required_color": "red" }
    ]
  },
  "metadata": {
    "author": "designer_name",
    "difficulty": "easy",
    "par_time_seconds": 30
  }
}
```

## Level Validation Rules

Before a level can be played, validate:
1. Player spawn position is within grid bounds
2. Player spawn position does not overlap with obstacles or portals
3. All collectables are reachable from player spawn (pathfinding check)
4. Portal pairs are complete (no orphan portals)
5. For Filler mode: all color sources are reachable
6. Grid dimensions are within allowed range

## Level Set (default)

Each game mode is mapped to a level set
Players can cycle through levels using `[` and `]`:

| Level                   | Description                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Demo:Blank              | Render coins.                                                                           |
| Demo:Sigil              | Render coins and sigils (angle brackets and alphabets)                                  |
| Demo:Portal             | Render coins and portals                                                                |
| Demo:Obstacle           | Render coins and obstacles                                                              |
| Predefined Level 1      | Render all types of items. Fixed level with preset layout.                              |
| Predefined Level 2      | Render all types of items. Fixed level with preset layout.                              |
| Predefined Level 3      | Render all types of items. Fixed level with preset layout.                              |
| Predefined Level 4      | Render all types of items. Fixed level with preset layout.                              |
| Dynamic Generated Level | Render all types of items. Randomly generated level. Press `<backspace>` to regenerate. |

Refer to file [visual foreground](./6-visual-foreground.md) for more items information

### Demo Level Details

The demo level is a special sandbox mode:
- **Cannot be started** (the `\` key has no effect; the level is always in a playable state without entering formal In-Game mode)
- **Endless gameplay**: Collectables respawn automatically once all are cleared
- **Supported features**: Pick up collectables, obstacles, portals, all movement actions
- **Unsupported features**: Combo system, score calculation, win/loss conditions

## alternate coloring logic

implement two extra features
- coin now has a color code
  - coin is collected only if the player have the correspond color spray
- a new collectable color spray
  - player pick up the spray once step on it
  - player can have one spray at a time, pick up a new one would replace the old one directly
  - color spray doesn't give score
  - color spray respawn after 4 movement actions

## level set (filler-mode specific)

this level set is identical to [default level set](#level-set-default) except that  
each level now render coin with color logic, and also render correspond color sprays

## game mode specific

### shared

implements these:

- dummy blank line
- [random level generation](#random-level-generation)
- [fixed level format](#fixed-level-format)
- [level validation rules](#level-validation-rules)

### picker

inherit from [shared](#shared)

### filler

inherit from [shared](#shared)
implement these:
- [alternate coloring logic](#alternate-coloring-logic)
- [level set](#level-set-filler-mode-specific)

### score booster

inherit from [shared](#shared)

### snake

inherit from [shared](#shared)
