# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2

Build: v104

New:
- GitHub Actions workflow for high-quality Persisch MP3 generation.
- Workflow file:
  `.github/workflows/generate-persisch-audio.yml`
- Add Azure key/region as GitHub secrets, then run workflow from GitHub Actions.
- Test mode supports generating only first 50 audio files.
- Full generation writes `audio/fa/*.mp3` and updates `audio-manifest.js`.

Preserved:
- Persisch audio-pack playback logic from v103.
- Browser fa-IR fallback if MP3 is missing.
- Persisch label fix.
- Vertical full verb forms.
- Plusquamperfekt playback.
- Synonyms and translations.
- All cards.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=104&fresh=1
