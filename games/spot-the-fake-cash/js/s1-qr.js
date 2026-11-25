/* Station 1 QR Join client (mirrors Game 5's s5.js + phone.html pattern):
 * - Joins via play.html#<roundId>.<token> (never stores or needs a Station PIN)
 * - Binds the player's phone / Meta Quest 3 to their personal participant page
 * - Posts { t: 'join', dev, ua } so the Station 1 Game Master dashboard sees joins & multi-device warnings
 * - Exposes window.ScamuraiQRBooth with the exact deal/answer/finish/snapshot/update/next contract used by game.js */
(() => {
  'use strict';

  const ROUND_KEY = 'scamurai.s1.round';
  const DEV_KEY = 'scamurai.s1.dev';
  const SNAP_KEY_PREFIX = 'scamurai.s1.snap.';
  const $ = id => document.getElementById(id);

  function devId() {
    try {
      let d = localStorage.getItem(DEV_KEY);
      if (!d) {
        d = Math.random().toString(36).slice(2, 8);
        localStorage.setItem(DEV_KEY, d);
      }
      return d;
    } catch {
      return '?';
    }
  }

  function loadStored() {
    try {
      const r = JSON.parse(localStorage.getItem(ROUND_KEY));
      return r && Number.isInteger(r.roundId) && typeof r.token === 'string' ? r : null;
    } catch {
      return null;
    }
  }

  function saveStored(r) {
    try {
      if (r) localStorage.setItem(ROUND_KEY, JSON.stringify(r));
      else localStorage.removeItem(ROUND_KEY);
      return true;
    } catch {
      return false;
    }
  }

  function saveSnap(roundId, snap) {
    try {
      localStorage.setItem(SNAP_KEY_PREFIX + roundId, JSON.stringify(snap));
    } catch {}
  }

  function loadSnap(roundId) {
    try {
      return JSON.parse(localStorage.getItem(SNAP_KEY_PREFIX + roundId) || 'null');
    } catch {
      return null;
    }
  }

  async function api(path, { method = 'GET', token, body } = {}) {
    const res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Round-Token': token } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(json.error || res.statusText);
      err.status = res.status;
      throw err;
    }
    return json;
  }

  let active = null; // { roundId, token, participantId, participantName }
  let serverState = null;
  let lastFinishResult = null;
  let pendingFinish = false;
  let scanner = null;
  let statusPoller = null;

  function showGate(title, message, { allowScanner = true, showParticipant = true } = {}) {
    const gate = $('qr-gate');
    if (!gate) return;
    $('qr-gate-title').textContent = title;
    $('qr-gate-msg').textContent = message;
    const scanBtn = $('qr-scan-btn');
    if (scanBtn) scanBtn.hidden = !allowScanner;
    const pLink = $('qr-participant-link');
    if (pLink) pLink.hidden = !showParticipant;
    gate.hidden = false;
    const startOv = $('start-overlay');
    if (startOv) startOv.hidden = true;
    const actionBar = $('action-bar');
    if (actionBar) actionBar.hidden = true;
  }

  function hideGate() {
    scanner?.stop();
    scanner = null;
    const host = $('qr-scanner-host');
    if (host) { host.innerHTML = ''; host.hidden = true; }
    const gate = $('qr-gate');
    if (gate) gate.hidden = true;
  }

  function updatePlayerChrome() {
    const chip = $('qr-player-chip');
    if (chip && active) {
      chip.textContent = `${active.participantName} · ${active.participantId}`;
      chip.hidden = false;
    }
    const lead = $('qr-player-banner');
    if (lead && active) {
      lead.textContent = `Playing as ${active.participantName} (${active.participantId}) · Round #${active.roundId}`;
      lead.hidden = false;
    }
  }

  function updateResultBanner(res) {
    const banner = $('qr-save-status');
    const retryBtn = $('qr-retry-save');
    if (!banner) return;
    if (res) {
      banner.hidden = false;
      banner.dataset.error = 'false';
      banner.textContent = `Score saved: ${res.pct} / 100 · Your Station 1 best: ${res.best} / 100.${res.surveyDue ? ' All 5 stations complete — open your participant page for the exit survey!' : ''}`;
      if (retryBtn) retryBtn.hidden = true;
    } else if (pendingFinish) {
      banner.hidden = false;
      banner.dataset.error = 'true';
      banner.textContent = 'Could not confirm your score yet (check Wi-Fi). Tap Retry Save below.';
      if (retryBtn) retryBtn.hidden = false;
    }
  }

  function buildSnapshotFromServerState(st) {
    if (!st || !st.deal || !Array.isArray(st.deal.ids)) return null;
    const { NOTE_COUNT, SNAPSHOT_VERSION, DURATION_MS } = FakeCashCore;
    const byQid = new Map((st.answered || []).map(a => [Number(a.qid), a]));
    const answers = [];
    const verdicts = [];
    for (const id of st.deal.ids) {
      const a = byQid.get(Number(id));
      if (!a) break;
      answers.push(a.choice === 'real');
      verdicts.push(!!a.correct);
    }
    const deadline = st.deal.at + (st.deal.durationMs || DURATION_MS);
    const finished = st.ended || answers.length === NOTE_COUNT || Date.now() >= deadline;
    const endReason = finished ? (answers.length === NOTE_COUNT ? 'complete' : 'time') : null;
    return {
      version: SNAPSHOT_VERSION,
      deadline,
      order: st.deal.ids.map(Number),
      answers,
      verdicts,
      status: finished ? 'finished' : 'playing',
      endReason
    };
  }

  async function postJoinEvent(roundId, token) {
    try {
      await api(`/api/rounds/${roundId}/events`, {
        method: 'POST',
        token,
        body: { data: { t: 'join', dev: devId(), ua: navigator.userAgent.slice(0, 80) } }
      });
    } catch {}
  }

  async function joinFromHashOrStorage() {
    let incomingId = null, incomingToken = null;
    if (location.hash.length > 2) {
      const m = /^#(\d+)\.([A-Za-z0-9_-]+)$/.exec(location.hash);
      history.replaceState(null, '', location.pathname + location.search);
      if (m) {
        incomingId = Number(m[1]);
        incomingToken = m[2];
      }
    }

    const old = loadStored();
    if (incomingId && incomingToken && old && old.roundId !== incomingId) {
      // Check if old round is still open before replacing
      try {
        const oldState = await api(`/api/rounds/${old.roundId}/state`, { token: old.token });
        if (!oldState.ended && !oldState.cancelled) {
          const ok = confirm(`This device is still playing Station 1 round #${old.roundId} (${old.participantName}). Switch to round #${incomingId} instead?`);
          if (!ok) {
            incomingId = null;
            incomingToken = null;
          }
        }
      } catch {}
    }

    const targetId = incomingId || old?.roundId;
    const targetToken = incomingToken || old?.token;

    if (!targetId || !targetToken) {
      showGate(
        'Scan your Station 1 Join QR',
        'Ask the Station 1 Game Master to pick your name and show your Join QR, then scan it with your phone camera or tap Scan Join QR below.'
      );
      return false;
    }

    try {
      const [participant, st] = await Promise.all([
        api(`/api/rounds/${targetId}/participant`, { token: targetToken }),
        api(`/api/rounds/${targetId}/state`, { token: targetToken })
      ]);
      if (st.station !== 1) {
        showGate('Wrong station QR', 'That Join QR is for a different station. Ask the Station 1 Game Master for a Spot the Fake Cash Join QR.');
        return false;
      }
      if (st.cancelled) {
        saveStored(null);
        showGate('Round cancelled', 'The Game Master cancelled this round (it does not count). Ask them for a new Join QR to play again.');
        return false;
      }

      active = {
        roundId: targetId,
        token: targetToken,
        participantId: participant.id,
        participantName: participant.name
      };
      serverState = st;
      saveStored(active);

      if (participant.participantToken && window.ScamuraiParticipant) {
        window.ScamuraiParticipant.remember(participant.participantToken);
      }

      updatePlayerChrome();
      hideGate();

      if (!st.ended) {
        postJoinEvent(targetId, targetToken);
        startRemotePoll();
      } else {
        // Already ended on server — fetch idempotent finish summary
        try {
          lastFinishResult = await api(`/api/rounds/${targetId}/finish`, { method: 'POST', token: targetToken, body: {} });
          updateResultBanner(lastFinishResult);
        } catch {}
      }

      return true;
    } catch (err) {
      if (err.status === 403 || err.status === 404) {
        saveStored(null);
        showGate('Join QR expired', 'This Join QR is no longer valid. Ask the Station 1 Game Master for a fresh Join QR.');
      } else {
        showGate('Cannot connect right now', err.message || 'Check your Wi-Fi connection and reload this page.');
      }
      return false;
    }
  }

  function startRemotePoll() {
    clearInterval(statusPoller);
    statusPoller = setInterval(async () => {
      if (!active || document.hidden) return;
      try {
        const st = await api(`/api/rounds/${active.roundId}/state`, { token: active.token });
        if (st.cancelled) {
          clearInterval(statusPoller);
          saveStored(null);
          showGate('Round cancelled', 'The Game Master cancelled this round (it does not count). Ask them for a new Join QR to play again.');
        } else if (st.ended && !lastFinishResult) {
          clearInterval(statusPoller);
          try {
            lastFinishResult = await api(`/api/rounds/${active.roundId}/finish`, { method: 'POST', token: active.token, body: {} });
            updateResultBanner(lastFinishResult);
          } catch {}
        }
      } catch {}
    }, 5000);
  }

  function openJoinScanner() {
    const host = $('qr-scanner-host');
    if (!host || !window.ScamuraiScanner) return;
    host.hidden = false;
    scanner?.stop();
    scanner = window.ScamuraiScanner.mount(host, {
      title: 'Scan Station 1 Join QR',
      description: 'Point your camera at the Join QR shown on the Station 1 Game Master screen.',
      async onCode(raw) {
        let u;
        try { u = new URL(raw); } catch { return 'That is not a Scamurai Join QR.'; }
        if (![location.origin, 'https://scamurai.physicsxmum.my'].includes(u.origin)) {
          return 'That QR is not part of Scamurai.';
        }
        if (u.pathname === '/games/spot-the-fake-cash/play.html' && /^#(\d+)\.([A-Za-z0-9_-]+)$/.test(u.hash)) {
          return { navigate: u.pathname + u.hash };
        }
        return 'Scan the Station 1 Join QR from your Game Master.';
      }
    });
  }

  async function doFinish() {
    if (!active) return null;
    pendingFinish = true;
    try {
      const res = await api(`/api/rounds/${active.roundId}/finish`, {
        method: 'POST',
        token: active.token,
        body: {}
      });
      pendingFinish = false;
      lastFinishResult = res;
      clearInterval(statusPoller);
      updateResultBanner(res);
      return res;
    } catch (err) {
      if (err.status === 409) {
        pendingFinish = false;
        showGate('Round cancelled', 'This round was cancelled at the Station 1 desk. No score was saved.');
        return null;
      }
      updateResultBanner(null);
      throw err;
    }
  }

  // Expose ScamuraiQRBooth before game.js runs its load listener
  window.ScamuraiQRBooth = {
    async ready() {
      const scanBtn = $('qr-scan-btn');
      if (scanBtn) scanBtn.onclick = openJoinScanner;
      const retryBtn = $('qr-retry-save');
      if (retryBtn) {
        retryBtn.onclick = async () => {
          retryBtn.disabled = true;
          try { await doFinish(); } catch {}
          finally { retryBtn.disabled = false; }
        };
      }
      return joinFromHashOrStorage();
    },
    participantInfo() {
      return active ? { id: active.participantId, name: active.participantName, roundId: active.roundId } : null;
    },
    snapshot() {
      if (!active) return null;
      const fromServer = buildSnapshotFromServerState(serverState);
      if (fromServer) return fromServer;
      return loadSnap(active.roundId);
    },
    async deal() {
      if (!active) throw new Error('Not joined to a Station 1 round.');
      const d = await api(`/api/rounds/${active.roundId}/deal`, { method: 'POST', token: active.token });
      return d;
    },
    async answer(_win, qid, choice) {
      if (!active) throw new Error('Not joined to a Station 1 round.');
      return api(`/api/rounds/${active.roundId}/answer`, {
        method: 'POST',
        token: active.token,
        body: { qid, choice }
      });
    },
    update(_win, snapshot) {
      if (active) saveSnap(active.roundId, snapshot);
    },
    async finish(_win, snapshot) {
      if (active) saveSnap(active.roundId, snapshot);
      return doFinish();
    },
    next() {
      location.href = '/participant.html';
    }
  };

  addEventListener('hashchange', () => location.reload());
})();
