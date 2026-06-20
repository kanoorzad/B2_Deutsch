# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2

Build: v99

Fix:
- Visible version was stuck on v92 because old cached/service-worker files could still be served.
- This build hardcodes the visible label as `Flashcard Pro v99`.
- `data.js` has `app_version: v99`.
- Manifest, service worker, title, and cache-busting are v99.
- A first-load script clears old non-v99 caches once.
- The service worker uses network-first navigation.

Preserved:
- Vertical full verb forms from v98.
- Plusquamperfekt playback.
- Synonyms.
- Translations.
- All cards.

Open once after upload:
https://kanoorzad.github.io/B2_Deutsch/?v=99&fresh=1
