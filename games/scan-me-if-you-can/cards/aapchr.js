SimCards.register({
  slug: 'aapchr',
  brand: 'LHDN MyTax',
  real: false,
  url: 'https://mytax-hasil.gov-my.org/',
  cert: {"secure":true,"issuedTo":"mytax-hasil.gov-my.org","org":null,"issuer":"Let's Encrypt R11","validFrom":"10 Nov 2026","validTo":"8 Feb 2027"},
  css: `
.page{background:#fff;font-size:14px;color:#222;font-family:Roboto,Arial,sans-serif}
a{color:inherit;text-decoration:none}
.hd{background:linear-gradient(#fff5f5,#fff);padding:8px 16px;display:flex;justify-content:space-between;align-items:center}
.lg{font-size:30px;font-weight:900;font-style:italic;color:#2c4aa8;letter-spacing:-1px}
.lg b{color:#7dba28}
.bt{width:34px;height:32px;border:2px solid #2c4aa8;border-radius:8px;position:relative}
.bt:before,.bt:after{content:"";position:absolute;left:7px;right:7px;top:9px;border-top:2px solid #2c4aa8}
.bt:after{top:17px}
.menu{display:none;background:#f3f6ff}
.menu.open{display:block}
.menu a{display:block;padding:12px 18px;border-bottom:1px solid #dde4f7;font-weight:500}
.slog{text-align:center;font-style:italic;font-weight:900;color:#aaa;font-size:25px;line-height:1.05;padding:26px 0 18px;text-shadow:1px 2px 3px rgba(0,0,0,.25)}
.lang{text-align:right;padding:0 18px 8px;font-size:12px}
.lang a{color:#1b3b9c;font-weight:700}
.box{margin:0 18px 14px;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,.3);border-radius:4px;padding:16px}
.box h3{margin:0 0 14px;font-size:14px}
.box select,.box input{width:100%;padding:11px;background:#f2f2f2;border:0;border-radius:3px;font-size:14px;margin-bottom:12px}
.box .go{display:block;width:100%;margin:6px 0 0;background:#00008b;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:700;box-shadow:0 3px 6px rgba(0,0,0,.35)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 14px 18px}
.grid a{text-align:center;padding:12px 6px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:15px;background:#ffeeee}
.grid a.o{background:#f0ad4e;color:#fff}
.grid i{display:block;width:34px;height:34px;border-radius:50%;background:#2b7bd8;margin:0 auto 6px}
.nws{background:#bcd9d1;padding:20px 16px}
.nws h2{margin:0 0 10px;font-size:17px;color:#1b3b9c}
.nws p{margin:0 0 8px;font-size:13px;color:#333}
.ft{background:#1b2a6b;color:#dde;padding:18px 16px;font-size:12px}
.ft a{display:block;padding:5px 0}
.ft .cp{margin-top:10px;color:#9aa4d6}
.fk{background:#fff7e0;border:1px solid #f0ad4e;margin:12px 18px;padding:12px;border-radius:4px;font-size:13px}
.rf{text-align:center;padding:18px;margin:12px 16px;background:#e9f6e9;border:1px solid #7dba28;border-radius:6px}
.rf .amt{font-size:32px;font-weight:900;color:#1b7a2b}
.bank{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px}
.bank a{background:#fff;box-shadow:0 1px 5px rgba(0,0,0,.3);border-radius:6px;padding:14px 6px;text-align:center;font-weight:700;font-size:13px}
.bank a i{display:block;width:30px;height:30px;border-radius:6px;margin:0 auto 6px;background:#2b7bd8}
h1.t{font-size:18px;padding:12px 18px 4px;margin:0;color:#1b3b9c}
.sm{font-size:12px;color:#555;padding:0 18px 12px}
`,
  pages: {
    '/': `<header class="hd"><a href="/" class="lg">My<b>Tax</b></a><span class="bt" data-sim-toggle=".menu"></span></header>
<nav class="menu"><a href="/">Laman Utama / Home</a><a href="/">Carian TIN</a><a href="/">e-Daftar</a><a href="/">ByrHASiL</a><a href="/">e-TT</a></nav><div class="slog">ANDA ADALAH<br>WIRA NEGARA</div><div class="lang"><a href="/">BM</a> | <a href="/">EN</a></div>
<div class="fk" data-sim-onload-alert="Tax refund RM1,284.60 is pending for your account."><b>Bayaran Balik Cukai / Tax Refund</b><br>Anda layak menerima bayaran balik RM1,284.60. <a href="/refund" style="color:#1b3b9c;font-weight:700;text-decoration:underline">Tuntut sekarang / Claim now</a></div>
<form class="box" data-sim-next="/refund"><h3>Sila Masukkan Maklumat Anda</h3><select><option>Sila Pilih Jenis Pengenalan</option><option>No. Kad Pengenalan</option><option>No. Pasport</option></select><input type="text" placeholder="No. Pengenalan"><button class="go" type="submit">Hantar</button></form>
<div class="grid"><a href="/"><i style="background:#8f4fb3"></i>Carian TIN</a><a class="o" href="/"><i></i>e-Daftar</a><a href="/"><i></i>ByrHASiL</a><a class="o" href="/"><i></i>e-TT</a></div>
<section class="nws"><h2>Pengumuman / Announcements</h2><p>Semakan bayaran balik cukai tahun taksiran 2025 kini dibuka.</p><p>LHDN tidak akan meminta maklumat perbankan anda melalui e-mel, SMS atau telefon.</p></section>
<footer class="ft"><a href="/">Hubungi Kami / Contact Us</a><a href="/">Dasar Privasi / Privacy Policy</a><a href="/">Penafian / Disclaimer</a><a href="/">Peta Laman / Site Map</a><div class="cp">&copy; 2026 Lembaga Hasil Dalam Negeri Malaysia (LHDN). Hak Cipta Terpelihara.</div></footer>`,
    '/refund': `<header class="hd"><a href="/" class="lg">My<b>Tax</b></a><span class="bt" data-sim-toggle=".menu"></span></header>
<nav class="menu"><a href="/">Laman Utama / Home</a><a href="/">Carian TIN</a><a href="/">e-Daftar</a><a href="/">ByrHASiL</a><a href="/">e-TT</a></nav><h1 class="t">Bayaran Balik Cukai / Tax Refund</h1><div class="rf"><div style="font-size:12px">Jumlah bayaran balik / Refund amount</div><div class="amt">RM1,284.60</div><div style="font-size:12px">Status: <b>Pending</b> &bull; Tamat dalam / Expires in <span data-sim-countdown="899">15:00</span></div></div><p class="sm">Pilih bank anda dan log masuk untuk menerima bayaran balik terus ke akaun anda. / Pick your bank and log in to receive the refund directly.</p>
<div class="bank"><a href="/login"><i></i>Bank A</a><a href="/login"><i style="background:#c8102e"></i>Bank B</a><a href="/login"><i style="background:#f5a623"></i>Bank C</a><a href="/login"><i style="background:#26aa99"></i>Bank D</a></div><footer class="ft"><a href="/">Hubungi Kami / Contact Us</a><a href="/">Dasar Privasi / Privacy Policy</a><a href="/">Penafian / Disclaimer</a><a href="/">Peta Laman / Site Map</a><div class="cp">&copy; 2026 Lembaga Hasil Dalam Negeri Malaysia (LHDN). Hak Cipta Terpelihara.</div></footer>`,
    '/login': `<header class="hd"><a href="/" class="lg">My<b>Tax</b></a><span class="bt" data-sim-toggle=".menu"></span></header>
<nav class="menu"><a href="/">Laman Utama / Home</a><a href="/">Carian TIN</a><a href="/">e-Daftar</a><a href="/">ByrHASiL</a><a href="/">e-TT</a></nav><h1 class="t">Log masuk Perbankan Internet</h1><p class="sm">Masukkan butiran anda untuk mengesahkan bayaran balik RM1,284.60.</p><form class="box" data-sim-next="/login"><input type="text" placeholder="ID Pengguna / User ID"><input type="password" placeholder="Kata Laluan / Password"><input type="text" placeholder="No. Kad Pengenalan"><button class="go" type="submit">Sahkan / Confirm</button></form><footer class="ft"><a href="/">Hubungi Kami / Contact Us</a><a href="/">Dasar Privasi / Privacy Policy</a><a href="/">Penafian / Disclaimer</a><a href="/">Peta Laman / Site Map</a><div class="cp">&copy; 2026 Lembaga Hasil Dalam Negeri Malaysia (LHDN). Hak Cipta Terpelihara.</div></footer>`,
  },
  tells: [
    "The address is mytax-hasil.gov-my.org. It ends in .org, not .gov.my. The \"gov-my\" part is just a hyphenated label put in front to look official.",
    "LHDN never asks you to pick your bank and enter your online banking login to receive a refund. Refunds are paid to the account you registered with LHDN.",
    "A surprise refund with a countdown timer is pressure. Check refund status only by typing mytax.hasil.gov.my yourself."
],
});
