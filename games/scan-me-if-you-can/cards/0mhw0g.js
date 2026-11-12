SimCards.register({
  slug: '0mhw0g',
  brand: 'Touch n Go eWallet',
  real: true,
  url: 'https://www.tngdigital.com.my/',
  cert: {"secure":true,"issuedTo":"www.tngdigital.com.my","org":"TNG Digital Sdn Bhd","issuer":"DigiCert Global G2 TLS RSA SHA256 2020 CA1","validFrom":"9 Sep 2026","validTo":"9 Sep 2027"},
  css: `
.page{background:#fff;font-size:15px;color:#0a1a4a;font-family:Inter,Arial,sans-serif}
a{color:inherit;text-decoration:none}
.hd{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,.08)}
.bg{width:24px;height:18px;border-top:3px solid #0d1b5e;border-bottom:3px solid #0d1b5e;position:relative}
.bg:after{content:"";position:absolute;left:0;right:0;top:5px;border-top:3px solid #0d1b5e}
.lg-app{width:40px;height:40px;border-radius:9px;background:linear-gradient(160deg,#7b2cbf,#005abe);color:#fff;font-size:8px;font-weight:900;font-style:italic;display:grid;place-items:center;line-height:1;text-align:center}
.sr{width:20px;height:20px;border:2px solid #0d1b5e;border-radius:50%}
.menu{display:none;background:#fff;border-bottom:1px solid #eee}
.menu.open{display:block}
.menu a{display:block;padding:13px 20px;border-bottom:1px solid #f0f0f0;font-weight:600}
.hero{background:linear-gradient(180deg,#7a4a85 0%,#4a3170 55%,#17296f 100%);color:#fff;padding:90px 20px 40px;min-height:340px}
.hero h1{font-size:31px;font-style:italic;margin:0 0 20px;line-height:1.15}
.btn{display:inline-block;background:#005abe;color:#fff;font-weight:700;border-radius:24px;padding:12px 26px}
.btn.o{background:#ffd400;color:#0d1b5e}
.sec{padding:26px 20px}
.sec h2{font-size:22px;margin:0 0 8px}
.sec p{color:#4a5378;line-height:1.5}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.tiles a{background:#f2f5ff;border-radius:14px;padding:16px 12px;font-weight:700;font-size:13px;text-align:center}
.tiles i{display:block;width:34px;height:34px;border-radius:10px;margin:0 auto 8px;background:#005abe}
.ft{background:#0d1b5e;color:#cdd3ee;padding:24px 20px;font-size:12px}
.ft a{display:block;padding:6px 0}
.ft .cp{margin-top:12px;color:#8f99c7}
.sub{background:#f2f5ff;padding:22px 20px}
.sub h1{font-size:23px;margin:0 0 6px}
.faq details,.faq .q{background:#fff;border-radius:12px;padding:14px;margin:10px 0;box-shadow:0 1px 4px rgba(0,0,0,.08);font-size:14px}
.q b{display:block;margin-bottom:4px}
.q p{margin:4px 0 0;color:#4a5378;font-size:13px;line-height:1.45}
.step{display:flex;gap:12px;margin:14px 0}
.step span{flex:none;width:28px;height:28px;border-radius:50%;background:#005abe;color:#fff;display:grid;place-items:center;font-weight:700}
.form{background:#fff;margin:18px 16px;padding:20px 16px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.12)}
.form h1{font-size:21px;margin:0 0 6px}
.form label{display:block;font-weight:600;font-size:13px;margin:14px 0 4px}
.form input{width:100%;border:1px solid #cfd5ea;border-radius:10px;padding:12px;font-size:16px}
.form .go{margin-top:18px;width:100%;background:#005abe;color:#fff;border:0;border-radius:24px;padding:13px;font-weight:700;font-size:16px}
.alert{background:#fff4d6;border:1px solid #ffd400;border-radius:10px;padding:12px;font-size:13px;margin:14px 16px 0}
.otp{display:flex;gap:8px;justify-content:center;margin:16px 0}
.otp i{width:40px;height:48px;border:1px solid #cfd5ea;border-radius:8px}
.sm{font-size:12px;color:#4a5378;margin-top:12px}
`,
  pages: {
    '/': `<header class="hd"><span class="bg" data-sim-toggle=".menu"></span><a href="/" class="lg-app">Touch<br>'n GO<br>eWallet</a><span class="sr"></span></header>
<nav class="menu"><a href="/">Home</a><a href="/help">Help &amp; FAQ</a><a href="/ekyc">What is eKYC?</a><a href="/">Download the App</a></nav><section class="hero"><h1>One app,<br>semua onz</h1><a class="btn" href="/">Download now</a></section><section class="sec"><h2>Your trusted all-in-one app</h2><p>Pay, transfer, invest and get rewards with Touch 'n Go eWallet. Everything you need, in one place.</p><div class="tiles"><a href="/"><i></i>Pay &amp; Transfer</a><a href="/"><i style="background:#7b2cbf"></i>GOrewards</a><a href="/"><i style="background:#ffb200"></i>GOinvest</a><a href="/ekyc"><i style="background:#26aa99"></i>Verify (eKYC)</a></div></section>
<section class="sec" style="background:#f2f5ff"><h2>Stay safe from scams</h2><p>TNG eWallet will never ask for your PIN or OTP. Do not share them with anyone, even someone who says they are from TNG. Verify your account only inside the app.</p><a class="btn" href="/help">Visit Help Centre</a></section><footer class="ft"><a href="/">Download the App</a><a href="/help">Help Centre</a><a href="/ekyc">eKYC</a><a href="/">Privacy Notice</a><a href="/">Terms of Use</a><div class="cp">&copy; 2026 TNG Digital Sdn Bhd. All rights reserved. TNG Digital is licensed by Bank Negara Malaysia.</div></footer>`,
    '/help': `<header class="hd"><span class="bg" data-sim-toggle=".menu"></span><a href="/" class="lg-app">Touch<br>'n GO<br>eWallet</a><span class="sr"></span></header>
<nav class="menu"><a href="/">Home</a><a href="/help">Help &amp; FAQ</a><a href="/ekyc">What is eKYC?</a><a href="/">Download the App</a></nav><section class="sub faq"><h1>Help Centre</h1><div class="q"><b>How do I verify my account (eKYC)?</b><p>Open the app, go to Profile and tap "Verify now". You will need your MyKad or passport and a selfie. We never ask you to verify through a link sent by SMS or WhatsApp.</p><a href="/ekyc" style="color:#005abe;font-weight:700;font-size:13px">Read more</a></div><div class="q"><b>Someone asked for my PIN or OTP. What do I do?</b><p>Do not share it. Contact us through the in-app Help Centre and report the incident.</p></div><div class="q"><b>What are the eWallet limits?</b><p>Limits depend on your account type and verification level. Check Profile in the app for your current limits.</p></div></section><footer class="ft"><a href="/">Download the App</a><a href="/help">Help Centre</a><a href="/ekyc">eKYC</a><a href="/">Privacy Notice</a><a href="/">Terms of Use</a><div class="cp">&copy; 2026 TNG Digital Sdn Bhd. All rights reserved. TNG Digital is licensed by Bank Negara Malaysia.</div></footer>`,
    '/ekyc': `<header class="hd"><span class="bg" data-sim-toggle=".menu"></span><a href="/" class="lg-app">Touch<br>'n GO<br>eWallet</a><span class="sr"></span></header>
<nav class="menu"><a href="/">Home</a><a href="/help">Help &amp; FAQ</a><a href="/ekyc">What is eKYC?</a><a href="/">Download the App</a></nav><section class="sub"><h1>What is eKYC?</h1><p style="color:#4a5378;line-height:1.5">eKYC (electronic Know Your Customer) lets you verify who you are inside the app, so you can unlock a higher wallet limit.</p><div class="step"><span>1</span><div>Open the TNG eWallet app and go to Profile.</div></div><div class="step"><span>2</span><div>Tap "Verify now" and scan your MyKad or passport.</div></div><div class="step"><span>3</span><div>Take a selfie. Verification is usually done within minutes.</div></div><div class="q"><b>Good to know</b><p>eKYC is done only inside the official app. TNG will never send you a link to verify.</p></div></section><footer class="ft"><a href="/">Download the App</a><a href="/help">Help Centre</a><a href="/ekyc">eKYC</a><a href="/">Privacy Notice</a><a href="/">Terms of Use</a><div class="cp">&copy; 2026 TNG Digital Sdn Bhd. All rights reserved. TNG Digital is licensed by Bank Negara Malaysia.</div></footer>`,
  },
  tells: [
    "tngdigital.com.my is the real address for Touch 'n Go eWallet, and the certificate is issued to TNG Digital Sdn Bhd.",
    "The site says eKYC is done only inside the app and that TNG never asks for your PIN or OTP, which matches how the real service works.",
    "Pages are plain information pages. Nothing asks you to type a PIN or OTP into a web form."
],
});
