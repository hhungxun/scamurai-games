# Spot the Fake Cash · Station 1

Open `/games/spot-the-fake-cash/` on a booth laptop. The shared booth handles the Game Master PIN, participant selection, saving, retries and next-participant handoff. Use `/games/spot-the-fake-cash/?demo=1` to practise without a PIN or event score. Opening `game.html` directly runs an unscored practice round. The local Scamurai server serves the game, fonts and the note images without Internet access.

## Playing

Each round draws ten banknotes at random from eighteen note sets — six Malaysian ringgit denominations (RM1, RM5, RM10, RM20, RM50, RM100), each as a genuine note, a mismatched-sides note, and a UV-defect note (six genuine, twelve fake). You have 120 seconds.

Inspect a note like a cashier with a UV lamp:

- **UV torch** — hover or drag the purple torch across the note to reveal the glowing security pattern through the beam. Toggle UV with **Space**.
- **Flip** — press **F** or **Flip note** to turn the note over and compare both sides.
- **Zoom** — scroll, pinch, or use **+ / − / 0** to zoom in, out, and reset; drag a zoomed note to pan.

Choose **PASS** (**P / ←**) for genuine and **REJECT** (**R / →**) for fake.

Correct verdicts earn 10 points. Wrong or unjudged notes earn zero. The timer keeps running during the brief feedback after each verdict. The result shows the score out of 100, accuracy among judged notes, and a review clue for every note. Reloading an active round preserves the shuffled order, verdicts and deadline.

Toggle **中文** in the header to switch the whole interface between English and Simplified Chinese.

## Banknote images

All twelve images are present in `assets/notes/` as PNGs, downloaded from the Bank Negara Malaysia website (`bnm.gov.my`). `js/game-core.js` names them per denomination and side, such as `RM1-f.png`, `RM1-b.png` and `RM10-bk.png`. Keep the designs and colours unaltered (BNM reproduction rules). If an image fails to load, the game draws a labelled placeholder and keeps the round playable.

See [credits](assets/CREDITS.md) for image sources. Run the round tests from the repo root with `node --test games/spot-the-fake-cash/tests/core.test.cjs`.
