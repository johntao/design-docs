const template = document.createElement('template');
template.innerHTML = `
  <style>
    dialog {
      border: none;
      border-radius: 6px;
      padding: 20px;
      width: 300px;
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

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus {
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
    <div class="actions">
      <button type="button" class="btn-cancel">Cancel (Esc)</button>
      <button type="button" class="btn-confirm">Confirm (Enter)</button>
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
    this._errorMsg = this.shadowRoot.querySelector('.error-msg');
    this._cancelBtn = this.shadowRoot.querySelector('.btn-cancel');
    this._confirmBtn = this.shadowRoot.querySelector('.btn-confirm');

    this._mode = null;
    this._boundKeydown = this._onKeydown.bind(this);

    this._cancelBtn.addEventListener('click', () => this.close());
    this._confirmBtn.addEventListener('click', () => this._confirm());
    this._inputTitle.addEventListener('input', () => this._clearError());

    this._dialog.addEventListener('close', () => {
      document.removeEventListener('keydown', this._boundKeydown);
    });
  }

  get isOpen() {
    return this._dialog.open;
  }

  open(mode, data = {}) {
    this._mode = mode;

    this._clearError();
    this._inputTitle.value = data.title || '';

    if (mode === 'create') {
      this._titleEl.textContent = 'Create Record';
    } else if (mode === 'update') {
      this._titleEl.textContent = 'Update Record';
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
    } else if (e.key === 'Enter') {
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

    const detail = {
      mode: this._mode,
      title
    };

    this._dialog.close();
    this.dispatchEvent(new CustomEvent('modal-confirm', { detail }));
  }

  _clearError() {
    this._errorMsg.classList.remove('visible');
    this._inputTitle.classList.remove('error');
  }
}

customElements.define('modal-test', ModalTest);
