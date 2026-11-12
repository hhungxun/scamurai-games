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
  pages: {
    '/login/index.php': { snap: 'q7k2m9xd.html' },
  },
  tells: [
    'The address ends in xmu.edu.my, XMUM\'s own domain. The one-letter subdomain "l" looks odd but is genuinely how XMUM names its Moodle.',
    'The certificate is a domain-validated wildcard for *.xmu.edu.my from Sectigo. Nothing in the host or certificate points anywhere else.',
    'It asks only for your Campus ID and password on a login page, with no urgent warning, prize or extra personal-detail request.',
  ],
});
