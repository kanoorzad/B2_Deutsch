# B2 + B1 Plus Flashcards v55 — User pickVoice Patch

## What changed

v55 restores the v54/v51 base and applies the `pickVoice(lang)` logic requested by the user.

For Dari/Farsi it tries:

1. `fa-AF`, `fa-IR`, `fa` with quality voice names
2. exact `fa-AF`, `fa-IR`, `fa`
3. any `fa*` voice, excluding false Dari voices
4. names containing Persian, Farsi, or Dari
5. fallback to the browser default voice

## Kept from v54

- v51 stable app base
- full direct browser SpeechSynthesis engine
- screen wake lock during playback
- initiative line once
- no online TTS
- no local audio sprite

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=55
