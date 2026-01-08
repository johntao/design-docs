/**
 * Canvas - Star Topology Renderer for Card Peeker
 */
const Canvas = {
  container: null,

  // Ring positions in 5x5 grid (row, col) - clockwise from top-left
  RING_POSITIONS: {
    // Ring 1: 8 positions around the center (excluding corners initially)
    1: [
      [0, 1], [0, 2], [0, 3], // top row
      [1, 4],                 // right side
      [2, 4],                 // right side
      [3, 4],                 // right side
      [4, 3], [4, 2], [4, 1], // bottom row
      [3, 0],                 // left side
      [2, 0],                 // left side
      [1, 0],                 // left side
      [0, 0], [0, 4],         // corners
      [4, 0], [4, 4]          // corners
    ]
  },

  /**
   * Initialize canvas
   */
  init() {
    this.container = document.getElementById('canvas');
    this.render();
  },

  /**
   * Render all star topology graphs
   */
  render() {
    this.container.innerHTML = '';

    Object.entries(Data.topDown.graphs).forEach(([namespace, graph]) => {
      const graphEl = this.renderGraph(namespace, graph);
      this.container.appendChild(graphEl);
    });
  },

  /**
   * Render a single star topology graph
   * @param {string} namespace
   * @param {Object} graph
   * @returns {HTMLElement}
   */
  renderGraph(namespace, graph) {
    const graphEl = Utils.createElement('div', ['star-graph']);
    Utils.setData(graphEl, 'namespace', namespace);

    // Render center node
    const centerEl = this.renderCenterNode(namespace, graph.centerTitle);
    graphEl.appendChild(centerEl);

    // Render child nodes
    graph.children.forEach((fullPath, index) => {
      const card = Data.topDown.cards[fullPath];
      const pos = this.RING_POSITIONS[1][index] || [0, 0];
      const childEl = this.renderChildNode(card, pos);
      graphEl.appendChild(childEl);
    });

    return graphEl;
  },

  /**
   * Render center node (not droppable)
   * @param {string} namespace
   * @param {string} title
   * @returns {HTMLElement}
   */
  renderCenterNode(namespace, title) {
    const cardEl = Utils.createElement('div', ['card', 'center']);
    Utils.setData(cardEl, 'path', namespace);
    Utils.setData(cardEl, 'isCenter', 'true');

    const titleEl = Utils.createElement('span', ['card-title']);
    titleEl.textContent = title;
    cardEl.appendChild(titleEl);

    return cardEl;
  },

  /**
   * Render child node (droppable)
   * @param {Object} card
   * @param {number[]} position - [row, col]
   * @returns {HTMLElement}
   */
  renderChildNode(card, position) {
    const [row, col] = position;
    const cardEl = Utils.createElement('div', ['card', 'child', `pos-${row}-${col}`]);
    Utils.setData(cardEl, 'path', card.fullPath);
    Utils.setData(cardEl, 'isCenter', 'false');

    const titleEl = Utils.createElement('span', ['card-title']);
    titleEl.textContent = card.title;
    cardEl.appendChild(titleEl);

    // Check for nested card
    const nestedId = Data.getNestedCardAt(card.fullPath);
    if (nestedId) {
      const nestedEl = this.renderNestedCard(nestedId);
      cardEl.appendChild(nestedEl);
    }

    return cardEl;
  },

  /**
   * Render a nested bottom-up card
   * @param {string} bottomUpId
   * @returns {HTMLElement}
   */
  renderNestedCard(bottomUpId) {
    const card = Data.getBottomUpCard(bottomUpId);
    if (!card) return null;

    const nestedEl = Utils.createElement('div', ['nested-card']);
    nestedEl.textContent = card.title;
    nestedEl.draggable = true;
    Utils.setData(nestedEl, 'cardId', bottomUpId);
    Utils.setData(nestedEl, 'source', 'canvas');

    // Click to inspect
    nestedEl.addEventListener('click', (e) => {
      e.stopPropagation();
      Modal.open(bottomUpId);
    });

    // Double-click to remove
    nestedEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const parentPath = Utils.getData(nestedEl.parentElement, 'path');
      if (parentPath) {
        Data.unnestCard(parentPath);
        this.render();
        Library.render();
      }
    });

    return nestedEl;
  },

  /**
   * Update nested cards display for a specific bottom-up card
   * @param {string} bottomUpId
   */
  updateNestedCards(bottomUpId) {
    const card = Data.getBottomUpCard(bottomUpId);
    if (!card) return;

    // Find all nested cards with this ID and update their title
    const nestedEls = this.container.querySelectorAll(`.nested-card[data-card-id="${bottomUpId}"]`);
    nestedEls.forEach(el => {
      el.textContent = card.title;
    });
  },

  /**
   * Get top-down card element by path
   * @param {string} path
   * @returns {HTMLElement|null}
   */
  getCardElement(path) {
    return this.container.querySelector(`.card[data-path="${path}"]`);
  },

  /**
   * Add nested card to a top-down card element
   * @param {string} topDownPath
   * @param {string} bottomUpId
   */
  addNestedCard(topDownPath, bottomUpId) {
    const cardEl = this.getCardElement(topDownPath);
    if (!cardEl) return;

    // Remove existing nested card if any
    const existing = cardEl.querySelector('.nested-card');
    if (existing) {
      existing.remove();
    }

    // Add new nested card
    const nestedEl = this.renderNestedCard(bottomUpId);
    if (nestedEl) {
      cardEl.appendChild(nestedEl);
    }
  },

  /**
   * Remove nested card from a top-down card element
   * @param {string} topDownPath
   */
  removeNestedCard(topDownPath) {
    const cardEl = this.getCardElement(topDownPath);
    if (!cardEl) return;

    const nestedEl = cardEl.querySelector('.nested-card');
    if (nestedEl) {
      nestedEl.remove();
    }
  }
};
