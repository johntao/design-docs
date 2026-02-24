import { Store, truncate, formatTime, formatDuration } from "./shared.js";

// ─── <tt-entry-edit> ────────────────────────────────────────────────────────
export class TtEntryEdit extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._entry = null;
    this._draft = null;
    this._locked = 'start';
    this._dialTarget = null;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; color: #444; }
        h3 { color: #d63851; margin-bottom: 14px; font-size: 16px; }
        .field { margin-bottom: 12px; }
        label { display: block; font-size: 12px; color: #888; margin-bottom: 4px; }
        select { width: 100%; padding: 8px; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        .temporal { display: flex; gap: 10px; margin-bottom: 10px; }
        .time-field {
          flex: 1; text-align: center; padding: 10px 6px; background: #f5f5f5; border-radius: 8px;
          cursor: pointer; transition: background 0.15s; position: relative; border: 1px solid #e0e0e0;
        }
        .time-field:hover { background: #eef2ff; }
        .time-field.active { outline: 2px solid #d63851; }
        .time-field .val { font-size: 18px; font-family: monospace; color: #333; }
        .time-field .lbl { font-size: 11px; color: #888; }
        .lock-icon { position: absolute; top: 4px; right: 6px; font-size: 10px; color: #d63851; }
        .dial-container { min-height: 0; overflow: hidden; transition: min-height 0.2s; }
        .dial-container.open { min-height: 240px; }
        .actions { display: flex; gap: 10px; margin-top: 14px; }
        .actions button {
          flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;
        }
        .btn-save { background: #d63851; color: #fff; }
        .btn-save:hover { background: #c02a43; }
        .btn-cancel { background: #e8e8e8; color: #666; }
        .btn-cancel:hover { background: #ddd; }
      </style>
      <h3>Edit Entry</h3>
      <div class="field">
        <label>Task</label>
        <select class="task-select"></select>
      </div>
      <div class="temporal">
        <div class="time-field" data-field="start">
          <span class="lock-icon">🔒</span>
          <div class="val" id="start-val">--:--</div>
          <div class="lbl">Start</div>
        </div>
        <div class="time-field" data-field="end">
          <span class="lock-icon" style="display:none">🔒</span>
          <div class="val" id="end-val">--:--</div>
          <div class="lbl">End</div>
        </div>
        <div class="time-field" data-field="duration">
          <div class="val" id="dur-val">--:--</div>
          <div class="lbl">Duration</div>
        </div>
      </div>
      <div class="dial-container" id="dial-container">
        <tt-dial></tt-dial>
      </div>
      <div class="actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-save">Save</button>
      </div>
    `;

    this._dial = this.shadowRoot.querySelector('tt-dial');
    this._dialContainer = this.shadowRoot.getElementById('dial-container');

    this.shadowRoot.querySelectorAll('.time-field').forEach(el => {
      el.addEventListener('click', () => this._onFieldTap(el.dataset.field));
    });
    this.shadowRoot.querySelector('[data-field="duration"]').addEventListener('dblclick', () => {
      this._onFieldDoubleTap();
    });

    this._dial.addEventListener('dial-commit', e => this._onDialCommit(e.detail));
    this._dial.addEventListener('dial-cancel', () => this._closeDial());

    this.shadowRoot.querySelector('.btn-save').addEventListener('click', () => this._save());
    this.shadowRoot.querySelector('.btn-cancel').addEventListener('click', () => this._cancel());
  }

  set entry(val) {
    this._entry = val;
    this._draft = { ...val };
    this._locked = 'start';
    this._dialTarget = null;
    this._closeDial();
    this._updateFields();
    this._populateTaskSelect();
  }

  _populateTaskSelect() {
    const sel = this.shadowRoot.querySelector('.task-select');
    const tasks = Store.getTasks();
    sel.innerHTML = tasks.map(t => `<option value="${t.name}" ${t.name === this._draft.taskName ? 'selected' : ''}>${truncate(t.name)}</option>`).join('');
    if (!tasks.find(t => t.name === this._draft.taskName)) {
      sel.innerHTML = `<option value="${this._draft.taskName}" selected>${truncate(this._draft.taskName)}</option>` + sel.innerHTML;
    }
    sel.onchange = () => { this._draft.taskName = sel.value; };
  }

  _updateFields() {
    if (!this._draft) return;
    this.shadowRoot.getElementById('start-val').textContent = formatTime(this._draft.startTime);
    this.shadowRoot.getElementById('end-val').textContent = formatTime(this._draft.endTime);
    this.shadowRoot.getElementById('dur-val').textContent = formatDuration(this._draft.endTime - this._draft.startTime);
    this.shadowRoot.querySelector('[data-field="start"] .lock-icon').style.display = this._locked === 'start' ? '' : 'none';
    this.shadowRoot.querySelector('[data-field="end"] .lock-icon').style.display = this._locked === 'end' ? '' : 'none';
    this.shadowRoot.querySelectorAll('.time-field').forEach(el => el.classList.remove('active'));
    if (this._dialTarget) {
      this.shadowRoot.querySelector(`[data-field="${this._dialTarget}"]`)?.classList.add('active');
    }
  }

  _onFieldTap(field) {
    if (field === 'start') {
      this._locked = 'start';
      this._dialTarget = 'start';
      const d = new Date(this._draft.startTime);
      this._dial.configure('time', d.getHours(), d.getMinutes());
    } else if (field === 'end') {
      this._locked = 'end';
      this._dialTarget = 'end';
      const d = new Date(this._draft.endTime);
      this._dial.configure('time', d.getHours(), d.getMinutes());
    } else if (field === 'duration') {
      this._dialTarget = 'duration';
      this._dial.configure('duration-additive', 0, 0);
    }
    this._dialContainer.classList.add('open');
    this._updateFields();
  }

  _onFieldDoubleTap() {
    this._dialTarget = 'duration';
    const dur = this._draft.endTime - this._draft.startTime;
    const totalMin = Math.floor(dur / 60000);
    this._dial.configure('duration-assignment', Math.floor(totalMin / 60), totalMin % 60);
    this._dialContainer.classList.add('open');
    this._updateFields();
  }

  _closeDial() {
    this._dialContainer.classList.remove('open');
    this._dialTarget = null;
    this._updateFields();
  }

  _onDialCommit(detail) {
    const { mode, hours, minutes, totalMinutes } = detail;

    if (this._dialTarget === 'start' || this._dialTarget === 'end') {
      let h = ((hours % 24) + 24) % 24;
      const target = this._dialTarget === 'start' ? 'startTime' : 'endTime';
      const d = new Date(this._draft[target]);
      d.setHours(h, minutes, 0, 0);
      const newTime = d.getTime();
      if (target === 'startTime' && newTime >= this._draft.endTime) { this._closeDial(); return; }
      if (target === 'endTime' && newTime <= this._draft.startTime) { this._closeDial(); return; }
      this._draft[target] = newTime;
    } else if (this._dialTarget === 'duration') {
      const deltaMs = totalMinutes * 60000;
      if (mode === 'duration-additive') {
        const newDur = (this._draft.endTime - this._draft.startTime) + deltaMs;
        if (newDur <= 0) { this._closeDial(); return; }
        if (this._locked === 'start') this._draft.endTime = this._draft.startTime + newDur;
        else this._draft.startTime = this._draft.endTime - newDur;
      } else {
        if (deltaMs <= 0) { this._closeDial(); return; }
        if (this._locked === 'start') this._draft.endTime = this._draft.startTime + deltaMs;
        else this._draft.startTime = this._draft.endTime - deltaMs;
      }
    }
    this._closeDial();
    this._updateFields();
  }

  _save() {
    this.dispatchEvent(new CustomEvent('entry-save', {
      bubbles: true, composed: true, detail: { entry: { ...this._draft } }
    }));
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('entry-edit-cancel', { bubbles: true, composed: true }));
  }
}
