# B2 + B1 Plus Flashcards v8 — audio/visual locked

This version fixes the issue where the voice could say German while the screen showed English.

## Root cause fixed

During playback, the old code could still be affected by the selected **Manual card front** setting. For example, if the front setting was English, the card could show "Department" while the German voice said "die Abteilung".

In v8, playback does not depend on the manual front setting. During playback, the screen text and the text sent to pronunciation are the same exact value.

## Required playback order

For each card:

1. German word with article — slow German
2. Plural for nouns OR verb forms for verbs — slow German
3. US English — medium
4. Dari — medium
5. Next card

## Example checked

For `die Abteilung` the playback sequence is:

1. `die Abteilung`
2. `die Abteilungen`
3. `Department`
4. `بخش؛ دیپارتمنت`

## QA

- Total cards: 2254
- Cards with US English: 2254
- Cards with Dari: 2254
- Cards with 2 synonyms/related meanings: 2254
- Playback steps checked: 8392
- Audio/visual mismatches found: 0

## GitHub update

Replace all files in your GitHub repository with this v8 folder's files.

Then open:

https://kanoorzad.github.io/B2_Deutsch/?v=8

Important: because phones cache web apps aggressively, remove the old Home Screen icon, then open the `?v=8` link in the browser and install/add it again.
