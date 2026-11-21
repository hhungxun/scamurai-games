/* Station 1 controller: wires FakeCashCore, FakeCashStage, FakeCashVR, ScamuraiBooth & ScamuraiI18n. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const { BANKNOTE_SETS, DURATION_MS, NOTE_COUNT, SNAPSHOT_VERSION, Round } = FakeCashCore;
  const booth = window.parent !== window ? window.parent.ScamuraiBooth : null;
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  const LANG_KEY = 'scamurai.lang';
  let lang = localStorage.getItem(LANG_KEY) === 'zh' ? 'zh' : 'en';
  const t = (en, zh) => (lang === 'zh' ? (zh ?? en) : en);
  window.__FAKECASH_IS_ZH__ = () => lang === 'zh';

  const FEEDBACK_MS = 2200;

  let stage = null;
  let vr = null;
  let round = null;
  let feedback = null;
  let feedbackTimer = null;
  let gameTimerInterval = null;
  let initialized = false;
  let submitting = false;
  let vrReady = false;
  let lastStatus = ['', ''];

  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function setStatus(en, zh) {
    lastStatus = [en || '', zh ?? en ?? ''];
    const msg = t(lastStatus[0], lastStatus[1]);
    $('status').textContent = msg;
    const vrNote = $('vr-status');
    vrNote.textContent = msg;
    vrNote.hidden = !msg;
  }

  function renderPips() {
    const host = $('note-pips');
    if (!host) return;
    const review = round ? round.review() : [];
    const currentIdx = round ? round.index : -1;
    host.replaceChildren(...Array.from({ length: NOTE_COUNT }, (_, i) => {
      const pip = document.createElement('span');
      pip.className = 'pip';
      const item = review[i];
      if (item && item.choice !== undefined) {
        pip.classList.add(item.correct ? 'pip-ok' : 'pip-wrong');
      } else if (round && round.status === 'playing' && i === currentIdx && !feedback) {
        pip.classList.add('pip-now');
      }
      return pip;
    }));
  }

  function syncUVLabel() {
    if (!stage) return;
    const on = stage.isUVOn;
    $('uv-label').textContent = on ? t('UV On', '紫外灯开') : t('UV Off', '紫外灯关');
    $('uv-btn').setAttribute('aria-pressed', String(on));
  }

  function syncZoomLabel() {
    if (!stage) return;
    $('zoom-pct').textContent = Math.round(stage.zoom * 100) + '%';
  }

  function setVerdictAvailability() {
    const enabled = round?.status === 'playing' && !feedback && !submitting;
    $('pass-btn').disabled = !enabled;
    $('reject-btn').disabled = !enabled;
    if (vr) {
      if (round?.status === 'finished' && !feedback) vr.updatePanelMode('finished');
      else if (enabled) vr.updatePanelMode('playing');
      else vr.updatePanelMode('hidden');
    }
  }

  function updateGameDisplays() {
    const timeRemaining = Math.ceil((round?.remainingMs() ?? DURATION_MS) / 1000);
    const timeText = formatTime(timeRemaining);
    const score = round?.score ?? 0;
    const streak = round?.streak ?? 0;
    const noteNumber = Math.min(NOTE_COUNT, (round?.index ?? 0) + (feedback ? 0 : 1));
    const currentNote = round ? (round.note || BANKNOTE_SETS[round.order[Math.max(0, round.index - 1)]]) : BANKNOTE_SETS[0];
    const denom = currentNote?.denomination || 'RM50';

    $('note-display').textContent = t(`Note ${noteNumber} / ${NOTE_COUNT}`, `第 ${noteNumber} / ${NOTE_COUNT} 张`);
    const denomEl = $('denom-badge');
    if (denomEl) {
      denomEl.dataset.denom = denom;
      denomEl.textContent = denom === 'RM5' ? t('RM5 · Polymer', 'RM5 · 塑料钞') : denom;
    }
    $('time-display').textContent = timeText;
    $('time-display').classList.toggle('warning', timeRemaining <= 15);
    $('score-display').textContent = `${score} / 100`;
    $('streak-display').textContent = String(streak);
    syncUVLabel();
    syncZoomLabel();
    renderPips();
    setVerdictAvailability();

    if (vr) {
      vr.updateHUD({
        timeText,
        timeRemaining,
        score,
        streak,
        noteNumber,
        noteCount: NOTE_COUNT,
        denomination: denom,
        feedback,
        finished: round?.status === 'finished',
        endReason: round?.endReason
      });
    }
  }

  function applyLocalizedStaticUI() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n-en]').forEach(el => {
      el.textContent = lang === 'zh' ? (el.dataset.i18nZh || el.dataset.i18nEn) : el.dataset.i18nEn;
    });
    const langBtn = $('lang-btn');
    if (langBtn) langBtn.textContent = lang === 'zh' ? 'EN' : '中文';
    $('again-btn').textContent = demo || !booth
      ? t('Play again', '再来一局')
      : t('Next participant', '下一位参与者');

    const vrBadge = $('vr-badge');
    if (vrBadge) {
      vrBadge.textContent = vrReady
        ? t('VR Headset Ready', '已检测到 VR 头显')
        : t('Desktop & Touch Mode', '桌面 / 触控模式');
      vrBadge.dataset.ready = String(vrReady);
    }

    if (feedback) {
      $('feedback-title').textContent = feedback.correct
        ? t('Correct · +10 pts', '判断正确 · +10 分')
        : t('Wrong · +0 pts', '判断错误 · +0 分');
      $('feedback-reason').textContent = t(feedback.reason, feedback.reasonZh || feedback.reason);
    }

    if (round && !$('result-overlay').hidden) showResults();
    if (lastStatus[0]) setStatus(lastStatus[0], lastStatus[1]);
    if (vr) vr.refreshButtonLabels();
    updateGameDisplays();
  }

  function saveProgress() {
    try {
      booth?.update(window, round.snapshot());
    } catch (error) {
      setStatus(
        'Progress could not be saved on this laptop: ' + error.message,
        '当前进度未能保存到本机：' + error.message
      );
    }
  }

  function endGame() {
    clearInterval(gameTimerInterval);
    gameTimerInterval = null;
    updateGameDisplays();
    try {
      booth?.finish(window, round.snapshot(), round.score);
    } catch (error) {
      setStatus(
        'Could not send the score to the booth: ' + error.message,
        '成绩未能上传至展台：' + error.message
      );
    }
    if (!feedback) showResults();
  }

  function showResults() {
    const answered = round.index;
    const accuracy = answered ? Math.round(round.correct * 100 / answered) : 0;
    const unjudged = NOTE_COUNT - answered;

    $('result-title').textContent = round.endReason === 'time'
      ? t('Time is up!', '时间到！')
      : t('Inspection complete!', '鉴钞完成！');
    $('result-score').textContent = `${round.score} / 100`;
    $('stat-correct').textContent = `${round.correct} / ${answered}`;
    $('stat-accuracy').textContent = `${accuracy}%`;
    $('stat-unjudged').textContent = String(unjudged);

    $('review-list').replaceChildren(...round.review().map(({ note, choice, correct }, i) => {
      const item = document.createElement('li');
      item.className = 'review-item ' + (choice === undefined ? 'is-missed' : correct ? 'is-ok' : 'is-wrong');

      const head = document.createElement('div');
      head.className = 'review-head';

      const badge = document.createElement('span');
      badge.className = 'review-badge';
      badge.textContent = choice === undefined
        ? t('UNJUDGED', '未作答')
        : correct ? t('✓ CORRECT +10', '✓ 正确 +10') : t('✗ WRONG +0', '✗ 错误 +0');

      const label = document.createElement('strong');
      const noteName = t(note.name, note.nameZh || note.name);
      const inferredReal = note.isReal !== undefined
        ? note.isReal
        : (choice !== undefined ? (correct ? choice : !choice) : undefined);
      const actual = inferredReal === undefined
        ? ''
        : ' (' + (inferredReal ? t('Genuine', '真钞') : t('Fake', '假钞')) + ')';
      const chosen = choice === undefined
        ? ''
        : ' · ' + (choice ? t('You chose PASS', '你选了真钞') : t('You chose REJECT', '你选了假钞'));
      label.textContent = `#${i + 1} ${noteName}${actual}${chosen}`;

      head.append(badge, label);

      const desc = document.createElement('p');
      desc.textContent = t(note.reason, note.reasonZh || note.reason);

      item.append(head, desc);
      return item;
    }));

    $('action-bar').hidden = true;
    $('guide-drawer').hidden = true;
    $('result-overlay').hidden = false;
    $('result-title').focus();
  }

  function advanceAfterFeedback() {
    if (!feedback) return;
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
    feedback = null;
    $('feedback').hidden = true;
    if (round.status === 'finished') {
      updateGameDisplays();
      showResults();
    } else if (round.expire()) {
      endGame();
    } else {
      stage.buildBanknote(round.note);
      updateGameDisplays();
    }
  }

  function showRound() {
    $('start-overlay').hidden = true;
    if (round.status === 'finished') {
      updateGameDisplays();
      showResults();
      return;
    }
    if (round.expire()) {
      endGame();
      return;
    }

    stage.buildBanknote(round.note);
    $('action-bar').hidden = false;
    setStatus(
      'Drag note to rotate · Drag torch to sweep UV · Scroll to zoom',
      '拖动钞票旋转 · 拖动紫外手电扫描 · 滚轮缩放'
    );
    updateGameDisplays();
    stage.renderer.domElement.focus();
    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
      if (round.expire()) endGame();
      else updateGameDisplays();
    }, 200);
  }

  async function startGame() {
    if (!initialized || round) return;
    $('start-game-btn').disabled = true;
    try {
      if (booth && !demo && typeof booth.deal === 'function') {
        const deal = await booth.deal(window);
        round = new Round({ order: deal.ids });
      } else {
        round = new Round();
      }
      saveProgress();
      showRound();
    } catch (error) {
      console.error(error);
      round = null;
      setStatus('Could not start the round: ' + (error.message || error), '无法开始本轮：' + (error.message || error));
      $('start-overlay').hidden = false;
      $('start-game-btn').disabled = false;
    }
  }

  async function evaluateChoice(userChoice) {
    if (!round || feedback || submitting || round.status !== 'playing') return;
    const judgedNote = round.note;
    let isCorrect;
    let reasonText = judgedNote.reason;

    if (booth && !demo && typeof booth.answer === 'function') {
      submitting = true;
      setVerdictAvailability();
      if (round.expire()) { submitting = false; endGame(); return; }
      const noteIndex = round.order[round.index];
      let verdict;
      try {
        verdict = await booth.answer(window, noteIndex, userChoice ? 'real' : 'fake');
      } catch (error) {
        submitting = false;
        setStatus('Could not send the answer to the booth: ' + (error.message || error), '未能提交答案至展台：' + (error.message || error));
        setVerdictAvailability();
        return;
      }
      isCorrect = !!verdict.correct;
      if (verdict.reveal?.reason) reasonText = verdict.reveal.reason;
      if (!round.recordAnswer(userChoice, isCorrect)) { submitting = false; endGame(); return; }
      submitting = false;
    } else {
      const res = round.answer(userChoice);
      if (!res) {
        endGame();
        return;
      }
      isCorrect = res.correct;
      reasonText = res.reason;
    }

    feedback = {
      correct: isCorrect,
      reason: reasonText,
      reasonZh: judgedNote.reasonZh
    };

    const card = $('feedback');
    $('feedback-title').textContent = feedback.correct
      ? t('Correct · +10 pts', '判断正确 · +10 分')
      : t('Wrong · +0 pts', '判断错误 · +0 分');
    $('feedback-reason').textContent = t(feedback.reason, feedback.reasonZh || feedback.reason);
    card.dataset.correct = String(feedback.correct);
    card.hidden = false;
    updateGameDisplays();

    if (round.status === 'finished') endGame();
    else saveProgress();

    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(advanceAfterFeedback, FEEDBACK_MS);
  }

  function setupDesktopInteraction() {
    const dom = stage.renderer.domElement;
    const pointers = new Map();
    const ray = new THREE.Raycaster();
    let dragTarget = null;

    function pinchDistance() {
      const [a, b] = pointers.values();
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    dom.addEventListener('wheel', event => {
      if (vr.isPresenting) return;
      event.preventDefault();
      stage.changeZoom(event.deltaY < 0 ? stage.ZOOM_STEP : -stage.ZOOM_STEP);
      syncZoomLabel();
    }, { passive: false });

    dom.addEventListener('pointerdown', event => {
      if (vr.isPresenting || event.button !== 0) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      dom.setPointerCapture?.(event.pointerId);
      if (pointers.size !== 1) {
        dragTarget = null;
        return;
      }
      const bounds = dom.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      const y = 1 - (event.clientY - bounds.top) / bounds.height * 2;
      ray.setFromCamera({ x, y }, stage.camera);
      const hitsNote = stage.banknoteMesh && ray.intersectObject(stage.banknoteMesh).length > 0;
      const hitsTorch = ray.intersectObject(stage.uvTorchMesh, true).some(h => h.object !== stage.torchBeamCone);
      dragTarget = hitsTorch || (!hitsNote && x >= 0.05) ? 'torch' : 'note';
      dom.style.cursor = 'grabbing';
    });

    dom.addEventListener('pointermove', event => {
      const prev = pointers.get(event.pointerId);
      if (!prev || vr.isPresenting) return;
      const before = pointers.size === 2 ? pinchDistance() : 0;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2 && before > 0) {
        stage.setZoom(stage.zoom * pinchDistance() / before);
        syncZoomLabel();
        return;
      }
      if (pointers.size !== 1) return;
      const dx = event.clientX - prev.x;
      const dy = event.clientY - prev.y;
      if (dragTarget === 'note') {
        stage.rotateNote(dx * 0.0085, dy * 0.0085);
      } else if (dragTarget === 'torch') {
        const scale = 0.00145 * 600 / Math.max(300, dom.clientHeight);
        stage.uvTorchMesh.position.x = THREE.MathUtils.clamp(stage.uvTorchMesh.position.x + dx * scale, -0.58, 0.58);
        stage.uvTorchMesh.position.y = THREE.MathUtils.clamp(stage.uvTorchMesh.position.y - dy * scale, 0.90, 1.48);
      }
    });

    const stopDrag = event => {
      if (!pointers.delete(event.pointerId)) return;
      dragTarget = null;
      dom.style.cursor = 'grab';
    };
    dom.addEventListener('pointerup', stopDrag);
    dom.addEventListener('pointercancel', stopDrag);
    dom.addEventListener('lostpointercapture', stopDrag);
    window.addEventListener('blur', () => { pointers.clear(); dragTarget = null; dom.style.cursor = 'grab'; });

    window.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.code === 'Escape' && !$('guide-drawer').hidden) {
        $('guide-drawer').hidden = true;
        return;
      }
      if (!round || round.status !== 'playing') return;
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
      switch (event.code) {
        case 'Space': if (!event.repeat) { stage.toggleUV(); syncUVLabel(); } break;
        case 'KeyT': if (!event.repeat) stage.tiltTest(); break;
        case 'KeyF': if (!event.repeat) stage.flipNote(); break;
        case 'KeyP':
        case 'ArrowLeft': if (!event.repeat) evaluateChoice(true); break;
        case 'KeyR':
        case 'ArrowRight': if (!event.repeat) evaluateChoice(false); break;
        case 'Enter': if (!event.repeat && feedback) advanceAfterFeedback(); break;
        case 'Equal':
        case 'NumpadAdd': stage.changeZoom(stage.ZOOM_STEP); syncZoomLabel(); break;
        case 'Minus':
        case 'NumpadSubtract': stage.changeZoom(-stage.ZOOM_STEP); syncZoomLabel(); break;
        case 'Digit0':
        case 'Numpad0': stage.resetView(); syncZoomLabel(); break;
        case 'ArrowUp':
        case 'KeyW': stage.rotateNote(0, -0.14); break;
        case 'ArrowDown':
        case 'KeyS': stage.rotateNote(0, 0.14); break;
        case 'KeyA': stage.rotateNote(-0.14, 0); break;
        case 'KeyD': stage.rotateNote(0.14, 0); break;
      }
    });
  }

  function showFatalError(error) {
    console.error(error);
    const panel = $('error-panel');
    panel.hidden = false;
    panel.textContent = t(
      'The 3D scene could not start. Check that the browser has WebGL enabled.\n',
      '3D 场景无法启动，请确认浏览器已开启 WebGL。\n'
    ) + (error?.message || error);
  }

  async function init() {
    try {
      $('lang-btn')?.addEventListener('click', () => {
        lang = lang === 'zh' ? 'en' : 'zh';
        localStorage.setItem(LANG_KEY, lang);
        applyLocalizedStaticUI();
      });

      stage = FakeCashStage.createStage($('canvas-container'));
      vr = FakeCashVR.createVR(stage, {
        onVerdict: choice => evaluateChoice(choice),
        onFlip: () => stage.flipNote(),
        onTilt: () => stage.tiltTest(),
        onToggleUV: () => { stage.toggleUV(); syncUVLabel(); },
        onStatus: msg => setStatus(msg, msg),
        onControllersChanged: () => setVerdictAvailability(),
        onSessionStart: () => {
          setVerdictAvailability();
          updateGameDisplays();
          setStatus(
            'VR active · Left stick rotates · Left trigger flips · Right stick zooms · Right trigger toggles UV / confirms',
            'VR 已启动 · 左手摇杆旋转 · 左手扳机翻面 · 右手摇杆缩放 · 右手扳机开关紫外灯或确认按钮'
          );
        },
        onSessionEnd: () => {
          setVerdictAvailability();
          setStatus(
            'Exited VR · Desktop controls active',
            '已退出 VR · 已恢复桌面操作'
          );
        }
      });

      const { loaded, total } = await stage.preloadTextures(BANKNOTE_SETS);
      if (loaded < total) {
        $('asset-status').textContent = t(
          `Some RM50 textures could not load (${total - loaded} / ${total}). Placeholders are shown.`,
          `部分 RM50 钞票图片加载失败（${total - loaded} / ${total}），已显示占位纹理。`
        );
        $('asset-status').hidden = false;
      }

      stage.buildBanknote(BANKNOTE_SETS[0]);
      setupDesktopInteraction();

      const vrCheck = await vr.checkSupport();
      vrReady = vrCheck.supported;

      $('uv-btn').addEventListener('click', () => { stage.toggleUV(); syncUVLabel(); });
      $('tilt-btn').addEventListener('click', () => stage.tiltTest());
      $('flip-btn').addEventListener('click', () => stage.flipNote());
      $('zoom-in-btn').addEventListener('click', () => { stage.changeZoom(stage.ZOOM_STEP); syncZoomLabel(); });
      $('zoom-out-btn').addEventListener('click', () => { stage.changeZoom(-stage.ZOOM_STEP); syncZoomLabel(); });
      $('zoom-reset-btn').addEventListener('click', () => { stage.resetView(); syncZoomLabel(); });
      $('pass-btn').addEventListener('click', () => evaluateChoice(true));
      $('reject-btn').addEventListener('click', () => evaluateChoice(false));
      $('feedback-next-btn').addEventListener('click', advanceAfterFeedback);
      $('start-game-btn').addEventListener('click', startGame);

      $('guide-btn').addEventListener('click', () => { $('guide-drawer').hidden = !$('guide-drawer').hidden; });
      $('guide-close-btn').addEventListener('click', () => { $('guide-drawer').hidden = true; });

      $('enter-vr-btn').addEventListener('click', async () => {
        $('enter-vr-btn').disabled = true;
        $('start-game-btn').disabled = true;
        try {
          const entered = await vr.enterVR();
          if (entered && !round) startGame();
        } catch (err) {
          setStatus('Could not enter VR: ' + (err.message || err), '进入 VR 失败：' + (err.message || err));
        } finally {
          $('enter-vr-btn').disabled = false;
          $('start-game-btn').disabled = false;
        }
      });

      $('again-btn').addEventListener('click', () => {
        if (demo && booth) booth.restartDemo(window);
        else if (booth) booth.next(window);
        else location.reload();
      });

      window.addEventListener('resize', () => stage.resize());

      stage.renderer.setAnimationLoop(() => {
        stage.updateFrame();
        vr.updateFrame();
        stage.renderer.render(stage.scene, stage.camera);
      });

      initialized = true;
      applyLocalizedStaticUI();

      let snapshot = null;
      try { snapshot = booth?.snapshot(window) ?? null; } catch (error) { console.warn('Booth snapshot unavailable', error); }
      let restored = null;
      if (snapshot?.version === SNAPSHOT_VERSION) {
        try { restored = Round.restore(snapshot); } catch (error) { console.warn('Saved round ignored', error); }
      }

      if (!restored && [1, 2, 3, 4, 5].includes(snapshot?.version) && snapshot.status === 'finished') {
        $('start-overlay').hidden = true;
        $('result-title').textContent = t('Round complete', '本轮已完成');
        $('result-score').textContent = '—';
        $('review-list').hidden = true;
        $('result-overlay').hidden = false;
      } else if (restored) {
        round = restored;
        showRound();
      } else {
        $('start-game-btn').disabled = false;
        $('enter-vr-btn').disabled = false;
        if (!booth && !demo) {
          setStatus(
            'Practice mode · Open Station 1 from the booth page to save an event score.',
            '练习模式 · 请通过第 1 站展台页面打开以记录活动成绩。'
          );
        }
      }
    } catch (error) {
      showFatalError(error);
    }
  }

  window.addEventListener('load', init);
})();
