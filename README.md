# B2 + B1 Plus Flashcards v15

## Purpose

This version keeps everything from v14, but fixes the mobile Dari behavior you reported: the Dari text disappeared very fast with no voice.

## Dari mobile fix

v15 changes only the speech engine behavior:

- keeps the spoken Dari text visible for a minimum time on mobile
- keeps the utterance object alive globally so mobile browsers do not drop the audio
- retries Dari on mobile with `fa-AF`, then `fa-IR`, then `fa` if the browser ends immediately
- nudges `speechSynthesis.resume()` for iOS/Android browser speech queues
- keeps the same medium speed for Dari

## Everything else remains

- Verb-only synonym chips remain.
- Nouns and non-verbs still show no bottom synonym text.
- Edge/mobile fit rules remain.
- Initiative line remains.

## QA

- Total cards: 2254
- Verb cards: 650
- Non-verb cards: 1604
- Verb cards with 3 German synonyms: 650
- Verb cards with 3 English synonyms: 650
- Verb cards with 3 Dari synonyms: 650
- Non-verbs with no bottom synonym text: 1604

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=15
