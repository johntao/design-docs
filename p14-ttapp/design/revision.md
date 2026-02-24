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

tweak the merge button logic a bit
current: stop the running task; add the duration to the previous task; discard the current task
expected: keep the running task; set the start time to the previous task; discard the previous task

note that I've modulize the project, thus, you need to look up the web components in the separated files
you can find them under the folder @js/

### rework tt-entry-edit

current: single tap the duration field for additive ops; double tap the duration field for assignment ops
expected: single tap the duration field for assignment ops

replace the previous additive ops by a new widget

dock two buttons '+' and '−' right below the duration field (you may use the latest CSS anchor feature to do it)
tap and hold the buttons would populate a vertical bar with markers (5 min per steps, totally 12 steps)
users release the button to apply the additive ops to the duration field

lastly, retain the focus effect on the three temporal fields
current:
1. a red borders appeared when users click on any of the field
2. the state of the below dial control is changed
3. users apply changes using the dial control
4. the red borders disappear; changes to the dial control no longer reflect to the selected field

expected:
1. a red borders appeared when users click on any of the field
2. the state of the below dial control is changed
3. users apply changes using the dial control
4. the red borders is retained; changes to the dial control still reflect to the selected field