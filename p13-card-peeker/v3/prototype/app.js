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
        elements.typeBTabs.appendChild(div);
    });
}

function handleTypeBTabClick(e, id) {
    e.stopPropagation();
    setFocus('mid', { type: 'tab', id });
    selectTab(id);
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
        elements.typeCList.appendChild(div);
    });
}

function handleTypeCClick(e, id) {
    e.stopPropagation();
    setFocus('right', id);
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

// ==================== Utility Functions ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
