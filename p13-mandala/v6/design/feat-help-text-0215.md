# new feature

introduce a help text popup that contains proper introduction to this app

## prerequisite

we previously use '?' to toggle the right panel
instead, use `]` to toggle
map `=` to `]` for Dvorak layout

## implementation

hit '?' to open a read only modal popup with a tab bar allowing users to switch between English/ Chinese version of the help text
defaults to the language that the current user-agent use
if Chinese found, defaults to Chines; else, use defaults to English

Here's the Chinese version content written in markdown format:
```markdown
曼陀羅九宮格網頁版

目前只有完整支援桌機版  
主要功能
- 有完整的移動熱鍵指令 (可參考右側欄說明)
- 右側欄包含說明以及工具列 (在最下方)
- 工具列包含存檔/ 讀檔指令以及 demo 檔案
- 完整的新增修改刪除
- 簡易的任務管理機制

預備知識
- 中央的九宮格為 lvl1 父層節點; 正中央則是 root 根節點
- 外圍的九宮格為 lvl2 子節點; 正中央則是 lvl1 父層
- 目前只支援 root > lvl1 > lvl2

新增修改刪除熱鍵對應
- 新增: u (as new) 新增; 可滑鼠點擊或雙擊觸發
- 修改: i (as inline edit) 行內修改; 可滑鼠點擊觸發
- 修改: o (as open popup) 詳細內容修改; 可滑鼠點擊觸發
- 刪除: del 
  - 所有清空類的功能都會在視窗底下觸發一鍵回復的臨時通知

簡易的任務管理機制
- 只有最外層 lvl2 能標示為任務
- 可以使用熱鍵 y (🔧) 切換 lvl2 為不同狀態; 可滑鼠點擊觸發
  - 狀態: 📄 純文字 (na) -> 🟩 任務 (now) -> ✅ 完成 (done)
  - 格子預設為純文字記錄
- lvl1 節點使用 y 可以切換 🎯/ 📄
  - 如為 🎯 則新增 lvl2 自動標示為任務
- root 節點只有一種狀態 🎯

次要功能
- QWERTY 下拉選單可切換不同鍵盤模擬器，目前僅支援 Dvorak 佈局
  - p.s. 一般人用不到這個選項
- 在空白格子按 `uio` 都會觸發新增功能
  - 只有非空白格會區分 `uio` 作用
  - 非空白的 root/ lvl1 可以持續使用 `u` 新增子項目
```

Here's the English version:

```markdown
Mandala 9x9 Grid Web Version

Currently only fully supports desktop version
Main Features
- Full movement hotkey commands (refer to right sidebar for instructions)
- Right sidebar contains instructions and toolbar (at the bottom)
- Toolbar includes save/load commands and demo files
- Complete add/edit/delete functionality
- Simple task management system

Background Knowledge
- The central 9-grid is the lvl1 parent node; the very center is the root node
- The outer 9-grids are lvl2 child nodes; the very center is the lvl1 parent
- Currently only supports root > lvl1 > lvl2

Add/Edit/Delete Hotkey Mappings
- Add: u (as new) add new; can be triggered by mouse click or double-click
- Edit: i (as inline edit) inline editing; can be triggered by mouse click
- Edit: o (as open popup) detailed content editing; can be triggered by mouse click
- Delete: del
  - All clear-type functions will trigger a temporary notification at the bottom of the window for one-click recovery

Simple Task Management System
- Only the outermost lvl2 can be marked as tasks
- Can use hotkey y (🔧) to toggle lvl2 between different states; can be triggered by mouse click
  - States: 📄 plain text (na) -> 🟩 task (now) -> ✅ complete (done)
  - Cells default to plain text records
- lvl1 nodes can use y to toggle between 🎯/📄
  - If 🎯, newly added lvl2 will automatically be marked as tasks
- Root node only has one state 🎯

Secondary Features
- QWERTY dropdown menu can switch between different keyboard simulators, currently only supports Dvorak layout
  - p.s. Most people won't need this option
- Pressing `uio` on empty cells will trigger the add function
  - Only non-empty cells will differentiate the functions of `uio`
  - Non-empty root/lvl1 can continuously use `u` to add child items
```