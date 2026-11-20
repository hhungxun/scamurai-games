/* Note sets and pure round logic shared by the game and Node tests.
 *
 * Six Malaysian ringgit denominations, three sets each (genuine / mismatched
 * sides / UV defect) = eighteen sets, using the real BNM note images in
 * assets/notes/. `defects` describes the UV overlay that js/game.js draws.
 *
 * server/scripts/build-keys.js loads this file in a VM and reads
 * module.exports.BANKNOTE_SETS (isReal + reason) to build the private answer
 * key, so the data stays in this one file and the key is never shipped here.
 */
(function (root) {
  'use strict';

  const note = (id, denomination, name, nameZh, front, back, defects, reason, reasonZh) => ({
    id,
    denomination,
    name,
    nameZh,
    front,
    back,
    defects: defects || [],
    reason,
    reasonZh,
  });

  const BANKNOTE_SETS = [
    // ── Genuine (one per denomination) ────────────────────────────────────
    note('rm1', 'RM1', 'Genuine RM1', '真钞 RM1', 'RM1-f.png', 'RM1-b.png', [],
      'Front, back, watermark, security thread and UV pattern all match a genuine RM1.',
      '正反面、水印、安全线及紫外荧光图案均与真钞 RM1 一致。'),
    note('rm5', 'RM5', 'Genuine RM5', '真钞 RM5', 'RM5-f.png', 'RM5-b.png', [],
      'Front, back, watermark, security thread and UV pattern all match a genuine RM5.',
      '正反面、水印、安全线及紫外荧光图案均与真钞 RM5 一致。'),
    note('rm10', 'RM10', 'Genuine RM10', '真钞 RM10', 'RM10-f.png', 'RM10-bk.png', [],
      'Front, back, watermark, security thread and UV pattern all match a genuine RM10.',
      '正反面、水印、安全线及紫外荧光图案均与真钞 RM10 一致。'),
    note('rm20', 'RM20', 'Genuine RM20', '真钞 RM20', 'RM20-f.png', 'RM20-b.png', [],
      'Front, back, watermark, security thread and UV pattern all match a genuine RM20.',
      '正反面、水印、安全线及紫外荧光图案均与真钞 RM20 一致。'),
    note('rm50', 'RM50', 'Genuine RM50', '真钞 RM50', 'RM50-f.png', 'RM50-b.png', [],
      'Front, back, watermark, security thread and UV pattern all match a genuine RM50.',
      '正反面、水印、安全线及紫外荧光图案均与真钞 RM50 一致。'),
    note('rm100', 'RM100', 'Genuine RM100', '真钞 RM100', 'RM100-f.png', 'RM100-b.png', [],
      'Front, back, watermark, security thread and UV pattern all match a genuine RM100.',
      '正反面、水印、安全线及紫外荧光图案均与真钞 RM100 一致。'),

    // ── Mismatched sides (front from a different denomination) ────────────
    note('rm1-mismatch', 'RM1', 'RM1 with an RM5 front', '正反面错配的 RM1', 'RM5-f.png', 'RM1-b.png', [],
      'The back is a genuine RM1, but the front is the RM5 design — the two sides of a real note always match.',
      '背面是真实的 RM1，但正面却是 RM5 的图案——真钞的两面一定是一致的。'),
    note('rm5-mismatch', 'RM5', 'RM5 with an RM10 front', '正反面错配的 RM5', 'RM10-f.png', 'RM5-b.png', [],
      'The back is a genuine RM5, but the front is the RM10 design — a real RM5 never pairs with that face.',
      '背面是真实的 RM5，但正面却是 RM10 的图案——真钞 RM5 绝不会搭配这样的正面。'),
    note('rm10-mismatch', 'RM10', 'RM10 with an RM20 front', '正反面错配的 RM10', 'RM20-f.png', 'RM10-bk.png', [],
      'The back is a genuine RM10, but the front is the RM20 design — the two sides do not match.',
      '背面是真实的 RM10，但正面却是 RM20 的图案——两面并不一致。'),
    note('rm20-mismatch', 'RM20', 'RM20 with an RM50 front', '正反面错配的 RM20', 'RM50-f.png', 'RM20-b.png', [],
      'The back is a genuine RM20, but the front is the RM50 design — a real RM20 has a different face.',
      '背面是真实的 RM20，但正面却是 RM50 的图案——真钞 RM20 的正面与此不同。'),
    note('rm50-mismatch', 'RM50', 'RM50 with an RM10 front', '正反面错配的 RM50', 'RM10-f.png', 'RM50-b.png', [],
      'The back is a genuine RM50, but the front is the RM10 design — the two sides do not match.',
      '背面是真实的 RM50，但正面却是 RM10 的图案——两面并不一致。'),
    note('rm100-mismatch', 'RM100', 'RM100 with an RM20 front', '正反面错配的 RM100', 'RM20-f.png', 'RM100-b.png', [],
      'The back is a genuine RM100, but the front is the RM20 design — a real RM100 has its own face.',
      '背面是真实的 RM100，但正面却是 RM20 的图案——真钞 RM100 的正面与此不同。'),

    // ── UV defects (correct daylight images, a broken UV feature) ─────────
    note('rm1-no-thread', 'RM1', 'RM1 missing the UV thread', '缺安全线的 RM1', 'RM1-f.png', 'RM1-b.png', [{ feature: 'thread', how: 'missing' }],
      'Looks genuine in daylight, but under UV the vertical security thread is missing — a genuine RM1 glows a continuous thread.',
      '日光下看似真钞，但紫外线下竖排安全线缺失——真钞 RM1 应有一条连续发光的安全线。'),
    note('rm5-numeral', 'RM5', 'RM5 with the wrong UV numeral', '紫外面额错误的 RM5', 'RM5-f.png', 'RM5-b.png', [{ feature: 'numeral', how: 'value', value: '1' }],
      'Under UV the glowing denomination reads “1” instead of “5” — the wrong value is a classic counterfeit slip.',
      '紫外线下发光的面额数字是“1”而非“5”——面额错误是典型的假钞破绽。'),
    note('rm10-flat', 'RM10', 'RM10 photocopy with no UV glow', '无荧光的 RM10 复印品', 'RM10-f.png', 'RM10-bk.png', [{ feature: 'all', how: 'none' }],
      'Under UV the note stays dark with no fluorescence — a genuine RM10 glows bright patterns, but a photocopy does not.',
      '紫外线下整张钞票一片漆黑、毫无荧光——真钞 RM10 会发出明亮荧光，复印品则不会。'),
    note('rm20-no-thread', 'RM20', 'RM20 missing the UV thread', '缺安全线的 RM20', 'RM20-f.png', 'RM20-b.png', [{ feature: 'thread', how: 'missing' }],
      'Daylight looks right, but under UV the security thread is absent — a genuine RM20 carries a glowing vertical thread.',
      '日光下正常，但紫外线下安全线缺失——真钞 RM20 应有一条发光的竖排安全线。'),
    note('rm50-crest', 'RM50', 'RM50 with a copy-mark crest', '徽记被替换的 RM50', 'RM50-f.png', 'RM50-b.png', [{ feature: 'crest', how: 'copy' }],
      'Under UV the crest is replaced by a ✕ mark — a genuine RM50 glows the proper crest, never a copy stamp.',
      '紫外线下徽记被 ✕ 标记取代——真钞 RM50 应显示正确徽记，绝不会出现复印标记。'),
    note('rm100-numeral', 'RM100', 'RM100 with the wrong UV numeral', '紫外面额错误的 RM100', 'RM100-f.png', 'RM100-b.png', [{ feature: 'numeral', how: 'value', value: '50' }],
      'Under UV the glowing denomination reads “50” instead of “100” — a wrong denomination under UV is a clear fake.',
      '紫外线下发光的面额数字是“50”而非“100”——紫外下的面额错误是明显的假钞特征。'),
  ];

  const DURATION_MS = 120_000;
  const NOTE_COUNT = 10; // notes per round, split evenly between real and fake
  const POINTS_PER_NOTE = 10;
  const SNAPSHOT_VERSION = 3;

  function shuffleInPlace(items, random) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  // Draw an even real/fake split so the notes carry the test, not the odds:
  // guessing one verdict blindly scores 50%, never more.
  function shuffleNotes(random) {
    const reals = [], fakes = [];
    BANKNOTE_SETS.forEach((set, index) => (set.isReal ? reals : fakes).push(index));
    const half = NOTE_COUNT / 2;
    const pick = pool => shuffleInPlace([...pool], random).slice(0, Math.min(half, pool.length));
    return shuffleInPlace([...pick(reals), ...pick(fakes)], random);
  }

  class Round {
    constructor({ now = Date.now, random = Math.random, order = null } = {}) {
      this.now = now;
      this.order = order || shuffleNotes(random);
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

    // Record a verdict already judged by the server (deal/answer flow). Returns the note that was judged.
    recordAnswer(choice) {
      if (typeof choice !== 'boolean') throw new Error('Invalid verdict');
      if (this.status !== 'playing' || this.expire()) return null;
      const note = this.note;
      this.answers.push(choice);
      if (this.index === NOTE_COUNT) {
        this.status = 'finished';
        this.endReason = 'complete';
      }
      return note;
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
        endReason: this.endReason,
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
