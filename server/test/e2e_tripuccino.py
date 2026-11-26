"""Desktop flight task regression, with an isolated temporary server/database."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright, expect
import e2e_participant as api

ROOT = Path(__file__).resolve().parents[2]
BASE = api.BASE = 'http://127.0.0.1:8957'


def choose(frame, date='2027-01-23'):
    for field, code in [('from', 'KUL'), ('to', 'TPE')]:
        frame.locator(f'[data-airport={field}]').click()
        frame.locator('#tc-airport-query').fill(code)
        frame.locator(f'[data-code={code}]').first.click()
    frame.locator('[data-action=calendar]').click()
    frame.locator(f'[data-date="{date}"]').click()


def book(frame, flight='od698', bundle='basic'):
    frame.locator('[data-sort=price]').click()
    frame.locator(f'[data-select={flight}]').click()
    frame.locator(f'[data-bundle={bundle}]').click()
    frame.locator('#tc-passenger-confirm').check()
    frame.locator('#tc-traveller-form button[type=submit]').click()
    frame.locator('#tc-extras-form button[type=submit]').click()
    frame.locator('#tc-terms').check()
    frame.locator('#tc-pay').click()
    expect(frame.locator('.tc-ticket')).to_be_visible()


def run():
    with tempfile.TemporaryDirectory(prefix='tripuccino-test-') as data:
        env = dict(os.environ, PORT='8957', DATA_DIR=data, STAFF_PIN='1111', STATION_PINS='2:5002')
        server = subprocess.Popen(['node', 'server.js'], cwd=ROOT/'server', env=env, stdout=subprocess.DEVNULL)
        try:
            api.wait_server()
            api.ok('POST', '/api/participants', {'id':'TRIP001', 'name':'Flight Test', 'ageGroup':'19–21', 'pbbAccount':False, 'scamExposure':'no', 'consent':True}, pin='1111')
            with sync_playwright() as pw:
                browser = pw.chromium.launch()
                context = browser.new_context(viewport={'width':1440,'height':1000}, accept_downloads=True)
                errors, missing = [], []
                context.on('page', lambda p: p.on('pageerror', lambda e: errors.append(str(e))))
                page = context.new_page()
                page.on('response', lambda r: missing.append(r.url) if r.status >= 400 else None)
                page.goto(BASE+'/games/close-the-popups/?lang=en')
                page.locator('input[type=password]').fill('5002')
                page.get_by_role('button', name='UNLOCK').click()
                page.locator('input.find').fill('TRIP001')
                page.locator('button.go').click()
                frame = page.locator('#game').element_handle().content_frame()
                expect(frame.locator('#booth-random')).to_be_visible()
                frame.wait_for_function('window.BROWSE_BOOTH_TASKS?.length===9')
                task_index = frame.evaluate("BROWSE_BOOTH_TASKS.findIndex(t=>t.id==='minute5-taipei-flight')")
                page.evaluate('index=>{window.savedRandom=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{if(a instanceof Uint32Array&&a.length===1){a[0]=index;return a}return savedRandom(a)}}', task_index)
                frame.locator('#booth-random').click()
                expect(frame.locator('#booth-start')).to_be_visible()
                page.evaluate('()=>{crypto.getRandomValues=window.savedRandom}')
                assert 'Semester break in Taiwan' in frame.locator('body').inner_text()
                frame.locator('#booth-start').click()
                expect(frame.locator('.tc-search-submit')).to_be_visible()
                rid = frame.evaluate('new URL(location.href).searchParams.get("round")')
                assert 'SIN' in frame.locator('[data-from]').inner_text()
                choose(frame)
                frame.locator('.tc-search-submit').click()
                book(frame)
                assert frame.evaluate('(id)=>BROWSE_BOOTH.conditions(BROWSE_BOOTH.get(id)).allMet', rid)
                with page.expect_download() as download:
                    frame.locator('[data-action=download]').click()
                assert 'MYR 467' in Path(download.value.path()).read_text(encoding='utf-8')
                frame.locator('[data-booth-submit]').click()
                expect(frame.locator('#station-score-status')).to_contain_text('Score saved to the event')
                print('PASS: real participant draw, booking, itinerary and server score', flush=True)

                # Independent practice rounds exercise partial credit and native ad navigation.
                for scenario in ['correct','date','expensive','extras','timeout']:
                    page.goto(BASE+'/games/close-the-popups/?demo=1&lang=en')
                    page.evaluate('sessionStorage.clear()')
                    page.reload()
                    if page.locator('input[type=password]').count():
                        page.locator('input[type=password]').fill('5002')
                        page.get_by_role('button', name='UNLOCK').click()
                    frame = page.locator('#game').element_handle().content_frame()
                    if scenario != 'timeout':
                        frame.locator('#booth-history summary').click()
                        frame.get_by_role('link', name='Difficulty test · no ads').click()
                    frame.locator('[data-booth-task="minute5-taipei-flight"]').click()
                    frame.locator('#booth-start').click()
                    expect(frame.locator('.tc-search-submit')).to_be_visible()
                    rid = frame.evaluate('new URL(location.href).searchParams.get("round")')
                    choose(frame, '2027-01-26' if scenario=='date' else '2027-01-23')
                    frame.locator('.tc-search-submit').click()
                    if scenario == 'timeout':
                        expect(frame.locator('.br-ad-cta').first).to_be_visible(timeout=12000)
                        with page.expect_popup() as popup:
                            frame.locator('.br-ad-cta').first.click()
                        child=popup.value
                        child.wait_for_load_state()
                        assert child.evaluate('opener===null')
                        child.close()
                        frame.locator('body').press('Escape')
                    book(frame, 'ak138' if scenario=='expensive' else 'od698', 'baggage' if scenario=='extras' else 'basic')
                    want = [False,False,True] if scenario=='date' else [True,False,True] if scenario in ['expensive','extras'] else [True,True,True]
                    assert frame.evaluate('(id)=>BROWSE_BOOTH.conditions(BROWSE_BOOTH.get(id)).checks.map(c=>c.met)', rid)==want
                    if scenario == 'timeout':
                        print('PASS: native ad tab and preserved booking; awaiting actual 60s deadline', flush=True)
                        expect(frame.locator('[data-booth-view=result]')).to_be_visible(timeout=65000)
                        result=frame.evaluate('(id)=>BROWSE_BOOTH.get(id)', rid)
                        assert result['reason']=='timeout' and result['endedAt']==result['deadline']
                        assert result['deadline']-result['startedAt']==60000
                    else:
                        frame.locator('[data-booth-submit]').click()
                        expect(frame.locator('[data-booth-view=result]')).to_be_visible()
                    print('PASS:', scenario, flush=True)
                assert not errors, errors
                assert not missing, missing
                browser.close()
        finally:
            server.terminate()
            server.wait()


if __name__ == '__main__':
    run()
