# Real or AI? — 60-Second Challenge

A self-contained **static website** designed for an event booth. Players identify authentic photos/voices versus AI-generated materials. **60 seconds** per game; the game stops and reports results when the clock reaches zero, even if the question bank has more remaining questions.

## Current status

- 20 **temporary demo** questions: 10 images and 10 voice clips.
- Can grow to **60 questions total** in any mix of photos and voices (recommended final mix: 30 photos / 30 voices; 30 Real / 30 AI).
- Game presents randomized, roughly alternating photo and voice questions; stops at **60 seconds** or at the end of the available questions.
- English interface, immediate next question, result page, answer review, replay.
- No framework, no installation, no backend; relative paths work on GitHub Pages **and in a nested folder**.

> ⚠️ DEMO-ONLY CONTENT: All 10 sample voice recordings are synthetic. Five of them use **temporary "Real" labels for UI testing**; those are NOT authenticated human recordings. All demo media must be replaced or cleared for reuse rights and provenance before public exhibition. Obtain consent before publishing images or recordings of classmates.

## Booth integration (Station 4)

The game runs as **Station 4** of the Scamurai event flow, the same way Phishing Fishing runs as Station 3. `index.html` is the booth shell (station PIN login, participant selection, score submission, next participant); the game itself is in `game.html`, loaded in an iframe. The shared `/sdk.js` and `/desktop-booth.js` do the station work. `participant.html` maps `/games/real-or-ai/` to `/station.html?n=4`. PINs come from server environment variables only.

- **Demo mode:** open `/games/real-or-ai/?demo=1`. No PIN is needed and scores are never submitted.
- **Organizer Mode** (question editor) is hidden unless the URL has `?organizer=1` (use `game.html?organizer=1` standalone).

## Scoring rule

- A Round is 10 questions (5 real / 5 AI where the bank allows, alternating photo and voice), shuffled every Round, with a 60-second timer.
- **Score = (correct − wrong) x 100 / N**, rounded to 1 decimal and clamped to 0-100, where N is the number of questions in the Round (10). That is +10 per correct answer, −10 per wrong answer, 0 for unanswered; minimum 0, maximum 100.
- If the bank has fewer than 10 usable questions, N is the number drawn.

## Gameplay

- After each answer the player sees Correct / Not quite and a one-line clue, then presses Next (or Enter).
- Voice questions auto-play; a Play/Replay button and the Space key replay them (if the browser blocks autoplay, press Space).
- Keys: 1 = Real, 2 = AI.

## Questions and clues

Each question in `data/questions.js` has an optional `clue` (one line shown after the answer; falls back to `explanation`). Add it in the file or in Organizer Mode ("Clue" field). The voice clues are generic because the voice Real/AI labels are temporary test values.

## Folder structure

```text
real-or-ai-game/
├── index.html                 # Station 4 booth shell
├── game.html                  # Game page (loaded in the shell iframe)
├── js/game-core.js            # Round logic, shuffle, scoring
├── tests/core.test.cjs        # node tests for game-core
├── css/styles.css             # Look & feel
├── js/game.js                 # Timer, randomized gameplay, score, editor
├── data/questions.js          # ADD / EDIT YOUR QUESTIONS HERE
├── assets/images/P01.jpg ... # Demo photos
├── assets/audio/V01.mp3 ...  # Demo audio
├── .nojekyll                  # Simple GitHub Pages static publishing
└── README.md
```

## How to add a question (no coding needed)

**Option A: Organizer Mode** (recommended to start)

1. Open `index.html` or the GitHub Pages site and choose **Organizer Mode**.
2. Click **+ Add photo question** or **+ Add voice question** (up to 60).
3. Fill in the title, expected answer (`Real`/`AI`), and explanation.
4. Upload a local photo/recording (will be embedded as a data URI) **OR** specify the path to an asset committed to the repo (preferred for large media), such as `assets/images/P11.jpg` / `assets/audio/V11.mp3`.
5. Tick **Include in game**.
6. Click **Download questions.js**. Replace `data/questions.js` in the GitHub repository with the downloaded file and **Commit changes**.

**Important:** Organizer edits in the live page are *not automatically saved to GitHub*. You must commit the downloaded `questions.js`; when the user uploaded image/audio rather than using a file path, that media is embedded inside the generated JS. For a scalable 60-question project, upload media to `assets/` and use paths instead; you can edit these directly in `data/questions.js` too.

**Option B: GitHub web interface**

1. In the repository, open `data/questions.js` → pencil icon (**Edit**).
2. Copy an existing photo/voice object, assign a unique `id` like `P11` / `V11`, update `type`, `title`, `answer`, `explanation`, `src`, and `enabled`.
3. Upload the matching media file under `assets/images` or `assets/audio`.
4. Commit changes. The live page will be updated by GitHub Pages publishing.

Example question (copy inside `window.REAL_OR_AI_QUESTIONS = [ ... ]`):

```js
{
  "id": "P11",
  "type": "photo",
  "answer": "real",
  "title": "Student at the library",
  "subtitle": "PHOTO · CAMPUS",
  "explanation": "Our teammate took this photograph with permission.",
  "src": "assets/images/P11.jpg",
  "enabled": true,
  "demo": false
}
```

Audio question: use `"type": "voice"` and `"src": "assets/audio/V11.mp3"`. You can use WAV, MP3, M4A (check browser compatibility); MP3 is usually best for web. For 60 questions, keep clips around 5–6 seconds.

## Publish on GitHub Pages

1. Create a repository named `real-or-ai-game` in your own GitHub account.
2. Upload **all the contents** of this folder (not just the ZIP itself), maintaining the directory layout. `index.html` must remain in the repository root.
3. Open **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Set **Branch: `main` / Folder: `/ (root)` → Save**.
5. After publishing, check the site URL under GitHub Pages (usually `https://YOUR-USERNAME.github.io/real-or-ai-game/`). The address is an example; it will work only after publishing.

## Combine games later

You can either link to the game at `https://YOUR-USERNAME.github.io/real-or-ai-game/` from the central project, or copy its entire folder under `games/real-or-ai/` in the central site and link to `./games/real-or-ai/`. All file references are relative, so nested deployment requires no changes.

An iframe option:

```html
<iframe src="./games/real-or-ai/index.html" title="Real or AI?" allow="autoplay" style="width:100%;height:850px;border:0"></iframe>
```

### Collaboration

For multiple games, agree on a single landing page and give each group its own folder. Do not let different teams overwrite each other's `index.html`, CSS or JS. Collaborators can make changes using pull requests; use a shared repository with protected `main` when convenient.

## Testing

- Open `index.html` locally on desktop (no server needed), or host the folder with a simple local web server.
- For a local web server: `python -m http.server 8000` → `http://localhost:8000/`.
- Keyboard shortcuts: **1 = Real**, **2 = AI**, **Space = play voice**.
- To verify the timer quickly in browser DevTools, change `const T=60000` in `js/game.js` temporarily, then restore it.
