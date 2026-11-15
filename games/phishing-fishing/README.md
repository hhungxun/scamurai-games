# Phishing Fishing — Scamurai Station 1

An investigation game: inspect an email, classify its request, select a specific supporting detail, then submit the judgement. It uses the event's registered Participants, best-Round Station Scores, leaderboard and Exit Survey.

## Event rules

A scored Round deals ten messages, five Phishing and five Legitimate. Both classes have 2 Easy, 2 Medium and 1 Hard case. There is one absolute **120-second** deadline. The bank contains **32 cases**, including paired messages with the same sender, subject or destination but different requested actions or permissions.

For each submitted judgement:

- Correct label and supported evidence: **+10**.
- Correct label but unsupported evidence: **0**.
- Wrong label: **−10**.
- Unanswered or unsubmitted draft: **0**.

Final score is floored at 0 and displayed/submitted out of 100. The best completed Station 1 Round counts toward the event total. Existing event tie-break duration still includes time from participant confirmation through saving. All-correct labels without evidence earn 0; blindly choosing one label throughout a balanced deal cannot earn a positive score when the other labels are wrong.

## How to investigate

1. Read the sender, request and relevant details. A familiar name, polished writing, deadline or fee does not decide the answer.
2. Hover/tap **Inspect link** to reveal the actual destination. Inspection never navigates.
3. If context is needed, choose **Verify independently** to open the service's fictional record. It starts hidden, is available equally for every case, costs no points and does not pause time.
4. Choose Legitimate or Phishing (**L/P** selects the label), then **Use as evidence** beside a specific sender, subject, paragraph, attachment, inspected destination or verified fact. These controls appear on ordinary fields, not just correct clues.
5. **Submit judgement** records both selections. No correctness feedback appears until the Round ends. A true contextual detail can still be insufficient evidence; for example, a correct amount or matching sender alone is not proof.

The review shows the selected evidence, supported details, counterargument and safe next step. Supported highlights use risk/trust colours; contextual clues that do not justify a verdict alone use a muted style. Safe next actions are taught rather than added as a third scored question.

## Demo and laptop setup

[Public demo](https://scamurai.physicsxmum.my/games/phishing-fishing/?demo=1): no PIN or registration. It offers the full 32-case bank, normalizes its practice score to 100 and never submits event data. Offline `game.html` also runs practice.

For event play, open `/games/phishing-fishing/` on two or more Station 1 laptops. Staff enter the same Station 1 PIN once per browser; Participants select their existing registered name or Student/Guest ID. Each laptop owns its own Round. Different Participants can play concurrently; the same Participant cannot start two active Rounds at Station 1. Use **Next participant** after the saved-score confirmation. **My scores**, **Leaving** and **Exit survey** use the shared event flows. **Cancel round** is for wrong identity or equipment trouble.

Reload preserves the exact deal, submitted answers, label/evidence draft, verification state and original deadline. Lost score responses retry the frozen score on the same Round; finishing is idempotent. Pending finishes cannot be cancelled or replaced. Remote cancellation releases the original laptop when it reconciles the finish. Corrupt storage fails closed.

The new exercise uses snapshot version2. Earlier-format demos restart safely. Earlier scored Rounds retain their existing server records; saved ones can hand over through Next participant, and an unfinished old Round requires staff cancellation instead of silently receiving a new timer or score interpretation. Existing completed server scores are not rewritten.

All case notes are fictional training records, not real information about Participants. Every address uses reserved `.example` domains. Attachments, QR labels and destination controls are inert; no secrets are collected and no real remote-access tool is supplied.

## Validation

From the repository root:

```bash
npm test --prefix server
python3 server/test/e2e_desktop.py
python3 server/test/e2e_popup_demo.py
python3 server/test/e2e_popup_draw.py
```

Pure checks cover 1,000 balanced deals, all scored label/evidence combinations, no guaranteed repeated easy legitimate pair, content/indicator/evidence keys, grading, drafts, verification, legacy snapshots and deadlines. The desktop test uses temporary data and independent browser contexts for multi-laptop ownership, evidence grading, draft/reload recovery, score retries, cancellation, survey and no-write demos.

With a Node Playwright installation, run `node games/phishing-fishing/tests/browser.test.cjs`. `PLAYWRIGHT_PATH` and `BROWSER_PATH` can point at existing installations. It covers all 32 cases, hidden verification, required evidence, unsupported-label zero, keyboard/touch inspection and five desktop/mobile layouts. The accepted 120-second budget and case difficulty should still be tried with Participants on the event hardware.
