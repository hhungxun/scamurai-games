# Spot the Fake Cash · Station 1

Open `/games/spot-the-fake-cash/` on a booth laptop. The shared booth handles the Game Master PIN, participant selection, saving, retries and next-participant handoff. Use `/games/spot-the-fake-cash/?demo=1` to practise without a PIN or event score. Opening `game.html` directly runs an unscored practice round. The local Scamurai server serves the game, fonts and Three.js r128 without Internet access.

## Playing

Each round draws ten RM50 banknotes at random from twelve note sets (four genuine, eight fake), and you have 120 seconds. Drag the note or use **WASD / ↑ / ↓** to rotate it. Select **Flip note** or press **F** to turn it over. Drag the purple torch across the note and toggle UV with **Space**. Scroll, pinch or use **+ / − / 0** to zoom or reset. Choose **PASS** (**P / ←**) for genuine and **REJECT** (**R / →**) for fake.

Correct verdicts earn 10 points. Wrong or unjudged notes earn zero. The timer keeps running during brief feedback after each verdict. The result shows score out of 100, accuracy among judged notes and a clue for every note. Reloading an active round preserves the shuffled order, verdicts and deadline.

Choose **Enter VR** on the start screen with a WebXR headset and compatible browser on HTTPS or localhost. Use the left stick to rotate or flip and the right stick to zoom. Point a controller at PASS or REJECT and pull its trigger. The right trigger toggles UV when aimed away from the verdict buttons. Squeeze the right grip to pick up or drop the torch. Exit VR to read the full note review.

## RM50 image inventory

All twelve images are present in `assets/notes/` as JPEGs, taken from the owner's latest asset pack (Nov 2026). `js/game-core.js` names them with lowercase hyphenated names, such as `front-real.jpg`, `front-uv-rafflesia.jpg` and `back-uv-fake-atom.jpg`. Keep the designs and colours unaltered (BNM reproduction rules). If an image fails to load, the game draws a labelled placeholder and keeps the round playable.

See [credits](assets/CREDITS.md) for the original game and Three.js sources. Run the round tests from the repo root with `node --test games/spot-the-fake-cash/tests/core.test.cjs`.
