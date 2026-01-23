/**
 * Card Peeker - Main Application
 *
 * A card visualization app with star topology graphs
 * and drag-and-drop functionality.
 */
const App = {
  /**
   * Initialize the application
   */
  init() {
    // Initialize data first
    Data.init();

    // Initialize UI components
    Modal.init();
    Canvas.init();
    Library.init();

    // Initialize drag and drop last
    DragDrop.init();

    console.log('Card Peeker initialized');
  }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
