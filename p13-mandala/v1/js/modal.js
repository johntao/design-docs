/**
 * Modal/Inspection popup for Card Peeker
 */
const Modal = {
  overlay: null,
  modal: null,
  closeBtn: null,
  titleInput: null,
  tagsDisplay: null,
  contentTextarea: null,
  currentCardId: null,

  /**
   * Initialize modal
   */
  init() {
    this.overlay = document.getElementById('modal-overlay');
    this.modal = document.getElementById('modal');
    this.closeBtn = document.getElementById('modal-close');
    this.titleInput = document.getElementById('card-title');
    this.tagsDisplay = document.getElementById('card-tags');
    this.contentTextarea = document.getElementById('card-content');

    this.setupEventListeners();
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());

    // Backdrop click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Auto-save on input change (debounced)
    const debouncedSave = Utils.debounce(() => this.save(), 300);

    this.titleInput.addEventListener('input', debouncedSave);
    this.contentTextarea.addEventListener('input', debouncedSave);
  },

  /**
   * Check if modal is open
   * @returns {boolean}
   */
  isOpen() {
    return this.overlay.classList.contains('active');
  },

  /**
   * Open modal with a bottom-up card
   * @param {string} cardId
   */
  open(cardId) {
    const card = Data.getBottomUpCard(cardId);
    if (!card) {
      console.error('Card not found:', cardId);
      return;
    }

    this.currentCardId = cardId;

    // Populate form
    this.titleInput.value = card.title;
    this.contentTextarea.value = card.content || '';

    // Display tags
    this.tagsDisplay.innerHTML = '';
    if (card.tags.length > 0) {
      card.tags.forEach(tag => {
        const tagEl = Utils.createElement('span', ['tag']);
        tagEl.textContent = tag;
        this.tagsDisplay.appendChild(tagEl);
      });
    }

    // Show modal
    this.overlay.classList.add('active');
    this.titleInput.focus();
  },

  /**
   * Close modal
   */
  close() {
    this.overlay.classList.remove('active');
    this.currentCardId = null;
  },

  /**
   * Save current card data
   */
  save() {
    if (!this.currentCardId) return;

    Data.updateBottomUpCard(this.currentCardId, {
      title: this.titleInput.value,
      content: this.contentTextarea.value
    });

    // Update library display
    Library.updateCard(this.currentCardId);

    // Update any nested cards in canvas
    Canvas.updateNestedCards(this.currentCardId);
  }
};
