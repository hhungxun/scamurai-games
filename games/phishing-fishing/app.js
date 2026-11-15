(function () {
  "use strict";
  const main = document.querySelector("#main");
  const announcer = document.querySelector("#announcer");
  const settings = window.GAME_CONFIG;
  const questionCount = window.EMAIL_BANK.length;
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
    return () => Math.max(performance.now() - monoOrigin, Date.now() - wallOrigin);
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
    clearWork();
    round = new GameCore.Round(window.EMAIL_BANK, settings, { now: makeClock() });
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
          <p class="hero-description">Some messages deserve your trust. Others want to take advantage of it. Take a closer look and put your instincts to the test.</p>
          <div class="round-facts" aria-label="Round details">
            <div>${icon("mail")}<span><strong>${questionCount} emails</strong><small>One inbox challenge</small></span></div>
            <div>${icon("clock")}<span><strong>${esc(settings.roundSeconds)} seconds</strong><small>One shared timer</small></span></div>
            <div>${icon("trophy")}<span><strong>100 points</strong><small>A perfect score</small></span></div>
          </div>
          <button class="button primary start-button" id="start-game" type="button">Start Game ${icon("arrow")}</button>
          <p class="scoring-note">Aim for ${settings.targetAnswers} answers in ${esc(settings.roundSeconds)} seconds. Accuracy ${settings.accuracyWeight}% + participation ${settings.participationWeight}%; both build up as you approach the target. ${settings.targetAnswers} correct answers can earn 100 points. You do not need to finish all ${questionCount} emails.</p>
          <p class="start-note">Hover or tap a link to inspect it. “How to verify” has the fictional domains.</p>
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
        <div class="how-step"><span class="step-number">02</span><div><h2>Make your call</h2><p>Choose Legitimate or Phishing.<br>All ${questionCount} share the same timer.</p></div></div>
        <div class="how-step"><span class="step-number">03</span><div><h2>See the signs</h2><p>Get your score and review<br>the clues when the round ends.</p></div></div>
      </section>`;
    document.querySelector("#start-game").addEventListener("click", startGame);
  }
  function startGame() {
    if (page !== "welcome" || !round.start()) return;
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
  function highlighted(value, target, email, review) {
    if (!review) return esc(value);
    const clues = email.indicators.filter(ind => ind.target === target).map(ind => ind.text).sort((a, b) => b.length - a.length);
    if (!clues.length) return esc(value);
    // Escape all data and highlight literal matches; no email HTML is executed.
    const pattern = new RegExp(clues.map(text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
    let result = "", offset = 0;
    for (const match of value.matchAll(pattern)) {
      result += esc(value.slice(offset, match.index)) + `<mark class="${email.classification === "phishing" ? "risk-mark" : "trust-mark"}">${esc(match[0])}</mark>`;
      offset = match.index + match[0].length;
    }
    return result + esc(value.slice(offset));
  }
  function emailContent(email, review = false) {
    const initials = email.senderName.split(/\s+/).slice(0, 2).map(word => word[0]).join("");
    return `<div class="email-heading"><span class="inbox-tag">Inbox</span><h${review ? "4" : "1"} ${review ? "" : 'tabindex="-1"'}>${highlighted(email.subject, "subject", email, review)}</h${review ? "4" : "1"}></div>
      <div class="sender-row"><span class="sender-avatar">${esc(initials)}</span><div class="sender-details"><div><strong>${esc(email.senderName)}</strong><span class="sender-address">&lt;${highlighted(email.senderEmail, "sender", email, review)}&gt;</span></div><small>to ${esc(email.recipient || "student@xmum.example")}</small></div></div>
      <div class="email-body" ${review ? "" : 'tabindex="0" role="region" aria-label="Email message; scroll to read the full text"'}>${email.body.map((block, blockIndex) => {
        if (block.type === "link") {
          const destinationId = `destination-${email.id}-${blockIndex}-${review ? "review" : "play"}`;
          if (review) return `<div class="email-link-block"><span class="simulated-link">${highlighted(block.text, "body", email, true)} ${icon("arrow")}</span><span class="link-destination review-destination"><small>ACTUAL SIMULATED DESTINATION</small>${highlighted(block.url, "body", email, true)}</span></div>`;
          return `<div class="email-link-block" data-link-inspector><div class="link-controls"><button class="simulated-link" type="button" data-inspect-link aria-expanded="false" aria-controls="${esc(destinationId)}">${esc(block.text)} ${icon("arrow")}</button><button class="inspect-link" type="button" data-inspect-link aria-expanded="false" aria-controls="${esc(destinationId)}" aria-label="Inspect destination for ${esc(block.text)}">${icon("eye")} <span>Inspect link</span></button></div><span id="${esc(destinationId)}" class="link-destination" role="note" aria-live="polite" hidden><small>SIMULATED DESTINATION</small><span class="destination-url">${esc(block.url)}</span><span class="destination-note">Inspection only. Nothing will open.</span></span></div>`;
        }
        if (block.type === "attachment") return `<div class="simulated-attachment">${icon("paperclip")}<span>${highlighted(block.text, "body", email, review)}</span></div>`;
        return `<${block.type === "detail" ? 'div class="email-detail"' : "p"}>${highlighted(block.text, "body", email, review)}</${block.type === "detail" ? "div" : "p"}>`;
      }).join("")}</div>`;
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
        <article class="email-card"><div class="email-toolbar"><span>${icon("mail")} Message</span><span>SIMULATED EMAIL</span></div>${emailContent(email)}<div class="email-training-note">${icon("info")} Hover or tap links to inspect. No sites or files will open.<span class="scroll-hint" hidden>Scroll to read more ${icon("chevron")}</span></div></article>
        <div class="decision-heading"><h2>Would you trust this email?</h2><span>Choose one to continue ${icon("arrow")}</span></div>
        <div class="answer-buttons">
          <button class="answer-button legitimate-button" type="button" data-answer="legitimate" data-question="${esc(email.id)}">${icon("shield")}<span><strong>LEGITIMATE</strong><small>This email appears genuine.</small></span><kbd>L</kbd></button>
          <button class="answer-button phishing-button" type="button" data-answer="phishing" data-question="${esc(email.id)}">${icon("flag")}<span><strong>PHISHING</strong><small>This email is suspicious.</small></span><kbd>P</kbd></button>
        </div>
        <p class="answer-hint">${icon("lock")} Answers are revealed at the end. <span>Keyboard: <kbd>L</kbd> or <kbd>P</kbd></span></p>
      </section></div>`;
    main.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => submitAnswer(button.dataset.question, button.dataset.answer)));
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
  function submitAnswer(questionId, answer) {
    if (page !== "playing" || locked) return;
    if (!round.answer(questionId, answer)) {
      if (round.status === "finished") showResults();
      return;
    }
    locked = true;
    main.querySelectorAll("[data-answer]").forEach(button => {
      button.disabled = true;
      if (button.dataset.answer === answer) button.classList.add("answer-recorded");
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
    ][Math.floor(results.accuracy * 4)];
  }
  function reviewCard(review, i) {
    const { email, answer, correct } = review;
    return `<details class="review-card" ${!correct ? "open" : ""}>
      <summary><span class="review-status ${correct ? "correct" : "incorrect"}">${icon(correct ? "check" : answer ? "cross" : "clock")}</span><span class="review-summary"><span class="review-overline">EMAIL ${String(i + 1).padStart(2, "0")} <span>· ${esc(email.difficulty)}</span></span><strong>${esc(email.subject)}</strong><span class="review-answer-line">Your answer: <b>${label(answer)}</b><span class="answer-separator">·</span>Correct: <b class="classification-${email.classification}">${label(email.classification)}</b></span></span><span class="result-badge ${correct ? "correct" : "incorrect"}">${correct ? "Correct" : answer ? "Incorrect" : "Unanswered"}</span>${icon("chevron", "review-chevron")}</summary>
      <div class="review-content"><div class="review-explanation"><span class="explanation-label">${icon(email.classification === "phishing" ? "flag" : "shield")}${email.classification === "phishing" ? "Why this is phishing" : "What supports its legitimacy"}</span><p>${esc(email.explanation)}</p><ul class="clue-list">${email.indicators.map(ind => `<li><strong>${esc(ind.text)}</strong><p>${esc(ind.explanation)}</p></li>`).join("")}</ul></div>
        <article class="review-email ${email.classification === "phishing" ? "review-risk" : "review-trust"}" aria-label="Email ${i + 1} with highlighted clues">${emailContent(email, true)}</article>
      </div></details>`;
  }
  function showResults() {
    if (page !== "playing" || round.status !== "finished") return;
    clearWork();
    page = "results";
    document.body.dataset.screen = page;
    const results = round.results();
    const [title, message] = performanceMessage(results);
    main.className = "results-screen";
    main.innerHTML = `
      <div class="results-topline"><span class="eyebrow">THE INBOX CHALLENGE / ROUND COMPLETE</span><button class="button primary new-player" type="button">${icon("refresh")} New Player</button></div>
      <section class="results-hero"><div class="score-circle" style="--score-angle:${results.score / results.maximum * 360}deg"><div><strong>${results.score}<span>/ ${results.maximum}</span></strong><small>YOUR SCORE</small></div></div><div class="results-copy"><span class="completion-label">${icon(results.correct === results.reviews.length ? "trophy" : "shield")} ${results.endReason === "timeout" ? "Time's up. Let's find the clues." : "Inbox checked. A little more awareness."}</span><h1 tabindex="-1">${title}</h1><p>${message}</p><div class="result-stats"><div><strong>${results.answered}</strong><small>Emails answered (target: ${settings.targetAnswers})</small></div><div><strong>${(results.accuracy * 100).toFixed(1)}<span>%</span></strong><small>Accuracy (${results.correct} correct, ${results.incorrect} wrong)</small></div><div><strong>${results.timeUsed.toFixed(1)}<span>s</span></strong><small>Time used of ${esc(settings.roundSeconds)}s</small></div></div><p class="score-breakdown">Score = 100 &times; target progress ${(results.targetProgress * 100).toFixed(1)}% &times; (${settings.accuracyWeight}% &times; accuracy ${(results.accuracy * 100).toFixed(2)}% + ${settings.participationWeight}%) = <strong>${results.score} / 100</strong>. Progress reaches 100% at ${settings.targetAnswers} answers; score calculated before rounding.</p></div></section>
      ${results.unanswered ? `<div class="timeout-note">${icon("clock")} ${results.unanswered} email${results.unanswered === 1 ? " was" : "s were"} unanswered. You do not need to finish all ${questionCount}: scoring uses accuracy on answered emails and progress toward ${settings.targetAnswers} answers.${results.answered ? "" : " No answers means zero points."}</div>` : ""}
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
    submitAnswer(round.questions[round.index]?.id, key === "l" ? "legitimate" : "phishing");
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
