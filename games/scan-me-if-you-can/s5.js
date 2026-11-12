/* Station 5 shared bits for phone.html and c.html (the Participant's phone). */
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
  async ended(r) {
    try { const j = await fetch(`/api/rounds/${r.id}/events?after=999999999`, { headers: { 'X-Round-Token': r.token } }).then(x => x.json()); return !!j.ended; }
    catch { return false; }
  },
};
