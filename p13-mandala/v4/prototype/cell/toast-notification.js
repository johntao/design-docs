const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
    }

    .toast {
      background: #333;
      color: #fff;
      padding: 10px 16px;
      border-radius: 4px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast[hidden] {
      display: none;
    }

    button {
      background: transparent;
      border: 1px solid #fff;
      color: #fff;
      padding: 4px 10px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 13px;
    }
  </style>
  <div class="toast" hidden>
    <span class="message"></span>
    <button type="button">Undo</button>
  </div>
`;

export class ToastNotification extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._toast = this.shadowRoot.querySelector('.toast');
    this._message = this.shadowRoot.querySelector('.message');
    this._undoBtn = this.shadowRoot.querySelector('button');
    this._timeout = null;
    this._undoCallback = null;

    this._undoBtn.addEventListener('click', () => {
      if (this._undoCallback) {
        this._undoCallback();
      }
      this.hide();
    });
  }

  show(msg, undoCallback) {
    this._message.textContent = msg;
    this._undoCallback = undoCallback;
    this._toast.hidden = false;

    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = setTimeout(() => this.hide(), 5000);
  }

  hide() {
    this._toast.hidden = true;
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    this._undoCallback = null;
  }
}

customElements.define('toast-notification', ToastNotification);
