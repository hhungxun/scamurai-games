# Phishing Fishing - operator question guide

All 20 emails appear once in random order. One shared 60-second timer starts on Start Game. The round ends at the deadline or when all 20 answers are recorded. Classifications, clues and difficulty labels appear after the round.

Score / 100 = **100 x min(answered / 10, 1) x (0.8 x correct / answered + 0.2)**, rounded once to one decimal. No answers means zero accuracy and score. Progress is capped at 10 answers; unattempted bank questions are not wrong answers; incorrect answers count only submitted mistakes. Example: 10 correct of 12 answers gives 86.7; 10 of 10 gives 100; 20 of 20 gives 100. Both score components build with progress toward ten answers: 1 correct from 1 answer earns 10 points, 5 from 5 earns 50, and 8 from 8 earns 80. No need to finish all 20 questions.

## Full question table

| Subject | Classification | Difficulty | Learning objective |
| --- | --- | --- | --- |
| Please confirm your online banking access | phishing | Easy | Recognise a request for banking secrets, rather than relying on urgency alone. |
| Student mailbox storage report — October | phishing | Medium | Check the sender and destination of a plausible university storage notice. |
| Address correction for parcel PP-MY-804219 | phishing | Medium | Inspect the destination before paying a small, believable delivery charge. |
| Your receipt for order SL-583102 | phishing | Hard | Recognise a deceptive receipt attachment and excessive account permissions, even with a familiar sender. |
| Tax refund advice — reference EF-2026-184207 | phishing | Hard | Compare displayed link text with the destination and recognise a brand name embedded in an unrelated domain. |
| Was this you? New sign-in from a Windows device | phishing | Easy | Recognise OTP theft by email reply; phishing does not need a link. |
| Revision-week study rooms: bookings close Friday | legitimate | Easy | Distinguish a normal university booking deadline from pressure to disclose information. |
| Please review a card transaction — RM 840.00 | legitimate | Medium | Respond safely to an urgent bank alert without treating urgency or an amount as proof of fraud. |
| Collect parcel PP-MY-612483 by Friday | legitimate | Medium | Check consistent delivery details and a link destination; collection deadlines can be normal. |
| Payment received — order SL-582714 | legitimate | Easy | Check itemised amounts and the account workflow instead of treating money-related emails as scams. |
| First Aid Workshop: confirm your reserved place by Friday | legitimate | Hard | Distinguish a genuine registration deposit and deadline from an unexpected off-site payment. |
| Before Friday: review your account recovery number | legitimate | Hard | Evaluate an account-maintenance request using its scope, destination and independent verification route. |
| Industry placement offer — reserve your internship slot | phishing | Medium | Recognise advance-fee recruitment fraud and pressure to bypass university checks, even with a familiar sender. |
| Shared with you: scholarship assessment comments | phishing | Hard | Recognise a shared-document lure that asks you to disable protections and run macros rather than disclose credentials. |
| Interview booking for your internship application CS-26104 | legitimate | Medium | Verify recruitment through a recorded application, scoped interview request and independently accessible career service. |
| Scholarship SCH-26118 — income evidence clarification | legitimate | Hard | Evaluate a sensitive scholarship-document request using its purpose, limited scope and established submission route. |
| Your emotional-support penguin is waiting at the hostel | phishing | Easy | Recognise QR-code phishing and an unsolicited delivery payment lure. |
| Your clone will attend the 8 am lecture. You keep sleeping. | phishing | Easy | Reject an executable attachment disguised as a magical academic shortcut. |
| Earthling, inherit 9 billion SpaceCoins before lunch | phishing | Easy | Recognise cryptocurrency wallet recovery-phrase theft. |
| Receipt: RM 999 for Premium Monday Removal | phishing | Easy | Recognise callback phishing and a refund pretext for remote-access abuse. |

## Four playful additions

| Scenario | Humour | Scam mechanism | Decisive request |
| --- | --- | --- | --- |
| Penguin delivery | An emotional-support penguin needs a fish allowance | QR phishing / card theft | Scan a QR, provide card details, avoid the courier app |
| Lecture clone | A clone attends the 8 am lecture for you | Executable malware | Run a .pdf.exe as administrator and disable antivirus |
| Alien inheritance | Prince Zorp's hamster awards SpaceCoins | Crypto wallet recovery-phrase theft | Reply with the wallet recovery phrase and keep it secret |
| Monday removal | A subscription turns Monday into Saturday | Callback refund scam / remote-access abuse | Call the sender's hotline, install a remote-control app and share access |

The original eight phishing examples remain: bank password/SMS-code harvesting, campus sign-in impersonation, delivery-fee fraud, mailbox-consent abuse, disguised tax links, OTP theft by reply, advance-fee internship recruitment and scholarship-document macro abuse. The original eight legitimate counterparts remain too.

## Selection and teaching

The complete bank has 12 phishing and 8 legitimate messages, with 8 Easy, 6 Medium and 6 Hard questions. Fisher-Yates shuffles all 20; any scenario can appear first. The distribution is not displayed during play. Finishing every question is not required; timeout results include all unanswered examples for discussion.

The new examples are intentionally obvious and funny. Teach the dangerous request as well as the joke. A wallet deposit does not require its recovery phrase, and a refund does not require handing strangers control of a computer. The QR and executable attachments here are inert text labels; the callback contains no callable number.

For every scenario, assess purpose, scope and independent verification. A familiar sender, HTTPS, polished writing or a PDF extension is no guarantee of authenticity. Deadlines, fees, attachments or humour alone do not prove fraud. All addresses use fictional .example domains; this shared ending is not a warning sign.

How to verify lists reference institutions and verification habits. It does not expose answers, and the timer keeps running while it is open. All link controls only inspect destinations; attachments never open, and email text is escaped. No real payment, login, QR destination or download is provided.

## Verification - 12 November 2026

All six core checks and seven offline browser checks passed with Node.js and Chrome. The core suite checks 1,000 full-bank shuffles, all 231 possible answered/correct pairs, score rounding, zero answers, deadline rejection, stable results, clock changes, reset and invalid content/settings.

The browser suite renders every email and checks timeout with partial answers (10 correct of 12 = 86.7), zero-answer and full-completion scores, shared timing, duplicate protection, keyboard/touch link inspection, highlighted review and five viewport sizes (1366 x 768, 1024 x 768, 768 x 1024, 390 x 844 and 360 x 800). The current progress entry remains visible through Email 20. No page errors, remote requests or downloads were observed. Screenshots are in tests/screenshots/.
