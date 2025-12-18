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
PLAYER_CHAR = '\u25A2'  // ▢
COLLECTABLE_CHAR = '\u2022'  // •

// Fixed collectable positions (not random)
FIXED_COLLECTABLES = [
  { row: 1, col: 5 },
  { row: 3, col: 7 },
  { row: 5, col: 2 },
  { row: 6, col: 8 },
  { row: 7, col: 4 },
  { row: 8, col: 1 },
  { row: 2, col: 9 },
  { row: 4, col: 4 },
  { row: 9, col: 6 }
]

// Configurable at runtime
DEFAULT_MAX_DISPLAY = 5  // 0 or falsy = show all
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
}

DEFAULT_PLAYER = {
  position: PLAYER_START
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
  List<Collectable> visibleCollectables

  // Timer-based (Mode 2)
  float elapsedTime       // Incremental timer in seconds
  float? previousTime     // Previous game time
  float? bestTime         // Best (lowest) time
  float? lastFrameTime    // For delta time calculation

  bool settingsOpen

  // Configurable settings
  KeybindingConfig keybindings
  int maxDisplay          // 0 or falsy = show all
}

struct KeybindingConfig {
  string MOVE_LEFT
  string MOVE_DOWN
  string MOVE_UP
  string MOVE_RIGHT
  string TOGGLE_GAME
  string SETTINGS
}

DEFAULT_KEYBINDINGS = {
  MOVE_LEFT: "h",
  MOVE_DOWN: "j",
  MOVE_UP: "k",
  MOVE_RIGHT: "l",
  TOGGLE_GAME: "\\",
  SETTINGS: "Escape"
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
  // Use fixed collectable positions (not random)
  allCollectables = FIXED_COLLECTABLES.map(pos => Collectable(position: pos))

function updateVisibleCollectables():
  // Show up to maxDisplay collectables (0 or falsy = show all)
  if maxDisplay > 0:
    visibleCollectables = allCollectables.slice(0, maxDisplay)
  else:
    visibleCollectables = allCollectables.copy()
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
  elapsedTime = 0
  lastFrameTime = getCurrentTime()
  generateCollectables()
  updateVisibleCollectables()
  render()
  gameLoop()  // Start timer loop

function stopGame():
  state = GameState.OUT_OF_GAME
  previousTime = elapsedTime
  // Best time is lowest time
  if bestTime == null OR elapsedTime < bestTime:
    bestTime = elapsedTime
  render()

function gameLoop():
  if state != GameState.IN_GAME:
    return

  now = getCurrentTime()
  deltaTime = (now - lastFrameTime) / 1000  // Convert to seconds
  lastFrameTime = now

  elapsedTime += deltaTime
  updateHUD()

  requestNextFrame(gameLoop)  // Continue loop
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

    // Update visible collectables (show next one if available)
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

### HUD (Timer-based Mode 2)

```
function updateHUD():
  // Display incremental timer
  displayTimer(elapsedTime)

  // Display previous and best times (lower is better)
  displayPreviousTime(previousTime)
  displayBestTime(bestTime)

  // Display remaining collectables
  displayRemaining(allCollectables.length)

  // Display game state
  displayGameState(state)

// HUD displays:
// - TIMER: current elapsed time (e.g., "12.3s")
// - PREVIOUS: previous game time (e.g., "15.8s" or "-")
// - BEST: best (lowest) time (e.g., "10.2s" or "-")
// - REMAINING: number of collectables left
```

---

## Settings Modal

```
struct SettingsModal {
  bool isOpen
}

function openSettings():
  // Load current settings into input fields
  loadKeybindingsToInputs()
  loadMaxDisplayToInput()
  settingsOpen = true

function closeSettings():
  settingsOpen = false

function applySettings():
  // Save keybindings from input fields
  keybindings.MOVE_LEFT = getInputValue('key-left') OR 'h'
  keybindings.MOVE_DOWN = getInputValue('key-down') OR 'j'
  keybindings.MOVE_UP = getInputValue('key-up') OR 'k'
  keybindings.MOVE_RIGHT = getInputValue('key-right') OR 'l'

  // Save max display (0 = show all)
  maxDisplay = parseInt(getInputValue('max-display')) OR 0

  // Update visible collectables if game is running
  if state == GameState.IN_GAME:
    updateVisibleCollectables()
    render()

  closeSettings()

function toggleSettings():
  if settingsOpen:
    closeSettings()
  else:
    openSettings()

// Settings Modal UI:
// Section 1: Keybindings (Customizable)
//   - Move Left: [input field] (default: h)
//   - Move Down: [input field] (default: j)
//   - Move Up: [input field] (default: k)
//   - Move Right: [input field] (default: l)
//
// Section 2: Gameplay Settings
//   - Max Display: [number input] (0 = show all, default: 5)
//
// Section 3: Reserved Keys (Not Changeable)
//   - Start/Stop: \
//   - Settings: Esc
//
// Button: "Apply & Close"
```

---

## Input Handling

```
function handleKeyDown(event: KeyboardEvent):
  key = event.key

  // Settings toggle (works in any state)
  if key == keybindings.SETTINGS:
    toggleSettings()
    return

  // Ignore other keys if settings open
  if settingsOpen:
    return

  // Game toggle
  if key == keybindings.TOGGLE_GAME:
    toggleGame()
    return

  // Movement (only in-game) - uses configurable keybindings
  if state == GameState.IN_GAME:
    if key == keybindings.MOVE_LEFT:
      movePlayer(Direction.LEFT)
    else if key == keybindings.MOVE_DOWN:
      movePlayer(Direction.DOWN)
    else if key == keybindings.MOVE_UP:
      movePlayer(Direction.UP)
    else if key == keybindings.MOVE_RIGHT:
      movePlayer(Direction.RIGHT)

// Note: All movement keybindings (hjkl) are now customizable
// through the settings modal
```
