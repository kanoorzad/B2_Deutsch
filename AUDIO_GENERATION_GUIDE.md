# Audio generation guide for v37

The app is already wired for high-quality local audio packs. To create the actual MP3 packs, run these commands from this folder.

## 1. Install requirements

```bash
pip install requests
```

Also install `ffmpeg` so the pack builder can concatenate clips.

## 2. Export all utterance jobs

```bash
python tools/00_export_audio_jobs.py
```

## 3. Generate clips with Azure Speech

```bash
export AZURE_SPEECH_KEY="YOUR_KEY"
export AZURE_SPEECH_REGION="YOUR_REGION"
python tools/01_generate_audio_azure.py
```

Default voices:

```text
German: de-DE-KatjaNeural
English: en-US-JennyNeural
Dari/Farsi: fa-IR-DilaraNeural
```

You may override them:

```bash
export AZURE_DE_VOICE="de-DE-KatjaNeural"
export AZURE_EN_VOICE="en-US-JennyNeural"
export AZURE_FA_VOICE="fa-IR-FaridNeural"
```

## 4. Build unit audio packs

```bash
python tools/02_build_audio_packs.py
```

This creates:

```text
audio/packs/*.mp3
audio-manifest.js
```

## 5. Upload to GitHub Pages

Upload the normal app files plus:

```text
audio-manifest.js
audio/packs/
```

Then open:

```text
https://kanoorzad.github.io/B2_Deutsch/?v=37
```
