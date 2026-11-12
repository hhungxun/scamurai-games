SimCards.register({
  slug: 'snwgkf',
  brand: 'Public Bank',
  real: true,
  url: 'https://www.pbebank.com/',
  cert: {"secure":true,"issuedTo":"www.pbebank.com","org":"Public Bank Berhad","issuer":"DigiCert Global G2 TLS RSA SHA256 2020 CA1","validFrom":"14 Aug 2026","validTo":"14 Aug 2027"},
  css: `
.page{background:#f4f4f4;font-size:14px;color:#222}
a{color:inherit;text-decoration:none}
.top{display:flex;gap:16px;background:#fff;padding:7px 12px;font-size:11px;font-weight:700;letter-spacing:.3px;color:#555;white-space:nowrap;overflow:hidden}
.top .on{color:#c8102e}
.hd{background:#fff;display:flex;align-items:center;padding:8px 12px;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.12)}
.logo{display:flex;align-items:center;gap:6px;flex:1}
.logo .mk{width:30px;height:30px;border-radius:50%;background:#c8102e;color:#fff;display:grid;place-items:center;font-weight:900;font-size:15px}
.logo b{font-size:11px;color:#c8102e;line-height:1.05;letter-spacing:.5px}
.logo i{font-style:normal;font-weight:900;font-size:22px;color:#c8102e;margin-left:6px}
.btnlogin{background:#c8102e;color:#fff;font-weight:700;border-radius:20px;padding:8px 18px;font-size:14px}
.burger{width:20px;height:14px;border-top:2px solid #333;border-bottom:2px solid #333;position:relative}
.burger:after{content:"";position:absolute;left:0;right:0;top:4px;border-top:2px solid #333}
.menu{display:none;background:#fff;border-top:1px solid #eee}
.menu.open{display:block}
.menu a{display:block;padding:12px 16px;border-bottom:1px solid #eee;font-weight:600}
.hero{background:linear-gradient(120deg,#8b0a20,#c8102e 60%,#e04058);color:#fff;padding:26px 16px;min-height:190px}
.hero h1{font-size:25px;margin:0 0 8px;line-height:1.15}
.hero p{margin:0 0 14px;font-size:14px}
.hero .btn{display:inline-block;border:2px solid #fff;border-radius:22px;padding:8px 22px;font-weight:700}
.dots{display:flex;gap:6px;justify-content:center;padding:8px;background:#fff}
.dots i{width:7px;height:7px;border-radius:50%;background:#ccc}.dots i:first-child{background:#c8102e}
.quick{display:grid;grid-template-columns:repeat(4,1fr);background:#fff;padding:14px 4px}
.quick a{text-align:center;font-weight:700;font-size:12px;padding:4px}
.quick .ic{width:38px;height:38px;margin:0 auto 6px;border:2px solid #c8102e;border-radius:10px;display:grid;place-items:center;color:#c8102e;font-size:18px}
.ann{background:#fff;margin-top:8px;padding:16px;text-align:center}
.ann .box{border:1px solid #ddd;padding:16px;color:#c8102e;font-weight:600;text-align:left;margin-bottom:10px}
.ann a.vm{color:#c8102e;font-weight:600;border-bottom:1px solid #c8102e}
h2{font-size:20px;color:#c8102e;margin:0 0 12px}
.new{padding:18px 16px}
.card{background:#fff;border-radius:8px;overflow:hidden;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.1)}
.card .im{height:110px;background:linear-gradient(135deg,#c8102e,#7a0a1d)}
.card .im.b{background:linear-gradient(135deg,#444,#111)}
.card .tx{padding:12px 14px}
.card h3{margin:0 0 6px;font-size:16px}
.card p{margin:0 0 8px;color:#555;font-size:13px}
.card .m{color:#c8102e;font-weight:700}
.sec{background:#fff;padding:16px;margin-top:8px}
.sec .warn{border-left:4px solid #c8102e;background:#fdeef0;padding:10px 12px;font-size:13px}
.ft{background:#2b2b2b;color:#ddd;padding:20px 16px;font-size:12px}
.ft a{display:block;padding:6px 0}
.ft .cp{margin-top:12px;color:#999}
.lg{background:#fff;margin:14px;border-radius:8px;padding:18px 16px;box-shadow:0 1px 4px rgba(0,0,0,.12)}
.lg h1{font-size:20px;color:#c8102e;margin:0 0 4px}
.lg label{display:block;font-weight:600;margin:14px 0 4px;font-size:13px}
.lg input{width:100%;border:1px solid #bbb;border-radius:6px;padding:11px;font-size:15px}
.lg .go{margin-top:16px;width:100%;background:#c8102e;color:#fff;border:0;border-radius:24px;padding:12px;font-size:16px;font-weight:700}
.lg .sm{font-size:12px;color:#555;margin-top:12px}
.lg .sm a{color:#c8102e;font-weight:600}
.lg .tip{margin-top:16px;background:#f4f4f4;border-radius:6px;padding:10px 12px;font-size:12px;color:#444}
`,
  pages: {
    '/': `<div class="top"><span class="on">PERSONAL BANKING</span><span>BUSINESS BANKING</span><span>RED CARPET BANKING</span></div>
<header class="hd"><a href="/" class="logo"><span class="mk">P</span><b>PUBLIC<br>BANK</b><i>60</i></a><a href="/pbe-login" class="btnlogin">&#128274; Login</a><span class="burger" data-sim-toggle=".menu"></span></header>
<nav class="menu"><a href="/">Personal Banking</a><a href="/">Business Banking</a><a href="/">Red Carpet Banking</a><a href="/">Rates &amp; Charges</a><a href="/">Online Security</a></nav>
<section class="hero"><h1>Celebrate With Us &amp; Win A BMW i5!</h1><p>PB 60th Diamond Jubilee Celebration Campaign</p><a class="btn" href="/">View More</a></section>
<div class="dots"><i></i><i></i><i></i><i></i><i></i><i></i></div>
<div class="quick"><a href="/"><div class="ic">$</div>Rates &amp; Charges</a><a href="/"><div class="ic">&#9998;</div>Apply Now</a><a href="/"><div class="ic">&#128737;</div>Online Security</a><a href="/"><div class="ic">&#8962;</div>Properties for Sale</a></div>
<section class="ann"><div class="box">Revision of Terms and Conditions Governing Deposit Accounts</div><a class="vm" href="/">View More Announcement</a></section>
<section class="new"><h2>What's New</h2>
<div class="card"><div class="im"></div><div class="tx"><h3>PB 60th Diamond Jubilee Celebration Campaign</h3><p>Stand to win 3 BMW i5, 60 Proton e.MAS 7, Cash Rewards and Limited Edition PB Smart Watches when you sign up or purchase the eligible products / services and fulfil the minimum criteria.</p><a class="m" href="/">View More</a></div></div>
<div class="card"><div class="im b"></div><div class="tx"><h3>Travel with MyPB App! Campaign</h3><p>Your Travel Just Got More Rewarding. Stand to win Cash Prizes when you transact with Alipay+ on MyPB App!</p><a class="m" href="/">View More</a></div></div>
</section>
<section class="sec"><h2>MyPB App</h2><p>Convenient and efficient banking at your fingertips.</p><div class="warn"><b>Beware of scams.</b> Public Bank will never ask for your username, password, PIN or TAC by phone, SMS or email. <a href="/" style="color:#c8102e;font-weight:700">Report Fraud / Scam Incident</a></div></section>
<footer class="ft"><a href="/">About Us</a><a href="/">Contact Us</a><a href="/">Online Security</a><a href="/">Privacy Notice</a><a href="/">Terms &amp; Conditions</a><div class="cp">Copyright &copy; 2026 Public Bank Berhad (196501000672 (6463-H)). All Rights Reserved.</div></footer>`,
    '/pbe-login': `<div class="top"><span class="on">PERSONAL BANKING</span><span>BUSINESS BANKING</span><span>RED CARPET BANKING</span></div>
<header class="hd"><a href="/" class="logo"><span class="mk">P</span><b>PUBLIC<br>BANK</b><i>60</i></a><a href="/pbe-login" class="btnlogin">&#128274; Login</a><span class="burger" data-sim-toggle=".menu"></span></header>
<nav class="menu"><a href="/">Personal Banking</a><a href="/">Business Banking</a><a href="/">Red Carpet Banking</a><a href="/">Rates &amp; Charges</a><a href="/">Online Security</a></nav>
<form class="lg" data-sim-next="/pbe-login">
<h1>PBe Login</h1><div style="font-size:13px;color:#555">Public Bank Online Banking</div>
<label>User ID</label><input type="text" placeholder="Enter your User ID" autocomplete="off">
<button class="go" type="submit">Next</button>
<div class="sm"><a href="/">Forgot User ID?</a> &nbsp;|&nbsp; <a href="/">Register for PBe</a></div>
<div class="tip"><b>Security tip:</b> Always type www.pbebank.com yourself or use the MyPB App. Check your SecureVerify phrase and image before entering your password.</div>
</form>
<footer class="ft"><a href="/">About Us</a><a href="/">Contact Us</a><a href="/">Online Security</a><a href="/">Privacy Notice</a><a href="/">Terms &amp; Conditions</a><div class="cp">Copyright &copy; 2026 Public Bank Berhad (196501000672 (6463-H)). All Rights Reserved.</div></footer>`,
  },
  tells: [
    "pbebank.com is Public Bank's genuine domain, registered to Public Bank Berhad. The odd \"pbe\" name is the bank's own PBe (Public Bank e-banking) brand.",
    "The certificate is issued to Public Bank Berhad, a verified organisation, and the login only asks for a User ID first, then shows your personal SecureVerify phrase before the password.",
    "The page warns you about scams and says the bank will never ask for your password, PIN or TAC."
],
});
