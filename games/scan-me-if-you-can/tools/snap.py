#!/usr/bin/env python3
"""
snap.py - capture a live page as ONE self-contained, script-free HTML file
for the Sim Browser (cards/snap/<file>.html, used as { snap: '<file>.html' }).

Usage:  python3 tools/snap.py <url> <out.html> [--shot out.png] [--click "CSS selector"]... [--hide "CSS selector"]... [--wait SECONDS]

What it does
  * Opens the URL as an Android phone (Pixel 7, en-MY, Asia/Kuala_Lumpur), waits for
    network idle, scrolls slowly to the bottom (lazy images) and back to the top.
  * Declines cookie/consent banners (Reject / Necessary only) and closes app/promo popups.
  * Serialises the RENDERED DOM: every stylesheet is inlined from the live CSSOM (so
    CSS-in-JS is included), and images, srcset, <picture>, canvas, CSS url()s, fonts and
    SVG <use> refs become data: URIs. Links are made absolute (the real site URL).
  * Strips <script>, <noscript>, <iframe>, <object>, <embed>, <link>, on* attributes, form
    action/method, input values. Adds noindex + viewport meta.
  * Fonts > 400 KB are skipped; raster images > 300 KB are re-encoded (JPEG/WebP).
It never types into or submits anything. If the page is a CAPTCHA / access-denied page it
exits with code 3 and writes nothing: do not work around that.

--wait (default 2) is extra settling time before capture (slow carousels/popups).
--click / --hide are optional manual fixes (click a selector before capture; add
display:none to a selector in the output).
"""
import sys, re, base64, io, argparse
from playwright.sync_api import sync_playwright

MAX_FONT = 400_000
MAX_IMG = 300_000

REJECT = re.compile(r"^\s*(reject( all| non-essential)?|decline( all)?|necessary only|only necessary|essential only|"
                    r"use necessary cookies only|refuse( all)?|deny( all)?|no,? thanks?|not now|maybe later|skip|"
                    r"continue without accepting|close|dismiss|later)\s*$", re.I)
BLOCKED = re.compile(r"((solve|complete) the captcha|i.m not a robot|verify you are (a )?human|are you a robot|access denied|unusual traffic|"
                     r"checking your browser|just a moment|request blocked|security check|slide to verify)", re.I)

