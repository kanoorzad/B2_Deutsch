# B2 + B1 Plus Flashcards v39

## Goal

v39 goes back to the last real app structure and improves the browser voice logic, especially for mobile Dari/Farsi.

## What changed

- Kept the current flashcard structure.
- Kept browser SpeechSynthesis.
- Removed local/audio-pack experiments.
- Added voice dropdowns for German, English, and Dari/Farsi.
- Fixed the mobile Dari issue where the app forced `fa-AF`.
- v39 now uses the exact selected voice language, for example `fa-IR`.

## How to test on mobile

1. Open:

   https://kanoorzad.github.io/B2_Deutsch/?v=39

2. Tap **Refresh voices**.
3. Open the **Dari/Farsi voice** dropdown.
4. Try any option with:
   - `fa-IR`
   - `fa-AF`
   - `fa`
   - Persian
   - Farsi
   - Dari
5. Tap **Test Dari** after choosing each option.

If no Persian/Farsi/Dari voice appears on the phone, the browser does not expose one. In that case no browser-only JavaScript version can create the missing mobile voice.

## QA

- JavaScript syntax: FAILED
- Version badge: v39
- Voice selectors: yes
- Uses selected voice language exactly: yes
- No local sprite / WebAudio: yes
- No remote TTS: yes
