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

  // hjkl movement deltas for 9x9 navigation
  const hjklMap = {
    'h': [0, -1],  // left
    'j': [1, 0],   // down
    'k': [-1, 0],  // up
    'l': [0, 1]    // right
  };

  document.addEventListener('keydown', function(e) {
    const key = e.key;
    const lowerKey = key.toLowerCase();

    // Handle hjkl navigation (9x9 grid)
    if (hjklMap.hasOwnProperty(key)) {
      const [dRow, dCol] = hjklMap[key];

      // Convert to global 9x9 coordinates
      let globalRow = mgRow * 3 + sgRow;
      let globalCol = mgCol * 3 + sgCol;

      // Apply movement
      globalRow += dRow;
      globalCol += dCol;

      // Cancel if out of boundary
      if (globalRow < 0 || globalRow > 8 || globalCol < 0 || globalCol > 8) {
        return;
      }

      // Convert back to mg/sg coordinates
      mgRow = Math.floor(globalRow / 3);
      sgRow = globalRow % 3;
      mgCol = Math.floor(globalCol / 3);
      sgCol = globalCol % 3;

      focusCurrent();
      e.preventDefault();
      return;
    }

    // Handle WERSDFXCV navigation
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
