/* Station 5 shared bits for phone.html and c.html (the Participant's phone).
 * Round on the phone: { id, token, cards: [board numbers in hunting order], deal: { "<board n>": "<card slug>" }, done: { n: verdict } }
 * The board's 25 printed QRs only say a number (c.html?n=16). Which card sits behind a number is dealt
 * fresh by the laptop for every Round, so "16 is always real" can't leak between players. */
window.S5 = {
  KEY: 'scamurai.s5.round',
  SECS: 30,
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || null; } catch { return null; } },
  save(r) { try { localStorage.setItem(this.KEY, JSON.stringify(r)); } catch {} },
  // 60 for a correct Verdict + up to 40 for speed (linear over 30 s). Wrong or timeout: 0.
  points(correct, ms) { return correct ? Math.round(60 + 40 * Math.max(0, 1 - ms / 30000)) : 0; },
  next(r) { return r.cards.find(n => !r.done[n]); },
  async post(r, data) {
    for (let i = 0; i < 4; i++) {
      try {
        const res = await fetch(`/api/rounds/${r.id}/events`, { method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Round-Token': r.token }, body: JSON.stringify({ data }) });
        if (res.ok) return true;
        if (res.status === 409 || res.status === 403) return false;   // round over / wrong round
      } catch {}
      await new Promise(ok => setTimeout(ok, 800 * (i + 1)));
    }
    return false;
  },
  // false while the Round is open, else 'ended' or 'cancelled' (the Game Master closed it without counting).
  async ended(r) {
    try { const j = await fetch(`/api/rounds/${r.id}/events?after=999999999`, { headers: { 'X-Round-Token': r.token } }).then(x => x.json());
      return j.cancelled ? 'cancelled' : j.ended ? 'ended' : false; }
    catch { return false; }
  },
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
