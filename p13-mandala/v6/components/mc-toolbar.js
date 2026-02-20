export default class McToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
<style>
:host { display: flex; flex-direction: column; gap: 6px; }
button, select {
  display: block;
  width: 100%;
  padding: 6px 2px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 11px;
  font-family: monospace;
  text-align: center;
  box-sizing: border-box;
}
button:hover, select:hover { background: #f5f5f5; }
input[type="file"] { display: none; }
</style>
<button class="btn-export">Save</button>
<button class="btn-import">Load</button>
<input type="file" class="file-input" accept=".md,.txt">
<select class="layout-select">
  <option value="qwerty">QWE</option>
  <option value="dvorak">DVK</option>
</select>
    `;
    this._exportBtn = this.shadowRoot.querySelector('.btn-export');
    this._importBtn = this.shadowRoot.querySelector('.btn-import');
    this._fileInput = this.shadowRoot.querySelector('.file-input');
    this._layoutSelect = this.shadowRoot.querySelector('.layout-select');
    this._layoutSelect.value = localStorage.getItem('mandala-v6-keyboard') || 'qwerty';

    this._layoutSelect.addEventListener('change', () => {
      localStorage.setItem('mandala-v6-keyboard', this._layoutSelect.value);
      this.dispatchEvent(new CustomEvent('keyboard-change', {
        bubbles: true,
        detail: { layout: this._layoutSelect.value }
      }));
    });
    this._exportBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('migration-export', { bubbles: true }));
    });
    this._importBtn.addEventListener('click', () => this._fileInput.click());
    this._fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.dispatchEvent(new CustomEvent('migration-import', {
            bubbles: true,
            detail: { content: ev.target.result, fileName: file.name }
          }));
        };
        reader.readAsText(file);
      }
      this._fileInput.value = '';
    });
  }
}