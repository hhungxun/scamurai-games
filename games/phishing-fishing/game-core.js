/* Pure game logic, shared by the offline page and optional verification script. */
(function (root) {
  "use strict";
  const reference = typeof module !== "undefined" && module.exports ? require("./domains.js") : root.DOMAIN_REFERENCE;
  const belongsTo = (host, domain) => host === domain || host.endsWith(`.${domain}`);
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function validateBank(bank, settings) {
    if (!Number.isFinite(settings.roundSeconds) || settings.roundSeconds <= 0) throw new Error("roundSeconds must be positive.");
    if (!Number.isFinite(settings.accuracyWeight) || !Number.isFinite(settings.participationWeight) ||
      settings.participationWeight <= 0 || settings.accuracyWeight <= settings.participationWeight ||
      Math.abs(settings.accuracyWeight + settings.participationWeight - 100) > 1e-9)
      throw new Error("Positive scoring weights must total 100, with accuracy weighted higher than participation.");
    if (!Array.isArray(bank) || !bank.length || new Set(bank.map(email => email.id)).size !== bank.length)
      throw new Error("The bank must contain emails with unique IDs.");
    if (!Number.isInteger(settings.targetAnswers) || settings.targetAnswers <= 0 || settings.targetAnswers > bank.length)
      throw new Error("targetAnswers must be a positive integer no larger than the bank.");
    for (const email of bank) {
      if (!email.id || !["phishing", "legitimate"].includes(email.classification)) throw new Error("Every email needs an ID and valid classification.");
      if (!email.senderName || !email.senderEmail || !email.subject || !email.body?.length || !email.explanation || !email.indicators?.length) throw new Error("An email is missing required content.");
      if (!["Easy", "Medium", "Hard"].includes(email.difficulty)) throw new Error("Unknown email difficulty.");
      const institution = reference.find(item => item.id === email.institution);
      if (!institution || !email.objective) throw new Error("Every email needs a reference institution and learning objective.");
      if (!/^[^\s@]+@(?:[a-z0-9-]+\.)+example$/i.test(email.senderEmail) || !/^[^\s@]+@(?:[a-z0-9-]+\.)+example$/i.test(email.recipient || "student@xmum.example")) throw new Error("All email addresses must use reserved .example domains.");
      if (email.classification === "legitimate" && !belongsTo(email.senderEmail.split("@")[1], institution.domain)) throw new Error("A legitimate sender must use its reference institution's domain.");
      for (const block of email.body) {
        if (!["paragraph", "detail", "link", "attachment"].includes(block.type) || typeof block.text !== "string") throw new Error("Unknown or incomplete email body block.");
        if (block.type === "link") {
          for (const address of [block.url, ...(/^https?:\/\//i.test(block.text) ? [block.text] : [])]) {
            const url = new URL(address);
            if (url.protocol !== "https:" || !url.hostname.endsWith(".example") || url.username || url.password || url.port) throw new Error("Simulated URLs must be HTTPS addresses on reserved .example domains, without credentials or ports.");
          }
          if (email.classification === "legitimate" && !belongsTo(new URL(block.url).hostname, institution.domain)) throw new Error("A legitimate destination must use its reference institution's domain.");
        }
      }
      for (const clue of email.indicators) {
        const text = clue.target === "sender" ? email.senderEmail : clue.target === "subject" ? email.subject : clue.target === "body" ? email.body.map(block => `${block.text} ${block.url || ""}`).join("\n") : "";
        if (!clue.text || !clue.explanation || !text.includes(clue.text)) throw new Error("Each indicator must match text available in its email.");
      }
    }
  }
  function selectQuestions(bank, settings, random = Math.random) {
    validateBank(bank, settings);
    return shuffle(bank, random);
  }
  class Round {
    constructor(bank, settings, options = {}) {
      this.settings = settings;
      this.now = options.now || (() => Date.now());
      this.questions = selectQuestions(bank, settings, options.random || Math.random);
      this.answers = new Array(this.questions.length).fill(null);
      this.index = 0;
      this.status = "ready";
      this.startedAt = null;
      this.endedAt = null;
      this.endReason = null;
      this.lastElapsed = 0;
    }
    start() {
      if (this.status !== "ready") return false;
      this.startedAt = this.now();
      this.status = "playing";
      return true;
    }
    elapsedMs() {
      if (this.startedAt === null) return 0;
      // Retain the highest observed elapsed time, even if a clock moves backwards.
      this.lastElapsed = Math.max(this.lastElapsed, (this.endedAt ?? this.now()) - this.startedAt, 0);
      return Math.min(this.settings.roundSeconds * 1000, this.lastElapsed);
    }
    remainingMs() { return Math.max(0, this.settings.roundSeconds * 1000 - this.elapsedMs()); }
    expire() {
      if (this.status === "playing" && this.remainingMs() <= 0) this.finish("timeout");
      return this.status === "finished";
    }
    answer(questionId, classification) {
      if (this.status !== "playing" || this.expire()) return false;
      if (!["legitimate", "phishing"].includes(classification)) return false;
      if (this.questions[this.index]?.id !== questionId || this.answers[this.index] !== null) return false;
      this.answers[this.index] = classification;
      this.index++;
      if (this.index === this.questions.length) this.finish("completed");
      return true;
    }
    finish(reason) {
      if (this.status !== "playing") return;
      this.endedAt = this.now();
      this.status = "finished";
      this.endReason = reason;
    }
    results() {
      if (this.status !== "finished") throw new Error("Results are available only after the round.");
      const reviews = this.questions.map((email, i) => ({ email, answer: this.answers[i], correct: email.classification === this.answers[i] }));
      const correct = reviews.filter(r => r.correct).length;
      const unanswered = this.answers.filter(a => a === null).length;
      const answered = this.questions.length - unanswered;
      const accuracy = answered ? correct / answered : 0;
      const targetProgress = Math.min(answered / this.settings.targetAnswers, 1);
      const accuracyPoints = targetProgress * accuracy * this.settings.accuracyWeight;
      const participationPoints = targetProgress * this.settings.participationWeight;
      return {
        endReason: this.endReason,
        score: Math.round((accuracyPoints + participationPoints) * 10) / 10,
        maximum: 100,
        correct, incorrect: answered - correct, answered, unanswered,
        accuracy, targetProgress, accuracyPoints, participationPoints,
        timeUsed: this.elapsedMs() / 1000, reviews
      };
    }
  }
  const api = { shuffle, validateBank, selectQuestions, Round };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GameCore = api;
})(typeof window !== "undefined" ? window : globalThis);
