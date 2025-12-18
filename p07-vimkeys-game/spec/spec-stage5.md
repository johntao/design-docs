# Stage 5 Specification: Configuration & Polish

Reference tasks: `5.1` - `5.12`

---

## Additional Constants

### Macros

```
MAX_MACRO_ACTIONS = 6
```

### Save Slots

```
MAX_SAVE_SLOTS = 3
```

### Grid Sizes

```
GRID_SIZE_VALUES = {
  SMALL: { rows: 8, cols: 8 },
  MEDIUM: { rows: 12, cols: 12 },
  LARGE: { rows: 16, cols: 16 }
}
```

---

## Enums

### Settings Tab

```
enum SettingsTab {
  GAMEPLAY,
  KEYBINDINGS
}
```

### Grid Size

```
enum GridSize {
  SMALL,   // 8x8
  MEDIUM,  // 12x12
  LARGE    // 16x16
}
```

---

## Data Structures

### Keybinding Config

```
struct KeybindingConfig {
  Map<string, string> bindings    // action_id -> key
  Map<string, string> macros      // macro_id -> action_sequence
}

struct SaveSlot {
  int slotId
  KeybindingConfig keybindings
  GameplayConfig gameplay
}
```

### Gameplay Config

```
struct GameplayConfig {
  GameMode gameMode
  ScoreMode scoreMode       // Picker only
  GridSize gridSize
  float collectableDensity
  BodyLengthMode bodyMode   // Picker only
  bool fogOfWar             // Picker only
}
```

### Settings Modal

```
struct SettingsModal {
  bool isOpen
  SettingsTab activeTab
  int activeSlot

  // Gameplay tab
  GameplayConfig tempGameplay

  // Keybindings tab
  KeybindingConfig tempKeybindings
  string? conflictWarning
  string? editingAction    // Action currently being rebound
}
```

---

## Settings Modal - Gameplay Tab

### Tab Structure

```
function renderGameplayTab(modal: SettingsModal):
  config = modal.tempGameplay

  renderSection("Game Mode", [
    RadioButton("Picker", config.gameMode == GameMode.PICKER),
    RadioButton("Filler", config.gameMode == GameMode.FILLER)
  ])

  if config.gameMode == GameMode.PICKER:
    renderSection("Score Mode", [
      RadioButton("Speed-based", config.scoreMode == ScoreMode.SPEED_BASED),
      RadioButton("Score-based", config.scoreMode == ScoreMode.SCORE_BASED)
    ])

    renderSection("Body Length Mode", [
      RadioButton("Variable", true),
      RadioButton("Fixed", false)
    ])

    renderSection("Fog of War", [
      Toggle(config.fogOfWar)
    ])

  renderSection("Grid Size", [
    Dropdown(config.gridSize, [GridSize.SMALL, GridSize.MEDIUM, GridSize.LARGE])
  ])

  renderSection("Collectable Density", [
    Slider(config.collectableDensity, min: 0.1, max: 0.5)
  ])
```

### Apply Gameplay Settings

```
function applyGameplaySettings(modal: SettingsModal, session: GameSession):
  // Copy temp config to active config
  session.gameplayConfig = modal.tempGameplay

  // Regenerate level with new settings
  if session.currentLevel.type == LevelType.DYNAMIC:
    regenerateLevelWithSettings(session)
```

---

## Settings Modal - Keybindings Tab

### Tab Structure

