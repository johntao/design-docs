# revision

the prompt to merge revision into draft:

```
refer to file @design/revision.md
we've gradually introduced a few more fix sequentially
merge these new fix into draft file @design/draft.md

lastly, we now have the big picture of this app
there are three major module composed by several smaller components
these are the three major module
1. the trigger (to start/ stop a task)
2. the time entry editor
3. the predefined tasks config modal

I am expecting to make a few changes to the second and third module in the upcoming session
```

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

## revision 4

tweak the UI of vertical step bar

1. display the steps ascendingly from top to bottom (00 to 60)
2. dragging behavior also starts from top to bottom

please dig into the function _onBarMove
I believe there should be an offset based on the vertical delta between the top of the vertical bar and the pointer
current: when users start dragging; the value always jump start from the middle of the vertical bar
expected: when users start dragging; the value starts from the zero value of the vertical bar

## revision 5

introducing these functions to `tt-config`

add import/ export predefined task config
make sure to include uuid in the predefined task to avoid duplication (discard duplication on import)

tweak the import/ export logic a bit
allow users edit data from external editors, so if duplication found, update the current data instead of discard
allow users to omit uuid by any falsy js values, if omitted, generate a valid uuid automatically

introduce new function:
load sample data from path `./sample/config.json`
add a button to the Task Config section "Load Sample Task"

## revision 6

refer to file @./test1.html
this is a file that replicate the TtRingMenu component
the difference is that this file does works on an iPhone device while the current implementation in TtRingMenu doesn't
current: drag and release the pointer doesn't activate any menu item and close it; also, text selection were triggered
expected: drag and release the pointer activate a menu item and close it; doesn't trigger text selection
please compare the difference and apply the changes

## revision 7

refer to file @./test2.html
this is a file to extract a new web component from @./js/TtEntryEdit.js

please replace the existing logic in @./js/TtEntryEdit.js by the newly introduced file @./js/TtTimespan.js
noted that the three temporal "startTime, endTime, duration" are now encapsulated into a timespan object
and the new component TtTimespan use the encapsulated object to interop