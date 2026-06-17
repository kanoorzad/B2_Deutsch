# B2 + B1 Plus Native Flashcards v4

This is the corrected version.

## Fixed in v4

1. **Screen/audio synchronization**
   - During "Play selected list", the card on screen now changes at the same time as the audio.
   - The big card text also changes to the exact part being spoken: German, plural, verb form, US English, or Dari.

2. **Irregular verbs translations**
   - The irregular verb reference list now has US English and Dari meanings.
   - Irregular verbs also have related meanings/synonyms.

3. **Cache refresh**
   - Service worker version changed to `v40-screen-sync`, so GitHub Pages/iPhone can load the corrected files.

## Included data

- B2 all 12 units: 1629
- B1 Plus 7 units: 475
- Irregular verbs: 150
- Total cards: 2254

## Important GitHub update instruction

Upload and replace **all files** in your GitHub repository with the files from this folder.

Most important changed files:
- `app.js`
- `data.js`
- `service-worker.js`
- `index.html`
- `styles.css`
- `qa-report.json`
- `README.md`

After uploading, open your app with:

`https://kanoorzad.github.io/B2_Deutsch/?v=4`

If the iPhone Home Screen app still shows the old behavior, delete the old Home Screen icon and add it again from Safari.
