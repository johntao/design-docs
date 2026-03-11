# rework feat#05 to adapt feat#03 and feat#04

this file describe how we should rework the design draft of feat#05 to adapt the latest change

to be more specific, we need to change the trigger from onSave to onEnter

make the command execute earlier onEnter instead of onSave

## first change

the previous implementation converts `␅ltypes of apples` to `## Types of Apples` on saving files

the expected behavior is to trigger the conversion on entering a newline

## second change

the second change is to make `␅ltypes of apples` insert a few more lines below the rendered h2 heading
1. `;;{h2 GUID}` stands as the GUID of this h2 heading
2. `;;{alt file GUID}` stands as the GUID of the alternate file
3. `;;{alt file path}` the path of the alt file
- this should insert a few metadata entries inside the metadata db
  - file metadata, if the alt file not exist
  - synced block metadata, fill in all the necessary fields
- examples of alt file (depends on current working context):
  - `/p01-apple/0logs/260305.md` for main track
  - `/000-journal/0logs/2603/05.md` for project track

## third change

keep the onSave function, adjust the algorithm accordingly

the metadata db replace the existing diff algorithm by just query and compare the hash value of a synced block record in the db
