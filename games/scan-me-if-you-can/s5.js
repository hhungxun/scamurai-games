/* Station 5 shared bits for phone.html and c.html (the Participant's phone).
 * Round on the phone: { id, token, cards: [board numbers in hunting order], deal: { "<board n>": "<card slug>" },
 *   done: { n: { v, ms, correct, pts, sent } }, started: { n: epoch ms the timer started } }
 * A Verdict stays in `done` with sent:false until the laptop has it; flush() resends it (poor booth Wi-Fi).
 * The board's 25 printed QRs only say a number (c.html?n=16). Which card sits behind a number is dealt
 * fresh by the laptop for every Round, so "16 is always real" can't leak between players.
 */
window.S5 = {
  KEY: 'scamurai.s5.round',
  SECS: 30,
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || null; } catch { return null; } },
  save(r) { try { localStorage.setItem(this.KEY, JSON.stringify(r)); } catch {} },
  // 60 for a correct Verdict + up to 40 for speed (linear over 30 s). Wrong or timeout: 0.
  // Right: 60 + up to 40 for speed. Wrong call: -100, so tapping FAKE on everything scores far below
  // reading carefully. Time ran out: 0. A Round's total never goes below 0 (S5.total).
  points(correct, ms, v) { return correct ? Math.round(60 + 40 * Math.max(0, 1 - ms / 30000)) : v === 'timeout' ? 0 : -100; },
  total(list) { return Math.max(0, list.reduce((s, g) => s + (g ? g.pts : 0), 0)); },
  next(r) { return r.cards.find(n => !r.done[n]); },
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
