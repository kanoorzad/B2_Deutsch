# B2 + B1 Plus Flashcards v26

## Fix

Your mobile test result was:

`Dari: Web Audio failed: audio-http-404`

That means the mobile browser requested an audio file, but GitHub Pages returned 404 Not Found.

v26 fixes that by:

- adding `audio/fa/_test.mp3`
- adding `testAudioFa: "audio/fa/_test.mp3"` to `data.js`
- making the Test Dari button use that data path
- if `_test.mp3` still 404s, falling back to the first real bundled Dari audio file
- showing the failed path in the error message if a file is missing

## Important upload instruction

Upload the **whole folder**, including:

- `audio/fa/_test.mp3`
- all other `audio/fa/*.mp3` files
- `data.js`
- `app.js`

If GitHub Pages does not contain the `audio/fa/` folder, Dari cannot play.

## QA

- JavaScript syntax: OK
- Test audio exists: True
- Copied test audio from: audio/fa/62c46726a76093e4ce.mp3
- Dari cards with audio: 2254
- Unique Dari audio files: 2025
- Missing card audio files: 0

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=26
