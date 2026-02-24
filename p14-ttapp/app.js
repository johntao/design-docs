// ─── Data Layer ─────────────────────────────────────────────────────────────

const Store = {
  _listeners: [],

  getTasks() {
    try { return JSON.parse(localStorage.getItem('tt-tasks')) || []; }
    catch { return []; }
  },
  setTasks(tasks) {
    localStorage.setItem('tt-tasks', JSON.stringify(tasks));
    this._notify();
  },

  getEntries() {
    try { return JSON.parse(localStorage.getItem('tt-entries')) || []; }
    catch { return []; }
  },
  setEntries(entries) {
    localStorage.setItem('tt-entries', JSON.stringify(entries));
    this._notify();
  },

  getCurrent() {
    try { return JSON.parse(localStorage.getItem('tt-current')); }
    catch { return null; }
  },
  setCurrent(entry) {
    localStorage.setItem('tt-current', JSON.stringify(entry));
    this._notify();
  },

  subscribe(fn) { this._listeners.push(fn); },
  _notify() { this._listeners.forEach(fn => fn()); }
};

const TIME_SEGMENTS = [
  { id: 'seg0', label: 'night',     ranges: [[0, 6], [22, 24]] },
  { id: 'seg1', label: 'morning',   ranges: [[6, 10]] },
  { id: 'seg2', label: 'midday',    ranges: [[10, 14]] },
  { id: 'seg3', label: 'afternoon', ranges: [[14, 18]] },
  { id: 'seg4', label: 'evening',   ranges: [[18, 22]] },
];

function getCurrentSegment() {
  const hour = new Date().getHours();
  return TIME_SEGMENTS.find(seg => seg.ranges.some(([s, e]) => hour >= s && hour < e));
}

function getAvailableTasks(tasks) {
  const seg = getCurrentSegment();
  if (!seg) return tasks;
  return tasks.filter(t => !t.timesegs || t.timesegs.length === 0 || t.timesegs.includes(seg.id));
}

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(epoch) {
  const d = new Date(epoch);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(epoch) {
  const d = new Date(epoch);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function truncate(str, max = 20) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}


// ─── <tt-modal> ─────────────────────────────────────────────────────────────

class TtModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: none; position: fixed; inset: 0; z-index: 1000; }
        :host([open]) { display: flex; }
        .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.25); }
        .panel {
          position: relative; margin: auto; background: #fff; border-radius: 12px;
          padding: 20px; max-width: 480px; width: 90%; max-height: 85vh; overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 1;
        }
        .close-btn {
          position: absolute; top: 10px; right: 14px; background: none; border: none;
          color: #999; font-size: 24px; cursor: pointer; line-height: 1;
        }
        .close-btn:hover { color: #333; }
      </style>
      <div class="backdrop"></div>
      <div class="panel">
        <button class="close-btn">&times;</button>
        <slot></slot>
      </div>
    `;
    this.shadowRoot.querySelector('.backdrop').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.close());
  }

  open() { this.setAttribute('open', ''); }
  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('modal-close', { bubbles: true, composed: true }));
  }

  get isOpen() { return this.hasAttribute('open'); }
}
customElements.define('tt-modal', TtModal);


// ─── <tt-help> ──────────────────────────────────────────────────────────────

class TtHelp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; color: #444; font-size: 14px; line-height: 1.6; }
        h2 { color: #d63851; margin-bottom: 12px; font-size: 18px; }
        h3 { color: #fff; background: #d63851; display: inline-block; padding: 2px 8px;
             border-radius: 4px; font-size: 13px; margin: 12px 0 6px; }
        p, li { margin-bottom: 6px; }
        ul { padding-left: 20px; }
        code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 13px; color: #333; }
      </style>
      <h2>How to Use</h2>

      <h3>Ring Menu</h3>
      <p><strong>Hold</strong> the task name area, <strong>drag</strong> to a task, then <strong>release</strong> to select it.</p>

      <h3>Start / Stop</h3>
      <ul>
        <li>Select a task first, then tap <code>▶</code> to start tracking.</li>
        <li>Tap <code>⏹</code> to stop and save the entry.</li>
      </ul>

      <h3>Merge</h3>
      <p>If you accidentally stopped and restarted the same task, tap <code>⇅</code> to merge the current session with the previous entry.</p>

      <h3>Editing Entries</h3>
      <ul>
        <li>Tap an entry in the history to edit it.</li>
        <li>Tap a time field to open the <strong>dial control</strong>.</li>
        <li>Lock a field (tap it) to keep it fixed while adjusting others.</li>
      </ul>

      <h3>Dial Control</h3>
      <ul>
        <li><strong>Time mode:</strong> Drag the hand to set hours:minutes. Crossing 12 changes the hour.</li>
        <li><strong>Duration – single tap:</strong> Additive mode. Dial delta is added/subtracted from current duration.</li>
        <li><strong>Duration – double tap:</strong> Assignment mode. Dial value replaces the duration directly.</li>
        <li>Drag to <strong>center</strong> to cancel.</li>
      </ul>

      <h3>Time Segments</h3>
      <p>Tasks can be limited to specific time segments (night, morning, midday, afternoon, evening). Only tasks matching the current segment appear in the ring menu.</p>

      <h3>Configuration</h3>
      <p>Tap <code>🔧</code> to manage predefined tasks (up to 8). Set name, time segments, and optional countdown duration.</p>

      <h3>Import / Export</h3>
      <p>Export entries as JSON for backup. Import merges entries by UUID (duplicates are skipped).</p>

      <h3>Countdown Timer</h3>
      <p>If a task has an <em>estimation duration</em>, the timer counts down instead of up. A notification fires when it reaches zero.</p>
    `;
  }
}
customElements.define('tt-help', TtHelp);


