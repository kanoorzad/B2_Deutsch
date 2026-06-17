# B2 + B1 Plus Flashcards v42 — Online AI TTS Fallback

## Why this exists

The mobile browser is not exposing any usable Dari/Farsi voice through `speechSynthesis`.
v42 tries a different logic: online AI TTS first for Dari/Farsi.

This is not local browser voice, not WebAudio sprite, and not an API-key setup.

## Audio source modes

In Voice Status, choose:

1. **Online AI for Dari/Farsi, browser for German/English** — default
2. **Online AI for all three languages**
3. **Browser/device voices only**

## Test

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=42

Then tap:

- Test Online Dari
- Test Online All

## Requirements

- Internet connection
- The external Puter.js TTS service must load in the browser

## Important

No API key is stored in this app.

If the online service is blocked by the browser/network, the app will fall back to browser speech. If browser speech has no Dari voice, then Dari will still be silent in browser-only mode.
