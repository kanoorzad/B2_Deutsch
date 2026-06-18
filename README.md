# B2 + B1 Plus Flashcards v54 — Restore v51 + Screen Wake Lock

## What changed

v54 restores the stable v51 app and adds only one feature:

- Screen Wake Lock during playback.

This is intended to keep the phone screen awake while the lesson is playing, because mobile browsers usually stop or throttle JavaScript/audio when the screen locks.

## Voice engine

Same as v51:

- full version-4 voice engine
- German: de-DE
- English: en-US
- Dari/Farsi: fa-AF
- direct SpeechSynthesisUtterance
- no online TTS
- no local sprite
- no router

## Screen-off behavior

A web page cannot reliably continue JavaScript speech after the phone screen is actually locked. v54 instead requests a screen wake lock when Play starts, and releases it when playback stops or finishes.

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=54
