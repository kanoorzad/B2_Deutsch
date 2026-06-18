# German A1-B2 telc system Important words v74

Full flow repair after deep review.

## Fixed user-reported issues

- Option button was missing.
- Language could be selected, but the card did not play.

## Root causes found

- `optionsToggle` did not exist in the HTML.
- `app.js` did not expose `playSelected()` or `current()`.
- The previous wizard repair moved screens but still relied on missing playback/render functions.

## v74 repair

- Added a guaranteed options button.
- Added an independent controller after data.js and app.js.
- Controller handles:
  - language selection
  - material selection
  - unit selection
  - card rendering
  - card playback
  - next / previous
  - options drawer open / close
- A1 words and all previous data are kept.

Open:
https://kanoorzad.github.io/B2_Deutsch/?v=74
