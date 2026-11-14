#!/usr/bin/env python3
"""Local-only phone/scanner integration tests. Requires playwright, qrcode and Pillow.

Uses real QR pixels on a canvas camera stream (not stubbed QR decode results),
a throwaway backend, and Chromium. No live Participants or Rounds are modified.
Run: python3 games/scan-me-if-you-can/tools/e2e_phone.py
"""
import base64
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
import urllib.request

import qrcode
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
BASE = 'http://127.0.0.1:3042'
GAME = BASE + '/games/scan-me-if-you-can/'


def api(path, data, headers):
    req = urllib.request.Request(BASE + path, data=json.dumps(data).encode(),
                                 headers={'Content-Type': 'application/json', **headers})
    with urllib.request.urlopen(req) as response:
        return json.load(response)


def qr(raw):
    image = qrcode.make(raw).convert('RGB')
    out = io.BytesIO()
    image.save(out, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(out.getvalue()).decode()


CAMERA = """() => {
  if (!navigator.mediaDevices) return; // about:blank has no camera API
  window.BarcodeDetector = undefined; // exercise the bundled decoder used on Safari/Firefox
  navigator.mediaDevices.getUserMedia = async constraints => {
    localStorage.setItem('test.requests', String(+(localStorage.getItem('test.requests') || 0) + 1));
    localStorage.setItem('test.constraints', JSON.stringify(constraints));
    if (localStorage.getItem('test.permission') === 'deny') throw new DOMException('denied', 'NotAllowedError');
    const c = document.createElement('canvas'); c.width = 640; c.height = 640;
    const ctx = c.getContext('2d');
    let previous = '', image = null;
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 640, 640);
    const draw = () => {
      const raw = localStorage.getItem('test.qr') || '';
      if (raw !== previous) {
        previous = raw; image = null;
        if (raw) { const im = new Image(); im.onload = () => { if (raw === previous) image = im; }; im.src = raw; }
      }
      ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 640, 640);
      if (image) ctx.drawImage(image, 70, 70, 500, 500);
    };
    const timer = setInterval(draw, 80), stream = c.captureStream(15);
    for (const track of stream.getTracks()) {
      const stop = track.stop.bind(track);
      track.stop = () => { clearInterval(timer); localStorage.setItem('test.stops', String(+(localStorage.getItem('test.stops') || 0) + 1)); stop(); };
    }
    window.testStream = stream;
    return stream;
  };
}"""


def run():
    with tempfile.TemporaryDirectory(prefix='scamurai-scanner-') as data:
        env = dict(os.environ, PORT='3042', DATA_DIR=data, STAFF_PIN='1111', ADMIN_PIN='9999', STATION_PINS='5:5005')
        server = subprocess.Popen(['node', 'server.js'], cwd=ROOT / 'server', env=env,
                                  stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        try:
            for _ in range(80):
                try:
                    urllib.request.urlopen(BASE + '/api/leaderboard', timeout=1).close()
                    break
                except OSError:
                    time.sleep(0.1)
            api('/api/participants', {'id': 'SCAN001', 'name': 'Scanner Test', 'ageGroup': '19–21',
                                    'pbbAccount': False, 'scamExposure': 'no', 'consent': True}, {'X-Pin': '1111'})
            round_ = api('/api/rounds', {'participantId': 'SCAN001'}, {'X-Pin': '5005'})
            manifest = (ROOT / 'games/scan-me-if-you-can/cards/manifest.js').read_text()
            slugs = re.findall(r"slug: '([^']+)'", manifest)[:8]
            deal = {str(i + 1): slug for i, slug in enumerate(slugs)}
            rid, token = round_['roundId'], round_['token']
            api(f'/api/rounds/{rid}/events', {'data': {'t': 'deal', 'cards': deal, 'order': list(range(1, 9))}}, {'X-Round-Token': token})

            with sync_playwright() as pw:
                browser = pw.chromium.launch()
                ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
                ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda rt: rt.fulfill(body='', content_type='text/css'))
                ctx.add_init_script(f'({CAMERA})()')
                page = ctx.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(GAME + 'phone.html')
                page.evaluate("localStorage.setItem('test.permission', 'deny')")
                page.goto('about:blank')  # camera apps open the Join URL as a new document
                page.goto(GAME + f'phone.html#{rid}.{token}')
                try:
                    page.wait_for_function("document.body.innerText.includes('Camera access is blocked')")
                except Exception:
                    print('Phone state:', page.inner_text('body'), 'Errors:', errors)
                    raise
                assert not page.evaluate('S5.get().started')
                print('PASS: Join QR requests camera access; denial explains how to retry')
                page.screenshot(path=str(Path(data) / 'camera-denied.png'))
                page.evaluate("localStorage.setItem('test.permission', 'allow')")
                page.click('.scanner-retry')
                page.wait_for_function("document.querySelector('video').readyState >= 2")
                page.screenshot(path='/tmp/scamurai-phone-scanner.png', full_page=True)
                assert page.evaluate("JSON.parse(localStorage.getItem('test.constraints')).video.facingMode.ideal") == 'environment'

                def scan(raw):
                    page.evaluate("image => localStorage.setItem('test.qr', image)", qr(raw))

                scan('https://example.com/games/scan-me-if-you-can/c.html?n=1')
                page.wait_for_function("document.querySelector('.scanner-status').textContent.includes('not a Scamurai')")
                scan(GAME + 'c.html?n=25')
                page.wait_for_function("document.querySelector('.scanner-status').textContent.includes(\"isn't one of yours\")")
                assert page.url.endswith('phone.html') and not page.evaluate('S5.get().firstCard')
                print('PASS: camera decoder rejects unrelated and out-of-deal QR images')

                scan(GAME + 'c.html?n=1')
                page.wait_for_url('**/c.html?n=1')
                page.get_by_role('button', name='Start timer', exact=True).wait_for()
                assert page.evaluate('S5.get().firstCard') == 1
                assert not page.evaluate('S5.get().started')
                page.wait_for_timeout(1200)
                assert not page.evaluate('S5.get().started')
                page.click('#go')
                page.wait_for_function("!document.querySelector('.vbar .real').disabled")
                page.screenshot(path='/tmp/scamurai-phone-card.png')
                assert page.evaluate('S5.SECS') == 12
                assert page.evaluate('S5.points(true, 6000, "real")') == 80
                page.click('.vbar .real')
                page.wait_for_selector('.res .scanner video')
                page.wait_for_function("document.querySelector('.scanner-status').textContent.includes('already judged')")
                assert len(page.evaluate('Object.keys(S5.get().done)')) == 1
                assert page.evaluate("+localStorage.getItem('test.stops')") >= 1
                print('PASS: first scanned card waits for Start timer; result resumes scanning and rejects repeats')

                requests = page.evaluate("+localStorage.getItem('test.requests')")
                expected_score = page.evaluate('S5.total(Object.values(S5.get().done))')
                page.get_by_role('link', name='My scores', exact=True).click()
                page.wait_for_selector('#participant-name')
                assert page.inner_text('#participant-id') == 'SCAN001'
                assert page.inner_text('#participant-name') == 'Scanner Test'
                page.get_by_role('link', name='Game 5 QR results', exact=True).click()
                page.wait_for_selector('#my-score')
                assert int(page.inner_text('#my-score')) == expected_score
                assert page.locator('.score-list tbody tr').count() == 8
                assert page.locator('video').count() == 0
                assert page.evaluate("+localStorage.getItem('test.requests')") == requests
                page.screenshot(path='/tmp/scamurai-my-scores.png', full_page=True)
                page.get_by_role('link', name='Continue playing', exact=True).click()
                page.wait_for_selector('.scanner video')
                print('PASS: result links to personal total and QR scores without opening the camera; Continue playing returns to scanning')

                scan(GAME + 'c.html?n=2')
                page.wait_for_url('**/c.html?n=2')
                page.wait_for_function("document.querySelector('.vbar .real') && !document.querySelector('.vbar .real').disabled")
                start = page.evaluate('S5.get().started[2]')
                assert start <= page.evaluate('performance.timeOrigin')
                assert page.get_by_role('button', name='Start timer', exact=True).count() == 0
                page.wait_for_timeout(1500)
                page.reload()
                page.wait_for_function("document.querySelector('.vbar .real') && !document.querySelector('.vbar .real').disabled")
                assert page.evaluate('S5.get().started[2]') == start
                assert int(page.inner_text('.vbar .t b')) <= 11
                assert page.get_by_role('button', name='Start timer', exact=True).count() == 0
                print('PASS: later QR starts at detection; reload preserves the deadline without a Start button')

                page.get_by_role('link', name='My scores', exact=True).click()
                page.wait_for_selector('#participant-name')
                assert page.inner_text('#participant-id') == 'SCAN001'
                assert page.evaluate('ScamuraiParticipant.round().started[2]') == start
                assert 'timer keeps running' in page.inner_text('main')
                page.get_by_role('link', name='Resume QR #2', exact=True).click()
                page.wait_for_function("document.querySelector('.vbar .real') && !document.querySelector('.vbar .real').disabled")
                assert page.evaluate('S5.get().started[2]') == start
                print('PASS: My scores is available during a timed site; resuming keeps its original deadline')

                # Keep the third card's metadata requests pending, including the background warm-up.
                pending = []
                ctx.route('**/cards/' + slugs[2] + '.js*', lambda rt: pending.append(rt))
                page.click('.vbar .fake')
                page.wait_for_selector('.res .scanner video')
                scan(GAME + 'c.html?n=3')
                page.wait_for_url('**/c.html?n=3', wait_until='domcontentloaded')
                page.wait_for_selector('.vbar')
                page.clock.install()
                page.clock.fast_forward(12500)
                page.wait_for_function('S5.get().done[3]?.v === "timeout"')
                assert page.evaluate('S5.get().done[3].ms') == 12000
                assert page.evaluate('S5.get().done[3].pts') == 0
                assert page.locator('.res .scanner').count() == 1
                print('PASS: loading time counts; an unloaded later site times out at 12 seconds and opens the next scanner')
                for rt in pending:
                    try:
                        rt.continue_()
                    except Exception:
                        pass  # requests belonging to the prior page were cancelled by navigation
                ctx.unroute('**/cards/' + slugs[2] + '.js*')
                for n in range(4, 9):
                    page.goto(GAME + f'c.html?n={n}')
                    page.wait_for_function("document.querySelector('.vbar .real') && !document.querySelector('.vbar .real').disabled")
                    page.click('.vbar .real')
                    page.wait_for_selector('.res')
                assert page.locator('.res .scanner').count() == 0
                expected_score = page.evaluate('S5.total(Object.values(S5.get().done))')
                api(f'/api/rounds/{rid}/finish', {'score': expected_score, 'maxScore': 800}, {'X-Pin': '5005'})
                page.get_by_role('link', name='My scores', exact=True).click()
                page.wait_for_selector('#participant-name')
                assert page.inner_text('#participant-id') == 'SCAN001'
                assert page.inner_text('#participant-name') == 'Scanner Test'
                page.get_by_role('link', name='Game 5 QR results', exact=True).click()
                page.wait_for_selector('#my-score')
                assert int(page.inner_text('#my-score')) == expected_score
                assert '8 of 8 sites judged' in page.inner_text('main')
                assert page.get_by_role('link', name='Continue playing', exact=True).count() == 0
                assert page.locator('video').count() == 0
                print('PASS: final result links to all eight QR scores after the round ends')
                assert not errors, errors
                browser.close()
                print('PASS: no browser JavaScript errors')
        finally:
            server.terminate()
            server.wait(timeout=5)


if __name__ == '__main__':
    run()
