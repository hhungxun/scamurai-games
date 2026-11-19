/* Fictional investigation cases. All links and attachments are inert. */
(function(root){"use strict";const emails=[
  {
    "id": "bank-verification",
    "institution": "bank",
    "classification": "phishing",
    "difficulty": "Easy",
    "brand": "Maybank2u",
    "objective": "Recognise a request for banking secrets, rather than relying on urgency alone.",
    "senderName": "Maybank2u · Digital Banking",
    "senderEmail": "alerts@maybank2u-verify.com",
    "subject": "Action needed: review device MB-841209",
    "body": [
      { "type": "banner", "variant": "alert", "text": "Security review required", "subtext": "A new device was added to your banking profile" },
      { "type": "paragraph", "text": "Dear Aisha," },
      { "type": "paragraph", "text": "A new device was signed in to your online banking profile at 14:32. Transfers from this device stay on hold until ownership is confirmed." },
      { "type": "detail", "text": "Case MB-841209 · Windows / Chrome · Kuala Lumpur" },
      { "type": "button", "text": "Review registered devices", "url": "https://maybank2u-verify.com/devices/MB-841209" },
      { "type": "paragraph", "text": "To remove a device you do not recognise, enter your banking password and the one-time authorisation code on the review page. The code confirms the removal; no transfer will be made." },
      { "type": "footer", "text": "Digital Banking Operations\nMaybank2u\nNever share your password or one-time code." }
    ],
    "explanation": "Phishing: it borrows a plausible device-review event to harvest two authentication factors through a lookalike address.",
    "indicators": [
      { "target": "body", "text": "Security review required", "explanation": "The banner presses urgency, but urgency alone is not proof of a scam." },
      { "target": "body", "text": "https://maybank2u-verify.com", "explanation": "The destination is a lookalike domain, not Maybank2u's real address." },
      { "target": "body", "text": "banking password and the one-time authorisation code", "explanation": "No genuine service asks you to hand over two authentication factors through a link." }
    ],
    "context": {
      "source": "Your bank app, opened independently",
      "facts": [
        "No new device is listed under your account in the app.",
        "Your bank never asks for a password and code together by email."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike destination and a request for both password and one-time code.",
      "contrast": "A real security notice names the device and directs you to the official app without asking for credentials.",
      "nextStep": "Open your banking app and review registered devices there. Never enter a password from an emailed link."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "credentials"
  },
  {
    "id": "campus-storage",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Medium",
    "brand": "XMUM",
    "objective": "Recognise a spoofed sender whose link leads to an off-domain password page.",
    "senderName": "XMUM IT Services",
    "senderEmail": "service@it.xmum.edu.my",
    "subject": "Mailbox quota exceeded — action required",
    "body": [
      { "type": "banner", "variant": "alert", "text": "Mailbox quota exceeded", "subtext": "Your campus mailbox is 98% full" },
      { "type": "paragraph", "text": "Dear Aisha," },
      { "type": "paragraph", "text": "Your student mailbox has reached 98% of its storage allowance. Incoming mail will be returned to senders once the quota is reached." },
      { "type": "detail", "text": "Mailbox: aisha.lee@student.xmum.edu.my · 4.9 GB of 5 GB used" },
      { "type": "button", "text": "Increase my quota", "url": "https://storage.xmum.edu.my.account-review.net/mailbox/quota" },
      { "type": "paragraph", "text": "To raise your quota, confirm your identity by entering your student portal password on the next page." },
      { "type": "footer", "text": "XMUM IT Services\nHelpdesk: IT Counter, Level 1\nWe will never ask for your password by email." }
    ],
    "explanation": "Phishing: a real-looking sender leads to an off-domain page that collects your portal password.",
    "indicators": [
      { "target": "body", "text": "Mailbox quota exceeded", "explanation": "The banner manufactures a deadline, but that is not what makes it dangerous." },
      { "target": "body", "text": "https://storage.xmum.edu.my.account-review.net", "explanation": "The real owner of this address is account-review.net, not xmum.edu.my." },
      { "target": "body", "text": "student portal password", "explanation": "A genuine quota notice never asks for your password." }
    ],
    "context": {
      "source": "Your student portal, opened independently",
      "facts": [
        "Your mailbox shows 1.1 GB used, well below the limit.",
        "IT support does not collect passwords over email or web forms."
      ]
    },
    "reasoning": {
      "evidence": "An off-domain destination paired with a request for your portal password.",
      "contrast": "A real quota notice is informational and links to the campus portal you already use.",
      "nextStep": "Check storage in your student portal. Delete old mail if needed; never enter your password via a link."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "credentials"
  },
  {
    "id": "parcel-fee",
    "institution": "parcel",
    "classification": "phishing",
    "difficulty": "Medium",
    "brand": "Pos Laju",
    "objective": "Recognise a small-fee bait for collecting full payment-card details.",
    "senderName": "Pos Laju · Delivery",
    "senderEmail": "noreply@poslaju-redelivery.com",
    "subject": "Outstanding fee: redelivery of EP123456789MY",
    "body": [
      { "type": "banner", "variant": "warn", "text": "Redelivery fee outstanding", "subtext": "A small fee is required to reschedule delivery" },
      { "type": "paragraph", "text": "Dear customer," },
      { "type": "paragraph", "text": "A delivery attempt was made but no one was available. Your parcel is being held for 48 hours." },
      { "type": "detail", "text": "Tracking EP123456789MY · Fee RM 1.50 · Pay before 9:00 PM" },
      { "type": "button", "text": "Pay RM 1.50", "url": "https://poslaju-redelivery.com/pay/EP123456789MY" },
      { "type": "paragraph", "text": "Enter your card number, expiry and CVV to confirm payment. The parcel is released once the fee is settled." },
      { "type": "footer", "text": "Pos Laju National Courier\nThis fee is collected on behalf of the courier." }
    ],
    "explanation": "Phishing: a tiny fee is the bait for collecting full payment-card details at a lookalike site.",
    "indicators": [
      { "target": "body", "text": "Redelivery fee outstanding", "explanation": "A small amount is meant to feel harmless, not proof of legitimacy." },
      { "target": "body", "text": "https://poslaju-redelivery.com", "explanation": "A lookalike domain that is not the courier's real website." },
      { "target": "body", "text": "card number, expiry and CVV", "explanation": "A courier never needs your CVV to redeliver a parcel." }
    ],
    "context": {
      "source": "The courier's tracking page, opened independently",
      "facts": [
        "The tracking number is not found.",
        "Redelivery is free; the courier does not collect card details by email."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike domain collecting CVV details for a made-up fee.",
      "contrast": "A real courier charges at the counter or at your original checkout, never by emailed card form.",
      "nextStep": "Track the parcel on the courier's own site. Genuine redelivery never asks for your CVV."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "card"
  },
  {
    "id": "shopping-document",
    "institution": "shopping",
    "classification": "phishing",
    "difficulty": "Hard",
    "brand": "Shopee",
    "objective": "Recognise an excessive permission request hiding behind an ordinary document banner.",
    "senderName": "Shopee · Invoices",
    "senderEmail": "receipts@shopee.com.my",
    "subject": "Your tax invoice INV-2291 is ready",
    "body": [
      { "type": "banner", "variant": "info", "text": "Your tax invoice is ready", "subtext": "A document is available for your recent order" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "The invoice for your recent order has been generated and is available to download." },
      { "type": "detail", "text": "Order #2411-DUCK · Invoice INV-2291 · PDF" },
      { "type": "button", "text": "Download invoice", "url": "https://shopee-orders-portal.com/document/INV-2291" },
      { "type": "paragraph", "text": "Open the link and allow the invoice app to view and manage your account. The download starts automatically once access is granted." },
      { "type": "footer", "text": "Shopee · Order documents\nFind your invoices anytime in My Purchases." }
    ],
    "explanation": "Phishing: an innocuous banner hides an excessive permission request at an off-domain address.",
    "indicators": [
      { "target": "body", "text": "Your tax invoice is ready", "explanation": "A calm, ordinary banner. Not every safe-looking email is safe." },
      { "target": "body", "text": "https://shopee-orders-portal.com", "explanation": "This is not Shopee's domain, despite the familiar name." },
      { "target": "body", "text": "view and manage your account", "explanation": "Viewing an invoice never requires permission to manage your account." }
    ],
    "context": {
      "source": "Your shopping app, opened independently",
      "facts": [
        "The invoice is available under My Purchases in the app.",
        "No third-party app needs permission to manage your account."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike destination asking for account-management permission to view a document.",
      "contrast": "A real invoice downloads directly from your order page without extra permissions.",
      "nextStep": "Download the invoice from My Purchases in the app. Deny apps that ask to manage your account."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "permissions"
  },
  {
    "id": "tax-rebate",
    "institution": "tax",
    "classification": "phishing",
    "difficulty": "Hard",
    "brand": "LHDN MyTax",
    "objective": "Recognise a refund lure that collects tax credentials and identity details.",
    "senderName": "LHDN · Refunds",
    "senderEmail": "notice@hasil.gov.my-notice.com",
    "subject": "Unclaimed tax refund RM 1,240.00",
    "body": [
      { "type": "banner", "variant": "success", "text": "You have an unclaimed tax refund", "subtext": "Confirm your details to release the payment" },
      { "type": "paragraph", "text": "Dear taxpayer," },
      { "type": "paragraph", "text": "Our records show an unclaimed refund of RM 1,240.00 for the last assessment year." },
      { "type": "detail", "text": "Refund RM 1,240.00 · Expires in 24 hours" },
      { "type": "button", "text": "Claim my refund", "url": "https://hasil.gov.my-notice.com/rebate/claim" },
      { "type": "paragraph", "text": "Enter your MyTax password and identity card number to verify ownership and release the payment to your bank." },
      { "type": "footer", "text": "Lembaga Hasil Dalam Negeri\nRefunds are paid directly to your registered account." }
    ],
    "explanation": "Phishing: a refund lure collects MyTax credentials and identity details at a lookalike page.",
    "indicators": [
      { "target": "body", "text": "You have an unclaimed tax refund", "explanation": "Money in your favour is a classic attention hook, not a trust signal." },
      { "target": "body", "text": "https://hasil.gov.my-notice.com", "explanation": "The real owner of this address is notice.com, not LHDN." },
      { "target": "body", "text": "MyTax password and identity card number", "explanation": "A tax authority never asks for your password through a link." }
    ],
    "context": {
      "source": "MyTax, opened via your saved bookmark",
      "facts": [
        "No refund is listed on your account.",
        "LHDN pays refunds to your registered bank account without a claim form."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike domain collecting your MyTax password and identity number.",
      "contrast": "A real refund appears in MyTax and is paid to your registered account automatically.",
      "nextStep": "Check MyTax from your bookmark. Genuine refunds never require a password by email."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "credentials"
  },
  {
    "id": "security-reply",
    "institution": "identity",
    "classification": "phishing",
    "difficulty": "Easy",
    "brand": "XMUM Campus ID",
    "objective": "Recognise a recovery notice that asks you to send your password by email.",
    "senderName": "Campus ID Security",
    "senderEmail": "security@id.xmum.edu.my",
    "subject": "Confirm your account recovery",
    "body": [
      { "type": "banner", "variant": "alert", "text": "Account recovery confirmation required", "subtext": "Reply to confirm you made this request" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "We received a request to recover your campus account. To confirm you made this request, we need to verify your identity." },
      { "type": "attachment", "text": "password-recovery-form.htm" },
      { "type": "paragraph", "text": "Reply to this email with your current password and the attached form completed. If we do not hear back, your account will be locked." },
      { "type": "footer", "text": "XMUM Campus ID · Security Team\nReplies are reviewed within one business day." }
    ],
    "explanation": "Phishing: a recovery notice that asks you to send your password by email — something no security team ever does.",
    "indicators": [
      { "target": "body", "text": "Account recovery confirmation required", "explanation": "The banner sounds official, but the request that follows is the tell." },
      { "target": "body", "text": "Reply to this email with your current password", "explanation": "No legitimate service asks you to email your password." },
      { "target": "body", "text": "your account will be locked", "explanation": "A threatened lockout pressures you into replying without thinking." }
    ],
    "context": {
      "source": "Account → Security in your portal, opened independently",
      "facts": [
        "No recovery request is recorded on your account.",
        "The security team never asks for your password by email or form."
      ]
    },
    "reasoning": {
      "evidence": "A request to send your password by email under threat of a lockout.",
      "contrast": "A real recovery notice is informational and asks you to confirm in the portal, never by reply.",
      "nextStep": "Ignore the reply request. Check Account → Security in your portal instead."
    },
    "acceptedEvidence": ["body:0", "body:4"],
    "lesson": "credentials"
  },
  {
    "id": "internship-reservation",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Medium",
    "brand": "XMUM",
    "objective": "Recognise a pay-first trap dressed as a placement confirmation.",
    "senderName": "XMUM Career Services",
    "senderEmail": "careers@xmum-internship.com",
    "subject": "Reserve your internship slot — deposit required",
    "body": [
      { "type": "banner", "variant": "warn", "text": "Reservation requires a refundable deposit", "subtext": "Secure your place before the shortlist closes" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Congratulations — you have been matched with a partner company for your internship placement." },
      { "type": "detail", "text": "Role: Marketing Assistant · Refundable deposit RM 150" },
      { "type": "button", "text": "Reserve my place", "url": "https://xmum-internship.com/reserve/slot" },
      { "type": "paragraph", "text": "Pay the refundable RM 150 deposit to hold your slot. Places are released to other students after 24 hours." },
      { "type": "footer", "text": "XMUM Career Services\nPlacement fees are handled by the partner company." }
    ],
    "explanation": "Phishing: a pay-first trap dressed as a placement confirmation, routed through a lookalike site.",
    "indicators": [
      { "target": "body", "text": "Reservation requires a refundable deposit", "explanation": "The banner reframes a payment as a routine deposit." },
      { "target": "body", "text": "https://xmum-internship.com", "explanation": "Not the university's career portal domain." },
      { "target": "body", "text": "Pay the refundable RM 150 deposit", "explanation": "Legitimate placements never require an advance payment to reserve a slot." }
    ],
    "context": {
      "source": "The career portal, opened independently",
      "facts": [
        "You are not shortlisted for this role.",
        "The university does not charge deposits for internship placement."
      ]
    },
    "reasoning": {
      "evidence": "An advance payment demanded through an off-domain link.",
      "contrast": "Real placement confirmations are free and come through the career portal.",
      "nextStep": "Confirm offers in the career portal. Never pay to receive a job or placement."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "advance-fee"
  },
  {
    "id": "scholarship-document",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Hard",
    "brand": "XMUM",
    "objective": "Recognise a document that asks you to enable macros — a malware trigger.",
    "senderName": "XMUM Scholarships",
    "senderEmail": "awards@xmum.edu.my",
    "subject": "Complete your scholarship application form",
    "body": [
      { "type": "banner", "variant": "info", "text": "Scholarship application form", "subtext": "A form is attached for your records" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Your scholarship application is incomplete. The attached form contains the sections that still need your information." },
      { "type": "attachment", "text": "scholarship-form.docx" },
      { "type": "paragraph", "text": "Enable macros in the document so the fields calculate automatically, then open and complete the form." },
      { "type": "footer", "text": "XMUM Scholarships Office\nSubmit completed forms through the scholarship portal." }
    ],
    "explanation": "Phishing: a spoofed sender delivers a document that asks you to enable macros — a classic malware trigger.",
    "indicators": [
      { "target": "body", "text": "Scholarship application form", "explanation": "A routine banner; the risk is in the attachment instruction." },
      { "target": "body", "text": "Enable macros", "explanation": "Macros in an unexpected document can run harmful code on your device." },
      { "target": "body", "text": "scholarship-form.docx", "explanation": "The attachment comes from a sender you did not expect, outside the portal." }
    ],
    "context": {
      "source": "The scholarship portal, opened independently",
      "facts": [
        "Your application is complete and under review.",
        "Forms are submitted through the portal, never by emailed document."
      ]
    },
    "reasoning": {
      "evidence": "A document asking you to enable macros, sent outside the portal.",
      "contrast": "Real forms are completed inside the portal and never require macros.",
      "nextStep": "Open the portal to check your application. Do not enable macros in unexpected files."
    },
    "acceptedEvidence": ["body:0", "body:4"],
    "lesson": "malware"
  },
  {
    "id": "mascot-qr",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Easy",
    "brand": "XMUM",
    "objective": "Recognise a QR-code payment for a made-up entry deposit.",
    "senderName": "XMUM Student Events",
    "senderEmail": "events@xmum.edu.my",
    "subject": "Your Mascot Vote ticket",
    "body": [
      { "type": "banner", "variant": "info", "text": "Your Mascot Vote ticket", "subtext": "Scan the attached code to enter" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Thanks for registering for the Mascot Vote. Your entry ticket is attached as a QR code." },
      { "type": "attachment", "text": "mascot-ticket.png" },
      { "type": "paragraph", "text": "Scan the code and pay the RM 5 entry deposit with your card to activate your ticket. The deposit is refunded after the event." },
      { "type": "footer", "text": "XMUM Student Events\nSee you at the event!" }
    ],
    "explanation": "Phishing: a spoofed event email collects card details through a QR code for a small 'deposit'.",
    "indicators": [
      { "target": "body", "text": "Your Mascot Vote ticket", "explanation": "An ordinary-looking banner; the QR payment that follows is the risk." },
      { "target": "body", "text": "pay the RM 5 entry deposit with your card", "explanation": "Scanning a QR code from email and paying by card is a common scam pattern." },
      { "target": "body", "text": "mascot-ticket.png", "explanation": "An unsolicited QR code attachment is not how the event is run." }
    ],
    "context": {
      "source": "The event page in your student portal, opened independently",
      "facts": [
        "Entry to the Mascot Vote is free; no deposit exists.",
        "The event does not send QR payment codes by email."
      ]
    },
    "reasoning": {
      "evidence": "A QR code from email asking for card payment to 'activate' a ticket.",
      "contrast": "Real event entry is free and confirmed in the portal.",
      "nextStep": "Check the event page in the portal. Don't scan payment codes from email."
    },
    "acceptedEvidence": ["body:0", "body:4"],
    "lesson": "card"
  },
  {
    "id": "monday-refund",
    "institution": "shopping",
    "classification": "phishing",
    "difficulty": "Easy",
    "brand": "Shopee",
    "objective": "Recognise a refund that asks you to install remote-access software.",
    "senderName": "Shopee · Refunds",
    "senderEmail": "support@shopee-refunds.net",
    "subject": "Refund approved: RM 189.00",
    "body": [
      { "type": "banner", "variant": "success", "text": "Refund approved", "subtext": "A refund has been issued to your account" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Good news — your refund of RM 189.00 has been approved after a review of your request." },
      { "type": "detail", "text": "Refund RM 189.00 · Processing in 3–5 working days" },
      { "type": "button", "text": "Track my refund", "url": "https://shopee-refunds.net/remote/install" },
      { "type": "paragraph", "text": "To speed up the refund, install the support app and grant our agent control of your device so they can verify your account." },
      { "type": "footer", "text": "Shopee · Refund Support\nRefunds are processed automatically." }
    ],
    "explanation": "Phishing: a refund is the bait for installing a remote-access app at a lookalike address.",
    "indicators": [
      { "target": "body", "text": "Refund approved", "explanation": "Good news lowers your guard; the next request is what matters." },
      { "target": "body", "text": "https://shopee-refunds.net", "explanation": "Not Shopee's real domain." },
      { "target": "body", "text": "grant our agent control of your device", "explanation": "No refund requires handing control of your device to an agent." }
    ],
    "context": {
      "source": "Your shopping app, opened independently",
      "facts": [
        "No refund is pending on your account.",
        "Refunds are automatic; support never takes control of your device."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike destination asking you to install software and grant device control.",
      "contrast": "Real refunds process automatically and need no remote-access tool.",
      "nextStep": "Check refunds in the app. Never install remote-access software for a refund."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "remote-access"
  },
  {
    "id": "mascot-vote",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Easy",
    "brand": "XMUM",
    "objective": "Recognise a lookalike vote page that asks for camera and contacts access.",
    "senderName": "XMUM Mascot Vote",
    "senderEmail": "events@xmum-events-vote.com",
    "subject": "Have your say in the Mascot Vote",
    "body": [
      { "type": "banner", "variant": "info", "text": "Have your say in the mascot vote", "subtext": "Voting is open for this year's mascot" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Voting for this year's campus mascot is now open. Make your choice before Friday." },
      { "type": "detail", "text": "Deadline: Friday · One vote per student" },
      { "type": "button", "text": "Cast my vote", "url": "https://xmum-events-vote.com/mascot-vote" },
      { "type": "paragraph", "text": "Sign in and allow the voting page to access your contacts and camera so your ballot can be verified." },
      { "type": "footer", "text": "XMUM Student Events\nYour vote helps choose this year's mascot." }
    ],
    "explanation": "Phishing: an innocuous banner leads to a lookalike page that asks for camera and contacts access no ballot needs.",
    "indicators": [
      { "target": "body", "text": "Have your say in the mascot vote", "explanation": "A completely ordinary request. The overreach sits one step later." },
      { "target": "body", "text": "https://xmum-events-vote.com", "explanation": "A lookalike domain, not the university's event site." },
      { "target": "body", "text": "access your contacts and camera", "explanation": "Voting never requires camera or contacts access." }
    ],
    "context": {
      "source": "The event page in your portal, opened independently",
      "facts": [
        "Voting is done in the portal with your student login.",
        "No camera or contacts access is needed to vote."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike page demanding camera and contacts access to cast a vote.",
      "contrast": "Real voting is a one-click choice in the portal with no extra permissions.",
      "nextStep": "Vote from the portal. Refuse apps that ask for camera or contacts without a reason."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "permissions"
  },
  {
    "id": "noodle-prize",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Medium",
    "brand": "XMUM",
    "objective": "Recognise a prize bait for your portal password.",
    "senderName": "XMUM Campus Rewards",
    "senderEmail": "promo@xmum.edu.my",
    "subject": "You've won a free noodle voucher",
    "body": [
      { "type": "banner", "variant": "prize", "text": "Free noodle voucher — you've won", "subtext": "A complimentary meal, on us" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "You've been selected for a free noodle voucher at the campus canteen. Vouchers are limited, so claim yours soon." },
      { "type": "detail", "text": "Voucher: 1 free noodle bowl · Valid 7 days" },
      { "type": "button", "text": "Claim my voucher", "url": "https://xmum-promo-rewards.net/claim/NOODLE" },
      { "type": "paragraph", "text": "Sign in with your student portal password to confirm your identity and add the voucher to your account." },
      { "type": "footer", "text": "XMUM Campus Rewards\nEnjoy your meal!" }
    ],
    "explanation": "Phishing: a friendly prize is the bait for your portal password at a lookalike site.",
    "indicators": [
      { "target": "body", "text": "Free noodle voucher — you've won", "explanation": "A cheerful prize banner. Rewards are not proof of safety." },
      { "target": "body", "text": "https://xmum-promo-rewards.net", "explanation": "Not the university's domain." },
      { "target": "body", "text": "student portal password", "explanation": "Claiming a voucher never requires your portal password." }
    ],
    "context": {
      "source": "The canteen's promotion page, opened independently",
      "facts": [
        "This promotion does not exist.",
        "Vouchers are collected at the counter, not by entering your password."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike page asking for your portal password to claim a prize.",
      "contrast": "Real promotions are claimed at the counter or in the portal without a password.",
      "nextStep": "Ask the canteen directly. Never enter your password to claim a reward."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "credentials"
  },
  {
    "id": "library-payment",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Medium",
    "brand": "XMUM",
    "objective": "Recognise a spoofed library sender collecting card details at a lookalike page.",
    "senderName": "XMUM Library",
    "senderEmail": "circulation@library.xmum.edu.my",
    "subject": "Outstanding fine: item F-7741",
    "body": [
      { "type": "banner", "variant": "warn", "text": "Outstanding library fine", "subtext": "A fine is attached to your library account" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "A returned item has accrued an overdue fine on your library account. Borrowing is paused until it is settled." },
      { "type": "detail", "text": "Item F-7741 · Fine RM 8.00 · Due now" },
      { "type": "button", "text": "Pay fine", "url": "https://library-fines-xmum.com/pay/F-7741" },
      { "type": "paragraph", "text": "Enter your card number, expiry and CVV to settle the fine and resume borrowing." },
      { "type": "footer", "text": "XMUM Library · Circulation\nFines are also payable at the circulation counter." }
    ],
    "explanation": "Phishing: a spoofed library sender collects card details at a lookalike payment page.",
    "indicators": [
      { "target": "body", "text": "Outstanding library fine", "explanation": "A realistic banner; the payment method is the giveaway." },
      { "target": "body", "text": "https://library-fines-xmum.com", "explanation": "Not the university's library domain." },
      { "target": "body", "text": "card number, expiry and CVV", "explanation": "Campus fines are never collected by emailed card form." }
    ],
    "context": {
      "source": "The library portal, opened independently",
      "facts": [
        "No fine is recorded on your account.",
        "Fines are paid at the counter or the portal, not by emailed card details."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike page collecting CVV details for a made-up fine.",
      "contrast": "Real fines appear in the library portal and are paid at the counter.",
      "nextStep": "Check fines in the library portal. Pay at the counter if one exists."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "card"
  },
  {
    "id": "bank-beneficiary",
    "institution": "bank",
    "classification": "phishing",
    "difficulty": "Medium",
    "brand": "Maybank2u",
    "objective": "Recognise a 'safe account' transfer request at a lookalike page.",
    "senderName": "Maybank2u · Transfers",
    "senderEmail": "transfers@maybank2u.com.my",
    "subject": "Update your beneficiary details",
    "body": [
      { "type": "banner", "variant": "alert", "text": "Update your beneficiary details", "subtext": "Action is needed to keep your transfers working" },
      { "type": "paragraph", "text": "Dear Aisha," },
      { "type": "paragraph", "text": "A routine check flagged your beneficiary list as incomplete. Transfers will be paused until your details are confirmed." },
      { "type": "detail", "text": "Account ending 4012 · Review required" },
      { "type": "button", "text": "Update beneficiary", "url": "https://maybank2u-secure-transfer.com/beneficiary/update" },
      { "type": "paragraph", "text": "Add the secure holding account below and transfer your balance there while we verify your details." },
      { "type": "footer", "text": "Maybank2u · Transfers\nYour bank will never ask you to move money to a 'safe' account." }
    ],
    "explanation": "Phishing: a spoofed transfer notice funnels you into a 'safe account' transfer at a lookalike page.",
    "indicators": [
      { "target": "body", "text": "Update your beneficiary details", "explanation": "The banner sounds routine, but the action it leads to is not." },
      { "target": "body", "text": "https://maybank2u-secure-transfer.com", "explanation": "A lookalike domain, not the bank's real address." },
      { "target": "body", "text": "transfer your balance", "explanation": "A genuine bank never asks you to move money to protect it." }
    ],
    "context": {
      "source": "Your banking app, opened independently",
      "facts": [
        "No beneficiary issue is flagged on your account.",
        "Banks never ask customers to transfer funds to a safe account."
      ]
    },
    "reasoning": {
      "evidence": "An instruction to move money to a holding account via an off-domain link.",
      "contrast": "A real bank contact never requests a balance transfer to a safe account.",
      "nextStep": "Check your account in the app. Never transfer money on request from a stranger."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "safe-account"
  },
  {
    "id": "cloud-share",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Hard",
    "brand": "XMUM",
    "objective": "Recognise a shared-file lure that asks for full drive access.",
    "senderName": "XMUM Cloud Drive",
    "senderEmail": "drive@xmum.edu.my",
    "subject": "A document was shared with you",
    "body": [
      { "type": "banner", "variant": "info", "text": "A document was shared with you", "subtext": "Group-Project-Notes.pdf" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "A classmate shared a document with you from the campus cloud drive." },
      { "type": "detail", "text": "Group-Project-Notes.pdf · Shared 10 minutes ago" },
      { "type": "button", "text": "View document", "url": "https://xmum-files-share.net/view/9f3c" },
      { "type": "paragraph", "text": "Open the link and grant the viewer full access to your drive so the document can sync to your folders." },
      { "type": "footer", "text": "XMUM Cloud Drive\nYou can open shared files from the drive web app." }
    ],
    "explanation": "Phishing: a shared-file lure asks for full drive access at an off-domain viewer.",
    "indicators": [
      { "target": "body", "text": "A document was shared with you", "explanation": "A mundane banner; the access request is the red flag." },
      { "target": "body", "text": "https://xmum-files-share.net", "explanation": "Not the university's cloud domain." },
      { "target": "body", "text": "full access to your drive", "explanation": "Viewing a shared file never requires full access to your drive." }
    ],
    "context": {
      "source": "Your cloud drive, opened independently",
      "facts": [
        "No file was shared with you today.",
        "Shared files open with view-only permission by default."
      ]
    },
    "reasoning": {
      "evidence": "An off-domain link asking for full drive access to open a file.",
      "contrast": "Real shares open in the drive app with view-only access.",
      "nextStep": "Open the drive app and check Shared with me. Grant the least access needed."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "permissions"
  },
  {
    "id": "payroll-update",
    "institution": "university",
    "classification": "phishing",
    "difficulty": "Hard",
    "brand": "XMUM",
    "objective": "Recognise a payroll deadline used to collect two passwords.",
    "senderName": "XMUM Payroll",
    "senderEmail": "payroll@xmum.edu.my",
    "subject": "Update required before payroll run",
    "body": [
      { "type": "banner", "variant": "warn", "text": "Update required before payroll run", "subtext": "Confirm your details to avoid a payment delay" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Our payroll run is scheduled for Friday. Your record needs a small update before your stipend can be released." },
      { "type": "detail", "text": "Payroll reference PR-2024-11 · Update required" },
      { "type": "button", "text": "Update my details", "url": "https://xmum-hr-portal.net/payroll/update" },
      { "type": "paragraph", "text": "Sign in with your student portal password and banking password to confirm both accounts match." },
      { "type": "footer", "text": "XMUM Payroll\nPayroll details are confirmed in the staff portal." }
    ],
    "explanation": "Phishing: a payroll deadline is the hook for collecting two passwords at a lookalike site.",
    "indicators": [
      { "target": "body", "text": "Update required before payroll run", "explanation": "A deadline banner creates pressure, which is not a sign of authenticity." },
      { "target": "body", "text": "https://xmum-hr-portal.net", "explanation": "Not the university's staff portal domain." },
      { "target": "body", "text": "student portal password and banking password", "explanation": "No payroll process asks for two passwords by email." }
    ],
    "context": {
      "source": "The staff portal, opened independently",
      "facts": [
        "Your payroll details are complete and verified.",
        "Payroll never requests passwords by email."
      ]
    },
    "reasoning": {
      "evidence": "A lookalike portal collecting two passwords under a payroll deadline.",
      "contrast": "Real payroll confirmations happen in the staff portal without passwords by email.",
      "nextStep": "Check payroll in the staff portal. Never enter passwords from an emailed link."
    },
    "acceptedEvidence": ["body:0", "destination:4", "body:5"],
    "lesson": "credentials"
  },
  {
    "id": "study-room-booking",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Easy",
    "brand": "XMUM",
    "objective": "Recognise a routine confirmation that asks for nothing.",
    "senderName": "XMUM Room Booking",
    "senderEmail": "noreply@xmum.edu.my",
    "subject": "Room booking confirmed: SR-204",
    "body": [
      { "type": "banner", "variant": "success", "text": "Room booking confirmed", "subtext": "Your booking is active" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Your study room booking has been confirmed. Details are below." },
      { "type": "detail", "text": "Room SR-204 · Thursday 3–5 PM · Library Level 2" },
      { "type": "button", "text": "View my booking", "url": "https://booking.xmum.edu.my/rooms/SR-204" },
      { "type": "paragraph", "text": "No action is required. You can cancel or reschedule from the booking page." },
      { "type": "footer", "text": "XMUM Room Booking\nManage bookings in the student portal." }
    ],
    "explanation": "Legitimate: an informational confirmation on the university's own domain, asking nothing sensitive.",
    "indicators": [
      { "target": "body", "text": "Room booking confirmed", "explanation": "A calm confirmation banner with no pressure or payment." },
      { "target": "body", "text": "https://booking.xmum.edu.my", "explanation": "The destination sits on the university's real domain." },
      { "target": "body", "text": "No action is required", "explanation": "Nothing is being demanded, and no sensitive details are requested." }
    ],
    "context": {
      "source": "Your student portal, opened independently",
      "facts": [
        "The booking appears under My Bookings.",
        "Booking confirmations are automated and free."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and a request for nothing at all.",
      "contrast": "A phishing lookalike would press for payment or credentials.",
      "nextStep": "Manage the booking from the portal if your plans change."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "bank-notification",
    "institution": "bank",
    "classification": "legitimate",
    "difficulty": "Medium",
    "brand": "Maybank2u",
    "objective": "Recognise a genuine transaction alert that points to your own app.",
    "senderName": "Maybank2u · Alerts",
    "senderEmail": "alerts@maybank2u.com.my",
    "subject": "Transaction alert: RM 24.90",
    "body": [
      { "type": "banner", "variant": "info", "text": "Transaction alert", "subtext": "A debit was made on your account" },
      { "type": "paragraph", "text": "Dear Aisha," },
      { "type": "paragraph", "text": "A transaction of RM 24.90 was made on your account ending 4012." },
      { "type": "detail", "text": "RM 24.90 · Campus Mart · Today 12:04" },
      { "type": "button", "text": "View activity", "url": "https://www.maybank2u.com.my/activity/" },
      { "type": "paragraph", "text": "If this was not you, report it through the app. Do not reply to this email." },
      { "type": "footer", "text": "Maybank2u · Alerts\nThis is an automated message." }
    ],
    "explanation": "Legitimate: a routine alert pointing to the bank's real domain, advising the app rather than asking for details.",
    "indicators": [
      { "target": "body", "text": "Transaction alert", "explanation": "A factual banner with no urgent demand for information." },
      { "target": "body", "text": "https://www.maybank2u.com.my", "explanation": "The destination is the bank's own domain." },
      { "target": "body", "text": "report it through the app", "explanation": "It points you to your own app instead of asking for credentials." }
    ],
    "context": {
      "source": "Your banking app, opened independently",
      "facts": [
        "The RM 24.90 transaction appears in your activity.",
        "The bank's alerts direct you to the app, never to a credential form."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and guidance to use your own app.",
      "contrast": "A phishing email would link elsewhere and ask for a password or code.",
      "nextStep": "Check the transaction in the app. Report it there if it is unfamiliar."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "parcel-update",
    "institution": "parcel",
    "classification": "legitimate",
    "difficulty": "Medium",
    "brand": "Pos Laju",
    "objective": "Recognise a real delivery update that asks for no payment.",
    "senderName": "Pos Laju · Tracking",
    "senderEmail": "tracking@poslaju.com.my",
    "subject": "Your parcel is out for delivery",
    "body": [
      { "type": "banner", "variant": "info", "text": "Your parcel is out for delivery", "subtext": "EP123456789MY" },
      { "type": "paragraph", "text": "Dear customer," },
      { "type": "paragraph", "text": "Your parcel is out for delivery today. You can follow its progress with the tracking link." },
      { "type": "detail", "text": "EP123456789MY · Out for delivery · Estimated by 6 PM" },
      { "type": "button", "text": "Track parcel", "url": "https://www.poslaju.com.my/track/EP123456789MY" },
      { "type": "paragraph", "text": "No payment is required. Delivery is free for this order." },
      { "type": "footer", "text": "Pos Laju National Courier\nTrack anytime on the courier website." }
    ],
    "explanation": "Legitimate: a delivery update on the courier's real domain that asks for no payment.",
    "indicators": [
      { "target": "body", "text": "Your parcel is out for delivery", "explanation": "An ordinary status banner with no fee or threat." },
      { "target": "body", "text": "https://www.poslaju.com.my", "explanation": "The destination is the courier's real domain." },
      { "target": "body", "text": "No payment is required", "explanation": "It explicitly asks for no money, unlike a redelivery-fee scam." }
    ],
    "context": {
      "source": "The courier's tracking page, opened independently",
      "facts": [
        "The tracking number matches your order.",
        "Delivery is free; the courier does not charge by email."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain tracking link and an explicit no-payment note.",
      "contrast": "A scam redelivery notice invents a small fee and asks for card details.",
      "nextStep": "Track the parcel from the courier site if you are away."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "desk-duck-receipt",
    "institution": "shopping",
    "classification": "legitimate",
    "difficulty": "Easy",
    "brand": "Shopee",
    "objective": "Recognise a paid-order receipt that requests no action.",
    "senderName": "Shopee · Receipts",
    "senderEmail": "receipts@shopee.com.my",
    "subject": "Receipt for order 2411-DUCK",
    "body": [
      { "type": "banner", "variant": "success", "text": "Payment received — thank you", "subtext": "Your order is paid" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Thanks for your order. Your payment went through and the seller is preparing your parcel." },
      { "type": "detail", "text": "Order 2411-DUCK · Desk Duck · RM 18.90 · Paid" },
      { "type": "button", "text": "View order", "url": "https://shopee.com.my/orders/2411-DUCK" },
      { "type": "paragraph", "text": "No further action is needed. Your receipt is saved under My Purchases." },
      { "type": "footer", "text": "Shopee · Receipts\nKeep this for your records." }
    ],
    "explanation": "Legitimate: a paid-order receipt on the marketplace's real domain asking for nothing.",
    "indicators": [
      { "target": "body", "text": "Payment received — thank you", "explanation": "A plain confirmation banner." },
      { "target": "body", "text": "https://shopee.com.my", "explanation": "The destination is the marketplace's real domain." },
      { "target": "body", "text": "No further action is needed", "explanation": "Nothing is requested and no details are collected." }
    ],
    "context": {
      "source": "Your shopping app, opened independently",
      "facts": [
        "Order 2411-DUCK is paid and processing.",
        "Receipts are always available under My Purchases."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain order link and a clear no-action statement.",
      "contrast": "A phishing 'receipt' would link elsewhere and ask you to sign in or pay.",
      "nextStep": "Track the order from the app when you like."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "event-registration",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "brand": "XMUM",
    "objective": "Recognise a free event sign-up on the university's own site.",
    "senderName": "XMUM Student Events",
    "senderEmail": "events@xmum.edu.my",
    "subject": "Registration open: Mascot Vote finals",
    "body": [
      { "type": "banner", "variant": "info", "text": "Registration open: campus event", "subtext": "Free entry, limited seats" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Registration for the Mascot Vote finals is now open. Seats are limited, so sign up soon." },
      { "type": "detail", "text": "Date: Friday · Hall A · Free entry" },
      { "type": "button", "text": "Register", "url": "https://events.xmum.edu.my/register/MASCOT-24" },
      { "type": "paragraph", "text": "Entry is free and optional. No payment or deposit is required to attend." },
      { "type": "footer", "text": "XMUM Student Events\nRegistration closes Wednesday." }
    ],
    "explanation": "Legitimate: a free event sign-up on the university's own domain with no payment or permissions.",
    "indicators": [
      { "target": "body", "text": "Registration open: campus event", "explanation": "An informational banner with no pressure or cost." },
      { "target": "body", "text": "https://events.xmum.edu.my", "explanation": "The destination is the university's events domain." },
      { "target": "body", "text": "No payment or deposit is required", "explanation": "It explicitly rules out the classic pay-first trap." }
    ],
    "context": {
      "source": "The event page in your portal, opened independently",
      "facts": [
        "The event is listed with free registration.",
        "Campus events use the university's events site, not external pages."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain registration link and an explicit free-entry note.",
      "contrast": "A scam event email invents a deposit or routes you to an external payment page.",
      "nextStep": "Register from the portal if you plan to attend."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "security-change",
    "institution": "identity",
    "classification": "legitimate",
    "difficulty": "Hard",
    "brand": "XMUM Campus ID",
    "objective": "Recognise a legitimate security alert that directs you to the portal, not the email.",
    "senderName": "Campus ID Security",
    "senderEmail": "security@id.xmum.edu.my",
    "subject": "Sign-in from a new device",
    "body": [
      { "type": "banner", "variant": "alert", "text": "Sign-in from a new device", "subtext": "Review this activity on your account" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "A sign-in to your campus account was detected from a device we have not seen before." },
      { "type": "detail", "text": "Device: Windows / Chrome · Kuala Lumpur · Today 09:12" },
      { "type": "button", "text": "Review activity", "url": "https://id.xmum.edu.my/account/security" },
      { "type": "paragraph", "text": "If this was you, no action is needed. If not, change your password in the portal — never by replying to an email." },
      { "type": "footer", "text": "XMUM Campus ID · Security Team\nSign-in alerts are sent automatically." }
    ],
    "explanation": "Legitimate: an alarming security banner, but it links to the real portal and asks you to act there, not in the email.",
    "indicators": [
      { "target": "body", "text": "Sign-in from a new device", "explanation": "Alarming banners are not automatically phishing — the destination and request decide." },
      { "target": "body", "text": "https://id.xmum.edu.my", "explanation": "The destination is the real identity portal." },
      { "target": "body", "text": "change your password in the portal", "explanation": "It tells you to act in the portal, never to reply or enter a password by email." }
    ],
    "context": {
      "source": "Account → Security in your portal, opened independently",
      "facts": [
        "The sign-in from Kuala Lumpur appears in your activity.",
        "The portal records the event and lets you review it yourself."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and guidance to act inside the portal.",
      "contrast": "A phishing alert would link elsewhere or ask you to reply with a password.",
      "nextStep": "Review the activity in the portal and change your password there if needed."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "internship-shortlist",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Medium",
    "brand": "XMUM",
    "objective": "Recognise a free shortlist confirmation.",
    "senderName": "XMUM Career Services",
    "senderEmail": "careers@xmum.edu.my",
    "subject": "You've been shortlisted — confirm your slot",
    "body": [
      { "type": "banner", "variant": "success", "text": "You've been shortlisted", "subtext": "Confirm your internship slot" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "You have been shortlisted for an internship. Confirm your slot before Friday to accept the offer." },
      { "type": "detail", "text": "Role: Marketing Assistant · Confirm by Friday" },
      { "type": "button", "text": "Confirm my slot", "url": "https://career.xmum.edu.my/confirm/INT-88" },
      { "type": "paragraph", "text": "There is no fee to accept the offer. Everything is handled through the career portal." },
      { "type": "footer", "text": "XMUM Career Services\nOffers and confirmations live in the career portal." }
    ],
    "explanation": "Legitimate: a free shortlist confirmation on the career portal's real domain.",
    "indicators": [
      { "target": "body", "text": "You've been shortlisted", "explanation": "Good news, with no payment attached." },
      { "target": "body", "text": "https://career.xmum.edu.my", "explanation": "The destination is the career portal's real domain." },
      { "target": "body", "text": "There is no fee to accept", "explanation": "It explicitly rules out an advance-fee trap." }
    ],
    "context": {
      "source": "The career portal, opened independently",
      "facts": [
        "You are shortlisted for this role.",
        "Placement confirmations are free and handled in the portal."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain confirmation link with an explicit no-fee note.",
      "contrast": "A pay-first scam invents a deposit to reserve the same slot.",
      "nextStep": "Confirm the slot from the career portal if you want it."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "scholarship-review",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "brand": "XMUM",
    "objective": "Recognise a portal-based document request that never asks for passwords.",
    "senderName": "XMUM Scholarships",
    "senderEmail": "awards@xmum.edu.my",
    "subject": "Additional documents requested for your application",
    "body": [
      { "type": "banner", "variant": "info", "text": "Additional documents requested", "subtext": "Upload through the portal" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Your scholarship application is under review. Please upload one additional document to complete it." },
      { "type": "detail", "text": "Document: latest result slip · Due Friday" },
      { "type": "button", "text": "Upload documents", "url": "https://scholarships.xmum.edu.my/upload/" },
      { "type": "paragraph", "text": "Upload the document through the portal. We will never ask for your password by email or form." },
      { "type": "footer", "text": "XMUM Scholarships Office\nApplications are managed in the portal." }
    ],
    "explanation": "Legitimate: a document request that keeps you inside the real portal and warns against sharing passwords.",
    "indicators": [
      { "target": "body", "text": "Additional documents requested", "explanation": "A routine request with no payment or credentials." },
      { "target": "body", "text": "https://scholarships.xmum.edu.my", "explanation": "The destination is the scholarship portal's real domain." },
      { "target": "body", "text": "never ask for your password", "explanation": "It actively warns against the very thing phishing asks for." }
    ],
    "context": {
      "source": "The scholarship portal, opened independently",
      "facts": [
        "Your application is under review and one document is pending.",
        "Documents are uploaded in the portal, never emailed."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain upload link and an explicit no-password warning.",
      "contrast": "A phishing 'document' email attaches a macro file or links elsewhere.",
      "nextStep": "Upload the document from the portal by Friday."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "wifi-maintenance",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Easy",
    "brand": "XMUM",
    "objective": "Recognise an informational outage notice.",
    "senderName": "XMUM IT Services",
    "senderEmail": "it@xmum.edu.my",
    "subject": "Planned Wi-Fi maintenance — Sunday 2–4 AM",
    "body": [
      { "type": "banner", "variant": "neutral", "text": "Planned Wi-Fi maintenance", "subtext": "Scheduled downtime on Sunday" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Campus Wi-Fi will be unavailable on Sunday between 2:00 and 4:00 AM for planned maintenance." },
      { "type": "detail", "text": "Sunday · 2:00–4:00 AM · Campus-wide" },
      { "type": "button", "text": "View status page", "url": "https://itstatus.xmum.edu.my/outage/" },
      { "type": "paragraph", "text": "No action is needed from you. Service resumes automatically." },
      { "type": "footer", "text": "XMUM IT Services\nStatus updates are posted on the IT status page." }
    ],
    "explanation": "Legitimate: an informational outage notice on the IT status domain.",
    "indicators": [
      { "target": "body", "text": "Planned Wi-Fi maintenance", "explanation": "A plain notice with no urgency or request." },
      { "target": "body", "text": "https://itstatus.xmum.edu.my", "explanation": "The destination is the IT status page's real domain." },
      { "target": "body", "text": "No action is needed", "explanation": "Nothing is asked of you at all." }
    ],
    "context": {
      "source": "The IT status page, opened independently",
      "facts": [
        "Sunday's maintenance window is listed.",
        "Outage notices are informational and require no action."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain status link and an explicit no-action note.",
      "contrast": "A scam outage email would press you to sign in or fix something.",
      "nextStep": "Check the status page on Sunday if your connection drops."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "noodle-pickup",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Easy",
    "brand": "XMUM",
    "objective": "Recognise a counter-payment pickup notice.",
    "senderName": "XMUM Dining",
    "senderEmail": "dining@xmum.edu.my",
    "subject": "Your noodle order is ready for pickup",
    "body": [
      { "type": "banner", "variant": "success", "text": "Your order is ready for pickup", "subtext": "Order #88" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Your noodle order is ready. Collect it at the canteen counter before 2 PM." },
      { "type": "detail", "text": "Order #88 · Noodle bowl · Counter 2" },
      { "type": "button", "text": "Confirm pickup", "url": "https://canteen.xmum.edu.my/pickup/88" },
      { "type": "paragraph", "text": "Pay at the counter when you collect it. No online payment is needed." },
      { "type": "footer", "text": "XMUM Dining\nShow this order number at the counter." }
    ],
    "explanation": "Legitimate: a pickup notice that asks you to pay at the counter, never online.",
    "indicators": [
      { "target": "body", "text": "Your order is ready for pickup", "explanation": "A friendly confirmation banner." },
      { "target": "body", "text": "https://canteen.xmum.edu.my", "explanation": "The destination is the campus dining site's real domain." },
      { "target": "body", "text": "Pay at the counter", "explanation": "Payment happens in person, not through the email." }
    ],
    "context": {
      "source": "The canteen's order page, opened independently",
      "facts": [
        "Order #88 is ready for pickup.",
        "Counter pickup orders are paid in person."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and payment at the counter rather than by email.",
      "contrast": "A phishing 'prize' email asks you to pay or sign in online.",
      "nextStep": "Collect your order and pay at the counter."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "library-fine",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Medium",
    "brand": "XMUM",
    "objective": "Recognise a real fine notice that never collects card details by email.",
    "senderName": "XMUM Library",
    "senderEmail": "circulation@xmum.edu.my",
    "subject": "Overdue item reminder: F-7741",
    "body": [
      { "type": "banner", "variant": "warn", "text": "Overdue item reminder", "subtext": "A borrowed item is past its due date" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "A borrowed item is overdue. Return it to clear your account. A small fine may apply until it is returned." },
      { "type": "detail", "text": "Item F-7741 · Due last Friday · Library Level 1" },
      { "type": "button", "text": "View my account", "url": "https://library.xmum.edu.my/fines/F-7741" },
      { "type": "paragraph", "text": "You can pay any fine at the counter or through the library portal. We never collect card details by email." },
      { "type": "footer", "text": "XMUM Library · Circulation\nReturn items at the counter or book drop." }
    ],
    "explanation": "Legitimate: a warning banner, but it links to the real library portal and never asks for card details by email.",
    "indicators": [
      { "target": "body", "text": "Overdue item reminder", "explanation": "A caution banner is not automatically phishing." },
      { "target": "body", "text": "https://library.xmum.edu.my", "explanation": "The destination is the library's real domain." },
      { "target": "body", "text": "never collect card details by email", "explanation": "It explicitly disavows the emailed card form that scammers use." }
    ],
    "context": {
      "source": "The library portal, opened independently",
      "facts": [
        "Item F-7741 is listed as overdue on your account.",
        "Fines are payable at the counter or in the portal."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and an explicit no-card-details-by-email note.",
      "contrast": "A phishing fine email collects your CVV at a lookalike page.",
      "nextStep": "Return the item and pay at the counter if a fine applies."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "bank-payee",
    "institution": "bank",
    "classification": "legitimate",
    "difficulty": "Medium",
    "brand": "Maybank2u",
    "objective": "Recognise a genuine payee alert that directs you to the app.",
    "senderName": "Maybank2u · Alerts",
    "senderEmail": "alerts@maybank2u.com.my",
    "subject": "A new payee was added to your account",
    "body": [
      { "type": "banner", "variant": "info", "text": "New payee added", "subtext": "Review the change on your account" },
      { "type": "paragraph", "text": "Dear Aisha," },
      { "type": "paragraph", "text": "A new payee was added to your account. If you made this change, no action is needed." },
      { "type": "detail", "text": "Payee: Lee Wei Ming · Added today 15:20" },
      { "type": "button", "text": "Review payees", "url": "https://www.maybank2u.com.my/payees/" },
      { "type": "paragraph", "text": "If you did not add this payee, report it through the app immediately. Never reply with your details." },
      { "type": "footer", "text": "Maybank2u · Alerts\nThis is an automated message." }
    ],
    "explanation": "Legitimate: a change alert on the bank's real domain that directs you to the app.",
    "indicators": [
      { "target": "body", "text": "New payee added", "explanation": "A factual banner, no panic." },
      { "target": "body", "text": "https://www.maybank2u.com.my", "explanation": "The destination is the bank's own domain." },
      { "target": "body", "text": "report it through the app", "explanation": "It points you to your own app rather than asking for information." }
    ],
    "context": {
      "source": "Your banking app, opened independently",
      "facts": [
        "The new payee appears in your payee list.",
        "The bank alerts you to changes and directs you to the app."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and direction to use your own app.",
      "contrast": "A phishing email would link elsewhere and demand a password or a transfer.",
      "nextStep": "Review payees in the app and report the change there if it was not you."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "cloud-share-record",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "brand": "XMUM",
    "objective": "Recognise a view-only share on the drive's real domain.",
    "senderName": "XMUM Cloud Drive",
    "senderEmail": "drive@xmum.edu.my",
    "subject": "A shared record is available to view",
    "body": [
      { "type": "banner", "variant": "info", "text": "Shared record available", "subtext": "Attendance-Record.pdf" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "A record was shared with you from the campus cloud drive. You can view it with your campus account." },
      { "type": "detail", "text": "Attendance-Record.pdf · View-only · Shared today" },
      { "type": "button", "text": "Open record", "url": "https://drive.xmum.edu.my/record/9f3c" },
      { "type": "paragraph", "text": "The file is view-only. Sign in with your campus account in the drive app if prompted." },
      { "type": "footer", "text": "XMUM Cloud Drive\nShared files open in the drive web app." }
    ],
    "explanation": "Legitimate: a view-only share on the drive's real domain, asking only for your normal campus sign-in.",
    "indicators": [
      { "target": "body", "text": "Shared record available", "explanation": "An ordinary share notice." },
      { "target": "body", "text": "https://drive.xmum.edu.my", "explanation": "The destination is the drive's real domain." },
      { "target": "body", "text": "The file is view-only", "explanation": "It limits access rather than requesting extra permissions." }
    ],
    "context": {
      "source": "Your cloud drive, opened independently",
      "facts": [
        "The file is shared with you as view-only.",
        "Shared files open in the drive app with your campus account."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and a view-only share.",
      "contrast": "A phishing share asks for full drive access at an off-domain viewer.",
      "nextStep": "Open the file from the drive app when you need it."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "payroll-confirm",
    "institution": "university",
    "classification": "legitimate",
    "difficulty": "Hard",
    "brand": "XMUM",
    "objective": "Recognise a portal-based confirmation that never asks for passwords.",
    "senderName": "XMUM Payroll",
    "senderEmail": "payroll@xmum.edu.my",
    "subject": "Please confirm your bank details",
    "body": [
      { "type": "banner", "variant": "warn", "text": "Please confirm your bank details", "subtext": "Before Friday's payroll run" },
      { "type": "paragraph", "text": "Hi Aisha," },
      { "type": "paragraph", "text": "Before Friday's payroll run, please confirm the bank details on your record are correct." },
      { "type": "detail", "text": "Account ending 4012 · Confirm by Thursday" },
      { "type": "button", "text": "Confirm details", "url": "https://staff.xmum.edu.my/payroll/confirm" },
      { "type": "paragraph", "text": "Confirm in the staff portal. We will never ask for your password or banking password by email." },
      { "type": "footer", "text": "XMUM Payroll\nPayroll details are confirmed in the staff portal." }
    ],
    "explanation": "Legitimate: a payroll confirmation on the staff portal's real domain that warns against sharing passwords.",
    "indicators": [
      { "target": "body", "text": "Please confirm your bank details", "explanation": "A routine request with no password demand." },
      { "target": "body", "text": "https://staff.xmum.edu.my", "explanation": "The destination is the staff portal's real domain." },
      { "target": "body", "text": "never ask for your password", "explanation": "It explicitly warns against the credential-collection trick." }
    ],
    "context": {
      "source": "The staff portal, opened independently",
      "facts": [
        "Your payroll record awaits confirmation.",
        "Confirmations happen in the portal, never by email."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and an explicit no-password-by-email warning.",
      "contrast": "A phishing payroll email collects passwords at a lookalike portal.",
      "nextStep": "Confirm your details in the staff portal by Thursday."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "tax-return-status",
    "institution": "tax",
    "classification": "legitimate",
    "difficulty": "Easy",
    "brand": "LHDN MyTax",
    "objective": "Recognise a status notice that tells you to use your bookmark.",
    "senderName": "LHDN · MyTax",
    "senderEmail": "mytax@hasil.gov.my",
    "subject": "Your return status has been updated",
    "body": [
      { "type": "banner", "variant": "info", "text": "Return status updated", "subtext": "Log in to MyTax to view it" },
      { "type": "paragraph", "text": "Dear taxpayer," },
      { "type": "paragraph", "text": "The status of your latest tax return has changed. Log in to MyTax to view the update." },
      { "type": "detail", "text": "Assessment year 2024 · Status updated today" },
      { "type": "button", "text": "View status", "url": "https://mytax.hasil.gov.my/status/" },
      { "type": "paragraph", "text": "Log in through your own MyTax bookmark. We never send refund links or ask for your password by email." },
      { "type": "footer", "text": "Lembaga Hasil Dalam Negeri\nAccess MyTax through official channels." }
    ],
    "explanation": "Legitimate: a status notice on the tax authority's real domain that points you to your bookmark.",
    "indicators": [
      { "target": "body", "text": "Return status updated", "explanation": "A plain notice with no refund bait." },
      { "target": "body", "text": "https://mytax.hasil.gov.my", "explanation": "The destination is the tax authority's real domain." },
      { "target": "body", "text": "your own MyTax bookmark", "explanation": "It tells you to navigate independently, the opposite of a phishing link." }
    ],
    "context": {
      "source": "MyTax, opened via your saved bookmark",
      "facts": [
        "Your return status is updated as described.",
        "LHDN sends notices, not refund links or password requests."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain link and guidance to use your own bookmark.",
      "contrast": "A phishing refund email links elsewhere and asks for your password.",
      "nextStep": "Log in to MyTax from your bookmark to view the update."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  },
  {
    "id": "parcel-reschedule",
    "institution": "parcel",
    "classification": "legitimate",
    "difficulty": "Easy",
    "brand": "Pos Laju",
    "objective": "Recognise a free reschedule notice.",
    "senderName": "Pos Laju · Delivery",
    "senderEmail": "delivery@poslaju.com.my",
    "subject": "Delivery attempt unsuccessful — reschedule",
    "body": [
      { "type": "banner", "variant": "warn", "text": "Delivery attempt unsuccessful", "subtext": "Reschedule your delivery for free" },
      { "type": "paragraph", "text": "Dear customer," },
      { "type": "paragraph", "text": "A delivery attempt was made but no one was available. You can reschedule for a more convenient time." },
      { "type": "detail", "text": "EP123456789MY · Reschedule within 5 days" },
      { "type": "button", "text": "Reschedule", "url": "https://www.poslaju.com.my/reschedule/EP123456789MY" },
      { "type": "paragraph", "text": "Rescheduling is free of charge. No payment is required." },
      { "type": "footer", "text": "Pos Laju National Courier\nReschedule anytime on the courier website." }
    ],
    "explanation": "Legitimate: a reschedule notice on the courier's real domain that explicitly costs nothing.",
    "indicators": [
      { "target": "body", "text": "Delivery attempt unsuccessful", "explanation": "A caution banner with no invented fee." },
      { "target": "body", "text": "https://www.poslaju.com.my", "explanation": "The destination is the courier's real domain." },
      { "target": "body", "text": "Rescheduling is free of charge", "explanation": "It rules out the redelivery-fee scam outright." }
    ],
    "context": {
      "source": "The courier's tracking page, opened independently",
      "facts": [
        "The delivery attempt is recorded.",
        "Rescheduling is free on the courier site."
      ]
    },
    "reasoning": {
      "evidence": "An on-domain reschedule link and an explicit free-of-charge note.",
      "contrast": "A phishing reschedule notice invents a fee and asks for card details.",
      "nextStep": "Reschedule from the courier site if the time does not suit."
    },
    "acceptedEvidence": ["body:0", "destination:4"]
  }
];
if(typeof module!=="undefined"&&module.exports)module.exports=emails;else root.EMAIL_BANK=emails;
})(typeof window!=="undefined"?window:globalThis);
