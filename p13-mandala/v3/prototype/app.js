// Note-Taking App Prototype

// Debug flag - set to true to highlight active panel
const DEBUG_PANEL_HIGHLIGHT = true;

// App State
const state = {
    currentTab: null,
    currentNavNode: null, // current node being viewed in canvas (for nav-into/nav-up)
    activePanel: null,    // 'left' | 'midTab' | 'midCanvas' | 'right'
    focus: {
        left: null,      // focused TypeA id
        midTab: null,    // focused tab id
        midCanvas: null, // focused element: { type: 'subcell'|'typeB2', maincell?, subcell?, nodeId?, id? }
        right: null      // focused TypeC id
    },
    // Track local navigation within each maincell (for zoom-in without changing global view)
    // { maincellIndex: nodeId } - the node being viewed as center in that maincell
    subNavState: {}
};

// DOM Elements
const elements = {
    panelLeft: null,
    panelMid: null,
    tabBar: null,
    canvas: null,
    panelRight: null,
    typeAList: null,
    typeBTabs: null,
    typeCList: null,
    modalOverlay: null,
    modal: null,
    modalTitle: null,
    modalBody: null,
    modalFooter: null,
    toastContainer: null
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupAddButtons();
    setupKeyboardHandlers();
    renderTypeAList();
    renderTypeBTabs();
    renderTypeCList();

    // Set initial tab
    if (DATA.typeB.length > 0) {
        selectTab(DATA.typeB[0].id);
    }

    // Set initial focus for all panels
    initializeAllPanelFocus();

    console.log('Note-Taking App Prototype initialized');
});

// Initialize focus for all panels so each has at least one focused element
function initializeAllPanelFocus() {
    // Left panel - focus first TypeA
    if (DATA.typeA.length > 0 && !state.focus.left) {
        state.focus.left = DATA.typeA[0].id;
    }

    // Mid tab - focus first TypeB (and current tab)
    if (DATA.typeB.length > 0 && !state.focus.midTab) {
        state.focus.midTab = DATA.typeB[0].id;
    }

    // Right panel - focus first TypeC
    if (DATA.typeC.length > 0 && !state.focus.right) {
        state.focus.right = DATA.typeC[0].id;
    }

    // Mid canvas - will be set after canvas renders
    // Set default to first occupied subcell if exists
    setTimeout(() => {
        if (!state.focus.midCanvas) {
            const firstOccupied = document.querySelector('.subcell.occupied');
            if (firstOccupied) {
                const maincell = firstOccupied.closest('.maincell');
                const nodeId = firstOccupied.dataset.nodeId;
                state.focus.midCanvas = {
                    type: 'subcell',
                    nodeId: nodeId,
                    maincell: maincell.dataset.maincell,
                    subcell: firstOccupied.dataset.subcell
                };
            }
        }
        updateFocusVisuals();
    }, 0);

    // Set initial active panel
    if (!state.activePanel) {
        state.activePanel = 'midCanvas';
    }

    updateFocusVisuals();
}

// Initialize DOM element references
function initializeElements() {
    elements.panelLeft = document.querySelector('.panel-left');
    elements.panelMid = document.querySelector('.panel-mid');
    elements.tabBar = document.querySelector('.tab-bar');
    elements.canvas = document.getElementById('canvas');
    elements.panelRight = document.querySelector('.panel-right');
    elements.typeAList = document.getElementById('typeA-list');
    elements.typeBTabs = document.getElementById('typeB-tabs');
    elements.typeCList = document.getElementById('typeC-list');
    elements.modalOverlay = document.getElementById('modal-overlay');
    elements.modal = document.getElementById('modal');
    elements.modalTitle = document.getElementById('modal-title');
    elements.modalBody = document.getElementById('modal-body');
    elements.modalFooter = document.getElementById('modal-footer');
    elements.toastContainer = document.getElementById('toast-container');
}

// ==================== TypeA Rendering ====================

function renderTypeAList() {
    elements.typeAList.innerHTML = '';

    DATA.typeA.forEach(item => {
        const usageCount = getTypeAUsageCount(item.id);
        const div = document.createElement('div');
        div.className = 'list-item';
        div.dataset.id = item.id;
        div.dataset.type = 'typeA';
        div.innerHTML = `
            <div class="title">${escapeHtml(item.title)}</div>
            <div class="usage-count">Used: ${usageCount}</div>
        `;
        div.addEventListener('click', (e) => handleTypeAClick(e, item.id));
        div.addEventListener('dblclick', (e) => handleTypeADoubleClick(e, item));
        elements.typeAList.appendChild(div);
    });
}

function getTypeAUsageCount(typeAId) {
    let count = 0;
    Object.keys(DATA.typeB1).forEach(typeBId => {
        const tree = DATA.typeB1[typeBId];
        Object.keys(tree).forEach(nodeId => {
            if (tree[nodeId].typeAId === typeAId) {
                count++;
            }
        });
    });
    return count;
}

function handleTypeAClick(e, id) {
    e.stopPropagation();
    setFocus('left', id);
}

function handleTypeADoubleClick(e, item) {
    e.stopPropagation();
    openModal('typeA', 'update', item);
}

// ==================== TypeB Tabs Rendering ====================

function renderTypeBTabs() {
    elements.typeBTabs.innerHTML = '';

    DATA.typeB.forEach(item => {
        const div = document.createElement('div');
        div.className = 'tab-item';
        div.dataset.id = item.id;
        div.dataset.type = 'typeB';
        div.textContent = item.title;
        div.addEventListener('click', (e) => handleTypeBTabClick(e, item.id));
        div.addEventListener('dblclick', (e) => handleTypeBDoubleClick(e, item));
        elements.typeBTabs.appendChild(div);
    });
}

function handleTypeBTabClick(e, id) {
    e.stopPropagation();
    setFocus('midTab', id);
}

function handleTypeBDoubleClick(e, item) {
    e.stopPropagation();
    openModal('typeB', 'update', item);
}

function selectTab(typeBId) {
    state.currentTab = typeBId;
    state.currentNavNode = 'root';
    state.subNavState = {};  // Clear local nav states when changing tabs

    renderCanvas();
}

// ==================== TypeC Rendering ====================

function renderTypeCList() {
    elements.typeCList.innerHTML = '';

    DATA.typeC.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.dataset.id = item.id;
        div.dataset.type = 'typeC';
        div.innerHTML = `
            <div class="title">${escapeHtml(item.title)}</div>
        `;
        div.addEventListener('click', (e) => handleTypeCClick(e, item.id));
        div.addEventListener('dblclick', (e) => handleTypeCDoubleClick(e, item));
        elements.typeCList.appendChild(div);
    });
}

function handleTypeCClick(e, id) {
    e.stopPropagation();
    setFocus('right', id);
}

function handleTypeCDoubleClick(e, item) {
    e.stopPropagation();
    openModal('typeC', 'update', item);
}

