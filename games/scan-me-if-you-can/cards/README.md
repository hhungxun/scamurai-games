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
- Real cards copy the live site's mobile layout as it looked in Nov 2026, at its true address.
- Fake cards look polished. Leave 1–3 tells, and keep them subtle: the game is meant to be hard.
- No working forms, no real personal data, no real phone numbers or account numbers (use obviously fake ones).
- Public Bank appears only as a Real card and is never faked (they are our sponsor).
