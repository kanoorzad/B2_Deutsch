# B2 + B1 Plus Flashcards v61 — Persian/Farsi Voice Mode Test

## Purpose

This version tests whether the mobile voice problem is caused by Dari/`fa-AF` routing.

The card translation text is not rewritten yet. The app now treats the third language as Persian/Farsi for voice routing.

## Changes

- Visible UI label: Dari → Persian/Farsi
- Voice route: prefer Persian/Farsi, not Dari
- `pickVoice('fa')` searches:
  1. Persian/Farsi voice names
  2. `fa-IR`
  3. generic `fa`
  4. other `fa*`
- `say(..., 'fa')` tries:
  1. selected Persian/Farsi voice
  2. `u.lang = 'fa-IR'`
  3. `u.lang = 'fa'`
  4. English fallback on error
- `debugVoices()` now reports Persian/Farsi candidates.
- Screen Wake Lock remains active during playback.

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=61
