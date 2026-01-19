# modal popups and fields

## tag modal

fields:
- title (required, text, max 50 chars)
- parent (readonly field)
- description (optional, text, max 5000 chars)

data structure:
- hierarchy is constructed via spliting the title by slash '/'
- e.g. given title "animal/dog/shiba" would construct three tags automatically
  1. animal
  2. animal/dog (having animal as its parent)
  3. animal/dog/shiba (having animal/dog as its parent)

validation:
- tag title must be unique
- hierarchy depth cannot exceed 3

actions: save, cancel

delete action: available in edit mode, blocked if tag has children

## note modal

fields:
- title (required, text, max 100 chars)
- content (optional, textarea, max 5000 chars)

validation:
- note title must be unique

actions: save, cancel

delete action: available in edit mode

## domain modal

fields:
- name (required, text, max 30 chars)

validation:
- name must be unique

actions: save, cancel

delete action: available in edit mode, blocked if domain is the last one

## edge cases

- note deletion: only the right panel delete action removes a note permanently; canvas delete only removes tag-note relations
- !!character assignment: random unique from preset pool per domain; recycled when note removed from domain
- !!hierarchy depth violation: drag operation canceled with toast message if would exceed depth 3

