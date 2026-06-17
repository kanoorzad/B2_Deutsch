# B2 + B1 Plus Flashcards v19

## Root cause addressed

Desktop browsers can expose a usable Dari/Persian/Farsi voice to Web Speech, so Dari works on the computer.

Mobile browsers can accept `fa-AF` but end the utterance immediately or expose no usable Dari voice. That is why the text disappears and no audio is heard.

## v19 solution

- German and English stay on the stable v6-style Web Speech playback.
- Desktop Dari stays on Web Speech.
- Mobile Dari now uses an online `<audio>` fallback.
- If online audio fails, the app falls back to browser TTS and keeps the text visible.

## Kept unchanged

- Verb-only synonyms.
- No bottom synonyms for nouns/non-verbs.
- Initiative line.
- Edge/mobile layout fit.
- Top-right version marker.

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

Replace all files with this v19 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=19

Delete the old mobile Home Screen icon before testing.
