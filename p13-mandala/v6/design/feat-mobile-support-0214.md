# new feature

I need to support mobile users  
let's make a few more enhancement:
- let the right-side bar collapsible without using shortcuts
  - make a clickable element allowing users to toggle it
- adjust the grid size logic to adapt different size of devices
  - for smaller size screen, set the min-height of a cell to 100px
  - for a larger size screen, let the 9x9 grid fit into 100vh (we've already implemented this)
- introduce mousedown/ mouseup actions

## mousedown/ mouseup

this feature aims to gracefully support mobile devices
a mobile user is accessible to touchscreen hold and release
if I understand correctly, we could use mousedown and mouseup event to achieve this

we're going to implement these functions:
- item creation (mouse double click for desktop users)
- item deletion (hit `del` for desktop users)
- item inline edit (mouse click on title field)
- item detail edit (mouse click on rest of the area)

the implementation is simple
once users focus on a cell, then mousedown on the same cell
the app should populate a command palette around the cursor (a ring-like palette surrounding the cursor)
use these four unicode characters to represent the function:
- 💡 for creation
- 🗑 for deletion
- 📝 for inline edit
- 🔍 for detail edit

users may hold and drag their pointer to the command icon they wish to activate
once they release holding, the command is fired
if the pointer is not on any of the command icons, then, no-op