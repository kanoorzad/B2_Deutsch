# B2 + B1 Plus Flashcards v14

## Fixes in v14

1. **Dari pronunciation restored to exact v6-style engine**
   - Direct `SpeechSynthesisUtterance(text)`
   - `fa-AF` for Dari
   - no Arabic fallback
   - no mobile unlock utterance
   - no fallback loop
   - no cleanup/transformation of Dari text before pronunciation

2. **Verb-only synonyms remain**
   - Verb cards: 3 German, 3 English, 3 Dari synonym/related-meaning chips.
   - Nouns and non-verbs: no bottom synonym text.

3. **Mobile browser layout**
   - Added Edge mobile overlap mitigation.
   - Removed sticky control behavior that can overlap in some mobile browsers.
   - Added stronger width/overflow rules.

4. **Initiative line**
   - Added: *Initiative by Khalid Noorzad for Afghan Students*

## QA

- Total cards: 2254
- Verb cards: 650
- Non-verb cards: 1604
- Verb cards with 3 German synonyms: 650
- Verb cards with 3 English synonyms: 650
- Verb cards with 3 Dari synonyms: 650
- Non-verbs with no bottom synonym text: 1604

## GitHub update

Replace all files with this v14 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=14

On mobile, delete the old Home Screen icon, open the `?v=14` link, then add/install again.
