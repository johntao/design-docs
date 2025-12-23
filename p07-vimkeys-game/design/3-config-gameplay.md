# config-gameplay

## 000:core

Picker (or pick-up) mode is the basic game mode where the game drops collectables at random or fixed positions on the view.

### 010:stopwatch

**Sub-mode 1 (fixed collectable, variable time):**
Render all collectables at once on game start.
The game ends once all the collectables are picked up; the score is determined by how fast the player ends the game (less time spent is better).

#### 011:Implementation Proposal

**Core Rule:** Only one of `timer` or `remain_counter` can be non-null at a time. They are mutually exclusive parameters that determine the game mode.

Data:
- `int? timer` - timer (defaults to null, which means sub-mode 1)
  - When set to a non-nullable integer, `remain_counter` must be null
  - Setting to 10 will create a 10-second timer (which means sub-mode 2)
    - Game ends once the timer hits zero seconds
  - Generate collectables dynamically along with the game progress
  - Newly generated positions will be added to prev_positions automatically
  - Use max_display to determine how many collectables to show at a time
- `int? max_display` - determines the maximum amount of collectables to be shown at a time (defaults to null)
  - Set to null if remain_counter is non-null
  - Null value means render all remaining collectables at once
  - Defaults to 9 if timer is non-null
- `int? remain_counter` - number of collectables to be spawned (defaults to 9)
  - When set to a non-nullable integer, `timer` must be null
  - Setting to 10 will create a remain_counter of 10
    - Game ends once the counter hits zero
  - If remain_counter gt positions.Count, the game should generate new collectables at random positions automatically until the counter hits zero
    - Newly generated positions should be added back to prev_positions
- `List<(int, int)> prev_positions` - previous collectable positions (defined in level data)
- `bool` - replace the previous positions, i.e., randomly spawn (defaults to false)
  - Reuse the previous positions if set to false

### 020:Window-Pickup

The game displays all the collectables at a time by default.
This feature implements a config to restrict the maximum displaying collectables to a value (e.g., max 5 at a time).

### 030:Speed-Based

Speed-based endgame condition means whoever ends the game earlier scores better.
=> In other words, fixed amount of collectable scores AND a variable timer.

### 040:Game Version

The game provides settings for users to configure their keybindings or gameplay.

The game should provide saving slots for users to store their settings.

Note that saving slots should manage keybinding and gameplay settings separately.

## 100:score-booster

