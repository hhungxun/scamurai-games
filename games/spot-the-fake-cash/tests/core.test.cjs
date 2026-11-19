const test = require('node:test');
const assert = require('node:assert/strict');
const { CASE_COUNT, DURATION_MS, TOOLS, Round, makeCases, verdict } = require('../js/game-core.js');

function randomFromSeed(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

test('each shuffled round includes all five tools and two or three fakes', () => {
  const orders = new Set();
  const counts = new Set();
  const sizes = new Set();
  for (let seed = 1; seed <= 90; seed++) {
    const cases = makeCases(randomFromSeed(seed));
    assert.equal(cases.length, CASE_COUNT);
    assert.deepEqual(new Set(cases.map(sample => sample.focus)), new Set(TOOLS));
    orders.add(cases.map(sample => sample.focus).join(','));
    const fakes = cases.filter(sample => verdict(sample) === 'fake');
    counts.add(fakes.length);
    for (const sample of fakes) sizes.add(sample.faults.length);
  }
  assert.ok(orders.size > 1);
  assert.deepEqual(counts, new Set([2, 3]));
  assert.deepEqual(sizes, new Set([1, 2]));
});

test('correct is +20, wrong is −20, unanswered is 0 and the score floors at 0', () => {
  const round = new Round({ now: () => 0 });
  const answerCase = correct => {
    const expected = verdict(round.cases[round.index]);
    return round.answer(correct ? expected : expected === 'real' ? 'fake' : 'real');
  };
  assert.deepEqual(answerCase(false), { correct: false });
  assert.equal(round.score, 0);
  assert.deepEqual(answerCase(true), { correct: true });
  assert.equal(round.score, 0);
  assert.deepEqual(answerCase(true), { correct: true });
  assert.equal(round.score, 20);
  assert.equal(round.status, 'playing');
  assert.throws(() => round.answer('other'), /invalid verdict/i);
});

test('five correct scores 100 and completes the round exactly once', () => {
  const round = new Round({ now: () => 0 });
  for (const sample of round.cases) round.answer(verdict(sample));
  assert.equal(round.score, 100);
  assert.equal(round.endReason, 'complete');
  assert.equal(round.answer('real'), null);
  assert.equal(round.index, CASE_COUNT);
  assert.deepEqual(Round.restore(round.snapshot()).snapshot(), round.snapshot());
});

test('restoring keeps the same cases, answers and deadline', () => {
  let time = 100;
  const now = () => time;
  const round = new Round({ now });
  round.answer(verdict(round.cases[0]));
  time += DURATION_MS - 1;
  const restored = Round.restore(round.snapshot(), { now });
  assert.deepEqual(restored.snapshot(), round.snapshot());
  assert.equal(restored.remainingMs(), 1);
  assert.equal(restored.expire(), false);
  time++;
  assert.equal(restored.answer('real'), null);
  assert.equal(restored.endReason, 'time');
  assert.equal(restored.score, 20);
  assert.equal(restored.expire(), false);
});

test('restore rejects invalid answers, duplicate cases and impossible state', () => {
  const snapshot = new Round().snapshot();
  assert.throws(() => Round.restore({ ...snapshot, answers: ['maybe'] }));
  assert.throws(() => Round.restore({ ...snapshot, cases: Array(5).fill(snapshot.cases[0]) }));
  assert.throws(() => Round.restore({ ...snapshot, status: 'finished', endReason: 'complete' }));
});
