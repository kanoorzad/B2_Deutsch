# B2 + B1 Plus Flashcards v40

## What v40 does

v40 keeps the browser voice app structure, but adds a brute-force mobile Dari/Farsi tester.

It tries:

- `fa-IR`
- `fa-AF`
- `fa`
- `prs-AF`
- `prs`
- `fa-Arab`
- `fa-Arab-IR`
- `fa-Arab-AF`
- `fas`
- `per`
- Persian / Farsi / Dari voice names
- Afghanistan / Afghan / Iran / Iranian voice names
- tag-only mode with no selected voice
- selected voice + forced tag combinations
- last-resort manual test through every installed voice

## How to test on mobile

1. Open:

   https://kanoorzad.github.io/B2_Deutsch/?v=40

2. Tap **Refresh voices**.
3. Tap **Run Dari voice search**.
4. Listen.
5. If silent, tap **Try next Dari candidate**.
6. Continue until you hear a clear Dari/Farsi voice.
7. Then normal card playback will use the selected candidate.

## Important

If every candidate is silent, then the mobile browser/device is not exposing a usable Persian/Dari speech engine to JavaScript. In that case, browser-only voice cannot be fixed by code.

## QA

- JavaScript syntax: OK
- Version badge: v40
- Brute-force Dari controls: yes
- Language tags included: fa-IR, fa-AF, fa, prs-AF, prs, fas, per, fa-Arab variants
- Tag-only modes: yes
- Manual all-voices test: yes
- No local sprite / WebAudio: yes
- No remote TTS: yes
