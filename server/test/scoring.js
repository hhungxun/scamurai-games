// Server-side scoring: the deal, one-answer-at-a-time verdicts, the finish score and the review.
// Starts its own server on a throwaway database with a synthetic answer key:   node test/scoring.js   (from server/)
'use strict';
const { spawn } = require('node:child_process');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');
const { writeFixture, answerFor } = require('./fixture-keys');

const PORT = 3600 + (process.pid % 300);
const BASE = `http://127.0.0.1:${PORT}`;
const PINS = { admin: '9999', staff: '1111', s: { 1: '5001', 2: '5002', 3: '5003', 4: '5004', 5: '5005' } };
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scamurai-score-'));
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
  env: { ...process.env, PORT, DATA_DIR: dataDir, KEYS_FILE: writeFixture(dataDir), ADMIN_PIN: PINS.admin, STAFF_PIN: PINS.staff,
    STATION_PINS: Object.entries(PINS.s).map(([n, p]) => `${n}:${p}`).join(',') },
  stdio: ['ignore', 'ignore', 'pipe'],
});
let srvErr = ''; srv.stderr.on('data', d => { srvErr += d; });

async function call(method, url, { pin, token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (pin) headers['X-Pin'] = pin;
  if (token) headers['X-Round-Token'] = token;
  const res = await fetch(BASE + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
}
const ok = async p => { const r = await p; assert.ok(r.status < 300, `expected 2xx, got ${r.status} ${JSON.stringify(r.json)}`); return r.json; };
const st = n => PINS.s[n];
const GAME = { 1: 'spot-the-fake-cash', 3: 'phishing-fishing', 4: 'real-or-ai' };

let passed = 0, nextId = 0;
async function check(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}\n    ${e.stack.split('\n').slice(0, 3).join('\n    ')}`); process.exitCode = 1; }
}
async function player() {
  const id = `SC${String(++nextId).padStart(4, '0')}`;
  await ok(call('POST', '/api/participants', { pin: PINS.staff, body: { id, name: `Scorer ${id}`, ageGroup: '19–21', pbbAccount: false, scamExposure: 'no', consent: true } }));
  return id;
}
async function round(n) {
  const id = await player();
  return { ...(await ok(call('POST', '/api/rounds', { pin: st(n), body: { participantId: id } }))), n, pid: id };
}
const deal = r => ok(call('POST', `/api/rounds/${r.roundId}/deal`, { pin: st(r.n) }));
const answer = (r, qid, choice) => call('POST', `/api/rounds/${r.roundId}/answer`, { pin: st(r.n), body: { qid, choice } });
const finish = (r, body = { score: 0, maxScore: 100 }) => call('POST', `/api/rounds/${r.roundId}/finish`, { pin: st(r.n), body });

async function main() {
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + '/api/config'); break; } catch { await new Promise(r => setTimeout(r, 100)); } }
  console.log(`Server on ${BASE}, data in ${dataDir}`);

  await check('each question game deals the right number of ids, never the key, and the deal is idempotent', async () => {
    for (const [n, expected] of [[1, 10], [3, 10], [4, 15]]) {
      const r = await round(n);
      const d = await deal(r);
      assert.equal(d.ids.length, expected);
      assert.equal(new Set(d.ids).size, expected);
      assert.ok(Object.keys(d).every(k => ['ids', 'seconds', 'answered'].includes(k)), Object.keys(d).join());
      assert.deepEqual((await deal(r)).ids, d.ids);
    }
  });

  await check('deals follow the game rules (7 real + 8 AI; 5 phishing + 5 legitimate by difficulty)', async () => {
    const r4 = await round(4), d4 = await deal(r4);
    assert.equal(d4.ids.filter(id => answerFor('real-or-ai', id) === 'real').length, 7);
    assert.equal(d4.ids.filter(id => answerFor('real-or-ai', id) === 'ai').length, 8);
    const r3 = await round(3), d3 = await deal(r3);
    assert.equal(d3.ids.filter(id => answerFor('phishing-fishing', id) === 'phishing').length, 5);
  });

  await check('Real or AI: verdict is revealed per answer, first answer wins, score from stored answers', async () => {
    const r = await round(4), d = await deal(r);
    const [a, b, ...rest] = d.ids;
    const first = await ok(answer(r, a, answerFor('real-or-ai', a)));
    assert.equal(first.correct, true);
    assert.ok(first.explanation && first.clue !== undefined);
    const again = await ok(answer(r, a, answerFor('real-or-ai', a, false)));   // a changed mind does not count
    assert.equal(again.correct, true);
    await ok(answer(r, b, answerFor('real-or-ai', b, false)));
    for (const id of rest) await ok(answer(r, id, answerFor('real-or-ai', id)));
    // 14 right, 1 wrong -> (14-1)*100/15 = 86.7 ; the browser claims 100
    const f = await ok(finish(r, { score: 100, maxScore: 100 }));
    assert.equal(f.pct, 86.7);
  });

  await check('Spot the Fake Cash: 10 points per correct note, maxScore from the client is ignored', async () => {
    const r = await round(1), d = await deal(r);
    for (const [i, id] of d.ids.entries()) {
      const res = await ok(answer(r, id, answerFor('spot-the-fake-cash', id, i < 7)));
      assert.equal(res.correct, i < 7);
      assert.ok(['real', 'fake'].includes(res.answer) && res.reason);
    }
    assert.equal((await ok(finish(r, { score: 100, maxScore: 5 }))).pct, 70);
  });

  await check('Phishing Fishing: no verdict mid-round; review only after finish', async () => {
    const r = await round(3), d = await deal(r);
    assert.equal((await call('GET', `/api/rounds/${r.roundId}/review`, { pin: st(3) })).status, 409);
    for (const [i, id] of d.ids.entries()) {
      const res = await ok(answer(r, id, answerFor('phishing-fishing', id, i < 6)));
      assert.deepEqual(Object.keys(res), ['ok'], 'answer response must not leak the verdict');
    }
    assert.equal((await ok(finish(r))).pct, 60);
    const rev = (await ok(call('GET', `/api/rounds/${r.roundId}/review`, { pin: st(3) }))).review;
    assert.deepEqual(rev.map(x => x.id), d.ids);
    assert.equal(rev.filter(x => x.correct).length, 6);
    assert.ok(rev.every(x => x.classification && x.explanation));
  });

  await check('answers outside the deal, bad choices, no deal, wrong station are refused', async () => {
    const r = await round(4);
    assert.equal((await answer(r, 'q1', 'real')).status, 409);          // not dealt yet
    const d = await deal(r);
    const outside = Array.from({ length: 24 }, (_, i) => `q${i + 1}`).find(id => !d.ids.includes(id));
    assert.equal((await answer(r, outside, 'real')).status, 400);
    assert.equal((await answer(r, d.ids[0], 'maybe')).status, 400);
    const other = await call('POST', `/api/rounds/${r.roundId}/answer`, { pin: st(1), body: { qid: d.ids[0], choice: 'real' } });
    assert.equal(other.status, 403);
    assert.equal((await call('POST', `/api/rounds/${r.roundId}/deal`, { pin: '0000' })).status, 401);
  });

  await check('finish without a deal trusts the client score (clamped); a dealt round is still server-scored and idempotent', async () => {
    const lazy = await round(4);
    assert.equal((await ok(finish(lazy, { score: 73, maxScore: 100 }))).pct, 73);     // legacy client-side game: score accepted
    const over = await round(4);
    assert.equal((await ok(finish(over, { score: 999, maxScore: 100 }))).pct, 100);  // clamped to the maximum
    const r = await round(4), d = await deal(r);
    for (const id of d.ids) await ok(answer(r, id, answerFor('real-or-ai', id)));
    assert.equal((await ok(finish(r, { score: 0, maxScore: 100 }))).pct, 100);       // dealt: the browser's numbers are ignored
    const second = await ok(finish(r, { score: 0, maxScore: 100 }));
    assert.equal(second.already, true);
    assert.equal(second.pct, 100);
    assert.equal((await answer(r, d.ids[0], 'real')).status, 409);        // closed
  });

  await check('a skipped question scores nothing; a blank round scores 0', async () => {
    const r = await round(4), d = await deal(r);
    for (const id of d.ids.slice(0, 5)) await ok(answer(r, id, answerFor('real-or-ai', id)));
    assert.equal((await ok(finish(r))).pct, 33.3);
    const blank = await round(1); await deal(blank);
    assert.equal((await ok(finish(blank, { score: 100, maxScore: 100 }))).pct, 0);
  });

  await check('the answer window closes after the round time plus grace (409)', async () => {
    const r = await round(4), d = await deal(r);
    const db = new Database(path.join(dataDir, 'scamurai.db'));
    const row = db.prepare('SELECT deal FROM rounds WHERE id=?').get(r.roundId);
    const old = { ...JSON.parse(row.deal), at: Date.now() - 95_000 };
    db.prepare('UPDATE rounds SET deal=? WHERE id=?').run(JSON.stringify(old), r.roundId);
    db.close();
    assert.equal((await answer(r, d.ids[0], 'real')).status, 409);
  });

  await check('Pop-ups and Scan Me still self-score, but the server clamps and demands evidence', async () => {
    const pop = await round(2);
    assert.equal((await finish(pop, { score: -5 })).status, 400);
    assert.equal((await finish(pop, { score: 'x' })).status, 400);
    assert.equal((await ok(finish(pop, { score: 9999, maxScore: 1 }))).pct, 100);
    const scan = await round(5);
    assert.equal((await finish(scan, { score: 100, maxScore: 800 })).status, 409);   // no scan events yet
    await ok(call('POST', `/api/rounds/${scan.roundId}/events`, { token: scan.token, body: { data: { t: 'scan' } } }));
    assert.equal((await ok(finish(scan, { score: 400, maxScore: 800 }))).pct, 50);
  });

  await check('Pop-ups and Scan Me have no deal/answer routes', async () => {
    const r = await round(2);
    assert.equal((await call('POST', `/api/rounds/${r.roundId}/deal`, { pin: st(2) })).status, 400);
    assert.equal((await call('GET', `/api/rounds/${r.roundId}/review`, { pin: st(2) })).status, 400);
  });

  console.log(`${passed} checks passed`);
}

main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  srv.kill();
  if (srvErr.trim()) console.log('--- server stderr ---\n' + srvErr.trim().split('\n').slice(0, 10).join('\n'));
  fs.rmSync(dataDir, { recursive: true, force: true });
});
