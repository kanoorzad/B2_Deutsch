# B2 + B1 Plus Flashcards v22

## Purpose

v22 is a clean rollback to the actual v6 app core, because the later experiments did not solve mobile Dari.

## Restored from v6

- `say()` uses direct `SpeechSynthesisUtterance(text)`
- Dari language is `fa-AF`
- Playback order is German → English → Dari → forms
- `renderPlaybackCard()` uses `flipped=true; render();`
- `playNextPart()` calls `say(p.t,p.l,...)` directly
- No online audio
- No mobile hold timer
- No retry loop
- No unlock utterance

## Kept from latest requirements

- Top-right `v22`
- Initiative line
- Latest data
- Verb-only synonyms
- No bottom synonym text for nouns/non-verbs

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

Replace all files with this v22 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=22

Delete old mobile Home Screen icons and clear browser cache before testing.
