(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const Core = window.FakeCashCore;
  const host = window.parent !== window ? window.parent.ScamuraiBooth : null;
  const demo = !host || host.demo;
  const toolButtons = [...document.querySelectorAll('[data-tool].button')];

  const tools = {
    tilt: {
      title: 'TILT',
      guide: 'Tilt the sample. A glossy stripe should change appearance as the angle changes.',
      lesson: 'Tilt the note. BNM shows a gold stripe with RM10 on the fourth-series RM10 when tilted.',
      pass: 'The stripe changed from dull to bright as you tilted it.'
    },
    light: {
      title: 'HOLD TO LIGHT',
      guide: 'Switch on the backlight. Look for a watermark and see if the two marks line up.',
      lesson: 'Hold a paper note to white light. On the fourth-series RM10, look for a portrait watermark and the numeral 10, plus a separate numeral 10 formed by the see-through register.',
      pass: 'The watermark appeared and the two halves lined up.'
    },
    uv: {
      title: 'UV LAMP',
      guide: 'Turn on the UV lamp. Look for a glowing mark against a dark background.',
      lesson: 'Use UV to check selected features. BNM shows a red-and-yellow Rafflesia with the numeral 10 on the fourth-series RM10. The paper itself should stay dark.',
      pass: 'The marked area glowed while the background stayed dark.'
    },
    magnifier: {
      title: 'MAGNIFIER',
      guide: 'Magnify the tiny print. Check whether the letters are sharp and readable.',
      lesson: 'Use a magnifier. Genuine micro-lettering should be clearly readable under magnification.',
      pass: 'The tiny letters became clear and readable under magnification.'
    },
    feel: {
      title: 'FEEL',
      guide: 'Drag the probe across the print. Check for raised ridges.',
      lesson: 'Feel for raised ink on the portrait and text. Bank Negara Malaysia describes this raised effect as intaglio printing.',
      pass: 'The probe detected raised ridges across the print.'
    }
  };
  const faultClues = {
    stripe: 'The stripe stayed the same shade when tilted.',
    watermark: 'No watermark appeared against the light.',
    register: 'The two halves of the see-through mark failed to line up.',
    glow: 'The background glowed under UV instead of staying dark.',
    motif: 'The UV mark was missing.',
    microprint: 'The tiny letters stayed blurred under the magnifier.',
    relief: 'The print felt flat across the whole strip.'
  };
  const dateOrigin = Date.now();
  const timeOrigin = performance.now();
  const now = () => Math.max(Date.now(), dateOrigin + performance.now() - timeOrigin);

  let round;
  let ticker;
  let page = 'home';
  let awaitingNext = false;
  let sample;
  let tool;
  let active;

  function write(id, text) {
    if ($(id).textContent !== text) $(id).textContent = text;
  }

  function show(id) {
    page = id;
    for (const screen of ['home', 'game', 'result', 'error']) $(screen).hidden = screen !== id;
    window.scrollTo(0, 0);
  }

  function fail(error) {
    clearInterval(ticker);
    write('error-message', 'The laptop could not preserve this round. Ask the Game Master to check the station. ' + error.message);
    show('error');
  }

  function sendState() {
    if (!host) return true;
    try {
      if (round.status === 'finished') host.finish(window, round.snapshot(), round.score);
      else host.update(window, round.snapshot());
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  }

  function toggleEvidence(id, visible) {
    $(id).hidden = !visible;
  }

  function renderEvidence() {
    const fault = name => sample.faults.includes(name);
    const position = Number($('trace').value);
    const traceTool = tool === 'tilt' || tool === 'feel';
    $('viewer').dataset.tool = tool;
    $('viewer').dataset.active = active;
    toggleEvidence('trace-label', traceTool);
    toggleEvidence('trace', traceTool);
    toggleEvidence('tool-switch', !traceTool);
    toggleEvidence('stripe', tool === 'tilt');
    toggleEvidence('relief', tool === 'feel');
    toggleEvidence('light-pattern', tool === 'light' && active);
    toggleEvidence('uv-pattern', tool === 'uv' && active);
    toggleEvidence('microprint', tool === 'magnifier');
    toggleEvidence('inactive', (tool === 'light' || tool === 'uv') && !active);

    $('stripe').classList.toggle('fault', fault('stripe'));
    $('stripe').style.setProperty('--angle', (position - 50) * 0.5 + 'deg');
    $('stripe').style.setProperty('--position', position + '%');
    $('stripe').style.setProperty('--saturation', 0.35 + position / 110);
    $('relief').classList.toggle('fault', fault('relief'));
    $('relief').style.setProperty('--position', position + '%');
    $('relief').style.setProperty('--probe-y', (fault('relief') ? 50 : 50 + Math.sin(position * 0.6) * 25) + '%');
    $('watermark').classList.toggle('fault', fault('watermark'));
    $('register').classList.toggle('fault', fault('register'));
    $('uv-pattern').classList.toggle('fault', fault('glow'));
    $('uv-symbol').hidden = fault('motif');
    $('microprint').classList.toggle('enlarged', active);
    $('microprint').classList.toggle('fault', fault('microprint'));

    $('tool-switch').setAttribute('aria-pressed', String(active));
    write('tool-switch', { light: 'Backlight', uv: 'UV lamp', magnifier: 'Magnify' }[tool] || '');
    write('trace-label', tool === 'tilt' ? 'Tilt angle' : 'Trace the print');
    write('inactive', tool === 'light' ? 'Backlight is off' : 'UV lamp is off');

    const states = {
      tilt: position === 0 ? 'Starting view. Move the slider to compare.'
        : fault('stripe') ? 'The shade stays the same.'
          : position < 55 ? 'A muted sheen is visible.' : 'A bright gold sheen is visible.',
      light: active
        ? (fault('watermark') ? 'No watermark. ' : 'A watermark is visible. ')
          + (fault('register') ? 'The two halves are offset.' : 'The two halves meet.')
        : 'Turn on the backlight to inspect the marks.',
      uv: active
        ? (fault('glow') ? 'The background glows. ' : 'The background stays dark. ')
          + (fault('motif') ? 'No bright mark is visible.' : 'A bright mark is visible.')
        : 'Turn on the UV lamp to inspect the sample.',
      magnifier: active
        ? fault('microprint') ? 'Lettering remains blurred.' : 'Lettering is crisp and readable.'
        : 'Magnify the sample to read the fine print.',
      feel: position === 0 ? 'Move the probe to trace the surface.'
        : fault('relief') ? 'The probe moves smoothly across flat print.' : 'The probe bumps over raised ridges.'
    };
    write('observation', states[tool]);
  }

  function selectTool(name) {
    if (tool === name) return;
    tool = name;
    active = false;
    $('trace').value = 0;
    for (const button of toolButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
    }
    write('tool-title', tools[tool].title);
    write('guide', tools[tool].guide);
    renderEvidence();
  }

  function updateHud() {
    const seconds = Math.ceil(round.remainingMs() / 1000);
    write('timer', `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`);
    $('timer').classList.toggle('urgent', seconds <= 10);
    write('correct', String(round.correct));
    $('progress').value = round.index;
  }

  function tick() {
    updateHud();
    if (round.expire() && sendState()) showResult();
  }

  function renderSample() {
    sample = round.cases[round.index];
    awaitingNext = false;
    tool = null;
    selectTool(sample.focus);
    write('sample-count', `${round.index + 1} / ${Core.CASE_COUNT}`);
    $('feedback').hidden = true;
    $('real').disabled = false;
    $('fake').disabled = false;
    $('question').focus();
  }

  function play() {
    show('game');
    renderSample();
    ticker = setInterval(tick, 100);
    tick();
  }

  function explanation(item) {
    return item.faults.length ? item.faults.map(fault => faultClues[fault]).join(' ') : tools[item.focus].pass;
  }

  function choose(choice) {
    if (page !== 'game' || awaitingNext) return;
    const result = round.answer(choice);
    if (!result) {
      if (sendState()) showResult();
      return;
    }

    awaitingNext = true;
    $('real').disabled = true;
    $('fake').disabled = true;
    $('feedback').hidden = false;
    $('feedback').classList.toggle('wrong', !result.correct);
    const label = Core.verdict(sample).toUpperCase();
    write('feedback-title', result.correct ? `Correct · ${label}` : `Incorrect · ${label}`);
    write('feedback-body', explanation(sample));
    const complete = round.status === 'finished';
    write('next', complete ? 'See score' : 'Next sample');
    $('next').focus();
    updateHud();
    if (complete) clearInterval(ticker);
    sendState();
  }

  function showResult() {
    clearInterval(ticker);
    show('result');
    write('result-title', round.endReason === 'time' ? 'TIME’S UP!' : 'INSPECTION COMPLETE');
    write('score', String(round.score));
    write('result-correct', String(round.correct));
    write('result-wrong', String(round.index - round.correct));
    write('result-unanswered', String(Core.CASE_COUNT - round.index));
    $('review').hidden = round.index === 0;
    const entries = round.answers.map((choice, index) => {
      const item = round.cases[index];
      const entry = document.createElement('li');
      entry.textContent = `You chose ${choice.toUpperCase()}. Sample: ${Core.verdict(item).toUpperCase()}. ${explanation(item)}`;
      return entry;
    });
    $('review-list').replaceChildren(...entries);
    $('result-title').focus();
  }

  function advance() {
    if (round.status === 'finished') showResult();
    else if (round.expire()) {
      if (sendState()) showResult();
    } else renderSample();
  }

  for (const { lesson } of Object.values(tools)) {
    const li = document.createElement('li');
    li.textContent = lesson;
    $('lessons').append(li);
  }
  for (const button of toolButtons) button.onclick = () => selectTool(button.dataset.tool);
  $('trace').oninput = renderEvidence;
  $('tool-switch').onclick = () => {
    active = !active;
    renderEvidence();
  };
  $('start').onclick = () => {
    round = new Core.Round({ now });
    if (sendState()) play();
  };
  $('real').onclick = () => choose('real');
  $('fake').onclick = () => choose('fake');
  $('next').onclick = advance;
  $('again').onclick = () => {
    try {
      if (host && demo) host.restartDemo(window);
      else if (host) host.next(window);
      else location.reload();
    } catch (error) {
      fail(error);
    }
  };
  if (demo) write('again', 'Play again');

  document.addEventListener('keydown', event => {
    if (page !== 'game' || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    const shortcut = { t: 'tilt', l: 'light', u: 'uv', m: 'magnifier', f: 'feel' }[key];
    if (shortcut) {
      event.preventDefault();
      selectTool(shortcut);
      ($('trace').hidden ? $('tool-switch') : $('trace')).focus();
    } else if (key === '1' || key === '2') {
      event.preventDefault();
      choose(key === '1' ? 'real' : 'fake');
    }
  });

  try {
    const snapshot = host?.snapshot(window);
    if (!snapshot) return;
    round = Core.Round.restore(snapshot, { now });
    if (round.status === 'finished' || round.expire()) {
      if (sendState()) showResult();
    } else play();
  } catch (error) {
    fail(error);
  }
})();
