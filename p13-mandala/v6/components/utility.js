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