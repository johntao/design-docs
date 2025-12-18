# Stage 3 Specification: Advanced Movement

Reference tasks: `3.1` - `3.14`

---

## Additional Constants

### Advanced Keybindings

```
ADVANCED_KEYBINDINGS = {
  // Sigil Movement - Angle Brackets
  FIND_ANGLE_LEFT_BACKWARD:   "q",
  FIND_ANGLE_RIGHT_BACKWARD:  "w",
  FIND_ANGLE_LEFT_FORWARD:    "e",
  FIND_ANGLE_RIGHT_FORWARD:   "r",

  // Sigil Movement - Alphabets
  FIND_CHAR_BACKWARD:  "d",
  FIND_CHAR_FORWARD:   "f",

  // Repeater
  REPEAT_BACKWARD:           "n",
  REPEAT_FORWARD_SKIP_LINE:  "m",
  REPEAT_BACKWARD_SKIP_LINE: ",",
  REPEAT_FORWARD:            ".",

  // Body Control
  SWITCH_TO_TAIL:  "z",
  SWITCH_TO_BODY:  "x",
  SWITCH_TO_HEAD:  "c",

  // Grid Movement
  GRID_LEFT:      "Ctrl+h",
  GRID_DOWN:      "Ctrl+j",
  GRID_UP:        "Ctrl+k",
  GRID_RIGHT:     "Ctrl+l"
}
```

### Body Expansion

```
MIN_BODY_LENGTH = 1
MAX_BODY_LENGTH = 5
```

### Multi-Grid

```
MAX_GRIDS_PER_VIEW = 9
GRID_MARGIN_PX = 10
```

---

## Enums

### Sigil Subtype

```
enum SigilSubtype {
  ANGLE_LEFT,   // '<'
  ANGLE_RIGHT,  // '>'
  ALPHABET      // a-z, A-Z
}
```

### Body Part

```
enum BodyPart {
  HEAD,   // Variable length mode, extends forward
  BODY,   // Fixed length mode
  TAIL    // Variable length mode, extends backward
}
```

### Movement Type

```
enum MovementType {
  BASIC,      // hjkl - single cell, collidable
  GRID,       // Ctrl+hjkl - teleport between grids
  SIGIL,      // qwer/df - teleport to sigil
  REPEATER    // nm,. - repeat last non-basic movement
}
```

---

## Data Structures

### Item (Extended for Sigils)

```
struct Item {
  ItemType type
  Position position

  // Type-specific properties
  int? portalPairId              // For PORTAL
  SigilSubtype? sigilSubtype     // For SIGIL
  char? sigilChar                // For ALPHABET sigil
}
```

### Player (Extended for Body Expansion)

```
struct Player {
  List<Position> body      // body[0] = tail, body[-1] = head
  BodyPart activePart
  int score

  MovementType? lastNonBasicMovement
  Direction? lastMovementDirection
}

DEFAULT_PLAYER_STATE = {
  body: [spawn_position],
  activePart: BodyPart.HEAD,
  score: 0,
  lastNonBasicMovement: null,
  lastMovementDirection: null
}
```

### View (Multi-Grid)

```
struct View {
  List<Grid> grids
  int layoutRows   // Grid arrangement (e.g., 3 for 3x3)
  int layoutCols
}

function View.getGrid(gridPos: Position) -> Grid?:
  if gridPos.row < 0 OR gridPos.row >= this.layoutRows:
    return null
  if gridPos.col < 0 OR gridPos.col >= this.layoutCols:
    return null

  index = gridPos.row * this.layoutCols + gridPos.col
  if index >= this.grids.length:
    return null

  return this.grids[index]
```

### Pending Action State

```
struct PendingAction {
  string? actionType  // 'findCharForward' | 'findCharBackward'
}
```

---

## Sigil Movement

### Angle Brackets

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
    items = getItemsAt(session.activeItems, positions[i])
    for item in items:
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
  // Sigil movement disabled in body mode when length > 1
  if session.player.body.length > 1 AND session.player.activePart == BodyPart.BODY:
    return

  targetPos = findAngleBracket(session, bracketType, searchDirection)

  if targetPos != null:
    teleportPlayer(session, targetPos)
    session.player.lastNonBasicMovement = MovementType.SIGIL
