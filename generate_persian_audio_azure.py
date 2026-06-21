#!/usr/bin/env python3
# Root-level generator for high-quality Persian/Persisch MP3 audio.
# Put this file in the repository root as generate_persian_audio_azure.py. No tools/ folder required.
import csv, os, pathlib, html, json, time, urllib.request, urllib.error, sys
ROOT = pathlib.Path(__file__).resolve().parent
JOBS = ROOT / "persian_audio_jobs.csv"
OUT_ROOT = ROOT
KEY = os.environ.get("AZURE_SPEECH_KEY", "").strip()
REGION = os.environ.get("AZURE_SPEECH_REGION", "").strip()
VOICE = os.environ.get("AZURE_SPEECH_VOICE", "fa-IR-DilaraNeural").strip()
OUTPUT_FORMAT = os.environ.get("AZURE_OUTPUT_FORMAT", "audio-24khz-160kbitrate-mono-mp3").strip()
LIMIT_RAW = os.environ.get("AUDIO_GENERATION_LIMIT", "").strip()
FORCE = os.environ.get("AUDIO_GENERATION_FORCE", "false").strip().lower() == "true"
if not KEY: raise SystemExit("Missing AZURE_SPEECH_KEY GitHub secret.")
if not REGION: raise SystemExit("Missing AZURE_SPEECH_REGION GitHub secret.")
if not JOBS.exists(): raise SystemExit("Missing persian_audio_jobs.csv in repository root.")
LIMIT = None
if LIMIT_RAW:
    try: LIMIT = int(LIMIT_RAW)
    except ValueError: raise SystemExit("AUDIO_GENERATION_LIMIT must be empty or an integer.")
endpoint = "https://" + REGION + ".tts.speech.microsoft.com/cognitiveservices/v1"
def synthesize(text, out_path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    safe = html.escape((text or "").strip())
    if not safe: return False
    ssml = ("<speak version='1.0' xml:lang='fa-IR'>"
            "<voice xml:lang='fa-IR' name='" + VOICE + "'>"
            "<prosody rate='-4%' pitch='0%'>" + safe + "</prosody>"
            "</voice></speak>").encode("utf-8")
    req = urllib.request.Request(endpoint, data=ssml, headers={
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": OUTPUT_FORMAT,
        "User-Agent": "deutsch-a1-b2-flashcards"
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read()
            if resp.status != 200:
                print("HTTP", resp.status, text[:80], file=sys.stderr); return False
            if len(body) < 500:
                print("Audio response too small", len(body), text[:80], file=sys.stderr); return False
            out_path.write_bytes(body); return True
    except urllib.error.HTTPError as e:
        print("HTTP error", e.code, e.read().decode("utf-8", "ignore")[:800], file=sys.stderr)
    except Exception as e:
        print("Error", repr(e), file=sys.stderr)
    return False
def build_manifest(all_rows):
    items = {}; generated = 0
    for row in all_rows:
        rel = row["audio_path"]; p = OUT_ROOT / rel
        if p.exists() and p.stat().st_size > 500:
            items[row["id"]] = rel; generated += 1
    manifest = "// Generated Persisch audio manifest.\nwindow.PREGENERATED_AUDIO = {\n  fa: {\n" + \
               "    ready: " + str(generated > 0).lower() + ",\n" + \
               "    quality: \"" + OUTPUT_FORMAT + "\",\n" + \
               "    voice: \"" + VOICE + "\",\n" + \
               "    expectedCount: " + str(len(all_rows)) + ",\n" + \
               "    generatedCount: " + str(generated) + ",\n" + \
               "    basePath: \"\",\n" + \
               "    items: " + json.dumps(items, ensure_ascii=False, indent=4) + "\n  }\n};\n"
    (ROOT / "audio-manifest.js").write_text(manifest, encoding="utf-8")
    return generated
def main():
    all_rows = list(csv.DictReader(JOBS.open("r", encoding="utf-8")))
    rows = all_rows[:LIMIT] if LIMIT is not None else all_rows
    print(("TEST" if LIMIT is not None else "FULL") + " MODE: generating " + str(len(rows)) + " rows")
    done = skipped = failed = 0
    for i, row in enumerate(rows, 1):
        rel = row["audio_path"]; out_path = OUT_ROOT / rel
        if out_path.exists() and out_path.stat().st_size > 500 and not FORCE:
            skipped += 1; continue
        ok = synthesize(row["fa_text"], out_path)
        if ok:
            done += 1; print("[" + str(i) + "/" + str(len(rows)) + "] OK " + row["id"] + " -> " + rel)
        else:
            failed += 1; print("[" + str(i) + "/" + str(len(rows)) + "] FAIL " + row["id"], file=sys.stderr)
        time.sleep(0.08)
    generated = build_manifest(all_rows)
    print("Summary:", {"generated_now": done, "skipped_existing": skipped, "failed": failed, "manifest_generated_count": generated, "all_jobs": len(all_rows)})
if __name__ == "__main__": main()
