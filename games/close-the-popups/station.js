/* Persistent Station 2 host. The iframe keeps the original native document routes;
 * only this host owns SDK calls and the server Round. Never embed PINs in game code. */
(() => {
  'use strict';
  const DEMO = new URLSearchParams(location.search).get('demo') === '1';
  const KEY = DEMO ? 'close-popups:demo:v1' : 'close-popups:station2:v1';
  const frame = document.getElementById('game');
  const status = document.getElementById('station-status');
  const root = new URL('./', location.href);
  let lang = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
  const localID = v => typeof v === 'string' && /^r_[a-f0-9]{24}$/.test(v);
  const $ = id => document.getElementById(id);
  let ready = false, busy = false, picking = false, state = null, practice = null, damaged = false;
  let ownedPreparation = false;
  let message = ['Connecting to Scamurai…','正在连接活动系统…'];
  const say = (en, zh) => { message=[en,zh]; status.textContent = lang === 'zh' ? zh : en; };

  function syncFullscreen(button) {
    if (!button) return;
    const zh = button.lang === 'zh-Hans';
    const active = document.fullscreenElement === document.documentElement;
    const label = active
      ? (zh ? '退出全屏' : 'Exit full screen')
      : (zh ? '进入全屏' : 'Enter full screen');
    button.setAttribute('aria-label', label);
    button.title = label;
    button.querySelector('path').setAttribute('d', active
      ? 'M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5'
      : 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5');
  }
  function syncCurrentFullscreen() {
    syncFullscreen(frame.contentDocument?.getElementById('station-fullscreen'));
  }
  function mountFullscreen(win, controls, language) {
    if (!document.fullscreenEnabled || win !== frame.contentWindow || !safeURL(win.location.href)) return;
    const button = win.document.importNode($('fullscreen-control').content.firstElementChild, true);
    button.lang = language === 'zh' ? 'zh-Hans' : 'en';
    syncFullscreen(button);
    button.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        // Fullscreen the host so task and result navigation can keep it open.
        else await document.documentElement.requestFullscreen();
      } catch {
        win.alert(language === 'zh' ? '暂时无法切换全屏。' : 'Couldn’t switch full screen.');
      }
    });
    controls.append(button);
    win.addEventListener('pageshow', syncCurrentFullscreen);
  }
  function localise() {
    document.documentElement.lang=lang==='zh'?'zh-Hans':'en';
    const labels={
      'demo-link':['Try the demo','试玩一下'],
      'demo-note':['Practice round. Your score won’t count toward the event.','这是练习，得分不会计入活动成绩。'],
      'event-link':['Back to the event →','返回正式挑战 →'],
      'staff-toggle':['Staff','工作人员'],'staff-title':['Staff desk','展台交接'],
      'staff-eyebrow':['STATION 02 / SCAMURAI','第 02 站 / SCAMURAI'],
      'participant-label':['CURRENT PARTICIPANT','当前参与者'],
      'round-score-label':['THIS ROUND','本轮成绩'],'best-score-label':['STATION BEST','本站最佳'],
      retry:['Retry save','重试保存'],resume:['Resume task','返回任务'],personal:['My scores','我的成绩'],
      survey:['Exit survey','离场问卷'],next:['Next participant','下一位'],void:['Cancel round','作废本轮'],
      leaving:['Leaving','离场问卷'],'notice-action':['Staff','工作人员'],
      'cancel-title':['Cancel this round?','作废本轮？'],
      'cancel-note':['Use for equipment or loading problems. A cancelled round receives no score.','用于设备或加载问题。作废轮次不计分。'],
      'confirm-void':['Cancel round','确认作废'],'keep-playing':['Keep playing','继续挑战']
    };
    for(const [id,text] of Object.entries(labels)) $(id).textContent=text[lang==='zh'?1:0];
    $('demo-link').href=`?demo=1&lang=${lang}`;
    $('event-link').href=`?lang=${lang}`;
    $('staff-close').setAttribute('aria-label',lang==='zh'?'关闭工作人员菜单':'Close staff menu');
    status.textContent=message[lang==='zh'?1:0];
    panelSummary();
  }
  function panelSummary() {
    $('booth-player').textContent = state ? `${state.participant.name} · ${state.participant.id}` : DEMO ? (lang==='zh'?'试玩':'Demo') : practice ? (lang==='zh'?'工作人员练习':'Staff practice') : lang==='zh'?'请选择参与者':'Choose participant';
    $('station-header').dataset.phase=practice?'practice':state?.status||'idle';
    $('participant-name').textContent=state ? `${state.participant.name} · ${state.participant.id}` : (practice ? (lang==='zh'?'工作人员练习':'Staff practice') : (lang==='zh'?'等待下一位参与者':'Ready for the next participant'));
    $('next').textContent=state||practice ? (lang==='zh'?'下一位':'Next participant') : (lang==='zh'?'选择参与者 ID':'Select participant ID');
    const scored=state?.status==='saved';
    $('staff-scores').hidden=!scored;
    if(scored){$('staff-round-score').textContent=state.result.pct;$('staff-best-score').textContent=state.result.best;}
    if(state?.status==='saved'||practice&&practice.status!=='open')$('resume').textContent=lang==='zh'?'返回结果':'Back to results';
  }
  function openPanel() { if(!$('station-header').open)$('station-header').showModal(); $('staff-toggle').setAttribute('aria-expanded','true'); }
  function closePanel() { if($('station-header').open)$('station-header').close(); }
  function warn(en,zh) { say(en,zh); $('notice-text').textContent=status.textContent; $('station-notice').hidden=false; }
  function clearNotice() { $('station-notice').hidden=true; }
  function inlineStatus() {
    if(!state?.localId)return;
    try {
      const win=frame.contentWindow,u=new URL(win.location.href);
      if(u.searchParams.get('round')!==state.localId || u.searchParams.get('view')!=='result')return;
      const score=win.document.querySelector('.booth-score'); if(!score)return;
      let note=win.document.getElementById('station-score-status');
      if(!note){note=win.document.createElement('p');note.id='station-score-status';note.className='booth-note';note.setAttribute('role','status');score.after(note);}
      note.textContent=state.status==='saved' ? (lang==='zh'?'成绩已同步。':'Score saved to the event.') : (lang==='zh'?'正在同步成绩…':'Saving score…');
    } catch {}
  }
  function safeURL(raw) {
    try {
      const u = new URL(raw, root);
      return u.origin === root.origin && u.pathname.startsWith(root.pathname + 'browse/') && u.pathname.endsWith('.html') ? u.href : null;
    } catch { return null; }
  }
  const chooser = () => new URL(`browse/booth.html?lang=${lang}&v=scamurai1`, root).href;
  function read() {
    const raw = sessionStorage.getItem(KEY);
    if (raw === null) return null;
    const v = JSON.parse(raw);
    if (!v || v.version !== 1 || !Number.isSafeInteger(v.roundId) || v.roundId < 1
      || !v.participant || typeof v.participant.id !== 'string' || typeof v.participant.name !== 'string'
      || !['open','pending','saved','cancelled'].includes(v.status)
      || !(v.localId === null || localID(v.localId)) || !safeURL(v.url)
      || !Number.isFinite(v.score) || v.score < 0 || v.score > 100
      || (v.status === 'saved' && (!Number.isFinite(v.result?.pct) || !Number.isFinite(v.result?.best)))) throw new Error('Invalid station record');
    return v;
  }
  function persist() {
    if (state) sessionStorage.setItem(KEY, JSON.stringify(state));
    else sessionStorage.removeItem(KEY);
  }
  function syncRoundBrand() {
    // Only a live task mounts the round HUD. Advertiser tabs leave that document in place.
    $('booth-brand').hidden = !frame.hidden && Boolean(frame.contentDocument?.getElementById('br-booth-bar'));
  }
  function controls() {
    syncRoundBrand();
    $('void').hidden = !ready || !state || !['open','pending'].includes(state.status);
    // A pending finish must be retried, not cancelled: the server may have saved it.
    $('void').disabled = busy || state?.status === 'pending';
    $('retry').hidden = !ready || state?.status !== 'pending';
    $('retry').disabled = busy;
    $('resume').hidden = !ready || !(state?.localId || practice?.localId);
    $('next').hidden = !ready || damaged || !(state && ['saved','cancelled'].includes(state.status) || practice && practice.status !== 'open' || !state && !practice);
    $('next').disabled = busy || picking;
    $('personal').hidden = !ready || !state;
    $('survey').hidden = !ready || state?.status !== 'saved' || !state.result?.surveyDue;
    $('leaving').hidden = DEMO || !ready || !!state || !!practice || damaged || picking;
    panelSummary();
    inlineStatus();
  }
  function showState() {
    if (practice) say(`Practice only — no event score${practice.status !== 'open' ? ' · '+practice.score+' / 100' : ''}`, `工作人员练习，不写入活动成绩${practice.status !== 'open' ? ' · '+practice.score+' / 100' : ''}`);
    else if (!state) say('Choose the next participant, then draw a task. If you go straight to the task, we’ll ask for an ID first.', '先选下一位参与者，再抽题。如果直接点任务，会先弹出 ID 选择。');
    else if (state.status === 'saved') say('Score saved. Ready for the next participant.', '成绩已同步，可以交接下一位。');
    else if (state.status === 'cancelled') say('Round cancelled. No score recorded.', '本轮已作废，不计分。');
    else if (state.status === 'pending') say('Score awaiting confirmation. Retry saving before the next participant.', '成绩尚待确认。请重试保存后再交接下一位。');
    else if (!state.localId) say(state.readyToStart ? 'Participant selected. You can draw a task now.' : 'An existing round is open. Resume in its original tab or cancel it here.', state.readyToStart ? '参与者已选好，可以抽题了。' : '该参与者已有未完成轮次，请回原标签恢复，或在此作废。');
    else say('Challenge in progress. Return to the task to continue.', '挑战进行中，返回任务即可继续。');
    controls();
  }
  function verifyChild(win) {
    if (!ready || win !== frame.contentWindow || !safeURL(win.location.href)) throw new Error('Open the game inside its Station 2 entry page.');
  }
  async function prepare(win, mode, taskId) {
    verifyChild(win);
    if (DEMO) {
      if (damaged) throw new Error('Demo storage is unavailable. Allow site storage and reload.');
      // Explicit Start in an unscored demo replaces the previous rehearsal,
      // including one abandoned on the chooser before its timeout callback ran.
      // Resume/reload do not call prepare and retain the original deadline.
      if (practice) {
        sessionStorage.removeItem(KEY+':practice'); practice = null; showState();
      }
      return true;
    }
    if (mode === 'ads' && taskId && taskId !== state?.taskId) throw new Error('Use the assigned task. Return to Draw a task.');
    if (damaged) throw new Error('Station storage is damaged. Staff must resolve the open round before continuing.');
    if (picking || busy) throw new Error('A participant is already being selected.');
    if (state?.status === 'open' && state.localId === null && state.readyToStart === true && mode === 'ads') {
      ownedPreparation = true;
      return true;
    }
    if (state || practice) throw new Error('Finish, save or cancel the current round before starting another. / 请先完成或作废当前轮次。');
    // Check storage before opening a server Round.
    sessionStorage.setItem(KEY + ':probe', '1'); sessionStorage.removeItem(KEY + ':probe');
    if (mode === 'clean') return true;
    if (mode !== 'ads') throw new Error('Unknown challenge mode');
    picking = true; controls();
    try {
      const p = await Scamurai.pick();
      if (!p) throw new Error('No participant selected.');
      ownedPreparation = !p.existing;
      state = {version:1, roundId:p.roundId, participant:{id:p.id,name:p.name}, localId:null,
        status:'open', readyToStart:!p.existing, score:0, result:null, url:safeURL(win.location.href) || chooser()};
      persist(); clearNotice(); showState();
      // Existing rounds are deliberately not given a new local 60-second clock.
      if (p.existing) throw new Error('This participant already has an open round. Resume it in the original tab, or use Cancel round before restarting. / 已有未完成轮次，请回原标签恢复，或先作废。');
      return true;
    } finally { picking = false; controls(); }
  }
  function bind(win, round) {
    verifyChild(win);
    if (!state && !practice && (round?.mode === 'clean' || DEMO) && localID(round.id)) {
      practice = {localId:round.id,status:'open',score:0,url:safeURL(win.BROWSE_BOOTH.entryURL(round))};
      sessionStorage.setItem(KEY+':practice',JSON.stringify(practice)); showState(); return;
    }
    if (!state || state.status !== 'open' || state.localId !== null || state.readyToStart !== true || !localID(round?.id) || round.mode !== 'ads' || round.taskId !== state.taskId) throw new Error('Cannot bind this game round.');
    state.localId = round.id;
    state.url = safeURL(win.BROWSE_BOOTH.entryURL(round)) || state.url;
    persist(); ownedPreparation = false; showState();
  }
  async function flush() {
    if (busy || !ready || !state || state.status !== 'pending') return;
    busy = true; controls();
    try {
      const res = await Scamurai.finishRound(state.roundId, {score:state.score, maxScore:100});
      if (!Number.isFinite(res?.pct) || !Number.isFinite(res.best)) throw new Error('Invalid score response');
      state.result = res; state.status = 'saved'; persist(); clearNotice(); showState();
    } catch (error) {
      if (error.status === 409) {
        try {
          const current = await Scamurai.api(`/api/rounds/${state.roundId}/events?after=0`);
          if (current.cancelled) {
            state.status = 'cancelled'; persist(); frame.hidden = true; frame.inert = true;
            clearNotice(); showState(); openPanel(); return;
          }
        } catch {}
      }
      say(`Could not confirm the score: ${error.message}. Retry save.`, `未能确认成绩：${error.message}。请重试保存。`);
      $('notice-text').textContent=lang==='zh'?'成绩暂未保存，请工作人员重试。':'Score not yet saved. Ask staff to retry.';
      $('station-notice').hidden=false;
    } finally { busy = false; controls(); }
  }
  function result(win, round, score) {
    verifyChild(win);
    if (practice?.localId === round?.id && ['ended','void'].includes(round.status)) {
      practice.status = round.status; practice.score = Number.isFinite(score?.total) ? score.total : 0;
      practice.url = safeURL(win.location.href) || practice.url;
      sessionStorage.setItem(KEY+':practice',JSON.stringify(practice)); showState(); return;
    }
    if (!state || state.localId !== round?.id || !localID(round.id)) return;
    if (state.status !== 'open') { showState(); return; }
    if (round.status === 'void') { cancel(false); return; }
    if (round.status !== 'ended' || !Number.isFinite(score?.total) || score.total < 0 || score.total > 100) return;
    // Freeze the ACTUAL displayed total before making a request. Reload/retry sends
    // the same value. The backend's idempotent finish protects lost responses.
    state.score = score.total; state.status = 'pending';
    state.url = safeURL(win.location.href) || state.url;
    try { persist(); } catch {
      warn('Storage failed. Keep this tab open and retry saving.', '存储失败，请保留本标签并重试保存。'); controls(); return;
    }
    flush();
  }
  async function cancel(manual) {
    if (!ready || busy || !state || state.status !== 'open') return;
    busy = true; frame.inert = true; controls();
    try {
      try { await Scamurai.cancelRound(state.roundId); }
      catch (error) {
        // Recover a cancellation whose successful response was lost.
        const existing = await Scamurai.api(`/api/rounds/${state.roundId}/events?after=0`);
        if (!existing.cancelled) throw error;
      }
      state.status = 'cancelled'; persist();
      clearNotice();
      if (manual) { frame.hidden = true; $('cancel-dialog').close(); openPanel(); }
      showState();
    } catch (error) {
      warn(`Cancellation not confirmed: ${error.message}. Keep this round open.`, `作废尚未确认：${error.message}。请保留本轮。`);
    } finally { busy = false; frame.inert = state?.status === 'cancelled'; controls(); }
  }
  async function next() {
    if (!ready || busy || picking || damaged || !(state && ['saved','cancelled'].includes(state.status) || practice && practice.status !== 'open' || !state && !practice)) return false;
    // Clear state first, close panel, then immediately open ID picker
    state = null; practice = null; persist(); sessionStorage.removeItem(KEY+':practice'); $('personal-link').hidden = true; $('personal-link').innerHTML = ''; clearNotice(); closePanel();
    frame.inert = true; picking = true; showState();
    if (DEMO) { picking = false; frame.inert = false; frame.hidden = false; frame.src = chooser(); showState(); return true; }
    await selectNext(); return true;
  }
  async function selectNext() {
    try {
      sessionStorage.setItem(KEY + ':probe', '1'); sessionStorage.removeItem(KEY + ':probe');
      // Open ID picker and wait for selection BEFORE navigating to chooser
      const p = await Scamurai.pick();
      if (p) {
        state = {version:1, roundId:p.roundId, participant:{id:p.id,name:p.name}, localId:null,
          status:'open', readyToStart:!p.existing, score:0, result:null, url:chooser()};
        persist();
        // Only navigate to chooser after ID is confirmed
        frame.hidden = false; frame.src = chooser(); showState();
        if (p.existing) openPanel();
      } else {
        // User cancelled the picker - stay on current page
        showState();
      }
    } catch (error) {
      warn(`Participant selection failed: ${error.message}. Select the participant again.`, `参与者选择未完成：${error.message}。请重新选择 ID。`);
      openPanel();
    } finally { picking = false; frame.inert = state?.status === 'cancelled'; controls(); }
  }
  window.CLOSE_POPUPS_HOST = {prepare,bind,result,mountFullscreen,demo:DEMO,
    async draw(win, ids) {
      verifyChild(win);
      const pool = [...new Set(ids)].filter(id => typeof id === 'string' && /^minute[2345]-[a-z-]+$/.test(id));
      if (pool.length !== 9) throw new Error('The complete task pool is unavailable.');
      if (!state) await prepare(win, 'ads');
      if (state?.status !== 'open' || state.localId || !state.readyToStart) throw new Error('Finish or cancel the current round first.');
      const retired = win.BROWSE_BOOTH_LEGACY_TASKS?.some(task => task.retired && task.id === state.taskId);
      if (!state.taskId || retired) {
        // Rejection sampling avoids modulo bias; assignment persists before navigation.
        const values = new Uint32Array(1), limit = Math.floor(4294967296 / pool.length) * pool.length;
        do { crypto.getRandomValues(values); } while (values[0] >= limit);
        state.taskId = pool[values[0] % pool.length]; persist();
      }
      if (!pool.includes(state.taskId)) throw new Error('Assigned task is unavailable.');
      return state.taskId;
    },
    canNext(win) { verifyChild(win); return next(); },
    async abort(win) { verifyChild(win); if (ownedPreparation && state?.localId === null) await cancel(false); ownedPreparation = false; }
  };
  document.addEventListener('fullscreenchange', syncCurrentFullscreen);
  $('staff-toggle').onclick=openPanel;
  $('notice-action').onclick=openPanel;
  $('staff-close').onclick=closePanel;
  $('station-header').addEventListener('close',()=>{$('staff-toggle').setAttribute('aria-expanded','false');});
  $('retry').onclick = () => { try { persist(); flush(); } catch { warn('Enable session storage and retry.', '请允许会话存储后重试。'); } };
  $('next').onclick = next;
  $('resume').onclick = () => { const active=state||practice; if (!active) return; closePanel(); frame.hidden = false; frame.src = active.url; };
  $('void').onclick = () => $('cancel-dialog').showModal();
  $('keep-playing').onclick = () => $('cancel-dialog').close();
  $('confirm-void').onclick = () => cancel(true);
  $('leaving').onclick = () => { if (!state && !damaged) {closePanel();Scamurai.leaving();} };
  $('survey').onclick = () => { if (state?.status === 'saved') {closePanel();Scamurai.survey(state.participant, state.result.stationsDone);} };
  $('personal').onclick = async () => {
    if (!state) return;
    const p = {...state.participant};
    const host = $('personal-link');
    host.hidden = false;
    try {
      await Scamurai.personalQR(host, p);
      if (state?.participant.id !== p.id) { host.hidden = true; host.innerHTML = ''; }
    } catch { say('Could not open the participant QR. Try again.', '成绩二维码暂不可用，请重试。'); }
  };
  frame.addEventListener('load', () => {
    syncRoundBrand();
    if (frame.contentDocument) frame.contentWindow.addEventListener('pageshow', syncRoundBrand);
    try { const u=new URL(frame.contentWindow.location.href);if(safeURL(u.href)){lang=u.searchParams.get('lang')==='zh'?'zh':'en';localise();inlineStatus();} } catch {}
    if (practice) {
      try { const url=safeURL(frame.contentWindow.location.href); if(url && new URL(url).searchParams.get('round')===practice.localId){practice.url=url;sessionStorage.setItem(KEY+':practice',JSON.stringify(practice));} } catch {}
      return;
    }
    if (!state || state.status !== 'open') return;
    try {
      const url = safeURL(frame.contentWindow.location.href);
      // Back/Forward can expose an older result or the chooser. They must not
      // replace the resumable URL belonging to the current participant's Round.
      if (url && (!state.localId || new URL(url).searchParams.get('round') === state.localId)) { state.url = url; persist(); }
    } catch { /* Departures cannot replace the saved task route. */ }
  });
  localise();
  if (!window.Scamurai) { warn('SDK unavailable. Open through the Scamurai server and reload.', '接入脚本不可用，请通过 Scamurai 服务打开并刷新。'); return; }
  Scamurai.onDashboard(() => {
    ready = true;
    $('demo-banner').hidden = !DEMO;
    try {
      state = read();
      const raw = sessionStorage.getItem(KEY+':practice');
      if (!state && raw) {
        const v=JSON.parse(raw);
        if (!localID(v?.localId) || !safeURL(v.url) || !['open','ended','void'].includes(v.status) || !Number.isFinite(v.score)) throw new Error('Invalid practice record');
        practice=v;
      }
    } catch {
      damaged = true;
      warn('Station storage is unavailable or damaged. Staff: check open Station 2 rounds before clearing site data.', '第2站记录不可用或损坏。请工作人员先检查后台未完成轮次，再处理本地存储。');
      controls(); return;
    }
    frame.src = state?.url || practice?.url || chooser(); frame.hidden = state?.status === 'cancelled';
    showState(); if (state?.status === 'pending') flush();
    if (!DEMO && !state && !practice) next();
  });
})();