PREP_JS = r"""
() => {
  const base = document.baseURI;
  const abs = (u, b) => { try { return new URL(u, b || base).href } catch { return null } };
  const urls = new Set();
  const live = [...document.querySelectorAll('*')];
  const clone = document.documentElement.cloneNode(true);
  const cl = [clone, ...clone.querySelectorAll('*')];
  const pairs = live.map((e, i) => [e, cl[i]]);
  // --- CSS
  const sheets = []; const fonts = new Map();
  const ruleText = (sheet, b) => {
    let out = '';
    let rules; try { rules = sheet.cssRules } catch { return '' }
    for (const r of rules) {
      if (r.type === 3 && r.styleSheet) {   // @import
        const m = r.media && r.media.mediaText;
        const t = ruleText(r.styleSheet, r.styleSheet.href || b);
        out += m && m !== 'all' ? `@media ${m}{${t}}` : t;
      } else if (r.type === 5) {   // @font-face: merge duplicates that only differ by unicode-range
        const st = r.style, fx = fixCss(st.getPropertyValue('src'), b);
        const key = [st.getPropertyValue('font-family'), st.getPropertyValue('font-style'), fx, st.getPropertyValue('unicode-range') ? '' : 'nr'].join('|');
        const wt = (st.getPropertyValue('font-weight') || '400').split(/\s+/).map(Number).filter(x => !isNaN(x));
        const ur = st.getPropertyValue('unicode-range');
        if (fonts.has(key)) { const f = fonts.get(key); f.w.push(...wt); if (ur && f.ur) { if (!f.ur.includes(ur)) f.ur += ', ' + ur } else f.ur = ''; }
        else fonts.set(key, { st, fx, ur, w: [...wt] });
      } else out += fixCss(r.cssText, b) + '\n';
    }
    return out;
  };
  const fixCss = (t, b) => t.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (m, q, u) => {
    if (u.startsWith('data:') || u.startsWith('#')) return m;
    const a = abs(u, b); if (!a) return 'url(data:,)';
    urls.add(a); return `url("${a}")`;
  });
  const all = [...document.styleSheets, ...(document.adoptedStyleSheets || [])];
  for (const s of all) {
    if (s.disabled) continue;
    const b = s.href || base;
    let t = ruleText(s, b);
    const mm = s.media && s.media.mediaText;
    if (mm && mm !== 'all') t = `@media ${mm}{${t}}`;
    if (t.trim()) sheets.push(t);
  }
  // --- remove unwanted nodes in the clone
  clone.querySelectorAll('script,noscript,iframe,object,embed,link,style,base,template,frame,frameset').forEach(n => n.remove());
  clone.querySelectorAll('meta[http-equiv],meta[name=robots],meta[name=viewport]').forEach(n => n.remove());
  const hid = clone.querySelectorAll('img[width="1"][height="1"],img[src*="pixel" i],img[src*="beacon" i]');
  hid.forEach(n => n.remove());
  // --- per element
  const imgW = {};
  for (const [e, c] of pairs) {
    if (!c || !clone.contains(c)) continue;
    for (const a of [...c.attributes]) {
      const n = a.name.toLowerCase();
      if (n.startsWith('on')) c.removeAttribute(a.name);
      else if (n === 'integrity' || n === 'crossorigin' || n === 'nonce' || n === 'loading' || n === 'decoding' || n === 'fetchpriority') c.removeAttribute(a.name);
    }
    const tag = c.tagName.toLowerCase();
    if (tag === 'img') {
      let src = e.currentSrc || e.src || '';
      if (src && !src.startsWith('data:')) { src = abs(src); urls.add(src); const w = e.getBoundingClientRect().width; imgW[src] = Math.max(imgW[src] || 0, w); }
      c.setAttribute('src', src); c.removeAttribute('srcset'); c.removeAttribute('sizes');
    }
    if (tag === 'source') c.remove();
    if (tag === 'canvas') {
      const r = e.getBoundingClientRect();
      if (r.width > 4 && r.height > 4) {
        try {
          const im = document.createElement('img'); im.src = e.toDataURL('image/png');
          im.setAttribute('style', (c.getAttribute('style') || '') + `;width:${r.width}px;height:${r.height}px`);
          if (c.className) im.className = c.className;
          c.replaceWith(im);
        } catch { c.remove() }
      } else c.remove();
    }
    if (tag === 'video' || tag === 'audio') { c.removeAttribute('autoplay'); c.querySelectorAll('source').forEach(s => s.remove()); const p = e.poster; if (p) { c.setAttribute('poster', abs(p)); urls.add(abs(p)) } c.removeAttribute('src'); }
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      if (tag === 'input' && !['checkbox','radio','hidden'].includes((e.type||'').toLowerCase())) { c.removeAttribute('value'); }
      if (tag === 'textarea') c.textContent = '';
      c.removeAttribute('autofocus'); c.removeAttribute('checked');
    }
    if (tag === 'form') { c.removeAttribute('action'); c.removeAttribute('method'); c.removeAttribute('target'); c.removeAttribute('enctype'); }
    if (tag === 'button' || tag === 'input') { c.removeAttribute('formaction'); c.removeAttribute('formmethod'); }
    if (tag === 'a' || tag === 'area') {
      if (c.hasAttribute('href')) { const h = c.getAttribute('href'); if (/^\s*javascript:/i.test(h)) c.setAttribute('href', '#'); else if (!h.startsWith('#')) { const a = abs(h); if (a && /^https?:/.test(a)) c.setAttribute('href', a); } }
      c.removeAttribute('ping'); c.removeAttribute('target'); c.removeAttribute('download');
    }
    if (c.hasAttribute && c.hasAttribute('style')) {
      c.setAttribute('style', fixCss(c.getAttribute('style'), base));
    }
    if (c.getAttribute && c.getAttribute('data-sim-x')) c.removeAttribute('data-sim-x');
    if (tag === 'use' || (c.namespaceURI === 'http://www.w3.org/2000/svg' && tag === 'use')) {
      const h = c.getAttribute('href') || c.getAttribute('xlink:href') || '';
      if (h && !h.startsWith('#')) { const a = abs(h.split('#')[0]); urls.add(a); c.setAttribute('data-use-src', a); c.setAttribute('data-use-id', h.split('#')[1] || ''); c.removeAttribute('xlink:href'); c.setAttribute('href', '#'); }
    }
    for (const at of ['poster']) { /* handled */ }
  }
  for (const f of fonts.values()) {
    let t = '@font-face{';
    const lo = Math.min(...f.w), hi = Math.max(...f.w); t += `font-weight:${lo === hi ? lo : lo + ' ' + hi};`;
    for (const pr of ['font-family','font-style','font-stretch','font-display','font-variation-settings']) { const v = f.st.getPropertyValue(pr); if (v) t += `${pr}:${v};`; }
    t += `src:${f.fx};`; if (f.ur) t += `unicode-range:${f.ur};`;
    sheets.unshift(t + '}');
  }
  window.__clone = clone; window.__sheets = sheets; window.__imgW = imgW;
  return { urls: [...urls], imgW };
}
"""

