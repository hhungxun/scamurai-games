/* Station 1 Per-Tab General Join QR Booth Host:
 * - Designed for 1 laptop + external monitor running 2 browser tabs (e.g. Tab 1 = VR, Tab 2 = Normal)
 * - Each tab mints its OWN unique in-memory slotId (POST /api/kiosk/slots), NEVER shared in localStorage!
 * - Zero cross-triggering: Tab A polls ONLY slotA, Tab B polls ONLY slotB; active round lives in per-tab sessionStorage.
 * - Normal mode auto-starts the round immediately when scanned; VR mode loads identified player ready for 1-tap Enter VR.
 * - Preserves full ScamuraiBooth API (deal/answer/snapshot/update/finish/next), manual picker fallback, and My Scores QR. */
(() => {
  'use strict';

  const STATION = 1;
  const GAME = 'spot-the-fake-cash';
  const params = new URLSearchParams(location.search);
  const demo = params.get('demo') === '1';
  const STATE_KEY = `scamurai.booth.${STATION}.${demo ? 'demo' : 'event'}.v1`;
  const MODE_KEY = 'scamurai.s1.tabmode.v1';
  const $ = id => document.getElementById(id);
  const frame = $('booth-frame');

  let state = null;
  let busy = false;
  let damaged = false;
  let ready = false;
  let activeSlotId = null;     // Strictly per-tab JS memory (never copied even on Duplicate Tab!)
  let slotPollTimer = null;
  let slotBusy = false;
  let tabMode = params.get('mode') === 'vr' ? 'vr'
    : params.get('mode') === 'normal' ? 'normal'
    : (sessionStorage.getItem(MODE_KEY) === 'vr' ? 'vr' : 'normal');

  function setTabMode(next) {
    tabMode = next === 'vr' ? 'vr' : 'normal';
    try { sessionStorage.setItem(MODE_KEY, tabMode); } catch {}
    syncModeUI();
    if (!demo && ready && (!state || state.status === 'cancelled')) {
      mintSlot();
    }
  }

  function modeLabel() {
    return tabMode === 'vr' ? 'VR Headset (Quest 3)' : 'Normal Screen';
  }

  function syncModeUI() {
    const normalBtn = $('mode-normal');
    const vrBtn = $('mode-vr');
    if (normalBtn && vrBtn) {
      normalBtn.setAttribute('aria-pressed', String(tabMode === 'normal'));
      vrBtn.setAttribute('aria-pressed', String(tabMode === 'vr'));
      normalBtn.classList.toggle('is-active', tabMode === 'normal');
      vrBtn.classList.toggle('is-active', tabMode === 'vr');
    }
    const badge = $('slot-mode-badge');
    if (badge) {
      badge.textContent = tabMode === 'vr' ? 'VR HEADSET · META QUEST 3' : 'NORMAL SCREEN · CHOOSE MODE';
      badge.dataset.mode = tabMode;
    }
    const hint = $('slot-scan-hint');
    if (hint) {
      hint.textContent = tabMode === 'vr'
        ? 'Scan this screen’s QR with your phone, then choose Normal Mode or VR Mode on screen to start.'
        : 'Scan this screen’s QR with your phone, then choose Normal Mode or VR Mode on screen to start.';
    }
  }

  function persist() {
    state ? sessionStorage.setItem(STATE_KEY, JSON.stringify(state)) : sessionStorage.removeItem(STATE_KEY);
  }

  let statusTimer = null;
  function status(text, error = false, sticky = false) {
    const el = $('booth-status');
    clearTimeout(statusTimer);
    el.textContent = text;
    el.dataset.error = String(error);
    el.hidden = false;
    if (!sticky && !error) statusTimer = setTimeout(() => { el.hidden = true; }, 6000);
  }

  let qrPanel = null, qrFor = null;
  function closeQR() { qrPanel?.remove(); qrPanel = null; qrFor = null; }

  async function personal() {
    closeQR();
    const a = $('booth-personal');
    if (!a) return;
    a.removeAttribute('href'); a.setAttribute('role', 'button'); a.tabIndex = 0; a.style.display = demo ? 'none' : '';
    try { localStorage.removeItem('scamurai.participant.token'); localStorage.removeItem('scamurai.s5.round'); } catch {}
    a.onclick = async e => {
      e.preventDefault();
      if (demo || !state) return;
      if (qrPanel) return closeQR();
      qrFor = state.participant.id;
      qrPanel = document.createElement('div');
      qrPanel.style.cssText = 'position:fixed;top:64px;right:12px;z-index:2147483000;background:#0b0b10;color:#fff;border:1px solid #555;border-radius:12px;padding:14px;max-width:min(320px,calc(100vw - 24px));font:14px system-ui;text-align:center';
      const host = document.createElement('div'), close = document.createElement('button');
      close.textContent = 'Close'; close.style.cssText = 'margin-top:8px;padding:10px 14px;min-height:44px;border-radius:10px';
      close.onclick = closeQR; qrPanel.append(host, close); document.body.appendChild(qrPanel);
      await Scamurai.personalQR(host, state.participant);
    };
    a.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') a.onclick(e); };
  }

  function gameURL({ autostart = false } = {}) {
    if (demo) return `/games/${GAME}/game.html?demo=1`;
    const qs = new URLSearchParams();
    if (tabMode === 'vr') qs.set('vrmode', '1');
    else if (autostart) qs.set('autostart', '1');
    const s = qs.toString();
    return `/games/${GAME}/game.html${s ? '?' + s : ''}`;
  }

  function controls() {
    const open = state?.status === 'open';
    const pending = state?.status === 'pending';
    const done = ['saved', 'cancelled'].includes(state?.status);
    const showIdle = !state || state.status === 'cancelled';

    $('booth-identity').textContent = demo
      ? 'Demo / no event score'
      : state ? `${state.participant.name} · ${state.participant.id}` : 'Scan screen QR to join';

    $('booth-next').hidden = !done;
    $('booth-retry').hidden = !pending;
    $('booth-survey').hidden = demo || state?.status !== 'saved' || !state.result?.surveyDue;
    $('booth-cancel').hidden = !open;
    $('booth-leaving').hidden = demo || !!state;
    if (qrPanel && qrFor !== state?.participant?.id) closeQR();

    $('booth-select').disabled = busy || damaged || !ready;
    for (const id of ['booth-next', 'booth-retry', 'booth-cancel']) $(id).disabled = busy;

    $('booth-idle').hidden = !showIdle;
    frame.hidden = showIdle;
    frame.inert = busy || state?.status === 'cancelled';

    const qrBox = $('slot-qr-panel');
    if (qrBox) qrBox.hidden = demo;
  }

  function stopSlotPolling() {
    clearInterval(slotPollTimer);
    slotPollTimer = null;
  }

  async function expireOldSlot(id) {
    if (!id) return;
    try { await Scamurai.api(`/api/kiosk/slots/${encodeURIComponent(id)}/cancel`, { method: 'POST' }); } catch {}
  }

  async function mintSlot() {
    if (demo || !ready || damaged) return;
    stopSlotPolling();
    const prev = activeSlotId;
    activeSlotId = null;
    window.S1_SLOT_ID = null;
    window.S1_SLOT_URL = null;
    if (prev) expireOldSlot(prev);

    const qrEl = $('slot-qr');
    const codeEl = $('slot-code');
    const stEl = $('slot-status');
    if (stEl) stEl.textContent = 'Generating fresh QR for this screen…';

    try {
      const s = await Scamurai.api('/api/kiosk/slots', { method: 'POST', body: { label: modeLabel() } });
      activeSlotId = s.slotId;
      const joinUrl = `${location.origin}/games/${GAME}/join.html#${s.slotId}`;
      window.S1_SLOT_ID = s.slotId;
      window.S1_SLOT_URL = joinUrl;

      if (qrEl && window.qrcode) {
        const q = qrcode(0, 'M'); q.addData(joinUrl); q.make();
        qrEl.innerHTML = q.createSvgTag({ cellSize: 7, margin: 3, scalable: true });
      }
      if (codeEl) codeEl.textContent = `SCREEN #${s.slotId.slice(0, 4).toUpperCase()}`;
      if (stEl) stEl.textContent = `Ready · waiting for a player to scan (${modeLabel()})`;

      slotPollTimer = setInterval(pollSlot, 1200);
    } catch (e) {
      if (stEl) stEl.textContent = 'Could not generate screen QR: ' + e.message;
    }
  }

  async function pollSlot() {
    if (slotBusy || !activeSlotId || busy || (state && state.status !== 'cancelled')) return;
    slotBusy = true;
    const mySlot = activeSlotId;
    try {
      const s = await Scamurai.api(`/api/kiosk/slots/${encodeURIComponent(mySlot)}`);
      if (mySlot !== activeSlotId) return; // tab refreshed/switched mode meanwhile
      if (s.status === 'claimed' && s.roundId && s.participant) {
        stopSlotPolling();
        activeSlotId = null;
        window.S1_SLOT_ID = null;
        state = {
          version: 1,
          status: 'open',
          roundId: s.roundId,
          participant: { id: s.participant.id, name: s.participant.name },
          snapshot: null,
          existing: false,
          viaQR: true
        };
        persist();
        frame.src = gameURL({ autostart: false });
        status(
          `${s.participant.name} checked in via QR — choose Normal Mode or VR Mode on screen to start!`
        );
        personal();
        controls();
      } else if (s.status !== 'waiting') {
        mintSlot();
      }
    } catch {
      // Transient Wi-Fi blip; retry on next poll tick
    } finally {
      slotBusy = false;
    }
  }

  async function returnToIdleQR() {
    if (busy || damaged || !ready) return;
    if (state && !['saved', 'cancelled'].includes(state.status)) return;
    state = null;
    persist();
    frame.src = 'about:blank';
    closeQR();
    controls();
    if (demo) {
      startDemo();
    } else {
      status('Ready for next participant — scan this screen’s QR to start.');
      await mintSlot();
    }
  }

  function startDemo() {
    state = { version: 1, status: 'open', roundId: null, participant: null, snapshot: null };
    persist();
    frame.src = gameURL();
    controls();
  }

  async function pickManual() {
    if (busy || damaged || !ready || (state && !['saved', 'cancelled'].includes(state.status))) return;
    busy = true;
    controls();
    try {
      if (demo) {
        startDemo();
        return;
      }
      let p = await Scamurai.pick();
      if (!p) return;
      if (p.existing) {
        if (!confirm(`${p.name} already has an unfinished Round here (for example the tab was closed). Cancel it and start a fresh one?`)) {
          status(`${p.name} already has an active Round. Resume it on the original screen, or choose another participant.`, true);
          return;
        }
        await Scamurai.cancelRound(p.roundId);
        const again = await Scamurai.pick();
        if (!again) return;
        p = again;
      }
      stopSlotPolling();
      if (activeSlotId) { expireOldSlot(activeSlotId); activeSlotId = null; }
      state = {
        version: 1,
        status: 'open',
        roundId: p.roundId,
        participant: { id: p.id, name: p.name },
        snapshot: null,
        existing: !!p.existing
      };
      persist();
      if (p.existing) {
        status('This participant already has an active Round. Resume it on the original screen, or cancel it.', true);
        frame.src = 'about:blank';
      } else {
        frame.src = gameURL({ autostart: false });
        status(`Selected ${p.name}. Start inspection or enter VR mode.`);
      }
      personal();
    } catch (error) {
      status(`Could not select participant: ${error.message}`, true);
    } finally {
      busy = false;
      controls();
    }
  }

  function verify(win) {
    if (win !== frame.contentWindow || win.location.origin !== location.origin || win.location.pathname !== `/games/${GAME}/game.html` || !state || state.existing || state.status === 'cancelled') {
      throw new Error('Scan the station QR or choose a participant first.');
    }
  }

  async function flush() {
    if (!ready || busy || state?.status !== 'pending') return;
    busy = true;
    controls();
    try {
      persist();
      const result = demo
        ? { pct: state.score, best: state.score, surveyDue: false }
        : await Scamurai.finishRound(state.roundId, { score: state.score, maxScore: 100 });
      if (!Number.isFinite(result.pct) || !Number.isFinite(result.best)) throw new Error('Invalid score response');
      state.result = result;
      state.score = result.pct;
      state.status = 'saved';
      persist();
      status(
        demo
          ? 'Demo complete. No event score was saved.'
          : `Score saved: ${result.pct} / 100 · Station best: ${result.best} / 100.${result.surveyDue ? ' All five stations complete — open Exit survey!' : ''}`
      );
    } catch (error) {
      let cancelled = false;
      if (!demo && error.status === 409) {
        try { cancelled = (await Scamurai.api(`/api/rounds/${state.roundId}/events?after=0`)).cancelled === true; } catch {}
      }
      if (cancelled) {
        state.status = 'cancelled';
        persist();
        frame.src = 'about:blank';
        status('This Round was cancelled on another screen. No score was saved.');
        mintSlot();
      } else {
        status(`Score awaiting confirmation: ${error.message}. Use Retry save before the next participant.`, true);
      }
    } finally {
      busy = false;
      controls();
    }
  }

  async function cancel() {
    if (busy || state?.status !== 'open') return;
    if (!confirm('Cancel this Round without a score? Use for equipment problems or the wrong participant.')) return;
    busy = true;
    frame.inert = true;
    controls();
    try {
      if (!demo) {
        try { await Scamurai.cancelRound(state.roundId); }
        catch (error) {
          const r = await Scamurai.api(`/api/rounds/${state.roundId}/events?after=0`);
          if (!r.cancelled) throw error;
        }
      }
      state = null;
      persist();
      frame.src = 'about:blank';
      status('Round cancelled. Fresh QR ready for the next participant.');
      if (!demo) await mintSlot();
    } catch (error) {
      status(`Cancellation not confirmed: ${error.message}. Keep this tab open.`, true);
    } finally {
      busy = false;
      controls();
    }
  }

  window.ScamuraiBooth = {
    demo,
    participantInfo() {
      return state?.participant ? { ...state.participant, roundId: state.roundId } : null;
    },
    restartDemo(win) { verify(win); if (!demo || busy) return; state = null; persist(); startDemo(); },
    snapshot(win) { verify(win); return state.snapshot && JSON.parse(JSON.stringify(state.snapshot)); },
    deal(win) { verify(win); if (demo) return { demo: true }; return Scamurai.api(`/api/rounds/${state.roundId}/deal`, { method: 'POST' }); },
    answer(win, qid, choice) { verify(win); if (demo) return { demo: true }; return Scamurai.api(`/api/rounds/${state.roundId}/answer`, { method: 'POST', body: { qid, choice } }); },
    update(win, snapshot) { verify(win); if (state.status !== 'open') throw new Error('This Round has already ended.'); state.snapshot = snapshot; persist(); },
    finish(win, snapshot, score) {
      verify(win);
      if (state.status !== 'open') return;
      if (!Number.isFinite(score) || score < 0 || score > 100 || snapshot.status !== 'finished') throw new Error('Invalid final score');
      state.snapshot = snapshot;
      state.score = score;
      state.status = 'pending';
      try { persist(); } catch { status('Storage unavailable. Keep this tab open and use Retry save.', true); controls(); return; }
      controls();
      return flush();
    },
    next(win) {
      verify(win);
      if (['saved', 'cancelled'].includes(state.status)) returnToIdleQR();
      else status('Save or cancel the current Round before the next participant.', true);
    }
  };

  $('booth-select').onclick = pickManual;
  $('booth-next').onclick = returnToIdleQR;
  $('booth-retry').onclick = flush;
  $('booth-cancel').onclick = cancel;
  $('booth-survey').onclick = () => { if (!demo && state?.status === 'saved') Scamurai.survey(state.participant, state.result.stationsDone); };
  $('booth-leaving').onclick = () => { if (!demo && !state) Scamurai.leaving(); };
  if ($('slot-refresh')) $('slot-refresh').onclick = () => mintSlot();
  if ($('mode-normal')) $('mode-normal').onclick = () => setTabMode('normal');
  if ($('mode-vr')) $('mode-vr').onclick = () => setTabMode('vr');

  $('booth-demo-pill').hidden = !demo;
  for (const a of document.querySelectorAll('.try-demo')) a.hidden = demo;
  syncModeUI();

  Scamurai.onDashboard(() => {
    ready = true;
    try {
      sessionStorage.setItem(STATE_KEY + ':probe', '1');
      sessionStorage.removeItem(STATE_KEY + ':probe');
      const raw = sessionStorage.getItem(STATE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        if (state?.status === 'saved' && (!Number.isFinite(state.result?.pct) || !Number.isFinite(state.result?.best))) throw new Error('Invalid saved result');
        if (state?.version !== 1 || !['open', 'pending', 'saved', 'cancelled'].includes(state.status) || (!demo && (!Number.isSafeInteger(state.roundId) || state.roundId < 1 || typeof state.participant?.id !== 'string' || typeof state.participant?.name !== 'string')) || (['pending', 'saved'].includes(state.status) && (!Number.isFinite(state.score) || state.score < 0 || state.score > 100))) throw new Error('Invalid saved Round');
      }
    } catch {
      damaged = true;
      state = null;
      status('This tab’s saved Round is unavailable. Ask the Game Master to check active Rounds before clearing storage.', true);
      controls();
      return;
    }

    if (state && state.status !== 'cancelled') {
      if (!state.existing) frame.src = gameURL({ autostart: false });
      status(
        state.status === 'saved'
          ? (demo ? 'Demo complete. No event score was saved.' : `Score saved: ${state.result.pct} / 100`)
          : state.existing
            ? 'Resume this Round on its original screen, or cancel it here.'
            : 'Round restored. Its original deadline still applies.',
        false,
        !!state.existing
      );
      personal();
      controls();
      if (state.status === 'pending') flush();
    } else {
      state = null;
      persist();
      controls();
      if (demo) {
        status('Inspect ten banknotes in an unscored demo.');
        startDemo();
      } else {
        status('Ready — any registered player can scan this screen’s QR to start.');
        mintSlot();
      }
    }
  });
})();
