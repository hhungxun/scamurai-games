/* Station 5 shared bits for phone.html and c.html (the Participant's phone).
 * Round on the phone: { id, token, cards: [board numbers in hunting order], deal: { "<board n>": "<card slug>" },
 *   firstCard: first scanned board number, done: { n: { v, ms, correct, pts, sent } },
 *   started: { n: epoch ms the timer started } }
 * A Verdict stays in `done` with sent:false until the laptop has it; flush() resends it (poor booth Wi-Fi).
 * The board's 25 printed QRs only say a number (c.html?n=16). Which card sits behind a number is dealt
 * fresh by the laptop for every Round, so "16 is always real" can't leak between players.
 */
window.S5 = {
  KEY: 'scamurai.s5.round',
  SECS: 12,
  get() {
    try {
      const r = JSON.parse(localStorage.getItem(this.KEY));
      return r && Number.isInteger(r.id) && typeof r.token === 'string' && Array.isArray(r.cards) && r.done && typeof r.done === 'object' && !Array.isArray(r.done) && r.deal ? r : null;
    } catch { return null; }
  },
  save(r) { try { localStorage.setItem(this.KEY, JSON.stringify(r)); return true; } catch { return false; } },
  // Right: 60 + up to 40 for speed. Wrong call: -100, so tapping FAKE on everything scores far below
  // reading carefully. Time ran out: 0. A Round's total never goes below 0 (S5.total).
  points(correct, ms, v) { return correct ? Math.round(60 + 40 * Math.max(0, Math.min(1, 1 - ms / (this.SECS * 1000)))) : v === 'timeout' ? 0 : -100; },
  total(list) { return Math.max(0, list.reduce((s, g) => s + (g ? g.pts : 0), 0)); },
  next(r) { return r.firstCard && !r.done[r.firstCard] ? r.firstCard : r.cards.find(n => !r.done[n]); },
  // Only accept our printed board QRs. Never navigate to an arbitrary scanned URL.
  boardNumber(raw) {
    try {
      const u = new URL(raw);
      if (![location.origin, 'https://scamurai.physicsxmum.my'].includes(u.origin) ||
          u.pathname !== '/games/scan-me-if-you-can/c.html' || !/^\d{1,2}$/.test(u.searchParams.get('n'))) return null;
      const n = Number(u.searchParams.get('n'));
      return n >= 1 && n <= 25 ? n : null;
    } catch { return null; }
  },
  // Claim the first scanned card once per Round. Scanning never starts a clock: c.html starts it
  // (writes started[n]) only once the site has loaded and its first frame is usable.
  // Also used by c.html so opening a printed QR in the system camera follows the same rules.
  scan(r, n, at = Date.now()) {
    if (!r || !r.deal || !r.cards.includes(n)) return `QR #${n} isn't one of yours. Find QR #${r && r.cards && this.next(r) || '—'}.`;
    if (r.done[n]) return `You already judged QR #${n}. Find QR #${this.next(r) || '—'}.`;
    r.firstCard = r.firstCard || Number(Object.keys(r.started || {}).sort((a, b) => r.started[a] - r.started[b])[0]) || Number(Object.keys(r.done)[0]) || n;
    if (n !== r.firstCard && !r.done[r.firstCard]) return `Finish QR #${r.firstCard} first.`;
    if (!this.save(r)) return 'This browser is blocking game storage. Allow site storage before playing.';
    return null;
  },
  // Warm the next requested site while the Participant is finding its QR.
  warm(r) {
    const n = this.next(r), slug = n && r.deal[n];
    if (slug && window.SimCards) SimCards.load(slug).then(card => SimCards.prefetch(card)).catch(() => {});
  },
  // A device id, so the laptop can tell when two phones joined the same Round.
  dev() { try { let d = localStorage.getItem('scamurai.s5.dev'); if (!d) localStorage.setItem('scamurai.s5.dev', d = Math.random().toString(36).slice(2, 8)); return d; } catch { return '?'; } },
  // 'ok' (the laptop has it), 'over' (Round ended, cancelled or unknown: never retry) or 'fail' (network: retry later).
  async post(r, data) {
    for (let i = 0; i < 4; i++) {
      try {
        const res = await fetch(`/api/rounds/${r.id}/events`, { method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Round-Token': r.token }, body: JSON.stringify({ data: { ...data, dev: this.dev() } }) });
        if (res.ok) return 'ok';
        if (res.status === 409 || res.status === 403 || res.status === 404) return 'over';
      } catch {}
      await new Promise(ok => setTimeout(ok, 800 * (i + 1)));
    }
    return 'fail';
  },
  // Post one Verdict and record that the laptop has it.
  async send(r, n) {
    const d = r.done[n];
    const res = await this.post(r, { t: 'v', n: +n, v: d.v, ms: d.ms });
    const cur = this.get();
    if (res !== 'fail' && cur && cur.id === r.id && cur.done[n]) { cur.done[n].sent = res; this.save(cur); }
    return res;
  },
  // Resend every Verdict the laptop has not confirmed (sent === false). Old rounds saved before this field have none.
  async flush(r) {
    if (!r || !r.done || this._flushing) return;
    this._flushing = true;
    try { for (const n of Object.keys(r.done)) if (r.done[n].sent === false && await this.send(r, n) === 'fail') break; }
    finally { this._flushing = false; }
  },
  // false while the Round is open, else 'ended', 'cancelled' (closed without counting) or 'gone'
  // (the server does not know this Round or token, e.g. a rehearsal database was wiped).
  async ended(r) {
    try {
      const res = await fetch(`/api/rounds/${r.id}/events?after=999999999`, { headers: { 'X-Round-Token': r.token } });
      if (res.status === 403 || res.status === 404) return 'gone';
      const j = await res.json();
      return j.cancelled ? 'cancelled' : j.ended ? 'ended' : false;
    } catch { return false; }
  },
  // Unfinished verdicts still waiting to reach the laptop.
  unsent(r) { return r ? Object.values(r.done || {}).filter(d => d.sent === false).length : 0; },
  // The laptop posts { t: 'deal', cards: { n: slug } } as the Round's first event.
  async fetchDeal(id, token) {
    for (let i = 0; i < 12; i++) {
      try {
        const res = await fetch(`/api/rounds/${id}/events?after=0`, { headers: { 'X-Round-Token': token } });
        if (res.status === 403 || res.status === 404) return { error: 'This Join QR is not valid any more. Ask the Game Master for a new one.' };
        const j = await res.json();
        if (j.ended) return { error: 'This round has already ended. Ask the Game Master for a new one.' };
        const d = (j.events || []).find(e => e.data && e.data.t === 'deal');
        if (d) return { deal: d.data.cards, order: d.data.order };
      } catch {}
      await new Promise(ok => setTimeout(ok, 1000));
    }
    return { error: 'Could not reach the laptop. Check your internet and scan the Join QR again.' };
  },
};
