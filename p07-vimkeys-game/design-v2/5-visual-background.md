# visual-background

## Simple Grid

Default grid dimension: 10x10

The player moves around inside the grid exclusively via these keybindings: hjkl.

By design:
- if the a movement action hit the boundary of the grid, keep the player at the closest available cell to the boundary

## Multiple Grids

Default multiple grids layout: 3x3 (9 grids total)
Default grid dimension: 10x10
Grid margin: 10px between grids

By design:
- when the player hit the boundary of a grid, firing the basic movement `hjkl` would bring the player to adjacent grids if available
  - alternative, player could use capitalized `HJKL` to move to the adjacent grids directly
  - the expected behavior after the grid movement is to keep the player at the same relative position of the grid (before and after, should be the same)
- if player hit the left most cell of the left most grid, then, move the player left would hit the boundary as how it works in a single grid

### Examples

Given 9 grids in a 3×3 layout, each grid containing 10x10 cells

The player is positioned at cell (8,5) of the top-left grid (0,0)

Player pressing HJKL (capitalized) would expect the following results:
- H => nothing happens
- J => teleport to cell (8,5) of the downside grid (1,0)
- K => nothing happens
- L => teleport to cell (8,5) of the rightside grid (0,1)