// ==================== Canvas Rendering ====================

function renderCanvas() {
    if (!state.currentTab) return;

    const tree = DATA.typeB1[state.currentTab];
    if (!tree) return;

    const currentNode = tree[state.currentNavNode];
    if (!currentNode) return;

    // Clear all subcells first and remove old event listeners by cloning
    document.querySelectorAll('.subcell').forEach(cell => {
        const newCell = cell.cloneNode(false);
        newCell.innerHTML = '';
        newCell.classList.remove('occupied');
        newCell.dataset.nodeId = '';
        newCell.dataset.subcell = cell.dataset.subcell;
        cell.parentNode.replaceChild(newCell, cell);
    });

    // Get children of current node (max 8 for surrounding positions)
    const children = currentNode.children.slice(0, 8);

    // Layout: children around the center in 3x3 subgrids
    const maincells = document.querySelectorAll('.maincell');

    // Distribute children across maincells (max 9)
    children.forEach((childId, index) => {
        if (index >= 9) return;

        const childNode = tree[childId];
        if (!childNode) return;

        const maincell = maincells[index];
        if (!maincell) return;

        const subgrid = maincell.querySelector('.subgrid');
        const subcells = subgrid.querySelectorAll('.subcell');

        // Check if this maincell has a local nav state (zoomed in)
        const localNavNodeId = state.subNavState[index];
        if (localNavNodeId && tree[localNavNodeId]) {
            // Render the zoomed-in node as center with its children
            renderNodeInSubgrid(tree[localNavNodeId], tree, subcells, index);
        } else {
            // Render the default node and its children in the subgrid
            renderNodeInSubgrid(childNode, tree, subcells, index);
        }
    });

    // Add click handlers to all subcells (including empty ones)
    addSubcellClickHandlers();
}

function renderNodeInSubgrid(node, tree, subcells, maincellIndex) {
    // Center cell (index 4) for the parent node
    const centerCell = subcells[4];
    renderTypeB1InCell(node, centerCell, true, maincellIndex); // isCenter = true

    // Get children (max 8 for surrounding positions)
    const childIds = node.children.slice(0, 8);

    // Position indices around center (0-3, 5-8 excluding center 4)
    const positions = [0, 1, 2, 3, 5, 6, 7, 8];

    childIds.forEach((childId, index) => {
        const childNode = tree[childId];
        if (!childNode) return;

        const cell = subcells[positions[index]];
        if (!cell) return;

        renderTypeB1InCell(childNode, cell, false, maincellIndex); // isCenter = false
    });
}

// Add click handlers to all subcells (including empty ones)
function addSubcellClickHandlers() {
    document.querySelectorAll('.subcell').forEach(cell => {
        const maincell = cell.closest('.maincell');
        const maincellIndex = maincell.dataset.maincell;
        const subcellIndex = cell.dataset.subcell;
        const nodeId = cell.dataset.nodeId || null;

        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            setFocus('midCanvas', {
                type: 'subcell',
                nodeId: nodeId,
                maincell: maincellIndex,
                subcell: subcellIndex
            });
        });
    });
}

function renderTypeB1InCell(node, cell, isCenter = false, maincellIndex = null) {
    const typeA = DATA.typeA.find(a => a.id === node.typeAId);
    const title = typeA ? typeA.title : node.typeAId;

    cell.classList.add('occupied');
    cell.dataset.nodeId = node.id;

    // Create TypeB1 entity element
    const entityDiv = document.createElement('div');
    entityDiv.className = 'typeB1-entity';
    entityDiv.dataset.nodeId = node.id;

    // Build title and indicators
    let titleHtml = '';

    // Add nav indicators
    const hasChildren = node.children && node.children.length > 0;
    const hasParent = node.parentId && node.parentId !== 'root';

    // [+] only shows on NON-center nodes with children (center is already expanded)
    // [^] only shows on center nodes that have a parent to go up to
    const showNavIn = hasChildren && !isCenter;
    const showNavUp = isCenter && hasParent;

    const txt = escapeHtml(title);
    if (showNavIn || showNavUp) {
        let indicatorHtml = '';
        if (showNavIn) {
            indicatorHtml = `<span class="nav-in" title="Nav In (Enter)">[+]</span>`;
        }
        if (showNavUp) {
            indicatorHtml = `<span class="nav-up" title="Nav Up (Backspace)">[^]</span>`;
        }
        titleHtml = `<div class="title" title="${txt}">${indicatorHtml}${txt}</div>`;
    } else {
        titleHtml = `<div class="title" title="${txt}">${txt}</div>`;
    }

    entityDiv.innerHTML = titleHtml;

    // Add TypeB2 container if there are any
    const typeB2List = getTypeB2ForNode(state.currentTab, node.id);
    if (typeB2List.length > 0) {
        const b2Container = document.createElement('div');
        b2Container.className = 'typeB2-container';

        typeB2List.slice(0, 9).forEach(b2 => {
            const b2Div = document.createElement('div');
            b2Div.className = 'typeB2-entity';
            b2Div.dataset.id = b2.id;
            b2Div.dataset.type = 'typeB2';
            b2Div.style.backgroundColor = b2.color;
            b2Div.textContent = b2.char;
            b2Div.title = getTypeCTitle(b2.typeCId);
            b2Div.addEventListener('click', (e) => handleTypeB2Click(e, b2.id, node.id));
            b2Container.appendChild(b2Div);
        });

        entityDiv.appendChild(b2Container);
    }

    cell.appendChild(entityDiv);
}

function getTypeB2ForNode(typeBId, nodeId) {
    const b2Data = DATA.typeB2[typeBId];
    if (!b2Data) return [];
    return b2Data[nodeId] || [];
}

function getTypeCTitle(typeCId) {
    const typeC = DATA.typeC.find(c => c.id === typeCId);
    return typeC ? typeC.title : typeCId;
}

function handleSubcellClick(e, nodeId, cell) {
    e.stopPropagation();
    const maincell = cell.closest('.maincell');
    const maincellIndex = maincell.dataset.maincell;
    const subcellIndex = cell.dataset.subcell;

    setFocus('midCanvas', {
        type: 'subcell',
        nodeId,
        maincell: maincellIndex,
        subcell: subcellIndex
    });
}

function handleTypeB2Click(e, b2Id, nodeId) {
    e.stopPropagation();
    setFocus('midCanvas', { type: 'typeB2', id: b2Id, nodeId });
}

// ==================== Focus Management ====================

function setFocus(panel, focusData) {
    // Update active panel
    state.activePanel = panel;

    // Update focus data based on panel
    if (panel === 'left') {
        state.focus.left = focusData;
    } else if (panel === 'midTab') {
        state.focus.midTab = focusData;
        // Auto-load details when tab becomes focused
        if (focusData && focusData !== state.currentTab) {
            selectTab(focusData);
        }
    } else if (panel === 'midCanvas') {
        state.focus.midCanvas = focusData;
    } else if (panel === 'right') {
        state.focus.right = focusData;
    }

    updateFocusVisuals();
}

