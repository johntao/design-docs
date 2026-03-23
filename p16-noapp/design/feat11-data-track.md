# feat11 data track

we previously introduced logs track which also stands as "prose" (i.e. free-form writing)

now, let's introduce a structural track (i.e. data track)

I've made a few KTV song data records with several fields

these records sit in folder `data/m02-artifact/ktv/`

now, here are the requirements (implement in Raku scripts)

## concat all songs

concat direct children files `data/m02-artifact/ktv/*` into file `data/m02-artifact/ktv/_all`

make sure the file `_all` is not included in the second run

it is safe to exclude file name starts with underscore '_' from the children file collection

the result should looks like this:
```
KTV songs [total record count]
[file1 name] [file1 line count]
[file1 content]
[file2 name] [file2 line count]
[file2 content]
[file3 name] [file3 line count]
[file3 content]
```

## list of singers

concat direct children files `data/m02-artifact/ktv/*` into file `data/m02-artifact/ktv/_singer`

the result should looks like this:
```
KTV singers [total record count]
[file1 name] [file1 line count]
[file1 unique singer]
[file2 name] [file2 line count]
[file2 unique singer]
[file3 name] [file3 line count]
[file3 unique singer]
```
the file content use semicolon ';' to separate fields
you can parse the singer from the 5th field (zero-indexed)

note that a singer might appear in multiple files, in such case, make sure keep only the first occurrence
the expected result is to having unique singer records in file `data/m02-artifact/ktv/_singer`
