# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2

Build: v85, based on v83 final addendum.

Fixed:
- Problem melden now opens a stable report overlay.
- Flashcard and controls are hidden while reporting.
- Report form includes Betreff, Zusammenfassung, Absenden.
- After submit, German thank-you message and Zurück are shown.
- Zurück restores the learning view/state.
- Voice mapping UI remains removed.
- Wortart filter auto-closes and autoplays.
- Background audio best-effort retained.

Backend:
The frontend posts to `/api/report-problem`.
GitHub Pages cannot execute this endpoint. Deploy `/api/report-problem.js` on Vercel/Node or adapt it to your server.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=85
