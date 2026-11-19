# Spot the Fake Cash · Station 1

Open `/games/spot-the-fake-cash/` on a booth laptop. The shared Scamurai booth handles staff login, participant selection, saving, retries and next-participant handoff. Open `/games/spot-the-fake-cash/?demo=1` for unscored practice with no login. All resources come from the local Scamurai server. Internet access is unnecessary.

## Round and scoring

Inspect five shuffled samples in 60 seconds. Each round focuses once on each tool and contains two or three fakes with one or two simulated faults each. Tilt and Feel have sliders. Backlight, UV and Magnifier each have a toggle. Shortcuts **T / L / U / M / F** select the tools. **1** submits Real and **2** submits Fake. The timer continues during feedback. The result includes answer review and checks to try on real cash.

A correct answer earns **20**, a wrong answer deducts **20**, and an unanswered sample earns **0**. The final score ranges from **0 to 100**. Progress and the original deadline survive a reload in the booth. Demo rounds never submit event scores.

## Artwork and research

The abstract evidence diagrams are drawn locally with HTML and CSS. The game omits all real banknote images because we could not verify permission for reuse. See [sources and reproduction rules](assets/CREDITS.md) for the BNM references and artwork details.

Run the round logic tests with `node --test games/spot-the-fake-cash/tests/core.test.cjs` from the project root.
