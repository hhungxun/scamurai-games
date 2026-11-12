SimCards.register({
  slug: 't9zo2p',
  brand: 'LHDN MyTax',
  real: true,
  url: 'https://mytax.hasil.gov.my/',
  cert: {"secure":true,"issuedTo":"mytax.hasil.gov.my","org":"Lembaga Hasil Dalam Negeri","issuer":"GlobalSign RSA OV SSL CA 2018","validFrom":"21 Jul 2026","validTo":"22 Aug 2027"},
  pages: {
    '/': { snap: 'f2h5m8o9.html' },
  },
  tells: [
    "mytax.hasil.gov.my is under hasil.gov.my. Malaysian government sites end in .gov.my, and Hasil is LHDN's own domain.",
    "The certificate is issued to the government agency (Lembaga Hasil Dalam Negeri), not to an anonymous owner.",
    "The page only asks for your ID type and number, then takes you into LHDN's own login. It never asks for your online banking details."
],
});
