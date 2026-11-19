(function () {
  "use strict";
  const main = document.querySelector("#main");
  const announcer = document.querySelector("#announcer");
  const host = window.parent !== window ? window.parent.ScamuraiBooth : null;
  const demo = !host || host.demo;
  const settings = {...window.GAME_CONFIG, roundQuestions:demo ? window.GAME_CONFIG.practiceQuestions : window.GAME_CONFIG.roundQuestions};
  const questionCount = settings.roundQuestions;
  const pointsPerEmail = 100 / questionCount;
  const save = () => { if (host) host.update(window, round.snapshot()); };
  const referenceDialog = document.querySelector("#reference-dialog");
  const icons = {
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
  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  }
  function label(kind) { return kind === "phishing" ? "Phishing" : kind === "legitimate" ? "Legitimate" : "Unanswered"; }
  const formatClock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  let round, ticker = null, transition = null, locked = false, page = "welcome", lastAnnouncement = null, emailObserver = null;

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
  function resetGame(initial = false) {
    if (!initial && host) { host.next(window); return; }
    clearWork();
    let saved = initial && host ? host.snapshot(window) : null;
    if (demo && saved && saved.version !== 3) {
      if(host.restartDemo)host.restartDemo(window);else window.parent.location.reload();
      return;
    }
    if (saved && (saved.version !== 3 && !(saved.version === 2 && saved.status !== 'finished'))) {
      main.innerHTML='<section class="setup-error"><h1>This exercise has been updated.</h1><p>This tab contains an earlier Round. Its saved score stays unchanged. Use Next participant if it is saved, or ask the Game Master to cancel an unfinished Round before starting the new exercise.</p></section>';
      return;
    }
    round = saved ? GameCore.Round.restore(window.EMAIL_BANK,settings,saved,{now:makeClock()}) : new GameCore.Round(window.EMAIL_BANK, settings, { now: makeClock() });
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
          <p class="hero-subtitle">Can you tell what's real<br class="desktop-break"> and what's a scam?</p>
          <p class="hero-description">Inspect the sender, actual destination and requested action, then choose Legitimate or Phishing. Your choice submits immediately.</p>
          <div class="round-facts" aria-label="Round details">
            <div>${icon("mail")}<span><strong>${questionCount} emails</strong><small>One inbox challenge</small></span></div>
            <div>${icon("clock")}<span><strong>${esc(settings.roundSeconds)} seconds</strong><small>One shared timer</small></span></div>
            <div>${icon("trophy")}<span><strong>100 points</strong><small>A perfect score</small></span></div>
          </div>
          <button class="button primary start-button" id="start-game" type="button">Start Game ${icon("arrow")}</button>
          <p class="scoring-note">${questionCount} emails · +${pointsPerEmail} for a correct classification, −${pointsPerEmail} for a wrong classification. Unanswered: 0. Final score cannot go below 0. ${demo ? "Unscored demo: no event result is saved." : "Your best completed Station 3 score counts."}</p>
          <p class="start-note">Use Verify independently when you need the service record. Checking is free; the timer keeps running. A familiar sender alone proves nothing.</p>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="art-grid"></div>
          <div class="art-topline"><span class="art-live-dot"></span> A LITTLE PAUSE. A SMARTER CLICK.</div>
          <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
          <div class="floating-chip chip-top">${icon("eye")} Look a little closer</div>
          <div class="illustrated-email back-email"></div>
          <div class="illustrated-email front-email">
            <div class="illustration-toolbar"><span></span><span></span><span></span><b>YOUR INBOX</b></div>
            <div class="illustration-mail-header"><div class="illustration-avatar">${icon("mail")}</div><div><div class="skeleton-line wide"></div><div class="skeleton-line short"></div></div><span class="illustration-question">?</span></div>
            <div class="illustration-lines"><div></div><div></div><div></div></div>
            <div class="illustration-link"><span></span>${icon("arrow")}</div>
            <div class="magnifier"><div class="magnifier-inner">${icon("shield")}</div><span></span></div>
          </div>
          <div class="floating-chip chip-bottom">${icon("lock")} Your best defence? Paying attention.</div>
          <div class="art-caption"><span>01 / OBSERVE</span><span>02 / DECIDE</span><span>03 / LEARN</span></div>
        </div>
      </section>
      <section class="how-to" aria-label="How to play"><div class="how-to-label">A quick game.<br><strong>A useful habit.</strong></div>
        <div class="how-step"><span class="step-number">01</span><div><h2>Read the email</h2><p>Check the sender, the message<br>and what it asks you to do.</p></div></div>
        <div class="how-step"><span class="step-number">02</span><div><h2>Make your call</h2><p>Choose Legitimate or Phishing.<br>Your choice records the answer.</p></div></div>
        <div class="how-step"><span class="step-number">03</span><div><h2>See the signs</h2><p>Get your score and review<br>the clues when the round ends.</p></div></div>
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
      <div class="sender-row"><span class="sender-avatar">${esc(initials)}</span><div class="sender-details"><div><strong>${esc(email.senderName)}</strong><span class="sender-address">&lt;${highlighted(email.senderEmail,'sender',email,review,'sender')}&gt;</span></div><small>to ${esc(email.recipient||'student@xmum.example')}</small></div></div>
      <div class="email-body" ${review?'':'tabindex="0" role="region" aria-label="Email message; scroll to read the full text"'}>${email.body.map((block,i)=>{
        if(block.type==='link') {
          if(review)return `<div class="email-link-block"><span class="simulated-link">${highlighted(block.text,'body',email,true,'body:'+i)}</span><span class="link-destination review-destination"><small>ACTUAL SIMULATED DESTINATION</small>${highlighted(block.url,'body',email,true,'destination:'+i)}</span></div>`;
          const did=`destination-${email.id}-${i}-play`;
          return `<div class="email-link-block" data-link-inspector><div class="link-controls"><button class="simulated-link" type="button" data-inspect-link aria-expanded="false" aria-controls="${did}">${esc(block.text)} ${icon('arrow')}</button><button class="inspect-link" type="button" data-inspect-link aria-expanded="false" aria-controls="${did}" aria-label="Inspect destination for ${esc(block.text)}">${icon('eye')} <span>Inspect link</span></button></div><span id="${did}" class="link-destination" role="note" hidden><small>SIMULATED DESTINATION</small><span class="destination-url">${esc(block.url)}</span><span class="destination-note">Inspection only. Nothing will open.</span></span></div>`;
        }
        return `<div class="message-detail ${block.type==='detail'?'email-detail':block.type==='attachment'?'simulated-attachment':''}">${block.type==='attachment'?icon('paperclip'):''}<span>${highlighted(block.text,'body',email,review,'body:'+i)}</span></div>`;
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
  function renderEmail() {
    if (page !== "playing") return;
    const email = round.questions[round.index];
    main.className = "game-screen";
    main.innerHTML = `
      <div class="game-topbar"><div><span class="eyebrow">THE INBOX CHALLENGE</span><p>Email <strong>${round.index + 1}</strong> of ${round.questions.length} <span class="topbar-divider">/</span> Make your call.</p></div>
        <div class="timer" id="timer" role="timer" aria-live="off" aria-label="Time remaining">${icon("clock")}<div><small>TIME LEFT</small><strong id="timer-value">${formatClock(Math.ceil(round.remainingMs() / 1000))}</strong></div><span class="timer-unit">shared across<br>all ${round.questions.length} emails</span></div>
      </div>
      <div class="game-workspace">${progressRail()}<section class="message-area" aria-label="Current email">
        <div class="verification-tools"><button id="verify-independent" type="button" aria-expanded="${round.verified[round.index]}">${icon('shield')} Verify independently</button><span>Optional · no deduction · timer continues</span></div><div id="verification-record" ${round.verified[round.index]?'':'hidden'}>${caseContext(email)}</div><article class="email-card"><div class="email-toolbar"><span>${icon("mail")} Message</span><span>SIMULATED EMAIL</span></div>${emailContent(email)}<div class="email-training-note">${icon("info")} Hover or tap links to inspect. No sites or files will open.<span class="scroll-hint" hidden>Scroll to read more ${icon("chevron")}</span></div></article>
        <div class="decision-heading"><h2>Is this request legitimate for this case?</h2><span>Choose one to continue ${icon("arrow")}</span></div>
        <div class="answer-buttons">
          <button class="answer-button legitimate-button" type="button" data-answer="legitimate" data-question="${esc(email.id)}">${icon("shield")}<span><strong>LEGITIMATE</strong><small>This request is appropriate.</small></span><kbd>L</kbd></button>
          <button class="answer-button phishing-button" type="button" data-answer="phishing" data-question="${esc(email.id)}">${icon("flag")}<span><strong>PHISHING</strong><small>This request is deceptive or unsafe.</small></span><kbd>P</kbd></button>
        </div>
        <p class="answer-hint">${icon('lock')} Answers are revealed after the round. <span><kbd>L</kbd>/<kbd>P</kbd> answers immediately</span></p>
      </section></div>`;
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
    // when the full bank exceeds the available height on a booth laptop.
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
  function submitAnswer(questionId, classification) {
    if (page !== "playing" || locked) return;
    if (!round.answer(questionId,classification)) {
      if (round.status === "finished") showResults();
      return;
    }
    try { save(); } catch (error) { storageFailure(error); return; }
    locked = true;
    main.querySelectorAll("[data-answer]").forEach(button => {
      button.disabled = true;
      if (button.dataset.answer === round.answers[round.index-1]?.classification) button.classList.add("answer-recorded");
    });
    announce("Answer recorded.");
    if (round.status === "finished") {
      showResults();
      return;
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
  function showResults() {
    if (page !== "playing" || round.status !== "finished") return;
    clearWork();
    page = "results";
    document.body.dataset.screen = page;
    const results = round.results();
    if (host) host.finish(window,round.snapshot(),results.score);
    const [title, message] = performanceMessage(results);
    main.className = "results-screen";
    main.innerHTML = `
      <div class="results-topline"><span class="eyebrow">THE INBOX CHALLENGE / ROUND COMPLETE</span><button class="button primary new-player" type="button">${icon("refresh")} New Player</button></div>
      <section class="results-hero"><div class="score-circle" style="--score-angle:${results.score / results.maximum * 360}deg"><div><strong>${results.score}<span>/ ${results.maximum}</span></strong><small>YOUR SCORE</small></div></div><div class="results-copy"><span class="completion-label">${icon(results.correct === results.reviews.length ? "trophy" : "shield")} ${results.endReason === "timeout" ? "Time's up. Let's find the clues." : "Inbox checked. A little more awareness."}</span><h1 tabindex="-1">${title}</h1><p>${message}</p><div class="result-stats"><div><strong>${results.answered}</strong><small>Emails answered / ${questionCount}</small></div><div><strong>${(results.accuracy * 100).toFixed(1)}<span>%</span></strong><small>Label accuracy (${results.correct} right, ${results.incorrect} wrong)</small></div><div><strong>${results.timeUsed.toFixed(1)}<span>s</span></strong><small>Time used of ${esc(settings.roundSeconds)}s</small></div></div><p class="score-breakdown">${results.correct} correct × ${pointsPerEmail} − ${results.incorrect} wrong × ${pointsPerEmail} = <strong>${results.score} / 100</strong> (minimum 0). Unanswered emails earn 0. ${demo ? 'Demo only — this does not affect the event leaderboard.' : 'The same displayed score is submitted to your event record.'}</p></div></section>
      ${results.unanswered ? `<div class="timeout-note">${icon("clock")} ${results.unanswered} email${results.unanswered === 1 ? " was" : "s were"} unanswered. Unanswered emails earn no points; wrong answers deduct ${pointsPerEmail} each.${results.answered ? "" : " No answers means zero points."}</div>` : ""}
      <section class="answer-review" aria-labelledby="review-title"><div class="review-heading"><div><span class="eyebrow">THE DETAILS MAKE THE DIFFERENCE</span><h2 id="review-title">Review Answers</h2></div><span>Open an email to see the clues ${icon("chevron")}</span></div>${results.reviews.map(reviewCard).join("")}</section>
      <div class="takeaway"><span class="takeaway-icon">${icon("shield")}</span><div><strong>A familiar look is a clue. It isn't a guarantee.</strong><p>Sender addresses can be spoofed and genuine accounts compromised. Urgency, payment amounts and attachments do not automatically mean phishing. Inspect actual destinations, check permission requests, and verify through a known app, bookmark or contact. Never share passwords, PINs or one-time codes. The .example ending is used for every training message and is not a warning sign.</p></div></div>
      <div class="results-bottom"><p>One smarter click can make a difference.</p><button class="button primary new-player" type="button">${icon("refresh")} New Player ${icon("arrow")}</button></div>`;
    main.querySelectorAll(".new-player").forEach(button => button.addEventListener("click", () => resetGame()));
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
  try { resetGame(true); }
  catch (error) {
    main.innerHTML = `<div class="setup-error"><h1>Let's check the game files.</h1><p>${esc(error.message)}</p><p>See README.md for the question bank and settings format, then reload this page.</p></div>`;
  }
})();
