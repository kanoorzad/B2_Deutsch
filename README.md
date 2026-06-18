# German A1-B2 telc system Important words v71

Deep repair for the first-screen language click issue.

## Root cause found

v70 had duplicated wizard blocks in `index.html`, and `app.js` defined the wizard click handler but did not call the app bootstrap functions. This made the first language page behave like a static picture.

## v71 repair

- Removed duplicated wizard blocks.
- Rebuilt one clean first wizard.
- Added one hidden `targetLang` selector.
- Added an explicit `bootApp()` startup function.
- `bootApp()` calls:
  - `warmVoices()`
  - `setup()`
  - `apply()`
  - `initStartWizard()`
- Language clicks now advance to the material screen.
- Added top-right v71 tag.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=71
