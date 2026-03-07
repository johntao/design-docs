# design draft of feat#02: embedding code snippet

users use NeoVim to edit plain text files

files are centralized in a folder call `data`
which then have the following folder tree
```
data (the root folder)
- 000-journal
  - subfolder
- p01-apple
  - pie
- p02-bee
  - honey
```

feat#02 embedding code snippets in the note, and then executed on file save
the first executable command is a simple heading shortcut

the syntax looks like this `␅3random title` which renders to `### Random Title`
a line starts with an enquiry character `␅` is an executable code snippet
followed by a number '3' which means to render 3 hashtags followed by a whitespace
text after the number are transformed to title case

the code is executed once the file is save to the disk
after execution the snippets are removed from the file (i.e no more lines start with an enquiry character)

technical details:
you choose the most suitable implementation
the computation is hooked to a file save action
the minimal computation is to scan through all the lines and check if there is any line starts with an enquiry character `␅`

make sure this feature only works on files under the root (data) folder tree
i.e. the app should not trigger computation on saving markdown files outside the data folder tree
