'use strict';
// Server-side deals, verdicts and scores for the three question games.
// The browser never receives the answer key: it asks for a deal (ids only), submits one answer at a time,
// and the score at /finish is computed here from the stored answers, never from numbers the client sends.
const STATION_GAME = { 1: 'spot-the-fake-cash', 3: 'phishing-fishing', 4: 'real-or-ai' };
const GRACE_MS = 10_000;                 // network slack on top of each game's own timer
const ROUND_QUESTIONS = 10;
const DURATION_MS = { 'real-or-ai': 60_000, 'spot-the-fake-cash': 120_000, 'phishing-fishing': 60_000 };
const CHOICES = {
  'real-or-ai': ['real', 'ai'],
  'spot-the-fake-cash': ['real', 'fake'],
  'phishing-fishing': ['phishing', 'legitimate'],
};

function shuffle(items, random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- deals: return the list of question ids (strings or set indices) a Round will ask -----------------
const dealers = {
  'real-or-ai'(keys, random) {
    const pool = Object.entries(keys.questions)
      .filter(([, q]) => q.enabled !== false && ['real', 'ai'].includes(q.answer) && ['photo', 'voice'].includes(q.type))
      .map(([id, q]) => ({ id, ...q }));
    const half = ROUND_QUESTIONS / 2;
    const reals = shuffle(pool.filter(q => q.answer === 'real'), random);
    const ais = shuffle(pool.filter(q => q.answer === 'ai'), random);
    const picked = [...reals.slice(0, half), ...ais.slice(0, half)];
    const rest = shuffle([...reals.slice(half), ...ais.slice(half)], random);
    while (picked.length < ROUND_QUESTIONS && rest.length) picked.push(rest.shift());
    const mixed = shuffle(picked, random);
    // alternate photo / voice from a random start, as the offline game does
    const byType = { photo: mixed.filter(q => q.type === 'photo'), voice: mixed.filter(q => q.type === 'voice') };
    let want = random() < 0.5 ? 'photo' : 'voice';
    const out = [];
    while (out.length < mixed.length) {
      const other = want === 'photo' ? 'voice' : 'photo';
      const next = byType[want].shift() || byType[other].shift();
      if (!next) break;
      out.push(next.id);
      want = want === 'photo' ? 'voice' : 'photo';
    }
    return out;
  },
  'spot-the-fake-cash'(keys, random) {
    // Even real/fake split so blind guessing scores 50%, mirroring the offline deal.
    const pool = keys.sets.map((set, i) => ({ i, isReal: set.isReal }));
    const half = ROUND_QUESTIONS / 2;
    const pick = want => shuffle(pool.filter(q => q.isReal === want), random).slice(0, half).map(q => q.i);
    return shuffle([...pick(true), ...pick(false)], random);
  },
  'phishing-fishing'(keys, random) {
    const emails = Object.entries(keys.emails).map(([id, e]) => ({ id, ...e }));
    const ids = ['phishing', 'legitimate'].flatMap(kind =>
      ['Easy', 'Medium', 'Hard'].flatMap((difficulty, i) =>
        shuffle(emails.filter(e => e.classification === kind && e.difficulty === difficulty), random)
          .slice(0, i === 2 ? 1 : 2)));
    return shuffle(ids, random).map(e => e.id);
  },
};

// ---- verdicts: is `choice` right for question `qid`, plus what to show the player straight away -------
const judges = {
  'real-or-ai'(keys, qid, choice) {
    const q = keys.questions[qid];
    return { correct: choice === q.answer, reveal: { answer: q.answer, clue: q.clue || '', explanation: q.explanation || '' } };
  },
  'spot-the-fake-cash'(keys, qid, choice) {
    const s = keys.sets[qid];
    const answer = s.isReal ? 'real' : 'fake';
    return { correct: choice === answer, reveal: { answer, reason: s.reason || '' } };
  },
  'phishing-fishing'(keys, qid, choice) {
    // The verdict is withheld until the Round ends (GET /review): a live "right/wrong" would leak the key.
    return { correct: choice === keys.emails[qid].classification, reveal: null };
  },
};

const maxOf = () => 100;
function scoreOf(game, deal, answers, keys) {
  let correct = 0, wrong = 0;
  for (const qid of deal) {
    const a = answers[qid];
    if (a == null) continue;
    if (judges[game](keys.games[game], qid, a).correct) correct++; else wrong++;
  }
  if (game === 'real-or-ai') return { correct, wrong, score: Math.round(Math.max(0, (correct - wrong) * 100 / deal.length) * 10) / 10 };
  return { correct, wrong, score: correct * 10 };
}

function reviewOf(game, deal, answers, keys) {
  if (game !== 'phishing-fishing') return null;
  return deal.map(qid => {
    const e = keys.games[game].emails[qid];
    const choice = answers[qid] ?? null;
    return { id: qid, classification: e.classification, explanation: e.explanation, reasoning: e.reasoning,
      indicators: e.indicators, acceptedEvidence: e.acceptedEvidence, choice, correct: choice === e.classification };
  });
}

module.exports = { STATION_GAME, GRACE_MS, DURATION_MS, CHOICES, dealers, judges, scoreOf, reviewOf, maxOf, shuffle };
