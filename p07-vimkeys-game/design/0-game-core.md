# game-core

This game is a combination of VIM keybindings and Snake-like gameplay.

## 000:intro

### 010:The Basic Gameplay

The player uses VIM keybindings to move in a grid-like map.
The game scatters collectables at fixed (or random) positions across the view.
If a timer is used, the game ends when the timer hits zero.
Otherwise, the game ends when the last collectable is picked up.

#### 011:What Makes This Game Unique and Fun:
The game contains rich movement actions and gameplay options.
The player can configure all the keybindings and gameplay as they wish.
The goal is to let players learn what keybindings and gameplay work best for themselves.

### 020:Keywords and Definitions:
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

### 030:Design Principles

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

## 100:flow

### 110:Game Mode Selector

Before gameplay begins, the player selects a game mode. This is a higher-order switch that replaces the entire game configuration:

| Mode   | Description                                      | Reference  |
| ------ | ------------------------------------------------ | ---------- |
| Picker | Default mode. Pick up collectables on the view.  | [items#200](#200-config-gameplay-picker-mode)  |
| Filler | Match colors to clear collectables.              | items#700  |

### 120:State Machine

```
┌─────────────┐     \     ┌─────────────┐
│  Out-Game   │◀─────────▶│   In-Game   │
└─────────────┘           └─────────────┘
```

Only two game states exist:

- **In-Game**
  - Active gameplay state
  - Press `\` to stop the game and return to out-of-game state
  - HUD displays:
    - Current score
    - Timer or collectables remaining (mode-dependent)
    - Combo status (if active)

- **Out-of-Game**
  - Press `\` to start the game
  - HUD displays:
    - Game mode selector (Picker / Filler)
    - Previous game score
    - Highest score (all time)
    - Configuration modal popup (access keybindings and gameplay settings)
    - Level switch

### 130:Reserved Keybindings

These keybindings are always active and cannot be remapped:

| Key           | Action                                              |
| ------------- | --------------------------------------------------- |
| `\`           | Start game (out-of-game) / Stop game (in-game)      |
| `=`           | Switch to next level                                |
| `<backspace>` | Switch to previous level                            |
| `]`           | Randomize level (only for dynamic generated levels) |
| `Escape`      | Open/close settings menu                            |
| `Enter`       | Confirm selections in menus                         |

### 140:Level Switch

Players can cycle through levels using `=` and `<backspace>`:

| Level                    | Description                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Demo Level               | Special endless level for free movement practice. Cannot be started. See details below.        |
| Predefined Level 1       | Fixed level with preset layout.                                                                 |
| Predefined Level 2       | Fixed level with preset layout.                                                                 |
| Predefined Level 3       | Fixed level with preset layout.                                                                 |
| Dynamic Generated Level  | Randomly generated level. Press `]` to regenerate.                                              |

#### 141:Demo Level Details

The demo level is a special sandbox mode:
- **Cannot be started** (the `\` key has no effect; the level is always in a playable state without entering formal In-Game mode)
- **Endless gameplay**: Collectables respawn automatically once all are cleared
- **Supported features**: Pick up collectables, obstacles, portals, all movement actions
- **Unsupported features**: Combo system, score calculation, win/loss conditions

### 150:Transitions

| From       | To         | Trigger              |
| ---------- | ---------- | -------------------- |
| Out-of-Game | In-Game   | Player presses `\`   |
| In-Game    | Out-of-Game | Player presses `\` or win condition met |

### 160:Win/Loss Conditions Summary

| Mode   | Sub-mode                      | Win Condition                          | Loss Condition | Score Calculation                   |
| ------ | ----------------------------- | -------------------------------------- | -------------- | ----------------------------------- |
| Picker | Fixed Collectable (items#200) | All collectables cleared               | None           | Speed-based (less time = better)    |
| Picker | Fixed Time (items#200)        | Timer ends                             | None           | Score-based (more pickups = better) |
| Filler | - (items#700)                 | All color-matched collectables cleared | None           | Speed-based (less time = better)    |

**Notes:**
- This game currently has no loss conditions; all modes end when the win condition is met
- Picker mode with `remain_counter` uses speed-based scoring
- Picker mode with `timer` uses score-based scoring
- Filler mode is always speed-based (fastest completion time wins)
- See items#236 for detailed scoring formulas

