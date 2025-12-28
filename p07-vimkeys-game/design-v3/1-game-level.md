# game-level

This section defines how levels are structured, generated, and stored.
Refer to file [visual foreground](./6-visual-foreground.md) for definitions of items (e.g. coins, sigils, portals...)

## 100:Random Level Generation

### 110:Algorithm Outline

1. Create empty grid of specified dimensions
2. Place player spawn point
3. Place obstacles (density: 0-20% of cells, configurable)
   - Ensure obstacles don't block all paths
4. Place collectables
   - Ensure all collectables are reachable from spawn
5. Place sigils (optional, based on config)
6. Place portals (optional, in pairs)

### 120:Generation Parameters

| Parameter        | Type | Default | Description                                     |
| ---------------- | ---- | ------- | ----------------------------------------------- |
| obstacle_density | int  | 10      | Percentage of cells with obstacles 0-20%        |
| sigil_density    | int  | 10      | Percentage of cells with sigils 0-20%           |
| portal_density   | int  | 10      | Percentage of cells with portals 0-20% [^1]     |
| seed             | int? | null    | Random seed for reproducibility (null = random) |

[^1]: portals are generated in even numbers, 10 portals is equals to 5 pairs of portal

## 200:Fixed Level Format

Fixed levels are stored as JSON with the following structure:

```json
{
  "id": "level_001",
  "name": "Tutorial 1",
  "grid": {
    "rows": 15,
    "cols": 15
  },
  "player_spawn": { "row": 5, "col": 7 },
  "items": [
    { "type": "collectable", "subtype": "coin", "row": 2, "col": 3 },
    { "type": "obstacle", "row": 4, "col": 5 },
    { "type": "sigil", "subtype": "q", "row": 3, "col": 10 },
    { "type": "portal", "pair_id": 1, "row": 1, "col": 1 },
    { "type": "portal", "pair_id": 1, "row": 9, "col": 14 }
  ],
  "metadata": {
    "author": "designer_name",
    "difficulty": "easy",
  }
}
```

## 300:Level Validation Rules

Before a level can be played, validate:
1. Player spawn position is within grid bounds
2. Player spawn position does not overlap with obstacles or portals
3. All collectables are reachable from player spawn (pathfinding check)
4. Portal pairs are complete (no orphan portals)
5. Grid dimensions are within allowed range

## 400:Level Set

Players can cycle through levels using `[` and `]`:

| Level                   | Description                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Demo_1                  | Render coins.                                                                           |
| Demo_2                  | Render coins, sigils                                                                    |
| Demo_3                  | Render coins, portals, obstacles                                                        |
| Demo_4                  | Render all types of items                                                               |
| Predefined Level 1      | Render all types of items. Fixed level with preset layout.                              |
| Predefined Level 2      | Render all types of items. Fixed level with preset layout.                              |
| Predefined Level 3      | Render all types of items. Fixed level with preset layout.                              |
| Predefined Level 4      | Render all types of items. Fixed level with preset layout.                              |
| Dynamic Generated Level | Render all types of items. Randomly generated level. Press `<backspace>` to regenerate. |

Refer to file [visual foreground](./6-visual-foreground.md) for more items information

### 410:Demo Level Details

The demo level is a special sandbox mode:
- **Cannot be started** the level is always in a playable state without entering formal In-Game mode
  - hitting the `\` key would reset the level instead of actually start/ stop the game
- **Supported features**: player interaction with items (i.e. collision event) and all movement actions
- **Unsupported features**: Combo system, score calculation, endgame conditions