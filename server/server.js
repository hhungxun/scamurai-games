// Scamurai backbone: Registration, Rounds, Exit Survey, Leaderboard.
// Vocabulary: see ../CONTEXT.md. Run: node server.js (env: see README.md).
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const PORT = +process.env.PORT || 3030;
const HOST = process.env.HOST || '127.0.0.1';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(__dirname, 'public');
const IDLE_MS = 15 * 60 * 1000;            // Abandoned after 15 min without activity
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'https://hhungxun.github.io').split(',');

// ---- PINs (never in the repo: the repo is public) ----
const PINS = {};                            // pin -> { role, station? }
const addPin = (pin, v) => { if (pin) PINS[String(pin).trim()] = v; };
addPin(process.env.ADMIN_PIN, { role: 'admin' });
addPin(process.env.STAFF_PIN, { role: 'staff' });
for (const pair of (process.env.STATION_PINS || '').split(',').filter(Boolean)) {
  const [n, pin] = pair.split(':'); addPin(pin, { role: 'station', station: +n });
}
if (!Object.keys(PINS).length) console.warn('WARNING: no PINs configured; every protected call will fail.');

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'stations.json'), 'utf8'));
const STATION_COUNT = CONFIG.stations.length;

// ---- database ----
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'scamurai.db'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  pbb_account INTEGER NOT NULL,
  scam_exposure TEXT NOT NULL,
  consent INTEGER NOT NULL,
  registered_at INTEGER NOT NULL,
  registered_by TEXT,
  checked_out_at INTEGER,
  checkout_station INTEGER,
  survey TEXT
);
CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id TEXT NOT NULL REFERENCES participants(id),
  station INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  score REAL,
  max_score REAL,
  token TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS rounds_p ON rounds(participant_id);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL REFERENCES rounds(id),
  at INTEGER NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_r ON events(round_id);