FINAL_JS = r"""
(map) => {
  const clone = window.__clone;
  const sub = t => t.replace(/url\(\s*"([^"]*)"\s*\)/g, (m, u) => map[u] ? `url("${map[u]}")` : (/^(data:|#)/.test(u) ? m : 'url(data:,)'));
  const head = clone.querySelector('head') || clone.insertBefore(document.createElement('head'), clone.firstChild);
  const mk = (n, a) => { const e = document.createElement(n); for (const k in a) e.setAttribute(k, a[k]); return e };
  head.prepend(mk('meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }));
  head.prepend(mk('meta', { name: 'robots', content: 'noindex,nofollow' }));
  head.prepend(mk('meta', { charset: 'utf-8' }));
  // data: URIs used more than once in CSS go into custom properties (one copy, many uses)
  const sheetsT = window.__sheets.map(sub);
  const cnt = {};
  const re = /url\("(data:[^"]{3000,})"\)/g;
  for (const t of sheetsT) for (const m of t.matchAll(re)) if (!/^@font-face/.test(t.slice(Math.max(0, m.index - 400), m.index).split('}').pop())) cnt[m[1]] = (cnt[m[1]] || 0) + 1;
  const vars = {}; let vi = 0, decl = '';
  const dedup = t => t.replace(re, (m, d) => { if ((cnt[d] || 0) < 2 || /src:[^;{}]*$/.test(t.slice(0, t.indexOf(m) + 1).split(/[;{]/).pop() || '')) return m; if (!(d in vars)) { vars[d] = '--sd' + (vi++); decl += `${vars[d]}:url("${d}");`; } return `var(${vars[d]})`; });
  const outs = sheetsT.map(dedup);
  if (decl) { const s = document.createElement('style'); s.textContent = ':root{' + decl + '}'; head.appendChild(s); }
  for (const t of outs) { const s = document.createElement('style'); s.textContent = t; head.appendChild(s); }
  // images
  clone.querySelectorAll('img').forEach(i => { const s = i.getAttribute('src'); if (s && map[s]) i.setAttribute('src', map[s]); else if (s && !s.startsWith('data:')) i.remove(); });
  clone.querySelectorAll('video[poster]').forEach(v => { const p = v.getAttribute('poster'); if (map[p]) v.setAttribute('poster', map[p]); else v.removeAttribute('poster'); });
  clone.querySelectorAll('[style]').forEach(e => e.setAttribute('style', sub(e.getAttribute('style'))));
  // svg <use> with external file: inline referenced symbol
  const body = clone.querySelector('body');
  const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  holder.setAttribute('style', 'display:none;position:absolute;width:0;height:0'); let n = 0;
  clone.querySelectorAll('[data-use-src]').forEach(u => {
    const src = u.getAttribute('data-use-src'), id = u.getAttribute('data-use-id');
    const d = map[src]; u.removeAttribute('data-use-src'); u.removeAttribute('data-use-id');
    if (!d) { u.remove(); return }
    try {
      const txt = atob(d.split(',')[1]);
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      const el = id ? doc.getElementById(id) : doc.documentElement;
      if (!el) { u.remove(); return }
      const nid = 'u' + (n++); const imp = document.importNode(el, true); imp.setAttribute('id', nid);
      const sym = imp.tagName.toLowerCase() === 'svg' ? (() => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'symbol'); [...imp.attributes].forEach(a => a.name !== 'id' && s.setAttribute(a.name, a.value)); s.setAttribute('id', nid); while (imp.firstChild) s.appendChild(imp.firstChild); return s })() : imp;
      holder.appendChild(sym); u.setAttribute('href', '#' + nid);
    } catch { u.remove() }
  });
  if (holder.childNodes.length && body) body.prepend(holder);
  return '<!DOCTYPE html>\n' + clone.outerHTML;
}
"""


