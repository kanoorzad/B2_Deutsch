# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2

Release: v1.2

Fixes:
- Removed “Tippen zum Umdrehen” from the bottom of the flashcard.
- Restored German synonyms under the “Synonyms:” area at the bottom of the flashcard. Verb cards show 4 German synonyms when available.
- Persisch/Farsi audio root-cause fix: mobile playback now tries each card’s direct `audio_fa` MP3 path even if `audio-manifest.js` is missing, stale, or has `ready:false`. If the MP3 is not available, it falls back to browser fa-IR TTS.
- Bumped public app version to v1.2 to force a fresh mobile/PWA cache.

Important upload note:
- Do not overwrite/delete your generated `audio/fa/` folder.
- Do not overwrite/delete your generated `audio-manifest.js`. This package intentionally does not include `audio-manifest.js`; keep the generated one already in GitHub.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=1.2&fresh=1
