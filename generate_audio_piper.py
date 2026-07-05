#!/usr/bin/env python3
"""
FREE offline neural TTS using Piper — no API, no key, no quota, no rate limit.
Reads audio_jobs_*.csv (filename, locale, voice, text) and writes MP3s with the
EXACT filenames the app expects. Piper outputs WAV; ffmpeg converts to MP3.
"""
import os, sys, csv, subprocess, wave, glob, traceback

JOBS  = os.environ.get("JOBS_CSV", "audio_jobs_fa.csv")
OUT   = os.environ.get("AUDIO_OUT", "audio")
MODEL = os.environ.get("PIPER_MODEL", "")   # path to .onnx; auto-detected if empty

try:
    SHARD_INDEX = int(os.environ.get("SHARD_INDEX", "0"))
    SHARD_TOTAL = int(os.environ.get("SHARD_TOTAL", "1"))
except ValueError:
    SHARD_INDEX, SHARD_TOTAL = 0, 1
if SHARD_TOTAL < 1: SHARD_TOTAL = 1
if not (0 <= SHARD_INDEX < SHARD_TOTAL): SHARD_INDEX = 0

# Locate the model file if not given explicitly.
if not MODEL:
    cands = sorted(glob.glob("*.onnx")) + sorted(glob.glob("**/*.onnx", recursive=True))
    if not cands:
        sys.exit("ERROR: no .onnx Piper model found in the working directory.")
    MODEL = cands[0]

print(f"Using model: {MODEL}", flush=True)
if not os.path.exists(MODEL) or os.path.getsize(MODEL) < 1_000_000:
    sz = os.path.getsize(MODEL) if os.path.exists(MODEL) else 0
    sys.exit(f"ERROR: model file looks wrong (size={sz} bytes). Download likely failed.")

try:
    from piper import PiperVoice
    voice = PiperVoice.load(MODEL)
    print("Piper model loaded OK.", flush=True)
except Exception as e:
    print("ERROR loading Piper model:", repr(e), flush=True)
    traceback.print_exc()
    sys.exit(1)


def synth_to_mp3(text, mp3_path):
    wav_path = mp3_path[:-4] + ".wav"
    try:
        with wave.open(wav_path, "wb") as wf:
            voice.synthesize_wav(text, wf)
        r = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path,
             "-ar", "24000", "-ac", "1", "-b:a", "64k", mp3_path],
            capture_output=True)
        ok = (r.returncode == 0 and os.path.exists(mp3_path) and os.path.getsize(mp3_path) > 0)
        if not ok:
            print(f"  ffmpeg failed: {r.stderr.decode()[:160]}", flush=True)
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
        print(f"SELFTEST: synthesizing 1 clip… text={r0['text'][:30]!r}", flush=True)
        ok0 = synth_to_mp3(r0["text"], os.path.join(OUT, r0["filename"]))
        print(f"SELFTEST: {'OK' if ok0 else 'FAILED'}", flush=True)
        if not ok0:
            sys.exit("SELFTEST failed — see the error above (model/phonemization/ffmpeg).")
        made += 1

    for i, row in enumerate(rows, 1):
        path = os.path.join(OUT, row["filename"])
        if os.path.exists(path) and os.path.getsize(path) > 1000:   # real MP3, not a stub
            skipped += 1; continue
        ok = synth_to_mp3(row["text"], path)
        made += ok; failed += (not ok)
        if i <= 5 or i % 100 == 0 or (not ok):
            print(f"  {i}/{total}  made={made} skipped={skipped} failed={failed}", flush=True)

    print(f"DONE  made={made} skipped={skipped} failed={failed}  (of {total})", flush=True)
    if failed:
        print(f"NOTE: {failed} clips failed this run. Re-run to retry just those "
              f"(existing clips are skipped).", flush=True)
    sys.exit(0)


if __name__ == "__main__":
    main()
