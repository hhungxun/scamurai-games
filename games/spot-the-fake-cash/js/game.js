(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const { BANKNOTE_SETS, DURATION_MS, NOTE_COUNT, SNAPSHOT_VERSION, Round } = window.FakeCashCore;
  const booth = window.parent !== window ? window.parent.ScamuraiBooth : null;
  const demo = new URLSearchParams(location.search).get('demo') === '1';

  const FEEDBACK_MS = 1700;
  const MIN_BANKNOTE_ZOOM = 1;
  const MAX_BANKNOTE_ZOOM = 2.6;
  const ZOOM_STEP = 0.15;
  const ASSET_BASE = 'assets/notes/';
  const LANG_KEY = 'scamurai.cash.lang';

  const images = new Map(); // filename -> { el, ok }
  let lang = localStorage.getItem(LANG_KEY) === 'zh' ? 'zh' : 'en';
  let round = null;
  let currentNote = null;
  let side = 'front';
  let gameTimerInterval = null;
  let feedback = null;
  let initialized = false;
  let isUVOn = true;
  let flipping = false;
  let zoom = 1;
  let pan = { x: 0, y: 0 };
  let torch = { x: 0.5, y: 0.5, visible: false };
  let refreshFullscreen = () => {};

  const I18N = {
    en: {
      intro: 'Judge ten banknotes in 120 seconds. Earn 10 points for every correct real-or-fake verdict.',
      step1: 'Shine the UV torch on the note (hover or drag) to reveal its glow pattern. Press Space to toggle UV.',
      step2: 'Flip the note (F) to check the other side, and zoom with + / − / 0, the mouse wheel or a pinch.',
      step3: 'Choose PASS for a genuine note and REJECT for a fake.',
      start: 'Start round',
      uvOn: 'UV on',
      uvOff: 'UV off',
      flip: 'Flip note',
      reset: 'Reset',
      pass: 'PASS',
      reject: 'REJECT',
      next: 'Next participant',
      playAgain: 'Play again',
      reviewHeading: 'Note review',
      roundComplete: 'Round complete',
      timeUp: 'Time is up',
      correctPlus: 'Correct · +10',
      wrongPlus: 'Wrong · +0',
      hint: 'Shine the UV torch on the note · Flip (F) to inspect the back',
      practice: 'Practice mode: open the station page to save a score for a participant.',
      saveFail: 'Progress could not be saved on this laptop: ',
      scoreFail: 'Could not send the score to the booth: ',
      startFail: 'Could not start the round: ',
      earlier: 'This round used an earlier version. The booth header shows its saved result.',
      missing: ' images missing or unreadable. Placeholders demonstrate the controls.',
      fatal: 'The game could not start. Check that the images and scripts loaded correctly.',
      genuine: 'genuine',
      fake: 'fake',
      correct: 'Correct',
      wrong: 'Wrong',
      unjudged: 'Unjudged',
      chose: 'You chose',
      fullscreenEnter: 'Enter fullscreen',
      fullscreenExit: 'Exit fullscreen',
    },
    zh: {
      intro: '在 120 秒内鉴定 10 张钞票，每正确判断一次真伪可得 10 分。',
      step1: '将紫外手电照在钞票上（悬停或拖动）以显现荧光图案，按空格键切换紫外灯。',
      step2: '按 F 翻面检查另一侧，用 + / − / 0、鼠标滚轮或双指捏合来缩放。',
      step3: '真钞选择 PASS，假钞选择 REJECT。',
      start: '开始',
      uvOn: '紫外灯开',
      uvOff: '紫外灯关',
      flip: '翻面',
      reset: '复位',
      pass: 'PASS',
      reject: 'REJECT',
      next: '下一位参与者',
      playAgain: '再玩一次',
      reviewHeading: '逐张回顾',
      roundComplete: '本轮完成',
      timeUp: '时间到',
      correctPlus: '正确 · +10',
      wrongPlus: '错误 · +0',
      hint: '把紫外手电照在钞票上 · 按 F 翻面检查背面',
      practice: '练习模式：请打开站点页面，以便为参与者保存成绩。',
      saveFail: '本机无法保存进度：',
      scoreFail: '无法将成绩发送到展台：',
      startFail: '无法开始本轮：',
      earlier: '本轮使用的是旧版本，展台页头显示其已保存的成绩。',
      missing: ' 张图片缺失或无法读取，已用占位图演示操作。',
      fatal: '游戏无法启动，请确认图片与脚本已正确加载。',
      genuine: '真钞',
      fake: '假钞',
      correct: '正确',
      wrong: '错误',
      unjudged: '未判定',
      chose: '你选了',
      fullscreenEnter: '进入全屏',
      fullscreenExit: '退出全屏',
    },
  };
  const t = key => I18N[lang][key];

  /* ── text / language ─────────────────────────────────────────────── */
  function setStatus(message) {
    $('status').textContent = message;
  }

  function setAgainLabel() {
    $('again-label').textContent = t(demo || !booth ? 'playAgain' : 'next');
  }

  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('lang-btn').textContent = lang === 'zh' ? 'EN' : '中文';
    setAgainLabel();
    applyUVState();
    refreshFullscreen();
    updateGameDisplays();
    if (feedback) {
      $('feedback-title').textContent = t(feedback.correct ? 'correctPlus' : 'wrongPlus');
      $('feedback-reason').textContent = lang === 'zh' ? feedback.note.reasonZh : feedback.note.reason;
    }
    if (round?.status === 'finished' && !$('result-overlay').hidden) showResults();
  }

  /* ── timing & HUD ────────────────────────────────────────────────── */
  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    return String(Math.floor(safe / 60)).padStart(2, '0') + ':' + String(safe % 60).padStart(2, '0');
  }

  function updateGameDisplays() {
    const timeRemaining = Math.ceil((round?.remainingMs() ?? DURATION_MS) / 1000);
    $('time-display').textContent = formatTime(timeRemaining);
    $('time-display').classList.toggle('warning', timeRemaining <= 15);
    const score = round?.score ?? 0;
    const streak = round?.streak ?? 0;
    const noteNumber = Math.min(NOTE_COUNT, (round?.index ?? 0) + (feedback ? 0 : 1));
    $('score-display').textContent = (lang === 'zh' ? '得分 ' : 'Score ') + score + ' / 100';
    $('streak-display').textContent = (lang === 'zh' ? '连对 ' : 'Streak ') + streak;
    $('note-display').textContent = (lang === 'zh' ? '第 ' : 'Note ') + noteNumber + ' / ' + NOTE_COUNT;
    setVerdictAvailability();
  }

  function setVerdictAvailability() {
    const enabled = round?.status === 'playing' && !feedback;
    $('pass-btn').disabled = !enabled;
    $('reject-btn').disabled = !enabled;
  }

  /* ── round lifecycle ─────────────────────────────────────────────── */
  function saveProgress() {
    try {
      booth?.update(window, round.snapshot());
    } catch (error) {
      setStatus(t('saveFail') + error.message);
    }
  }

  function endGame() {
    clearInterval(gameTimerInterval);
    gameTimerInterval = null;
    updateGameDisplays();
    try {
      booth?.finish(window, round.snapshot(), round.score);
    } catch (error) {
      setStatus(t('scoreFail') + error.message);
    }
    if (!feedback) showResults();
  }

  function showResults() {
    const answered = round.index;
    const accuracy = answered ? Math.round(round.correct * 100 / answered) : 0;
    $('result-title').textContent = round.endReason === 'time' ? t('timeUp') : t('roundComplete');
    $('result-score').textContent = round.score + ' / 100';
    $('result-accuracy').textContent = lang === 'zh'
      ? `${accuracy}% 准确率 · 判定 ${answered} 张中对 ${round.correct} 张 · ${NOTE_COUNT - answered} 张未判定`
      : `${accuracy}% accuracy · ${round.correct} correct out of ${answered} judged · ${NOTE_COUNT - answered} unjudged`;
    $('review-list').replaceChildren(...round.review().map(({ note, choice, correct }, i) => {
      const li = document.createElement('li');
      const num = document.createElement('span');
      num.className = 'review-num';
      num.textContent = String(i + 1) + '.';
      const body = document.createElement('div');
      body.className = 'review-body';
      const name = document.createElement('div');
      name.className = 'review-name';
      name.textContent = lang === 'zh' ? note.nameZh : note.name;
      const verdict = document.createElement('span');
      verdict.className = 'review-verdict ' + (choice === undefined ? 'unjudged' : correct ? 'correct' : 'wrong');
      verdict.textContent = choice === undefined
        ? t('unjudged')
        : (correct ? t('correct') : t('wrong')) + ' · ' + t('chose') + ' ' + (choice ? 'PASS' : 'REJECT');
      const reason = document.createElement('div');
      reason.className = 'review-reason';
      reason.textContent = lang === 'zh' ? note.reasonZh : note.reason;
      body.append(name, verdict, reason);
      li.append(num, body);
      return li;
    }));
    $('action-bar').hidden = true;
    $('result-overlay').hidden = false;
    $('result-title').focus();
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
    buildNote(round.note);
    $('action-bar').hidden = false;
    setStatus(t('hint'));
    updateGameDisplays();
    gameTimerInterval = setInterval(() => {
      if (round.expire()) endGame();
      else updateGameDisplays();
    }, 200);
  }

  function startGame() {
    if (!initialized || round) return;
    try {
      round = new Round();
      saveProgress();
      showRound();
    } catch (error) {
      console.error(error);
      round = null;
      setStatus(t('startFail') + (error.message || error));
      $('start-overlay').hidden = false;
      $('start-game-btn').disabled = false;
    }
  }

  function evaluateChoice(userChoice) {
    if (!round || feedback || round.status !== 'playing') return;
    const judgedNote = round.note;
    const result = round.answer(userChoice);
    if (!result) {
      endGame();
      return;
    }
    feedback = { correct: result.correct, note: judgedNote };
    const card = $('feedback');
    $('feedback-title').textContent = t(feedback.correct ? 'correctPlus' : 'wrongPlus');
    $('feedback-reason').textContent = lang === 'zh' ? feedback.note.reasonZh : feedback.note.reason;
    card.className = 'feedback ' + (feedback.correct ? 'correct' : 'wrong');
    card.hidden = false;
    updateGameDisplays();

    if (round.status === 'finished') endGame();
    else saveProgress();

    setTimeout(() => {
      feedback = null;
      card.hidden = true;
      if (round.status === 'finished') {
        updateGameDisplays();
        showResults();
      } else if (round.expire()) {
        endGame();
      } else {
        buildNote(round.note);
        updateGameDisplays();
      }
    }, FEEDBACK_MS);
  }

  /* ── note rendering ──────────────────────────────────────────────── */
  function imageUrl(file) { return ASSET_BASE + file; }

  function preloadImages() {
    const files = new Set();
    BANKNOTE_SETS.forEach(s => { files.add(s.front); files.add(s.back); });
    let missing = 0;
    return Promise.all([...files].map(file => new Promise(resolve => {
      const el = new Image();
      el.onload = () => { images.set(file, { el, ok: true }); resolve(); };
      el.onerror = () => { images.set(file, { el: null, ok: false }); missing += 1; resolve(); };
      el.src = imageUrl(file);
    }))).then(() => missing);
  }

  function placeholderDataUrl(noteSet) {
    const c = document.createElement('canvas');
    c.width = 1126;
    c.height = 533;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 1126, 533);
    g.addColorStop(0, '#cfe3dc');
    g.addColorStop(1, '#e9f2ef');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1126, 533);
    ctx.strokeStyle = '#337379';
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, 1102, 509);
    ctx.fillStyle = '#337379';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 130px Arial, sans-serif';
    ctx.fillText(noteSet.denomination, 563, 210);
    ctx.font = '40px Arial, sans-serif';
    ctx.fillText(noteSet.name, 563, 350);
    return c.toDataURL('image/png');
  }

  function buildNote(noteSet) {
    currentNote = noteSet;
    side = 'front';
    renderNote(true);
  }

  function renderNote(resetView) {
    if (!currentNote) return;
    const file = side === 'front' ? currentNote.front : currentNote.back;
    const img = $('note-day');
    const surface = $('note-surface');
    const canvas = $('note-uv');
    const entry = images.get(file);
    if (entry && entry.ok) {
      img.src = imageUrl(file);
      surface.style.aspectRatio = entry.el.naturalWidth + ' / ' + entry.el.naturalHeight;
      canvas.width = entry.el.naturalWidth;
      canvas.height = entry.el.naturalHeight;
    } else {
      img.src = placeholderDataUrl(currentNote);
      surface.style.aspectRatio = '1126 / 533';
      canvas.width = 1126;
      canvas.height = 533;
    }
    if (resetView) {
      zoom = 1;
      pan = { x: 0, y: 0 };
      applyTransform();
    }
    drawUVOverlay(currentNote);
    applyTorch();
  }

  function drawUVOverlay(noteSet) {
    const canvas = $('note-uv');
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    const defects = noteSet.defects || [];
    const flat = defects.some(d => d.feature === 'all' && d.how === 'none');
    if (flat) {
      ctx.fillStyle = 'rgba(10, 8, 28, 0.55)';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    ctx.fillStyle = 'rgba(28, 16, 68, 0.5)';
    ctx.fillRect(0, 0, w, h);

    const denom = noteSet.denomination.replace('RM', '');
    const wrongNumeral = defects.find(d => d.feature === 'numeral');
    const numeral = wrongNumeral ? String(wrongNumeral.value) : denom;
    const threadMissing = defects.some(d => d.feature === 'thread' && d.how === 'missing');
    const crestCopy = defects.some(d => d.feature === 'crest' && d.how === 'copy');

    // 1) glowing denomination numeral
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#c9a7ff';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#c9a7ff';
    ctx.font = `bold ${Math.round(h * 0.6)}px "Arial Black", Arial, sans-serif`;
    ctx.fillText(numeral, w * 0.22, h * 0.52);
    ctx.restore();

    // 2) vertical security thread
    if (!threadMissing) {
      ctx.save();
      const tx = w * 0.5;
      ctx.shadowColor = '#7df3ff';
      ctx.shadowBlur = 26;
      ctx.fillStyle = 'rgba(125, 243, 255, 0.92)';
      ctx.fillRect(tx - h * 0.02, 0, h * 0.04, h);
      ctx.translate(tx, h * 0.5);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#06324a';
      ctx.shadowBlur = 0;
      ctx.font = `bold ${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillText('BNM RM' + denom, 0, 0);
      ctx.restore();
    }

    // 3) crest emblem
    ctx.save();
    const cx = w * 0.82;
    const cy = h * 0.3;
    const cr = h * 0.16;
    if (crestCopy) {
      ctx.shadowColor = '#ff8b8b';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = '#ff7b7b';
      ctx.lineWidth = h * 0.02;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ff7b7b';
      ctx.font = `bold ${Math.round(h * 0.13)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', cx, cy);
    } else {
      ctx.shadowColor = '#c9a7ff';
      ctx.shadowBlur = 28;
      ctx.fillStyle = 'rgba(201, 167, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3a2560';
      ctx.font = `bold ${Math.round(cr * 1.1)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', cx, cy + h * 0.01);
    }
    ctx.restore();

    // 4) fluorescent fibres
    ctx.save();
    const cols = ['#8eff9e', '#ff9e9e', '#9ec9ff', '#ffe28a'];
    for (let i = 0; i < 42; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const len = h * (0.03 + Math.random() * 0.06);
      const ang = Math.random() * Math.PI;
      ctx.strokeStyle = cols[i % cols.length];
      ctx.lineWidth = Math.max(1, h * 0.006);
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── UV torch ────────────────────────────────────────────────────── */
  function applyUVState() {
    $('uv-label').textContent = t(isUVOn ? 'uvOn' : 'uvOff');
    $('uv-btn').setAttribute('aria-pressed', String(isUVOn));
    applyTorch();
  }

  function toggleUVLight() {
    isUVOn = !isUVOn;
    applyUVState();
  }

  function applyTorch() {
    const uv = $('note-uv');
    const on = isUVOn && torch.visible && round && round.status === 'playing' && currentNote;
    uv.classList.toggle('on', on);
    if (on) {
      const px = (torch.x * 100).toFixed(2);
      const py = (torch.y * 100).toFixed(2);
      const mask = `radial-gradient(circle at ${px}% ${py}%, #000 0%, #000 9%, transparent 27%)`;
      uv.style.maskImage = mask;
      uv.style.webkitMaskImage = mask;
    } else {
      uv.style.maskImage = 'none';
      uv.style.webkitMaskImage = 'none';
    }
  }

  function clearBeam() {
    const beam = $('beam');
    beam.getContext('2d').clearRect(0, 0, beam.width, beam.height);
  }

  function drawBeam(pt) {
    const beam = $('beam');
    const frame = $('note-frame');
    if (beam.width !== frame.clientWidth || beam.height !== frame.clientHeight) {
      beam.width = frame.clientWidth;
      beam.height = frame.clientHeight;
    }
    const ctx = beam.getContext('2d');
    const w = beam.width;
    const h = beam.height;
    ctx.clearRect(0, 0, w, h);
    const cx = pt.x;
    const cy = pt.y;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
    glow.addColorStop(0, 'rgba(190, 140, 255, 0.5)');
    glow.addColorStop(0.5, 'rgba(168, 85, 247, 0.22)');
    glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.fill();

    const ox = w / 2;
    const oy = h;
    const dx = cx - ox;
    const dy = cy - oy;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const half = 24 + dist * 0.16;
    const grad = ctx.createLinearGradient(ox, oy, cx, cy);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.05)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.32)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(cx + -uy * half, cy + ux * half);
    ctx.lineTo(cx - -uy * half, cy - ux * half);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(210, 170, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  /* ── flip & zoom ─────────────────────────────────────────────────── */
  function flipNote() {
    if (flipping || !round || round.status !== 'playing' || feedback) return;
    flipping = true;
    const el = $('note-flip');
    el.style.transform = 'scaleX(0)';
    setTimeout(() => {
      side = side === 'front' ? 'back' : 'front';
      renderNote(false);
      el.style.transform = 'scaleX(1)';
      setTimeout(() => { flipping = false; }, 190);
    }, 95);
  }

  function clampPan() {
    const max = 520;
    pan.x = Math.min(max, Math.max(-max, pan.x));
    pan.y = Math.min(max, Math.max(-max, pan.y));
  }

  function applyTransform() {
    clampPan();
    $('note-pan-zoom').style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  }

  function setZoom(level) {
    zoom = Math.min(MAX_BANKNOTE_ZOOM, Math.max(MIN_BANKNOTE_ZOOM, level));
    applyTransform();
  }

  function changeZoom(amount) {
    setZoom(zoom + amount);
  }

  /* ── pointer / torch interaction ─────────────────────────────────── */
  function setupInteraction() {
    const frame = $('note-frame');
    const pointers = new Map();
    let pinchStart = null;

    const framePoint = e => {
      const r = frame.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const noteLocal = e => {
      const s = $('note-surface').getBoundingClientRect();
      if (!s.width || !s.height) return { x: 0.5, y: 0.5 };
      return {
        x: Math.min(1, Math.max(0, (e.clientX - s.left) / s.width)),
        y: Math.min(1, Math.max(0, (e.clientY - s.top) / s.height)),
      };
    };
    const pinchDist = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    frame.addEventListener('wheel', event => {
      event.preventDefault();
      changeZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    }, { passive: false });

    frame.addEventListener('pointermove', event => {
      const prev = pointers.get(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      torch.visible = true;
      const local = noteLocal(event);
      torch.x = local.x;
      torch.y = local.y;
      drawBeam(framePoint(event));
      applyTorch();

      if (pointers.size === 2) {
        const dist = pinchDist();
        if (pinchStart && pinchStart.dist > 0) setZoom(pinchStart.zoom * dist / pinchStart.dist);
        return;
      }
      if (prev && pointers.size === 1 && zoom > 1 && (event.buttons & 1)) {
        pan.x += event.clientX - prev.x;
        pan.y += event.clientY - prev.y;
        applyTransform();
      }
    });

    frame.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      frame.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) pinchStart = { zoom, dist: pinchDist() };
      torch.visible = true;
      const local = noteLocal(event);
      torch.x = local.x;
      torch.y = local.y;
      drawBeam(framePoint(event));
      applyTorch();
    });

    const stopPointer = event => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchStart = null;
      if (pointers.size === 0) {
        torch.visible = false;
        clearBeam();
        applyTorch();
      }
    };
    frame.addEventListener('pointerup', stopPointer);
    frame.addEventListener('pointercancel', stopPointer);
    frame.addEventListener('lostpointercapture', stopPointer);
    frame.addEventListener('pointerleave', () => {
      if (pointers.size === 0) {
        torch.visible = false;
        clearBeam();
        applyTorch();
      }
    });
    window.addEventListener('blur', () => {
      pointers.clear();
      pinchStart = null;
      torch.visible = false;
      clearBeam();
      applyTorch();
    });
  }

  /* ── keyboard & fullscreen ───────────────────────────────────────── */
  function handleKey(event) {
    if (!round || round.status !== 'playing' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
    switch (event.code) {
      case 'Space': if (!event.repeat) toggleUVLight(); break;
      case 'KeyF': if (!event.repeat) flipNote(); break;
      case 'KeyP':
      case 'ArrowLeft': if (!event.repeat) evaluateChoice(true); break;
      case 'KeyR':
      case 'ArrowRight': if (!event.repeat) evaluateChoice(false); break;
      case 'Equal':
      case 'NumpadAdd': changeZoom(ZOOM_STEP); break;
      case 'Minus':
      case 'NumpadSubtract': changeZoom(-ZOOM_STEP); break;
      case 'Digit0':
      case 'Numpad0': setZoom(1); break;
      case 'ArrowUp':
      case 'KeyW': if (zoom > 1) { pan.y -= 40; applyTransform(); } break;
      case 'ArrowDown':
      case 'KeyS': if (zoom > 1) { pan.y += 40; applyTransform(); } break;
      case 'KeyA': if (zoom > 1) { pan.x -= 40; applyTransform(); } break;
      case 'KeyD': if (zoom > 1) { pan.x += 40; applyTransform(); } break;
    }
  }

  function setupFullscreen() {
    const btn = $('fullscreen-btn');
    const update = () => {
      const active = Boolean(document.fullscreenElement);
      btn.textContent = active ? '⤢' : '⛶';
      btn.setAttribute('aria-label', active ? t('fullscreenExit') : t('fullscreenEnter'));
    };
    refreshFullscreen = update;
    if (!document.fullscreenEnabled) btn.hidden = true;
    btn.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch (error) { /* user gesture or support issue — ignore */ }
    });
    document.addEventListener('fullscreenchange', update);
    update();
  }

  /* ── boot ────────────────────────────────────────────────────────── */
  function showFatalError(error) {
    console.error(error);
    const panel = $('error-panel');
    panel.hidden = false;
    panel.textContent = t('fatal') + '\n' + (error.message || error);
  }

  function wireControls() {
    $('flip-btn').addEventListener('click', flipNote);
    $('uv-btn').addEventListener('click', toggleUVLight);
    $('pass-btn').addEventListener('click', () => evaluateChoice(true));
    $('reject-btn').addEventListener('click', () => evaluateChoice(false));
    $('zoom-in-btn').addEventListener('click', () => changeZoom(ZOOM_STEP));
    $('zoom-out-btn').addEventListener('click', () => changeZoom(-ZOOM_STEP));
    $('zoom-reset-btn').addEventListener('click', () => setZoom(1));
    $('start-game-btn').addEventListener('click', startGame);
    $('lang-btn').addEventListener('click', () => {
      lang = lang === 'zh' ? 'en' : 'zh';
      localStorage.setItem(LANG_KEY, lang);
      applyLang();
    });
    $('again-btn').addEventListener('click', () => {
      if (demo && booth) booth.restartDemo(window);
      else if (booth) booth.next(window);
      else location.reload();
    });
  }

  async function init() {
    try {
      if (!window.FakeCashCore) throw new Error('The game data could not load.');
      const missing = await preloadImages();
      if (missing) {
        const status = $('asset-status');
        status.hidden = false;
        status.textContent = missing + t('missing');
      }
      setupFullscreen();
      setupInteraction();
      wireControls();
      window.addEventListener('keydown', handleKey);
      applyLang();
      initialized = true;

      let snapshot = null;
      try {
        snapshot = booth?.snapshot(window) ?? null;
      } catch (error) {
        console.warn('Booth snapshot unavailable', error);
      }
      let restored = null;
      if (snapshot?.version === SNAPSHOT_VERSION) {
        try { restored = Round.restore(snapshot); } catch (error) { console.warn('Saved round ignored', error); }
      }
      if (!restored && [1, 2].includes(snapshot?.version) && snapshot.status === 'finished') {
        $('start-overlay').hidden = true;
        $('result-title').textContent = t('roundComplete');
        $('result-accuracy').textContent = t('earlier');
        $('review-list').previousElementSibling.hidden = true;
        $('review-list').hidden = true;
        $('result-overlay').hidden = false;
      } else if (restored) {
        round = restored;
        showRound();
      } else {
        $('start-game-btn').disabled = false;
        if (!booth && !demo) setStatus(t('practice'));
      }
    } catch (error) {
      showFatalError(error);
    }
  }

  window.addEventListener('load', init);
})();
