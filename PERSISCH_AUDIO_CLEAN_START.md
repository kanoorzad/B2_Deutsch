# v105 Clean Persisch Audio Pack Instructions

This version removes the confusing `tools/` path. The generator is now in the repository root:

```text
generate_persian_audio_azure.py
```

Upload these root-level files/folders to GitHub:

```text
index.html
data.js
app.js
styles.css
service-worker.js
manifest.webmanifest
audio-manifest.js
persian_audio_jobs.csv
generate_persian_audio_azure.py
.github/workflows/generate-persisch-audio.yml
audio/fa/README.md
```

If GitHub does not upload the hidden `.github` folder, create this file manually:

```text
.github/workflows/generate-persisch-audio.yml
```

Copy the content from:

```text
COPY_THIS_TO_GITHUB_WORKFLOW_generate-persisch-audio.yml
```

Run first with:

```text
limit: 50
force: false
```

Then test mobile:

```text
https://kanoorzad.github.io/B2_Deutsch/?v=105&fresh=1
```
