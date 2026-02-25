# timespan editor

refer to file @./js/TtEntryEdit.js
there are something complicate happening inside the file where we provided 5 different ways to modify a timespan value
1. start time field may use the bottom dial-like widget to update the start time
2. end time field may use the bottom dial-like widget to update the end time
3. duration field may be set using the bottom dial-like widget to update the duration
4. duration field have an extra plus button to update the duration additively
5. duration field have an extra minus button to update the duration additively

what I want to do is:
1. extract all these logic to a web component inside the file @./test2.html
2. encapsulate starttime + endtime + duration into an object timespan for easier interaction externally

we will build a new custom later, no need to change existing logic in @./js/TtEntryEdit.js
let's focusing on @./test2.html first and see what we can optimize the web component

## step 1

looks good for me
now let's try to realize a mockup under @./test2/.html

the mockup looks like a horizontal straight line to represent the timespan
under the line there are three labels
the first label place in the left end of the line which display the value of start time
the second label place in the middle of the line which display the value of duration
the third label place in the right end of the line which display the value of end time
set a maximum width for the horizontal line, make sure it doesn't occupy too much space

## step 2

now let's make the bar-labels looks clickable
then, add two more labels into this elements
now it contains five elements: start time, minus sign, duration, plus sign, end time

also, introduce lock '🔒' symbol on the bar-line, defaults to the left end
whenever users tap on the start-time label, display a lock at the left end
whenever users tap on the end-time label, display a lock at the right end
there can be only one lock existing on the bar-line at any given time

## step 3

we need to make bar-labels looks more clickable
let's make them looks like a button with background color

lastly, it's time to implement some behavior

in the TtTimespan component, we've added PointerEvent to the plus/ minus sign where the stepBar shows on users pointerdown and dismiss on users pointerup

I would like to make a similar effect when users clicking on "start time", "duration", and "end time" in the bar-labels
when pointerdown shows the TtDial and pointerup dismiss the TtDial

please help implement this behavior

## step 4

the bar-labels new appearance looks good

however, you misunderstand the other request

let's start over again

this time, we make a whole new version of TtTimespan component (call it TtTimespan2)

the first thing is to move the timespan-bar we've made into the TtTimespan2 and remove all the previous logic entangled with TtTimespan

the second thing is to implement all the editor logic

here's the expected behavior:

1. (already implemented) user tap start time to lock the start time; tap end time to lock the end time (only one lock presented at a time)
2. (already implemented) user hold/ drag/ release on a minus/ plus sign would invoke the stepBar, and update the duration value accordingly
3. (NEW) user hold/drag/release on starttime/duration/endtime labels, now invoke TtDial with an overlay behind similar to how stepBar shows up and dismiss
    - make sure you port all the timespan editing logic correctly

## step 5

minus and plus sign works as expected
however, the TtDial doesn't interact with pointermove event
please make sure the minute hand of the TtDial interact with pointermove event, then, update the time field accordingly

## step 6

Great! now all functions work as expected

however, there's still a small UX worth to be improved

we've previous fixed a problem where the stepBar miss calculating the vertical difference between the top of the stepBar and the current pointer
without considering the delta, the app would jump start the step value from a weird posistion when users start moving their pointer (the expected behavior is to start from zero value)

now, the TtDial have a similar problem, however, I suggest we should use a simpler approach without calculating the delta intensively
a simple approach is to make the TtDial appear right next to the user's pointer
this way we can avoid calculating the delta

finally, please make a small threshold for the TtDial to show up
the reason is that users might just want to tap starttime/ endtime to switch the lock without actually changing the value
applies a 300ms threshold to starttime and endtime (no need to apply to duration as it doesn't have the similar requirement)

## step 7

Fantastic!! now, let's add the final UX improvement
we've previously fix the delta issue by showing the TtDial right next to the pointer

we should stick to this approach make stepBar behave the same
now when users click on the minus/ plus sign, the stepBar should appear right below user's pointer (connect the top of the stepBar to user's pointer)
then, it is safe to remove the old delta logic from the stepBar function