SimCards.register({
 "slug": "9axijx",
 "brand": "Microsoft 365",
 "real": false,
 "url": "https://login.rnicrosoftonline.com/common/oauth2/v2.0/authorize",
 "cert": {
  "secure": true,
  "issuedTo": "login.rnicrosoftonline.com",
  "org": null,
  "issuer": "Let's Encrypt R11",
  "validFrom": "10 Nov 2026",
  "validTo": "8 Feb 2027"
 },
 "css": "body,.page{background:#fff;font-family:\"Segoe UI\",Segoe,Tahoma,Arial,sans-serif;color:#1b1b1b}\n.wrap{min-height:640px;display:flex;flex-direction:column;background:#fff}\n.in{padding:44px 24px 0;max-width:440px}\n.logo{display:flex;align-items:center;gap:6px;margin-bottom:16px}.logo i{width:11px;height:11px;display:block}\n.sq{display:grid;grid-template-columns:11px 11px;gap:1px}.sq i:nth-child(1){background:#f25022}.sq i:nth-child(2){background:#7fba00}.sq i:nth-child(3){background:#00a4ef}.sq i:nth-child(4){background:#ffb900}\n.logo span{font-size:20px;color:#737373;font-weight:600}\nh1{font-size:24px;font-weight:600;margin:16px 0 14px}\n.email{display:flex;align-items:center;gap:6px;font-size:15px;margin:6px 0 12px}.email b{font-weight:400}\ninput{width:100%;border:0;border-bottom:1px solid #666;padding:6px 0;font-size:15px;margin-bottom:14px;outline:0;background:#fff}\na{color:#0067b8;text-decoration:none;font-size:13px}p{font-size:13px;margin:0 0 14px}\n.btns{display:flex;justify-content:flex-end;margin-top:22px}.next{background:#0067b8;color:#fff;border:0;min-width:108px;padding:7px 20px;font-size:15px;text-align:center;text-decoration:none}\n.opt{margin:30px 24px 0;border:1px solid #ddd;padding:11px 12px;font-size:15px;display:flex;gap:10px;align-items:center;max-width:392px}\n.ft{margin-top:auto;padding:30px 24px 14px;font-size:12px;color:#444;display:flex;gap:18px}.ft a{color:#444;font-size:12px}",
 "pages": {
  "/common/oauth2/v2.0/authorize": "<div class=\"wrap\"><div class=\"in\"><div class=\"logo\"><div class=\"sq\"><i></i><i></i><i></i><i></i></div><span>Microsoft</span></div><h1>Sign in</h1><form data-sim-next=\"/password\"><input placeholder=\"Email, phone, or Skype\"><p>No account? <a href=\"#\">Create one!</a></p><p><a href=\"#\">Can't access your account?</a></p><div class=\"btns\"><button class=\"next\">Next</button></div></form></div><div class=\"opt\"><span>&#128273;</span><span>Sign-in options</span></div><div class=\"ft\"><a href=\"#\">Terms of use</a><a href=\"#\">Privacy &amp; cookies</a><a href=\"#\">&middot;&middot;&middot;</a></div></div>",
  "/password": "<div class=\"wrap\"><div class=\"in\"><div class=\"logo\"><div class=\"sq\"><i></i><i></i><i></i><i></i></div><span>Microsoft</span></div><div class=\"email\">&#8592; <b>student@xmu.edu.my</b></div><h1>Enter password</h1><form data-sim-next=\"/password\"><input type=\"password\" placeholder=\"Password\"><p><a href=\"#\">Forgot my password</a></p><div class=\"btns\"><button class=\"next\">Sign in</button></div></form></div><div class=\"ft\"><a href=\"#\">Terms of use</a><a href=\"#\">Privacy &amp; cookies</a><a href=\"#\">&middot;&middot;&middot;</a></div></div>"
 },
 "tells": [
  "The address is login.rnicrosoftonline.com: \"rn\" (r plus n) squeezed together looks like \"m\", so it is not microsoftonline.com.",
  "The certificate has no organisation name and is from a free issuer, whereas Microsoft's real sites show Microsoft Corporation.",
  "The page itself is a perfect copy, so the only way to catch it is to read the address letter by letter."
 ]
});
