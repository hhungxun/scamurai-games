/* A personal pass opens read-only event progress, never Game Master actions. */
(function () {
  const KEY = 'scamurai.participant.token';
  const ROUND_KEY = 'scamurai.s5.round';
  let inMemoryToken = '';
  window.ScamuraiParticipant = {
    token() { if (inMemoryToken) return inMemoryToken; try { return localStorage.getItem(KEY) || ''; } catch { return ''; } },
    remember(token) { if (!/^[a-f0-9]{64}$/.test(token)) return; inMemoryToken = token; try { localStorage.setItem(KEY, token); } catch { try { localStorage.removeItem(KEY); } catch {} } },
    persistent() { try { return !!this.token() && localStorage.getItem(KEY) === this.token(); } catch { return false; } },
    round() {
      try {
        const r = JSON.parse(localStorage.getItem(ROUND_KEY));
        return r && Number.isInteger(r.id) && typeof r.token === 'string' && Array.isArray(r.cards) && r.done && typeof r.done === 'object' && !Array.isArray(r.done) && r.deal ? r : null;
      } catch { return null; }
    },
    async rememberRound(r) {
      if (!r?.id || !r.token) return;
      const res = await fetch(`/api/rounds/${r.id}/participant`, { headers: { 'X-Round-Token': r.token } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not open your participant page.');
      // A late response for someone else's Round must not replace the newly joined Participant.
      const current = this.round();
      if (!current || current.id !== r.id || current.token !== r.token) return;
      this.remember(data.participantToken);
      current.participantId = data.id;
      try { localStorage.setItem(ROUND_KEY, JSON.stringify(current)); } catch {}
      return data;
    },
  };
  addEventListener('storage', e => { if (e.key === KEY) inMemoryToken = ''; });
})();
