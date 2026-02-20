export default class McSidePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
<style>
:host {
  position: relative;
  display: block;
  width: 48px;
  min-width: 48px;
  overflow: visible;
  transition: width 0.2s, min-width 0.2s;
}
:host(.collapsed) {
  width: 0;
  min-width: 0;
}
.side-buttons {
  position: absolute;
  left: -32px;
  top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
}
.side-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  line-height: 22px;
  text-align: center;
  padding: 0;
  color: #666;
}
.side-btn:hover {
  background: #f0f0f0;
}
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 4px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.panel-content button,
.panel-content select {
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
.panel-content button:hover,
.panel-content select:hover {
  background: #f5f5f5;
}
.separator {
  border: none;
  border-top: 1px solid #eee;
  margin: 2px 0;
}
.toolbar-slot {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
<div class="side-buttons">
  <button class="side-btn toggle-btn">◀</button>
  <button class="side-btn help-btn">?</button>
</div>
<div class="panel-content">
  <div class="toolbar-slot">
    <slot></slot>
  </div>
  <hr class="separator">
  <button class="btn-goal">Goal</button>
  <button class="btn-task">Task</button>
  <button class="btn-tpl">Tpl</button>
</div>
    `;
    this._expanded = true;
    this._toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
    this._helpBtn = this.shadowRoot.querySelector('.help-btn');
    this._panelContent = this.shadowRoot.querySelector('.panel-content');

    this._toggleBtn.addEventListener('click', () => this.toggle());
    this._helpBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toggle-help', { bubbles: true }));
    });

    this.shadowRoot.querySelector('.btn-goal').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('load-sample', { bubbles: true, detail: { file: 'goal-01.txt' } }));
    });
    this.shadowRoot.querySelector('.btn-task').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('load-sample', { bubbles: true, detail: { file: 'task-01.txt' } }));
    });
    this.shadowRoot.querySelector('.btn-tpl').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('load-sample', { bubbles: true, detail: { file: 'tpl-01.txt' } }));
    });
  }

  expand() {
    this._expanded = true;
    this.classList.remove('collapsed');
    this._panelContent.style.display = '';
    this._toggleBtn.textContent = '◀';
  }

  collapse() {
    this._expanded = false;
    this.classList.add('collapsed');
    this._panelContent.style.display = 'none';
    this._toggleBtn.textContent = '▶';
  }

  toggle() {
    if (this._expanded) this.collapse();
    else this.expand();
  }
}
