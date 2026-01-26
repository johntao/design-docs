const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
    }

    :host([open]) {
      display: block;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal {
      background: #fff;
      border-radius: 6px;
      padding: 20px;
      width: 340px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

    input,
    textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: #0066cc;
    }

    input.error {
      border-color: #cc0000;
    }

    textarea {
      resize: vertical;
      min-height: 60px;
    }

    .field {
      margin-bottom: 12px;
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

    .error-msg {
      color: #cc0000;
      font-size: 12px;
      margin-top: 4px;
      display: none;
    }

    .error-msg.visible {
      display: block;
    }

    .dr-list {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    .dr-list li {
      padding: 8px;
      background: #fafafa;
      border-bottom: 1px solid #eee;
      cursor: grab;
      font-size: 13px;
    }

    .dr-list li:last-child {
      border-bottom: none;
    }

    .dr-list li.dragging {
      opacity: 0.5;
      background: #e0e0e0;
    }

    .dr-list li.drag-over {
      border-top: 2px solid #0066cc;
    }

    .dr-section[hidden] {
      display: none;
    }
  </style>
  <div class="overlay">
    <div class="modal">
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
      <div class="field dr-section" hidden>
        <label>Detail Records (drag to reorder)</label>
        <ul class="dr-list"></ul>
      </div>
      <div class="actions">
        <button type="button" class="btn-cancel">Cancel (Esc)</button>
        <button type="button" class="btn-confirm">Confirm (Enter)</button>
      </div>
    </div>
  </div>
`;

export class RecordModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._overlay = this.shadowRoot.querySelector('.overlay');
    this._titleEl = this.shadowRoot.querySelector('.title');
    this._inputTitle = this.shadowRoot.querySelector('.input-title');
    this._inputDesc = this.shadowRoot.querySelector('.input-desc');
    this._errorMsg = this.shadowRoot.querySelector('.error-msg');
    this._drSection = this.shadowRoot.querySelector('.dr-section');
    this._drList = this.shadowRoot.querySelector('.dr-list');
    this._cancelBtn = this.shadowRoot.querySelector('.btn-cancel');
    this._confirmBtn = this.shadowRoot.querySelector('.btn-confirm');

    this._mode = null;
    this._targetIndex = null;
    this._drOrder = [];
    this._drs = [];
    this._draggedIndex = null;
    this._boundKeydown = this._onKeydown.bind(this);

    this._cancelBtn.addEventListener('click', () => this.close());
    this._confirmBtn.addEventListener('click', () => this._confirm());
    this._inputTitle.addEventListener('input', () => this._clearError());

    this._drList.addEventListener('dragstart', (e) => this._onDragStart(e));
    this._drList.addEventListener('dragend', (e) => this._onDragEnd(e));
    this._drList.addEventListener('dragover', (e) => this._onDragOver(e));
    this._drList.addEventListener('drop', (e) => this._onDrop(e));
  }

  get isOpen() {
    return this.hasAttribute('open');
  }

  open(mode, data = {}) {
    this._mode = mode;
    this._targetIndex = data.targetIndex ?? null;
    this._drs = data.drs || [];

    this._clearError();
    this._inputTitle.value = data.title || '';
    this._inputDesc.value = data.description || '';
    this._drSection.hidden = true;

    if (mode === 'create-mr') {
      this._titleEl.textContent = 'Create Master Record';
    } else if (mode === 'create-dr') {
      this._titleEl.textContent = 'Create Detail Record';
    } else if (mode === 'update-mr') {
      this._titleEl.textContent = 'Edit Master Record';
      if (this._drs.length > 0) {
        this._drSection.hidden = false;
        this._drOrder = this._drs.map((_, i) => i);
        this._renderDrList();
      }
    } else if (mode === 'update-dr') {
      this._titleEl.textContent = 'Edit Detail Record';
    }

    this.setAttribute('open', '');
    document.addEventListener('keydown', this._boundKeydown);
    this._inputTitle.focus();
  }

  close() {
    this.removeAttribute('open');
    document.removeEventListener('keydown', this._boundKeydown);
    this.dispatchEvent(new CustomEvent('modal-close'));
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    } else if (e.key === 'Enter' && e.target !== this._inputDesc) {
      e.preventDefault();
      e.stopPropagation();
      this._confirm();
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

    const description = this._inputDesc.value.trim();
    const detail = {
      mode: this._mode,
      title,
      description,
      targetIndex: this._targetIndex,
      drOrder: this._drOrder.length > 0 ? [...this._drOrder] : null
    };

    this.removeAttribute('open');
    document.removeEventListener('keydown', this._boundKeydown);
    this.dispatchEvent(new CustomEvent('modal-confirm', { detail }));
  }

  _clearError() {
    this._errorMsg.classList.remove('visible');
    this._inputTitle.classList.remove('error');
  }

  _renderDrList() {
    this._drList.innerHTML = '';
    this._drOrder.forEach((drIndex, orderIndex) => {
      const dr = this._drs[drIndex];
      const li = document.createElement('li');
      li.textContent = dr.title;
      li.draggable = true;
      li.dataset.orderIndex = orderIndex;
      this._drList.appendChild(li);
    });
  }

  _onDragStart(e) {
    if (e.target.tagName === 'LI') {
      this._draggedIndex = parseInt(e.target.dataset.orderIndex);
      e.target.classList.add('dragging');
    }
  }

  _onDragEnd(e) {
    if (e.target.tagName === 'LI') {
      e.target.classList.remove('dragging');
      this._draggedIndex = null;
      this._drList.querySelectorAll('li').forEach(li => li.classList.remove('drag-over'));
    }
  }

  _onDragOver(e) {
    e.preventDefault();
    const target = e.target.closest('li');
    if (target && this._draggedIndex !== null) {
      this._drList.querySelectorAll('li').forEach(li => li.classList.remove('drag-over'));
      target.classList.add('drag-over');
    }
  }

  _onDrop(e) {
    e.preventDefault();
    const target = e.target.closest('li');
    if (target && this._draggedIndex !== null) {
      const dropIndex = parseInt(target.dataset.orderIndex);
      if (this._draggedIndex !== dropIndex) {
        const [removed] = this._drOrder.splice(this._draggedIndex, 1);
        this._drOrder.splice(dropIndex, 0, removed);
        this._renderDrList();
      }
    }
  }
}

customElements.define('record-modal', RecordModal);
