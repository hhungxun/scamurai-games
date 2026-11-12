SimCards.register({
  slug: 'wxt50i',
  brand: 'Instagram',
  real: false,
  url: 'https://instagram.com.copyright-appeal.help/',
  cert: {
    secure: true,
    issuedTo: 'instagram.com.copyright-appeal.help',
    org: null,
    issuer: "Let's Encrypt R10",
    validFrom: '11 Nov 2026', validTo: '9 Feb 2027',
  },
  css: `
  .page{background:#fff;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#262626;min-height:100%}
  .top{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #dbdbdb}
  .wm{font-family:"Billabong","Brush Script MT","Segoe Script",cursive;font-size:30px;line-height:1}
  .top a.b{background:#0095f6;color:#fff;border-radius:8px;padding:6px 14px;font-size:14px;font-weight:600;text-decoration:none}
  .wrap{padding:22px 20px 30px}
  .badge{width:56px;height:56px;border-radius:50%;background:#ffecec;display:grid;place-items:center;margin:0 auto 14px}
  h1{font-size:21px;text-align:center;margin:0 0 8px;font-weight:600}
  .sub{text-align:center;color:#737373;font-size:14px;line-height:1.5;margin:0 0 18px}
  .note{border:1px solid #dbdbdb;border-radius:10px;padding:14px;font-size:14px;line-height:1.55;background:#fafafa}
  .note p{margin:0 0 10px}
  .note a{color:#00376b;font-weight:600;text-decoration:none}
  .tm{display:flex;justify-content:center;gap:6px;color:#ed4956;font-weight:700;margin:18px 0 4px;font-size:15px}
  .btn{display:block;width:100%;height:44px;border:0;border-radius:8px;background:#0095f6;color:#fff;font-size:15px;font-weight:600;text-align:center;line-height:44px;text-decoration:none;margin-top:14px}
  .in{width:100%;height:44px;border:1px solid #dbdbdb;border-radius:6px;background:#fafafa;padding:0 10px;font-size:14px;margin-bottom:8px}
  .or{text-align:center;color:#737373;font-size:13px;margin:16px 0}
  .foot{text-align:center;font-size:12px;color:#737373;line-height:1.8;padding:10px 16px 30px}
  `,
  pages: {
    '/': `
    <div class="top"><span class="wm">Instagram</span><a class="b" href="/login">Log in</a></div>
    <div class="wrap">
      <div class="badge"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ed4956" stroke-width="2"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.1"/></svg></div>
      <h1>Copyright infringement notice</h1>
      <p class="sub">Case #IG-CR-0000000 &middot; Action required</p>
      <div class="note">
        <p>We received a report that your account posted content that infringes copyright owned by a third party.</p>
        <p>You must <b>submit an appeal within 24 hours</b>, otherwise your account will be permanently deleted along with all photos, reels and messages.</p>
        <p>Review the policy at <a href="/appeal">help.instagram.com/copyright-policy</a> and submit your appeal below.</p>
      </div>
      <div class="tm">Time left <span data-sim-countdown="86399">24:00</span></div>
      <a class="btn" href="/login">Appeal this decision</a>
    </div>
    <div class="foot">Meta &copy; 2026<br>About &middot; Help &middot; Privacy &middot; Terms</div>`,
    '/appeal': `
    <div class="top"><span class="wm">Instagram</span><a class="b" href="/login">Log in</a></div>
    <div class="wrap"><h1>Submit your appeal</h1><p class="sub">Log in to confirm you own this account.</p><a class="btn" href="/login">Continue to log in</a></div>`,
    '/login': `
    <div class="top"><span class="wm">Instagram</span></div>
    <div class="wrap">
      <h1>Log in to appeal</h1><p class="sub">Confirm your account to continue.</p>
      <form data-sim-next="/done">
        <input class="in" type="text" placeholder="Phone number, username or email" autocomplete="off">
        <input class="in" type="password" placeholder="Password" autocomplete="off">
        <button class="btn" type="submit" style="border:0">Log in</button>
      </form>
      <div class="or">OR</div>
      <p class="sub" style="color:#00376b;font-weight:600">Forgot password?</p>
    </div>`,
    '/done': `<div class="top"><span class="wm">Instagram</span></div><div class="wrap"><h1>Appeal received</h1><p class="sub">Simulation ends here. A real scam would now hold your username and password.</p></div>`,
    '/404': `<div class="wrap"><p>Page not found.</p><a href="/">Back</a></div>`,
  },
  tells: [
    'The address starts with instagram.com but continues with .copyright-appeal.help, so the real owner is copyright-appeal.help. Instagram\'s own host is instagram.com with nothing after .com.',
    'The link in the notice says help.instagram.com, but press and hold it: it goes to the same copyright-appeal.help site. Link text can say anything.',
    'Meta does not give you 24 hours to log in or lose the account. A deadline plus a login form is the standard account-theft recipe.',
  ],
});
