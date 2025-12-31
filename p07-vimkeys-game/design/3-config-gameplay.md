# config-gameplay

## 100:endgame condition: countdown timer

Start a countdown timer once the game is started.
End the game once the timer count to zero.

Additional information:
- Spawning coins dynamically along with the game progress
  - the spawn amount is defined by maximum coin amount
  - the spawn logic is defined by coins spawning frequency
- player get scores from collecting coins (including volatile coin)
  - collecting detached body parts

configurable options:
- countdown timer defaults to 30 seconds

## 200:maximum coin amount

maximum displaying coins is capped by 10

Details:
- set to zero to remove the maximum limitation
- the value defaults to 10

Details:
- implements a config to restrict the maximum displaying coins to a value (e.g., max 5 at a time)
- stands as global vision constraint
- only restrict the visibility of coins, doesn't affect other items

configurable options:
- maximum displaying coins (defaults to 10)

### 210:design principle

if the value is TOO HIGH, the player would feel exhausted for failing to clear the screen

if the value is TOO LOW, then, some of the advanced rewarding mechanism would be TOO HARD to trigger

## 300:coins spawning frequency

two major rules for the frequency of spawning logic:
1. ensure there's always at least one coin on the map
   - the game should avoid zero coin presented on the map
   - zero coin confuse the player for the progress of the game
2. spawning new coins per 4 actions the player used
   - spawning coins too fast would increase cogitive load (it makes the player feel exhausted for not able to clear out the map)
   - spawning coins too slow would reduce the incentive of achieving the existing rewarding mechanism

configurable options:
- spawning new coins per X player actions (defaults to 4)

## 400:line of sight

This feature is also stands as fog of war where the player now have limited vision for the surroundings

Extra notes:
- stands as fog of war (local vision constraint)
- restrict visibility of all types of items
- set the value to 5 means the player now discover approximately 5 radius of cells
- the fog of war is a soft vision limitation which means players may still activate spcial movements even if the target is not in the sight

configurable options:
- the radius of the player's line of sight
  - set to zero would disable this feature
  - defaults to zero

## 500:config slots

The game provides settings for users to configure their keybindings or gameplay.

The game should provide saving slots for users to store their settings.

Extra rules:
- gameplay configs and keybindings are handle together in the same save slot

configurable options:
- none

## 600:collectable_volatile coin

Randomly drop a time-sensitive (volatile) coin per 8 player's actions

A decremental counter is presented on the coin, which decrease by 1 for each player's action

The initial value of the counter is set to 5, the coin vanish when the counter goes below 1.

Exrta notes:
- give extra score equals to the remain value of the counter
  - synergy with score booster rule
  - e.g. body length = 3, decremental counter = 2: gives 1 + 2 + (3-1) = 5 score
- give extra score if already enter rigid mode
  - use this formula to calculate the score
  - body length = 3, decremental counter = 2: gives 1 + 2 + (3-1) + MAX(3,2) = 8 score

configurable options:
- the initial value (defaults to 5)
- decremental step (defaults to 1)
- respawn frequency per N player's action (defaults to 8)

## 700:score booster

get bonus score equals to the current body length
- e.g. body length = 2, picking up a coin would give 1 + (2-1) score
- e.g. body length = 3, picking up a coin would give 1 + (3-1) score

normally hitting detached parts get one score without bonus
however, in rigid mode, hitting detached parts also grant bonus score
- e.g. body length = 2, hitting detached parts would give N + (2-1) score (N equals to the length of the detached parts)
- e.g. body length = 3, hitting detached parts would give N + (3-1) score (N equals to the length of the detached parts)

configurable options:
- maximum bonus score given while the length of the body is greater than 1 (defaults to 5)
  - e.g. body length = 6, picking up a coin would give 1 + min(6-1, 5) score
  - e.g. body length = 7, picking up a coin would give 1 + min(7-1, 5) score
  - set to zero to disable the maximum limit
- score given when reattach to a body part (defaults to 1)

## 800:random level generation

configurable options:
- obstacle_density (def: 10)
- sigil_density (def: 10)
- portal_density (def: 10)

## 900:sigil move

configurable options:
- sigil sequence: `asdf`
  - which maps to sigil 1..4
