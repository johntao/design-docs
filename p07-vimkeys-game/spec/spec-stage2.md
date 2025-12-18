# Stage 2 Specification: Levels & Items

Reference tasks: `2.1` - `2.10`

---

## Additional Constants

### Reserved Keys

```
RESERVED_KEYS = {
  ...Stage1_Keys,
  NEXT_LEVEL:     "=",
  PREV_LEVEL:     "Backspace",
  RANDOMIZE:      "]",
  CONFIRM:        "Enter"
}
```

### Level Generation

```
MIN_OBSTACLE_DENSITY = 0.0
MAX_OBSTACLE_DENSITY = 0.20
DEFAULT_OBSTACLE_DENSITY = 0.10
DEFAULT_COLLECTABLE_COUNT = 9
```

### Item Characters

```
OBSTACLE_CHAR = '\u2588'  // █
PORTAL_CHAR = '\u25CB'    // ◯
```

---

## Enums

### Item Type

```
enum ItemType {
  COLLECTABLE,
  OBSTACLE,
  PORTAL,
  SIGIL
}
```

### Level Type

```
enum LevelType {
  DEMO,       // Sandbox, cannot start formally
  PREDEFINED, // Fixed layout
  DYNAMIC     // Randomly generated
}
```

---

## Data Structures

### Item

```
struct Item {
  ItemType type
  Position position

  // Type-specific properties
  int? portalPairId      // For PORTAL type
}
```

### Level

```
struct Level {
  string id
  string name
  LevelType type

  Grid grid
  Position playerSpawn
  List<Item> items

  LevelMetadata metadata
}

struct LevelMetadata {
  string? author
  string? difficulty
}
```

### Game Session (Extended)

```
struct GameSession {
  GameState state
  Level currentLevel
  Player player

  // Runtime state
  float elapsedTime
  int collectablesRemaining
  List<Item> activeItems

  // Previous state
  int previousScore
  int highestScore
}
```

---

## Level Management

### Level Loading

```
function loadLevel(levelId: string) -> Level:
  levelData = loadLevelData(levelId)
  validateLevel(levelData)

  return Level(
    id: levelData.id,
    name: levelData.name,
    type: determineLevelType(levelData),
    grid: buildGrid(levelData.grid),
    playerSpawn: levelData.player_spawn,
    items: buildItems(levelData.items),
    metadata: levelData.metadata
  )
```

### Level Validation

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
  portalPairs = groupBy(
    levelData.items.filter(i => i.type == ItemType.PORTAL),
    'pair_id'
  )
  for pairId, portals in portalPairs:
    if portals.length != 2:
      errors.push("Incomplete portal pair: " + pairId)

  return ValidationResult(valid: errors.length == 0, errors: errors)
```

### Predefined Levels

```
LEVEL_ORDER = [
  "demo",
  "predefined_1",
  "predefined_2",
  "predefined_3",
  "dynamic"
]

// Example: Predefined Level 1
LEVEL_1 = {
  id: "predefined_1",
  name: "Level 1",
  type: LevelType.PREDEFINED,
  grid: { rows: 10, cols: 10 },
  playerSpawn: { row: 2, col: 3 },
  items: [
    { type: ItemType.COLLECTABLE, position: { row: 1, col: 5 } },
    { type: ItemType.COLLECTABLE, position: { row: 3, col: 7 } },
    { type: ItemType.COLLECTABLE, position: { row: 5, col: 2 } },
    // ... 6 more collectables
    { type: ItemType.OBSTACLE, position: { row: 5, col: 5 } },
    { type: ItemType.OBSTACLE, position: { row: 6, col: 5 } }
  ]
}
```

### Level Switching

```
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
```

### Demo Level

```
function createDemoLevel() -> Level:
  return Level(
    id: "demo",
    name: "Demo Level",
    type: LevelType.DEMO,
    grid: Grid(rows: 10, cols: 10),
    playerSpawn: { row: 2, col: 3 },
    items: generateRandomCollectables(9)
  )

