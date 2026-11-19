/* Original note set and pure round logic shared by the 3D game and Node tests. */
(function (root) {
  'use strict';

  const BANKNOTE_SETS = [
    {
      name: 'Banknote 01',
      frontDay: 'RM50 real.png',
      frontUV:  'RM50 uv real.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back.jpeg',
      isReal: true,
      reason: 'Both sides use the genuine RM50 designs and matching UV patterns.'
    },
    {
      name: 'Banknote 02',
      frontDay: 'RM50 rafflesia.png',
      frontUV:  'RM50 uv rafflesia.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back.jpeg',
      isReal: false,
      reason: 'The Rafflesia front design and its UV pattern differ from the genuine RM50.'
    },
    {
      name: 'Banknote 03',
      frontDay: 'RM50 Malaya Fake.png',
      frontUV:  'RM50 uv malaya.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back.jpeg',
      isReal: false,
      reason: 'The Malaya front print and its UV pattern differ from the genuine RM50.'
    },
    {
      name: 'Banknote 04',
      frontDay: 'RM50 real.png',
      frontUV:  'RM50 uv real.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back.jpeg',
      isReal: true,
      reason: 'The front, back and UV patterns match the genuine RM50.'
    },
    {
      name: 'Banknote 05',
      frontDay: 'RM50 real.png',
      frontUV:  'RM50 uv malaya.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back.jpeg',
      isReal: false,
      reason: 'The front looks genuine in daylight, but its UV pattern is wrong.'
    },
    {
      name: 'Banknote 06',
      frontDay: 'RM50 real.png',
      frontUV:  'RM50 uv fake.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back.jpeg',
      isReal: false,
      reason: 'The front UV pattern does not match a genuine RM50.'
    },
    {
      name: 'Banknote 07',
      frontDay: 'RM50 Malaya Fake.png',
      frontUV:  'RM50 uv real.png',
      backDay:  'RM50 back atom.png',
      backUV:   'uv back fake atom.jpeg',
      isReal: false,
      reason: 'The front has the fake Malaya design and the back has the fake atom design.'
    },
    {
      name: 'Banknote 08',
      frontDay: 'RM50 real.png',
      frontUV:  'RM50 rafflesia.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back fake atom.jpeg',
      isReal: false,
      reason: 'The front UV image shows the Rafflesia design and the back UV uses the fake atom pattern.'
    },
    {
      name: 'Banknote 09',
      frontDay: 'RM50 real.png',
      frontUV:  'RM50 uv real.png',
      backDay:  'RM50 back clear.png',
      backUV:   'uv back.jpeg',
      isReal: true,
      reason: 'Both sides match the genuine RM50 in daylight and under UV.'
    },
    {
      name: 'Banknote 10',
      frontDay: 'RM50 real.png',
      frontUV:  'RM50 uv real.png',
      backDay:  'RM50 back atom.png',
      backUV:   'uv back fake atom.jpeg',
      isReal: false,
      reason: 'The back uses the fake atom design and the wrong UV pattern.'
    }
  ];

  const DURATION_MS = 120_000;
  const NOTE_COUNT = BANKNOTE_SETS.length;
  const POINTS_PER_NOTE = 10;

  function shuffleNotes(random) {
    const order = BANKNOTE_SETS.map((_, index) => index);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
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
        version: 2,
        deadline: this.deadline,
        order: [...this.order],
        answers: [...this.answers],
        status: this.status,
        endReason: this.endReason
      };
    }

    static restore(data, { now = Date.now } = {}) {
      if (data?.version !== 2 || !Number.isFinite(data.deadline)
        || !Array.isArray(data.order) || data.order.length !== NOTE_COUNT
        || new Set(data.order).size !== NOTE_COUNT
        || !data.order.every(id => Number.isInteger(id) && id >= 0 && id < NOTE_COUNT)
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

  const core = { BANKNOTE_SETS, DURATION_MS, NOTE_COUNT, Round };
  if (typeof module === 'object' && module.exports) module.exports = core;
  else root.FakeCashCore = core;
})(globalThis);