def to_data_uri(body, ctype, url, disp=None):
    ctype = (ctype or '').split(';')[0].strip().lower()
    if not ctype or ctype == 'application/octet-stream':
        ext = url.split('?')[0].rsplit('.', 1)[-1].lower()
        ctype = {'woff2': 'font/woff2', 'woff': 'font/woff', 'ttf': 'font/ttf', 'otf': 'font/otf', 'svg': 'image/svg+xml',
                 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'webp': 'image/webp', 'gif': 'image/gif'}.get(ext, ctype)
    is_font = 'font' in ctype or url.split('?')[0].rsplit('.', 1)[-1].lower() in ('woff', 'woff2', 'ttf', 'otf', 'eot')
    if is_font and len(body) > MAX_FONT:
        return None
    if ctype in ('image/png', 'image/jpeg', 'image/webp', 'image/gif') and (len(body) > 60_000):
        try:
            from PIL import Image
            im = Image.open(io.BytesIO(body)); im.load()
            animated = getattr(im, 'n_frames', 1) > 1
            if ctype == 'image/gif' and not animated and len(body) <= MAX_IMG:
                raise Exception('keep')
            cap = min(1200, max(int((disp or 0) * 2), 96)) if disp else 1000
            if im.width > cap:
                im = im.resize((cap, max(1, round(im.height * cap / im.width))))
            buf = io.BytesIO()
            if im.mode in ('RGBA', 'LA', 'P') and (ctype in ('image/png', 'image/gif', 'image/webp')):
                im.convert('RGBA').save(buf, 'WEBP', quality=80); ctype = 'image/webp'
            else:
                im.convert('RGB').save(buf, 'JPEG', quality=76, optimize=True); ctype = 'image/jpeg'
            if len(buf.getvalue()) < len(body): body = buf.getvalue()
        except Exception:
            pass
    return f"data:{ctype};base64,{base64.b64encode(body).decode()}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('url'); ap.add_argument('out')
    ap.add_argument('--shot'); ap.add_argument('--click', action='append', default=[]); ap.add_argument('--hide', action='append', default=[])
    ap.add_argument('--wait', type=float, default=2.0)
    a = ap.parse_args()
    with sync_playwright() as p:
        dev = p.devices['Pixel 7']
        b = p.chromium.launch(args=['--disable-web-security', '--disable-blink-features=AutomationControlled'][:1])
        ctx = b.new_context(**dev, locale='en-MY', timezone_id='Asia/Kuala_Lumpur')
        page = ctx.new_page()
        try:
            page.goto(a.url, wait_until='load', timeout=60000)
        except Exception as e:
            print('goto warning:', e)
        try: page.wait_for_load_state('networkidle', timeout=20000)
        except Exception: pass
        page.wait_for_timeout(int(a.wait * 1000))
        # consent / promo
        for sel in a.click:
            try: page.locator(sel).first.click(timeout=3000)
            except Exception as e: print('click failed', sel, e)
        for role in ('button', 'link'):
            for el in page.get_by_role(role).all()[:80]:
                try:
                    t = (el.inner_text(timeout=300) or el.get_attribute('aria-label') or '').strip()
                    if t and len(t) < 40 and REJECT.match(t) and el.is_visible():
                        el.click(timeout=1500); page.wait_for_timeout(500); print('clicked:', t); break
                except Exception: pass
        page.wait_for_timeout(500)
        # lazy load
        h = page.evaluate('document.documentElement.scrollHeight')
        y = 0
        while y < min(h, 30000):
            y += 500; page.evaluate(f'window.scrollTo(0,{y})'); page.wait_for_timeout(150)
            h = page.evaluate('document.documentElement.scrollHeight')
        page.wait_for_timeout(800)
        try: page.wait_for_load_state('networkidle', timeout=8000)
        except Exception: pass
        page.evaluate('window.scrollTo(0,0)'); page.wait_for_timeout(600)
        txt = page.evaluate('document.body ? document.body.innerText.slice(0,1500) : ""')
        if re.search(r'captcha|/verify|anti_bot|challenge', page.url, re.I) or (BLOCKED.search(txt) and len(txt) < 600):
            print('BLOCKED: page looks like a bot-check / CAPTCHA / access-denied page:', txt[:200].replace('\n', ' '))
            sys.exit(3)
        print('final url:', page.url, '| title:', page.title())
        if a.shot: page.screenshot(path=a.shot, full_page=False)
        prep = page.evaluate(PREP_JS); urls = prep['urls']; imgw = prep['imgW']
        mp = {}
        has_woff2 = any(re.search(r'\.woff2(\?|#|$)', u) for u in urls)
        for u in urls:
            if not u.startswith('http'): continue
            if has_woff2 and re.search(r'\.(woff|ttf|otf|eot)(\?|#|$)', u): continue  # keep just the woff2 copy
            try:
                r = ctx.request.get(u, headers={'Referer': a.url}, timeout=20000)
                if r.ok and 'text/html' not in (r.headers.get('content-type') or ''):  # SPA 404 fallbacks return HTML
                    if r.body()[:300].lstrip().lower().startswith((b'<!doctype html', b'<html')): continue
                    d = to_data_uri(r.body(), r.headers.get('content-type'), u, imgw.get(u))
                    if d: mp[u] = d
            except Exception as e:
                pass
        for u, d in sorted(mp.items(), key=lambda kv: -len(kv[1]))[:5]: print('  big resource: %4d KB  %s' % (len(d) // 1024, u[:110]))
        html = page.evaluate(FINAL_JS, mp)
        if a.hide:
            html = html.replace('</head>', '<style>' + ','.join(a.hide) + '{display:none!important}</style></head>', 1)
        html = re.sub(r'<(/?)(script|noscript)\b', r'<\1x-removed', html, flags=re.I) if re.search(r'<script|<noscript', html, re.I) else html
        open(a.out, 'w', encoding='utf-8').write(html)
        print(f'wrote {a.out}: {len(html)/1024:.0f} KB, {len(mp)}/{len(urls)} resources inlined')
        b.close()

if __name__ == '__main__':
    main()
