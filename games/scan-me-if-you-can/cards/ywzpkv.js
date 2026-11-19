SimCards.register({
  slug: 'ywzpkv',
  brand: 'MySejahtera',
  real: false,
  url: 'https://mysejahtera.gov.my.app-update.co/',
  cert: {
    secure: true,
    issuedTo: 'mysejahtera.gov.my.app-update.co',
    org: null,
    issuer: "Let's Encrypt E6",
    validFrom: '8 Nov 2026', validTo: '6 Feb 2027',
  },
  css: `
  .page{background:#f4f8fd;font-family:Roboto,"Segoe UI",Arial,sans-serif;color:#15304f;min-height:100%}
  .top{background:#fff;display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #dbe6f3}
  .top b{font-size:18px;color:#0a4d9c}
  .top b span{color:#17a2b8}
  .hero{background:linear-gradient(160deg,#0a4d9c,#17a2b8);color:#fff;padding:26px 18px 32px;text-align:center}
  .app{width:78px;height:78px;border-radius:18px;background:#fff;margin:0 auto 14px;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.25)}
  .hero h1{font-size:21px;margin:0 0 6px}.hero p{margin:0;font-size:14px;opacity:.92}
  .card{background:#fff;margin:14px;border-radius:10px;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,.1)}
  .card h2{font-size:16px;margin:0 0 10px;color:#0a4d9c}
  .warn{background:#fff3cd;border:1px solid #f0d98a;color:#664d03;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.45}
  .dl{display:block;width:100%;height:50px;border:0;border-radius:25px;background:#0a4d9c;color:#fff;font-size:16px;font-weight:600;margin-top:14px;text-align:center;line-height:50px}
  .meta{display:flex;justify-content:space-between;font-size:12px;color:#5a6f88;margin-top:10px}
  ol{margin:8px 0 0 18px;padding:0;font-size:14px;line-height:1.6}
  .foot{text-align:center;font-size:11px;color:#7a8da6;padding:18px 16px 28px;line-height:1.6}
  `,
  pages: {
    '/': `
    <div class="top"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.700-8 11-8 11z" fill="#e5384f"/></svg><b>My<span>Sejahtera</span></b></div>
    <div class="hero">
      <div class="app"><svg width="48" height="48" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.700-8 11-8 11z" fill="#e5384f"/><path d="M7 11h3l1.500-3 2 6 1.500-3h2" fill="none" stroke="#fff" stroke-width="1.5"/></svg></div>
      <h1>Mandatory Update</h1><p>MySejahtera version 2.0 is now available</p></div>
    <div class="card"><h2>Old versions are no longer supported</h2>
      <p style="font-size:14px;line-height:1.5;margin:0 0 10px">From 1 Dec 2026, accounts that are not updated will be <b>deactivated</b> and your health status and vaccine records may no longer be accessible.</p>
      <div class="warn">After downloading, allow "Install unknown apps" in your phone Settings.</div>
      <a class="dl" data-sim-alert="Download started: MySejahtera_v2.apk (18.4 MB). Simulation only: no file is downloaded.">Download MySejahtera_v2.apk</a>
      <div class="meta"><span>Size: 18.4 MB</span><span>Android 8.0+</span></div></div>
    <div class="card"><h2>How to install</h2><ol><li>Download the APK file above</li><li>Open the file and tap <b>Install</b></li><li>Allow all permissions (SMS, contacts, accessibility access)</li></ol></div>
    <div class="foot">Ministry of Health Malaysia &middot; MySejahtera<br><a href="/privasi" style="color:#7a8da6">Privacy Policy</a> &middot; <a href="/bantuan" style="color:#7a8da6">Help</a></div>`,
    '/404': `<div class="card"><p>Page not found.</p><a href="/">Back</a></div>`,
  },
  tells: [
    'The real site is mysejahtera.gov.my, but here that name is only the start of a longer address that ends in app-update.co. The part just before the first single slash decides who owns the site.',
    'MySejahtera is updated through Google Play or the App Store. A website offering a MySejahtera_v2.apk file is asking you to install an app from outside the store.',
    'The page tells you to switch on "Install unknown apps" and grant SMS and accessibility permissions, which is how banking malware takes over a phone.',
  ],
});
