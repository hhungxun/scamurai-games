SimCards.register({
  slug: 'x1qiyc',
  brand: 'Apple ID',
  real: false,
  url: 'https://appleid.apple.com.verify-account.support/',
  cert: {
    secure: true,
    issuedTo: 'appleid.apple.com.verify-account.support',
    org: null,
    issuer: "Let's Encrypt R11",
    validFrom: '10 Nov 2026', validTo: '8 Feb 2027',
  },
  css: `
  .page{background:#fff;font-family:-apple-system,"SF Pro Text","Helvetica Neue",Arial,sans-serif;color:#1d1d1f;min-height:100%}
  .top{display:flex;justify-content:center;padding:18px 0 10px}
  .wrap{padding:8px 22px 30px;max-width:420px;margin:0 auto}
  h1{font-size:26px;font-weight:600;text-align:center;margin:8px 0 8px;line-height:1.2}
  .sub{text-align:center;font-size:15px;color:#6e6e73;margin:0 0 18px;line-height:1.45}
  .lock{background:#fff4f4;border:1px solid #f3c4c4;border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.45;margin-bottom:18px;color:#7a1f1f}
  .lock b{color:#c01818}
  .in{width:100%;height:52px;border:1px solid #86868b;border-radius:12px;padding:0 14px;font-size:17px;margin-bottom:10px;background:#fff}
  .go{width:100%;height:50px;border:0;border-radius:12px;background:#0071e3;color:#fff;font-size:17px;margin-top:6px}
  a{color:#0066cc;text-decoration:none}
  .links{text-align:center;font-size:14px;margin-top:16px}
  .foot{border-top:1px solid #d2d2d7;margin-top:34px;padding-top:14px;font-size:12px;color:#6e6e73;text-align:center;line-height:1.7}
  .row{display:flex;gap:10px}.row .in{flex:1}
  `,
  pages: {
    '/': `
    <div data-sim-onload-alert="Your Apple ID has been locked for security reasons. Verify now to restore access."></div>
    <div class="top"><svg width="34" height="40" viewBox="0 0 170 200"><path fill="#1d1d1f" d="M150 106c0-24 20-36 21-37-12-17-30-19-36-20-15-2-30 9-38 9-8 0-20-9-33-9-17 0-33 10-42 25-18 31-5 77 13 102 9 12 19 26 33 26 13-1 18-8 34-8 16 0 20 8 34 8 14 0 23-12 32-25 10-14 14-28 14-29-1 0-27-10-32-62zM124 31c7-9 12-21 11-33-10 1-23 7-30 16-6 7-12 20-11 32 12 1 23-6 30-15z" transform="translate(0 12) scale(.95)"/></svg></div>
    <div class="wrap">
      <h1>Sign in with your Apple ID</h1>
      <p class="sub">Your Apple ID has been locked for security reasons.</p>
      <div class="lock"><b>Account locked.</b> We detected unusual sign-in activity from an unrecognised device. Sign in and verify your identity within <b data-sim-countdown="899">15:00</b> to restore access to iCloud, App Store and Apple Pay.</div>
      <form data-sim-next="/verify">
        <input class="in" type="text" placeholder="Apple ID" autocomplete="off">
        <input class="in" type="password" placeholder="Password" autocomplete="off">
        <button class="go" type="submit">Sign In</button>
      </form>
      <div class="links"><a href="/forgot">Forgotten Apple ID or password?</a></div>
      <div class="foot">Copyright &copy; 2026 Apple Inc. All rights reserved.<br><a href="/privacy">Privacy Policy</a> &middot; <a href="/terms">Terms of Use</a> &middot; <a href="/support">Support</a></div>
    </div>`,
    '/verify': `
    <div class="top"><svg width="34" height="40" viewBox="0 0 170 200"><path fill="#1d1d1f" d="M150 106c0-24 20-36 21-37-12-17-30-19-36-20-15-2-30 9-38 9-8 0-20-9-33-9-17 0-33 10-42 25-18 31-5 77 13 102 9 12 19 26 33 26 13-1 18-8 34-8 16 0 20 8 34 8 14 0 23-12 32-25 10-14 14-28 14-29-1 0-27-10-32-62zM124 31c7-9 12-21 11-33-10 1-23 7-30 16-6 7-12 20-11 32 12 1 23-6 30-15z" transform="translate(0 12) scale(.95)"/></svg></div>
    <div class="wrap">
      <h1>Verify your payment method</h1>
      <p class="sub">To unlock your account, confirm the card linked to your Apple ID.</p>
      <form data-sim-next="/done">
        <input class="in" type="text" placeholder="Name on card" autocomplete="off">
        <input class="in" type="text" placeholder="Card number" autocomplete="off">
        <div class="row"><input class="in" type="text" placeholder="MM/YY" autocomplete="off"><input class="in" type="text" placeholder="CVV" autocomplete="off"></div>
        <button class="go" type="submit">Verify and Unlock</button>
      </form>
      <div class="foot">Copyright &copy; 2026 Apple Inc. All rights reserved.</div>
    </div>`,
    '/done': `<div class="top"><svg width="34" height="40" viewBox="0 0 170 200"><path fill="#1d1d1f" d="M150 106c0-24 20-36 21-37-12-17-30-19-36-20-15-2-30 9-38 9-8 0-20-9-33-9-17 0-33 10-42 25-18 31-5 77 13 102 9 12 19 26 33 26 13-1 18-8 34-8 16 0 20 8 34 8 14 0 23-12 32-25 10-14 14-28 14-29-1 0-27-10-32-62zM124 31c7-9 12-21 11-33-10 1-23 7-30 16-6 7-12 20-11 32 12 1 23-6 30-15z" transform="translate(0 12) scale(.95)"/></svg></div><div class="wrap"><h1>Verification complete</h1><p class="sub">Simulation ends here. A real scam would now have your Apple ID and card details.</p></div>`,
    '/404': `<div class="wrap"><p>Page not found.</p><a href="/">Back</a></div>`,
  },
  tells: [
    'The site\'s real owner is the last part before the path: verify-account.support. "appleid.apple.com" is only a decoy at the front, and a phone address bar can cut the tail off.',
    'Apple does not lock an account and then demand a card number and CVV to unlock it. Sign-in pages never ask for your full card details.',
    'The pop-up and the 15 minute countdown are pressure. Apple\'s real sign-in host is appleid.apple.com with nothing after apple.com.',
  ],
});
