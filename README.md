# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2 v83

Final addendum implementation.

Added:
- German TTS priority sanitization for (von + Dat.), (für + Akk.), and (jdn./etw.).
- Options language switch closes drawer and updates current card immediately.
- Dedicated clean voice mapping card in options.
- Wortart filtern dropdown.
- Branding hierarchy.
- PWA install banner.
- Headword single-line fit.
- Synonyms directly under headword.

Limits:
- True 99% semantic synonym verification needs an API.
- Native install prompt depends on browser beforeinstallprompt support.
- Exact Azure voice output requires browser-exposed voices or backend audio.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=83
