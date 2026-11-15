/* Simulated training bank: 12 phishing and 8 legitimate messages.
 * Reserved .example addresses and inert attachments only. IDs stay stable for Round recovery.
 * Classifications, explanations and indicators appear only after the Round.
 */
(function(root){
  "use strict";
  const emails = [
  {
    "id": "bank-verification",
    "institution": "bank",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise a request for banking secrets, rather than relying on urgency alone.",
    "senderName": "Meridian Bank · Digital Banking",
    "senderEmail": "service@meridian-bank-secure.example",
    "recipient": "student@xmum.example",
    "subject": "Action on device review MB-841209",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Aisha,"
      },
      {
        "type": "paragraph",
        "text": "A new device was added to your online banking profile at 14:32. Transfers from this device remain on hold while we confirm ownership."
      },
      {
        "type": "detail",
        "text": "Case MB-841209 · Windows / Chrome · Kuala Lumpur"
      },
      {
        "type": "link",
        "text": "Review registered devices",
        "url": "https://meridian-bank-secure.example/devices/MB-841209"
      },
      {
        "type": "paragraph",
        "text": "To remove a device you do not recognise, enter your banking password and the one-time authorisation code on the review page. The code confirms removal; no transfer will be made."
      },
      {
        "type": "paragraph",
        "text": "Digital Banking Operations\nMeridian Bank"
      }
    ],
    "explanation": "Phishing: a protective-looking device review collects a banking password and an authorisation code on a lookalike domain. A code can authorise access or a transaction; the email’s explanation does not change its purpose. Open the bank app independently and review registered devices there.",
    "indicators": [
      {
        "target": "sender",
        "text": "meridian-bank-secure.example",
        "explanation": "This is a separate domain from meridian-bank.example, despite containing the bank name."
      },
      {
        "target": "body",
        "text": "banking password and the one-time authorisation code",
        "explanation": "The request collects two sensitive authentication factors through an emailed destination."
      },
      {
        "target": "body",
        "text": "The code confirms removal",
        "explanation": "A claim that a code cancels an action is a common way to disguise authorisation theft."
      }
    ]
  },
  {
    "id": "campus-storage",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Medium",
    "objective": "Check the sender and destination of a plausible university storage notice.",
    "senderName": "XMUM IT Service Desk",
    "senderEmail": "service@it.xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Mailbox retention report IT-Q-1022 — review available",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your mailbox is using 9.8 GB of its 10 GB allowance. We prepared a list of large attachments you can archive before the next backup. No messages have been deleted."
      },
      {
        "type": "detail",
        "text": "Mailbox: student@xmum.example\nTicket IT-Q-1022 · Student storage service"
      },
      {
        "type": "link",
        "text": "View mailbox retention report",
        "url": "https://storage.xmum.example.account-review.example/reports/IT-Q-1022"
      },
      {
        "type": "paragraph",
        "text": "The report opens in our updated sign-in service. Sign in with your campus account to approve the archive list. If the portal shows no report, this migration batch may not have appeared there yet."
      },
      {
        "type": "paragraph",
        "text": "IT Service Desk · Student Systems"
      }
    ],
    "explanation": "Phishing: the sender looks like a university subdomain, but the inspected destination is controlled under account-review.example. The migration explanation tries to make the missing independent record seem normal. Check storage through the usual student portal or confirm the ticket with IT.",
    "indicators": [
      {
        "target": "body",
        "text": "storage.xmum.example.account-review.example",
        "explanation": "The controlling domain is account-review.example; the university name is only a prefix."
      },
      {
        "target": "body",
        "text": "Sign in with your campus account",
        "explanation": "An unfamiliar destination is soliciting your campus authentication."
      },
      {
        "target": "body",
        "text": "may not have appeared there yet",
        "explanation": "This pretext discourages treating a missing portal record as a reason to verify independently."
      }
    ]
  },
  {
    "id": "parcel-fee",
    "institution": "parcel",
    "classification": "phishing",
    "difficulty": "Medium",
    "objective": "Inspect the destination before paying a small, believable delivery charge.",
    "senderName": "ParcelPath · Delivery Exceptions",
    "senderEmail": "delivery@parcelpath-notices.example",
    "recipient": "student@xmum.example",
    "subject": "Delivery exception PP-MY-804219: unit number incomplete",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Parcel PP-MY-804219 is at the Sepang delivery depot. The address label is readable except for the unit number. Please confirm the correction before the next dispatch."
      },
      {
        "type": "detail",
        "text": "Dispatch window: 09:00–12:00\nAddress correction: RM 2.40 · Reference PP-MY-804219"
      },
      {
        "type": "link",
        "text": "Confirm unit number and correction charge",
        "url": "https://parcelpath.example.delivery-case.example/PP-MY-804219"
      },
      {
        "type": "paragraph",
        "text": "Enter your card details to settle the correction charge. A temporary RM 0 verification may appear before the RM 2.40 payment."
      },
      {
        "type": "paragraph",
        "text": "Delivery Exceptions Team\nParcelPath"
      }
    ],
    "explanation": "Phishing: a modest, believable delivery fee routes card entry to delivery-case.example, not parcelpath.example. A tracking reference or a small charge does not establish authenticity. Check the parcel and any fee in the courier app or through a known support channel.",
    "indicators": [
      {
        "target": "sender",
        "text": "parcelpath-notices.example",
        "explanation": "The sender domain is not the reference parcelpath.example."
      },
      {
        "target": "body",
        "text": "parcelpath.example.delivery-case.example",
        "explanation": "The actual destination belongs to delivery-case.example, even though it begins with the courier name."
      },
      {
        "target": "body",
        "text": "Enter your card details",
        "explanation": "This is a payment-data request at an unverified destination; the low amount does not make it safe."
      }
    ]
  },
  {
    "id": "shopping-document",
    "institution": "shopping",
    "classification": "phishing",
    "difficulty": "Hard",
    "objective": "Recognise a deceptive receipt attachment and excessive account permissions, even with a familiar sender.",
    "senderName": "ShopLane Purchase Documents",
    "senderEmail": "receipts@shoplane.example",
    "recipient": "student@xmum.example",
    "subject": "Receipt SL-583102 — document access updated",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your RM 89.90 purchase receipt is ready. We moved purchase documents to Receipt Viewer so you can keep delivery and warranty records together."
      },
      {
        "type": "attachment",
        "text": "Receipt-SL-583102.pdf.html · 48 KB"
      },
      {
        "type": "paragraph",
        "text": "Open the attached receipt. On the access screen, select your campus account and approve permission to read and send mail. This links the receipt to your mailbox; your password is not shared with the viewer."
      },
      {
        "type": "paragraph",
        "text": "Order SL-583102\nShopLane Purchase Documents"
      }
    ],
    "explanation": "Phishing: the familiar sender and “password is not shared” reassurance mask a consent-phishing request. A receipt viewer does not need permission to read and send mail. The attachment is an HTML document disguised with “.pdf” in its name. Decline access and retrieve the receipt through the shopping app.",
    "indicators": [
      {
        "target": "body",
        "text": "Receipt-SL-583102.pdf.html",
        "explanation": "The final extension is .html; the PDF-looking name should not substitute for checking the request."
      },
      {
        "target": "body",
        "text": "approve permission to read and send mail",
        "explanation": "Mailbox control is excessive for displaying a shopping receipt."
      },
      {
        "target": "body",
        "text": "your password is not shared",
        "explanation": "An attacker can abuse granted permissions without learning your password."
      }
    ]
  },
  {
    "id": "tax-rebate",
    "institution": "tax",
    "classification": "phishing",
    "difficulty": "Hard",
    "objective": "Compare displayed link text with the destination and recognise a brand name embedded in an unrelated domain.",
    "senderName": "MyTax · Document Notifications",
    "senderEmail": "notifications@mytax.lhdn.example",
    "recipient": "student@xmum.example",
    "subject": "Refund advice EF-2026-184207 is available",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Taxpayer,"
      },
      {
        "type": "paragraph",
        "text": "A refund advice for RM 486.20 has been issued under reference EF-2026-184207. Please check the receiving-account details before the next payment batch."
      },
      {
        "type": "link",
        "text": "https://mytax.lhdn.example/refunds/EF-2026-184207",
        "url": "https://mytax.lhdn.example.refund-desk.example/refunds/EF-2026-184207"
      },
      {
        "type": "paragraph",
        "text": "The advice is opened through our payment partner. Confirm your identity number and bank login to validate that the receiving account belongs to you. This validation does not debit your account."
      },
      {
        "type": "paragraph",
        "text": "MyTax Document Notifications\nReference EF-2026-184207"
      }
    ],
    "explanation": "Phishing: the visible MyTax address and familiar sender disguise a destination under refund-desk.example. A refund advice does not justify giving an unfamiliar partner your bank login. Open the tax portal independently and confirm the advice there; a “no debit” reassurance is not verification.",
    "indicators": [
      {
        "target": "body",
        "text": "https://mytax.lhdn.example/refunds/EF-2026-184207",
        "explanation": "Displayed link text can differ from the destination revealed by inspection."
      },
      {
        "target": "body",
        "text": "mytax.lhdn.example.refund-desk.example",
        "explanation": "The controlling domain is refund-desk.example, not lhdn.example."
      },
      {
        "target": "body",
        "text": "bank login",
        "explanation": "A refund-notification workflow asking for your bank login is a sensitive, inappropriate request."
      }
    ]
  },
  {
    "id": "security-reply",
    "institution": "identity",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise OTP theft by email reply; phishing does not need a link.",
    "senderName": "Campus ID · Account Protection",
    "senderEmail": "security@campus-id.example",
    "recipient": "student@xmum.example",
    "subject": "Account recovery case SEC-730184: confirmation required",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "A recovery-number change was requested for your Campus ID. If you made this request, no reply is needed. Otherwise, we can hold the change while a service analyst checks your account."
      },
      {
        "type": "detail",
        "text": "Case SEC-730184 · Windows / Chrome\nRequested at 14:32 · Kuala Lumpur"
      },
      {
        "type": "paragraph",
        "text": "To hold the change, reply with the six-digit verification code currently sent to your phone. Please do not send your password. The analyst needs only the code to confirm the hold."
      },
      {
        "type": "paragraph",
        "text": "Campus ID Account Protection"
      }
    ],
    "explanation": "Phishing: the request to reply with a verification code is the decisive clue, even though the sender matches the identity service and says not to send a password. A code can approve an attacker’s action. Check account recovery settings through the usual portal and contact IT independently.",
    "indicators": [
      {
        "target": "body",
        "text": "reply with the six-digit verification code",
        "explanation": "Authentication codes must not be shared by email reply."
      },
      {
        "target": "body",
        "text": "Please do not send your password",
        "explanation": "A sensible-sounding warning does not make the separate request for an authentication code safe."
      },
      {
        "target": "body",
        "text": "confirm the hold",
        "explanation": "The message relabels an authorisation code as a protective cancellation step."
      }
    ]
  },
  {
    "id": "library-hours",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Easy",
    "objective": "Distinguish a normal university booking deadline from pressure to disclose information.",
    "senderName": "XMUM Library",
    "senderEmail": "library@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Revision-week study rooms: bookings close Friday",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear students,"
      },
      {
        "type": "paragraph",
        "text": "Study-room bookings for 2–8 November close at 5:00 pm this Friday. Rooms seat four to six students and can be reserved for up to two hours."
      },
      {
        "type": "detail",
        "text": "Service: Library → Study Rooms\nBooking fee: RM 0.00\nBring your student card to the service counter."
      },
      {
        "type": "paragraph",
        "text": "Make or change a booking in the library section of your usual student portal. Questions can be checked at the library service counter during staffed hours.\nXMUM Library Services"
      }
    ],
    "explanation": "Legitimate in this simulation: the deadline relates to a specific booking service, the free-room details are consistent, and bookings use the established student portal. A deadline alone is not phishing. Confirm availability in your usual portal or at the library counter; the sender address by itself cannot prove authenticity.",
    "indicators": [
      {
        "target": "body",
        "text": "bookings for 2–8 November close at 5:00 pm this Friday",
        "explanation": "This is a practical booking cutoff, not a demand to reveal secrets. Real notices can have deadlines."
      },
      {
        "target": "body",
        "text": "library section of your usual student portal",
        "explanation": "The booking uses an established service you can open independently."
      },
      {
        "target": "body",
        "text": "library service counter",
        "explanation": "There is a known physical place to confirm the details."
      }
    ]
  },
  {
    "id": "bank-notification",
    "institution": "bank",
    "classification": "legitimate",
    "difficulty": "Medium",
    "objective": "Respond safely to an urgent bank alert without treating urgency or an amount as proof of fraud.",
    "senderName": "Meridian Bank Card Alerts",
    "senderEmail": "alerts@meridian-bank.example",
    "recipient": "student@xmum.example",
    "subject": "Please review a card transaction — RM 840.00",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Customer,"
      },
      {
        "type": "paragraph",
        "text": "A card transaction requires your review. Online purchases on card ending 4821 have been temporarily paused while you check this activity."
      },
      {
        "type": "detail",
        "text": "Merchant: TechSquare Online\nAmount: RM 840.00\nReference: MB-841209"
      },
      {
        "type": "paragraph",
        "text": "Please open the Meridian Bank app yourself and select Cards → Activity to confirm or report the transaction promptly. If you cannot use the app, call the number printed on the back of your card.\nMeridian Bank Card Services"
      }
    ],
    "explanation": "Legitimate in this simulation: the reference, partial card number and app-based review fit the bank's notification pattern. The amount and temporary restriction are reasons to check, not automatic proof of phishing. Use the app or the number on your physical card to verify; a plausible sender or transaction detail could still be forged.",
    "indicators": [
      {
        "target": "body",
        "text": "open the Meridian Bank app yourself",
        "explanation": "Review happens through your independently opened app, without an emailed sign-in page."
      },
      {
        "target": "body",
        "text": "call the number printed on the back of your card",
        "explanation": "Use a known contact instead of trusting a number supplied by email."
      },
      {
        "target": "body",
        "text": "card ending 4821",
        "explanation": "Only a limited identifier is shown. It supports context but does not prove authenticity."
      }
    ]
  },
  {
    "id": "parcel-update",
    "institution": "parcel",
    "classification": "legitimate",
    "difficulty": "Medium",
    "objective": "Check consistent delivery details and a link destination; collection deadlines can be normal.",
    "senderName": "ParcelPath Tracking",
    "senderEmail": "updates@parcelpath.example",
    "recipient": "student@xmum.example",
    "subject": "Collect parcel PP-MY-612483 by Friday",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your BookNest parcel has arrived at the XMUM campus collection point. Please collect it by Friday, 6:00 pm, before it returns to the depot."
      },
      {
        "type": "detail",
        "text": "Tracking: PP-MY-612483\nCollection: campus parcel counter, 10:00 am–6:00 pm\nDelivery fee: RM 4.50, paid with order BN-22814"
      },
      {
        "type": "link",
        "text": "View collection details",
        "url": "https://parcelpath.example/track/PP-MY-612483"
      },
      {
        "type": "paragraph",
        "text": "Bring your student card and quote the tracking reference at the counter. The collection details are also in the ParcelPath app.\nParcelPath Delivery Team"
      }
    ],
    "explanation": "Legitimate in this simulation: the tracking reference is consistent, the inspected destination uses parcelpath.example, and collection is at the named campus counter. A paid fee and collection deadline are normal details. Check the reference in your courier app and original order; these details and a matching domain are supporting clues, not a guarantee.",
    "indicators": [
      {
        "target": "body",
        "text": "https://parcelpath.example/track/PP-MY-612483",
        "explanation": "The destination uses the reference courier's domain and the same tracking number as the message."
      },
      {
        "target": "body",
        "text": "RM 4.50, paid with order BN-22814",
        "explanation": "The fee is tied to an order and recorded as paid, rather than routed to an unexpected new payment site."
      },
      {
        "target": "body",
        "text": "also in the ParcelPath app",
        "explanation": "You can check the claim independently before collecting the parcel."
      }
    ]
  },
  {
    "id": "shopping-receipt",
    "institution": "shopping",
    "classification": "legitimate",
    "difficulty": "Easy",
    "objective": "Check itemised amounts and the account workflow instead of treating money-related emails as scams.",
    "senderName": "ShopLane Orders",
    "senderEmail": "orders@shoplane.example",
    "recipient": "student@xmum.example",
    "subject": "Payment received — order SL-582714",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your RM 22.50 card payment for order SL-582714 has been received. Please check the delivery address in My Purchases before the order is packed tomorrow."
      },
      {
        "type": "detail",
        "text": "A5 notebook set × 1: RM 18.00\nDelivery: RM 4.50\nTotal paid: RM 22.50\nPayment: card ending 4821"
      },
      {
        "type": "attachment",
        "text": "Receipt-SL-582714.pdf · 36 KB"
      },
      {
        "type": "paragraph",
        "text": "A copy of this receipt is stored in My Purchases in your ShopLane account. For address changes or payment queries, use the order's Help option in the app.\nShopLane Orders Team"
      }
    ],
    "explanation": "Legitimate in this simulation: item and delivery costs add up, the receipt is also in My Purchases, and the request is limited to checking your order there. Neither money, an attachment nor a packing deadline automatically makes an email phishing. Open the app independently to confirm the order; do not assume a PDF or matching sender is safe on its own.",
    "indicators": [
      {
        "target": "body",
        "text": "Total paid: RM 22.50",
        "explanation": "The RM 18.00 item plus RM 4.50 delivery matches the total."
      },
      {
        "target": "body",
        "text": "stored in My Purchases",
        "explanation": "The same receipt is available without opening the emailed attachment."
      },
      {
        "target": "body",
        "text": "order's Help option in the app",
        "explanation": "Queries stay inside the shopping account's established workflow."
      }
    ]
  },
  {
    "id": "event-registration",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "objective": "Distinguish a genuine registration deposit and deadline from an unexpected off-site payment.",
    "senderName": "XMUM Student Activities",
    "senderEmail": "activities@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "First Aid Workshop: confirm your reserved place by Friday",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your registration FA-1124 for the First Aid Workshop is reserved. Please pay the RM 10.00 refundable seat deposit by Friday, 5:00 pm, to confirm your place."
      },
      {
        "type": "detail",
        "text": "Workshop: 14 November, 10:00 am–12:00 pm\nVenue: Student Activity Centre, Room 2\nDeposit: returned through the portal after attendance"
      },
      {
        "type": "link",
        "text": "View my workshop registration",
        "url": "https://events.xmum.example/registrations/FA-1124"
      },
      {
        "type": "paragraph",
        "text": "You can also open your usual student portal and choose Events → My Registrations. The same reference and deposit appear there. Questions can be checked at the Student Activities counter.\nXMUM Student Activities"
      }
    ],
    "explanation": "Legitimate in this simulation: a named event, consistent reference and refundable deposit are recorded in the established student portal. The link is under xmum.example, and you can verify the payment independently there. A deadline or deposit is not enough to call it phishing. If you did not register, contact Student Activities through a known channel before paying.",
    "indicators": [
      {
        "target": "body",
        "text": "https://events.xmum.example/registrations/FA-1124",
        "explanation": "events.xmum.example is a subdomain of the reference university domain, and the reference matches."
      },
      {
        "target": "body",
        "text": "Events → My Registrations",
        "explanation": "Check the same fee and registration in your independently opened student portal."
      },
      {
        "target": "body",
        "text": "returned through the portal after attendance",
        "explanation": "The fee has a specific event purpose and refund process; confirm both before paying."
      }
    ]
  },
  {
    "id": "security-change",
    "institution": "identity",
    "classification": "legitimate",
    "difficulty": "Hard",
    "objective": "Evaluate an account-maintenance request using its scope, destination and independent verification route.",
    "senderName": "Campus ID Service Updates",
    "senderEmail": "updates@campus-id.example",
    "recipient": "student@xmum.example",
    "subject": "Before Friday: review your account recovery number",
    "body": [
      {
        "type": "paragraph",
        "text": "Hello,"
      },
      {
        "type": "paragraph",
        "text": "Campus ID recovery settings will be migrated on Friday, 6:00–8:00 pm. Please check your recovery phone number before 5:00 pm so account recovery remains available after the change."
      },
      {
        "type": "detail",
        "text": "Account: student@xmum.example\nMaintenance reference: CID-M-1023"
      },
      {
        "type": "link",
        "text": "Review recovery settings",
        "url": "https://campus-id.example/account/security"
      },
      {
        "type": "paragraph",
        "text": "Alternatively, open your usual student portal and go to Account → Security → Recovery. Review the number inside your account; the IT service counter can confirm the maintenance reference.\nCampus ID Service Team"
      }
    ],
    "explanation": "Legitimate in this simulation: the notice asks for a limited review inside the established identity service, with a matching destination and a reference the campus counter can confirm. A sign-in request or deadline is not automatically phishing. Open the portal independently and check the notice first; a matching domain is not proof, and codes or passwords should never be sent by reply.",
    "indicators": [
      {
        "target": "body",
        "text": "https://campus-id.example/account/security",
        "explanation": "The destination belongs to the reference Campus ID service. Check context as well as the domain."
      },
      {
        "target": "body",
        "text": "Account → Security → Recovery",
        "explanation": "The request is limited to a normal setting in the service you already use."
      },
      {
        "target": "body",
        "text": "IT service counter can confirm the maintenance reference",
        "explanation": "A known campus contact can independently verify the maintenance claim."
      }
    ]
  },
  {
    "id": "internship-reservation",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Medium",
    "objective": "Recognise advance-fee recruitment fraud and pressure to bypass university checks, even with a familiar sender.",
    "senderName": "XMUM Career Services",
    "senderEmail": "careers@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Placement CS-26104: onboarding reservation",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your application CS-26104 has progressed to partner onboarding. Your allowance starts after the induction date. A refundable RM 180 equipment reservation is needed to hold the allocated laptop."
      },
      {
        "type": "detail",
        "text": "Reservation: RM 180\nPayee: onboarding coordinator’s personal account\nPayment details supplied after acceptance"
      },
      {
        "type": "paragraph",
        "text": "Reply with your acceptance and transfer receipt. The amount will be returned with your first allowance. This partner batch is not yet listed in the campus careers portal; please wait for our confirmation before opening a duplicate enquiry."
      },
      {
        "type": "paragraph",
        "text": "Career Placement Team"
      }
    ],
    "explanation": "Phishing: the real-looking application reference and matching sender conceal an advance payment to a personal account. A promised refund and an explanation for a missing portal record do not validate a placement. Confirm the employer and payment request through the career office using an independently known contact.",
    "indicators": [
      {
        "target": "body",
        "text": "refundable RM 180 equipment reservation",
        "explanation": "An upfront fee to secure a placement needs independent verification."
      },
      {
        "target": "body",
        "text": "coordinator’s personal account",
        "explanation": "A personal transfer is inconsistent with a documented institutional onboarding charge."
      },
      {
        "target": "body",
        "text": "before opening a duplicate enquiry",
        "explanation": "The message subtly delays independent verification rather than openly forbidding it."
      }
    ]
  },
  {
    "id": "scholarship-document",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Hard",
    "objective": "Recognise a shared-document lure that asks you to disable protections and run macros rather than disclose credentials.",
    "senderName": "XMUM Scholarships Office",
    "senderEmail": "scholarships@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "SCH-26118: assessment comments shared with you",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Aisha,"
      },
      {
        "type": "paragraph",
        "text": "The assessment panel has returned comments on application SCH-26118. The document contains an embedded scoring table, so the online preview cannot show the full remarks."
      },
      {
        "type": "attachment",
        "text": "Assessment-SCH-26118.docm · 84 KB"
      },
      {
        "type": "paragraph",
        "text": "Download the file and choose Enable Content in Word to load the comments. If Protected View prevents the table from loading, turn it off for this document. Our office scanned the file before sending it."
      },
      {
        "type": "paragraph",
        "text": "Please bring the completed comments sheet to your next appointment.\nScholarships Assessment Team"
      }
    ],
    "explanation": "Phishing: a plausible scholarship document asks you to enable active content and disable a protection to see ordinary comments. A matching sender and a claim that the file was scanned do not justify running macros. Verify the document through the scholarships office or the usual application portal.",
    "indicators": [
      {
        "target": "body",
        "text": "Assessment-SCH-26118.docm",
        "explanation": "A .docm document can contain macros; its purpose and source need checking."
      },
      {
        "target": "body",
        "text": "choose Enable Content",
        "explanation": "Ordinary assessment comments should not require running document code."
      },
      {
        "target": "body",
        "text": "turn it off for this document",
        "explanation": "An instruction to remove a protection is a stronger clue than the familiar sender."
      }
    ]
  },
  {
    "id": "internship-shortlist",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Medium",
    "objective": "Verify recruitment through a recorded application, scoped interview request and independently accessible career service.",
    "senderName": "XMUM Career Services",
    "senderEmail": "careers@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Interview booking for your internship application CS-26104",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your application CS-26104 for the data internship has been shortlisted. Please select an interview slot by Friday; the employer will discuss duties and allowances at the interview."
      },
      {
        "type": "link",
        "text": "View my application and interview slots",
        "url": "https://careers.xmum.example/applications/CS-26104"
      },
      {
        "type": "paragraph",
        "text": "You can also open your usual student portal and choose Careers → My Applications. The employer details and interview invitation are recorded there. No reservation payment or kit purchase is required."
      },
      {
        "type": "paragraph",
        "text": "If you did not apply, ask the campus career counter to check the reference.\nXMUM Career Services"
      }
    ],
    "explanation": "Legitimate in this simulation: the interview is tied to a recorded application, uses a university subdomain and can be checked in the independently opened portal or at the career counter. The request is limited to booking an interview with no advance payment. Confirm that you actually applied; a matching sender or the absence of a fee alone cannot prove an offer genuine.",
    "indicators": [
      {
        "target": "body",
        "text": "https://careers.xmum.example/applications/CS-26104",
        "explanation": "The destination is within the reference university domain and includes the same application reference."
      },
      {
        "target": "body",
        "text": "Careers → My Applications",
        "explanation": "The existing portal lets you verify the employer and application without following the email link."
      },
      {
        "target": "body",
        "text": "ask the campus career counter to check the reference",
        "explanation": "An independent campus contact can check an unexpected invitation before you act."
      }
    ]
  },
  {
    "id": "scholarship-review",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "objective": "Evaluate a sensitive scholarship-document request using its purpose, limited scope and established submission route.",
    "senderName": "XMUM Scholarships Office",
    "senderEmail": "scholarships@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Scholarship SCH-26118 — income evidence clarification",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Aisha,"
      },
      {
        "type": "paragraph",
        "text": "The panel needs clarification of the household income evidence for application SCH-26118. Your assessment comments and document checklist are now shared in the student portal as a PDF preview."
      },
      {
        "type": "link",
        "text": "View my scholarship assessment",
        "url": "https://aid.xmum.example/applications/SCH-26118"
      },
      {
        "type": "paragraph",
        "text": "Alternatively, open your usual student portal and choose Financial Aid → My Applications. Upload only the income evidence listed there, with unrelated account numbers and transactions redacted. Please do not send financial documents by email reply."
      },
      {
        "type": "paragraph",
        "text": "The scholarship counter can confirm the checklist and discuss an extension before Friday.\nXMUM Scholarships Office"
      }
    ],
    "explanation": "Legitimate in this simulation: income evidence is relevant to the scholarship application, and the request limits what is collected through an existing portal record. The shared comments need no macros or disabled protections. Verify the checklist independently in the portal or with the scholarship counter before uploading sensitive information. A familiar address, PDF preview or deadline alone is not proof of authenticity.",
    "indicators": [
      {
        "target": "body",
        "text": "Financial Aid → My Applications",
        "explanation": "The shared comments and checklist are available through the independently opened student portal."
      },
      {
        "target": "body",
        "text": "unrelated account numbers and transactions redacted",
        "explanation": "The request limits disclosure to evidence relevant to the scholarship assessment."
      },
      {
        "target": "body",
        "text": "scholarship counter can confirm the checklist",
        "explanation": "A known campus office can verify the request and discuss the deadline before documents are submitted."
      }
    ]
  },
  {
    "id": "penguin-qr",
    "institution": "parcel",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise payment-card theft hidden behind a believable collection-locker QR update.",
    "senderName": "ParcelPath · Campus Collection",
    "senderEmail": "collection@parcelpath.example",
    "recipient": "student@xmum.example",
    "subject": "Collection locker update PP-MY-441208",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your campus collection parcel PP-MY-441208 is ready. We replaced the locker terminal, so this collection uses the QR code attached instead of the usual pickup PIN."
      },
      {
        "type": "attachment",
        "text": "Collection-PP-MY-441208-QR.png · 24 KB"
      },
      {
        "type": "paragraph",
        "text": "Scan the attached QR code and verify your card number, expiry date and CVV to release the locker. No payment is taken; the card check confirms that the collection is being made by an adult."
      },
      {
        "type": "paragraph",
        "text": "Campus Collection Support\nParcelPath"
      }
    ],
    "explanation": "Phishing: a QR-based locker update asks for full payment-card details to collect a parcel. The matching sender and “no payment” wording do not justify the request. A QR code can hide a destination just like a link. Check the collection code in the courier app or with the staffed collection desk.",
    "indicators": [
      {
        "target": "body",
        "text": "Scan the attached QR code",
        "explanation": "The code conceals a destination; it is not evidence of authenticity."
      },
      {
        "target": "body",
        "text": "card number, expiry date and CVV",
        "explanation": "These are payment credentials, not a reasonable locker-release requirement."
      },
      {
        "target": "body",
        "text": "No payment is taken",
        "explanation": "Reassuring wording does not make unnecessary collection of card details safe."
      }
    ]
  },
  {
    "id": "lecture-clone",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Identify an executable disguised as a routine attendance PDF and refuse elevated permissions.",
    "senderName": "XMUM Teaching Systems",
    "senderEmail": "teaching@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Attendance reconciliation: review before Friday",
    "body": [
      {
        "type": "paragraph",
        "text": "Dear Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Two attendance entries could not be matched to your student record after the classroom terminal update. Please review the attached report before the weekly reconciliation closes."
      },
      {
        "type": "attachment",
        "text": "Attendance-Review.pdf.exe · 126 KB"
      },
      {
        "type": "paragraph",
        "text": "Open the report on your laptop. If Windows asks whether to allow changes, choose Yes so the attendance viewer can repair the record. The viewer only updates attendance and does not change your course registration."
      },
      {
        "type": "paragraph",
        "text": "Teaching Systems Support\nCase AT-261115"
      }
    ],
    "explanation": "Phishing: the attachment is an executable, not a PDF, and asks for permission to change the computer. A routine attendance report does not require an unsolicited program. The familiar sender could be spoofed or compromised. Check attendance in the usual student portal or ask teaching support independently.",
    "indicators": [
      {
        "target": "body",
        "text": "Attendance-Review.pdf.exe",
        "explanation": "The final .exe extension identifies a program, despite the PDF-looking filename."
      },
      {
        "target": "body",
        "text": "allow changes, choose Yes",
        "explanation": "The message asks you to grant a program permission to alter the computer."
      },
      {
        "target": "body",
        "text": "repair the record",
        "explanation": "A plausible administrative problem is being used to justify running the attachment."
      }
    ]
  },
  {
    "id": "alien-wallet",
    "institution": "bank",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise wallet recovery-phrase theft disguised as a protective backup migration.",
    "senderName": "Meridian Digital Wallet",
    "senderEmail": "wallet@meridian-wallet-help.example",
    "recipient": "student@xmum.example",
    "subject": "Wallet migration WLT-184207: backup verification",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your wallet backup is eligible for the updated recovery service. Verification keeps your existing balance and avoids creating a second wallet."
      },
      {
        "type": "link",
        "text": "Review recovery backup",
        "url": "https://wallet.meridian-bank.example.backup-check.example/recovery/WLT-184207"
      },
      {
        "type": "paragraph",
        "text": "On the verification page, enter your 12-word recovery phrase in the original order. Do not enter a bank password or make a transfer. The phrase is used only to confirm that the backup belongs to you."
      },
      {
        "type": "paragraph",
        "text": "Wallet Recovery Operations\nReference WLT-184207"
      }
    ],
    "explanation": "Phishing: a recovery phrase gives control of a wallet and must not be entered into an emailed verification site. The destination belongs to backup-check.example, not the reference bank. Warnings not to send a password or transfer money can distract from the more valuable secret being requested. Verify any migration through the established wallet app.",
    "indicators": [
      {
        "target": "body",
        "text": "12-word recovery phrase",
        "explanation": "A recovery phrase can let someone restore and control a wallet."
      },
      {
        "target": "body",
        "text": "wallet.meridian-bank.example.backup-check.example",
        "explanation": "The bank name is embedded in a host controlled under backup-check.example."
      },
      {
        "target": "body",
        "text": "used only to confirm",
        "explanation": "Calling a secret “verification” does not limit what an attacker can do with it."
      }
    ]
  },
  {
    "id": "monday-refund",
    "institution": "shopping",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise callback and remote-access refund fraud behind a realistic subscription receipt.",
    "senderName": "ShopLane Billing Support",
    "senderEmail": "billing@shoplane.example",
    "recipient": "student@xmum.example",
    "subject": "Subscription receipt SL-SUB-184207 — RM 299.00",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your annual delivery-membership renewal has been processed for RM 299.00. This receipt was generated automatically; the charge may take one business day to appear in your order history."
      },
      {
        "type": "detail",
        "text": "Receipt SL-SUB-184207\nPlan: annual delivery membership\nAmount: RM 299.00"
      },
      {
        "type": "paragraph",
        "text": "Did not authorise this renewal? Reply “CANCEL” to request a billing callback. The agent will guide you to install a remote-control app and share its access code so the refund can be entered on your device."
      },
      {
        "type": "paragraph",
        "text": "Please keep the billing case with the callback agent to avoid duplicate refunds.\nShopLane Billing Support"
      }
    ],
    "explanation": "Phishing: an unexpected receipt pushes a callback and then remote access to your device. A refund does not require an unknown caller to control your computer. A matching sender and an explanation for a missing order record are not proof of a charge. Check subscriptions in the shopping app and contact support independently. No real callback number or remote-control link is supplied.",
    "indicators": [
      {
        "target": "body",
        "text": "install a remote-control app and share its access code",
        "explanation": "This would let the supposed refund agent operate your computer."
      },
      {
        "target": "body",
        "text": "may take one business day to appear",
        "explanation": "The message explains away the absence of an independently verifiable purchase."
      },
      {
        "target": "body",
        "text": "avoid duplicate refunds",
        "explanation": "This pretext encourages staying inside the attacker-controlled conversation."
      }
    ]
  }
];
  if(typeof module!=="undefined"&&module.exports)module.exports=emails;else root.EMAIL_BANK=emails;
})(typeof window!=="undefined"?window:globalThis);
