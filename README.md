# Scamurai Games 🥷

Anti-scam awareness games for **Scamurai** (MPU4.1 Community Service, XMUM, group AG1-2), played at our interactive booths on **Thu 26 Nov 2026**.

Anyone in the group can add a game. Every game lives in its own folder under `games/`.

## Play

Live site (GitHub Pages): https://hhungxun.github.io/scamurai-games/

## Add your game

1. **Get access** (either way works):
   - *Direct push:* send your GitHub username to the repo owner to be added as a collaborator, then accept the email invite.
   - *Fork + pull request:* click **Fork**, add your game in your fork, then open a pull request. No invite needed.
2. Copy `games/_template/` to `games/<your-game-name>/` (lowercase, dashes, e.g. `games/spot-the-phish/`).
3. Put your game in that folder. A web game should open from `index.html`. Anything else (Scratch `.sb3`, Python, PowerPoint quiz, Kahoot link) is fine too: just explain how to run it in the folder's `README.md`.
4. Add one line for your game to the list in [`index.html`](index.html) and the table below.
5. Commit and push:
   ```bash
   git clone https://github.com/hhungxun/scamurai-games.git
   cd scamurai-games
   git add games/<your-game-name> index.html README.md
   git commit -m "Add <your game>"
   git pull --rebase && git push
   ```

## Rules

- Only touch your own `games/<name>/` folder (plus your one line in `index.html` / this README), so nobody overwrites anyone else.
- Keep files small (under ~25 MB each). Link big videos instead of uploading them.
- No real personal data, phone numbers or bank details in games. Use obviously fake examples.

## Games

| Game | Folder | Made by | How to play |
|---|---|---|---|
| *(template)* | `games/_template/` | — | Copy this to start |