function handleDemoLevel(session: GameSession):
  // Demo level cannot be formally started
  // Always in playable state

  if session.collectablesRemaining == 0:
    // Respawn collectables automatically
    respawnCollectables(session)

  // No score calculation in demo mode
  // No win/loss conditions
```

### Dynamic Level Generation

```
struct GenerationParams {
  int rows
  int cols
  float obstacleDensity
  int collectableCount
  int? seed
}

function generateRandomLevel(params: GenerationParams) -> Level:
  grid = createEmptyGrid(params.rows, params.cols)
  items = []

  // 1. Place player spawn (center or random)
  playerSpawn = Position(
    params.rows / 2,
    params.cols / 2
  )

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

  // 4. Place portals (optional, in pairs)
  // Example: 1 portal pair
  pos1 = findRandomEmptyCell(grid, items)
  pos2 = findRandomEmptyCell(grid, items)
  if pos1 != null AND pos2 != null:
    items.push(Item(type: ItemType.PORTAL, position: pos1, portalPairId: 1))
    items.push(Item(type: ItemType.PORTAL, position: pos2, portalPairId: 1))

  return Level(
    id: "dynamic_" + generateUUID(),
    name: "Random Level",
    type: LevelType.DYNAMIC,
    grid: grid,
    playerSpawn: playerSpawn,
    items: items
  )

function randomizeLevel(session: GameSession):
  if session.currentLevel.type == LevelType.DYNAMIC:
    newLevel = generateRandomLevel(session.generationParams)
    session.currentLevel = newLevel
    resetGame(session)
```

---

## Timer System

### Timer State

```
struct TimerState {
  float startTime
  float elapsedTime
}

function startTimer(session: GameSession):
  session.timer.startTime = getCurrentTime()
  session.timer.elapsedTime = 0

function updateTimer(session: GameSession, deltaTime: float):
  session.timer.elapsedTime += deltaTime

function getElapsedTime(session: GameSession) -> float:
  return session.timer.elapsedTime
```

---

## Win Condition

### Check Win

```
function checkWinCondition(session: GameSession) -> bool:
  // Speed-based: win when all collectables cleared
  return session.collectablesRemaining <= 0

function handleWin(session: GameSession):
  finalTime = session.timer.elapsedTime
  stopGame(session)
  displayWinScreen(finalTime)
```

---

## Collision System (Extended)

### Collision Types

```
enum CollisionResult {
  NONE,       // No collision occurred
  PICKED,     // Collectable was picked up
  BLOCKED,    // Movement blocked (obstacle)
  TELEPORTED  // Portal triggered
}
```

### Collision Handler

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
      return CollisionResult.NONE  // Non-collidable

  return CollisionResult.NONE
```

### Obstacle Collision

```
function movePlayer(session: GameSession, direction: Direction):
  player = session.player
  newPos = player.position.add(direction)

  // Boundary check
  if not session.currentLevel.grid.isInBounds(newPos):
    return  // Blocked by boundary

  // Check for obstacle
  obstacleAtPos = session.activeItems.find(
    item => item.type == ItemType.OBSTACLE AND item.position.equals(newPos)
  )

  if obstacleAtPos != null:
    return  // Blocked by obstacle

  // Move player
  player.position = newPos

  // Check other collisions
  checkCollisions(session)
```

### Portal Collision

```
function handlePortalCollision(
  session: GameSession,
  player: Player,
  item: Item
) -> CollisionResult:

  // Find paired portal
  pairedPortal = findPortalPair(session, item.portalPairId, item.position)

  if pairedPortal == null:
    return CollisionResult.NONE

  // Teleport player
  player.position = pairedPortal.position
  return CollisionResult.TELEPORTED

function findPortalPair(
  session: GameSession,
  pairId: int,
  excludePos: Position
) -> Item?:
  for item in session.activeItems:
    if item.type == ItemType.PORTAL:
      if item.portalPairId == pairId AND not item.position.equals(excludePos):
        return item
  return null
```

---

## Helper Functions

```
function isReachable(
  grid: Grid,
  items: List<Item>,
  from: Position,
  to: Position
) -> bool:
  // BFS pathfinding
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
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    r = Math.random() * 16 | 0
    v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
```