function updateFocusVisuals() {
    // Clear all focus classes
    document.querySelectorAll('.focused').forEach(el => {
        el.classList.remove('focused');
    });

    // Clear panel highlight classes
    document.querySelectorAll('.panel-active').forEach(el => {
        el.classList.remove('panel-active');
    });
    elements.tabBar?.classList.remove('panel-active');
    elements.canvas?.classList.remove('panel-active');

    // Apply focused class to each panel's focused element (all panels, not just active)
    // Left panel
    if (state.focus.left) {
        const el = elements.typeAList.querySelector(`[data-id="${state.focus.left}"]`);
        if (el) el.classList.add('focused');
    }

    // Mid tab bar
    if (state.focus.midTab) {
        const el = elements.typeBTabs.querySelector(`[data-id="${state.focus.midTab}"]`);
        if (el) el.classList.add('focused');
    }

    // Mid canvas
    if (state.focus.midCanvas) {
        const focus = state.focus.midCanvas;
        if (focus.type === 'subcell') {
            const maincell = document.querySelector(`[data-maincell="${focus.maincell}"]`);
            if (maincell) {
                const subcell = maincell.querySelector(`[data-subcell="${focus.subcell}"]`);
                if (subcell) subcell.classList.add('focused');
            }
        } else if (focus.type === 'typeB2') {
            const el = document.querySelector(`.typeB2-entity[data-id="${focus.id}"]`);
            if (el) el.classList.add('focused');
        }
    }

    // Right panel
    if (state.focus.right) {
        const el = elements.typeCList.querySelector(`[data-id="${state.focus.right}"]`);
        if (el) el.classList.add('focused');
    }

    // Debug: Highlight active panel only
    if (DEBUG_PANEL_HIGHLIGHT && state.activePanel) {
        switch (state.activePanel) {
            case 'left':
                elements.panelLeft?.classList.add('panel-active');
                break;
            case 'midTab':
                elements.tabBar?.classList.add('panel-active');
                break;
            case 'midCanvas':
                elements.canvas?.classList.add('panel-active');
                break;
            case 'right':
                elements.panelRight?.classList.add('panel-active');
                break;
        }
    }
}

// ==================== Modal Management ====================

let currentModal = null; // Track current modal state

function openModal(type, mode, data = null) {
    currentModal = { type, mode, data };

    const titles = {
        typeA: { create: 'Create TypeA', update: 'Update TypeA' },
        typeB: { create: 'Create TypeB', update: 'Update TypeB' },
        typeC: { create: 'Create TypeC', update: 'Update TypeC' },
        typeB2: { update: 'TypeB2 Details' }
    };

    elements.modalTitle.textContent = titles[type]?.[mode] || 'Modal';
    elements.modalBody.innerHTML = getModalBody(type, mode, data);
    elements.modalFooter.innerHTML = getModalFooter(mode);

    elements.modalOverlay.classList.add('visible');

    // Focus first input
    const firstInput = elements.modalBody.querySelector('input, textarea');
    if (firstInput) firstInput.focus();

    // Add event listeners
    setupModalEventListeners();
}

function closeModal() {
    elements.modalOverlay.classList.remove('visible');
    currentModal = null;
}

function getModalBody(type, mode, data) {
    switch (type) {
        case 'typeA':
            return getTypeAModalBody(mode, data);
        case 'typeB':
            return getTypeBModalBody(mode, data);
        case 'typeC':
            return getTypeCModalBody(mode, data);
        case 'typeB2':
            return getTypeB2ModalBody(data);
        default:
            return '';
    }
}

function getTypeAModalBody(mode, data) {
    const title = data?.title || '';
    const description = data?.description || '';

    let html = `
        <div class="form-group">
            <label for="modal-title-input">Title</label>
            <input type="text" id="modal-title-input" value="${escapeHtml(title)}">
        </div>
        <div class="form-group">
            <label for="modal-desc-input">Description</label>
            <textarea id="modal-desc-input">${escapeHtml(description)}</textarea>
        </div>
    `;

    if (mode === 'update' && data) {
        const usageList = getTypeAUsageList(data.id);
        html += `
            <div class="form-group">
                <label>Usage List (${usageList.length})</label>
                <ul class="readonly-list">
                    ${usageList.map(path => `<li>${escapeHtml(path)}</li>`).join('') || '<li>No usage</li>'}
                </ul>
            </div>
        `;
    }

    return html;
}

function getTypeBModalBody(mode, data) {
    const title = data?.title || '';
    const description = data?.description || '';

    let html = `
        <div class="form-group">
            <label for="modal-title-input">Title</label>
            <input type="text" id="modal-title-input" value="${escapeHtml(title)}">
        </div>
        <div class="form-group">
            <label for="modal-desc-input">Description</label>
            <textarea id="modal-desc-input">${escapeHtml(description)}</textarea>
        </div>
    `;

    if (mode === 'update' && data) {
        const tree = DATA.typeB1[data.id] || {};
        const b1Count = Object.keys(tree).length;
        const b2Data = DATA.typeB2[data.id] || {};
        let b2Count = 0;
        Object.values(b2Data).forEach(arr => b2Count += arr.length);

        html += `
            <div class="form-group">
                <label>TypeB1 Entities Count</label>
                <div class="readonly-list">${b1Count}</div>
            </div>
            <div class="form-group">
                <label>TypeB2 Entities Count</label>
                <div class="readonly-list">${b2Count}</div>
            </div>
        `;
    }

    return html;
}

function getTypeCModalBody(mode, data) {
    const title = data?.title || '';
    const description = data?.description || '';

    let html = `
        <div class="form-group">
            <label for="modal-title-input">Title</label>
            <input type="text" id="modal-title-input" value="${escapeHtml(title)}">
        </div>
        <div class="form-group">
            <label for="modal-desc-input">Description</label>
            <textarea id="modal-desc-input">${escapeHtml(description)}</textarea>
        </div>
    `;

    if (mode === 'update' && data) {
        const usageList = getTypeCUsageList(data.id);
        html += `
            <div class="form-group">
                <label>TypeB2 Usage List (${usageList.length})</label>
                <ul class="readonly-list">
                    ${usageList.map(path => `<li>${escapeHtml(path)}</li>`).join('') || '<li>No usage</li>'}
                </ul>
            </div>
        `;
    }

    return html;
}

function getTypeB2ModalBody(data) {
    if (!data) return '';

    const typeC = DATA.typeC.find(c => c.id === data.typeCId);
    const typeCTitle = typeC ? typeC.title : data.typeCId;

    return `
        <div class="form-group">
            <label>Color</label>
            <div class="readonly-list" style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 24px; height: 24px; background-color: ${data.color}; border-radius: 4px;"></span>
                ${data.color}
            </div>
        </div>
        <div class="form-group">
            <label>Character</label>
            <div class="readonly-list">${data.char}</div>
        </div>
        <div class="form-group">
            <label>Linked TypeC</label>
            <div class="readonly-list">${escapeHtml(typeCTitle)}</div>
        </div>
    `;
}

