/* Real-photo multi-denomination Malaysian Ringgit note sets (RM5, RM10, RM20, RM50, RM100)
 * with daylight logo/motif/serial forgeries, BNM-authentic UV checks, and Tilt Holograms.
 *
 * server/scripts/build-keys.js loads this file in a VM and combines BANKNOTE_SETS with
 * js/demo-answers.js to build server/private/keys.json. Live event rounds never ship
 * isReal answers to the browser — the server deals order and judges every verdict. */
(function (root) {
  'use strict';

  const noteSet = (denomination, name, nameZh, frontDay, frontUV, backDay, backUV, hologramValid, reason, reasonZh, extra = {}) => ({
    denomination,
    source: 'photo',
    name,
    nameZh,
    frontDay: frontDay + '.jpg',
    frontUV: frontUV + '.jpg',
    backDay: backDay + '.jpg',
    backUV: backUV + '.jpg',
    hologramValid,
    ...extra,
    reason,
    reasonZh
  });

  const BANKNOTE_SETS = [
    // ===== RM50 (Real scans + real UV scans) =====
    noteSet(
      'RM50', 'Genuine RM50 (A)', '真钞 RM50 (A)',
      'front-real', 'front-uv-real', 'back-clear', 'back-uv', true,
      'Genuine RM50: Hibiscus & BANK NEGARA MALAYSIA on front, intact UV fibres & back thread, and shimmering right hologram strip when tilted.',
      '真钞 RM50：正面大红花与 BANK NEGARA MALAYSIA 正确，双面紫外特征清晰，倾斜时右侧全息条呈现金属变色反光。'
    ),
    noteSet(
      'RM50', 'RM50 · Rafflesia front', 'RM50 · 正面大王花假钞',
      'front-rafflesia', 'front-uv-rafflesia', 'back-clear', 'back-uv', false,
      'Counterfeit RM50 (daylight): the front shows a Rafflesia instead of Malaysia’s national Hibiscus (Rafflesia belongs on the back of RM10!).',
      '假钞 RM50（日照破绽）：正面被错印为大王花（大王花属于 RM10 背面，RM50 正面应为大红花），且倾斜全息无变色。'
    ),
    noteSet(
      'RM50', 'RM50 · Malaya spelling', 'RM50 · 银行拼写错误',
      'front-malaya-fake', 'front-uv-malaya', 'back-clear', 'back-uv', false,
      'Counterfeit RM50 (daylight): top lettering reads "BANK NEGARA MALAYA" instead of "BANK NEGARA MALAYSIA".',
      '假钞 RM50（日照破绽）：顶部银行名称错印为“BANK NEGARA MALAYA”（缺少 SI），且全息条无变色。'
    ),
    noteSet(
      'RM50', 'RM50 · Missing back UV thread', 'RM50 · 背面缺紫外安全线',
      'front-real', 'front-uv-real', 'back-clear', 'back-uv-fake-light', true,
      'Counterfeit RM50 (UV): daylight & tilt look convincing, but under UV the glowing 5-block vertical security thread on the back is missing.',
      '假钞 RM50（紫外破绽）：正常光与倾斜反光看似正常，但翻面照射紫外灯时，背面 5 段发光安全线完全缺失。'
    ),
    noteSet(
      'RM50', 'RM50 · Flat fake hologram (Tilt test)', 'RM50 · 倾斜全息失效假钞',
      'front-real', 'front-uv-real', 'back-clear', 'back-uv', false,
      'Counterfeit RM50 (Tilt test): daylight and UV look real, but tilting the note exposes a dead, flat holographic strip with zero colour-shift shimmer.',
      '假钞 RM50（倾斜测试破绽）：正常光线与紫外灯下极具迷惑性，但倾斜钞票时右侧全息条毫无金属变色光泽。'
    ),
    noteSet(
      'RM50', 'RM50 · Missing back molecules', 'RM50 · 背面缺分子图案',
      'front-real', 'front-uv-real', 'back-fake', 'back-uv-fake-atom', false,
      'Counterfeit RM50 (daylight & UV): the back is missing the biotech molecule motif in the centre panel.',
      '假钞 RM50（日照与紫外破绽）：背面中央缺少生物分子图案，且倾斜全息条无变色。'
    ),
    noteSet(
      'RM50', 'Genuine RM50 (B)', '真钞 RM50 (B)',
      'front-real', 'front-uv-real', 'back-clear', 'back-uv', true,
      'Genuine RM50: print motifs, UV fibres, back 5-block UV thread, and tilt hologram colour-shift all check out.',
      '真钞 RM50：双面印刷、正面红蓝防伪纤维、背面 5 段紫外安全线以及倾斜金属全息变色全部合格。'
    ),

    // ===== RM100 (Real scans + daylight fakes + UV + Tilt) =====
    noteSet(
      'RM100', 'Genuine RM100 (Kinabalu)', '真钞 RM100（神山）',
      'rm100-front-real', 'rm100-front-uv-real', 'rm100-back-real', 'rm100-back-uv-real', true,
      'Genuine RM100: authentic purple Mt. Kinabalu & Pinnacles, matching serials (AD9360956), intact BNM Kijang shield, UV glow, and colour-shifting blue thread on tilt.',
      '真钞 RM100：神山与石林图案清晰，双面编号一致（AD9360956），国行鼠鹿徽章完整，紫外与倾斜变色安全线全部合格。'
    ),
    noteSet(
      'RM100', 'RM100 · Rafflesia front & Malaya spelling', 'RM100 · 正面大王花 + 错字假钞',
      'rm100-front-fake', 'rm100-front-uv-fake', 'rm100-back-real', 'rm100-back-uv-real', false,
      'Counterfeit RM100 (daylight): front replaces the Hibiscus with a Rafflesia and misspells "BANK NEGARA MALAYA" instead of "MALAYSIA".',
      '假钞 RM100（日照破绽）：正面大红花被错换为大王花，且顶部错印为“BANK NEGARA MALAYA”。'
    ),
    noteSet(
      'RM100', 'RM100 · Mismatched serial & missing Kijang logo', 'RM100 · 编号不一致 + 缺鼠鹿徽章',
      'rm100-front-real', 'rm100-front-uv-real', 'rm100-back-fake', 'rm100-back-uv-fake', false,
      'Counterfeit RM100 (daylight back): horizontal serial AD9360986 mismatches vertical AD9360956, the top-left BNM Kijang deer logo is erased, and the tilt thread is flat.',
      '假钞 RM100（背面日照破绽）：横向编号 AD9360986 与竖向 AD9360956 不一致，左上角国行鼠鹿徽章空白，且倾斜安全线无变色。'
    ),
    noteSet(
      'RM100', 'RM100 · Flat blue thread (Tilt test)', 'RM100 · 倾斜安全线失效假钞',
      'rm100-front-real', 'rm100-front-uv-real', 'rm100-back-real', 'rm100-back-uv-real', false,
      'Counterfeit RM100 (Tilt test): daylight and UV look genuine, but tilting reveals a dead, flat blue security thread with zero metallic shimmer.',
      '假钞 RM100（倾斜测试破绽）：正常光与紫外特征逼真，但倾斜钞票时正面蓝色安全线与背面金属条毫无变色光泽。'
    ),

    // ===== RM20 (Real scans + daylight fakes + bleached UV + Tilt) =====
    noteSet(
      'RM20', 'Genuine RM20 (Turtles)', '真钞 RM20（海龟）',
      'rm20-front-real', 'rm20-front-uv-real', 'rm20-back-real', 'rm20-back-uv-real', true,
      'Genuine RM20: both Hawksbill & Leatherback turtles on the back, matching serials (AS0907531), Kijang shield intact, RM 20 UV glow, and shimmering green-gold thread.',
      '真钞 RM20：背面两只海龟完整，双面编号一致（AS0907531），鼠鹿徽章完好，紫外显示 RM 20 且倾斜安全线变色明显。'
    ),
    noteSet(
      'RM20', 'RM20 · Missing second turtle & mismatched serial', 'RM20 · 背面缺海龟 + 编号不符',
      'rm20-front-real', 'rm20-front-uv-real', 'rm20-back-fake', 'rm20-back-uv-real', false,
      'Counterfeit RM20 (daylight back): the second sea turtle on the right is missing, the BNM Kijang deer emblem is blank, and serial AS0907539 mismatches AS0907531.',
      '假钞 RM20（背面日照破绽）：右侧第二只海龟消失，左上角鼠鹿徽章空白，且编号 AS0907539 与左侧 AS0907531 不一致。'
    ),
    noteSet(
      'RM20', 'RM20 · Bleached note (Wrong UV value RM 10)', 'RM20 · 漂白改印假钞（紫外显 RM 10）',
      'rm20-front-real', 'rm20-front-uv-bleached', 'rm20-back-real', 'rm20-back-uv-bleached', true,
      'Counterfeit RM20 (UV): classic bleached-note scam — daylight shows RM20, but under UV the watermark and back fluorescent numeral glow "10" / "RM10"!',
      '假钞 RM20（紫外破绽）：典型漂白改印假钞——正常光线下印着 RM20，但紫外灯照射后水印与背面双色荧光面额却浮现“10”！'
    ),

    // ===== RM10 (Real scans + daylight fakes + UV + Tilt) =====
    noteSet(
      'RM10', 'Genuine RM10 (Rafflesia)', '真钞 RM10（大王花）',
      'rm10-front-real', 'rm10-front-uv-real', 'rm10-back-real', 'rm10-back-uv-real', true,
      'Genuine RM10: Hibiscus on front, Rafflesia on back, matching serials (FR4435222), intact Kijang shield, UV features, and shimmering colour-shift thread.',
      '真钞 RM10：正面大红花、背面大王花印刷正确，编号一致（FR4435222），鼠鹿徽章完好，紫外与倾斜全息安全线均正常。'
    ),
    noteSet(
      'RM10', 'RM10 · Wrong front flower & Malaya spelling', 'RM10 · 正面大王花 + 错字假钞',
      'rm10-front-fake', 'rm10-front-uv-fake', 'rm10-back-real', 'rm10-back-uv-real', false,
      'Counterfeit RM10 (daylight): front puts a Rafflesia where the Hibiscus belongs and reads "BANK NEGARA MALAYA" instead of "MALAYSIA".',
      '假钞 RM10（日照破绽）：正面大红花被误换成大王花，且顶部文字错印为“BANK NEGARA MALAYA”。'
    ),
    noteSet(
      'RM10', 'RM10 · Mismatched serial & erased Kijang logo', 'RM10 · 编号不一致 + 缺鼠鹿徽章',
      'rm10-front-real', 'rm10-front-uv-real', 'rm10-back-fake', 'rm10-back-uv-fake', true,
      'Counterfeit RM10 (daylight back & UV): horizontal serial FR4435229 mismatches vertical FR4435222, the BNM Kijang deer shield is blank, and back UV thread is missing.',
      '假钞 RM10（背面破绽）：横向编号 FR4435229 与竖向 FR4435222 不一致，左上角国行鼠鹿徽章空白，且背面紫外安全线缺失。'
    ),

    // ===== RM5 (Real Polymer scans + daylight fakes + UV + Tilt) =====
    noteSet(
      'RM5', 'Genuine RM5 (Polymer Hornbill)', '真钞 RM5（塑料钞·犀鸟）',
      'rm5-front-real', 'rm5-front-uv-real', 'rm5-back-real', 'rm5-back-uv-real', true,
      'Genuine RM5 polymer: clear see-through hornbill window & crescent/star on left, matching serials (AA0015115), Kijang shield intact, UV glow, and iridescent crest on tilt.',
      '真钞 RM5 塑料钞：左侧透明犀鸟视窗与星月徽标清晰，编号一致（AA0015115），鼠鹿徽章完整，紫外与倾斜光泽正常。',
      { clearWindow: true }
    ),
    noteSet(
      'RM5', 'RM5 · Opaque paper window & Malaya spelling', 'RM5 · 视窗不透明 + 错字假钞',
      'rm5-front-fake', 'rm5-front-uv-fake', 'rm5-back-real', 'rm5-back-uv-real', false,
      'Counterfeit RM5 (daylight): printed on plain paper — the clear polymer hornbill window is covered by solid opaque green, the crescent/star is missing, and it reads "BANK NEGARA MALAYA".',
      '假钞 RM5（日照破绽）：普通纸仿印——左侧透明犀鸟视窗变成了实心绿纸，星月徽标消失，且顶部错印为“BANK NEGARA MALAYA”。',
      { clearWindow: false }
    ),
    noteSet(
      'RM5', 'RM5 · Mismatched serial & erased Kijang logo', 'RM5 · 编号不一致 + 缺鼠鹿徽章',
      'rm5-front-real', 'rm5-front-uv-real', 'rm5-back-fake', 'rm5-back-uv-fake', false,
      'Counterfeit RM5 (daylight back & UV): horizontal serial AA0015118 mismatches vertical AA0015115, the top-left BNM Kijang deer shield is blank, and back UV security block is missing.',
      '假钞 RM5（背面破绽）：横向编号 AA0015118 与竖向 AA0015115 不一致，左上角国行鼠鹿徽章空白，且背面双色紫外防伪缺失。',
      { clearWindow: true }
    )
  ];

  // Attach demo-only answers when demo-answers.js is loaded (demo/standalone play only).
  if (Array.isArray(root.FAKECASH_DEMO_ANSWERS)) {
    BANKNOTE_SETS.forEach((s, i) => { s.isReal = root.FAKECASH_DEMO_ANSWERS[i]; });
  }

  const DENOMINATIONS = ['RM5', 'RM10', 'RM20', 'RM50', 'RM100'];
  const DURATION_MS = 120_000;
  const NOTE_COUNT = 10;
  const POINTS_PER_NOTE = 10;
  const SNAPSHOT_VERSION = 6;

  function shuffleArray(arr, random) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Ensures every 10-note demo round features ALL 5 denominations and an even 5-real / 5-fake split.
  function shuffleNotes(random) {
    const reals = [];
    const fakes = [];
    BANKNOTE_SETS.forEach((n, idx) => (n.isReal ? reals : fakes).push(idx));

    const picked = new Set();
    const half = NOTE_COUNT / 2;

    // Pick 1 genuine from each of the 5 denominations (if available) for guaranteed 5-denom coverage
    for (const d of shuffleArray(DENOMINATIONS, random)) {
      if (picked.size >= half) break;
      const dReals = shuffleArray(reals.filter(i => BANKNOTE_SETS[i].denomination === d), random);
      if (dReals.length) picked.add(dReals[0]);
    }
    for (const i of shuffleArray(reals, random)) {
      if (picked.size >= half) break;
      picked.add(i);
    }

    // Pick 5 distinct fakes across as many denominations as possible
    for (const d of shuffleArray(DENOMINATIONS, random)) {
      if (picked.size >= NOTE_COUNT) break;
      const dFakes = shuffleArray(fakes.filter(i => BANKNOTE_SETS[i].denomination === d && !picked.has(i)), random);
      if (dFakes.length) picked.add(dFakes[0]);
    }
    for (const i of shuffleArray(fakes, random)) {
      if (picked.size >= NOTE_COUNT) break;
      picked.add(i);
    }

    return shuffleArray([...picked], random);
  }

  class Round {
    constructor({ now = Date.now, random = Math.random, order = null } = {}) {
      this.now = now;
      this.order = order ? [...order] : shuffleNotes(random);
      this.deadline = now() + DURATION_MS;
      this.answers = [];
      this.verdicts = [];
      this.status = 'playing';
      this.endReason = null;
    }

    get index() { return this.answers.length; }
    get note() { return BANKNOTE_SETS[this.order[this.index]]; }
    get score() { return this.correct * POINTS_PER_NOTE; }
    get correct() { return this.review().filter(item => item.correct).length; }

    _isCorrectAt(i) {
      if (this.verdicts[i] !== undefined) return !!this.verdicts[i];
      const note = BANKNOTE_SETS[this.order[i]];
      return this.answers[i] === note.isReal;
    }

    get streak() {
      let total = 0;
      for (let i = this.index - 1; i >= 0 && this._isCorrectAt(i); i--) {
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
      const ok = choice === note.isReal;
      this.answers.push(choice);
      this.verdicts.push(ok);
      if (this.index === NOTE_COUNT) {
        this.status = 'finished';
        this.endReason = 'complete';
      }
      return { correct: ok, reason: note.reason };
    }

    // Record a verdict judged authoritatively by the event server (deal/answer flow).
    recordAnswer(choice, correct) {
      if (typeof choice !== 'boolean') throw new Error('Invalid verdict');
      if (this.status !== 'playing' || this.expire()) return null;
      const note = this.note;
      this.answers.push(choice);
      this.verdicts.push(correct !== undefined ? !!correct : choice === note.isReal);
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
        const correct = choice !== undefined ? this._isCorrectAt(index) : false;
        return { note, choice, correct };
      });
    }

    snapshot() {
      return {
        version: SNAPSHOT_VERSION,
        deadline: this.deadline,
        order: [...this.order],
        answers: [...this.answers],
        verdicts: [...this.verdicts],
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
        || !data.answers.every(choice => typeof choice === 'boolean')
        || (data.verdicts !== undefined && (!Array.isArray(data.verdicts) || data.verdicts.length !== data.answers.length
          || !data.verdicts.every(v => typeof v === 'boolean')))) {
        throw new Error('Invalid round snapshot');
      }
      const count = data.answers.length;
      const canPlay = data.status === 'playing' && data.endReason === null && count < NOTE_COUNT;
      const completed = data.status === 'finished' && data.endReason === 'complete' && count === NOTE_COUNT;
      const timedOut = data.status === 'finished' && data.endReason === 'time' && count < NOTE_COUNT;
      if (!canPlay && !completed && !timedOut) throw new Error('Invalid round status');
      const round = new Round({ now, order: data.order });
      Object.assign(round, {
        deadline: data.deadline,
        order: [...data.order],
        answers: [...data.answers],
        verdicts: Array.isArray(data.verdicts) ? [...data.verdicts] : [],
        status: data.status,
        endReason: data.endReason
      });
      return round;
    }
  }

  const core = { BANKNOTE_SETS, DENOMINATIONS, DURATION_MS, NOTE_COUNT, SNAPSHOT_VERSION, Round };
  if (typeof module === 'object' && module.exports) module.exports = core;
  else root.FakeCashCore = core;
})(globalThis);