```
struct KeybindingRow {
  string actionId
  string actionName
  string currentKey
}

function renderKeybindingsTab(modal: SettingsModal):
  keybindings = modal.tempKeybindings

  // Basic Movement
  renderSection("Basic Movement", [
    KeybindingRow("MOVE_LEFT", "Move Left", keybindings.bindings["MOVE_LEFT"]),
    KeybindingRow("MOVE_DOWN", "Move Down", keybindings.bindings["MOVE_DOWN"]),
    KeybindingRow("MOVE_UP", "Move Up", keybindings.bindings["MOVE_UP"]),
    KeybindingRow("MOVE_RIGHT", "Move Right", keybindings.bindings["MOVE_RIGHT"])
  ])

  // Grid Movement
  renderSection("Grid Movement", [
    KeybindingRow("GRID_LEFT", "Grid Left", keybindings.bindings["GRID_LEFT"]),
    // ... other grid movements
  ])

  // Sigil Movement
  renderSection("Sigil Movement", [
    KeybindingRow("FIND_ANGLE_LEFT_BACKWARD", "Find '<' Backward", keybindings.bindings["FIND_ANGLE_LEFT_BACKWARD"]),
    // ... other sigil movements
  ])

  // Repeater
  renderSection("Repeater", [
    KeybindingRow("REPEAT_BACKWARD", "Repeat Backward", keybindings.bindings["REPEAT_BACKWARD"]),
    // ... other repeaters
  ])

  // Body Control
  renderSection("Body Control", [
    KeybindingRow("SWITCH_TO_TAIL", "Switch to Tail", keybindings.bindings["SWITCH_TO_TAIL"]),
    KeybindingRow("SWITCH_TO_BODY", "Switch to Body", keybindings.bindings["SWITCH_TO_BODY"]),
    KeybindingRow("SWITCH_TO_HEAD", "Switch to Head", keybindings.bindings["SWITCH_TO_HEAD"])
  ])

  // Conflict warning
  if modal.conflictWarning != null:
    renderWarning(modal.conflictWarning)
```

### Click-to-Rebind

```
function handleKeybindingClick(modal: SettingsModal, actionId: string):
  modal.editingAction = actionId
  displayMessage("Press a key to rebind " + actionId)

function handleKeybindingInput(modal: SettingsModal, key: string):
  if modal.editingAction == null:
    return

  actionId = modal.editingAction

  // Check for conflicts
  conflict = checkKeybindingConflict(modal.tempKeybindings, actionId, key)

  if conflict != null:
    modal.conflictWarning = "Key '" + key + "' is already bound to " + conflict
    return

  // Apply binding
  modal.tempKeybindings.bindings[actionId] = key
  modal.editingAction = null
  modal.conflictWarning = null
```

### Conflict Detection

```
function checkKeybindingConflict(
  config: KeybindingConfig,
  actionId: string,
  key: string
) -> string?:
  // Check reserved keys
  for reservedKey in RESERVED_KEYS:
    if key == reservedKey:
      return "Reserved key"

  // Check existing bindings
  for existingActionId, existingKey in config.bindings:
    if existingActionId != actionId AND existingKey == key:
      return existingActionId

  return null
```

### Reset to Default

```
function resetKeybindingsToDefault(modal: SettingsModal):
  modal.tempKeybindings.bindings = DEFAULT_KEYBINDINGS.copy()
  modal.tempKeybindings.macros = {}
  modal.conflictWarning = null
```

---

## Macro System

### Macro Definition

```
struct Macro {
  string id
  List<string> actions    // Max MAX_MACRO_ACTIONS
}

function createMacro(id: string, actions: List<string>) -> Macro:
  if actions.length > MAX_MACRO_ACTIONS:
    throw Error("Macro exceeds maximum actions")

  return Macro(id: id, actions: actions)
```

### Macro Execution

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

function parseDirectionFromAction(action: string) -> Direction?:
  switch action:
    case 'h': return Direction.LEFT
    case 'j': return Direction.DOWN
    case 'k': return Direction.UP
    case 'l': return Direction.RIGHT
    default: return null
```

---

## Save Slots & Persistence

### Save Slot Structure

```
struct SaveSlotData {
  int slotId
  string name
  KeybindingConfig keybindings
  GameplayConfig gameplay
  int highestScore
  timestamp lastModified
}
```

### Save to localStorage

```
function saveToSlot(slotId: int, data: SaveSlotData):
  key = "vimkeys_game_slot_" + slotId
  json = JSON.stringify(data)
  localStorage.setItem(key, json)

function loadFromSlot(slotId: int) -> SaveSlotData?:
  key = "vimkeys_game_slot_" + slotId
  json = localStorage.getItem(key)

  if json == null:
    return null

  return JSON.parse(json)

function deleteSlot(slotId: int):
  key = "vimkeys_game_slot_" + slotId
  localStorage.removeItem(key)

