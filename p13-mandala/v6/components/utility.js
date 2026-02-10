export const JUMP_KEYS = {
  'w': [0, 0], 'e': [0, 1], 'r': [0, 2],
  's': [1, 0], 'd': [1, 1], 'f': [1, 2],
  'x': [2, 0], 'c': [2, 1], 'v': [2, 2],
  'W': [0, 0], 'E': [0, 1], 'R': [0, 2],
  'S': [1, 0], 'D': [1, 1], 'F': [1, 2],
  'X': [2, 0], 'C': [2, 1], 'V': [2, 2]
};

export const HJKL_MAP = {
  'h': [0, -1],
  'j': [1, 0],
  'k': [-1, 0],
  'l': [0, 1]
};

export function positionToIndex(mgRow, mgCol, sgRow, sgCol) {
  const row = mgRow * 3 + sgRow;
  const col = mgCol * 3 + sgCol;
  return row * 9 + col;
}

export function indexToPosition(index) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  return {
    mgRow: Math.floor(row / 3),
    mgCol: Math.floor(col / 3),
    sgRow: row % 3,
    sgCol: col % 3
  };
}

export const STATUSES = ['na', 'now', 'done'];

export function calcProgress(record) {
  const children = (record.children || []).filter(c => c !== null);
  const active = children.filter(c => (c.status || 'na') !== 'na');
  if (active.length === 0) {
    return (record.status || 'na') === 'done' ? 100 : 0;
  }
  const doneCount = active.filter(c => (c.status || 'na') === 'done').length;
  return Math.round(doneCount / active.length * 100);
}

export function nextStatus(current) {
  const i = STATUSES.indexOf(current || 'na');
  return STATUSES[(i + 1) % STATUSES.length];
}

export const DVORAK_TO_QWERTY = {
  'g': 'u', 'c': 'i', 'r': 'o', 'f': 'y',
  'h': 'h', 't': 'j', 'n': 'k', 's': 'l',
  ',': 'w', '.': 'e', 'p': 'r', 'o': 's', 'e': 'd', 'u': 'f', 'q': 'x', 'j': 'c', 'k': 'v',
  '<': 'W', '>': 'E', 'P': 'R', 'O': 'S', 'E': 'D', 'U': 'F', 'Q': 'X', 'J': 'C', 'K': 'V',
  'Z': '?'
};