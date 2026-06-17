# B2 + B1 Plus Flashcards v10 — clean card + mobile Dari fallback

## What v10 changes

1. **Cleaner card and flip view**
   - The main study card no longer shows unit/list/part/type chips.
   - The flip answer no longer has extra unit/title text.
   - The flip card focuses only on German, US English, Dari, forms, synonyms, and example.

2. **Mobile Dari voice fallback**
   - Added a Mobile voice check section.
   - Added an Unlock mobile speech button.
   - Dari now tries:
     - `fa-AF`
     - `fa-IR`
     - `fa`
     - voice names containing Dari / Persian / Farsi
     - Arabic fallback only if no Persian/Farsi/Dari voice exists
   - If the mobile browser still has no usable voice, the app shows a warning instead of failing silently.

## Important limitation

The app is hosted on GitHub Pages, which is static hosting. It can use the device/browser speech voices, but it cannot install a Dari voice into someone’s phone.

For guaranteed Dari pronunciation on every mobile device, the next step would be pre-generated audio files or a cloud text-to-speech service. This v10 package makes the strongest possible free/static-web fallback.

## QA

- Total cards: 2254
- Playback steps checked: 8392
- English slash items after cleanup: 0
- Cards with English: 2254
- Cards with Dari: 2254
- Cards with 2 synonyms: 2254

## GitHub update

Replace all files in your repository with this v10 folder.

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=10

On mobile, delete the old Home Screen icon, open the `?v=10` link in Safari/Chrome/Edge, then add/install again.