function getAllSlots() -> List<SaveSlotData>:
  slots = []
  for i from 1 to MAX_SAVE_SLOTS:
    slot = loadFromSlot(i)
    if slot != null:
      slots.push(slot)
  return slots
```

### Auto-Save

```
function autoSave(session: GameSession):
  // Save highest score
  if session.player.score > session.highestScore:
    session.highestScore = session.player.score

  // Save to active slot
  data = SaveSlotData(
    slotId: session.activeSlot,
    name: "Slot " + session.activeSlot,
    keybindings: session.keybindings,
    gameplay: session.gameplayConfig,
    highestScore: session.highestScore,
    lastModified: getCurrentTimestamp()
  )

  saveToSlot(session.activeSlot, data)
```

---

## Performance Optimization

### Input Latency

```
// Target: < 16ms (60fps)

function optimizeInputHandling():
  // Use requestAnimationFrame for rendering
  // Decouple input handling from rendering

  inputQueue = []

  function handleKeyDown(event):
    // Queue input instead of processing immediately
    inputQueue.push({
      key: event.key,
      timestamp: performance.now()
    })

  function processInputs():
    while inputQueue.length > 0:
      input = inputQueue.shift()
      processInput(input)

    requestAnimationFrame(processInputs)
```

### Rendering Optimization

```
function optimizeRendering():
  // Only update changed cells
  lastRenderedState = {}

  function render(session: GameSession):
    currentState = computeGridState(session)

    for row from 0 to grid.rows:
      for col from 0 to grid.cols:
        pos = Position(row, col)
        key = pos.row + "," + pos.col

        if currentState[key] != lastRenderedState[key]:
          updateCell(pos, currentState[key])
          lastRenderedState[key] = currentState[key]
```

---

## Visual Polish

### Animations

```
CSS_ANIMATIONS = {
  collectablePickup: {
    duration: "200ms",
    effect: "scale(1.5) rotate(360deg)"
  },
  playerMove: {
    duration: "100ms",
    effect: "translateX/Y with ease-out"
  },
  comboPopup: {
    duration: "300ms",
    effect: "fade-in and slide-up"
  }
}
```

### Transitions

```
CSS_TRANSITIONS = {
  cellHighlight: "background-color 150ms ease",
  gridBorder: "border-color 200ms ease",
  hudValue: "color 150ms ease, transform 100ms ease"
}
```

---

## Input Handling (Complete)

### Key Normalization

```
function normalizeKey(event: KeyboardEvent) -> string:
  key = event.key.toLowerCase()
  if event.ctrlKey:
    key = "Ctrl+" + key
  if event.shiftKey:
    key = "Shift+" + key
  if event.altKey:
    key = "Alt+" + key
  return key
```

### Complete Handler

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

---

## Testing

### Performance Tests

```
function testInputLatency():
  // Measure time from keydown to screen update
  startTime = performance.now()
  simulateKeyPress('h')
  endTime = performance.now()

  latency = endTime - startTime
  assert(latency < 16, "Input latency exceeds 16ms")

function testFrameRate():
  // Measure frames per second during gameplay
  frameCount = 0
  startTime = performance.now()

  measureFor(1000ms):
    frameCount += 1

  fps = frameCount
  assert(fps >= 60, "Frame rate below 60fps")
```

### Cross-Browser Tests

```
BROWSERS_TO_TEST = [
  "Chrome",
  "Firefox",
  "Safari",
  "Edge"
]

function testBrowser(browserName: string):
  // Test all keybindings
  testAllKeybindings()

  // Test grid rendering
  testGridRendering()

  // Test localStorage
  testPersistence()

  // Test performance
  testInputLatency()
  testFrameRate()
```

---

## Finalization Checklist

```
FINALIZATION_TASKS = [
  "All keybindings functional",
  "Settings modal fully working",
  "Save slots persisting correctly",
  "Macros executing properly",
  "Input latency < 16ms",
  "60fps maintained during gameplay",
  "Cross-browser tested",
  "Visual polish applied",
  "All game modes working",
  "No console errors",
  "Mobile responsive (optional)",
  "Documentation complete"
]
```
