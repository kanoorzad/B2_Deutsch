# GitHub Actions setup for high-quality Persisch audio

This package includes:

```text
.github/workflows/generate-persisch-audio.yml
tools/generate_persian_audio_azure.py
persian_audio_jobs.csv
audio/fa/
audio-manifest.js
```

## Step 1 — Upload this package to GitHub

Upload all files from this package to your repository.

## Step 2 — Add GitHub secrets

In GitHub:

```text
Repository → Settings → Secrets and variables → Actions → New repository secret
```

Add:

```text
AZURE_SPEECH_KEY       your Azure Speech key
AZURE_SPEECH_REGION    your Azure region, for example westeurope
```

Optional:

```text
AZURE_SPEECH_VOICE     fa-IR-DilaraNeural
```

## Step 3 — Test first with 50 files

Go to:

```text
Actions → Generate Persisch Audio Pack → Run workflow
```

Use:

```text
limit: 50
force: false
```

After it finishes, GitHub commits:

```text
audio/fa/*.mp3
audio-manifest.js
```

Upload/test the site on mobile:

```text
https://kanoorzad.github.io/B2_Deutsch/?v=104&fresh=1
```

## Step 4 — Generate all files

Run the workflow again with:

```text
limit: empty
force: false
```

The workflow skips existing MP3 files and generates missing ones.

## Important

Do not put the Azure key into code. Only use GitHub Secrets.
