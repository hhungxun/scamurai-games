SimCards.register({
 "slug": "eg3dey",
 "brand": "Netflix",
 "real": false,
 "url": "http://netflix-billing-update.com/",
 "cert": {
  "secure": false,
  "issuedTo": "netflix-billing-update.com",
  "org": null,
  "issuer": "None (no HTTPS)",
  "validFrom": "-",
  "validTo": "-"
 },
 "pages": {
  "/": {
   "snap": "ef1bjzcs.html"
  },
  "/card": {
   "snap": "eh1ss9eq.html"
  }
 },
 "tells": [
  "The page is served over http://, so the browser says \"Not secure\": anything typed into this card form would travel unencrypted.",
  "The address is netflix-billing-update.com. Netflix's billing lives inside netflix.com, and you only reach it after signing in there.",
  "\"Update within 24 hours or your access is blocked\" is pressure meant to stop you from checking the address."
 ]
});
