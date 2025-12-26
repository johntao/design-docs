# config-gameplay

## 100:endgame-cond-1_stopwatch and limited coins

Start a stopwatch once the game is started.
End the game once the last coin is picked up.
The game ends once all the coins are picked up; the score is determined by how fast the player ends the game (less time spent is better).

Extra notes:
- picker and filler mode use this endgame condition, and it is not configurable

configurable options:
- #n/a

## 200:maximum displaying coins

The game displays all the coins at a time by default.
Details:
- implements a config to restrict the maximum displaying coins to a value (e.g., max 5 at a time)
- stands as global vision constraint
- only restrict the visibility of coins, doesn't affect other items

configurable options:
- the amount of maximum displaying coins
  - set to zero will display all coins at once
  - defaults to zero for [endgame-cond-1](#endgame-cond-1_stopwatch-and-limited-coins)
  - defaults to 10 for [endgame-cond-2](#endgame-cond-2_countdown-and-unlimited-coins)

## 300:line of sight

This feature is also stands as fog of war where the player now have limited vision for the surroundings

Extra notes:
- stands as fog of war (local vision constraint)
- restrict visibility of all types of items
- set the value to 5 means the player now discover approximately 5 radius of cells
- the fog of war is a soft vision limitation which means players may still activate spcial movements even if the target is not in the sight
- it is not recommend to enable both maximum displayable coins and line of sight in the same time, just choose one or another

configurable options:
- the radius of the player's line of sight
  - set to zero would disable this feature
  - defaults to zero

## 400:config slots

The game provides settings for users to configure their keybindings or gameplay.

The game should provide saving slots for users to store their settings.

Extra rules:
- each game mode handle separate saving slots (5 slots for each game mode)
- gameplay configs and keybindings are handle together in the same save slot

configurable options:
- none

## 500:endgame-cond-2_countdown and unlimited coins

Start a countdown timer once the game is started.
End the game once the timer count to zero.

Additional information:
- Render coins dynamically along with the game progress
  - the render amount is capped by [max_display](#maximum-displayable-coins)
- the score is determined by how many coins the player picked
- score-booster and snake mode use this endgame condition, and it is not configurable

configurable options:
- #n/a

## 600:score booster feature set

configurable option:
- this feature set is enabled exclusively to score-booster mode
- options to enable each booster rule
  - combo_unstoppable (defaults on)
  - decremental counter (defaults on)
  - combo_ocd (defaults off)
  - violatile coin (defaults off)

extra notes:
- rule combo_ocd is mutually exclusive to combo_unstoppable AND decremental counter
  - reason 1: there should be one combo logic at a time
  - reason 2: too many numbers around a coin would violate 4th design principle

### 610:Combo_unstoppable

A combo streak state: the streak refreshes if the player picks up a coin within 4 steps (i.e., within steps 1, 2, 3, or 4).

The player loses the combo streak if they make 5 or more consecutive steps without picking up a coin.

The player will gain extra scores picking up a coin while maintaining the streak.

e.g., get one more score if surpassing x2 combo (i.e., x3+); get two more scores if surpassing x5 combo (i.e., x6+); get three more scores if surpassing x8 combo (i.e., x9+); capped extra scores at three.

configurable options:
- maximum steps before losing the combo streak (defaults to 4 inclusive, lose all streak on 5)
- the minimum combo streak to gain extra score (defaults to 3 inclusive, gain extra score on 4th)
  - 1..3 no bonus; 4..6 one extra; 7..9 double extra; ...etc
- the amount of extra score, defaults to 1
  - if set to 2
    - 4..6 gain +2 score
    - 7..9 gain +4 score
- maximum extra score, defaults to 3
  - if set to 3 then the bonus score is capped at triple extra
    - 1..3 no bonus; 4..6 one extra; 7..9 double extra; 10..N triple extra
  - if set to 0 then the bonus score does not cap
    - 10..12 triple; 13..15 x4; 16..18 x5; ...etc

### 620:Decremental Counter

Make every newly spawned coin worth an extra score of 5, then reduce the extra score each time the player moves.
This mode synergizes well with [combo streak](#combo_unstoppable) since both of them keep the player prioritizing the nearest coins.

Extra notes:
- the game should render the counter aside or on top of the coin

configurable options:
- counter of a newly spawned coin (defaults to 5)
- decrement steps (defaults to 1)

### 630:combo_ocd

Mark coins with an ordinal sequence.

The player gains combo streak while picking up coins in the correct order.  
Lose all streak if picking up coins in the wrong order.

While maintaining the combo streak, player gain extra score on picking up coins.

The extra score grows arithmetically (e.g., +1, +2, +3...).

configurable options:
- amount of coins to mark with an ordinal sequence (defaults to 3)
  - player should always aim to pick up coin marked as 1
  - picking up coin other than 1 would break the streak
  - once the coin is picked, the sequence shift
    - e.g. a new coin is marked as 3; 2 (previous) --> 1; 3 (previous) --> 2;
    - the game engine would maintain a single queue, for this task
    - thus, the sequence should be deterministic behind the scene
- maximum bonus score: the bonus score should cap by this value (defaults to 5)
  - e.g. once the combo reach to 6, the bonus value would be capped by 5

### 640:violatile coin

Randomly drop a time-sensitive (volatile) coin.

This one is similar to [decremental counter](#decremental-counter) except that the coin disappears automatically if the counter runs below 1.

The initial counter of the volatile coin is 10, then, decrease by 2 for each movement action

Grant extra score equals to the remain value of the counter

Exrta notes:
- this volatile coin does not count into any combo mechanism

configurable options:
- the initial value (defaults to 10)
- decremental step (defaults to 2)

### 650:Calculation Formula

This section defines the exact calculations for all scoring mechanisms.

#### 651:Base Score

```
base_score = coins_picked × 1
```

Every coin picked adds 1 to the base score.

#### 652:[Combo_unstoppable Formula](#combo_unstoppable)

```
combo_bonus = floor(combo_streak / 3)
combo_bonus = min(combo_bonus, 3)  // Capped at 3

score_per_pickup = 1 + combo_bonus
```

| Combo Streak   | Bonus Points | Total per Pickup |
| -------------- | ------------ | ---------------- |
| 1-2 (no combo) | +0           | 1                |
| 3-5 (x3..5+1)  | +1           | 2                |
| 6-8 (×6..8+2)  | +2           | 3                |
| 9+ (×9..+3)    | +3           | 4                |

#### 653:[Decremental Counter Formula](#130decremental-counter)

```
counter_bonus = max(0, 5 - steps_since_spawn)
score_per_pickup = 1 + counter_bonus
```

Each coin spawns with a 5-point bonus that decreases by 1 per player step.

#### 654:[combo_ocd Formula](#combo_ocd)

```
order_bonus = consecutive_correct_pickups
score_per_pickup = 1 + order_bonus

// On breaking the streak:
order_bonus = 0
```

Bonus grows arithmetically: +1 for 1st correct, +2 for 2nd correct, +3 for 3rd, etc.

#### 655:[violatile coin Formula](#150violatile-coin)

```
expiration_bonus = remaining_countdown
score_per_pickup = 1 + expiration_bonus

// If countdown reaches 0:
coin disappears, no score awarded
```

#### 656:Final Score Calculation

```
final_score = sum(score_per_pickup for each pickup)
```

## 700:coloring feature set

Each coin now comes with a color code to match.
The player can pick up (equip) a color spray to match the condition.

A color spray respawns automatically after the player made 4 movements, which ensures the player can always beat the level.
Picking up a new color spray would replace the previous color directly.

Extra rules:
- when a coin is picked up, the cell containing the coin is colored by the matched color (by checking the equipped color spray)
  - this cell is not colorable afterward
- alternative, implement a feature to color all the visited cells by the current equipped color spray
  - this does not affect cells that were colored by matching coin conditions
- alternative, the color spray now expired after coloring too much cells (e.g. expired after coloring 10 cells)
  - if the spray expired, then, the player needs to replenish the item again

configurable options:
- this feature set is enabled exclusively to filler mode
- whether to color visited cells automatically or not (defaults to NOT)
- set how many cells a spray could color before expiration
  - set to zero would disable this feature
  - defaults to zero

### 710:dropped_Explicit Fill-Up Command

**Reason for dropping:** Violates the first design principle (extra keypresses).

Originally tried to let the player hit space to fill up a cell. Both making the player explicitly hit space to fill up a cell and hitting space to toggle filling behavior violate the first design principle because it makes players hit extra spaces to complete the game. The threshold feature (requiring un-coloring of unrelated cells) also felt tedious after playthroughs.

### 720:dropped_Stroke Width

**Reason for dropping:** Over-complicates gameplay.

A feature to fill in multiple cells at once

### 730:dropped_Stroke Depth

**Reason for dropping:** Unnecessary complexity.

A feature to make different levels of filling colors when a coin appears twice in the same cell. However, filler mode renders all coins on game start; respawning coins introduces unnecessary complexity without improving the gaming experience.

## 800:snake feature set

Pick up a coin now also increase the length of the player by 1. (just like how the classic snake game does)

Additional features while the player's length is greater than 1:
- the first bit driven the body is the head
- the last bit dragged by the head is the tail
- get bonus score equals to the current body length
  - e.g. body length = 2, picking up a coin would give 1 + (2-1) score
  - e.g. body length = 3, picking up a coin would give 1 + (3-1) score
- there's a command to swap the position of head and tail
- there's a command to change snake movement from head-driven to body-driven
  - i.e. hitting `l` would make the entire body move one unit right
  - each cell of the body calculate collision
    - hitting an obstacle or a portal would cause the body split into smaller segments
      - the part that occur the collision is wiped out
      - enter head-driven mode after the collision
      - the head restore on the longest segment
        - restore in the either end of the segment randomly
        - segements having the same length, choose one randomly
        - end the game immediately if there's no available body part to restore the head
    - all collided coins are picked up
    - hitting the boundary would cancel the movement similar to how it normally works
  - hitting the command again, restore back to head-driven mode
- using a teleport-based command would detach the player's head
  - which would left the body part behind
  - hitting a portal by head also share the same effect (body is left behind)
- there's a command to set the body length to 1
  - and teleport the head to the position of the tail before the shrink
- hitting the detached body by head would reconnect the whole body automatically
  - re-attach the body part would also get 1 score
  - and then, teleport the head to the tail part of the body when last time detached
- hitting the attached body by head would decrease the length of body by 1
  - and trigger a swap between head and tail

configurable options:
- this feature set is enabled exclusively to snake mode
- maximum bonus score given while the length of the body is greater than 1 (defaults to 5)
  - e.g. body length = 6, picking up a coin would give 1 + min(6-1, 5) score
  - e.g. body length = 7, picking up a coin would give 1 + min(7-1, 5) score
- score given when re-attach to a body part (defaults to 1)
- [violatile coin](#violatile-coin) borrowed from [score-booster feature set](#score-booster-feature-set)
  - defaults ON

### 810:dropped_body driven mode cannot collide special item

**Reason for dropping:** too boring (refer to 5th design principle)

in the body driven mode, one of the possible outcome after collision is to cancel the movement if special items (e.g. portals or obstacles) were in the path

### 820:dropped_body driven mode ghost out

**Reason for dropping:** too boring (refer to 5th design principle)

in the body driven mode, one of the possible outcome after collision is to make the body part just overlap onto the special items (e.g. portals or obstacles) without triggering any side effects (i.e. ghost out directly)

### 830:dropped_get extra score for hitting body part while attaching

**Reason for dropping:** unnecessary complexity (refer to 4th design principle)

this feature grant the player extra score for hitting body part while attaching, the behavior is very similar to picking up a coin except that the length of body is reduce afterward

the game already give extra score for re-attaching the head to detached body, it is unnecessary to introduce another mechanism doing a similar thing

also, noted that if reducing the length of body grant extra score, then it would motivate the player to reduce the length of body to zero before the game ends

and the game also provide a shortcut to reduce the length to zero

with all these arguments, it is obviously a feature deserved to be dropped

### 840:extra design note

originally, the game rely on certain commands to expand/ shrink the body length
which would make the gameplay less attractive
the game would be more interesting and interactive if a certain result is caused by delicate instructions instead of a directly keystroke

## 900:game mode specific

### 910:design notes

it is obvious that some of the features may work interchangeably across different modes
for example:
- score-booster mode may also use a stopwatch, and rendered limited amount of coins
- enable snake feature in score-booster mode
- filler mode may also use a countdown timer, enabling all the score-booster features

however, this type of freedom or feature mixin might cause significantly negative impact to the player experience

it is designer's duty to reduce player's cognitive load (4th design principle), and make the opinionated design decisions to maximize the game experience

### 920:shared

implement these features:
- [maximum displaying coins](#maximum-displaying-coins)
- [config slots](#config-slots)
- [line of sight](#line-of-sight)

### 930:picker mode impl

Picker (or pick-up) mode is the basic game mode where the game drops coins at random or fixed positions on the view.

inherit all features from [shared](#920shared)

implement these additional features:
- [endgame condition 1](#endgame-cond-1_stopwatch-and-limited-coins)

### 940:score-booster mode impl

The players try to gain as many scores as possible in a fixed amount of time.

inherit all features from [shared](#920shared)

implement these additional features:
- [endgame condition 2](#endgame-cond-2_countdown-and-unlimited-coins)
- [score booster feature set](#score-booster-feature-set)

### 950:filler mode impl

inherit all features from [picker mode](#picker-mode-impl)

implement these additional features:
- [coloring feature set](#coloring-feature-set)

### 960:snake

inherit all features from [shared](#920shared)
implement these additional features:
- [endgame condition 2](#endgame-cond-2_countdown-and-unlimited-coins)
- [snake feature set](#snake-feature-set)
