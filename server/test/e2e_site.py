#!/usr/bin/env python3
"""Local-only site/navigation/scanner/edge-case acceptance tests. No live data."""
import csv
import importlib.util
import io
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
import urllib.request
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import e2e_participant as api

ROOT = Path(__file__).resolve().parents[2]
BASE = 'http://127.0.0.1:3044'
api.BASE = BASE
spec = importlib.util.spec_from_file_location('phone_fixtures', ROOT / 'games/scan-me-if-you-can/tools/e2e_phone.py')
fixtures = importlib.util.module_from_spec(spec); spec.loader.exec_module(fixtures)
OUT = Path('/tmp/scamurai-ui-rework'); OUT.mkdir(exist_ok=True)
failures = []


def check(name, fn):
    try:
        fn(); print('PASS:', name)
    except Exception as e:
        failures.append((name, repr(e))); print('FAIL:', name, repr(e))


def register(pid, name='Amina Noor'):
    return api.ok('POST', '/api/participants', {'id': pid, 'name': name, 'ageGroup': '19–21', 'pbbAccount': False, 'scamExposure': 'no', 'consent': True}, pin='1111')


def run():
    with tempfile.TemporaryDirectory(prefix='scamurai-site-') as data:
        env = dict(os.environ, PORT='3044', DATA_DIR=data, ADMIN_PIN='9999', STAFF_PIN='1111', STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005')
        server = subprocess.Popen(['node', 'server.js'], cwd=ROOT / 'server', env=env, stdout=subprocess.DEVNULL)
        try:
            api.wait_server()
            person = register('SITE001')
            with sync_playwright() as pw:
                browser = pw.chromium.launch()
                errors = []
                def ctx(mobile=False, width=390):
                    c = browser.new_context(viewport={'width': width if mobile else 1440, 'height': 880}, is_mobile=mobile, has_touch=mobile)
                    c.on('page', lambda p: p.on('pageerror', lambda e: errors.append(str(e))))
                    return c

                def public_pages():
                    for width in [320, 390, 768, 1440]:
                        c = ctx(width < 900, width); page = c.new_page(); external = []
                        c.route('https://**/*', lambda rt: (external.append(rt.request.url), rt.abort()))
                        for path in ['/', '/participant.html', '/register.html', '/admin.html', '/leaderboard.html', '/station.html?n=1', '/games/scan-me-if-you-can/phone.html']:
                            response = page.goto(BASE + path)
                            assert response.status == 200, path
                            page.evaluate('document.fonts.ready')
                            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width, path)
                            if path == '/':
                                assert page.locator('#hero-title').count() == 1
                                for link in page.locator('a[href]').evaluate_all('(as)=>as.map(a=>a.href)'):
                                    u=urlparse(link)
                                    if u.netloc==urlparse(BASE).netloc:
                                        if u.fragment and u.path=='/':assert page.locator('#'+u.fragment).count()==1
                                        assert urllib.request.urlopen(link.split('#')[0]).status==200
                                if width < 621:
                                    page.click('.menu-toggle'); assert page.get_attribute('.menu-toggle', 'aria-expanded') == 'true'
                                    page.keyboard.press('Escape'); assert page.get_attribute('.menu-toggle', 'aria-expanded') == 'false'
                                if width in [390, 1440]: page.screenshot(path=str(OUT / f'home-{width}.png'), full_page=True)
                        assert not external, external
                        response = page.goto(BASE + '/this-page-does-not-exist')
                        assert response.status == 404 and page.get_by_role('link', name='Back to home', exact=True).count() == 1
                        c.close()
                check('public home, navigation, local fonts/assets, branded 404 and 320–1440px layouts', public_pages)

                def staff_pages():
                    c=ctx(True,390); p=c.new_page();p.goto(BASE+'/register.html')
                    p.fill('#pin','5001');p.click('#pinGo');p.wait_for_function("document.getElementById('pinErr').textContent.includes('staff PIN')")
                    p.fill('#pin','1111');p.click('#pinGo');p.wait_for_selector('#form:visible')
                    p.screenshot(path=str(OUT/'registration-mobile.png'),full_page=True)
                    p.route('**/api/auth',lambda rt:rt.fulfill(status=503,json={'error':'Temporarily unavailable'}));p.reload()
                    p.wait_for_function("!document.getElementById('pinGo').disabled")
                    assert p.evaluate("localStorage.getItem('scamurai.staffpin')")=='1111'
                    p.unroute('**/api/auth');p.click('#pinGo');p.wait_for_selector('#form:visible',timeout=5000)
                    assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
                    p.click('#go');p.wait_for_function("document.getElementById('err').textContent.includes('student ID')")
                    p.fill('#sid','SITE001');p.fill('#name','Amina Noor')
                    for name,value in [('age','19–21'),('pbb','no'),('exp','no')]:p.locator(f'label:has(input[name="{name}"][value="{value}"])').click()
                    p.check('#consent');p.click('#go');p.wait_for_function("document.getElementById('err').textContent.includes('already registered')")
                    p.goto(BASE+'/admin.html');p.fill('#pin','1111');p.click('#go');p.wait_for_function("document.getElementById('err').textContent.includes('cannot')")
                    p.fill('#pin','9999');p.click('#go');p.wait_for_selector('#main:visible')
                    p.fill('#adminSearch','NO SUCH NAME');assert 'No matching' in p.inner_text('#rows')
                    p.fill('#adminSearch','SITE001');assert 'SITE001' in p.inner_text('#rows')
                    with p.expect_download() as download:p.click('#csvP')
                    text=Path(download.value.path()).read_text();assert 'SITE001' in text and 'participant_id' in text
                    p.screenshot(path=str(OUT/'admin-mobile.png'),full_page=True)
                    p.click('#adminLock');assert p.locator('#main').is_hidden()
                    c.close()
                check('staff role validation, outage PIN recovery, admin search/CSV and lock', staff_pages)

                def identity_storage():
                    special=register('LONGIDENTIFIER123456', '<img src=x onerror="window.injected=true"> & a very long registered name')
                    c=ctx(True,320);p=c.new_page()
                    p.goto(BASE+'/participant.html#'+special['participantToken']);p.wait_for_selector('#participant-name')
                    assert not p.evaluate('window.injected || false')
                    assert p.inner_text('#participant-name')==special['name']
                    assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
                    p.route('**/api/participant/me',lambda rt:rt.fulfill(status=503,json={'error':'Unavailable'}));p.click('#refresh')
                    p.wait_for_function("document.getElementById('connection').textContent.includes('Cannot refresh')")
                    assert p.inner_text('#participant-name')==special['name']
                    p.unroute('**/api/participant/me');p.click('#refresh')
                    p.evaluate("localStorage.setItem('scamurai.s5.round', JSON.stringify({participantId:'LONGIDENTIFIER123456', id:9,token:'broken'}))")
                    p.reload();p.wait_for_selector('#participant-name',timeout=5000)
                    c.close()
                    c=ctx(True);c.add_init_script("Storage.prototype.getItem=()=>{throw new DOMException('blocked','SecurityError')};Storage.prototype.setItem=()=>{throw new DOMException('blocked','SecurityError')}")
                    p=c.new_page();p.goto(BASE+'/participant.html#'+person['participantToken']);p.wait_for_selector('#participant-name',timeout=5000)
                    assert p.inner_text('#participant-id')=='SITE001'
                    p.click('#start-scamming');assert 'storage' in p.inner_text('#connection') and p.locator('#scan-panel').is_hidden()
                    c.close()
                check('long/HTML-looking names, corrupt saved game data and storage-blocked personal QR', identity_storage)

                def scanner_flow():
                    c=ctx(True);c.add_init_script(f'({fixtures.CAMERA})()');p=c.new_page()
                    p.goto(BASE+'/participant.html#'+person['participantToken']);p.wait_for_selector('#participant-name')
                    p.click('#start-scamming');p.wait_for_function("document.querySelector('video').readyState >= 2")
                    def scan(raw):p.evaluate("im=>localStorage.setItem('test.qr',im)",fixtures.qr(raw))
                    scan('https://example.com/bad');p.wait_for_function("document.querySelector('.scanner-status').textContent.includes('not part')")
                    p.screenshot(path=str(OUT/'participant-scanner.png'),full_page=True)
                    scan(BASE+'/station.html?n=1');p.wait_for_url('**/station.html?n=1');p.wait_for_function("document.getElementById('station').textContent.includes('Phishing Fishing')")
                    p.get_by_role('link',name='My participant page',exact=True).click();p.wait_for_selector('#participant-name')
                    assert p.inner_text('#participant-id')=='SITE001'
                    p.evaluate("localStorage.removeItem('test.qr')");p.click('#start-scamming');p.wait_for_function("document.querySelector('video').readyState >= 2")
                    p.click('#back-participant');assert p.locator('#scan-panel').is_hidden()
                    assert p.evaluate("window.testStream.getTracks().every(t=>t.readyState==='ended')")
                    other=register('OTHER001','Another Participant')
                    foreign=api.ok('POST','/api/rounds',{'participantId':other['id']},pin='5005')
                    p.click('#start-scamming');scan(BASE+f'/games/scan-me-if-you-can/phone.html#{foreign["roundId"]}.{foreign["token"]}')
                    p.wait_for_function("document.querySelector('.scanner-status').textContent.includes('someone else')")
                    own=api.ok('POST','/api/rounds',{'participantId':person['id']},pin='5005')
                    manifest=(ROOT/'games/scan-me-if-you-can/cards/manifest.js').read_text();slugs=re.findall(r"slug: '([^']+)'",manifest)[:8]
                    api.ok('POST',f'/api/rounds/{own["roundId"]}/events',{'data':{'t':'deal','cards':{str(i+1):s for i,s in enumerate(slugs)},'order':list(range(1,9))}},token=own['token'])
                    scan(BASE+f'/games/scan-me-if-you-can/phone.html#{own["roundId"]}.{own["token"]}')
                    p.wait_for_url('**/games/scan-me-if-you-can/phone.html');p.wait_for_selector('.scanner video')
                    p.get_by_role('link',name='My scores',exact=True).click();p.wait_for_selector('#participant-name')
                    p.screenshot(path=str(OUT/'participant-mobile.png'),full_page=True)
                    p.evaluate("localStorage.removeItem('test.qr')");p.click('#start-scamming');scan(BASE+'/games/scan-me-if-you-can/c.html?n=1')
                    p.wait_for_url('**/c.html?n=1');p.get_by_role('button',name='Start timer',exact=True).wait_for()
                    assert len(c.pages)==1
                    c.close()
                check('one-tab hub scanner: invalid QR, placeholders, camera stop, wrong person, Game 5 Join and board', scanner_flow)

                def scanner_edges():
                    c=ctx(True)
                    c.add_init_script(f"({fixtures.CAMERA})();window.BarcodeDetector=class{{static async getSupportedFormats(){{return ['qr_code']}}async detect(){{throw new Error('native unavailable')}}}}")
                    p=c.new_page();p.goto(BASE+'/participant.html#'+person['participantToken']);p.wait_for_selector('#participant-name')
                    p.evaluate("localStorage.setItem('test.permission','deny')");p.click('#start-scamming')
                    p.wait_for_function("document.querySelector('.scanner-status').textContent.includes('blocked')")
                    p.click('#back-participant');p.evaluate("localStorage.setItem('test.permission','allow')");p.click('#start-scamming')
                    p.evaluate("im=>localStorage.setItem('test.qr',im)",fixtures.qr(BASE+'/station.html?n=4'))
                    p.wait_for_url('**/station.html?n=4');p.get_by_role('link',name='My participant page',exact=True).click();p.wait_for_selector('#participant-name')
                    p.evaluate("localStorage.removeItem('test.qr')");p.click('#start-scamming')
                    current=next(r for r in api.ok('GET','/api/rounds/open',pin='5005') if r['participant']['id']=='SITE001')
                    held=[];p.route('**/api/rounds/*/participant',lambda rt:held.append(rt))
                    p.evaluate("im=>localStorage.setItem('test.qr',im)",fixtures.qr(BASE+f'/games/scan-me-if-you-can/phone.html#{current["roundId"]}.{current["token"]}'))
                    for _ in range(100):
                        if held:break
                        p.wait_for_timeout(50)
                    assert held
                    p.click('#back-participant')
                    for rt in held:rt.fulfill(status=200,json={'id':'SITE001','name':person['name'],'participantToken':person['participantToken']})
                    p.wait_for_timeout(500)
                    assert urlparse(p.url).path=='/participant.html' and p.locator('#scan-panel').is_hidden()
                    assert p.evaluate("window.testStream.getTracks().every(t=>t.readyState==='ended')")
                    c.close()
                check('camera denial recovery, broken native decoder fallback and cancelled pending QR lookup', scanner_edges)

                def board_codes():
                    c=ctx();p=c.new_page();p.goto(BASE+'/stations.html');assert p.locator('.station-code svg').count()==5
                    p.goto(BASE+'/games/scan-me-if-you-can/board.html');assert p.locator('.q svg').count()==25
                    assert p.input_value('#base').startswith('https://scamurai.physicsxmum.my/')
                    p.fill('#base','javascript:bad');p.get_by_role('button',name='Redraw codes').click();assert p.locator('.q').count()==0
                    assert 'valid board address' in p.inner_text('#qrError');c.close()
                check('five station codes, 25 board codes and invalid QR destination handling', board_codes)

                def api_edges():
                    p=register('TIE001','Tie Tester')
                    first=api.ok('POST','/api/rounds',{'participantId':p['id']},pin='5001')
                    cross_station_blocked = api.call('GET',f'/api/rounds/{first["roundId"]}/events',pin='5002')[0]==403
                    api.ok('POST',f'/api/rounds/{first["roundId"]}/finish',{'score':1,'maxScore':3},pin='5001')
                    second=api.ok('POST','/api/rounds',{'participantId':p['id']},pin='5001');time.sleep(1.1)
                    api.ok('POST',f'/api/rounds/{second["roundId"]}/finish',{'score':1,'maxScore':3},pin='5001')
                    req=urllib.request.Request(BASE+'/api/export/participants.csv',headers={'X-Pin':'9999'})
                    rows=list(csv.DictReader(io.StringIO(urllib.request.urlopen(req).read().decode('utf-8-sig'))))
                    row=next(r for r in rows if r['participant_id']==p['id']);assert cross_station_blocked and row['s1_best_secs']=='0', {'cross_station_blocked':cross_station_blocked,'best_secs':row['s1_best_secs']}
                    c=ctx();page=c.new_page();page.goto(BASE+'/leaderboard.html');page.wait_for_function("document.getElementById('rows').textContent.includes('No one has finished all 5 games')")
                    assert 'completed all 5 games' in page.inner_text('#qualification')
                    assert page.locator('.lb th').count()==4 and page.locator('.dots').count()==0
                    for n in [2,3,4,5]:
                        r=api.ok('POST','/api/rounds',{'participantId':p['id']},pin=f'500{n}')
                        api.ok('POST',f'/api/rounds/{r["roundId"]}/finish',{'score':0,'maxScore':100},pin=f'500{n}')
                    page.wait_for_function("document.getElementById('rows').textContent.includes('33.3')")
                    assert page.locator('#rows tr td').count()==4
                    assert 'TIE001' not in page.inner_text('#rows')
                    page.screenshot(path=str(OUT/'leaderboard-desktop.png'),full_page=True)
                    page.set_viewport_size({'width':320,'height':880})
                    assert page.evaluate("document.querySelector('.lb').scrollWidth <= document.querySelector('.table-scroll').clientWidth + 1")
                    page.screenshot(path=str(OUT/'leaderboard-mobile.png'),full_page=True);c.close()
                check('cross-station round access and equal fractional scores keep the fastest best round', api_edges)
                assert not errors, errors
                browser.close()
            assert not failures, failures
        finally:
            server.terminate();server.wait(timeout=5)


if __name__=='__main__':run()
