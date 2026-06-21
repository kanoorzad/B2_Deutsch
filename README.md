# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2

Build: v103

New:
- Persisch high-quality audio pack system added.
- Persisch playback now tries pre-generated MP3 first.
- If no MP3 is available, it falls back to browser fa-IR speechSynthesis.
- `persian_audio_jobs.csv` includes all 5123 Persian/Dari texts and output paths.
- `tools/generate_persian_audio_azure.py` generates high-quality MP3 files with neural TTS.
- `audio-manifest.js` controls whether the MP3 pack is active.

Important:
- This package does not include generated MP3 files yet.
- Generate audio with your TTS key, then upload `audio/fa/*.mp3` plus the updated `audio-manifest.js`.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=103&fresh=1
