/* Shared navigation, separate from staff PINs and Participant passes. */
(() => {
  const body = document.body;
  if (!body.hasAttribute('data-site-nav')) return;
  const main = document.querySelector('main, .wrap, .dash');
  if (main && !main.id) main.id = 'main-content';
  const header = document.createElement('header'); header.className = 'site-header';
  header.innerHTML = `<a class="skip-link" href="#${main?.id || 'main-content'}">Skip to content</a><div class="site-header-inner">
    <a class="wordmark" href="/" aria-label="Scamurai home"><img src="/assets/logo.jpg" alt=""><span>SCAM<em>URAI</em></span></a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="site-navigation">Menu <span aria-hidden="true">☰</span></button>
    <nav class="site-nav" id="site-navigation" aria-label="Main navigation"><a href="/">Home</a><a href="/#how-to-play">How to play</a><a href="/leaderboard.html">Leaderboard</a><a class="nav-pass" href="/participant.html">My participant page ↗</a></nav></div>`;
  body.prepend(header);
  const menu = header.querySelector('.menu-toggle'), nav = header.querySelector('nav');
  const close = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.onclick = () => { const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); };
  nav.querySelectorAll('a').forEach(a => { if (new URL(a.href).pathname === location.pathname && !a.hash) a.setAttribute('aria-current', 'page'); a.addEventListener('click', close); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); menu.focus(); } });
  document.addEventListener('click', e => { if (!header.contains(e.target)) close(); });
  if (body.dataset.siteFooter !== 'off') {
    const footer = document.createElement('footer'); footer.className = 'site-footer';
    footer.innerHTML = `<div><a class="wordmark" href="/"><span>SCAM<em>URAI</em></span></a><p>Spot it. Stop it. Report it.</p><p>XMUM · Community Service · 26 November 2026</p></div><nav aria-label="Staff tools"><a href="/register.html">Registration desk</a><a href="/games/close-the-popups/">Station 2 laptops</a><a href="/games/phishing-fishing/">Station 3 laptops</a><a href="/games/scan-me-if-you-can/">Station 5 console</a><a href="/stations.html">Station QR codes</a><a href="/admin.html">Admin</a></nav>`;
    body.appendChild(footer);
  }
  document.querySelectorAll('table').forEach(table => {
    if (table.closest('.table-scroll') || table.classList.contains('score-list')) return;
    const wrap = document.createElement('div'); wrap.className = 'table-scroll'; wrap.tabIndex = 0; wrap.setAttribute('role','region'); wrap.setAttribute('aria-label','Scrollable data table');
    if (table.querySelector('#per')) table.classList.add('compact-data');
    table.before(wrap); wrap.appendChild(table);
    if (!table.classList.contains('compact-data')) { const hint = document.createElement('p'); hint.className = 'table-hint muted'; hint.textContent = 'Swipe the table to see all columns →'; wrap.after(hint); }
  });
})();
