# config-keybinding

All keybindings should be configurable.
Keybindings are basically actions to trigger a movement.
Thus, they should be defined in [action-movement](./2-action-movement.md)

## Default Keybinding Table

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
| Find Angle '<' Backward            | `q`         | Sigil Movement            |
| Find Angle '<' Forward             | `w`         | Sigil Movement            |
| Find Angle '>' Backward            | `e`         | Sigil Movement            |
| Find Angle '>' Forward             | `r`         | Sigil Movement            |
| Find Alphabet Backward             | `a` + char  | Sigil Movement            |
| Find Alphabet Forward              | `s` + char  | Sigil Movement            |
| Repeat Find Alphabet Backward      | `d`         | Repeater                  |
| Repeat Find Alphabet Forwardd      | `f`         | Repeater                  |
| Swap between head and tail         | `z`         | Body Control (snake mode) |
| Shrink the body length to 1        | `x`         | Body Control (snake mode) |
| Toggle between head or body-driven | `c`         | Body Control (snake mode) |
| Detach the head                    | `v`         | Body Control (snake mode) |

Reserved keys:

| Action                                | Default Key   |
| ------------------------------------- | ------------- |
| Start/stop game (see Game Flow)       | `\`           |
| Switch to previous game mode          | `-`           |
| Switch to next game mode              | `=`           |
| Randomize level (dynamic levels only) | `<backspace>` |
| Switch to previous level              | `[`           |
| Switch to next level                  | `]`           |
| Always opens/closes settings menu     | `Escape`      |
| Confirms selections in menus          | `Enter`       |

## Keybinding Constraints

1. **Conflict Resolution**
   - If a user tries to assign a key already in use, show a warning
   - Offer to swap the bindings or cancel the change
   - Macros cannot use keys already bound to other actions

2. **Key Combinations**
   - Support modifier keys: `Ctrl`, `Shift`, `Alt`
   - Maximum one modifier per binding
   - `Ctrl+letter` combinations are allowed
   - `Shift+letter` produces uppercase (treated as different key)

## Keybinding Storage

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

### design notes

only the user-defined part are saved (i.e. no need to store the settings if it is identical to the system default)