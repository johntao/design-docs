# Index
- [game-core: intro and flow](./0-game-core.md)
- [game-level: level design](./1-game-level.md)
- [action-movement](./2-action-movement.md)
  - core, snake, backlog
- [config-gameplay](./3-config-gameplay.md)
  - core, picker, filler, snake
  - keywords: timer, remain-counter, win-loss-condition
- [config-keybinding](./4-config-keybinding.md)
- [visual-background](./5-visual-background.md)
  - keywords: map, grid, view
- [visual-foreground](./6-visual-foreground.md)
  - keywords: item, player, collectable, sigil, obstacle, portal
  - quick definition: foreground refers to items rendered in a cell
  - to-be-defined: type and maximum amount of items that can be rendered in the same cell
- [visual-hud](./7-visual-hud.md)
  - keywords: score board, configuration modal

## Implementation Prompt

- Encapsulate the main program into one standalone HTML file
  - name the main program `deisign-v2/main.html`
  - name the level data `deisign-v2/level.js`
- Separate game level definition to another JS file
- Zero frameworks and libraries
- Skip design notes and appendix, no need to implement contents in the appendix
- Split the implementation to 3 to 5 phases (commits) such that the game can be tested in a more granular-sense

## Phase 1 Testing

- fix the visual effect when the player step onto an item
  - put the player on top of the item, instead of put the player aside of the item
- the portals doesn't work as expected, fix it
- each sigil should have minimal amount of 4
- minimal of coins for each levels should be set to 9
- I found out duplicate sigil alphabet existed in the same cell, fix it
  - each cell should have at max one sigil-alphabet