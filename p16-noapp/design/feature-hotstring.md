# design draft of feat#01

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

the feat#01 is hotstring where the text editor detect users input in realtime
and transform a certain literals into something else

a simple example may look like this `=3` which transform to `␅3`

technical details:
you choose the most suitable programming language: either lua script or raku script
you choose the most suitable ways to hook this transform function:
- hotstring (trigger after text input on the screen) in insert mode
- shortcut (trigger before the text input on the screen) in insert mode

the hook only applies to files under the root (data) folder tree:
- it must be a markdown file
- the file name must not prefix with underscore
i.e. NeoVim should not activate this features outside the data folder tree
