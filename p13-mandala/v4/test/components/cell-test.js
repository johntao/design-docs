const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      border: 1px solid #ccc;
      border-radius: 4px;
      min-height: 60px;
      padding: 12px;
      background: #fff;
    }

    :host(:focus) {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    .empty {
      color: #999;
      font-size: 14px;
    }

    .record {
      font-size: 14px;
    }

    .record[hidden] {
      display: none;
    }
  </style>
  <div class="empty">Press 'u' to create</div>
  <div class="record" hidden></div>
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
    this._record = this.shadowRoot.querySelector('.record');
    this._data = null;
    this._deletedData = null;
  }

  connectedCallback() {
    this.setAttribute('tabindex', '0');
    this._render();
  }

  get data() {
    return this._data;
  }

  _render() {
    if (!this._data) {
      this._empty.hidden = false;
      this._record.hidden = true;
    } else {
      this._empty.hidden = true;
      this._record.hidden = false;
      this._record.textContent = this._data.title;
    }
  }

  // Keyboard handler called from document listener
  handleKeydown(e) {
    const modal = CellTest._modal;
    const notify = CellTest._notify;

    switch (e.key) {
      case 'u':
        e.preventDefault();
        if (!this._data && modal) {
          modal.open('create');
          const onConfirm = (ev) => {
            modal.removeEventListener('modal-confirm', onConfirm);
            modal.removeEventListener('modal-close', onClose);
            this._data = { title: ev.detail.title };
            this._render();
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
        break;

      case 'o':
        e.preventDefault();
        if (this._data && modal) {
          modal.open('update', { title: this._data.title });
          const onConfirm = (ev) => {
            modal.removeEventListener('modal-confirm', onConfirm);
            modal.removeEventListener('modal-close', onClose);
            this._data.title = ev.detail.title;
            this._render();
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
        break;

      case 'Delete':
        e.preventDefault();
        if (this._data && notify) {
          this._deletedData = this._data;
          this._data = null;
          this._render();
          notify.show('Record deleted', () => {
            this._data = this._deletedData;
            this._deletedData = null;
            this._render();
          });
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        this._focusSibling('up');
        break;

      case 'ArrowDown':
        e.preventDefault();
        this._focusSibling('down');
        break;
    }
  }

  _focusSibling(direction) {
    const cells = Array.from(document.querySelectorAll('cell-test'));
    const currentIndex = cells.indexOf(this);

    if (direction === 'up' && currentIndex > 0) {
      cells[currentIndex - 1].focus();
    } else if (direction === 'down' && currentIndex < cells.length - 1) {
      cells[currentIndex + 1].focus();
    }
  }
}

customElements.define('cell-test', CellTest);
