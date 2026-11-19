#!/usr/bin/env python3
"""Booth laptop regressions: slow-start attribution (H1), picker recovery (H3), shared-kiosk privacy (H4)."""
import os, subprocess, tempfile, time
from pathlib import Path
from playwright.sync_api import sync_playwright
import e2e_participant as api
ROOT = Path(__file__).resolve().parents[2]
BASE = api.BASE = 'http://127.0.0.1:3049'
KEY = 'scamurai.booth.3.event.v1'
PASS_KEYS = ['scamurai.participant.token', 'scamurai.s5.round']

def run():
    with tempfile.TemporaryDirectory(prefix='scamurai-fixes-') as data:
        env = dict(os.environ, PORT='3049', DATA_DIR=data, ADMIN_PIN='9999', STAFF_PIN='1111', STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005')
        server = subprocess.Popen(['node', 'server.js'], cwd=ROOT / 'server', env=env, stdout=subprocess.DEVNULL)
        try:
            api.wait_server()
            for pid in ['SLOWA', 'SLOWB', 'KIOSKA', 'KIOSKB']:
                api.ok('POST', '/api/participants', {'id': pid, 'name': pid, 'ageGroup': '19–21', 'pbbAccount': False, 'scamExposure': 'no', 'consent': True}, pin='1111')
            with sync_playwright() as pw:
                browser = pw.chromium.launch(); errors = []
                def laptop():
                    c = browser.new_context(viewport={'width': 1440, 'height': 960}, reduced_motion='reduce')
                    c.on('page', lambda p: p.on('pageerror', lambda e: errors.append(str(e))))
                    p = c.new_page(); p.goto(BASE + '/games/phishing-fishing/?lang=en')
                    p.fill('.scm input[type=password]', '5003'); p.click('.scm .go'); p.wait_for_selector('.scm .find'); return p
                state = lambda p: p.evaluate('(k)=>JSON.parse(sessionStorage.getItem(k))', KEY)

                # H1: a slow start response must be attributed to the player who was chosen, not a later pick
                p = laptop()
                def slow(route):
                    time.sleep(1.5); route.continue_()
                p.route('**/api/rounds', lambda r: slow(r) if r.request.method == 'POST' else r.continue_())
                p.locator('.scm .it[data-id="SLOWA"]').wait_for(); p.fill('.scm .find', 'SLOWA'); p.click('.scm .go')
                assert p.locator('.scm .find').is_disabled()  # selection is locked while the start is in flight
                try: p.locator('.scm .it[data-id="SLOWB"]').click(force=True, timeout=1500)  # a click on another player must not switch it
                except Exception: pass
                p.wait_for_function("(k)=>{const s=JSON.parse(sessionStorage.getItem(k)||'null');return s&&s.participant}", arg=KEY, timeout=15000)
                assert state(p)['participant']['id'] == 'SLOWA', state(p)['participant']
                rounds = api.ok('GET', '/api/rounds/open', pin='5003')
                assert [r['participant']['id'] for r in rounds] == ['SLOWA'], rounds
                print('PASS: slow start response stays attributed to the chosen player')

                # H3: leaving through the staff Next button always frees the picker again
                p.on('dialog', lambda d: d.accept()); p.click('#booth-cancel'); p.wait_for_function("(k)=>JSON.parse(sessionStorage.getItem(k)).status==='cancelled'", arg=KEY); p.click('#booth-next')
                p.locator('.scm .it[data-id="SLOWB"]').wait_for(); p.fill('.scm .find', 'SLOWB')
                assert not p.locator('.scm .go').is_disabled()
                print('PASS: picker is usable again after leaving a round')

                # H4: no persistent personal page on the shared kiosk; QR is per player and closes on handover
                k = laptop()
                k.evaluate("PASS_KEYS=>PASS_KEYS.forEach(x=>localStorage.setItem(x,'stale'))", PASS_KEYS)
                k.locator('.scm .it[data-id="KIOSKA"]').wait_for(); k.fill('.scm .find', 'KIOSKA'); k.click('.scm .go')
                k.wait_for_function("(key)=>{const s=JSON.parse(sessionStorage.getItem(key)||'null');return s&&s.participant}", arg=KEY, timeout=15000)
                time.sleep(1)
                assert k.evaluate("PASS_KEYS=>PASS_KEYS.some(x=>localStorage.getItem(x)!==null)", PASS_KEYS) is False
                a = k.locator('#booth-personal')
                assert a.get_attribute('href') is None
                a.click(); k.wait_for_selector('body > div svg', timeout=10000)
                assert 'KIOSKA' in k.locator('body').inner_text()
                k.on('dialog', lambda d: d.accept()); k.click('#booth-cancel'); k.wait_for_function("(k)=>JSON.parse(sessionStorage.getItem(k)).status==='cancelled'", arg=KEY); k.click('#booth-next')
                k.locator('.scm .it[data-id="KIOSKB"]').wait_for(); k.fill('.scm .find', 'KIOSKB'); k.click('.scm .go')
                k.wait_for_function("(key)=>{const s=JSON.parse(sessionStorage.getItem(key)||'null');return s&&s.participant&&s.participant.id==='KIOSKB'}", arg=KEY, timeout=15000)
                time.sleep(1)
                assert 'KIOSKA' not in k.locator('body').inner_text()
                assert k.locator('body > div svg').count() == 0
                assert k.evaluate("PASS_KEYS=>PASS_KEYS.some(x=>localStorage.getItem(x)!==null)", PASS_KEYS) is False
                print('PASS: kiosk keeps no personal pass; QR for My scores is per player and gone at handover')
                assert not errors, errors
                browser.close()
        finally:
            server.terminate(); server.wait(timeout=5)

if __name__ == '__main__': run()
