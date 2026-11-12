# Site Cards

Each file here is one Site Card, named `<slug>.js`. `manifest.js` maps board numbers (1–25) to slugs. File names are random on purpose, so the phone's network tab doesn't reveal which cards are Real.

Preview any card at `../preview.html?c=<slug>`, or open `../preview.html` for the whole gallery. The preview shows the answer and the tells.

## Format

```js
SimCards.register({
  slug: 'ftfoqf',                 // must match manifest.js
  brand: 'Shopee',
  real: false,
  url: 'https://shopee-my.rewards-claim.com/',   // starting page; origin = the site
  cert: {                         // what the padlock sheet shows
    secure: true,                 // false, or an http:// url, shows "Not secure"
    issuedTo: 'shopee-my.rewards-claim.com',
    org: null,                    // Organisation (O=). Real big sites have one; free certs don't
    issuer: "Let's Encrypt R11",
    validFrom: '3 Nov 2026', validTo: '1 Feb 2027',
  },
  css: `/* scoped to this card's pages (shadow DOM) */`,
  pages: {                        // keyed by path on the site's origin
    '/': `<header>…</header>…`,
    '/login': `…`,
  },
  tells: [                        // shown after the Verdict; for Real cards, why it's genuine
    'The address is shopee-my.rewards-claim.com. Shopee Malaysia is shopee.com.my.',
  ],
});
```

## Real cards: snapshots (`{ snap }` pages)

Real cards don't hand-draw pages. Each page is an exact capture of the live site's mobile page, stored in `snap/<random8>.html` and referenced as:

```js
pages: { '/': { snap: 'a1c4e7r2.html' }, '/login': { snap: 'k9x2.html' } },   // no `css` needed
```

A snapshot is one self-contained, script-free HTML file (CSS, images, fonts inline as data URIs), shown inside a sandboxed iframe with no scripts. Links are real absolute URLs: hover or long-press shows the true target, a tap on the same host goes to that path if the card has it (otherwise the "stays on one site" toast), and form submits are blocked. File names are random so the network tab doesn't reveal brand or Real/Fake.

## Fake cards: phishing-kit-edited snapshots (`{ snap }` pages)

Fake cards are now snapshots too, so the HTML/screenshot format can't give the answer away. Each Fake starts from captures of the imitated **brand's own** real mobile pages, then edited the way a phishing kit would edit them: a lookalike address and certificate, extra steps that ask for data (card, OTP, online-banking login), and urgency cues (countdowns, deadlines), all built into the page's own components so the header, footer, fonts, logo and spacing stay the brand's. Keep 1–3 subtle tells per card. The scam HTML is stripped of scripts and the final step is a real `<button type=submit>` in a form, which the Sim Browser blocks with the "nothing you type is ever sent" toast, so the Station can never act as a working phishing kit.

Build Fakes with the editing kit under the agent scratchpad (`kit/kit.py edit`, `kit/card.py`, `kit/verify.py`): capture the brand's page, apply an edit script, and install the snaps into `snap/`.

**Hand-built Fakes (exceptions).** A few Fakes stay hand-drawn inline HTML because the brand's real page can't be captured statically:

| Slug | Brand | Why hand-built |
|---|---|---|
| `x1qiyc` | Apple | Sign-in form is injected by Apple's own JS; the static capture has only nav + footer. |
| `xazv10` | WhatsApp | WhatsApp Web (link-device/QR) is canvas/JS-rendered; the only static page is the marketing homepage. |
| `9axijx` | Microsoft 365 | Off-limits by rule: Microsoft sign-in pages are never captured or published. |
| `26onfw` | DHL | Capture hit a bot block. |
| `ftfoqf` | Shopee | Capture hit a CAPTCHA (snap.py exit 3). |
| `ywzpkv` | MySejahtera | Capture hit a suspended / access-denied page. |

Captured Fakes this round: Grab, XMUM, LHDN, TNG, Netflix, PDRM, Pos, Instagram and TNB (an electricity-rebate lure over the real TNB homepage and myTNB login). All other Fake cards still use inline HTML strings.

Capture one with `tools/snap.py` (needs `pip install playwright`, then `playwright install chromium`):

```
python3 tools/snap.py <url> cards/snap/<random8>.html [--shot check.png] [--click "CSS"]... [--hide "CSS"]... [--wait 2]
```

It loads the page as a Pixel 7, declines cookie banners, scrolls to load lazy images, inlines the rendered DOM and its CSS, and strips scripts. If the final page is a CAPTCHA or access-denied page it exits with code 3 and writes nothing; do not work around that, leave the card as it was. If a popup or banner ends up in the capture, re-run with `--click` (a close button) or `--hide` (an element with no reject option). If the live URL redirects, set the card's `url`, `cert` and `tells` to the final address. Check the result in `../preview.html?c=<slug>` against the live site. Check that the page isn't a "404 / Page not found" SPA shell served with status 200.

## What the Sim Browser gives a page

- `<a href="/path">` goes to another page on the same site. Any other host shows a "stays on one site" toast. Hover or long-press shows the real target in a status bubble, so a link's text can claim `shopee.com.my` while its `href` goes elsewhere.
- `<form data-sim-next="/otp">`: submit shows "nothing you type is ever sent", then goes to that page. Without `data-sim-next` it only shows the toast. Real and Fake behave the same.
- `data-sim-toggle=".menu"` on any element toggles class `open` on the matching elements (menus, tabs, accordions).
- `data-sim-alert="text"` on an element: clicking it shows a browser `alert()`-style dialog.
- `<div data-sim-onload-alert="text">` shows that dialog when the page loads (fake "your account is locked!" pop-ups).
- `<span data-sim-countdown="299">` is a live mm:ss countdown (fake urgency).
- Scripts in page HTML do not run. No external requests: draw logos with inline SVG or CSS, never `<img src="https://…">`.

## Rules

- The viewport is a phone, about 360–412 px wide. Design mobile-first.
- Real cards are snapshots of the live site's mobile pages (Nov 2026), at their true address. Use `tools/snap.py`; don't redraw them.
- Exception: real **sign-in pages of Google and Microsoft** stay hand-built and are never published as captures (a pixel copy of their login on our domain risks a Safe Browsing flag for the whole site). Captures of them may exist locally but are gitignored.
- Fake cards look polished. Leave 1–3 tells, and keep them subtle: the game is meant to be hard.
- No working forms, no real personal data, no real phone numbers or account numbers (use obviously fake ones).
- Public Bank appears only as a Real card and is never faked (they are our sponsor).
