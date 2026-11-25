/* Native activity entry; the durable clock and evidence belong to booth-round.js. */
(() => {
  'use strict';
  const VERSION = 'ending3';
  const app = document.getElementById('booth-app');
  const params = new URLSearchParams(location.search);
  const tasks = Array.isArray(window.BROWSE_BOOTH_TASKS) ? window.BROWSE_BOOTH_TASKS : [];
  const legacy = Array.isArray(window.BROWSE_BOOTH_LEGACY_TASKS) ? window.BROWSE_BOOTH_LEGACY_TASKS : [];
  const findTask = id => tasks.find(item => item.id === id) || legacy.find(item => item.id === id);
  const api = window.BROWSE_BOOTH;
  const lang = params.get('lang') === 'en' ? 'en' : 'zh';
  const li = lang === 'en' ? 0 : 1;
  const demo = Boolean(window.parent.CLOSE_POPUPS_HOST?.demo);
  const mode = params.get('mode') === 'clean' ? 'clean' : 'ads';
  const view = params.get('view') || 'choose';
  const taskId = params.get('task');
  const task = findTask(taskId);
  let starting = false;
  const t = (en, zh) => li === 0 ? en : zh;
  if (task?.scene === 'shoppee') {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hans';
    const skip = document.querySelector('.booth-skip');
    if (skip) skip.textContent = t('Skip to content', '跳至主要内容');
  }
  const txt = pair => Array.isArray(pair) ? String(pair[li] ?? pair[0] ?? '') : String(pair ?? '');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const taskText = (value, item) => window.BROWSE_BOOTH_TASK_TEXT(txt(value), item, lang);
  const status = value => { document.getElementById('booth-status').textContent = value; };
  function url(values = {}) {
    const next = new URL('booth.html', location.href);
    next.searchParams.set('lang', lang);
    next.searchParams.set('v', VERSION);
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') next.searchParams.set(key, value);
    });
    if ((values.mode ?? mode) === 'clean') next.searchParams.set('mode', 'clean');
    else next.searchParams.delete('mode');
    return next.pathname + next.search;
  }
  const chooseURL = () => url();
  function localisedURL(raw) {
    try {
      const next = new URL(raw, location.href);
      if (next.origin !== location.origin) return chooseURL();
      next.searchParams.set('lang', lang);
      return next.pathname + next.search;
    } catch (_) { return chooseURL(); }
  }
  function header(stage, record) {
    const values = {view: view === 'choose' ? null : view, task: taskId, round: params.get('round')};
    const activeMode = record?.mode || mode;
    const otherLang = lang === 'zh' ? 'en' : 'zh';
    return `<header class="booth-header">
      <a class="booth-brand" href="${esc(chooseURL())}"><span class="booth-brand-mark" aria-hidden="true">↗</span>${t('close the popups', '一分钟')}</a>
      <div class="booth-header-right"><span class="booth-stage">${esc(stage)}</span>
        <a class="booth-language" href="${esc(url({...values, lang:otherLang, mode:activeMode}))}" lang="${otherLang === 'en' ? 'en' : 'zh-Hans'}">${task?.scene === 'shoppee' ? t('Chinese', '英文') : t('中文', 'English')}</a>
      </div>
    </header>`;
  }
  function mountFullscreen() {
    window.parent.CLOSE_POPUPS_HOST?.mountFullscreen?.(window, app.querySelector('.booth-header-right'), lang);
  }
  const modeName = value => value === 'ads' ? t('Ad challenge', '广告挑战') : t('Difficulty test · no ads', '难度测试 · 无广告');
  const taskSites = new Map(window.BROWSE_SCENE_INDEX.map(site => [site.id, site]));
  const siteName = item => txt(taskSites.get(item.scene).name);
  const taskGroups = [
    {title:['Search & tools','搜索·工具'],ids:['minute3-search-official','minute2-tool-webp','minute2-wall-earthrise']},
    {title:['Content & collections','内容·收藏'],ids:['minute2-nature-woodpeckers']},
    {title:['Plan & compare','规划·比较'],ids:['minute5-taipei-flight','minute2-travel-interchange','minute2-market-lens','minute4-penang-indoor']},
    {title:['Everyday services','生活服务'],ids:['minute4-shoppee-buy','minute2-recipe-budget','minute2-outing-craft','minute3-courier-redelivery']}
  ];
  const suggestedSeconds = id => ['minute3-search-official','minute3-courier-redelivery'].includes(id) ? 30 : id === 'minute2-tool-webp' ? 45 : 60;
  function taskCard(item) {
    return `<li><a class="booth-task-card" data-booth-task="${esc(item.id)}" href="${esc(url({view:'brief', task:item.id}))}">
      <span class="booth-task-thumb"><img src="${esc(item.cover)}" alt="" loading="lazy" width="76" height="58"${item.coverNote?` title="${esc(txt(item.coverNote))}"`:""}></span>
      <span><strong>${esc(txt(item.title))}</strong><small>${esc(siteName(item))}${item.advanced ? ` · ${t('Advanced', '进阶')}` : ''}</small><small class="booth-suggested">${t("Suggested", "建议")} ${suggestedSeconds(item.id)} ${t("sec", "秒")}</small></span>
      <span class="booth-arrow" aria-hidden="true">→</span>
    </a></li>`;
  }
  function staffTask(item) {
    return `<div class="booth-staff-answer"><span class="booth-eyebrow">${t('ANSWER & CHECK', '答案与核对')}</span><p>${esc(txt(item.answer))}</p></div><h3>${t('A suggested route', '建议寻找路线')}</h3><ol class="booth-route">${item.route.map(step => `<li>${esc(txt(step))}</li>`).join('')}</ol><p class="booth-note">${t('This is one valid route, not a required sequence of clicks. Keep these details away from the participant until the round ends.', '这是一条可行路线，不限定参与者必须这样操作。挑战结束前，请勿向参与者展示。')}</p>`;
  }
  function staffHistory() {
    let records = [];
    try { records = api?.list?.() || []; } catch (_) { records = []; }
    return `<details class="booth-staff booth-history" id="booth-history"><summary>${t('Staff tools', '工作人员工具')}</summary><div class="booth-staff-body">
      <nav class="booth-staff-links" aria-label="${t('Staff tools', '工作人员工具')}">
        ${mode === 'ads' ? `<a href="${esc(url({mode:'clean'}))}">${t('Difficulty test · no ads', '难度测试 · 无广告')} ↗</a>` : `<a href="${esc(url({mode:'ads'}))}">${t('Return to the challenge', '返回正式挑战')} ↗</a>`}
        <a href="launch.html?lang=${lang}&amp;v=audio1">${t('Free browsing', '自由浏览')} ↗</a>
      </nav>
      <label class="booth-advanced"><input id="booth-include-advanced" type="checkbox"> ${t('Include advanced tasks in the draw', '随机抽题时加入进阶题')}</label>
      <h2>${t('Recent rounds', '最近轮次')}</h2>
      <p class="booth-note">${t('Records are stored in this browser tab.', '记录保存在当前浏览器标签页。')}</p>
      ${records.length ? `<ol class="booth-history-list">${records.map(record => {
      const item = findTask(record.taskId);
      return `<li><a href="${esc(localisedURL(api.resultURL(record)))}"><span>${esc(item ? txt(item.title) : t('Unavailable task', '题目不可用'))}<small>${esc(record.id)}</small></span><span>${esc(record.status === 'running' ? t('In progress', '进行中') : record.status === 'armed' ? t('Ready', '尚未开始') : record.status === 'void' ? t('Voided', '已作废') : t('Ended', '已结束'))} ↗</span></a></li>`;
    }).join('')}</ol>` : `<p>${t('No rounds have been started in this tab yet.', '此标签页还没有开始过的轮次。')}</p>`}</div></details>`;
  }
  function renderChoose() {
    document.title = mode === 'clean' ? t('Difficulty test · close the popups', '难度测试 · 一分钟') : t('close the popups · Web challenge', '一分钟 · 网页挑战');
    app.innerHTML = `${header(mode === 'clean' ? t('01 / Pick a task', '01 / 选题') : t('01 / Draw a task', '01 / 随机抽题'))}
      <main id="booth-main" data-booth-view="choose" class="booth-main">
        <section class="${mode === 'clean' ? 'booth-hero' : 'booth-welcome'}" aria-labelledby="booth-title">
          ${mode === 'ads' ? '<div class="booth-welcome-bar" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}
          <div class="${mode === 'ads' ? 'booth-welcome-copy' : ''}">
            ${mode === 'clean' ? `<p class="booth-eyebrow">${t('Staff test · ads off', '工作人员测试 · 无广告')}</p>` : ''}
            <h1 id="booth-title">${t('One minute.', '一分钟挑战')}</h1>
            <p>${mode === 'clean'
              ? t('Try a task without interruptions to check its difficulty.', '先关掉广告，试一试题目难不难。')
              : t('Finish a web task in 60 seconds while pop-up ads try to distract you.', '在 60 秒内完成一项网页任务，小心突然出现的广告。')}</p>
            <button id="booth-random" class="booth-button booth-button-inverse" type="button">${t('Draw a task', '随机抽题')} <span aria-hidden="true">→</span></button>
            ${mode === 'ads' ? `<p class="booth-welcome-note">${t('Read the brief before the clock starts.', '先读题，再开始计时。')}</p>` : ''}
          </div>
          ${mode === 'clean' ? '<span class="booth-hero-clock" aria-hidden="true">1:00</span>' : `
            <figure class="booth-welcome-art">
              <div class="booth-welcome-sponsor">
                <span>Scamurai</span>
                <div><strong>RM5,000</strong><span>${t('Event sponsorship', '赛事赞助')}</span></div>
              </div>
              <div class="booth-welcome-popup" aria-hidden="true">
                <div class="booth-welcome-popup-bar"><span>${t('Prize alert', '中奖通知')}</span><span>×</span></div>
                <span class="booth-welcome-pointer"></span>
                <div class="booth-welcome-popup-copy">
                  <span>${t('YOU WON!', '你中奖了！')}</span>
                  <strong>RM1,000</strong>
                  <span class="booth-welcome-claim">${t('Claim prize →', '领取奖品 →')}</span>
                </div>
              </div>
              <figcaption>${t('Simulated ad', '模拟广告')}</figcaption>
            </figure>`}
        </section>
        <section class="booth-collection" aria-labelledby="booth-task-heading">
          <div class="booth-collection-heading">
            <h2 id="booth-task-heading">${t('Or pick your own', '也可以自己选题')}</h2>
            <span>${tasks.length} ${t('tasks', '题')}</span>
          </div>
          <p class="booth-note booth-duration-note">${t('The times on the cards are estimates. Every round gives you 60 seconds.', '卡片上是预计用时。每轮都给你 60 秒。')}</p><div class="booth-task-groups">${taskGroups.map((group,i)=>`<section class="booth-task-group" aria-labelledby="booth-group-${i}"><h3 id="booth-group-${i}">${esc(txt(group.title))}</h3><ul class="booth-task-grid">${group.ids.map(id=>tasks.find(x=>x.id===id)).filter(Boolean).map(taskCard).join('')}</ul></section>`).join('')}</div>
        </section>
        ${staffHistory()}
      </main>`;
    mountFullscreen();
    if (mode === 'ads' && !demo) {
      document.querySelector('.booth-collection').hidden = true;
      document.querySelector('.booth-advanced').hidden = true;
    }
    document.getElementById('booth-random').addEventListener('click', async () => {
      if (mode === 'ads' && !demo) {
        const button = document.getElementById('booth-random'); button.disabled = true;
        try {
          const id = await window.CLOSE_POPUPS_BRIDGE.draw(tasks.map(item => item.id));
          location.assign(url({view:'brief', task:id}));
        } catch (error) { status(error.message); button.disabled = false; }
        return;
      }
      const pool = tasks.filter(item => !item.advanced || document.getElementById('booth-include-advanced').checked);
      if (!pool.length) { status(t('No tasks are available.', '暂无可用题目。')); return; }
      const values = new Uint32Array(1);
      if (window.crypto?.getRandomValues) crypto.getRandomValues(values); else values[0] = Math.floor(Math.random() * 4294967296);
      const item = pool[values[0] % pool.length];
      location.assign(url({view:'brief', task:item.id}));
    });
  }
  function renderBrief(item) {
    document.title = `${txt(item.title)} · ${t('close the popups', '一分钟')}`;
    app.innerHTML = `${header(t('02 / Read the task', '02 / 读题'))}
      <main id="booth-main" data-booth-view="brief" class="booth-main booth-brief-main">
        <a class="booth-back" href="${esc(chooseURL())}">← ${mode === 'clean' || demo ? t('Back to tasks', '返回选题') : t('Back to the task draw', '返回抽题')}</a>
        <section class="booth-brief-layout" aria-labelledby="booth-title">
          <div class="booth-brief-copy">
            <p class="booth-eyebrow">${esc(siteName(item))} · ${esc(txt(taskSites.get(item.scene).type))}</p>
            <h1 id="booth-title">${esc(txt(item.title))}</h1>
            <div class="booth-goals">
              <h2>${t('What to do', '要做的事')}</h2>
              <ol>${item.goals.map(goal => `<li>${taskText(goal, item)}</li>`).join('')}</ol>
            </div>
            ${item.hint ? `<details class="booth-start-hint"><summary>${t('Hint', '提示')}</summary><p>${taskText(item.hint, item)}</p></details>` : ''}
            <p class="booth-play-note">
              <strong>${t('You have 60 seconds once the site is ready.', '网站就绪后，你有 60 秒。')}</strong>
              ${mode === 'ads' ? t('When an ad pops up, find its real close button, close it, and get back to your task.', '广告弹出时，认准真正的关闭按钮，关掉后接着做任务。') : ''}
              ${t('Use View task if you need a reminder. Click Submit when you’re done.', '忘了要求，点顶部的「查看任务」。做完后点「交卷」。')}
            </p>
            <button id="booth-start" type="button" class="booth-button booth-button-primary">${t('Start task', '开始任务')} <span aria-hidden="true">→</span></button>
            <p id="booth-start-note" class="booth-note" role="status" hidden></p>
          </div>
          <figure class="booth-brief-figure"><img class="booth-brief-photo" src="${esc(item.briefCover||item.cover)}" alt="" width="480" height="360">${item.coverNote?`<figcaption>${esc(txt(item.coverNote))}</figcaption>`:""}</figure>
        </section>
      </main>`;
    mountFullscreen();
    document.getElementById('booth-start').addEventListener('click', async () => {
      if (starting) return;
      const button = document.getElementById('booth-start');
      const note = document.getElementById('booth-start-note');
      starting = true;
      button.disabled = true;
      try {
        if (!api || typeof api.create !== 'function') throw new Error('runtime');
        await window.CLOSE_POPUPS_BRIDGE.beforeStart(mode, item.id);
        const round = api.create(item.id, mode, lang);
        if (!round || round.status !== 'armed') throw new Error('storage');
        window.CLOSE_POPUPS_BRIDGE.bind(round);
        location.assign(api.entryURL(round));
      } catch (error) {
        try { await window.CLOSE_POPUPS_BRIDGE.abort(); } catch {}
        starting = false;
        button.disabled = false;
        note.hidden = false;
        note.textContent = t('This round could not be prepared. Allow this site’s session storage, then try again. Your challenge has not started.', '未能准备本轮。请允许此网站的会话存储，再试一次。挑战尚未开始。');
        note.textContent = error?.message || note.textContent;
        note.classList.add('is-error');
        note.setAttribute('role','alert');
        note.scrollIntoView({block:'nearest'});
        status(note.textContent);
      }
    });
  }
  function elapsedText(round) {
    if (!Number.isFinite(round.startedAt) || !Number.isFinite(round.endedAt) || round.startedAt <= 0) return '—';
    const seconds = Math.max(0, Math.min(60, (round.endedAt - round.startedAt) / 1000));
    return `${seconds.toFixed(1)} ${t('sec', '秒')}`;
  }
  function reasonText(round) {
    if (round.status === 'void') return t('Round voided', '本轮已作废');
    return ['timeout','expired','deadline','time'].includes(round.reason) ? t('Time is up', '时间到') : t('Round submitted', '本轮已交卷');
  }
  function verdictText(value) {
    return ({complete:t('Complete', '已完成'), partial:t('Partly complete', '部分完成'), incomplete:t('Not complete', '未完成'), unreviewed:t('Awaiting staff review', '等待工作人员核对')})[value] || t('Awaiting staff review', '等待工作人员核对');
  }
  function validAssessment(round) {
    try {
      const result = api.conditions ? api.conditions(round) : api.assess(round);
      if (result && Array.isArray(result.checks)) return result;
    } catch (_) { /* A broken assessment must not become a successful result. */ }
    return {checks:[], allMet:false};
  }
  // Score the task evidence, including the captured sponsored-result safety condition.
  function scoreData(round) {
    const engine = window.BROWSE_BOOTH_SCORE;
    if (!engine || round.status === 'void') return null;
    let assessment = {checks: [], allMet: false};
    try {
      const result = api.assess(round);
      if (result && Array.isArray(result.checks)) {
        assessment = {checks: [...result.checks]};
        if (round.taskId === 'minute3-search-official') {
          const safe = api.conditions(round)?.checks?.[2];
          // Avoidance alone is passive: it earns no progress without a positive task action.
          assessment.checks.push({met: result.checks.some(check => check.met === true) && safe?.met === true});
        }
      }
    } catch (_) { /* A broken assessment scores zero rather than inventing success. */ }
    let review = null;
    if (round.mode !== 'clean') {
      try {
        // The reader repairs missing counts to zero. Check the stored shape first
        // so missing records cannot manufacture safe-interaction credit.
        const raw = sessionStorage.getItem(`br-review-v2:${round.seed}`)
          ?? sessionStorage.getItem(`br-review-v1:${round.seed}`);
        const stored = raw === null ? null : JSON.parse(raw);
        if (stored?.counts && typeof stored.counts === 'object' && !Array.isArray(stored.counts)) {
          review = window.BROWSE_REVIEW_DATA?.read(round.seed) || null;
        }
      } catch (_) { review = null; }
    }
    try { return engine.compute(assessment, review, round); } catch (_) { return null; }
  }

  function unavailableResilience(round) {
    return round.mode === 'clean' ? t('This round had no advertisements', '本轮没有广告')
      : t('Ad behaviour data is unavailable', '广告行为数据不可用');
  }
  function scoreBlock(score, round) {
    if (!score) return '';
    const r = score.resilience, time = score.time;
    const rows = r ? [[t('Ad clicks recorded (including blocked tabs)', '广告点击记录（含被拦截的）'), r.unsafeClicks], [t('Pop-ups closed safely', '正确关掉的弹窗'), r.cleanCloses], [t('Fake close buttons clicked', '误点假关闭按钮'), r.decoys],
      [t('Chased close buttons (no points)', '追逐关闭按钮次数（不计分）'), r.dodges], [t('Close buttons revealed after 10 seconds (no points)', '10 秒后出现辅助关闭按钮（不计分）'), r.revealed],
      [t('Ad tabs opened', '打开的广告标签页'), r.opened]] : [];
    return `<section class="booth-score" aria-labelledby="booth-score-title">
        <h2 id="booth-score-title" class="booth-sr">${t('Round score', '本轮得分')}</h2>
        <div class="booth-score-total"><strong>${score.total}</strong><span>/ 100</span></div>
        <dl class="booth-score-split">
          <div><dt>${t('Task', '任务完成')}</dt><dd>${score.task.score} / 40</dd><small>${t(`${score.task.met} of ${score.task.total} items checked off`, `已记录 ${score.task.met} / ${score.task.total} 项`)}</small></div>
          <div><dt>${t('Speed', '速度')}</dt><dd>${time ? `${time.score} / 40` : '—'}</dd><small>${time ? t('Based on time and task progress', '按用时和任务进度计算') : t('No time recorded', '没有用时记录')}</small></div>
          <div><dt>${t('Safe interaction', '安全操作')}</dt><dd>${r ? `${r.score} / 20` : '—'}</dd><small>${r ? t('+2 for each real close, −1 for each fake close clicked.', '每正确关闭一次加 2 分，每误点一次假关闭扣 1 分。') : unavailableResilience(round)}</small></div>
          <div><dt>${t('Warm-up floor', '热身保底')}</dt><dd>${score.guaranteed && score.guaranteed.done ? '20 / 100' : '—'}</dd><small>${score.guaranteed && score.guaranteed.done ? (score.guaranteed.applied ? t('Warm-up done: the round total was lifted to 20', '已完成热身：本轮总分提升至 20') : t('Warm-up done: your total was already at least 20', '已完成热身：本轮本来就有至少 20 分')) : t('Warm-up not completed, so no floor applies', '未完成热身，无保底分')}</small></div>
        </dl>
        ${rows.length ? `<ul class="booth-score-detail">${rows.map(([label, value]) => `<li><span>${esc(label)}</span><b>${value}</b></li>`).join('')}</ul>` : ''}
        <p class="booth-note">${t('The task score uses the items we could check automatically. A staff member can verify the others below.', '任务分按系统能自动核对的项目计算。下方还有些项目需要工作人员确认。')}</p>
        <details class="booth-score-rules">
          <summary>${t('How scoring works', '查看计分规则')}</summary>
          <p>${t('Open View task and pick the label shown in the top bar. You can try again while the clock is running. Completing the warm-up guarantees at least 20 points for the round.', '在「查看任务」里选出顶部栏显示的标签。倒计时结束前可以重试。做完热身，本轮总分至少 20 分。')}</p>
          <p>${t('The task score starts at 10 when there are items to check and can reach 40. Speed starts at 30. You can earn up to 10 more based on how much you finish. The bonus starts to drop after 30 seconds and reaches zero at 60 seconds.', '有计分项时，任务分最低 10 分，最高 40 分。速度有 30 分基础分，按任务进度最多再奖 10 分。超过 30 秒后，奖励逐渐减少，到 60 秒时只剩基础分。')}</p>
          <p>${t('With an ad log, you start with 10 safety points. Each real close adds 2. Each fake close you click costs 1. This part stays between 0 and 20. Staff practice does not count toward the event.', '有广告记录时，安全操作从 10 分起算。每正确关闭一次加 2 分，每误点一次假关闭扣 1 分，最低 0 分，最高 20 分。工作人员练习不计入活动成绩。')}</p>
        </details>
      </section>`;
  }

  function resultChecks(assessment) {
    return assessment.checks.length ? assessment.checks.map(check => `<li data-booth-check data-met="${check.met===null?'unknown':check.met===true}"><span class="booth-check-symbol" aria-hidden="true">${check.met===true?'✓':check.met===null?'—':'○'}</span><div><strong>${esc(txt(check.label))}</strong>${check.detail ? `<p>${esc(txt(check.detail))}</p>` : ''}</div><span class="booth-check-state">${check.met===true?t('Done','已完成'):check.met===null?t('Staff to check','待工作人员确认'):t('Not detected','未检测到')}</span></li>`).join('') : `<li data-booth-check data-met="unknown"><span class="booth-check-symbol" aria-hidden="true">—</span><div><strong>${t('No task activity recorded', '没有任务操作记录')}</strong><p>${t('A staff member can ask what you did and check any files you downloaded.', '工作人员可以向你确认操作，并检查下载的文件。')}</p></div></li>`;
  }
  function evidenceSummary(assessment) {
    const recorded=assessment.checks.filter(c=>c.met===true).length,total=assessment.checks.length;
    if(total&&recorded===total)return t('You completed every item.','所有要求都完成了。');
    const unknown=assessment.checks.filter(c=>c.met===null).length;
    return t(`${recorded} of ${total} items checked off.${unknown?` ${unknown} require a staff check.`:''}`,`已完成 ${recorded}/${total} 项。${unknown?`另有 ${unknown} 项需人工核对。`:''}`);
  }
  function renderPending(round, item) {
    const armed = round.status === 'armed';
    document.title = t('This round is not finished · close the popups', '本轮尚未结束 · 60秒任务挑战');
    app.innerHTML = `${header(t('ROUND STATUS', '轮次状态'), round)}<main id="booth-main" data-booth-view="${armed ? 'armed' : 'running'}" class="booth-main booth-recovery"><p class="booth-eyebrow">${esc(siteName(item))} / ${esc(modeName(round.mode))}</p><h1 id="booth-title">${armed ? t('Ready to start', '可以开始了') : t('Your timer is still running', '倒计时还在继续')}</h1><p>${armed ? t('Go to the task site. The timer starts when the page loads.', '打开任务网站。网页就绪后开始计时。') : t('Go back to the task site to finish or submit. Opening this page keeps the timer running.', '回到任务网站继续做题或交卷。打开这个页面时，倒计时还在继续。')}</p><div class="booth-recovery-task"><strong>${esc(txt(item.title))}</strong><span>${esc(txt(item.brief))}</span></div><a class="booth-button booth-button-primary" id="booth-resume" href="${esc(localisedURL(api.entryURL(round)))}">${armed ? t('Continue to the website', '继续前往网站') : t('Return to this round', '返回本轮任务')}<span aria-hidden="true">↗</span></a><a class="booth-text-link" href="${esc(chooseURL())}">${t('Back to task selection', '返回选题')}</a></main>`;
    mountFullscreen();
  }
  function exportResult(round, item) {
    const assessment = validAssessment(round);
    const score = scoreData(round);
    const lines = [t('ONE MINUTE — ROUND RECORD', '一分钟 — 本轮记录'), '', `${t('Round', '轮次')}: ${round.id}`, `Seed: ${round.seed}`, `${t('Task', '题目')}: ${txt(item.title)} (${item.id})`, `${t('Memory anchor', '任务要点')}: ${txt(item.badge || item.title)}`, `${t('Second-level hint', '二级提示')}: ${round.usedSecondHint ? t('Used', '已使用') : t('Not used', '未使用')}`, `${t('Website', '网站')}: ${item.site}`, `${t('Mode', '环境')}: ${modeName(round.mode)}`, `${t('Status', '状态')}: ${reasonText(round)}`, `${t('Time used', '实际用时')}: ${elapsedText(round)}`,       ...(score ? [`${t('Score', '得分')}: ${score.total} / 100`,
        `${t('Task', '任务完成')}: ${score.task.score} / 40 (${score.task.met}/${score.task.total})`,
        `${t('Speed', '速度')}: ${score.time ? `${score.time.score} / 40 (${t('base', '基础')} ${score.time.base} + ${t('speed bonus', '速度奖励')} ${score.time.bonus})` : '—'}`,
        `${t('Safe interaction', '安全操作')}: ${score.resilience ? `${score.resilience.score} / 20` : `— (${unavailableResilience(round)})`}`,
        `${t('Warm-up floor', '热身保底')}: ${score.guaranteed && score.guaranteed.done ? (score.guaranteed.applied ? t('done, total lifted to 20', '已完成，总分提升至 20') : t('done, not needed', '已完成，未触发')) : t('not completed', '未完成')}`,
        ...(score.resilience ? [`${t('Clean closes / false closes / evasions / assists', '干净关闭 / 假关闭 / 闪避 / 辅助')}: ${score.resilience.cleanCloses} / ${score.resilience.decoys} / ${score.resilience.dodges} / ${score.resilience.revealed}`, `${t('Ad tabs opened', '打开的广告标签页')}: ${score.resilience.opened}`] : [])] : []),
 `${t('Staff verdict', '工作人员判定')}: ${verdictText(round.judgement)}`, '', txt(item.brief), '', t('TASK CONDITIONS — ✓ recorded; ○ not recorded; — staff check needed', '条件核对 — ✓ 已记录；○ 尚未记录；— 待人工核对'), evidenceSummary(assessment), ...assessment.checks.map(check => `${check.met===true?'[✓]':check.met===null?'[—]':'[○]'} ${txt(check.label)}${check.detail ? ': ' + txt(check.detail) : ''}`), '', t('STAFF REFERENCE', '工作人员参考'), txt(item.answer), ...item.route.map((step, index) => `${index + 1}. ${txt(step)}`), '', `${t('This round’s review', '本轮复盘')}: ${new URL(api.reviewURL(round), location.href).href}`, '', t('Generated locally. A download record shows that the browser was asked to download a generated file; staff should verify files on disk where needed.', '本地生成。导出记录代表文件已生成并向浏览器发起下载；需要时由工作人员核对磁盘上的实际文件。')];
    let objectURL;
    try {
      objectURL = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\r\n')], {type:'text/plain;charset=utf-8'}));
      const anchor = document.createElement('a');
      anchor.href = objectURL;
      anchor.download = `one-minute-${String(round.id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0,80)}.txt`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      status(t('The round record download has been requested.', '已发起本轮记录下载。'));
      setTimeout(() => URL.revokeObjectURL(objectURL), 1500);
    } catch (_) {
      if (objectURL) URL.revokeObjectURL(objectURL);
      status(t('The file could not be generated. Try exporting again.', '未能生成文件，请重新导出。'));
    }
  }
  function renderResult(round, item) {
    if (round.status === 'armed' || round.status === 'running') { renderPending(round, item); return; }
    const assessment = validAssessment(round);
    const score = scoreData(round);
    window.BROWSE_BOOTH_SCORE_LAST = score;
    window.CLOSE_POPUPS_BRIDGE.result(round, score);
    document.title = `${reasonText(round)} · ${t('close the popups', '60秒任务挑战')}`;
    app.innerHTML = `${header(t('03 / Results', '03 / 结果'), round)}
      <main id="booth-main" data-booth-view="result" class="booth-main booth-result-main">
        <section class="booth-result-hero" aria-labelledby="booth-title">
          <div>
            <p class="booth-eyebrow">${esc(modeName(round.mode))}</p>
            <h1 id="booth-title">${esc(reasonText(round))}</h1>
            <p>${esc(txt(item.title))} · ${esc(siteName(item))}</p>${item.badge?`<strong class="booth-memory-badge">${esc(txt(item.badge))}</strong>`:""}${round.usedSecondHint?`<p class="booth-hint-used">${t("Used a second-level hint","使用了二级提示")}</p>`:""}
          </div>
          <div class="booth-time-stamp"><span>${t('Time used', '用时')}</span><strong>${esc(elapsedText(round))}</strong></div>
        </section>
        ${scoreBlock(score, round)}
        <section class="booth-result-evidence" aria-labelledby="booth-evidence-title">
          <h2 id="booth-evidence-title">${t('What you completed', '任务完成情况')}</h2><p class="booth-evidence-summary" role="status">${esc(evidenceSummary(assessment))}</p><p class="booth-note">${t('✓ Done · ○ Not detected · — Staff to check', '✓ 已完成 · ○ 未检测到 · — 待工作人员确认')}</p>
          <ul class="booth-checks">${resultChecks(assessment)}</ul>
          <p class="booth-note">${round.status === 'void'
            ? t('Staff set this round aside.', '工作人员已将本轮作废。')
            : t('Staff will verify these records and any downloaded files.', '工作人员会核对记录和实际下载的文件。')}</p>
          <p class="booth-note booth-takeaway"><strong>${t('Takeaway:', '要点：')}</strong> ${t('The real close button is usually a small, plain X in a corner. Big flashing "Download", "Close" or "Skip" buttons inside an ad are often traps.', '真正的关闭按钮通常是角落里一个不起眼的 X。广告里醒目闪烁的“下载”“关闭”“跳过”按钮往往是陷阱。')}</p>
        </section>
        <div class="booth-result-actions">
          <span class="booth-final-verdict"><small>${t('Final staff verdict','工作人员最终判定')}</small><strong id="booth-verdict">${esc(verdictText(round.judgement))}</strong></span>
          <a id="booth-review" class="booth-button booth-button-primary" href="${esc(localisedURL(api.reviewURL(round)))}">${t('Review this round', '查看本轮复盘')} <span aria-hidden="true">→</span></a>
        </div>
        <details class="booth-staff" id="booth-staff">
          <summary>${t('Staff · check and hand over', '工作人员 · 核对与交接')}</summary>
          <div class="booth-staff-body">
            <div class="booth-judgement-row">
              <label for="booth-judgement">${t('Task verdict', '任务判定')}</label>
              <select id="booth-judgement">
                <option value="unreviewed">${t('Awaiting review', '尚未核对')}</option>
                <option value="complete">${t('Complete', '已完成')}</option>
                <option value="partial">${t('Partly complete', '部分完成')}</option>
                <option value="incomplete">${t('Not complete', '未完成')}</option>
              </select>
            </div>
            ${staffTask(item)}
            <button id="booth-export" class="booth-text-link" type="button">${t('Export round record (TXT)', '导出本轮记录（TXT）')}</button>
            <div class="booth-handoff">
              <label><input id="booth-handoff" type="checkbox"> ${t('The extra ad tabs are closed.', '本轮打开的广告标签页已关好。')}</label>
              <button id="booth-next" class="booth-button booth-button-primary" type="button" disabled>${t('Next participant', '下一位')} <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </details>
      </main>`;
    mountFullscreen();
    window.BROWSE_BOOTH_ENDING?.result(round, score);
    const select = document.getElementById('booth-judgement');
    select.value = ['complete','partial','incomplete'].includes(round.judgement) ? round.judgement : 'unreviewed';
    select.addEventListener('change', () => {
      try {
        const updated = api.judge(round.id, select.value);
        const current = api.get(round.id);
        if (!updated || !current || current.judgement !== select.value) throw new Error('save');
        round = current;
        document.getElementById('booth-verdict').textContent = verdictText(round.judgement);
        status(t('Staff verdict saved for this round.', '本轮工作人员判定已保存。'));
      } catch (_) {
        select.value = round.judgement || 'unreviewed';
        status(t('The verdict could not be saved. Try again.', '未能保存判定，请重试。'));
      }
    });
    document.getElementById('booth-export').addEventListener('click', () => exportResult(api.get(round.id) || round, item));
    document.getElementById('booth-handoff').addEventListener('change', event => { document.getElementById('booth-next').disabled = !event.target.checked; });
    document.getElementById('booth-next').addEventListener('click', () => {
      if (!document.getElementById('booth-handoff').checked) return;
      if (!window.CLOSE_POPUPS_BRIDGE.next()) status(t('Wait for the score to save, or retry in the station bar.', '请等待成绩保存，或在顶部重试保存。'));
    });
  }
  function renderError(kind) {
    const unavailable = kind === 'runtime';
    const retired = kind === 'retired';
    document.title = t('Round unavailable · close the popups', '轮次不可用 · 60秒任务挑战');
    app.innerHTML = `${header(t('LET’S RESET THE ENTRY', '重新找到入口'))}<main id="booth-main" data-booth-view="error" class="booth-main booth-recovery"><p class="booth-eyebrow">${t('NOT A RESULT', '这不是本轮结果')}</p><h1 id="booth-title">${unavailable ? t('The activity could not load.', '活动未能加载。') : retired ? t('This task is no longer available.', '这道题已停用。') : t('We can’t find that round.', '找不到这轮记录。')}</h1><p>${unavailable ? t('The activity runtime is unavailable. Reload the page before starting. No challenge has started here.', '活动组件暂时不可用。请重新加载后再开始，这里尚未启动挑战。') : retired ? t('Return to the task selection to start a new round.', '请返回选题页开始新一轮。') : t('The link is missing, invalid or no longer stored in this tab. We will not guess a previous participant’s result or add more time to an old round.', '链接缺失、无效，或记录已不在此标签页中。这里不会猜测上一位的结果，也不会为旧轮次重开计时。')}</p><a class="booth-button booth-button-primary" href="${esc(chooseURL())}">${t('Return to task selection', '返回选题')}<span aria-hidden="true">↗</span></a>${unavailable ? `<button class="booth-text-link" type="button" id="booth-reload">${t('Reload page', '重新加载')}</button>` : ''}</main>`;
    mountFullscreen();
    document.getElementById('booth-reload')?.addEventListener('click', () => location.reload());
  }
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hans';
  if (!app) return;
  if (!api || !tasks.length) { renderError('runtime'); return; }
  if (view === 'result') {
    const refreshResult = () => {
      let round;
      try { round = params.get('round') ? api.get(params.get('round')) : null; } catch (_) { round = null; }
      const item = round && findTask(round.taskId);
      window.BROWSE_BOOTH_SCORE_LAST = null;
      if (!round || !item) renderError('round'); else renderResult(round, item);
    };
    let recoveryFrame = 0, recoveryGeneration = 0;
    window.addEventListener('pagehide', () => {
      recoveryGeneration++;
      cancelAnimationFrame(recoveryFrame);
    });
    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;
      const own = ++recoveryGeneration;
      // Reconcile late sessionStorage writes from the departed page before reading.
      recoveryFrame = requestAnimationFrame(() => {
        recoveryFrame = requestAnimationFrame(() => {
          if (own === recoveryGeneration) refreshResult();
        });
      });
    });
    refreshResult();
  } else if (view === 'brief') {
    if (task?.retired) renderError('retired');
    else if (task) renderBrief(task);
    else renderError('task');
  } else renderChoose();
})();
