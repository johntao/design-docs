# new feature set

- rework the layout
  - implement side panel that docks in the right side of the app
  - rename `mc-data-migration` as `mc-toolbar`
  - put descriptive help text and `mc-toolbar` in the right panel
  - remove the bottom help bar
  - remove help modal popup
  - hit '?' now collapse/ expand the right side help panel
    - defaults to expand
  - make the body layout 100vh height
  - make the `mc-grid` width flex grow
- introduce new shortcut keys
  - `HJKL` that works similar to `hjkl` except that it move 3 units at a time
    - stop on overflow
  - `Y` complete all children tasks
    - doesn't affect NA items
    - fire a redo toast as the operation is non-idempotent
  - make `enter` as shortcut `o` alias
- adjust UI logic for NA item
  - make it display `📝 NA` instead of showing nothing


- support complete mouse click actions
  - the following click event only works when a `mc-cell` is focused