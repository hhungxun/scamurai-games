SimCards.register({
  slug: 'zasr2o',
  brand: 'Shopee',
  real: true,
  url: 'https://shopee.com.my/',
  cert: {"secure":true,"issuedTo":"shopee.com.my","org":"Shopee Singapore Private Limited","issuer":"DigiCert Global G2 TLS RSA SHA256 2020 CA1","validFrom":"2 Oct 2026","validTo":"2 Oct 2027"},
  css: `
.page{background:#f5f5f5;font-size:14px;color:#222}
a{color:inherit;text-decoration:none}
.hd{background:linear-gradient(#f53d2d,#f63);padding:10px 12px;display:flex;gap:10px;align-items:center}
.sb{flex:1;background:#fff;border-radius:3px;padding:9px 10px;color:#aaa;font-size:13px}
.ic{width:24px;height:24px;border:2px solid #fff;border-radius:6px;display:inline-block}
.cats{display:flex;gap:14px;background:#fff;padding:12px;overflow:hidden;white-space:nowrap}
.cats div{text-align:center;font-size:11px;min-width:62px}
.cats i{display:block;width:40px;height:40px;border-radius:10px;margin:0 auto 4px;background:#ee4d2d;opacity:.9}
.cats i.g{background:#26aa99}.cats i.b{background:#2673dd}.cats i.y{background:#f5a623}
.ban{margin:8px 0;background:linear-gradient(120deg,#ee4d2d,#ff7337);color:#fff;padding:22px 16px}
.ban h1{margin:0;font-size:30px;font-style:italic;letter-spacing:-1px}
.ban p{margin:4px 0 12px}
.ban .cd{display:inline-block;background:#fff;color:#ee4d2d;border-radius:4px;padding:2px 8px;font-weight:700;font-family:monospace}
.ban .btn{display:inline-block;margin-top:12px;background:#fff;color:#ee4d2d;font-weight:700;border-radius:3px;padding:9px 18px}
.vch{display:flex;gap:8px;padding:0 8px 8px;overflow:hidden}
.vch div{flex:0 0 46%;background:#fff;border-left:4px solid #ee4d2d;padding:8px;font-size:12px}
.vch b{color:#ee4d2d;font-size:15px;display:block}
.fs{background:#fff;margin-top:8px}
.fs h2{margin:0;padding:12px;font-size:15px;color:#ee4d2d;text-transform:uppercase;display:flex;justify-content:space-between;border-bottom:1px solid #eee}
.fs h2 span{color:#888;font-size:12px;text-transform:none}
.items{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#eee}
.items a{background:#fff;padding:6px;text-align:center;font-size:12px}
.items .p{height:84px;border-radius:4px;margin-bottom:4px;background:linear-gradient(135deg,#ffe3dc,#ffc7b8)}
.items .p.c2{background:linear-gradient(135deg,#d7efff,#b6ddf7)}
.items .p.c3{background:linear-gradient(135deg,#e1f7e8,#bfe9cd)}
.items b{color:#ee4d2d;font-size:14px;display:block}
.items s{color:#999;font-size:11px}
.pct{display:inline-block;background:#fff0ed;color:#ee4d2d;font-size:10px;font-weight:700;padding:0 3px}
.bar{height:12px;background:#ffbda6;border-radius:6px;margin-top:4px;position:relative;overflow:hidden}
.bar i{position:absolute;left:0;top:0;bottom:0;background:#ee4d2d}
.bar span{position:relative;font-size:9px;color:#fff;font-weight:700}
.ftr{padding:16px;color:#777;font-size:12px;text-align:center}
.ftr a{display:inline-block;margin:4px 8px}
.lg{background:#fff;margin:16px 12px;padding:20px 16px;border-radius:3px;box-shadow:0 1px 6px rgba(0,0,0,.12)}
.lg h1{margin:0 0 16px;font-size:20px}
.lg input{width:100%;border:1px solid #ddd;border-radius:2px;padding:11px;margin-bottom:12px;font-size:14px}
.go{width:100%;display:block;text-align:center;background:#ee4d2d;color:#fff;border:0;padding:12px;border-radius:2px;font-weight:700;font-size:14px;text-transform:uppercase}
.sm{font-size:12px;color:#777;margin-top:12px;text-align:center}
.sm a{color:#ee4d2d}
.win{background:#fff;margin:12px;padding:18px 16px;text-align:center;border-radius:3px;box-shadow:0 1px 6px rgba(0,0,0,.12)}
.win .gift{width:90px;height:90px;margin:0 auto 10px;border-radius:12px;background:linear-gradient(135deg,#ee4d2d,#ffb200);display:grid;place-items:center;color:#fff;font-size:44px}
.win h1{font-size:19px;margin:0 0 8px}
.win .cd{font-family:monospace;font-weight:700;color:#ee4d2d}
.fee{border:1px dashed #ee4d2d;background:#fff5f2;padding:10px;margin:12px 0;font-size:13px;text-align:left}
.sum td{padding:6px 0;font-size:13px}
.sum td:last-child{text-align:right}
`,
  pages: {
    '/': `<header class="hd"><a href="/" class="ic" style="border-radius:50%"></a><div class="sb">Shopee Birthday Sale up to 90% off</div><span class="ic"></span><a href="/buyer/login" class="ic" style="border-radius:50%"></a></header><div class="cats"><div><i class="g"></i>Free Shipping</div><div><i class="b"></i>Free Nintendo</div><div><i></i>Cash On Delivery</div><div><i class="y"></i>ShopeeFood 99%</div><div><i class="b"></i>Vouchers</div></div>
<section class="ban"><h1>11.11 Big Sale</h1><p>Ends in <span class="cd" data-sim-countdown="41873">00:00</span></p>Up to 90% off + free shipping across Malaysia<br><a class="btn" href="/flash">Shop Now</a></section>
<div class="vch"><div><b>RM10 off</b>Min. spend RM50</div><div><b>Free Shipping</b>Min. spend RM20</div><div><b>10% Cashback</b>Cap RM15</div></div>

<section class="fs"><h2>Flash Sale <span class="cd" data-sim-countdown="3105">00:00</span><a href="/flash" style="font-size:12px;text-transform:none;color:#888">See all &gt;</a></h2>
<div class="items"><a href="/flash"><div class="p"></div>Wireless Earbuds<b>RM29.90</b><s>RM89.00</s> <span class="pct">-66%</span><div class="bar"><i style="width:72%"></i><span>72% SOLD</span></div></a><a href="/flash"><div class="p c2"></div>Air Fryer 4L<b>RM89.00</b><s>RM199.00</s> <span class="pct">-55%</span><div class="bar"><i style="width:48%"></i><span>48% SOLD</span></div></a><a href="/flash"><div class="p c3"></div>Cotton Tee 3-Pack<b>RM19.90</b><s>RM45.00</s> <span class="pct">-56%</span><div class="bar"><i style="width:85%"></i><span>85% SOLD</span></div></a></div></section>
<div class="ftr"><a href="/">About Shopee</a><a href="/">Help Centre</a><a href="/">Shopee Policies</a><a href="/">Privacy Policy</a><div style="margin-top:8px">&copy; 2026 Shopee. All Rights Reserved.</div></div>`,
    '/flash': `<header class="hd"><a href="/" class="ic" style="border-radius:50%"></a><div class="sb">Shopee Birthday Sale up to 90% off</div><span class="ic"></span><a href="/buyer/login" class="ic" style="border-radius:50%"></a></header><section class="ban" style="margin-top:0"><h1>11.11 Flash Sale</h1><p>Next batch in <span class="cd" data-sim-countdown="1105">00:00</span></p></section>
<section class="fs" style="margin-top:0"><div class="items"><a href="/flash"><div class="p"></div>Wireless Earbuds<b>RM29.90</b><s>RM89.00</s></a><a href="/flash"><div class="p c2"></div>Air Fryer 4L<b>RM89.00</b><s>RM199.00</s></a><a href="/flash"><div class="p c3"></div>Cotton Tee 3-Pack<b>RM19.90</b><s>RM45.00</s></a><a href="/flash"><div class="p c2"></div>Phone Case<b>RM6.90</b><s>RM19.00</s></a><a href="/flash"><div class="p"></div>Desk Lamp<b>RM24.90</b><s>RM59.00</s></a><a href="/flash"><div class="p c3"></div>Water Bottle<b>RM12.90</b><s>RM32.00</s></a></div></section>
<div class="ftr">Pay safely with ShopeePay, cards or Cash on Delivery. Shopee will never ask you to pay outside the app or to confirm a "prize".<br><a href="/buyer/login">Log In</a><a href="/">Help Centre</a></div>`,
    '/buyer/login': `<header class="hd"><a href="/" class="ic" style="border-radius:50%"></a><div class="sb">Shopee Birthday Sale up to 90% off</div><span class="ic"></span><a href="/buyer/login" class="ic" style="border-radius:50%"></a></header><form class="lg" data-sim-next="/buyer/login"><h1>Log In</h1><input type="text" placeholder="Phone number / Username / Email"><input type="password" placeholder="Password"><button class="go" type="submit">Log In</button><div class="sm"><a href="/">Forgot Password</a> &nbsp;|&nbsp; <a href="/">Log in with SMS</a></div><div class="sm">New to Shopee? <a href="/">Sign Up</a></div></form><div class="ftr">Shopee will never ask for your OTP or password by chat, SMS or email.</div>`,
  },
  tells: [
    "shopee.com.my is Shopee Malaysia's real address, and the certificate is issued to Shopee's own company.",
    "Flash-sale countdowns and big discounts are normal on genuine shopping sites. The test is the domain and what you are asked to pay for, not the urgency.",
    "Nothing here asks you to pay a fee to receive a prize, and the login only asks for the usual details on the main shopee.com.my site."
],
});
