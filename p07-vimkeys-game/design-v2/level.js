// Level data for vimkeys-game
// Each level defines grid dimensions, player spawn, and items

const LEVELS = {
  picker: [
    {
      id: 'demo_blank',
      name: 'Demo: Blank',
      isDemo: true,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      items: [
        { type: 'collectable', subtype: 'coin', row: 2, col: 3 },
        { type: 'collectable', subtype: 'coin', row: 5, col: 7 },
        { type: 'collectable', subtype: 'coin', row: 8, col: 1 },
        { type: 'collectable', subtype: 'coin', row: 1, col: 8 },
        { type: 'collectable', subtype: 'coin', row: 6, col: 5 },
        { type: 'collectable', subtype: 'coin', row: 0, col: 0 },
        { type: 'collectable', subtype: 'coin', row: 9, col: 9 },
        { type: 'collectable', subtype: 'coin', row: 3, col: 6 },
        { type: 'collectable', subtype: 'coin', row: 7, col: 2 },
      ]
    },
    {
      id: 'demo_sigil',
      name: 'Demo: Sigil',
      isDemo: true,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      items: [
        // 9 coins
        { type: 'collectable', subtype: 'coin', row: 2, col: 3 },
        { type: 'collectable', subtype: 'coin', row: 5, col: 7 },
        { type: 'collectable', subtype: 'coin', row: 8, col: 1 },
        { type: 'collectable', subtype: 'coin', row: 0, col: 9 },
        { type: 'collectable', subtype: 'coin', row: 9, col: 0 },
        { type: 'collectable', subtype: 'coin', row: 1, col: 4 },
        { type: 'collectable', subtype: 'coin', row: 6, col: 6 },
        { type: 'collectable', subtype: 'coin', row: 3, col: 8 },
        { type: 'collectable', subtype: 'coin', row: 7, col: 3 },
        // 4 angle_left
        { type: 'sigil', subtype: 'angle_left', row: 1, col: 2 },
        { type: 'sigil', subtype: 'angle_left', row: 3, col: 0 },
        { type: 'sigil', subtype: 'angle_left', row: 6, col: 1 },
        { type: 'sigil', subtype: 'angle_left', row: 8, col: 4 },
        // 4 angle_right
        { type: 'sigil', subtype: 'angle_right', row: 1, col: 5 },
        { type: 'sigil', subtype: 'angle_right', row: 3, col: 7 },
        { type: 'sigil', subtype: 'angle_right', row: 6, col: 9 },
        { type: 'sigil', subtype: 'angle_right', row: 8, col: 6 },
        // 4x alphabet 'a'
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 2, col: 6 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 5, col: 2 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 7, col: 8 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 9, col: 3 },
        // 4x alphabet 'b'
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 0, col: 5 },
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 4, col: 9 },
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 6, col: 0 },
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 9, col: 7 },
      ]
    },
    {
      id: 'demo_portal',
      name: 'Demo: Portal',
      isDemo: true,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      items: [
        // 9 coins
        { type: 'collectable', subtype: 'coin', row: 2, col: 3 },
        { type: 'collectable', subtype: 'coin', row: 7, col: 8 },
        { type: 'collectable', subtype: 'coin', row: 1, col: 1 },
        { type: 'collectable', subtype: 'coin', row: 5, col: 5 },
        { type: 'collectable', subtype: 'coin', row: 3, col: 7 },
        { type: 'collectable', subtype: 'coin', row: 8, col: 2 },
        { type: 'collectable', subtype: 'coin', row: 6, col: 4 },
        { type: 'collectable', subtype: 'coin', row: 2, col: 6 },
        { type: 'collectable', subtype: 'coin', row: 4, col: 1 },
        // Portals
        { type: 'portal', pairId: 1, row: 0, col: 0 },
        { type: 'portal', pairId: 1, row: 9, col: 9 },
        { type: 'portal', pairId: 2, row: 0, col: 9 },
        { type: 'portal', pairId: 2, row: 9, col: 0 },
      ]
    },
    {
      id: 'demo_obstacle',
      name: 'Demo: Obstacle',
      isDemo: true,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      items: [
        // 9 coins
        { type: 'collectable', subtype: 'coin', row: 2, col: 3 },
        { type: 'collectable', subtype: 'coin', row: 7, col: 8 },
        { type: 'collectable', subtype: 'coin', row: 1, col: 7 },
        { type: 'collectable', subtype: 'coin', row: 0, col: 1 },
        { type: 'collectable', subtype: 'coin', row: 9, col: 2 },
        { type: 'collectable', subtype: 'coin', row: 6, col: 0 },
        { type: 'collectable', subtype: 'coin', row: 8, col: 5 },
        { type: 'collectable', subtype: 'coin', row: 1, col: 9 },
        { type: 'collectable', subtype: 'coin', row: 6, col: 8 },
        // Obstacles
        { type: 'obstacle', row: 3, col: 3 },
        { type: 'obstacle', row: 3, col: 4 },
        { type: 'obstacle', row: 3, col: 5 },
        { type: 'obstacle', row: 5, col: 5 },
        { type: 'obstacle', row: 5, col: 6 },
        { type: 'obstacle', row: 5, col: 7 },
      ]
    },
    {
      id: 'level_1',
      name: 'Level 1',
      isDemo: false,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      items: [
        // 9 coins
        { type: 'collectable', subtype: 'coin', row: 1, col: 1 },
        { type: 'collectable', subtype: 'coin', row: 1, col: 8 },
        { type: 'collectable', subtype: 'coin', row: 3, col: 5 },
        { type: 'collectable', subtype: 'coin', row: 5, col: 2 },
        { type: 'collectable', subtype: 'coin', row: 7, col: 7 },
        { type: 'collectable', subtype: 'coin', row: 8, col: 3 },
        { type: 'collectable', subtype: 'coin', row: 9, col: 9 },
        { type: 'collectable', subtype: 'coin', row: 0, col: 5 },
        { type: 'collectable', subtype: 'coin', row: 6, col: 0 },
        // Obstacles
        { type: 'obstacle', row: 2, col: 4 },
        { type: 'obstacle', row: 4, col: 6 },
        { type: 'obstacle', row: 6, col: 4 },
        // 4 angle_left
        { type: 'sigil', subtype: 'angle_left', row: 0, col: 2 },
        { type: 'sigil', subtype: 'angle_left', row: 5, col: 0 },
        { type: 'sigil', subtype: 'angle_left', row: 7, col: 3 },
        { type: 'sigil', subtype: 'angle_left', row: 9, col: 6 },
        // 4 angle_right
        { type: 'sigil', subtype: 'angle_right', row: 0, col: 7 },
        { type: 'sigil', subtype: 'angle_right', row: 5, col: 9 },
        { type: 'sigil', subtype: 'angle_right', row: 7, col: 5 },
        { type: 'sigil', subtype: 'angle_right', row: 9, col: 1 },
        // 4x alphabet 'a'
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 2, col: 1 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 6, col: 8 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 9, col: 2 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 3, col: 9 },
      ]
    },
    {
      id: 'level_2',
      name: 'Level 2',
      isDemo: false,
      grid: { rows: 12, cols: 12 },
      playerSpawn: { row: 5, col: 5 },
      items: [
        // 9 coins
        { type: 'collectable', subtype: 'coin', row: 0, col: 0 },
        { type: 'collectable', subtype: 'coin', row: 0, col: 11 },
        { type: 'collectable', subtype: 'coin', row: 11, col: 0 },
        { type: 'collectable', subtype: 'coin', row: 11, col: 11 },
        { type: 'collectable', subtype: 'coin', row: 3, col: 6 },
        { type: 'collectable', subtype: 'coin', row: 6, col: 3 },
        { type: 'collectable', subtype: 'coin', row: 8, col: 8 },
        { type: 'collectable', subtype: 'coin', row: 2, col: 9 },
        { type: 'collectable', subtype: 'coin', row: 9, col: 2 },
        // Obstacles
        { type: 'obstacle', row: 4, col: 4 },
        { type: 'obstacle', row: 4, col: 5 },
        { type: 'obstacle', row: 4, col: 6 },
        { type: 'obstacle', row: 4, col: 7 },
        { type: 'obstacle', row: 7, col: 4 },
        { type: 'obstacle', row: 7, col: 5 },
        { type: 'obstacle', row: 7, col: 6 },
        { type: 'obstacle', row: 7, col: 7 },
        // Portals
        { type: 'portal', pairId: 1, row: 1, col: 1 },
        { type: 'portal', pairId: 1, row: 10, col: 10 },
        // 4 angle_left
        { type: 'sigil', subtype: 'angle_left', row: 2, col: 3 },
        { type: 'sigil', subtype: 'angle_left', row: 9, col: 3 },
        { type: 'sigil', subtype: 'angle_left', row: 3, col: 1 },
        { type: 'sigil', subtype: 'angle_left', row: 8, col: 1 },
        // 4 angle_right
        { type: 'sigil', subtype: 'angle_right', row: 2, col: 8 },
        { type: 'sigil', subtype: 'angle_right', row: 9, col: 8 },
        { type: 'sigil', subtype: 'angle_right', row: 3, col: 10 },
        { type: 'sigil', subtype: 'angle_right', row: 8, col: 10 },
        // 4x alphabet 'a'
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 1, col: 5 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 5, col: 1 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 10, col: 5 },
        { type: 'sigil', subtype: 'alphabet', char: 'a', row: 5, col: 10 },
        // 4x alphabet 'b'
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 0, col: 5 },
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 5, col: 0 },
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 11, col: 6 },
        { type: 'sigil', subtype: 'alphabet', char: 'b', row: 6, col: 11 },
      ]
    },
    {
      id: 'dynamic',
      name: 'Dynamic Level',
      isDemo: false,
      isDynamic: true,
      grid: { rows: 10, cols: 10 },
      generationParams: {
        obstacleDensity: 0.10,
        collectableCount: 9,
        sigilAlphabetCount: 4, // 4 per letter
        sigilAlphabets: ['a', 'b'],
        portalPairs: 1,
        angleBracketPairs: 2, // 2 pairs = 4 left + 4 right (min 4 each)
      }
    }
  ],
  filler: [
    {
      id: 'filler_demo',
      name: 'Filler Demo',
      isDemo: true,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      items: [
        // 9 coins with colors
        { type: 'collectable', subtype: 'coin', row: 2, col: 2, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 2, col: 7, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 7, col: 2, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 7, col: 7, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 1, col: 5, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 5, col: 1, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 8, col: 5, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 5, col: 8, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 0, col: 0, color: 'red' },
        // Sprays
        { type: 'collectable', subtype: 'spray', color: 'red', row: 4, col: 2 },
        { type: 'collectable', subtype: 'spray', color: 'blue', row: 4, col: 7 },
      ]
    },
    {
      id: 'filler_1',
      name: 'Filler Level 1',
      isDemo: false,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      items: [
        // 9 coins with colors
        { type: 'collectable', subtype: 'coin', row: 1, col: 1, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 1, col: 8, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 3, col: 5, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 6, col: 3, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 8, col: 8, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 0, col: 5, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 5, col: 0, color: 'red' },
        { type: 'collectable', subtype: 'coin', row: 9, col: 5, color: 'blue' },
        { type: 'collectable', subtype: 'coin', row: 5, col: 9, color: 'red' },
        // Sprays
        { type: 'collectable', subtype: 'spray', color: 'red', row: 2, col: 2 },
        { type: 'collectable', subtype: 'spray', color: 'blue', row: 5, col: 6 },
        // Obstacles
        { type: 'obstacle', row: 4, col: 3 },
        { type: 'obstacle', row: 4, col: 5 },
      ]
    }
  ],
  scoreBooster: [
    {
      id: 'sb_demo',
      name: 'Score Booster Demo',
      isDemo: true,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      timerSeconds: 60,
      items: []
    },
    {
      id: 'sb_1',
      name: 'Score Booster 1',
      isDemo: false,
      grid: { rows: 12, cols: 12 },
      playerSpawn: { row: 5, col: 5 },
      timerSeconds: 60,
      items: [
        // Obstacles
        { type: 'obstacle', row: 3, col: 3 },
        { type: 'obstacle', row: 3, col: 8 },
        { type: 'obstacle', row: 8, col: 3 },
        { type: 'obstacle', row: 8, col: 8 },
        // 4 angle_left
        { type: 'sigil', subtype: 'angle_left', row: 2, col: 2 },
        { type: 'sigil', subtype: 'angle_left', row: 9, col: 2 },
        { type: 'sigil', subtype: 'angle_left', row: 2, col: 5 },
        { type: 'sigil', subtype: 'angle_left', row: 9, col: 5 },
        // 4 angle_right
        { type: 'sigil', subtype: 'angle_right', row: 2, col: 9 },
        { type: 'sigil', subtype: 'angle_right', row: 9, col: 9 },
        { type: 'sigil', subtype: 'angle_right', row: 2, col: 6 },
        { type: 'sigil', subtype: 'angle_right', row: 9, col: 6 },
      ]
    }
  ],
  snake: [
    {
      id: 'snake_demo',
      name: 'Snake Demo',
      isDemo: true,
      grid: { rows: 10, cols: 10 },
      playerSpawn: { row: 4, col: 4 },
      timerSeconds: 60,
      items: []
    },
    {
      id: 'snake_1',
      name: 'Snake Level 1',
      isDemo: false,
      grid: { rows: 12, cols: 12 },
      playerSpawn: { row: 5, col: 5 },
      timerSeconds: 90,
      items: [
        // Obstacles
        { type: 'obstacle', row: 2, col: 2 },
        { type: 'obstacle', row: 2, col: 9 },
        { type: 'obstacle', row: 9, col: 2 },
        { type: 'obstacle', row: 9, col: 9 },
        // Portals
        { type: 'portal', pairId: 1, row: 0, col: 5 },
        { type: 'portal', pairId: 1, row: 11, col: 5 },
      ]
    }
  ]
};

