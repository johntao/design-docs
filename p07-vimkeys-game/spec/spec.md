# Technical Specification

This document contains pseudo code and variable/constant declarations derived from `design.md`.

---

## Table of Contents

1. [Constants](#1-constants)
2. [Enums](#2-enums)
3. [Data Structures](#3-data-structures)
4. [Game State Machine](#4-game-state-machine)
5. [Movement System](#5-movement-system)
6. [Collision System](#6-collision-system)
7. [Scoring System](#7-scoring-system)
8. [Body Expansion System](#8-body-expansion-system)
9. [Level Management](#9-level-management)
10. [HUD System](#10-hud-system)

---

## 1. Constants

### 1.1 Reserved Keybindings

```
RESERVED_KEYS = {
  TOGGLE_GAME:    "\\",
  NEXT_LEVEL:     "=",
  PREV_LEVEL:     "Backspace",
  RANDOMIZE:      "]",
  SETTINGS:       "Escape",
  CONFIRM:        "Enter"
}
```

### 1.2 Default Keybindings

```
DEFAULT_KEYBINDINGS = {
  // Basic Movement (items#120)
  MOVE_LEFT:      "h",
  MOVE_DOWN:      "j",
  MOVE_UP:        "k",
  MOVE_RIGHT:     "l",

  // Grid Movement (items#130)
  GRID_LEFT:      "Ctrl+h",
  GRID_DOWN:      "Ctrl+j",
  GRID_UP:        "Ctrl+k",
  GRID_RIGHT:     "Ctrl+l",

  // Sigil Movement - Angle Brackets (items#141)
  FIND_ANGLE_LEFT_BACKWARD:   "q",
  FIND_ANGLE_RIGHT_BACKWARD:  "w",
  FIND_ANGLE_LEFT_FORWARD:    "e",
  FIND_ANGLE_RIGHT_FORWARD:   "r",

  // Sigil Movement - Alphabets (items#142)
  FIND_CHAR_BACKWARD:  "d",
  FIND_CHAR_FORWARD:   "f",

  // Repeater (items#172)
  REPEAT_BACKWARD:           "n",
  REPEAT_FORWARD_SKIP_LINE:  "m",
  REPEAT_BACKWARD_SKIP_LINE: ",",
  REPEAT_FORWARD:            ".",

  // Body Control (items#183)
  SWITCH_TO_TAIL:  "z",
  SWITCH_TO_BODY:  "x",
  SWITCH_TO_HEAD:  "c"
}
```

### 1.3 Game Limits

```
// Grid Dimensions (items#810)
MIN_GRID_ROWS = 8
MAX_GRID_ROWS = 16
MIN_GRID_COLS = 8
MAX_GRID_COLS = 16
DEFAULT_GRID_ROWS = 10
DEFAULT_GRID_COLS = 10

// Multi-grid Layout (items#410)
MAX_GRIDS_PER_VIEW = 9
GRID_MARGIN_PX = 10

// Player Body (items#180)
MIN_BODY_LENGTH = 1
MAX_BODY_LENGTH = 5

// Combo System (items#232)
COMBO_STEP_THRESHOLD = 4
MAX_COMBO_BONUS = 3

// Decremental Counter (items#233)
DECREMENTAL_INITIAL_BONUS = 5

// Level Generation (items#820)
MIN_OBSTACLE_DENSITY = 0.0
MAX_OBSTACLE_DENSITY = 0.20
DEFAULT_OBSTACLE_DENSITY = 0.10
DEFAULT_COLLECTABLE_COUNT = 9

// Macros (items#150)
MAX_MACRO_ACTIONS = 6

// Save Slots (items#624)
MAX_SAVE_SLOTS = 3
```

### 1.4 Default Gameplay Values

```
DEFAULT_TIMER = null          // null means speed-based mode
DEFAULT_REMAIN_COUNTER = 9
DEFAULT_MAX_DISPLAY = null    // null means show all collectables
DEFAULT_REPLACE_POSITIONS = false
```

---

## 2. Enums

### 2.1 Game State

```
enum GameState {
  OUT_OF_GAME,
  IN_GAME
}
```

### 2.2 Game Mode

```
enum GameMode {
  PICKER,   // items#200
  FILLER    // items#700
}
```

### 2.3 Score Mode (Picker Only)

```
enum ScoreMode {
  SPEED_BASED,  // items#220 - fixed collectables, measure time
  SCORE_BASED   // items#230 - fixed time, measure score
}
```

### 2.4 Direction

```
enum Direction {
  LEFT,    // (0, -1)
  DOWN,    // (1, 0)
  UP,      // (-1, 0)
  RIGHT    // (0, 1)
}

DIRECTION_VECTORS = {
  LEFT:  { row: 0,  col: -1 },
  DOWN:  { row: 1,  col: 0  },
  UP:    { row: -1, col: 0  },
  RIGHT: { row: 0,  col: 1  }
}
```

### 2.5 Item Type

```
enum ItemType {
  COLLECTABLE,
  OBSTACLE,
  SIGIL,
  PORTAL
}
```

### 2.6 Sigil Subtype

```
enum SigilSubtype {
  ANGLE_LEFT,   // '<'
  ANGLE_RIGHT,  // '>'
  ALPHABET      // a-z, A-Z
}
```

### 2.7 Body Part (items#183)

```
enum BodyPart {
  HEAD,   // Variable length mode, extends forward
  BODY,   // Fixed length mode
  TAIL    // Variable length mode, extends backward
}
```

### 2.8 Movement Type

```
enum MovementType {
  BASIC,      // items#120 - single cell, collidable
  GRID,       // items#130 - teleport between grids, non-collidable
  SIGIL,      // items#140 - teleport to sigil, non-collidable intermediate
  MACRO,      // items#150 - sequence of basic movements
  REPEATER    // items#172 - repeat last non-basic movement
}
```

### 2.9 Level Type

```
enum LevelType {
  DEMO,       // Sandbox, cannot start formally
  PREDEFINED, // Fixed layout
  DYNAMIC     // Randomly generated
}
```

---

## 3. Data Structures

### 3.1 Position

```
struct Position {
  int row
  int col
}

function Position.equals(other: Position) -> bool:
  return this.row == other.row AND this.col == other.col

function Position.add(dir: Direction) -> Position:
  vec = DIRECTION_VECTORS[dir]
  return Position(this.row + vec.row, this.col + vec.col)
```

### 3.2 Cell

```
struct Cell {
  Position position
  List<Item> items    // Max items depends on item types
}

// Constraint: If cell contains obstacle, items.length == 1
```

### 3.3 Item

```
struct Item {
  ItemType type
  Position position

  // Type-specific properties
  SigilSubtype? sigilSubtype  // For SIGIL type
  char? sigilChar             // For ALPHABET sigil
  int? portalPairId           // For PORTAL type
  Color? requiredColor        // For COLLECTABLE in Filler mode
}
```

### 3.4 Grid

```
struct Grid {
  int rows
  int cols
  Cell[][] cells
  Position gridPosition   // Position in multi-grid layout
}

function Grid.isInBounds(pos: Position) -> bool:
  return pos.row >= 0 AND pos.row < this.rows
     AND pos.col >= 0 AND pos.col < this.cols

function Grid.getCell(pos: Position) -> Cell?:
  if not this.isInBounds(pos):
    return null
  return this.cells[pos.row][pos.col]
```

### 3.5 View

```
struct View {
  List<Grid> grids
  int layoutRows   // Grid arrangement (e.g., 3 for 3x3)
  int layoutCols
}
```

### 3.6 Player (items#105)

```
struct Player {
  List<Position> body      // body[0] = tail, body[-1] = head
  BodyPart activePart
  int score
  int comboStreak
  Color? currentColor      // Filler mode only

  MovementType? lastNonBasicMovement
  Direction? lastMovementDirection
}

DEFAULT_PLAYER_STATE = {
  body: [spawn_position],
  activePart: BodyPart.HEAD,
  score: 0,
  comboStreak: 0,
  currentColor: null,
  lastNonBasicMovement: null,
  lastMovementDirection: null
}
```

### 3.7 Game Config

```
struct PickerConfig {
  int? timer                        // null = speed-based mode
  int? remainCounter                // null when timer is set
  int? maxDisplay                   // null = show all
  List<Position> prevPositions
  bool replacePositions

  // Score boost toggles
  bool comboEnabled                 // items#232
  bool decrementalEnabled           // items#233
  bool orderedEnabled               // items#234
  bool expirationEnabled            // items#235
}

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
```

### 3.8 Level

```
struct Level {
  string id
  string name
  LevelType type
  GameMode mode

  Grid grid                     // Or View for multi-grid
  Position playerSpawn
  List<Item> items

  PickerConfig? pickerConfig    // When mode == PICKER
  FillerConfig? fillerConfig    // When mode == FILLER

  LevelMetadata metadata
}

struct LevelMetadata {
  string? author
  string? difficulty
  int? parTimeSeconds
}
```

### 3.9 Keybinding Config (items#330)

```
struct KeybindingConfig {
  Map<string, string> bindings    // action_id -> key
  Map<string, string> macros      // macro_id -> action_sequence
}

struct SaveSlot {
  int slotId
  KeybindingConfig keybindings
  // Note: Gameplay and keybinding settings are separate
}
```

### 3.10 Game Session

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
  List<Item> activeItems        // Currently visible items

  // For dynamic collectable generation
  int stepsSinceLastSpawn
  Map<Item, int> itemStepCounters   // For decremental scoring
}
```

---

## 4. Game State Machine

### 4.1 State Transitions

```
function handleToggleGame(session: GameSession):
  if session.state == GameState.OUT_OF_GAME:
    if session.currentLevel.type != LevelType.DEMO:
      startGame(session)
  else:
    stopGame(session)

function startGame(session: GameSession):
  session.state = GameState.IN_GAME
  session.player = initializePlayer(session.currentLevel)
  session.elapsedTime = 0
  session.collectablesRemaining = countCollectables(session.currentLevel)

  if session.currentLevel.pickerConfig?.timer != null:
    session.remainingTime = session.currentLevel.pickerConfig.timer

  spawnInitialItems(session)

function stopGame(session: GameSession):
  session.state = GameState.OUT_OF_GAME
  saveScore(session)
```

### 4.2 Win Condition Check

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

  else if session.mode == GameMode.FILLER:
    // Always speed-based: win when all colored collectables cleared
    return session.collectablesRemaining <= 0

  return false
```

### 4.3 Game Loop

```
function gameLoop(session: GameSession, deltaTime: float):
  if session.state != GameState.IN_GAME:
    return

  session.elapsedTime += deltaTime

  if session.remainingTime != null:
    session.remainingTime -= deltaTime

  if checkWinCondition(session):
    stopGame(session)
    return

  // Dynamic collectable spawning for timer mode
  if shouldSpawnCollectable(session):
    spawnCollectable(session)

  updateHUD(session)
```

---

## 5. Movement System

### 5.1 Basic Movement (items#120)

```
function moveBasic(session: GameSession, direction: Direction):
  player = session.player
  head = player.body[-1]
  targetPos = head.add(direction)
  grid = getCurrentGrid(session)

  // Boundary check (items#115)
  if not grid.isInBounds(targetPos):
    handleBoundaryCollision(session, direction)
    return

  // Collision check
  cell = grid.getCell(targetPos)
  for item in cell.items:
    result = handleCollision(session, player, item)
    if result == CollisionResult.BLOCKED:
      return

  // Execute movement based on active body part
  executeMovement(session, targetPos, direction)

  // Update combo tracking
  player.stepsSinceLastPickup += 1
  if player.stepsSinceLastPickup > COMBO_STEP_THRESHOLD:
    player.comboStreak = 0
```

### 5.2 Grid Movement (items#130)

```
function moveGrid(session: GameSession, direction: Direction):
  currentGrid = getCurrentGrid(session)
  view = session.currentLevel.view

  targetGridPos = currentGrid.gridPosition.add(direction)
  targetGrid = view.getGrid(targetGridPos)

  if targetGrid == null:
    return  // No grid in that direction

  player = session.player
  head = player.body[-1]

  // Teleport to same row/col in target grid
  newPos = Position(head.row, head.col)

  // Clamp to target grid bounds
  newPos.row = clamp(newPos.row, 0, targetGrid.rows - 1)
  newPos.col = clamp(newPos.col, 0, targetGrid.cols - 1)

  // Grid movement is non-collidable (items#130)
  teleportPlayer(session, newPos, targetGrid)

  player.lastNonBasicMovement = MovementType.GRID
  player.lastMovementDirection = direction
```

### 5.3 Sigil Movement - Angle Brackets (items#141)

```
function findAngleBracket(
  session: GameSession,
  bracketType: '<' | '>',
  searchDirection: 'forward' | 'backward'
) -> Position?:

  grid = getCurrentGrid(session)
  head = session.player.body[-1]

  // Flatten grid to linear search
  positions = getAllPositions(grid)

  if searchDirection == 'backward':
    positions = reverse(positions)

  // Find current position index
  startIndex = findIndex(positions, head)

  // Search for matching bracket
  for i from startIndex + 1 to positions.length:
    cell = grid.getCell(positions[i])
    for item in cell.items:
      if item.type == ItemType.SIGIL:
        if item.sigilSubtype == SigilSubtype.ANGLE_LEFT AND bracketType == '<':
          return positions[i]
        if item.sigilSubtype == SigilSubtype.ANGLE_RIGHT AND bracketType == '>':
          return positions[i]

  return null

function moveToAngleBracket(
  session: GameSession,
  bracketType: '<' | '>',
  searchDirection: 'forward' | 'backward'
):
  if session.player.body.length > 1 AND session.player.activePart == BodyPart.BODY:
    return  // Sigil movement disabled in body mode (items#180)

  targetPos = findAngleBracket(session, bracketType, searchDirection)

  if targetPos != null:
    teleportPlayer(session, targetPos)
    session.player.lastNonBasicMovement = MovementType.SIGIL
```

### 5.4 Sigil Movement - Alphabets (items#142)

```
function findAlphabet(
  session: GameSession,
  char: char,
  searchDirection: 'forward' | 'backward'
) -> Position?:

  grid = getCurrentGrid(session)
  head = session.player.body[-1]

  positions = getAllPositions(grid)
  if searchDirection == 'backward':
    positions = reverse(positions)

  startIndex = findIndex(positions, head)

  for i from startIndex + 1 to positions.length:
    cell = grid.getCell(positions[i])
    for item in cell.items:
      if item.type == ItemType.SIGIL AND item.sigilSubtype == SigilSubtype.ALPHABET:
        if item.sigilChar == char:
          return positions[i]

  return null

function moveToAlphabet(session: GameSession, char: char, searchDirection: 'forward' | 'backward'):
  if session.player.body.length > 1 AND session.player.activePart == BodyPart.BODY:
    return

  targetPos = findAlphabet(session, char, searchDirection)

  if targetPos != null:
    teleportPlayer(session, targetPos)
    session.player.lastNonBasicMovement = MovementType.SIGIL
```

### 5.5 Repeater (items#172)

```
function repeatLastMovement(session: GameSession, mode: 'n' | 'm' | ',' | '.'):
  player = session.player

  if player.lastNonBasicMovement == null:
    return

  // Determine search parameters based on mode
  switch mode:
    case 'n':  // Backward (n,n to 0,0)
      direction = 'backward'
      skipLine = false

    case '.':  // Forward (0,0 to n,n)
      direction = 'forward'
      skipLine = false

    case 'm':  // Forward, skip to next line first
      // Equivalent to VIM's j0*
      moveToNextLineStart(session)
      direction = 'forward'
      skipLine = true

    case ',':  // Backward, skip to previous line end
      // Equivalent to VIM's k$#
      moveToPrevLineEnd(session)
      direction = 'backward'
      skipLine = true

  // Re-execute the last non-basic movement
  executeLastMovement(session, direction)

function moveToNextLineStart(session: GameSession):
  player = session.player
  head = player.body[-1]
  grid = getCurrentGrid(session)

  newRow = min(head.row + 1, grid.rows - 1)
  newPos = Position(newRow, 0)
  teleportPlayer(session, newPos)

function moveToPrevLineEnd(session: GameSession):
  player = session.player
  head = player.body[-1]
  grid = getCurrentGrid(session)

  newRow = max(head.row - 1, 0)
  newPos = Position(newRow, grid.cols - 1)
  teleportPlayer(session, newPos)
```

### 5.6 Macro Execution (items#150)

```
function executeMacro(session: GameSession, macroId: string):
  keybindings = getActiveKeybindings(session)
  macroSequence = keybindings.macros[macroId]

  if macroSequence == null OR macroSequence.length > MAX_MACRO_ACTIONS:
    return

  for action in macroSequence:
    direction = parseDirectionFromAction(action)
    if direction != null:
      moveBasic(session, direction)
```

---

## 6. Collision System

### 6.1 Collision Types

```
enum CollisionResult {
  NONE,       // No collision occurred
  PICKED,     // Collectable was picked up
  BLOCKED,    // Movement blocked (obstacle)
  TELEPORTED  // Portal triggered
}
```

### 6.2 Collision Handler

```
function handleCollision(
  session: GameSession,
  player: Player,
  item: Item
) -> CollisionResult:

  switch item.type:
    case ItemType.COLLECTABLE:
      return handleCollectableCollision(session, player, item)

    case ItemType.OBSTACLE:
      return CollisionResult.BLOCKED

    case ItemType.PORTAL:
      return handlePortalCollision(session, player, item)

    case ItemType.SIGIL:
      return CollisionResult.NONE  // Sigils are non-collidable (items#140)

  return CollisionResult.NONE
```

### 6.3 Collectable Collision (items#114)

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

  // Spawn replacement if in timer mode
  if session.currentLevel.pickerConfig?.timer != null:
    maybeSpawnCollectable(session)

  return CollisionResult.PICKED
```

### 6.4 Portal Collision (items#532)

```
function handlePortalCollision(
  session: GameSession,
  player: Player,
  item: Item
) -> CollisionResult:

  // Portals disabled when body length > 1 (items#180)
  if player.body.length > 1:
    return CollisionResult.NONE

  // Find paired portal
  pairedPortal = findPortalPair(session, item.portalPairId, item.position)

  if pairedPortal == null:
    return CollisionResult.NONE

  teleportPlayer(session, pairedPortal.position)
  return CollisionResult.TELEPORTED

function findPortalPair(session: GameSession, pairId: int, excludePos: Position) -> Item?:
  for item in session.activeItems:
    if item.type == ItemType.PORTAL:
      if item.portalPairId == pairId AND not item.position.equals(excludePos):
        return item
  return null
```

### 6.5 Boundary Collision (items#115)

```
function handleBoundaryCollision(session: GameSession, direction: Direction):
  // Option 1: Stay in current cell
  // Option 2: Teleport to adjacent grid (if multi-grid)

  view = session.currentLevel.view
  if view.grids.length > 1:
    // Try to move to adjacent grid
    moveGrid(session, direction)
  // else: stay in place (default behavior)
```

### 6.6 Multi-Cell Movement Collision (items#111, #112)

```
function handlePathCollision(
  session: GameSession,
  startPos: Position,
  endPos: Position,
  isTeleport: bool
) -> List<CollisionResult>:

  results = []

  if isTeleport:
    // Only check destination (items#112)
    cell = getCell(session, endPos)
    for item in cell.items:
      result = handleCollision(session, session.player, item)
      results.append(result)
  else:
    // Check all cells along path (items#111)
    path = calculatePath(startPos, endPos)
    for pos in path:
      cell = getCell(session, pos)
      for item in cell.items:
        result = handleCollision(session, session.player, item)
        results.append(result)
        if result == CollisionResult.BLOCKED:
          return results

  return results
```

---

## 7. Scoring System

### 7.1 Base Score (items#236)

```
function calculatePickupScore(session: GameSession, item: Item) -> int:
  baseScore = 1
  bonus = 0

  config = session.currentLevel.pickerConfig

  // Combo bonus (items#232)
  if config.comboEnabled:
    bonus += calculateComboBonus(session.player.comboStreak)

  // Decremental bonus (items#233)
  if config.decrementalEnabled:
    stepsSinceSpawn = session.itemStepCounters[item] OR 0
    bonus += calculateDecrementalBonus(stepsSinceSpawn)

  // Ordered bonus (items#234)
  if config.orderedEnabled:
    bonus += calculateOrderedBonus(session, item)

  // Expiration bonus (items#235)
  if config.expirationEnabled:
    bonus += calculateExpirationBonus(session, item)

  return baseScore + bonus
```

### 7.2 Combo Bonus (items#232)

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
```

### 7.3 Decremental Bonus (items#233)

```
function calculateDecrementalBonus(stepsSinceSpawn: int) -> int:
  // counter_bonus = max(0, 5 - steps_since_spawn)
  return max(0, DECREMENTAL_INITIAL_BONUS - stepsSinceSpawn)
```

### 7.4 Ordered Bonus (items#234)

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

### 7.5 Expiration Bonus (items#235)

```
struct ExpirableItem {
  Item item
  int remainingCountdown
}

function calculateExpirationBonus(session: GameSession, item: Item) -> int:
  expirable = session.expirableItems[item]
  if expirable != null:
    return expirable.remainingCountdown
  return 0

function updateExpirableItems(session: GameSession):
  for expirable in session.expirableItems:
    expirable.remainingCountdown -= 1
    if expirable.remainingCountdown <= 0:
      removeItem(session, expirable.item)
      session.collectablesRemaining -= 1
```

### 7.6 Final Score Calculation

```
function calculateFinalScore(session: GameSession) -> ScoreResult:
  if session.mode == GameMode.PICKER:
    config = session.currentLevel.pickerConfig

    if config.timer != null:
      // Score-based: total score matters
      return ScoreResult(
        type: 'score',
        value: session.player.score
      )
    else:
      // Speed-based: time matters
      return ScoreResult(
        type: 'time',
        value: session.elapsedTime
      )

  else if session.mode == GameMode.FILLER:
    // Always speed-based
    return ScoreResult(
      type: 'time',
      value: session.elapsedTime
    )
```

---

## 8. Body Expansion System

### 8.1 Body Part Switching (items#183)

```
function switchBodyPart(session: GameSession, targetPart: BodyPart):
  player = session.player

  switch targetPart:
    case BodyPart.TAIL:
      player.activePart = BodyPart.TAIL
      // Also trigger basic movement left
      moveBasic(session, Direction.LEFT)

    case BodyPart.BODY:
      player.activePart = BodyPart.BODY
      // No additional movement

    case BodyPart.HEAD:
      player.activePart = BodyPart.HEAD
      // Also trigger basic movement right
      moveBasic(session, Direction.RIGHT)
```

### 8.2 Movement Execution by Body Part

```
function executeMovement(session: GameSession, targetPos: Position, direction: Direction):
  player = session.player

  switch player.activePart:
    case BodyPart.HEAD:
      executeVariableLengthMove(session, targetPos, 'head')

    case BodyPart.TAIL:
      executeVariableLengthMove(session, targetPos, 'tail')

    case BodyPart.BODY:
      executeFixedLengthMove(session, targetPos, direction)
```

### 8.3 Variable Length Movement

```
function executeVariableLengthMove(session: GameSession, targetPos: Position, end: 'head' | 'tail'):
  player = session.player

  // Check if target is occupied by own body
  isOwnBody = player.body.any(pos => pos.equals(targetPos))

  if isOwnBody:
    // Shrink body (min length: 1)
    if player.body.length > MIN_BODY_LENGTH:
      if end == 'head':
        player.body.pop()  // Remove head
      else:
        player.body.shift()  // Remove tail
  else:
    // Extend body (max length: MAX_BODY_LENGTH)
    if player.body.length < MAX_BODY_LENGTH:
      if end == 'head':
        player.body.push(targetPos)
      else:
        player.body.unshift(targetPos)
    else:
      // At max length: move without extending
      if end == 'head':
        player.body.shift()
        player.body.push(targetPos)
      else:
        player.body.pop()
        player.body.unshift(targetPos)
```

### 8.4 Fixed Length Movement

```
function executeFixedLengthMove(session: GameSession, targetPos: Position, direction: Direction):
  player = session.player

  // Move entire body in direction
  // All body parts move simultaneously
  newBody = []

  for pos in player.body:
    newPos = pos.add(direction)

    // Check bounds and obstacles for each part
    if not isValidPosition(session, newPos):
      return  // Cancel movement if any part blocked

    newBody.push(newPos)

  // Trigger collision for all new positions
  for newPos in newBody:
    cell = getCell(session, newPos)
    for item in cell.items:
      handleCollision(session, player, item)

  player.body = newBody
```

### 8.5 Body Part Constraints

```
function canUseSigilMovement(player: Player) -> bool:
  // Sigil movement disabled in body mode when length > 1 (items#180)
  if player.body.length > 1 AND player.activePart == BodyPart.BODY:
    return false
  return true

function canUsePortal(player: Player) -> bool:
  // Portals disabled when body length > 1 (items#180)
  return player.body.length == 1
```

---

## 9. Level Management

### 9.1 Level Loading

```
function loadLevel(levelId: string) -> Level:
  levelData = loadLevelData(levelId)

  // Validate level (items#840)
  validateLevel(levelData)

  return Level(
    id: levelData.id,
    name: levelData.name,
    type: determineLevelType(levelData),
    mode: levelData.mode,
    grid: buildGrid(levelData.grid),
    playerSpawn: levelData.player_spawn,
    items: buildItems(levelData.items),
    pickerConfig: levelData.picker_config,
    fillerConfig: levelData.filler_config,
    metadata: levelData.metadata
  )
```

### 9.2 Level Validation (items#840)

```
function validateLevel(levelData: LevelData) -> ValidationResult:
  errors = []

  // 1. Player spawn within bounds
  if not isInBounds(levelData.player_spawn, levelData.grid):
    errors.push("Player spawn out of bounds")

  // 2. Player spawn not on obstacle or portal
  spawnItems = getItemsAt(levelData.items, levelData.player_spawn)
  for item in spawnItems:
    if item.type == ItemType.OBSTACLE OR item.type == ItemType.PORTAL:
      errors.push("Player spawn overlaps with " + item.type)

  // 3. All collectables reachable
  if not areAllCollectablesReachable(levelData):
    errors.push("Some collectables are unreachable")

  // 4. Portal pairs complete
  portalPairs = groupBy(levelData.items.filter(i => i.type == ItemType.PORTAL), 'pair_id')
  for pairId, portals in portalPairs:
    if portals.length != 2:
      errors.push("Incomplete portal pair: " + pairId)

  // 5. Grid dimensions valid
  if levelData.grid.rows < MIN_GRID_ROWS OR levelData.grid.rows > MAX_GRID_ROWS:
    errors.push("Invalid grid rows")
  if levelData.grid.cols < MIN_GRID_COLS OR levelData.grid.cols > MAX_GRID_COLS:
    errors.push("Invalid grid cols")

  return ValidationResult(valid: errors.length == 0, errors: errors)
```

### 9.3 Random Level Generation (items#820)

```
function generateRandomLevel(params: GenerationParams) -> Level:
  grid = createEmptyGrid(params.rows, params.cols)
  items = []

  // 1. Place player spawn (center or random unoccupied)
  playerSpawn = findSpawnPosition(grid)

  // 2. Place obstacles
  obstacleCount = floor(params.rows * params.cols * params.obstacleDensity)
  for i from 0 to obstacleCount:
    pos = findRandomEmptyCell(grid, items)
    if pos != null AND not blocksAllPaths(grid, items, pos, playerSpawn):
      items.push(Item(type: ItemType.OBSTACLE, position: pos))

  // 3. Place collectables
  for i from 0 to params.collectableCount:
    pos = findRandomEmptyCell(grid, items)
    if pos != null AND isReachable(grid, items, playerSpawn, pos):
      items.push(Item(type: ItemType.COLLECTABLE, position: pos))

  // 4. Place sigils (optional)
  for i from 0 to params.sigilCount:
    pos = findRandomEmptyCell(grid, items)
    if pos != null:
      sigilType = randomChoice([SigilSubtype.ANGLE_LEFT, SigilSubtype.ANGLE_RIGHT, SigilSubtype.ALPHABET])
      items.push(Item(
        type: ItemType.SIGIL,
        position: pos,
        sigilSubtype: sigilType,
        sigilChar: sigilType == SigilSubtype.ALPHABET ? randomAlphabet() : null
      ))

  // 5. Place portals (optional, in pairs)
  for i from 0 to params.portalPairs:
    pos1 = findRandomEmptyCell(grid, items)
    pos2 = findRandomEmptyCell(grid, items)
    if pos1 != null AND pos2 != null:
      pairId = i + 1
      items.push(Item(type: ItemType.PORTAL, position: pos1, portalPairId: pairId))
      items.push(Item(type: ItemType.PORTAL, position: pos2, portalPairId: pairId))

  return Level(
    id: "dynamic_" + generateUUID(),
    name: "Random Level",
    type: LevelType.DYNAMIC,
    mode: GameMode.PICKER,
    grid: grid,
    playerSpawn: playerSpawn,
    items: items,
    pickerConfig: PickerConfig(
      timer: params.timer,
      remainCounter: params.remainCounter,
      maxDisplay: params.maxDisplay
    )
  )
```

### 9.4 Demo Level (items#139-146)

```
function createDemoLevel() -> Level:
  return Level(
    id: "demo",
    name: "Demo Level",
    type: LevelType.DEMO,
    mode: GameMode.PICKER,
    // ... standard grid and items
  )

function handleDemoLevel(session: GameSession):
  // Demo level cannot be formally started
  // Always in playable state

  if session.collectablesRemaining == 0:
    // Respawn collectables automatically
    respawnCollectables(session)

  // No score calculation
  // No combo system
  // No win/loss conditions
```

### 9.5 Level Switching

```
LEVEL_ORDER = [
  "demo",
  "predefined_1",
  "predefined_2",
  "predefined_3",
  "dynamic"
]

function switchToNextLevel(session: GameSession):
  currentIndex = LEVEL_ORDER.indexOf(session.currentLevel.id)
  nextIndex = (currentIndex + 1) % LEVEL_ORDER.length

  // Handle dynamic level ID matching
  if session.currentLevel.type == LevelType.DYNAMIC:
    currentIndex = LEVEL_ORDER.indexOf("dynamic")

  loadAndSetLevel(session, LEVEL_ORDER[nextIndex])

function switchToPrevLevel(session: GameSession):
  currentIndex = LEVEL_ORDER.indexOf(session.currentLevel.id)
  prevIndex = (currentIndex - 1 + LEVEL_ORDER.length) % LEVEL_ORDER.length

  if session.currentLevel.type == LevelType.DYNAMIC:
    currentIndex = LEVEL_ORDER.indexOf("dynamic")

  loadAndSetLevel(session, LEVEL_ORDER[prevIndex])

function randomizeLevel(session: GameSession):
  if session.currentLevel.type == LevelType.DYNAMIC:
    newLevel = generateRandomLevel(session.generationParams)
    session.currentLevel = newLevel
```

---

## 10. HUD System

### 10.1 In-Game HUD (items#611)

```
struct InGameHUD {
  // Top-left
  int currentScore
  int comboCounter          // Only if active

  // Top-right
  float timer               // Elapsed or countdown
  int collectableCount      // Remaining

  // Bottom-left (Filler mode only)
  Color? currentColor

  // Bottom-right
  string stopHint           // "Press \\ to stop"
}

function updateInGameHUD(session: GameSession) -> InGameHUD:
  player = session.player
  config = session.currentLevel.pickerConfig

  return InGameHUD(
    currentScore: player.score,
    comboCounter: player.comboStreak > 0 ? player.comboStreak : null,
    timer: config.timer != null ? session.remainingTime : session.elapsedTime,
    collectableCount: session.collectablesRemaining,
    currentColor: session.mode == GameMode.FILLER ? player.currentColor : null,
    stopHint: "Press \\ to stop"
  )
```

### 10.2 Out-of-Game HUD (items#612)

```
struct OutOfGameHUD {
  GameMode selectedMode
  int? previousScore
  int highestScore
  string currentLevelName
  string navigationHints    // "= next / <backspace> prev"
  string startHint          // "Press \\ to start"
}

function updateOutOfGameHUD(session: GameSession) -> OutOfGameHUD:
  return OutOfGameHUD(
    selectedMode: session.mode,
    previousScore: session.lastScore,
    highestScore: getHighScore(session.currentLevel.id),
    currentLevelName: session.currentLevel.name,
    navigationHints: "= next / <backspace> prev",
    startHint: session.currentLevel.type == LevelType.DEMO
      ? null
      : "Press \\ to start"
  )
```

### 10.3 Settings Modal (items#620)

```
enum SettingsTab {
  GAMEPLAY,
  KEYBINDINGS
}

struct SettingsModal {
  bool isOpen
  SettingsTab activeTab
  int activeSlot

  // Gameplay tab (items#622)
  GameMode gameMode
  ScoreMode scoreMode       // Picker only
  GridSize gridSize
  CollectableDensity density
  BodyLengthMode bodyMode   // Picker only
  bool fogOfWar             // Picker only

  // Keybindings tab (items#623)
  KeybindingConfig bindings
  string? conflictWarning
}

enum GridSize {
  SMALL,   // 8x8
  MEDIUM,  // 12x12
  LARGE    // 16x16
}

GRID_SIZE_VALUES = {
  SMALL: { rows: 8, cols: 8 },
  MEDIUM: { rows: 12, cols: 12 },
  LARGE: { rows: 16, cols: 16 }
}

function openSettings(session: GameSession):
  session.settingsModal.isOpen = true

function closeSettings(session: GameSession):
  session.settingsModal.isOpen = false

function applySettings(session: GameSession):
  // Save to active slot
  saveToSlot(session.settingsModal.activeSlot, session.settingsModal)
  closeSettings(session)

function resetToDefault(session: GameSession):
  session.settingsModal.bindings = DEFAULT_KEYBINDINGS
  // Reset gameplay settings to defaults
```

---

## 11. Input Handling

### 11.1 Key Event Handler

```
function handleKeyDown(session: GameSession, event: KeyboardEvent):
  key = normalizeKey(event)

  // Check reserved keys first
  if key in RESERVED_KEYS:
    handleReservedKey(session, key)
    return

  // Settings modal open
  if session.settingsModal.isOpen:
    handleSettingsInput(session, key)
    return

  // Game state specific handling
  if session.state == GameState.IN_GAME:
    handleInGameInput(session, key)
  else:
    handleOutOfGameInput(session, key)

function handleReservedKey(session: GameSession, key: string):
  switch key:
    case RESERVED_KEYS.TOGGLE_GAME:
      handleToggleGame(session)
    case RESERVED_KEYS.NEXT_LEVEL:
      switchToNextLevel(session)
    case RESERVED_KEYS.PREV_LEVEL:
      switchToPrevLevel(session)
    case RESERVED_KEYS.RANDOMIZE:
      randomizeLevel(session)
    case RESERVED_KEYS.SETTINGS:
      toggleSettings(session)
    case RESERVED_KEYS.CONFIRM:
      handleConfirm(session)
```

### 11.2 In-Game Input

```
function handleInGameInput(session: GameSession, key: string):
  bindings = getActiveKeybindings(session)

  // Basic movement
  if key == bindings.MOVE_LEFT:
    moveBasic(session, Direction.LEFT)
  else if key == bindings.MOVE_DOWN:
    moveBasic(session, Direction.DOWN)
  else if key == bindings.MOVE_UP:
    moveBasic(session, Direction.UP)
  else if key == bindings.MOVE_RIGHT:
    moveBasic(session, Direction.RIGHT)

  // Grid movement
  else if key == bindings.GRID_LEFT:
    moveGrid(session, Direction.LEFT)
  else if key == bindings.GRID_DOWN:
    moveGrid(session, Direction.DOWN)
  else if key == bindings.GRID_UP:
    moveGrid(session, Direction.UP)
  else if key == bindings.GRID_RIGHT:
    moveGrid(session, Direction.RIGHT)

  // Sigil movement - angle brackets
  else if key == bindings.FIND_ANGLE_LEFT_BACKWARD:
    moveToAngleBracket(session, '<', 'backward')
  else if key == bindings.FIND_ANGLE_RIGHT_BACKWARD:
    moveToAngleBracket(session, '>', 'backward')
  else if key == bindings.FIND_ANGLE_LEFT_FORWARD:
    moveToAngleBracket(session, '<', 'forward')
  else if key == bindings.FIND_ANGLE_RIGHT_FORWARD:
    moveToAngleBracket(session, '>', 'forward')

  // Sigil movement - alphabet (two-key sequence)
  else if key == bindings.FIND_CHAR_FORWARD:
    session.pendingAction = 'findCharForward'
  else if key == bindings.FIND_CHAR_BACKWARD:
    session.pendingAction = 'findCharBackward'

  // Pending alphabet search
  else if session.pendingAction == 'findCharForward':
    moveToAlphabet(session, key, 'forward')
    session.pendingAction = null
  else if session.pendingAction == 'findCharBackward':
    moveToAlphabet(session, key, 'backward')
    session.pendingAction = null

  // Repeater
  else if key == bindings.REPEAT_BACKWARD:
    repeatLastMovement(session, 'n')
  else if key == bindings.REPEAT_FORWARD_SKIP_LINE:
    repeatLastMovement(session, 'm')
  else if key == bindings.REPEAT_BACKWARD_SKIP_LINE:
    repeatLastMovement(session, ',')
  else if key == bindings.REPEAT_FORWARD:
    repeatLastMovement(session, '.')

  // Body control
  else if key == bindings.SWITCH_TO_TAIL:
    switchBodyPart(session, BodyPart.TAIL)
  else if key == bindings.SWITCH_TO_BODY:
    switchBodyPart(session, BodyPart.BODY)
  else if key == bindings.SWITCH_TO_HEAD:
    switchBodyPart(session, BodyPart.HEAD)

  // Macros
  else if key in bindings.macros:
    executeMacro(session, key)
```

---

## 12. Filler Mode Specifics (items#700)

### 12.1 Filler Mode Data

```
struct FillerSession extends GameSession {
  Map<Position, Color> cellColors     // Track colors left by player
  List<ColorSource> activeColorSources
  Map<ColorSource, int> colorRespawnCounters
}
```

### 12.2 Color Pickup

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
  for colorSource, counter in session.colorRespawnCounters:
    counter -= 1
    if counter <= 0:
      // Respawn color source
      respawnColorSource(session, colorSource)
      delete session.colorRespawnCounters[colorSource]
```

### 12.3 Track Coloring (Visual Only)

```
function updateTrackColor(session: FillerSession, position: Position):
  // Visual feedback only, doesn't affect gameplay
  if session.player.currentColor != null:
    session.cellColors[position] = session.player.currentColor
```

### 12.4 Filler Mode Exclusions

```
// Filler mode disables (items#700 Exclusion):
// - Body expansion (items#180) - always body length 1
// - Fog of war (items#510) - not applicable to static levels
// - Score-based mode - always speed-based
// - Random level generation - all levels predefined

function initializeFillerSession(level: Level) -> FillerSession:
  session = FillerSession()
  session.mode = GameMode.FILLER
  session.player.body = [level.playerSpawn]  // Always length 1
  session.player.activePart = BodyPart.HEAD  // Fixed, cannot change
  // ... rest of initialization
  return session
```

---

## Appendix: Helper Functions

```
function clamp(value: int, min: int, max: int) -> int:
  return Math.max(min, Math.min(max, value))

function normalizeKey(event: KeyboardEvent) -> string:
  key = event.key.toLowerCase()
  if event.ctrlKey:
    key = "Ctrl+" + key
  if event.shiftKey:
    key = "Shift+" + key
  if event.altKey:
    key = "Alt+" + key
  return key

function getAllPositions(grid: Grid) -> List<Position>:
  positions = []
  for row from 0 to grid.rows:
    for col from 0 to grid.cols:
      positions.push(Position(row, col))
  return positions

function findIndex(positions: List<Position>, target: Position) -> int:
  for i from 0 to positions.length:
    if positions[i].equals(target):
      return i
  return -1

function isReachable(grid: Grid, items: List<Item>, from: Position, to: Position) -> bool:
  // BFS/DFS pathfinding
  visited = Set()
  queue = [from]

  while queue.length > 0:
    current = queue.shift()

    if current.equals(to):
      return true

    if visited.has(current):
      continue
    visited.add(current)

    for direction in [Direction.LEFT, Direction.DOWN, Direction.UP, Direction.RIGHT]:
      neighbor = current.add(direction)
      if grid.isInBounds(neighbor) AND not hasObstacle(items, neighbor):
        queue.push(neighbor)

  return false

function hasObstacle(items: List<Item>, position: Position) -> bool:
  for item in items:
    if item.type == ItemType.OBSTACLE AND item.position.equals(position):
      return true
  return false

function generateUUID() -> string:
  // Standard UUID generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    r = Math.random() * 16 | 0
    v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
```
