# Deutsch lernen — Soft-3D PWA (Build v22)

Single-screen German vocabulary trainer. In-card selection:
Language → Material (Wortschatz / ⚡ Irregular) → Level → study.
Dark + light themes, progress tracking, marked words, auto-resume.
This is a complete drop-in replacement for the repository root.

## Drop-in / deploy
Copy all of these to the repo root (GitHub Pages serves them as-is):

  index.html              the whole app (inline CSS + JS, self-contained)
  data.js                 vocabulary + translations + examples (window.FLASHCARD_DATA)
  integration.js          data adapter the app loads
  manifest.webmanifest    PWA manifest (installable)
  service-worker.js       offline cache (app shell + lazy audio)
  icon.svg                app icon
  README.md               this file
  audio/                  (optional) the generated MP3s — see Audio below

The old app.js and styles.css are NOT needed — index.html is self-contained.
After deploying a new build, the service worker cache name is bumped (v22) so
clients update automatically.

## Languages (7 translation languages)
English, Persian (فارسی), Spanish, Russian, Ukrainian, Turkish, Arabic.
Kurmanji Kurdish was removed in this build (no native Azure TTS voice).
On each card the translation panel now shows BOTH the word translation and
the example-sentence translation in the chosen language.

## Audio (Azure Neural TTS, MP3-first) + toggle
The app plays a pre-generated MP3 when one exists and falls back to the
browser voice otherwise. Options > Playback > Audio source switches between
MP3 (Azure clips) and Device (browser voice); the choice is remembered.

### Generating clips with a run button
1. Put generate_audio_azure.py and the audio_jobs*.csv files in the repo root.
2. Put the two workflow files under .github/workflows/ :
     generate-deutsch-audio.yml  - run button with a language picker (de/en/.../all)
     generate-german-audio.yml   - one-click German-only pack
3. In repo Settings > Secrets and variables > Actions add:
     AZURE_SPEECH_KEY     your Azure Speech key
     AZURE_SPEECH_REGION  e.g. westeurope
4. Open the Actions tab, choose a workflow, click Run workflow.
   - "Build German audio pack" generates only de-DE (11,340 clips) in one click.
   - "Build Deutsch audio" lets you pick any single language, or all.
   Re-runs skip files that already exist, so run one language at a time and
   re-run if a job times out — it resumes where it left off.

Per-language job files (filename,locale,voice,text):
   audio_jobs.csv     all languages (68,884 clips)
   audio_jobs_de.csv  German   (11,340)   audio_jobs_en.csv  English (8,454)
   audio_jobs_es.csv  Spanish  (8,356)    audio_jobs_ru.csv  Russian (8,234)
   audio_jobs_uk.csv  Ukrainian(8,237)    audio_jobs_tr.csv  Turkish (8,150)
   audio_jobs_ar.csv  Arabic   (7,708)    audio_jobs_fa.csv  Persian (8,405)

The clips land in ./audio . The app computes the same FNV-1a(voice+text)
filename in-browser, so no manifest is needed. Serve audio/ next to index.html
(or set window.AUDIO_BASE to a CDN URL).

Native voices: de-DE-Katja, en-US-Jenny, fa-IR-Dilara, es-ES-Elvira,
ru-RU-Svetlana, uk-UA-Polina, tr-TR-Emel, ar-SA-Zariyah.

## Run locally
Extract, then:  python3 -m http.server 8000
Open http://localhost:8000/index.html  (must be http, not file://, for the
service worker and module loading to work).
