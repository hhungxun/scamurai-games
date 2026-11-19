/* Note sets and pure round logic shared by the 3D game and Node tests. */
(function (root) {
  'use strict';

  const set = (name, frontDay, frontUV, backDay, backUV, isReal, reason) => ({
    name, frontDay: frontDay + '.jpg', frontUV: frontUV + '.jpg', backDay: backDay + '.jpg', backUV: backUV + '.jpg', isReal, reason
  });

  const BANKNOTE_SETS = [
    set('Genuine RM50 (A)', 'front-real', 'front-uv-real', 'back-clear', 'back-uv', true,
      'Both sides use the genuine RM50 designs, and both UV patterns match.'),
    set('Rafflesia front', 'front-rafflesia', 'front-uv-rafflesia', 'back-clear', 'back-uv', false,
      'The front shows a Rafflesia design that is not on the genuine RM50, and its UV pattern is different too.'),
    set('Malaya front', 'front-malaya-fake', 'front-uv-malaya', 'back-clear', 'back-uv', false,
      'The front print uses the fake Malaya design, and its UV pattern does not match the genuine note.'),
    set('Faint back UV', 'front-real', 'front-uv-real', 'back-clear', 'back-uv-fake-light', false,
      'Everything looks genuine in daylight, but the back glows with the wrong, faint UV pattern.'),
    set('Wrong front UV (Malaya)', 'front-real', 'front-uv-malaya', 'back-clear', 'back-uv', false,
      'The front looks genuine in daylight, but under UV it shows the Malaya pattern instead of the real one.'),
    set('Wrong front UV', 'front-real', 'front-uv-fake', 'back-clear', 'back-uv', false,
      'The front looks genuine in daylight, but its UV pattern does not match a genuine RM50.'),
    set('Malaya front, atom back', 'front-malaya-fake', 'front-uv-real', 'back-fake', 'back-uv-fake-atom', false,
      'The front has the fake Malaya design and the back has the fake atom design and UV pattern.'),
    set('Rafflesia UV, atom back UV', 'front-real', 'front-uv-rafflesia', 'back-clear', 'back-uv-fake-atom', false,
      'Both sides look genuine in daylight, but the front UV shows the Rafflesia pattern and the back UV shows the fake atom pattern.'),
    set('Genuine RM50 (B)', 'front-real', 'front-uv-real', 'back-clear', 'back-uv', true,
      'Both sides match the genuine RM50 in daylight and under UV.'),
    set('Atom back', 'front-real', 'front-uv-real', 'back-fake', 'back-uv-fake-light', false,
      'The front is genuine, but the back uses the fake atom design and the wrong UV pattern.'),
    set('Genuine RM50 (C)', 'front-real', 'front-uv-real', 'back-clear', 'back-uv', true,
      'Front, back and both UV patterns all match the genuine RM50.'),
    set('Genuine RM50 (D)', 'front-real', 'front-uv-real', 'back-clear', 'back-uv', true,
      'Every check passes: genuine designs on both sides and the correct UV glow.')
  ];

  const DURATION_MS = 120_000;
  const NOTE_COUNT = 10; // notes per round, drawn at random from the sets above
  const POINTS_PER_NOTE = 10;
  const SNAPSHOT_VERSION = 3;

  function shuffleNotes(random) {
    const order = BANKNOTE_SETS.map((_, index) => index);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order.slice(0, NOTE_COUNT);
  }

  class Round {
    constructor({ now = Date.now, random = Math.random } = {}) {
      this.now = now;
      this.order = shuffleNotes(random);
      this.deadline = now() + DURATION_MS;
      this.answers = [];
      this.status = 'playing';
      this.endReason = null;
    }

    get index() { return this.answers.length; }
    get note() { return BANKNOTE_SETS[this.order[this.index]]; }
    get score() { return this.correct * POINTS_PER_NOTE; }
    get correct() { return this.review().filter(item => item.correct).length; }
    get streak() {
      let total = 0;
      for (let i = this.index - 1; i >= 0 && this.answers[i] === BANKNOTE_SETS[this.order[i]].isReal; i--) {
        total++;
      }
      return total;
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
      if (typeof choice !== 'boolean') throw new Error('Invalid verdict');
      if (this.status !== 'playing' || this.expire()) return null;
      const note = this.note;
      this.answers.push(choice);
      if (this.index === NOTE_COUNT) {
        this.status = 'finished';
        this.endReason = 'complete';
      }
      return { correct: choice === note.isReal, reason: note.reason };
    }

    review() {
      return this.order.map((id, index) => {
        const note = BANKNOTE_SETS[id];
        const choice = this.answers[index];
        return { note, choice, correct: choice === note.isReal };
      });
    }

    snapshot() {
      return {
        version: SNAPSHOT_VERSION,
        deadline: this.deadline,
        order: [...this.order],
        answers: [...this.answers],
        status: this.status,
        endReason: this.endReason
      };
    }

    static restore(data, { now = Date.now } = {}) {
      if (data?.version !== SNAPSHOT_VERSION || !Number.isFinite(data.deadline)
        || !Array.isArray(data.order) || data.order.length !== NOTE_COUNT
        || new Set(data.order).size !== NOTE_COUNT
        || !data.order.every(id => Number.isInteger(id) && id >= 0 && id < BANKNOTE_SETS.length)
        || !Array.isArray(data.answers) || data.answers.length > NOTE_COUNT
        || !data.answers.every(choice => typeof choice === 'boolean')) {
        throw new Error('Invalid round snapshot');
      }
      const count = data.answers.length;
      const canPlay = data.status === 'playing' && data.endReason === null && count < NOTE_COUNT;
      const completed = data.status === 'finished' && data.endReason === 'complete' && count === NOTE_COUNT;
      const timedOut = data.status === 'finished' && data.endReason === 'time' && count < NOTE_COUNT;
      if (!canPlay && !completed && !timedOut) throw new Error('Invalid round status');
      const round = new Round({ now });
      Object.assign(round, { deadline: data.deadline, order: [...data.order], answers: [...data.answers],
        status: data.status, endReason: data.endReason });
      return round;
    }
  }

  const core = { BANKNOTE_SETS, DURATION_MS, NOTE_COUNT, SNAPSHOT_VERSION, Round };
  if (typeof module === 'object' && module.exports) module.exports = core;
  else root.FakeCashCore = core;
})(globalThis);
