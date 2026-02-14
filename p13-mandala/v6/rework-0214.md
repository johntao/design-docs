# rework

we need to rework the application
I found out that `mc-cell` should display less info whenever possible
1. remove description from `mc-cell`; user must hit 'o' to check the description field
2. make the title field wrap and span multiple lines
3. hide progress from a leaf node (lvl2)
4. rework the logic of task status and progression

## task statuses and progression

root, lvl1, and lvl2 node should have different display logic

### lvl2 node (leaf node)

no need to display the progress
show only task status is sufficient
there are three possible statuses
1. NA 📄
2. now 🟩
3. done ✅

users may hit 'y' to toggle different status of a lvl2 node

#### visualization

the task status should inline with the title field

### lvl1 node

display the progress automatically when the lvl1 node containing at least one lvl1 task node (a node with status of now or done is a task node)
users may hit 'y' to toggle an icon (status) for lvl1 node
1. NA 📄
2. Goal 🎯
these two statuses affect the default status of a newly created lvl2 node
when lvl1 node set to NA, then newly created lvl2 node defaults to status 'NA'
when lvl1 node set to Goal, then newly create lvl2 node defaults to status 'Now'

#### visualization

the task status and the progress occupy one line
title field starts from the next line

### root node

display the progress automatically when there's at least one lvl2 descendant task node
a root node doesn't have a status property

#### visualization

the progress occupy one line
title field starts from the next line

### progression visual

`{percentage}% | {numerator} / {denominator}`


## revision 1

unify and simplify the display of progress, staus and title

### progression

no more showing numerator and denominator. just stick to `{percentage}%`
display numerator and denominator in the tooltip while hovering `{percentage}%`

### root

1. now always show a dummy icon 🎯
2. then follow by the progression (if any task node existing)
3. then follow by the title

make all three elements inline

### lvl1 node

1. show icon 🎯 or 📄
2. then follow by the progression (if any task node existing)
3. then follow by the title

make all three elements inline

### lvl2 node

1. show icon 📄, 🟩 and ✅
2. then follow by the title

make all three elements inline

#### editable field

currently, when the user hit 'i', an editable field appear
make sure the editable field is a block-level element that span multiple lines, instead of an inline text field


---

let's tweak the style of `mc-cell`
no need to show description in the cell
the cell display only the status, progress and title
make the title field wrap for a long string (wrap into multiple lines)
no need to show progress on a leaf node (lvl2)
make status and progress 

🎯

- support complete mouse click actions
  - the following click event only works when a `mc-cell` is focused