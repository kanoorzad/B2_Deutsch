#!/usr/bin/env python3
"""
Reuse your already-generated Persian audio with the new app.

The previous app named Persian clips audio/fa/<oldhash>.mp3 and they spoke the
Persian WORD translation. The new app finds clips at audio/<fnv1a>.mp3. This
script copies each existing Persian file to its new name so you don't have to
regenerate the ~4,380 word clips you already paid for.

Run it from your repo root (where the `audio/` folder already lives):

    python3 remap_persian_audio.py

It reads persian_remap.csv (old_path,new_path) and copies old -> new.
Originals are left untouched. After running, commit the audio/ folder.
The remaining Persian example-sentence clips are generated normally via the
audio workflow (audio_jobs_fa.csv) and skip anything already present.
"""
import os, csv, shutil, sys

MAP = os.environ.get("REMAP_CSV", "persian_remap.csv")

def main():
    if not os.path.exists(MAP):
        sys.exit("persian_remap.csv not found in this folder.")
    copied = missing = skipped = 0
    with open(MAP, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            old = row["old_path"]            # e.g. audio/fa/62c4...mp3
            new = row["new_path"]            # e.g. audio/26b8...mp3
            if not os.path.exists(old):
                missing += 1; continue
            if os.path.exists(new) and os.path.getsize(new) > 0:
                skipped += 1; continue
            os.makedirs(os.path.dirname(new), exist_ok=True)
            shutil.copyfile(old, new)
            copied += 1
    print(f"copied={copied}  already-present={skipped}  old-missing={missing}")
    print("Done. Commit the audio/ folder, then run the Persian (fa) audio "
          "workflow to fill in the example sentences.")

if __name__ == "__main__":
    main()
