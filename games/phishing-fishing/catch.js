/* Post-round presentation only. Nothing here changes or submits a score. */
(function (root) {
  "use strict";
  const lessons = Object.freeze({
    credentials: { title: "Secret Keeper", detail: "Spotted a request for a password, code or recovery phrase." },
    card: { title: "Card Guard", detail: "Spotted unnecessary collection of payment-card details." },
    malware: { title: "Attachment Angler", detail: "Spotted an unsafe attachment or security override." },
    permissions: { title: "Permission Detective", detail: "Spotted access that the task does not need." },
    "advance-fee": { title: "Fee Finder", detail: "Spotted a pay-first recruitment trap." },
    "safe-account": { title: "Transfer Tracker", detail: "Spotted a supposed safe-account transfer." },
    "remote-access": { title: "Remote Access Watch", detail: "Spotted a refund that asks for control of your device." }
  });
  const outcomes = Object.freeze({
    caught: "Scam caught", safe: "Safe mail released", escaped: "Scam escaped",
    miscast: "Safe mail miscast", untouched: "Not checked"
  });
  function summarize(reviews) {
    const counts = { caught: 0, safe: 0, escaped: 0, miscast: 0, untouched: 0 };
    const skills = {};
    const catches = reviews.map((review, index) => {
      const outcome = !review.answer ? "untouched" : review.email.classification === "phishing"
        ? review.correct ? "caught" : "escaped" : review.correct ? "safe" : "miscast";
      counts[outcome]++;
      if (outcome === "caught" && lessons[review.email.lesson]) {
        skills[review.email.lesson] = (skills[review.email.lesson] || 0) + 1;
      }
      return { index, outcome, title: outcomes[outcome], email: review.email };
    });
    const badges = Object.entries(skills).map(([lesson, count]) => ({ lesson, count, ...lessons[lesson] }));
    return { counts, catches, badges };
  }
  const api = { lessons, outcomes, summarize };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FishingCatch = api;
})(typeof window !== "undefined" ? window : globalThis);
