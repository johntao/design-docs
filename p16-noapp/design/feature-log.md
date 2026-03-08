# design draft for feat#03: logs

motivation:
I need a minimal way to evaluate the progress of each project while keeping users stay in the main track without frequently context switching
counting files (creation) is one of the easiest metric to evaluate the progress of a project

solution:
introduce a new command to duplicate a block of content to the targeting project
this command will keep users in their current context

folder structure
```
data (the root folder)
- 000-journal
  - 0logs (the main track)
- p01-apple
  - 0logs (the p01 track)
- p02-bee
  - 0logs (the p02 track)
```
sync direction: from main to p01; from main to p02

log files are created in daily-basis and name after current locale date

such as `/000-journal/0logs/2603/05.md` or `/p02-apple/0logs/260305.md`

files are written in markdown format

the syntax looks like this `␅lp01types of apples`
'l' stands for logs, then followed by 'p01' which is the project you wish to duplicate content into (i.e. `p01-apple` in this case)
then followed by '...' which denotes arbitrary text content

the command is executed on saving the file to the disk
after execution the snippets are removed from the file
this commands always operates on a h2 heading, thus, it apply title case transform automatically

## algorithm details

there are two more important mechanism of this command
the first thing is to make this command useful, it duplicate a block of text into the targeting project, instead of a single line

a block may define like this:
- the command first render text into title case '## Types of Apples'
- then, the block starts from '## Types of Apples'; ends by the next h2 headings or the end of the file
- note that `␅l` command always render into a h2 heading, thus, it is also considered as a breakpoint

the second thing is to make sure the two blocks are synchronized for future edits
this one is trickier, we should think through this one carefully, and find the most reasonable solution

here's my plan:
- after duplicating contents at the targeting location, spawn a file-binding statement right below the h2 heading
  - append the block of content at the end of the destination file
- the syntax looks like this `;;/p02-apple/0logs/260305.md#7411d4c`
  - given `/000-journal/0logs/2603/05.md` as main track; `/p02-apple/0logs/260305.md` as project track; `## Types of Apples` as the h2 heading
  - spawn `;;/p02-apple/0logs/260305.md#7411d4c` below h2 for main track
  - spawn `;;/000-journal/0logs/2603/05.md#7411d4c` below h2 for project track
- where ';;' is a prefix for additional attributes of the current heading block
- '/p02-apple/0logs/260305.md' is the destination to duplicate content
- '#' is a delimiter for next token
- '7411d4c' is a random hash to help distinct different block bindings in a same file

how synchronization work:
- after all `␅` commands are executed: parse all h2 heading blocks and list all diff hunks (both order by starting position)
  - for each heading block, we have `hasExtraAttr`, `startLn`, `endLn`, `isDirty`, `syncDest`
  - hasExtraAttr (bool): means this block contains ';;' attribute
  - startLn (number): means the line number of the starting position
  - endLn (number): means the line number of the end position
  - isDirty (bool): true if the content has changed
  - syncDest (string): the path of the file to be synchronized
- iterate through heading blocks, skip the block that `!hasExtraAttr`
  - an algorithm to check if the block intersect with the hunks
  - if true, then, mark the heading block isDirty
- for each dirty block, replace the 

---

first problem, after the first migration, how about future edits?
how to manage synchronization in the future?

use additional `;;` prefix to name the binding

bound files computes potential sync

diff detection

attributes: make two titles the same. nothing special here

opening question: how to extract articles from titles?

---

2nd problem, false case
items created via commands are good
how about items created manually?

alternate project creation; magical titles

scan through titles highlight pull out those without `::` bindings

prompt users for post-data migration

this one would be really challenging!!

---