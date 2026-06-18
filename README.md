# B2 + B1 Plus Flashcards v57 — Dari English Voice Fallback

## What changed

v57 keeps the stable v56/v55/v54/v51 base and replaces only the `say()` function with the user-provided English fallback logic.

For Dari/Farsi:

- First tries `pickVoice('fa')`.
- If no Dari/Farsi voice is found, it uses `pickVoice('en')`.
- In that fallback case, it changes `u.lang` to `en-US` so the browser uses the English speech engine instead of a missing Persian engine.

## Kept

- v55 `pickVoice(lang)` logic
- v54 Screen Wake Lock
- v51 stable app structure
- direct browser SpeechSynthesis
- no online TTS
- no local audio sprite
- initiative line once

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=57
