# B2 + B1 Plus Flashcards v20

## Root-cause refinement

v19 used an online `<audio>` fallback, but the audio element had `crossOrigin='anonymous'`. Remote TTS endpoints often do not provide CORS headers, so mobile browsers can block playback.

v20 removes CORS mode completely.

## v20 Dari mobile changes

- no `crossOrigin` on audio
- multiple online TTS URL formats
- `audio.load()` before `audio.play()`
- Play button primes audio on mobile
- fallback to browser TTS if online audio fails
- German/English remain on stable v6-style Web Speech

## QA

- JavaScript syntax: OK
- Total cards: 2254
- Verb cards: 650
- Non-verb cards: 1604
- Verb cards with 3 German synonyms: 650
- Verb cards with 3 English synonyms: 650
- Verb cards with 3 Dari synonyms: 650
- Non-verbs with no bottom synonym text: 1604

## GitHub update

Replace all files with this v20 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=20

Delete old mobile Home Screen icons before testing.
