/* Station 5 adapter for the shared in-browser QR scanner. */
window.S5Scanner = {
  mount(host) {
    const r = S5.get(), n = r && S5.next(r);
    if (!n) return { stop() {} };
    return ScamuraiScanner.mount(host, {
      title: `Scan QR <span>#${n}</span>`,
      description: r.firstCard && r.done[r.firstCard] ? `The next site's ${S5.SECS} seconds start once it has finished loading.` : 'Allow the camera, then point it at this number on the board. You can start the first site when you are ready.',
      hint: `Point the camera at QR #${n}. Keep the whole code in view.`,
      onCode(raw, at) {
        const number = S5.boardNumber(raw);
        if (!number) return `That is not a Scamurai board QR. Find QR #${n}.`;
        const error = S5.scan(S5.get(), number, at);
        return error || { navigate: `c.html?n=${number}` };
      },
    });
  },
};
