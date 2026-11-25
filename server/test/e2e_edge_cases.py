#!/usr/bin/env python3
"""Deep edge-case & stress E2E tests for Scamurai event day:
  1. Unregistered phone scans Game 1 General Join QR -> self-registers -> auto-returns & starts screen
  2. MAX_TRIES=2, already-playing, and checked-out players scanning Game 1 QR: rejected cleanly WITHOUT burning the screen's waiting QR
  3. Switching Normal <-> VR / clicking New QR expires old slot without disturbing the other tab
  4. Phishing Fishing edge cases:
     - Reload while verdict popup is open (resumes cleanly on next email, timer unfrozen)
     - Keyboard spam (L/P blocked while popup open, Enter advances exactly 1 email)
     - Cumulative paused popup reading time > 120s (well beyond 90s wall-clock) still accepted by server & client
     - Network drop on /answer degrades gracefully to pending verdict, retries before /finish, saves exact score
  5. Game 1 VR cash position edge cases:
     - Forward VR position (y=1.24, z=-0.68) persists across updateFrame() and next-note buildBanknote()
     - Exiting VR cleanly restores desktop position (y=1.13, z=-0.48)
"""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
from playwright.sync_api import sync_playwright
import e2e_participant as api

ROOT = Path(__file__).resolve().parents[2]
BASE = 'http://127.0.0.1:3054'
api.BASE = BASE

PF_CLASS = json.loads(
    re.search(r'=\s*(\{.*\})', (ROOT / 'games/phishing-fishing/demo-answers.js').read_text(), re.S).group(1)
)


