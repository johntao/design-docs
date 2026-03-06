# design draft of feature 02

refer to draft file 
which is my new project idea
please help me work through the design details
you can edit the draft file directly
make sure the design draft doesn't exceed 100 lines in the first edition

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

the first feature is embedding code snippets
the first executable command is heading shortcut
the syntax looks like this `=3random title` which renders to `### Random Title`
a line starts with an equal sign is an executable code snippet
followed by a number '3' which means to render 3 hashtags followed by a whitespace
text after the number are transformed to title case
the code is executed once the file is save to the disk
after execution the snippets are removed from the file:
- no more lines start with an equal sign
- users must beware of this token, they must use '\' to escape it for literal without commands execution
- the 

technical details:
you choose the most suitable implementation, either lua script or raku script
the computation is hooked to a file save action
the minimal computation is to scan through all the lines and check if there is any line starts with an equal sign
make sure only files under the root (data) folder tree
i.e. the app should not trigger computation on saving markdown files outside the data folder tree
