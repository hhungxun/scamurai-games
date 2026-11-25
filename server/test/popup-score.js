'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../games/close-the-popups/browse/booth-score.js'), 'utf8'), sandbox);
const { compute } = sandbox.window.BROWSE_BOOTH_SCORE;
const assessment = met => ({checks: Array.from({length: 10}, (_, i) => ({met: i < met}))});
const ended = (ms, guaranteed = false) => ({status: 'ended', startedAt: 1000, endedAt: 1000 + ms, guaranteed});
function score(met, ms, counts = {}, guaranteed = false) {
  return compute(assessment(met), {counts}, ended(ms, guaranteed));
}
assert.equal(score(0, 0).total, 50);
assert.equal(score(0, 60000, {closed: 1000}).total, 60);
assert.equal(score(1, 30000).task.score, 10);
assert.equal(score(10, 30000).total, 90);
assert.equal(score(10, 30000, {closed: 5}).total, 100);
assert.equal(score(10, 45000, {closed: 5}).total, 94);
assert.equal(score(10, 60000, {closed: 5}).total, 90);
assert.equal(score(5, 30000).total, 65);
assert.equal(score(5, 60000).total, 60);
assert.equal(score(10, 30000, {closed: 1}).resilience.score, 12);
assert.equal(score(10, 30000, {closed: 1, decoys: 1, opened: 1}).resilience.score, 11);
assert.equal(score(10, 30000, {decoys: 1, blocked: 1}).resilience.score, 9);
assert.equal(score(10, 30000, {opened: 1, blocked: 1, native: 1, dodges: 9, revealed: 9}).resilience.score, 10);
assert.equal(score(10, 30000, {closed: 1000}).resilience.score, 20);
assert.equal(score(10, 30000, {decoys: 1000}).resilience.score, 0);
assert.equal(compute({checks: []}, {counts: {}}, ended(1000)).task.score, 0);
assert.equal(compute(assessment(10), null, ended(1000)).total, 80);
assert.equal(compute(assessment(10), null, {...ended(1000), endedAt: 0}).time, null);
for (let ms = 0; ms <= 60000; ms += 1000) {
  let previous = -1;
  for (let met = 0; met <= 10; met++) {
    const value = score(met, ms).total;
    assert.ok(value >= previous && value >= 0 && value <= 100);
    previous = value;
    assert.ok(score(met, ms, {decoys: 1}).total <= value);
    if (ms) assert.ok(value <= score(met, ms - 1000).total);
  }
}
{
  // A valid finished round already has 30 speed points. Exercise the floor
  // separately using missing timing and ad data, and verify it never stacks.
  const noTiming = {status: 'ended', guaranteed: true};
  const none = assessment(0);
  const result = compute(none, null, noTiming);
  assert.equal(result.total, 20);
  assert.equal(result.guaranteed.applied, true);
  assert.equal(compute(none, null, {...noTiming, guaranteed: false}).total, 10);
  assert.equal(compute(none, null, {...noTiming, status: 'void'}).guaranteed.applied, false);
  const alreadyAboveFloor = compute({checks: []}, null, ended(60000, true));
  assert.equal(alreadyAboveFloor.total, 30);
  assert.equal(alreadyAboveFloor.guaranteed.applied, false);
  const normal = score(10, 30000, {closed: 5}, true);
  assert.equal(normal.total, 100);
  assert.equal(normal.guaranteed.done, true);
  assert.equal(normal.guaranteed.applied, false);
}
console.log('PASS: Station 2 40/40/20 scoring with a 30-point speed base, partial credit, popup scoring, and warm-up floor');