// ─── <tt-dial> ──────────────────────────────────────────────────────────────

class TtDial extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._mode = 'time';
    this._initialMinute = 0;
    this._initialHour = 0;
    this._currentStep = 0;
    this._hourAccum = 0;
    this._lastStep = 0;
    this._dragging = false;
    this._cancelled = false;
    this._pointerDown = false;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 220px; height: 220px; margin: 10px auto; user-select: none; touch-action: none; }
        svg { width: 100%; height: 100%; }
        .dial-bg { fill: #e8edf3; }
        .cancel-zone { fill: #f5f5f5; stroke: #ccc; stroke-width: 1; }
        .step-marker { fill: #bcc; }
        .step-marker.active { fill: #d63851; }
        .hand { stroke: #d63851; stroke-width: 3; stroke-linecap: round; }
        .center-text { fill: #333; font-size: 16px; font-family: monospace; text-anchor: middle; dominant-baseline: central; }
        .label-text { fill: #888; font-size: 11px; text-anchor: middle; }
        .step-label { fill: #999; font-size: 9px; text-anchor: middle; dominant-baseline: central; }
      </style>
      <svg viewBox="0 0 220 220"></svg>
    `;
    this._svg = this.shadowRoot.querySelector('svg');
    this._render();

    this._svg.addEventListener('pointerdown', e => this._onPointerDown(e));
    this._svg.addEventListener('pointermove', e => this._onPointerMove(e));
    this._svg.addEventListener('pointerup', e => this._onPointerUp(e));
    this._svg.addEventListener('pointercancel', e => this._onPointerUp(e));
  }

  configure(mode, hour, minute) {
    this._mode = mode;
    this._initialHour = hour;
    this._initialMinute = minute;
    this._hourAccum = (mode === 'duration-additive') ? 0 : hour;
    this._currentStep = Math.round(minute / 5) % 12;
    if (mode === 'duration-additive') this._currentStep = 0;
    this._lastStep = this._currentStep;
    this._cancelled = false;
    this._dragging = false;
    this._render();
  }

  _stepToAngle(step) {
    return (step * 30 - 90) * Math.PI / 180;
  }

  _angleToStep(angle) {
    let deg = angle * 180 / Math.PI + 90;
    if (deg < 0) deg += 360;
    return Math.round(deg / 30) % 12;
  }

  _getPointerAngle(e) {
    const rect = this._svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  }

  _getPointerDist(e) {
    const rect = this._svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    return Math.sqrt(dx * dx + dy * dy) / (rect.width / 2);
  }

  _onPointerDown(e) {
    this._pointerDown = true;
    this._dragging = true;
    this._cancelled = false;
    this._svg.setPointerCapture(e.pointerId);
    const angle = this._getPointerAngle(e);
    const step = this._angleToStep(angle);
    this._lastStep = this._currentStep;
    this._currentStep = step;
    this._render();
  }

  _onPointerMove(e) {
    if (!this._dragging) return;
    const dist = this._getPointerDist(e);
    if (dist < 0.25) { this._cancelled = true; this._render(); return; }
    this._cancelled = false;
    const angle = this._getPointerAngle(e);
    const step = this._angleToStep(angle);
    const diff = step - this._lastStep;
    if (diff > 6) this._hourAccum -= 1;
    else if (diff < -6) this._hourAccum += 1;
    if (this._mode === 'duration-assignment' && this._hourAccum < 0) {
      this._hourAccum = 0; this._lastStep = step; this._currentStep = step; this._render(); return;
    }
    this._lastStep = step;
    this._currentStep = step;
    this._render();
  }

  _onPointerUp(e) {
    if (!this._dragging) return;
    this._dragging = false;
    this._pointerDown = false;
    this._svg.releasePointerCapture(e.pointerId);
    if (this._cancelled) {
      this.dispatchEvent(new CustomEvent('dial-cancel', { bubbles: true, composed: true }));
      return;
    }
    const minutes = this._currentStep * 5;
    const hours = this._hourAccum;
    this.dispatchEvent(new CustomEvent('dial-commit', {
      bubbles: true, composed: true,
      detail: { mode: this._mode, hours, minutes, totalMinutes: hours * 60 + minutes }
    }));
  }

  _getDisplayValue() {
    const min = this._currentStep * 5;
    if (this._mode === 'time') {
      let h = ((this._hourAccum % 24) + 24) % 24;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    if (this._mode === 'duration-additive') {
      const sign = this._hourAccum < 0 ? '-' : '+';
      return `${sign}${Math.abs(this._hourAccum)}:${String(min).padStart(2, '0')}`;
    }
    return `${this._hourAccum}:${String(min).padStart(2, '0')}`;
  }

  _render() {
    const cx = 110, cy = 110, r = 90, cancelR = 25;
    const stepR = r - 12;

    let html = `<circle class="dial-bg" cx="${cx}" cy="${cy}" r="${r}" />`;
    html += `<circle class="cancel-zone" cx="${cx}" cy="${cy}" r="${cancelR}" opacity="${this._cancelled ? 0.8 : 0.4}" />`;

    for (let i = 0; i < 12; i++) {
      const a = this._stepToAngle(i);
      const mx = cx + stepR * Math.cos(a);
      const my = cy + stepR * Math.sin(a);
      const isActive = i === this._currentStep && !this._cancelled;
      html += `<circle class="step-marker${isActive ? ' active' : ''}" cx="${mx}" cy="${my}" r="${i % 3 === 0 ? 5 : 3}" />`;
      const lx = cx + (r - 28) * Math.cos(a);
      const ly = cy + (r - 28) * Math.sin(a);
      html += `<text class="step-label" x="${lx}" y="${ly}">${i * 5}</text>`;
    }

    if (!this._cancelled) {
      const a = this._stepToAngle(this._currentStep);
      const hx = cx + (stepR - 8) * Math.cos(a);
      const hy = cy + (stepR - 8) * Math.sin(a);
      html += `<line class="hand" x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" />`;
    }

    html += `<text class="center-text" x="${cx}" y="${cy}" dy="-4">${this._getDisplayValue()}</text>`;
    const modeLabel = this._mode === 'time' ? 'TIME' : this._mode === 'duration-additive' ? 'DURATION +/-' : 'DURATION SET';
    html += `<text class="label-text" x="${cx}" y="${cy + 18}">${modeLabel}</text>`;
    if (this._cancelled) {
      html += `<text class="label-text" x="${cx}" y="${cy + 34}" style="fill:#d63851">CANCEL</text>`;
    }
    this._svg.innerHTML = html;
  }
}
customElements.define('tt-dial', TtDial);


// ─── <tt-entry> ─────────────────────────────────────────────────────────────

class TtEntry extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._entry = null;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .row {
          display: flex; align-items: center; padding: 10px 14px; gap: 10px;
          background: #fff; border-radius: 8px; margin-bottom: 6px; cursor: pointer;
          transition: background 0.15s; border: 1px solid #e8e8e8;
        }
        .row:hover { background: #f0f4ff; }
        .task-name { flex: 1; font-weight: 600; color: #d63851; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .times { font-size: 13px; color: #888; font-family: monospace; }
        .duration { font-size: 13px; color: #2a7ab5; font-family: monospace; min-width: 60px; text-align: right; }
        .delete-btn {
          background: none; border: none; color: #bbb; font-size: 16px; cursor: pointer; padding: 2px 6px;
        }
        .delete-btn:hover { color: #d63851; }
      </style>
      <div class="row">
        <span class="task-name"></span>
        <span class="times"></span>
        <span class="duration"></span>
        <button class="delete-btn" title="Delete">✕</button>
      </div>
    `;
    this.shadowRoot.querySelector('.row').addEventListener('click', (e) => {
      if (e.target.closest('.delete-btn')) return;
      this.dispatchEvent(new CustomEvent('entry-edit', {
        bubbles: true, composed: true, detail: { uuid: this._entry?.uuid }
      }));
    });
    this.shadowRoot.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('entry-delete', {
        bubbles: true, composed: true, detail: { uuid: this._entry?.uuid }
      }));
    });
  }

  set entry(val) {
    this._entry = val;
    if (!val) return;
    this.shadowRoot.querySelector('.task-name').textContent = truncate(val.taskName);
    this.shadowRoot.querySelector('.times').textContent = `${formatTime(val.startTime)} – ${formatTime(val.endTime)}`;
    this.shadowRoot.querySelector('.duration').textContent = formatDuration(val.endTime - val.startTime);
  }
}
customElements.define('tt-entry', TtEntry);


// ─── <tt-entry-edit> ────────────────────────────────────────────────────────

class TtEntryEdit extends HTMLElement {
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
customElements.define('tt-entry-edit', TtEntryEdit);


// ─── <tt-config> ────────────────────────────────────────────────────────────

class TtConfig extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._tasks = [];
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; color: #444; }
        h3 { color: #d63851; margin-bottom: 12px; font-size: 16px; }
        .task-list { margin-bottom: 16px; }
        .task-item {
          background: #f5f5f5; border-radius: 8px; padding: 10px; margin-bottom: 8px;
          border: 1px solid #e8e8e8;
        }
        .task-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
        .task-row input[type="text"] {
          flex: 1; padding: 6px 8px; background: #fff; color: #333; border: 1px solid #ddd;
          border-radius: 4px; font-size: 13px;
        }
        .task-row input[type="number"] {
          width: 70px; padding: 6px 8px; background: #fff; color: #333; border: 1px solid #ddd;
          border-radius: 4px; font-size: 13px;
        }
        .segs { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
        .segs label { font-size: 11px; display: flex; align-items: center; gap: 2px; color: #666; }
        .segs input { accent-color: #d63851; }
        button {
          padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;
        }
        .btn-remove { background: #fde8e8; color: #c02a43; }
        .btn-move { background: #e8e8e8; color: #666; font-size: 11px; padding: 4px 8px; }
        .btn-add { background: #d63851; color: #fff; margin-bottom: 16px; }
        .btn-add:disabled { background: #ddd; color: #999; }
        h4 { color: #2a7ab5; margin: 16px 0 8px; font-size: 14px; }
        .io-row { display: flex; gap: 8px; }
        .btn-io { background: #e8f0fe; color: #2a7ab5; }
        .btn-io:hover { background: #d4e4fc; }
        .btn-save-config { background: #d63851; color: #fff; width: 100%; padding: 10px; margin-top: 16px; font-size: 14px; }
        .btn-save-config:hover { background: #c02a43; }
      </style>
      <h3>Predefined Tasks</h3>
      <div class="task-list" id="task-list"></div>
      <button class="btn-add" id="btn-add">+ Add Task</button>

      <h4>Data</h4>
      <div class="io-row">
        <button class="btn-io" id="btn-export">Export Entries</button>
        <button class="btn-io" id="btn-import">Import Entries</button>
      </div>
      <input type="file" id="file-input" accept=".json" style="display:none">

      <button class="btn-save-config" id="btn-save">Save Configuration</button>
    `;

    this.shadowRoot.getElementById('btn-add').addEventListener('click', () => this._addTask());
    this.shadowRoot.getElementById('btn-export').addEventListener('click', () => this._export());
    this.shadowRoot.getElementById('btn-import').addEventListener('click', () => {
      this.shadowRoot.getElementById('file-input').click();
    });
    this.shadowRoot.getElementById('file-input').addEventListener('change', e => this._import(e));
    this.shadowRoot.getElementById('btn-save').addEventListener('click', () => this._saveConfig());
  }

  load() {
    this._tasks = Store.getTasks().map(t => ({ ...t }));
    this._renderTasks();
  }

  _renderTasks() {
    const container = this.shadowRoot.getElementById('task-list');
    container.innerHTML = '';
    this._tasks.forEach((task, i) => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.innerHTML = `
        <div class="task-row">
          <input type="text" maxlength="20" value="${task.name}" data-idx="${i}" class="name-input" placeholder="Task name">
          <input type="number" min="0" value="${task.estimationDuration || ''}" data-idx="${i}" class="est-input" placeholder="min" title="Estimation (minutes)">
          <button class="btn-move" data-dir="up" data-idx="${i}">▲</button>
          <button class="btn-move" data-dir="down" data-idx="${i}">▼</button>
          <button class="btn-remove" data-idx="${i}">✕</button>
        </div>
        <div class="segs">
          ${TIME_SEGMENTS.map(seg => `
            <label><input type="checkbox" data-idx="${i}" data-seg="${seg.id}" ${task.timesegs && task.timesegs.includes(seg.id) ? 'checked' : ''}> ${seg.label}</label>
          `).join('')}
        </div>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll('.name-input').forEach(input => {
      input.addEventListener('input', e => {
        this._tasks[+e.target.dataset.idx].name = e.target.value.slice(0, 20);
      });
    });
    container.querySelectorAll('.est-input').forEach(input => {
      input.addEventListener('input', e => {
        const val = parseInt(e.target.value);
        this._tasks[+e.target.dataset.idx].estimationDuration = isNaN(val) || val <= 0 ? null : val;
      });
    });
    container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        this._tasks.splice(+e.target.dataset.idx, 1);
        this._renderTasks();
      });
    });
    container.querySelectorAll('.btn-move').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = +e.target.dataset.idx;
        const dir = e.target.dataset.dir;
        if (dir === 'up' && idx > 0) [this._tasks[idx - 1], this._tasks[idx]] = [this._tasks[idx], this._tasks[idx - 1]];
        else if (dir === 'down' && idx < this._tasks.length - 1) [this._tasks[idx], this._tasks[idx + 1]] = [this._tasks[idx + 1], this._tasks[idx]];
        this._renderTasks();
      });
    });
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', e => {
        const idx = +e.target.dataset.idx;
        const seg = e.target.dataset.seg;
        let segs = this._tasks[idx].timesegs || [];
        if (e.target.checked) segs = [...segs, seg];
        else segs = segs.filter(s => s !== seg);
        this._tasks[idx].timesegs = segs.length > 0 ? segs : null;
      });
    });

    this.shadowRoot.getElementById('btn-add').disabled = this._tasks.length >= 8;
  }

  _addTask() {
    if (this._tasks.length >= 8) return;
    this._tasks.push({ name: '', timesegs: null, estimationDuration: null });
    this._renderTasks();
  }

  _saveConfig() {
    const valid = this._tasks.filter(t => t.name.trim());
    Store.setTasks(valid);
    this.dispatchEvent(new CustomEvent('config-saved', { bubbles: true, composed: true }));
  }

  _export() {
    const entries = Store.getEntries();
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `time-entries-${formatDate(Date.now())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  _import(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        const existing = Store.getEntries();
        const existingUuids = new Set(existing.map(e => e.uuid));
        const newEntries = imported.filter(e => e.uuid && !existingUuids.has(e.uuid));
        Store.setEntries([...existing, ...newEntries]);
        alert(`Imported ${newEntries.length} new entries (${imported.length - newEntries.length} duplicates skipped).`);
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
}
customElements.define('tt-config', TtConfig);


// ─── <tt-ring-menu> ─────────────────────────────────────────────────────────

class TtRingMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
    this._activeIndex = -1;
    this._isOpen = false;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: none; position: fixed; inset: 0; z-index: 2000; touch-action: none; user-select: none; }
        :host([open]) { display: block; }
        .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.18); }
        svg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .item-arc { fill: #fff; stroke: #ddd; stroke-width: 1; cursor: pointer; transition: fill 0.1s; }
        .item-arc.active { fill: #d63851; }
        .item-label { fill: #444; font-size: 12px; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
        .item-label.active { fill: #fff; font-weight: bold; }
        .cancel-zone { fill: #f5f5f5; stroke: #ccc; stroke-width: 1; }
        .cancel-text { fill: #999; font-size: 11px; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
        .empty-msg { fill: #888; font-size: 14px; text-anchor: middle; dominant-baseline: central; }
      </style>
      <div class="backdrop"></div>
      <svg viewBox="-160 -160 320 320" width="320" height="320"></svg>
    `;

    this._svg = this.shadowRoot.querySelector('svg');
    this.addEventListener('pointermove', e => this._onMove(e));
    this.addEventListener('pointerup', e => this._onUp(e));
    this.addEventListener('pointercancel', e => this._onUp(e));
  }

  show(items) {
    this._items = items;
    this._activeIndex = -1;
    this.setAttribute('open', '');
    this._isOpen = true;
    this._render();
  }

  hide() {
    this.removeAttribute('open');
    this._isOpen = false;
  }

  _getItemIndex(e) {
    const rect = this._svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 35) return -1;
    if (this._items.length === 0) return -1;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return Math.floor(angle / (360 / this._items.length)) % this._items.length;
  }

  _onMove(e) {
    if (!this._isOpen) return;
    this._activeIndex = this._getItemIndex(e);
    this._render();
  }

  _onUp(e) {
    if (!this._isOpen) return;
    const idx = this._getItemIndex(e);
    this.hide();
    if (idx >= 0 && idx < this._items.length) {
      this.dispatchEvent(new CustomEvent('task-selected', {
        bubbles: true, composed: true, detail: { task: this._items[idx] }
      }));
    }
  }

  _render() {
    const n = this._items.length;
    let html = `<circle class="cancel-zone" cx="0" cy="0" r="35" />`;
    html += `<text class="cancel-text" x="0" y="0">Cancel</text>`;
    if (n === 0) {
      html += `<text class="empty-msg" x="0" y="-60">No tasks for current segment</text>`;
      this._svg.innerHTML = html;
      return;
    }
    const innerR = 45, outerR = 130, labelR = 88;
    const sliceAngle = 360 / n;
    for (let i = 0; i < n; i++) {
      const startAngle = (i * sliceAngle - 90) * Math.PI / 180;
      const endAngle = ((i + 1) * sliceAngle - 90) * Math.PI / 180;
      const x1i = innerR * Math.cos(startAngle), y1i = innerR * Math.sin(startAngle);
      const x2i = innerR * Math.cos(endAngle), y2i = innerR * Math.sin(endAngle);
      const x1o = outerR * Math.cos(startAngle), y1o = outerR * Math.sin(startAngle);
      const x2o = outerR * Math.cos(endAngle), y2o = outerR * Math.sin(endAngle);
      const largeArc = sliceAngle > 180 ? 1 : 0;
      const isActive = i === this._activeIndex;
      html += `<path class="item-arc${isActive ? ' active' : ''}" d="M ${x1i} ${y1i} L ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1i} ${y1i} Z" />`;
      const midAngle = ((i + 0.5) * sliceAngle - 90) * Math.PI / 180;
      const task = this._items[i];
      const label = task.estimationDuration ? `[${task.estimationDuration}m] ${task.name}` : task.name;
      html += `<text class="item-label${isActive ? ' active' : ''}" x="${labelR * Math.cos(midAngle)}" y="${labelR * Math.sin(midAngle)}">${truncate(label)}</text>`;
    }
    this._svg.innerHTML = html;
  }
}
customElements.define('tt-ring-menu', TtRingMenu);


// ─── <tt-history> ───────────────────────────────────────────────────────────

class TtHistory extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; flex: 1; overflow-y: auto; padding: 10px 12px; }
        .empty { text-align: center; color: #aaa; padding: 40px 0; font-size: 14px; }
        .date-header { color: #2a7ab5; font-size: 12px; font-weight: 600; padding: 8px 4px 4px; margin-top: 8px; }
        .date-header:first-child { margin-top: 0; }
      </style>
      <div id="list"></div>
    `;
  }

  set entries(val) {
    const list = this.shadowRoot.getElementById('list');
    if (!val || val.length === 0) {
      list.innerHTML = '<div class="empty">No entries yet. Start tracking!</div>';
      return;
    }
    const sorted = [...val].sort((a, b) => b.startTime - a.startTime);
    list.innerHTML = '';
    let lastDate = '';
    sorted.forEach(entry => {
      const date = formatDate(entry.startTime);
      if (date !== lastDate) {
        const header = document.createElement('div');
        header.className = 'date-header';
        header.textContent = date;
        list.appendChild(header);
        lastDate = date;
      }
      const el = document.createElement('tt-entry');
      el.entry = entry;
      list.appendChild(el);
    });
  }
}
customElements.define('tt-history', TtHistory);


// ─── <tt-toolbar> (floating ⋮ menu, top-right) ─────────────────────────────

class TtToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;

    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; top: 12px; right: 12px; z-index: 500; user-select: none; }
        .kebab {
          width: 36px; height: 36px; border-radius: 50%; background: #fff; border: 1px solid #ddd;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          font-size: 20px; color: #555; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: background 0.15s;
        }
        .kebab:hover { background: #f0f0f0; }
        .menu {
          display: none; flex-direction: column; gap: 6px; margin-top: 8px;
        }
        .menu.open { display: flex; }
        .menu button {
          width: 36px; height: 36px; border-radius: 50%; background: #fff; border: 1px solid #ddd;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          font-size: 16px; color: #555; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: background 0.15s;
        }
        .menu button:hover { background: #f0f0f0; }
      </style>
      <div class="kebab" id="kebab">⋮</div>
      <div class="menu" id="menu">
        <button id="btn-config" title="Config">🔧</button>
        <button id="btn-help" title="Help">?</button>
      </div>
    `;

    this.shadowRoot.getElementById('kebab').addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggle();
    });
    this.shadowRoot.getElementById('btn-config').addEventListener('click', () => {
      this._close();
      this.dispatchEvent(new CustomEvent('open-config', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('btn-help').addEventListener('click', () => {
      this._close();
      this.dispatchEvent(new CustomEvent('open-help', { bubbles: true, composed: true }));
    });

    // Close on outside click
    this._outsideClick = () => this._close();
    document.addEventListener('click', this._outsideClick);
  }

  _toggle() {
    this._open = !this._open;
    this.shadowRoot.getElementById('menu').classList.toggle('open', this._open);
  }

  _close() {
    this._open = false;
    this.shadowRoot.getElementById('menu').classList.remove('open');
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._outsideClick);
  }
}
customElements.define('tt-toolbar', TtToolbar);


// ─── <tt-trigger-widget> (center of screen) ────────────────────────────────

class TtTriggerWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedTask = null;
    this._tracking = false;
    this._timerInterval = null;
    this._currentEntry = null;
    this._notified = false;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          z-index: 100; display: flex; flex-direction: column; align-items: center; gap: 12px;
          user-select: none;
        }
        .task-trigger {
          padding: 10px 24px; background: #fff; border: 2px solid #ddd; border-radius: 24px;
          color: #d63851; font-size: 15px; font-weight: 600; cursor: pointer;
          min-width: 120px; text-align: center; max-width: 220px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          touch-action: none; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
        }
        .task-trigger:hover { border-color: #d63851; box-shadow: 0 2px 16px rgba(214,56,81,0.15); }
        .task-trigger.tracking { border-color: #d63851; background: #fef2f2; pointer-events: none; opacity: 0.7; }
        .est-label {
          font-size: 12px; color: #999; font-family: monospace;
        }
        .est-label.hidden { display: none; }
        .timer {
          font-family: monospace; font-size: 32px; color: #333; letter-spacing: 1px;
        }
        .timer.countdown { color: #c87a00; }
        .timer.overtime { color: #d63851; }
        .controls { display: flex; gap: 10px; }
        .controls button {
          width: 44px; height: 44px; border-radius: 50%; border: 1px solid #ddd;
          background: #fff; font-size: 18px; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: background 0.15s;
        }
        .controls button:hover:not(:disabled) { background: #f0f0f0; }
        .controls button:disabled { opacity: 0.3; cursor: default; }
        .controls button.hidden { display: none; }
      </style>
      <div class="task-trigger" id="trigger">Select task…</div>
      <div class="est-label hidden" id="est-label"></div>
      <div class="timer" id="timer">00:00</div>
      <div class="controls">
        <button id="btn-toggle" title="Start" disabled>▶</button>
        <button id="btn-discard" title="Discard" class="hidden">✕</button>
        <button id="btn-merge" title="Merge" class="hidden">⇅</button>
      </div>
    `;

    this.shadowRoot.getElementById('trigger').addEventListener('pointerdown', e => {
      if (this._tracking) return; // disable when tracking
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('ring-menu-open', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('btn-toggle').addEventListener('click', () => {
      if (this._tracking) {
        this.dispatchEvent(new CustomEvent('tracking-stop', { bubbles: true, composed: true }));
      } else {
        this.dispatchEvent(new CustomEvent('tracking-start', { bubbles: true, composed: true }));
      }
    });
    this.shadowRoot.getElementById('btn-discard').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('tracking-discard', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('btn-merge').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('tracking-merge', { bubbles: true, composed: true }));
    });
  }

  set selectedTask(task) {
    this._selectedTask = task;
    const trigger = this.shadowRoot.getElementById('trigger');
    trigger.textContent = task ? truncate(task.name) : 'Select task…';
    this._updateEstLabel();
    this._updateButtons();
  }

  get selectedTask() { return this._selectedTask; }

  set trackingState({ tracking, currentEntry, showMerge }) {
    this._tracking = tracking;
    this._currentEntry = currentEntry;
    this._updateButtons();

    const trigger = this.shadowRoot.getElementById('trigger');
    trigger.classList.toggle('tracking', tracking);

    const mergeBtn = this.shadowRoot.getElementById('btn-merge');
    mergeBtn.classList.toggle('hidden', !showMerge);

    const discardBtn = this.shadowRoot.getElementById('btn-discard');
    discardBtn.classList.toggle('hidden', !tracking);

    if (tracking && currentEntry) {
      this._startTimer();
    } else {
      this._stopTimer();
      this._showIdleTimer();
    }

    this._updateEstLabel();
  }

  _updateEstLabel() {
    const el = this.shadowRoot.getElementById('est-label');
    const task = this._selectedTask;
    if (task && task.estimationDuration && !this._tracking) {
      el.textContent = `est: ${task.estimationDuration}m`;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  _showIdleTimer() {
    const timer = this.shadowRoot.getElementById('timer');
    // Show estimation duration as the idle display if task has one
    const task = this._selectedTask;
    if (task && task.estimationDuration) {
      const ms = task.estimationDuration * 60000;
      timer.className = 'timer countdown';
      timer.textContent = formatDuration(ms);
    } else {
      timer.className = 'timer';
      timer.textContent = '00:00';
    }
  }

  _updateButtons() {
    const toggleBtn = this.shadowRoot.getElementById('btn-toggle');
    if (this._tracking) {
      toggleBtn.textContent = '⏹';
      toggleBtn.title = 'Stop';
      toggleBtn.disabled = false;
    } else {
      toggleBtn.textContent = '▶';
      toggleBtn.title = 'Start';
      toggleBtn.disabled = !this._selectedTask;
    }
  }

  _startTimer() {
    this._stopTimer();
    this._updateTimerDisplay();
    this._timerInterval = setInterval(() => this._updateTimerDisplay(), 1000);
  }

  _stopTimer() {
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
  }

  _updateTimerDisplay() {
    if (!this._currentEntry) return;
    const timer = this.shadowRoot.getElementById('timer');
    const tasks = Store.getTasks();
    const taskDef = tasks.find(t => t.name === this._currentEntry.taskName);
    const estMin = taskDef?.estimationDuration;
    const elapsed = Date.now() - this._currentEntry.startTime;

    if (estMin) {
      const remaining = estMin * 60000 - elapsed;
      timer.className = 'timer ' + (remaining <= 0 ? 'overtime' : 'countdown');
      timer.textContent = remaining <= 0 ? '-' + formatDuration(-remaining) : formatDuration(remaining);

      if (remaining <= 0 && remaining > -1100 && !this._notified) {
        this._notified = true;
        this._notify(this._currentEntry.taskName, estMin);
      }
    } else {
      timer.className = 'timer';
      timer.textContent = formatDuration(elapsed);
    }
  }

  _notify(taskName, estMin) {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Time\'s up!', { body: `${taskName} — ${estMin} min elapsed` });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  disconnectedCallback() {
    this._stopTimer();
  }
}
customElements.define('tt-trigger-widget', TtTriggerWidget);


// ─── <tt-app> ───────────────────────────────────────────────────────────────

class TtApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedTask = null;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: flex; flex-direction: column; height: 100vh; width: 100%; }
      </style>
      <tt-toolbar></tt-toolbar>
      <tt-trigger-widget></tt-trigger-widget>
      <tt-history></tt-history>
      <tt-ring-menu></tt-ring-menu>
      <tt-modal id="modal-config"><tt-config></tt-config></tt-modal>
      <tt-modal id="modal-help"><tt-help></tt-help></tt-modal>
      <tt-modal id="modal-edit"><tt-entry-edit></tt-entry-edit></tt-modal>
    `;

    this._toolbar = this.shadowRoot.querySelector('tt-toolbar');
    this._trigger = this.shadowRoot.querySelector('tt-trigger-widget');
    this._history = this.shadowRoot.querySelector('tt-history');
    this._ringMenu = this.shadowRoot.querySelector('tt-ring-menu');
    this._configModal = this.shadowRoot.getElementById('modal-config');
    this._helpModal = this.shadowRoot.getElementById('modal-help');
    this._editModal = this.shadowRoot.getElementById('modal-edit');
    this._config = this.shadowRoot.querySelector('tt-config');
    this._entryEdit = this.shadowRoot.querySelector('tt-entry-edit');

    this.shadowRoot.addEventListener('ring-menu-open', () => {
      if (Store.getCurrent()) return; // block while tracking
      const available = getAvailableTasks(Store.getTasks());
      this._ringMenu.show(available);
    });

    this.shadowRoot.addEventListener('task-selected', e => {
      this._selectedTask = e.detail.task;
      this._trigger.selectedTask = this._selectedTask;
      // Auto-start tracking on task selection
      this._startTracking();
    });

    this.shadowRoot.addEventListener('tracking-start', () => this._startTracking());
    this.shadowRoot.addEventListener('tracking-stop', () => this._stopTracking());
    this.shadowRoot.addEventListener('tracking-discard', () => this._discardTracking());
    this.shadowRoot.addEventListener('tracking-merge', () => this._mergeTracking());

    this.shadowRoot.addEventListener('open-config', () => {
      this._config.load();
      this._configModal.open();
    });
    this.shadowRoot.addEventListener('open-help', () => this._helpModal.open());

    this.shadowRoot.addEventListener('config-saved', () => {
      this._configModal.close();
      this._refreshState();
    });

    this.shadowRoot.addEventListener('entry-edit', e => {
      const entry = Store.getEntries().find(en => en.uuid === e.detail.uuid);
      if (entry) {
        this._entryEdit.entry = entry;
        this._editModal.open();
      }
    });

    this.shadowRoot.addEventListener('entry-delete', e => {
      const entries = Store.getEntries().filter(en => en.uuid !== e.detail.uuid);
      Store.setEntries(entries);
      this._refreshState();
    });

    this.shadowRoot.addEventListener('entry-save', e => {
      const updated = e.detail.entry;
      const entries = Store.getEntries().map(en => en.uuid === updated.uuid ? updated : en);
      Store.setEntries(entries);
      this._editModal.close();
      this._refreshState();
    });

    this.shadowRoot.addEventListener('entry-edit-cancel', () => {
      this._editModal.close();
    });

    Store.subscribe(() => this._refreshState());

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  connectedCallback() {
    this._refreshState();
  }

  _refreshState() {
    const entries = Store.getEntries();
    const current = Store.getCurrent();

    this._history.entries = entries;

    const tracking = !!current;
    const showMerge = tracking && this._shouldShowMerge(current, entries);

    this._trigger.trackingState = { tracking, currentEntry: current, showMerge };
    this._trigger._notified = false;

    if (current && !this._selectedTask) {
      const task = Store.getTasks().find(t => t.name === current.taskName);
      if (task) {
        this._selectedTask = task;
        this._trigger.selectedTask = task;
      }
    }
  }

  _shouldShowMerge(current, entries) {
    if (!current) return false;
    const sorted = [...entries].sort((a, b) => b.startTime - a.startTime);
    const prev = sorted[0];
    return prev && prev.taskName === current.taskName;
  }

  _startTracking() {
    if (!this._selectedTask) return;
    Store.setCurrent({ taskName: this._selectedTask.name, startTime: Date.now() });
    this._trigger._notified = false;
    this._refreshState();
  }

  _stopTracking() {
    const current = Store.getCurrent();
    if (!current) return;
    const entries = Store.getEntries();
    entries.push({ uuid: crypto.randomUUID(), taskName: current.taskName, startTime: current.startTime, endTime: Date.now() });
    Store.setEntries(entries);
    Store.setCurrent(null);
    // Keep selected task loaded (don't clear this._selectedTask)
    this._refreshState();
  }

  _discardTracking() {
    Store.setCurrent(null);
    // Keep selected task loaded (don't clear this._selectedTask)
    this._refreshState();
  }

  _mergeTracking() {
    const current = Store.getCurrent();
    if (!current) return;
    const entries = Store.getEntries();
    const sorted = [...entries].sort((a, b) => b.startTime - a.startTime);
    const prev = sorted[0];
    if (prev && prev.taskName === current.taskName) {
      prev.endTime = Date.now();
      Store.setEntries(entries.map(e => e.uuid === prev.uuid ? prev : e));
      Store.setCurrent(null);
      this._refreshState();
    }
  }
}
customElements.define('tt-app', TtApp);
