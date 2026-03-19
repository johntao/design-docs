# revision 01

we need to rework this design draft

there are a few major changes

## 1st thing

the command is intended to use cusomized grammar

thus, DO NOT fill in whitespaces in-between the syntax

DO NOT change `:]3some title` to `:] 3some title`

we're going to override the default grammar such that the whitespace is not significant to parse a command

## 2nd thing

I never heard of an "user command" must start with an uppercase letter

we will make a custom parser, no need to follow the convention at all

## 3rd thing

we're going to hook the parsing algorithm to this event `CmdUndefined`

trigger the command if any user-defined commands matched, otherwise, `print("Unknown command: " .. ev.match)`

## 4th thing

no need to scope commands under certain rules

the reasons to scope rules is that the pervious implementation triggers easily

`TextChangedI` can be triggered easily almost every context

however, a command registered by the users would require users to invoke it explicitly

thus, it is no longer necessary to scope
