# Station 5 shows every site as an interactive copy in a simulated browser

Every Site Card, Real or Fake, is a copy displayed inside our own Sim Browser. None is the live site.

**Revised 12 Nov 2026:** hand-built copies of Real sites were visibly off, so copies are now captured from the live sites (`tools/snap.py`: rendered DOM, styles and images inlined, scripts removed). Real cards are unedited captures. Fake cards are captures of the imitated brand's real pages, edited the way a phishing kit would be (lookalike address, extra steps asking for data, urgency).

The live sites can't be framed: banks and big platforms send headers that block it. A reverse proxy would make them framable, but real logins would then pass through our VPS. Screenshots for Real cards with HTML for Fakes would let the format give the answer away. Building both kinds the same way (both captured) leaves only the scam clues (address, certificate, link targets, content) to tell them apart. It also means no Fake has a working form, so the Station can never act as a phishing kit.

## Consequences

- Real-site copies can drift from the live sites. They match what each site looked like in Nov 2026.
- Google and Microsoft sign-in pages stay hand-built, not captured: an exact copy of their login on a public domain could get the whole site flagged by Safe Browsing on event day.
- Fake copies use invented lookalike addresses that appear only in the Sim Browser's address bar. We never register any of those domains.
- Some Fakes stay hand-built because the brand's real page can't be captured statically: the sign-in form is injected by the site's own JavaScript (Apple), the page is canvas/JS-rendered (WhatsApp Web), the capture hits a bot wall, CAPTCHA or access-denied page (DHL, Shopee, MySejahtera), or the brand is off-limits to capture by rule (Microsoft 365). These are drawn in the Fake's own components to match the captured cards' polish.
