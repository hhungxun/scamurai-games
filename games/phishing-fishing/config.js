/* Booth settings. Reload index.html after editing. No installation needed. */
(function (root) {
  "use strict";
  const config = Object.freeze({
    roundSeconds: 60,       // Shared time for the entire shuffled bank.
    targetAnswers: 10,      // Full scoring progress at ten answers; the bank still has twenty.
    accuracyWeight: 80,     // Correct / answered; zero when no answers were given.
    participationWeight: 20 // Progress scales both parts; weights must total 100.
  });
  if (typeof module !== "undefined" && module.exports) module.exports = config;
  else root.GAME_CONFIG = config;
})(typeof window !== "undefined" ? window : globalThis);
