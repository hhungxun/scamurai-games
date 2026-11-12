// Pressure test for the backend: many Participants playing at once, and the edge cases a busy
// Game Master hits (double starts, two laptops finishing the same Round, cancel racing finish, …).
// Starts its own server on a throwaway database:   node test/pressure.js   (from server/)
'use strict';
const { spawn } = require('node:child_process');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const assert = require('node:assert/strict');

const PORT = 3100 + (process.pid % 500);
const BASE = `http://127.0.0.1:${PORT}`;
const PINS = { admin: '9999', staff: '1111', s: { 1: '5001', 2: '5002', 3: '5003', 4: '5004', 5: '5005' } };
const PLAYERS = +process.env.PLAYERS || 50;

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scamurai-test-'));
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
  env: { ...process.env, PORT, DATA_DIR: dataDir, ADMIN_PIN: PINS.admin, STAFF_PIN: PINS.staff,
    STATION_PINS: Object.entries(PINS.s).map(([n, p]) => `${n}:${p}`).join(',') },
  stdio: ['ignore', 'ignore', 'pipe'],
});
let srvErr = ''; srv.stderr.on('data', d => { srvErr += d; });

async function call(method, url, { pin, token, body, raw } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (pin) headers['X-Pin'] = pin;
  if (token) headers['X-Round-Token'] = token;
  const res = await fetch(BASE + url, { method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
}
const ok = async p => { const r = await p; assert.ok(r.status < 300, `expected 2xx, got ${r.status} ${JSON.stringify(r.json)}`); return r.json; };
const st = n => PINS.s[n];
const points = (correct, ms) => correct ? Math.round(60 + 40 * Math.max(0, 1 - ms / 30000)) : -100;   // as S5.points (no timeouts here)

let passed = 0;
async function check(name, fn) {
  const t = Date.now();
  try { await fn(); passed++; console.log(`  ✓ ${name} (${Date.now() - t} ms)`); }
  catch (e) { console.log(`  ✗ ${name}\n    ${e.stack.split('\n').slice(0, 3).join('\n    ')}`); process.exitCode = 1; }
}

async function main() {
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + '/api/config'); break; } catch { await new Promise(r => setTimeout(r, 100)); } }
  const reg = { ageGroup: '19–21', scamExposure: 'no' };   // must be in server.js AGE_GROUPS / EXPOSURE
  const ids = Array.from({ length: PLAYERS }, (_, i) => `PT${String(i + 1).padStart(4, '0')}`);
  console.log(`Server on ${BASE}, ${PLAYERS} players, data in ${dataDir}`);

  await check(`register ${PLAYERS} participants concurrently`, async () => {
    const res = await Promise.all(ids.map(id => call('POST', '/api/participants', { pin: PINS.staff,
      body: { id, name: `Player ${id}`, ageGroup: reg.ageGroup, pbbAccount: false, scamExposure: reg.scamExposure, consent: true } })));
    const bad = res.filter(r => r.status !== 200);
    assert.equal(bad.length, 0, `failed: ${JSON.stringify(bad[0])}`);
  });

  await check('20 guests registered at once get 20 distinct G-numbers', async () => {
    const res = await Promise.all(Array.from({ length: 20 }, (_, i) => ok(call('POST', '/api/participants', { pin: PINS.staff,
      body: { guest: true, name: `Guest ${i}`, ageGroup: reg.ageGroup, pbbAccount: true, scamExposure: reg.scamExposure, consent: true } }))));
    assert.equal(new Set(res.map(r => r.id)).size, 20);
  });

  await check('registering the same ID twice at once: exactly one wins', async () => {
    const res = await Promise.all([1, 2, 3].map(() => call('POST', '/api/participants', { pin: PINS.staff,
      body: { id: 'DUPE01', name: 'Dupe', ageGroup: reg.ageGroup, pbbAccount: false, scamExposure: reg.scamExposure, consent: true } })));
    assert.deepEqual(res.map(r => r.status).sort(), [200, 409, 409]);
  });

  // Everyone plays Station 5 at the same time: start, 8 verdict events from the "phone", finish from the "laptop".
  const expected = {};
  await check(`${PLAYERS} simultaneous Station 5 rounds, 8 verdicts each, scores land`, async () => {
    await Promise.all(ids.map(async (id, i) => {
      const r = await ok(call('POST', '/api/rounds', { pin: st(5), body: { participantId: id } }));
      assert.equal(r.participant.id, id);
      const deal = { t: 'deal', cards: Object.fromEntries([...Array(8)].map((_, k) => [k * 3 + 1, `slug${k}`])), order: [...Array(8)].map((_, k) => k * 3 + 1) };
      await ok(call('POST', `/api/rounds/${r.roundId}/events`, { token: r.token, body: { data: deal } }));
      await ok(call('POST', `/api/rounds/${r.roundId}/events`, { token: r.token, body: { data: { t: 'join' } } }));
      let score = 0;
      for (const n of deal.order) {
        const correct = (i + n) % 3 !== 0, ms = (i * 997 + n * 131) % 30000;
        score += points(correct, ms);
        // (total is floored at 0 below, as S5.total)
        await ok(call('POST', `/api/rounds/${r.roundId}/events`, { token: r.token, body: { data: { t: 'v', n, v: correct ? 'real' : 'fake', ms } } }));
      }
      const ev = await ok(call('GET', `/api/rounds/${r.roundId}/events?after=0`, { token: r.token }));
      assert.equal(ev.events.length, 10);
      assert.equal(ev.events[0].data.t, 'deal');
      score = Math.max(0, score);
      const fin = await ok(call('POST', `/api/rounds/${r.roundId}/finish`, { pin: st(5), body: { score, maxScore: 800 } }));
      expected[id] = Math.round(score / 800 * 1000) / 10;
      assert.equal(fin.pct, expected[id]);
    }));
  });

  await check('admin totals match what was posted', async () => {
    const o = await ok(call('GET', '/api/admin/overview', { pin: PINS.admin }));
    for (const id of ids) assert.equal(o.rows.find(r => r.id === id).total, expected[id], id);
    assert.equal(o.perStation.find(s => s.n === 5).players, PLAYERS);
  });

  await check('leaderboard is sorted and masks names', async () => {
    const lb = await ok(call('GET', '/api/leaderboard'));
    for (let i = 1; i < lb.rows.length; i++) assert.ok(lb.rows[i - 1].total >= lb.rows[i].total);
    assert.ok(lb.rows.every(r => !/PT\d{4}/.test(r.who)));
  });

  const [A, B, C] = ids;
  let ra;
  await check('a second open round for the same player at the same station is refused (409)', async () => {
    ra = await ok(call('POST', '/api/rounds', { pin: st(5), body: { participantId: A } }));
    const again = await call('POST', '/api/rounds', { pin: st(5), body: { participantId: A } });
    assert.equal(again.status, 409);
  });

  await check('10 simultaneous starts for one player: exactly one round opens', async () => {
    const res = await Promise.all(Array.from({ length: 10 }, () => call('POST', '/api/rounds', { pin: st(5), body: { participantId: B } })));
    assert.equal(res.filter(r => r.status === 200).length, 1);
    assert.equal(res.filter(r => r.status === 409).length, 9);
  });

  await check('the same player can play other stations meanwhile', async () => {
    const r1 = await ok(call('POST', '/api/rounds', { pin: st(1), body: { participantId: A } }));
    await ok(call('POST', `/api/rounds/${r1.roundId}/finish`, { pin: st(1), body: { score: 5, maxScore: 10 } }));
  });

  await check('picker shows playingHere for the busy player only', async () => {
    const list = await ok(call('GET', '/api/participants', { pin: st(5) }));
    assert.equal(list.find(p => p.id === A).playingHere, true);
    assert.equal(list.find(p => p.id === C).playingHere, false);
  });

  await check('/rounds/open lists only this station\'s open rounds, with tokens', async () => {
    const open5 = await ok(call('GET', '/api/rounds/open', { pin: st(5) }));
    assert.deepEqual(open5.map(r => r.participant.id).sort(), [A, B].sort());
    assert.ok(open5.every(r => r.token && r.startedAt));
    assert.equal((await ok(call('GET', '/api/rounds/open', { pin: st(2) }))).length, 0);
    assert.equal((await call('GET', '/api/rounds/open', { pin: PINS.staff })).status, 403);
  });

  await check('wrong round token: posting and reading are refused (403)', async () => {
    assert.equal((await call('POST', `/api/rounds/${ra.roundId}/events`, { token: 'nope', body: { data: 1 } })).status, 403);
    assert.equal((await call('GET', `/api/rounds/${ra.roundId}/events`, { token: 'nope' })).status, 403);
  });

  await check('another station cannot finish or cancel this round (403)', async () => {
    assert.equal((await call('POST', `/api/rounds/${ra.roundId}/finish`, { pin: st(2), body: { score: 1, maxScore: 1 } })).status, 403);
    assert.equal((await call('POST', `/api/rounds/${ra.roundId}/cancel`, { pin: st(2) })).status, 403);
  });

  await check('two laptops finishing the same round at once: one result, the other gets it back as already', async () => {
    const res = await Promise.all([300, 500].map(score => ok(call('POST', `/api/rounds/${ra.roundId}/finish`, { pin: st(5), body: { score, maxScore: 800 } }))));
    assert.equal(res.filter(r => r.already).length, 1);
    assert.equal(res[0].pct, res[1].pct);
  });

  await check('events after the round ended are refused (409); phone sees ended', async () => {
    assert.equal((await call('POST', `/api/rounds/${ra.roundId}/events`, { token: ra.token, body: { data: { t: 'v' } } })).status, 409);
    assert.equal((await ok(call('GET', `/api/rounds/${ra.roundId}/events?after=0`, { token: ra.token }))).ended, true);
  });

  await check('after finishing, the player can start a fresh round', async () => {
    const r = await ok(call('POST', '/api/rounds', { pin: st(5), body: { participantId: A } }));
    await ok(call('POST', `/api/rounds/${r.roundId}/finish`, { pin: st(5), body: { score: 0, maxScore: 800 } }));
  });

  await check('cancel: phone sees cancelled, finish then 409, not counted, player can restart', async () => {
    const before = (await ok(call('GET', '/api/admin/overview', { pin: PINS.admin }))).rows.find(r => r.id === C).total;
    const r = await ok(call('POST', '/api/rounds', { pin: st(5), body: { participantId: C } }));
    await ok(call('POST', `/api/rounds/${r.roundId}/cancel`, { pin: st(5) }));
    const ev = await ok(call('GET', `/api/rounds/${r.roundId}/events?after=0`, { token: r.token }));
    assert.equal(ev.cancelled, true);
    assert.equal((await call('POST', `/api/rounds/${r.roundId}/finish`, { pin: st(5), body: { score: 800, maxScore: 800 } })).status, 409);
    assert.equal((await call('POST', `/api/rounds/${r.roundId}/cancel`, { pin: st(5) })).status, 409);
    const after = (await ok(call('GET', '/api/admin/overview', { pin: PINS.admin }))).rows.find(x => x.id === C).total;
    assert.equal(after, before);
    const r2 = await ok(call('POST', '/api/rounds', { pin: st(5), body: { participantId: C } }));
    await ok(call('POST', `/api/rounds/${r2.roundId}/cancel`, { pin: st(5) }));
  });

  await check('cancel racing finish (30 rounds): each ends exactly one way, never NaN', async () => {
    const rs = [];
    for (const id of ids.slice(10, 40)) rs.push(await ok(call('POST', '/api/rounds', { pin: st(4), body: { participantId: id } })));
    await Promise.all(rs.map(async r => {
      const [f, c] = await Promise.all([
        call('POST', `/api/rounds/${r.roundId}/finish`, { pin: st(4), body: { score: 7, maxScore: 10 } }),
        call('POST', `/api/rounds/${r.roundId}/cancel`, { pin: st(4) })]);
      assert.equal([f.status, c.status].filter(s => s === 200).length, 1, `finish ${f.status} cancel ${c.status}`);
      if (f.status === 200) assert.equal(f.json.pct, 70);
    }));
  });

  await check('event cap: the 201st event is refused (429)', async () => {
    const r = await ok(call('POST', '/api/rounds', { pin: st(3), body: { participantId: C } }));
    const res = await Promise.all(Array.from({ length: 210 }, (_, k) => call('POST', `/api/rounds/${r.roundId}/events`, { token: r.token, body: { data: { k } } })));
    assert.ok(res.filter(x => x.status === 200).length <= 200);
    assert.ok(res.some(x => x.status === 429));
    await ok(call('POST', `/api/rounds/${r.roundId}/cancel`, { pin: st(3) }));
  });

  await check('oversized body is refused (413) and bad JSON (400)', async () => {
    const r = await ok(call('POST', '/api/rounds', { pin: st(3), body: { participantId: C } }));
    let big;
    try { big = await call('POST', `/api/rounds/${r.roundId}/events`, { token: r.token, raw: JSON.stringify({ data: 'x'.repeat(200_000) }) }); }
    catch { big = { status: 413 }; }   // the server may drop the socket mid-upload, which also refuses it
    assert.equal(big.status, 413);
    assert.equal((await call('POST', `/api/rounds/${r.roundId}/events`, { token: r.token, raw: '{oops' })).status, 400);
    await ok(call('POST', `/api/rounds/${r.roundId}/cancel`, { pin: st(3) }));
  });

  await check('bad inputs: unregistered player 404, bad score 400, unknown round 404', async () => {
    assert.equal((await call('POST', '/api/rounds', { pin: st(5), body: { participantId: 'NOBODY99' } })).status, 404);
    const r = await ok(call('POST', '/api/rounds', { pin: st(2), body: { participantId: C } }));
    assert.equal((await call('POST', `/api/rounds/${r.roundId}/finish`, { pin: st(2), body: { score: 'lots', maxScore: 0 } })).status, 400);
    assert.equal((await call('POST', '/api/rounds/999999/finish', { pin: st(2), body: { score: 1, maxScore: 1 } })).status, 404);
    await ok(call('POST', `/api/rounds/${r.roundId}/cancel`, { pin: st(2) }));
  });

  await check('survey due after all 5 stations; checkout marks them eligible', async () => {
    const D = ids[45];
    let fin;
    for (const n of [1, 2, 3, 4]) {
      const r = await ok(call('POST', '/api/rounds', { pin: st(n), body: { participantId: D } }));
      fin = await ok(call('POST', `/api/rounds/${r.roundId}/finish`, { pin: st(n), body: { score: 1, maxScore: 2 } }));
    }
    assert.equal(fin.surveyDue, true);   // station 5 was played in the big run
    await ok(call('POST', '/api/checkout', { pin: st(4), body: { participantId: D, answers: { q1: '5' } } }));
    const lb = await ok(call('GET', '/api/leaderboard'));
    assert.ok(lb.rows.some(r => r.eligible));
  });

  await check('stale phones polling with an old round token never lock the shared IP out', async () => {
    // 30 phones on campus Wi-Fi share one IP; each still holds a round from a wiped rehearsal database
    const res = await Promise.all(Array.from({ length: 30 }, () => call('GET', `/api/rounds/${ra.roundId}/events?after=0`, { token: 'stale' })));
    assert.ok(res.every(x => x.status === 403), res.map(x => x.status).join());
    assert.equal((await call('POST', '/api/auth', { pin: PINS.admin })).status, 200);
  });

  await check('preview.html (the answer gallery) is served locally only, never through the tunnel', async () => {
    const local = await fetch(`${BASE}/games/scan-me-if-you-can/preview.html`);
    assert.equal(local.status, 200);
    const tunnel = await fetch(`${BASE}/games/scan-me-if-you-can/preview.html`, { headers: { 'cf-connecting-ip': '203.0.113.9' } });
    assert.equal(tunnel.status, 404);
  });

  await check('static files revalidate with 304 (snapshots are megabytes)', async () => {
    const u = `${BASE}/games/scan-me-if-you-can/s5.js`;
    const first = await fetch(u);
    const lm = first.headers.get('last-modified');
    assert.ok(lm, 'no Last-Modified');
    assert.equal((await fetch(u, { headers: { 'if-modified-since': lm } })).status, 304);
    assert.equal((await fetch(`${BASE}/games/%E0%A4%A`)).status, 404);   // malformed escape: no crash
  });

  await check('wrong PINs: the 21st attempt is locked out (429) (run last)', async () => {
    const res = [];
    for (let i = 0; i < 21; i++) res.push((await call('POST', '/api/auth', { pin: '0000' })).status);
    const k = res.indexOf(429);
    assert.equal(k, 20, `lock at the wrong attempt: ${res}`);
    assert.ok(res.slice(0, k).every(x => x === 401) && res.slice(k).every(x => x === 429), String(res));
    assert.equal((await call('POST', '/api/auth', { pin: PINS.admin })).status, 429);   // even a right PIN waits
  });
}

main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  srv.kill();
  fs.rmSync(dataDir, { recursive: true, force: true });
  if (process.exitCode) { if (srvErr) console.log('server stderr:\n' + srvErr.slice(-2000)); console.log(`FAILED (${passed} passed)`); }
  else console.log(`All ${passed} checks passed.`);
});
