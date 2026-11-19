/* Pure round state. The booth stores the selected cases, answers and absolute deadline. */
(function (root) {
  'use strict';

  const TOOLS = ['tilt', 'light', 'uv', 'magnifier', 'feel'];
  const DURATION_MS = 60_000;
  const CASE_COUNT = TOOLS.length;
  const DEFECTS = {
    tilt: ['stripe'],
    light: ['watermark', 'register'],
    uv: ['glow', 'motif'],
    magnifier: ['microprint'],
    feel: ['relief']
  };

  function shuffle(values, random) {
    const shuffled = [...values];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function makeCases(random = Math.random) {
    const order = shuffle(TOOLS, random);
    const fakeCount = random() < 0.5 ? 2 : 3;
    const cases = order.map((focus, index) => {
      if (index >= fakeCount) return { focus, faults: [] };
      const faults = shuffle(DEFECTS[focus], random);
      return { focus, faults: faults.slice(0, 1 + Math.floor(random() * faults.length)) };
    });
    return shuffle(cases, random);
  }

  function isVerdict(choice) {
    return choice === 'real' || choice === 'fake';
  }

  function verdict(sample) {
    return sample.faults.length ? 'fake' : 'real';
  }

  class Round {
    constructor({ now = Date.now, random = Math.random, cases = makeCases(random) } = {}) {
      this.now = now;
      this.cases = cases;
      this.deadline = now() + DURATION_MS;
      this.answers = [];
      this.status = 'playing';
      this.endReason = null;
    }

    get index() { return this.answers.length; }
    get correct() {
      return this.answers.filter((choice, index) => verdict(this.cases[index]) === choice).length;
    }
    get score() {
      return Math.max(0, (2 * this.correct - this.index) * 100 / CASE_COUNT);
    }

    remainingMs() {
      return Math.max(0, Math.min(DURATION_MS, this.deadline - this.now()));
    }

    expire() {
      if (this.status !== 'playing' || this.remainingMs() > 0) return false;
      this.status = 'finished';
      this.endReason = 'time';
      return true;
    }

    answer(choice) {
      if (!isVerdict(choice)) throw new Error('Invalid verdict');
      if (this.status !== 'playing' || this.expire()) return null;
      const correct = verdict(this.cases[this.index]) === choice;
      this.answers.push(choice);
      if (this.index === CASE_COUNT) {
        this.status = 'finished';
        this.endReason = 'complete';
      }
      return { correct };
    }

    snapshot() {
      return {
        version: 1,
        deadline: this.deadline,
        cases: this.cases.map(({ focus, faults }) => ({ focus, faults: [...faults] })),
        answers: [...this.answers],
        status: this.status,
        endReason: this.endReason
      };
    }

    static restore(data, { now = Date.now } = {}) {
      if (data?.version !== 1 || !Number.isFinite(data.deadline)
        || !Array.isArray(data.cases) || data.cases.length !== CASE_COUNT
        || !Array.isArray(data.answers) || data.answers.length > CASE_COUNT
        || !data.answers.every(isVerdict)
        || !['playing', 'finished'].includes(data.status)) throw new Error('Invalid saved round');

      const focuses = new Set();
      for (const sample of data.cases) {
        if (!TOOLS.includes(sample?.focus) || focuses.has(sample.focus) || !Array.isArray(sample.faults)
          || new Set(sample.faults).size !== sample.faults.length
          || !sample.faults.every(fault => DEFECTS[sample.focus].includes(fault))) {
          throw new Error('Invalid saved inspection sample');
        }
        focuses.add(sample.focus);
      }
      const fakeCount = data.cases.filter(sample => verdict(sample) === 'fake').length;
      const expectedReason = data.answers.length === CASE_COUNT ? 'complete' : 'time';
      if (fakeCount < 2 || fakeCount > 3
        || (data.status === 'finished' && data.endReason !== expectedReason)
        || (data.status === 'playing' && (data.endReason !== null || data.answers.length === CASE_COUNT))) {
        throw new Error('Inconsistent saved round');
      }

      const { cases, answers, deadline, status, endReason } = data;
      const round = new Round({ now, cases: cases.map(({ focus, faults }) => ({ focus, faults: [...faults] })) });
      Object.assign(round, { answers: [...answers], deadline, status, endReason });
      return round;
    }
  }

  const api = { TOOLS, DURATION_MS, CASE_COUNT, makeCases, verdict, Round };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FakeCashCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
