const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      background: #fff;
      padding: 4px;
      font-size: 12px;
      overflow: hidden;
    }

    :host(:focus) {
      outline: 2px solid #0066cc;
      outline-offset: -2px;
    }
    .empty {
      color: #bbb;
      font-size: 11px;
      text-align: center;
      padding-top: 40px;
    }

    .mr {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .mr[hidden] {
      display: none;
    }

    .mr-title {
      font-weight: 500;
      padding: 2px 4px;
      border-bottom: 1px solid #eee;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mr-title.editing {
      background: #fffde7;
    }

    .dr-list {
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
      overflow: hidden;
    }

    .dr-item {
      padding: 2px 4px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #555;
      font-size: 11px;
    }

    .dr-item:focus {
      outline: 2px solid #0066cc;
      outline-offset: -1px;
      background: #f0f7ff;
    }

    .dr-item.editing {
      background: #fffde7;
    }

    .inline-input {
      width: 100%;
      border: none;
      background: transparent;
      font: inherit;
      padding: 0;
      outline: none;
    }
  </style>
  <div class="empty">empty</div>
  <div class="mr" hidden>
    <div class="mr-title"></div>
    <ul class="dr-list"></ul>
  </div>
`;

export class CellTest extends HTMLElement {
  static _modal = null;
  static _notify = null;

  static setModal(modal) {
    CellTest._modal = modal;
  }

  static setNotify(notify) {
    CellTest._notify = notify;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._empty = this.shadowRoot.querySelector('.empty');
    this._mrEl = this.shadowRoot.querySelector('.mr');
    this._mrTitle = this.shadowRoot.querySelector('.mr-title');
    this._drList = this.shadowRoot.querySelector('.dr-list');

    this._data = null; // { title: string, drs: [{ title: string }] }
    this._deletedData = null;
    this._isEditing = false;

    // Single click handler for the component
    this.shadowRoot.addEventListener('click', (e) => this._handleClick(e));
  }

  connectedCallback() {
    this.setAttribute('tabindex', '0');
    this._render();
  }

  get data() {
    return this._data;
  }

  setData(data) {
    this._data = data;
    this._render();
  }

  _notifyChange() {
    this.dispatchEvent(new CustomEvent('cell-change', { bubbles: true }));
  }

  _render() {
    if (!this._data) {
      this._empty.hidden = false;
      this._mrEl.hidden = true;
    } else {
      this._empty.hidden = true;
      this._mrEl.hidden = false;
      this._mrTitle.textContent = this._data.title;
      this._renderDrs();
    }
  }

  _renderDrs() {
    this._drList.innerHTML = '';
    const drs = this._data?.drs || [];

    for (let i = 0; i < drs.length; i++) {
      const li = document.createElement('li');
      li.className = 'dr-item';
      li.setAttribute('tabindex', '0');
      li.textContent = drs[i].title;
      li.dataset.index = i;
      this._drList.appendChild(li);
    }
  }

  _handleClick(e) {
    const target = e.target;

    // Clicking on a dr item focuses it
    if (target.classList.contains('dr-item')) {
      target.focus();
      return;
    }

    // Clicking elsewhere focuses the cell
    this.focus();
  }

  // Get the currently focused dr element if any
  _getFocusedDr() {
    return this.shadowRoot.activeElement?.classList.contains('dr-item')
      ? this.shadowRoot.activeElement
      : null;
  }

  // Get focus type: 'dr' if a dr is focused, 'mr' if cell has data, 'empty' otherwise
  _getFocusType() {
    if (this._getFocusedDr()) return 'dr';
    if (this._data) return 'mr';
    return 'empty';
  }

  handleKeydown(e) {
    if (this._isEditing) return;

    const modal = CellTest._modal;
    const notify = CellTest._notify;
    const focusType = this._getFocusType();

    switch (e.key) {
      case 'u':
        e.preventDefault();
        this._handleCreate(modal);
        break;

      case 'Delete':
        e.preventDefault();
        this._handleDelete(notify);
        break;

      case 'i':
        e.preventDefault();
        this._handleInlineEdit();
        break;

      case 'o':
        e.preventDefault();
        this._handleDetailEdit(modal);
        break;

      case ',':
        e.preventDefault();
        this._handleInCellNav('up');
        break;

      case '.':
        e.preventDefault();
        this._handleInCellNav('down');
        break;

      case 'm':
        e.preventDefault();
        this._handleUnfocusDr();
        break;
    }
  }

  _handleCreate(modal) {
    if (!modal) return;

    const hasData = !!this._data;
    const mode = hasData ? 'create-dr' : 'create-mr';
    const title = hasData ? 'Create Detail Record' : 'Create Master Record';

    modal.open(mode, { modalTitle: title });

    const onConfirm = (ev) => {
      modal.removeEventListener('modal-confirm', onConfirm);
      modal.removeEventListener('modal-close', onClose);

      if (!hasData) {
        // Create new master record
        this._data = { title: ev.detail.title, drs: [] };
      } else {
        // Add detail record
        this._data.drs.push({ title: ev.detail.title });
      }
      this._render();
      this._notifyChange();
      this.focus();
    };

    const onClose = () => {
      modal.removeEventListener('modal-confirm', onConfirm);
      modal.removeEventListener('modal-close', onClose);
      this.focus();
    };

    modal.addEventListener('modal-confirm', onConfirm);
    modal.addEventListener('modal-close', onClose);
  }

  _handleDelete(notify) {
    if (!notify) return;

    const focusedDr = this._getFocusedDr();

    if (focusedDr) {
      // Delete the focused dr
      const drIndex = parseInt(focusedDr.dataset.index);
      const deletedDr = this._data.drs.splice(drIndex, 1)[0];
      this._render();

      // Restore focus: same index, or previous, or cell-test
      const drs = this._drList.querySelectorAll('.dr-item');
      if (drs.length === 0) {
        this.focus();
      } else if (drs[drIndex]) {
        drs[drIndex].focus();
      } else {
        drs[drIndex - 1].focus();
      }

      this._notifyChange();
      notify.show('Detail record deleted', () => {
        this._data.drs.splice(drIndex, 0, deletedDr);
        this._render();
        this._notifyChange();
      });
    } else if (this._data) {
      // Delete the mr including all drs
      this._deletedData = this._data;
      this._data = null;
      this._render();
      this._notifyChange();

      notify.show('Master record deleted', () => {
        this._data = this._deletedData;
        this._deletedData = null;
        this._render();
        this._notifyChange();
      });
    }
  }

  _handleInlineEdit() {
    const focusedDr = this._getFocusedDr();

    if (focusedDr) {
      this._startInlineEdit(focusedDr, 'dr');
    } else if (this._data) {
      this._startInlineEdit(this._mrTitle, 'mr');
    }
  }

  _startInlineEdit(element, type) {
    this._isEditing = true;
    element.classList.add('editing');

    const originalText = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-input';
    input.value = originalText;

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const finish = (save) => {
      this._isEditing = false;
      element.classList.remove('editing');
      const newValue = input.value.trim();

      if (save && newValue) {
        if (type === 'mr') {
          this._data.title = newValue;
        } else {
          const drIndex = parseInt(element.dataset.index);
          this._data.drs[drIndex].title = newValue;
        }
        this._notifyChange();
      }

      this._render();

      if (type === 'dr') {
        // Refocus the dr at the same index
        const drs = this._drList.querySelectorAll('.dr-item');
        const drIndex = parseInt(element.dataset.index);
        if (drs[drIndex]) drs[drIndex].focus();
        else this.focus();
      } else {
        this.focus();
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finish(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        finish(false);
      }
    });

    input.addEventListener('blur', () => finish(true));
  }

  _handleDetailEdit(modal) {
    if (!modal) return;

    const focusedDr = this._getFocusedDr();

    if (focusedDr) {
      // Edit dr details
      const drIndex = parseInt(focusedDr.dataset.index);
      const dr = this._data.drs[drIndex];

      modal.open('update-dr', {
        modalTitle: 'Update Detail Record',
        title: dr.title,
        description: dr.description || ''
      });

      const onConfirm = (ev) => {
        modal.removeEventListener('modal-confirm', onConfirm);
        modal.removeEventListener('modal-close', onClose);
        dr.title = ev.detail.title;
        dr.description = ev.detail.description;
        this._render();
        this._notifyChange();
        // Refocus the dr
        const drs = this._drList.querySelectorAll('.dr-item');
        if (drs[drIndex]) drs[drIndex].focus();
        else this.focus();
      };

      const onClose = () => {
        modal.removeEventListener('modal-confirm', onConfirm);
        modal.removeEventListener('modal-close', onClose);
        // Refocus the dr
        const drs = this._drList.querySelectorAll('.dr-item');
        if (drs[drIndex]) drs[drIndex].focus();
        else this.focus();
      };

      modal.addEventListener('modal-confirm', onConfirm);
      modal.addEventListener('modal-close', onClose);
    } else if (this._data) {
      // Edit mr details with dr list
      modal.open('update-mr', {
        modalTitle: 'Update Master Record',
        title: this._data.title,
        description: this._data.description || '',
        drs: this._data.drs
      });

      const onConfirm = (ev) => {
        modal.removeEventListener('modal-confirm', onConfirm);
        modal.removeEventListener('modal-close', onClose);
        this._data.title = ev.detail.title;
        this._data.description = ev.detail.description;
        if (ev.detail.drs) {
          this._data.drs = ev.detail.drs;
        }
        this._render();
        this._notifyChange();
        this.focus();
      };

      const onClose = () => {
        modal.removeEventListener('modal-confirm', onConfirm);
        modal.removeEventListener('modal-close', onClose);
        this.focus();
      };

      modal.addEventListener('modal-confirm', onConfirm);
      modal.addEventListener('modal-close', onClose);
    }
  }

  _handleInCellNav(direction) {
    const drs = Array.from(this._drList.querySelectorAll('.dr-item'));
    if (drs.length === 0) return;

    const focusedDr = this._getFocusedDr();
    const currentIndex = drs.indexOf(focusedDr);

    if (direction === 'up') {
      // Move to previous, wrap to last if at first or no focus
      if (currentIndex <= 0) {
        drs[drs.length - 1].focus();
      } else {
        drs[currentIndex - 1].focus();
      }
    } else if (direction === 'down') {
      // Move to next, wrap to first if at last or no focus
      if (!focusedDr || currentIndex >= drs.length - 1) {
        drs[0].focus();
      } else {
        drs[currentIndex + 1].focus();
      }
    }
  }

  _handleUnfocusDr() {
    if (this._getFocusedDr()) {
      this.focus();
    }
  }
}

customElements.define('cell-test', CellTest);
