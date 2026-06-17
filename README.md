# B2 + B1 Plus Flashcards v37 — Audio Pack PWA

## What this version is

v37 is the correct Option A architecture:

- Same static GitHub Pages app.
- High-quality **pre-generated MP3 audio packs** first.
- Browser/device speech only as fallback.
- No API keys in the browser.
- No live cloud calls from GitHub Pages.
- Unit-based lazy loading: the app loads only the pack needed for the current card/language.

## Important

This package includes the audio-pack engine and generation tools, but it does **not** include paid cloud-generated MP3 audio yet.

To get highest-quality voice for German, English, and Dari/Farsi, run the generator scripts with an Azure Speech key on your computer. Then upload the generated `audio/` folder and updated `audio-manifest.js`.

## Default cloud voices in the script

- German: `de-DE-KatjaNeural`
- English: `en-US-JennyNeural`
- Dari/Farsi: `fa-IR-DilaraNeural`

You can change these using environment variables.

## Steps

From the extracted v37 folder:

```bash
python tools/00_export_audio_jobs.py
pip install requests
export AZURE_SPEECH_KEY="YOUR_KEY"
export AZURE_SPEECH_REGION="YOUR_REGION"
python tools/01_generate_audio_azure.py
python tools/02_build_audio_packs.py
```

Then upload:

- `index.html`
- `app.js`
- `data.js`
- `audio-manifest.js`
- `styles.css`
- `manifest.webmanifest`
- `icon.svg`
- the generated `audio/packs/` folder

## Audio jobs

Included now:

- Jobs: 8392
- Unit/language packs planned: 60
- Cards: 2254

## App audio mode

The Voice status panel has an Audio mode selector:

1. High-quality packs first
2. High-quality packs only
3. Browser voice only

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=37
