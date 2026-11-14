/* Scamurai Game SDK
 *
 *   <script src="https://scamurai.physicsxmum.my/sdk.js" data-station="3"></script>
 *   <script>
 *     Scamurai.onStart(p => { ... start your game for p.name ... });
 *     // when the round is over:
 *     Scamurai.finish({ score: 7, maxScore: 10 });
 *   </script>
 *
 * The SDK draws the Game Master start screen (Station PIN, Participant picker,
 * Leaving button), records the Round, shows the result, opens the Exit Survey
 * when it is due, then reloads the page for the next Participant.
 * Add data-test="1" to the script tag to skip the backend while developing.
 *
 * Several players at once (a Game Master dashboard, e.g. Station 5):
 *   Scamurai.onDashboard(info => { ... draw your dashboard ... });   // replaces the one-player flow
 *   const p = await Scamurai.pick();          // picker overlay; resolves { id, name, roundId, token, existing? } or null
 *                                             // (existing: true = they were already playing here; that open Round is returned)
 *   const res = await Scamurai.finishRound(p.roundId, { score, maxScore });   // no reload
 *   await Scamurai.cancelRound(p.roundId);    // closes it without counting
 *   await Scamurai.openRounds();              // this station's open rounds (rebuild after a reload)
 *   Scamurai.survey(p, res.stationsDone);     // exit survey when res.surveyDue
 *   Scamurai.leaving();                       // check someone out
 */
