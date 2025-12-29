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

- Encapsulate the main program into one standalone HTML file; define game levels in another JS file
  - name the main program `deisign-v3/main.html`
  - name the level data `deisign-v3/level.js`
- Zero frameworks and libraries
- Split the implementation into several phases (commits) such that the game can be tested in a more granular-sense

## Revision 1

Let's address a few issues:
- render tail by "⨯" to make it more obvious
- add a physic rule where the snake cannot move in the direction of its body part
  - i.e. while body length gt 1, then the head can only head toward the cell that doesn't contains its body part
  - before the change, say that body is in the right side of the head
  - the head can go all 4 directions (left, up, right, down)
  - after the change, the head can only go three directions (left, up, down)
  - i.e. the right direction is excluded
- add another physic rule where the snake can only attach to the both ends of the detached part
  - i.e. forbid the snake from attaching to an arbitrary position of the detached body
  - only the head or tail position allows attachment, the rest of the part are treated as obstacles
- alter the existing swap logic
  - before the change, whenever the head reattach to detached parts, the head always swap with the tail of the detached part
  - after the change, the swap should identify which part the head is attaching to
    - if attaching to the head of the detached part, swap the current head with the tail of the detached part
    - if attaching to the tail of the detached part, swap the current head with the head of the detached part