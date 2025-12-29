# config-keybinding

All keybindings should be configurable.
Keybindings are basically actions to trigger a movement.
Thus, they should be defined in [action-movement](./2-action-movement.md)

## 100:Default Keybinding Table

Remappable keys:

| Action                             | Default Key | Category                  |
| ---------------------------------- | ----------- | ------------------------- |
| Move Left                          | `h`         | Basic Movement            |
| Move Down                          | `j`         | Basic Movement            |
| Move Up                            | `k`         | Basic Movement            |
| Move Right                         | `l`         | Basic Movement            |
| Grid Left                          | `shift+h`   | Grid Movement             |
| Grid Down                          | `shift+j`   | Grid Movement             |
| Grid Up                            | `shift+k`   | Grid Movement             |
| Grid Right                         | `shift+l`   | Grid Movement             |
| Jump to previous a                 | `A`         | Sigil Movement            |
| Jump to previous s                 | `S`         | Sigil Movement            |
| Jump to previous d                 | `D`         | Sigil Movement            |
| Jump to previous f                 | `F`         | Sigil Movement            |
| Jump to next a                     | `a`         | Sigil Movement            |
| Jump to next s                     | `s`         | Sigil Movement            |
| Jump to next d                     | `d`         | Sigil Movement            |
| Jump to next f                     | `f`         | Sigil Movement            |

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

### 310:design notes

only the user-defined part are saved (i.e. no need to store the settings if it is identical to the system default)
