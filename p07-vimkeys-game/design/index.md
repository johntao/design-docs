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

## 100:Implementation Prompt

- Encapsulate the main program into one standalone HTML file; define game levels in another JS file
  - name the main program `deisign-v3/main.html`
  - name the level data `deisign-v3/level.js`
- Zero frameworks and libraries
- Split the implementation into several phases (commits) such that the game can be tested in a more granular-sense