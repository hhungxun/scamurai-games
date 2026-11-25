# Phishing Fishing — Scamurai Station 3

An investigation game: inspect an email and choose Legitimate or Phishing to submit immediately. It uses the event's registered Participants, best-Round Station Scores, leaderboard and Exit Survey.

## Event rules

Every Round deals ten messages, five Phishing and five Legitimate. Both classes have 2 Easy, 2 Medium and 1 Hard case. There is one absolute **90-second** deadline. The bank contains **32 cases**, including paired messages with the same sender, subject or destination but different requested actions or permissions.

For each classification:

- Correct classification: **+10**.
- Wrong label: **0**.
- Unanswered: **0**.

The score is ten points per correct classification, out of 100. The best completed Station 3 Round counts toward the event total. Existing event tie-break duration includes time from participant confirmation through saving. A full round with one label on every email earns 50 because the deal has five of each label.

## How to investigate

1. Read the sender, request and relevant details. A familiar name, polished writing, deadline or fee does not decide the answer.
2. Hover/tap **Inspect link** to reveal the actual destination. Inspection never navigates.
3. If context is needed, choose **Verify independently** to open the service's fictional record. It starts hidden, is available equally for every case, costs no points and does not pause time.
4. Choose **Legitimate** or **Phishing**, or press **L/P**. The classification submits immediately; there is no evidence selection or extra submit button.
5. Review the classifications, decisive clues, counterarguments and safe next actions after the Round ends. Contextual clues use a muted highlight because a familiar sender or correct amount alone proves nothing.

## Fishing and campus stories

The game keeps Scamurai's paper, charcoal and red colours. After an answer, the hook reels an envelope up from below the surface in about 0.8 seconds. The next email appears while the animation is playing. Reduced-motion preferences disable movement.

The result screen shows scams caught, safe mail released, scams escaped, safe mail miscast and unchecked mail. Choose any card to open and focus its email explanation. Field badges recognise correctly identified techniques, such as excessive permissions or unsafe attachments; they do not add points or affect event records.

During play the inbox mimics Outlook on the web: app rail, Home/View/Help ribbon (Delete, Archive, Move to are inert), Favorites and account folder tree with a live Junk Email count, and a "Today" message group. Each classification shows an Outlook-style toast ("Reported · moved to Junk Email" / "Marked safe · kept in Inbox") without revealing whether it was right. A thin bar under the top bar drains over the 90 seconds (amber at 30 s, red at 10 s); the final 10 seconds add a red screen edge and countdown ticks. `sfx.js` synthesises short sound effects (cast, reel, splash, new mail, end jingle) with WebAudio; the speaker button in the top bar mutes them per laptop. The result screen awards an angler rank (Bait Taker → Deckhand → Seasoned Angler → Shark Spotter → Scamurai Master Angler), with confetti at 80+. None of this changes scoring.

Eight cases include light campus humour across both classifications: a lost penguin, digital attendance assistant, cat mascot election, supper draw, study-room booking, desk-duck receipt and internship interview. Humour is not a clue.

Changed scenarios have new IDs. An unfinished event deal containing a retired case requires explicit staff cancellation; it is not silently regraded. A saved demo containing retired cases restarts without writing event data. Historical completed server scores stay unchanged.

## Demo and laptop setup

The [public demo](https://scamurai.physicsxmum.my/games/phishing-fishing/?demo=1) and offline `game.html` draw the same balanced 10-email rounds as event play. Practice requires no PIN or registration. Scores are displayed locally and excluded from event results. Saved 32-email practice rounds restart with a new deal.

For event play, open `/games/phishing-fishing/` on two or more Station 3 laptops. Staff enter the same Station 3 PIN once per browser; Participants select their existing registered name or Student/Guest ID. Each laptop owns its own Round. Different Participants can play concurrently; the same Participant cannot start two active Rounds at Station 3. Use **Next participant** after the saved-score confirmation. **My scores**, **Leaving** and **Exit survey** use the shared event flows. **Cancel round** is for wrong identity or equipment trouble.

Reload preserves the exact deal, submitted answers, verification state and original deadline. Lost score responses retry the frozen score on the same Round; finishing is idempotent. Pending finishes cannot be cancelled or replaced. Remote cancellation releases the original laptop when it reconciles the finish. Corrupt storage fails closed.

Version 4 snapshots use the no-penalty scoring rule. Compatible unfinished version 2 or 3 event rounds carry their classifications, verification and deadline into the new rule. A finished version 3 round displays its original score, including when a save is pending. Older incompatible demos restart, and older incompatible unfinished event rounds require staff cancellation.

All case notes are fictional training records, not real information about Participants. Every address uses reserved `.example` domains. Attachments, QR labels and destination controls are inert; no secrets are collected and no real remote-access tool is supplied.

## Validation

From the repository root:

```bash
npm test --prefix server
python3 server/test/e2e_desktop.py
python3 server/test/e2e_popup_demo.py
python3 server/test/e2e_popup_draw.py
```

Pure checks cover 1,000 balanced deals, all scored classification combinations, no guaranteed repeated easy legitimate pair, content/indicator/evidence keys, grading, verification, legacy snapshots and deadlines. The desktop test uses temporary data and independent browser contexts for multi-laptop ownership, classification scoring, reload recovery, score retries, cancellation, survey and no-write demos.

With a Node Playwright installation, run `node games/phishing-fishing/tests/browser.test.cjs`. `PLAYWRIGHT_PATH` and `BROWSER_PATH` can point at existing installations. It covers balanced 10-question rounds, hidden verification, immediate classification, absence of evidence controls, partial-timeout scoring, keyboard/touch inspection and five desktop/mobile layouts. The accepted 90-second budget and case difficulty should still be tried with Participants on the event hardware.

The browser suite also checks neutral reel animations, catch-to-explanation focus, badges, reduced motion and reset. An intercepted local host double verifies the embedded 10-email Round, displayed/submitted score agreement, deadline recovery and retired-case handling without event API writes. Set `ARTIFACT_DIR` to save preview screenshots outside the repository. The full server integration checks above remain separate.
