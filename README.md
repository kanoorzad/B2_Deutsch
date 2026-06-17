# B2 + B1 Plus Flashcards v49 — v6 Direct Dari Mobile

## What changed

v49 removes the online TTS layer and restores direct browser SpeechSynthesis for Dari/Farsi.

This is focused on the exact issue:

- PC has Dari voice.
- Mobile has no direct Persian voice in the list.
- Earlier v6-style `fa-AF` direct utterance had worked better.

## v49 audio behavior

- German: browser/device voice, direct speech.
- English: browser/device voice, direct speech.
- Dari/Farsi: direct SpeechSynthesisUtterance.
- If no Persian/Farsi voice is listed, it uses the v6-style tag `fa-AF`.
- No Puter.
- No Google router.
- No online rate-limit messages.
- No visible Voice Status section.

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=49

## Test

Press Speak/Play. Do not open any voice section.
