# Stage 4 Specification: Scoring & Game Modes

Reference tasks: `4.1` - `4.13`

---

## Additional Constants

### Combo System

```
COMBO_STEP_THRESHOLD = 4
MAX_COMBO_BONUS = 3
```

### Score Boosts

```
DECREMENTAL_INITIAL_BONUS = 5
```

---

## Enums

### Game Mode

```
enum GameMode {
  PICKER,   // Pick up collectables
  FILLER    // Color-matching collectables
}
```

### Score Mode (Picker Only)

```
enum ScoreMode {
  SPEED_BASED,  // Fixed collectables, measure time
  SCORE_BASED   // Fixed time, measure score
}
```

---

## Data Structures

### Picker Config

```
struct PickerConfig {
  int? timer                        // null = speed-based mode
  int? remainCounter                // null when timer is set
  int? maxDisplay                   // null = show all

  // Score boost toggles
  bool comboEnabled
  bool decrementalEnabled
  bool orderedEnabled
  bool expirationEnabled
}
```

### Player (Extended for Scoring)

```
struct Player {
  List<Position> body
  BodyPart activePart
  int score
  int comboStreak
  int stepsSinceLastPickup
  Color? currentColor      // Filler mode only

  MovementType? lastNonBasicMovement
  Direction? lastMovementDirection
}
```

### Game Session (Extended)

```
struct GameSession {
  GameState state
  GameMode mode
  Level currentLevel
  Player player

  // Runtime state
  float elapsedTime
  float? remainingTime          // For timer mode
  int collectablesRemaining
  List<Item> activeItems

  // Score boost state
  Map<Item, int> itemStepCounters   // For decremental scoring
  OrderedState? orderedState        // For ordered collectables
  List<ExpirableItem> expirableItems // For expiration system

  // Previous state
  int previousScore
  int highestScore
}
```

---

## Scoring System

### Base Score

```
function calculatePickupScore(session: GameSession, item: Item) -> int:
  baseScore = 1
  bonus = 0

  config = session.currentLevel.pickerConfig

  // Combo bonus
  if config.comboEnabled:
    bonus += calculateComboBonus(session.player.comboStreak)

  // Decremental bonus
  if config.decrementalEnabled:
    stepsSinceSpawn = session.itemStepCounters[item] OR 0
    bonus += calculateDecrementalBonus(stepsSinceSpawn)

  // Ordered bonus
  if config.orderedEnabled:
    bonus += calculateOrderedBonus(session, item)

  // Expiration bonus
  if config.expirationEnabled:
    bonus += calculateExpirationBonus(session, item)

  return baseScore + bonus
```

### Combo Bonus

```
function calculateComboBonus(comboStreak: int) -> int:
  // combo_bonus = min(floor(combo_streak / 3), 3)
  bonus = floor(comboStreak / 3)
  return min(bonus, MAX_COMBO_BONUS)

// Combo Table:
// Streak 1-2:  +0 bonus (total: 1 per pickup)
// Streak 3-5:  +1 bonus (total: 2 per pickup)
// Streak 6-8:  +2 bonus (total: 3 per pickup)
// Streak 9+:   +3 bonus (total: 4 per pickup)

function updateComboStreak(player: Player):
  player.stepsSinceLastPickup += 1
  if player.stepsSinceLastPickup > COMBO_STEP_THRESHOLD:
    player.comboStreak = 0

function handleCollectablePickup(session: GameSession, item: Item):
  player = session.player

  // Calculate score
  score = calculatePickupScore(session, item)
  player.score += score

  // Update combo streak
  if player.stepsSinceLastPickup <= COMBO_STEP_THRESHOLD:
    player.comboStreak += 1
  else:
    player.comboStreak = 1
  player.stepsSinceLastPickup = 0

  // Remove item
  removeItem(session, item)
  session.collectablesRemaining -= 1
```

### Decremental Bonus

```
function calculateDecrementalBonus(stepsSinceSpawn: int) -> int:
  // counter_bonus = max(0, 5 - steps_since_spawn)
  return max(0, DECREMENTAL_INITIAL_BONUS - stepsSinceSpawn)

function updateDecrementalCounters(session: GameSession):
  // Increment step counter for all items
  for item in session.activeItems:
    if item.type == ItemType.COLLECTABLE:
      if session.itemStepCounters[item] == null:
        session.itemStepCounters[item] = 0
      else:
        session.itemStepCounters[item] += 1
```

