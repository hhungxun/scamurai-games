# Scamurai web UI

The public home, participant hub, staff desks, leaderboard, SDK screens and Station 5 controls share `server/public/style.css`. `site.js` adds public navigation, staff links, keyboard menu controls and contained table scrolling. The root URL serves the public home; GitHub Pages redirects to the canonical event site.

The supplied `designer-20261114T125952Z-1-001` references were reviewed as a set: the poster, shirt designs, individual and community-board artwork, mascot variations and video frame. The web treatment uses their charcoal textures, bold white/black type, red slashes, handwritten captions, paper panels and mascot art. Fonts and QR libraries are served locally. The simulated Real/Fake websites keep their realistic website styling for the challenge.

## Participant flow

1. The Secretary registers the Participant and displays their personal QR.
2. The phone opens `/participant.html`, showing the registered identity, Station Scores and visit progress.
3. **Start Scamming** opens the camera inside that page. It accepts `/station.html?n=1…5`, the matching Participant's Station 5 Join QR, and their Station 5 board QRs.
4. Stations 3 and 4 display a **Coming soon** placeholder until their games are built. Stations 1 and 2 direct Participants to Phishing Fishing and Close the Popups on the station laptops. Each laptop lets a Participant choose their registered name or ID. Station 5 explains the Join QR; its game runs on the same origin and returns through **My scores**.
5. **Back to my participant page** stops the camera. **Scan another QR** reopens it without leaving the browser.

The shared `qr-scanner.js` implements camera lifecycle and QR decoding; Station 5's `scanner.js` is an adapter for board-number validation and scan-time deadlines. A different Participant's Join QR and unrelated URLs are rejected. Leaving or cancelling an asynchronous lookup cannot navigate the page later. Native QR detection falls back to bundled jsQR.

`/stations.html` prints five public station codes. `/games/scan-me-if-you-can/board.html` prints the 25 board codes. Local print previews default to the public event address so phone codes do not point at localhost. Invalid destinations clear the board and show an error.

## Checks

Run from the repository root with Python Playwright/Chromium, qrcode and Pillow available:

```bash
python3 server/test/e2e_site.py
python3 server/test/e2e_participant.py
python3 games/scan-me-if-you-can/tools/e2e_phone.py
python3 games/scan-me-if-you-can/tools/e2e_dashboard.py
npm test --prefix server
```

All use temporary local databases. Site checks cover public routes and links, 320–1440 px layouts, locally served assets, staff roles and reconnects, CSV export, long/HTML-looking names, malformed/blocked storage, offline profile refresh, scanner denial/fallback/cancellation, wrong-person QRs, station placeholders and QR print pages. Backend checks include equal fractional Station Scores retaining the fastest Round and a Station PIN being unable to read another Station's Round events.

## Desktop games

The desktop hosts use a charcoal Scamurai wordmark bar, red station border, local Lexend/Anton type and paper-coloured game area. The selected identity stays visible above the email game. Both have public, clearly marked unscored demos with a way back to event play. The email game's cream/red event treatment frames a readable white simulated inbox; the popup game keeps the distinct simulated website layouts that form its challenge. SDK participant selection retains the common event styling. Two-laptop and no-write demo checks are in `server/test/e2e_desktop.py`.

## Shared in-game theme

All three games load `games/shared/theme.css`, the source for paper/ink/red/green colours, Lexend/Anton typography, borders and surfaces. It applies to the actual popup gameplay HUD and task dialog, popup briefing/results, the email controls, and Station 5’s scanner, verdict bar, simulated browser chrome, results and dashboard. Parent station/demo controls use the same tokens. This replaces the popup game’s yellow hazard treatment and Station 5’s dark card treatment with the same paper cards as the inbox game.

The website snapshots inside the Sim Browser and the popup game’s task websites retain the presentation that forms their evidence. They receive the common game controls around them; Real and Fake cards receive identical browser/verdict styling. Personal-score links use dark text on paper and light text only in the dark persistent footer. Printed QR boards retain their print styling.

Validation on 15 November checked common computed background colours, inspected screenshots of welcome/play screens and the QR scanner/dashboard, and covered phone widths down to 360px and booth laptops at 1366×768. The phishing, multi-laptop, full popup timeout and QR phone/camera suites passed with the shared theme.
