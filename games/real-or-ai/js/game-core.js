/* Pure round logic for Real or AI? (no DOM). Used by game.js and tests/core.test.cjs. */
(function (root) {
  'use strict';
  const ROUND_QUESTIONS = 15, ROUND_SECONDS = 60, VERSION = 1;

  function shuffle(list, random = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function usable(bank) { return bank.filter(q => q && q.enabled !== false && q.src && ['photo', 'voice'].includes(q.type)); }

  /* Pick up to `count` questions, shuffled, balanced between real/ai and alternating photo/voice where possible. */
  function selectQuestions(bank, count = ROUND_QUESTIONS, random = Math.random) {
    const pool = usable(bank);
    const reals = shuffle(pool.filter(q => q.answer === 'real'), random), ais = shuffle(pool.filter(q => q.answer === 'ai'), random);
    const half = Math.floor(count / 2);
    let picked = [...reals.slice(0, half), ...ais.slice(0, count - half)];
    if (picked.length < Math.min(count, pool.length)) {
      const have = new Set(picked.map(q => q.id));
      picked = picked.concat(shuffle(pool.filter(q => !have.has(q.id)), random)).slice(0, count);
    }
    picked = shuffle(picked, random);
    const photos = picked.filter(q => q.type === 'photo'), voices = picked.filter(q => q.type === 'voice'), out = [];
    let takePhoto = random() < .5;
    while (photos.length || voices.length) {
      const first = takePhoto ? photos : voices, other = takePhoto ? voices : photos;
      out.push(first.length ? first.shift() : other.shift());
      takePhoto = !takePhoto;
    }
    return out;
  }

  /* +1 per correct, -1 per wrong, floor 0, unanswered 0, scaled to 100 over the round size. */
  function scoreOf(correct, wrong, total) {
    if (!total) return 0;
    return Math.round(Math.max(0, (correct - wrong) * 100 / total) * 10) / 10;
  }

  class Round {
    constructor(bank, options = {}) {
      this.now = options.now || (() => Date.now());
      this.seconds = options.seconds || ROUND_SECONDS;
      const random = options.random || Math.random;
      this.questions = options.questions || selectQuestions(bank, options.count || ROUND_QUESTIONS, random);
      this.answers = []; this.status = 'ready'; this.startedAt = null; this.endedAt = null; this.endReason = null;
    }
    get index() { return this.answers.length; }
    get current() { return this.status === 'playing' ? this.questions[this.index] || null : null; }
    get correct() { return this.answers.filter(a => a.correct).length; }
    get wrong() { return this.answers.length - this.correct; }
    get score() { return scoreOf(this.correct, this.wrong, this.questions.length); }
    remainingMs() {
      if (this.status === 'ready') return this.seconds * 1000;
      const end = this.status === 'finished' ? this.endedAt : this.now();
      return Math.max(0, this.seconds * 1000 - (end - this.startedAt));
    }
    start() {
      if (this.status !== 'ready') throw new Error('Round already started.');
      if (!this.questions.length) throw new Error('No questions available.');
      this.status = 'playing'; this.startedAt = this.now();
    }
    expire() { if (this.status === 'playing' && this.remainingMs() <= 0) { this.finish('time'); return true; } return false; }
    answer(choice) {
      if (this.status !== 'playing') throw new Error('Round is not running.');
      if (!['real', 'ai'].includes(choice)) throw new Error('Invalid choice.');
      if (this.expire()) return null;
      const q = this.questions[this.index];
      const result = { id: q.id, choice, correct: choice === q.answer };
      this.answers.push(result);
      if (this.answers.length >= this.questions.length) this.finish('complete');
      return result;
    }
    // Record an answer whose correctness was already judged by the server (deal/answer flow).
    recordAnswer(choice, correct) {
      if (this.status !== 'playing') throw new Error('Round is not running.');
      if (!['real', 'ai'].includes(choice)) throw new Error('Invalid choice.');
      if (this.expire()) return null;
      const q = this.questions[this.index];
      const result = { id: q.id, choice, correct: !!correct };
      this.answers.push(result);
      if (this.answers.length >= this.questions.length) this.finish('complete');
      return result;
    }
    finish(reason) { if (this.status === 'finished') return; this.status = 'finished'; this.endedAt = this.now(); this.endReason = reason; }
    snapshot() {
      return { version: VERSION, seconds: this.seconds, questionIds: this.questions.map(q => q.id), answers: this.answers.map(a => ({ ...a })),
        status: this.status, startedAt: this.startedAt, endedAt: this.endedAt, endReason: this.endReason };
    }
    static restore(bank, data, options = {}) {
      if (!data || data.version !== VERSION || !Array.isArray(data.questionIds) || !data.questionIds.length || new Set(data.questionIds).size !== data.questionIds.length
        || !Array.isArray(data.answers) || data.answers.length > data.questionIds.length || !['ready', 'playing', 'finished'].includes(data.status)
        || !Number.isFinite(data.seconds) || data.seconds <= 0) throw new Error('Saved round is from a different version or is damaged.');
      const questions = data.questionIds.map(id => bank.find(q => q.id === id));
      if (questions.some(q => !q)) throw new Error('Saved round refers to a missing question.');
      const r = new Round(bank, { ...options, questions, seconds: data.seconds });
      r.answers = data.answers.map((a, i) => {
        if (!a || !['real', 'ai'].includes(a.choice)) throw new Error('Invalid saved answers.');
        return { id: questions[i].id, choice: a.choice, correct: a.choice === questions[i].answer };
      });
      r.status = data.status; r.startedAt = data.startedAt; r.endedAt = data.endedAt; r.endReason = data.endReason;
      if (r.status !== 'ready' && !Number.isFinite(r.startedAt)) throw new Error('Invalid saved clock.');
      if (r.status === 'finished' && !Number.isFinite(r.endedAt)) throw new Error('Invalid saved clock.');
      return r;
    }
  }

  const api = { ROUND_QUESTIONS, ROUND_SECONDS, shuffle, usable, selectQuestions, scoreOf, Round };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.RealAiCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
