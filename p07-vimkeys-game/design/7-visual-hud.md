# visual-hud

Information about score, game status, and configuration modal popup.

## 100:Score Board

### 110:In-Game Display

While in-game, the HUD displays:

| section | Element         | Description                      |
| ------- | --------------- | -------------------------------- |
| TOP     | Current Score   | Score gains from various sources |
| TOP     | Countdown Timer | Timer (defaults to 30s)          |

### 120:Out-of-Game Display

While out-of-game:

| section | Element              | Description                                          |
| ------- | -------------------- | ---------------------------------------------------- |
| TOP     | Previous Game Score  | Score from the most recent game session              |
| TOP     | Highest Score        | Highest score ever achieved (per game-mode + level)  |
| TOP     | Level Switch         | Current level name with navigation hints (`[` / `]`) |
| TOP     | Start Hint           | "Press `\` to start"                                 |
| BOT     | Configuration Access | Button/link to open settings modal                   |

## 200:Settings Modal

### 210:Modal Structure

The settings modal contains two main tabs accessed via toggle buttons:

```
┌─────────────────────────────────────────┐
│  [Gameplay] [Keybindings]               │
├─────────────────────────────────────────┤
│                                         │
│  (Tab content area)                     │
├─────────────────────────────────────────┤
│  Save Slot: [1] [2] [3] [4] [5]         │
│  [Apply] [Reset to Default] [Cancel]    │
└─────────────────────────────────────────┘
```

### 220:Gameplay Tab Contents

- gameplay
  - countdown timer (def: 30s)
  - line of sight (def: 0)
  - sigil letters sequence (def: `asdf`)
- random level generation
  - obstacle_density (def: 10)
  - sigil_density (def: 10)
  - portal_density (def: 10)
- coin
  - maximum displaying coins (def: 10)
  - spawning frequency (def: 4 actions)
- volatile coin
  - initial counter (def: 5)
  - decremental step (def: 1)
  - spawning frequency (def: 8)
- score booster
  - maximum bonus score (def: 5)
  - reattach score (def: 1)

### 230:Keybindings Tab Contents

Displays the keybinding table in an editable format:
- Display system & user definition per row
  - system def is read-only
  - user def is editable
  - left user def blank to use the system defaults
- Visual indicator for conflicts
