/**
 * Library - Right Panel Card Library for Card Peeker
 */
const Library = {
  container: null,

  /**
   * Initialize library
   */
  init() {
    this.container = document.getElementById('card-library');
    this.render();
  },

  /**
   * Render all library cards
   */
  render() {
    this.container.innerHTML = '';

    Object.values(Data.bottomUp.cards).forEach(card => {
      const cardEl = this.renderCard(card);
      this.container.appendChild(cardEl);
    });
  },

  /**
   * Render a single library card
   * @param {Object} card
   * @returns {HTMLElement}
   */
  renderCard(card) {
    const cardEl = Utils.createElement('div', ['library-card']);
    cardEl.draggable = true;
    Utils.setData(cardEl, 'cardId', card.id);
    Utils.setData(cardEl, 'source', 'library');

    // Title
    const titleEl = Utils.createElement('div', ['library-card-title']);
    titleEl.textContent = card.title;
    cardEl.appendChild(titleEl);

    // Tags
    const tagsEl = Utils.createElement('div', ['library-card-tags']);
    if (card.tags.length > 0) {
      tagsEl.textContent = 'tags: ' + card.tags.join(', ');
    }
    cardEl.appendChild(tagsEl);

    // Click to inspect
    cardEl.addEventListener('click', (e) => {
      // Don't open if we're dragging
      if (!cardEl.classList.contains('dragging')) {
        Modal.open(card.id);
      }
    });

    return cardEl;
  },

  /**
   * Update a specific card display
   * @param {string} cardId
   */
  updateCard(cardId) {
    const card = Data.getBottomUpCard(cardId);
    if (!card) return;

    const cardEl = this.container.querySelector(`.library-card[data-card-id="${cardId}"]`);
    if (!cardEl) return;

    // Update title
    const titleEl = cardEl.querySelector('.library-card-title');
    if (titleEl) {
      titleEl.textContent = card.title;
    }

    // Update tags
    const tagsEl = cardEl.querySelector('.library-card-tags');
    if (tagsEl) {
      tagsEl.textContent = card.tags.length > 0
        ? 'tags: ' + card.tags.join(', ')
        : '';
    }
  },

  /**
   * Get library card element by ID
   * @param {string} cardId
   * @returns {HTMLElement|null}
   */
  getCardElement(cardId) {
    return this.container.querySelector(`.library-card[data-card-id="${cardId}"]`);
  }
};
