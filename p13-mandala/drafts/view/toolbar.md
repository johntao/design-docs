# toolbar

mc-toolbar web component: toolbar with export, import, and keyboard layout options.

## buttons

### export

dumps the current tree data to a plain-text file download.

behavior:
- serialize tree using the text format (see model/migration.md)
- trigger browser file download
- file name = root title (or default name if root is blank)

### import

loads data from a plain-text file, replacing all current data.

behavior:
- open file picker via hidden `<input type="file">`
- parse the selected file (see model/migration.md for format)
- clear existing data
- populate tree from parsed data
- save to localStorage
- re-render grid

### keyboard layout selector

a `<select>` dropdown for choosing keyboard emulation.

options:
- QWERTY (default)
- Dvorak

on change:
- remap all keybindings at the keydown handler level
- update help-bar and help-modal to show remapped keys
- no data changes; purely input remapping

## layout

```html
<div class="toolbar">
  <button class="btn-export">Export</button>
  <button class="btn-import">Import</button>
  <input type="file" hidden />
  <select class="layout-select">
    <option value="qwerty">QWERTY</option>
    <option value="dvorak">Dvorak</option>
  </select>
</div>
```

## position

below the help-bar, at the bottom of the app.

## styling

- minimal button styling
- inline layout (buttons side by side)
- select dropdown matches button height
