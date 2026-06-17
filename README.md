# B2 + B1 Plus Flashcards v25

## Root-cause fix

v24 used bundled MP3 files but still used `HTMLAudioElement.play()` later in the automatic sequence.

On mobile, that later programmatic play call can be blocked by autoplay/user-gesture rules even when it works on PC.

v25 changes only the Dari engine:

- Dari uses bundled local MP3 files.
- Dari MP3 files are decoded and played through Web Audio API.
- The Web Audio engine is unlocked directly from the Play/Test button tap.
- HTML audio is kept only as a fallback.
- German and English remain on browser Web Speech.

## Important

Upload the full `audio/fa/` folder.

## QA

- JavaScript syntax: OK
- Total cards: 2254
- Dari cards with bundled audio: 2254
- Unique Dari audio files: 2025
- Missing Dari audio files: 0
- Web Audio API path: enabled
- Remote TTS: removed

## GitHub update

Replace all files with this v25 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=25

Delete old mobile Home Screen icons before testing.
