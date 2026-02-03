const template = document.createElement('template');
template.innerHTML = `
  <style>
    dialog {
      border: none;
      border-radius: 8px;
      padding: 24px;
      width: 480px;
      max-height: 80vh;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      overflow-y: auto;
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.4);
    }

    h2 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      padding: 4px 8px;
      line-height: 1;
    }

    .close-btn:hover {
      color: #333;
    }

    .section {
      margin-bottom: 20px;
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section h3 {
      margin: 0 0 10px 0;
      font-size: 13px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .shortcut-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .keys {
      min-width: 100px;
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    kbd {
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
      font-family: monospace;
      font-size: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .desc {
      font-size: 13px;
      color: #444;
    }

    .key-grid {
      display: grid;
      grid-template-columns: repeat(3, auto);
      gap: 2px;
      margin-right: 8px;
    }

    .key-grid kbd {
      width: 24px;
      text-align: center;
      padding: 4px;
    }
  </style>
  <dialog>
    <h2>
      Keyboard Shortcuts
      <button class="close-btn" title="Close">&times;</button>
    </h2>

    <div class="section">
      <h3>Editing</h3>
      <div class="shortcut-list">
        <div class="shortcut-item">
          <div class="keys"><kbd>u</kbd></div>
          <div class="desc">Create a new record in the current cell</div>
        </div>
        <div class="shortcut-item">
          <div class="keys"><kbd>i</kbd></div>
          <div class="desc">Inline edit - edit title directly in cell</div>
        </div>
        <div class="shortcut-item">
          <div class="keys"><kbd>o</kbd></div>
          <div class="desc">Detail edit - open modal for full editing</div>
        </div>
        <div class="shortcut-item">
          <div class="keys"><kbd>Del</kbd></div>
          <div class="desc">Delete the current record</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Detail Records (DRs)</h3>
      <div class="shortcut-list">
        <div class="shortcut-item">
          <div class="keys"><kbd>,</kbd> <kbd>.</kbd></div>
          <div class="desc">Navigate between detail records within a cell</div>
        </div>
        <div class="shortcut-item">
          <div class="keys"><kbd>m</kbd></div>
          <div class="desc">Unfocus detail record (return to main record)</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Cell Navigation</h3>
      <div class="shortcut-list">
        <div class="shortcut-item">
          <div class="keys"><kbd>h</kbd><kbd>j</kbd><kbd>k</kbd><kbd>l</kbd></div>
          <div class="desc">Move left / down / up / right (vim-style)</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Local Jump (within current 3×3 block)</h3>
      <div class="shortcut-list">
        <div class="shortcut-item">
          <div class="key-grid">
            <kbd>w</kbd><kbd>e</kbd><kbd>r</kbd>
            <kbd>s</kbd><kbd>d</kbd><kbd>f</kbd>
            <kbd>x</kbd><kbd>c</kbd><kbd>v</kbd>
          </div>
          <div class="desc">Jump to position within current maincell</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Global Jump (across maincells)</h3>
      <div class="shortcut-list">
        <div class="shortcut-item">
          <div class="key-grid">
            <kbd>W</kbd><kbd>E</kbd><kbd>R</kbd>
            <kbd>S</kbd><kbd>D</kbd><kbd>F</kbd>
            <kbd>X</kbd><kbd>C</kbd><kbd>V</kbd>
          </div>
          <div class="desc">Jump to same position in another maincell</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Other</h3>
      <div class="shortcut-list">
        <div class="shortcut-item">
          <div class="keys"><kbd>?</kbd></div>
          <div class="desc">Show this help popup</div>
        </div>
        <div class="shortcut-item">
          <div class="keys"><kbd>Esc</kbd></div>
          <div class="desc">Close popup / Cancel editing</div>
        </div>
      </div>
    </div>
  </dialog>
`;

export class HelpPopup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._dialog = this.shadowRoot.querySelector('dialog');
    this._closeBtn = this.shadowRoot.querySelector('.close-btn');

    this._boundKeydown = this._onKeydown.bind(this);

    this._closeBtn.addEventListener('click', () => this.close());
    this._dialog.addEventListener('click', (e) => {
      if (e.target === this._dialog) this.close();
    });
  }

  get isOpen() {
    return this._dialog.open;
  }

  open() {
    document.addEventListener('keydown', this._boundKeydown);
    this._dialog.showModal();
  }

  close() {
    this._dialog.close();
    document.removeEventListener('keydown', this._boundKeydown);
  }

  _onKeydown(e) {
    if (e.key === 'Escape' || e.key === '?') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    }
  }
}

customElements.define('help-popup', HelpPopup);
