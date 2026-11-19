/* Fictional investigation cases. All links and attachments are inert. */
(function(root){"use strict";const emails=[
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
        "text": "Digital Banking Operations\nMeridian Bank\nFor questions, use your usual service channel and quote this reference."
      }
    ],
    "explanation": "Phishing: it hijacks a plausible device-review event to collect authentication factors at an unrelated destination.",
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
    ],
    "context": {
      "source": "Your bank app, opened independently",
      "facts": [
        "A device review is pending in your app.",
        "The bank’s device controls are inside its usual app."
      ]
    },
    "reasoning": {
      "evidence": "A real device review does not justify sending a banking password and authorisation code to meridian-bank-secure.example. That destination is separate from meridian-bank.example.",
      "contrast": "The case reference and genuine device alert make the story plausible, but do not authorise the emailed site to collect authentication secrets. The deadline is not the reason for the verdict.",
      "nextStep": "Open the bank app yourself and remove or report the device there; do not enter credentials through this email."
    },
    "acceptedEvidence": [
      "body:4",
      "sender",
      "destination:3"
    ],
    "lesson": "credentials"
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
        "text": "IT Service Desk · Student Systems\nFor questions, use your usual service channel and quote this reference."
      }
    ],
    "explanation": "Phishing: the genuine-looking quota detail masks a campus-credential request at an unrelated host.",
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
    ],
    "context": {
      "source": "Your student portal, opened from its saved bookmark",
      "facts": [
        "Your mailbox usage is 9.8 GB.",
        "Storage reports are under IT Services → Mailbox."
      ]
    },
    "reasoning": {
      "evidence": "The inspected host ends in account-review.example, not xmum.example. It asks for a campus sign-in despite being outside the university service.",
      "contrast": "The correct storage figure and university-looking sender are not sufficient: a phisher can reuse known details or spoof a sender. A routine tone does not validate the destination.",
      "nextStep": "Check the report under IT Services in the bookmarked portal or confirm the ticket at the IT counter."
    },
    "acceptedEvidence": [
      "destination:3"
    ],
    "lesson": "credentials"
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
        "text": "Delivery Exceptions Team\nParcelPath\nFor questions, use your usual service channel and quote this reference."
      }
    ],
    "explanation": "Phishing: it turns a plausible address problem into payment-card collection outside the courier service.",
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
    ],
    "context": {
      "source": "Your courier app and original order",
      "facts": [
        "Parcel PP-MY-804219 is expected.",
        "Your unit number needs checking in the courier app."
      ]
    },
    "reasoning": {
      "evidence": "The link belongs to delivery-case.example, not parcelpath.example, yet asks for card details. A genuine parcel problem does not verify this payment destination.",
      "contrast": "Neither an expected parcel nor a small RM 2.40 fee makes an emailed card form trustworthy. The problem could be real while the payment instruction is fraudulent.",
      "nextStep": "Correct the address in the courier app and check whether any fee is actually due before paying."
    },
    "acceptedEvidence": [
      "destination:3",
      "sender"
    ],
    "lesson": "card"
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
        "text": "Order SL-583102\nShopLane Purchase Documents\nFor questions, use your usual service channel and quote this reference."
      }
    ],
    "explanation": "Phishing: the purchase is plausible, but the requested mailbox access is unrelated and excessive.",
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
    ],
    "context": {
      "source": "Your ShopLane app, opened independently",
      "facts": [
        "Order SL-583102 for RM 89.90 exists.",
        "Its receipt is already in My Purchases."
      ]
    },
    "reasoning": {
      "evidence": "The attachment ends in .html and asks for permission to read and send campus mail. Neither permission is needed to display this shopping receipt.",
      "contrast": "The matching order, amount and sender do not make excessive mailbox permissions legitimate. An attacker can misuse granted access without learning a password.",
      "nextStep": "Decline the permission request and use the receipt already available in My Purchases."
    },
    "acceptedEvidence": [
      "body:3"
    ],
    "lesson": "permissions"
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
    "explanation": "Phishing: a plausible refund notice conceals a different host and an inappropriate request for bank credentials.",
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
    ],
    "context": {
      "source": "Your saved MyTax portal",
      "facts": [
        "Refund advice EF-2026-184207 exists.",
        "The advice lists RM 486.20."
      ]
    },
    "reasoning": {
      "evidence": "The visible MyTax link actually opens refund-desk.example. The page is presented as a partner but asks for a bank login.",
      "contrast": "A correct refund reference and amount are not enough to trust a new destination. Receiving a refund does not require disclosing bank credentials to that site.",
      "nextStep": "Open the saved tax portal yourself and review the advice there; do not supply a bank login through the emailed link."
    },
    "acceptedEvidence": [
      "destination:2",
      "body:3"
    ],
    "lesson": "credentials"
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
    "explanation": "Phishing: it uses a real-looking security problem to solicit an authentication code by reply.",
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
    ],
    "context": {
      "source": "Your Campus ID security page",
      "facts": [
        "An unfamiliar recovery-number change is pending.",
        "The portal has a Cancel change control."
      ]
    },
    "reasoning": {
      "evidence": "The email asks you to reply with a verification code. Such a code can approve an account action; it is not a safe way for an analyst to place a hold.",
      "contrast": "A real pending change and a familiar sender do not justify sharing the code. “Do not send your password” does not make the separate code request safe.",
      "nextStep": "Cancel or report the change in the independently opened identity portal and contact IT through a known channel."
    },
    "acceptedEvidence": [
      "body:3"
    ],
    "lesson": "credentials"
  },
  {
    "id": "study-room-booking",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Easy",
    "objective": "Use a matching service record and proportionate booking action to assess a light-hearted campus notice.",
    "senderName": "XMUM Library",
    "senderEmail": "library@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Group project rooms: now with fewer “can you hear me?”",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Revision-week room bookings are open. Give your group chat a physical location; the mute button will have to take the afternoon off."
      },
      {
        "type": "detail",
        "text": "Library rooms · Bookings close Friday · Up to 2 hours per group"
      },
      {
        "type": "link",
        "text": "Choose a study room",
        "url": "https://library.xmum.example/rooms"
      },
      {
        "type": "paragraph",
        "text": "Reserve one room using the booking control in your usual library account. Bring the reservation reference to the desk."
      }
    ],
    "explanation": "Legitimate for this case: the notice matches the library’s published room-booking process and asks for an ordinary reservation.",
    "indicators": [
      {
        "target": "body",
        "text": "Reserve one room using the booking control",
        "explanation": "The request is limited to the corroborated booking task."
      }
    ],
    "context": {
      "source": "Room bookings in your independently opened library account",
      "facts": [
        "The library lists revision-week bookings until Friday.",
        "Reservations use the existing room-booking control and allow up to two hours."
      ]
    },
    "reasoning": {
      "evidence": "The dates, two-hour limit and booking action match the independently checked library account.",
      "contrast": "Humour and a deadline do not make a message suspicious. A familiar address alone would not prove safety; the corroborated booking process supports this verdict.",
      "nextStep": "Open the library account yourself to book a room and keep the reference."
    },
    "acceptedEvidence": [
      "body:4",
      "verification:0",
      "verification:1"
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
    "explanation": "Legitimate for this case: the alert is corroborated by your app and directs you to its existing transaction-review process.",
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
    ],
    "context": {
      "source": "Your bank app, opened independently",
      "facts": [
        "Card 4821 shows TechSquare Online: RM 840.00.",
        "A review is pending in Cards → Activity."
      ]
    },
    "reasoning": {
      "evidence": "The merchant, amount and pending review agree with your own bank app. The email directs you to open that app yourself or use the number on your card.",
      "contrast": "An alarming transaction amount is not itself phishing. This message does not collect a code, password or card details and supplies no replacement support number or login link.",
      "nextStep": "Review or dispute the transaction within Cards → Activity in the independently opened app."
    },
    "acceptedEvidence": [
      "body:3",
      "verification:1"
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
        "text": "Bring your student card and quote PP-MY-612483 at the staffed collection counter. No additional collection payment is due.\nParcelPath Delivery Team"
      }
    ],
    "explanation": "Legitimate for this case: the collection details are corroborated and there is no new payment or secret to disclose.",
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
      }
    ],
    "context": {
      "source": "Your BookNest order and courier app",
      "facts": [
        "BN-22814 maps to parcel PP-MY-612483.",
        "The app confirms campus collection; RM 4.50 delivery is paid."
      ]
    },
    "reasoning": {
      "evidence": "The tracking reference, collection point and already-paid fee agree with your independent records. The link is under parcelpath.example and the only collection requirement is a student card.",
      "contrast": "A collection deadline and mention of a fee are not suspicious by themselves. This request matches the order and does not ask for a new off-site payment.",
      "nextStep": "Confirm the collection instructions in the courier app, then bring your student card to the staffed counter."
    },
    "acceptedEvidence": [
      "body:4",
      "verification:1"
    ]
  },
  {
    "id": "desk-duck-receipt",
    "institution": "shopping",
    "classification": "legitimate",
    "difficulty": "Easy",
    "objective": "Distinguish a playful but corroborated purchase receipt from payment or permission traps.",
    "senderName": "ShopLane Orders",
    "senderEmail": "orders@shoplane.example",
    "recipient": "student@xmum.example",
    "subject": "Order confirmed: one emotional-support desk duck",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your desk duck is on its way. It has no qualifications, but is available for silent moral support during deadlines."
      },
      {
        "type": "detail",
        "text": "Order SL-582714\nDesk duck: RM 18.00\nDelivery: RM 4.50\nTotal paid: RM 22.50 · Card ending 4821"
      },
      {
        "type": "attachment",
        "text": "Receipt-SL-582714.pdf · 42 KB"
      },
      {
        "type": "paragraph",
        "text": "Review the delivery address in My Purchases before dispatch. The order is already paid."
      }
    ],
    "explanation": "Legitimate for this case: the order, paid amount and requested address review match the existing shopping record.",
    "indicators": [
      {
        "target": "body",
        "text": "Total paid: RM 22.50",
        "explanation": "The item and delivery total agree with the independently checked purchase."
      }
    ],
    "context": {
      "source": "Your ShopLane My Purchases record",
      "facts": [
        "SL-582714 is your desk-duck order.",
        "RM 18.00 + RM 4.50 = RM 22.50, paid on card 4821."
      ]
    },
    "reasoning": {
      "evidence": "The duck order, total and card suffix match My Purchases. The action is limited to reviewing the address for that paid order.",
      "contrast": "A silly product, PDF attachment or correct arithmetic alone proves nothing. The independent order record and proportionate action support the verdict.",
      "nextStep": "Use My Purchases to check the address or view the receipt there; opening the attachment is unnecessary."
    },
    "acceptedEvidence": [
      "verification:0",
      "verification:1"
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
        "text": "Workshop: Saturday, 10:00 am–12:00 pm\nVenue: Student Activity Centre, Room 2\nDeposit: returned through the portal after attendance"
      },
      {
        "type": "link",
        "text": "View my workshop registration",
        "url": "https://events.xmum.example/registrations/FA-1124"
      },
      {
        "type": "paragraph",
        "text": "Deposit FA-1124 is refundable after attendance. Your place remains provisional until Friday, 5:00 pm.\nXMUM Student Activities"
      }
    ],
    "explanation": "Legitimate for this case: the fee is tied to your verified registration and the request uses the established event-payment workflow.",
    "indicators": [
      {
        "target": "body",
        "text": "https://events.xmum.example/registrations/FA-1124",
        "explanation": "events.xmum.example is a subdomain of the reference university domain, and the reference matches."
      },
      {
        "target": "body",
        "text": "returned through the portal after attendance",
        "explanation": "The fee has a specific event purpose and refund process; confirm both before paying."
      }
    ],
    "context": {
      "source": "Your student portal’s Events record",
      "facts": [
        "You registered for First Aid: FA-1124.",
        "The portal lists a refundable RM 10 seat deposit."
      ]
    },
    "reasoning": {
      "evidence": "The registration reference and deposit were independently confirmed in your Events record. Payment is through that existing registration, not an unrelated payee or personal account.",
      "contrast": "A fee and a deadline can be legitimate. The distinguishing evidence is your prior registration and the same fee in the trusted workflow, not simply the university-looking URL.",
      "nextStep": "Open Events → My Registrations yourself and confirm the deposit and refund terms there before paying."
    },
    "acceptedEvidence": [
      "verification:0",
      "verification:1"
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
        "text": "Review the recovery number under Account → Security → Recovery in your existing account. Do not send the number, a password or a code by reply.\nCampus ID Service Team"
      }
    ],
    "explanation": "Legitimate for this case: a published maintenance notice supports a limited review within your usual account settings.",
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
      }
    ],
    "context": {
      "source": "Your student portal and published IT notice",
      "facts": [
        "Maintenance CID-M-1023 is published by IT.",
        "Recovery settings are under Account → Security."
      ]
    },
    "reasoning": {
      "evidence": "The maintenance reference is corroborated, and the request is limited to reviewing your own recovery setting inside the existing identity service.",
      "contrast": "A security deadline or a sign-in can also appear in real maintenance. Here there is no request to send a code or password to another person and no unrelated destination.",
      "nextStep": "Use your normal portal bookmark, review the recovery number and ask the IT counter about anything unexpected."
    },
    "acceptedEvidence": [
      "verification:0",
      "body:4"
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
    "explanation": "Phishing: it contradicts the recorded application stage and adds an unsupported personal-account payment.",
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
    ],
    "context": {
      "source": "Your student portal’s Careers record",
      "facts": [
        "CS-26104 is your internship application.",
        "Its status is “Interview pending”; no equipment fee is listed."
      ]
    },
    "reasoning": {
      "evidence": "The email advances the application to onboarding and requests a transfer to a coordinator’s personal account. Your actual application has neither the offer nor the fee.",
      "contrast": "A familiar sender and a refund promise cannot resolve the mismatch with the recorded application. The issue is the unsupported payment demand, not the fact that an internship is paid.",
      "nextStep": "Do not transfer money. Ask the career office to check CS-26104 using the contact in the existing portal."
    },
    "acceptedEvidence": [
      "body:2",
      "verification:1"
    ],
    "lesson": "advance-fee"
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
        "text": "Please bring the completed comments sheet to your next appointment.\nScholarships Assessment Team\nFor questions, use your usual service channel and quote this reference."
      }
    ],
    "explanation": "Phishing: the requested macro/protection change is unnecessary for the verified comments workflow.",
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
    ],
    "context": {
      "source": "Your Financial Aid portal",
      "facts": [
        "SCH-26118 is your scholarship application.",
        "Panel comments are available there as a PDF preview."
      ]
    },
    "reasoning": {
      "evidence": "The email replaces an available PDF preview with a .docm attachment and tells you to enable active content or turn off Protected View.",
      "contrast": "A genuine application and matching office address do not justify running document code to read comments. The independently available preview removes the claimed need for this step.",
      "nextStep": "Use the PDF preview in Financial Aid and verify any unexpected document instruction with the scholarship counter."
    },
    "acceptedEvidence": [
      "body:3"
    ],
    "lesson": "malware"
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
        "text": "Your application CS-26104 for the data internship has been shortlisted. Please select an interview slot by Friday; the employer will discuss duties and allowances at the interview. Your CV survived the group chat; the interview is the next step."
      },
      {
        "type": "link",
        "text": "View my application and interview slots",
        "url": "https://careers.xmum.example/applications/CS-26104"
      },
      {
        "type": "paragraph",
        "text": "Interview selection is available under Careers → My Applications. The interview covers duties and allowances; no reservation payment or equipment purchase is required."
      },
      {
        "type": "paragraph",
        "text": "If you did not apply, ask the campus career counter to check the reference.\nXMUM Career Services"
      }
    ],
    "explanation": "Legitimate for this case: a known application and independently listed invitation support the requested interview booking.",
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
    ],
    "context": {
      "source": "Your student portal’s Careers record",
      "facts": [
        "You applied under CS-26104.",
        "The portal lists an interview invitation and available slots."
      ]
    },
    "reasoning": {
      "evidence": "The reference, shortlist and interview slots agree with your existing application. The request is to book an interview in that portal; no fee or equipment purchase is required.",
      "contrast": "A recruitment email is not automatically a scam. Unlike an advance-fee offer, this message matches your application and asks for a normal, limited next step.",
      "nextStep": "Open Careers → My Applications from your usual portal and choose a recorded interview slot."
    },
    "acceptedEvidence": [
      "verification:1",
      "body:3"
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
        "text": "Upload only the evidence listed under Financial Aid → My Applications, with unrelated account numbers and transactions redacted. Please do not send financial documents by email reply."
      },
      {
        "type": "paragraph",
        "text": "The scholarship counter can confirm the checklist and discuss an extension before Friday.\nXMUM Scholarships Office"
      }
    ],
    "explanation": "Legitimate for this case: the sensitive-document request has a verified purpose, limited scope and an established submission channel.",
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
    ],
    "context": {
      "source": "Your Financial Aid application checklist",
      "facts": [
        "SCH-26118 is your active application.",
        "Its checklist requests household-income clarification."
      ]
    },
    "reasoning": {
      "evidence": "The application and requested evidence match the independently checked checklist. Upload is through the usual portal, limited to listed documents, with unrelated information redacted.",
      "contrast": "Financial documents are sensitive, but asking for them is not automatically phishing. The known application, verified need, restricted scope and established upload channel distinguish this request.",
      "nextStep": "Open Financial Aid → My Applications yourself, confirm the checklist and upload only the required redacted evidence."
    },
    "acceptedEvidence": [
      "verification:1",
      "body:3"
    ]
  },
  {
    "id": "mascot-qr",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise card-data theft behind a lost-property collection QR.",
    "senderName": "XMUM Lost Property",
    "senderEmail": "lostproperty@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Your penguin has checked in. It has no ID.",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "A penguin plush matching your lost-property report is at the student desk. It has occupied a chair and declined to answer questions."
      },
      {
        "type": "attachment",
        "text": "Penguin-Collection-LP-042-QR.png · 24 KB"
      },
      {
        "type": "paragraph",
        "text": "Scan the attached QR and enter your card number, expiry date and CVV to release the item. No payment is taken; the card check confirms the collector is a real person."
      },
      {
        "type": "paragraph",
        "text": "Lost Property Desk · Case LP-042"
      }
    ],
    "explanation": "Phishing: a real lost item is used to justify collecting payment-card credentials through a QR code.",
    "indicators": [
      {
        "target": "body",
        "text": "card number, expiry date and CVV",
        "explanation": "Payment-card credentials are unrelated to proving ownership of lost property."
      },
      {
        "target": "body",
        "text": "No payment is taken",
        "explanation": "A no-charge promise does not make collecting payment credentials appropriate."
      }
    ],
    "context": {
      "source": "Your lost-property report in the student portal",
      "facts": [
        "LP-042 records your missing penguin plush.",
        "Collection is at the student desk with your student card. No bank-card check is listed."
      ]
    },
    "reasoning": {
      "evidence": "A penguin plush does not need your card number, expiry date or CVV to go home. The recorded collection process uses a student card at the desk.",
      "contrast": "The joke, matching report and university sender do not decide authenticity. The unrelated card-data request does; a QR code does not make it trustworthy.",
      "nextStep": "Collect the item at the student desk using the process in your existing report. Do not submit bank-card details through the QR."
    },
    "acceptedEvidence": [
      "body:3",
      "verification:1"
    ],
    "lesson": "card"
  },
  {
    "id": "attendance-clone",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Identify a program disguised as a PDF and refuse unnecessary system privileges.",
    "senderName": "XMUM Teaching Systems",
    "senderEmail": "teaching@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Attendance assistant: send your digital twin",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Two attendance entries need review. The new Attendance Assistant promises to handle the paperwork. Sadly, it still cannot attend your 8 am lecture for you."
      },
      {
        "type": "attachment",
        "text": "Attendance-Assistant.pdf.exe · 126 KB"
      },
      {
        "type": "paragraph",
        "text": "Run the attachment and choose Yes when Windows asks to allow changes. The assistant will repair the record on your computer."
      },
      {
        "type": "paragraph",
        "text": "Teaching Systems Support · Case AT-261115"
      }
    ],
    "explanation": "Phishing: the attachment is an executable, and the sender asks for system-change permission to fix a record held in the student portal.",
    "indicators": [
      {
        "target": "body",
        "text": "Attendance-Assistant.pdf.exe",
        "explanation": "The final .exe extension identifies a program, not a PDF."
      },
      {
        "target": "body",
        "text": "allow changes",
        "explanation": "The request grants a program permission to alter the computer."
      }
    ],
    "context": {
      "source": "Your student portal’s attendance page",
      "facts": [
        "An attendance correction is awaiting review.",
        "The portal provides an in-browser review form."
      ]
    },
    "reasoning": {
      "evidence": "The final .exe extension and request to allow changes are inappropriate for an attendance review that already has an in-browser form.",
      "contrast": "A real attendance correction and a joke about early lectures do not justify installing an unsolicited program.",
      "nextStep": "Use the attendance form in your independently opened student portal. Report the executable to teaching support."
    },
    "acceptedEvidence": [
      "body:2",
      "body:3"
    ],
    "lesson": "malware"
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
        "text": "Wallet Recovery Operations\nReference WLT-184207\nFor questions, use your usual service channel and quote this reference."
      }
    ],
    "explanation": "Phishing: it turns a plausible backup notice into recovery-phrase theft at an unrelated site.",
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
    ],
    "context": {
      "source": "Your existing wallet app",
      "facts": [
        "A backup-service notice appears in the app.",
        "No external recovery-phrase check is listed."
      ]
    },
    "reasoning": {
      "evidence": "The email asks for the wallet’s 12-word recovery phrase at a host under backup-check.example. That phrase can restore control of the wallet.",
      "contrast": "A genuine service notice does not authorise an external site to collect the recovery phrase. “No transfer” and “no bank password” do not make disclosure of the wallet secret safe.",
      "nextStep": "Do not enter the phrase. Follow any migration instructions only inside the established wallet app."
    },
    "acceptedEvidence": [
      "body:3",
      "destination:2"
    ],
    "lesson": "credentials"
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
    "explanation": "Phishing: an unsupported charge is used to create a refund pretext for remote access.",
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
    ],
    "context": {
      "source": "Your independently opened ShopLane account",
      "facts": [
        "You have no delivery-membership subscription.",
        "No RM 299 renewal appears in purchase or subscription records."
      ]
    },
    "reasoning": {
      "evidence": "The receipt describes an unrecorded subscription and directs you to a callback that requires remote-control software and an access code.",
      "contrast": "A sender address or a claim that records are delayed does not establish that a charge exists. Even a genuine disputed charge would not require an unknown agent to control your computer.",
      "nextStep": "Do not grant remote access or reply for a callback. Check payment records and contact support through the existing app."
    },
    "acceptedEvidence": [
      "body:3",
      "verification:1"
    ],
    "lesson": "remote-access"
  },
  {
    "id": "mascot-vote",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise excessive mailbox permissions disguised as a simple campus poll.",
    "senderName": "XMUM Student Activities",
    "senderEmail": "activities@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Campus mascot vote: the cat has hired a campaign manager",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "The campus cat has entered the mascot election. Its campaign promises more naps and fewer meetings. Cast your vote before Friday."
      },
      {
        "type": "link",
        "text": "Open the mascot ballot",
        "url": "https://events.xmum.example/mascot-vote"
      },
      {
        "type": "paragraph",
        "text": "To count your vote, approve permission for the voting app to read and send all of your mail. This lets the campaign team confirm each voter automatically."
      }
    ],
    "context": {
      "source": "The mascot election notice in your usual student portal",
      "facts": [
        "A mascot vote is open until Friday.",
        "The ballot records a single choice. The published process does not request mailbox access."
      ]
    },
    "explanation": "Phishing: voting in a real campus poll does not require an app to read and send your email.",
    "reasoning": {
      "evidence": "The app wants permission to read and send all of your mail for a one-choice ballot. That scope is unrelated to the task.",
      "contrast": "A funny campaign and a university-domain link are not proof of fraud or safety. Excessive permissions decide this case.",
      "nextStep": "Decline the mailbox grant and find the ballot through the existing student portal."
    },
    "indicators": [
      {
        "target": "body",
        "text": "read and send all of your mail",
        "explanation": "A campus vote does not require control of the voter’s mailbox."
      }
    ],
    "acceptedEvidence": [
      "body:3",
      "verification:1"
    ],
    "lesson": "permissions"
  },
  {
    "id": "wifi-maintenance",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Easy",
    "objective": "The notice matches the published maintenance record and requests no installer, secret or security override.",
    "senderName": "XMUM Network Services",
    "senderEmail": "network@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Student Wi-Fi maintenance NF-26116",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Student Wi-Fi may disconnect briefly during Friday’s certificate update. Existing registered devices reconnect automatically after maintenance."
      },
      {
        "type": "detail",
        "text": "Window: Friday, 6:00–6:30 pm\nReference NF-26116"
      },
      {
        "type": "paragraph",
        "text": "No installation or password change is required. If a device does not reconnect, leave its current settings in place and bring it to the IT service counter."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "IT’s published notice lists NF-26116 at 6:00 pm Friday.",
        "Registered devices are set to reconnect automatically."
      ]
    },
    "explanation": "Legitimate for this case: The notice matches the published maintenance record and requests no installer, secret or security override.",
    "reasoning": {
      "evidence": "The notice matches the published maintenance record and requests no installer, secret or security override.",
      "contrast": "A technical notice or brief service interruption is not itself phishing. The action is limited and corroborated.",
      "nextStep": "Leave the current profile intact; use the staffed IT counter if reconnection fails."
    },
    "indicators": [
      {
        "target": "body",
        "text": "No installation or password change is required. If a device does not reconnect, leave its current settings in place and bring it to the IT service counter.",
        "explanation": "The notice matches the published maintenance record and requests no installer, secret or security override."
      }
    ],
    "acceptedEvidence": [
      "body:3",
      "verification:0"
    ]
  },
  {
    "id": "noodle-prize",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Easy",
    "objective": "Recognise bank-code theft in an unrelated campus food-prize claim.",
    "senderName": "XMUM Supper Club",
    "senderEmail": "supper@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Emergency noodle grant: your toppings have been approved",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "You won a free supper bowl in the club draw. The toppings committee reached a unanimous decision after only three group chats."
      },
      {
        "type": "detail",
        "text": "Supper draw NC-061 · Collection 8:00–9:00 pm"
      },
      {
        "type": "paragraph",
        "text": "Reply with the one-time code from your bank’s SMS to activate the meal voucher. Do not send your password; the code only confirms the winner."
      }
    ],
    "context": {
      "source": "Supper Club’s draw result in the student portal",
      "facts": [
        "NC-061 lists you as a supper-bowl winner.",
        "The collection instructions ask for your club voucher at the stall, not a bank code."
      ]
    },
    "explanation": "Phishing: a bank authentication code has no role in activating a campus meal voucher.",
    "reasoning": {
      "evidence": "The request asks you to reply with a one-time code from your bank’s SMS. A food prize cannot justify sharing a banking authentication factor.",
      "contrast": "A real prize and a familiar club address do not make the bank-code request legitimate. The joke is not the warning sign.",
      "nextStep": "Check the club voucher in the portal and collect at the stall. Keep bank authentication codes private."
    },
    "indicators": [
      {
        "target": "body",
        "text": "one-time code from your bank’s SMS",
        "explanation": "A banking code must not be shared to claim a meal."
      }
    ],
    "acceptedEvidence": [
      "body:3",
      "verification:1"
    ],
    "lesson": "credentials"
  },
  {
    "id": "noodle-pickup",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Easy",
    "objective": "Distinguish an appropriate meal-collection voucher from a banking authentication code.",
    "senderName": "XMUM Supper Club",
    "senderEmail": "supper@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Your noodles are ready. Your assignment can wait five minutes.",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your supper-draw bowl is ready at the club stall. The toppings committee has concluded negotiations. Extra spring onion won."
      },
      {
        "type": "detail",
        "text": "Supper draw NC-061 · Collection 8:00–9:00 pm"
      },
      {
        "type": "paragraph",
        "text": "Show the club-issued voucher from the student portal to the stall volunteer when you collect your bowl."
      }
    ],
    "context": {
      "source": "Your Supper Club voucher in the usual student portal",
      "facts": [
        "NC-061 lists your free bowl at the club stall, 8:00–9:00 pm.",
        "A collection voucher for this draw is already available in your portal."
      ]
    },
    "explanation": "Legitimate for this case: the location, time and club voucher agree with the independently checked prize record.",
    "reasoning": {
      "evidence": "The request uses the existing club voucher at the listed stall for a real supper prize. Its issuer, purpose and place of use all match.",
      "contrast": "Not every code or voucher is a banking secret. The cheerful wording does not decide the answer; the corroborated, limited collection step does.",
      "nextStep": "Open the student portal yourself and show the club voucher only at the listed collection stall."
    },
    "indicators": [
      {
        "target": "body",
        "text": "club-issued voucher",
        "explanation": "This is the voucher issued for this meal, used at the matching collection stall."
      }
    ],
    "acceptedEvidence": [
      "body:3",
      "verification:1"
    ]
  },
  {
    "id": "library-payment",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Medium",
    "objective": "The real balance does not validate a card-payment page hosted under payments-help.example rather than xmum.example.",
    "senderName": "XMUM Library Accounts",
    "senderEmail": "library@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Library balance LB-20418: payment reminder",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "A library balance of RM 8.00 is outstanding. Clearing it before Friday keeps your next room booking available."
      },
      {
        "type": "detail",
        "text": "Account LB-20418\nBalance RM 8.00"
      },
      {
        "type": "link",
        "text": "Pay library balance",
        "url": "https://library.xmum.example.payments-help.example/LB-20418"
      },
      {
        "type": "paragraph",
        "text": "Use the payment page to enter your card details. The library counter can answer balance queries; keep this reference for your receipt."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "Your library account shows an RM 8.00 fine.",
        "The account’s Pay balance control is inside the university portal."
      ]
    },
    "explanation": "Phishing: The real balance does not validate a card-payment page hosted under payments-help.example rather than xmum.example.",
    "reasoning": {
      "evidence": "The real balance does not validate a card-payment page hosted under payments-help.example rather than xmum.example.",
      "contrast": "Neither the low fee nor accurate balance details establishes ownership of the inspected destination.",
      "nextStep": "Pay only through the balance control in the independently opened library account."
    },
    "indicators": [
      {
        "target": "body",
        "text": "https://library.xmum.example.payments-help.example/LB-20418",
        "explanation": "The real balance does not validate a card-payment page hosted under payments-help.example rather than xmum.example."
      }
    ],
    "acceptedEvidence": [
      "destination:3",
      "verification:1"
    ],
    "lesson": "card"
  },
  {
    "id": "library-fine",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Medium",
    "objective": "The amount and reference match the independently checked account, and the payment stays in its established balance workflow.",
    "senderName": "XMUM Library Accounts",
    "senderEmail": "library@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Library balance LB-20418: payment reminder",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "A library balance of RM 8.00 is outstanding. Clearing it before Friday keeps your next room booking available."
      },
      {
        "type": "detail",
        "text": "Account LB-20418\nBalance RM 8.00"
      },
      {
        "type": "link",
        "text": "View library balance",
        "url": "https://library.xmum.example/accounts/LB-20418"
      },
      {
        "type": "paragraph",
        "text": "Review the balance under Library → My Account. Payment uses that account’s Pay balance control and produces a portal receipt."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "Your library account shows an RM 8.00 fine.",
        "Its Pay balance control accepts payment and issues a portal receipt."
      ]
    },
    "explanation": "Legitimate for this case: The amount and reference match the independently checked account, and the payment stays in its established balance workflow.",
    "reasoning": {
      "evidence": "The amount and reference match the independently checked account, and the payment stays in its established balance workflow.",
      "contrast": "A fine and a deadline are not enough to label a message phishing. Here the record and payment scope support the request.",
      "nextStep": "Use the known library account to review and pay the recorded fine."
    },
    "indicators": [
      {
        "target": "body",
        "text": "Review the balance under Library → My Account. Payment uses that account’s Pay balance control and produces a portal receipt.",
        "explanation": "The amount and reference match the independently checked account, and the payment stays in its established balance workflow."
      }
    ],
    "acceptedEvidence": [
      "verification:0",
      "verification:1",
      "body:4"
    ]
  },
  {
    "id": "bank-beneficiary",
    "institution": "bank",
    "classification": "phishing",
    "difficulty": "Medium",
    "objective": "Transferring money to a holding account is not a necessary step for deleting a payee; the existing app provides removal directly.",
    "senderName": "Meridian Bank Payee Services",
    "senderEmail": "payees@meridian-bank.example",
    "recipient": "student@xmum.example",
    "subject": "Payee review PY-4821",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "A payee named Campus Rent was added to card-linked transfers. Review the payee before the next standing-payment run."
      },
      {
        "type": "detail",
        "text": "Review PY-4821\nPayee: Campus Rent"
      },
      {
        "type": "paragraph",
        "text": "To secure the account, approve a RM 500 transfer to our holding account in your app. The money will be returned after the payee is removed. You may confirm this case with bank support."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "Your bank app shows an unfamiliar payee.",
        "The app lets you remove a payee without making a transfer."
      ]
    },
    "explanation": "Phishing: Transferring money to a holding account is not a necessary step for deleting a payee; the existing app provides removal directly.",
    "reasoning": {
      "evidence": "Transferring money to a holding account is not a necessary step for deleting a payee; the existing app provides removal directly.",
      "contrast": "A real unfamiliar payee and an accurate case reference do not make a “safe account” transfer legitimate.",
      "nextStep": "Remove or report the payee in the app and contact the number on your card."
    },
    "indicators": [
      {
        "target": "body",
        "text": "To secure the account, approve a RM 500 transfer to our holding account in your app. The money will be returned after the payee is removed. You may confirm this case with bank support.",
        "explanation": "Transferring money to a holding account is not a necessary step for deleting a payee; the existing app provides removal directly."
      }
    ],
    "acceptedEvidence": [
      "body:3",
      "verification:1"
    ],
    "lesson": "safe-account"
  },
  {
    "id": "bank-payee",
    "institution": "bank",
    "classification": "legitimate",
    "difficulty": "Medium",
    "objective": "The notice matches the account record and limits action to the app’s existing remove/report controls.",
    "senderName": "Meridian Bank Payee Services",
    "senderEmail": "payees@meridian-bank.example",
    "recipient": "student@xmum.example",
    "subject": "Payee review PY-4821",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "A payee named Campus Rent was added to your saved transfer list. Review it before the next standing-payment run."
      },
      {
        "type": "detail",
        "text": "Review PY-4821\nPayee: Campus Rent"
      },
      {
        "type": "paragraph",
        "text": "Open Payees in your existing bank app. If the payee is unfamiliar, use Remove payee or contact card support. No transfer is needed to remove it."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "Your bank app shows the same Campus Rent payee.",
        "Remove payee is available in the app without a transfer."
      ]
    },
    "explanation": "Legitimate for this case: The notice matches the account record and limits action to the app’s existing remove/report controls.",
    "reasoning": {
      "evidence": "The notice matches the account record and limits action to the app’s existing remove/report controls.",
      "contrast": "A security-related request is not automatically fake. It does not ask for money, credentials by reply or a new support contact.",
      "nextStep": "Review the payee inside the bank app and remove/report it if unfamiliar."
    },
    "indicators": [
      {
        "target": "body",
        "text": "Open Payees in your existing bank app. If the payee is unfamiliar, use Remove payee or contact card support. No transfer is needed to remove it.",
        "explanation": "The notice matches the account record and limits action to the app’s existing remove/report controls."
      }
    ],
    "acceptedEvidence": [
      "body:3",
      "verification:1"
    ]
  },
  {
    "id": "cloud-share",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Hard",
    "objective": "A view-only budget does not require permission to read and send all mailbox messages, even at a familiar-looking file service.",
    "senderName": "XMUM Project Files",
    "senderEmail": "projects@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Shared: AG1-2 activity budget",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "The AG1-2 activity budget is ready for review. The project lead has moved the worksheet to a shared document viewer."
      },
      {
        "type": "detail",
        "text": "Project AG1-2\nDocument: activity-budget"
      },
      {
        "type": "link",
        "text": "Open shared budget",
        "url": "https://files.xmum.example/view/activity-budget"
      },
      {
        "type": "paragraph",
        "text": "When the viewer requests permission, allow it to read and send all of your mail. This lets collaborators receive document updates automatically."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "You are assigned to AG1-2.",
        "The project’s budget is a view-only worksheet in the shared folder."
      ]
    },
    "explanation": "Phishing: A view-only budget does not require permission to read and send all mailbox messages, even at a familiar-looking file service.",
    "reasoning": {
      "evidence": "A view-only budget does not require permission to read and send all mailbox messages, even at a familiar-looking file service.",
      "contrast": "A real project and a university-domain link cannot justify unrelated, excessive permission scope.",
      "nextStep": "Decline the mailbox grant and open the known shared folder or ask the project lead."
    },
    "indicators": [
      {
        "target": "body",
        "text": "When the viewer requests permission, allow it to read and send all of your mail. This lets collaborators receive document updates automatically.",
        "explanation": "A view-only budget does not require permission to read and send all mailbox messages, even at a familiar-looking file service."
      }
    ],
    "acceptedEvidence": [
      "body:4",
      "verification:1"
    ],
    "lesson": "permissions"
  },
  {
    "id": "cloud-share-record",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "objective": "The share is independently recorded and the requested permission is limited to viewing the named project file.",
    "senderName": "XMUM Project Files",
    "senderEmail": "projects@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Shared: AG1-2 activity budget",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "The AG1-2 activity budget is ready for review. The project lead has placed the worksheet in the shared project folder."
      },
      {
        "type": "detail",
        "text": "Project AG1-2\nDocument: activity-budget"
      },
      {
        "type": "link",
        "text": "Open shared budget",
        "url": "https://files.xmum.example/view/activity-budget"
      },
      {
        "type": "paragraph",
        "text": "The viewer requests access only to the selected budget file. It does not request mailbox access or permission to edit other files."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "The project lead shared activity-budget with AG1-2.",
        "The folder’s access record lists view-only permission for that file."
      ]
    },
    "explanation": "Legitimate for this case: The share is independently recorded and the requested permission is limited to viewing the named project file.",
    "reasoning": {
      "evidence": "The share is independently recorded and the requested permission is limited to viewing the named project file.",
      "contrast": "A permission prompt is not automatically malicious. Its limited scope and the verified share distinguish it from mailbox-consent abuse.",
      "nextStep": "Check the share in the known project folder and keep the permission limited to the selected file."
    },
    "indicators": [
      {
        "target": "body",
        "text": "The viewer requests access only to the selected budget file. It does not request mailbox access or permission to edit other files.",
        "explanation": "The share is independently recorded and the requested permission is limited to viewing the named project file."
      }
    ],
    "acceptedEvidence": [
      "body:4",
      "verification:1"
    ]
  },
  {
    "id": "payroll-update",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Hard",
    "objective": "The actual host belongs to account-confirm.example and requests a bank login and authorisation code for a receiving-account review.",
    "senderName": "XMUM Allowance Office",
    "senderEmail": "allowances@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Allowance AL-26118: receiving account review",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your placement allowance is scheduled for the next batch. Check the receiving account before Friday so the payment is not delayed."
      },
      {
        "type": "detail",
        "text": "Allowance AL-26118\nPlacement CS-26104"
      },
      {
        "type": "link",
        "text": "https://finance.xmum.example/allowances/AL-26118",
        "url": "https://finance.xmum.example.account-confirm.example/AL-26118"
      },
      {
        "type": "paragraph",
        "text": "The review asks for your bank login and the SMS authorisation code to validate the receiving account. No payment will be taken. The allowance office can confirm the batch reference."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "AL-26118 is a scheduled placement allowance.",
        "The finance portal records the receiving account number, never a bank login or OTP."
      ]
    },
    "explanation": "Phishing: The actual host belongs to account-confirm.example and requests a bank login and authorisation code for a receiving-account review.",
    "reasoning": {
      "evidence": "The actual host belongs to account-confirm.example and requests a bank login and authorisation code for a receiving-account review.",
      "contrast": "A genuine allowance and familiar sender do not justify disclosing bank authentication factors. Receiving money needs no bank sign-in at that site.",
      "nextStep": "Check the receiving account through the usual finance portal and never supply the bank login or code."
    },
    "indicators": [
      {
        "target": "body",
        "text": "https://finance.xmum.example.account-confirm.example/AL-26118",
        "explanation": "The actual host belongs to account-confirm.example and requests a bank login and authorisation code for a receiving-account review."
      },
      {
        "target": "body",
        "text": "The review asks for your bank login and the SMS authorisation code to validate the receiving account. No payment will be taken. The allowance office can confirm the batch reference.",
        "explanation": "The actual host belongs to account-confirm.example and requests a bank login and authorisation code for a receiving-account review."
      }
    ],
    "acceptedEvidence": [
      "destination:3",
      "body:4",
      "verification:1"
    ],
    "lesson": "credentials"
  },
  {
    "id": "payroll-confirm",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "objective": "The allowance and review form are independently recorded, and the requested details are limited to receiving-payment information.",
    "senderName": "XMUM Allowance Office",
    "senderEmail": "allowances@xmum.example",
    "recipient": "student@xmum.example",
    "subject": "Allowance AL-26118: receiving account review",
    "body": [
      {
        "type": "paragraph",
        "text": "Hi Aisha,"
      },
      {
        "type": "paragraph",
        "text": "Your placement allowance is scheduled for the next batch. Check the receiving account before Friday so the payment is not delayed."
      },
      {
        "type": "detail",
        "text": "Allowance AL-26118\nPlacement CS-26104"
      },
      {
        "type": "link",
        "text": "Review receiving account",
        "url": "https://finance.xmum.example/allowances/AL-26118"
      },
      {
        "type": "paragraph",
        "text": "Review the account holder name and receiving account number in the finance portal. The form does not ask for a bank password, banking login or one-time code."
      }
    ],
    "context": {
      "source": "Independently opened service record",
      "facts": [
        "AL-26118 is listed in your placement allowance record.",
        "The finance portal asks only for account holder name and receiving account number."
      ]
    },
    "explanation": "Legitimate for this case: The allowance and review form are independently recorded, and the requested details are limited to receiving-payment information.",
    "reasoning": {
      "evidence": "The allowance and review form are independently recorded, and the requested details are limited to receiving-payment information.",
      "contrast": "Financial details require care but are not all authentication secrets. The verified purpose, channel and limited fields support this request.",
      "nextStep": "Open the established finance portal yourself and confirm only the receiving-payment details requested there."
    },
    "indicators": [
      {
        "target": "body",
        "text": "Review the account holder name and receiving account number in the finance portal. The form does not ask for a bank password, banking login or one-time code.",
        "explanation": "The allowance and review form are independently recorded, and the requested details are limited to receiving-payment information."
      }
    ],
    "acceptedEvidence": [
      "verification:1",
      "body:4"
    ]
  }
];
if(typeof module!=="undefined"&&module.exports)module.exports=emails;else root.EMAIL_BANK=emails;
})(typeof window!=="undefined"?window:globalThis);
