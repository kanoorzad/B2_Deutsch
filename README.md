# B2 + B1 Plus Flashcards v34

## What v34 fixes differently

v34 is based on the v30 working audio sprite, but changes the audio system around it:

1. It automatically unregisters old service workers and clears old caches once.
2. It does not register a new service worker.
3. German and English use native browser/device voices with better voice ranking.
4. Dari/Farsi uses Auto mode:
   - try real device Farsi/Persian voice if available and not silent
   - otherwise use the local sprite audio that worked in v30
5. Top-right version is forced to v34.

## Why this matters

If the page still showed v20 or all voices stopped, the likely cause is stale service-worker/cache state or blocked audio activation, not the data itself. v34 resets that.

## QA

- JavaScript syntax: OK
- ZIP size: 17.33 MB
- Total sprite audio: 25.17 MB
- Sprite entries: 2025
- Old service workers unregistered: yes
- New service worker registered: no

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=34

On first load, v34 may reload once with `fresh34=...`. Then tap **Refresh voices**, **Test German**, **Test English**, and **Test Dari**.
