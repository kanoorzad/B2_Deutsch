# B2 + B1 Plus Flashcards v30 — High-quality mapped Dari/Farsi audio

## What was wrong in v29

v29 proved the mobile audio path works, but two things made the Dari audio hard to understand:

1. The single sprite was compressed to very low bitrate audio.
2. The playback call did not pass the card's `audio_fa` reference, so the wrong audio segment could play.

## v30 fix

v30 keeps the working mobile sprite design but rebuilds it for quality and accuracy:

- uses the original MP3 clips without re-encoding (`ffmpeg -c copy`)
- splits audio into 4 smaller high-quality sprite MP3 files
- each sprite is about 6.28 MB, 6.3 MB, 6.28 MB, 6.31 MB
- every Dari card now passes its own `audio_fa` reference into playback
- no mobile Web Speech for Dari
- no remote TTS
- no audio/fa folder
- no huge embedded JS audio chunks

## Required upload files

Upload all root files, especially:

- dari-sprite-1.mp3
- dari-sprite-2.mp3
- dari-sprite-3.mp3
- dari-sprite-4.mp3
- audio-index.js
- app.js
- data.js
- index.html
- styles.css
- service-worker.js

## QA

- JavaScript syntax: OK
- Sprite files: 4
- Total sprite audio size: 25.17 MB
- Entries: 2025
- Dari cards mapped: 2254 / 2254
- Card audio reference passed to playback: yes
- Source MP3 quality preserved: yes, no re-encoding

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=30


## Extra fix in final v30 build

The page now loads `audio-index.js?v=30` before `app.js?v=30`, and every Dari playback step passes the card-specific `audio_fa` reference. This prevents the app from playing the wrong sprite segment.