function getModalFooter(mode) {
    if (mode === 'create') {
        return `
            <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="modal-create">Create</button>
        `;
    } else if (mode === 'update') {
        return `
            <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="modal-save">Save</button>
        `;
    }
    return `<button class="btn btn-secondary" id="modal-cancel">Close</button>`;
}

function setupModalEventListeners() {
    // Close button
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-cancel')?.addEventListener('click', closeModal);

    // Create button
    document.getElementById('modal-create')?.addEventListener('click', handleModalCreate);

    // Save button
    document.getElementById('modal-save')?.addEventListener('click', handleModalSave);

    // Click outside to close
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            closeModal();
        }
    });
}

function handleModalCreate() {
    if (!currentModal) return;

    const title = document.getElementById('modal-title-input')?.value.trim();
    const description = document.getElementById('modal-desc-input')?.value.trim() || '';

    if (!title) {
        alert('Title is required');
        return;
    }

    // Duplication check
    if (checkDuplication(currentModal.type, title)) {
        alert(`A ${currentModal.type} with this title already exists`);
        return;
    }

    // Create entity
    const id = generateId(currentModal.type, title);
    const newEntity = { id, title, description };

    switch (currentModal.type) {
        case 'typeA':
            DATA.typeA.push(newEntity);
            renderTypeAList();
            break;
        case 'typeB':
            DATA.typeB.push(newEntity);
            DATA.typeB1[id] = { root: { id: 'root', typeAId: id, parentId: null, children: [] } };
            DATA.typeB2[id] = {};
            renderTypeBTabs();
            break;
        case 'typeC':
            DATA.typeC.push(newEntity);
            renderTypeCList();
            break;
    }

    closeModal();
}

function handleModalSave() {
    if (!currentModal || !currentModal.data) return;

    const title = document.getElementById('modal-title-input')?.value.trim();
    const description = document.getElementById('modal-desc-input')?.value.trim() || '';

    if (!title) {
        alert('Title is required');
        return;
    }

    // Duplication check (exclude self)
    if (checkDuplication(currentModal.type, title, currentModal.data.id)) {
        alert(`A ${currentModal.type} with this title already exists`);
        return;
    }

    // Update entity
    switch (currentModal.type) {
        case 'typeA':
            const typeA = DATA.typeA.find(a => a.id === currentModal.data.id);
            if (typeA) {
                typeA.title = title;
                typeA.description = description;
                renderTypeAList();
                renderCanvas();
            }
            break;
        case 'typeB':
            const typeB = DATA.typeB.find(b => b.id === currentModal.data.id);
            if (typeB) {
                typeB.title = title;
                typeB.description = description;
                renderTypeBTabs();
            }
            break;
        case 'typeC':
            const typeC = DATA.typeC.find(c => c.id === currentModal.data.id);
            if (typeC) {
                typeC.title = title;
                typeC.description = description;
                renderTypeCList();
                renderCanvas();
            }
            break;
    }

    closeModal();
}

function checkDuplication(type, title, excludeId = null) {
    let list;
    switch (type) {
        case 'typeA': list = DATA.typeA; break;
        case 'typeB': list = DATA.typeB; break;
        case 'typeC': list = DATA.typeC; break;
        default: return false;
    }

    return list.some(item =>
        item.title.toLowerCase() === title.toLowerCase() && item.id !== excludeId
    );
}

function generateId(type, title) {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let id = `${type}-${base}`;
    let counter = 1;

    const existingIds = new Set();
    switch (type) {
        case 'typeA': DATA.typeA.forEach(a => existingIds.add(a.id)); break;
        case 'typeB': DATA.typeB.forEach(b => existingIds.add(b.id)); break;
        case 'typeC': DATA.typeC.forEach(c => existingIds.add(c.id)); break;
    }

    while (existingIds.has(id)) {
        id = `${type}-${base}-${counter++}`;
    }

    return id;
}

function getTypeAUsageList(typeAId) {
    const usages = [];
    Object.keys(DATA.typeB1).forEach(typeBId => {
        const tree = DATA.typeB1[typeBId];
        Object.keys(tree).forEach(nodeId => {
            const node = tree[nodeId];
            if (node.typeAId === typeAId) {
                const path = getNodePath(typeBId, nodeId);
                usages.push(path);
            }
        });
    });
    return usages;
}

function getTypeCUsageList(typeCId) {
    const usages = [];
    Object.keys(DATA.typeB2).forEach(typeBId => {
        const b2Data = DATA.typeB2[typeBId];
        Object.keys(b2Data).forEach(nodeId => {
            const b2List = b2Data[nodeId];
            b2List.forEach(b2 => {
                if (b2.typeCId === typeCId) {
                    const path = getNodePath(typeBId, nodeId);
                    usages.push(path);
                }
            });
        });
    });
    return usages;
}

function getNodePath(typeBId, nodeId) {
    const tree = DATA.typeB1[typeBId];
    if (!tree) return typeBId;

    const parts = [typeBId];
    let current = tree[nodeId];

    // Build path from node to root
    const pathNodes = [];
    while (current && current.parentId) {
        pathNodes.unshift(current.typeAId);
        current = tree[current.parentId];
    }

    return [...parts, ...pathNodes].join('/');
}

// Setup add button click handlers
function setupAddButtons() {
    document.getElementById('add-typeA')?.addEventListener('click', () => {
        openModal('typeA', 'create');
    });

    document.getElementById('add-typeB')?.addEventListener('click', () => {
        openModal('typeB', 'create');
    });

    document.getElementById('add-typeC')?.addEventListener('click', () => {
        openModal('typeC', 'create');
    });
}

// ==================== Keyboard Handlers ====================

function setupKeyboardHandlers() {
    document.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
    // Don't handle keys when typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
            closeModal();
        }
        return;
    }

    switch (e.key) {
        case 'Escape':
            closeModal();
            break;
        case ' ':
            e.preventDefault();
            handleSpaceKey();
            break;
        case 'Delete':
            e.preventDefault();
            handleDeleteKey();
            break;
        case 'Enter':
            e.preventDefault();
            handleEnterKey();
            break;
        case 'Backspace':
            e.preventDefault();
            handleBackspaceKey();
            break;
        case 'ArrowUp':
            e.preventDefault();
            handleArrowKey('up');
            break;
        case 'ArrowDown':
            e.preventDefault();
            handleArrowKey('down');
            break;
        case 'ArrowLeft':
            e.preventDefault();
            handleArrowKey('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            handleArrowKey('right');
            break;
    }
}

