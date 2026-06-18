# German A1-B2 telc system Important words v73

Hard repair for first-page language buttons.

## What was fixed

The language page could behave like a static picture because earlier versions depended on app.js startup. v73 adds a small independent wizard controller directly in `index.html`.

## v73 guarantees

- One `startWizard`
- One `wizardLang`
- One `wizardMaterial`
- One `wizardUnit`
- One hidden `targetLang`
- Language click advances to material selection directly from inline controller
- Material click advances to unit selection
- Start button opens the card app
- A1 vocabulary from v72 is kept

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=73
