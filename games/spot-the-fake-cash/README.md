# Spot the Fake Cash · Station 1

Open `/games/spot-the-fake-cash/` on a booth laptop. The shared booth handles the Game Master PIN, participant selection, saving, retries and next-participant handoff. Use `/games/spot-the-fake-cash/?demo=1` to practise without a PIN or event score. The local Scamurai server serves the game, fonts and Three.js r128 without Internet access.

## Playing

Inspect ten shuffled RM50 banknotes in 120 seconds. Drag the note or use **WASD / ↑ / ↓** to rotate it. Select **Flip note** or press **F** to turn it over. Drag the purple torch across the note and toggle UV with **Space**. Scroll, pinch or use **+ / − / 0** to zoom or reset. Choose **PASS** (**P / ←**) for genuine and **REJECT** (**R / →**) for fake.

Correct verdicts earn 10 points. Wrong or unjudged notes earn zero. The timer keeps running during brief feedback after each verdict. The result shows score out of 100, accuracy among judged notes and a clue for every note. Reloading an active round preserves the shuffled order, verdicts and deadline.

Choose **Enter VR** on the start screen with a WebXR headset and compatible browser on HTTPS or localhost. Use the left stick to rotate or flip and the right stick to zoom. Point a controller at PASS or REJECT and pull its trigger. The right trigger toggles UV when aimed away from the verdict buttons. Squeeze the right grip to pick up or drop the torch. Exit VR to read the full note review.

## RM50 image inventory

**Present:** none. Place the owner's original files in `assets/notes/` using these exact, case-sensitive names. The game loads them automatically the next time the page opens. Keep the originals unaltered.

| Filename | Status |
| --- | --- |
| `RM50 real.png` | Missing |
| `RM50 uv real.png` | Missing |
| `RM50 back clear.png` | Missing |
| `uv back.jpeg` | Missing |
| `RM50 rafflesia.png` | Missing |
| `RM50 uv rafflesia.png` | Missing |
| `RM50 Malaya Fake.png` | Missing |
| `RM50 uv malaya.png` | Missing |
| `RM50 uv fake.png` | Missing |
| `RM50 back atom.png` | Missing |
| `uv back fake atom.jpeg` | Missing |

Labeled placeholders keep the 3D scene playable while images are missing. Use them to practise the controls. The actual visual clues require the image set.

See [credits](assets/CREDITS.md) for the original game and Three.js sources. Run the round tests from the repo root with `node --test games/spot-the-fake-cash/tests/core.test.cjs`.
