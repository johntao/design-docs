export default class McHelpBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
<style>
:host { display: block; margin-top: 10px; font-size: 11px; color: #666; line-height: 1.6; }
kbd { background: #eee; padding: 2px 5px; border-radius: 3px; border: 1px solid #ccc; font-family: monospace; }
</style>
<div>
<kbd>u</kbd> create |
<kbd>i</kbd> inline edit |
<kbd>o</kbd> detail edit |
<kbd>Del</kbd> delete |
<kbd>y</kbd> status |
<kbd>hjkl</kbd> walk |
<kbd>wersdfxcv</kbd> inner jump |
<kbd>WERSDFXCV</kbd> outer jump |
<kbd>?</kbd> help
</div>
    `;
  }
}