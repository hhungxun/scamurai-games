# close the popups — Station 2

A desktop, bilingual 60-second web challenge by Gary. Complete one of 13 practical tasks while simulated ads compete for your attention. The game uses real document navigation, working local exports and native advertiser tabs. All game assets are self-hosted inside this directory.

## Run

Use the existing Scamurai Node server, with its normal environment and PIN configuration:

```powershell
cd server
npm ci
node server.js
```

Open **`http://127.0.0.1:3030/games/close-the-popups/`** (or the configured server port). On the event server the route is `/games/close-the-popups/`. Add `?lang=zh` for Chinese; `?lang=en` for English. Enter the Station 2 PIN supplied separately by staff. No PIN or participant data is bundled in the game. A basic static server alone cannot provide the SDK and scoreboard API.

## Play and scoring

1. Authenticate the Game Master with the shared Station 2 SDK screen.
2. The entry immediately opens the shared participant picker. Find an already registered Participant by ID or name, confirm them in the SDK picker, then draw the assigned task and read the brief. Select your own registered name or Student/Guest ID before drawing the assigned task.
3. The actual task page starts its existing absolute 60-second deadline once ready. Navigation, reloading, task reminders and advertiser tabs do not give extra time. Genuine downloads and saves work as before.
4. Submit early, or let the original deadline expire. The calibrated scoring function produces **task 60 + speed 20 + safe interaction 20 = 100**. No evidence earns zero; each misleading-ad click deducts 5 from safe interaction. The host sends that exact total through `Scamurai.finishRound(roundId, {score: total, maxScore: 100})`. Staff judgement is a separate observation and does not change the score. See [full scoring rules](docs/SCORING.md).
5. Wait for the small **Score saved to the event** confirmation beneath the result. Check and close the extra ad tabs, then use **Next participant** in the existing result handover or the **Staff** menu. This closes the handover menu and immediately opens the SDK ID picker. Only after confirming the next participant does the game return to the task draw; starting the chosen task reuses that participant's Round. Backing out of the picker leaves nobody selected. The participant page shows the best completed score, and the normal event backend aggregates it with the other four Stations.

The staff no-ad difficulty test is explicitly **practice only**: no Participant is selected, no server Round is created and no event score is sent. This mode retains its own local result and refresh recovery. Free browsing and local review tools remain available.

## Integration design

`index.html` is the permanent Station 2 host. It loads the repo's shared **`/sdk.js`**, registers `onDashboard` before SDK boot, and keeps the SDK in the parent while the existing game navigates within a same-origin iframe. This isolates the SDK's global stylesheet from the category layouts and keeps its Round alive during document changes. The iframe uses real links and opens ads as separate native tabs, clearing their opener.

`station.js` owns all scoring API calls. The child entry/result document uses `browse/station-bridge.js`; scene scripts preserve their task behavior; the pure `booth-score.js` calculator applies the approved event calibration. Only SDK calls own event scores. The event backend is unchanged.

The game fills the viewport. Station operations are collapsed behind a small **Staff** button at the bottom left; there is no persistent station toolbar. The staff handover card follows the game's black/yellow/cream visual style, with a separate participant name, round/best score summary and a prominent next-participant action. Controls follow the game's current language instead of displaying both languages together. Internal Round IDs are not displayed. Saving failures show an actionable notice without requiring the staff menu to be open.

- Per-tab `close-popups:station2:v1` binds one local round to one server Round and Participant, and records its latest game URL. A parent refresh restores the binding and original deadline.
- A finished actual score is frozen to session storage **before** submission. A failed or lost response remains pending and exposes **Retry save**. Refresh retries the same Round/score; the backend's idempotent finish prevents duplicate credit. A saved score cannot be overwritten by returning to an old result.
- Another round cannot start until the current one is saved or cancelled. The server also rejects simultaneous open Rounds for the same Participant/Station. An already-open Round returned by `pick()` is not given a new local timer; staff must resume its original tab or cancel it.
- A local void calls `cancelRound` and sends no score. A lost cancellation response is reconciled with the existing events endpoint. A pending finish cannot be cancelled because its response may have been lost after a successful save.
- If local game preparation fails after selection, the newly opened server Round is cancelled. Unavailable/corrupt host storage fails closed and asks staff to resolve open Rounds rather than guessing an identity.
- **My scores** obtains the read-only participant page from `participantURL`. **Leaving** uses the SDK exit-survey flow; when the last Station completes, an exit-survey control is also offered.

Open the outer entry for scored play. Opening `browse/booth.html` directly cannot bind or submit event scores. Do not clear site storage during an open Round without checking the backend first.

The leaderboard's tie-break duration is the server's time from participant confirmation to confirmed finish, including task selection, brief reading, loading and network time. The game's 60-second deadline and time points still use its original ready-to-submit/timeout duration. This follows the existing backend contract without changing shared server files.

## Source and assets

