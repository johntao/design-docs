import { Store } from "./shared.js";

// ─── <tt-toolbar> (fixed top bar) ───────────────────────────────────────────
export class TtToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
:host {
  user-select: none; background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  display: block;
  overflow: scroll;
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000;
}
:host(.dock-right) {
  border-bottom: none;
  border-left: 1px solid #e8e8e8;
  box-shadow: -1px 0 4px rgba(0,0,0,0.04);
  top: 0; bottom: 0; right: 0;
  left: auto;
  width: 44px;
  overflow-y: auto; overflow-x: hidden;
}
.bar {
  display: flex; align-items: center; padding: 6px 12px; gap: 6px;
}
:host(.dock-right) .bar {
  flex-direction: column; padding: 12px 6px;
}
.tabs { display: flex; gap: 4px; flex: 1; }
:host(.dock-right) .tabs {
  flex-direction: column; flex: 0;
}
.tabs button {
  width: 32px; height: 32px; border-radius: 6px; background: #f5f5f5;
  border: 1px solid #ddd; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 13px; font-weight: 600; color: #555;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.tabs button:hover { background: #eef2ff; }
.tabs button.active { background: #d63851; color: #fff; border-color: #d63851; }
.actions { display: flex; gap: 4px; }
:host(.dock-right) .actions {
  flex-direction: column;
}
.actions button {
  width: 32px; height: 32px; border-radius: 6px; background: #f5f5f5;
  border: 1px solid #ddd; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 15px; color: #555;
  transition: background 0.15s;
}
.actions button:hover { background: #eef2ff; }
      </style>
      <div class="bar">
        <div class="tabs" id="tabs"></div>
        <div class="actions">
          <button id="btn-config" title="Config">🔧</button>
          <button id="btn-help" title="Help">?</button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('btn-config').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-config', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('btn-help').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-help', { bubbles: true, composed: true }));
    });

    Store.subscribe(() => this._renderTabs());

    this._updateDock = () => {
      const shortSide = Math.min(window.innerWidth, window.innerHeight);
      const isLandscape = window.innerWidth > window.innerHeight;
      if (shortSide <= 768 && isLandscape) {
        this.classList.add('dock-right');
      } else {
        this.classList.remove('dock-right');
      }
    };
  }

  connectedCallback() {
    this._renderTabs();
    this._updateDock();
    window.addEventListener('resize', this._updateDock);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._updateDock);
  }

  _renderTabs() {
    const tabsEl = this.shadowRoot.getElementById('tabs');
    // const tasksets = Store.getTasksets();
    const tasksets = [
  {
    "description": "hello world",
    "tasks": [
      {
        "uuid": "7b254869-2a61-4384-8991-12c5a6b3ad9e",
        "name": "賣肝",
        "estimationDuration": null
      },
      {
        "uuid": "e4cc357d-f013-4784-af00-5fd8133032ac",
        "name": "專案開發",
        "estimationDuration": 50
      },
      {
        "uuid": "acc9169f-19b3-46a8-ba2c-3f52cb3ace71",
        "name": "通勤",
        "estimationDuration": null
      },
      {
        "uuid": "382503b7-776c-491d-a20f-d9d29d478a24",
        "name": "讀書",
        "estimationDuration": 30
      },
      {
        "uuid": "dfa60d74-0f36-466d-b769-ebda47b3cf57",
        "name": "英文學習",
        "estimationDuration": null
      }
    ]
  },
  {
    "description": "qqq",
    "tasks": [
      {
        "uuid": "2509b02e-df4b-45e5-9c51-630740e3a123",
        "name": "www",
        "estimationDuration": null
      },
      {
        "uuid": "cdf65287-4772-48f9-83ce-556a34fd22ab",
        "name": "eee",
        "estimationDuration": null
      },
      {
        "uuid": "f0531319-1991-4968-b72a-09900dfa9a25",
        "name": "aaa",
        "estimationDuration": null
      },
      {
        "uuid": "f60ecfdc-2424-4563-9c98-d13234c2cfb3",
        "name": "sss",
        "estimationDuration": null
      }
    ]
  },
  {
    "description": "qqq",
    "tasks": [
      {
        "uuid": "2509b02e-df4b-45e5-9c51-630740e3a123",
        "name": "www",
        "estimationDuration": null
      },
      {
        "uuid": "cdf65287-4772-48f9-83ce-556a34fd22ab",
        "name": "eee",
        "estimationDuration": null
      },
      {
        "uuid": "f0531319-1991-4968-b72a-09900dfa9a25",
        "name": "aaa",
        "estimationDuration": null
      },
      {
        "uuid": "f60ecfdc-2424-4563-9c98-d13234c2cfb3",
        "name": "sss",
        "estimationDuration": null
      }
    ]
  },
  {
    "description": "qqq",
    "tasks": [
      {
        "uuid": "2509b02e-df4b-45e5-9c51-630740e3a123",
        "name": "www",
        "estimationDuration": null
      },
      {
        "uuid": "cdf65287-4772-48f9-83ce-556a34fd22ab",
        "name": "eee",
        "estimationDuration": null
      },
      {
        "uuid": "f0531319-1991-4968-b72a-09900dfa9a25",
        "name": "aaa",
        "estimationDuration": null
      },
      {
        "uuid": "f60ecfdc-2424-4563-9c98-d13234c2cfb3",
        "name": "sss",
        "estimationDuration": null
      }
    ]
  },
  {
    "description": "qqq",
    "tasks": [
      {
        "uuid": "2509b02e-df4b-45e5-9c51-630740e3a123",
        "name": "www",
        "estimationDuration": null
      },
      {
        "uuid": "cdf65287-4772-48f9-83ce-556a34fd22ab",
        "name": "eee",
        "estimationDuration": null
      },
      {
        "uuid": "f0531319-1991-4968-b72a-09900dfa9a25",
        "name": "aaa",
        "estimationDuration": null
      },
      {
        "uuid": "f60ecfdc-2424-4563-9c98-d13234c2cfb3",
        "name": "sss",
        "estimationDuration": null
      }
    ]
  },
  {
    "description": "qqq",
    "tasks": [
      {
        "uuid": "2509b02e-df4b-45e5-9c51-630740e3a123",
        "name": "www",
        "estimationDuration": null
      },
      {
        "uuid": "cdf65287-4772-48f9-83ce-556a34fd22ab",
        "name": "eee",
        "estimationDuration": null
      },
      {
        "uuid": "f0531319-1991-4968-b72a-09900dfa9a25",
        "name": "aaa",
        "estimationDuration": null
      },
      {
        "uuid": "f60ecfdc-2424-4563-9c98-d13234c2cfb3",
        "name": "sss",
        "estimationDuration": null
      }
    ]
  },
  {
    "description": "qqq",
    "tasks": [
      {
        "uuid": "2509b02e-df4b-45e5-9c51-630740e3a123",
        "name": "www",
        "estimationDuration": null
      },
      {
        "uuid": "cdf65287-4772-48f9-83ce-556a34fd22ab",
        "name": "eee",
        "estimationDuration": null
      },
      {
        "uuid": "f0531319-1991-4968-b72a-09900dfa9a25",
        "name": "aaa",
        "estimationDuration": null
      },
      {
        "uuid": "f60ecfdc-2424-4563-9c98-d13234c2cfb3",
        "name": "sss",
        "estimationDuration": null
      }
    ]
  },
  {
    "description": "hello world",
    "tasks": [
      {
        "uuid": "a71ab101-1abb-44ee-81f8-3cacea440f10",
        "name": "賣肝",
        "estimationDuration": null
      },
      {
        "uuid": "2dd4a219-7337-443e-9195-68d1a6b1031c",
        "name": "專案開發",
        "estimationDuration": 50
      },
      {
        "uuid": "8f99ac69-7d32-4ff4-9ea5-d6fbf871253b",
        "name": "通勤",
        "estimationDuration": null
      },
      {
        "uuid": "7634d04d-678d-4f87-ba63-b60772d09fb7",
        "name": "讀書",
        "estimationDuration": 30
      },
      {
        "uuid": "9bd7679b-4197-492c-8c86-992c111f7d93",
        "name": "英文學習",
        "estimationDuration": null
      },
      {
        "uuid": "31d066b6-7166-43dc-9b5b-87068940c0bc",
        "name": "test",
        "estimationDuration": 1
      }
    ]
  }
];
    console.log(tasksets);
    const activeTab = Store.getActiveTab();
    tabsEl.innerHTML = '';
    tasksets.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.textContent = i + 1;
      if (i === activeTab) btn.classList.add('active');
      btn.addEventListener('click', () => {
        Store.setActiveTab(i);
        this._renderTabs();
      });
      tabsEl.appendChild(btn);
    });
  }
}