function handleSpaceKey() {
    // Open inspect/update modal on focused element
    if (state.activePanel === 'left' && state.focus.left) {
        const item = DATA.typeA.find(a => a.id === state.focus.left);
        if (item) openModal('typeA', 'update', item);
    } else if (state.activePanel === 'midTab' && state.focus.midTab) {
        const item = DATA.typeB.find(b => b.id === state.focus.midTab);
        if (item) openModal('typeB', 'update', item);
    } else if (state.activePanel === 'midCanvas' && state.focus.midCanvas) {
        const focus = state.focus.midCanvas;
        if (focus.type === 'subcell' && focus.nodeId) {
            // Open TypeA modal for the B1's typeA
            const tree = DATA.typeB1[state.currentTab];
            const node = tree?.[focus.nodeId];
            if (node) {
                const typeA = DATA.typeA.find(a => a.id === node.typeAId);
                if (typeA) openModal('typeA', 'update', typeA);
            }
        } else if (focus.type === 'typeB2') {
            // Open TypeB2 details modal
            const b2 = findTypeB2ById(focus.id);
            if (b2) openModal('typeB2', 'update', b2);
        }
    } else if (state.activePanel === 'right' && state.focus.right) {
        const item = DATA.typeC.find(c => c.id === state.focus.right);
        if (item) openModal('typeC', 'update', item);
    }
}

function findTypeB2ById(b2Id) {
    for (const typeBId of Object.keys(DATA.typeB2)) {
        const b2Data = DATA.typeB2[typeBId];
        for (const nodeId of Object.keys(b2Data)) {
            const b2 = b2Data[nodeId].find(b => b.id === b2Id);
            if (b2) return b2;
        }
    }
    return null;
}

function handleDeleteKey() {
    if (state.activePanel === 'left' && state.focus.left) {
        deleteTypeA(state.focus.left);
    } else if (state.activePanel === 'midTab' && state.focus.midTab) {
        deleteTypeB(state.focus.midTab);
    } else if (state.activePanel === 'midCanvas' && state.focus.midCanvas) {
        const focus = state.focus.midCanvas;
        if (focus.type === 'subcell' && focus.nodeId) {
            deleteTypeB1(state.currentTab, focus.nodeId);
        } else if (focus.type === 'typeB2') {
            deleteTypeB2(state.currentTab, focus.id);
        }
    } else if (state.activePanel === 'right' && state.focus.right) {
        deleteTypeC(state.focus.right);
    }
}

function handleEnterKey() {
    // Insert: only works when left or right panel is active
    if (state.activePanel === 'left' && state.focus.left) {
        // Insert TypeA into canvas (creates TypeB1)
        insertTypeAIntoCanvas(state.focus.left);
    } else if (state.activePanel === 'right' && state.focus.right) {
        // Insert TypeC into canvas (creates TypeB2)
        insertTypeCIntoCanvas(state.focus.right);
    } else if (state.activePanel === 'midCanvas' && state.focus.midCanvas?.type === 'subcell') {
        // Nav-into: only works when mid canvas is active
        navInto(state.focus.midCanvas.nodeId);
    }
    // Note: midTab no longer needs Enter to load details - it's automatic on focus
}

function handleBackspaceKey() {
    // Nav-up: only works when mid canvas is active
    if (state.activePanel === 'midCanvas') {
        // Check if there's any local zoom state in the focused maincell
        const focus = state.focus.midCanvas;
        const hasLocalZoom = focus && focus.type === 'subcell' &&
            state.subNavState[parseInt(focus.maincell)];

        // Allow nav-up if not at root OR if there's local zoom to undo
        if (state.currentNavNode !== 'root' || hasLocalZoom) {
            navUp();
        }
    }
}

function handleArrowKey(direction) {
    switch (state.activePanel) {
        case 'left':
            if (direction === 'up' || direction === 'down') {
                navigateList('left', direction);
            }
            break;
        case 'midTab':
            if (direction === 'left' || direction === 'right') {
                navigateTabBar(direction);
            }
            break;
        case 'midCanvas':
            navigateCanvas(direction);
            break;
        case 'right':
            if (direction === 'up' || direction === 'down') {
                navigateList('right', direction);
            }
            break;
    }
}

function navigateList(panel, direction) {
    const listEl = panel === 'left' ? elements.typeAList : elements.typeCList;
    const dataArr = panel === 'left' ? DATA.typeA : DATA.typeC;
    const currentFocus = panel === 'left' ? state.focus.left : state.focus.right;

    if (dataArr.length === 0) return;

    // Find current index
    let currentIndex = dataArr.findIndex(item => item.id === currentFocus);
    if (currentIndex === -1) currentIndex = 0;

    // Calculate new index
    let newIndex;
    if (direction === 'up') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : dataArr.length - 1;
    } else {
        newIndex = currentIndex < dataArr.length - 1 ? currentIndex + 1 : 0;
    }

    // Set new focus
    setFocus(panel, dataArr[newIndex].id);

    // Scroll into view
    const newEl = listEl.querySelector(`[data-id="${dataArr[newIndex].id}"]`);
    if (newEl) newEl.scrollIntoView({ block: 'nearest' });
}

function navigateTabBar(direction) {
    if (DATA.typeB.length === 0) return;

    // Find current index
    let currentIndex = DATA.typeB.findIndex(item => item.id === state.focus.midTab);
    if (currentIndex === -1) currentIndex = 0;

    // Calculate new index
    let newIndex;
    if (direction === 'left') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : DATA.typeB.length - 1;
    } else {
        newIndex = currentIndex < DATA.typeB.length - 1 ? currentIndex + 1 : 0;
    }

    // Set new focus (this will also load the tab due to auto-load on focus)
    setFocus('midTab', DATA.typeB[newIndex].id);

    // Scroll into view
    const newEl = elements.typeBTabs.querySelector(`[data-id="${DATA.typeB[newIndex].id}"]`);
    if (newEl) newEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function navigateCanvas(direction) {
    const focus = state.focus.midCanvas;
    if (!focus || focus.type !== 'subcell') return;

    const maincellIndex = parseInt(focus.maincell);
    const subcellIndex = parseInt(focus.subcell);

    // Subcell grid layout (3x3):
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const subcellRow = Math.floor(subcellIndex / 3);
    const subcellCol = subcellIndex % 3;

    // Maincell grid layout (3x3):
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const maincellRow = Math.floor(maincellIndex / 3);
    const maincellCol = maincellIndex % 3;

    let newSubcellRow = subcellRow;
    let newSubcellCol = subcellCol;
    let newMaincellRow = maincellRow;
    let newMaincellCol = maincellCol;

    switch (direction) {
        case 'up':
            if (subcellRow > 0) {
                newSubcellRow = subcellRow - 1;
            } else if (maincellRow > 0) {
                newMaincellRow = maincellRow - 1;
                newSubcellRow = 2; // Bottom row of upper maincell
            }
            break;
        case 'down':
            if (subcellRow < 2) {
                newSubcellRow = subcellRow + 1;
            } else if (maincellRow < 2) {
                newMaincellRow = maincellRow + 1;
                newSubcellRow = 0; // Top row of lower maincell
            }
            break;
        case 'left':
            if (subcellCol > 0) {
                newSubcellCol = subcellCol - 1;
            } else if (maincellCol > 0) {
                newMaincellCol = maincellCol - 1;
                newSubcellCol = 2; // Right column of left maincell
            }
            break;
        case 'right':
            if (subcellCol < 2) {
                newSubcellCol = subcellCol + 1;
            } else if (maincellCol < 2) {
                newMaincellCol = maincellCol + 1;
                newSubcellCol = 0; // Left column of right maincell
            }
            break;
    }

    const newMaincellIndex = newMaincellRow * 3 + newMaincellCol;
    const newSubcellIndex = newSubcellRow * 3 + newSubcellCol;

    // Check if the target cell exists and is occupied
    const targetMaincell = document.querySelector(`[data-maincell="${newMaincellIndex}"]`);
    if (!targetMaincell) return;

    const targetSubcell = targetMaincell.querySelector(`[data-subcell="${newSubcellIndex}"]`);
    if (!targetSubcell) return;

    // Get the nodeId from the target cell (may be empty)
    const nodeId = targetSubcell.dataset.nodeId || null;

    setFocus('midCanvas', {
        type: 'subcell',
        nodeId: nodeId,
        maincell: String(newMaincellIndex),
        subcell: String(newSubcellIndex)
    });
}

