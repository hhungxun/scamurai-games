SimCards.register({
  slug: 'xazv10',
  brand: 'WhatsApp Web',
  real: false,
  url: 'https://web.wһatsapp.com/',
  cert: {
    secure: true,
    issuedTo: 'web.wһatsapp.com',
    org: null,
    issuer: "Let's Encrypt R12",
    validFrom: '9 Nov 2026', validTo: '7 Feb 2027',
  },
  css: `
  .page{background:#f0f2f5;font-family:"Segoe UI",Helvetica,Arial,sans-serif;color:#111b21;min-height:100%}
  .band{background:#00a884;height:120px}
  .top{display:flex;align-items:center;gap:8px;color:#fff;font-weight:600;font-size:15px;letter-spacing:.5px;padding:18px 16px 0;position:absolute}
  .card{background:#fff;margin:-64px 14px 0;border-radius:10px;padding:24px 20px 26px;box-shadow:0 2px 12px rgba(0,0,0,.15);position:relative}
  h1{font-size:21px;font-weight:400;margin:0 0 10px}
  p{font-size:14px;color:#54656f;line-height:1.55;margin:0 0 14px}
  .in{width:100%;height:46px;border:1px solid #d1d7db;border-radius:8px;padding:0 12px;font-size:16px;margin-bottom:12px}
  .codes{display:flex;gap:8px;margin:6px 0 16px}
  .codes input{flex:1;min-width:0;height:50px;border:1px solid #d1d7db;border-radius:8px;text-align:center;font-size:22px}
  .btn{display:block;width:100%;height:44px;border:0;border-radius:22px;background:#00a884;color:#fff;font-size:15px;font-weight:600}
  .warn{background:#fff8e1;border-radius:8px;padding:10px 12px;font-size:13px;color:#7a5b00;margin-bottom:14px;line-height:1.45}
  .tm{color:#d33;font-weight:700}
  a.s{color:#008069;font-size:14px;text-decoration:none;display:block;text-align:center;margin-top:14px}
  .steps{font-size:14px;color:#3b4a54;line-height:1.7;margin:0 0 14px;padding-left:18px}
  .foot{text-align:center;font-size:12px;color:#667781;padding:22px 16px 28px}
  `,
  pages: {
    '/': `
    <div class="band"></div>
    <div class="top"><svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M12 4a8 8 0 0 0-6.900 12L4 20l4.100-1.100A8 8 0 1 0 12 4z" fill="#00a884"/><path d="M9 8.500c.5 2.500 2.500 5 5.500 6l1.200-1.200-1.800-1-.9.700c-.8-.4-1.600-1.200-2-2l.7-.9-1-1.800z" fill="#fff"/></svg>WHATSAPP WEB</div>
    <div class="card">
      <h1>Link your device</h1>
      <p>To keep your WhatsApp account active, link this browser. Enter your phone number and we will send you a code.</p>
      <form data-sim-next="/code">
        <input class="in" type="text" placeholder="+60 phone number" autocomplete="off">
        <button class="btn" type="submit">Send code</button>
      </form>
      <a class="s" href="/qr">Link with QR code instead</a>
    </div>
    <div class="foot">Your personal messages are end-to-end encrypted</div>`,
    '/code': `
    <div class="band"></div>
    <div class="top"><svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M12 4a8 8 0 0 0-6.900 12L4 20l4.100-1.100A8 8 0 1 0 12 4z" fill="#00a884"/></svg>WHATSAPP WEB</div>
    <div class="card">
      <h1>Enter the 6-digit code</h1>
      <p>We sent you a 6-digit code by SMS. Enter it to link your device.</p>
      <div class="warn">Code expires in <span class="tm" data-sim-countdown="179">03:00</span>. Your account will be unlinked if the code is not entered.</div>
      <form data-sim-next="/done">
        <div class="codes"><input maxlength="1"><input maxlength="1"><input maxlength="1"><input maxlength="1"><input maxlength="1"><input maxlength="1"></div>
        <button class="btn" type="submit">Link device</button>
      </form>
      <a class="s" href="/">Resend code</a>
    </div>`,
    '/qr': `
    <div class="band"></div>
    <div class="card"><h1>Scan to log in</h1><ol class="steps"><li>Open WhatsApp on your phone</li><li>Tap Menu &rsaquo; Linked devices</li><li>Point your phone at this screen</li></ol><a class="s" href="/">Link with phone number instead</a></div>`,
    '/done': `<div class="band"></div><div class="card"><h1>Device linked</h1><p>Simulation ends here. In a real scam, that code was your login code: the attacker would now be in your WhatsApp and could message your contacts.</p></div>`,
    '/404': `<div class="card"><p>Page not found.</p><a class="s" href="/">Back</a></div>`,
  },
  tells: [
    'One letter in the address is not an English "h". It is a look-alike Cyrillic letter, which is why the address bar shows web.xn--watsapp-uch.com instead of web.whatsapp.com.',
    'WhatsApp Web links by QR code scanned from the phone, or by a code shown on the website for you to type into your phone. It never asks you to type a code that was sent to you into a website.',
    'That code is your login code. Typing it into someone else\'s page hands them your account, and the "code expires" timer is there to rush you.',
  ],
});
