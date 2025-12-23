# visual-hud

Information about score, game status, and configuration modal popup.

## 000:Score Board

### 010: In-Game Display

While in-game, the HUD displays:

| Element           | Position                | Description                                                    |
| ----------------- | ----------------------- | -------------------------------------------------------------- |
| Current Score     | Top-left                | Running score total                                            |
| Combo Counter     | Top-left (below score)  | Current combo multiplier (if active)                           |
| Timer             | Top-right               | Elapsed time or countdown (mode-dependent)                     |
| Collectable Count | Top-right (below timer) | Remaining collectables (Picker) or progress indicator (Filler) |
| Current Color     | Bottom-left             | Active track color (Filler mode only)                          |
| Stop Hint         | Bottom-right            | "Press `\` to stop"                                            |

### 020: Out-of-Game Display

While out-of-game:

| Element               | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| Game Mode Selector    | Toggle between Picker and Filler modes                     |
| Previous Game Score   | Score from the most recent game session                    |
| Highest Score         | Highest score ever achieved (per level)                    |
| Level Switch          | Current level name with navigation hints (`=` / `<backspace>`) |
| Configuration Access  | Button/link to open settings modal                         |
| Start Hint            | "Press `\` to start"                                       |

## 100:Settings Modal

### 110: Modal Structure

The settings modal contains two main tabs accessed via toggle buttons:

```
┌─────────────────────────────────────────┐
│  [Gameplay] [Keybindings]               │
├─────────────────────────────────────────┤
│                                         │
│  (Tab content area)                     │
│  Save Slot: [1] [2] [3]                 │
├─────────────────────────────────────────┤
│  [Apply] [Reset to Default] [Cancel]    │
└─────────────────────────────────────────┘
```

### 120: Gameplay Tab Contents

The Gameplay tab displays different options depending on the selected game mode. Picker mode and Filler mode each have their own set of configurable settings.

**Picker Mode Settings:**

| Setting             | Type     | Options                                      | Reference            |
| ------------------- | -------- | -------------------------------------------- | -------------------- |
| Game Mode           | Radio    | Picker / Filler                              | items#200, items#700 |
| Score Mode          | Radio    | Score-based / Speed-based                    | items#220, items#230 |
| Grid Size           | Dropdown | Small (8×8) / Medium (12×12) / Large (16×16) | items#810            |
| Collectable Density | Slider   | Low / Medium / High                          | items#820            |
| Body Length Mode    | Radio    | Variable / Fixed                             | items#180, items#183 |
| Fog of War          | Toggle   | On / Off                                     | items#510            |

**Filler Mode Settings:**

| Setting             | Type     | Options                                      | Reference            |
| ------------------- | -------- | -------------------------------------------- | -------------------- |
| Game Mode           | Radio    | Picker / Filler                              | items#200, items#700 |
| Grid Size           | Dropdown | Small (8×8) / Medium (12×12) / Large (16×16) | items#810            |

Note: Filler mode excludes Score Mode (always speed-based), Body Length Mode (disabled per items#700), and Fog of War (not applicable to static levels).

### 130: Keybindings Tab Contents

Displays the keybinding table from items#310 in an editable format:
- Click on a key cell to rebind
- Visual indicator for conflicts
- "Reset" button per row to restore default

### 140: Save Slots

- Three save slots for storing different configurations
- Gameplay settings and keybindings are saved into separate slots
- Visual indicator showing which slot is currently active
- Slot format defined in items#330