// ==================== Navigation (nav-into / nav-up) ====================

function navInto(nodeId) {
    const tree = DATA.typeB1[state.currentTab];
    if (!tree) return;

    const node = tree[nodeId];
    if (!node || node.children.length === 0) return;

    // Check if the focused node is in a subcell (not center)
    const focus = state.focus.midCanvas;
    if (focus && focus.type === 'subcell' && focus.subcell !== '4') {
        // Local nav-in: zoom within the same maincell
        const maincellIndex = parseInt(focus.maincell);
        state.subNavState[maincellIndex] = nodeId;

        // Update focus to the center of this maincell (where the node will be)
        state.focus.midCanvas = {
            type: 'subcell',
            nodeId: nodeId,
            maincell: focus.maincell,
            subcell: '4'  // center
        };

        renderCanvas();
        updateFocusVisuals();
    } else if (focus && focus.type === 'subcell' && focus.subcell === '4') {
        // Node is at center - it's already expanded, don't nav-in again
        // Center nodes already show their children around them
        // Use nav-up (Backspace) to go back, or click a child to nav into it
        return;
    } else {
        // Fallback: global nav-in
        state.currentNavNode = nodeId;
        state.subNavState = {};
        renderCanvas();
    }
}

function navUp() {
    const tree = DATA.typeB1[state.currentTab];
    if (!tree) return;

    // Check if focused on a center cell with local nav state
    const focus = state.focus.midCanvas;
    if (focus && focus.type === 'subcell' && focus.subcell === '4') {
        const maincellIndex = parseInt(focus.maincell);
        const localNavNodeId = state.subNavState[maincellIndex];

        if (localNavNodeId) {
            // We're zoomed in locally - nav up within the maincell
            const localNavNode = tree[localNavNodeId];
            if (localNavNode && localNavNode.parentId) {
                // Check if parent is the default node for this maincell
                const currentNavNode = tree[state.currentNavNode];
                const defaultNodeForMaincell = currentNavNode?.children[maincellIndex];

                if (localNavNode.parentId === defaultNodeForMaincell) {
                    // Going back to default view - clear local nav state
                    delete state.subNavState[maincellIndex];

                    // Update focus to the original position of the node
                    state.focus.midCanvas = {
                        type: 'subcell',
                        nodeId: defaultNodeForMaincell,
                        maincell: focus.maincell,
                        subcell: '4'
                    };
                } else {
                    // Nav up within local hierarchy
                    state.subNavState[maincellIndex] = localNavNode.parentId;

                    state.focus.midCanvas = {
                        type: 'subcell',
                        nodeId: localNavNode.parentId,
                        maincell: focus.maincell,
                        subcell: '4'
                    };
                }

                renderCanvas();
                updateFocusVisuals();
                return;
            }
        }
    }

    // Global nav-up
    const currentNode = tree[state.currentNavNode];
    if (!currentNode || !currentNode.parentId) {
        state.currentNavNode = 'root';
    } else {
        state.currentNavNode = currentNode.parentId;
    }

    // Clear local nav states when doing global nav
    state.subNavState = {};
    renderCanvas();
}

// ==================== Delete Operations ====================

function deleteTypeA(id) {
    const item = DATA.typeA.find(a => a.id === id);
    if (!item) return;

    // Check if it's in use
    const usageCount = getTypeAUsageCount(id);
    if (usageCount > 0) {
        showToast(`Cannot delete "${item.title}" - it's used ${usageCount} times`, null, 3000);
        return;
    }

    const index = DATA.typeA.findIndex(a => a.id === id);
    if (index === -1) return;

    DATA.typeA.splice(index, 1);

    // Maintain focus at same index or nearest available
    if (DATA.typeA.length > 0) {
        const newIndex = Math.min(index, DATA.typeA.length - 1);
        state.focus.left = DATA.typeA[newIndex].id;
    } else {
        state.focus.left = null;
    }

    renderTypeAList();
    updateFocusVisuals();

    showToast(`Deleted "${item.title}"`, () => {
        // Undo
        DATA.typeA.splice(index, 0, item);
        state.focus.left = item.id;
        renderTypeAList();
        updateFocusVisuals();
    });
}

function deleteTypeB(id) {
    const item = DATA.typeB.find(b => b.id === id);
    if (!item) return;

    // Check if it has children (B1 nodes)
    const tree = DATA.typeB1[id] || {};
    const nodeCount = Object.keys(tree).length;
    if (nodeCount > 1) { // more than just root
        if (!confirm(`Delete "${item.title}" and all its ${nodeCount - 1} child nodes?`)) {
            return;
        }
    }

    const index = DATA.typeB.findIndex(b => b.id === id);
    if (index === -1) return;

    const savedTree = { ...DATA.typeB1[id] };
    const savedB2 = { ...DATA.typeB2[id] };

    DATA.typeB.splice(index, 1);
    delete DATA.typeB1[id];
    delete DATA.typeB2[id];

    // Maintain focus at same index or nearest available
    if (DATA.typeB.length > 0) {
        const newIndex = Math.min(index, DATA.typeB.length - 1);
        state.focus.midTab = DATA.typeB[newIndex].id;
        // Switch to the new focused tab
        selectTab(DATA.typeB[newIndex].id);
    } else {
        state.focus.midTab = null;
        state.currentTab = null;
        renderCanvas();
    }

    renderTypeBTabs();
    updateFocusVisuals();

    showToast(`Deleted "${item.title}"`, () => {
        // Undo
        DATA.typeB.splice(index, 0, item);
        DATA.typeB1[id] = savedTree;
        DATA.typeB2[id] = savedB2;
        state.focus.midTab = item.id;
        renderTypeBTabs();
        selectTab(id);
        updateFocusVisuals();
    });
}

