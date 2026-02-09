import { calcProgress } from './utility.js';

export default class McCell extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
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
  font-size: 10px;
  text-align: center;
  padding-top: 30px;
}
.mr {
  height: 100%;
}
.mr[hidden] { display: none; }
.mr-title {
  font-weight: 500;
  padding: 2px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mr-desc {
  font-size: 10px;
  color: #888;
  padding: 1px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mr-status {
  font-size: 10px;
  padding: 1px 4px;
  display: flex;
  justify-content: space-between;
}
.mr-status[hidden] { display: none; }
.inline-input {
  width: 100%;
  border: none;
  background: #fffde7;
  font: inherit;
  font-weight: 500;
  padding: 2px 4px;
  outline: 1px dashed #0066cc;
}
</style>
<div class="empty"></div>
<div class="mr" hidden>
<div class="mr-title"></div>
<div class="mr-status"></div>
<div class="mr-desc"></div>
</div>
    `;
    this._empty = this.shadowRoot.querySelector('.empty');
    this._mrEl = this.shadowRoot.querySelector('.mr');
    this._mrTitle = this.shadowRoot.querySelector('.mr-title');
    this._mrDesc = this.shadowRoot.querySelector('.mr-desc');
    this._mrStatus = this.shadowRoot.querySelector('.mr-status');
    this._record = null;
    this._isEditing = false;
    this._isSynced = false; // true if this cell is a sync mirror
  }

  connectedCallback() {
    this.setAttribute('tabindex', '0');
  }

  get record() { return this._record; }
  get isEditing() { return this._isEditing; }
  get cellIndex() { return parseInt(this.dataset.index); }

  setRecord(record, isSynced = false) {
    this._record = record;
    this._isSynced = isSynced;
    this._render();
  }

  _render() {
    if (!this._record) {
      this._empty.hidden = false;
      this._mrEl.hidden = true;
      return;
    }
    this._empty.hidden = true;
    this._mrEl.hidden = false;
    this._mrTitle.textContent = this._record.title;
    this._mrDesc.textContent = this._record.description || '';
    const status = this._record.status || 'na';
    if (status === 'na') {
      this._mrStatus.hidden = true;
    } else {
      this._mrStatus.hidden = false;
      const progress = calcProgress(this._record);
      const icon = status === 'done' ? '✅' : '🔧';
      this._mrStatus.innerHTML = `<span>${icon}</span><span>${progress}%</span>`;
    }
  }

  startInlineEdit() {
    if (!this._record) return;
    this._isEditing = true;
    const original = this._record.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-input';
    input.value = original;

    this._mrTitle.textContent = '';
    this._mrTitle.appendChild(input);
    input.focus();
    input.select();

    const finish = (save) => {
      this._isEditing = false;
      const newVal = input.value.trim();
      if (save && newVal) {
        this._record.title = newVal;
        this.dispatchEvent(new CustomEvent('cell-change', { bubbles: true }));
      }
      this._render();
      this.focus();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
      e.stopPropagation();
    });
    input.addEventListener('blur', () => finish(true));
  }
}