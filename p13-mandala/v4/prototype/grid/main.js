(function() {
  // Key to grid position mapping (3x3 keyboard layout)
  // W E R
  // S D F
  // X C V
  const keyMap = {
    'w': [0, 0], 'e': [0, 1], 'r': [0, 2],
    's': [1, 0], 'd': [1, 1], 'f': [1, 2],
    'x': [2, 0], 'c': [2, 1], 'v': [2, 2]
  };

  // Current position state
  let mgRow = 0, mgCol = 0;  // main grid position
  let sgRow = 0, sgCol = 0;  // subgrid position

  const mainCells = document.querySelectorAll('.main-cell');

  function getSubCell(mgR, mgC, sgR, sgC) {
    const mainIndex = mgR * 3 + mgC;
    const mainCell = mainCells[mainIndex];
    if (!mainCell) return null;

    const subCells = mainCell.querySelectorAll('.sub-cell');
    const subIndex = sgR * 3 + sgC;
    return subCells[subIndex] || null;
  }

  function focusCurrent() {
    const cell = getSubCell(mgRow, mgCol, sgRow, sgCol);
    if (cell) {
      cell.focus();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', focusCurrent);
  } else {
    focusCurrent();
  }

  document.addEventListener('keydown', function(e) {
    const key = e.key;
    const lowerKey = key.toLowerCase();

    if (!keyMap.hasOwnProperty(lowerKey)) {
      return;
    }

    const [row, col] = keyMap[lowerKey];
    const isUpperCase = key === key.toUpperCase();

    if (isUpperCase) {
      // Uppercase: move main grid position, subgrid stays same
      mgRow = row;
      mgCol = col;
    } else {
      // Lowercase: move subgrid position, main grid stays same
      sgRow = row;
      sgCol = col;
    }

    focusCurrent();
    e.preventDefault();
  });
})();
