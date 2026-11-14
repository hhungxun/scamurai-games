# Scamurai Games 🥷

Anti-scam awareness games for **Scamurai** (MPU4.1 Community Service, XMUM, group AG1-2), played at our interactive booths on **Thu 26 Nov 2026**.

Anyone in the group can add a game. Every game lives in its own folder under `games/`.

## Play

- **Event site:** https://scamurai.physicsxmum.my/ (registration desk, games, [leaderboard](https://scamurai.physicsxmum.my/leaderboard.html))
- Game list on GitHub Pages: https://hhungxun.github.io/scamurai-games/ (no scores saved there)

## Add your game

1. Click **Fork** (top right) to get your own copy of this repo.
2. In your fork, add a folder `games/<your-game-name>/` (lowercase, dashes, e.g. `games/spot-the-phish/`) with your game in it. You can copy `games/_template/` to start.
3. Open a **pull request** back to this repo. We'll merge it and add your game to the site.

Games are **web games** that open from `index.html` (plain HTML/JS, no build step). Add a short `README.md` in your folder saying how to play.

## Connect your game to the scoreboard

Every visitor registers once at the front desk and gets a Participant ID (student ID, or `G001`… for guests). Your game doesn't ask for names: add one script tag and two calls.

```html
<script src="https://scamurai.physicsxmum.my/sdk.js" data-station="3"></script>
<script>
  Scamurai.onStart(player => {
    // player = { id, name, station, roundId }
    startMyGame(player.name);
  });

  function gameOver(points) {
    Scamurai.finish({ score: points, maxScore: 10 });   // any scale; saved as 0–100
  }
</script>
```

- Before each round the SDK shows the Game Master start screen: station PIN (once per laptop), a search box to pick the Participant, and a **Leaving** button that opens the exit survey.
- After `finish()` it shows the result and reloads the page for the next player. Replays are fine; the best round counts.
- While building, use `data-test="1"` on the script tag: you get a fake "Test Player" and nothing is saved.
- `data-station` is your station number (1–5). Ask the group for the station PIN on the day; PINs never go in this repo.
- Your station's exit-survey questions live in `server/stations.json`. Send a PR to change them.

### Several players at once

If your game runs on players' own phones, one laptop can run many Rounds at once. Use `onDashboard` instead of `onStart`:

```js
Scamurai.onDashboard(() => { /* draw your dashboard with a "+ New player" button */ });
const p = await Scamurai.pick();                       // picker; { id, name, roundId, token } or null
const res = await Scamurai.finishRound(p.roundId, { score, maxScore });   // no reload
await Scamurai.cancelRound(p.roundId);                 // doesn't count
const open = await Scamurai.openRounds();              // rebuild after a reload / on a 2nd laptop
if (res.surveyDue) Scamurai.survey(p, res.stationsDone);
Scamurai.leaving();                                    // check someone out
```

A Participant can't have two Rounds open at the same Station. Finishing a Round twice (two laptops) is safe: the second call gets the first result back with `already: true`.

Station 5, [`games/scan-me-if-you-can/`](games/scan-me-if-you-can/), is a full example (dashboard, phones, live events).

Station 5 scoring, per site: right = 60 + up to 40 for speed, wrong call = −100, time ran out = 0; a round's total never goes below 0. The penalty means tapping FAKE on everything (about 5 of 8 are Fake) scores far below reading carefully.

Station 5 on the phone: scanning the Join QR opens an in-game camera scanner and requests camera access. Each Site Card has **12 seconds**. Only the first scanned card offers **Start timer**, after its site has loaded. Later cards start their clock immediately when their board QR is detected, including navigation and loading time. The next requested site is warmed in the background while the Participant finds its QR. After every Verdict, the result screen opens the scanner for the next QR; no switch back to the phone's camera app is needed. Camera permission failures show instructions and an **Enable camera** retry button. The scanner uses native QR detection where available and a bundled jsQR fallback for other browsers. Camera frames stay on the device.

Timer start times are saved on the phone, so reloading or going back resumes the existing clock automatically and never gives a fresh 12 seconds. A Verdict that cannot reach the laptop is kept on the phone and resent on the next scan or page open. Scanning a second Join QR while a Round is unfinished asks first. If two phones join one Round, the laptop tile says so in red. A Station 5 laptop deals from the cards that loaded and shows a red banner if any failed.

**My scores** is available on the phone scanner, before and during each Site Card, and after every result, including the last one. It opens `phone.html?view=scores` with the current Round's total and results for each QR, without requesting camera access. **Continue playing** returns to scanning; **Resume QR** returns to an unfinished card with its original deadline. Opening scores does not pause or reset a running timer.

Station 5 browser checks (local, throwaway data only):

```bash
python3 games/scan-me-if-you-can/tools/e2e_dashboard.py
python3 games/scan-me-if-you-can/tools/e2e_phone.py
```

Both use Python Playwright with Chromium installed; the camera-feed test also needs `qrcode` and Pillow. The camera test decodes QR images from a canvas video stream and covers permission recovery, wrong/repeated QRs, first-card start, scan-time deadlines, reloads, and timeout during loading. Check camera permission and focus on a physical phone before event day.

## Rules

- Only add or change files inside your own `games/<name>/` folder.
- Keep files small (under ~25 MB each). Link big videos instead of uploading them.
- No real personal data, phone numbers or bank details in games. Use obviously fake examples.

## Games

| Game | Folder | Made by | How to play |
|---|---|---|---|
| *(template)* | `games/_template/` | — | Copy this to start |
| Scan Me If You Can (Station 5) | `games/scan-me-if-you-can/` | Hung Xun | Game Master runs many players at once from one laptop; each scans a Join QR, then 8 of the 25 numbered board QRs (a fresh deal every round) and judges each site REAL or FAKE in 12 s using the in-game QR scanner |
