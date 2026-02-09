import McCell from './components/mc-cell.js';
import McGrid from './components/mc-grid.js';
import McModal from './components/mc-modal.js';
import McNotifier from './components/mc-notifier.js';
import McHelpBar from './components/mc-help-bar.js';
import McHelpModal from './components/mc-help-modal.js';
import McDataMigration from './components/mc-data-migration.js';
import McApp from './components/mc-app.js';

customElements.define('mc-cell', McCell);

customElements.define('grid-row', class GridRow extends HTMLElement { });

customElements.define('mc-grid', McGrid);

customElements.define('mc-modal', McModal);

customElements.define('mc-notifier', McNotifier);

customElements.define('mc-help-bar', McHelpBar);

customElements.define('mc-help-modal', McHelpModal);

customElements.define('mc-data-migration', McDataMigration);

customElements.define('mc-app', McApp);