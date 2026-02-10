import { positionToIndex, indexToPosition, HJKL_MAP, JUMP_KEYS, nextStatus, STATUSES, DVORAK_TO_QWERTY } from './utility.js';

const STORAGE_KEY = 'mandala-v6-data';
const CENTER_INDEX = 40;
const US = '\x1f';
const PLACEMENT_ORDER = [
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 2],
  [2, 0], [2, 1], [2, 2]
];

export default class McApp extends HTMLElement {
  constructor() {
    super();
    // Tree data: root mc-record (always exists after connectedCallback)
    this._root = null;
  }

  connectedCallback() {
    this.innerHTML = `
<mc-grid></mc-grid>
<mc-help-bar></mc-help-bar>
<mc-data-migration></mc-data-migration>
<mc-help-modal></mc-help-modal>
<mc-modal></mc-modal>
<mc-notifier></mc-notifier>
    `;

    this._grid = this.querySelector('mc-grid');
    this._modal = this.querySelector('mc-modal');
    this._notifier = this.querySelector('mc-notifier');
    this._helpModal = this.querySelector('mc-help-modal');

    this._loadFromStorage();
    this._ensureStructure();
    this._keyboardLayout = localStorage.getItem('mandala-v6-keyboard') || 'qwerty';
    this._renderTree();

    // Focus center cell
    requestAnimationFrame(() => {
      this._grid.cellAt(CENTER_INDEX)?.focus();
    });

    // Global keydown
    document.addEventListener('keydown', (e) => this._onKeydown(e));

    // Cell change (from inline edit)
    this._grid.addEventListener('cell-change', () => {
      this._saveToStorage();
      this._renderTree();
    });

    // Migration events
    this.addEventListener('migration-export', () => this._exportData());
    this.addEventListener('migration-import', (e) => this._importData(e.detail.content, e.detail.fileName));

    // Keyboard layout
    this.addEventListener('keyboard-change', (e) => {
      this._keyboardLayout = e.detail.layout;
    });
  }

  // === Tree-to-grid mapping ===

