export default class McDataMigration extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
<style>
:host { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
button { padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; font-family: monospace; }
button:hover { background: #f5f5f5; }
input[type="file"] { display: none; }
</style>
<button class="btn-export">Export</button>
<button class="btn-import">Import</button>
<input type="file" class="file-input" accept=".md,.txt">
    `;
    this._exportBtn = this.shadowRoot.querySelector('.btn-export');
    this._importBtn = this.shadowRoot.querySelector('.btn-import');
    this._fileInput = this.shadowRoot.querySelector('.file-input');

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