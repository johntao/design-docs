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

  nestingState: {}, // { topDownPath: bottomUpId }

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
   * Get nested card ID at a top-down path
   * @param {string} topDownPath
   * @returns {string|null}
   */
  getNestedCardAt(topDownPath) {
    return this.nestingState[topDownPath] || null;
  },

  /**
   * Check if a graph already has a nested card
   * @param {string} namespace
   * @returns {boolean}
   */
  graphHasNestedCard(namespace) {
    return Object.keys(this.nestingState).some(
      path => Utils.parseNamespace(path) === namespace
    );
  },

  /**
   * Get the path where a bottom-up card is nested in a specific graph
   * @param {string} bottomUpId
   * @param {string} namespace
   * @returns {string|null}
   */
  getNestedPathInGraph(bottomUpId, namespace) {
    return Object.entries(this.nestingState).find(
      ([path, id]) => id === bottomUpId && Utils.parseNamespace(path) === namespace
    )?.[0] || null;
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
    const existingPath = this.getNestedPathInGraph(bottomUpId, namespace);

    // If card is already in this graph, it's a move operation (allowed)
    if (existingPath) {
      return { valid: true };
    }

    // Check if graph already has a different nested card
    if (this.graphHasNestedCard(namespace)) {
      return { valid: false, reason: 'Graph already has a nested card' };
    }

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
      delete this.nestingState[existingPath];
      this.removeTag(bottomUpId, existingPath);
    }

    // Add to new position
    this.nestingState[targetPath] = bottomUpId;
    this.addTag(bottomUpId, targetPath);

    this.saveNesting();
    return true;
  },

  /**
   * Remove a nested card from a top-down path
   * @param {string} topDownPath
   */
  unnestCard(topDownPath) {
    const bottomUpId = this.nestingState[topDownPath];
    if (bottomUpId) {
      delete this.nestingState[topDownPath];
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
