/*
 * Sim Browser: a phone-browser simulation that shows one Site Card.
 * See CONTEXT.md ("Sim Browser", "Site Card") and docs/adr/0002.
 *
 * A card file calls SimCards.register({...}) — format in cards/README.md.
 * Pages render into a shadow root, so card CSS never leaks into ours.
 * Nothing a visitor types ever leaves the page.
 */
(function () {
  const registry = {};
  const V = (document.currentScript && new URL(document.currentScript.src).search) || '';   // ?v=<build> from the server, so cards are never stale
  window.SimCards = {
    register(card) { registry[card.slug] = card; },
    get(slug) { return registry[slug]; },
    load(slug) {
      const m = (window.CARD_MANIFEST || []).find(c => c.slug === slug);
      if (!m) return Promise.reject(new Error('unknown card'));
      if (registry[slug]) return Promise.resolve(registry[slug]);
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = new URL('cards/' + m.file + V, document.baseURI).href;
        s.onload = () => registry[slug] ? res(registry[slug]) : rej(new Error('card did not register'));
        s.onerror = () => rej(new Error('card failed to load'));
        document.head.appendChild(s);
      });
    },
  };

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const CHROME_CSS = `
  .sb{position:fixed;inset:0;display:flex;flex-direction:column;background:#fff;font-family:Roboto,"Segoe UI",system-ui,sans-serif;color:#202124}
  .sb-bar{flex:none;display:flex;align-items:center;gap:6px;padding:8px 8px 6px;background:#f1f3f4;border-bottom:1px solid #dadce0}
  .sb-nav{border:0;background:none;font-size:20px;width:30px;height:32px;color:#5f6368;border-radius:50%;padding:0}
  .sb-nav:disabled{opacity:.3}
  .sb-omni{flex:1;min-width:0;display:flex;align-items:center;gap:6px;background:#fff;border-radius:18px;height:34px;padding:0 10px;border:1px solid #e0e0e0}
  .sb-lock{border:0;background:none;padding:0;display:flex;align-items:center;cursor:pointer;color:#5f6368}
  .sb-lock.insecure{color:#d93025;font-size:12px;font-weight:500;gap:3px}
  .sb-url{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;color:#202124;cursor:text}
  .sb-url .dim{color:#5f6368}
  .sb-tabs{width:22px;height:22px;border:2px solid #5f6368;border-radius:4px;font-size:11px;display:grid;place-items:center;font-weight:700;color:#5f6368;flex:none}
  .sb-view{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;position:relative;background:#fff}
  .sb-view.snap{overflow:hidden;padding-bottom:0!important}.sb-view.snap .sb-page{height:100%}
  .sb-status{position:absolute;left:8px;bottom:8px;max-width:calc(100% - 16px);background:#fff;border:1px solid #dadce0;border-radius:6px;padding:4px 8px;font-size:12px;color:#202124;box-shadow:0 1px 4px rgba(0,0,0,.2);word-break:break-all;pointer-events:none;opacity:0;transition:opacity .15s;z-index:5}
  .sb-status.show{opacity:1}
  .sb-sheet-bg{position:fixed;inset:0;background:rgba(0,0,0,.35);display:none;z-index:20}
  .sb-sheet{position:fixed;left:0;right:0;top:0;background:#fff;border-radius:0 0 14px 14px;padding:16px 18px 18px;z-index:21;display:none;box-shadow:0 4px 18px rgba(0,0,0,.25);font-size:14px;max-height:80vh;overflow:auto}
  .sb-sheet.show,.sb-sheet-bg.show{display:block}
  .sb-sheet h3{margin:0 0 4px;font-size:16px;font-weight:500;word-break:break-all}
  .sb-sheet .row{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid #eee}
  .sb-sheet .row:first-of-type{border-top:0}
  .sb-sheet dl{margin:6px 0 0;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:13px}
  .sb-sheet dt{color:#5f6368}.sb-sheet dd{margin:0;word-break:break-all}
  .sb-sheet .bad{color:#d93025}
  .sb-sheet button{margin-top:10px;border:0;background:#1a73e8;color:#fff;border-radius:16px;padding:7px 16px;font-size:14px}
  .sb-fullurl{font-family:ui-monospace,Menlo,monospace;font-size:13px;background:#f1f3f4;border-radius:8px;padding:10px;word-break:break-all;margin-top:6px}
  .sb-toast{position:fixed;left:50%;top:60px;transform:translateX(-50%);background:#323232;color:#fff;padding:8px 14px;border-radius:6px;font-size:13px;z-index:30;opacity:0;transition:opacity .2s;pointer-events:none;max-width:88vw;text-align:center}
  .sb-toast.show{opacity:1}
  .sb-dialog{position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.4);z-index:25}
  .sb-dialog.show{display:grid}
  .sb-dialog>div{background:#fff;border-radius:10px;padding:18px;width:min(300px,86vw);font-size:14px;box-shadow:0 6px 24px rgba(0,0,0,.3)}
  .sb-dialog .host{font-weight:500;margin-bottom:8px;word-break:break-all}
  .sb-dialog button{float:right;margin-top:12px;border:0;background:none;color:#1a73e8;font-weight:500;font-size:14px}
  `;

  const LOCK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 1 1 4 0v2h-4V7z"/></svg>';
  const TUNE_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>';

  /**
   * Mount a card full-screen into `host`.
   * opts.bottomInset: px reserved at the bottom for the verdict bar.
   */
  window.SimBrowser = function mount(host, card, opts = {}) {
    const start = new URL(card.url);
    const origin = start.origin;
    const secure = start.protocol === 'https:' && card.cert && card.cert.secure !== false;

    host.innerHTML = `<style>${CHROME_CSS}</style>
      <div class="sb">
        <div class="sb-bar">
          <button class="sb-nav" data-act="back" aria-label="Back">&#8592;</button>
          <div class="sb-omni">
            <button class="sb-lock ${secure ? '' : 'insecure'}" data-act="cert" aria-label="Site information">${secure ? TUNE_SVG : '&#9888; Not secure'}</button>
            <span class="sb-url" data-act="url"></span>
          </div>
          <button class="sb-nav" data-act="fwd" aria-label="Forward">&#8594;</button>
          <span class="sb-tabs">1</span>
        </div>
        <div class="sb-view"><div class="sb-page"></div><div class="sb-status"></div></div>
      </div>
      <div class="sb-sheet-bg"></div><div class="sb-sheet"></div>
      <div class="sb-dialog"><div><div class="host"></div><div class="msg"></div><button>OK</button></div></div>
      <div class="sb-toast"></div>`;

    const $ = s => host.querySelector(s);
    const view = $('.sb-view'), pageHost = $('.sb-page'), status = $('.sb-status');
    const sheet = $('.sb-sheet'), sheetBg = $('.sb-sheet-bg'), urlEl = $('.sb-url');
    if (opts.bottomInset) view.style.paddingBottom = opts.bottomInset + 'px';
    const shadow = pageHost.attachShadow({ mode: 'open' });

    let hist = [], idx = -1, timers = [];

    const abs = href => { try { return new URL(href, origin + currentPath()); } catch { return null; } };
    const currentPath = () => hist[idx] || start.pathname;

    function showUrl(u) {
      // Chrome on Android hides the scheme on https and shows the host;
      // long hosts are cut off at the end, which is exactly what scams exploit.
      const host = u.hostname;
      const rest = (u.pathname === '/' ? '' : u.pathname) + u.search;
      urlEl.innerHTML = (u.protocol === 'https:' ? '' : '<span class="dim">http://</span>') + esc(host) + '<span class="dim">' + esc(rest) + '</span>';
    }

    const pageFor = p => card.pages[p] ?? card.pages[p.replace(/\/$/, '')];

    function render(path) {
      timers.forEach(clearInterval); timers = [];
      const pg = pageFor(path);
      if (pg && typeof pg === 'object' && pg.snap) {
        // A captured copy of the live page: shown in a script-less frame so its own CSS renders exactly.
        shadow.innerHTML = `<style>:host{all:initial;display:block;height:100%}iframe{display:block;width:100%;height:100%;border:0;background:#fff}</style>
          <iframe sandbox="allow-same-origin" referrerpolicy="no-referrer" src="${esc(new URL('cards/snap/' + pg.snap, document.baseURI).href)}"></iframe>`;
        const fr = shadow.querySelector('iframe');
        view.classList.add('snap');
        fr.addEventListener('load', () => { if (!fr.contentDocument) return; wire(fr.contentDocument); fr.contentDocument.documentElement.style.scrollPaddingBottom = (opts.bottomInset || 0) + 'px'; padBottom(fr.contentDocument); });
        showUrl(new URL(path, origin));
        $('[data-act=back]').disabled = idx <= 0;
        $('[data-act=fwd]').disabled = idx >= hist.length - 1;
        opts.onNavigate && opts.onNavigate(path);
        return;
      }
      view.classList.remove('snap');
      const html = (typeof pg === 'string' ? pg : null) ?? card.pages['/404'] ??
        `<div style="padding:40px 20px;font-family:sans-serif;text-align:center;color:#555"><h2>404</h2><p>Page not found</p></div>`;
      shadow.innerHTML = `<style>:host{all:initial;display:block;font-family:Arial,Helvetica,sans-serif;color:#222}*{box-sizing:border-box}img{max-width:100%}${card.css || ''}</style><div class="page">${html}</div>`;
      showUrl(new URL(path, origin));
      view.scrollTop = 0;
      $('[data-act=back]').disabled = idx <= 0;
      $('[data-act=fwd]').disabled = idx >= hist.length - 1;
      shadow.querySelectorAll('[data-sim-countdown]').forEach(el => {
        let t = parseInt(el.dataset.simCountdown, 10);
        const tick = () => { const m = Math.floor(t / 60), s = t % 60; el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; if (t > 0) t--; };
        tick(); timers.push(setInterval(tick, 1000));
      });
      const pop = shadow.querySelector('[data-sim-onload-alert]');
      if (pop) timers.push(setTimeout(() => alertBox(pop.dataset.simOnloadAlert), 700));   // cleared by close()
      opts.onNavigate && opts.onNavigate(path);
    }

    function go(path) { hist = hist.slice(0, idx + 1); hist.push(path); idx++; render(path); }

    function toast(msg) {
      const t = $('.sb-toast'); t.textContent = msg; t.classList.add('show');
      clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
    }
    function alertBox(msg) {
      const d = $('.sb-dialog'); d.querySelector('.host').textContent = start.hostname + ' says';
      d.querySelector('.msg').textContent = msg; d.classList.add('show');
    }
    $('.sb-dialog button').onclick = () => $('.sb-dialog').classList.remove('show');

    function openSheet(html) { sheet.innerHTML = html; sheet.classList.add('show'); sheetBg.classList.add('show'); }
    function closeSheet() { sheet.classList.remove('show'); sheetBg.classList.remove('show'); }
    sheetBg.onclick = closeSheet;
    sheet.addEventListener('click', e => { if (e.target.matches('[data-close]')) closeSheet(); });

    function certSheet() {
      const c = card.cert || {};
      const u = new URL(currentPath(), origin);
      if (!secure) {
        return openSheet(`<div class="row"><div><h3 class="bad">&#9888; Your connection to this site is not secure</h3>
          <p>You should not enter any sensitive information on this site (for example, passwords or credit cards), because it could be stolen by attackers.</p></div></div>
          <button data-close>Close</button>`);
      }
      openSheet(`<h3>${esc(u.hostname)}</h3>
        <div class="row"><div>${LOCK_SVG}</div><div><b>Connection is secure</b><br><span style="color:#5f6368">Your information (for example, passwords or credit card numbers) is private when it is sent to this site.</span>
        <details style="margin-top:8px"><summary style="color:#1a73e8">Certificate is valid</summary>
        <dl>
          <dt>Issued to</dt><dd>${esc(c.issuedTo || u.hostname)}</dd>
          <dt>Organisation</dt><dd>${c.org ? esc(c.org) : '<span style="color:#5f6368">&lt;Not part of certificate&gt;</span>'}</dd>
          <dt>Issued by</dt><dd>${esc(c.issuer || '')}</dd>
          <dt>Valid from</dt><dd>${esc(c.validFrom || '')}</dd>
          <dt>Expires on</dt><dd>${esc(c.validTo || '')}</dd>
        </dl></details></div></div>
        <button data-close>Close</button>`);
    }

    host.addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      const act = a.dataset.act;
      if (act === 'back' && idx > 0) { idx--; render(hist[idx]); }
      if (act === 'fwd' && idx < hist.length - 1) { idx++; render(hist[idx]); }
      if (act === 'cert') certSheet();
      if (act === 'url') openSheet(`<b>Address</b><div class="sb-fullurl">${esc(new URL(currentPath(), origin).href)}</div><button data-close>Close</button>`);
    });

    const snapCard = Object.values(card.pages).some(p => p && typeof p === 'object');
    // Bottom space so the verdict bar never covers the end of a captured page.
    function padBottom(doc) { if (opts.bottomInset && doc.body) doc.body.style.paddingBottom = `calc(${getComputedStyle(doc.body).paddingBottom} + ${opts.bottomInset}px)`; }

    function wire(root) {
      // ---- link preview: hover (desktop) and long-press (touch) ----
      let pressT = null, pressed = false;
      const showStatus = a => { const u = abs(a.getAttribute('href')); if (!u) return; status.textContent = u.href; status.classList.add('show'); };
      const hideStatus = () => status.classList.remove('show');
      root.addEventListener('mouseover', e => { const a = e.target.closest('a[href]'); a ? showStatus(a) : hideStatus(); });
      root.addEventListener('mouseleave', hideStatus);
      root.addEventListener('touchstart', e => {
        const a = e.target.closest('a[href]'); if (!a) return;
        pressed = false; clearTimeout(pressT);
        pressT = setTimeout(() => { pressed = true; showStatus(a); if (navigator.vibrate) navigator.vibrate(20); }, 450);
      }, { passive: true });
      root.addEventListener('touchend', () => { clearTimeout(pressT); if (pressed) setTimeout(hideStatus, 1600); });
      root.addEventListener('touchmove', () => clearTimeout(pressT), { passive: true });
      root.addEventListener('contextmenu', e => e.preventDefault());

      root.addEventListener('click', e => {
        if (pressed) { e.preventDefault(); pressed = false; return; }
        const tog = e.target.closest('[data-sim-toggle]');
        if (tog) { e.preventDefault(); root.querySelectorAll(tog.dataset.simToggle).forEach(x => x.classList.toggle('open')); return; }
        const al = e.target.closest('[data-sim-alert]');
        if (al) { e.preventDefault(); alertBox(al.dataset.simAlert); return; }
        const a = e.target.closest('a[href]'); if (!a) return;
        e.preventDefault();
        const href = a.getAttribute('href');
        if (href.startsWith('#')) return;
        const u = abs(href); if (!u) return;
        if (u.origin === origin && (pageFor(u.pathname) !== undefined || !snapCard)) go(u.pathname);
        else if (u.origin === origin) toast('This copy only includes the pages on this card. Long-press a link to see where it goes.');
        else toast('This simulation stays on one site. Long-press a link to see where it goes.');
      });

      // Sandboxed snapshot frames block form submission before 'submit' fires, so catch the button too.
      root.addEventListener('click', e => {
        const b = e.target.closest('button,input[type=submit],input[type=image]');
        if (b && b.form && !b.form.dataset.simNext && (b.type === 'submit' || b.type === 'image')) { e.preventDefault(); toast('Simulation: nothing you type is ever sent.'); }
      });
      root.addEventListener('submit', e => {
        e.preventDefault();
        const f = e.target;
        toast('Simulation: nothing you type is ever sent.');
        if (f.dataset.simNext) setTimeout(() => go(f.dataset.simNext), 500);
      });
    }
    wire(shadow);

    go(start.pathname);
    return { toast, close: () => { timers.forEach(clearInterval); host.innerHTML = ''; } };
  };
})();
