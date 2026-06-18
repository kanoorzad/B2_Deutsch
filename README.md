# B2 + B1 Plus Flashcards v58 — Prioritize Persian/Farsi Voice

## What changed

v58 keeps the stable v57/v56/v55/v54/v51 base and updates both functions requested by the user:

- `pickVoice(lang)`
- `say(text, lang, done)`

## New Dari/Farsi logic

`pickVoice('fa')` now:

1. Finds any voice with `fa*` language or Persian/Farsi/Dari in the name.
2. Filters false Bulgarian/Daria voices.
3. Prioritizes voices named Persian or Farsi.
4. Then checks quality voices.
5. Then prefers generic `fa`.
6. Then `fa-IR`.
7. Then `fa-AF`.

`say()` now uses the exact `voice.lang` from the selected voice. If no Persian voice exists at all, it falls back to the English engine.

## Kept

- Screen Wake Lock
- Direct browser SpeechSynthesis
- Initiative line once
- No online TTS
- No local audio sprite

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=58
