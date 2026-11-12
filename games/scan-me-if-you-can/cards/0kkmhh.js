SimCards.register({
  slug: '0kkmhh',
  brand: 'XMUM Moodle',
  real: true,
  url: 'https://l.xmu.edu.my/login/index.php',
  cert: {
    secure: true,
    issuedTo: '*.xmu.edu.my',
    org: null,
    issuer: 'Sectigo Public Server Authentication CA DV R36',
    validFrom: '19 Oct 2026', validTo: '5 May 2027',
  },
  css: `
  .page{min-height:100%;background:linear-gradient(135deg,#e9ecf1,#d5dae2);font-family:"Roboto",Arial,sans-serif;color:#1d2125;font-size:15px}
  .login{padding:28px 14px 40px}
  .card{background:#fff;border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,.18);padding:28px 24px 28px}
  .logo{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:22px;color:#0f2a6b}
  .logo .t{font-family:Georgia,"Times New Roman",serif;font-size:12.5px;letter-spacing:.8px;line-height:1.15;text-align:left}
  .logo .t b{display:block;font-size:13px;font-weight:400}
  .logo .t i{display:block;font-style:normal;font-size:11px;letter-spacing:1px;margin-top:2px}
  input.f{width:100%;height:44px;border:1px solid #8f959e;border-radius:4px;padding:0 12px;font-size:17px;margin-bottom:12px;background:#fff}
  .go{width:100%;height:46px;background:#0f47ad;color:#fff;border:0;border-radius:4px;font-size:17px}
  .lost{display:block;text-align:center;color:#0f47ad;text-decoration:none;margin:16px 0 20px;font-size:16px}
  ul{margin:0 0 28px 24px;padding:0;line-height:1.45}
  .opts{display:flex;gap:22px;font-size:14px;color:#0f47ad;padding-left:8px}
  .opts a{color:#0f47ad;text-decoration:none}
  .nav{background:#fff;border-bottom:1px solid #dee2e6;display:flex;align-items:center;gap:12px;padding:8px 14px;height:56px}
  .nav .burger{font-size:22px;color:#495057}
  .nav .brand{font-family:Georgia,serif;font-size:15px;color:#0f2a6b;flex:1}
  .nav .u{width:32px;height:32px;border-radius:50%;background:#0f47ad;color:#fff;display:grid;place-items:center;font-size:13px}
  .dash{padding:16px 14px;background:#f8f9fa;min-height:700px}
  h2{font-size:22px;margin:0 0 14px;font-weight:400}
  .blk{background:#fff;border:1px solid #dee2e6;border-radius:6px;padding:14px;margin-bottom:14px}
  .blk h3{margin:0 0 10px;font-size:16px;font-weight:700}
  .course{border:1px solid #dee2e6;border-radius:6px;overflow:hidden;margin-bottom:10px;background:#fff}
  .course .img{height:60px}
  .course .b{padding:8px 12px;font-size:14px}
  .course .b small{color:#6a737b;display:block;margin-top:2px}
  .bar{height:6px;background:#e9ecef;border-radius:3px;margin-top:6px}
  .bar i{display:block;height:100%;background:#0f47ad;border-radius:3px}
  .ev{font-size:14px;padding:8px 0;border-top:1px solid #eee}
  .ev:first-of-type{border-top:0}
  .ev small{color:#6a737b;display:block}
  a.out{color:#0f47ad;text-decoration:none;font-size:14px}
  `,
  pages: {
    '/login/index.php': `
    <div class="login"><div class="card">
      <div class="logo">
        <svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="#0f2a6b" stroke-width="2"/><circle cx="23" cy="23" r="15" fill="none" stroke="#0f2a6b" stroke-width="1"/><path d="M13 30l5-12 5 7 5-9 4 14z" fill="#0f2a6b"/></svg>
        <div class="t"><b>XIAMEN UNIVERSITY MALAYSIA</b><i>厦門大學馬來西亞分校</i></div>
      </div>
      <form data-sim-next="/my/">
        <input class="f" type="text" placeholder="Username" autocomplete="off">
        <input class="f" type="password" placeholder="Password" autocomplete="off">
        <button class="go" type="submit">Log in</button>
        <a class="lost" href="/login/forgot_password.php">Lost password?</a>
      </form>
      <ul><li>Use your <b>Campus ID &amp; password</b> to access this system.</li></ul>
      <div class="opts"><a href="/lang">English &#8203;(en)&#8203; &#9662;</a><a href="/cookies">&#9432; Cookies notice</a></div>
    </div></div>`,
    '/my/': `
    <div class="nav"><span class="burger">&#9776;</span><span class="brand">XMUM Moodle</span><span class="u">S</span></div>
    <div class="dash">
      <h2>Dashboard</h2>
      <div class="blk"><h3>Timeline</h3>
        <div class="ev">Quiz 2 closes<small>Today, 23:59 &middot; PHY310</small></div>
        <div class="ev">Reflection submission is due<small>Tomorrow, 17:00 &middot; MPU4.1</small></div>
        <div class="ev">Tutorial 6 is due<small>Next week &middot; PHY301</small></div>
      </div>
      <div class="blk"><h3>Course overview</h3>
        <div class="course"><div class="img" style="background:#7a8cc9"></div><div class="b">PHY301 Thermodynamics &amp; Statistical Physics<small>2026/09</small><div class="bar"><i style="width:40%"></i></div></div></div>
        <div class="course"><div class="img" style="background:#c98a7a"></div><div class="b">PHY310 Quantum Mechanics II<small>2026/09</small><div class="bar"><i style="width:35%"></i></div></div></div>
        <a class="out" href="/my/courses.php">View all courses</a>
      </div>
    </div>`,
    '/login/forgot_password.php': `<div class="login"><div class="card"><p>Enter your Campus ID to reset your password.</p><form><input class="f" type="text" placeholder="Username"><button class="go" type="submit">Search</button></form><a class="lost" href="/login/index.php">Back to log in</a></div></div>`,
    '/404': `<div class="login"><div class="card"><p>This page is not part of the simulation.</p><a class="lost" href="/login/index.php">Back to log in</a></div></div>`,
  },
  tells: [
    'The address ends in xmu.edu.my, XMUM\'s own domain. The one-letter subdomain "l" looks odd but is genuinely how XMUM names its Moodle.',
    'The certificate is a domain-validated wildcard for *.xmu.edu.my from Sectigo. Nothing in the host or certificate points anywhere else.',
    'It asks only for your Campus ID and password on a login page, with no urgent warning, prize or extra personal-detail request.',
  ],
});
