SimCards.register({
 "slug": "ogwtgh",
 "brand": "Netflix",
 "real": true,
 "url": "https://www.netflix.com/my/",
 "cert": {
  "secure": true,
  "issuedTo": "www.netflix.com",
  "org": "Netflix, Inc.",
  "issuer": "DigiCert Global G2 TLS RSA SHA256 2020 CA1",
  "validFrom": "2 Oct 2026",
  "validTo": "1 Oct 2027"
 },
  pages: {
    '/my/': { snap: 'd3f7j1u5.html' },
    '/my/login': { snap: 'j8w2n4kz.html' },
  },
 "tells": [
  "The address is www.netflix.com, and the padlock details show the certificate was issued to Netflix, Inc.",
  "Netflix only asks for payment inside your account after you sign in, never on a landing page that you reached from a warning message.",
  "The page is plain: sign up, sign in and nothing urgent, with no countdown or threat to cut off your access."
 ]
});
