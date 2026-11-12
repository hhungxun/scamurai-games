# Station 5 shows every site as an interactive copy in a simulated browser

Every Site Card, Real or Fake, is a hand-built interactive copy displayed inside our own Sim Browser. None is the live site.

The live sites can't be framed: banks and big platforms send headers that block it. A reverse proxy would make them framable, but real logins would then pass through our VPS. Screenshots for Real cards with HTML for Fakes would let the format give the answer away. Building both kinds the same way leaves only the scam clues (address, certificate, link targets, content) to tell them apart. It also means no Fake has a working form, so the Station can never act as a phishing kit.

## Consequences

- Real-site copies can drift from the live sites. They match what each site looked like in Nov 2026.
- Fake copies use invented lookalike addresses that appear only in the Sim Browser's address bar. We never register any of those domains.
