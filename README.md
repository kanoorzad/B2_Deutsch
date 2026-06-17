# B2 + B1 Plus Flashcards v43

## Fix

v43 removes the false Dari/Farsi voice candidate:

- `Daria (bg-BG)`

This voice is Bulgarian (`bg-BG`), not Dari/Farsi. It was incorrectly appearing because the name `Daria` contains the letters `Dari`.

## What changed in the filter

The Dari/Farsi candidate scanner now excludes:

- `bg-BG`
- any language code beginning with `bg`
- voice name `Daria`
- Bulgarian voice names

It also matches `Dari` as a full word only, not inside another name.

## Upload

Upload v43 and open:

https://kanoorzad.github.io/B2_Deutsch/?v=43

Then test:

1. Test Online Dari
2. Run Dari voice search
3. Try next Dari candidate

Daria (bg-BG) should no longer appear as a Dari/Farsi candidate.