(function () {
  'use strict';
  const me = document.currentScript;
  const API = new URL(me.src).origin;
  const STATION = +me.dataset.station || 0;
  const TEST = me.dataset.test === '1';
  const PIN_KEY = 'scamurai.pin.' + STATION;
  const C = { bg: '#171616', surf: '#242221', red: '#e52521', yellow: '#edcf61', grey: '#c2bdb5', dim: '#6e6961', gold: '#edcf61' };

  let startCb = null, dashCb = null, pickRes = null, round = null, participant = null, config = null, list = [], pollT = null;

  // ---------- helpers ----------
  const pin = () => { try { return localStorage.getItem(PIN_KEY) || ''; } catch { return ''; } };
  const setPin = v => { try { v ? localStorage.setItem(PIN_KEY, v) : localStorage.removeItem(PIN_KEY); } catch {} };
  async function api(path, { method = 'GET', body, headers = {} } = {}) {
    const r = await fetch(API + path, {
      method, headers: { 'Content-Type': 'application/json', 'X-Pin': pin(), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || r.statusText); e.status = r.status; throw e; }
    return j;
  }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

  // ---------- look ----------
  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = API + '/style.css' + new URL(me.src).search;
  document.head.appendChild(fonts);
  const css = document.createElement('style');
  css.textContent = `
  .scm{position:fixed;inset:0;z-index:2147483000;background:${C.bg} url(${API}/assets/bg-dark.jpg) center/cover;color:#fff;
    font:16px/1.45 Lexend,system-ui,sans-serif;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 16px}
  .scm *{box-sizing:border-box}
  .scm-card{width:100%;max-width:560px;background:rgba(23,22,22,.88);border:2px solid ${C.surf};border-radius:18px;padding:22px;margin:auto 0}
  .scm-top{display:flex;align-items:center;gap:14px;margin-bottom:14px}
  .scm-top img{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid ${C.red}}
  .scm h1{font:400 34px/1 Anton,Impact,sans-serif;letter-spacing:.5px;margin:0;text-transform:uppercase}
  .scm h1 em{color:${C.red};font-style:normal}
  .scm .tag{font:18px 'Permanent Marker',cursive;color:${C.yellow};margin:2px 0 0}
  .scm label{display:block;font-weight:600;margin:14px 0 6px}
  .scm input,.scm textarea,.scm select{width:100%;font:inherit;color:#fff;background:${C.surf};border:2px solid ${C.dim};border-radius:10px;padding:12px}
  .scm input:focus,.scm textarea:focus{outline:none;border-color:${C.yellow}}
  .scm button{font:400 20px Anton,Impact,sans-serif;letter-spacing:1px;text-transform:uppercase;border:0;border-radius:10px;padding:12px 18px;cursor:pointer}
  .scm .go{background:${C.red};color:#fff;width:100%;margin-top:16px}
  .scm .go:disabled{background:${C.dim};cursor:not-allowed}
  .scm .ghost{background:transparent;color:${C.grey};border:2px solid ${C.dim};font-size:15px;padding:8px 12px}
  .scm .row{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:14px}
  .scm .err{color:#ff6b6b;min-height:1.4em;margin-top:8px}
  .scm .list{max-height:42vh;overflow:auto;margin-top:8px;border-radius:10px;background:${C.surf}}
  .scm .it{display:flex;justify-content:space-between;gap:10px;padding:11px 12px;border-bottom:1px solid ${C.bg};cursor:pointer}
  .scm .it:hover,.scm .it.sel{background:#3a3634}
  .scm .it.sel{outline:2px solid ${C.yellow};outline-offset:-2px}
  .scm .it small{color:${C.grey}}
  .scm .pill{font-size:12px;border-radius:99px;padding:2px 8px;white-space:nowrap;align-self:center}
  .scm .p-played{background:${C.gold};color:#000}.scm .p-left{background:${C.dim}}.scm .p-new{border:1px solid ${C.dim};color:${C.grey}}
  .scm .big{font:400 72px/1 Anton,Impact,sans-serif;color:${C.yellow};text-align:center;margin:10px 0}
  .scm .dots{display:flex;gap:8px;justify-content:center;margin:12px 0}
  .scm .dots span{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font:20px Anton,sans-serif;background:${C.surf};color:${C.dim}}
  .scm .dots span.on{background:${C.red};color:#fff}
  .scm .q{margin-top:16px}
  .scm .scale{display:flex;gap:6px}.scm .scale button{flex:1;background:${C.surf};color:#fff;font-size:20px;padding:10px 0}
  .scm .scale button.on{background:${C.yellow};color:#000}
  .scm .opts button{display:block;width:100%;text-align:left;background:${C.surf};color:#fff;font:15px Lexend,sans-serif;text-transform:none;letter-spacing:0;margin-top:6px}
  .scm .opts button.on{background:${C.yellow};color:#000}
  .scm .muted{color:${C.grey};font-size:14px}
  .scm hr{border:0;border-top:1px solid ${C.dim};margin:18px 0}`;
  css.textContent += `
    .scm{background:${C.bg} url(${API}/assets/brand/charcoal.webp) center/cover}
    .scm-card{border:1px solid ${C.dim};border-top:5px solid ${C.red};border-radius:4px;padding:26px}
    .scm-top{padding-bottom:22px;border-bottom:1px solid ${C.dim};margin-bottom:24px}.scm-top img{border:1px solid ${C.dim};border-radius:3px}
    .scm .scm-home{display:inline-block;margin-bottom:18px;font-size:12px;color:${C.grey}}
    .scm input,.scm textarea,.scm select,.scm button,.scm .list{border-radius:3px}.scm .go{min-height:48px}.scm .it{min-height:64px;align-items:center}.scm .it>div{min-width:0;overflow-wrap:anywhere}
    .scm .row{flex-wrap:wrap}.scm .ghost{min-height:44px}.scm .pill{border-radius:2px;white-space:normal;font-size:11px;flex:none;max-width:120px}.scm .big{color:#f2eee6}.scm .opts button{min-height:48px}
    .scm .dots span{border-radius:3px}.scm .scale button{min-height:48px}.scm .personal-qr svg{max-height:40vh}
    @media(max-width:380px){.scm{padding:12px}.scm-card{padding:18px}.scm h1{font-size:30px}.scm .scale{gap:4px}.scm .it{padding:10px;gap:6px}}
  `;
  document.head.appendChild(css);

  let root = null;
  function screen(html) {
    if (!root) { root = h('<div class="scm"></div>'); document.body.appendChild(root); }
    root.style.display = 'flex';
    root.innerHTML = `<div class="scm-card"><a class="scm-home" href="${API}/">← Scamurai home</a><div class="scm-top"><img src="${API}/assets/logo.jpg" alt="">
      <div><h1>Scam<em>urai</em></h1><p class="tag">Forewarned is forearmed</p></div></div>${html}</div>`;
    return root.firstChild;
  }
  const hide = () => { if (root) root.style.display = 'none'; };
  let qrLibrary = null;
  async function participantURL(p) {
    if (TEST) return API + '/participant.html';
    const pass = await api(`/api/participants/${encodeURIComponent(p.id)}/pass`);
    return `${API}/participant.html#${pass.participantToken}`;
  }
  async function personalQR(host, p) {
    host.textContent = 'Opening personal QR…';
    try {
      const url = await participantURL(p);
      if (!window.qrcode) {
        if (!qrLibrary) qrLibrary = new Promise((resolve, reject) => {
          const s = document.createElement('script'); s.src = API + '/vendor/qrcode.js' + new URL(me.src).search;
          s.onload = resolve; s.onerror = () => { qrLibrary = null; reject(new Error('Could not load the QR. Try again.')); }; document.head.appendChild(s);
        });
        await qrLibrary;
      }
      const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
      host.innerHTML = `<p><b>${esc(p.name)} · ${esc(p.id)}</b></p><div style="background:white;padding:12px;border-radius:12px;max-width:260px;margin:auto">${qr.createSvgTag({ cellSize: 5, margin: 4, scalable: true })}</div><p>Scan with your phone to keep checking your name, ID and scores across all five stations.</p>`;
    } catch (e) { host.textContent = e.message; }
  }
  function participantButton(p) {
    document.getElementById('scamurai-personal-page')?.remove();
    const el = h(`<div id="scamurai-personal-page" style="position:fixed;right:12px;bottom:12px;z-index:2147482000;font:14px system-ui;color:white;max-width:min(360px,calc(100vw - 24px))">
      <button style="padding:10px 14px;min-height:44px;border-radius:10px;background:${C.surf};color:${C.yellow};border:1px solid ${C.dim}">My participant page</button>
      <div hidden style="background:${C.bg};border:1px solid ${C.dim};border-radius:12px;padding:14px;max-height:70vh;overflow:auto"></div></div>`);
    document.body.appendChild(el);
    el.querySelector('button').onclick = () => { const panel = el.querySelector('div'); panel.hidden = !panel.hidden; if (!panel.hidden) personalQR(panel, p); };
  }

  // ---------- 1. Station PIN ----------
  let stationName = null;
  // Single-player pages reload for the next player; a dashboard just closes the overlay.
  const nextPlayer = () => dashCb ? hide() : location.reload();
  async function boot() {
    if (TEST) { if (dashCb) { hide(); return dashCb({ station: STATION, stationName: 'Test' }); } return showPicker(); }
    if (!STATION) return screen(`<p class="err">This game's script tag needs data-station="1…5".</p>`);
    if (!pin()) return askPin();
    try {
      const a = await api('/api/auth', { method: 'POST' });
      if (a.role === 'station' && a.station !== STATION) throw Object.assign(new Error(`That PIN is for station ${a.station}`), { status: 403 });
      stationName = a.stationName;
      if (dashCb) { hide(); return dashCb({ station: STATION, stationName }); }
      showPicker(a.stationName);
    } catch (e) {
      // Only a PIN the server refused is forgotten. Booth Wi-Fi dropping out, a server restart or the lockout (429)
      // keep it, so a laptop refreshed mid-event comes back by itself instead of asking the Game Master again.
      if (e.status === 401 || e.status === 403) { setPin(''); return askPin(e.message); }
      offline(e.status === 429 ? e.message : e.status ? `Server error (${e.status}).` : 'Can\'t reach the server. Check the Wi-Fi.');
    }
  }
  function offline(msg) {
    const el = screen(`<h2 style="font:24px Anton,sans-serif;margin:8px 0">Station ${STATION}</h2>
      <p class="err">${esc(msg)}</p><p class="muted">Trying again by itself every 10 seconds. Your PIN is still saved.</p>
      <button class="go">Retry now</button>`);
    const t = setTimeout(boot, 10000);
    el.querySelector('.go').onclick = () => { clearTimeout(t); boot(); };
  }
  function askPin(msg = '') {
    const el = screen(`<h2 style="font:24px Anton,sans-serif;margin:8px 0">Station ${STATION} setup</h2>
      <p class="muted">Game Master: enter this station's 4-digit PIN once. This laptop remembers it.</p>
      <label>Station PIN</label><input type="password" inputmode="numeric" autocomplete="off" maxlength="8">
      <p class="err">${esc(msg)}</p><button class="go">Unlock</button>`);
    const inp = el.querySelector('input');
    const go = () => { setPin(inp.value.trim()); boot(); };
    el.querySelector('.go').onclick = go;
    inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    inp.focus();
  }

  // ---------- 2. Participant picker ----------
  async function loadList() {
    if (TEST) return [1, 2, 3].map(i => ({ id: 'TEST00' + i, name: 'Test Player ' + i, status: 'active', stationsDone: [], playedHere: false }));
    return api('/api/participants');
  }
  function showPicker(stationName, startMode = 'play') {
    let sel = null, mode = startMode;
    const el = screen(`<h2 style="font:26px Anton,sans-serif;margin:6px 0">Station ${STATION}${stationName ? ' · ' + esc(stationName) : ''}</h2>
      <label>Type a student ID or name</label>
      <input class="find" autocomplete="off" placeholder="e.g. PHY2209123 or Aisyah">
      <div class="list"></div>
      <p class="err"></p>
      <button class="go" disabled>Start round</button>
      <div class="row"><span class="muted">Not on the list? Send them to the front desk to register.</span>
      <button class="ghost leave">Leaving</button></div>
      ${dashCb ? '<div class="row"><span></span><button class="ghost close">Back to dashboard</button></div>' : ''}`);
    const close = el.querySelector('.close');
    if (close) close.onclick = () => { clearInterval(pollT); hide(); if (pickRes) { pickRes(null); pickRes = null; } };
    const find = el.querySelector('.find'), box = el.querySelector('.list'), go = el.querySelector('.go'), err = el.querySelector('.err');
    const leave = el.querySelector('.leave');
    if (mode === 'leave') { leave.textContent = 'Back to play'; go.style.background = C.dim; }
    function render() {
      const t = find.value.trim().toUpperCase();
      const rows = list.filter(p => !t || p.id.includes(t) || p.name.toUpperCase().includes(t))
        .sort((a, b) => (b.id === t) - (a.id === t) || a.name.localeCompare(b.name)).slice(0, 40);
      box.innerHTML = rows.map(p => {
        const pill = p.playingHere ? '<span class="pill p-played" style="background:#EEED15">playing now</span>'
          : p.status === 'left' ? '<span class="pill p-left">checked out</span>'
          : p.playedHere ? `<span class="pill p-played">played here · best ${p.bestHere}%</span>`
          : `<span class="pill p-new">${p.stationsDone.length}/5 done</span>`;
        return `<div class="it${sel && sel.id === p.id ? ' sel' : ''}" data-id="${esc(p.id)}"><div><b>${esc(p.name)}</b><br><small>${esc(p.id)}</small></div>${pill}</div>`;
      }).join('') || `<div class="it"><small>${list.length ? 'No match. Check the ID, or send them to the front desk.' : 'Nobody registered yet.'}</small></div>`;
      go.disabled = !sel || (mode === 'play' && !!sel.playingHere);
      go.textContent = mode === 'leave' ? (sel ? `Check out ${sel.name}` : 'Pick who is leaving') : (sel ? `Start round · ${sel.name}` : 'Start round');
    }
    box.onclick = e => { const it = e.target.closest('.it[data-id]'); if (!it) return; sel = list.find(p => p.id === it.dataset.id); render(); };
    find.oninput = () => { sel = null; const t = find.value.trim().toUpperCase(); const exact = list.find(p => p.id === t); if (exact) sel = exact; render(); };
    find.onkeydown = e => { if (e.key === 'Enter' && sel) go.click(); };
    leave.onclick = () => { mode = mode === 'play' ? 'leave' : 'play'; leave.textContent = mode === 'leave' ? 'Back to play' : 'Leaving'; go.style.background = mode === 'leave' ? C.dim : ''; render(); };
    go.onclick = async () => {
      if (!sel) return;
      go.disabled = true; err.textContent = '';
      if (mode === 'leave') { clearInterval(pollT); return survey(sel, sel.stationsDone, false); }
      try {
        const r = TEST ? { roundId: -Date.now(), token: 'test' } : await api('/api/rounds', { method: 'POST', body: { participantId: sel.id } });
        clearInterval(pollT);
        if (pickRes) {   // dashboard: hand the new Round back, keep the page
          hide(); const done = pickRes; pickRes = null;
          return done({ id: sel.id, name: sel.name, station: STATION, roundId: r.roundId, token: r.token, startedAt: Date.now() });
        }
        participant = sel;
        round = { id: r.roundId, token: r.token, startedAt: Date.now() };
        hide();
        participantButton(sel);
        if (startCb) startCb(Scamurai.player);
      } catch (e) {
        if (e.status === 409 && pickRes) {
          // Already playing here: the list was stale, another laptop started them, or the first tap's reply was lost.
          // Hand the open Round back so the dashboard shows its Join QR again, instead of a dead end.
          try {
            const o = (await api('/api/rounds/open')).find(x => x.participant.id === sel.id);
            if (o) { clearInterval(pollT); hide(); const done = pickRes; pickRes = null;
              return done({ id: sel.id, name: sel.name, station: STATION, roundId: o.roundId, token: o.token, startedAt: o.startedAt, existing: true }); }
          } catch {}
        }
        err.textContent = e.message; go.disabled = false;
      }
    };
    const refresh = async () => { try { list = await loadList(); render(); } catch (e) { if (e.status === 401) { setPin(''); clearInterval(pollT); askPin('PIN no longer valid'); } else err.textContent = 'Offline? ' + e.message; } };
    refresh(); clearInterval(pollT); pollT = setInterval(refresh, 8000);
    find.focus();
  }

  // ---------- 3. Finish + result ----------
  async function finish({ score, maxScore } = {}) {
    if (!round) throw new Error('Scamurai.finish() called before a round started');
    if (round.done) return round.result;
    round.done = true;
    let res;
    try {
      res = TEST ? { pct: Math.round(score / maxScore * 1000) / 10, best: 0, stationsDone: [STATION], surveyDue: false }
        : await api(`/api/rounds/${round.id}/finish`, { method: 'POST', body: { score, maxScore } });
    } catch (e) {
      screen(`<p class="err">Could not save the score: ${esc(e.message)}</p><button class="go">Try again</button>`)
        .querySelector('.go').onclick = () => { round.done = false; finish({ score, maxScore }); };
      return;
    }
    round.result = res;
    const secs = Math.round((Date.now() - round.startedAt) / 1000);
    const el = screen(`<p class="tag" style="text-align:center">${esc(participant.name)}</p>
      <div class="big">${res.pct}%</div>
      <p style="text-align:center" class="muted">${secs}s · best here ${res.best}%${res.pct >= res.best && res.pct > 0 ? ' · new best!' : ''}</p>
      <div class="dots">${[1, 2, 3, 4, 5].map(n => `<span class="${res.stationsDone.includes(n) ? 'on' : ''}">${n}</span>`).join('')}</div>
      <p style="text-align:center">${res.stationsDone.length < 5 ? `${5 - res.stationsDone.length} station${5 - res.stationsDone.length > 1 ? 's' : ''} to go.` : 'All five stations done!'}</p>
      <button class="ghost personal" style="width:100%">My participant page QR</button><div class="personal-qr"></div>
      <button class="go">${res.surveyDue ? 'Exit survey (for the prize)' : 'Next player'}</button>
      ${res.surveyDue ? '<div class="row"><span></span><button class="ghost more">Play more first</button></div>' : ''}`);
    el.querySelector('.go').onclick = () => res.surveyDue ? survey(participant, res.stationsDone, true) : nextPlayer();
    const more = el.querySelector('.more'); if (more) more.onclick = () => nextPlayer();
    const reloadTimer = !res.surveyDue && setTimeout(() => location.reload(), 30000);
    el.querySelector('.personal').onclick = () => { clearTimeout(reloadTimer); personalQR(el.querySelector('.personal-qr'), participant); };
    return res;
  }

  // ---------- 4. Exit Survey ----------
  async function survey(p, stationsDone, fromFinish) {
    try { config = config || await api('/api/config'); } catch (e) { return screen(`<p class="err">${esc(e.message)}</p>`); }
    const qs = [...config.stations.filter(s => stationsDone.includes(s.n)).flatMap(s => s.questions.map(q => ({ ...q, station: s }))), ...config.general];
    const ans = {};
    const field = q => {
      if (q.type === 'scale') return `<div class="scale" data-q="${q.id}">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-v="${v}">${v}</button>`).join('')}</div>`;
      if (q.type === 'choice' || q.type === 'station') {
        const opts = q.type === 'station' ? config.stations.filter(s => stationsDone.includes(s.n)).map(s => `${s.n}. ${s.name}`) : q.options;
        return `<div class="opts" data-q="${q.id}">${opts.map(o => `<button type="button" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      }
      return `<textarea rows="2" data-q="${q.id}" maxlength="500"></textarea>`;
    };
    let last = null;
    const el = screen(`<h2 style="font:26px Anton,sans-serif;margin:4px 0">Exit survey · ${esc(p.name)}</h2>
      <p class="muted">${stationsDone.length} of 5 stations done. Hand the laptop to the participant. One minute, then you're free!</p>
      ${qs.map(q => { const head = q.station && q.station !== last ? `<hr><p class="tag">${esc(q.station.name)}</p>` : (!q.station && last ? '<hr>' : ''); last = q.station || null; return `${head}<div class="q"><b>${esc(q.text)}</b>${field(q)}</div>`; }).join('')}
      <p class="err"></p><button class="go">Submit &amp; check out</button>
      <div class="row"><span></span><button class="ghost back">${fromFinish ? 'Play more first' : 'Cancel'}</button></div>`);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      const g = b.parentElement; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); ans[g.dataset.q] = b.dataset.v;
    });
    el.querySelector('.back').onclick = () => nextPlayer();
    el.querySelector('.go').onclick = async ev => {
      el.querySelectorAll('textarea').forEach(t => { if (t.value.trim()) ans[t.dataset.q] = t.value.trim(); });
      const missing = qs.filter(q => q.type !== 'text' && !ans[q.id]);
      if (missing.length) { el.querySelector('.err').textContent = `Please answer all the 1–5 and pick-one questions (${missing.length} left).`; return; }
      ev.target.disabled = true;
      try {
        if (!TEST) await api('/api/checkout', { method: 'POST', body: { participantId: p.id, answers: ans } });
        screen(`<div class="big">Thank you!</div><p style="text-align:center">${esc(p.name)} is checked out.${stationsDone.length === 5 ? ' Watch the leaderboard for the prize!' : ''}</p>`);
        setTimeout(nextPlayer, dashCb ? 2500 : 6000);
      } catch (e) { el.querySelector('.err').textContent = e.message; ev.target.disabled = false; }
    };
  }

  // ---------- public API ----------
  window.Scamurai = {
    onStart(cb) { startCb = cb; if (round && !round.done) cb(this.player); },
    finish,
    get player() { return participant && { id: participant.id, name: participant.name, station: STATION, roundId: round.id, token: round.token }; },
    api, API, STATION,
    participantURL,
    resetPin() { setPin(''); location.reload(); },
    // ---- dashboard mode (several players at once) ----
    onDashboard(cb) { dashCb = cb; },
    pick() {
      if (pickRes) pickRes(null);
      return new Promise(res => { pickRes = res; showPicker(stationName); });
    },
    async finishRound(roundId, { score, maxScore }) {
      if (TEST) return { pct: Math.round(score / maxScore * 1000) / 10, best: 0, stationsDone: [STATION], surveyDue: false };
      return api(`/api/rounds/${roundId}/finish`, { method: 'POST', body: { score, maxScore } });
    },
    cancelRound(roundId) { return TEST ? Promise.resolve({ ok: true }) : api(`/api/rounds/${roundId}/cancel`, { method: 'POST' }); },
    openRounds() { return TEST ? Promise.resolve([]) : api('/api/rounds/open'); },
    survey(p, stationsDone) { clearInterval(pollT); return survey(p, stationsDone, false); },
    leaving() { showPicker(stationName, 'leave'); },
  };
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
