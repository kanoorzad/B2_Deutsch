# B2 + B1 Plus Flashcards v60 — User Full Script + Dari Debug

## What changed

v60 applies the full script provided by the user.

Included behavior:

- Updated `pickVoice()` with Persian/Farsi/Dari name-based search.
- Updated `say()` where Dari uses `u.lang = 'fa'` and does not set `u.voice`.
- English fallback if Dari errors.
- iOS user-gesture priming on the first click.
- `debugVoices()` helper in the browser console.
- Screen Wake Lock requested during playback.
- Old caches/service workers are reset once with a v60 key.
- Initiative line appears once.

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=60

## Debug

On mobile browser console, run:

```js
debugVoices()
```

It prints all available voices and Persian/Dari candidates.
