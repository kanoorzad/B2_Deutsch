#!/usr/bin/env python3
"""
Generate MP3 audio for the Deutsch-lernen app from Azure Neural TTS.

Reads audio_jobs.csv (columns: filename, locale, voice, text) and writes one
MP3 per row into ./audio/. Files already present are skipped, so only new or
changed sentences cost anything on re-runs.

Filenames are an FNV-1a(voice + 0x1f + text) hash, identical to what the app
computes in the browser, so the PWA finds each clip with no manifest needed.

Env:
  AZURE_SPEECH_KEY     - your Speech resource key   (required)
  AZURE_SPEECH_REGION  - e.g. "westeurope"          (required)
  AUDIO_OUT            - output dir (default ./audio)
  JOBS_CSV             - input csv  (default ./audio_jobs.csv)
"""
import os, sys, csv, time, hashlib, html
import urllib.request, urllib.error

KEY    = os.environ.get("AZURE_SPEECH_KEY")
REGION = os.environ.get("AZURE_SPEECH_REGION")
OUT    = os.environ.get("AUDIO_OUT", "audio")
JOBS   = os.environ.get("JOBS_CSV", "audio_jobs.csv")

if not KEY or not REGION:
    sys.exit("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION")

ENDPOINT = f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
# 24kHz mono mp3 — small files, good quality for flashcards
FORMAT = "audio-24khz-48kbitrate-mono-mp3"

def ssml(text, locale, voice):
    safe = html.escape(text, quote=False)
    return (f"<speak version='1.0' xml:lang='{locale}'>"
            f"<voice xml:lang='{locale}' name='{voice}'>{safe}</voice></speak>")

def synth(text, locale, voice, path, retries=4):
    body = ssml(text, locale, voice).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=body, method="POST", headers={
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": FORMAT,
        "User-Agent": "deutsch-lernen-audio",
    })
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            with open(path, "wb") as f:
                f.write(data)
            return True
        except urllib.error.HTTPError as e:
            if e.code == 429:           # throttled — back off
                wait = 2 ** attempt
                time.sleep(wait); continue
            print(f"  HTTP {e.code} for {os.path.basename(path)}: {e.reason}")
            return False
        except Exception as e:
            time.sleep(2 ** attempt)
    print(f"  giving up on {os.path.basename(path)}")
    return False

def main():
    os.makedirs(OUT, exist_ok=True)
    with open(JOBS, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    total = len(rows); made = 0; skipped = 0; failed = 0
    print(f"{total} jobs in {JOBS}")
    for i, row in enumerate(rows, 1):
        path = os.path.join(OUT, row["filename"])
        if os.path.exists(path) and os.path.getsize(path) > 0:
            skipped += 1; continue
        ok = synth(row["text"], row["locale"], row["voice"], path)
        made += ok; failed += (not ok)
        if i % 200 == 0:
            print(f"  {i}/{total}  made={made} skipped={skipped} failed={failed}")
    print(f"DONE  made={made} skipped={skipped} failed={failed}")
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