function deleteTypeB1(typeBId, nodeId) {
    const tree = DATA.typeB1[typeBId];
    if (!tree || nodeId === 'root') return;

    const node = tree[nodeId];
    if (!node) return;

    // Check for children
    if (node.children.length > 0) {
        showToast(`Cannot delete - has ${node.children.length} children`, null, 3000);
        return;
    }

    // Save current focus position
    const currentFocus = state.focus.midCanvas;
    const maincellIndex = currentFocus?.maincell;
    const subcellIndex = currentFocus?.subcell;

    // Remove from parent's children
    const parent = tree[node.parentId];
    let childIndex = -1;
    if (parent) {
        childIndex = parent.children.indexOf(nodeId);
        if (childIndex !== -1) {
            parent.children.splice(childIndex, 1);
        }
    }

    // Delete B2 relations
    const savedB2 = DATA.typeB2[typeBId]?.[nodeId] || [];
    if (DATA.typeB2[typeBId]) {
        delete DATA.typeB2[typeBId][nodeId];
    }

    // Delete the node
    delete tree[nodeId];

    // Maintain focus at the same subcell position
    // The nodeId at that position will change after re-render
    if (maincellIndex !== undefined && subcellIndex !== undefined) {
        state.focus.midCanvas = {
            type: 'subcell',
            nodeId: null, // Will be updated after render
            maincell: maincellIndex,
            subcell: subcellIndex
        };
    } else {
        state.focus.midCanvas = null;
    }

    renderCanvas();

    // Update the nodeId in focus after render
    if (state.focus.midCanvas) {
        const targetMaincell = document.querySelector(`[data-maincell="${maincellIndex}"]`);
        if (targetMaincell) {
            const targetSubcell = targetMaincell.querySelector(`[data-subcell="${subcellIndex}"]`);
            if (targetSubcell) {
                state.focus.midCanvas.nodeId = targetSubcell.dataset.nodeId || null;
            }
        }
    }

    updateFocusVisuals();

    const typeA = DATA.typeA.find(a => a.id === node.typeAId);
    const title = typeA?.title || node.typeAId;

    showToast(`Deleted "${title}"`, () => {
        // Undo
        tree[nodeId] = node;
        if (parent && childIndex !== -1) {
            parent.children.splice(childIndex, 0, nodeId);
        } else if (parent) {
            parent.children.push(nodeId);
        }
        if (savedB2.length > 0) {
            DATA.typeB2[typeBId][nodeId] = savedB2;
        }
        state.focus.midCanvas = {
            type: 'subcell',
            nodeId: nodeId,
            maincell: maincellIndex,
            subcell: subcellIndex
        };
        renderCanvas();
        updateFocusVisuals();
    });
}

function deleteTypeB2(typeBId, b2Id) {
    const b2Data = DATA.typeB2[typeBId];
    if (!b2Data) return;

    let foundB2 = null;
    let foundNodeId = null;
    let foundIndex = -1;

    for (const nodeId of Object.keys(b2Data)) {
        const index = b2Data[nodeId].findIndex(b => b.id === b2Id);
        if (index !== -1) {
            foundB2 = b2Data[nodeId][index];
            foundNodeId = nodeId;
            foundIndex = index;
            break;
        }
    }

    if (!foundB2) return;

    b2Data[foundNodeId].splice(foundIndex, 1);

    // After deleting TypeB2, focus on the parent subcell (the TypeB1 node)
    // Find which subcell contains this nodeId
    const subcell = document.querySelector(`.subcell[data-node-id="${foundNodeId}"]`);
    if (subcell) {
        const maincell = subcell.closest('.maincell');
        state.focus.midCanvas = {
            type: 'subcell',
            nodeId: foundNodeId,
            maincell: maincell.dataset.maincell,
            subcell: subcell.dataset.subcell
        };
    } else {
        // Fallback: find the subcell with matching nodeId after render
        state.focus.midCanvas = {
            type: 'subcell',
            nodeId: foundNodeId,
            maincell: null,
            subcell: null
        };
    }

    renderCanvas();

    // Update focus position after render if needed
    if (state.focus.midCanvas && !state.focus.midCanvas.maincell) {
        const newSubcell = document.querySelector(`.subcell[data-node-id="${foundNodeId}"]`);
        if (newSubcell) {
            const maincell = newSubcell.closest('.maincell');
            state.focus.midCanvas.maincell = maincell.dataset.maincell;
            state.focus.midCanvas.subcell = newSubcell.dataset.subcell;
        }
    }

    updateFocusVisuals();

    showToast(`Deleted TypeB2 "${foundB2.char}"`, () => {
        // Undo
        b2Data[foundNodeId].splice(foundIndex, 0, foundB2);
        state.focus.midCanvas = { type: 'typeB2', id: b2Id, nodeId: foundNodeId };
        renderCanvas();
        updateFocusVisuals();
    });
}

function deleteTypeC(id) {
    const item = DATA.typeC.find(c => c.id === id);
    if (!item) return;

    // Also delete all B2 relations
    const usageList = getTypeCUsageList(id);
    if (usageList.length > 0) {
        if (!confirm(`Delete "${item.title}" and its ${usageList.length} TypeB2 relations?`)) {
            return;
        }
    }

    const index = DATA.typeC.findIndex(c => c.id === id);
    if (index === -1) return;

    // Save B2 relations for undo
    const savedB2Relations = [];
    Object.keys(DATA.typeB2).forEach(typeBId => {
        const b2Data = DATA.typeB2[typeBId];
        Object.keys(b2Data).forEach(nodeId => {
            const toRemove = b2Data[nodeId].filter(b => b.typeCId === id);
            toRemove.forEach(b2 => {
                savedB2Relations.push({ typeBId, nodeId, b2, index: b2Data[nodeId].indexOf(b2) });
            });
            b2Data[nodeId] = b2Data[nodeId].filter(b => b.typeCId !== id);
        });
    });

    DATA.typeC.splice(index, 1);

    // Maintain focus at same index or nearest available
    if (DATA.typeC.length > 0) {
        const newIndex = Math.min(index, DATA.typeC.length - 1);
        state.focus.right = DATA.typeC[newIndex].id;
    } else {
        state.focus.right = null;
    }

    renderTypeCList();
    renderCanvas();
    updateFocusVisuals();

    showToast(`Deleted "${item.title}"`, () => {
        // Undo
        DATA.typeC.splice(index, 0, item);
        savedB2Relations.forEach(({ typeBId, nodeId, b2, index }) => {
            DATA.typeB2[typeBId][nodeId].splice(index, 0, b2);
        });
        state.focus.right = item.id;
        renderTypeCList();
        renderCanvas();
        updateFocusVisuals();
    });
}

