SimCards.register({
  slug: '8uubgu',
  brand: 'Google',
  real: true,
  url: 'https://accounts.google.com/',
  cert: {
    secure: true,
    issuedTo: 'accounts.google.com',
    org: null,
    issuer: 'WE2 (Google Trust Services)',
    validFrom: '3 Nov 2026', validTo: '26 Jan 2027',
  },
  css: `
  .page{min-height:100%;background:#fff;color:#202124;font-family:"Google Sans",Roboto,Arial,sans-serif;padding:24px 24px 0;display:flex;flex-direction:column;min-height:640px}
  .g{width:40px;height:40px;display:block;margin-bottom:20px}
  h1{font-size:28px;font-weight:400;margin:0 0 12px;line-height:1.2}
  .sub{font-size:16px;margin:0 0 36px}
  .field{position:relative;margin-bottom:8px}
  .field input{width:100%;height:56px;border:1px solid #747775;border-radius:4px;padding:0 14px;font-size:16px;background:#fff;color:#202124}
  .field label{position:absolute;left:12px;top:-9px;background:#fff;padding:0 4px;font-size:12px;color:#0b57d0}
  .field input:focus{outline:2px solid #0b57d0;border-color:#0b57d0}
  a{color:#0b57d0;text-decoration:none;font-weight:500;font-size:14px}
  .guest{font-size:14px;color:#444746;line-height:1.5;margin:40px 0 0}
  .row{display:flex;justify-content:space-between;align-items:center;margin-top:40px}
  .btn{background:#0b57d0;color:#fff;border:0;border-radius:20px;height:40px;padding:0 24px;font-size:14px;font-weight:500}
  .chip{display:inline-flex;align-items:center;gap:8px;border:1px solid #747775;border-radius:16px;padding:4px 12px 4px 4px;font-size:14px;margin-bottom:28px}
  .av{width:24px;height:24px;border-radius:50%;background:#6a4cff;color:#fff;display:grid;place-items:center;font-size:12px}
  .chk{display:flex;gap:12px;align-items:center;margin:16px 0 0;font-size:14px}
  .chk input{width:18px;height:18px}
  .foot{margin-top:auto;padding:48px 0 16px;font-size:12px;color:#444746}
  .foot .lang{font-size:12px;margin-bottom:24px;display:block}
  .foot .links{display:flex;gap:28px}
  .foot a{font-size:12px;color:#444746;font-weight:400}
  `,
  pages: {
    '/': `
    <svg class="g" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>
    <h1>Sign in</h1>
    <p class="sub">Use your Google Account</p>
    <form data-sim-next="/password">
      <div class="field"><label>Email or phone</label><input type="text" autocomplete="off"></div>
      <a href="/forgot">Forgot email?</a>
      <p class="guest">Not your computer? Use Guest mode to sign in privately. <a href="/guest">Learn more about using Guest mode</a></p>
      <div class="row"><a href="/create">Create account</a><button class="btn" type="submit">Next</button></div>
    </form>
    <div class="foot"><span class="lang">English (United States) &#9662;</span><div class="links"><a href="/help">Help</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div>`,
    '/password': `
    <svg class="g" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>
    <h1>Welcome</h1>
    <div class="chip"><span class="av">S</span>student@example.com &#9662;</div>
    <form>
      <div class="field"><label>Enter your password</label><input type="password" autocomplete="off"></div>
      <label class="chk"><input type="checkbox"> Show password</label>
      <div class="row"><a href="/forgot">Forgot password?</a><button class="btn" type="submit">Next</button></div>
    </form>
    <div class="foot"><span class="lang">English (United States) &#9662;</span><div class="links"><a href="/help">Help</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div>`,
    '/404': `<div style="padding:40px 24px;font-family:Arial,sans-serif"><p style="font-size:14px;color:#444">This page is not part of the simulation.</p><p><a href="/" style="color:#0b57d0">Back to sign in</a></p></div>`,
  },
  tells: [
    'The address is exactly accounts.google.com, Google\'s real sign-in host. Nothing is added before or after google.com.',
    'The certificate has no Organisation line. That is normal: Google\'s sign-in certificate is domain-validated and issued by Google Trust Services, so a missing company name is not a warning sign.',
    'The page asks only for an email, then a password on a second step. It does not ask for a card, ID or code up front.',
  ],
});
