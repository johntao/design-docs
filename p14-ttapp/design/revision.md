# revision

## v1

please do the following visual update

use light theme instead of dark theme

rework toolbar
- keep btn-config and btn-help, remove the others
- hide the toolbar into a symbol '⋮'
  - make it float at the top-right of the screen
  - tap it to shows btn-config and btn-help
  - tap elsewhere to hide it again

introduce trigger widget
- move task-trigger, timer, btn-stop, btn-merge from the toolbar to this widget
- fixed trigger widget in the middle of the screen (both horizontally and vertically centered)

## revision 2: rework trigger widget UX

predefined tasks with estimation duration should display differently in the ring menu
- prefix the task name by `[est dur]` would be sufficient

disable users from changing the task name if there's a running task

a task start running immediately on users change the task name using the ring menu

combine btn-play and btn-stop into one button
- shows '⏹' if there's a running task
  - click to save the current running task to the history
  - reset to the status where a predefined task is loaded
  - make sure to display the estimation duration if defined
- shows '▶' if there isn't any running task
  - click it to start another running task

add a new button '✕' to discard the current running task
- reset to the status where a predefined task is loaded
- make sure to display the estimation duration if defined

## revision 3

tweak the merge button logic