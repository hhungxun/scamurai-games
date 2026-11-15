/* Public reference only: no question IDs, answers or lookalike domains. */
(function (root) {
  "use strict";
  const reference = [
    { id: "university", name: "XMUM / University", domain: "xmum.example", pattern: "Check announcements, bookings and registrations in your usual student portal or at the campus service counter." },
    { id: "bank", name: "Meridian Bank", domain: "meridian-bank.example", pattern: "Check card activity in the bank app. Use the number printed on your card for support." },
    { id: "parcel", name: "ParcelPath", domain: "parcelpath.example", pattern: "Compare the tracking reference, delivery arrangements and charges with your original order and courier app." },
    { id: "shopping", name: "ShopLane", domain: "shoplane.example", pattern: "Confirm purchases, receipts and payment status in My Purchases in your existing shopping account." },
    { id: "tax", name: "LHDN / MyTax", domain: "lhdn.example", pattern: "Check tax notices in MyTax using a saved bookmark or an independently verified address." },
    { id: "identity", name: "Campus ID", domain: "campus-id.example", pattern: "Review recovery details and security activity through Account → Security in your normal student portal." }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = reference;
  else root.DOMAIN_REFERENCE = reference;
})(typeof window !== "undefined" ? window : globalThis);
