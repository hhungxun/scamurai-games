# Spot the Fake Cash · Station 1

Open `/games/spot-the-fake-cash/` on a booth laptop. The shared booth handles the Game Master PIN, participant selection, saving, retries and next-participant handoff. Use `/games/spot-the-fake-cash/?demo=1` to practise without a PIN or event score. Opening `game.html` directly runs an unscored practice round. The local Scamurai server serves the game, fonts and the note images without Internet access.

## Playing

Each round draws ten banknotes at random from 29 note sets across five Malaysian ringgit denominations (RM5, RM10, RM20, RM50, RM100), mixing genuine notes with fakes (daylight logo, motif or serial forgeries, UV defects, and flat holograms that fail the tilt test). `BANKNOTE_SETS` in `js/game-core.js` is the full list. You have 120 seconds.

Inspect a note like a cashier with a UV lamp:

- **UV torch** — hover or drag the purple torch across the note to reveal the glowing security pattern through the beam. Toggle UV with **Space**.
- **Tilt** — press **T** or **Tilt** to check that the hologram strip shifts colour.
- **Flip** — press **F** or **Flip note** to turn the note over and compare both sides.
- **Zoom** — scroll, pinch, or use **+ / − / 0** to zoom in, out, and reset; drag a zoomed note to pan.

Choose **PASS** (**P / ←**) for genuine and **REJECT** (**R / →**) for fake.

Correct verdicts earn 10 points. Wrong or unjudged notes earn zero. The timer keeps running during the brief feedback after each verdict. The result shows the score out of 100, accuracy among judged notes, and a review clue for every note. Reloading an active round preserves the shuffled order, verdicts and deadline.

Toggle **中文** in the header to switch the whole interface between English and Simplified Chinese.

## Banknote images

The images live in `assets/notes/` as JPEGs, based on the Bank Negara Malaysia website (`bnm.gov.my`). `js/game-core.js` names them per denomination, side and variant, such as `rm10-front-real.jpg`, `rm10-back-uv-real.jpg` and `rm100-back-fake.jpg`. Keep the designs and colours unaltered (BNM reproduction rules). If an image fails to load, the game draws a labelled placeholder and keeps the round playable.

See [credits](assets/CREDITS.md) for image sources. Run the round tests from the repo root with `node --test games/spot-the-fake-cash/tests/core.test.cjs`.
