#!/usr/bin/env python3
"""End-to-end Playwright tests & visual evidence screenshots for:
  1. Registration Desk QR option + Self-Registration flow
  2. Game 1 (Spot the Fake Cash) QR Join Dashboard & Player Flow (Game 5 pattern)
  3. Game 1 Meta Quest 3 VR UI spatial HUD, angled control deck & side Note Guide
"""
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import e2e_participant as api

ROOT = Path(__file__).resolve().parents[2]
WORKSPACE = ROOT.parents[1]
EVIDENCE = WORKSPACE / 'output' / 'evidence'
EVIDENCE.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:3051'
api.BASE = BASE

spec = importlib.util.spec_from_file_location('phone_fixtures', ROOT / 'games/scan-me-if-you-can/tools/e2e_phone.py')
fixtures = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixtures)

# Load demo answers only in test harness so we can play accurately against the live server key
_raw_demo = re.sub(r'//.*', '', (ROOT / 'games/spot-the-fake-cash/js/demo-answers.js').read_text())
_raw_demo = re.sub(r',\s*\]', ']', re.search(r'=\s*(\[.*?\])', _raw_demo, re.S).group(1))
DEMO_ANSWERS = json.loads(_raw_demo)


def run():
    with tempfile.TemporaryDirectory(prefix='scamurai-new-') as data:
        env = dict(
            os.environ,
            PORT='3051',
            DATA_DIR=data,
            ADMIN_PIN='9999',
            STAFF_PIN='1111',
            STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005',
        )
        server = subprocess.Popen(['node', 'server.js'], cwd=ROOT / 'server', env=env, stdout=subprocess.DEVNULL)
        try:
            api.wait_server()
            with sync_playwright() as pw:
                browser = pw.chromium.launch(
                    args=[
                        '--use-gl=angle',
                        '--use-angle=swiftshader',
                        '--enable-webgl',
                        '--ignore-gpu-blocklist',
                    ]
                )
                errors = []

                def make_ctx(mobile=False, width=1440, height=900):
                    c = browser.new_context(
                        viewport={'width': width, 'height': height},
                        is_mobile=mobile,
                        has_touch=mobile,
                        reduced_motion='reduce',
                    )
                    c.on('page', lambda p: p.on('pageerror', lambda e: errors.append(f'{p.url}: {e}')))
                    return c

                # =====================================================================
                # 1. REGISTRATION DESK QR OPTION + SELF-REGISTRATION FLOW
                # =====================================================================
                desk_ctx = make_ctx(False, 1440, 960)
                desk = desk_ctx.new_page()
                desk.goto(BASE + '/register.html')
                desk.fill('#pin', '1111')
                desk.click('#pinGo')
                desk.wait_for_selector('#selfRegCard:visible')
                desk.wait_for_selector('#selfRegQR svg')
                self_reg_url = desk.get_attribute('#selfRegLink', 'href')
                assert self_reg_url == BASE + '/self-register.html', self_reg_url
                desk.screenshot(path=str(EVIDENCE / '01_register_desk_qr.png'), full_page=True)

                # Big QR modal
                desk.click('#showBigSelfQR')
                desk.wait_for_selector('#bigSelfQRModal:visible')
                desk.wait_for_selector('#bigSelfQRBox svg')
                desk.screenshot(path=str(EVIDENCE / '02_register_big_qr_modal.png'))
                desk.click('#closeBigSelfQR')
                assert desk.locator('#bigSelfQRModal').is_hidden()

                # Responsive check on self-register.html (320, 390, 1440)
                for w in [320, 390, 1440]:
                    rc = make_ctx(w < 700, w, 844)
                    rp = rc.new_page()
                    rp.goto(self_reg_url)
                    rp.wait_for_selector('#form:visible')
                    assert rp.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'overflow at {w}px'
                    rc.close()

                # Player scans QR on mobile phone and self-registers
                phone_ctx = make_ctx(True, 390, 844)
                phone_ctx.add_init_script(f'({fixtures.CAMERA})()')
                phone = phone_ctx.new_page()
                phone.goto(self_reg_url)
                phone.wait_for_selector('#form:visible')
                phone.fill('#sid', 'QRSELF001')
                phone.fill('#name', 'Farah Lin')
                for name, value in [('age', '19–21'), ('pbb', 'yes'), ('exp', 'no')]:
                    phone.locator(f'label:has(input[name="{name}"][value="{value}"])').click()
                phone.check('#consent')
                phone.screenshot(path=str(EVIDENCE / '03_self_register_mobile.png'), full_page=True)
                phone.click('#go')
                phone.wait_for_selector('#doneCard:visible')
                assert phone.inner_text('#doneId') == 'QRSELF001'
                phone.screenshot(path=str(EVIDENCE / '04_self_register_complete.png'), full_page=True)

                # Phone automatically remembered participant pass -> open participant page directly
                phone.click('#openPageBtn')
                phone.wait_for_selector('#participant-name')
                assert phone.inner_text('#participant-name') == 'Farah Lin'
                assert phone.inner_text('#participant-id') == 'QRSELF001'

                # Revisiting self-register.html on same phone shows "Already registered" banner
                revisit = phone_ctx.new_page()
                revisit.goto(self_reg_url)
                revisit.wait_for_selector('#existingCard:visible')
                assert 'Farah Lin' in revisit.text_content('#existingCard')
                revisit.close()

                # Guest self-registration & duplicate Student ID check
                guest_ctx = make_ctx(True, 390, 844)
                gp = guest_ctx.new_page()
                gp.goto(self_reg_url)
                gp.wait_for_selector('#form:visible')
                # Try duplicate first
                gp.fill('#sid', 'QRSELF001')
                gp.fill('#name', 'Duplicate Try')
                for name, value in [('age', '22–25'), ('pbb', 'no'), ('exp', 'no')]:
                    gp.locator(f'label:has(input[name="{name}"][value="{value}"])').click()
                gp.check('#consent')
                gp.click('#go')
                gp.wait_for_function("document.getElementById('err').textContent.includes('already registered')")
                # Switch to Guest
                gp.locator('label:has(input[name="kind"][value="guest"])').click()
                gp.fill('#name', 'Guest Visitor')
                gp.click('#go')
                gp.wait_for_selector('#doneCard:visible')
                assert gp.inner_text('#doneId') == 'G001'
                assert gp.locator('#guestNote').is_visible()
                guest_ctx.close()

                # Secretary desk shows QRSELF001 with QR badge & Pause/Enable toggle works
                desk.reload()
                desk.wait_for_selector('#rows tr')
                rows_text = desk.inner_text('#rows')
                assert 'QRSELF001' in rows_text and 'Farah Lin' in rows_text and 'QR' in rows_text
                desk.click('#toggleSelfReg')
                desk.wait_for_function("document.getElementById('selfRegBadge').textContent === 'Paused'")
                paused_ctx = make_ctx(True, 390, 844)
                pp = paused_ctx.new_page()
                pp.goto(self_reg_url)
                pp.wait_for_selector('#pausedCard:visible')
                paused_ctx.close()
                desk.click('#toggleSelfReg')
                desk.wait_for_function("document.getElementById('selfRegBadge').textContent === 'Active'")
                print('PASS: Registration desk QR option, self-registration (student & guest), duplicate guard & pause toggle')

                # =====================================================================
                # 2. GAME 1 QR JOIN SYSTEM (GAME 5 PATTERN)
                # =====================================================================
                gm_ctx = make_ctx(False, 1440, 960)
                gm = gm_ctx.new_page()
                gm.goto(BASE + '/games/spot-the-fake-cash/')
                gm.fill('.scm input[type=password]', '5001')
                gm.click('.scm .go')
                gm.wait_for_selector('#new')

                # Start a round for Farah Lin (QRSELF001)
                gm.click('#new')
                gm.locator('.scm .it[data-id="QRSELF001"]').wait_for()
                gm.fill('.scm .find', 'QRSELF001')
                gm.click('.scm .go')
                gm.wait_for_selector('.modal .qr svg')
                join_url = gm.evaluate('window.S1_JOIN')
                assert '/games/spot-the-fake-cash/play.html#' in join_url, join_url
                gm.screenshot(path=str(EVIDENCE / '05_game1_dashboard_join_qr.png'))

                # Verify participant.html Start Scamming scanner rejects someone else's Station 1 Join QR
                foreign_round = api.ok('POST', '/api/rounds', {'participantId': 'G001'}, pin='5001')
                foreign_join = f"{BASE}/games/spot-the-fake-cash/play.html#{foreign_round['roundId']}.{foreign_round['token']}"
                phone.click('#start-scamming')
                phone.wait_for_function("document.querySelector('video').readyState >= 2")
                phone.evaluate("im => localStorage.setItem('test.qr', im)", fixtures.qr(foreign_join))
                phone.wait_for_function("document.querySelector('.scanner-status').textContent.includes('someone else')")
                api.ok('POST', f'/api/rounds/{foreign_round["roundId"]}/cancel', {}, pin='5001')

                # Scan own Station 1 Join QR via Start Scamming -> navigates straight into play.html!
                phone.evaluate("im => localStorage.setItem('test.qr', im)", fixtures.qr(join_url))
                phone.wait_for_url('**/games/spot-the-fake-cash/play.html')
                phone.wait_for_selector('#start-game-btn:not([disabled])', timeout=15000)

                # Live QR round MUST NOT have demo answers loaded
                assert phone.evaluate('window.FAKECASH_DEMO_ANSWERS === undefined')
                assert 'Farah Lin' in phone.inner_text('#qr-player-banner')

                # GM modal auto-closes when player joins!
                gm.wait_for_function("document.getElementById('modal').innerHTML === ''", timeout=10000)

                # Start inspection on player's phone
                phone.click('#start-game-btn')
                phone.wait_for_selector('#action-bar:visible')
                phone.wait_for_selector('#pass-btn:not([disabled])')

                # Inspect & answer 4 notes (first 3 correct, 4th wrong) -> check live GM dashboard tile!
                rid, tok = join_url.split('#', 1)[1].split('.', 1)
                rid = int(rid)
                st_now = api.ok('GET', f'/api/rounds/{rid}/state', token=tok)
                deal_ids = st_now['deal']['ids']
                assert len(deal_ids) == 10

                for i in range(4):
                    is_real = DEMO_ANSWERS[deal_ids[i]]
                    choose_real = is_real if i < 3 else (not is_real)
                    phone.wait_for_selector('#pass-btn:not([disabled])')
                    phone.click('#pass-btn' if choose_real else '#reject-btn')
                    phone.wait_for_selector('#feedback:visible')
                    if i == 0:
                        phone.screenshot(path=str(EVIDENCE / '06_game1_qr_player_playing.png'))
                    phone.evaluate("document.getElementById('feedback-next-btn')?.click()")
                    phone.wait_for_selector('#feedback', state='hidden')

                # GM dashboard shows live 4/10 judged, 30 pts, 3 green + 1 red pips!
                gm.wait_for_function("document.querySelector('.tile .pts')?.textContent === '30'", timeout=10000)
                assert gm.locator('.tile .strip .ok').count() == 3
                assert gm.locator('.tile .strip .no').count() == 1
                gm.screenshot(path=str(EVIDENCE / '07_game1_dashboard_live_progress.png'))

                # Reload play.html mid-round -> restores exact server deal, 4 answered notes, score 30!
                phone.reload()
                phone.wait_for_selector('#action-bar:visible', timeout=15000)
                assert phone.inner_text('#score-display') == '30 / 100'
                assert phone.inner_text('#note-display').startswith('Note 5 / 10')

                # Answer remaining 6 notes correctly -> final score 90 / 100
                for i in range(4, 10):
                    is_real = DEMO_ANSWERS[deal_ids[i]]
                    phone.wait_for_selector('#pass-btn:not([disabled])')
                    phone.click('#pass-btn' if is_real else '#reject-btn')
                    phone.wait_for_selector('#feedback:visible')
                    phone.evaluate("document.getElementById('feedback-next-btn')?.click()")
                    if i < 9:
                        phone.wait_for_selector('#feedback', state='hidden')

                phone.wait_for_selector('#result-overlay:visible', timeout=10000)
                assert phone.inner_text('#result-score') == '90 / 100'
                phone.wait_for_function("document.getElementById('qr-save-status').textContent.includes('90 / 100')", timeout=10000)

                # Dashboard tile automatically transitions to ended with 90%!
                gm.wait_for_function("document.querySelector('.tile.over .pts')?.textContent === '90'", timeout=10000)

                # Participant page reflects Station 1 score = 90 / 100!
                phone.click('#again-btn')
                phone.wait_for_selector('#participant-name')
                phone.wait_for_function("document.querySelector('[data-station=\"1\"] .score').textContent === '90 / 100'")
                print('PASS: Game 1 QR Join dashboard, Start Scamming scan, live progress, reload recovery & server-scored finish')

                # =====================================================================
                # 3. META QUEST 3 VR UI VISUAL VERIFICATION & SCREENSHOTS
                # =====================================================================
                vr_ctx = make_ctx(False, 1280, 760)
                vp = vr_ctx.new_page()
                vp.goto(BASE + '/games/spot-the-fake-cash/game.html?demo=1')
                vp.wait_for_selector('#start-game-btn:not([disabled])', timeout=15000)
                vp.click('#start-game-btn')
                vp.wait_for_selector('#action-bar:visible')

                # Position camera at Quest 3 standing eye pose looking at the full spatial cockpit (HUD + Guide + Note + Console)
                vp.evaluate("""() => {
                    document.getElementById('ui-layer').style.display = 'none';
                    const stage = window.__FAKECASH_STAGE__;
                    const vr = window.__FAKECASH_VR__;
                    stage.camera.fov = 62;
                    stage.camera.position.set(0.06, 1.46, 0.56);
                    stage.camera.lookAt(-0.10, 1.24, -0.58);
                    stage.camera.updateProjectionMatrix();
                    stage.rotateNote(0.32, -0.10); // show metallic hologram tilt shimmer too
                    vr.setPreviewMode(true, { showGuide: true, mode: 'playing' });
                }""")
                vp.wait_for_timeout(350)
                vp.screenshot(path=str(EVIDENCE / '08_game1_quest3_vr_playing.png'))

                # Trigger a verdict to capture the Quest 3 VR Feedback HUD + NEXT NOTE console state!
                vp.evaluate("document.getElementById('pass-btn').click()")
                vp.wait_for_function("!document.getElementById('feedback').hidden")
                vp.evaluate("""() => {
                    window.__FAKECASH_VR__.setPreviewMode(true, { showGuide: false, mode: 'feedback' });
                    const stage = window.__FAKECASH_STAGE__;
                    stage.camera.position.set(0.0, 1.45, 0.52);
                    stage.camera.lookAt(0.0, 1.24, -0.56);
                    stage.camera.updateProjectionMatrix();
                }""")
                vp.wait_for_timeout(350)
                vp.screenshot(path=str(EVIDENCE / '09_game1_quest3_vr_feedback.png'))

                # Complete remaining notes in demo in one fast batch to capture Quest 3 VR Forensic Summary HUD!
                vp.evaluate("""() => {
                    for (let i = 0; i < 9; i++) {
                        document.getElementById('feedback-next-btn').click();
                        document.getElementById('pass-btn').click();
                    }
                    document.getElementById('feedback-next-btn').click();
                }""")
                vp.wait_for_function("!document.getElementById('result-overlay').hidden")
                vp.evaluate("""() => {
                    document.getElementById('result-overlay').style.display = 'none';
                    window.__FAKECASH_VR__.setPreviewMode(true, { showGuide: false, mode: 'finished' });
                }""")
                vp.wait_for_timeout(350)
                vp.screenshot(path=str(EVIDENCE / '10_game1_quest3_vr_finished.png'))
                print('PASS: Meta Quest 3 VR UI rendered cleanly (playing + guide, feedback, finished summary) with zero errors')

                assert not errors, f'JS errors detected: {errors}'
                browser.close()
        finally:
            server.terminate()
            server.wait(timeout=5)


if __name__ == '__main__':
    run()
