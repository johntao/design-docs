const template = document.createElement('template');
template.innerHTML = `
  <style>
    dialog {
      border: none;
      border-radius: 6px;
      padding: 20px;
      width: 360px;
      max-height: 80vh;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.3);
    }

    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }

    label {
      display: block;
      font-size: 13px;
      color: #555;
      margin-bottom: 4px;
    }

    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      box-sizing: border-box;
    }

    textarea {
      resize: vertical;
      min-height: 60px;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #0066cc;
    }

    input.error {
      border-color: #cc0000;
    }

    .field {
      margin-bottom: 12px;
    }

    .error-msg {
      color: #cc0000;
      font-size: 12px;
      margin-top: 4px;
      display: none;
    }

    .error-msg.visible {
      display: block;
    }

    .dr-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .dr-section[hidden] {
      display: none;
    }

    .dr-section h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: #555;
    }

    .dr-list {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 150px;
      overflow-y: auto;
    }

    .dr-item {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      background: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 4px;
      cursor: grab;
      font-size: 13px;
    }

    .dr-item:active {
      cursor: grabbing;
    }

    .dr-item.dragging {
      opacity: 0.5;
    }

    .dr-item .handle {
      margin-right: 8px;
      color: #999;
      cursor: grab;
    }

    .dr-item .title {
      flex: 1;
    }

    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .actions button {
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }

    .btn-cancel {
      background: #f0f0f0;
      border: 1px solid #ccc;
    }

    .btn-confirm {
      background: #0066cc;
      border: 1px solid #0066cc;
      color: #fff;
    }
  </style>
  <dialog>
    <h3 class="title">Create Record</h3>
    <div class="field">
      <label>Title *</label>
      <input type="text" class="input-title" placeholder="Enter title">
      <div class="error-msg">Title cannot be blank</div>
    </div>
    <div class="field">
      <label>Description</label>
      <textarea class="input-desc" placeholder="Enter description (optional)"></textarea>
    </div>
    <div class="dr-section" hidden>
      <h4>Detail Records (drag to reorder)</h4>
      <ul class="dr-list"></ul>
    </div>
    <div class="actions">
      <button type="button" class="btn-cancel">Cancel</button>
      <button type="button" class="btn-confirm">Confirm</button>
    </div>
  </dialog>
`;

export class ModalTest extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._dialog = this.shadowRoot.querySelector('dialog');
    this._titleEl = this.shadowRoot.querySelector('.title');
    this._inputTitle = this.shadowRoot.querySelector('.input-title');
    this._inputDesc = this.shadowRoot.querySelector('.input-desc');
    this._errorMsg = this.shadowRoot.querySelector('.error-msg');
    this._drSection = this.shadowRoot.querySelector('.dr-section');
    this._drList = this.shadowRoot.querySelector('.dr-list');
    this._cancelBtn = this.shadowRoot.querySelector('.btn-cancel');
    this._confirmBtn = this.shadowRoot.querySelector('.btn-confirm');

    this._mode = null;
    this._drs = [];
    this._boundKeydown = this._onKeydown.bind(this);
    this._draggedItem = null;

    this._cancelBtn.addEventListener('click', () => this.close());
    this._confirmBtn.addEventListener('click', () => this._confirm());
    this._inputTitle.addEventListener('input', () => this._clearError());

    this._dialog.addEventListener('close', () => {
      document.removeEventListener('keydown', this._boundKeydown);
    });

    // Drag and drop for dr reordering
    this._drList.addEventListener('dragstart', (e) => this._onDragStart(e));
    this._drList.addEventListener('dragover', (e) => this._onDragOver(e));
    this._drList.addEventListener('dragend', (e) => this._onDragEnd(e));
  }

  get isOpen() {
    return this._dialog.open;
  }

  open(mode, data = {}) {
    this._mode = mode;

    this._clearError();
    this._inputTitle.value = data.title || '';
    this._inputDesc.value = data.description || '';
    this._titleEl.textContent = data.modalTitle || 'Record';

    // Handle dr list for mr update mode
    if (mode === 'update-mr' && data.drs) {
      this._drs = [...data.drs];
      this._renderDrList();
      this._drSection.hidden = false;
    } else {
      this._drs = [];
      this._drSection.hidden = true;
    }

    document.addEventListener('keydown', this._boundKeydown);
    this._dialog.showModal();
    this._inputTitle.focus();
  }

  close() {
    this._dialog.close();
    this.dispatchEvent(new CustomEvent('modal-close'));
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Allow shift+enter for newlines in textarea
      if (document.activeElement !== this._inputDesc) {
        e.preventDefault();
        e.stopPropagation();
        this._confirm();
      }
    }
  }

  _confirm() {
    const title = this._inputTitle.value.trim();
    if (!title) {
      this._errorMsg.classList.add('visible');
      this._inputTitle.classList.add('error');
      this._inputTitle.focus();
      return;
    }

    const detail = {
      mode: this._mode,
      title,
      description: this._inputDesc.value.trim()
    };

    // Include reordered drs for mr update
    if (this._mode === 'update-mr') {
      detail.drs = this._drs;
    }

    this._dialog.close();
    this.dispatchEvent(new CustomEvent('modal-confirm', { detail }));
  }

  _clearError() {
    this._errorMsg.classList.remove('visible');
    this._inputTitle.classList.remove('error');
  }

  _renderDrList() {
    this._drList.innerHTML = '';
    this._drs.forEach((dr, i) => {
      const li = document.createElement('li');
      li.className = 'dr-item';
      li.draggable = true;
      li.dataset.index = i;
      li.innerHTML = `<span class="handle">⠿</span><span class="title">${this._escapeHtml(dr.title)}</span>`;
      this._drList.appendChild(li);
    });
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _onDragStart(e) {
    if (!e.target.classList.contains('dr-item')) return;
    this._draggedItem = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  _onDragOver(e) {
    e.preventDefault();
    if (!this._draggedItem) return;

    const target = e.target.closest('.dr-item');
    if (!target || target === this._draggedItem) return;

    const items = Array.from(this._drList.querySelectorAll('.dr-item'));
    const draggedIndex = items.indexOf(this._draggedItem);
    const targetIndex = items.indexOf(target);

    if (draggedIndex < targetIndex) {
      target.after(this._draggedItem);
    } else {
      target.before(this._draggedItem);
    }
  }

  _onDragEnd(e) {
    if (!this._draggedItem) return;
    this._draggedItem.classList.remove('dragging');

    // Update drs array to match new order
    const items = Array.from(this._drList.querySelectorAll('.dr-item'));
    const newDrs = items.map(item => this._drs[parseInt(item.dataset.index)]);
    this._drs = newDrs;

    // Update data-index attributes
    items.forEach((item, i) => {
      item.dataset.index = i;
    });

    this._draggedItem = null;
  }
}

customElements.define('modal-test', ModalTest);
