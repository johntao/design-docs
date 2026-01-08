/**
 * Canvas - Star Topology Renderer for Card Peeker
 */
const Canvas = {
  container: null,

  // Ring positions in 3x3 grid (row, col)
  // 8 positions around center, clockwise from top-left
  RING_POSITIONS: [
    [0, 0], [0, 1], [0, 2],  // top row
    [1, 2],                   // right side
    [2, 2], [2, 1], [2, 0],  // bottom row
    [1, 0]                    // left side
  ],

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

    // Render child nodes (max 8 per graph in 3x3 grid)
    graph.children.forEach((fullPath, index) => {
      if (index >= 8) return; // Skip if more than 8 children
      const card = Data.topDown.cards[fullPath];
      const pos = this.RING_POSITIONS[index];
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

    // Check for nested cards (multiple allowed)
    const nestedIds = Data.getNestedCardsAt(card.fullPath);
    if (nestedIds.length > 0) {
      const containerEl = Utils.createElement('div', ['nested-cards-container']);
      nestedIds.forEach(nestedId => {
        const nestedEl = this.renderNestedCard(nestedId);
        if (nestedEl) {
          containerEl.appendChild(nestedEl);
        }
      });
      cardEl.appendChild(containerEl);
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
      const container = nestedEl.closest('.nested-cards-container');
      const parentCard = container ? container.parentElement : nestedEl.parentElement;
      const parentPath = Utils.getData(parentCard, 'path');
      if (parentPath) {
        Data.unnestCard(bottomUpId, parentPath);
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

    // Get or create container
    let containerEl = cardEl.querySelector('.nested-cards-container');
    if (!containerEl) {
      containerEl = Utils.createElement('div', ['nested-cards-container']);
      cardEl.appendChild(containerEl);
    }

    // Check if card already exists in this container
    const existing = containerEl.querySelector(`.nested-card[data-card-id="${bottomUpId}"]`);
    if (existing) return;

    // Add new nested card
    const nestedEl = this.renderNestedCard(bottomUpId);
    if (nestedEl) {
      containerEl.appendChild(nestedEl);
    }
  },

  /**
   * Remove a specific nested card from a top-down card element
   * @param {string} topDownPath
   * @param {string} bottomUpId
   */
  removeNestedCard(topDownPath, bottomUpId) {
    const cardEl = this.getCardElement(topDownPath);
    if (!cardEl) return;

    const nestedEl = cardEl.querySelector(`.nested-card[data-card-id="${bottomUpId}"]`);
    if (nestedEl) {
      nestedEl.remove();
    }

    // Clean up empty container
    const containerEl = cardEl.querySelector('.nested-cards-container');
    if (containerEl && containerEl.children.length === 0) {
      containerEl.remove();
    }
  }
};
