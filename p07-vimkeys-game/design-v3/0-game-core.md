# game-core

This game is a combination of VIM keybindings and Snake-like gameplay.

## 100:intro

### 110:The Basic Gameplay

The player uses VIM keybindings to explore and pick up coins in a grid-like area

#### 111:What Makes This Game Unique and Fun:

The VIM part:
- The game contains rich movement actions and gameplay options.
- The player can configure all the keybindings and gameplay as they wish.
- The goal is to let players learn what keybindings and gameplay work best for themselves.

The Snake part:
- player body length increase per coin collection
- several mechanism and moves to detach/ attach head and the body part
- extra score are rewarded when player successful landing these moves

### 120:Keywords and Definitions:
- **view** => the entire area that is visible and actionable to the player
  - A view may contain one or many grids at a time
  - There should be margins between two different grids
  - refer to [visual background](./5-visual-background.md) for more information
- **grid** => a grid consists of N×N cells
- **cell** => the smallest unit of the visual background
  - The player may step onto a cell unless it contains an obstacle
  - A cell may contain one to many ASCII printable characters as items
  - Note: If a cell contains an obstacle, it cannot contain any other items
- **item** => anything rendered inside a cell is an item (visual foreground)
  - e.g. collectable items, sigils, player, portals, obstacles (the player cannot step onto an obstacle)
  - refer to [visual foreground](./6-visual-foreground.md) for more information
- **collectable** => an item that is cleared once the player steps onto it
  - e.g. a coin is a collectable, a player gains score by picking up a coin
- **HUD** => head-up display: the surrounding part of the game
  - e.g. score, timer, configuration buttons
  - refer to [visual hud](./7-visual-hud.md) for more information
- **game state** => only two game state available: start (in-game) and stop (out-of-game)
- **level** => a level is the map defined by the designer
  - demo levels are free to play without starting the game
    - hitting `\` will reset the demo level
    - demo levels remove endgame condition and score calculation
  - refer to [game level](./1-game-level.md) for more information

## 200:Design Principles

- **This should be fast-paced gameplay**
  - i.e., every keystroke should impact the game progress to some degree
  - Thus, the gameplay should eliminate non-movement actions if possible
  - e.g., do not make the player tap space to pick up an item
    - Do not make the player tap something to enter a portal
- **Randomize purposefully**
  - Randomly generated levels and fixed levels should be designed differently
  - Some features work best with randomly generated levels, and some do not
  - Even though it is possible to maximize the "configurable" part of the gameplay
  - The game should still expose these config options wisely if they don't make sense in the first place
- **An obvious shortcut doesn't improve the player experience**
  - Do not introduce universally well-rounded functions to the player
  - Spamming the same obvious strategy to beat each level will significantly decrease the gaming experience
  - e.g., a "go back" shortcut that allows the player to navigate back to the previous view anytime and anywhere
- **Reduce cognitive load whenever possible**
  - design the complexity of the game purposely
  - do not introduce complexity to the game without a good reason
  - try to separate game feature set into different mode if things get overly complex
- **Choose the design that make the gameplay less boring whenever possible**
  - when the complexity is settled, and there're a few more design decisions to make
  - choose the one that enrich the player experience more
  - this is a rule go against "least surprising design"

## 300:flow

State Machine:

```
┌─────────────┐     \     ┌─────────────┐
│  Out-Game   │◀─────────▶│   In-Game   │
└─────────────┘           └─────────────┘
```

Transitions:

| From        | To          | Trigger                                     |
| ----------- | ----------- | ------------------------------------------- |
| Out-of-Game | In-Game     | Player presses `\`                          |
| In-Game     | Out-of-Game | Player presses `\` or endgame condition met |

Extra notes:
- Stopping a game should reset all the states, including:
  - all the decremental counter
  - the position of the player

### 310:Reserved Keybindings

These keybindings are always active and cannot be remapped:

| Key           | Action                                              |
| ------------- | --------------------------------------------------- |
| `<backspace>` | Randomize level (only for dynamic generated levels) |
| `[`           | Select previous level                               |
| `]`           | Select next level                                   |
| `\`           | Start game (out-of-game) / Stop game (in-game)[^1]  |
| `Escape`      | Open/close settings menu                            |
| `Enter`       | Confirm selections in menus                         |

[^1]: hitting `\` on a demo level would reset the level instead of start/ stop a game
