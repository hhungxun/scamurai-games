# Desktop station validation — 15 November 2026

The branch integration and accepted rules are recorded in ADR 0004. Tests used fictional Participants and temporary SQLite databases, with no production score writes.

Passed:

- `npm test --prefix server`: popup calibration; 1,000 unique balanced/difficulty-matched phishing deals; all 297 scored/practice answered/correct combinations; durable snapshots and timeout recovery; content validation; all 27 shared backend pressure, role and idempotency checks.
- `python3 server/test/e2e_desktop.py`: two independent laptops per desktop Station; distinct identities/Rounds/scores; same-Participant duplicate prevention; exact email deal/answers/deadline recovery; lost finish response with idempotent retry; perfect score 100 versus blind full-round guessing 0; five-station total and survey handoff; partial-credit timeout and result reload; lost cancellation response; remote cancellation releases the original laptop at both Stations; corrupt-storage refusal; both demos finish without PIN or event writes.
- `python3 server/test/e2e_popup.py`: all 13 task pages and existing scoring, actual 60-second timeout, ending, refresh, handover and save recovery.
- Email `tests/browser.test.cjs`: all 20 practice scenarios, seven offline browser groups, inert keyboard/touch inspection, duplicate answers, score/review, five desktop/mobile sizes; no page errors, remote requests or downloads.
- Existing shared site suite: seven scenarios; participant suite: eight scenarios; Station 5 dashboard suite: all nine scenarios and no console errors.

Visual QA inspected desktop screenshots of both demos and the integrated email inbox. The compact email play header reserves space for message reading and keeps answer controls visible at 1366×768. Integrated host/demo layouts were checked at widths 360, 768 and 1440. The email’s offline suite covers 1366×768, 1024×768, 768×1024, 390×844 and 360×800. Fonts/assets are served locally.

Sixty seconds for ten messages is an accepted game rule, not a measured reading-speed benchmark. Physical laptop checks and participant playtesting remain useful for event preparation. These checks establish correctness and score submission, not equal score distributions among Stations.

## Investigation revision

The earlier binary-scoring figures above describe the first integration. ADR 0005 replaces Station 1 with ten messages in 120 seconds, classification plus selected evidence, +10 supported /0 unsupported /−10 wrong and an expanded 32-case bank. The current pure suite checks 1,000 balanced deals without a fixed Easy legitimate pair, all scored label/evidence combinations, verification gating and version 2 draft restoration. The updated browser suite covers all 32 cases, label-only submission refusal, unsupported correct labels scoring 0, hidden optional verification, neutral contextual highlights and five viewports. Updated desktop integration covers evidence drafts, verification and old-demo migration in addition to multi-laptop, retry, cancellation and survey flows.

`server/test/e2e_popup_draw.py` reproduces the Draw route after browser Back and an abandoned demo’s expired deadline. Explicit Start now replaces the unscored rehearsal; reload/Resume retain an existing deadline. The live no-write check passed for this path.
