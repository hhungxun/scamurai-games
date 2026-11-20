const assert = require('node:assert/strict');
const { selectQuestions, scoreOf, Round } = require('../js/game-core.js');
const bank = [];
for (let i = 1; i <= 12; i++) bank.push({ id: 'P' + i, type: i % 2 ? 'photo' : 'voice', answer: i % 3 ? 'real' : 'ai', src: 'x' });
for (let i = 1; i <= 6; i++) bank.push({ id: 'A' + i, type: 'photo', answer: 'ai', src: 'x' });
bank.push({ id: 'OFF', type: 'photo', answer: 'ai', src: 'x', enabled: false });
let seed = 7; const random = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
let t = 1000; const now = () => t;

assert.equal(scoreOf(10, 0, 10), 100); assert.equal(scoreOf(7, 3, 10), 40); assert.equal(scoreOf(2, 8, 10), 0); assert.equal(scoreOf(0, 0, 0), 0);
assert.equal(scoreOf(15, 0, 15), 100); assert.equal(scoreOf(8, 2, 15), 40); assert.equal(scoreOf(0, 0, 15), 0);
let q = selectQuestions(bank, 15, random);
assert.equal(q.length, 15); assert.equal(new Set(q.map(x => x.id)).size, 15); assert.ok(!q.some(x => x.id === 'OFF'));
assert.equal(q.filter(x => x.answer === 'real').length, 7);
assert.notDeepEqual(selectQuestions(bank, 15, random).map(x => x.id), q.map(x => x.id));
assert.equal(selectQuestions(bank.slice(0, 4), 15, random).length, 4);

const r = new Round(bank, { now, random }); assert.equal(r.status, 'ready'); assert.equal(r.remainingMs(), 60000);
r.start(); assert.throws(() => r.start());
for (let i = 0; i < 8; i++) r.answer(r.current.answer);
for (let i = 0; i < 2; i++) r.answer(r.current.answer === 'ai' ? 'real' : 'ai');
assert.equal(r.correct, 8); assert.equal(r.wrong, 2); assert.equal(r.score, 40);
t += 20000; assert.equal(r.remainingMs(), 40000);
const back = Round.restore(bank, JSON.parse(JSON.stringify(r.snapshot())), { now }); assert.equal(back.score, 40); assert.equal(back.index, 10);
assert.throws(() => Round.restore(bank, { ...r.snapshot(), version: 9 }, { now }));
assert.throws(() => Round.restore(bank, { ...r.snapshot(), questionIds: ['nope', ...r.snapshot().questionIds.slice(1)] }, { now }));
t += 45000; assert.equal(r.answer('real'), null); assert.equal(r.status, 'finished'); assert.equal(r.endReason, 'time'); assert.equal(r.score, 40);
assert.equal(r.remainingMs(), 0); assert.throws(() => r.answer('real'));
const perfect = new Round(bank, { now, random }); perfect.start(); while (perfect.current) perfect.answer(perfect.current.answer);
assert.equal(perfect.status, 'finished'); assert.equal(perfect.endReason, 'complete'); assert.equal(perfect.score, 100);

// Deal flow: server-dealt questions and server-judged answers recorded via recordAnswer.
const dealt = bank.slice(0, 5);
const dr = new Round(bank, { questions: dealt, now, random });
dr.start();
for (const correct of [true, true, false, true, true]) dr.recordAnswer('real', correct);
assert.equal(dr.status, 'finished'); assert.equal(dr.correct, 4); assert.equal(dr.wrong, 1);
assert.equal(dr.score, scoreOf(4, 1, 5));

console.log('real-or-ai core tests passed');
