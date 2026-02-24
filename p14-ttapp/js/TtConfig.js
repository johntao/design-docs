import { Store, TIME_SEGMENTS, formatDate } from "./shared.js";

// ─── <tt-config> ────────────────────────────────────────────────────────────
export class TtConfig extends HTMLElement {
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
