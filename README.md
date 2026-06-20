# Deutsch Sprache – Wichtige Wörter – telc System – A1-B2

Build: v90 stable repair

What was wrong in v89:
- The live OpenThesaurus synonym feature watched the flashcard DOM and also wrote into the same DOM area.
- This could trigger repeated updates and freeze the browser.
- The silent-audio speechSynthesis patch could also interfere with browser TTS playback.

Repair:
- Rebuilt from stable v88.
- Removed the risky v89 synonym/API observer and audio wrapper.
- Kept APP_VERSION = v1 as a safe display only.
- Preserved all data from v88.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=90
