# Event integration validation — 15 November 2026

The integrated revision replaces the incoming score formula and task selection as recorded in the repository's ADR 0003. The earlier delivery's untested-ending notes describe its original handoff, not this validation.

Passed locally with temporary SQLite databases and fictional Participants:

- `cd server && npm test`: calibration assertions plus all 27 shared backend pressure/access/idempotency checks.
- `python3 server/test/e2e_popup.py`: selected identity and original deadline survive refresh; task assignment survives redraw; lost finish response retries the same score idempotently; cancellation records no score; abandoning the next-participant picker clears identity; real 60-second timeout saves the displayed score; ending skips and does not replay; actual movie-task controls earn 100; Station 2 contributes exactly 100 to a verified five-station total of 460; all 13 task scenes load with no missing runtime assets or JavaScript errors.
- `python3 server/test/e2e_site.py`: all seven shared site/navigation/scanner/access scenarios, including responsive public pages.
- `python3 server/test/e2e_participant.py`: all eight participant identity/score/restart/migration scenarios.
- `python3 games/scan-me-if-you-can/tools/e2e_dashboard.py`: all nine existing Station 5 scenarios and no browser console errors.
- All 67 popup JavaScript files passed `node --check`; `git diff --check` passed.

The browser tests require Python Playwright and its Chromium browser; the existing scanner suite also uses qrcode and Pillow. No test scores were written to the live database. Physical laptop audio output and browser popup permissions still need an event-day hardware check. Task difficulty and cross-station score distributions have not been empirically calibrated with Participants.