// Dynamic level generation
function generateDynamicLevel(params, gridRows, gridCols) {
  const items = [];
  const occupied = new Set();
  const sigilAlphabetCells = new Set(); // Track cells with sigil-alphabets

  const key = (r, c) => `${r},${c}`;
  const isOccupied = (r, c) => occupied.has(key(r, c));
  const markOccupied = (r, c) => occupied.add(key(r, c));
  const hasSigilAlphabet = (r, c) => sigilAlphabetCells.has(key(r, c));
  const markSigilAlphabet = (r, c) => sigilAlphabetCells.add(key(r, c));

  // Random spawn point (center-ish)
  const spawnRow = Math.floor(gridRows / 2);
  const spawnCol = Math.floor(gridCols / 2);
  markOccupied(spawnRow, spawnCol);

  // Place obstacles
  const obstacleCount = Math.floor(gridRows * gridCols * params.obstacleDensity);
  for (let i = 0; i < obstacleCount; i++) {
    let attempts = 0;
    while (attempts < 100) {
      const r = Math.floor(Math.random() * gridRows);
      const c = Math.floor(Math.random() * gridCols);
      if (!isOccupied(r, c)) {
        items.push({ type: 'obstacle', row: r, col: c });
        markOccupied(r, c);
        break;
      }
      attempts++;
    }
  }

  // Place collectables (minimum 9)
  const collectableCount = Math.max(params.collectableCount || 9, 9);
  for (let i = 0; i < collectableCount; i++) {
    let attempts = 0;
    while (attempts < 100) {
      const r = Math.floor(Math.random() * gridRows);
      const c = Math.floor(Math.random() * gridCols);
      if (!isOccupied(r, c)) {
        items.push({ type: 'collectable', subtype: 'coin', row: r, col: c });
        markOccupied(r, c);
        break;
      }
      attempts++;
    }
  }

  // Place sigil alphabets (minimum 4 per letter, no duplicates in same cell)
  const alphabets = params.sigilAlphabets || ['a', 'b'];
  const sigilAlphabetCount = Math.max(params.sigilAlphabetCount || 4, 4);

  for (const char of alphabets) {
    for (let i = 0; i < sigilAlphabetCount; i++) {
      let attempts = 0;
      while (attempts < 100) {
        const r = Math.floor(Math.random() * gridRows);
        const c = Math.floor(Math.random() * gridCols);
        // Sigils can coexist with coins, but not obstacles or other sigil-alphabets
        const hasObstacle = items.some(it => it.type === 'obstacle' && it.row === r && it.col === c);
        if (!hasObstacle && !(r === spawnRow && c === spawnCol) && !hasSigilAlphabet(r, c)) {
          items.push({ type: 'sigil', subtype: 'alphabet', char, row: r, col: c });
          markSigilAlphabet(r, c);
          break;
        }
        attempts++;
      }
    }
  }

  // Place portal pairs
  const portalPairs = params.portalPairs || 1;
  for (let pairId = 1; pairId <= portalPairs; pairId++) {
    let placed = 0;
    let attempts = 0;
    while (placed < 2 && attempts < 100) {
      const r = Math.floor(Math.random() * gridRows);
      const c = Math.floor(Math.random() * gridCols);
      if (!isOccupied(r, c)) {
        items.push({ type: 'portal', pairId, row: r, col: c });
        markOccupied(r, c);
        placed++;
      }
      attempts++;
    }
  }

  // Place angle brackets (minimum 4 each type)
  const angleBracketPairs = Math.max(params.angleBracketPairs || 2, 2); // At least 2 pairs = 4 of each

  // Place angle_left (4 minimum)
  for (let i = 0; i < angleBracketPairs * 2; i++) {
    let attempts = 0;
    while (attempts < 100) {
      const r = Math.floor(Math.random() * gridRows);
      const c = Math.floor(Math.random() * gridCols);
      const hasObstacle = items.some(it => it.type === 'obstacle' && it.row === r && it.col === c);
      if (!hasObstacle && !(r === spawnRow && c === spawnCol)) {
        items.push({ type: 'sigil', subtype: 'angle_left', row: r, col: c });
        break;
      }
      attempts++;
    }
  }

  // Place angle_right (4 minimum)
  for (let i = 0; i < angleBracketPairs * 2; i++) {
    let attempts = 0;
    while (attempts < 100) {
      const r = Math.floor(Math.random() * gridRows);
      const c = Math.floor(Math.random() * gridCols);
      const hasObstacle = items.some(it => it.type === 'obstacle' && it.row === r && it.col === c);
      if (!hasObstacle && !(r === spawnRow && c === spawnCol)) {
        items.push({ type: 'sigil', subtype: 'angle_right', row: r, col: c });
        break;
      }
      attempts++;
    }
  }

  return {
    playerSpawn: { row: spawnRow, col: spawnCol },
    items
  };
}
