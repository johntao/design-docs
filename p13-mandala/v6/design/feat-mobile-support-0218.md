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
