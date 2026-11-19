/* Shared event lifecycle for participant-played desktop stations.
 * Per-tab evidence; server-owned identity, one active Round per Participant/Station.
 * The embedded game never receives the station PIN. */
(() => {
  'use strict';
  const script = document.currentScript, game = script.dataset.game, station = Number(script.dataset.station);
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  const key = `scamurai.booth.${station}.${demo ? 'demo' : 'event'}.v1`;
  const $ = id => document.getElementById(id), frame = $('booth-frame');
  let state = null, busy = false, damaged = false, ready = false;
  function persist() { state ? sessionStorage.setItem(key, JSON.stringify(state)) : sessionStorage.removeItem(key); }
  function status(text, error = false) { $('booth-status').textContent = text; $('booth-status').dataset.error = String(error); }
  function controls() {
    const open = state?.status === 'open', pending = state?.status === 'pending', done = ['saved','cancelled'].includes(state?.status);
    $('booth-identity').textContent = demo ? 'Demo / no event score' : state ? `${state.participant.name} · ${state.participant.id}` : 'Choose your registered name';
    $('booth-next').hidden = !done;
    $('booth-retry').hidden = !pending;
    $('booth-survey').hidden = demo || state?.status !== 'saved' || !state.result?.surveyDue;
    $('booth-cancel').hidden = !open;
    $('booth-leaving').hidden = demo || !!state;
    $('booth-select').disabled = busy || damaged || !ready;
    for (const id of ['booth-next','booth-retry','booth-cancel']) $(id).disabled = busy;
    $('booth-idle').hidden = !!state && state.status !== 'cancelled';
    frame.hidden = !state || state.status === 'cancelled';
    frame.inert = busy || state?.status === 'cancelled';
  }
  function gameURL() { return `/games/${game}/game.html${demo ? '?demo=1' : ''}`; }
  async function personal() {
    $('booth-personal').removeAttribute('href');
    if (!demo && state) {
      const id = state.participant.id;
      try { const url = await Scamurai.participantURL(state.participant); if (state?.participant.id === id) $('booth-personal').href = url; } catch {}
    }
  }
  async function pick() {
    if (busy || damaged || !ready || state && !['saved','cancelled'].includes(state.status)) return;
    busy = true; controls();
    try {
      if (demo) {
        state = {version:1,status:'open',roundId:null,participant:null,snapshot:null}; persist(); frame.src = gameURL();
      } else {
        // Retain a completed result if the next-participant picker is backed out of.
        const p = await Scamurai.pick();
        if (!p) return;
        state = {version:1,status:'open',roundId:p.roundId,participant:{id:p.id,name:p.name},snapshot:null,existing:!!p.existing};
        persist();
        if (p.existing) { status('This participant already has an active Round. Resume it on the original laptop, or ask the Game Master to cancel it.', true); frame.src = 'about:blank'; }
        else { frame.src = gameURL(); status('Read the instructions, then start. Your score will be saved for this participant.'); }
        personal();
      }
    } catch (error) { status(`Could not select participant: ${error.message}`, true); }
    finally { busy = false; controls(); }
  }
  function verify(win) {
    if (win !== frame.contentWindow || win.location.origin !== location.origin || win.location.pathname !== `/games/${game}/game.html` || !state || state.existing || state.status === 'cancelled') throw new Error('Choose a participant on the station screen first.');
  }
  async function flush() {
    if (!ready || busy || state?.status !== 'pending') return;
    busy = true; controls();
    try {
      // Persist before requesting: an unavailable disk never becomes a false saved result.
      persist();
      const result = demo ? {pct:state.score,best:state.score,surveyDue:false} : await Scamurai.finishRound(state.roundId,{score:state.score,maxScore:100});
      if (!Number.isFinite(result.pct) || !Number.isFinite(result.best)) throw new Error('Invalid score response');
      state.result = result; state.status = 'saved'; persist();
      status(demo ? 'Demo complete. No event score was saved.' : `Score saved: ${result.pct} / 100 · Station best: ${result.best} / 100.${result.surveyDue ? ' All five stations complete — use Leaving for the exit survey after reviewing.' : ''}`);
    } catch (error) {
      let cancelled = false;
      if (!demo && error.status === 409) {
        try { cancelled = (await Scamurai.api(`/api/rounds/${state.roundId}/events?after=0`)).cancelled === true; } catch {}
      }
      if (cancelled) {
        state.status = 'cancelled'; persist(); frame.src = 'about:blank';
        status('This Round was cancelled on another laptop. No score was saved. Choose the next participant.');
      } else status(`Score awaiting confirmation: ${error.message}. Use Retry save before the next participant.`,true);
    }
    finally { busy = false; controls(); }
  }
  async function cancel() {
    if (busy || state?.status !== 'open') return;
    if (!confirm('Cancel this Round without a score? Use for equipment problems or the wrong participant.')) return;
    busy = true; frame.inert = true; controls();
    try {
      if (!demo) {
        try { await Scamurai.cancelRound(state.roundId); }
        catch(error) { const r = await Scamurai.api(`/api/rounds/${state.roundId}/events?after=0`); if (!r.cancelled) throw error; }
      }
      state.status = 'cancelled'; persist(); frame.src = 'about:blank'; status('Round cancelled. Choose the next participant.');
    } catch(error) { status(`Cancellation not confirmed: ${error.message}. Keep this tab open.`,true); }
    finally { busy = false; controls(); }
  }
  window.ScamuraiBooth = {
    demo,
    restartDemo(win) { verify(win); if (!demo || busy) return; state = null; persist(); pick(); },
    snapshot(win) { verify(win); return state.snapshot && JSON.parse(JSON.stringify(state.snapshot)); },
    update(win, snapshot) { verify(win); if (state.status !== 'open') throw new Error('This Round has already ended.'); state.snapshot = snapshot; persist(); },
    finish(win, snapshot, score) {
      verify(win);
      if (state.status !== 'open') return;
      if (!Number.isFinite(score) || score < 0 || score > 100 || snapshot.status !== 'finished') throw new Error('Invalid final score');
      state.snapshot = snapshot; state.score = score; state.status = 'pending';
      try { persist(); } catch { status('Storage unavailable. Keep this tab open and use Retry save.',true); controls(); return; }
      controls(); flush();
    },
    next(win) { verify(win); if (['saved','cancelled'].includes(state.status)) pick(); else status('Save or cancel the current Round before the next participant.',true); }
  };
  $('booth-select').onclick = pick; $('booth-next').onclick = pick; $('booth-retry').onclick = flush; $('booth-cancel').onclick = cancel;
  $('booth-survey').onclick = () => { if (!demo && state?.status === 'saved') Scamurai.survey(state.participant,state.result.stationsDone); };
  $('booth-leaving').onclick = () => { if (!demo && !state) Scamurai.leaving(); };
  $('booth-demo').hidden = !demo;
  Scamurai.onDashboard(() => {
    ready = true;
    try {
      sessionStorage.setItem(key+':probe','1'); sessionStorage.removeItem(key+':probe');
      const raw = sessionStorage.getItem(key);
      if (raw) {
        state = JSON.parse(raw);
        if (state?.status === 'saved' && (!Number.isFinite(state.result?.pct) || !Number.isFinite(state.result?.best))) throw new Error('Invalid saved result');
        if (state?.version !== 1 || !['open','pending','saved','cancelled'].includes(state.status) || (!demo && (!Number.isSafeInteger(state.roundId) || state.roundId < 1 || typeof state.participant?.id !== 'string' || typeof state.participant?.name !== 'string')) || (['pending','saved'].includes(state.status) && (!Number.isFinite(state.score) || state.score < 0 || state.score > 100))) throw new Error('Invalid saved Round');
      }
    } catch { damaged = true; state = null; status('This laptop’s saved Round is unavailable. Ask the Game Master to check active Rounds before clearing storage.',true); controls(); return; }
    if (state) {
      if (!state.existing && state.status !== 'cancelled') frame.src = gameURL();
      status(state.status === 'saved' ? (demo ? 'Demo complete. No event score was saved.' : `Score saved: ${state.result.pct} / 100`) : state.existing ? 'Resume this Round on its original laptop, or cancel it here.' : 'Round restored. Its original deadline still applies.');
      personal(); controls(); if (state.status === 'pending') flush();
    } else { status(demo ? (script.dataset.demoStatus || 'Try every email in an unscored demo.') : 'Choose your registered name to begin on this laptop.'); controls(); pick(); }
  });
})();
