# Scamurai web UI

The public home, participant hub, staff desks, leaderboard, SDK screens and Station 5 controls share `server/public/style.css`. `site.js` adds public navigation, staff links, keyboard menu controls and contained table scrolling. The root URL serves the public home; GitHub Pages redirects to the canonical event site.

The supplied `designer-20261114T125952Z-1-001` references were reviewed as a set: the poster, shirt designs, individual and community-board artwork, mascot variations and video frame. The web treatment uses their charcoal textures, bold white/black type, red slashes, handwritten captions, paper panels and mascot art. Fonts and QR libraries are served locally. The simulated Real/Fake websites keep their realistic website styling for the challenge.

## Participant flow

1. The Secretary registers the Participant and displays their personal QR.
2. The phone opens `/participant.html`, showing the registered identity, Station Scores and visit progress.
3. **Start Scamming** opens the camera inside that page. It accepts `/station.html?n=1…5`, the matching Participant's Station 5 Join QR, and their Station 5 board QRs.
4. Stations 1, 3 and 4 display a **Coming soon** placeholder until their games are built. Station 2 directs Participants to Close the Popups on the Game Master laptop. Station 5 explains the Join QR; its game runs on the same origin and returns through **My scores**.
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
