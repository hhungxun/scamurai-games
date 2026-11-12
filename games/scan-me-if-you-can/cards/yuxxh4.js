SimCards.register({
  slug: 'yuxxh4',
  brand: 'Tenaga Nasional',
  real: false,
  url: 'https://tnb-rebate.com.my/',
  cert: {
    secure: true,
    issuedTo: 'tnb-rebate.com.my',
    org: null,
    issuer: "Let's Encrypt R13",
    validFrom: '6 Nov 2026', validTo: '4 Feb 2027',
  },
  css: `
  .page{background:#f5f6f8;font-family:"Segoe UI",Roboto,Arial,sans-serif;color:#1c2833;min-height:100%}
  .top{background:#fff;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:3px solid #e30613}
  .logo{display:flex;align-items:center;gap:8px;font-weight:800;color:#e30613;font-size:20px;letter-spacing:.5px}
  .logo small{display:block;font-size:9px;color:#444;font-weight:500;letter-spacing:.2px}
  .menu{font-size:22px;color:#444}
  .hero{background:linear-gradient(160deg,#e30613,#a1020c);color:#fff;padding:24px 18px 30px}
  .tag{display:inline-block;background:#ffd400;color:#222;font-size:11px;font-weight:700;border-radius:3px;padding:3px 8px;margin-bottom:10px}
  .hero h1{margin:0 0 8px;font-size:26px;line-height:1.15}
  .hero p{margin:0;font-size:14px;opacity:.95;line-height:1.45}
  .amt{font-size:44px;font-weight:800;color:#ffd400;margin:6px 0}
  .cd{margin:14px 18px 0;background:#fff;border-radius:8px;padding:12px;text-align:center;font-size:13px;box-shadow:0 1px 6px rgba(0,0,0,.12);margin-top:-16px;position:relative}
  .cd b{color:#e30613;font-size:20px}
  .box{background:#fff;margin:14px;border-radius:8px;padding:16px;box-shadow:0 1px 5px rgba(0,0,0,.1)}
  .box h2{font-size:17px;margin:0 0 4px}
  .box p.s{font-size:13px;color:#667;margin:0 0 8px}
  label{display:block;font-size:13px;margin:10px 0 4px}
  input.f{width:100%;height:42px;border:1px solid #b9c0c8;border-radius:5px;padding:0 10px;font-size:15px}
  .btn{display:block;width:100%;margin-top:14px;height:46px;background:#e30613;color:#fff;border:0;border-radius:5px;font-size:16px;font-weight:700;text-align:center;line-height:46px;text-decoration:none}
  .banks{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
  .banks a{display:flex;align-items:center;gap:8px;border:1px solid #d3d8de;border-radius:6px;padding:10px;font-size:13px;color:#222;text-decoration:none;font-weight:600}
  .banks i{width:22px;height:22px;border-radius:5px;display:block}
  .steps{display:flex;gap:6px;margin:0 0 12px;font-size:11px;color:#778}.steps b{color:#e30613}
  .foot{text-align:center;font-size:11px;color:#778;padding:18px 16px 28px;line-height:1.6}
  `,
  pages: {
    '/': `
    <div class="top"><div class="logo"><svg width="34" height="34" viewBox="0 0 34 34"><rect width="34" height="34" rx="7" fill="#e30613"/><path d="M19 4L9 19h7l-2 11 11-16h-7z" fill="#ffd400"/></svg><div>TNB<small>Tenaga Nasional Berhad</small></div></div><span class="menu">&#9776;</span></div>
    <div class="hero"><span class="tag">PROGRAM KHAS 2026</span>
      <h1>Rebat Elektrik<br>Isi Rumah B40 / M40</h1>
      <div class="amt">RM300</div>
      <p>Tuntut rebat bil elektrik anda sebelum <b>30 Nov</b>. Dikreditkan terus ke akaun bank dalam 24 jam.</p></div>
    <div class="cd">Tempoh tuntutan tamat dalam <b data-sim-countdown="1799">30:00</b></div>
    <div class="box"><div class="steps"><b>1. Semakan</b> &rsaquo; 2. Bank &rsaquo; 3. Selesai</div>
      <h2>Semak kelayakan anda</h2><p class="s">Masukkan maklumat pemegang akaun TNB.</p>
      <form data-sim-next="/bank">
        <label>No. Kad Pengenalan</label><input class="f" type="text" placeholder="000000-00-0000" autocomplete="off">
        <label>No. Akaun TNB</label><input class="f" type="text" placeholder="12 digit" autocomplete="off">
        <label>No. Telefon</label><input class="f" type="text" autocomplete="off">
        <button class="btn" type="submit">Semak &amp; Tuntut Rebat</button>
      </form></div>
    <div class="foot">Hakcipta &copy; 2026 Program Rebat Pengguna<br>Syarat &amp; Terma &middot; Privasi &middot; Hubungi</div>`,
    '/bank': `
    <div class="top"><div class="logo"><svg width="34" height="34" viewBox="0 0 34 34"><rect width="34" height="34" rx="7" fill="#e30613"/><path d="M19 4L9 19h7l-2 11 11-16h-7z" fill="#ffd400"/></svg><div>TNB<small>Tenaga Nasional Berhad</small></div></div><span class="menu">&#9776;</span></div>
    <div class="box"><div class="steps">1. Semakan &rsaquo; <b>2. Bank</b> &rsaquo; 3. Selesai</div>
      <h2>Anda layak menerima RM300</h2><p class="s">Pilih bank anda untuk pengesahan akaun melalui perbankan dalam talian.</p>
      <div class="banks">
        <a href="/pay"><i style="background:#f5c400"></i>Maybank2u</a>
        <a href="/pay"><i style="background:#c8102e"></i>CIMB Clicks</a>
        <a href="/pay"><i style="background:#0057a8"></i>RHB Now</a>
        <a href="/pay"><i style="background:#0b6b3a"></i>Bank Islam</a>
        <a href="/pay"><i style="background:#003b71"></i>Hong Leong</a>
        <a href="/pay"><i style="background:#d71920"></i>AmBank</a>
      </div></div>`,
    '/pay': `
    <div class="box" style="margin-top:20px"><h2>Log masuk perbankan dalam talian</h2><p class="s">Untuk mengesahkan identiti, masukkan ID dan kata laluan bank anda.</p>
      <form data-sim-next="/"><label>ID Pengguna</label><input class="f" type="text" autocomplete="off"><label>Kata laluan</label><input class="f" type="password" autocomplete="off"><button class="btn" type="submit">Sahkan</button></form></div>`,
    '/404': `<div class="box"><p>Halaman tidak dijumpai.</p><a href="/">Kembali</a></div>`,
  },
  tells: [
    'The address is tnb-rebate.com.my. TNB\'s real site is tnb.com.my, and its customer portal is mytnb.com.my. A dash joins an unrelated word to the name; it is a different owner.',
    'A "rebate" that needs your IC, TNB account number and then your online-banking login is not a rebate. Genuine government aid is not collected through a link on a page like this.',
    'The 30 minute countdown and the "claim before 30 Nov" deadline are there to rush you past checking the address.',
  ],
});
