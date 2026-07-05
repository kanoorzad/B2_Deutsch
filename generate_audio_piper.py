#!/usr/bin/env python3
"""
FREE offline neural TTS using Piper — no API, no key, no quota, no rate limit.
Runs entirely inside the GitHub Actions runner. Reads the same audio_jobs_*.csv
(columns: filename, locale, voice, text) and writes MP3s with the EXACT filenames
the app expects, so no app change is needed.

Piper produces WAV; we convert to MP3 with ffmpeg to match the app's <hash>.mp3 lookup.

Env:
  JOBS_CSV        CSV of jobs (default audio_jobs_fa.csv)
  AUDIO_OUT       output dir (default audio)
  PIPER_MODEL     path to the .onnx voice model (default fa_IR-gyro-medium.onnx)
  SHARD_INDEX / SHARD_TOTAL   optional parallel sharding
"""
import os, sys, csv, subprocess, wave

JOBS  = os.environ.get("JOBS_CSV", "audio_jobs_fa.csv")
OUT   = os.environ.get("AUDIO_OUT", "audio")
MODEL = os.environ.get("PIPER_MODEL", "fa_IR-gyro-medium.onnx")

try:
    SHARD_INDEX = int(os.environ.get("SHARD_INDEX", "0"))
    SHARD_TOTAL = int(os.environ.get("SHARD_TOTAL", "1"))
except ValueError:
    SHARD_INDEX, SHARD_TOTAL = 0, 1
if SHARD_TOTAL < 1: SHARD_TOTAL = 1
if not (0 <= SHARD_INDEX < SHARD_TOTAL): SHARD_INDEX = 0

# Load Piper once (the model stays in memory for the whole run — this is what makes
# it fast: no per-clip network round-trip like a cloud API).
from piper import PiperVoice
print(f"Loading Piper model: {MODEL}", flush=True)
voice = PiperVoice.load(MODEL)
print("Model loaded.", flush=True)


def synth_to_mp3(text, mp3_path):
    wav_path = mp3_path[:-4] + ".wav"
    try:
        with wave.open(wav_path, "wb") as wf:
            voice.synthesize_wav(text, wf)
        # convert WAV -> MP3 (24kHz mono, ~64k) with ffmpeg, quietly
        r = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path,
             "-ar", "24000", "-ac", "1", "-b:a", "64k", mp3_path],
            capture_output=True)
        ok = (r.returncode == 0 and os.path.exists(mp3_path) and os.path.getsize(mp3_path) > 0)
        if not ok:
            print(f"  ffmpeg failed for {os.path.basename(mp3_path)}: {r.stderr.decode()[:120]}", flush=True)
        return ok
    except Exception as e:
        print(f"  synth error for {os.path.basename(mp3_path)}: {e!r}", flush=True)
        return False
    finally:
        if os.path.exists(wav_path):
            try: os.remove(wav_path)
            except OSError: pass


def main():
    os.makedirs(OUT, exist_ok=True)
    with open(JOBS, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if SHARD_TOTAL > 1:
        rows = [r for i, r in enumerate(rows) if i % SHARD_TOTAL == SHARD_INDEX]
        print(f"SHARD {SHARD_INDEX+1}/{SHARD_TOTAL}: {len(rows)} jobs", flush=True)

    total = len(rows); made = 0; skipped = 0; failed = 0
    print(f"{total} jobs in {JOBS}", flush=True)

    if total:
        r0 = rows[0]
        print("SELFTEST: synthesizing 1 clip with Piper…", flush=True)
        ok0 = synth_to_mp3(r0["text"], os.path.join(OUT, r0["filename"]))
        print(f"SELFTEST: {'OK' if ok0 else 'FAILED'}", flush=True)
        if ok0: made += 1

    for i, row in enumerate(rows, 1):
        path = os.path.join(OUT, row["filename"])
        if os.path.exists(path) and os.path.getsize(path) > 0:
            skipped += 1; continue
        ok = synth_to_mp3(row["text"], path)
        made += ok; failed += (not ok)
        if i <= 5 or i % 100 == 0:
            print(f"  {i}/{total}  made={made} skipped={skipped} failed={failed}", flush=True)

    print(f"DONE  made={made} skipped={skipped} failed={failed}", flush=True)
    # Piper is deterministic and offline; a high failure rate means a real problem.
    if failed > max(20, total * 0.10):
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
