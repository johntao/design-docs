// Note-Taking App Prototype

// App State
const state = {
    currentTab: null,
    currentNavNode: null, // current node being viewed in canvas (for nav-into/nav-up)
    focus: {
        left: null,    // focused TypeA id
        mid: null,     // focused element: { type: 'tab'|'maincell'|'subcell'|'typeB2', id, maincell?, subcell? }
        right: null    // focused TypeC id
    },
    previousFocus: {
        left: null,
        mid: null,
        right: null
    }
};

// DOM Elements
const elements = {
    typeAList: null,
    typeBTabs: null,
    typeCList: null,
    canvas: null,
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
    renderTypeAList();
    renderTypeBTabs();
    renderTypeCList();

    // Set initial tab
    if (DATA.typeB.length > 0) {
        selectTab(DATA.typeB[0].id);
    }

    console.log('Note-Taking App Prototype initialized');
});

// Initialize DOM element references
function initializeElements() {
    elements.typeAList = document.getElementById('typeA-list');
    elements.typeBTabs = document.getElementById('typeB-tabs');
    elements.typeCList = document.getElementById('typeC-list');
    elements.canvas = document.getElementById('canvas');
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
    setFocus('mid', { type: 'tab', id });
    selectTab(id);
}

function handleTypeBDoubleClick(e, item) {
    e.stopPropagation();
    openModal('typeB', 'update', item);
}

function selectTab(typeBId) {
    state.currentTab = typeBId;
    state.currentNavNode = 'root';

    // Update tab active state
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.id === typeBId);
    });

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

    // Clear all subcells first
    document.querySelectorAll('.subcell').forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('occupied');
        cell.dataset.nodeId = '';
    });

    // Get children of current node (max 8 for surrounding positions)
    const children = currentNode.children.slice(0, 8);

    // Layout: children around the center in 3x3 subgrids
    // We'll use the first maincell for now, showing the root node's immediate children
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

        // Render the node and its children in the subgrid
        renderNodeInSubgrid(childNode, tree, subcells);
    });
}

function renderNodeInSubgrid(node, tree, subcells) {
    // Center cell (index 4) for the parent node
    const centerCell = subcells[4];
    renderTypeB1InCell(node, centerCell);

    // Get children (max 8 for surrounding positions)
    const childIds = node.children.slice(0, 8);

    // Position indices around center (0-3, 5-8 excluding center 4)
    const positions = [0, 1, 2, 3, 5, 6, 7, 8];

    childIds.forEach((childId, index) => {
        const childNode = tree[childId];
        if (!childNode) return;

        const cell = subcells[positions[index]];
        if (!cell) return;

        renderTypeB1InCell(childNode, cell);
    });
}

function renderTypeB1InCell(node, cell) {
    const typeA = DATA.typeA.find(a => a.id === node.typeAId);
    const title = typeA ? typeA.title : node.typeAId;

    cell.classList.add('occupied');
    cell.dataset.nodeId = node.id;

    // Create TypeB1 entity element
    const entityDiv = document.createElement('div');
    entityDiv.className = 'typeB1-entity';
    entityDiv.dataset.nodeId = node.id;
    entityDiv.innerHTML = `<div class="title">${escapeHtml(title)}</div>`;

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

    // Add click handler for subcell
    cell.addEventListener('click', (e) => handleSubcellClick(e, node.id, cell));
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

    setFocus('mid', {
        type: 'subcell',
        nodeId,
        maincell: maincellIndex,
        subcell: subcellIndex
    });
}

function handleTypeB2Click(e, b2Id, nodeId) {
    e.stopPropagation();
    setFocus('mid', { type: 'typeB2', id: b2Id, nodeId });
}

// ==================== Focus Management ====================

function setFocus(panel, focusData) {
    // Store previous focus
    state.previousFocus[panel] = state.focus[panel];
    state.focus[panel] = focusData;

    updateFocusVisuals();
}

function updateFocusVisuals() {
    // Clear all focus classes
    document.querySelectorAll('.focused, .previous-focused').forEach(el => {
        el.classList.remove('focused', 'previous-focused');
    });

    // Update left panel focus
    if (state.focus.left) {
        const el = elements.typeAList.querySelector(`[data-id="${state.focus.left}"]`);
        if (el) el.classList.add('focused');
    }
    if (state.previousFocus.left) {
        const el = elements.typeAList.querySelector(`[data-id="${state.previousFocus.left}"]`);
        if (el) el.classList.add('previous-focused');
    }

    // Update mid panel focus
    if (state.focus.mid) {
        const focus = state.focus.mid;
        if (focus.type === 'tab') {
            const el = elements.typeBTabs.querySelector(`[data-id="${focus.id}"]`);
            if (el) el.classList.add('focused');
        } else if (focus.type === 'subcell') {
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
    if (state.previousFocus.mid) {
        const focus = state.previousFocus.mid;
        if (focus.type === 'tab') {
            const el = elements.typeBTabs.querySelector(`[data-id="${focus.id}"]`);
            if (el && !el.classList.contains('focused')) el.classList.add('previous-focused');
        } else if (focus.type === 'subcell') {
            const maincell = document.querySelector(`[data-maincell="${focus.maincell}"]`);
            if (maincell) {
                const subcell = maincell.querySelector(`[data-subcell="${focus.subcell}"]`);
                if (subcell && !subcell.classList.contains('focused')) subcell.classList.add('previous-focused');
            }
        } else if (focus.type === 'typeB2') {
            const el = document.querySelector(`.typeB2-entity[data-id="${focus.id}"]`);
            if (el && !el.classList.contains('focused')) el.classList.add('previous-focused');
        }
    }

    // Update right panel focus
    if (state.focus.right) {
        const el = elements.typeCList.querySelector(`[data-id="${state.focus.right}"]`);
        if (el) el.classList.add('focused');
    }
    if (state.previousFocus.right) {
        const el = elements.typeCList.querySelector(`[data-id="${state.previousFocus.right}"]`);
        if (el) el.classList.add('previous-focused');
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
            <input type="text" id="modal-title-input" value="${escapeHtml(title)}" ${mode === 'update' ? '' : ''}>
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

// ==================== Utility Functions ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
