# Scamurai backend

One small Node service: registration, rounds, exit survey, leaderboard, CSV export. SQLite file in `data/`. It also serves `../games/**`, so every game runs on the same origin as the API.

Live: https://scamurai.physicsxmum.my (labvps, via the existing Cloudflare tunnel).

| Page | Who |
|---|---|
| `/register.html` | Secretary at the front desk (staff PIN) |
| `/games/<name>/` | Game Master laptops (station PIN, entered once per laptop) |
| `/leaderboard.html` | Public screen |
| `/admin.html` | Overview + `participants.csv` / `rounds.csv` (admin PIN) |
| `/games/scan-me-if-you-can/board.html` | Print the 25 Station 5 QR codes |

## Run locally

```bash
cd server && npm install
ADMIN_PIN=9999 STAFF_PIN=1111 STATION_PINS="1:5001,2:5002,3:5003,4:5004,5:5005" PORT=3031 node server.js
```

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
