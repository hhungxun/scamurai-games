#!/usr/bin/env python3
"""Station 2 integration on temporary data; never accesses production."""
import os
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright
import e2e_participant as api

ROOT = Path(__file__).resolve().parents[2]
TEST_PORT = os.environ.get('POPUP_TEST_PORT', '3046')
BASE = api.BASE = 'http://127.0.0.1:' + TEST_PORT
KEY = 'close-popups:station2:v1'


def run():
    with tempfile.TemporaryDirectory(prefix='scamurai-popup-') as data:
        env = dict(os.environ, PORT=TEST_PORT, DATA_DIR=data, STAFF_PIN='1111', ADMIN_PIN='9999',
                   STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005')
        server = subprocess.Popen(['node', 'server.js'], cwd=ROOT / 'server', env=env, stdout=subprocess.DEVNULL)
        try:
            api.wait_server()
            people = {}
            for pid in ['POP001', 'POP002', 'POP003', 'POP004']:
                people[pid] = api.ok('POST', '/api/participants', {'id': pid, 'name': pid,
                    'ageGroup': '19–21', 'pbbAccount': False, 'scamExposure': 'no', 'consent': True}, pin='1111')
            with sync_playwright() as pw:
                browser = pw.chromium.launch()
                context = browser.new_context(viewport={'width': 1440, 'height': 960}, reduced_motion='reduce')
                errors, missing = [], []
                context.on('page', lambda p: p.on('pageerror', lambda e: errors.append(str(e))))
                page = context.new_page()
                page.on('response', lambda r: missing.append(r.url) if r.status == 404 else None)
                page.goto(BASE + '/games/close-the-popups/?lang=en')
                page.locator('.scm input[type=password]').fill('5002')
                page.locator('.scm .go').click()
                page.wait_for_function("!document.getElementById('next').hidden")

                def frame():
                    return page.locator('#game').element_handle().content_frame()

                def state():
                    return page.evaluate('(key)=>JSON.parse(sessionStorage.getItem(key))', KEY)

                def select(pid):
                    if not page.locator('.scm .find').is_visible():
                        page.click('#staff-toggle'); page.click('#next')
                    page.locator(f'.scm .it[data-id="{pid}"]').wait_for()
                    page.locator('.scm .find').fill(pid)
                    page.locator('.scm .go').click()
                    page.wait_for_function('(pid)=>JSON.parse(sessionStorage.getItem("close-popups:station2:v1"))?.participant.id===pid', arg=pid)
                    frame().wait_for_selector('#booth-random')

                def start(task_id=None):
                    if task_id:
                        index = frame().evaluate('(id)=>BROWSE_BOOTH_TASKS.findIndex(t=>t.id===id)', task_id)
                        assert index >= 0, task_id
                        page.evaluate('(index)=>{window.originalRandom=crypto.getRandomValues.bind(crypto); crypto.getRandomValues=(a)=>{a[0]=index;return a}}', index)
                    frame().click('#booth-random')
                    frame().wait_for_selector('#booth-start')
                    if task_id: page.evaluate('()=>{crypto.getRandomValues=window.originalRandom;}')
                    task = frame().evaluate('new URLSearchParams(location.search).get("task")')
                    assert state()['taskId'] == task
                    assert frame().locator('.booth-task-card:visible').count() == 0
                    frame().goto(BASE + '/games/close-the-popups/browse/booth.html?lang=en')
                    frame().click('#booth-random'); frame().wait_for_selector('#booth-start')
                    assert frame().evaluate('new URLSearchParams(location.search).get("task")') == task
                    frame().click('#booth-start')
                    frame().wait_for_selector('[data-booth-submit]')
                    return task

                select('POP001')
                round_id = state()['roundId']
                page.reload(); page.wait_for_function("document.getElementById('participant-name').textContent.includes('POP001')")
                assert state()['roundId'] == round_id
                start('minute3-search-official')
                before = frame().evaluate('BROWSE_BOOTH.list()[0]')
                page.reload(); frame().wait_for_selector('[data-booth-submit]')
                after = frame().evaluate('BROWSE_BOOTH.list()[0]')
                assert (before['id'], before['deadline']) == (after['id'], after['deadline'])
                print('PASS: participant binding and absolute game deadline survive full refresh')

                # A successful save whose response is lost must retry exactly once logically.
                calls = []
                def lose_response(route):
                    calls.append(route.request.post_data_json)
                    response = route.fetch()
                    assert response.status == 200
                    route.abort('failed')
                page.route('**/api/rounds/*/finish', lose_response)
                frame().locator('[data-booth-submit]').click(force=True)
                page.wait_for_function("JSON.parse(sessionStorage.getItem('close-popups:station2:v1')).status==='pending'")
                page.wait_for_function("!document.getElementById('retry').disabled")
                assert len(calls) == 1
                page.unroute('**/api/rounds/*/finish')
                page.reload()
                page.wait_for_function("JSON.parse(sessionStorage.getItem('close-popups:station2:v1')).status==='saved'")
                saved = state()
                assert saved['score'] == saved['result']['pct'] == calls[0]['score'] == 50
                profile = api.ok('GET', '/api/participant/me', participant=people['POP001']['participantToken'])
                assert profile['stations'][1]['score'] == saved['score']
                assert profile['stations'][1]['name'] == 'Close the Pop-ups'
                assert len(api.ok('GET', '/api/rounds/open', pin='5002')) == 0
                print('PASS: displayed score equals participant score; lost finish response retries idempotently')

                select('POP002'); start()
                page.click('#staff-toggle'); page.click('#void'); page.click('#confirm-void')
                page.wait_for_function("JSON.parse(sessionStorage.getItem('close-popups:station2:v1')).status==='cancelled'")
                profile = api.ok('GET', '/api/participant/me', participant=people['POP002']['participantToken'])
                assert profile['stations'][1]['score'] is None
                assert not api.ok('GET', '/api/rounds/open', pin='5002')
                page.click('#next'); page.locator('.scm .close').click()
                assert state() is None
                print('PASS: cancellation records no score; cancelled next-picker leaves nobody selected')

                # Every shipped task has a reachable scene and local runtime dependencies.
                probe = context.new_page(); probe.on('response', lambda r: missing.append(r.url) if r.status == 404 else None); probe.goto(BASE + '/games/close-the-popups/browse/booth.html?lang=en')
                tasks = probe.evaluate('BROWSE_BOOTH_TASKS.map(t=>t.id)')
                assert len(tasks) == 12
                for task in tasks:
                    url = probe.evaluate('(id)=>BROWSE_BOOTH.entryURL(BROWSE_BOOTH.create(id,"clean","en"))', task)
                    probe.goto(url); probe.wait_for_selector('[data-booth-submit]')
                    probe.goto(BASE + '/games/close-the-popups/browse/booth.html?lang=en')
                print('PASS: all 12 task scenes load with no missing assets or JavaScript errors')
                assert not missing, missing
                assert not errors, errors

                # The real timeout path, including ending animation and durable save.
                select('POP003'); start()
                page.wait_for_function("JSON.parse(sessionStorage.getItem('close-popups:station2:v1')).status==='saved'", timeout=75000)
                result = frame().evaluate('BROWSE_BOOTH.list()[0]')
                assert result['reason'] == 'timeout'
                assert result['endedAt'] - result['startedAt'] == 60000
                assert state()['score'] == frame().evaluate('BROWSE_BOOTH_SCORE_LAST.total')
                ending = frame().locator('dialog[aria-label="Round ending"]')
                ending.wait_for(state='visible')
                ending.get_by_role('button', name='Skip animation').click()
                frame().goto(frame().url)
                frame().wait_for_selector('.booth-score')
                assert frame().locator('dialog[aria-label="Round ending"]').count() == 0
                print('PASS: real 60-second timeout saves score, ending skips and never replays after reload')

                select('POP004'); start('minute2-travel-interchange')
                frame().locator('.br-interrupt:not([inert]) [data-br-close]:visible').first.click(timeout=8000)
                frame().locator('select[name=from]').select_option('klcc')
                frame().locator('select[name=to]').select_option('bukit-kg')
                frame().locator('input[name=time]').fill('17:20')
                frame().locator('select[name=pref]').select_option('walking')
                frame().get_by_role('button', name='Find a route').click()
                frame().locator('.jt-route-selected a').first.click()
                frame().locator('[data-save-trip]').click()
                assert frame().locator('[data-save-trip]').get_attribute('aria-pressed') == 'true'
                frame().locator('[data-booth-submit]').click()
                page.wait_for_function("JSON.parse(sessionStorage.getItem('close-popups:station2:v1')).status==='saved'")
                score = frame().evaluate('BROWSE_BOOTH_SCORE_LAST')
                assert (score['task']['score'], score['time']['score'], score['resilience']['score']) == (40, 40, 12), score
                assert state()['score'] == score['total'] == 92, state()
                print('PASS: actual task controls and one real popup close earn 92; assignment cannot be rerolled')
                for n, points, maximum in [(1, 100, 100), (3, 100, 100), (4, 100, 100), (5, 480, 800)]:
                    r = api.ok('POST', '/api/rounds', {'participantId': 'POP004'}, pin=f'500{n}')
                    round_path = f'/api/rounds/{r["roundId"]}'
                    if n == 5:
                        api.ok('POST', f'{round_path}/events', {'data': {'t': 'scan'}}, token=r['token'])
                    api.ok('POST', f'{round_path}/finish', {'score': points, 'maxScore': maximum}, pin=f'500{n}')
                profile = api.ok('GET', '/api/participant/me', participant=people['POP004']['participantToken'])
                assert profile['total'] == 452 and len(profile['stationsDone']) == 5
                leaderboard = api.ok('GET', '/api/leaderboard')
                assert any(row['total'] == 452 for row in leaderboard['rows'])
                print('PASS: Station 2 contributes exactly 92 to the five-station leaderboard total')

                browser.close()
        finally:
            server.terminate(); server.wait(timeout=5)


if __name__ == '__main__':
    run()
