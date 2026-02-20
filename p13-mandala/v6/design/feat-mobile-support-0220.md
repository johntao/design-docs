# revisions

## revision 4

we need to rework toolbar a bit
1. remove the unnecessary wrapper `mc-toolbar`
    - inline the content of `mc-toolbar` into `mc-side-panel`
2. make the `mc-side-panel` more descriptive
    - users should know that the last three buttons are for loading demo data
    - use descriptive separator, or title attribute to explain a bit
    - also, in the help modal popup, there should be a dedicated section to explain the functions inside the `mc-side-panel`

the second thing is about `mc-ring-menu` for big screen
on big screen it works as hold-drag-release which is prone to trigger the default browser behavior for text selection
please make sure the app doesn't trigger text selection for any hold-drag movement
lastly, `mc-ring-menu` should show immediately once the users trigger pointerdown for big screen
the current version shows the ring only when users start moving the pointer
please fix these issues accordingly
