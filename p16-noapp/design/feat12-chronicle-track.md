# feat12 chronicle track

chronicle track is something similar to data track

the only difference is that the first field is always a YYMMdd date

it also use semicolon for field separation

here are the requirements:

## write

commands to insert chronicle records from the main track `data/001-journal/0logs` to the folder `data/007-chronicle/`

command syntax `:]c{file name}{date} {arbitrary text}`

given input file name "rhy" which then insert a record into file `data/007-chronicle/rhythm.txt`
- file name is omittable
  - then `data/007-chronicle/any.txt` is used
- a fixed format string of three letters long (alphbet only, no digit)
- match file name from the start
  - no-op and notify errors if zero or mutiple files matches

given input date "260322" which stands for 2026-03-22
- date is omittable (current date is used)
- "26--" renders to 260000
- "2603-" renders to 260300
- "22" renders to 260322 (current year and month)
- "0122" renders to 260122 (current year)

the record is inserted at the beginning of the file
- the record goes `260322;arbitrary text\n`

## read

create a web standalone web page that use `<input type="file" webkitdirectory>` to read a folder
then, display all the chronicle records into a grid
the first column should be the file name
there should be a list of checkboxes to filter records by file name
the chronicle record use semicolon as field separator, make sure these fields get parsed into grid columns properly
note that some of the files may contains more columns than the others

implement the web page in vanilla js, minimal style, light theme

## move

create or extend (`/home/jt/.config/nvim/lua/noapp/commands/log_move.lua`) a move command

command syntax: `:]m{prefix}/{file name}`

this command works on a selected range

given `:'<,'>]m007/rhy` which move the selected content to file `data/007-chronicle/rhythm.txt` at the beginning of the file

- no-op and throw errors if zero or multiple files matches
- if move successfully, insert `## Insert Data Records\n;;data/007-chronicle/rhythm.txt` at the original selection range