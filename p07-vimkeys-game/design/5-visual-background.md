# visual-background

## 000:Maps

The current gameplay only renders a single grid map at a time.

The player moves around inside the grid exclusively via these keybindings: hjkl.

I would like to expand the idea further to render multiple grids at a time.

Players could choose to use "hjkl" to move around different grids once they touch the boundaries between each grid.

Also, the game should introduce new keybindings to make the player teleport between each grid using one keystroke.

### 010:Examples

Given 9 grids on the screen at a time in a 3×3 layout:

The player is positioned on the top-left grid (0,0).

Player pressing HJKL (capitalized) would expect the following results:
- H => nothing happens
- J => move to the downside grid (1,0)
- K => nothing happens
- L => move to the rightside grid (0,1)
