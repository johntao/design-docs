# revisions

## revision 1

refer to patch file @v6/_patch which contains implementation of design draft @v6/design/feat-mobile-support-0214.md
I need to do a few experiments on newly introduce command palette
please help create a minimal command palette prototype in a separate file
here are the things I would like to examinate further:
1. reduce the delay of the command palette ring (currently 300ms)
2. support immediately fire (swipe to fire) before the ring shows up
3. simply click cell to activate the ring, click else where to close the ring

## revision 2

analyze the pros and cons of these two approaches
I would like to know what's the best practice in the current industry
and have some insight of the ergonomic difference between the two

1. the first one is swipe-based, the ring may or may not show in the process; it depends on how fast the user release their pointer
- the ring dismiss as soon as users release their pointer

2. the second one is click-based, the ring shows whenever users click on an item
- the ring dismiss on the second click

## revision 3

I figured it out the best practice!
we have plenty things to do

## fix this first

the first thing is that in the previous version we've implemented a feature allowing users to mouse click on a focused element to activate "create or update" modal function
you can refer to file @v6/_patch.txt for information
the thing is that this feature conflicts with `ring-menu` approach
now that we use ring approach, no need to support that much click events
just keep the one that click on the status icon to switch task status

the second thing is that we missed a cancel button in the middle of the ring
it is not necessary for hold-drag-release approach, however, it is crucial for the click-to-open approach
put this icon 🚫 in the middle of the ring for dismission

## about industrial standards on ring menu interaction

my take is to split implementation for different devices
1. devices with screen big enough to fit 9x9 grid
2. devices that overflow and require scrollbars to see the whole grid

for big screen devices, it is safe to use hold-and-release approach
for smaller screen, we should stick to click to open, then click to close

## big screen interaction details

in the current version the app require users to focus a cell first, then the `ring-menu` is activable
it is safe to remove this constraint, no need prior focus to activate. users may activate the ring menu directly

### allow immediate activation

if users know what they're doing, then can swipe to activate the actions before the ring menu actually show up

### allow hesitation

the hybrid approach from Blender is very impressive
we should keep this feature in case users hesitate and accidentally release holding their pointers
- if users release the pointers under the threshold, dismiss the ring
- if users hesitate over the threshold without releasing, keep the ring

## small screen interaction details

holding pointers now only let users scroll over the grid

in the current version the app require users to focus a cell first, then activate the `ring-menu` with a second click
we should make a configurable option to let users decide whether two-step to open the ring or not
the app defaults to one-click to open (i.e. no need a prior focus to activate the ring menu)

## rework help modal and side-panel

we have a few problems in the current version
1. the styling of the help-modal looks awful
2. help-modal is duplicating content from the side-panel
3. no way to click to open the help modal popup

let's fix it

1. rework the style of the help-modal
    - don't use `<table>` to align content, instead use the same way as `side-panel` to style its help content
2. remove help text from the side-panel; side-panel should keep only clickable commands (buttons)
    - after removing all the text content, the side-panel is now a simple toolbar
    - let's redesign it as a thin one-column layout (i.e. do not show multiple elements in a line)
3. introduce a new button below the `toggle-btn` to activate the help modal
    - the button display as a single unicode character '❔'