# Phishing Fishing — operator case guide

Event and practice rounds draw 10 balanced emails from 32 cases and run for 60 seconds. Correct answers earn 10 points. Wrong and unanswered emails earn 0 points. Verification is optional and does not affect the score. Practice scores are excluded from event results.

| Case | Label | Difficulty | Post-round decisive clue fields |
|---|---|---|---|
| Action on device review MB-841209 (bank-verification) | phishing | Easy | body:4, sender, destination:3 |
| Mailbox retention report IT-Q-1022 — review available (campus-storage) | phishing | Medium | destination:3 |
| Delivery exception PP-MY-804219: unit number incomplete (parcel-fee) | phishing | Medium | destination:3, sender |
| Receipt SL-583102 — document access updated (shopping-document) | phishing | Hard | body:3 |
| Refund advice EF-2026-184207 is available (tax-rebate) | phishing | Hard | destination:2, body:3 |
| Account recovery case SEC-730184: confirmation required (security-reply) | phishing | Easy | body:3 |
| Group project rooms: now with fewer “can you hear me?” (study-room-booking) | legitimate | Easy | body:4, verification:0, verification:1 |
| Please review a card transaction — RM 840.00 (bank-notification) | legitimate | Medium | body:3, verification:1 |
| Collect parcel PP-MY-612483 by Friday (parcel-update) | legitimate | Medium | body:4, verification:1 |
| Order confirmed: one emotional-support desk duck (desk-duck-receipt) | legitimate | Easy | verification:0, verification:1 |
| First Aid Workshop: confirm your reserved place by Friday (event-registration) | legitimate | Hard | verification:0, verification:1 |
| Before Friday: review your account recovery number (security-change) | legitimate | Hard | verification:0, body:4 |
| Placement CS-26104: onboarding reservation (internship-reservation) | phishing | Medium | body:2, verification:1 |
| SCH-26118: assessment comments shared with you (scholarship-document) | phishing | Hard | body:3 |
| Interview booking for your internship application CS-26104 (internship-shortlist) | legitimate | Medium | verification:1, body:3 |
| Scholarship SCH-26118 — income evidence clarification (scholarship-review) | legitimate | Hard | verification:1, body:3 |
| Your penguin has checked in. It has no ID. (mascot-qr) | phishing | Easy | body:3, verification:1 |
| Attendance assistant: send your digital twin (attendance-clone) | phishing | Easy | body:2, body:3 |
| Wallet migration WLT-184207: backup verification (alien-wallet) | phishing | Easy | body:3, destination:2 |
| Subscription receipt SL-SUB-184207 — RM 299.00 (monday-refund) | phishing | Easy | body:3, verification:1 |
| Campus mascot vote: the cat has hired a campaign manager (mascot-vote) | phishing | Easy | body:3, verification:1 |
| Student Wi-Fi maintenance NF-26116 (wifi-maintenance) | legitimate | Easy | body:3, verification:0 |
| Emergency noodle grant: your toppings have been approved (noodle-prize) | phishing | Easy | body:3, verification:1 |
| Your noodles are ready. Your assignment can wait five minutes. (noodle-pickup) | legitimate | Easy | body:3, verification:1 |
| Library balance LB-20418: payment reminder (library-payment) | phishing | Medium | destination:3, verification:1 |
| Library balance LB-20418: payment reminder (library-fine) | legitimate | Medium | verification:0, verification:1, body:4 |
| Payee review PY-4821 (bank-beneficiary) | phishing | Medium | body:3, verification:1 |
| Payee review PY-4821 (bank-payee) | legitimate | Medium | body:3, verification:1 |
| Shared: AG1-2 activity budget (cloud-share) | phishing | Hard | body:4, verification:1 |
| Shared: AG1-2 activity budget (cloud-share-record) | legitimate | Hard | body:4, verification:1 |
| Allowance AL-26118: receiving account review (payroll-update) | phishing | Hard | destination:3, body:4, verification:1 |
| Allowance AL-26118: receiving account review (payroll-confirm) | legitimate | Hard | verification:1, body:4 |

## Teaching and review

Do not coach participants to look for one writing pattern. Both labels contain ordinary deadlines, fees, familiar senders and independent-channel language. The paired cloud-share cases even have the same URL but different permission requests. Verify the controlling host, requested privileges/secrets/payment and case-specific purpose.

Clue keys identify fields highlighted in the post-round review only. Participants choose only Legitimate or Phishing; no clue selection is required or scored. The review distinguishes contextual details from decisive clues and explains the safe next action.

Verification records are supplied only after the learner chooses to check; revealing a mismatch after deliberate verification teaches the habit and has no deduction. Correct classifications and decisive clues are never revealed during play. Case classifications, explanations and keys stay in this staff guide and post-Round review.

The bank has 18 Phishing and 14 Legitimate cases. Legitimate difficulty buckets are 4 Easy/5 Medium/5 Hard, removing the previously fixed easy pair. Scored deals remain 5/5 with equal difficulty mixes.

## Fishing presentation and humour

Eight cases now use light campus humour (four Phishing, four Legitimate). Retired IDs are replaced where the underlying scenario changed; saved event Rounds with those retired IDs must be cancelled, rather than silently regraded. Practice deals with retired cases restart without event writes.

Humour is not an indicator. A real prize, lost penguin, desk-duck order or cat election may still be used as a pretext for an inappropriate request. Ask Participants to check the actual action, permission scope and independent record. No correctness or badge is shown until the Round ends. Fishing badges recognise correctly caught scam techniques and do not change the Station Score.
