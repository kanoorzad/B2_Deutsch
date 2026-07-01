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

# Optional sharding: split the job across N parallel runners.
# SHARD_INDEX is 0-based; SHARD_TOTAL is how many shards. Each runner processes
# only the rows where (row_number % SHARD_TOTAL == SHARD_INDEX). This lets 8k+
# Persian clips finish in ~1 hour across e.g. 6 parallel jobs instead of timing out.
try:
    SHARD_INDEX = int(os.environ.get("SHARD_INDEX", "0"))
    SHARD_TOTAL = int(os.environ.get("SHARD_TOTAL", "1"))
except ValueError:
    SHARD_INDEX, SHARD_TOTAL = 0, 1
if SHARD_TOTAL < 1: SHARD_TOTAL = 1
if not (0 <= SHARD_INDEX < SHARD_TOTAL): SHARD_INDEX = 0

if not KEY or not REGION:
    sys.exit("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION")

# Request pacing. Azure's FREE (F0) tier is capped at ~20 requests/minute; exceeding it
# returns 429 on every call. REQUEST_INTERVAL is the minimum seconds between requests.
# Default 3.2s ≈ 18 requests/min, safely under the F0 cap. On a paid S0 key set
# REQUEST_INTERVAL=0 (or a small value) for full speed.
try:
    REQUEST_INTERVAL = float(os.environ.get("REQUEST_INTERVAL", "3.2"))
except ValueError:
    REQUEST_INTERVAL = 3.2
_last_request_at = [0.0]  # mutable holder for the timestamp of the last request

ENDPOINT = f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
# 24kHz mono mp3 — small files, good quality for flashcards
FORMAT = "audio-24khz-48kbitrate-mono-mp3"

def ssml(text, locale, voice):
    safe = html.escape(text, quote=False)
    return (f"<speak version='1.0' xml:lang='{locale}'>"
            f"<voice xml:lang='{locale}' name='{voice}'>{safe}</voice></speak>")

def synth(text, locale, voice, path, retries=7):
    body = ssml(text, locale, voice).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=body, method="POST", headers={
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": FORMAT,
        "User-Agent": "deutsch-lernen-audio",
    })
    for attempt in range(retries):
        # Pace requests: wait until at least REQUEST_INTERVAL has passed since the last one.
        if REQUEST_INTERVAL > 0:
            wait = REQUEST_INTERVAL - (time.time() - _last_request_at[0])
            if wait > 0:
                time.sleep(wait)
            _last_request_at[0] = time.time()
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                data = r.read()
            if not data:
                time.sleep(2 ** attempt); continue
            with open(path, "wb") as f:
                f.write(data)
            return True
        except urllib.error.HTTPError as e:
            if e.code == 429:           # throttled — respect Retry-After, longer backoff
                ra = e.headers.get("Retry-After")
                wait = int(ra) if (ra and ra.isdigit()) else min(60, 2 ** (attempt + 1))
                print(f"  429 THROTTLED (attempt {attempt+1}) waiting {wait}s — Azure rate limit hit", flush=True)
                time.sleep(wait); continue
            if e.code >= 500:           # transient server error — back off and retry
                print(f"  HTTP {e.code} (attempt {attempt+1}) — server error, retrying", flush=True)
                time.sleep(min(30, 2 ** attempt)); continue
            print(f"  HTTP {e.code}: {e.reason} — {'BAD KEY/UNAUTHORIZED' if e.code==401 else 'QUOTA/FORBIDDEN' if e.code==403 else ''}", flush=True)
            return False
        except Exception as e:
            print(f"  network error (attempt {attempt+1}): {e!r}", flush=True)
            time.sleep(min(30, 2 ** attempt))
    print(f"  giving up on {os.path.basename(path)}", flush=True)
    return False

def main():
    os.makedirs(OUT, exist_ok=True)
    with open(JOBS, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if SHARD_TOTAL > 1:
        rows = [r for i, r in enumerate(rows) if i % SHARD_TOTAL == SHARD_INDEX]
        print(f"SHARD {SHARD_INDEX+1}/{SHARD_TOTAL}: {len(rows)} of the jobs")
    total = len(rows); made = 0; skipped = 0; failed = 0
    print(f"{total} jobs in {JOBS}", flush=True)

    # Startup self-test: synthesize ONE clip first and report the result immediately,
    # so the log shows within seconds whether Azure is reachable / authorized / throttled
    # instead of appearing frozen for a long time.
    if total:
        import time as _t
        t0 = _t.time()
        r0 = rows[0]
        test_path = os.path.join(OUT, r0["filename"])
        print(f"SELFTEST: requesting 1 clip from Azure (voice={r0.get('voice')}, region set)…", flush=True)
        ok0 = synth(r0["text"], r0["locale"], r0["voice"], test_path)
        print(f"SELFTEST: {'OK' if ok0 else 'FAILED'} in {(_t.time()-t0):.1f}s", flush=True)
        if not ok0:
            print("SELFTEST FAILED — Azure is not returning audio. Common causes: wrong key/region, "
                  "quota exhausted, or heavy throttling (429). Check the HTTP error line above.", flush=True)

    import subprocess
    def commit_progress(tag=""):
        """Commit whatever audio exists so far, so a timeout never loses progress."""
        try:
            subprocess.run(["git","add","audio"], check=False)
            r=subprocess.run(["git","diff","--cached","--quiet"])
            if r.returncode==0:
                return  # nothing new
            subprocess.run(["git","-c","user.name=github-actions[bot]",
                            "-c","user.email=github-actions[bot]@users.noreply.github.com",
                            "commit","-m",f"Add Persian audio clips (checkpoint {tag})"], check=False)
            for _ in range(5):
                subprocess.run(["git","pull","--rebase","origin","main"], check=False)
                p=subprocess.run(["git","push","origin","HEAD:main"])
                if p.returncode==0:
                    print(f"  checkpoint committed & pushed ({tag})", flush=True); return
                time.sleep(5)
        except Exception as e:
            print(f"  checkpoint commit skipped: {e!r}", flush=True)

    for i, row in enumerate(rows, 1):
        path = os.path.join(OUT, row["filename"])
        if os.path.exists(path) and os.path.getsize(path) > 0:
            skipped += 1; continue
        ok = synth(row["text"], row["locale"], row["voice"], path)
        made += ok; failed += (not ok)
        # Log frequently and FLUSH so progress is visible live, not buffered.
        if i <= 10 or i % 50 == 0:
            print(f"  {i}/{total}  made={made} skipped={skipped} failed={failed}", flush=True)
        # Push a checkpoint every 500 newly-made clips so a timeout never loses work.
        if made and made % 500 == 0 and ok:
            commit_progress(tag=f"{made} made")
    print(f"DONE  made={made} skipped={skipped} failed={failed}", flush=True)
    # Re-runnable by design: skipped clips already exist, so any clips that failed
    # this run will simply be retried on the next run. Only treat the run as failed
    # if a LARGE share of *attempted* clips failed (real outage / bad config),
    # so a handful of transient errors don't turn a mostly-successful, already
    # committed batch red. Missing clips are picked up next run.
    attempted = made + failed
    if attempted and failed > max(20, attempted * 0.10):
        print(f"High failure rate ({failed}/{attempted}) — marking run failed for investigation.")
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()