```

### Alphabets

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
    items = getItemsAt(session.activeItems, positions[i])
    for item in items:
      if item.type == ItemType.SIGIL AND item.sigilSubtype == SigilSubtype.ALPHABET:
        if item.sigilChar == char:
          return positions[i]

  return null

function moveToAlphabet(
  session: GameSession,
  char: char,
  searchDirection: 'forward' | 'backward'
):
  if session.player.body.length > 1 AND session.player.activePart == BodyPart.BODY:
    return

  targetPos = findAlphabet(session, char, searchDirection)

  if targetPos != null:
    teleportPlayer(session, targetPos)
    session.player.lastNonBasicMovement = MovementType.SIGIL
```

---

## Repeater System

```
function repeatLastMovement(session: GameSession, mode: 'n' | 'm' | ',' | '.'):
  player = session.player

  if player.lastNonBasicMovement == null:
    return

  // Determine search parameters based on mode
  switch mode:
    case 'n':  // Backward (n,n to 0,0)
      direction = 'backward'

    case '.':  // Forward (0,0 to n,n)
      direction = 'forward'

    case 'm':  // Forward, skip to next line first
      moveToNextLineStart(session)
      direction = 'forward'

    case ',':  // Backward, skip to previous line end
      moveToPrevLineEnd(session)
      direction = 'backward'

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

---

## Body Expansion System

### Body Part Switching

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

### Movement Execution by Body Part

```
function executeMovement(
  session: GameSession,
  targetPos: Position,
  direction: Direction
):
  player = session.player

  switch player.activePart:
    case BodyPart.HEAD:
      executeVariableLengthMove(session, targetPos, 'head')

    case BodyPart.TAIL:
      executeVariableLengthMove(session, targetPos, 'tail')

    case BodyPart.BODY:
      executeFixedLengthMove(session, targetPos, direction)
```

### Variable Length Movement

```
function executeVariableLengthMove(
  session: GameSession,
  targetPos: Position,
  end: 'head' | 'tail'
):
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

### Fixed Length Movement

```
function executeFixedLengthMove(
  session: GameSession,
  targetPos: Position,
  direction: Direction
):
  player = session.player

  // Move entire body in direction
  newBody = []

  for pos in player.body:
    newPos = pos.add(direction)

    // Check bounds and obstacles for each part
    if not isValidPosition(session, newPos):
      return  // Cancel movement if any part blocked

    newBody.push(newPos)

  // Trigger collision for all new positions
  for newPos in newBody:
    items = getItemsAt(session.activeItems, newPos)
    for item in items:
      handleCollision(session, player, item)

  player.body = newBody
```

### Body Part Constraints

```
function canUseSigilMovement(player: Player) -> bool:
  // Sigil movement disabled in body mode when length > 1
  if player.body.length > 1 AND player.activePart == BodyPart.BODY:
    return false
  return true

function canUsePortal(player: Player) -> bool:
  // Portals disabled when body length > 1
  return player.body.length == 1
```

---

## Grid Movement (Multi-Grid)

```
function moveGrid(session: GameSession, direction: Direction):
  currentGrid = getCurrentGrid(session)
  view = session.currentLevel.view

  // Calculate target grid position
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

  // Grid movement is non-collidable
  teleportPlayer(session, newPos, targetGrid)

  player.lastNonBasicMovement = MovementType.GRID
  player.lastMovementDirection = direction
```

---

## Helper Functions

```
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

function teleportPlayer(
  session: GameSession,
  targetPos: Position,
  grid: Grid? = null
):
  player = session.player

  if player.body.length == 1:
    // Simple teleport for single-cell body
    player.body[0] = targetPos
  else:
    // For multi-cell body, only teleport head
    player.body[player.body.length - 1] = targetPos

function clamp(value: int, min: int, max: int) -> int:
  return Math.max(min, Math.min(max, value))

function getItemsAt(items: List<Item>, position: Position) -> List<Item>:
  return items.filter(item => item.position.equals(position))
```

---

## Input Handling (Extended)

```
function handleInGameInput(session: GameSession, key: string):
  bindings = ADVANCED_KEYBINDINGS

  // Basic movement (from Stage 1)
  if key == bindings.MOVE_LEFT:
    moveBasic(session, Direction.LEFT)
  // ... other basic movements

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
```
