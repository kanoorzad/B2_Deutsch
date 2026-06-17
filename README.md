# B2 + B1 Plus Flashcards v9 — clean speech + clean flip

## What v9 fixes

1. **German on flip card**
   - German now always goes into the German flip section.
   - US English now always goes into the English section.
   - Dari now always goes into the Dari section.

2. **No spoken/display label for plural**
   - The plural step no longer shows or speaks `Plural:`.
   - It shows only the plural form, e.g. `die Abteilungen`.

3. **No English “slash” pronunciation**
   - English alternatives such as `meaning / importance` are converted to `meaning or importance` for display/playback.
   - The voice should not say “slash”.

4. **Cleaner verb-form step**
   - Verb forms remain in the flip view with labels.
   - Playback/front-card form step uses clean form values, not noisy UI labels.

## Playback order

1. German word with article — slow German
2. Noun plural OR verb form values — slow German
3. US English — medium
4. Dari — medium
5. Next card

## QA

- Total cards: 2254
- Playback steps checked: 8392
- English speech items containing `/`: 0
- German playback items starting with UI labels like `Plural:`: 0
- Cards with English: 2254
- Cards with Dari: 2254
- Cards with 2 synonyms: 2254

## Example: die Abteilung

1. `die Abteilung`
2. `die Abteilungen`
3. `Department`
4. `دیپارتمنت، بخش`

## GitHub update

Replace all files in your GitHub repository with this v9 folder's files.

Then open:

https://kanoorzad.github.io/B2_Deutsch/?v=9

On iPhone or Android, remove the old Home Screen icon, open the `?v=9` link in Safari/Chrome, then add/install again.
