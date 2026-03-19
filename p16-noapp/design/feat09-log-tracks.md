# feat09 log tracks rework

this is a rework draft of log tracks:
- previously implemented as feat05
  - other related features: feat02, feat04
- also known as synced block or duplicate log

## new design

requirement:
- keep users focus in the main track
- a command to create a project block in the main track
  - a file is created in the project track if not existing
    - the file is open in a Vsplit window automatically
    - focus the window at the Vsplit window afterward
  - the block of the main track
    - put a metadata line `;;path/to/project` below the heading
    - content inside the block consider as abstract
  - the block of the project track
    - put a metadata line `;;path/to/main` below the heading
    - content inside the block consider as actual content

additional properties:
- NO MORE data sync
- NO MORE database (reasons below)
  1. no need to consider file rename, names of log files stick to a fixed format
  2. no need to sync data, thus, no need store hash for diff
  3. line number jump can be easily replaced by a simple search command
- just put the file name such that main track can jump to the file via `gf` command
- no need to sync title names
- no need to keep file GUID to handle future file rename
- no need to consider the opposite direction (from project track to main track)

additional commands:
- a command to update title of two blocks simultaneously
- a command to jump from project track to main track, and then, trigger a search on the title automatically
- a command to move selected content to the target project track, and create the necessary title and metadata at main track file
  - a file is created in the project track if not existing
  - the file is open in a Vsplit window automatically
  - NO need to focus the window at the Vsplit window afterward

main track example
```
## Types of Apple   --the title
;;path/to/project   --the metadata
food for thought    --the abstract content
```

project track example
```
# Types of Apple   --the title
;;path/to/main     --the metadata
line 1             --the actual content
line 2
line 3
```

## verdict

there will be totally 4 commands to create
the old implementation feat01, feat02, feat03, feat04 are safe to remove at this point