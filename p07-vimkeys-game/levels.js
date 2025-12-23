// ===================
// LEVEL DEFINITIONS
// ===================

// Item Types
const ItemType = {
  COLLECTABLE: 'COLLECTABLE',
  OBSTACLE: 'OBSTACLE',
  PORTAL: 'PORTAL',
  SIGIL: 'SIGIL'
};

// Level Types
const LevelType = {
  DEMO: 'DEMO',
  TUTORIAL: 'TUTORIAL',
  PREDEFINED: 'PREDEFINED',
  DYNAMIC: 'DYNAMIC'
};

// Sigil Subtypes
const SigilSubtype = {
  ANGLE_LEFT: 'ANGLE_LEFT',
  ANGLE_RIGHT: 'ANGLE_RIGHT',
  ALPHABET: 'ALPHABET'
};

const LEVELS = {
  demo: {
    id: 'demo',
    name: 'Demo Level',
    type: LevelType.DEMO,
    playerSpawn: { row: 2, col: 3 },
    items: [
      { type: ItemType.COLLECTABLE, position: { row: 1, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 7 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 2 } },
      { type: ItemType.COLLECTABLE, position: { row: 6, col: 8 } },
      { type: ItemType.COLLECTABLE, position: { row: 7, col: 4 } },
      { type: ItemType.COLLECTABLE, position: { row: 8, col: 1 } },
      { type: ItemType.COLLECTABLE, position: { row: 2, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 4, col: 4 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 6 } }
    ]
  },

  'tutorial-angle-bracket-sigils': {
    id: 'tutorial-angle-bracket-sigils',
    name: 'Tutorial: Angle Brackets',
    type: LevelType.TUTORIAL,
    playerSpawn: { row: 5, col: 0 },
    items: [
      // Top row with < sigils
      { type: ItemType.SIGIL, position: { row: 0, col: 2 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 0, col: 5 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 0, col: 8 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },

      // Bottom row with > sigils
      { type: ItemType.SIGIL, position: { row: 9, col: 1 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },
      { type: ItemType.SIGIL, position: { row: 9, col: 4 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },
      { type: ItemType.SIGIL, position: { row: 9, col: 7 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },

      // Left column with < and >
      { type: ItemType.SIGIL, position: { row: 2, col: 0 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 7, col: 0 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },

      // Right column with < and >
      { type: ItemType.SIGIL, position: { row: 3, col: 9 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 6, col: 9 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },

      // Center cluster of mixed sigils
      { type: ItemType.SIGIL, position: { row: 4, col: 4 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 4, col: 6 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },
      { type: ItemType.SIGIL, position: { row: 5, col: 5 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },

      // Collectables strategically placed
      { type: ItemType.COLLECTABLE, position: { row: 0, col: 0 } },
      { type: ItemType.COLLECTABLE, position: { row: 0, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 0 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 2, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 2 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 7 } },
      { type: ItemType.COLLECTABLE, position: { row: 7, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 3 } }
    ]
  },

  'tutorial-alphabet-sigils': {
    id: 'tutorial-alphabet-sigils',
    name: 'Tutorial: Alphabet Sigils',
    type: LevelType.TUTORIAL,
    playerSpawn: { row: 0, col: 0 },
    items: [
      // Row 1: a, b, c pattern
      { type: ItemType.SIGIL, position: { row: 1, col: 1 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'a' },
      { type: ItemType.SIGIL, position: { row: 1, col: 4 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'b' },
      { type: ItemType.SIGIL, position: { row: 1, col: 7 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'c' },

      // Row 3: a, b, c pattern (for repeater practice)
      { type: ItemType.SIGIL, position: { row: 3, col: 2 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'a' },
      { type: ItemType.SIGIL, position: { row: 3, col: 5 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'b' },
      { type: ItemType.SIGIL, position: { row: 3, col: 8 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'c' },

      // Row 5: d, e, f pattern
      { type: ItemType.SIGIL, position: { row: 5, col: 1 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'd' },
      { type: ItemType.SIGIL, position: { row: 5, col: 4 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'e' },
      { type: ItemType.SIGIL, position: { row: 5, col: 7 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'f' },

      // Row 7: d, e, f pattern (for repeater practice)
      { type: ItemType.SIGIL, position: { row: 7, col: 2 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'd' },
      { type: ItemType.SIGIL, position: { row: 7, col: 5 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'e' },
      { type: ItemType.SIGIL, position: { row: 7, col: 8 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'f' },

      // Row 9: g, h pattern
      { type: ItemType.SIGIL, position: { row: 9, col: 3 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'g' },
      { type: ItemType.SIGIL, position: { row: 9, col: 6 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'h' },

      // Collectables placed near sigils
      { type: ItemType.COLLECTABLE, position: { row: 1, col: 0 } },
      { type: ItemType.COLLECTABLE, position: { row: 1, col: 3 } },
      { type: ItemType.COLLECTABLE, position: { row: 1, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 1 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 6 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 0 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 7, col: 3 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 9 } }
    ]
  },

  'tutorial-body-expansion-1': {
    id: 'tutorial-body-expansion-1',
    name: 'Tutorial: Body vs Obstacles',
    type: LevelType.TUTORIAL,
    playerSpawn: { row: 0, col: 0 },
    items: [
      // Create a maze-like structure with narrow passages
      // Top horizontal wall
      { type: ItemType.OBSTACLE, position: { row: 2, col: 1 } },
      { type: ItemType.OBSTACLE, position: { row: 2, col: 2 } },
      { type: ItemType.OBSTACLE, position: { row: 2, col: 3 } },
      { type: ItemType.OBSTACLE, position: { row: 2, col: 5 } },
      { type: ItemType.OBSTACLE, position: { row: 2, col: 6 } },
      { type: ItemType.OBSTACLE, position: { row: 2, col: 7 } },

      // Middle horizontal wall
      { type: ItemType.OBSTACLE, position: { row: 5, col: 2 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 3 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 4 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 6 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 7 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 8 } },

      // Vertical walls creating narrow passages
      { type: ItemType.OBSTACLE, position: { row: 3, col: 4 } },
      { type: ItemType.OBSTACLE, position: { row: 4, col: 4 } },
      { type: ItemType.OBSTACLE, position: { row: 6, col: 5 } },
      { type: ItemType.OBSTACLE, position: { row: 7, col: 5 } },

      // Bottom obstacles
      { type: ItemType.OBSTACLE, position: { row: 8, col: 2 } },
      { type: ItemType.OBSTACLE, position: { row: 8, col: 3 } },
      { type: ItemType.OBSTACLE, position: { row: 8, col: 7 } },
      { type: ItemType.OBSTACLE, position: { row: 8, col: 8 } },

      // Collectables placed to encourage body expansion and shrinking
      { type: ItemType.COLLECTABLE, position: { row: 0, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 1, col: 3 } },
      { type: ItemType.COLLECTABLE, position: { row: 1, col: 7 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 1 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 8 } },
      { type: ItemType.COLLECTABLE, position: { row: 4, col: 6 } },
      { type: ItemType.COLLECTABLE, position: { row: 6, col: 2 } },
      { type: ItemType.COLLECTABLE, position: { row: 7, col: 8 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 5 } }
    ]
  },

  'tutorial-body-expansion-2': {
    id: 'tutorial-body-expansion-2',
    name: 'Tutorial: Body vs Portals',
    type: LevelType.TUTORIAL,
    playerSpawn: { row: 0, col: 0 },
    items: [
      // Portal pair 1: Near spawn to distant corner
      { type: ItemType.PORTAL, position: { row: 0, col: 2 }, portalPairId: 1 },
      { type: ItemType.PORTAL, position: { row: 9, col: 9 }, portalPairId: 1 },

      // Portal pair 2: Middle area
      { type: ItemType.PORTAL, position: { row: 3, col: 5 }, portalPairId: 2 },
      { type: ItemType.PORTAL, position: { row: 6, col: 3 }, portalPairId: 2 },

      // Portal pair 3: Another set for practice
      { type: ItemType.PORTAL, position: { row: 2, col: 8 }, portalPairId: 3 },
      { type: ItemType.PORTAL, position: { row: 7, col: 1 }, portalPairId: 3 },

      // Collectables placed to require portal usage
      // Some near portals, some far requiring body management
      { type: ItemType.COLLECTABLE, position: { row: 0, col: 1 } },
      { type: ItemType.COLLECTABLE, position: { row: 0, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 2, col: 4 } },
      { type: ItemType.COLLECTABLE, position: { row: 4, col: 7 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 6, col: 8 } },
      { type: ItemType.COLLECTABLE, position: { row: 8, col: 2 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 0 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 7 } }
    ]
  },

  mix1: {
    id: 'mix1',
    name: 'Mix Level 1',
    type: LevelType.PREDEFINED,
    playerSpawn: { row: 2, col: 3 },
    items: [
      { type: ItemType.COLLECTABLE, position: { row: 1, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 7 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 2 } },
      { type: ItemType.COLLECTABLE, position: { row: 6, col: 8 } },
      { type: ItemType.COLLECTABLE, position: { row: 7, col: 4 } },
      { type: ItemType.COLLECTABLE, position: { row: 8, col: 1 } },
      { type: ItemType.COLLECTABLE, position: { row: 2, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 4, col: 4 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 6 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 5 } },
      { type: ItemType.OBSTACLE, position: { row: 6, col: 5 } },
      { type: ItemType.SIGIL, position: { row: 0, col: 0 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 0, col: 9 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },
      { type: ItemType.SIGIL, position: { row: 9, col: 0 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 9, col: 9 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT }
    ]
  },

  mix2: {
    id: 'mix2',
    name: 'Mix Level 2',
    type: LevelType.PREDEFINED,
    playerSpawn: { row: 5, col: 5 },
    items: [
      { type: ItemType.COLLECTABLE, position: { row: 0, col: 0 } },
      { type: ItemType.COLLECTABLE, position: { row: 0, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 0 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 9 } },
      { type: ItemType.COLLECTABLE, position: { row: 2, col: 2 } },
      { type: ItemType.COLLECTABLE, position: { row: 2, col: 7 } },
      { type: ItemType.COLLECTABLE, position: { row: 7, col: 2 } },
      { type: ItemType.COLLECTABLE, position: { row: 7, col: 7 } },
      { type: ItemType.COLLECTABLE, position: { row: 4, col: 1 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 3 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 4 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 6 } },
      { type: ItemType.OBSTACLE, position: { row: 5, col: 7 } },
      { type: ItemType.PORTAL, position: { row: 1, col: 1 }, portalPairId: 1 },
      { type: ItemType.PORTAL, position: { row: 8, col: 8 }, portalPairId: 1 },
      { type: ItemType.SIGIL, position: { row: 1, col: 5 }, sigilSubtype: SigilSubtype.ANGLE_LEFT },
      { type: ItemType.SIGIL, position: { row: 8, col: 5 }, sigilSubtype: SigilSubtype.ANGLE_RIGHT },
      { type: ItemType.SIGIL, position: { row: 3, col: 1 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'a' },
      { type: ItemType.SIGIL, position: { row: 3, col: 8 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'b' },
      { type: ItemType.SIGIL, position: { row: 6, col: 1 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'c' },
      { type: ItemType.SIGIL, position: { row: 6, col: 8 }, sigilSubtype: SigilSubtype.ALPHABET, sigilChar: 'd' }
    ]
  },

  mix3: {
    id: 'mix3',
    name: 'Mix Level 3',
    type: LevelType.PREDEFINED,
    playerSpawn: { row: 0, col: 0 },
    items: [
      { type: ItemType.COLLECTABLE, position: { row: 4, col: 4 } },
      { type: ItemType.COLLECTABLE, position: { row: 4, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 4 } },
      { type: ItemType.COLLECTABLE, position: { row: 5, col: 5 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 3 } },
      { type: ItemType.COLLECTABLE, position: { row: 3, col: 6 } },
      { type: ItemType.COLLECTABLE, position: { row: 6, col: 3 } },
      { type: ItemType.COLLECTABLE, position: { row: 6, col: 6 } },
      { type: ItemType.COLLECTABLE, position: { row: 9, col: 9 } },
      { type: ItemType.OBSTACLE, position: { row: 2, col: 2 } },
      { type: ItemType.OBSTACLE, position: { row: 2, col: 7 } },
      { type: ItemType.OBSTACLE, position: { row: 7, col: 2 } },
      { type: ItemType.OBSTACLE, position: { row: 7, col: 7 } },
      { type: ItemType.PORTAL, position: { row: 0, col: 9 }, portalPairId: 1 },
      { type: ItemType.PORTAL, position: { row: 9, col: 0 }, portalPairId: 1 },
      { type: ItemType.PORTAL, position: { row: 1, col: 5 }, portalPairId: 2 },
      { type: ItemType.PORTAL, position: { row: 8, col: 5 }, portalPairId: 2 }
    ]
  }
};

// Level order for switching
const LEVEL_ORDER = [
  'demo',
  'tutorial-angle-bracket-sigils',
  'tutorial-alphabet-sigils',
  'tutorial-body-expansion-1',
  'tutorial-body-expansion-2',
  'mix1',
  'mix2',
  'mix3',
  'dynamic'
];
