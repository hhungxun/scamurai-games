SimCards.register({
  slug: 'g3xb6o',
  brand: 'PDRM Semak Mule',
  real: false,
  url: 'https://semakmule-rmp.com/',
  cert: {
    secure: true,
    issuedTo: 'semakmule-rmp.com',
    org: null,
    issuer: "Let's Encrypt R12",
    validFrom: '9 Nov 2026', validTo: '7 Feb 2027',
  },
  css: `
  .page{background:#f3f5fa;font-family:"Segoe UI",Roboto,Arial,sans-serif;color:#1b2540;min-height:100%}
  .top{background:#0a1f5c;color:#fff;padding:10px 14px;display:flex;align-items:center;gap:10px}
  .top .t{font-size:11px;line-height:1.25;letter-spacing:.3px}
  .top .t b{display:block;font-size:13px}
  .gold{height:4px;background:linear-gradient(90deg,#c9a227,#f2d36b,#c9a227)}
  .hero{background:linear-gradient(180deg,#0a1f5c,#16358f);color:#fff;padding:24px 18px 28px;text-align:center}
  .hero h1{font-size:22px;margin:0 0 6px}
  .hero p{margin:0;font-size:14px;opacity:.9}
  .alert{margin:-14px 14px 14px;background:#fff;border-left:5px solid #c0182b;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.15);padding:14px}
  .alert h2{margin:0 0 6px;font-size:16px;color:#c0182b}
  .alert p{margin:0 0 6px;font-size:14px;line-height:1.45}
  .cd{font-weight:700;color:#c0182b;font-size:18px}
  .box{background:#fff;margin:14px;border-radius:8px;padding:16px;box-shadow:0 1px 5px rgba(0,0,0,.1)}
  .box h3{margin:0 0 10px;font-size:16px;color:#0a1f5c}
  label{display:block;font-size:13px;margin:10px 0 4px;color:#444}
  input.f{width:100%;height:42px;border:1px solid #aab3cc;border-radius:5px;padding:0 10px;font-size:15px}
  .btn{display:block;width:100%;margin-top:14px;height:46px;background:#0a1f5c;color:#fff;border:0;border-radius:5px;font-size:16px;font-weight:600;text-align:center;line-height:46px;text-decoration:none}
  .btn.red{background:#c0182b}
  .row{display:flex;gap:10px}.row>div{flex:1}
  .stat{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px}
  .stat div{background:#fff;border-radius:8px;padding:12px;text-align:center;font-size:12px;color:#555;box-shadow:0 1px 5px rgba(0,0,0,.08)}
  .stat b{display:block;font-size:20px;color:#0a1f5c}
  .foot{background:#0a1f5c;color:#b9c3e6;font-size:11px;text-align:center;padding:16px;margin-top:20px;line-height:1.6}
  .case{border:1px dashed #c0182b;border-radius:6px;padding:10px;font-size:14px;line-height:1.6;margin:10px 0;background:#fff7f7}
  `,
  pages: {
    '/': `
    <div class="top"><svg width="34" height="38" viewBox="0 0 34 38"><path d="M17 1l14 5v12c0 9-6 15-14 19C9 33 3 27 3 18V6z" fill="#c9a227"/><path d="M17 7l8 3v8c0 5-3 9-8 11-5-2-8-6-8-11v-8z" fill="#0a1f5c"/><circle cx="17" cy="17" r="3.5" fill="#c9a227"/></svg>
      <div class="t"><b>POLIS DIRAJA MALAYSIA</b>Portal Semakan Mule Account &amp; Status Kes</div></div>
    <div class="gold"></div>
    <div class="hero"><h1>Semak Status Kes Anda</h1><p>Sistem Semakan Jenayah Komersil Bukit Aman</p></div>
    <div class="alert"><h2>NOTIS: WARAN TANGKAP DIKESAN</h2>
      <p>Satu <b>waran tangkap</b> (No. WT/0000/2026) telah direkodkan atas nombor IC yang dikaitkan dengan akaun bank mule. Sila hubungi pegawai penyiasat dalam masa <span class="cd" data-sim-countdown="1439">24:00</span> untuk mengelakkan tangkapan.</p>
      <p>Outstanding case under your IC. Call the investigating officer now.</p></div>
    <div class="box"><h3>Semakan IC (IC Check)</h3>
      <form data-sim-next="/result">
        <label>Nama penuh / Full name</label><input class="f" type="text" autocomplete="off">
        <label>No. Kad Pengenalan / IC number</label><input class="f" type="text" placeholder="000000-00-0000" autocomplete="off">
        <label>No. Telefon</label><input class="f" type="text" autocomplete="off">
        <button class="btn" type="submit">Semak Sekarang</button>
      </form></div>
    <div class="stat"><div><b>12,408</b>Kes dirujuk bulan ini</div><div><b>24 jam</b>Tempoh respons</div></div>
    <div class="foot">Hakcipta Terpelihara &copy; 2026 Polis Diraja Malaysia<br>Dasar Privasi &middot; Terma Penggunaan &middot; Hubungi Kami</div>`,
    '/result': `
    <div class="top"><svg width="34" height="38" viewBox="0 0 34 38"><path d="M17 1l14 5v12c0 9-6 15-14 19C9 33 3 27 3 18V6z" fill="#c9a227"/><path d="M17 7l8 3v8c0 5-3 9-8 11-5-2-8-6-8-11v-8z" fill="#0a1f5c"/><circle cx="17" cy="17" r="3.5" fill="#c9a227"/></svg>
      <div class="t"><b>POLIS DIRAJA MALAYSIA</b>Portal Semakan Mule Account &amp; Status Kes</div></div>
    <div class="gold"></div>
    <div class="box" style="margin-top:18px"><h3 style="color:#c0182b">1 KES DITEMUI</h3>
      <div class="case">No. Rujukan: JSJK/0000/2026<br>Kesalahan: Pengubahan wang haram<br>Status: <b>WARAN TANGKAP AKTIF</b></div>
      <p style="font-size:14px;line-height:1.5">Sila hubungi Insp. (nama fiktif) di talian siasatan <b>03-0000 0000</b> segera. Jangan maklumkan sesiapa. Pegawai akan mengesahkan akaun bank anda untuk <b>pengesahan rasmi</b>.</p>
      <a class="btn red" data-sim-alert="Simulation: this would dial 03-0000 0000, an obviously fictional number.">Hubungi Pegawai Penyiasat</a>
    </div>
    <div class="foot">Hakcipta Terpelihara &copy; 2026 Polis Diraja Malaysia</div>`,
    '/404': `<div class="box"><p>Halaman tidak dijumpai.</p><a href="/">Kembali</a></div>`,
  },
  tells: [
    'The address is semakmule-rmp.com. The real Semak Mule portal is semakmule.rmp.gov.my; Malaysian government sites end in .gov.my, not .com.',
    'The police never tell you about a warrant on a web form or ask you to phone an "investigating officer" to settle it. A countdown to arrest is pressure, not procedure.',
    'A real status check would not ask for your IC and phone number on a site reached from a message. The portal and the number belong to the scammer.',
  ],
});
