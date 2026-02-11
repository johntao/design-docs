# grid

mc-grid web component: the 9x9 mandala chart grid.

## structure

9x9 cells organized as nested grids:
- 3x3 outer grid (og)
- each outer cell contains a 3x3 inner grid (ig)
- total: 81 mc-cell components

## coordinate systems

### flat index

`cells[row, col]` where row and col range 0-8.
flat index = `row * 9 + col` (0-80).

### nested index

`og[oRow, oCol][iRow, iCol]` where each ranges 0-2.
conversion: `row = oRow * 3 + iRow`, `col = oCol * 3 + iCol`.

## CSS implementation

- uses CSS subgrid feature
- outer grid: `display: grid; grid-template: repeat(3, 1fr) / repeat(3, 1fr);`
- each outer cell: `display: subgrid;` spanning 3 rows and 3 columns
- visual separation between outer cells (thicker borders or gaps)

## shadow DOM

```html
<mc-grid>
  <!-- shadow root -->
  <div class="grid-container">
    <!-- 9 outer cells, each containing 9 inner cells -->
    <div class="outer-cell" data-og="0,0">
      <mc-cell data-pos="0"></mc-cell>
      <mc-cell data-pos="1"></mc-cell>
      ...
      <mc-cell data-pos="8"></mc-cell>
    </div>
    <div class="outer-cell" data-og="0,1">
      ...
    </div>
    ...
  </div>
</mc-grid>
```

## cell access

provides methods to access cells by position:
- by flat index: `getCellByIndex(index)`
- by nested coordinates: `getCellByOgIg(oRow, oCol, iRow, iCol)`

## visual cues

- center outer cell `og[1,1]` may have subtle background to highlight the root area
- thicker borders between outer cells to visually group subgrids
- equal-sized cells within the grid
