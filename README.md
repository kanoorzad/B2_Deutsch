# B2 + B1 Plus Flashcards v52 — Mobile Gesture Queue

## Why this version

PC can speak Dari while mobile cannot. A likely browser-only cause is mobile autoplay/user-activation gating:
speech started later through timers/callbacks may be blocked on mobile even though it works on PC.

v52 keeps the full version-4 voice engine but changes mobile list playback:

- PC: normal v4 callback playback.
- Mobile: when you press Play, all selected utterances are queued immediately inside that same tap event.

This keeps speech calls inside the user gesture as much as a browser page can.

## Voice engine

Still version 4 style:

- direct `SpeechSynthesisUtterance`
- direct `speechSynthesis.speak(u)`
- German: `de-DE`
- English: `en-US`
- Dari: `fa-AF`
- no online TTS
- no local sprite
- no API key

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=52

## Test on mobile

1. Set front to Dari.
2. Press Speak visible text.
3. Press Play one card/list.

If "Speak visible text" still gives no Dari, then mobile has no usable browser Dari route.
If "Speak visible text" works but Play did not before, v52 should fix the Play path.
