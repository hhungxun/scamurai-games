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
                # 2. GAME 1 GENERAL JOIN QR — TWO TABS (VR + NORMAL), ZERO CROSS-TRIGGER
                # =====================================================================
                # Simulate the exact event-day setup: ONE laptop browser (shared localStorage/PIN)
                # with TWO tabs: Tab 1 (VR Headset) and Tab 2 (Normal External Monitor).
                booth_ctx = make_ctx(False, 1440, 960)
                tab_vr = booth_ctx.new_page()
                tab_vr.goto(BASE + '/games/spot-the-fake-cash/?mode=vr')
                tab_vr.fill('.scm input[type=password]', '5001')
                tab_vr.click('.scm .go')
                tab_vr.wait_for_selector('#slot-qr svg', timeout=10000)

                tab_norm = booth_ctx.new_page()
                tab_norm.goto(BASE + '/games/spot-the-fake-cash/?mode=normal')
                tab_norm.wait_for_selector('#slot-qr svg', timeout=10000)

                vr_slot_id = tab_vr.evaluate('window.S1_SLOT_ID')
                norm_slot_id = tab_norm.evaluate('window.S1_SLOT_ID')
                vr_slot_url = tab_vr.evaluate('window.S1_SLOT_URL')
                norm_slot_url = tab_norm.evaluate('window.S1_SLOT_URL')
                assert vr_slot_id and norm_slot_id and vr_slot_id != norm_slot_id, (vr_slot_id, norm_slot_id)
                assert '/games/spot-the-fake-cash/join.html#' in vr_slot_url, vr_slot_url
                assert '/games/spot-the-fake-cash/join.html#' in norm_slot_url, norm_slot_url
                tab_norm.screenshot(path=str(EVIDENCE / '05_game1_general_join_qr.png'))

                # Player 1 (Farah Lin, QRSELF001) scans Tab 1 (VR Tab)'s QR via Start Scamming on phone
                phone.click('#start-scamming')
                phone.wait_for_function("document.querySelector('video').readyState >= 2")
                phone.evaluate("im => localStorage.setItem('test.qr', im)", fixtures.qr(vr_slot_url))
                phone.wait_for_url('**/games/spot-the-fake-cash/join.html**', timeout=10000)
                phone.wait_for_selector('#box.ok', timeout=10000)
                assert 'Farah Lin' in phone.text_content('.join-who')

                # Tab 1 (VR) starts Farah Lin's round in VR-ready mode (banner + Enter VR Mode button),
                # while Tab 2 (Normal) MUST remain idle on its own waiting QR (ZERO cross-triggering)!
                tab_vr.wait_for_function("document.getElementById('booth-identity').textContent.includes('Farah Lin')", timeout=10000)
                vr_frame = tab_vr.locator('#booth-frame').element_handle().content_frame()
                vr_frame.wait_for_selector('#qr-player-banner:visible', timeout=15000)
                assert 'Farah Lin' in vr_frame.inner_text('#qr-player-banner')
                assert tab_norm.locator('#booth-idle').is_visible(), 'Normal tab must NOT be triggered by VR tab scan!'
                assert tab_norm.evaluate('window.S1_SLOT_ID') == norm_slot_id

                # Player 2 (Guest G001) scans Tab 2 (Normal Tab)'s QR on a second phone!
                p2_reg = api.ok('POST', '/api/participants/self', {
                    'id': 'QRSELF002', 'name': 'Kenji Tan', 'ageGroup': '19–21',
                    'pbbAccount': False, 'scamExposure': 'no', 'consent': True
                })
                phone2_ctx = make_ctx(True, 390, 844)
                phone2 = phone2_ctx.new_page()
                phone2.goto(BASE + '/participant.html#' + p2_reg['participantToken'])
                phone2.wait_for_selector('#participant-name')
                phone2.goto(norm_slot_url)
                phone2.wait_for_selector('#box.ok', timeout=10000)
                assert 'Kenji Tan' in phone2.text_content('.join-who')

                # Tab 2 (Normal) AUTO-STARTS straight into active gameplay (Note 1 / 10) with Kenji Tan identified!
                tab_norm.wait_for_function("document.getElementById('booth-identity').textContent.includes('Kenji Tan')", timeout=10000)
                norm_frame = tab_norm.locator('#booth-frame').element_handle().content_frame()
                norm_frame.wait_for_selector('#action-bar:visible', timeout=15000)
                norm_frame.wait_for_selector('#pass-btn:not([disabled])', timeout=15000)
                assert norm_frame.evaluate('window.FAKECASH_DEMO_ANSWERS === undefined')
                # Tab 1 (VR) is still strictly Farah Lin!
                assert 'Farah Lin' in tab_vr.inner_text('#booth-identity')

                # Finish Tab 2 (Kenji Tan)'s 10-note round (9 correct, 1 wrong -> 90 / 100)
                norm_rid = tab_norm.evaluate("JSON.parse(sessionStorage.getItem('scamurai.booth.1.event.v1')).roundId")
                norm_deal = api.ok('POST', f'/api/rounds/{norm_rid}/deal', {}, pin='5001')['ids']
                for i in range(10):
                    is_real = DEMO_ANSWERS[norm_deal[i]]
                    choose_real = is_real if i < 9 else (not is_real)
                    norm_frame.wait_for_selector('#pass-btn:not([disabled])')
                    norm_frame.click('#pass-btn' if choose_real else '#reject-btn')
                    norm_frame.wait_for_selector('#feedback:visible')
                    norm_frame.evaluate("document.getElementById('feedback-next-btn')?.click()")
                    if i < 9:
                        norm_frame.wait_for_selector('#feedback', state='hidden')
                norm_frame.wait_for_selector('#result-overlay:visible', timeout=10000)
                assert norm_frame.inner_text('#result-score') == '90 / 100'
                tab_norm.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.1.event.v1')).status === 'saved'", timeout=10000)

                # Now play Tab 1 (Farah Lin)'s round independently -> 10/10 = 100 / 100
                vr_frame.wait_for_selector('#start-game-btn:not([disabled])', timeout=15000)
                vr_frame.click('#start-game-btn')
                vr_frame.wait_for_selector('#action-bar:visible')
                vr_rid = tab_vr.evaluate("JSON.parse(sessionStorage.getItem('scamurai.booth.1.event.v1')).roundId")
                vr_deal = api.ok('POST', f'/api/rounds/{vr_rid}/deal', {}, pin='5001')['ids']
                for i in range(10):
                    is_real = DEMO_ANSWERS[vr_deal[i]]
                    vr_frame.wait_for_selector('#pass-btn:not([disabled])')
                    vr_frame.click('#pass-btn' if is_real else '#reject-btn')
                    vr_frame.wait_for_selector('#feedback:visible')
                    vr_frame.evaluate("document.getElementById('feedback-next-btn')?.click()")
                    if i < 9:
                        vr_frame.wait_for_selector('#feedback', state='hidden')
                vr_frame.wait_for_selector('#result-overlay:visible', timeout=10000)
                assert vr_frame.inner_text('#result-score') == '100 / 100'
                tab_vr.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.1.event.v1')).status === 'saved'", timeout=10000)

                # Confirm each participant received ONLY their own score on the server!
                kenji_me = api.ok('GET', '/api/participant/me', participant=p2_reg['participantToken'])
                assert kenji_me['stations'][0]['score'] == 90, kenji_me
                farah_tok = phone.evaluate("localStorage.getItem('scamurai.participant.token')")
                farah_me = api.ok('GET', '/api/participant/me', participant=farah_tok)
                assert farah_me['stations'][0]['score'] == 100, farah_me
                phone2_ctx.close()
                booth_ctx.close()
                print('PASS: Game 1 General Join QR (two simultaneous VR + Normal tabs, zero cross-triggering, auto-start & server-scored)')

                # =====================================================================
                # 3. META QUEST 3 VR UI VISUAL VERIFICATION (NOTE POSITIONED FORWARD)
                # =====================================================================
                vr_ctx = make_ctx(False, 1280, 760)
                vp = vr_ctx.new_page()
                vp.goto(BASE + '/games/spot-the-fake-cash/game.html?demo=1')
                vp.wait_for_selector('#start-game-btn:not([disabled])', timeout=15000)
                vp.click('#start-game-btn')
                vp.wait_for_selector('#action-bar:visible')

                # Capture TRUE Quest 3 standing eye-level POV (origin z=0, eye y=1.55, looking straight ahead, 90° vertical FOV)
                note_pos = vp.evaluate("""() => {
                    document.getElementById('ui-layer').style.display = 'none';
                    const stage = window.__FAKECASH_STAGE__;
                    const vr = window.__FAKECASH_VR__;
                    vr.setPreviewMode(true, { showGuide: false, mode: 'playing' });
                    stage.camera.fov = 76;
                    stage.camera.position.set(0.0, 1.55, 0.0);
                    stage.camera.lookAt(0.0, 1.38, -1.0);
                    stage.camera.updateProjectionMatrix();
                    stage.rotateNote(0.24, -0.06);
                    stage.updateFrame();
                    return [stage.banknoteMesh.position.x, stage.banknoteMesh.position.y, stage.banknoteMesh.position.z];
                }""")
                # Assert banknote moved higher & further forward in VR (y >= 1.23, z <= -0.67)
                assert note_pos[1] >= 1.23 and note_pos[2] <= -0.67, f'Expected forward VR note pos, got {note_pos}'
                vp.wait_for_timeout(350)
                vp.screenshot(path=str(EVIDENCE / '08_game1_quest3_vr_eyelevel_pov.png'))

                # Also capture wider cockpit view with Note Guide open
                vp.evaluate("""() => {
                    const stage = window.__FAKECASH_STAGE__;
                    const vr = window.__FAKECASH_VR__;
                    vr.setPreviewMode(true, { showGuide: true, mode: 'playing' });
                    stage.camera.fov = 66;
                    stage.camera.position.set(0.06, 1.52, 0.24);
                    stage.camera.lookAt(-0.08, 1.30, -0.72);
                    stage.camera.updateProjectionMatrix();
                    stage.updateFrame();
                }""")
                vp.wait_for_timeout(350)
                vp.screenshot(path=str(EVIDENCE / '08_game1_quest3_vr_playing.png'))

                # Trigger a verdict to capture the Quest 3 VR Feedback HUD + NEXT NOTE console state!
                vp.evaluate("document.getElementById('pass-btn').click()")
                vp.wait_for_function("!document.getElementById('feedback').hidden")
                vp.evaluate("""() => {
                    window.__FAKECASH_VR__.setPreviewMode(true, { showGuide: false, mode: 'feedback' });
                    const stage = window.__FAKECASH_STAGE__;
                    stage.camera.position.set(0.0, 1.50, 0.32);
                    stage.camera.lookAt(0.0, 1.30, -0.72);
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
                vr_ctx.close()
                print('PASS: Meta Quest 3 VR UI rendered cleanly with forward-positioned note (y=1.24, z=-0.68) and zero errors')

                # =====================================================================
                # 4. PHISHING FISHING INSTANT VERDICT POPUP + PAUSED TIMER (EN & ZH)
                # =====================================================================
                pf_ctx = make_ctx(False, 1366, 860)
                pf = pf_ctx.new_page()
                pf.goto(BASE + '/games/phishing-fishing/game.html?demo=1&lang=en')
                pf.wait_for_selector('#start-game')
                pf.click('#start-game')
                pf.wait_for_selector('[data-answer="phishing"]')
                pf.locator('[data-answer="phishing"]').first.click()
                pf.wait_for_selector('#pf-verdict-modal')
                t_before = pf.inner_text('#timer-value')
                pf.wait_for_timeout(1600)
                t_after = pf.inner_text('#timer-value')
                assert t_before == t_after, f'Timer moved while verdict popup open: {t_before} -> {t_after}'
                assert 'Timer paused' in pf.inner_text('.pf-verdict-paused')
                assert len(pf.inner_text('.pf-verdict-reason').strip()) > 10
                pf.screenshot(path=str(EVIDENCE / '11_phishing_verdict_popup_en.png'))
                pf.click('#pf-verdict-next')
                pf.wait_for_selector('#pf-verdict-modal', state='detached')
                # Verify Chinese mode verdict popup translates cleanly too
                pf.goto(BASE + '/games/phishing-fishing/game.html?demo=1&lang=zh')
                pf.wait_for_selector('#start-game')
                pf.click('#start-game')
                pf.locator('[data-answer="legitimate"]').first.click()
                pf.wait_for_selector('#pf-verdict-modal')
                assert '计时已暂停' in pf.inner_text('.pf-verdict-paused')
                pf.screenshot(path=str(EVIDENCE / '12_phishing_verdict_popup_zh.png'))
                pf_ctx.close()
                print('PASS: Phishing Fishing instant verdict popup (EN & ZH) pauses timer cleanly with 1-line reasoning')

                assert not errors, f'JS errors detected: {errors}'
                browser.close()
        finally:
            server.terminate()
            server.wait(timeout=5)


if __name__ == '__main__':
    run()
