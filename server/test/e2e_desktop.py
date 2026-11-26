#!/usr/bin/env python3
"""Two independent booth laptops per station, temporary local data only."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright
import e2e_participant as api
ROOT=Path(__file__).resolve().parents[2]
BASE=api.BASE='http://127.0.0.1:3048'
EMAIL_KEY='scamurai.booth.3.event.v1'
POPUP_KEY='close-popups:station2:v1'
import re
CLASSIFICATION=json.loads(re.search(r'=\s*(\{.*\})',(ROOT/'games/phishing-fishing/demo-answers.js').read_text(),re.S).group(1))

def run():
 with tempfile.TemporaryDirectory(prefix='scamurai-desktop-') as data:
  env=dict(os.environ,PORT='3048',DATA_DIR=data,ADMIN_PIN='9999',STAFF_PIN='1111',STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005')
  server=subprocess.Popen(['node','server.js'],cwd=ROOT/'server',env=env,stdout=subprocess.DEVNULL)
  try:
   api.wait_server(); people={}
   for pid in ['MAIL001','MAIL002','MAIL003','MAIL004','MAIL005','POPA','POPB']:
    people[pid]=api.ok('POST','/api/participants',{'id':pid,'name':pid,'ageGroup':'19–21','pbbAccount':False,'scamExposure':'no','consent':True},pin='1111')
   for n in [1,2,4,5]:
    r=api.ok('POST','/api/rounds',{'participantId':'MAIL001'},pin=f'500{n}')
    if n==5:
     api.ok('POST',f'/api/rounds/{r["roundId"]}/events',{'data':{'t':'scan'}},token=r['token'])
    api.ok('POST',f'/api/rounds/{r["roundId"]}/finish',{'score':200 if n==5 else 25,'maxScore':800 if n==5 else 100},pin=f'500{n}')
   with sync_playwright() as pw:
    browser=pw.chromium.launch();errors=[]
    def laptop(game,station):
     c=browser.new_context(viewport={'width':1440,'height':960},reduced_motion='reduce')
     c.on('page',lambda p:p.on('pageerror',lambda e:errors.append(str(e))))
     p=c.new_page();p.goto(BASE+f'/games/{game}/?lang=en');p.fill('.scm input[type=password]',f'500{station}');p.click('.scm .go');p.wait_for_selector('.scm .find');return p
    def select(p,pid):
     p.locator(f'.scm .it[data-id="{pid}"]').wait_for();p.fill('.scm .find',pid);p.click('.scm .go')
    def frame(p,id='booth-frame'):
     return p.locator('#'+id).element_handle().content_frame()
    def state(p,key=EMAIL_KEY):return p.evaluate('(key)=>JSON.parse(sessionStorage.getItem(key))',key)
    def answer(p,correct=True,kind=None,check_pause_ms=0):
     f=frame(p);qid=f.locator('[data-question]').first.get_attribute('data-question')
     actual=CLASSIFICATION[qid]
     choice=kind or (actual if correct else 'phishing' if actual=='legitimate' else 'legitimate')
     f.locator(f'[data-answer="{choice}"]').first.click()
     f.wait_for_selector('#pf-verdict-modal')
     title=f.locator('#pf-verdict-title').inner_text()
     assert ('Phishing' in title) if actual=='phishing' else ('Legitimate' in title), title
     assert len(f.locator('.pf-verdict-reason').inner_text().strip())>10
     assert f.locator('.pf-verdict-paused').is_visible()
     if check_pause_ms:
      before_clock=f.locator('#timer-value').inner_text()
      p.clock.fast_forward(check_pause_ms)
      assert f.locator('#timer-value').inner_text()==before_clock,'timer must stay paused while verdict popup is open'
     f.locator('#pf-verdict-next').click()
     f.wait_for_function('(old)=>!document.getElementById("pf-verdict-modal") && document.querySelector("[data-question]")?.dataset.question!==old',arg=qid)
    a=laptop('phishing-fishing',3);b=laptop('phishing-fishing',3)
    select(a,'MAIL001');frame(a).wait_for_selector('#start-game');frame(a).click('#start-game')
    b.wait_for_function("document.querySelector('.scm .it[data-id=\"MAIL001\"]')?.textContent.includes('playing now')")
    b.locator('.scm .it[data-id="MAIL001"]').click()
    b.once('dialog',lambda d:d.dismiss());b.click('.scm .go');b.wait_for_timeout(1500);b.click('#booth-select')   # a second laptop may only restart after confirming; declining keeps the first Round
    assert len(api.ok('GET','/api/rounds/open',pin='5003'))==1 and state(a)['participant']['id']=='MAIL001'
    select(b,'MAIL002');frame(b).wait_for_selector('#start-game');frame(b).click('#start-game')
    assert len(api.ok('GET','/api/rounds/open',pin='5003'))==2
    assert state(a)['participant']['id']=='MAIL001' and state(b)['participant']['id']=='MAIL002'
    print('PASS: two email laptops play independently; the same participant cannot start twice')
    saved=state(a)['snapshot']
    a.reload();frame(a).wait_for_selector('[data-question]');assert state(a)['snapshot']['startedAt']==saved['startedAt']
    assert frame(a).locator('#verification-record,#verify-independent,[data-evidence],#submit-judgement').count()==0
    print('PASS: round survives reload; Check Yourself pane and evidence step are absent')
    for _ in range(4):answer(a)
    before=state(a)['snapshot'];a.reload();frame(a).wait_for_selector('[data-question]')
    after=state(a)['snapshot'];assert before['startedAt']==after['startedAt'] and before['questionIds']==after['questionIds'] and before['answers']==after['answers']
    print('PASS: full reload retains exact email deal, participant, answers and original start time')
    sent=[]
    def lose_response(route):
     sent.append(route.request.post_data_json);response=route.fetch();assert response.status==200;route.abort('failed')
    a.route('**/api/rounds/*/finish',lose_response)
    for _ in range(6):answer(a)
    a.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1')).status==='pending'")
    a.wait_for_function("!document.getElementById('booth-retry').disabled")
    assert len(sent)==1 and sent[0]['score']==0
    a.unroute('**/api/rounds/*/finish');a.reload()
    a.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1')).status==='saved'")
    assert state(a)['score']==state(a)['result']['pct']==100
    a.locator('#booth-survey').wait_for(state='visible')
    p=api.ok('GET','/api/participant/me',participant=people['MAIL001']['participantToken']);assert p['total']==200 and len(p['stationsDone'])==5
    for _ in range(10):answer(b,kind='phishing')
    b.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1')).status==='saved'")
    assert state(b)['score']==50 and state(a)['score']==100
    print('PASS: lost finish response retries idempotently, all correct saves 100, using one label for every email saves 50, five-station total and survey handoff agree')
    b.click('#booth-next');select(b,'MAIL003');frame(b).wait_for_selector('#start-game')
    b.clock.install();frame(b).click('#start-game');answer(b,check_pause_ms=15000)
    b.clock.fast_forward(91000)
    b.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1')).status==='saved'")
    timed=state(b);assert timed['score']==10 and timed['snapshot']['endedAt']-timed['snapshot']['startedAt']-(timed['snapshot'].get('pausedMs') or 0)==90000
    assert (timed['snapshot'].get('pausedMs') or 0)>=15000
    b.reload();frame(b).wait_for_selector('.score-circle');assert state(b)['score']==10
    print('PASS: scored email timeout retains partial credit, paused popup time excluded from 90s budget, exact deadline and saved results through reload')
    b.click('#booth-next');select(b,'MAIL004');frame(b).wait_for_selector('#start-game')
    cancelled=[]
    def lose_cancel(route):
     cancelled.append(route.request.url);response=route.fetch();assert response.status==200;route.abort('failed')
    b.route('**/api/rounds/*/cancel',lose_cancel);b.on('dialog',lambda d:d.accept());b.click('#booth-cancel')
    b.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1')).status==='cancelled'")
    assert len(cancelled)==1
    assert api.ok('GET','/api/participant/me',participant=people['MAIL004']['participantToken'])['stations'][2]['score'] is None
    b.unroute('**/api/rounds/*/cancel');b.click('#booth-next');select(b,'MAIL005');frame(b).wait_for_selector('#start-game');frame(b).click('#start-game')
    remote=state(b);api.ok('POST',f'/api/rounds/{remote["roundId"]}/cancel',pin='5003');b.clock.fast_forward(91000)
    b.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.event.v1')).status==='cancelled'")
    assert b.locator('#booth-next').is_visible()
    print('PASS: cancellation on a different laptop releases the original email laptop without a score')
    b.evaluate('(key)=>sessionStorage.setItem(key,"broken")',EMAIL_KEY);b.reload();b.wait_for_function("document.getElementById('booth-status').textContent.includes('saved Round is unavailable')")
    assert b.locator('#booth-select').is_disabled()
    print('PASS: lost cancellation response reconciles without a score; corrupt local storage fails closed')
    a.click('#booth-survey');a.wait_for_selector('.scm .q');assert 'Phishing Fishing' in a.locator('.scm').inner_text()
    p1=laptop('close-the-popups',2);p2=laptop('close-the-popups',2)
    select(p1,'POPA');select(p2,'POPB')
    for p in [p1,p2]:
     f=frame(p,'game');f.wait_for_selector('#booth-random');f.click('#booth-random');f.click('#booth-start');f.wait_for_selector('[data-booth-submit]')
    assert len(api.ok('GET','/api/rounds/open',pin='5002'))==2
    assert state(p1,POPUP_KEY)['participant']['id']=='POPA' and state(p2,POPUP_KEY)['participant']['id']=='POPB'
    for p in [p1,p2]:
     frame(p,'game').locator('[data-booth-submit]').click(force=True)
     p.wait_for_function("JSON.parse(sessionStorage.getItem('close-popups:station2:v1')).status==='saved'")
    assert api.ok('GET','/api/participant/me',participant=people['POPA']['participantToken'])['stations'][1]['score']==api.ok('GET','/api/participant/me',participant=people['POPB']['participantToken'])['stations'][1]['score']==api.ok('GET','/api/participant/me',participant=people['POPA']['participantToken'])['stations'][1]['score']  # idle round: both saved the same score (scoring rules live in e2e_popup)
    assert api.ok('GET','/api/participant/me',participant=people['POPB']['participantToken'])['stations'][1]['score'] is not None
    print('PASS: two popup laptops keep separate participants, rounds and saved scores')
    p1.click('#staff-toggle');p1.click('#next');select(p1,'POPA')
    f=frame(p1,'game');f.wait_for_selector('#booth-random');f.click('#booth-random');f.click('#booth-start');f.wait_for_selector('[data-booth-submit]')
    remote=state(p1,POPUP_KEY);api.ok('POST',f'/api/rounds/{remote["roundId"]}/cancel',pin='5002');f.locator('[data-booth-submit]').click(force=True)
    p1.wait_for_function("JSON.parse(sessionStorage.getItem('close-popups:station2:v1')).status==='cancelled'")
    assert p1.locator('#next').is_visible()
    print('PASS: cancellation on a different laptop releases the original popup laptop without a score')
    for game,iframe in [('phishing-fishing','booth-frame'),('close-the-popups','game')]:
     c=browser.new_context(viewport={'width':1440,'height':960},reduced_motion='reduce');p=c.new_page();writes=[]
     p.on('request',lambda r:writes.append(r.url) if r.method=='POST' and '/api/' in r.url else None)
     p.goto(BASE+f'/games/{game}/?demo=1&lang=en');assert p.locator('.scm input[type=password]').count()==0
     f=frame(p,iframe)
     if game=='phishing-fishing':
      f.wait_for_selector('#start-game');f.click('#start-game');assert f.locator('.email-progress li').count()==10
      for _ in range(10):answer(p)
      p.wait_for_function("JSON.parse(sessionStorage.getItem('scamurai.booth.3.demo.v1')).status==='saved'")
     else:
      f.wait_for_selector('[data-booth-task]');f.locator('[data-booth-task="minute2-tool-webp"]').click();f.click('#booth-start');f.wait_for_selector('[data-booth-submit]');f.locator('[data-booth-submit]').click(force=True);f.wait_for_selector('.booth-score')
     assert not writes,writes;c.close()
    legacy=browser.new_context();lp=legacy.new_page();legacy_writes=[]
    lp.on('request',lambda r:legacy_writes.append(r.url) if r.method=='POST' and '/api/' in r.url else None)
    lp.add_init_script("""
      if(window===top&&!sessionStorage.getItem('legacy-seeded')) {
      sessionStorage.setItem('legacy-seeded','1');
      sessionStorage.setItem('scamurai.booth.3.demo.v1',JSON.stringify({version:1,status:'open',roundId:null,participant:null,snapshot:{version:2,status:'playing'}}));
      }
    """)
    lp.goto(BASE+'/games/phishing-fishing/?demo=1');frame(lp).wait_for_selector('#start-game');frame(lp).click('#start-game')
    assert lp.evaluate("sessionStorage.getItem('legacy-seeded')")=='1'
    assert state(lp,'scamurai.booth.3.demo.v1')['snapshot']['version']==4 and not legacy_writes
    legacy.close();print('PASS: an earlier-format demo restarts safely into the new exercise without event writes')
    assert not api.ok('GET','/api/rounds/open',pin='5003') and not api.ok('GET','/api/rounds/open',pin='5002')
    print('PASS: both public demos bypass PIN/identity, allow practice and write no event data')
    assert not errors,errors
    browser.close()
  finally:server.terminate();server.wait(timeout=5)
if __name__=='__main__':run()
