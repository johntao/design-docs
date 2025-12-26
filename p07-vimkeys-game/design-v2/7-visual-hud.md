# visual-hud

Information about score, game status, and configuration modal popup.

## Score Board

### In-Game Display

While in-game, the HUD displays:

| Element                       | Description                             |
| ----------------------------- | --------------------------------------- |
| Current Score and Timer       | If endgame condition 2 is used          |
| Combo Counter                 | Current combo multiplier (if active)    |
| Stopwatch and remaining count | If endgame condition 1 is used          |
| Current Color Spray           | Equipped color spray (Filler mode only) |

### Out-of-Game Display

While out-of-game:

| Element              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| Game Mode Selector   | Current mode name with navigation hints (`-` / `=`)  |
| Level Switch         | Current level name with navigation hints (`[` / `]`) |
| Previous Game Score  | Score from the most recent game session              |
| Highest Score        | Highest score ever achieved (per game-mode + level)  |
| Configuration Access | Button/link to open settings modal                   |
| Start Hint           | "Press `\` to start"                                 |

## Settings Modal

### Modal Structure

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

### Gameplay Tab Contents

The Gameplay tab displays different options depending on the selected game mode. Picker mode and Filler mode each have their own set of configurable settings.


### Keybindings Tab Contents

Displays the keybinding table in an editable format:
- Click on a key cell to rebind
- Visual indicator for conflicts
- "Reset" button per row to restore default