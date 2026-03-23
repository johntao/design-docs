# revision

first item:
I found `function M.open_in_vsplit(abs_path)` doesn't always work as expected
please add a few logs so that we can investigate it further

second item:
I was wrong about this command `### 5. move content to project (:]m<prefix><title>)`
the reason is that users should already settled the title before using visual selection to invoke the command
hence, the correct syntax should be `:]m<prefix>`

third item:
I was wrong about "if the file already exist, append to project track file"
instead, the correct behavior should be no-op, and warn users for existing links
thus, there should be one link at max between the same main-track and project-track

## revision2

the problem of `function M.open_in_vsplit(abs_path)` is that the function also count an opened `neo-tree` as a vertical window
to fix it, the function should identify if `neo-tree` is opening
if true, the maximum numbers of vertical windows should be 3
if not, the maximum numbers of vertical windows should be 2
please help address it