# B2 + B1 Plus Flashcards v17

## What v17 does

This version rolls back the broken v16 playback rewrite and returns to the stable v14 playback structure.

Only one targeted change is added:

- On mobile Dari, early `onend` / `onerror` events cannot immediately advance the card.
- The Dari text remains visible for a minimum reading time.
- German and English playback are handled by the stable engine.

## Version marker

A small italic `v17` is visible at the top right.

## QA

- JavaScript syntax check: OK
- Total cards: 2254
- Verb cards: 650
- Non-verb cards: 1604
- Verb cards with 3 German synonyms: 650
- Verb cards with 3 English synonyms: 650
- Verb cards with 3 Dari synonyms: 650
- Non-verbs with no bottom synonym text: 1604

## GitHub update

Replace all files with this v17 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=17

Delete the old mobile Home Screen icon before testing.