### Ordered Bonus

```
struct OrderedState {
  int expectedNextOrder
  int consecutiveCorrect
}

function calculateOrderedBonus(session: GameSession, item: Item) -> int:
  orderedState = session.orderedState

  if item.orderIndex == orderedState.expectedNextOrder:
    orderedState.consecutiveCorrect += 1
    orderedState.expectedNextOrder += 1
    return orderedState.consecutiveCorrect
  else:
    // Streak broken
    orderedState.consecutiveCorrect = 0
    return 0
```

### Expiration System

```
struct ExpirableItem {
  Item item
  int remainingCountdown
}

function calculateExpirationBonus(session: GameSession, item: Item) -> int:
  expirable = session.expirableItems.find(e => e.item == item)
  if expirable != null:
    return expirable.remainingCountdown
  return 0

function updateExpirableItems(session: GameSession):
  toRemove = []

  for expirable in session.expirableItems:
    expirable.remainingCountdown -= 1
    if expirable.remainingCountdown <= 0:
      // Remove expired item
      removeItem(session, expirable.item)
      session.collectablesRemaining -= 1
      toRemove.push(expirable)

  // Clean up expired items from list
  for expirable in toRemove:
    session.expirableItems.remove(expirable)
```

---

## Score-Based Timer Mode

### Timer Mode

```
function checkWinCondition(session: GameSession) -> bool:
  config = session.currentLevel.pickerConfig

  if session.mode == GameMode.PICKER:
    if config.timer != null:
      // Score-based: win when timer ends
      return session.remainingTime <= 0
    else:
      // Speed-based: win when all collectables cleared
      return session.collectablesRemaining <= 0

  return false
```

### Dynamic Spawning

```
function shouldSpawnCollectable(session: GameSession) -> bool:
  config = session.currentLevel.pickerConfig

  // Only spawn in timer mode
  if config.timer == null:
    return false

  // Check if we're below max display
  if session.activeItems.filter(i => i.type == ItemType.COLLECTABLE).length >= config.maxDisplay:
    return false

  // Check if there are more to spawn
  if session.collectablesRemaining <= 0:
    return false

  return true

function spawnCollectable(session: GameSession):
  grid = session.currentLevel.grid
  pos = findRandomEmptyCell(grid, session.activeItems)

  if pos != null:
    newItem = Item(
      type: ItemType.COLLECTABLE,
      position: pos
    )
    session.activeItems.push(newItem)

    // Initialize step counter if decremental enabled
    if session.currentLevel.pickerConfig.decrementalEnabled:
      session.itemStepCounters[newItem] = 0
```

---

## Filler Mode

### Filler Config

```
struct FillerConfig {
  List<ColorSource> colorSources
  List<FillerCollectable> collectables
}

struct ColorSource {
  Position position
  Color color
  int respawnSteps    // Steps until respawn after pickup
}

struct FillerCollectable {
  Position position
  Color requiredColor
}

enum Color {
  RED,
  BLUE,
  GREEN,
  YELLOW,
  PURPLE
}
```

### Filler Session

```
struct FillerSession extends GameSession {
  Map<Position, Color> cellColors     // Track colors left by player
  List<ColorSource> activeColorSources
  Map<ColorSource, int> colorRespawnCounters
}

function initializeFillerSession(level: Level) -> FillerSession:
  session = FillerSession()
  session.mode = GameMode.FILLER
  session.player.body = [level.playerSpawn]  // Always length 1
  session.player.activePart = BodyPart.HEAD  // Fixed
  session.player.currentColor = null
  // ... rest of initialization
  return session
```

### Color Pickup

```
function handleColorPickup(session: FillerSession, colorSource: ColorSource):
  player = session.player

  // Replace current color directly
  player.currentColor = colorSource.color

  // Start respawn counter
  session.colorRespawnCounters[colorSource] = colorSource.respawnSteps

  // Remove color source temporarily
  removeItem(session, colorSource)

function updateColorSources(session: FillerSession):
  toRespawn = []

  for colorSource, counter in session.colorRespawnCounters:
    counter -= 1
    if counter <= 0:
      toRespawn.push(colorSource)

  for colorSource in toRespawn:
    respawnColorSource(session, colorSource)
    delete session.colorRespawnCounters[colorSource]
```

