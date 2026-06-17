# B2 + B1 Plus Flashcards v36

## What changed

v36 keeps the current app structure, but reverses the voice system for **all languages** back to the simple v3-v6 browser voice logic.

Removed from the audio path:

- local sprite audio
- WebAudio
- remote TTS
- Dari source selector
- automatic fallback switching

Restored for all languages:

- `SpeechSynthesisUtterance(text)`
- German: `de-DE`
- English: `en-US`
- Dari/Farsi: `fa-AF`
- simple voice picker by exact language then prefix
- classic v6 playback timing

## QA

- JavaScript syntax: OK
- Version badge: v36
- Classic v6 voice engine: yes
- No local sprite / WebAudio: yes
- No remote TTS: yes
- ZIP size: about 0.18 MB

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=36
