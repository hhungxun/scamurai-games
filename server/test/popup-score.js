'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../games/close-the-popups/browse/booth-score.js'), 'utf8'), sandbox);
const { compute } = sandbox.window.BROWSE_BOOTH_SCORE;
function score(met, ms, counts = {}) {
  return compute({checks: Array.from({length: 10}, (_, i) => ({met: i < met}))},
    {counts}, {status: 'ended', startedAt: 1000, endedAt: 1000 + ms});
}
assert.equal(score(0, 0).total, 0);
assert.equal(score(0, 60000, {closed: 1000}).total, 0);
assert.equal(score(10, 30000).total, 100);
assert.equal(score(10, 60000).total, 80);
assert.equal(score(5, 30000).total, 50);
assert.equal(score(10, 30000, {opened: 1}).total, 95);
assert.equal(score(10, 30000, {opened: 1, decoys: 1, closed: 1000}).total, 95);
assert.equal(score(10, 30000, {blocked: 1}).total, 95);
assert.equal(score(10, 30000, {native: 1}).total, 95);
assert.equal(score(10, 30000, {opened: 1000}).total, 80);
assert.equal(compute({checks: []}, {counts: {}}, {status: 'ended', startedAt: 1000, endedAt: 2000}).total, 0);
assert.equal(compute({checks: [{met:true}]}, null, {status: 'ended', startedAt: 1000, endedAt: 2000}).total, 80);
for (let ms = 0; ms <= 60000; ms += 1000) {
  let previous = -1;
  for (let met = 0; met <= 10; met++) {
    const value = score(met, ms).total;
    assert.ok(value >= previous && value >= 0 && value <= 100);
    previous = value;
    assert.ok(score(met, ms, {opened: 1}).total <= value);
    if (ms) assert.ok(value <= score(met, ms - 1000).total);
  }
}
// Guaranteed warm-up floor: 20/100 for a finished round once the warm-up was completed.
{
  const ended = {status: 'ended', startedAt: 1000, endedAt: 1000 + 60000, guaranteed: true};
  const none = {checks: Array.from({length: 10}, () => ({met: false}))};
  const full = {checks: Array.from({length: 10}, () => ({met: true}))};
  assert.strictEqual(compute(none, {counts: {}}, ended).total, 20);
  assert.strictEqual(compute({checks: []}, {counts: {}}, ended).total, 20);
  assert.strictEqual(compute(none, {counts: {opened: 9}}, ended).total, 20);
  assert.strictEqual(compute(none, {counts: {}}, {...ended, guaranteed: false}).total, 0);
  assert.strictEqual(compute(none, {counts: {}}, {...ended, guaranteed: undefined}).total, 0);
  assert.strictEqual(compute(none, {counts: {}}, {...ended, status: 'active'}).total, 0);
  assert.strictEqual(compute(full, {counts: {}}, {...ended, endedAt: 1000 + 10000}).total, 100);
  const high = compute(full, {counts: {}}, {...ended, endedAt: 1000 + 10000});
  assert.strictEqual(high.guaranteed.applied, false);
  assert.strictEqual(compute(none, {counts: {}}, ended).guaranteed.applied, true);
  for (let met = 0; met <= 10; met++) for (const ms of [0, 5000, 30000, 59000, 60000]) {
    const g = compute({checks: Array.from({length: 10}, (_, i) => ({met: i < met}))}, {counts: {opened: 1}}, {...ended, endedAt: 1000 + ms});
    const plain = score(met, ms, {opened: 1});
    assert.ok(g.total >= 20 && g.total <= 100);
    assert.strictEqual(g.total, Math.max(plain.total, 20));
  }
}
console.log('PASS: Station 2 calibration, no-progress zero, unsafe-click deductions, monotonic progress/time, score bounds and guaranteed warm-up floor');
