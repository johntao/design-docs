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

## Revision 2

I am trying to debug a weird problem, please add a debugging feature that:
- render head and body parts by numeric indices instead of specific printable characters
- make a flag to enable this debugging feature

## Revision 3

we need to rework the game mechanism. here's the new spec:
- in the original design, picking up a volatile coin would enter rigid mode; the player then moves its whole body at once instead of dragging its body by head
  - new design:
  - picking up a volatile coin, enter "overcharge" mode, the player moves as usual
  - in overcharge mode, remove the bonus capped for picking up a coin
  - in overcharge mode, the player doesn't reattach to detached body parts, instead the body part vanish and give countdown timer +N seconds
    - N equals to the length of the detached part
- in the original design, the player should split into multiple segments hitting onto portals and obstacles in rigid mode
  - new design: since there's no more rigid body move, thus, remove this split logic from the game
- in the original design, the player detach its head and body for entering a portal
  - new design: allow the player to drag its body through the portal
- make the `player.rigidCounter` a standalone config
  - rename it to overchargeCounter
- in the original design, the minimal amount of each sigil-letter is set to 4
  - a config `sigil_density` to decide the density of sigil letters in a dynamic level
  - new design:
  - fix the render amount to 2
  - replace the density logic by a fix value (defaults to 2)
- in the original design, attach to a detached body part also grant one score; detach head in the other hand give nothing
  - new design, instead of getting one score, make the countdown timer +1 second
  - detach head and body also make the countdown timer +1 second
