# new feature load sample data

a few principles:
- use text file to store sample data
  - the text file is compatible to the existing import/export function
- prepare buttons for each sample data
- before loading any data to the grid, check if root node is not null
  - if not null, prompt users to confirm the operation (suggest users to save their data ahead)
  - after loading up the data, fire an undoable toast for safety

a few more tasks before implementation:
- remove the capital 'Y' function from the app; we don't need this for now
- reword Import to Load; reword Export to Save
  - this is easier to understand for some users
- the existing Import function doesn't comply to the new spec
  - i.e. a prompt to confirm + an undoable toast

the implementation:
- insert a new section below the `mc-toolbar` component
- this section featuring demo data that users may load into the grid
- there are currently three demo data available inside the folder @v6/sample
- use three buttons to import these data separatedly
- the first one is goal demo; map to file @v6/sample/goal-01.txt
- the second one is task demo; map to file @v6/sample/task-01.txt
- the third one is weekly template; map to file @v6/sample/tpl-01.txt