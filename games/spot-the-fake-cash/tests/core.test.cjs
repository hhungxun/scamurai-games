const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { BANKNOTE_SETS, DENOMINATIONS, DURATION_MS, NOTE_COUNT, Round } = require('../js/game-core.js');

// Rebuild the local answer key (as the demo/standalone build does) so tests exercise judging.
const demoWin = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/demo-answers.js'), 'utf8'), { window: demoWin });
BANKNOTE_SETS.forEach((s, i) => { s.isReal = demoWin.FAKECASH_DEMO_ANSWERS[i]; });

test('draws ten distinct notes unpredictably (3-7 genuine, multiple genuine per denom possible)', () => {
  assert.equal(NOTE_COUNT, 10);
  assert.equal(BANKNOTE_SETS.length, 29);
  assert.equal(BANKNOTE_SETS.filter(n => n.isReal).length, 15);
  assert.equal(BANKNOTE_SETS.filter(n => !n.isReal).length, 14);
  for (const d of DENOMINATIONS) {
    assert.equal(BANKNOTE_SETS.filter(n => n.denomination === d && n.isReal).length, 3, `${d} should have 3 genuine entries`);
  }

  let sawMultiRealSameDenom = false;
  const realCounts = new Set();
  for (let trial = 0; trial < 200; trial++) {
    const order = new Round().order;
    assert.equal(order.length, NOTE_COUNT);
    assert.equal(new Set(order).size, NOTE_COUNT);
    assert.ok(order.every(id => id >= 0 && id < BANKNOTE_SETS.length));
    const reals = order.filter(id => BANKNOTE_SETS[id].isReal);
    assert.ok(reals.length >= 3 && reals.length <= 7, `unexpected real count ${reals.length}`);
    realCounts.add(reals.length);
    const byDenom = new Map();
    for (const id of reals) {
      const d = BANKNOTE_SETS[id].denomination;
      byDenom.set(d, (byDenom.get(d) || 0) + 1);
      if (byDenom.get(d) >= 2) sawMultiRealSameDenom = true;
    }
  }
  assert.ok(sawMultiRealSameDenom, 'rounds should allow >=2 genuine notes of the same denomination');
  assert.ok(realCounts.size >= 4, 'real/fake split should vary across rounds to prevent card-counting');
  assert.ok(BANKNOTE_SETS.every(note => note.reason.length > 0 && note.reasonZh.length > 0));
  assert.ok(BANKNOTE_SETS.every(note => note.frontDay && note.frontUV && note.backDay && note.backUV));
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

test('server-dealt order + recordAnswer tracks score, streak and review without client isReal', () => {
  const order = [0, 1, 8, 11, 14, 15, 19, 22, 24, 27];
  const round = new Round({ now: () => 5_000, order });
  assert.deepEqual(round.order, order);
  round.recordAnswer(true, true);
  round.recordAnswer(false, true);
  round.recordAnswer(true, false);
  assert.equal(round.score, 20);
  assert.equal(round.streak, 0);
  const restored = Round.restore(JSON.parse(JSON.stringify(round.snapshot())), { now: () => 9_000 });
  assert.equal(restored.score, 20);
  assert.equal(restored.review()[0].correct, true);
  assert.equal(restored.review()[2].correct, false);
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
