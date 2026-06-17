# B2 + B1 Plus Flashcards v13

## Fix 1 — Dari pronunciation restored

The Dari speech path has been restored to the same simple browser speech logic used around v6:

- `fa-AF` language tag
- first exact `fa-AF` voice if available
- then any `fa` voice exposed by the phone/browser
- no Arabic fallback
- no mobile unlock utterance before playback
- no extra fallback loop

This directly addresses the issue where later versions changed the Dari path and the same phone became silent.

## Fix 2 — verb synonyms only

Only verbs now show synonym chips at the bottom of the flashcard.

- German verb step: 3 German verb synonyms
- English step: 3 English verb synonyms
- Dari step: 3 Dari verb synonyms
- Nouns and non-verbs: no bottom synonym text

## QA

- Total cards: 2254
- Verb cards: 650
- Non-verb cards: 1604
- Verb cards with 3 German synonyms: 650
- Verb cards with 3 English synonyms: 650
- Verb cards with 3 Dari synonyms: 650
- Non-verb cards with no bottom synonym text: 1604

## GitHub update

Replace all files with this v13 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=13
