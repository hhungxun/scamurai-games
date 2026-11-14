# Scamurai backend

One small Node service: registration, rounds, exit survey, leaderboard, CSV export. SQLite file in `data/`. It also serves `../games/**`, so every game runs on the same origin as the API.

Live: https://scamurai.physicsxmum.my (labvps, via the existing Cloudflare tunnel).

| Page | Who |
|---|---|
| `/register.html` | Secretary at the front desk (staff PIN) |
| `/participant.html` | Participant's own name, ID, five Station Scores and visit progress (personal QR pass, remembered on their phone) |
| `/games/<name>/` | Game Master laptops (station PIN, entered once per laptop) |
| `/leaderboard.html` | Public screen |
| `/admin.html` | Overview + `participants.csv` / `rounds.csv` (admin PIN) |
| `/games/scan-me-if-you-can/board.html` | Print the 25 Station 5 QR codes |

## Run locally

```bash
cd server && npm install
ADMIN_PIN=9999 STAFF_PIN=1111 STATION_PINS="1:5001,2:5002,3:5003,4:5004,5:5005" PORT=3031 node server.js
```

## Test

```bash
cd server && npm test            # PLAYERS=300 npm test for a bigger crowd
```

`test/pressure.js` starts its own server on a throwaway database and checks: many Participants registering and playing Station 5 at once with scores landing exactly; one open Round per Participant per Station (even with 10 simultaneous starts); two laptops finishing the same Round; cancel racing finish; event cap, oversized bodies, wrong tokens and the wrong-PIN lockout; stale round tokens never counting towards that lockout; `preview.html` hidden from the tunnel; 304 revalidation of static files.

`python3 server/test/e2e_participant.py` (from the repo root, Python Playwright + Chromium) checks registration QR handoff, remembered identity, personal-only read access, live five-station scores, replay bests, zero scores, guests, survey status, and shared SDK QR buttons. It uses its own temporary database.

## Participant pages

The Secretary hands each Participant their personal page QR after Registration; **Personal QR** in the registration list shows it again. Existing registrations receive a pass on demand. The page stores the pass on the phone and removes it from the URL fragment, refreshes every 5 seconds, and shows best completed Station Scores out of 100 (500 total). Active Rounds are labelled playing. It never returns registration survey answers or staff credentials.

The `participant_passes` table is added automatically without changing existing Participants or Rounds. Passes persist across service restarts. They allow read-only access to one Participant's own profile; no ID-only public lookup is available. The public leaderboard continues to mask names and IDs.

| Route | Access | Purpose |
|---|---|---|
| `GET /api/participant/me` | `X-Participant-Token` | Own identity, Station Scores and progress |
| `GET /api/participants/:id/pass` | Staff/Station PIN | Show an existing Participant's personal QR again |
| `GET /api/rounds/:id/participant` | `X-Round-Token` | Connect a Participant's game phone to the same personal page |

Registration responses include `participantToken` for the QR. Game 5 remembers the matching pass when its Join QR is scanned; **My scores** opens `/participant.html`. Custom SDK games can call `Scamurai.participantURL(participant)` to show the personal QR.

Behaviour worth knowing on the day:
- **Lockout is per IP**, and on campus Wi-Fi every phone and laptop shares one. Only wrong PINs count. A phone polling with an old round token (a round left over from a rehearsal database) gets 403 without counting, and the phone then forgets that round.
- **`preview.html`** (every Site Card with its answer) is served only to requests made on the server machine itself. Through the Cloudflare tunnel it returns 404.
- **A laptop keeps its saved PIN** when the server can't be reached or answers 429/5xx. It shows "Can't reach the server" and retries every 10 s. Only a PIN the server refuses (401/403) is forgotten.
- **Static files** carry `Last-Modified` and answer `If-Modified-Since` with 304, so the multi-megabyte Site Card snapshots are not downloaded again on every scan.
- **Admin CSVs** are downloaded with the PIN in a header, so it never appears in a URL.

## Rounds API (Game Master devices)

| Route | Who | Does |
|---|---|---|
| `POST /api/rounds` `{participantId}` | station PIN | opens a Round; 409 if they already have one open at this Station (the SDK picker then returns that open Round with `existing: true`) |
| `GET /api/rounds/open` | station PIN | this Station's open Rounds with tokens (a dashboard rebuilds from this) |
| `POST /api/rounds/:id/finish` `{score, maxScore}` | station PIN | ends it; a repeat returns the stored result with `already: true` |
| `POST /api/rounds/:id/cancel` | station PIN | closes it without counting |
| `POST/GET /api/rounds/:id/events` | round token | free message channel between a game's devices (max 200 per Round); GET also says `ended` / `cancelled`. A wrong token gets 403 (GET with a station PIN instead is allowed) |

## Environment

| Var | Meaning |
|---|---|
| `PORT`, `HOST` | default 3030, 127.0.0.1 |
| `DATA_DIR` | where `scamurai.db` lives (default `./data`) |
| `ADMIN_PIN`, `STAFF_PIN` | admin and Secretary PINs |
| `STATION_PINS` | `1:1234,2:…` one 4-digit PIN per station |
| `CORS_ORIGINS` | extra origins allowed to call the API (localhost is always allowed) |

On labvps the PINs are in `~/scamurai-games/server/.env` (mode 600, not in git). Read them with `ssh labvps cat scamurai-games/server/.env`.

## Deploy (labvps)

- Service: `/etc/systemd/system/scamurai.service` (port 3030, `EnvironmentFile=…/server/.env`).
- Tunnel: ingress `scamurai.physicsxmum.my → http://127.0.0.1:3030` in `/etc/cloudflared/config.yml`.
- Update after merging PRs:

```bash
ssh labvps 'cd ~/scamurai-games && git pull --ff-only && cd server && npm install --omit=dev && sudo systemctl restart scamurai'
```

## After the event

1. Download both CSVs from `/admin.html` for the post-mortem report.
2. By 26 Dec 2026, delete personal data: `ssh labvps 'sudo systemctl disable --now scamurai && rm -f ~/scamurai-games/server/data/scamurai.db*'`.
