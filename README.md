# B2 + B1 Plus Flashcards v12 — final dynamic chips + audio-ready

## What v12 fixes

- The chips at the bottom of the card now change with the current language:
  - German step: German related meanings/forms
  - English step: English related meanings
  - Dari step: Dari related meanings
- Every card has 3 German chips, 3 English chips, and 3 Dari chips.
- During playback, the chip language follows the current spoken language.

## Dari mobile pronunciation

The app still tries the strongest free/static browser fallback:
- fa-AF
- fa-IR
- fa
- Persian/Farsi/Dari voice names
- Arabic fallback

But if Safari/Chrome/Edge on a phone exposes no Dari/Persian/Farsi voice, static GitHub Pages cannot create that voice. For guaranteed mobile Dari pronunciation, the next technical solution must be:
1. bundled pre-generated audio files, or
2. cloud text-to-speech.

This package is structured so that bundled audio can be added later without redesigning the app.

## QA

- Total cards: 2254
- Cards with English: 2254
- Cards with Dari: 2254
- Cards with 3 English chips: 2254
- Cards with 3 German chips: 2254
- Cards with 3 Dari chips: 2254

## GitHub update

Replace all files with this v12 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=12
