/**
 * Drag and Drop handler for Card Peeker
 */
const DragDrop = {
  draggedCardId: null,
  dragSource: null,        // 'library' | 'canvas'
  originalParentPath: null, // For canvas drags - the original top-down card path

  /**
   * Initialize drag and drop
   */
  init() {
    this.setupLibraryDrag();
    this.setupCanvasDrag();
    this.setupDropZones();
  },

  /**
   * Setup drag events for library cards
   */
  setupLibraryDrag() {
    const library = document.getElementById('card-library');

    library.addEventListener('dragstart', (e) => {
      const cardEl = e.target.closest('.library-card');
      if (!cardEl) return;

      this.draggedCardId = Utils.getData(cardEl, 'cardId');
      this.dragSource = 'library';
      this.originalParentPath = null;

      cardEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.draggedCardId);
    });

    library.addEventListener('dragend', (e) => {
      const cardEl = e.target.closest('.library-card');
      if (cardEl) {
        cardEl.classList.remove('dragging');
      }
      this.clearDragState();
    });
  },

  /**
   * Setup drag events for nested cards in canvas
   */
  setupCanvasDrag() {
    const canvas = document.getElementById('canvas');

    canvas.addEventListener('dragstart', (e) => {
      const nestedEl = e.target.closest('.nested-card');
      if (!nestedEl) return;

      this.draggedCardId = Utils.getData(nestedEl, 'cardId');
      this.dragSource = 'canvas';

      // Get original parent path
      const parentCard = nestedEl.closest('.card');
      if (parentCard) {
        this.originalParentPath = Utils.getData(parentCard, 'path');
      }

      nestedEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.draggedCardId);
    });

    canvas.addEventListener('dragend', (e) => {
      const nestedEl = e.target.closest('.nested-card');
      if (nestedEl) {
        nestedEl.classList.remove('dragging');
      }
      this.clearDropIndicators();
      this.clearDragState();
    });
  },

  /**
   * Setup drop zones on canvas
   */
  setupDropZones() {
    const canvas = document.getElementById('canvas');

    // Dragover - must prevent default to allow drop
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const cardEl = e.target.closest('.card.child');
      if (cardEl && this.draggedCardId) {
        const path = Utils.getData(cardEl, 'path');
        const check = Data.canNestCard(this.draggedCardId, path);

        this.clearDropIndicators();

        if (check.valid) {
          cardEl.classList.add('drop-target');
        } else {
          cardEl.classList.add('drop-invalid');
        }
      }
    });

    // Drag enter
    canvas.addEventListener('dragenter', (e) => {
      e.preventDefault();
    });

    // Drag leave
    canvas.addEventListener('dragleave', (e) => {
      const cardEl = e.target.closest('.card');
      if (cardEl) {
        cardEl.classList.remove('drop-target', 'drop-invalid');
      }
    });

    // Drop on card
    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this.clearDropIndicators();

      if (!this.draggedCardId) return;

      const cardEl = e.target.closest('.card.child');

      if (cardEl) {
        // Drop on a child card
        const targetPath = Utils.getData(cardEl, 'path');
        this.handleDropOnCard(targetPath);
      } else if (e.target.closest('.canvas') || e.target.id === 'canvas') {
        // Drop on background (Action 3)
        this.handleDropOnBackground();
      }
    });
  },

  /**
   * Handle drop on a top-down card
   * @param {string} targetPath
   */
  handleDropOnCard(targetPath) {
    const check = Data.canNestCard(this.draggedCardId, targetPath);

    if (!check.valid) {
      console.warn('Drop rejected:', check.reason);
      return;
    }

    // Check if this card is already nested somewhere in the same graph
    // (applies to both library and canvas drags)
    const namespace = Utils.parseNamespace(targetPath);
    const existingPath = Data.getNestedPathInGraph(this.draggedCardId, namespace);
    if (existingPath) {
      Canvas.removeNestedCard(existingPath);
    }

    // If from canvas and moving to a different graph, also remove from original
    if (this.dragSource === 'canvas' && this.originalParentPath && this.originalParentPath !== existingPath) {
      Canvas.removeNestedCard(this.originalParentPath);
    }

    // Nest the card
    const success = Data.nestCard(this.draggedCardId, targetPath);

    if (success) {
      // Update canvas
      Canvas.addNestedCard(targetPath, this.draggedCardId);

      // Update library
      Library.updateCard(this.draggedCardId);
    }
  },

  /**
   * Handle drop on canvas background (remove nesting)
   */
  handleDropOnBackground() {
    if (this.dragSource !== 'canvas' || !this.originalParentPath) {
      return; // Only works for cards dragged from canvas
    }

    // Remove the nesting
    Data.unnestCard(this.originalParentPath);

    // Update canvas
    Canvas.removeNestedCard(this.originalParentPath);

    // Update library
    Library.updateCard(this.draggedCardId);
  },

  /**
   * Clear all drop indicators
   */
  clearDropIndicators() {
    document.querySelectorAll('.drop-target, .drop-invalid').forEach(el => {
      el.classList.remove('drop-target', 'drop-invalid');
    });
  },

  /**
   * Clear drag state
   */
  clearDragState() {
    this.draggedCardId = null;
    this.dragSource = null;
    this.originalParentPath = null;
  }
};
