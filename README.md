# B2 + B1 Plus Flashcards v45 — Stable Playback Repair

## Why v45

v44 broke playback by routing through an unstable online provider path.

v45 rolls back to the safer v43 base and repairs playback:

- German always uses browser/device voice.
- English always uses browser/device voice.
- Dari can try online Puter TTS, but rate-limit errors no longer break playback.
- If online Dari fails, the app falls back to browser Dari or skips Dari after a timeout.
- Playback sequence continues instead of freezing.
- Daria (bg-BG) remains removed.

## Test

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=45

Then test:

1. Test German
2. Test English
3. Test Online Dari
4. Play selected

German and English should play immediately again.

## Important

If Online Dari says rate exceeded, v45 disables it temporarily and continues playback.
