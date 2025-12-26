# game-core

This game is a combination of VIM keybindings and Snake-like gameplay.

## 100:intro

### 110:The Basic Gameplay

The player uses VIM keybindings to explore and pick up coins in a grid-like area

#### 111:What Makes This Game Unique and Fun:

The game contains rich movement actions and gameplay options.
The player can configure all the keybindings and gameplay as they wish.
The goal is to let players learn what keybindings and gameplay work best for themselves.

### 120:Keywords and Definitions:
- **view** => the entire area that is visible and actionable to the player
  - A view may contain one or many grids at a time
  - There should be margins between two different grids
  - refer to [visual background](./5-visual-background.md) for more information
- **grid** => a grid consists of N×M cells
- **cell** => the smallest unit of the visual background
  - The player may step onto a cell unless it contains an obstacle
  - A cell may contain one to many ASCII printable characters as items
  - Note: If a cell contains an obstacle, it cannot contain any other items
- **item** => anything rendered inside a cell is an item (visual foreground)
  - e.g. collectable items, sigils with special functions
    - hyperlinks, portals, obstacles (the player cannot step onto an obstacle)
  - refer to [visual foreground](./6-visual-foreground.md) for more information
- **collectable** => an item that is cleared once the player steps onto it
  - e.g. a coin is a collectable, a player gains score whenever they clear a collectable
- **HUD** => head-up display: the surrounding part of the game
  - e.g. score, timer, configuration buttons
  - refer to [visual hud](./7-visual-hud.md) for more information
- **game mode** => a game mode is an opinionated setup configured by the designer
  - a game mode would pre-configure reasonable options, ensure the best player experience
  - players may still tweak these settings by themselves
  - some of the options are specific to a game mode; some of the options are shared
- **game mode1: picker** => the player moves inside the view and picks up all the coins
  - end the game once the last coin is picked
- **game mode2: filler** => the player moves inside the view
  - picking up collectables now also color the cells
  - end the game once the track of the movement matches the given pattern of the level
- **game mode3: score booster** => the player moves inside the view and picks up all the coins
  - end the game once the timer count to zero
  - a few score-boosting rules are introduced
- **game mode4: snake** => the player moves inside the view and picks up all the coins
  - player body length increase per coin collection
  - end the game once the timer count to zero
  - a few score-boosting rules are introduced
- **game state** => only two game state available: start (in-game) and stop (out-of-game)
- **level** => a level is the map defined by the designer
  - some of the levels are specific to a game mode; some of the levels are shared
  - demo levels are free to play without starting the game
    - in fact, the player cannot start a demo level
    - i.e. `\` has no effect on demo level
  - demo levels remove win/ loss condition and score calculation
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
  - The game should still treat these config options wisely if they don't make sense in the first place
- **An obvious shortcut doesn't improve the player experience**
  - Do not introduce universally well-rounded functions to the player
  - Spamming the same obvious strategy to beat every level will significantly decrease the gaming experience
  - e.g., a "go back" shortcut that allows the player to navigate back to the previous view anytime and anywhere
- **Reduce cognitive load whenever possible**
  - design the complexity of the game purposely
  - do not introduce complexity to the game without good reason
  - try to separate game feature set into different mode if things get overly complex
- **Choose the design that make the gameplay less boring whenever possible**
  - when the complexity is settled, and there're a few more design decisions to made
  - choose the one that enrich the player experience more
  - this is a rule go against "least surprising design"

## 300:flow

### 310:Game Mode Selector

Before gameplay begins, the player selects a game mode. This is a higher-order switch that replaces the entire game configuration:

| Mode          | Description                              |
| ------------- | ---------------------------------------- |
| Picker        | Default mode. Pick up coins on the view. |
| Filler        | Pick up coins. And match colors          |
| Score-Booster | Pick up coins in a given timer           |
| Snake         | Pick up coins in a given timer           |

### 320:State Machine

```
┌─────────────┐     \     ┌─────────────┐
│  Out-Game   │◀─────────▶│   In-Game   │
└─────────────┘           └─────────────┘
```

### 330:Transitions

| From        | To          | Trigger                                 |
| ----------- | ----------- | --------------------------------------- |
| Out-of-Game | In-Game     | Player presses `\`                      |
| In-Game     | Out-of-Game | Player presses `\` or win condition met |

### 340:Reserved Keybindings

These keybindings are always active and cannot be remapped:

| Key           | Action                                              |
| ------------- | --------------------------------------------------- |
| `-`           | Previous game mode                                  |
| `=`           | Next game mode                                      |
| `<backspace>` | Randomize level (only for dynamic generated levels) |
| `[`           | Select previous level                               |
| `]`           | Select next level                                   |
| `\`           | Start game (out-of-game) / Stop game (in-game)      |
| `Escape`      | Open/close settings menu                            |
| `Enter`       | Confirm selections in menus                         |

## 400:game mode introduction

### 410:picker mode

is the base game mode having the following game flow:
- game start, a stopwatch start
- coins rendered at once
- player collect the last coin
- stopwatch stop, game end

### 420:filler mode

is a special game mode that works very similar to the base gameplay with extra feature set
game flow is identical to [picker mode](#picker-mode)
the main feature of this mode: picking up coins would also color the cells

### 430:score-booster mode

is a special game mode that introduce several score-boosting rules, and a countdown timer
here's the game flow:
- game start, a countdown timer start
- coins keep rendering
- player keep collecting coins
- timer stop, game end

### 440:snake mode

is a special game mode that works very similar to [score-booster](#score-booster-mode) with a different feature set
game flow is identical to score-booster mode
the main feature of this mode: length of the player is increased by 1 each time the player collect a coin
