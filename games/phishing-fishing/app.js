(function () {
  "use strict";
  const main = document.querySelector("#main");
  const announcer = document.querySelector("#announcer");
  const host = window.parent !== window ? window.parent.ScamuraiBooth : null;
  const demo = !host || host.demo;
  const settings = window.GAME_CONFIG;
  // Demo/standalone only: merge the local answer key back in for judging. Event rounds get
  // verdicts from the server, so the shipped emails.js carries no classifications.
  if (demo && window.EMAIL_DEMO_ANSWERS) {
    for (const email of window.EMAIL_BANK) {
      const c = window.EMAIL_DEMO_ANSWERS[email.id];
      if (c) email.classification = c;
    }
  }
  const questionCount = settings.roundQuestions;
  const pointsPerEmail = 100 / questionCount;
  const save = () => { if (host) host.update(window, round.snapshot()); };
  const referenceDialog = document.querySelector("#reference-dialog");
  const icons = {
    fish: '<path d="M3 12s4-6 10-6c4 0 7 6 7 6s-3 6-7 6c-6 0-10-6-10-6Zm0 0L1 7v10l2-5Zm10-6c-3 3-3 9 0 12"/><circle cx="16" cy="11" r=".8"/>',
    escapedFish: '<path d="M9 12c3-3 5-5 8-5s5 3 6 5c-1 2-3 5-6 5s-5-2-8-5Zm0 0L5 8v8l4-4ZM2 9H.9M3 12H1m1 3H.9"/><circle cx="19" cy="11" r=".8"/>',
    safeMail: '<path d="M11 19H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v5M2.5 6.5l9 6 9-6"/><circle cx="17.5" cy="17.5" r="5"/><path d="m15.4 17.5 1.4 1.4 2.8-2.8"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="m12 3-8 3v6c0 5 8 9 8 9s8-4 8-9V6Z"/><path d="m8.5 11.5 2.5 2.5 4.5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flag: '<path d="M5 21V4m0 0c4-4 10 4 14 0v11c-4 4-10-4-14 0"/>',
    expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    collapse: '<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    paperclip: '<path d="m8 13 7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L12 3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    cross: '<path d="m6 6 12 12M6 18 18 6"/>',
    trophy: '<path d="M8 3h8v5c0 5-8 5-8 0V3Zm0 1H4v3c0 3 4 3 4 3m8-6h4v3c0 3-4 3-4 3m-4 2v6m-4 3h8m-4-3v3"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>'
  };
  function icon(name, cls = "") {
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.mail}</svg>`;
  }
  const catchIcons = { caught: 'fish', safe: 'safeMail', escaped: 'escapedFish', miscast: 'fish', untouched: 'mail' };
  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  }
  function label(kind) { return kind === "phishing" ? "Phishing" : kind === "legitimate" ? "Legitimate" : "Unanswered"; }
  const formatClock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  let round, ticker = null, transition = null, locked = false, page = "welcome", lastAnnouncement = null, emailObserver = null, showingResults = false;

  // Monotonic time during normal use, with a wall-clock fallback for laptop sleep.
  function makeClock() {
    const wallOrigin = Date.now(), monoOrigin = performance.now();
    return () => wallOrigin + Math.max(performance.now() - monoOrigin, Date.now() - wallOrigin);
  }
  function clearWork() {
    if (referenceDialog.open) referenceDialog.close();
    clearInterval(ticker);
    clearTimeout(transition);
    ticker = transition = null;
    locked = false;
    lastAnnouncement = null;
    emailObserver?.disconnect();
    emailObserver = null;
  }
  function focusHeading() {
    const heading = main.querySelector("h1");
    if (heading) heading.focus({ preventScroll: true });
  }
  function announce(text) { announcer.textContent = text; }
  async function resetGame(initial = false) {
    if (!initial && host) { host.next(window); return; }
    clearWork();
    let saved = initial && host ? host.snapshot(window) : null;
    const currentFormat = [3, 4].includes(saved?.version);
    if (demo && saved && !currentFormat) {
      if(host.restartDemo)host.restartDemo(window);else window.parent.location.reload();
      return;
    }
    if (saved && !currentFormat && !(saved.version === 2 && saved.status !== 'finished')) {
      main.innerHTML='<section class="setup-error"><h1>This exercise has been updated.</h1><p>This tab contains an earlier Round. Its saved score stays unchanged. Use Next participant if it is saved, or ask the Game Master to cancel an unfinished Round before starting the new exercise.</p></section>';
      return;
    }
    try {
      if (saved) {
        round = GameCore.Round.restore(window.EMAIL_BANK,settings,saved,{now:makeClock()});
      } else if (host && !demo) {
        const deal = await host.deal(window);
        const questions = deal.ids.map(id => window.EMAIL_BANK.find(e => e.id === id)).filter(Boolean);
        if (questions.length !== deal.ids.length) throw new Error('This round draws emails missing from this build. Ask the Game Master to cancel the Round.');
        round = new GameCore.Round(window.EMAIL_BANK, settings, { questions, now: makeClock() });
      } else {
        round = new GameCore.Round(window.EMAIL_BANK, settings, { now: makeClock() });
      }
    } catch (error) {
      // Old practice deals can restart, including those that used the full bank.
      if (saved && demo && host) { host.restartDemo(window); return; }
      throw error;
    }
    if (round.status !== 'ready') {
      page = 'playing'; document.body.dataset.screen = page;
      if (round.status === 'finished' || round.expire()) { showResults(); return; }
      renderEmail(); ticker = setInterval(tick,100); tick(); return;
    }
    page = "welcome";
    document.body.dataset.screen = page;
    renderWelcome();
    if (!initial) {
      window.scrollTo(0, 0);
      focusHeading();
      announce("Ready for a new player. Previous answers and timer cleared.");
    }
  }
  function renderWelcome() {
    main.className = "welcome-screen";
    main.innerHTML = `
      <section class="welcome-hero">
        <div class="hero-copy">
          <span class="eyebrow"><span class="tiny-line"></span> THE INBOX CHALLENGE</span>
          <h1 tabindex="-1">Phishing<br><span>Fishing</span><span class="title-dot">.</span></h1>
          <p class="hero-subtitle">Catch the scams.<br>Let safe mail swim.</p>
          <p class="hero-description">Inspect the sender, actual destination and requested action, then choose Legitimate or Phishing. Your choice submits immediately.</p>
          <div class="round-facts" aria-label="Round details">
            <div>${icon("mail")}<span><strong>${questionCount} emails</strong><small>One inbox challenge</small></span></div>
            <div>${icon("clock")}<span><strong>${esc(settings.roundSeconds)} seconds</strong><small>One shared timer</small></span></div>
            <div>${icon("trophy")}<span><strong>100 points</strong><small>A perfect score</small></span></div>
          </div>
          <button class="button primary start-button" id="start-game" type="button">Start Game ${icon("arrow")}</button>
          <p class="scoring-note">${questionCount} emails · ${pointsPerEmail} points per correct answer. Wrong and unanswered emails earn 0 points. ${demo ? "Unscored demo: no event result is saved." : "Your best completed Station 3 score counts."}</p>
          <p class="start-note">Use Verify independently when you need the service record. Checking is free; the timer keeps running. A familiar sender alone proves nothing.</p>
        </div>
        <div class="hero-art fishing-hero" aria-hidden="true">
          <div class="art-grid"></div>
          <div class="art-topline"><span class="art-live-dot"></span> THE INBOX IS THE POND.</div>
          <div class="fishing-hero-word">TAKE<br>THE BAIT?</div>
          <svg class="pond-art" viewBox="0 0 540 440" fill="none">
            <path class="pond-rod" d="M505 340V80Q210 20 167 110"/>
            <path class="pond-line" d="M167 110v105q0 27 19 27t19-27v-9"/>
            <path class="pond-water" d="M0 277q34-14 68 0t68 0 68 0 68 0 68 0 68 0 68 0 68 0M0 310q34-10 68 0t68 0 68 0 68 0 68 0 68 0 68 0 68 0"/>
            <g class="pond-envelope"><rect x="131" y="153" width="72" height="49" rx="3"/><path d="m132 157 35 24 35-24"/></g>
            <g class="pond-fish"><path d="M72 345q55-47 112 0-57 47-112 0l-23 21v-42l23 21Z"/><circle cx="160" cy="342" r="3"/><path d="M129 324q-16 21 0 42"/></g>
            <g class="pond-fish pond-fish-small"><path d="M310 385q37-31 76 0-39 31-76 0l-17 15v-30l17 15Z"/><circle cx="371" cy="382" r="2.5"/></g>
            <circle class="pond-bubble" cx="230" cy="332" r="5"/><circle class="pond-bubble" cx="246" cy="353" r="3"/>
          </svg>
          <div class="art-caption"><span>01 / READ</span><span>02 / INSPECT</span><span>03 / REEL</span></div>
        </div>
      </section>
      <section class="how-to" aria-label="How to play"><div class="how-to-label">A quick game.<br><strong>A useful habit.</strong></div>
        <div class="how-step"><span class="step-number">01</span><div><h2>Read the email</h2><p>Check the sender, the message<br>and what it asks you to do.</p></div></div>
        <div class="how-step"><span class="step-number">02</span><div><h2>Make your call</h2><p>Choose Legitimate or Phishing.<br>Your choice records the answer.</p></div></div>
        <div class="how-step"><span class="step-number">03</span><div><h2>Check your catch</h2><p>Reveal your fish and field badges,<br>then learn from every email.</p></div></div>
      </section>`;
    document.querySelector("#start-game").addEventListener("click", startGame);
  }
  function startGame() {
    if (page !== "welcome" || !round.start()) return;
    try { save(); } catch (error) { storageFailure(error); return; }
    page = "playing";
    document.body.dataset.screen = page;
    renderEmail();
    ticker = setInterval(tick, 100);
    tick();
  }
  function progressRail() {
    return `<aside class="round-sidebar" aria-label="Round progress">
      <div class="sidebar-title">${icon("mail")} Your inbox <span>${round.questions.length}</span></div>
      <ol class="email-progress">${round.questions.map((_, i) => {
        const done = round.answers[i] !== null, active = i === round.index;
        return `<li class="${done ? "answered" : active ? "current" : "pending"}" ${active ? 'aria-current="step"' : ""}><span class="progress-icon">${done ? icon("check") : icon("mail")}</span><span><strong>Email ${String(i + 1).padStart(2, "0")}</strong><small>${done ? "Answer recorded" : active ? "Reading now" : "Up next"}</small></span>${active ? '<span class="current-dot"></span>' : ""}</li>`;
      }).join("")}</ol>
      <div class="sidebar-reminder">${icon("eye")}<h2>Take a closer look.</h2><p>The sender, the destination and the request all tell a story.</p><div class="reminder-line"></div><p>Your answers stay private until the round ends.</p></div>
      <span class="sidebar-simulation">${icon("lock")} Safe training environment</span>
    </aside>`;
  }
  function highlighted(value, target, email, review, evidenceId) {
    if (!review) return esc(value);
    const clues = email.indicators.filter(ind => ind.target === target).map(ind => ind.text).sort((a, b) => b.length - a.length);
    if (!clues.length) return esc(value);
    // Escape all data and highlight literal matches; no email HTML is executed.
    const decisive = email.acceptedEvidence.includes(evidenceId);
    const pattern = new RegExp(clues.map(text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
    let result = "", offset = 0;
    for (const match of value.matchAll(pattern)) {
      result += esc(value.slice(offset, match.index)) + `<mark class="${decisive ? email.classification === "phishing" ? "risk-mark" : "trust-mark" : "context-mark"}" title="${decisive ? "Decisive clue" : "Contextual clue: not sufficient alone"}">${esc(match[0])}</mark>`;
      offset = match.index + match[0].length;
    }
    return result + esc(value.slice(offset));
  }
  function caseContext(email,review=false) {
    return `<aside class="case-context" aria-label="Independent verification record"><div><strong>INDEPENDENT SERVICE RECORD</strong><span>${esc(email.context.source)}</span></div><ul>${email.context.facts.map((fact,i)=>`<li>${esc(fact)} </li>`).join('')}</ul></aside>`;
  }
  function emailContent(email, review = false) {
    const initials=email.senderName.split(/\s+/).slice(0,2).map(word=>word[0]).join('');
    return `<div class="email-heading"><span class="inbox-tag">Inbox</span><h${review?'4':'1'} ${review?'':'tabindex="-1"'}>${highlighted(email.subject,'subject',email,review,'subject')}</h${review?'4':'1'}></div>
      <div class="sender-row"><span class="sender-avatar">${esc(initials)}</span><div class="sender-details"><div><strong>${esc(email.senderName)}</strong><span class="sender-address">&lt;${highlighted(email.senderEmail,'sender',email,review,'sender')}&gt;</span></div><small>to ${esc(email.recipient||'student@xmum.edu.my')}</small></div></div>
      <div class="email-body" ${review?'':'tabindex="0" role="region" aria-label="Email message; scroll to read the full text"'}>${email.body.map((block,i)=>{
        const bodyId = 'body:' + i, destinationId = 'destination:' + i;
        if (block.type === 'banner') {
          const variant = ['alert','warn','info','success','neutral','prize'].includes(block.variant) ? block.variant : 'info';
          const subtext = block.subtext ? `<small>${highlighted(block.subtext,'body',email,review,bodyId)}</small>` : '';
          return `<div class="email-banner banner-${variant}"><strong>${highlighted(block.text,'body',email,review,bodyId)}</strong>${subtext}</div>`;
        }
        if (block.type === 'button') {
          if (review) return `<div class="email-link-block"><span class="simulated-link">${highlighted(block.text,'body',email,true,bodyId)}</span><span class="link-destination review-destination"><small>ACTUAL SIMULATED DESTINATION</small>${highlighted(block.url,'body',email,true,destinationId)}</span></div>`;
          const did=`destination-${email.id}-${i}-play`;
          return `<div class="email-link-block email-action" data-link-inspector><div class="link-controls"><button class="email-action-button" type="button" data-inspect-link aria-expanded="false" aria-controls="${did}"><span>${esc(block.text)}</span>${icon('arrow')}</button><button class="inspect-link" type="button" data-inspect-link aria-expanded="false" aria-controls="${did}" aria-label="Inspect destination for ${esc(block.text)}">${icon('eye')} <span>Inspect link</span></button></div><span id="${did}" class="link-destination" role="note" hidden><small>SIMULATED DESTINATION</small><span class="destination-url">${esc(block.url)}</span><span class="destination-note">Inspection only. Nothing will open.</span></span></div>`;
        }
        if (block.type === 'link') {
          if (review) return `<div class="email-link-block"><span class="simulated-link">${highlighted(block.text,'body',email,true,bodyId)}</span><span class="link-destination review-destination"><small>ACTUAL SIMULATED DESTINATION</small>${highlighted(block.url,'body',email,true,destinationId)}</span></div>`;
          const did=`destination-${email.id}-${i}-play`;
          return `<div class="email-link-block" data-link-inspector><div class="link-controls"><button class="simulated-link" type="button" data-inspect-link aria-expanded="false" aria-controls="${did}">${esc(block.text)} ${icon('arrow')}</button><button class="inspect-link" type="button" data-inspect-link aria-expanded="false" aria-controls="${did}" aria-label="Inspect destination for ${esc(block.text)}">${icon('eye')} <span>Inspect link</span></button></div><span id="${did}" class="link-destination" role="note" hidden><small>SIMULATED DESTINATION</small><span class="destination-url">${esc(block.url)}</span><span class="destination-note">Inspection only. Nothing will open.</span></span></div>`;
        }
        if (block.type === 'footer') {
          return `<div class="email-footer">${highlighted(block.text,'body',email,review,bodyId)}</div>`;
        }
        return `<div class="message-detail ${block.type==='detail'?'email-detail':block.type==='attachment'?'simulated-attachment':''}">${block.type==='attachment'?icon('paperclip'):''}<span>${highlighted(block.text,'body',email,review,bodyId)}</span></div>`;
      }).join('')}</div>`;
  }
  function bindLinkInspectors() {
    main.querySelectorAll("[data-link-inspector]").forEach(block => {
      let pinned = false;
      const destination = block.querySelector(".link-destination");
      const controls = block.querySelectorAll("[data-inspect-link]");
      function show(visible) {
        destination.hidden = !visible;
        controls.forEach(button => button.setAttribute("aria-expanded", String(visible)));
        block.querySelector(".inspect-link span").textContent = pinned ? "Hide destination" : "Inspect link";
        block.closest(".email-body").dispatchEvent(new Event("scroll"));
      }
      controls.forEach(button => button.addEventListener("click", () => {
        pinned = !pinned;
        show(pinned);
      }));
      block.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") show(true); });
      block.addEventListener("pointerleave", () => { if (!pinned && !block.contains(document.activeElement)) show(false); });
      block.addEventListener("focusin", () => show(true));
      block.addEventListener("focusout", event => { if (!pinned && !block.contains(event.relatedTarget)) show(false); });
      block.addEventListener("keydown", event => {
        if (event.key === "Escape") { pinned = false; show(false); event.stopPropagation(); }
      });
    });
  }
  function renderGameTopbar() {
    main.innerHTML = `
      <div class="game-topbar"><div><span class="eyebrow">THE INBOX CHALLENGE</span><p>Email <strong id="email-number"></strong> of ${round.questions.length}</p></div>
        <div class="fishing-cast" aria-hidden="true">
          <span class="fishing-water">
            <span class="fishing-ripple"></span>
            <span class="fishing-rig"><span class="fishing-hook"></span><span class="fishing-mail">${icon('mail')}</span></span>
          </span>
          <span class="cast-feedback">Reeling in…</span>
        </div>
        <div class="timer" id="timer" role="timer" aria-live="off" aria-label="Time remaining">${icon("clock")}<div><small>TIME LEFT</small><strong id="timer-value">${formatClock(Math.ceil(round.remainingMs() / 1000))}</strong></div><span class="timer-unit">shared across<br>all ${round.questions.length} emails</span></div>
      </div>`;
    const rig = main.querySelector('.fishing-rig');
    const resetReel = () => rig.closest('.fishing-cast').classList.remove('is-reeling');
    rig.addEventListener('animationend', resetReel);
    rig.addEventListener('animationcancel', resetReel);
  }
  function renderEmail() {
    if (page !== "playing") return;
    const email = round.questions[round.index];
    main.className = "game-screen";
    // Keep the top bar mounted so the hook can finish moving as the next email opens.
    if (!main.querySelector('.game-topbar')) renderGameTopbar();
    main.querySelector('#email-number').textContent = round.index + 1;
    main.querySelector('.game-workspace')?.remove();
    main.insertAdjacentHTML('beforeend', `
      <div class="game-workspace">${progressRail()}<section class="message-area" aria-label="Current email">
        <div class="verification-tools"><button id="verify-independent" type="button" aria-expanded="${round.verified[round.index]}">${icon('shield')} Verify independently</button><span>Optional · no deduction · timer continues</span></div><div id="verification-record" ${round.verified[round.index]?'':'hidden'}>${caseContext(email)}</div><article class="email-card"><div class="email-toolbar"><span>${icon("mail")} Message</span><span>SIMULATED EMAIL</span></div>${emailContent(email)}<div class="email-training-note">${icon("info")} Hover or tap links to inspect. No sites or files will open.<span class="scroll-hint" hidden>Scroll to read more ${icon("chevron")}</span></div></article>
        <div class="decision-heading"><h2>Is this request legitimate for this case?</h2><span>Choose one to continue ${icon("arrow")}</span></div>
        <div class="answer-buttons">
          <button class="answer-button legitimate-button" type="button" data-answer="legitimate" data-question="${esc(email.id)}">${icon("shield")}<span><strong>LEGITIMATE</strong><small>This request is appropriate.</small></span><kbd>L</kbd></button>
          <button class="answer-button phishing-button" type="button" data-answer="phishing" data-question="${esc(email.id)}">${icon("flag")}<span><strong>PHISHING</strong><small>This request is deceptive or unsafe.</small></span><kbd>P</kbd></button>
        </div>
        <p class="answer-hint">${icon('lock')} Answers are revealed after the round. <span><kbd>L</kbd>/<kbd>P</kbd> answers immediately</span></p>
      </section></div>`);
    main.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => submitAnswer(button.dataset.question,button.dataset.answer)));
    main.querySelector('#verify-independent').onclick=()=>{
      if(round.verify(email.id)) {
        try { save(); } catch(error) { storageFailure(error); return; }
        const record=main.querySelector('#verification-record');record.hidden=!record.hidden;
        main.querySelector('#verify-independent').setAttribute('aria-expanded',String(!record.hidden));
      }
    };
    bindLinkInspectors();
    // A newly rendered rail starts at the top; keep the current step visible
    // when the progress rail exceeds the available height on a booth laptop.
    const rail = main.querySelector(".round-sidebar");
    const currentStep = rail.querySelector('[aria-current="step"]');
    if (currentStep.getBoundingClientRect().bottom > rail.getBoundingClientRect().bottom) {
      rail.scrollTop += currentStep.getBoundingClientRect().bottom - rail.getBoundingClientRect().bottom + 8;
    }
    const progress = rail.querySelector(".email-progress");
    progress.scrollLeft = Math.max(0, currentStep.offsetLeft - progress.offsetLeft - (progress.clientWidth - currentStep.offsetWidth) / 2);
    emailObserver?.disconnect();
    const messageBody = main.querySelector(".email-card .email-body");
    const scrollHint = main.querySelector(".scroll-hint");
    const syncScrollHint = () => {
      scrollHint.hidden = messageBody.scrollHeight - messageBody.clientHeight - messageBody.scrollTop < 4;
    };
    messageBody.addEventListener("scroll", syncScrollHint, { passive: true });
    emailObserver = new ResizeObserver(syncScrollHint);
    emailObserver.observe(messageBody);
    syncScrollHint();
    focusHeading();
    announce(`Email ${round.index + 1} of ${round.questions.length}. ${email.subject}`);
  }
  async function submitAnswer(questionId, classification) {
    if (page !== "playing" || locked) return;
    locked = true;
    if (!round.answer(questionId,classification)) {
      locked = false;
      if (round.status === "finished") showResults();
      return;
    }
    if (host && !demo) {
      try { await host.answer(window, questionId, classification); }
      catch (error) { announce("Could not reach the server. Your answer will be re-sent if possible."); }
    }
    try { save(); } catch (error) { storageFailure(error); return; }
    main.querySelectorAll("[data-answer]").forEach(button => {
      button.disabled = true;
      if (button.dataset.answer === round.answers[round.index-1]?.classification) button.classList.add("answer-recorded");
    });
    announce("Answer recorded.");
    if (round.status === "finished") {
      showResults();
      return;
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      main.querySelector('.fishing-cast').classList.add('is-reeling');
    }
    // Keep the old question locked long enough to absorb double clicks/key repeats.
    transition = setTimeout(() => {
      transition = null;
      if (page !== "playing") return;
      if (round.expire()) { showResults(); return; }
      locked = false;
      renderEmail();
      tick();
    }, 320);
  }
  function tick() {
    if (page !== "playing") return;
    if (round.expire()) { showResults(); return; }
    const remaining = Math.ceil(round.remainingMs() / 1000);
    const timer = document.querySelector("#timer");
    document.querySelector("#timer-value").textContent = formatClock(remaining);
    timer.classList.toggle("timer-urgent", remaining <= 10);
    timer.setAttribute("aria-label", `${remaining} seconds remaining, shared across all ${round.questions.length} emails`);
    if ([30, 10, 5].includes(remaining) && remaining !== lastAnnouncement) {
      lastAnnouncement = remaining;
      announce(`${remaining} seconds remaining.`);
    }
  }
  function performanceMessage(results) {
    if (!results.answered) return ["Ready to give it a go?", "No answers were recorded. Review the clues, then try a new round."];
    if (results.correct === results.answered) return [
      results.unanswered ? "A sharp eye. Keep it going." : "An inbox detective in the making.",
      results.unanswered ? "Every email you answered was correct. Try keeping that accuracy while checking more messages." : "You spotted every email correctly. Keep checking the details beyond the game."
    ];
    return [
      ["A good place to start.", "Explore the review below and practise spotting the risky requests."],
      ["You're building your radar.", "Every clue you learn makes the next suspicious email easier to recognise."],
      ["Your instincts are taking shape.", "A few small details made the difference. Take a look at the clues below."],
      ["You've got a sharp eye.", "Good accuracy. Review the details that slipped through and try again."]
    ][Math.min(3,Math.floor((results.correct / results.answered) * 4))];
  }
  function reviewCard(review, i) {
    const {email,answer,correct}=review;
    return `<details class="review-card" ${!correct?'open':''}><summary><span class="review-status ${correct?'correct':answer?'incorrect':'unanswered'}">${icon(correct?'check':answer?'cross':'clock')}</span><span class="review-summary"><span class="review-overline">EMAIL ${String(i+1).padStart(2,'0')} · ${esc(email.difficulty)}</span><strong>${esc(email.subject)}</strong><span class="review-answer-line">Your answer: <b>${label(answer)}</b> · Correct: <b class="classification-${email.classification}">${label(email.classification)}</b></span></span><span class="result-badge ${correct?'correct':answer?'incorrect':'unanswered'}">${correct?'Correct':answer?'Incorrect':'Unanswered'}</span>${icon('chevron','review-chevron')}</summary>
    <div class="review-content"><div class="review-explanation"><span class="explanation-label">${email.classification==='phishing'?'Why this request is phishing':'Why this request is legitimate in this case'}</span><p>${esc(email.explanation)}</p>${caseContext(email,true)}<dl class="decision-reasoning"><dt>Decisive clues</dt><dd>${esc(email.reasoning.evidence)}</dd><dt>Why not ${email.classification==='phishing'?'Legitimate':'Phishing'}?</dt><dd>${esc(email.reasoning.contrast)}</dd><dt>Safe next step</dt><dd>${esc(email.reasoning.nextStep)}</dd></dl><ul class="clue-list">${email.indicators.map(ind=>`<li><strong>${esc(ind.text)}</strong><p>${esc(ind.explanation)}</p></li>`).join('')}</ul></div><article class="review-email ${email.classification==='phishing'?'review-risk':'review-trust'}" aria-label="Email ${i+1} with highlighted clues">${emailContent(email,true)}</article></div></details>`;
  }
  function storageFailure(error) {
    clearWork(); page='error';
    main.innerHTML=`<section class="setup-error"><h1>Keep this tab open.</h1><p>Your laptop could not preserve this Round: ${esc(error.message)}. Ask the Game Master to cancel it before another participant starts.</p></section>`;
  }
  function catchReport(results) {
    const report = FishingCatch.summarize(results.reviews);
    return `<section class="catch-report" aria-labelledby="catch-title">
      <div class="catch-heading"><div><span class="eyebrow">THE DAY'S FISHING REPORT</span><h2 id="catch-title">Your catch.</h2></div><p>Choose a card to open its email explanation.</p></div>
      <dl class="catch-counts">${Object.entries(report.counts).map(([outcome, count])=>`<div class="catch-count ${outcome}"><dt>${FishingCatch.outcomes[outcome]}</dt><dd>${count}</dd></div>`).join('')}</dl>
      <div class="catch-net" aria-label="Email catches">${report.catches.map(item=>`<button type="button" class="catch-fish ${item.outcome}" data-review-index="${item.index}" aria-controls="review-${item.index}" aria-label="Email ${item.index+1}: ${esc(item.email.subject)}. ${item.title}. Open explanation.">${icon(catchIcons[item.outcome], 'catch-symbol')}<span><strong>${String(item.index+1).padStart(2,'0')}</strong><small>${item.title}</small></span>${icon('chevron')}</button>`).join('')}</div>
      <div class="field-badges" aria-label="Earned field badges"><h3>Field badges</h3>${report.badges.length ? `<ul>${report.badges.map(badge=>`<li>${icon('shield')}<div><strong>${badge.title}</strong><p>${badge.detail} <span>${badge.count} caught.</span></p></div></li>`).join('')}</ul>` : '<p>No badges this round. Catch a scam to earn a badge for the trick you spotted.</p>'}<p class="badge-note">Badges celebrate what you spotted. Your score is shown above.</p></div>
    </section>`;
  }
  async function showResults() {
    if (showingResults || page !== "playing" || round.status !== "finished") return;
    showingResults = true;
    clearWork();
    // Finish first so the server closes and scores the round, then fetch the review.
    if (host) { try { await host.finish(window, round.snapshot(), 0); } catch (e) {} }
    if (host && !demo) {
      try {
        const res = await host.review(window);
        for (const r of (res && res.review) || []) {
          const email = round.questions.find(q => q.id === r.id);
          if (email) email.classification = r.classification;
        }
      } catch (e) { /* keep going; review cards fall back to unanswered */ }
    }
    page = "results";
    document.body.dataset.screen = page;
    const results = round.results();
    const [title, message] = performanceMessage(results);
    const earned = `${results.correct} correct × ${results.pointsPerEmail}`;
    const finalScore = `<strong>${results.score} / ${results.maximum}</strong>`;
    const scoreBreakdown = results.wrongAnswerPenalty
      ? `Previous scoring rules: ${earned} − ${results.incorrect} wrong × ${results.wrongAnswerPenalty} = ${results.rawScore}. Final score: ${finalScore} (minimum 0).`
      : `${earned} = ${finalScore}. Wrong and unanswered emails earn 0 points.`;
    main.className = "results-screen";
    main.innerHTML = `
      <div class="results-topline"><span class="eyebrow">THE INBOX CHALLENGE / ROUND COMPLETE</span><button class="button primary new-player" type="button">${icon("refresh")} New Player</button></div>
      <section class="results-hero"><div class="score-circle" style="--score-angle:${results.score / results.maximum * 360}deg"><div><strong>${results.score}<span>/ ${results.maximum}</span></strong><small>YOUR SCORE</small></div></div><div class="results-copy"><span class="completion-label">${icon(results.correct === results.reviews.length ? "trophy" : "shield")} ${results.endReason === "timeout" ? "Time's up. Let's find the clues." : "Inbox checked. A little more awareness."}</span><h1 tabindex="-1">${title}</h1><p>${message}</p><div class="result-stats"><div><strong>${results.answered}</strong><small>Emails answered / ${questionCount}</small></div><div><strong>${(results.accuracy * 100).toFixed(1)}<span>%</span></strong><small>Label accuracy (${results.correct} right, ${results.incorrect} wrong)</small></div><div><strong>${results.timeUsed.toFixed(1)}<span>s</span></strong><small>Time used of ${esc(settings.roundSeconds)}s</small></div></div><p class="score-breakdown">${scoreBreakdown} ${demo ? 'Practice score only.' : 'The displayed score counts toward your event result.'}</p></div></section>
      ${results.unanswered ? `<div class="timeout-note">${icon("clock")} ${results.unanswered} email${results.unanswered === 1 ? " was" : "s were"} unanswered.</div>` : ""}
      ${catchReport(results)}
      <section class="answer-review" aria-labelledby="review-title"><div class="review-heading"><div><span class="eyebrow">THE DETAILS MAKE THE DIFFERENCE</span><h2 id="review-title">Review Answers</h2></div><span>Open an email to see the clues ${icon("chevron")}</span></div>${results.reviews.map(reviewCard).join("")}</section>
      <div class="takeaway"><span class="takeaway-icon">${icon("shield")}</span><div><strong>A familiar look is a clue. It isn't a guarantee.</strong><p>Sender addresses can be spoofed and genuine accounts compromised. Urgency, payment amounts and attachments do not automatically mean phishing. Inspect actual destinations, check permission requests, and verify through a known app, bookmark or contact. Never share passwords, PINs or one-time codes. Match every actual destination against the institution's real domain: a lookalike such as maybank2u-verify.com is not maybank2u.com.my.</p></div></div>
      <div class="results-bottom"><p>One smarter click can make a difference.</p><button class="button primary new-player" type="button">${icon("refresh")} New Player ${icon("arrow")}</button></div>`;
    main.querySelectorAll(".new-player").forEach(button => button.addEventListener("click", () => resetGame()));
    main.querySelectorAll('.review-card').forEach((card, index) => { card.id = `review-${index}`; });
    main.querySelectorAll('[data-review-index]').forEach(button => button.addEventListener('click', () => {
      const card = document.getElementById(`review-${button.dataset.reviewIndex}`);
      card.open = true;
      card.querySelector('summary').focus({ preventScroll: true });
      card.scrollIntoView({ block: 'start' });
    }));
    window.scrollTo(0, 0);
    focusHeading();
    announce(`Round complete. Score ${results.score} out of ${results.maximum}. ${results.answered} answered, ${results.correct} correct, ${results.incorrect} incorrect, ${results.unanswered} unanswered. Accuracy ${(results.accuracy * 100).toFixed(1)} percent. Review answers below.`);
  }

  document.addEventListener("keydown", event => {
    if (page !== "playing" || referenceDialog.open || locked || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    const key = event.key.toLowerCase();
    if (key !== "l" && key !== "p") return;
    event.preventDefault();
    submitAnswer(round.questions[round.index]?.id,key === "l" ? "legitimate" : "phishing");
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  window.addEventListener("pageshow", tick);

  document.querySelector("#domain-reference").innerHTML = window.DOMAIN_REFERENCE.map(item => `<div class="reference-institution"><h3>${esc(item.name)}</h3><code>${esc(item.domain)}</code><p>${esc(item.pattern)}</p></div>`).join("");
  document.querySelector("#open-reference").addEventListener("click", () => referenceDialog.showModal());
  document.querySelector("#close-reference").addEventListener("click", () => referenceDialog.close());

  const fullscreen = document.querySelector("#fullscreen");
  fullscreen.innerHTML = icon("expand");
  if (!document.fullscreenEnabled) fullscreen.hidden = true;
  fullscreen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) { announce("Full screen is unavailable. Use your browser's F11 shortcut instead."); }
  });
  document.addEventListener("fullscreenchange", () => {
    const active = Boolean(document.fullscreenElement);
    fullscreen.innerHTML = icon(active ? "collapse" : "expand");
    fullscreen.setAttribute("aria-label", active ? "Exit full screen" : "Enter full screen");
  });
  // The brand is a real home control; reset in-place without refreshing the page.
  document.querySelector(".brand").addEventListener("click", event => {
    event.preventDefault();
    if (page === "playing") return; // Protect a live participant's round.
    resetGame();
  });
  resetGame(true).catch(error => {
    main.innerHTML = `<div class="setup-error"><h1>Let's check the game files.</h1><p>${esc(error.message)}</p><p>See README.md for the question bank and settings format, then reload this page.</p></div>`;
  });
})();
