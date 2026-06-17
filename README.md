# B2 + B1 Plus Flashcards v23

## Base

v23 is based on v20. Everything is kept the same except the Dari voice path.

## Dari-only change

The v20 online audio experiment is removed.

Dari now uses browser/device Web Speech again, but with mobile-aware voice selection:

- mobile prefers `fa-IR` first
- then `fa-AF`
- then generic `fa`
- then any Persian/Farsi/Dari named voice
- the utterance language is set to the actual selected voice language

This targets the likely mobile issue: many phones expose Persian/Farsi as `fa-IR`, not `fa-AF`.

## QA

- JavaScript syntax: OK
- Total cards: 2254
- Verb cards: 650
- Non-verb cards: 1604
- Verb cards with 3 German synonyms: 650
- Verb cards with 3 English synonyms: 650
- Verb cards with 3 Dari synonyms: 650
- Non-verbs with no bottom synonym text: 1604

## GitHub update

Replace all files with this v23 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=23

Delete old mobile Home Screen icons before testing.
