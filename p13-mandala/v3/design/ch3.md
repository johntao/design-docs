# fields and modal

## 1. left panel

typeA entity displaying fields:
- title
- typeB1 usage count

### 1-1. typeA create modal popup

- title
- description

### 1-2. typeA update modal popup

- title
- description
- (readonly)typeB1 usage list
  - a typeB1 is an instance of typeA that lives inside a typeB
  - a typeB1 may contains other typeB1 as children to construct a tree structure
  - in this tree structure the root node is a typeB
  - a typeB1 of a same typeA may appear multiple times in a tree structure as long as the name doesn't duplicate among the siblings

examples of "typeB1 usage list":

refer to the sample data, given typeA "book", the "typeB1 usage list" will look like:
- game/input/book
- edu/input/book
- pkm/input/book
- freelance/input/book

## 2. mid panel/ top tab bar

typeB entity displaying fields:
- title

### 2-1. typeB create modal popup

- title
- description

### 2-2. typeB update modal popup

- title
- description
- (readonly) typeB1 entities count
- (readonly) typeB2 entities count

## 3. mid panel/ canvas

typeB1 entity displaying fields:
- title
- list of typeB2

remarks:
- click typeB1 entity to open 1-2 typeA modal

typeB2 entity displaying fields:
- a colorful rectangle containing a printable character

remarks:
- the rectangle is rendered at the bottom of a typeB1 entity
- the rectangles are rendered in 3x3 layout
- the 10+ items are ignored
- use "color + character" as an unique identifier per typeB
- pick up colors and characters from a preset
- colors preset (6): 8931EF, F2CA19, FF00BD, 0057E9, 87E911, E11845
- character preset (62): `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
- the total possible combination is 6x62 = 372

## 4. right panel

typeC entity displaying fields:
- title
- (readonly)typeB2 usage list
  - a typeB2 is a record that map a typeB1 to a typeC
  - typeB1 and typeC is a many-to-many relation
  - typeB1 + typeC must be unique

examples of "typeB2 usage list":

refer to the sample data, given typeC "I post articles personal blog x30 writing", the "typeB2 usage list" will look like:
- game/output/blog-posts
- edu/output/blog-posts
- pkm/output/blog-posts

### 4-1. typeC create modal popup

- title
- description

### 4-2. typeC update modal popup

- title
- description
- (readonly) typeB1 entities count