`);

const q = {
  getP: db.prepare('SELECT * FROM participants WHERE id = ?'),
  allP: db.prepare('SELECT * FROM participants ORDER BY registered_at'),
  insP: db.prepare(`INSERT INTO participants (id,name,age_group,pbb_account,scam_exposure,consent,registered_at,registered_by)
                    VALUES (@id,@name,@age_group,@pbb_account,@scam_exposure,@consent,@registered_at,@registered_by)`),
  guests: db.prepare(`SELECT id FROM participants WHERE id LIKE 'G%'`),
  roundsOf: db.prepare('SELECT * FROM rounds WHERE participant_id = ?'),
  allR: db.prepare('SELECT * FROM rounds ORDER BY id'),
  getR: db.prepare('SELECT * FROM rounds WHERE id = ?'),
  insR: db.prepare('INSERT INTO rounds (participant_id,station,started_at,token) VALUES (?,?,?,?)'),
  endR: db.prepare('UPDATE rounds SET ended_at=?, score=?, max_score=? WHERE id=? AND ended_at IS NULL'),
  insE: db.prepare('INSERT INTO events (round_id,at,data) VALUES (?,?,?)'),
  evs: db.prepare('SELECT id,at,data FROM events WHERE round_id=? AND id>? ORDER BY id'),
  checkout: db.prepare('UPDATE participants SET checked_out_at=?, checkout_station=?, survey=? WHERE id=?'),
};

// ---- domain: derive a Participant's progress from their Rounds ----
function summarise(p, rounds, now = Date.now()) {
  const best = {};                          // station -> { pct, ms, roundId }
  let last = p.registered_at, openSince = 0;
  for (const r of rounds) {
    if (r.ended_at == null) {
      if (now - r.started_at < IDLE_MS) openSince = Math.max(openSince, r.started_at);
      continue;
    }
    last = Math.max(last, r.ended_at);
    const pct = r.max_score > 0 ? Math.max(0, Math.min(100, (r.score / r.max_score) * 100)) : 0;
    const ms = r.ended_at - r.started_at;
    const b = best[r.station];
    if (!b || pct > b.pct || (pct === b.pct && ms < b.ms)) best[r.station] = { pct: Math.round(pct * 10) / 10, ms, roundId: r.id };
  }
  const stationsDone = Object.keys(best).map(Number).sort();
  const total = Math.round(stationsDone.reduce((s, n) => s + best[n].pct, 0) * 10) / 10;
  const totalMs = stationsDone.reduce((s, n) => s + best[n].ms, 0);
  let status = 'active';
  if (p.checked_out_at) status = 'left';
  else if (!openSince && now - last > IDLE_MS) status = 'abandoned';
  const survey = p.survey ? JSON.parse(p.survey) : null;
  return {
    id: p.id, name: p.name, status, stationsDone, best, total, totalMs,
    roundsPlayed: rounds.filter(r => r.ended_at != null).length,
    surveyDone: !!survey,
    eligible: stationsDone.length === STATION_COUNT && !!survey,
  };
}
const summaryOf = id => { const p = q.getP.get(id); return p && summarise(p, q.roundsOf.all(id)); };
function allSummaries() {
  const byP = {};
  for (const r of q.allR.all()) (byP[r.participant_id] ||= []).push(r);
  return q.allP.all().map(p => ({ p, s: summarise(p, byP[p.id] || []) }));
}
const mask = (name, id) => `${String(name).trim().split(/\s+/)[0]} · …${id.slice(-3)}`;

// ---- http helpers ----
const failures = new Map();                 // ip -> [timestamps]
const clientIp = req => req.headers['cf-connecting-ip'] || req.socket.remoteAddress;
function tooManyFailures(ip) {
  const now = Date.now(), list = (failures.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  failures.set(ip, list); return list.length >= 20;
}
class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
const need = (cond, code, msg) => { if (!cond) throw new HttpError(code, msg); };

function auth(req, roles) {
  const ip = clientIp(req);
  need(!tooManyFailures(ip), 429, 'Too many wrong PINs. Wait 10 minutes.');
  const pin = req.headers['x-pin'] || new URL(req.url, 'http://x').searchParams.get('pin');
  const who = pin && PINS[pin];
  if (!who) { failures.get(ip).push(Date.now()); throw new HttpError(401, 'Wrong PIN'); }
  need(who.role === 'admin' || roles.includes(who.role), 403, 'This PIN cannot do that');
  return who;
}
function readJson(req) {
  return new Promise((res, rej) => {
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > 100_000) { rej(new HttpError(413, 'Too big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { res(chunks.length ? JSON.parse(Buffer.concat(chunks)) : {}); } catch { rej(new HttpError(400, 'Bad JSON')); } });
  });
}
function cors(req, res) {
  const o = req.headers.origin;
  if (o && (CORS_ORIGINS.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o))) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Pin, X-Round-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
}
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const csvCell = v => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
const csv = rows => rows.map(r => r.map(csvCell).join(',')).join('\n') + '\n';
const iso = t => t ? new Date(t).toISOString() : '';

// ---- validation ----
const AGE_GROUPS = ['≤18', '19–21', '22–25', '26+'];
const EXPOSURE = ['yes-me', 'yes-someone-close', 'no', 'prefer-not-to-say'];
const cleanId = s => String(s || '').trim().toUpperCase();
const validStudentId = s => /^[A-Z0-9]{4,20}$/.test(s) && !/^G\d+$/.test(s);
const clip = (s, n) => String(s ?? '').slice(0, n);

// ---- routes ----
const routes = [];
const route = (method, pattern, fn) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn });

route('GET', '/api/config', () => CONFIG);

route('POST', '/api/auth', async req => {
  const who = auth(req, ['staff', 'station']);
  const st = who.station && CONFIG.stations.find(s => s.n === who.station);
  return { role: who.role, station: who.station || null, stationName: st ? st.name : null };
});

// Registration (Secretary)
route('POST', '/api/participants', async req => {
  const who = auth(req, ['staff']);
  const b = await readJson(req);
  const name = clip(b.name, 80).trim();
  need(name.length >= 2, 400, 'Name is required');
  need(AGE_GROUPS.includes(b.ageGroup), 400, 'Pick an age group');
  need(typeof b.pbbAccount === 'boolean', 400, 'Answer the Public Bank question');
  need(EXPOSURE.includes(b.scamExposure), 400, 'Answer the scam question');
  need(b.consent === true, 400, 'Consent is required to take part');
  let id;
  const tx = db.transaction(() => {
    if (b.guest) {
      const n = q.guests.all().map(r => +r.id.slice(1)).filter(Number.isFinite).reduce((a, x) => Math.max(a, x), 0) + 1;
      id = 'G' + String(n).padStart(3, '0');
    } else {
      id = cleanId(b.id);
      need(validStudentId(id), 400, 'Student ID should be 4–20 letters/digits');
      need(!q.getP.get(id), 409, `${id} is already registered`);
    }
    q.insP.run({ id, name, age_group: b.ageGroup, pbb_account: b.pbbAccount ? 1 : 0, scam_exposure: b.scamExposure,
      consent: 1, registered_at: Date.now(), registered_by: who.role });
  });
  tx();
  return { id, name };
});

// Picker list for start screens and the registration desk
route('GET', '/api/participants', async req => {
  const who = auth(req, ['staff', 'station']);
  return allSummaries().map(({ s }) => ({
    id: s.id, name: s.name, status: s.status, stationsDone: s.stationsDone, total: s.total,
    playedHere: who.station ? s.stationsDone.includes(who.station) : undefined,
    bestHere: who.station && s.best[who.station] ? s.best[who.station].pct : undefined,
    surveyDone: s.surveyDone,
  }));
});

// Rounds (Game Master via the SDK)
route('POST', '/api/rounds', async req => {
  const who = auth(req, ['station']);
  need(who.station, 403, 'Use a Station PIN');
  const b = await readJson(req);
  const id = cleanId(b.participantId);
  need(q.getP.get(id), 404, 'Not registered: send them to the front desk');
  const token = crypto.randomBytes(9).toString('base64url');
  const r = q.insR.run(id, who.station, Date.now(), token);
  return { roundId: r.lastInsertRowid, token, station: who.station };
});

route('POST', '/api/rounds/:id/finish', async (req, { id }) => {
  const who = auth(req, ['station']);
  const r = q.getR.get(+id);
  need(r, 404, 'No such round');
  need(who.role === 'admin' || r.station === who.station, 403, 'Not your station\'s round');
  const b = await readJson(req);
  const score = Number(b.score), max = Number(b.maxScore);
  need(Number.isFinite(score) && Number.isFinite(max) && max > 0 && score >= 0, 400, 'score and maxScore must be numbers, maxScore > 0');
  const changed = q.endR.run(Date.now(), Math.min(score, max), max, r.id).changes;
  need(changed, 409, 'Round already finished');
  const s = summaryOf(r.participant_id);
  return {
    pct: Math.round(Math.min(score / max, 1) * 1000) / 10,
    best: s.best[r.station].pct,
    stationsDone: s.stationsDone,
    surveyDue: s.stationsDone.length === STATION_COUNT && !s.surveyDone,
  };
});

// Round events: a free channel between a game's devices (Station 5: phone -> laptop)
route('POST', '/api/rounds/:id/events', async (req, { id }) => {
  const r = q.getR.get(+id);
  need(r && req.headers['x-round-token'] === r.token, 403, 'Bad round token');
  need(r.ended_at == null, 409, 'Round is over');
  const b = await readJson(req);
  const e = q.insE.run(r.id, Date.now(), JSON.stringify(b.data ?? null));
  return { eventId: e.lastInsertRowid };
});
route('GET', '/api/rounds/:id/events', async (req, { id }) => {
  const r = q.getR.get(+id);
  need(r, 404, 'No such round');
  if (req.headers['x-round-token'] !== r.token) auth(req, ['station']);
  const after = +new URL(req.url, 'http://x').searchParams.get('after') || 0;
  return { ended: r.ended_at != null, events: q.evs.all(r.id, after).map(e => ({ id: e.id, at: e.at, data: JSON.parse(e.data) })) };
});

// Check-out + Exit Survey
route('POST', '/api/checkout', async req => {
  const who = auth(req, ['station', 'staff']);
  const b = await readJson(req);
  const id = cleanId(b.participantId);
  const p = q.getP.get(id);
  need(p, 404, 'Not registered');
  const answers = b.answers && typeof b.answers === 'object' ? b.answers : {};
  const clean = {};
  for (const [k, v] of Object.entries(answers).slice(0, 60)) clean[clip(k, 20)] = clip(v, 1000);
  const s = summaryOf(id);
  q.checkout.run(Date.now(), who.station || null, JSON.stringify({ stationsDone: s.stationsDone, answers: clean, at: Date.now() }), id);
  return { ok: true, stationsDone: s.stationsDone };
});

// Leaderboard (public, masked)
route('GET', '/api/leaderboard', () => {
  const rows = allSummaries().map(({ s }) => s).filter(s => s.stationsDone.length)
    .sort((a, b) => b.total - a.total || a.totalMs - b.totalMs);
  let prize = 0;
  return {
    stations: STATION_COUNT,
    registered: rows.length,
    rows: rows.slice(0, 30).map((s, i) => ({
      rank: i + 1, who: mask(s.name, s.id), total: s.total, done: s.stationsDone.length,
      mins: Math.round(s.totalMs / 6000) / 10, eligible: s.eligible, prize: s.eligible && prize < 3 ? ++prize : null,
    })),
  };
});

// Admin overview + CSV exports for the post-mortem report
route('GET', '/api/admin/overview', async req => {
  auth(req, ['admin']);
  const all = allSummaries();
  const count = st => all.filter(x => x.s.status === st).length;
  return {
    participants: all.length, active: count('active'), abandoned: count('abandoned'), left: count('left'),
    finishedAll: all.filter(x => x.s.stationsDone.length === STATION_COUNT).length,
    perStation: CONFIG.stations.map(st => ({ n: st.n, name: st.name, players: all.filter(x => x.s.best[st.n]).length })),
    rows: all.map(({ p, s }) => ({ id: s.id, name: s.name, status: s.status, done: s.stationsDone.length, total: s.total, registered: iso(p.registered_at) })),
  };
});
route('GET', '/api/export/participants.csv', async req => {
  auth(req, ['admin']);
  const head = ['participant_id', 'name', 'age_group', 'public_bank_account', 'scam_exposure', 'registered_at', 'status',
    ...CONFIG.stations.flatMap(s => [`s${s.n}_best_pct`, `s${s.n}_best_secs`]), 'total_500', 'rounds_played',
    'checked_out_at', 'checkout_station', 'survey_answers_json'];
  const rows = allSummaries().map(({ p, s }) => [p.id, p.name, p.age_group, p.pbb_account ? 'yes' : 'no', p.scam_exposure, iso(p.registered_at), s.status,
    ...CONFIG.stations.flatMap(st => s.best[st.n] ? [s.best[st.n].pct, Math.round(s.best[st.n].ms / 1000)] : ['', '']),
    s.total, s.roundsPlayed, iso(p.checked_out_at), p.checkout_station ?? '', p.survey ? JSON.stringify(JSON.parse(p.survey).answers) : '']);
  return { csv: csv([head, ...rows]), name: 'scamurai-participants.csv' };
});
route('GET', '/api/export/rounds.csv', async req => {
  auth(req, ['admin']);
  const rows = q.allR.all().map(r => [r.id, r.participant_id, r.station, iso(r.started_at), iso(r.ended_at),
    r.ended_at ? Math.round((r.ended_at - r.started_at) / 1000) : '', r.score ?? '', r.max_score ?? '']);
  return { csv: csv([['round_id', 'participant_id', 'station', 'started_at', 'ended_at', 'secs', 'score', 'max_score'], ...rows]), name: 'scamurai-rounds.csv' };
});

// ---- static files ----
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8' };
function serveStatic(req, res, pathname) {
  // /games/** comes from the repo (same files GitHub Pages serves); everything else from server/public.
  let base = PUBLIC, rel = pathname;
  if (pathname.startsWith('/games/')) { base = path.join(ROOT, 'games'); rel = pathname.slice('/games'.length); }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(base, decodeURIComponent(rel)));
  if (!file.startsWith(base + path.sep) || /\/\./.test(rel)) return false;
  let st; try { st = fs.statSync(file); } catch { return false; }
  if (st.isDirectory()) { res.writeHead(301, { Location: pathname + '/' }); res.end(); return true; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Robots-Tag': 'noindex' });
  fs.createReadStream(file).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const { pathname } = new URL(req.url, 'http://x');
  try {
    for (const r of routes) {
      const m = r.method === req.method && pathname.match(r.re);
      if (!m) continue;
      const out = await r.fn(req, m.groups || {});
      if (out && out.csv !== undefined) {
        res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${out.name}"` });
        return res.end('﻿' + out.csv);
      }
      return send(res, 200, out);
    }
    if (pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
    if (pathname === '/') { res.writeHead(302, { Location: '/register.html' }); return res.end(); }
    if (req.method === 'GET' && serveStatic(req, res, pathname)) return;
    res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found');
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.code, { error: e.message });
    if (e && e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') return send(res, 409, { error: 'Already exists' });
    console.error(e); send(res, 500, { error: 'Server error' });
  }
});
server.listen(PORT, HOST, () => console.log(`Scamurai on http://${HOST}:${PORT}`));
