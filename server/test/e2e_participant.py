#!/usr/bin/env python3
"""Registration -> personal QR -> live five-station progress, on throwaway local data."""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright

SERVER = Path(__file__).resolve().parents[1]
BASE = 'http://127.0.0.1:3043'


def full_survey():
    import json, pathlib
    cfg = json.loads((pathlib.Path(__file__).resolve().parent.parent / 'stations.json').read_text())
    out = {}
    for q in [q for st in cfg['stations'] for q in st['questions']] + cfg['general']:
        if q['type'] == 'scale': out[q['id']] = '5'
        elif q['type'] == 'choice': out[q['id']] = q['options'][0]
        elif q['type'] == 'station': out[q['id']] = f"1. {cfg['stations'][0]['name']}"
    return out


def call(method, path, body=None, pin=None, participant=None, token=None):
    headers = {'Content-Type': 'application/json', 'cf-connecting-ip': '198.51.100.10'}
    if pin: headers['X-Pin'] = pin
    if participant: headers['X-Participant-Token'] = participant
    if token: headers['X-Round-Token'] = token
    req = urllib.request.Request(BASE + path, method=method, headers=headers,
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as e:
        return e.code, json.load(e)


def ok(*args, **kwargs):
    status, body = call(*args, **kwargs)
    assert status == 200, (status, body)
    return body


def wait_server():
    for _ in range(80):
        try:
            urllib.request.urlopen(BASE + '/api/config', timeout=1).close()
            return
        except OSError: time.sleep(0.1)
    raise RuntimeError('Local server did not start')


def run():
    with tempfile.TemporaryDirectory(prefix='scamurai-participant-') as data:
        env = dict(os.environ, PORT='3043', DATA_DIR=data, STAFF_PIN='1111', ADMIN_PIN='9999',
                   STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005')
        server = subprocess.Popen(['node', 'server.js'], cwd=SERVER, env=env, stdout=subprocess.DEVNULL)
        try:
            wait_server()
            with sync_playwright() as pw:
                browser = pw.chromium.launch()
                staff = browser.new_context()
                phone = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
                for ctx in [staff, phone]:
                    ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda rt: rt.fulfill(body='', content_type='text/css'))
                errors = []
                desk, page = staff.new_page(), phone.new_page()
                for p in [desk, page]: p.on('pageerror', lambda e: errors.append(str(e)))
                desk.goto(BASE + '/register.html')
                desk.fill('#pin', '1111'); desk.click('#pinGo'); desk.wait_for_selector('#form:visible')
                desk.fill('#sid', 'PORTAL001'); desk.fill('#name', 'Amina Noor')
                for name, value in [('age', '19–21'), ('pbb', 'no'), ('exp', 'no')]:
                    desk.locator(f'label:has(input[name="{name}"][value="{value}"])').click()
                desk.check('#consent'); desk.click('#go'); desk.wait_for_selector('#passQR svg')
                personal_url = desk.get_attribute('#passLink', 'href')
                participant_token = personal_url.split('#')[1]
                assert re.fullmatch('[a-f0-9]{64}', participant_token)
                assert 'PORTAL001' not in personal_url
                page.goto(personal_url); page.wait_for_selector('#participant-name')
                assert page.inner_text('#participant-name') == 'Amina Noor'
                assert page.inner_text('#participant-id') == 'PORTAL001'
                assert '#' not in page.url and page.locator('.station').count() == 5
                assert page.locator('video').count() == 0
                page.reload(); page.wait_for_selector('#participant-name')
                assert page.inner_text('#participant-id') == 'PORTAL001'
                print('PASS: registration issues personal QR; phone remembers identity and shows all five stations')

                desk.locator('button[data-pass="PORTAL001"]').click()
                assert desk.get_attribute('#passLink', 'href') == personal_url
                assert call('GET', '/api/participant/me')[0] == 401
                assert call('GET', '/api/participant/me', participant='0' * 64)[0] == 401
                assert call('GET', '/api/participants/PORTAL001/pass', participant=participant_token)[0] == 401
                assert call('POST', '/api/rounds', {'participantId': 'PORTAL001'}, participant=participant_token)[0] == 401
                p = ok('GET', '/api/participant/me?id=SOMEONEELSE', participant=participant_token)
                assert p['id'] == 'PORTAL001'
                assert not {'age_group', 'pbb_account', 'scam_exposure', 'survey', 'token'} & p.keys()
                print('PASS: existing registration QR can be reissued; pass only reads its own profile and cannot write scores')

                def round_at(n, score=None):
                    r = ok('POST', '/api/rounds', {'participantId': 'PORTAL001'}, pin=f'500{n}')
                    if score is not None: ok('POST', f'/api/rounds/{r["roundId"]}/finish', {'score': score, 'maxScore': 100}, pin=f'500{n}')
                    return r

                r = round_at(1)
                linked = ok('GET', f'/api/rounds/{r["roundId"]}/participant', token=r['token'])
                assert linked['participantToken'] == participant_token
                assert call('GET', f'/api/rounds/{r["roundId"]}/participant', token='wrong')[0] == 403
                ok('POST', f'/api/rounds/{r["roundId"]}/finish', {'score': 60, 'maxScore': 100}, pin='5001')
                page.wait_for_function("document.querySelector('[data-station=\"1\"] .score').textContent.includes('60')")
                round_at(1, 20)
                round_at(2, 0)
                page.click('#refresh')
                page.wait_for_function("document.querySelector('[data-station=\"2\"] .score').textContent === '0 / 100'")
                p = ok('GET', '/api/participant/me', participant=participant_token)
                assert p['total'] == 60 and p['stationsDone'] == [1, 2]
                assert p['stations'][0]['score'] == 60 and p['stations'][1]['status'] == 'completed'
                print('PASS: live updates count best replays and distinguish a completed zero from an unplayed station')

                round_at(3, 100); round_at(4, 100); r5 = round_at(5)
                page.click('#refresh')
                page.wait_for_function("document.querySelector('[data-station=\"5\"] .playing')")
                ok('POST', f'/api/rounds/{r5["roundId"]}/events', {'data': {'t': 'scan', 'slug': 'slug1'}}, token=r5['token'])
                ok('POST', f'/api/rounds/{r5["roundId"]}/finish', {'score': 100, 'maxScore': 100}, pin='5005')
                ok('POST', '/api/checkout', {'participantId': 'PORTAL001', 'answers': full_survey()}, pin='5005')
                page.click('#refresh')
                page.wait_for_function("document.body.innerText.includes('qualify for the prize ranking.') && document.body.innerText.includes('Checked out')")
                p = ok('GET', '/api/participant/me', participant=participant_token)
                assert p['total'] == 360 and p['eligible'] and p['surveyDone']
                page.screenshot(path='/tmp/scamurai-participant-page.png', full_page=True)
                print('PASS: all-station total, playing state, exit survey and prize eligibility stay in sync')

                guest = ok('POST', '/api/participants', {'guest': True, 'name': 'Guest Example', 'ageGroup': '26+',
                            'pbbAccount': False, 'scamExposure': 'no', 'consent': True}, pin='1111')
                page.goto(BASE + '/participant.html#' + guest['participantToken'])
                page.wait_for_function("document.getElementById('participant-id')?.textContent === 'G001'")
                assert 'Guest ID' in page.inner_text('main')
                assert 'Amina Noor' not in page.inner_text('main')
                page.goto(BASE + '/participant.html#' + '0' * 64)
                page.wait_for_function("document.getElementById('connection').textContent.includes('no longer valid')")
                assert page.locator('#participant-id').count() == 0
                print('PASS: guest IDs work and switching/invalid passes never show the previous identity')

                # Existing shared SDK games expose the same personal page during play and after finish.
                game = staff.new_page(); game.on('pageerror', lambda e: errors.append(str(e)))
                game.goto(BASE + '/games/_template/')
                game.evaluate("""() => { const s=document.createElement('script'); s.src='/sdk.js'; s.dataset.station='1'; document.head.appendChild(s); }""")
                game.wait_for_selector('.scm input[type=password]'); game.fill('.scm input[type=password]', '5001'); game.click('.scm .go')
                game.wait_for_selector('.scm .find'); game.fill('.scm .find', 'PORTAL001')
                game.wait_for_function("!document.querySelector('.scm .go').disabled"); game.click('.scm .go')
                game.click('#scamurai-personal-page button'); game.wait_for_selector('#scamurai-personal-page svg')
                game.evaluate('Scamurai.finish({score: 1, maxScore: 1})')
                game.click('.scm .personal'); game.wait_for_selector('.scm .personal-qr svg')
                assert not errors, errors
                print('PASS: shared SDK provides personal QR access during games and on the result screen; no JavaScript errors')
                browser.close()
            before = ok('GET', '/api/participant/me', participant=participant_token)
            server.terminate(); server.wait(timeout=5)
            server = subprocess.Popen(['node', 'server.js'], cwd=SERVER, env=env, stdout=subprocess.DEVNULL)
            wait_server()
            assert ok('GET', '/api/participant/me', participant=participant_token) == before
            print('PASS: personal pass and scores survive a service restart')
            server.terminate(); server.wait(timeout=5)
            # Simulate the pre-feature schema: Participants and Rounds exist, passes do not.
            subprocess.run(['node', '-e', "const D=require('better-sqlite3');const db=new D(process.argv[1]);db.exec('DROP TABLE participant_passes');db.close()", str(Path(data) / 'scamurai.db')], cwd=SERVER, check=True)
            server = subprocess.Popen(['node', 'server.js'], cwd=SERVER, env=env, stdout=subprocess.DEVNULL)
            wait_server()
            replacement = ok('GET', '/api/participants/PORTAL001/pass', pin='1111')
            assert ok('GET', '/api/participant/me', participant=replacement['participantToken']) == before
            print('PASS: legacy registrations gain a personal pass without changing identity, scores or progress')
        finally:
            server.terminate(); server.wait(timeout=5)


if __name__ == '__main__': run()
