import './toast-notification.js';
import './record-modal.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .main {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 12px;
      background: #fff;
    }

    .main:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    .mr-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mr-container[hidden] {
      display: none;
    }

    .mr-title {
      font-size: 16px;
      font-weight: 600;
      padding: 6px 8px;
      border: 1px solid transparent;
      border-radius: 3px;
      background: #f5f5f5;
    }

    .mr-title:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    .mr-title.editing {
      border-color: #0066cc;
      background: #fff;
    }

    .dr-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .dr-list li {
      padding: 6px 8px;
      border: 1px solid transparent;
      border-radius: 3px;
      background: #f9f9f9;
      font-size: 14px;
    }

    .dr-list li:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    .dr-list li.editing {
      border-color: #0066cc;
      background: #fff;
    }

    .empty-hint {
      color: #999;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }

    .empty-hint[hidden] {
      display: none;
    }
  </style>
  <div class="main" tabindex="0">
    <div class="mr-container" hidden>
      <div class="mr-title" tabindex="0"></div>
      <ul class="dr-list"></ul>
    </div>
    <div class="empty-hint"></div>
  </div>
  <toast-notification></toast-notification>
  <record-modal></record-modal>
`;

// Helper to get the deepest active element across shadow boundaries
function getDeepActiveElement() {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

export class CellMain extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._main = this.shadowRoot.querySelector('.main');
    this._mrContainer = this.shadowRoot.querySelector('.mr-container');
    this._mrTitle = this.shadowRoot.querySelector('.mr-title');
    this._drList = this.shadowRoot.querySelector('.dr-list');
    this._emptyHint = this.shadowRoot.querySelector('.empty-hint');
    this._toast = this.shadowRoot.querySelector('toast-notification');
    this._modal = this.shadowRoot.querySelector('record-modal');

    this._state = {
      mr: null,
      deletedMr: null,
      deletedDr: null,
      deletedDrIndex: null
    };

    this._inlineEditEl = null;
    this._inlineEditOriginal = '';
    this._focusBeforeModal = null;

    this._setupEventListeners();
  }

  connectedCallback() {
    this._render();
    this._main.focus();
  }

  _setupEventListeners() {
    this._main.addEventListener('click', (e) => this._onClick(e));

    this._modal.addEventListener('modal-close', () => {
      if (this._focusBeforeModal) {
        this._focusBeforeModal.focus();
        this._focusBeforeModal = null;
      }
    });

    this._modal.addEventListener('modal-confirm', (e) => {
      this._onModalConfirm(e.detail);
    });

    // Listen on document for keyboard events and check if focus is within this component
    document.addEventListener('keydown', (e) => this._onKeydown(e));
  }

  _isOwnElement(el) {
    return el === this._main ||
           el === this._mrTitle ||
           (el?.tagName === 'LI' && el.parentElement === this._drList);
  }

  _render() {
    if (!this._state.mr) {
      this._mrContainer.hidden = true;
      this._emptyHint.hidden = false;
      this._main.setAttribute('tabindex', '0');
      this._mrTitle.textContent = '';
      this._drList.innerHTML = '';
    } else {
      this._mrContainer.hidden = false;
      this._emptyHint.hidden = true;
      this._main.removeAttribute('tabindex');
      this._mrTitle.textContent = this._state.mr.title;
      this._renderDrList();
    }
  }

  _renderDrList() {
    this._drList.innerHTML = '';
    const displayCount = Math.min(this._state.mr.drs.length, 5);
    for (let i = 0; i < displayCount; i++) {
      const dr = this._state.mr.drs[i];
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.textContent = dr.title;
      li.dataset.index = i;
      this._drList.appendChild(li);
    }
  }

  _onClick(e) {
    if (this._inlineEditEl) return;

    if (e.target.tagName === 'LI' && e.target.parentElement === this._drList) {
      e.target.focus();
    } else if (e.target === this._mrTitle) {
      this._mrTitle.focus();
    } else if (this._state.mr) {
      this._mrTitle.focus();
    }
  }

  _onKeydown(e) {
    // Skip if modal is open (modal handles its own keyboard)
    if (this._modal.isOpen) return;

    // Get the actual focused element across shadow boundaries
    const focused = getDeepActiveElement();

    // Check if focused element belongs to this component
    if (!this._isOwnElement(focused)) return;

    // Handle inline editing mode
    if (this._inlineEditEl) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._finishInlineEdit(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this._finishInlineEdit(false);
      }
      return;
    }

    const isMainFocused = focused === this._main;
    const isMrTitleFocused = focused === this._mrTitle;
    const isDrFocused = focused?.tagName === 'LI' && focused.parentElement === this._drList;

    switch (e.key) {
      case 'u':
        e.preventDefault();
        this._focusBeforeModal = focused;
        if (!this._state.mr) {
          this._modal.open('create-mr');
        } else {
          this._modal.open('create-dr');
        }
        break;

      case 'i':
        e.preventDefault();
        if (isMrTitleFocused) {
          this._startInlineEdit(this._mrTitle);
        } else if (isDrFocused) {
          this._startInlineEdit(focused);
        }
        break;

      case 'o':
        e.preventDefault();
        this._focusBeforeModal = focused;
        if (isMrTitleFocused && this._state.mr) {
          this._modal.open('update-mr', {
            title: this._state.mr.title,
            description: this._state.mr.description,
            drs: this._state.mr.drs
          });
        } else if (isDrFocused) {
          const idx = parseInt(focused.dataset.index);
          const dr = this._state.mr.drs[idx];
          this._modal.open('update-dr', {
            title: dr.title,
            description: dr.description,
            targetIndex: idx
          });
        }
        break;

      case 'Delete':
        e.preventDefault();
        if ((isMainFocused || isMrTitleFocused) && this._state.mr) {
          this._deleteMr();
        } else if (isDrFocused) {
          const idx = parseInt(focused.dataset.index);
          this._deleteDr(idx);
        }
        break;

      case 'n':
        e.preventDefault();
        if (this._state.mr && (isMrTitleFocused || isDrFocused)) {
          const focusIndex = isDrFocused ? parseInt(focused.dataset.index) : -1;
          this._rotateUp();
          if (isMrTitleFocused) {
            this._mrTitle.focus();
          } else if (focusIndex >= 0 && this._drList.children[focusIndex]) {
            this._drList.children[focusIndex].focus();
          }
        }
        break;

      case 'm':
        e.preventDefault();
        if (this._state.mr && (isMrTitleFocused || isDrFocused)) {
          const focusIndex = isDrFocused ? parseInt(focused.dataset.index) : -1;
          this._rotateDown();
          if (isMrTitleFocused) {
            this._mrTitle.focus();
          } else if (focusIndex >= 0 && this._drList.children[focusIndex]) {
            this._drList.children[focusIndex].focus();
          }
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isDrFocused) {
          const idx = parseInt(focused.dataset.index);
          if (idx === 0) {
            this._mrTitle.focus();
          } else {
            this._drList.children[idx - 1].focus();
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (isMrTitleFocused && this._drList.children.length > 0) {
          this._drList.children[0].focus();
        } else if (isDrFocused) {
          const idx = parseInt(focused.dataset.index);
          if (idx < this._drList.children.length - 1) {
            this._drList.children[idx + 1].focus();
          }
        }
        break;
    }
  }

  _onModalConfirm(detail) {
    const { mode, title, description, targetIndex, drOrder } = detail;

    if (mode === 'create-mr') {
      this._state.mr = { title, description, drs: [] };
      this._render();
      this._mrTitle.focus();
    } else if (mode === 'create-dr') {
      this._state.mr.drs.push({ title, description });
      this._render();
      const lastIndex = Math.min(this._state.mr.drs.length, 5) - 1;
      const lastDr = this._drList.children[lastIndex];
      if (lastDr) lastDr.focus();
      else this._mrTitle.focus();
    } else if (mode === 'update-mr') {
      this._state.mr.title = title;
      this._state.mr.description = description;
      if (drOrder && drOrder.length > 0) {
        const newDrs = drOrder.map(i => this._state.mr.drs[i]);
        this._state.mr.drs = newDrs;
      }
      this._render();
      this._mrTitle.focus();
    } else if (mode === 'update-dr') {
      this._state.mr.drs[targetIndex].title = title;
      this._state.mr.drs[targetIndex].description = description;
      this._render();
      if (targetIndex < 5 && this._drList.children[targetIndex]) {
        this._drList.children[targetIndex].focus();
      } else {
        this._mrTitle.focus();
      }
    }

    this._focusBeforeModal = null;
  }

  _startInlineEdit(el) {
    if (this._inlineEditEl) return;
    this._inlineEditEl = el;
    this._inlineEditOriginal = el.textContent;
    el.contentEditable = 'true';
    el.classList.add('editing');
    el.focus();

    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  _finishInlineEdit(save) {
    if (!this._inlineEditEl) return;
    const el = this._inlineEditEl;
    const newVal = el.textContent.trim();

    if (save && newVal) {
      if (el === this._mrTitle) {
        this._state.mr.title = newVal;
      } else if (el.parentElement === this._drList) {
        const idx = parseInt(el.dataset.index);
        this._state.mr.drs[idx].title = newVal;
      }
    } else {
      el.textContent = this._inlineEditOriginal;
    }

    el.contentEditable = 'false';
    el.classList.remove('editing');
    this._inlineEditEl = null;
    this._inlineEditOriginal = '';
    el.focus();
  }

  _deleteMr() {
    if (!this._state.mr) return;
    this._state.deletedMr = JSON.parse(JSON.stringify(this._state.mr));
    this._state.mr = null;
    this._render();
    this._main.focus();

    this._toast.show('Master record deleted', () => {
      this._state.mr = this._state.deletedMr;
      this._state.deletedMr = null;
      this._render();
      this._mrTitle.focus();
    });
  }

  _deleteDr(index) {
    this._state.deletedDr = this._state.mr.drs[index];
    this._state.deletedDrIndex = index;
    this._state.mr.drs.splice(index, 1);
    this._render();

    if (this._state.mr.drs.length === 0) {
      this._mrTitle.focus();
    } else if (index < this._state.mr.drs.length && index < 5) {
      this._drList.children[index].focus();
    } else if (this._drList.children.length > 0) {
      this._drList.children[this._drList.children.length - 1].focus();
    } else {
      this._mrTitle.focus();
    }

    this._toast.show('Detail record deleted', () => {
      this._state.mr.drs.splice(this._state.deletedDrIndex, 0, this._state.deletedDr);
      this._state.deletedDr = null;
      this._state.deletedDrIndex = null;
      this._render();
    });
  }

  _rotateUp() {
    if (!this._state.mr || this._state.mr.drs.length <= 1) return;
    const last = this._state.mr.drs.pop();
    this._state.mr.drs.unshift(last);
    this._render();
  }

  _rotateDown() {
    if (!this._state.mr || this._state.mr.drs.length <= 1) return;
    const first = this._state.mr.drs.shift();
    this._state.mr.drs.push(first);
    const first2 = this._state.mr.drs.shift();
    this._state.mr.drs.push(first2);
    this._render();
  }
}

customElements.define('cell-main', CellMain);
