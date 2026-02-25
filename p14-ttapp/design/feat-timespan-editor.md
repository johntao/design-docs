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