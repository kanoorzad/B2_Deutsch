# B2 + B1 Plus Flashcards v11 — mobile-first clean layout

## What changed

- Removed top-page Audio check / Install buttons.
- Play / Pause / Stop now sit directly below the flashcard.
- On mobile, the controls are sticky near the bottom and easier to reach.
- The theme is simpler and less crowded.
- Voice selection is automatic and hidden by default.
- A small Voice status section remains inside settings for troubleshooting only.

## Dari pronunciation

This version tries the strongest free/static fallback:

- fa-AF
- fa-IR
- fa
- voice names containing Dari / Persian / Farsi
- Arabic fallback only if no Persian/Farsi/Dari voice exists

If the phone/browser exposes no compatible Dari/Persian/Farsi voice, the app cannot force one from GitHub Pages. Guaranteed mobile Dari pronunciation requires either:

1. bundled pre-generated audio files, or
2. a cloud text-to-speech service.

## QA

- Total cards: 2254
- Playback steps checked: 8392
- English slash items after cleanup: 0
- Cards with English: 2254
- Cards with Dari: 2254
- Cards with 2 synonyms: 2254

## GitHub update

Replace all files with this v11 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=11

On mobile, remove the old Home Screen icon, open the `?v=11` link, then add/install again.
