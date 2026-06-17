# B2 + B1 Plus Flashcards v29 — Dari/Farsi Audio Sprite Redesign

This version redesigns Dari/Farsi audio completely.

## Audio design

Dari/Farsi uses exactly two root files:

- `dari-sprite.mp3`
- `audio-index.js`

The app seeks inside `dari-sprite.mp3` and plays the matching segment for each card.

## Why this should upload and work better

- No `audio/fa/` folder.
- No thousands of MP3 files.
- No large embedded audio JS chunks.
- No remote/online TTS.
- No CORS.
- No mobile Web Speech dependency for Dari.
- Single audio file size: 7.84 MB.

## Required files to upload

Upload all root files, especially:

- `dari-sprite.mp3`
- `audio-index.js`
- `app.js`
- `data.js`
- `index.html`
- `styles.css`
- `service-worker.js`

## QA

- JavaScript syntax: OK
- Sprite entries: 2025
- Dari cards covered: 2254 / 2254
- Sprite size: 7.84 MB
- Under 25 MB single-file upload limit: True

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=29

On mobile, tap **Test Dari** once, then use Play.
