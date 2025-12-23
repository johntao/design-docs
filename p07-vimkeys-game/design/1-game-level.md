# game-level

This section defines how levels are structured, generated, and stored.

## 000:Grid Dimensions

Default grid dimension: 10x10

For multi-grid views:
- Maximum grids per view: 9 (3×3 layout)
- Grid margin: 10px between grids

## 100:Random Level Generation

For Picker mode with random generation:

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
| Parameter         | Type  | Default | Description                                     |
| ----------------- | ----- | ------- | ----------------------------------------------- |
| obstacle_density  | float | 0.10    | Percentage of cells with obstacles (0.0 - 0.20) |
| collectable_count | int   | 9       | Number of collectables to place                 |
| sigil_count       | int   | 0       | Number of sigils to place                       |
| portal_pairs      | int   | 0       | Number of portal pairs to place                 |
| seed              | int?  | null    | Random seed for reproducibility (null = random) |

## 200:Fixed Level Format

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

## 300:Level Validation Rules

Before a level can be played, validate:
1. Player spawn position is within grid bounds
2. Player spawn position does not overlap with obstacles or portals
3. All collectables are reachable from player spawn (pathfinding check)
4. Portal pairs are complete (no orphan portals)
5. For Filler mode: all color sources are reachable
6. Grid dimensions are within allowed range
