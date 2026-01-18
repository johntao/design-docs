# yet-another-note-app

I would like to solve two problems in the personal knowledge management area

1. adding tags to personal knowledge base is challenging
   - the cognitive load is huge
   - users are mostly exhausted after making quality content
   - tags are created by the personal mental state at the time
   - tag names vary from time to time; naming is also known as one of the hardest task in computer science
   - tags are prone to obsolete
   - when multiple tag system presented, things get even messier
2. it is hard to do quantative research on a personal knowledge base
   - a good metrics is hard to discover which is very similar to naming things is hard
   - users lose energy after making quality content and tags

My solution is to use a predefined tag system in a top-down approach, on the other hands, notes stand as bottom-up entities

By separating the workflow into top-down and bottom-up, which may reduce the cognitive load of adding tags

A few more properties of tags:
- support hierarchy
  - e.g. #animal/dog and #animal/cat are two tags that shared the same parent tag #animal
- imply metrics to tags which makes them stands as "goals"
  - this would help reducing the cognitive load of doing quantative research

To make the top-down approach more flexible, the app introduce a new concept "domain"

Users may put related tags into a group which stand as a domain

Users may manage many domains as they want (limited to 5 domains at max in the POC phase)

## index

- chapter1
  - UI overview
  - define basic functions
- chapter2
  - define function details
- chapter3
  - define popup modals and displaying fields
- chapter4
  - sample data