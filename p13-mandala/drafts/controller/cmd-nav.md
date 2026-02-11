# cmd-nav

navigation commands for moving focus between cells in the 9x9 grid.

## coordinate system

the grid uses two coordinate systems:
- `cells[row, col]` — flat 9x9 index (0-8 each)
- `og[oRow, oCol][iRow, iCol]` — outer grid + inner grid position (0-2 each)

conversion: `cells[oRow*3 + iRow, oCol*3 + iCol]`

## feature 1: inner jump (`wersdfxcv`)

jump within the current outer grid cell (subgrid).
each key maps to one of the 9 inner positions:

```
w e r       [0,0] [0,1] [0,2]
s d f  -->  [1,0] [1,1] [1,2]
x c v       [2,0] [2,1] [2,2]
```

behavior:
- changes inner grid position only
- outer grid position stays the same
- if already at the target position: no-op

## feature 2: outer jump (`WERSDFXCV`)

jump between outer grid cells, keeping the inner position.
each key maps to one of the 9 outer positions:

```
W E R       [0,0] [0,1] [0,2]
S D F  -->  [1,0] [1,1] [1,2]
X C V       [2,0] [2,1] [2,2]
```

behavior:
- changes outer grid position only
- inner grid position stays the same
- if already at the target position: no-op

## feature 3: cell walk (`hjkl`)

move focus one cell at a time in the flat 9x9 grid:

| key | direction | delta         |
|-----|-----------|---------------|
| `h` | left      | `cells[i, --j]` |
| `j` | down      | `cells[++i, j]` |
| `k` | up        | `cells[--i, j]` |
| `l` | right     | `cells[i, ++j]` |

boundary: cancel movement if out of 0-8 range.

## feature 4: fast walk (`HJKL`)

move focus three cells at a time (one outer grid unit):

| key | direction | delta         |
|-----|-----------|---------------|
| `H` | left      | `cells[i, j-3]` |
| `J` | down      | `cells[i+3, j]` |
| `K` | up        | `cells[i-3, j]` |
| `L` | right     | `cells[i, j+3]` |

boundary: cancel movement if out of 0-8 range.

## focus mechanics

- after computing target position, call `.focus()` on the target mc-cell
- browser handles the rest (`:focus` styling, scroll if needed)
- all navigation keys call `e.preventDefault()` to suppress default behavior