def run():
    with tempfile.TemporaryDirectory(prefix='scamurai-edge-') as data:
        env = dict(
            os.environ,
            PORT='3054',
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
                    args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
                )
                errors = []

                def ctx(mobile=False, w=1440, h=900):
                    c = browser.new_context(
                        viewport={'width': w, 'height': h},
                        is_mobile=mobile,
                        has_touch=mobile,
                        reduced_motion='reduce',
                    )
                    c.on('page', lambda p: p.on('pageerror', lambda e: errors.append(f'{p.url}: {e}')))
                    return c

                # =============================================================
                # 1. UNREGISTERED PHONE -> GENERAL JOIN QR -> SELF-REG -> AUTO-START
                # =============================================================
                booth_ctx = ctx(False, 1440, 900)
                tab_norm = booth_ctx.new_page()
                tab_norm.goto(BASE + '/games/spot-the-fake-cash/?mode=normal')
                tab_norm.fill('.scm input[type=password]', '5001')
                tab_norm.click('.scm .go')
                tab_norm.wait_for_selector('#slot-qr svg', timeout=10000)

                tab_vr = booth_ctx.new_page()
                tab_vr.goto(BASE + '/games/spot-the-fake-cash/?mode=vr')
                tab_vr.wait_for_selector('#slot-qr svg', timeout=10000)

                norm_url = tab_norm.evaluate('window.S1_SLOT_URL')
                vr_url = tab_vr.evaluate('window.S1_SLOT_URL')

                # Fresh unregistered phone opens Normal tab's QR URL directly
                unreg_ctx = ctx(True, 390, 844)
                up = unreg_ctx.new_page()
                up.goto(norm_url)
                up.wait_for_selector('a[href*="/self-register.html?next="]', timeout=10000)
                up.click('a[href*="/self-register.html?next="]')
                up.wait_for_selector('#form:visible', timeout=10000)
                up.fill('#sid', 'UNREG01')
                up.fill('#name', 'Nadia Ong')
                for name, value in [('age', '19–21'), ('pbb', 'yes'), ('exp', 'no')]:
                    up.locator(f'label:has(input[name="{name}"][value="{value}"])').click()
                up.check('#consent')
                up.click('#go')
                up.wait_for_selector('#doneCard:visible', timeout=10000)
                # Return button points back to join.html#<slotId>
                assert 'Continue to Station 1' in up.text_content('#openPageBtn')
                up.click('#openPageBtn')
                up.wait_for_url('**/games/spot-the-fake-cash/join.html**', timeout=10000)
                up.wait_for_selector('#box.ok', timeout=10000)
                assert 'Nadia Ong' in up.text_content('.join-who')

                # Normal tab auto-started for Nadia Ong; VR tab stayed untouched!
                tab_norm.wait_for_function("document.getElementById('booth-identity').textContent.includes('Nadia Ong')", timeout=10000)
                nf = tab_norm.locator('#booth-frame').element_handle().content_frame()
                nf.wait_for_selector('#action-bar:visible', timeout=15000)
                assert tab_vr.locator('#booth-idle').is_visible()
                print('PASS: Edge 1 — unregistered phone scans Station 1 QR -> self-registers -> auto-returns & starts screen')

                # =============================================================
                # 2. ALREADY-PLAYING, MAX_TRIES=2 & CHECKED-OUT REJECTIONS PRESERVE WAITING QR
                # =============================================================
                # Nadia Ong (currently playing on Tab Normal) scans Tab VR's QR -> 409, Tab VR QR stays waiting!
                up.goto(vr_url)
                up.wait_for_selector('#box.err-card', timeout=10000)
                assert 'already playing' in up.inner_text('#box').lower()
                assert tab_vr.locator('#booth-idle').is_visible()

                # Create a player who already used MAX_TRIES=2 on Station 1
                maxed = api.ok('POST', '/api/participants/self', {
                    'id': 'MAXED01', 'name': 'Maxed Player', 'ageGroup': '19–21',
                    'pbbAccount': False, 'scamExposure': 'no', 'consent': True
                })
                for _ in range(2):
                    r = api.ok('POST', '/api/rounds', {'participantId': 'MAXED01'}, pin='5001')
                    api.ok('POST', f'/api/rounds/{r["roundId"]}/deal', {}, pin='5001')
                    api.ok('POST', f'/api/rounds/{r["roundId"]}/finish', {'score': 50, 'maxScore': 100}, pin='5001')

                max_ctx = ctx(True, 390, 844)
                mp = max_ctx.new_page()
                mp.goto(BASE + '/participant.html#' + maxed['participantToken'])
                mp.wait_for_selector('#participant-name')
                mp.goto(vr_url)
                mp.wait_for_selector('#box.err-card', timeout=10000)
                assert 'both tries' in mp.inner_text('#box').lower()
                max_ctx.close()

                # Create a checked-out player -> scans Tab VR's QR -> rejected, Tab VR QR STILL waiting!
                left = api.ok('POST', '/api/participants/self', {
                    'id': 'LEFT01', 'name': 'Checked Out', 'ageGroup': '19–21',
                    'pbbAccount': False, 'scamExposure': 'no', 'consent': True
                })
                lr = api.ok('POST', '/api/rounds', {'participantId': 'LEFT01'}, pin='5002')
                api.ok('POST', f'/api/rounds/{lr["roundId"]}/finish', {'score': 50, 'maxScore': 100}, pin='5002')
                api.ok('POST', '/api/checkout', {'participantId': 'LEFT01', 'answers': {
                    's2q1': 'Checking where buttons and links lead', 's2q2': '4',
                    'g1': '5', 'g3': '2. Close the Pop-ups'
                }}, pin='5004')
                left_ctx = ctx(True, 390, 844)
                lp = left_ctx.new_page()
                lp.goto(BASE + '/participant.html#' + left['participantToken'])
                lp.wait_for_selector('#participant-name')
                lp.goto(vr_url)
                lp.wait_for_selector('#box.err-card', timeout=10000)
                assert 'checked out' in lp.inner_text('#box').lower()
                left_ctx.close()

                # Now an eligible player scans THAT EXACT SAME vr_url -> succeeds immediately!
                elig = api.ok('POST', '/api/participants/self', {
                    'id': 'ELIG01', 'name': 'Eligible Sam', 'ageGroup': '19–21',
                    'pbbAccount': False, 'scamExposure': 'no', 'consent': True
                })
                elig_ctx = ctx(True, 390, 844)
                ep = elig_ctx.new_page()
                ep.goto(BASE + '/participant.html#' + elig['participantToken'])
                ep.wait_for_selector('#participant-name')
                ep.goto(vr_url)
                ep.wait_for_selector('#box.ok', timeout=10000)
                assert 'Eligible Sam' in ep.text_content('.join-who')
                tab_vr.wait_for_function("document.getElementById('booth-identity').textContent.includes('Eligible Sam')", timeout=10000)
                print('PASS: Edge 2 — already-playing, MAX_TRIES=2, and checked-out scans rejected cleanly without burning screen QR')

                # =============================================================
                # 3. NEW QR & MODE SWITCH EXPIRES OLD SLOT, LEAVES OTHER TAB UNTOUCHED
                # =============================================================
                # Cancel Tab VR's round -> mints fresh QR -> click New QR -> old QR returns expired/in-use
                tab_vr.once('dialog', lambda d: d.accept())
                tab_vr.click('#booth-cancel')
                tab_vr.wait_for_selector('#slot-qr svg', timeout=10000)
                slot_before = tab_vr.evaluate('window.S1_SLOT_URL')
                tab_vr.click('#slot-refresh')
                tab_vr.wait_for_function('(old) => window.S1_SLOT_URL && window.S1_SLOT_URL !== old', arg=slot_before)
                ep.goto(slot_before)
                ep.wait_for_selector('#box.err-card', timeout=10000)
                # Tab Normal still running Nadia Ong untouched!
                assert 'Nadia Ong' in tab_norm.inner_text('#booth-identity')
                unreg_ctx.close()
                elig_ctx.close()
                booth_ctx.close()
                print('PASS: Edge 3 — New QR invalidates previous slot cleanly without disturbing the other tab')

                # =============================================================
                # 4. PHISHING FISHING EDGE CASES (RELOAD IN POPUP, KEY SPAM, >120s PAUSE, NETWORK DROP)
                # =============================================================
                pf_player = api.ok('POST', '/api/participants/self', {
                    'id': 'PFEDGE1', 'name': 'Phish Tester', 'ageGroup': '19–21',
                    'pbbAccount': False, 'scamExposure': 'no', 'consent': True
                })
                pf_ctx = ctx(False, 1440, 960)
                pf = pf_ctx.new_page()
                pf.clock.install()
                pf.goto(BASE + '/games/phishing-fishing/?lang=en')
                pf.fill('.scm input[type=password]', '5003')
                pf.click('.scm .go')
                pf.locator('.scm .it[data-id="PFEDGE1"]').wait_for()
                pf.fill('.scm .find', 'PFEDGE1')
                pf.click('.scm .go')
                f = lambda: pf.locator('#booth-frame').element_handle().content_frame()
                f().wait_for_selector('#start-game')
                f().click('#start-game')

                # Edge 4a: Answer Email 1, reload WHILE verdict popup is open -> restores Email 2 & unfrozen timer!
                qid1 = f().locator('[data-question]').first.get_attribute('data-question')
                f().locator(f'[data-answer="{PF_CLASS[qid1]}"]').first.click()
                f().wait_for_selector('#pf-verdict-modal')
                pf.clock.fast_forward(20000)  # 20s paused while popup open
                pf.reload()
                f().wait_for_selector('[data-question]')
                assert f().locator('#pf-verdict-modal').count() == 0
                qid2 = f().locator('[data-question]').first.get_attribute('data-question')
                assert qid2 != qid1
                t_before = f().locator('#timer-value').inner_text()
                pf.clock.fast_forward(3000)
                t_after = f().locator('#timer-value').inner_text()
                assert t_after != t_before, f'Timer stayed frozen after reload! {t_before} -> {t_after}'
                print('PASS: Edge 4a — reload during Phishing Fishing verdict popup restores next email and resumes timer')

                # Edge 4b: Spam L/P keys while popup is open (must be ignored), then Enter advances exactly 1 email
                f().locator(f'[data-answer="{PF_CLASS[qid2]}"]').first.click()
                f().wait_for_selector('#pf-verdict-modal')
                f().locator('#pf-verdict-next').press('l')
                f().locator('#pf-verdict-next').press('p')
                assert f().locator('#pf-verdict-modal').is_visible()
                pf.clock.fast_forward(25000)  # another 25s paused
                f().locator('#pf-verdict-next').press('Enter')
                f().wait_for_selector('#pf-verdict-modal', state='detached')
                qid3 = f().locator('[data-question]').first.get_attribute('data-question')
                assert qid3 != qid2
                assert f().locator('.email-progress .answered').count() == 2
                print('PASS: Edge 4b — L/P blocked while verdict popup open; Enter advances by exactly 1 email')

                # Edge 4c: Network drop on Email 3's /answer -> fallback popup, queued retry, then >120s total pause
                dropped_once = {'done': False}
                def drop_one_answer(route):
                    if not dropped_once['done']:
                        dropped_once['done'] = True
                        route.abort('failed')
                    else:
                        route.continue_()
                pf.route('**/api/rounds/*/answer', drop_one_answer)
                f().locator(f'[data-answer="{PF_CLASS[qid3]}"]').first.click()
                f().wait_for_selector('#pf-verdict-modal')
                assert 'Answer recorded' in f().locator('#pf-verdict-modal').inner_text()
                pf.unroute('**/api/rounds/*/answer')
                pf.clock.fast_forward(25000)
                f().click('#pf-verdict-next')
                f().wait_for_selector('#pf-verdict-modal', state='detached')

                # Answer remaining 7 emails, pausing 15s on each (>175s total paused reading time across round!)
                for _ in range(7):
                    qid = f().locator('[data-question]').first.get_attribute('data-question')
                    f().locator(f'[data-answer="{PF_CLASS[qid]}"]').first.click()
                    f().wait_for_selector('#pf-verdict-modal')
                    pf.clock.fast_forward(15000)
                    f().click('#pf-verdict-next')
                    f().wait_for_selector('#pf-verdict-modal', state='detached')

                pf.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1')).status === 'saved'", timeout=15000)
                saved_state = pf.evaluate("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1'))")
                assert saved_state['score'] == 100, saved_state
                assert saved_state['snapshot']['pausedMs'] >= 150000, saved_state['snapshot']
                pf_ctx.close()
                print('PASS: Edge 4c — network drop on /answer + >150s cumulative paused reading time still saves 100 / 100!')

                # =============================================================
                # 5. GAME 1 VR FORWARD CASH POSITION PERSISTENCE ACROSS NOTES & EXIT
                # =============================================================
                vr_ctx = ctx(False, 1280, 760)
                vp = vr_ctx.new_page()
                vp.goto(BASE + '/games/spot-the-fake-cash/game.html?demo=1')
                vp.wait_for_selector('#start-game-btn:not([disabled])', timeout=15000)
                vp.click('#start-game-btn')
                vp.wait_for_selector('#action-bar:visible')
                positions = vp.evaluate("""() => {
                    const s = window.__FAKECASH_STAGE__;
                    const vr = window.__FAKECASH_VR__;
                    const desktopBefore = [s.banknoteMesh.position.y, s.banknoteMesh.position.z];
                    vr.setPreviewMode(true, { mode: 'playing' });
                    s.updateFrame();
                    const vrNote1 = [s.banknoteMesh.position.y, s.banknoteMesh.position.z];
                    // Advance to Note 2 while still in VR -> must STAY at forward VR position!
                    document.getElementById('pass-btn').click();
                    document.getElementById('feedback-next-btn').click();
                    s.updateFrame();
                    const vrNote2 = [s.banknoteMesh.position.y, s.banknoteMesh.position.z];
                    // Exit VR preview -> must restore desktop position cleanly!
                    vr.setPreviewMode(false);
                    s.updateFrame();
                    const desktopAfter = [s.banknoteMesh.position.y, s.banknoteMesh.position.z];
                    return { desktopBefore, vrNote1, vrNote2, desktopAfter };
                }""")
                assert abs(positions['desktopBefore'][0] - 1.13) < 0.01 and abs(positions['desktopBefore'][1] - (-0.48)) < 0.01, positions
                assert abs(positions['vrNote1'][0] - 1.24) < 0.01 and abs(positions['vrNote1'][1] - (-0.68)) < 0.01, positions
                assert abs(positions['vrNote2'][0] - 1.24) < 0.01 and abs(positions['vrNote2'][1] - (-0.68)) < 0.01, positions
                assert abs(positions['desktopAfter'][0] - 1.13) < 0.01 and abs(positions['desktopAfter'][1] - (-0.48)) < 0.01, positions
                vr_ctx.close()
                print('PASS: Edge 5 — VR forward cash position (y=1.24, z=-0.68) persists across notes & restores desktop on exit')

                assert not errors, f'JS errors detected: {errors}'
                browser.close()
        finally:
            server.terminate()
            server.wait(timeout=5)


if __name__ == '__main__':
    run()
