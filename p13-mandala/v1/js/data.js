/**
 * Data management for Card Peeker
 */
const Data = {
  // Static initial data
  INITIAL_TOP_DOWN: [
    'user-type/dev',
    'user-type/user',
    'user-type/org',
    'dev-type/generic',
    'dev-type/support',
    'dev-type/core',
    'income-type/fast',
    'income-type/slow_shiny',
    'income-type/slow_relic'
  ],

  INITIAL_BOTTOM_UP: [
    'blog-post30',
    'web-blog4',
    'web-scrap3',
    'game-snake2',
    'vscode-ext1',
    'bx-tool4'
  ],

  STORAGE_KEYS: {
    BOTTOM_UP: 'cardPeeker_bottomUp',
    NESTING: 'cardPeeker_nesting'
  },

  // Runtime data
  topDown: {
    cards: {},    // { fullPath: { id, title, namespace, fullPath, isCenter } }
    graphs: {}    // { namespace: { centerId, centerTitle, children: [] } }
  },

  bottomUp: {
    cards: {}     // { id: { id, title, content, tags: [] } }
  },

  nestingState: {}, // { topDownPath: [bottomUpId1, bottomUpId2, ...] }

  /**
   * Initialize data - parse and load from storage
   */
  init() {
    this.parseTopDownData();
    this.loadFromStorage();
  },

  /**
   * Parse top-down cards from initial data
   */
  parseTopDownData() {
    const graphs = {};

    this.INITIAL_TOP_DOWN.forEach(fullPath => {
      const namespace = Utils.parseNamespace(fullPath);
      const title = Utils.parseTitle(fullPath);
      const isCenter = !Utils.hasNamespace(fullPath);

      // Create card entry
      this.topDown.cards[fullPath] = {
        id: Utils.slugify(fullPath),
        title: title,
        namespace: namespace,
        fullPath: fullPath,
        isCenter: isCenter
      };

      // Build graph structure
      if (!graphs[namespace]) {
        graphs[namespace] = {
          centerId: namespace,
          centerTitle: namespace,
          children: []
        };
      }

      if (!isCenter) {
        graphs[namespace].children.push(fullPath);
      }
    });

    this.topDown.graphs = graphs;
  },

  /**
   * Load data from localStorage
   */
  loadFromStorage() {
    // Load bottom-up cards
    const storedBottomUp = localStorage.getItem(this.STORAGE_KEYS.BOTTOM_UP);
    if (storedBottomUp) {
      try {
        this.bottomUp.cards = JSON.parse(storedBottomUp);
      } catch (e) {
        console.error('Failed to parse bottom-up cards:', e);
        this.initBottomUpCards();
      }
    } else {
      this.initBottomUpCards();
    }

    // Load nesting state
    const storedNesting = localStorage.getItem(this.STORAGE_KEYS.NESTING);
    if (storedNesting) {
      try {
        this.nestingState = JSON.parse(storedNesting);
      } catch (e) {
        console.error('Failed to parse nesting state:', e);
        this.nestingState = {};
      }
    }
  },

  /**
   * Initialize bottom-up cards from initial data
   */
  initBottomUpCards() {
    this.bottomUp.cards = {};
    this.INITIAL_BOTTOM_UP.forEach(title => {
      this.bottomUp.cards[title] = {
        id: title,
        title: title,
        content: '',
        tags: []
      };
    });
    this.saveBottomUp();
  },

  /**
   * Save bottom-up cards to localStorage
   */
  saveBottomUp() {
    localStorage.setItem(
      this.STORAGE_KEYS.BOTTOM_UP,
      JSON.stringify(this.bottomUp.cards)
    );
  },

  /**
   * Save nesting state to localStorage
   */
  saveNesting() {
    localStorage.setItem(
      this.STORAGE_KEYS.NESTING,
      JSON.stringify(this.nestingState)
    );
  },

  /**
   * Get a bottom-up card by ID
   * @param {string} id
   * @returns {Object|null}
   */
  getBottomUpCard(id) {
    return this.bottomUp.cards[id] || null;
  },

  /**
   * Update a bottom-up card
   * @param {string} id
   * @param {Object} updates
   */
  updateBottomUpCard(id, updates) {
    if (this.bottomUp.cards[id]) {
      Object.assign(this.bottomUp.cards[id], updates);
      this.saveBottomUp();
    }
  },

  /**
   * Get nested card IDs at a top-down path
   * @param {string} topDownPath
   * @returns {string[]}
   */
  getNestedCardsAt(topDownPath) {
    return this.nestingState[topDownPath] || [];
  },

  /**
   * Get the path where a bottom-up card is nested in a specific graph
   * @param {string} bottomUpId
   * @param {string} namespace
   * @returns {string|null}
   */
  getNestedPathInGraph(bottomUpId, namespace) {
    for (const [path, ids] of Object.entries(this.nestingState)) {
      if (Utils.parseNamespace(path) === namespace && ids.includes(bottomUpId)) {
        return path;
      }
    }
    return null;
  },

  /**
   * Check if a bottom-up card is already in a graph
   * @param {string} bottomUpId
   * @param {string} namespace
   * @returns {boolean}
   */
  isCardInGraph(bottomUpId, namespace) {
    return this.getNestedPathInGraph(bottomUpId, namespace) !== null;
  },

  /**
   * Check if a card can be nested at a target
   * @param {string} bottomUpId
   * @param {string} targetPath
   * @returns {{ valid: boolean, reason?: string }}
   */
  canNestCard(bottomUpId, targetPath) {
    const targetCard = this.topDown.cards[targetPath];

    // Cannot drop on non-existent card
    if (!targetCard) {
      return { valid: false, reason: 'Invalid target' };
    }

    // Cannot drop on center node
    if (!Utils.hasNamespace(targetPath)) {
      return { valid: false, reason: 'Cannot drop on center node' };
    }

    const namespace = Utils.parseNamespace(targetPath);

    // Check if this specific card is already in this graph
    // If so, it's a move operation (allowed)
    if (this.isCardInGraph(bottomUpId, namespace)) {
      return { valid: true };
    }

    // Multiple different cards can be nested in the same top-down card
    // so no need to check if target already has cards
    return { valid: true };
  },

  /**
   * Nest a bottom-up card at a top-down path
   * @param {string} bottomUpId
   * @param {string} targetPath
   * @returns {boolean} success
   */
  nestCard(bottomUpId, targetPath) {
    const check = this.canNestCard(bottomUpId, targetPath);
    if (!check.valid) {
      console.warn('Cannot nest card:', check.reason);
      return false;
    }

    const namespace = Utils.parseNamespace(targetPath);
    const existingPath = this.getNestedPathInGraph(bottomUpId, namespace);

    // Remove from previous position in this graph if exists
    if (existingPath) {
      this.removeCardFromPath(bottomUpId, existingPath);
      this.removeTag(bottomUpId, existingPath);
    }

    // Add to new position
    if (!this.nestingState[targetPath]) {
      this.nestingState[targetPath] = [];
    }
    if (!this.nestingState[targetPath].includes(bottomUpId)) {
      this.nestingState[targetPath].push(bottomUpId);
    }
    this.addTag(bottomUpId, targetPath);

    this.saveNesting();
    return true;
  },

  /**
   * Remove a specific bottom-up card from a top-down path
   * @param {string} bottomUpId
   * @param {string} topDownPath
   */
  removeCardFromPath(bottomUpId, topDownPath) {
    if (this.nestingState[topDownPath]) {
      this.nestingState[topDownPath] = this.nestingState[topDownPath].filter(id => id !== bottomUpId);
      if (this.nestingState[topDownPath].length === 0) {
        delete this.nestingState[topDownPath];
      }
    }
  },

  /**
   * Remove a nested card from a top-down path (by bottomUpId)
   * @param {string} bottomUpId
   * @param {string} topDownPath
   */
  unnestCard(bottomUpId, topDownPath) {
    if (this.nestingState[topDownPath] && this.nestingState[topDownPath].includes(bottomUpId)) {
      this.removeCardFromPath(bottomUpId, topDownPath);
      this.removeTag(bottomUpId, topDownPath);
      this.saveNesting();
    }
  },

  /**
   * Add a tag to a bottom-up card
   * @param {string} bottomUpId
   * @param {string} tag
   */
  addTag(bottomUpId, tag) {
    const card = this.bottomUp.cards[bottomUpId];
    if (card && !card.tags.includes(tag)) {
      card.tags.push(tag);
      this.saveBottomUp();
    }
  },

  /**
   * Remove a tag from a bottom-up card
   * @param {string} bottomUpId
   * @param {string} tag
   */
  removeTag(bottomUpId, tag) {
    const card = this.bottomUp.cards[bottomUpId];
    if (card) {
      card.tags = card.tags.filter(t => t !== tag);
      this.saveBottomUp();
    }
  }
};
