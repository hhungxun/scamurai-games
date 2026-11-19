#!/usr/bin/env node
/* Build server/private/keys.json (the answer key) from the game data files.
 *
 *   node scripts/build-keys.js                 read the working tree (needs unstripped data)
 *   node scripts/build-keys.js --ref <git-ref> read the data as it was at <git-ref>
 *   node scripts/build-keys.js --out <file>    write somewhere else
 *
 * The public game files no longer carry answers; this key lives only on the event server. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const REPO = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ref = opt('--ref'), out = path.resolve(opt('--out') || path.join(REPO, 'server', 'private', 'keys.json'));

const FILES = {
  roa: 'games/real-or-ai/data/questions.js',
  cash: 'games/spot-the-fake-cash/js/game-core.js',
  phish: 'games/phishing-fishing/emails.js'
};
function source(rel) {
  return ref ? execFileSync('git', ['show', `${ref}:${rel}`], { cwd: REPO, encoding: 'utf8', maxBuffer: 64e6 }) : fs.readFileSync(path.join(REPO, rel), 'utf8');
}
function run(rel) {
  const win = {}, mod = { exports: {} };
  const ctx = vm.createContext({ window: win, module: mod, console });
  ctx.globalThis = ctx;
  vm.runInContext(source(rel), ctx, { filename: rel });
  return { win, mod: mod.exports, ctx };
}

const roa = run(FILES.roa).win.REAL_OR_AI_QUESTIONS;
const cash = run(FILES.cash).mod.BANKNOTE_SETS;
const phish = run(FILES.phish).mod;

const keys = { version: 1, builtAt: new Date().toISOString(), source: ref || 'working-tree', games: {
  'real-or-ai': { questions: {} },
  'spot-the-fake-cash': { sets: [] },
  'phishing-fishing': { emails: {} }
} };
for (const q of roa) {
  if (!['real', 'ai'].includes(q.answer)) throw new Error(`ROA ${q.id}: no answer in source (already stripped? use --ref)`);
  keys.games['real-or-ai'].questions[q.id] = { answer: q.answer, type: q.type, enabled: q.enabled !== false && !!q.src, demo: !!q.demo, explanation: q.explanation || '', clue: q.clue || '' };
}
for (const s of cash) {
  if (typeof s.isReal !== 'boolean') throw new Error(`Cash ${s.name}: no isReal in source (already stripped? use --ref)`);
  keys.games['spot-the-fake-cash'].sets.push({ isReal: s.isReal, reason: s.reason });
}
for (const e of phish) {
  if (!['phishing', 'legitimate'].includes(e.classification)) throw new Error(`Email ${e.id}: no classification in source (already stripped? use --ref)`);
  keys.games['phishing-fishing'].emails[e.id] = {
    classification: e.classification, difficulty: e.difficulty, explanation: e.explanation, reasoning: e.reasoning,
    indicators: e.indicators, acceptedEvidence: e.acceptedEvidence
  };
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(keys, null, 1), { mode: 0o600 });
const n = k => Object.keys(k).length;
console.log(`keys written to ${out}: ROA ${n(keys.games['real-or-ai'].questions)}, cash ${keys.games['spot-the-fake-cash'].sets.length}, phishing ${n(keys.games['phishing-fishing'].emails)}`);
