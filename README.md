# B2 + B1 Plus Flashcards v59 — Dari System Default `fa`

## What changed

v59 keeps the stable v58 base and replaces only `say()` with the user-provided system-default Persian approach.

For Dari/Farsi:

- It does **not** set `u.voice`.
- It sets only `u.lang = 'fa'`.
- This lets the browser/system choose the default Persian/Farsi voice if one exists.
- If the Dari attempt errors, it falls back to the English voice as last resort.

For German and English:

- It keeps explicit `pickVoice(lang)` selection.

## Kept

- v58 `pickVoice(lang)` logic
- Screen Wake Lock
- Direct browser SpeechSynthesis
- Initiative line once
- No online TTS
- No local audio sprite

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=59
