# B2 + B1 Plus Flashcards v41 — Native Mobile Speech App

This is a different logic from the browser/PWA.

The previous mobile problem is that browser Web Speech does not expose a usable Dari/Farsi voice on the phone. v41 uses native mobile speech through `expo-speech`, which calls the phone's native speech system instead of the browser Web Speech API.

## What this version tests

- iOS native speech engine
- Android native speech engine
- Native voice list scanning
- Dari/Farsi candidate voice buttons
- Dari/Farsi tag-only tests:
  - fa-IR
  - fa-AF
  - fa
  - prs-AF
  - prs
  - fa-Arab-IR
  - fa-Arab-AF

## Run on iPhone without building an App Store app

You need a computer once.

1. Install Node.js.
2. Install Expo Go on your iPhone from the App Store.
3. Extract this folder.
4. In Terminal / PowerShell:

```bash
npm install
npx expo start
```

5. Scan the QR code with Expo Go.
6. In the app tap **Refresh native voices**.
7. Tap **Show voices**.
8. Test the Dari/Farsi candidates.

## Why this may work when browser failed

Chrome/Safari/Edge on iPhone are browser apps and can expose a different, smaller speech API voice list. Expo/native uses the mobile native speech interface.

## If Dari is still missing

Then the iPhone itself has no usable Persian/Dari native speech voice installed/exposed. Try:

iPhone Settings → Accessibility → Spoken Content → Voices → Persian/Farsi → download an enhanced voice if available.

Then reopen Expo Go and tap Refresh native voices.

## Files

- `App.js` — mobile app
- `data/cards.json` — all flashcards
- `package.json` — Expo dependencies
- `app.json` — Expo app config
