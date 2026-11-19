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

The current Station 1 revision uses ten balanced messages from 32 cases in 60 seconds. Classification submits immediately: +10 correct, −10 wrong, unanswered 0, final minimum 0. Evidence selection has been removed at the user's request, superseding the evidence grading described in ADR 0005. Optional verification and educational review remain. Pure checks cover 1,000 balanced deals, classification score combinations, version 2 active-round migration, verification and original deadlines. Browser checks cover all 32 cases, keyboard answers, absent evidence controls, partial timeouts, inert inspection and five viewports. Desktop checks cover multi-laptop isolation, refresh recovery, finish retries, cancellation, survey and no-write demos.
