# Stage 1 Specification: Core Foundation

Reference tasks: `1.1` - `1.10`

---

## Constants

### Reserved Keybindings

```
RESERVED_KEYS = {
  TOGGLE_GAME:    "\\",
  SETTINGS:       "Escape"
}
```

### Basic Keybindings

```
BASIC_KEYBINDINGS = {
  MOVE_LEFT:      "h",
  MOVE_DOWN:      "j",
  MOVE_UP:        "k",
  MOVE_RIGHT:     "l"
}
```

### Grid Dimensions

```
DEFAULT_GRID_ROWS = 10
DEFAULT_GRID_COLS = 10
```

### Gameplay Values

```
PLAYER_START = { row: 2, col: 3 }
TOTAL_COLLECTABLES = 9
MAX_DISPLAY = 5
PLAYER_CHAR = '\u25A2'  // ▢
COLLECTABLE_CHAR = '\u2022'  // •
```

---

## Enums

### Game State

```
enum GameState {
  OUT_OF_GAME,
  IN_GAME
}
```

### Direction

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

---

## Data Structures

### Position

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

### Cell

```
struct Cell {
  Position position
  bool hasPlayer
  bool hasCollectable
}
```

### Grid

```
struct Grid {
  int rows
  int cols
  Cell[][] cells
}

function Grid.isInBounds(pos: Position) -> bool:
  return pos.row >= 0 AND pos.row < this.rows
     AND pos.col >= 0 AND pos.col < this.cols

function Grid.getCell(pos: Position) -> Cell?:
  if not this.isInBounds(pos):
    return null
  return this.cells[pos.row][pos.col]
```

### Player

```
struct Player {
  Position position
  int score
}

DEFAULT_PLAYER = {
  position: PLAYER_START,
  score: 0
}
```

### Collectable

```
struct Collectable {
  Position position
}
```

### Game State

```
struct GameState {
  GameState state
  Grid grid
  Player player
  List<Collectable> allCollectables
  List<Collectable> visibleCollectables  // Max MAX_DISPLAY

  int previousScore
  int highestScore
  bool settingsOpen
}
```

---

## Game Logic

### Initialization

```
function init():
  createGrid()
  generateCollectables()
  updateVisibleCollectables()
  render()

function createGrid():
  grid = Grid(rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS)
  for row from 0 to grid.rows:
    for col from 0 to grid.cols:
      grid.cells[row][col] = Cell(position: Position(row, col))

function generateCollectables():
  allCollectables = []
  occupied = Set()
  occupied.add(player.position)

  while allCollectables.length < TOTAL_COLLECTABLES:
    row = random(0, grid.rows - 1)
    col = random(0, grid.cols - 1)
    pos = Position(row, col)

    if not occupied.has(pos):
      occupied.add(pos)
      allCollectables.push(Collectable(position: pos))

function updateVisibleCollectables():
  visibleCollectables = allCollectables.slice(0, MAX_DISPLAY)
```

### Game State Machine

```
function toggleGame():
  if state == GameState.OUT_OF_GAME:
    startGame()
  else:
    stopGame()

function startGame():
  state = GameState.IN_GAME
  player = DEFAULT_PLAYER
  score = 0
  generateCollectables()
  updateVisibleCollectables()
  render()

function stopGame():
  state = GameState.OUT_OF_GAME
  previousScore = player.score
  if player.score > highestScore:
    highestScore = player.score
  render()
```

### Movement

```
function movePlayer(direction: Direction):
  if state != GameState.IN_GAME:
    return

  vec = DIRECTION_VECTORS[direction]
  newPos = Position(
    player.position.row + vec.row,
    player.position.col + vec.col
  )

  // Boundary check
  if not grid.isInBounds(newPos):
    return  // Stay in place

  // Move player
  player.position = newPos

  // Check collision
  checkCollision()

  render()

  // Check win condition
  if allCollectables.length == 0:
    stopGame()
```

### Collision Detection

```
function checkCollision():
  // Find collectable at player position
  visibleIndex = visibleCollectables.findIndex(
    c => c.position.equals(player.position)
  )

  if visibleIndex != -1:
    // Remove from visible
    visibleCollectables.removeAt(visibleIndex)

    // Remove from all
    allIndex = allCollectables.findIndex(
      c => c.position.equals(player.position)
    )
    if allIndex != -1:
      allCollectables.removeAt(allIndex)

    // Increase score
    player.score += 1

    // Update visible collectables
    updateVisibleCollectables()
```

---

## Rendering

### Grid Rendering

```
function render():
  // Clear all cells
  clearGrid()

  // Render visible collectables
  for collectable in visibleCollectables:
    cell = grid.getCell(collectable.position)
    cell.hasCollectable = true

  // Render player
  playerCell = grid.getCell(player.position)
  playerCell.hasPlayer = true

  // Update HUD
  updateHUD()

function clearGrid():
  for row from 0 to grid.rows:
    for col from 0 to grid.cols:
      cell = grid.cells[row][col]
      cell.hasPlayer = false
      cell.hasCollectable = false
```

### HUD

```
function updateHUD():
  displayScore(player.score)
  displayPreviousScore(previousScore)
  displayHighestScore(highestScore)
  displayRemaining(allCollectables.length)
  displayGameState(state)
```

---

## Settings Modal

```
struct SettingsModal {
  bool isOpen
}

function openSettings():
  settingsOpen = true

function closeSettings():
  settingsOpen = false

function toggleSettings():
  if settingsOpen:
    closeSettings()
  else:
    openSettings()
```

---

## Input Handling

```
function handleKeyDown(event: KeyboardEvent):
  key = event.key

  // Settings toggle (works in any state)
  if key == RESERVED_KEYS.SETTINGS:
    toggleSettings()
    return

  // Ignore other keys if settings open
  if settingsOpen:
    return

  // Game toggle
  if key == RESERVED_KEYS.TOGGLE_GAME:
    toggleGame()
    return

  // Movement (only in-game)
  if state == GameState.IN_GAME:
    if key == BASIC_KEYBINDINGS.MOVE_LEFT:
      movePlayer(Direction.LEFT)
    else if key == BASIC_KEYBINDINGS.MOVE_DOWN:
      movePlayer(Direction.DOWN)
    else if key == BASIC_KEYBINDINGS.MOVE_UP:
      movePlayer(Direction.UP)
    else if key == BASIC_KEYBINDINGS.MOVE_RIGHT:
      movePlayer(Direction.RIGHT)
```
