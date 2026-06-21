# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2

Release: v2.0

Fixes in this package:
- Removed/hidden “Tippen zum Umdrehen” from the flashcard area.
- German synonyms are restored at the bottom under “Synonyms:” with four German items.
- Same-word synonym fallbacks for nouns/adjectives/etc. are filtered out.
- Mobile Farsi audio now uses a shared unlocked HTMLAudioElement and direct `audio_fa` MP3 paths first.
- The service worker no longer precaches `audio-manifest.js`; it fetches generated audio/manifest fresh.

Important upload rule:
Do not overwrite or delete:
- audio/fa/
- audio-manifest.js

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=2.0&fresh=1