### Track Coloring

```
function updateTrackColor(session: FillerSession, position: Position):
  // Visual feedback only, doesn't affect gameplay
  if session.player.currentColor != null:
    session.cellColors[position] = session.player.currentColor
```

### Filler Collision

```
function handleCollectableCollision(
  session: GameSession,
  player: Player,
  item: Item
) -> CollisionResult:

  // Filler mode: check color requirement
  if session.mode == GameMode.FILLER:
    if item.requiredColor != null AND player.currentColor != item.requiredColor:
      return CollisionResult.NONE  // Cannot pick up without matching color

  // Calculate score (Picker mode) or just remove (Filler mode)
  if session.mode == GameMode.PICKER:
    score = calculatePickupScore(session, item)
    player.score += score
  else:
    // Filler mode doesn't use score
    // Just track time

  // Remove item
  removeItem(session, item)
  session.collectablesRemaining -= 1

  return CollisionResult.PICKED
```

### Filler Exclusions

```
// Filler mode disables:
// - Body expansion (always body length 1)
// - Score-based mode (always speed-based)
// - Random level generation (all levels predefined)
// - Combo/score boost systems
```

---

## Fog of War

### Fog State

```
struct FogOfWar {
  bool enabled
  int visibilityRadius
  Set<Position> revealedCells
}

DEFAULT_VISIBILITY_RADIUS = 2
```

### Fog Logic

```
function updateFogOfWar(session: GameSession):
  if not session.fogOfWar.enabled:
    return

  playerPos = session.player.body[-1]
  radius = session.fogOfWar.visibilityRadius

  // Reveal cells within radius
  for row from playerPos.row - radius to playerPos.row + radius:
    for col from playerPos.col - radius to playerPos.col + radius:
      pos = Position(row, col)

      if session.currentLevel.grid.isInBounds(pos):
        // Check if within circular radius
        distance = sqrt(
          (pos.row - playerPos.row) ** 2 +
          (pos.col - playerPos.col) ** 2
        )

        if distance <= radius:
          session.fogOfWar.revealedCells.add(pos)

function isCellVisible(session: GameSession, pos: Position) -> bool:
  if not session.fogOfWar.enabled:
    return true

  return session.fogOfWar.revealedCells.has(pos)
```

---

## HUD (Extended)

### In-Game HUD

```
struct InGameHUD {
  // Top-left
  int currentScore
  int? comboCounter          // Only if combo active

  // Top-right
  float timer               // Elapsed or countdown
  int collectableCount      // Remaining

  // Bottom-left (Filler mode only)
  Color? currentColor
}

function updateInGameHUD(session: GameSession) -> InGameHUD:
  player = session.player
  config = session.currentLevel.pickerConfig

  return InGameHUD(
    currentScore: player.score,
    comboCounter: player.comboStreak > 0 ? player.comboStreak : null,
    timer: config?.timer != null ? session.remainingTime : session.elapsedTime,
    collectableCount: session.collectablesRemaining,
    currentColor: session.mode == GameMode.FILLER ? player.currentColor : null
  )
```

---

## Game Loop (Extended)

```
function gameLoop(session: GameSession, deltaTime: float):
  if session.state != GameState.IN_GAME:
    return

  // Update timer
  session.elapsedTime += deltaTime
  if session.remainingTime != null:
    session.remainingTime -= deltaTime

  // Update combo tracking
  updateComboStreak(session.player)

  // Update score boost systems
  if session.currentLevel.pickerConfig?.decrementalEnabled:
    updateDecrementalCounters(session)

  if session.currentLevel.pickerConfig?.expirationEnabled:
    updateExpirableItems(session)

  // Update filler mode systems
  if session.mode == GameMode.FILLER:
    updateColorSources(session)

  // Dynamic spawning
  if shouldSpawnCollectable(session):
    spawnCollectable(session)

  // Update fog of war
  updateFogOfWar(session)

  // Check win condition
  if checkWinCondition(session):
    stopGame(session)
    return

  // Update HUD
  updateHUD(session)
```
