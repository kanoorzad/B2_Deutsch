# B2 + B1 Plus Flashcards v16

## What v16 fixes

This version keeps the previous behavior and focuses only on the mobile Dari timing issue.

### Dari mobile issue

On mobile browsers, `speechSynthesis` can fire `onend` or `onerror` immediately for `fa-AF` even when no sound is produced. That made the Dari text disappear faster than German/English.

v16 changes this:

- Dari text has a hard minimum visible hold on mobile.
- Early Dari `onend` / `onerror` cannot advance the card immediately.
- The active utterance object is kept globally.
- The app sends small `speechSynthesis.resume()` nudges on mobile.
- Stop invalidates old callbacks.

### Version marker

A small italic `v16` appears at the top right of the app.

## QA

- Total cards: 2254
- Verb cards: 650
- Non-verb cards: 1604
- Verb cards with 3 German synonyms: 650
- Verb cards with 3 English synonyms: 650
- Verb cards with 3 Dari synonyms: 650
- Non-verbs with no bottom synonym text: 1604

## GitHub update

Replace all files with this v16 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=16

Delete old mobile Home Screen icons before testing.