inherit all features from [core](#000core)

The players try to gain as many scores as possible in a fixed amount of time.

This feature works with score-based scoring mode.
Implement a few rules allowing players to get extra scores while meeting the conditions.
Here are a few possible score-boost rules:
Note that all these rules should be configurable.

### 110:countdown

**Sub-mode 2 (fixed time, variable collectable):**
Render collectables dynamically along with the game progress (the render amount is capped at max_display).
The game ends once the timer ends; the score is determined by how many collectables the player picked.

#### 111:Implementation Proposal

**Core Rule:** Only one of `timer` or `remain_counter` can be non-null at a time. They are mutually exclusive parameters that determine the game mode.

Data:
- `int? timer` - timer (defaults to null, which means sub-mode 1)
  - When set to a non-nullable integer, `remain_counter` must be null
  - Setting to 10 will create a 10-second timer (which means sub-mode 2)
    - Game ends once the timer hits zero seconds
  - Generate collectables dynamically along with the game progress
  - Newly generated positions will be added to prev_positions automatically
  - Use max_display to determine how many collectables to show at a time
- `int? max_display` - determines the maximum amount of collectables to be shown at a time (defaults to null)
  - Set to null if remain_counter is non-null
  - Null value means render all remaining collectables at once
  - Defaults to 9 if timer is non-null
- `int? remain_counter` - number of collectables to be spawned (defaults to 9)
  - When set to a non-nullable integer, `timer` must be null
  - Setting to 10 will create a remain_counter of 10
    - Game ends once the counter hits zero
  - If remain_counter gt positions.Count, the game should generate new collectables at random positions automatically until the counter hits zero
    - Newly generated positions should be added back to prev_positions
- `List<(int, int)> prev_positions` - previous collectable positions (defined in level data)
- `bool` - replace the previous positions, i.e., randomly spawn (defaults to false)
  - Reuse the previous positions if set to false


### 120:Combo Streak

A combo streak state: the streak refreshes if the player picks up a collectable within 4 steps (i.e., within steps 1, 2, 3, or 4).

The player loses the combo streak if they make 5 or more consecutive steps without picking up a collectable.

The player will gain extra scores picking up a collectable while maintaining the streak.

e.g., get one more score if surpassing x2 combo (i.e., x3+); get two more scores if surpassing x5 combo (i.e., x6+); get three more scores if surpassing x8 combo (i.e., x9+); capped extra scores at three.

### 130:Decremental Counter

Make every newly spawned collectable worth an extra score of 5, then reduce the extra score each time the player moves.
This mode synergizes well with items#232 since both of them keep the player prioritizing the nearest collectables.

### 140:Ordered Collectables

Mark all the collectables with an ordinal sequence.

The player gains extra score while picking up collectables in the correct order.

This mode also maintains a combo streak; lose extra score if the streak breaks.

The extra score grows arithmetically (e.g., +1, +2, +3...).

### 150:Expiration

Randomly drop time-sensitive collectables.
This one is similar to items#233 except that the collectable disappears automatically if the counter runs below 1.
Make sure it is configurable.

### 160:Scoring Formulas

This section defines the exact calculations for all scoring mechanisms.

#### 161:Base Score

```
base_score = collectables_picked × 1
```

Every collectable picked adds 1 to the base score.

#### 162:[Combo Streak](#120combo-streak)

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

#### 163:[Decremental Counter](#130decremental-counter)

```
counter_bonus = max(0, 5 - steps_since_spawn)
score_per_pickup = 1 + counter_bonus
```

Each collectable spawns with a 5-point bonus that decreases by 1 per player step.

#### 164:[Ordered Collectables](#140ordered-collectables)

```
order_bonus = consecutive_correct_pickups
score_per_pickup = 1 + order_bonus

// On breaking the streak:
order_bonus = 0
```

Bonus grows arithmetically: +1 for 1st correct, +2 for 2nd correct, +3 for 3rd, etc.

#### 165:[Expiration](#150expiration)

```
expiration_bonus = remaining_countdown
score_per_pickup = 1 + expiration_bonus

// If countdown reaches 0:
collectable disappears, no score awarded
```

#### 166:Final Score Calculation

```
final_score = sum(score_per_pickup for each pickup)
```

## 200:filler

inherit all features from [core](#000core)

Filler (or fill-up) mode is a special gameplay mode extended from the base gameplay of vimkeys-game (extended from picker mode).

This document reviews all the features inherited from the base gameplay, which then explicitly includes or excludes each feature.

Plus, it adds new features introduced by the filler mode.

Filler mode is an alternative game mode with the following features:
- **Render differently:**
  - The player now leaves track colors
  - Picked up collectables will change the background color of the cell
- **Extra pick-up rules:**
  - Now all collectables have a pre-defined condition; the player must meet the condition before the collectable can be picked up
  - e.g., a collectable may have condition "red"; then the player must pick up a "red color" first before they can pick up red collectables
    - Colors are special collectables that don't give extra score, and they will keep respawning in a few steps (configurable)

All the levels in filler mode are pre-defined; thus, there's no score-based gameplay. The only endgame condition is to clear the level in as few seconds as possible (i.e., the shortest time possible).

### 210:Exclusion

- Filler mode should disable items#180
  - The reason is that filler mode introduces more collectable interaction
  - Allowing the player to extend body length will make the game over-complicated
- All maps are statically generated; doesn't support randomly generated maps
  - Thus, there will be no score-based gameplay available
  - Only speed-based gameplay is available
- No need to implement items#510
  - The reason is that fog of war works best with randomly generated maps
  - No need to handicap players for speed-based mode

### 220:proposal 1

Data:
- `int remain_counter` - counting down the amount of collectables to pick to win the game
- `List<Level> levels` - define a list of levels
  - The player can choose which level to play
  - Each level should have its own scoreboard
- Level Props:
  - `string name` - name of the level
  - `List<(int, int, Color)> colors` - colors respawning position and the color attached to it
  - `List<(int, int, Color)> collectables` - collectables spawning position and the color condition to pick up

### 230:proposal 2

Each collectable now comes with a condition to match (e.g., color).
The player can pick up a color item to match the condition.

A color item respawns automatically after the player moves a few steps, which ensures the player can always beat the level.
Picking up a new color item would replace the previous color directly.

Coloring visited cells is still a viable option; however, it should provide only visual feedback without changing the gameplay.

### 240:dropped:Explicit Fill-Up Command

**Reason for dropping:** Violates the first design principle (extra keypresses).

Originally tried to let the player hit space to fill up a cell. Both making the player explicitly hit space to fill up a cell and hitting space to toggle filling behavior violate the first design principle because it makes players hit extra spaces to complete the game. The threshold feature (requiring un-coloring of unrelated cells) also felt tedious after playthroughs.

### 250:dropped:Stroke Width

**Reason for dropping:** Over-complicates gameplay.

A feature to fill in multiple cells at once; could be done by implementing items#180. However, it would over-complicate the gameplay.

### 260:dropped:Stroke Depth

**Reason for dropping:** Unnecessary complexity.

A feature to make different levels of filling colors when a collectable appears twice in the same cell. However, filler mode renders all collectables on game start; respawning collectables introduces unnecessary complexity without improving the gaming experience.


## 300:snake

inherit all features from [core](#000core)

