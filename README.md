# B2 + B1 Plus Flashcards v18

## Main fix

v18 restores the playback kernel from the working v5/v6 versions.

I compared the later versions against v5/v6 and changed the playback path back to:

- `cardScript()` uses v6-style command objects: `{t, l, label}`
- `playNextPart()` calls: `say(p.t, p.l, ...)`
- `say()` uses direct `new SpeechSynthesisUtterance(text)`
- Dari uses `fa-AF`
- no mobile hold timer
- no retry loop
- no unlock utterance
- no cleanup/transformation of Dari text before speech

## Kept from the current version

- Verb-only synonyms
- No bottom synonym text for nouns/non-verbs
- Initiative line
- Edge/mobile fit
- Top-right version marker

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

Replace all files with this v18 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=18

Delete old mobile Home Screen icons before testing.
