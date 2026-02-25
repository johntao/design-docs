# cross device support

refer to file @js/TtRingMenu.js
I need to create a prototype file at @./test1.html
this file replicate the UI/ UX logic of TtRingMenu

I need to investigate the reason why pointermove behavior on a iPhone browser act differently from a desktop browser
current: drag and release the pointer doesn't activate any menu item and close it; also, text selection were triggered
expected: drag and release the pointer activate a menu item and close it; doesn't trigger text selection

this test file should include three different ring menu, implementing using different browser events: PointerEvent, MouseEvent, TouchEvent

hopefully we could find something doable on an iPhone device