  _renderTree() {
    const cells = this._grid.cells;
    // Clear all cells
    cells.forEach(c => c.setRecord(null));

    if (!this._root) return;

    // Place root at center
    cells[CENTER_INDEX].setRecord(this._root);

    const children = this._root.children || [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) continue;
      const [sgRow, sgCol] = PLACEMENT_ORDER[i];
      const [mgRow, mgCol] = PLACEMENT_ORDER[i];

      // Place in center outergrid
      const centerIdx = positionToIndex(1, 1, sgRow, sgCol);
      cells[centerIdx].setRecord(child);

      // Sync to corresponding outergrid center
      const syncIdx = positionToIndex(mgRow, mgCol, 1, 1);
      cells[syncIdx].setRecord(child, true);

      // Place lvl2 children
      const grandchildren = child.children || [];
      for (let j = 0; j < grandchildren.length; j++) {
        const gc = grandchildren[j];
        if (!gc) continue;
        const [sg2Row, sg2Col] = PLACEMENT_ORDER[j];
        const lvl2Idx = positionToIndex(mgRow, mgCol, sg2Row, sg2Col);
        cells[lvl2Idx].setRecord(gc);
      }
    }
  }

  // === Determine what a cell represents in the tree ===

  _getCellTreeInfo(cellIndex) {
    debugger;
    if (cellIndex === CENTER_INDEX) {
      return { level: 0, record: this._root, parent: null, childIndex: -1 };
    }

    const pos = indexToPosition(cellIndex);
    const children = this._root?.children || [];

    // Check if it's a lvl1 node in center outergrid
    if (pos.mgRow === 1 && pos.mgCol === 1 && !(pos.sgRow === 1 && pos.sgCol === 1)) {
      const idx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.sgRow && c === pos.sgCol);
      if (idx !== -1 && idx < children.length && children[idx]) {
        return { level: 1, record: children[idx], parent: this._root, childIndex: idx };
      }
      // Empty lvl1 slot (null or beyond length)
      return { level: 1, record: null, parent: this._root, childIndex: idx, slotIndex: idx };
    }

    // Check if it's a synced lvl1 node (center of an outer grid)
    if (pos.sgRow === 1 && pos.sgCol === 1 && !(pos.mgRow === 1 && pos.mgCol === 1)) {
      const idx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.mgRow && c === pos.mgCol);
      if (idx !== -1 && idx < children.length && children[idx]) {
        return { level: 1, record: children[idx], parent: this._root, childIndex: idx, isSynced: true };
      }
      return { level: 1, record: null, parent: this._root, childIndex: idx, slotIndex: idx, isSynced: true };
    }

    // Check if it's a lvl2 node in an outer outergrid
    if (!(pos.mgRow === 1 && pos.mgCol === 1) && !(pos.sgRow === 1 && pos.sgCol === 1)) {
      const parentIdx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.mgRow && c === pos.mgCol);
      if (parentIdx !== -1 && parentIdx < children.length && children[parentIdx]) {
        const parentRecord = children[parentIdx];
        const grandchildren = parentRecord.children || [];
        const gcIdx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.sgRow && c === pos.sgCol);
        if (gcIdx !== -1 && gcIdx < grandchildren.length && grandchildren[gcIdx]) {
          return { level: 2, record: grandchildren[gcIdx], parent: parentRecord, childIndex: gcIdx };
        }
        return { level: 2, record: null, parent: parentRecord, childIndex: gcIdx, slotIndex: gcIdx };
      }
      // Parent slot is null — treat as empty lvl2 with no parent
      if (parentIdx !== -1 && parentIdx < children.length && !children[parentIdx]) {
        return { level: 1, record: null, parent: this._root, childIndex: parentIdx, slotIndex: parentIdx };
      }
      return { level: -1, record: null, parent: null, childIndex: -1 };
    }

    return { level: -1, record: null, parent: null, childIndex: -1 };
  }

  _checkAvailability(cellIndex) {
    const info = this._getCellTreeInfo(cellIndex);
    if (!info.record) return false; // no record to add child to

    if (info.level === 0) {
      return (this._root.children || []).some(c => c === null);
    }
    if (info.level === 1) {
      return (info.record.children || []).some(c => c === null);
    }
    return false; // lvl2 always false
  }

  // === Keydown dispatch ===

  _translateKey(key) {
    if (this._keyboardLayout === 'dvorak') {
      return DVORAK_TO_QWERTY[key] || key;
    }
    return key;
  }

  _onKeydown(e) {
    if (this._modal.isOpen) return;

    const key = this._translateKey(e.key);

    if (key === '?') {
      e.preventDefault();
      if (this._helpModal.isOpen) this._helpModal.close();
      else this._helpModal.open();
      return;
    }

    if (this._helpModal.isOpen) return;

    const focused = document.activeElement;
    if (!focused || focused.tagName !== 'MC-CELL') return;
    if (focused.isEditing) return;

    // Navigation keys
    if (HJKL_MAP[key] || JUMP_KEYS[key]) {
      e.preventDefault();
      this._grid.navigate(key, focused);
      return;
    }

    // Cell action keys
    switch (key) {
      case 'u':
        e.preventDefault();
        this._handleCreate(focused);
        break;
      case 'i':
        e.preventDefault();
        this._handleInlineEdit(focused);
        break;
      case 'o':
        e.preventDefault();
        this._handleDetailEdit(focused);
        break;
      case 'Delete':
        e.preventDefault();
        this._handleDelete(focused);
        break;
      case 'y':
        e.preventDefault();
        this._handleCycleStatus(focused);
        break;
    }
  }

  // === Cell actions ===

  _handleCreate(cell) {
    const info = this._getCellTreeInfo(cell.cellIndex);

    // Root cell with empty title — open update modal to set title
    if (cell.cellIndex === CENTER_INDEX && !this._root.title) {
      this._modal.open('update', {
        modalTitle: 'Update Root Record',
        title: '',
        description: this._root.description || '',
        status: this._root.status || 'na',
        children: (this._root.children || []).filter(c => c !== null)
      });
      this._modalListen((detail) => {
        this._root.title = detail.title;
        this._root.description = detail.description;
        this._root.status = detail.status;
        this._saveToStorage();
        this._renderTree();
        cell.focus();
      }, () => cell.focus());
      return;
    }

    // Empty lvl1/lvl2 slot — create record directly at that position
    if (!info.record && info.parent) {
      const level = info.level;
      if (level === 1) {
        const defaultStatus = (this._root.status || 'na') === 'na' ? 'na' : 'now';
        this._modal.open('create', { modalTitle: 'Create Record', status: defaultStatus });
        this._modalListen((detail) => {
          const newRecord = { title: detail.title, description: detail.description, status: detail.status || 'na', children: new Array(8).fill(null) };
          this._root.children[info.slotIndex] = newRecord;
          this._saveToStorage();
          this._renderTree();
          cell.focus();
        }, () => cell.focus());
        return;
      }
      if (level === 2 && info.parent) {
        const defaultStatus = (info.parent.status || 'na') === 'na' ? 'na' : 'now';
        this._modal.open('create', { modalTitle: 'Create Record', status: defaultStatus });
        this._modalListen((detail) => {
          const newRecord = { title: detail.title, description: detail.description, status: detail.status || 'na' };
          info.parent.children[info.slotIndex] = newRecord;
          this._saveToStorage();
          this._renderTree();
          cell.focus();
        }, () => cell.focus());
        return;
      }
    }

    // Cell has a record — create a child in the first null slot
    if (info.record) {
      if (!this._checkAvailability(cell.cellIndex)) {
        this._notifier.show('Maximum children reached (8)');
        return;
      }
      const nullIdx = (info.record.children || []).indexOf(null);
      if (nullIdx === -1) return;
      const defaultStatus = (info.record.status || 'na') === 'na' ? 'na' : 'now';
      this._modal.open('create', { modalTitle: 'Create Child Record', status: defaultStatus });
      this._modalListen((detail) => {
        const newRecord = { title: detail.title, description: detail.description, status: detail.status || 'na' };
        if (info.level < 2) newRecord.children = new Array(8).fill(null);
        info.record.children[nullIdx] = newRecord;
        this._saveToStorage();
        this._renderTree();
        cell.focus();
      }, () => cell.focus());
      return;
    }

    // Teleport to nearest empty ancestor
    if (!this._root.title) {
      const rootCell = this._grid.cellAt(CENTER_INDEX);
      rootCell.focus();
      this._handleCreate(rootCell);
      return;
    }
    const pos = indexToPosition(cell.cellIndex);
    if (!(pos.mgRow === 1 && pos.mgCol === 1)) {
      const parentCellIdx = positionToIndex(pos.mgRow, pos.mgCol, 1, 1);
      const parentInfo = this._getCellTreeInfo(parentCellIdx);
      if (!parentInfo.record) {
        // Parent slot is null — teleport and create there
        const parentCell = this._grid.cellAt(parentCellIdx);
        debugger;
        parentCell.focus();
        this._handleCreate(parentCell);
      }
    }
  }

  _handleInlineEdit(cell) {
    if (!cell.record) return;
    cell.startInlineEdit();
  }

  _handleDetailEdit(cell) {
    const info = this._getCellTreeInfo(cell.cellIndex);
    if (!info.record) return;

    // Filter out null children for the modal display
    const realChildren = (info.record.children || []).filter(c => c !== null);

    this._modal.open('update', {
      modalTitle: 'Update Record',
      title: info.record.title,
      description: info.record.description || '',
      status: info.record.status || 'na',
      children: realChildren
    });

    this._modalListen((detail) => {
      info.record.title = detail.title;
      info.record.description = detail.description;
      info.record.status = detail.status;
      if (detail.children) {
        // Reconstruct sparse array: place returned children into positions, fill rest with null
        const sparse = new Array(8).fill(null);
        for (let i = 0; i < detail.children.length && i < 8; i++) {
          sparse[i] = detail.children[i];
        }
        info.record.children = sparse;
      }
      this._saveToStorage();
      this._renderTree();
      cell.focus();
    }, () => cell.focus());
  }

  _handleDelete(cell) {
    const info = this._getCellTreeInfo(cell.cellIndex);
    if (!info.record) return;

    if (info.level === 0) {
      // Clear root fields but keep structure
      const backup = JSON.parse(JSON.stringify(this._root));
      this._root = { title: '', description: '', status: 'na', children: new Array(8).fill(null) };
      this._saveToStorage();
      this._renderTree();
      this._notifier.show('Record deleted', () => {
        this._root = backup;
        this._saveToStorage();
        this._renderTree();
      });
    } else if (info.parent && info.childIndex >= 0) {
      const backup = JSON.parse(JSON.stringify(info.record));
      const backupIdx = info.childIndex;
      info.parent.children[info.childIndex] = null;
      this._saveToStorage();
      this._renderTree();
      this._notifier.show('Record deleted', () => {
        info.parent.children[backupIdx] = backup;
        this._saveToStorage();
        this._renderTree();
      });
    }
  }

  _handleCycleStatus(cell) {
    const info = this._getCellTreeInfo(cell.cellIndex);
    if (!info.record) return;
    info.record.status = nextStatus(info.record.status);
    this._saveToStorage();
    this._renderTree();
  }

  _modalListen(onConfirm, onClose) {
    const modal = this._modal;
    const confirmHandler = (e) => {
      modal.removeEventListener('modal-confirm', confirmHandler);
      modal.removeEventListener('modal-close', closeHandler);
      onConfirm(e.detail);
    };
    const closeHandler = () => {
      modal.removeEventListener('modal-confirm', confirmHandler);
      modal.removeEventListener('modal-close', closeHandler);
      onClose();
    };
    modal.addEventListener('modal-confirm', confirmHandler);
    modal.addEventListener('modal-close', closeHandler);
  }

  // === Persistence ===

  _saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._root));
  }

  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) this._root = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }

  _ensureStructure() {
    if (!this._root) {
      this._root = { title: '', description: '', status: 'na', children: new Array(8).fill(null) };
    }
    if (!this._root.children) this._root.children = [];
    while (this._root.children.length < 8) this._root.children.push(null);
    for (let i = 0; i < 8; i++) {
      const child = this._root.children[i];
      if (child) {
        if (!child.children) child.children = [];
        while (child.children.length < 8) child.children.push(null);
      }
    }
  }

  // === Import/Export ===

  _exportData() {
    if (!this._root || !this._root.title) {
      this._notifier.show('No data to export');
      return;
    }
    const fileName = this._root.title || 'mandala';
    // Root line
    let output = [this._root.title, STATUSES.indexOf(this._root.status || 'na'), this._root.description || ''].join(US) + '\n';
    const children = this._root.children || [];
    for (const child of children) {
      if (!child) {
        output += '- null\n';
        continue;
      }
      output += '- ' + [child.title, STATUSES.indexOf(child.status || 'na'), child.description || ''].join(US) + '\n';
      const grandchildren = child.children || [];
      for (const gc of grandchildren) {
        if (!gc) {
          output += '\t- null\n';
          continue;
        }
        output += '\t- ' + [gc.title, STATUSES.indexOf(gc.status || 'na'), gc.description || ''].join(US) + '\n';
      }
    }
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  _importData(content, fileName) {
    try {
      const lines = content.split('\n');
      let lineIdx = 0;

      // Skip empty lines at start
      while (lineIdx < lines.length && !lines[lineIdx].trim()) lineIdx++;
      if (lineIdx >= lines.length) throw new Error('Empty file');

      // First line: root record (not starting with '- ')
      const firstLine = lines[lineIdx];
      let root;
      if (!firstLine.startsWith('- ') && !firstLine.startsWith('\t')) {
        // New format: root line present
        const parts = firstLine.split(US);
        root = {
          title: (parts[0] || '').trim(),
          description: (parts[2] || '').trim(),
          status: STATUSES[parseInt(parts[1])] || 'na',
          children: []
        };
        lineIdx++;
      } else {
        // Old format: no root line, derive name from fileName
        const name = fileName.replace(/\.(md|txt)$/, '');
        root = { title: name, description: '', status: 'na', children: [] };
      }

      let currentLvl1 = null;

      for (; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        if (!line.trim()) continue;

        if (line.startsWith('\t- ') || line.startsWith('  - ')) {
          // lvl2 item
          const text = line.startsWith('\t- ') ? line.slice(3) : line.slice(4);
          if (text.trim() === 'null') {
            if (currentLvl1) currentLvl1.children.push(null);
            continue;
          }
          if (!currentLvl1) throw new Error('lvl2 item without parent');
          const parts = text.split(US);
          currentLvl1.children.push({
            title: (parts[0] || '').trim(),
            description: (parts[2] || '').trim(),
            status: STATUSES[parseInt(parts[1])] || 'na'
          });
        } else if (line.startsWith('- ')) {
          // lvl1 item
          const text = line.slice(2);
          if (text.trim() === 'null') {
            root.children.push(null);
            currentLvl1 = null;
            continue;
          }
          const parts = text.split(US);
          currentLvl1 = {
            title: (parts[0] || '').trim(),
            description: (parts[2] || '').trim(),
            status: STATUSES[parseInt(parts[1])] || 'na',
            children: []
          };
          root.children.push(currentLvl1);
        }
      }

      if (root.children.length > 8) throw new Error(`Too many lvl1 items (${root.children.length}, max 8)`);
      for (const child of root.children) {
        if (child && (child.children || []).length > 8) {
          throw new Error(`Too many lvl2 items for "${child.title}" (${child.children.length}, max 8)`);
        }
      }

      this._root = root;
      this._ensureStructure();
      this._saveToStorage();
      this._renderTree();
      this._notifier.show('Import successful');
    } catch (err) {
      this._notifier.show('Import error: ' + err.message);
    }
  }
}