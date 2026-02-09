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
    // Tree data: root mc-record or null
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
        const [sg2Row, sg2Col] = PLACEMENT_ORDER[j];
        const lvl2Idx = positionToIndex(mgRow, mgCol, sg2Row, sg2Col);
        cells[lvl2Idx].setRecord(gc);
      }
    }
  }

  // === Determine what a cell represents in the tree ===

  _getCellTreeInfo(cellIndex) {
    if (cellIndex === CENTER_INDEX) {
      return { level: 0, record: this._root, parent: null, childIndex: -1 };
    }

    const pos = indexToPosition(cellIndex);
    const children = this._root?.children || [];

    // Check if it's a lvl1 node in center outergrid
    if (pos.mgRow === 1 && pos.mgCol === 1 && !(pos.sgRow === 1 && pos.sgCol === 1)) {
      const idx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.sgRow && c === pos.sgCol);
      if (idx !== -1 && idx < children.length) {
        return { level: 1, record: children[idx], parent: this._root, childIndex: idx };
      }
      // Empty lvl1 slot
      return { level: 1, record: null, parent: this._root, childIndex: idx, slotIndex: idx };
    }

    // Check if it's a synced lvl1 node (center of an outer grid)
    if (pos.sgRow === 1 && pos.sgCol === 1 && !(pos.mgRow === 1 && pos.mgCol === 1)) {
      const idx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.mgRow && c === pos.mgCol);
      if (idx !== -1 && idx < children.length) {
        return { level: 1, record: children[idx], parent: this._root, childIndex: idx, isSynced: true };
      }
      return { level: 1, record: null, parent: this._root, childIndex: idx, slotIndex: idx, isSynced: true };
    }

    // Check if it's a lvl2 node in an outer outergrid
    if (!(pos.mgRow === 1 && pos.mgCol === 1) && !(pos.sgRow === 1 && pos.sgCol === 1)) {
      const parentIdx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.mgRow && c === pos.mgCol);
      if (parentIdx !== -1 && parentIdx < children.length) {
        const parentRecord = children[parentIdx];
        const grandchildren = parentRecord.children || [];
        const gcIdx = PLACEMENT_ORDER.findIndex(([r, c]) => r === pos.sgRow && c === pos.sgCol);
        if (gcIdx !== -1 && gcIdx < grandchildren.length) {
          return { level: 2, record: grandchildren[gcIdx], parent: parentRecord, childIndex: gcIdx };
        }
        return { level: 2, record: null, parent: parentRecord, childIndex: gcIdx, slotIndex: gcIdx };
      }
      return { level: -1, record: null, parent: null, childIndex: -1 };
    }

    return { level: -1, record: null, parent: null, childIndex: -1 };
  }

  _checkAvailability(cellIndex) {
    const info = this._getCellTreeInfo(cellIndex);
    if (!info.record) return false; // no record to add child to

    if (info.level === 0) {
      return (this._root.children || []).length < 8;
    }
    if (info.level === 1) {
      return (info.record.children || []).length < 8;
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

    if (cell.cellIndex === CENTER_INDEX && !this._root) {
      // Create root
      this._modal.open('create', { modalTitle: 'Create Root Record' });
      this._modalListen((detail) => {
        this._root = { title: detail.title, description: detail.description, status: detail.status || 'na', children: [] };
        this._saveToStorage();
        this._renderTree();
        cell.focus();
      }, () => cell.focus());
      return;
    }

    // If cell has no record but is an empty lvl1/lvl2 slot
    if (!info.record && info.parent) {
      const level = info.level;
      if (level === 1) {
        // Create lvl1 child - but only if slot is next in order
        const defaultStatus = (this._root.status || 'na') === 'na' ? 'na' : 'now';
        this._modal.open('create', { modalTitle: 'Create Record', status: defaultStatus });
        this._modalListen((detail) => {
          if (!this._root.children) this._root.children = [];
          const newRecord = { title: detail.title, description: detail.description, status: detail.status || 'na', children: [] };
          // Place at the correct slot index
          if (info.slotIndex === this._root.children.length) {
            this._root.children.push(newRecord);
          } else {
            // Cannot create out of order
            this._notifier.show('Records must be created in order');
            cell.focus();
            return;
          }
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
          if (!info.parent.children) info.parent.children = [];
          const newRecord = { title: detail.title, description: detail.description, status: detail.status || 'na' };
          if (info.slotIndex === info.parent.children.length) {
            info.parent.children.push(newRecord);
          } else {
            this._notifier.show('Records must be created in order');
            cell.focus();
            return;
          }
          this._saveToStorage();
          this._renderTree();
          cell.focus();
        }, () => cell.focus());
        return;
      }
    }

    // If cell has a record, create a child
    if (info.record) {
      if (!this._checkAvailability(cell.cellIndex)) {
        this._notifier.show('Maximum children reached (8)');
        return;
      }
      const defaultStatus = (info.record.status || 'na') === 'na' ? 'na' : 'now';
      this._modal.open('create', { modalTitle: 'Create Child Record', status: defaultStatus });
      this._modalListen((detail) => {
        if (!info.record.children) info.record.children = [];
        const newRecord = { title: detail.title, description: detail.description, status: detail.status || 'na' };
        if (info.level < 2) newRecord.children = [];
        info.record.children.push(newRecord);
        this._saveToStorage();
        this._renderTree();
        cell.focus();
      }, () => cell.focus());
      return;
    }

    // Teleport to nearest empty ancestor
    if (!this._root) {
      const rootCell = this._grid.cellAt(CENTER_INDEX);
      rootCell.focus();
      this._handleCreate(rootCell);
      return;
    }
    const pos = indexToPosition(cell.cellIndex);
    if (!(pos.mgRow === 1 && pos.mgCol === 1)) {
      const parentCellIdx = positionToIndex(pos.mgRow, pos.mgCol, 1, 1);
      const parentCell = this._grid.cellAt(parentCellIdx);
      parentCell.focus();
      this._handleCreate(parentCell);
    }
  }

  _handleInlineEdit(cell) {
    if (!cell.record) return;
    cell.startInlineEdit();
  }

  _handleDetailEdit(cell) {
    const info = this._getCellTreeInfo(cell.cellIndex);
    if (!info.record) return;

    this._modal.open('update', {
      modalTitle: 'Update Record',
      title: info.record.title,
      description: info.record.description || '',
      status: info.record.status || 'na',
      children: info.record.children || []
    });

    this._modalListen((detail) => {
      info.record.title = detail.title;
      info.record.description = detail.description;
      info.record.status = detail.status;
      if (detail.children) info.record.children = detail.children;
      this._saveToStorage();
      this._renderTree();
      cell.focus();
    }, () => cell.focus());
  }

  _handleDelete(cell) {
    const info = this._getCellTreeInfo(cell.cellIndex);
    if (!info.record) return;

    if (info.level === 0) {
      const backup = JSON.parse(JSON.stringify(this._root));
      this._root = null;
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
      info.parent.children.splice(info.childIndex, 1);
      this._saveToStorage();
      this._renderTree();
      this._notifier.show('Record deleted', () => {
        info.parent.children.splice(backupIdx, 0, backup);
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

  // === Import/Export ===

  _exportData() {
    if (!this._root) {
      this._notifier.show('No data to export');
      return;
    }
    const fileName = this._root.title || 'mandala';
    let output = '';
    const children = this._root.children || [];
    for (const child of children) {
      output += '- ' + [child.title, STATUSES.indexOf(child.status || 'na'), child.description || ''].join(US) + '\n';
      const grandchildren = child.children || [];
      for (const gc of grandchildren) {
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
      const name = fileName.replace(/\.(md|txt)$/, '');
      const root = { title: name, description: '', children: [] };
      let currentLvl1 = null;

      for (const line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith('\t- ') || line.startsWith('  - ')) {
          // lvl2 item
          if (!currentLvl1) throw new Error('lvl2 item without parent');
          const text = line.startsWith('\t- ') ? line.slice(3) : line.slice(4);
          const parts = text.split(US);
          currentLvl1.children.push({
            title: (parts[0] || '').trim(),
            description: (parts[2] || '').trim(),
            status: STATUSES[parseInt(parts[1])] || 'na'
          });
        } else if (line.startsWith('- ')) {
          // lvl1 item
          const text = line.slice(2);
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
        if ((child.children || []).length > 8) {
          throw new Error(`Too many lvl2 items for "${child.title}" (${child.children.length}, max 8)`);
        }
      }

      this._root = root;
      this._saveToStorage();
      this._renderTree();
      this._notifier.show('Import successful');
    } catch (err) {
      this._notifier.show('Import error: ' + err.message);
    }
  }
}