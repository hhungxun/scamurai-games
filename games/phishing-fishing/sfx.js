/* Booth sound effects, synthesised with WebAudio (no files). Presentation only: never affects scoring.
   Muted state is remembered per laptop; any audio failure is silent. */
(function (root) {
  "use strict";
  const KEY = "phishing-fishing.muted";
  let ctx = null, muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch (_) {}
  function ac() {
    if (muted) return null;
    try {
      ctx = ctx || new (root.AudioContext || root.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (_) { return null; }
  }
  function tone(freq, start, dur, { type = "sine", gain = 0.12, to = null } = {}) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + start, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  const sfx = {
    get muted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (_) {} if (!muted) sfx.mail(); return muted; },
    /* Reeling a reported email into the Junk net. */
    reel() { tone(240, 0, 0.18, { type: "triangle", to: 720, gain: 0.1 }); tone(880, 0.16, 0.12, { gain: 0.07 }); },
    /* Releasing a safe email: a soft splash/plop. */
    release() { tone(520, 0, 0.16, { to: 180, gain: 0.11 }); tone(330, 0.08, 0.14, { type: "triangle", to: 140, gain: 0.05 }); },
    /* The next message arriving. */
    mail() { tone(1046, 0, 0.09, { gain: 0.05 }); tone(1568, 0.07, 0.14, { gain: 0.045 }); },
    tick(urgent) { tone(urgent ? 1200 : 900, 0, 0.05, { type: "square", gain: urgent ? 0.035 : 0.02 }); },
    start() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.16, { type: "triangle", gain: 0.08 })); },
    end(good) {
      const notes = good ? [523, 659, 784, 1046] : [392, 330, 262];
      notes.forEach((f, i) => tone(f, i * 0.12, 0.26, { type: "triangle", gain: 0.09 }));
    }
  };
  root.FishingSfx = sfx;
})(window);
