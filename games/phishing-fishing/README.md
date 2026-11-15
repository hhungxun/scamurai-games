# Phishing Fishing — Scamurai Station 1

A desktop email-inspection challenge from the `feature/zyh` branch, integrated with Scamurai registration, Rounds, personal scores, leaderboard and Exit Survey.

## Demo

Open [the unscored demo](https://scamurai.physicsxmum.my/games/phishing-fishing/?demo=1). No PIN or registered identity is needed. Press **Start Game**, inspect the sender and the real destination behind simulated links, then choose **Legitimate** / **Phishing** or press **L** / **P**. The demo uses all 20 emails and saves no event data. Correct/wrong answers are +5/−5 for a demonstration score out of 100, floored at zero. Offline `game.html` also runs this practice bank; the event entry is `index.html`.

## Event setup: two or more laptops

1. On every Station 1 laptop, open `/games/phishing-fishing/`. The Game Master enters the Station 1 PIN once per browser. PINs are supplied separately and never committed.
2. Hand the laptop to a Participant. They choose their existing registered name, student ID or Guest ID. Unregistered Participants go to the registration desk; the game does not create usernames.
3. The selected identity stays visible above the game. Press **Start Game** to begin one 60-second Round.
4. Check the saved-score confirmation after finishing, review the explanations, then press **Next participant**. The next person must select their own registered identity.

Different Participants can play simultaneously on any number of Station 1 laptops. Each laptop keeps its own active Round. The same Participant cannot have two active Rounds at this Station; an existing Round must be resumed on its original laptop or cancelled by the Game Master. Station 2 uses the same event identity and backend concurrency rules with its own popup host.

## Scored rules

Each Round draws **10 emails: 5 Phishing and 5 Legitimate**, shuffled without duplicates. Each classification has the same difficulty mix: **2 Easy, 2 Medium, 1 Hard**. The whole Round has one absolute 60-second deadline.

- Correct: **+10**.
- Wrong: **−10**.
- Unanswered: **0**.
- Final score: `max(0, 10 × (correct − wrong))`, out of 100.

There are no participation or speed points. All 10 correct earns 100; blindly choosing either label for all 10 earns 0. Partial progress can earn credit. Feedback is withheld until the Round ends; the review contains only this Round's dealt emails. All training addresses use reserved `.example` domains; inspecting links never opens a real site or downloads a file.

The result submitted to the event is the displayed score. The highest completed Round at Station 1 counts toward the five-Station total out of 500. The event's existing server-duration tie-break remains unchanged; it includes time from participant confirmation, briefing, play and saving. Equal score distributions across Stations have not been established by participant playtesting.

## Recovery and staff controls

The shared `/desktop-booth.js` host owns the server Round, selected identity and per-tab durable state. `game.html` runs inside an iframe, preserving its readable inbox styles while the parent shows the shared event controls. The game never receives the Station PIN.

Reload preserves the exact email deal, recorded answers and original deadline. A sleeping/background tab catches up rather than receiving more time. Final evidence and score are saved locally before the API request. A lost save response is retried on the same server Round; **Retry save** and refresh are safe because finishing is idempotent. A pending finish cannot be cancelled or replaced with another Participant.

**Cancel round** is for equipment trouble or incorrect participant selection. It records no score. A lost cancellation response is reconciled against the server. **My scores** opens the selected Participant's read-only personal page. **Exit survey** appears when all five Stations are finished; **Leaving** is available before participant selection. Corrupt or unavailable storage stops scored play and asks the Game Master to resolve active Rounds.

## Local checks

From the repository root, `npm test --prefix server` runs the pure scoring/content checks and shared backend checks. With Python Playwright and Chromium installed:

```bash
python3 server/test/e2e_desktop.py
python3 server/test/e2e_popup.py
python3 server/test/e2e_site.py
python3 server/test/e2e_participant.py
```

`e2e_desktop.py` uses throwaway data and independent browser contexts to test two laptops at each desktop Station, duplicate-participant prevention, refresh recovery, lost save/cancel responses, separate scores, timed partial credit, survey handoff and no-write demos. No production scores are used.

The original offline rendering test remains available with an installed Node Playwright package:

```bash
node games/phishing-fishing/tests/browser.test.cjs
```

Set `PLAYWRIGHT_PATH` and `BROWSER_PATH` when using an existing installation. Screenshots go to `/tmp/scamurai-phishing-qa` unless `SCREENSHOT_DIR` is set. It covers all 20 scenarios, desktop/mobile layouts, inert keyboard/touch inspection, duplicate answers and accessible review. Run a physical laptop check for readability and browser behaviour before the event.

## Message design

The 12 phishing messages use plausible campus, bank, parcel and shopping contexts. The former joke scenarios now teach locker QR fraud, an attendance-report executable, wallet recovery-phrase theft and callback refund abuse. Familiar senders and protective-sounding advice occur in fake messages too, so decisions depend on destinations, permissions and the requested action. All eight legitimate counterparts remain. The in-game UI uses the same shared theme as the popup and QR games.

## Evidence for each verdict

Every message has visible **Case Notes** outside the simulated email. These are given facts for the fictional scenario, not claims by the sender or real information about the Participant. They provide independently checked context such as an existing application, a recorded deposit or the usual account workflow. Participants classify the requested action against that context and the actual destination. A matching sender or URL alone does not prove authenticity.

Each review now separates the conclusion, independent context, decisive evidence, why the other classification is less appropriate, and a safe next step. Legitimate cases require both corroborated context and a proportionate action within the established workflow. Phishing cases identify a concrete mismatch, deceptive destination, unjustified secret, payment, permission or software request. All explanatory indicators still quote exact visible message text. Scoring and the 60-second deadline are unchanged.
