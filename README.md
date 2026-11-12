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

Station 5, [`games/scan-me-if-you-can/`](games/scan-me-if-you-can/), is a full example (two devices, live events).

## Rules

- Only add or change files inside your own `games/<name>/` folder.
- Keep files small (under ~25 MB each). Link big videos instead of uploading them.
- No real personal data, phone numbers or bank details in games. Use obviously fake examples.

## Games

| Game | Folder | Made by | How to play |
|---|---|---|---|
| *(template)* | `games/_template/` | — | Copy this to start |
| Scan Me If You Can (Station 5) | `games/scan-me-if-you-can/` | Hung Xun | Laptop shows a Join QR; on your phone, scan 8 of the 25 board QRs and judge each site REAL or FAKE in 30 s |
