#!/usr/bin/env python3
"""
Generate high-quality Persian/Persisch MP3 audio files from persian_audio_jobs.csv.

Works locally or in GitHub Actions.

Required environment variables:
  AZURE_SPEECH_KEY
  AZURE_SPEECH_REGION

Optional:
  AZURE_SPEECH_VOICE=fa-IR-DilaraNeural
  AZURE_OUTPUT_FORMAT=audio-24khz-160kbitrate-mono-mp3
  AUDIO_GENERATION_LIMIT=50       # test first
  AUDIO_GENERATION_FORCE=false    # true to regenerate existing files

Output:
  audio/fa/*.mp3
  audio-manifest.js with ready:true
"""

import csv, os, pathlib, html, json, time, urllib.request, urllib.error, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
JOBS = ROOT / "persian_audio_jobs.csv"
OUT_ROOT = ROOT

KEY = os.environ.get("AZURE_SPEECH_KEY", "").strip()
REGION = os.environ.get("AZURE_SPEECH_REGION", "").strip()
VOICE = os.environ.get("AZURE_SPEECH_VOICE", "fa-IR-DilaraNeural").strip()
OUTPUT_FORMAT = os.environ.get("AZURE_OUTPUT_FORMAT", "audio-24khz-160kbitrate-mono-mp3").strip()
LIMIT_RAW = os.environ.get("AUDIO_GENERATION_LIMIT", "").strip()
FORCE = os.environ.get("AUDIO_GENERATION_FORCE", "false").strip().lower() == "true"

if not KEY or not REGION:
    raise SystemExit("Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION GitHub secret/environment variable.")

LIMIT = None
if LIMIT_RAW:
    try:
        LIMIT = int(LIMIT_RAW)
    except ValueError:
        raise SystemExit("AUDIO_GENERATION_LIMIT must be empty or an integer.")

endpoint = f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1"

def synthesize(text: str, out_path: pathlib.Path) -> bool:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    safe = html.escape((text or "").strip())
    if not safe:
        return False
    ssml = f"""<speak version="1.0" xml:lang="fa-IR">
  <voice xml:lang="fa-IR" name="{VOICE}">
    <prosody rate="-4%" pitch="0%">{safe}</prosody>
  </voice>
</speak>""".encode("utf-8")

    req = urllib.request.Request(
        endpoint,
        data=ssml,
        headers={
            "Ocp-Apim-Subscription-Key": KEY,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": OUTPUT_FORMAT,
            "User-Agent": "deutsch-a1-b2-flashcards"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            if resp.status != 200:
                print("HTTP", resp.status, text[:40])
                return False
            body = resp.read()
            if len(body) < 500:
                print("Too small audio response", len(body), text[:40])
                return False
            out_path.write_bytes(body)
            return True
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "ignore")[:500]
        print("HTTP error", e.code, msg)
    except Exception as e:
        print("Error", repr(e))
    return False

def build_manifest(rows):
    items = {}
    generated = 0
    for row in rows:
        rel = row["audio_path"]
        if (OUT_ROOT / rel).exists() and (OUT_ROOT / rel).stat().st_size > 500:
            items[row["id"]] = rel
            generated += 1

    manifest = f"""// Generated audio manifest.
window.PREGENERATED_AUDIO = {{
  fa: {{
    ready: {str(generated > 0).lower()},
    quality: "{OUTPUT_FORMAT}",
    voice: "{VOICE}",
    expectedCount: {len(rows)},
    generatedCount: {generated},
    basePath: "",
    items: {json.dumps(items, ensure_ascii=False, indent=4)}
  }}
}};
"""
    (ROOT / "audio-manifest.js").write_text(manifest, encoding="utf-8")
    return generated

def main():
    rows = list(csv.DictReader(JOBS.open("r", encoding="utf-8")))
    all_rows = rows[:]
    if LIMIT is not None:
        rows = rows[:LIMIT]
        print(f"Testing mode: generating first {len(rows)} rows")

    done = skipped = failed = 0

    for i, row in enumerate(rows, 1):
        rel = row["audio_path"]
        text = row["fa_text"]
        out_path = OUT_ROOT / rel

        if out_path.exists() and out_path.stat().st_size > 500 and not FORCE:
            skipped += 1
            continue

        ok = synthesize(text, out_path)
        if ok:
            done += 1
            print(f"[{i}/{len(rows)}] OK {row['id']} -> {rel}")
        else:
            failed += 1
            print(f"[{i}/{len(rows)}] FAIL {row['id']}", file=sys.stderr)

        time.sleep(0.08)

    generated = build_manifest(all_rows)

    print("Summary:", {
        "generated_now": done,
        "skipped_existing": skipped,
        "failed": failed,
        "manifest_generated_count": generated,
        "all_jobs": len(all_rows)
    })

    if failed:
        print("Some rows failed. You can rerun the workflow; existing MP3 files will be skipped.", file=sys.stderr)

if __name__ == "__main__":
    main()
