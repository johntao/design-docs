# migration

data import and export between file and localStorage.

## text format

grammar: `{indentation}{nodetype-token}{title}␟{metadata}␟{description}`
- `␟` is the unit separator character (`\x1f`)
- nodetype-token: `- ` for mc-record
- indentation: zero tabs = lvl1, one tab = lvl2
- metadata: status value (`0` = na, `1` = now, `2` = done)

the first line is the root node in this grammar: `{title}␟{metadata}␟{description}`
lines without indentation are lvl1 items; indented lines are lvl2 items.

## export

dump the tree to a plain-text file.

steps:
1. file name = root title (sanitized for filesystem)
2. for each lvl1 child (in placement order):
   - if null: write `- null`
   - else: write `- {title}␟{status}␟{description}`
3. for each lvl2 child under that lvl1:
   - if null: write `\t- null`
   - else: write `\t- {title}␟{status}␟{description}`

trigger: export button in mc-toolbar.

## import

clear existing data and load from file.

steps:
1. read file
2. parse lines:
   - first line: root node
   - no indentation: lvl1 record
   - one tab: lvl2 record under the preceding lvl1
3. for each line, split on `␟`:
   - `parts[0]`: strip nodetype token to get title
   - `parts[1]`: metadata (status); default `na` if empty/unrecognized
   - `parts[2]`: description; default empty
4. place lvl1 records in order:
   - item 1: `og[1,1][0,0]` synced to `og[0,0][1,1]`
   - item 2: `og[1,1][0,1]` synced to `og[0,1][1,1]`
   - ... (8 positions total, following placement order)
5. place lvl2 records under their parent (8 positions per lvl1)
6. throw parse error if lvl1 or lvl2 items exceed 8

after import:
- save to localStorage
- re-render the grid

## null handling

- null lvl1/lvl2 slots are preserved during import
- on export, null slots are preserved in the output file
- positions of non-null records are maintained by their order in the file

## update localStorage

both import and export sync with localStorage to ensure persistence across page refresh.
