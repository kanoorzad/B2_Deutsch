# B2 + B1 Plus Flashcards v44

## Fix for "Online AI TTS failed: Rate exceeded"

v43 used Puter AI TTS. That can return a public rate-limit error.

v44 does not depend on Puter only. It adds a multi-provider online TTS router:

1. Google Translate TTS direct audio first for Dari/Farsi
2. Puter AI TTS only as backup
3. Browser/device voice as last fallback

## Audio source options

- Google online Dari/Farsi first
- Google first, Puter backup
- Puter first, Google backup
- Google online for all three languages
- Browser/device voices only

## Test

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=44

Then tap:

- Test Online Dari

If Puter is rate-limited, the app will not keep hammering it. It will temporarily disable Puter and try the next provider.

## Notes

- Google online TTS requires internet.
- It is live online audio, not downloaded local MP3.
- No API key is stored in the app.
- If the provider blocks traffic, browser fallback still exists.
