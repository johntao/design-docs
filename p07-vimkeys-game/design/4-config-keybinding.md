# config-keybinding

## 000:core

All keybindings should be configurable.
Keybindings are basically actions to trigger a movement.
Thus, they should be defined in [action-movement](./2-action-movement.md)

### 010:Default Keybinding Table

| Action                         | Default Key | Remappable | Category       | Reference |
| ------------------------------ | ----------- | ---------- | -------------- | --------- |
| Move Left                      | `h`         | Yes        | Basic Movement | items#120 |
| Move Down                      | `j`         | Yes        | Basic Movement | items#120 |
| Move Up                        | `k`         | Yes        | Basic Movement | items#120 |
| Move Right                     | `l`         | Yes        | Basic Movement | items#120 |
| Grid Left                      | `Ctrl+h`    | Yes        | Grid Movement  | items#130 |
| Grid Down                      | `Ctrl+j`    | Yes        | Grid Movement  | items#130 |
| Grid Up                        | `Ctrl+k`    | Yes        | Grid Movement  | items#130 |
| Grid Right                     | `Ctrl+l`    | Yes        | Grid Movement  | items#130 |
| Find Angle '<' Backward        | `q`         | Yes        | Sigil Movement | items#141 |
| Find Angle '>' Backward        | `w`         | Yes        | Sigil Movement | items#141 |
| Find Angle '<' Forward         | `e`         | Yes        | Sigil Movement | items#141 |
| Find Angle '>' Forward         | `r`         | Yes        | Sigil Movement | items#141 |
| Find Alphabet Backward         | `d` + char  | Yes        | Sigil Movement | items#142 |
| Find Alphabet Forward          | `f` + char  | Yes        | Sigil Movement | items#142 |
| Repeat Backward                | `n`         | Yes        | Repeater       | items#172 |
| Repeat Forward Skip Same Line  | `m`         | Yes        | Repeater       | items#172 |
| Repeat Backward Skip Same Line | `,`         | Yes        | Repeater       | items#172 |
| Repeat Forward                 | `.`         | Yes        | Repeater       | items#172 |
| Switch to Tail (+ move left)   | `z`         | Yes        | Body Control   | items#183 |
| Switch to Body                 | `x`         | Yes        | Body Control   | items#183 |
| Switch to Head (+ move right)  | `c`         | Yes        | Body Control   | items#183 |

### 020:Keybinding Constraints

1. **Reserved Keys (Cannot Be Remapped)**
   - `\` - Start/stop game (see Game Flow)
   - `=` - Switch to next level
   - `<backspace>` - Switch to previous level
   - `]` - Randomize level (dynamic levels only)
   - `Escape` - Always opens/closes settings menu
   - `Enter` - Confirms selections in menus

2. **Conflict Resolution**
   - If a user tries to assign a key already in use, show a warning
   - Offer to swap the bindings or cancel the change
   - Macros cannot use keys already bound to other actions

3. **Key Combinations**
   - Support modifier keys: `Ctrl`, `Shift`, `Alt`
   - Maximum one modifier per binding
   - `Ctrl+letter` combinations are allowed
   - `Shift+letter` produces uppercase (treated as different key)

### 030:Keybinding Storage

Keybindings are stored per save slot:

```json
{
  "slot_id": 1,
  "keybindings": {
    "move_left": "h",
    "move_down": "j",
    "move_up": "k",
    "move_right": "l",
    "grid_left": "ctrl+h",
    "find_alphabet": "f",
    "macros": {
      "macro_1": "hhhjjj",
      "macro_2": "llllk"
    }
  }
}
```

#### 031:design notes

only the user-defined part are saved (i.e. no need to store the settings if it is identical to the system default)

## 100:picker

inherit all features from [core](#000core)

## 200:filler

inherit all features from [core](#000core)

## 300:snake

inherit all features from [core](#000core)