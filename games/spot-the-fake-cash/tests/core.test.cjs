const test = require('node:test');
const assert = require('node:assert/strict');
const { BANKNOTE_SETS, DURATION_MS, NOTE_COUNT, Round } = require('../js/game-core.js');

test('draws ten distinct notes from the twelve sets, with labels and review clues', () => {
  const round = new Round({ random: () => 0 });
  assert.deepEqual(round.order, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(NOTE_COUNT, 10);
  assert.equal(BANKNOTE_SETS.length, 12);
  assert.deepEqual(BANKNOTE_SETS.map(note => note.isReal), [
    true, false, false, false, false, false, false, false, true, false, true, true
  ]);
  for (const seed of [0, 0.3, 0.7, 0.999]) {
    const order = new Round({ random: () => seed }).order;
    assert.equal(new Set(order).size, NOTE_COUNT);
    assert.ok(order.every(id => id >= 0 && id < BANKNOTE_SETS.length));
  }
  assert.ok(BANKNOTE_SETS.every(note => note.reason.length > 0));
});

test('scores ten points per correct answer and closes the round after the tenth verdict', () => {
  const round = new Round({ now: () => 0 });
  for (let i = 0; i < NOTE_COUNT; i++) {
    const { isReal, reason } = round.note;
    assert.deepEqual(round.answer(isReal), { correct: true, reason });
    assert.equal(round.score, (i + 1) * 10);
  }
  assert.equal(round.status, 'finished');
  assert.equal(round.endReason, 'complete');
  assert.equal(round.streak, 10);
  assert.equal(round.answer(false), null);
  assert.equal(round.score, 100);
});

test('wrong and unjudged notes earn zero and a wrong answer resets the streak', () => {
  let now = 10_000;
  const round = new Round({ now: () => now });
  round.answer(round.note.isReal);
  assert.equal(round.streak, 1);
  round.answer(!round.note.isReal);
  assert.equal(round.streak, 0);
  assert.equal(round.score, 10);
  now += DURATION_MS - 1;
  assert.equal(round.expire(), false);
  now++;
  assert.equal(round.answer(round.note.isReal), null);
  assert.equal(round.remainingMs(), 0);
  assert.equal(round.endReason, 'time');
  assert.equal(round.score, 10);
  const [first, second, ...unjudged] = round.review();
  assert.equal(first.correct, true);
  assert.equal(second.correct, false);
  assert.ok(unjudged.every(item => item.choice === undefined && !item.correct));
});

test('restoring preserves the shuffled order, verdicts and original deadline', () => {
  let now = 10_000;
  const round = new Round({ now: () => now });
  round.answer(round.note.isReal);
  const snapshot = JSON.parse(JSON.stringify(round.snapshot()));
  now += 4_000;
  const restored = Round.restore(snapshot, { now: () => now });
  assert.equal(restored.score, 10);
  assert.equal(restored.remainingMs(), DURATION_MS - 4_000);
  assert.equal(restored.note, round.note);
  assert.deepEqual(restored.snapshot(), snapshot);
  assert.throws(() => Round.restore({ ...snapshot, order: Array(10).fill(0) }), /Invalid/);
  assert.throws(() => Round.restore({ ...snapshot, status: 'finished' }), /Invalid/);
});
