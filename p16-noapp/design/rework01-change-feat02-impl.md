# rework feat#02 to adapt feat#03 and feat#04

this file describe how we should rework the design draft and implementation of feat#02 to adapt the latest change

to be more specific, we need to change the trigger from onSave to onEnter

make the command execute earlier onEnter instead of onSave

the previous implementation converts `␅3random title` to `### Random Title` on saving files

the expected behavior is to trigger the conversion on entering a newline

the second change is to make `␅1today's headline` insert `;;{GUID}` below the rendered h1 heading
- this should also insert a metadata entry inside the metadata db

note that only h1 heading needs GUID and metadata record creation