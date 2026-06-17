# B2 + B1 Plus Native Flashcards iPhone App

Ready-to-host PWA for GitHub Pages.

## Included data

- B2 all 12 units: 1629 entries
- B1 Plus 7 Units: 475 entries
- Irregular verb reference list: 150 verbs
- Total cards: 2254

## What changed in this build

The previous pack did not include the B1 Plus list. This corrected pack adds **B1 Plus 7 Units** as its own selectable list in the app.

## iPhone installation

1. Upload/replace all files in this folder in your GitHub repository.
2. Enable or keep Settings > Pages > Deploy from branch > main > root.
3. Open the GitHub Pages URL in Safari on iPhone.
4. Tap Share > Add to Home Screen.

## Updating an existing GitHub Pages upload

In your GitHub repository, delete or replace the old files with the files from this folder. The most important changed files are:

- `data.js`
- `index.html`
- `manifest.webmanifest`
- `service-worker.js`
- `README.md`
- `qa-report.json`

## Audio quality

The app uses iOS/browser speech voices and requests:

- German: `de-DE`, slower rate
- English: `en-US`
- Dari: `fa-AF`, with fallback depending on iOS voices installed

True AI voices require a paid TTS service or pre-generated MP3 files. This pack is designed for browser-native voices and GitHub Pages without a server.

## Data quality notes

- B2 translations come from your supplied B2 all 12 units list.
- B1 Plus translations come from your supplied B1 Plus 7 Units list.
- Irregular verb forms come from the uploaded Akademie Deutsch irregular verb source.
- Synonyms are shown where supplied as alternatives or related meanings.