The source snapshot comes from [gary1110086/CSpopups](https://github.com/gary1110086/CSpopups). `SOURCE-MANIFEST.json` records its original source commit and the SHA-256 of retained copied files **before integration and cleanup edits**. `browse/booth.js` and `browse/booth.html` have the documented integration hooks and game branding changes. `docs/MINUTE-BOOTH.md` now marks the earlier prototypes as retired. The manifest also records the later prototype cleanup against source commit `ff740fe`.

`browse/` contains the current game and ad destinations; `wallpapers/` and root `assets/` supply shared media dependencies. Existing image, film, audio and museum/bird/book credits and licences remain beside the assets and on detail pages. `docs/` holds the original task and scoring guides. Historical ZIPs, Git data, agent notes and local QA results are excluded. The largest bundled file is below the repo's approximately 25 MB per-file limit.

The standalone Stillwall pages, scripts, styles, vendor copies and unused earlier product images have been removed from this delivery. `wallpapers/` keeps only the shared catalogue, eight original SVGs and its asset note. The current Browse wallpaper scene, shared favicon and ad artwork remain in place. Little Daily and the original game prototypes are not bundled.

## Event integration

Station 2 is included in the shared configuration, homepage, staff navigation, printed station QR labels, participant QR routing and exit survey. Its participant-facing station page directs phones to the desktop laptop instead of asking Participants for a staff PIN. The server serves the local audio/video with media content types.

Scored Rounds draw from all 13 tasks. The host persists the assignment, prevents redraws from changing it, and rejects starting an unassigned task. Staff practice retains task choice. Existing shared server duration rules apply, including briefing/loading/save time in the event tie-break.

Run `node server/test/popup-score.js` and `python3 server/test/e2e_popup.py` from the repo root for repeatable local checks. These tests use throwaway data. Local validation does not establish equal task difficulty or verify physical laptop audio/popup settings.

## Validation history

For the integrated revision, see [event integration validation](docs/INTEGRATION-VALIDATION.md). The following notes preserve the original PR delivery history.

### Local verification before prototype cleanup

The following results describe the integration before the retired prototypes were removed. Tests were not rerun for that cleanup, as requested.

51 Chrome desktop checks passed against the real SDK and a local backend with temporary SQLite databases and fictional Participants: actual movie-task controls and score equality, 13 task routes/assets, actual 60-second timeout, native advertiser tab/opener isolation, history and full-page refresh recovery, lost finish/cancel responses, duplicate finish, SDK 409 recovery without cancelling another laptop's Round, old-result resume protection, preparation failure cleanup, malformed storage, practice isolation and five-Station score aggregation. No runtime exceptions or missing runtime assets were observed. All 67 JavaScript files passed syntax checks. A separate read-only code review checked the SDK/server contracts and the recovery fixes.

Those checks apply to the initial integration revision. The collapsed staff menu and styled handover card were subsequently tried locally. A targeted 12-check desktop Chrome run verified the final ID-first handover: both next-participant controls open the SDK picker, the old identity clears before selection, a selected ID survives refresh, starting reuses the selected Round, two participants receive their own actual scores, and backing out permits selecting again. No runtime exceptions were observed in that run. No full regression suite was rerun after the UI changes or prototype cleanup.

Tests of the initial revision used 1440×960 desktop Chrome (with a 1920×1080 malformed-state check); the handover run also used 1440×960. Mobile acceptance and other browsers are outside this delivery. The event's deployed server, credentials and production database were not used. These local results do not claim that the game is already published or connected to the live event.

## Round endings (ending3)

Timeout plays a 1.5-second air-raid siren, followed by the nuclear shot and supplied explosion audio; the siren ducks to silence within 0.55 seconds. Submit / 我完成了 plays dense fireworks and the supplied sustained crowd cheer. Submission is not proof of task completion. The ending displays the actual total without delaying score submission. Skip, mute and reduced-motion controls are available; voids and previously viewed results do not replay it.

This update preserves the Station 2 participant, SDK, scoring and handover integration. It shares only the new ending assets/behaviour with the standalone CSpopups game. See docs/ENDING-EFFECTS.md for file provenance. The original delivery did not test these endings. The integrated revision now covers timeout saving, skip and no-replay behavior; see [event integration validation](docs/INTEGRATION-VALIDATION.md).

## Full demo and multiple laptops

Open [`?demo=1&lang=en`](https://scamurai.physicsxmum.my/games/close-the-popups/?demo=1&lang=en) for a full demo with simulated popups. No PIN or Participant selection is required. Choose any task, read the brief, then start. The visible DEMO banner stays above the game; the displayed score is practice only. **Return to event play** switches to the separate scored entry.

On event day, open the normal entry on two or more Station 2 laptops and enter the same Station 2 PIN once per browser. Each Participant selects their registered name/ID on the laptop they use. Different Participants can play concurrently; one Participant cannot start two active Station 2 Rounds. Each laptop keeps its own binding, task, deadline and pending score. No per-laptop PIN or extra Station number is needed.
