/* In-game board QR scanner. Camera frames stay on this device.
 * Native BarcodeDetector where available; vendored jsQR 1.4.0 for Safari and Firefox.
 */
window.S5Scanner = {
  mount(host) {
    const r = S5.get(), n = r && S5.next(r);
    if (!n) return { stop() {} };
    host.innerHTML = `<section class="box scanner" aria-label="Board QR scanner">
      <h2>Scan QR <span>#${n}</span></h2>
      <p class="muted">${r.firstCard && r.done[r.firstCard] ? `The next site starts its ${S5.SECS} seconds as soon as you scan.` : 'Allow the camera, then point it at this number on the board. You can start the first site when you are ready.'}</p>
      <div class="scanner-view"><video autoplay muted playsinline aria-label="Live camera for QR scanning"></video><div class="scanner-guide" aria-hidden="true"></div></div>
      <p class="muted scanner-status" role="status" aria-live="polite">Requesting camera access…</p>
      <button class="btn scanner-retry" hidden>Enable camera</button>
    </section>`;
    const video = host.querySelector('video'), status = host.querySelector('.scanner-status'), retry = host.querySelector('.scanner-retry');
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
    let stream = null, detector = null, timer = null, disposed = false, epoch = 0;
    function pause() {
      epoch++; clearTimeout(timer);
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = null; video.srcObject = null;
    }
    function stop() {
      disposed = true; pause();
      removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', visibility);
    }
    function accept(raw) {
      const number = S5.boardNumber(raw);
      if (!number) { status.textContent = `That is not a Scamurai board QR. Find QR #${n}.`; return false; }
      const error = S5.scan(S5.get(), number);
      if (error) { status.textContent = error; return false; }
      stop();
      location.assign(new URL(`c.html?n=${number}`, location.href));
      return true;
    }
    async function frame(rev) {
      if (disposed || rev !== epoch) return;
      try {
        if (video.readyState >= 2 && video.videoWidth) {
          let raw;
          if (detector) {
            try { raw = (await detector.detect(video))[0]?.rawValue; }
            catch { detector = null; }   // a broken native implementation falls back on the next frame
          } else {
            const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
            canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            raw = window.jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' })?.data;
          }
          if (disposed || rev !== epoch) return;
          if (raw && accept(raw)) return;
        }
      } catch {
        pause(); status.textContent = 'Could not read the camera. Tap Enable camera to try again.'; retry.hidden = false;
        return;
      }
      timer = setTimeout(() => frame(rev), 150);
    }
    async function start() {
      if (disposed || !host.isConnected || document.hidden) return;
      pause(); const rev = epoch;
      retry.hidden = true; status.textContent = 'Requesting camera access…';
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unavailable');
        const camera = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
        if (disposed || rev !== epoch) { camera.getTracks().forEach(t => t.stop()); return; }
        stream = camera; video.srcObject = stream;
        await video.play();
        if (disposed || rev !== epoch) return;
        try {
          if (window.BarcodeDetector && (await BarcodeDetector.getSupportedFormats()).includes('qr_code')) detector = new BarcodeDetector({ formats: ['qr_code'] });
        } catch { detector = null; }
        if (disposed || rev !== epoch) return;
        status.textContent = `Point the camera at QR #${n}. Keep the whole code in view.`;
        frame(rev);
      } catch (e) {
        if (disposed || rev !== epoch) return;
        pause(); retry.hidden = false;
        status.textContent = e.name === 'NotAllowedError'
          ? 'Camera access is blocked. Allow camera access for this site in your browser settings, then tap Enable camera.'
          : e.name === 'NotFoundError' ? 'No camera found. Open your Join QR on a phone with a camera.'
          : 'Could not open the camera. Close other camera apps and tap Enable camera. Use HTTPS or localhost.';
      }
    }
    function visibility() { if (document.hidden) pause(); else start(); }
    retry.onclick = start;
    addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', visibility);
    start();
    return { stop };
  },
};
