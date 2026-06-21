# High-quality Persisch mobile audio guide

## Why this is needed

Desktop browsers often expose a Persian/Farsi voice to `speechSynthesis`.
Mobile browsers and PWAs often do not. The reliable solution is pre-generated MP3 audio.

## v103 behavior

For Persisch playback:

```text
1. If audio-manifest.js says ready: true and an MP3 exists for the card, play MP3.
2. If MP3 fails or is missing, fall back to browser speechSynthesis fa-IR.
```

## Generate the high-quality audio pack

Use Azure Neural TTS or another high-quality Persian TTS provider.

Recommended output:
```text
MP3
24 kHz
160 kbps
mono
voice: fa-IR-DilaraNeural or your chosen Persian neural voice
```

Run:

```bash
export AZURE_SPEECH_KEY="YOUR_KEY"
export AZURE_SPEECH_REGION="westeurope"
export AZURE_SPEECH_VOICE="fa-IR-DilaraNeural"
python tools/generate_persian_audio_azure.py
```

Then upload the generated `audio/fa/*.mp3` and updated `audio-manifest.js` with the app.

## Test first

Generate only 20-50 files first, upload, and test on mobile before generating all 5123.
