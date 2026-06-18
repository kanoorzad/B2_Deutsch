# B2 + B1 Plus Flashcards v56 — Dari Any-Voice Fallback

## What changed

v56 keeps the stable v55/v54/v51 base and applies the extra fallback suggested by the user:

```js
const v = pickVoice(lang);
if (v) u.voice = v;
else if (lang === 'fa') {
  const fallback = voices().find(v => !isFalseDariVoice(v));
  if (fallback) u.voice = fallback;
}
```

## Why

If the mobile browser has no Persian/Farsi/Dari voice, previous versions may leave Dari with no usable voice. v56 tries any installed voice that is not a known false Dari voice such as Daria/Bulgarian.

## Kept

- v55 pickVoice logic
- v54 screen wake lock
- v51 stable app structure
- direct browser SpeechSynthesis
- no online TTS
- no local sprite

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=56
