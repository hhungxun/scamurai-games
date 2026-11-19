// A small synthetic answer key for tests: same shape as server/private/keys.json, none of the real content.
'use strict';
const fs = require('node:fs'), path = require('node:path');

function fixture() {
  const questions = {};
  for (let i = 1; i <= 24; i++) {
    questions[`q${i}`] = { answer: i % 2 ? 'real' : 'ai', type: i % 4 < 2 ? 'photo' : 'voice', enabled: true, demo: false,
      explanation: `why q${i}`, clue: `clue q${i}` };
  }
  const sets = Array.from({ length: 12 }, (_, i) => ({ isReal: i % 2 === 0, reason: `reason ${i}` }));
  const emails = {};
  let n = 0;
  for (const classification of ['phishing', 'legitimate'])
    for (const [difficulty, count] of [['Easy', 4], ['Medium', 4], ['Hard', 2]])
      for (let i = 0; i < count; i++) {
        const id = `e${++n}`;
        emails[id] = { classification, difficulty, explanation: `why ${id}`, reasoning: `reasoning ${id}`, indicators: ['x'], acceptedEvidence: ['y'] };
      }
  return { version: 1, builtAt: 'test', source: 'fixture', games: { 'real-or-ai': { questions }, 'spot-the-fake-cash': { sets }, 'phishing-fishing': { emails } } };
}

function writeFixture(dir) {
  const file = path.join(dir, 'keys.json');
  fs.writeFileSync(file, JSON.stringify(fixture()));
  return file;
}

// The correct and a wrong choice for a question, per game (the fixture's key is what a real one would hold).
function answerFor(game, qid, wantCorrect = true) {
  const k = fixture().games[game];
  const right = game === 'real-or-ai' ? k.questions[qid].answer
    : game === 'spot-the-fake-cash' ? (k.sets[qid].isReal ? 'real' : 'fake')
    : k.emails[qid].classification;
  const other = { real: game === 'spot-the-fake-cash' ? 'fake' : 'ai', ai: 'real', fake: 'real', phishing: 'legitimate', legitimate: 'phishing' };
  return wantCorrect ? right : other[right];
}

module.exports = { fixture, writeFixture, answerFor };
