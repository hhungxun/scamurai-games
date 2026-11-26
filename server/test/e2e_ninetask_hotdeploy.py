"""Hot-deploy guard for the nine-task Station 2 release.

An outer Station 2 tab opened before the release keeps its old station.js (strict 12-task check) in memory.
This test serves that old station.js to one tab and the new one to another, then draws and starts tasks in both:
- old tab: 12-task pool, retired tasks still playable, no glass styling, no page errors;
- refreshed tab: 9-task pool, glass styling, no page errors.
"""
import os
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright
import e2e_participant as api

ROOT = Path(__file__).resolve().parents[2]
BASE = api.BASE = 'http://127.0.0.1:3061'
OLD_STATION_JS = os.environ.get('OLD_STATION_JS')  # path to the pre-release station.js
KEY = 'close-popups:station2:v1'


def run():
    assert OLD_STATION_JS and Path(OLD_STATION_JS).is_file(), 'set OLD_STATION_JS to the pre-release station.js'
    old_js = Path(OLD_STATION_JS).read_text()
    assert 'pool.length !== 12' in old_js and 'taskPool' not in old_js
    with tempfile.TemporaryDirectory(prefix='scamurai-ninetask-') as data:
        env = dict(os.environ, PORT='3061', DATA_DIR=data, STAFF_PIN='1111', ADMIN_PIN='9999',
                   STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005')
        server = subprocess.Popen(['node', 'server.js'], cwd=ROOT / 'server', env=env, stdout=subprocess.DEVNULL)
        try:
            api.wait_server()
            for pid in ['NT001', 'NT002', 'NT003']:
                api.ok('POST', '/api/participants', {'id': pid, 'name': pid, 'ageGroup': '19–21', 'pbbAccount': False,
                                                     'scamExposure': 'no', 'consent': True}, pin='1111')
            with sync_playwright() as pw:
                browser = pw.chromium.launch()

                def station(legacy):
                    context = browser.new_context(viewport={'width': 1440, 'height': 960}, reduced_motion='reduce')
                    errors = []
                    context.on('page', lambda p: p.on('pageerror', lambda e: errors.append(str(e))))
                    if legacy:
                        context.route('**/games/close-the-popups/station.js*',
                                      lambda route: route.fulfill(status=200, body=old_js, content_type='text/javascript; charset=utf-8'))
                    page = context.new_page()
                    page.goto(BASE + '/games/close-the-popups/?lang=en')
                    page.locator('.scm input[type=password]').fill('5002')
                    page.locator('.scm .go').click()
                    page.wait_for_function("!document.getElementById('next').hidden")
                    return context, page, errors

                def frame(page):
                    return page.locator('#game').element_handle().content_frame()

                def play(page, pid, task_id):
                    if not page.locator('.scm .find').is_visible():
                        page.click('#staff-toggle'); page.click('#next')
                    page.locator(f'.scm .it[data-id="{pid}"]').wait_for()
                    page.locator('.scm .find').fill(pid)
                    page.locator('.scm .go').click()
                    page.wait_for_function('([k,pid])=>JSON.parse(sessionStorage.getItem(k))?.participant.id===pid', arg=[KEY, pid])
                    f = frame(page); f.wait_for_selector('#booth-random')
                    info = f.evaluate('''()=>({legacy:window.BROWSE_BOOTH_LEGACY_HOST, ids:BROWSE_BOOTH_TASKS.map(t=>t.id),
                        cards:document.querySelectorAll('.booth-task-card').length})''')
                    index = info['ids'].index(task_id)
                    page.evaluate('(i)=>{window.__r=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{a[0]=i;return a}}', index)
                    f.click('#booth-random'); f.wait_for_selector('#booth-start')
                    page.evaluate('()=>{crypto.getRandomValues=window.__r}')
                    drawn = page.evaluate('(k)=>JSON.parse(sessionStorage.getItem(k)).taskId', KEY)
                    assert drawn == task_id, (drawn, task_id)
                    f.click('#booth-start'); f.wait_for_selector('[data-booth-submit]')
                    info['glass'] = frame(page).evaluate("document.body.classList.contains('task-glass')")
                    return info

                # Old outer tab (pre-release station.js still in memory).
                ctx, page, errors = station(legacy=True)
                info = play(page, 'NT001', 'minute2-recipe-budget')
                assert info['legacy'] is True and len(info['ids']) == 12, info
                assert info['cards'] in (0, 12), info
                print('PASS: old outer tab keeps the 12-task pool and a now-retired task draws and starts')
                ctx.close()
                ctx, page, errors2 = station(legacy=True)
                info = play(page, 'NT002', 'minute3-courier-redelivery')
                assert info['glass'] is False, info
                print('PASS: old outer tab gets no glass styling on a themed site')
                ctx.close()
                assert not errors and not errors2, errors + errors2

                # Refreshed outer tab (new station.js).
                ctx, page, errors = station(legacy=False)
                info = play(page, 'NT003', 'minute3-courier-redelivery')
                assert info['legacy'] is False and len(info['ids']) == 9, info
                assert not {'minute2-recipe-budget', 'minute2-tool-webp', 'minute2-market-lens'} & set(info['ids'])
                assert info['glass'] is True, info
                ctx.close()
                assert not errors, errors
                print('PASS: refreshed outer tab draws from 9 tasks with glass styling, no page errors')
                browser.close()
        finally:
            server.terminate(); server.wait(timeout=10)


if __name__ == '__main__':
    run()
