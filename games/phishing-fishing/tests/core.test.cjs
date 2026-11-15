/* Optional maintainer checks: node tests/core.test.cjs. No packages needed. */
"use strict";
const assert = require("node:assert/strict");
const bank = require("../emails.js");
const config = require("../config.js");
const { Round, selectQuestions, validateBank } = require("../game-core.js");
let checks = 0;
function check(name, test) { test(); checks++; console.log(`PASS ${name}`); }
function seededRandom(seed = 7314) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
check("20 valid emails, including four distinct obvious scams", () => {
  validateBank(bank, config);
  assert.equal(bank.length, 20);
  assert.equal(bank.filter(e => e.classification === "phishing").length, 12);
  assert.equal(bank.filter(e => e.classification === "legitimate").length, 8);
  assert.equal(config.roundSeconds, 60);
  assert.equal(config.accuracyWeight, 80);
  assert.equal(config.participationWeight, 20);
  for (const id of ["penguin-qr", "lecture-clone", "alien-wallet", "monday-refund"]) {
    const email = bank.find(e => e.id === id);
    assert.equal(email.classification, "phishing");
    assert.equal(email.difficulty, "Easy");
  }
  const content = id => bank.find(e => e.id === id).body.map(b => b.text).join(" ");
  assert.match(content("penguin-qr"), /QR code/);
  assert.match(content("lecture-clone"), /pdf\.exe/);
  assert.match(content("alien-wallet"), /12-word recovery phrase/);
  assert.match(content("monday-refund"), /remote-control app/);
  // Original, more subtle scenarios remain alongside the playful additions.
  for (const id of ["security-reply", "tax-rebate", "shopping-document", "internship-reservation", "scholarship-document", "internship-shortlist", "scholarship-review"])
    assert.ok(bank.some(e => e.id === id));
});
check("1,000 rounds contain the entire bank once, shuffled without mutation", () => {
  const random = seededRandom(), original = bank.map(e => e.id);
  const firstPositions = new Set(), orders = new Set();
  for (let i = 0; i < 1000; i++) {
    const ids = selectQuestions(bank, config, random).map(e => e.id);
    assert.equal(ids.length, 20);
    assert.equal(new Set(ids).size, 20);
    assert.deepEqual([...ids].sort(), [...original].sort());
    firstPositions.add(ids[0]); orders.add(ids.join(","));
  }
  assert.equal(firstPositions.size, 20);
  assert.equal(orders.size, 1000);
  assert.deepEqual(bank.map(e => e.id), original);
});
function play(answered, correct, settings = config) {
  let now = 0;
  const round = new Round(bank, settings, { now: () => now, random: seededRandom() });
  assert.throws(() => round.results());
  assert.equal(round.start(), true);
  assert.equal(round.start(), false);
  for (let i = 0; i < answered; i++) {
    now += 500;
    const email = round.questions[i];
    const answer = i < correct ? email.classification : email.classification === "phishing" ? "legitimate" : "phishing";
    assert.equal(round.answer(email.id, answer), true);
  }
  if (answered < bank.length) { now = settings.roundSeconds * 1000; assert.equal(round.expire(), true); }
  const results = round.results();
  now += 900000;
  assert.deepEqual(round.results(), results, "results and timer are frozen");
  return results;
}
check("all 231 answered/correct combinations use accuracy and progress toward ten answers", () => {
  for (let answered = 0; answered <= 20; answered++) {
    for (let correct = 0; correct <= answered; correct++) {
      const r = play(answered, correct);
      const accuracy = answered ? correct / answered : 0;
      const expected = Math.round(Math.min(answered / 10, 1) * (80 * accuracy + 20) * 10) / 10;
      assert.equal(r.score, expected);
      assert.equal(r.maximum, 100);
      assert.equal(r.answered, answered);
      assert.equal(r.correct, correct);
      assert.equal(r.incorrect, answered - correct);
      assert.equal(r.unanswered, 20 - answered);
      assert.equal(r.accuracy, accuracy);
      assert.equal(r.targetProgress, Math.min(answered / 10, 1));
      assert.equal(r.endReason, answered === 20 ? "completed" : "timeout");
      assert.equal(r.timeUsed, answered === 20 ? 10 : 60);
      assert.equal(r.reviews.filter(review => review.answer === null).length, 20 - answered);
      assert.ok(Number.isFinite(r.score) && r.score >= 0 && r.score <= 100);
    }
  }
  assert.equal(play(0, 0).score, 0);
  assert.equal(play(1, 1).score, 10);
  assert.equal(play(12, 10).score, 86.7);
  assert.equal(play(20, 20).score, 100);
  for (const [n, c, score] of [[5,5,50],[8,8,80],[10,8,84],[10,10,100]]) assert.equal(play(n,c).score,score);
  assert.equal(play(8,8,{...config,targetAnswers:8}).score,100);
  assert.ok(play(10, 10).score > play(20, 10).score, "accuracy has greater weight");
});
check("deadline wins over a click, partial answers retained, clock never reverses", () => {
  let now = 1000;
  const round = new Round(bank, config, { now: () => now });
  const first = round.questions[0];
  assert.equal(round.answer(first.id, first.classification), false);
  round.start();
  assert.equal(round.answer("stale", "phishing"), false);
  assert.equal(round.answer(first.id, "unknown"), false);
  now += 1000;
  assert.equal(round.answer(first.id, first.classification), true);
  assert.equal(round.answer(first.id, first.classification), false);
  now = 60999;
  assert.equal(round.remainingMs(), 1);
  now = 2000;
  assert.equal(round.remainingMs(), 1, "backwards clock cannot restore time");
  now = 61000;
  assert.equal(round.answer(round.questions[1].id, round.questions[1].classification), false);
  assert.equal(round.status, "finished");
  assert.equal(round.results().score, 10);
  assert.equal(round.results().incorrect, 0);
  assert.equal(round.results().unanswered, 19);
  assert.equal(round.results().timeUsed, 60);
});
check("timeout in a sleeping tab and new-player state", () => {
  let now = 0;
  const old = new Round(bank, config, { now: () => now });
  old.start(); now = 500000; old.expire();
  assert.equal(old.results().score, 0);
  assert.equal(old.results().timeUsed, 60);
  const fresh = new Round(bank, config, { now: () => now });
  assert.equal(fresh.status, "ready");
  assert.equal(fresh.index, 0);
  assert.deepEqual(fresh.answers, Array(20).fill(null));
  assert.equal(fresh.remainingMs(), 60000);
});
check("configurable weights and useful validation errors", () => {
  assert.equal(play(10, 10, {...config, accuracyWeight: 70, participationWeight: 30}).score, 100);
  for (const settings of [{targetAnswers:0},{targetAnswers:21},{targetAnswers:1.5},{roundSeconds: 0}, {accuracyWeight: NaN}, {accuracyWeight: 20, participationWeight: 80}, {accuracyWeight: 90}, {participationWeight: -1}])
    assert.throws(() => validateBank(bank, {...config, ...settings}));
  assert.throws(() => validateBank([], config));
  for (const mutate of [
    b => b[1].id = b[0].id,
    b => b[0].classification = "other",
    b => b[0].difficulty = "Extreme",
    b => b.find(e => e.classification === "legitimate").senderEmail = "staff@wrong.example",
    b => b[0].body.find(block => block.type === "link").url = "https://external.invalid/verify",
    b => b[0].indicators[0].text = "missing clue"
  ]) { const broken = structuredClone(bank); mutate(broken); assert.throws(() => validateBank(broken, config)); }
});
console.log(`\n${checks} checks passed.`);
