# Plan: Implement Vimkeys Game in 5 Stages

## Overview
Implement the game spec incrementally across 5 stages, building from basic functionality to full features.

**File:** `../main.html`

---

## Stage 1: Core Foundation [DONE]

| ID | Task | Status |
|----|------|--------|
| 1.1 | Standalone HTML/CSS/JS structure | Done |
| 1.2 | 10×10 CSS grid rendering | Done |
| 1.3 | Player rendering (`▢`) at (2,3) | Done |
| 1.4 | Collectable rendering (`•`) × 9 (fixed positions) | Done |
| 1.5 | Max display limit (configurable, default 5) | Done |
| 1.6 | Game state toggle (`\` key) | Done |
| 1.7 | Basic movement (customizable keybindings) | Done |
| 1.8 | Collision detection (pickup) | Done |
| 1.9 | HUD: timer, previous, best (timer-based mode 2) | Done |
| 1.10 | Settings modal with input fields | Done |

---

## Stage 2: Levels & Items

| ID | Task | Description |
|----|------|-------------|
| 2.1 | Win condition | Stop game when all collectables cleared |
| 2.2 | Timer display | Show elapsed time in HUD |
| 2.3 | Reserved keys | Implement `=`, `Backspace`, `]`, `Enter` |
| 2.4 | Level data structure | Define level format with items array |
| 2.5 | Demo level | Endless mode, auto-respawn collectables |
| 2.6 | Predefined levels (×3) | Fixed layouts with spawn positions |
| 2.7 | Level switching | `=` next, `Backspace` prev |
| 2.8 | Dynamic level generation | Random placement with `]` to regenerate |
| 2.9 | Obstacle item (`█`) | Blocking collision |
| 2.10 | Portal item (`◯`) | Paired teleportation |

---

## Stage 3: Advanced Movement

| ID | Task | Description |
|----|------|-------------|
| 3.1 | Angle bracket sigils | Render `<` and `>` on grid |
| 3.2 | Sigil movement `qwer` | Jump to angle brackets (forward/backward) |
| 3.3 | Alphabet sigils | Render a-z on grid |
| 3.4 | Find char `f`/`d` | Two-key sequence to jump to alphabet |
| 3.5 | Pending action state | Handle two-key input sequences |
| 3.6 | Repeater `n.` | Repeat last non-basic movement |
| 3.7 | Repeater `m,` | Repeat with line skip |
| 3.8 | Track last movement | Store last non-basic movement type |
| 3.9 | Body expansion `zxc` | Head/body/tail switching |
| 3.10 | Variable length mode | Extend/shrink body on movement |
| 3.11 | Fixed length mode | Move entire body at once |
| 3.12 | Snake rendering | Render multi-cell player body |
| 3.13 | Grid movement `Ctrl+hjkl` | Teleport between grids |
| 3.14 | Multi-grid layout | Render multiple grids (3×3 max) |

---

## Stage 4: Scoring & Game Modes

| ID | Task | Description |
|----|------|-------------|
| 4.1 | Combo streak | Track consecutive pickups within 4 steps |
| 4.2 | Combo bonus | +1/+2/+3 bonus at streak thresholds |
| 4.3 | Combo HUD | Display combo counter |
| 4.4 | Decremental counter | Bonus decreases per step since spawn |
| 4.5 | Ordered collectables | Bonus for correct pickup order |
| 4.6 | Expiration system | Collectables disappear after countdown |
| 4.7 | Score-based mode | Fixed timer, maximize score |
| 4.8 | Countdown timer | Timer mode HUD display |
| 4.9 | Dynamic spawning | Spawn collectables during timer mode |
| 4.10 | Filler mode | Color-matching collectables |
| 4.11 | Color sources | Pickup colors to match requirements |
| 4.12 | Track coloring | Visual trail behind player |
| 4.13 | Fog of war | Limited visibility radius |

---

## Stage 5: Configuration & Polish

| ID | Task | Description |
|----|------|-------------|
| 5.1 | Settings gameplay tab | Mode, grid size, density options |
| 5.2 | Settings keybindings tab | Display keybinding table |
| 5.3 | Click-to-rebind | Interactive keybinding editor |
| 5.4 | Conflict detection | Warn on duplicate bindings |
| 5.5 | Reset to default | Restore default keybindings |
| 5.6 | Save slots (×3) | Store configurations |
| 5.7 | localStorage persistence | Save/load game state |
| 5.8 | Macro system | Define action sequences (max 6) |
| 5.9 | Macro execution | Execute recorded macros |
| 5.10 | Performance optimization | Input latency < 16ms |
| 5.11 | Visual polish | Animations, transitions |
| 5.12 | Final testing | Cross-browser validation |

---

## Task Reference Index

### Stage 1: Core Foundation
- `1.1` - `1.10`: Basic game structure and rendering

### Stage 2: Levels & Items
- `2.1` - `2.2`: Win/timer mechanics
- `2.3` - `2.8`: Level system
- `2.9` - `2.10`: New item types

### Stage 3: Advanced Movement
- `3.1` - `3.5`: Sigil movement
- `3.6` - `3.8`: Repeater system
- `3.9` - `3.12`: Body expansion
- `3.13` - `3.14`: Multi-grid

### Stage 4: Scoring & Game Modes
- `4.1` - `4.3`: Combo system
- `4.4` - `4.6`: Score boosts
- `4.7` - `4.9`: Timer mode
- `4.10` - `4.13`: Filler mode & fog

### Stage 5: Configuration & Polish
- `5.1` - `5.5`: Settings modal
- `5.6` - `5.7`: Persistence
- `5.8` - `5.9`: Macros
- `5.10` - `5.12`: Polish