// ==================== Insert Operations ====================

function insertTypeAIntoCanvas(typeAId) {
    const typeA = DATA.typeA.find(a => a.id === typeAId);
    if (!typeA || !state.currentTab) return;

    const tree = DATA.typeB1[state.currentTab];
    if (!tree) return;

    const focus = state.focus.midCanvas;

    // Determine target parent based on focus type
    let targetParentId;
    let targetParentNode;

    if (focus && focus.type === 'subcell') {
        const subcellIndex = focus.subcell;
        const maincellIndex = parseInt(focus.maincell);
        const nodeId = focus.nodeId;

        // Get the center node of this maincell
        const currentNavNode = tree[state.currentNavNode];
        if (!currentNavNode) return;

        // Check if this maincell has content (has a child at this position)
        const maincellChildId = currentNavNode.children[maincellIndex];
        if (!maincellChildId) {
            // No maincell content here - check max maincell limit
            if (currentNavNode.children.length >= 9) {
                showToast('Maximum maincells reached (9)', null, 3000);
                return;
            }
            // Insert as child of currentNavNode
            targetParentId = state.currentNavNode;
            targetParentNode = currentNavNode;
        } else {
            // Maincell has content - determine center node (considering local zoom)
            const localNavNodeId = state.subNavState[maincellIndex];
            const centerNodeId = localNavNodeId || maincellChildId;
            const centerNode = tree[centerNodeId];

            if (!centerNode) return;

            if (subcellIndex === '4') {
                // Case 1: Center subcell - insert as child of center node
                // Check max subcell limit (8 surrounding positions)
                if (centerNode.children.length >= 8) {
                    showToast('Maximum subcells reached (8)', null, 3000);
                    return;
                }
                targetParentId = centerNodeId;
                targetParentNode = centerNode;
            } else if (!nodeId) {
                // Case 2: Empty subcell - insert as child of center node
                if (centerNode.children.length >= 8) {
                    showToast('Maximum subcells reached (8)', null, 3000);
                    return;
                }
                targetParentId = centerNodeId;
                targetParentNode = centerNode;
            } else {
                // Case 3: Occupied subcell - insert as child of that node
                const occupiedNode = tree[nodeId];
                if (!occupiedNode) return;
                // For child nodes, also check 8 max
                if (occupiedNode.children.length >= 8) {
                    showToast('Maximum children reached (8)', null, 3000);
                    return;
                }
                targetParentId = nodeId;
                targetParentNode = occupiedNode;
            }
        }
    } else {
        // No valid focus - use current nav node
        const currentNavNode = tree[state.currentNavNode];
        if (!currentNavNode) return;
        if (currentNavNode.children.length >= 9) {
            showToast('Maximum maincells reached (9)', null, 3000);
            return;
        }
        targetParentId = state.currentNavNode;
        targetParentNode = currentNavNode;
    }

    // Check duplication among siblings
    const isDuplicate = targetParentNode.children.some(childId => {
        const child = tree[childId];
        return child && child.typeAId === typeAId;
    });

    if (isDuplicate) {
        showToast(`"${typeA.title}" already exists at this level`, null, 3000);
        return;
    }

    // Create new B1 node
    const newNodeId = `${targetParentId}-${typeAId}-${Date.now()}`;
    tree[newNodeId] = {
        id: newNodeId,
        typeAId: typeAId,
        parentId: targetParentId,
        children: []
    };
    targetParentNode.children.push(newNodeId);

    renderCanvas();

    // Show appropriate message based on insertion type
    const insertedAsChild = focus && focus.type === 'subcell' && focus.nodeId && focus.subcell !== '4';
    const message = insertedAsChild
        ? `Inserted "${typeA.title}" as child [+]`
        : `Inserted "${typeA.title}" as TypeB1`;

    showToast(message, () => {
        // Undo
        const idx = targetParentNode.children.indexOf(newNodeId);
        if (idx !== -1) targetParentNode.children.splice(idx, 1);
        delete tree[newNodeId];
        renderCanvas();
    });
}

function insertTypeCIntoCanvas(typeCId) {
    const typeC = DATA.typeC.find(c => c.id === typeCId);
    if (!typeC || !state.currentTab) return;

    // Need a target B1 - use the focused subcell from midCanvas if available
    let targetNodeId = null;
    if (state.focus.midCanvas?.type === 'subcell' && state.focus.midCanvas.nodeId) {
        targetNodeId = state.focus.midCanvas.nodeId;
    }

    if (!targetNodeId) {
        showToast('First click a cell in the canvas to select target', null, 3000);
        return;
    }

    // Check duplication and limits
    const b2Data = DATA.typeB2[state.currentTab];
    if (!b2Data[targetNodeId]) {
        b2Data[targetNodeId] = [];
    }

    // Check TypeB2 limit (9 max per node)
    if (b2Data[targetNodeId].length >= 9) {
        showToast('Maximum TypeB2 blocks reached (9)', null, 3000);
        return;
    }

    const isDuplicate = b2Data[targetNodeId].some(b2 => b2.typeCId === typeCId);
    if (isDuplicate) {
        showToast(`"${typeC.title}" already linked here`, null, 3000);
        return;
    }

    // Create new B2
    const newB2 = {
        id: `b2-${state.currentTab}-${targetNodeId}-${Date.now()}`,
        typeCId: typeCId,
        color: DATA.colorPalette[Math.floor(Math.random() * DATA.colorPalette.length)],
        char: DATA.charPreset[Math.floor(Math.random() * DATA.charPreset.length)]
    };

    b2Data[targetNodeId].push(newB2);
    renderCanvas();

    showToast(`Linked "${typeC.title}" as TypeB2`, () => {
        // Undo
        const idx = b2Data[targetNodeId].indexOf(newB2);
        if (idx !== -1) b2Data[targetNodeId].splice(idx, 1);
        renderCanvas();
    });
}

// ==================== Toast Notification System ====================

let toastCounter = 0;

function showToast(message, undoCallback = null, duration = 5000) {
    const toastId = ++toastCounter;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.id = toastId;

    let html = `<span class="toast-message">${escapeHtml(message)}</span>`;
    if (undoCallback) {
        html += `<button class="btn-undo">Undo</button>`;
    }
    toast.innerHTML = html;

    if (undoCallback) {
        const undoBtn = toast.querySelector('.btn-undo');
        undoBtn.addEventListener('click', () => {
            undoCallback();
            removeToast(toastId);
        });
    }

    elements.toastContainer.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => {
        removeToast(toastId);
    }, duration);

    return toastId;
}

function removeToast(toastId) {
    const toast = elements.toastContainer.querySelector(`[data-id="${toastId}"]`);
    if (toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// ==================== Utility Functions ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
