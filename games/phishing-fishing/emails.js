/*
 * 20 simulated emails: 12 phishing and 8 legitimate. All are shuffled each round.
 * Original scenarios plus four playful, obvious scams using different mechanisms.
 * Official fictional domains: domains.js. Text and actual
 * link destination are separate fields. Attachments are labels, never files.
 * Indicators, objectives and classifications appear only in the review.
 */
(function (root) {
  "use strict";
  const emails = [
    {
      id: "bank-verification", institution: "bank", classification: "phishing", difficulty: "Easy",
      objective: "Recognise a request for banking secrets, rather than relying on urgency alone.",
      senderName: "Meridian Bank | Account Services", senderEmail: "accounts@meridian-secure.example",
      recipient: "student@xmum.example", subject: "Please confirm your online banking access",
      body: [
        { type: "paragraph", text: "Dear Customer," },
        { type: "paragraph", text: "We are updating our online banking security records. Please complete the account check by 6:00 pm today to keep online transfers available." },
        { type: "link", text: "Confirm banking access", url: "https://meridian-secure.example/verify" },
        { type: "paragraph", text: "The check requires your online banking password and the SMS one-time code sent to your phone. Enter both on the verification page." },
        { type: "paragraph", text: "Meridian Bank Account Services\nReference: MB-841209" }
      ],
      explanation: "Phishing: this account-verification lure asks for a banking password and one-time code on a separate domain. The deadline alone is not the deciding clue. Open the bank app yourself or call the number on your card; never share these secrets through an emailed request.",
      indicators: [
        { target: "body", text: "online banking password and the SMS one-time code", explanation: "These secrets can authorise account access or a payment. An email-led account check should not collect them." },
        { target: "sender", text: "meridian-secure.example", explanation: "This is a separate domain from the reference bank's meridian-bank.example. The shared .example ending is not a warning sign." },
        { target: "body", text: "https://meridian-secure.example/verify", explanation: "The destination also uses the separate domain. Check through your existing bank app instead." }
      ]
    },
    {
      id: "campus-storage", institution: "university", classification: "phishing", difficulty: "Medium",
      objective: "Check the sender and destination of a plausible university storage notice.",
      senderName: "XMUM IT Service Desk", senderEmail: "helpdesk@xmum-it.example",
      recipient: "student@xmum.example", subject: "Student mailbox storage report — October",
      body: [
        { type: "paragraph", text: "Hello," },
        { type: "paragraph", text: "Your student mailbox is using 9.8 GB of its 10 GB allowance. You can review large messages or request the student storage extension through the quota report below." },
        { type: "detail", text: "Mailbox: student@xmum.example\nReport: IT-Q-1022" },
        { type: "link", text: "Open my storage report", url: "https://xmum-storage.example/quota/IT-Q-1022" },
        { type: "paragraph", text: "Use your campus sign-in to access the report. Requests are processed during normal service hours.\nXMUM IT Service Desk" }
      ],
      explanation: "Phishing: a routine storage report is used as a sign-in lure. Neither xmum-it.example nor xmum-storage.example belongs to the reference university domain xmum.example. There is no dramatic deadline here. Check mailbox storage in your usual student portal or ask the IT counter to confirm the notice.",
      indicators: [
        { target: "sender", text: "xmum-it.example", explanation: "An IT-themed name is still a different domain from xmum.example." },
        { target: "body", text: "https://xmum-storage.example/quota/IT-Q-1022", explanation: "Inspecting the link reveals a separate storage-themed domain, not a university subdomain." },
        { target: "body", text: "Use your campus sign-in", explanation: "The mismatch matters because this unfamiliar destination is asking you to authenticate." }
      ]
    },
    {
      id: "parcel-fee", institution: "parcel", classification: "phishing", difficulty: "Medium",
      objective: "Inspect the destination before paying a small, believable delivery charge.",
      senderName: "ParcelPath Delivery", senderEmail: "delivery@parcelpath-redelivery.example",
      recipient: "student@xmum.example", subject: "Address correction for parcel PP-MY-804219",
      body: [
        { type: "paragraph", text: "Hello," },
        { type: "paragraph", text: "The unit number on parcel PP-MY-804219 could not be read. The parcel is at our Sepang depot. A second delivery can be arranged once the address correction charge is paid." },
        { type: "detail", text: "Address correction: RM 2.40\nParcel reference: PP-MY-804219" },
        { type: "link", text: "Review address and pay RM 2.40", url: "https://parcelpath-redelivery.example/payment/PP-MY-804219" },
        { type: "paragraph", text: "The correction payment is handled separately from your original order.\nParcelPath Customer Support" }
      ],
      explanation: "Phishing: the small charge is a payment lure on parcelpath-redelivery.example, separate from the reference courier's parcelpath.example. A fee or delivery problem alone does not prove fraud. Check the tracking record and any charge in the courier app or through a known support channel before paying.",
      indicators: [
        { target: "sender", text: "parcelpath-redelivery.example", explanation: "The sender uses a lookalike domain rather than the reference courier's domain." },
        { target: "body", text: "https://parcelpath-redelivery.example/payment/PP-MY-804219", explanation: "The payment destination is outside parcelpath.example. Inspect the whole domain, not just the brand name." },
        { target: "body", text: "handled separately from your original order", explanation: "An unexpected separate payment should be checked against the original order and tracking record." }
      ]
    },
    {
      id: "shopping-document", institution: "shopping", classification: "phishing", difficulty: "Hard",
      objective: "Recognise a deceptive receipt attachment and excessive account permissions, even with a familiar sender.",
      senderName: "ShopLane Purchase Documents", senderEmail: "receipts@shoplane.example",
      recipient: "student@xmum.example", subject: "Your receipt for order SL-583102",
      body: [
        { type: "paragraph", text: "Hi Aisha," },
        { type: "paragraph", text: "Your order SL-583102 has been processed. The RM 89.90 receipt is supplied through our Receipt Viewer as an attached browser document." },
        { type: "attachment", text: "Receipt-SL-583102.pdf.html · 48 KB" },
        { type: "paragraph", text: "Open the document in your browser. If prompted, approve Receipt Viewer access to read and send email on your behalf. This connects the viewer to your campus account so it can display the receipt." },
        { type: "paragraph", text: "ShopLane Purchase Documents\nOrder reference: SL-583102" }
      ],
      explanation: "Phishing: a receipt attachment is used to obtain broad mailbox permissions, a technique called consent phishing. The final .html extension means the document is not simply a PDF. Viewing a receipt does not justify access to read and send your email. The familiar sender could be spoofed or compromised. Decline the permission request and find the receipt in ShopLane's My Purchases.",
      indicators: [
        { target: "body", text: "Receipt-SL-583102.pdf.html", explanation: "The final extension is .html, not .pdf. HTML alone does not prove fraud; combine this disguise with the excessive mailbox permissions." },
        { target: "body", text: "read and send email on your behalf", explanation: "These permissions are far broader than a receipt viewer needs. Granting access can be harmful even without giving away a password." },
        { target: "body", text: "connects the viewer to your campus account", explanation: "A shopping receipt has no reason to require control of your campus mailbox. Verify the order in your shopping account." }
      ]
    },
    {
      id: "tax-rebate", institution: "tax", classification: "phishing", difficulty: "Hard",
      objective: "Compare displayed link text with the destination and recognise a brand name embedded in an unrelated domain.",
      senderName: "LHDN MyTax Notifications", senderEmail: "notifications@mytax.lhdn.example",
      recipient: "student@xmum.example", subject: "Tax refund advice — reference EF-2026-184207",
      body: [
        { type: "paragraph", text: "Dear Taxpayer," },
        { type: "paragraph", text: "A refund advice for RM 486.20 is available for reference EF-2026-184207. Please review the payment details in the taxpayer portal." },
        { type: "link", text: "https://mytax.lhdn.example/refunds/EF-2026-184207", url: "https://mytax.lhdn.example.refund-desk.example/refunds/EF-2026-184207" },
        { type: "paragraph", text: "The portal will ask you to confirm your identity and receiving bank account before processing.\nLHDN MyTax Notifications" }
      ],
      explanation: "Phishing: the visible MyTax address disguises a different destination. The actual host ends in refund-desk.example; the lhdn.example words at its start do not make it an LHDN subdomain. This is a disguised-link identity and bank-detail lure. A matching sender is not proof. Open MyTax through a saved or independently verified address to check for a refund advice.",
      indicators: [
        { target: "body", text: "https://mytax.lhdn.example/refunds/EF-2026-184207", explanation: "This is only the displayed text. It does not determine where a link leads." },
        { target: "body", text: "mytax.lhdn.example.refund-desk.example", explanation: "The real destination belongs under refund-desk.example, not lhdn.example. Compare the full destination with the reference." },
        { target: "body", text: "confirm your identity and receiving bank account", explanation: "Because the destination is disguised, this request could disclose personal and financial information." }
      ]
    },
    {
      id: "security-reply", institution: "identity", classification: "phishing", difficulty: "Easy",
      objective: "Recognise OTP theft by email reply; phishing does not need a link.",
      senderName: "Campus ID Security", senderEmail: "security@campus-id.example",
      recipient: "student@xmum.example", subject: "Was this you? New sign-in from a Windows device",
      body: [
        { type: "paragraph", text: "Hello," },
        { type: "paragraph", text: "A new sign-in to your Campus ID was recorded from a Windows device near Kuala Lumpur. If this was you, you can ignore this message." },
        { type: "detail", text: "Device: Windows / Chrome\nReference: SEC-730184" },
        { type: "paragraph", text: "If you do not recognise this activity, reply to this email with the six-digit verification code sent to your phone. Our analyst will use the code to cancel the sign-in." },
        { type: "paragraph", text: "Campus ID Security Team" }
      ],
      explanation: "Phishing: replying with a one-time code is the decisive warning sign. A code can authorise someone else's sign-in; it does not cancel one. This attack needs no link, and its sender address can be spoofed. Do not reply with the code. Check activity through your usual student portal and contact campus IT separately.",
      indicators: [
        { target: "body", text: "reply to this email with the six-digit verification code", explanation: "Never send a one-time authentication code by email, even if the sender looks familiar." },
        { target: "body", text: "use the code to cancel the sign-in", explanation: "The purpose is misleading: authentication codes grant access rather than cancel it." }
      ]
    },
    {
      id: "library-hours", institution: "university", classification: "legitimate", difficulty: "Easy",
      objective: "Distinguish a normal university booking deadline from pressure to disclose information.",
      senderName: "XMUM Library", senderEmail: "library@xmum.example",
      recipient: "student@xmum.example", subject: "Revision-week study rooms: bookings close Friday",
      body: [
        { type: "paragraph", text: "Dear students," },
        { type: "paragraph", text: "Study-room bookings for 2–8 November close at 5:00 pm this Friday. Rooms seat four to six students and can be reserved for up to two hours." },
        { type: "detail", text: "Service: Library → Study Rooms\nBooking fee: RM 0.00\nBring your student card to the service counter." },
        { type: "paragraph", text: "Make or change a booking in the library section of your usual student portal. Questions can be checked at the library service counter during staffed hours.\nXMUM Library Services" }
      ],
      explanation: "Legitimate in this simulation: the deadline relates to a specific booking service, the free-room details are consistent, and bookings use the established student portal. A deadline alone is not phishing. Confirm availability in your usual portal or at the library counter; the sender address by itself cannot prove authenticity.",
      indicators: [
        { target: "body", text: "bookings for 2–8 November close at 5:00 pm this Friday", explanation: "This is a practical booking cutoff, not a demand to reveal secrets. Real notices can have deadlines." },
        { target: "body", text: "library section of your usual student portal", explanation: "The booking uses an established service you can open independently." },
        { target: "body", text: "library service counter", explanation: "There is a known physical place to confirm the details." }
      ]
    },
    {
      id: "bank-notification", institution: "bank", classification: "legitimate", difficulty: "Medium",
      objective: "Respond safely to an urgent bank alert without treating urgency or an amount as proof of fraud.",
      senderName: "Meridian Bank Card Alerts", senderEmail: "alerts@meridian-bank.example",
      recipient: "student@xmum.example", subject: "Please review a card transaction — RM 840.00",
      body: [
        { type: "paragraph", text: "Dear Customer," },
        { type: "paragraph", text: "A card transaction requires your review. Online purchases on card ending 4821 have been temporarily paused while you check this activity." },
        { type: "detail", text: "Merchant: TechSquare Online\nAmount: RM 840.00\nReference: MB-841209" },
        { type: "paragraph", text: "Please open the Meridian Bank app yourself and select Cards → Activity to confirm or report the transaction promptly. If you cannot use the app, call the number printed on the back of your card.\nMeridian Bank Card Services" }
      ],
      explanation: "Legitimate in this simulation: the reference, partial card number and app-based review fit the bank's notification pattern. The amount and temporary restriction are reasons to check, not automatic proof of phishing. Use the app or the number on your physical card to verify; a plausible sender or transaction detail could still be forged.",
      indicators: [
        { target: "body", text: "open the Meridian Bank app yourself", explanation: "Review happens through your independently opened app, without an emailed sign-in page." },
        { target: "body", text: "call the number printed on the back of your card", explanation: "Use a known contact instead of trusting a number supplied by email." },
        { target: "body", text: "card ending 4821", explanation: "Only a limited identifier is shown. It supports context but does not prove authenticity." }
      ]
    },
    {
      id: "parcel-update", institution: "parcel", classification: "legitimate", difficulty: "Medium",
      objective: "Check consistent delivery details and a link destination; collection deadlines can be normal.",
      senderName: "ParcelPath Tracking", senderEmail: "updates@parcelpath.example",
      recipient: "student@xmum.example", subject: "Collect parcel PP-MY-612483 by Friday",
      body: [
        { type: "paragraph", text: "Hi Aisha," },
        { type: "paragraph", text: "Your BookNest parcel has arrived at the XMUM campus collection point. Please collect it by Friday, 6:00 pm, before it returns to the depot." },
        { type: "detail", text: "Tracking: PP-MY-612483\nCollection: campus parcel counter, 10:00 am–6:00 pm\nDelivery fee: RM 4.50, paid with order BN-22814" },
        { type: "link", text: "View collection details", url: "https://parcelpath.example/track/PP-MY-612483" },
        { type: "paragraph", text: "Bring your student card and quote the tracking reference at the counter. The collection details are also in the ParcelPath app.\nParcelPath Delivery Team" }
      ],
      explanation: "Legitimate in this simulation: the tracking reference is consistent, the inspected destination uses parcelpath.example, and collection is at the named campus counter. A paid fee and collection deadline are normal details. Check the reference in your courier app and original order; these details and a matching domain are supporting clues, not a guarantee.",
      indicators: [
        { target: "body", text: "https://parcelpath.example/track/PP-MY-612483", explanation: "The destination uses the reference courier's domain and the same tracking number as the message." },
        { target: "body", text: "RM 4.50, paid with order BN-22814", explanation: "The fee is tied to an order and recorded as paid, rather than routed to an unexpected new payment site." },
        { target: "body", text: "also in the ParcelPath app", explanation: "You can check the claim independently before collecting the parcel." }
      ]
    },
    {
      id: "shopping-receipt", institution: "shopping", classification: "legitimate", difficulty: "Easy",
      objective: "Check itemised amounts and the account workflow instead of treating money-related emails as scams.",
      senderName: "ShopLane Orders", senderEmail: "orders@shoplane.example",
      recipient: "student@xmum.example", subject: "Payment received — order SL-582714",
      body: [
        { type: "paragraph", text: "Hi Aisha," },
        { type: "paragraph", text: "Your RM 22.50 card payment for order SL-582714 has been received. Please check the delivery address in My Purchases before the order is packed tomorrow." },
        { type: "detail", text: "A5 notebook set × 1: RM 18.00\nDelivery: RM 4.50\nTotal paid: RM 22.50\nPayment: card ending 4821" },
        { type: "attachment", text: "Receipt-SL-582714.pdf · 36 KB" },
        { type: "paragraph", text: "A copy of this receipt is stored in My Purchases in your ShopLane account. For address changes or payment queries, use the order's Help option in the app.\nShopLane Orders Team" }
      ],
      explanation: "Legitimate in this simulation: item and delivery costs add up, the receipt is also in My Purchases, and the request is limited to checking your order there. Neither money, an attachment nor a packing deadline automatically makes an email phishing. Open the app independently to confirm the order; do not assume a PDF or matching sender is safe on its own.",
      indicators: [
        { target: "body", text: "Total paid: RM 22.50", explanation: "The RM 18.00 item plus RM 4.50 delivery matches the total." },
        { target: "body", text: "stored in My Purchases", explanation: "The same receipt is available without opening the emailed attachment." },
        { target: "body", text: "order's Help option in the app", explanation: "Queries stay inside the shopping account's established workflow." }
      ]
    },
    {
      id: "event-registration", institution: "university", classification: "legitimate", difficulty: "Hard",
      objective: "Distinguish a genuine registration deposit and deadline from an unexpected off-site payment.",
      senderName: "XMUM Student Activities", senderEmail: "activities@xmum.example",
      recipient: "student@xmum.example", subject: "First Aid Workshop: confirm your reserved place by Friday",
      body: [
        { type: "paragraph", text: "Hi Aisha," },
        { type: "paragraph", text: "Your registration FA-1124 for the First Aid Workshop is reserved. Please pay the RM 10.00 refundable seat deposit by Friday, 5:00 pm, to confirm your place." },
        { type: "detail", text: "Workshop: 14 November, 10:00 am–12:00 pm\nVenue: Student Activity Centre, Room 2\nDeposit: returned through the portal after attendance" },
        { type: "link", text: "View my workshop registration", url: "https://events.xmum.example/registrations/FA-1124" },
        { type: "paragraph", text: "You can also open your usual student portal and choose Events → My Registrations. The same reference and deposit appear there. Questions can be checked at the Student Activities counter.\nXMUM Student Activities" }
      ],
      explanation: "Legitimate in this simulation: a named event, consistent reference and refundable deposit are recorded in the established student portal. The link is under xmum.example, and you can verify the payment independently there. A deadline or deposit is not enough to call it phishing. If you did not register, contact Student Activities through a known channel before paying.",
      indicators: [
        { target: "body", text: "https://events.xmum.example/registrations/FA-1124", explanation: "events.xmum.example is a subdomain of the reference university domain, and the reference matches." },
        { target: "body", text: "Events → My Registrations", explanation: "Check the same fee and registration in your independently opened student portal." },
        { target: "body", text: "returned through the portal after attendance", explanation: "The fee has a specific event purpose and refund process; confirm both before paying." }
      ]
    },
    {
      id: "security-change", institution: "identity", classification: "legitimate", difficulty: "Hard",
      objective: "Evaluate an account-maintenance request using its scope, destination and independent verification route.",
      senderName: "Campus ID Service Updates", senderEmail: "updates@campus-id.example",
      recipient: "student@xmum.example", subject: "Before Friday: review your account recovery number",
      body: [
        { type: "paragraph", text: "Hello," },
        { type: "paragraph", text: "Campus ID recovery settings will be migrated on Friday, 6:00–8:00 pm. Please check your recovery phone number before 5:00 pm so account recovery remains available after the change." },
        { type: "detail", text: "Account: student@xmum.example\nMaintenance reference: CID-M-1023" },
        { type: "link", text: "Review recovery settings", url: "https://campus-id.example/account/security" },
        { type: "paragraph", text: "Alternatively, open your usual student portal and go to Account → Security → Recovery. Review the number inside your account; the IT service counter can confirm the maintenance reference.\nCampus ID Service Team" }
      ],
      explanation: "Legitimate in this simulation: the notice asks for a limited review inside the established identity service, with a matching destination and a reference the campus counter can confirm. A sign-in request or deadline is not automatically phishing. Open the portal independently and check the notice first; a matching domain is not proof, and codes or passwords should never be sent by reply.",
      indicators: [
        { target: "body", text: "https://campus-id.example/account/security", explanation: "The destination belongs to the reference Campus ID service. Check context as well as the domain." },
        { target: "body", text: "Account → Security → Recovery", explanation: "The request is limited to a normal setting in the service you already use." },
        { target: "body", text: "IT service counter can confirm the maintenance reference", explanation: "A known campus contact can independently verify the maintenance claim." }
      ]
    },
    {
      id: "internship-reservation", institution: "university", classification: "phishing", difficulty: "Medium",
      objective: "Recognise advance-fee recruitment fraud and pressure to bypass university checks, even with a familiar sender.",
      senderName: "XMUM Career Services", senderEmail: "careers@xmum.example",
      recipient: "student@xmum.example", subject: "Industry placement offer — reserve your internship slot",
      body: [
        { type: "paragraph", text: "Dear Aisha," },
        { type: "paragraph", text: "Your profile has been selected for a paid data internship with our industry partner. An interview is not required. Please reserve your placement by purchasing the RM 180 onboarding kit before Friday." },
        { type: "detail", text: "Payment method: bank transfer to the recruiter's personal account\nAccount details: supplied after your reply" },
        { type: "paragraph", text: "The fee is refundable with your first allowance. Do not contact the campus career counter about this partner-only offer; doing so will release your reserved slot." },
        { type: "paragraph", text: "Reply with your acceptance to receive payment instructions.\nCareer Placement Team" }
      ],
      explanation: "Phishing: this recruitment lure demands an advance payment to a personal account and threatens to withdraw the offer if you verify it with the career counter. A promised refund does not resolve those risks. The familiar sender may be spoofed or compromised. Check the employer and placement through the independently contacted career office before sending money or documents.",
      indicators: [
        { target: "body", text: "RM 180 onboarding kit", explanation: "An unexpected upfront purchase to secure a paid position is an advance-fee warning that needs independent checking." },
        { target: "body", text: "recruiter's personal account", explanation: "A personal payment route is inconsistent with a documented university placement process." },
        { target: "body", text: "Do not contact the campus career counter", explanation: "Discouraging independent verification and threatening your slot are the strongest evidence of manipulation." }
      ]
    },
    {
      id: "scholarship-document", institution: "university", classification: "phishing", difficulty: "Hard",
      objective: "Recognise a shared-document lure that asks you to disable protections and run macros rather than disclose credentials.",
      senderName: "XMUM Scholarships Office", senderEmail: "scholarships@xmum.example",
      recipient: "student@xmum.example", subject: "Shared with you: scholarship assessment comments",
      body: [
        { type: "paragraph", text: "Dear Aisha," },
        { type: "paragraph", text: "The assessment panel has shared comments on your scholarship application SCH-26118. The preview is unavailable; download the attached copy to view the panel notes." },
        { type: "attachment", text: "Assessment-SCH-26118.docm · 84 KB" },
        { type: "paragraph", text: "In Word, turn off Protected View and choose Enable Content to run the document macros. If your security software blocks the file, pause its protection while opening it. This is required to display the comments." },
        { type: "paragraph", text: "Please review the notes before your next appointment.\nScholarships Assessment Team" }
      ],
      explanation: "Phishing: the shared-document pretext asks you to run macros and disable document and security protections. A .docm file can contain executable macros; the extension alone does not prove malice, but these instructions are strong evidence. Do not open or enable it. Independently contact the scholarship counter and ask for the assessment in the student portal. A matching sender and plausible application reference do not establish safety.",
      indicators: [
        { target: "body", text: "Assessment-SCH-26118.docm", explanation: "The .docm extension supports macros. Consider the requested actions as well as the file type." },
        { target: "body", text: "turn off Protected View", explanation: "Scholarship feedback should not require weakening document protections." },
        { target: "body", text: "pause its protection", explanation: "Disabling security software to view comments can allow malicious code to run. Verify through a known office instead." }
      ]
    },
    {
      id: "internship-shortlist", institution: "university", classification: "legitimate", difficulty: "Medium",
      objective: "Verify recruitment through a recorded application, scoped interview request and independently accessible career service.",
      senderName: "XMUM Career Services", senderEmail: "careers@xmum.example",
      recipient: "student@xmum.example", subject: "Interview booking for your internship application CS-26104",
      body: [
        { type: "paragraph", text: "Dear Aisha," },
        { type: "paragraph", text: "Your application CS-26104 for the data internship has been shortlisted. Please select an interview slot by Friday; the employer will discuss duties and allowances at the interview." },
        { type: "link", text: "View my application and interview slots", url: "https://careers.xmum.example/applications/CS-26104" },
        { type: "paragraph", text: "You can also open your usual student portal and choose Careers → My Applications. The employer details and interview invitation are recorded there. No reservation payment or kit purchase is required." },
        { type: "paragraph", text: "If you did not apply, ask the campus career counter to check the reference.\nXMUM Career Services" }
      ],
      explanation: "Legitimate in this simulation: the interview is tied to a recorded application, uses a university subdomain and can be checked in the independently opened portal or at the career counter. The request is limited to booking an interview with no advance payment. Confirm that you actually applied; a matching sender or the absence of a fee alone cannot prove an offer genuine.",
      indicators: [
        { target: "body", text: "https://careers.xmum.example/applications/CS-26104", explanation: "The destination is within the reference university domain and includes the same application reference." },
        { target: "body", text: "Careers → My Applications", explanation: "The existing portal lets you verify the employer and application without following the email link." },
        { target: "body", text: "ask the campus career counter to check the reference", explanation: "An independent campus contact can check an unexpected invitation before you act." }
      ]
    },
    {
      id: "scholarship-review", institution: "university", classification: "legitimate", difficulty: "Hard",
      objective: "Evaluate a sensitive scholarship-document request using its purpose, limited scope and established submission route.",
      senderName: "XMUM Scholarships Office", senderEmail: "scholarships@xmum.example",
      recipient: "student@xmum.example", subject: "Scholarship SCH-26118 — income evidence clarification",
      body: [
        { type: "paragraph", text: "Dear Aisha," },
        { type: "paragraph", text: "The panel needs clarification of the household income evidence for application SCH-26118. Your assessment comments and document checklist are now shared in the student portal as a PDF preview." },
        { type: "link", text: "View my scholarship assessment", url: "https://aid.xmum.example/applications/SCH-26118" },
        { type: "paragraph", text: "Alternatively, open your usual student portal and choose Financial Aid → My Applications. Upload only the income evidence listed there, with unrelated account numbers and transactions redacted. Please do not send financial documents by email reply." },
        { type: "paragraph", text: "The scholarship counter can confirm the checklist and discuss an extension before Friday.\nXMUM Scholarships Office" }
      ],
      explanation: "Legitimate in this simulation: income evidence is relevant to the scholarship application, and the request limits what is collected through an existing portal record. The shared comments need no macros or disabled protections. Verify the checklist independently in the portal or with the scholarship counter before uploading sensitive information. A familiar address, PDF preview or deadline alone is not proof of authenticity.",
      indicators: [
        { target: "body", text: "Financial Aid → My Applications", explanation: "The shared comments and checklist are available through the independently opened student portal." },
        { target: "body", text: "unrelated account numbers and transactions redacted", explanation: "The request limits disclosure to evidence relevant to the scholarship assessment." },
        { target: "body", text: "scholarship counter can confirm the checklist", explanation: "A known campus office can verify the request and discuss the deadline before documents are submitted." }
      ]
    },
    {
      "id": "penguin-qr",
      "institution": "parcel",
      "classification": "phishing",
      "difficulty": "Easy",
      "objective": "Recognise QR-code phishing and an unsolicited delivery payment lure.",
      "senderName": "ParcelPath | Live Penguin Division",
      "senderEmail": "penguins@parcelpath-ice-express.example",
      "recipient": "student@xmum.example",
      "subject": "Your emotional-support penguin is waiting at the hostel",
      "body": [
        {
          "type": "paragraph",
          "text": "Dear Future Penguin Parent,"
        },
        {
          "type": "paragraph",
          "text": "A penguin you definitely ordered has arrived. It has already eaten the delivery receipt. Scan the attached QR code and enter your card number, expiry date and CVV to pay its RM 8.88 fish allowance."
        },
        {
          "type": "attachment",
          "text": "SCAN-ME-penguin-delivery-QR.png (training label only)"
        },
        {
          "type": "paragraph",
          "text": "Do not check your courier app. Penguins do not believe in tracking numbers. Pay in 3 minutes or it becomes your roommate permanently."
        },
        {
          "type": "paragraph",
          "text": "ParcelPath Live Penguin Division\nChief Fish Officer"
        }
      ],
      "explanation": "Phishing: this QR-code lure (quishing) asks for card details for an unsolicited delivery. A QR code can conceal a payment or credential-stealing destination, just like a link. Do not scan or pay; check the original order and courier app independently. The QR attachment here is an inert label.",
      "indicators": [
        {
          "target": "body",
          "text": "Scan the attached QR code",
          "explanation": "A QR code is another way to hide a destination; it does not make the request trustworthy."
        },
        {
          "target": "body",
          "text": "card number, expiry date and CVV",
          "explanation": "The unsolicited delivery story is collecting payment-card details."
        },
        {
          "target": "body",
          "text": "Do not check your courier app",
          "explanation": "Discouraging an independent check is a warning sign."
        }
      ]
    },
    {
      "id": "lecture-clone",
      "institution": "university",
      "classification": "phishing",
      "difficulty": "Easy",
      "objective": "Reject an executable attachment disguised as a magical academic shortcut.",
      "senderName": "XMUM Totally Real Clone Laboratory",
      "senderEmail": "professor@xmum-clone-lab.example",
      "recipient": "student@xmum.example",
      "subject": "Your clone will attend the 8 am lecture. You keep sleeping.",
      "body": [
        {
          "type": "paragraph",
          "text": "Dear Sleep-Deprived Scholar,"
        },
        {
          "type": "paragraph",
          "text": "Congratulations! Your identical academic clone is ready. It attends every 8 am lecture, takes perfect notes and even laughs at the lecturer's jokes."
        },
        {
          "type": "attachment",
          "text": "MyLectureClone.pdf.exe (training label only)"
        },
        {
          "type": "paragraph",
          "text": "Run the attached .exe file as administrator and switch off your antivirus if it complains. The warning just means your laptop is jealous of your clone."
        },
        {
          "type": "paragraph",
          "text": "100% attendance. 0% waking up. Absolutely no questions, please.\nProfessor Copy Paste"
        }
      ],
      "explanation": "Phishing: the joke offer is a malware-delivery lure. The final .exe extension identifies a program, not a PDF. Running an unsolicited program as administrator and disabling antivirus can compromise the computer. Do not run it; verify any campus software through IT.",
      "indicators": [
        {
          "target": "body",
          "text": "MyLectureClone.pdf.exe",
          "explanation": "The final .exe extension matters: this is an executable disguised as a PDF."
        },
        {
          "target": "body",
          "text": "as administrator",
          "explanation": "The sender wants elevated permissions to control the computer."
        },
        {
          "target": "body",
          "text": "switch off your antivirus",
          "explanation": "Never disable protection to run an unexpected email attachment."
        }
      ]
    },
    {
      "id": "alien-wallet",
      "institution": "bank",
      "classification": "phishing",
      "difficulty": "Easy",
      "objective": "Recognise cryptocurrency wallet recovery-phrase theft.",
      "senderName": "Prince Zorp | Intergalactic Treasury",
      "senderEmail": "prince@galactic-meridian-treasury.example",
      "recipient": "student@xmum.example",
      "subject": "Earthling, inherit 9 billion SpaceCoins before lunch",
      "body": [
        {
          "type": "paragraph",
          "text": "Greetings, Most Financially Responsible Earthling,"
        },
        {
          "type": "paragraph",
          "text": "I am Prince Zorp of Planet Definitely Real. Our royal hamster has randomly selected you to inherit 9 BILLION SpaceCoins. No application needed. The hamster is very qualified."
        },
        {
          "type": "paragraph",
          "text": "Reply with your wallet's 12-word recovery phrase so I can deposit the coins. If your wallet says NEVER SHARE THIS, ignore it: that rule only applies on Earth."
        },
        {
          "type": "paragraph",
          "text": "Keep this secret from your bank and friends. They are probably working for the Moon.\nHis Extremely Legitimate Highness, Zorp"
        }
      ],
      "explanation": "Phishing: an absurd windfall is being used to steal a cryptocurrency wallet recovery phrase. Anyone with the phrase can take control of the wallet; receiving funds does not require it. Never share a recovery phrase, and ignore unsolicited giveaways. This lure needs no link or attachment.",
      "indicators": [
        {
          "target": "body",
          "text": "12-word recovery phrase",
          "explanation": "A wallet recovery phrase grants control of the wallet. It is not needed to send you funds."
        },
        {
          "target": "body",
          "text": "ignore it",
          "explanation": "The sender tells you to override the wallet's explicit security warning."
        },
        {
          "target": "body",
          "text": "Keep this secret",
          "explanation": "Secrecy discourages others from helping you recognise the scam."
        }
      ]
    },
    {
      "id": "monday-refund",
      "institution": "shopping",
      "classification": "phishing",
      "difficulty": "Easy",
      "objective": "Recognise callback phishing and a refund pretext for remote-access abuse.",
      "senderName": "ShopLane | Monday Cancellation Department",
      "senderEmail": "refunds@shoplane-monday-rescue.example",
      "recipient": "student@xmum.example",
      "subject": "Receipt: RM 999 for Premium Monday Removal",
      "body": [
        {
          "type": "paragraph",
          "text": "Dear Valued Weekend Enthusiast,"
        },
        {
          "type": "paragraph",
          "text": "Thank you for subscribing to Premium Monday Removal. Your imaginary RM 999 charge guarantees that every Monday becomes Saturday. Side effects include confused calendars."
        },
        {
          "type": "paragraph",
          "text": "Did not subscribe? Call the refund hotline in this message (training placeholder: NO REAL NUMBER). Our agent will ask you to install a remote-control app and share its access code so they can operate your computer and process your refund."
        },
        {
          "type": "paragraph",
          "text": "Do not use support in your shopping app. Only our Calendar Rescue Team can give your Monday back.\nShopLane Monday Cancellation Department"
        }
      ],
      "explanation": "Phishing: a fake subscription receipt creates panic and pushes a callback. The supposed refund then requires remote control of your computer, a common route to account and payment abuse. Do not call a number supplied by an unexpected receipt or share remote-access codes. Check purchases and contact support through your existing shopping app. No callable number is included here.",
      "indicators": [
        {
          "target": "body",
          "text": "install a remote-control app and share its access code",
          "explanation": "A refund does not require an unknown caller to control your computer."
        },
        {
          "target": "body",
          "text": "Did not subscribe?",
          "explanation": "An unexpected charge is being used to push you toward the sender's own callback channel."
        },
        {
          "target": "body",
          "text": "Do not use support in your shopping app",
          "explanation": "The sender steers you away from independently verified support."
        }
      ]
    }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = emails;
  else root.EMAIL_BANK = emails;
})(typeof window !== "undefined" ? window : globalThis);
