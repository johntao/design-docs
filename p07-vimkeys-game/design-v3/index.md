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

## revision 4

let's tweak the gameplay again:
- there should be three types of coins (i.e. yellow dot, green dot, orange dot)
  - the first type is the existing one that grant the player 1 score, and increase the body length by one (the yellow dot)
  - the second type is very similar to yellow dot, except that it doesn't increase player's body length (the green dot)
  - the third type is the new one that prolong the timer by 1 second, and doesn't increase the body length (the organge dot)
- there should be two types of state (i.e. green body and red body)
  - the first type is the initial on starting the game (green body)
  - the second type is overcharged on picking up a volatile coin (red body)
- I would like to make the green body also supports "attack" which means the head hitting onto attached body parts
  - use this algorithm:
  - when the attack happened, the body is split into two parts
  - the first part: from the head to the attacked part; the second part: from the attacked part to the tail
  - the attacked part is vanished
  - the second part convert into orange coins
- similarly, the detach algorithm should be rework
  - the game currently use sigil/ grid move to detach head and body
  - the body is left behind which is also stands as detached part
  - the head can then "reattach" to the part, grant one score, reconnect as a whole, and then, swap head/ tail position
  - the new design:
  - convert all the detached part as orange dots. no more complicated algorithm for "segment, reattach, detach, and swap"
- the portal doesn't work as expected
  - the current one: once the HEAD hit onto the portal, the HEAD including the rest of the body teleport to the other side
  - the expected one: the rest of the body parts are dragged piece by piece
    - e.g. given a player with body length of three (HEAD, BODY, TAIL)
    - 1. HEAD hit onto the portal, the HEAD is teleported to the destination; the BODY left behind on the source portal without teleporting; the TAIL is somewhere connected with the BODY
    - 2. the player move HEAD toward any direction; the BODY is now dragged and teleported to the destination; the TAIL is left behind on the source portal without teleporting
    - 3. the player move HEAD toward any direction; the BODY move accordingly as usual; the TAIL is dragged and teleported to the destination
- finally, let's rework the overcharge mode (i.e. red body mode)
  - in green mode, both "attack" and "detach" convert the rest of the body part to orange dots
    - in red mode, convert the rest of the body part to green dots instead of orange
  - in overcharge mode, the score boosting factor works a bit different
  - normally, the factor is based on current body length
  - however, in overcharge mode, the factor is cached and the MAX value is used
    - given an array to represent how current body length changes during the overcharge mode: [3, 2, 4, 5, 1]
    - then the effective boosting factor should be: [3, 3, 4, 5, 5]
  - note that, red body mode should works identical to green body mode, except green dots and boosting factor

## revision 5

a few more things to tweak:
- green coin
  - previous design: give score, doesn't increase body length
  - new design: give score, prolong the timer, doesn't increase body length
    - the score boosting factor in overcharge mode also affect the timer
    - e.g. body length equals to 4, then, picking up a green dot would prolong 1 + (4-1) seconds
- UI UX improvement
  - the game is not so obvious in terms of the coins and scores
  - I would like to make this thing more obvious by unified color and small volatile notification
  - green color code means score, make sure HUD display score number in green color
    - change yellow coin color to green
  - yellow color code means time, make sure HUD display timer in yellow color
    - change orange coin color to yellow
  - orange color code means time+score
    - change green coin color to orange
  - add a small +N notification near to the score and timer in the HUD section
    - N is the amount of the value rewarded from the picking up the coin (bonus included)