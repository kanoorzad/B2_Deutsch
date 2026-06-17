# B2 + B1 Plus Flashcards v35

## Dari/Farsi redesign

v35 keeps v34 but changes the Dari logic:

- **Default:** Browser first — best quality.
- Local sprite audio is only a backup.
- The app no longer switches to local backup just because browser `onend` happens quickly.
- Local backup is used only if:
  - there is no browser Farsi/Persian/Dari voice,
  - browser voice returns an explicit error,
  - browser voice times out.

## New control

In **Voice status**, there is a new **Dari source** selector:

1. Browser first — best quality
2. Browser only — no robotic backup
3. Local backup only

Try **Browser only** on the phone if the local voice sounds robotic.

## QA

- JavaScript syntax: OK
- Version badge: v35
- Dari source selector: yes
- Browser-first no early fallback: yes
- Local fallback only on error/timeout/no voice: yes
- Old cache clearing kept: yes
- Service worker registration disabled: yes
- ZIP size: 17.33 MB

Open:

https://kanoorzad.github.io/B2_Deutsch/?v=35
