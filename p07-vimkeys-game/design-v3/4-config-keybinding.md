# config-keybinding

All keybindings should be configurable.
Keybindings are basically actions to trigger a movement.
Thus, they should be defined in [action-movement](./2-action-movement.md)

## 100:Default Keybinding Table

Remappable keys:

| Action                   | Default Key | Category         |
| ------------------------ | ----------- | ---------------- |
| Move Left                | `h`         | Basic Move       |
| Move Down                | `j`         | Basic Move       |
| Move Up                  | `k`         | Basic Move       |
| Move Right               | `l`         | Basic Move       |
| Grid Left                | `shift+h`   | Grid Move        |
| Grid Down                | `shift+j`   | Grid Move        |
| Grid Up                  | `shift+k`   | Grid Move        |
| Grid Right               | `shift+l`   | Grid Move        |
| Jump to previous sigil 1 | `A`         | Sigil 1 Backward |
| Jump to previous sigil 2 | `S`         | Sigil 2 Backward |
| Jump to previous sigil 3 | `D`         | Sigil 3 Backward |
| Jump to previous sigil 4 | `F`         | Sigil 4 Backward |
| Jump to next sigil 1     | `a`         | Sigil 1 Forward  |
| Jump to next sigil 2     | `s`         | Sigil 2 Forward  |
| Jump to next sigil 3     | `d`         | Sigil 3 Forward  |
| Jump to next sigil 4     | `f`         | Sigil 4 Forward  |

Reserved keys:

| Action                                | Default Key   |
| ------------------------------------- | ------------- |
| Start/stop game (see Game Flow)       | `\`           |
| Randomize level (dynamic levels only) | `<backspace>` |
| Switch to previous level              | `[`           |
| Switch to next level                  | `]`           |
| Always opens/closes settings menu     | `Escape`      |
| Confirms selections in menus          | `Enter`       |

## 200:Keybinding Constraints

1. **Conflict Resolution**
   - If a user tries to assign a key already in use, show a warning
   - Offer to swap the bindings or cancel the change
   - Macros cannot use keys already bound to other actions

2. **Key Combinations**
   - Support modifier keys: `Ctrl`, `Shift`, `Alt`
   - Maximum one modifier per binding
   - `Ctrl+letter` combinations are allowed
   - `Shift+letter` produces uppercase (treated as different key)

## 300:Keybinding Storage

Keybindings are stored per save slot:

```json
{
  "slot_id": 1,
  "keybindings": {
    "move_left": "y",
    "move_down": "u",
    "move_up": "i",
    "move_right": "o",
    "prev_a": "q"
  }
}
```

only the user-defined part are saved (i.e. no need to store the settings if it is identical to the system default)
