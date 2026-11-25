#!/usr/bin/env python3
"""Repeated public-demo starts must work without an event identity or API writes."""
import os
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import e2e_participant as api
ROOT=Path(__file__).resolve().parents[2]
BASE=api.BASE='http://127.0.0.1:3054'

def run():
 with tempfile.TemporaryDirectory(prefix='popup-demo-') as data:
  server=subprocess.Popen(['node','server.js'],cwd=ROOT/'server',env=dict(os.environ,PORT='3054',DATA_DIR=data,ADMIN_PIN='9999',STAFF_PIN='1111',STATION_PINS='2:5002'),stdout=subprocess.DEVNULL)
  try:
   api.wait_server()
   with sync_playwright() as pw:
    browser=pw.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900},reduced_motion='reduce');writes=[];errors=[];downloads=[]
    page.on('request',lambda r:writes.append(r.url) if r.method=='POST' and '/api/' in r.url else None)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('download',lambda d:downloads.append(d.suggested_filename))
    page.goto(BASE+'/games/close-the-popups/?demo=1&lang=en')
    def game():return page.locator('#game').element_handle().content_frame()
    cards = game().locator('.booth-task-card')
    retired = ('minute2-movie-animation', 'minute2-book-verne', 'minute2-museum-manet')
    cards.first.wait_for()
    assert cards.count() == 10
    for task in retired:
     assert game().locator(f'.booth-task-card[data-booth-task="{task}"]').count() == 0
     game().goto(BASE+f'/games/close-the-popups/browse/booth.html?view=brief&task={task}&lang=en')
     assert game().locator('#booth-title').inner_text() == 'This task is no longer available.'
     assert game().evaluate('(id)=>BROWSE_BOOTH.create(id,"ads","en")',task) is None
     game().get_by_role('link',name='Return to task selection').click()
    print('PASS: 10 selectable tasks; the retired briefs cannot start a new round')
    def start(task='minute2-tool-webp'):
     f=game();f.locator(f'[data-booth-task="{task}"]').click();f.click('#booth-start')
     try:f.wait_for_selector('[data-booth-submit]',timeout=2000)
     except PlaywrightTimeout:raise AssertionError('Start did not launch task: '+f.locator('#booth-start-note').inner_text())
    def finish():
     f=game();f.locator('[data-booth-submit]').click();f.wait_for_selector('.booth-score')
     ending=f.locator('dialog[aria-label="Round ending"] iframe').element_handle().content_frame()
     ending.wait_for_selector('#result.visible')
     assert ending.evaluate('getComputedStyle(document.body).backgroundColor')=='rgb(243, 239, 229)'
     assert ending.locator('#score-number').inner_text()==str(f.evaluate('BROWSE_BOOTH_SCORE_LAST.total'))
     ending.get_by_role('button',name='View results').click()
     f.wait_for_selector('dialog[aria-label="Round ending"]',state='detached')
    start()
    f=game(); deadline=f.evaluate('BROWSE_BOOTH.list()[0].deadline')
    f.locator('[data-pressure-surface="rail"]').wait_for(timeout=7000)
    badge=f.locator('.br-ad-bonus .br-prompt-bonus-badge')
    badge.wait_for(timeout=7000)
    assert badge.evaluate('(node) => getComputedStyle(node).animationName')=='none'
    f.locator('.br-ad-player-error').get_by_text('XX13-V',exact=False).wait_for(timeout=7000)
    print('PASS: official ad mix shows the sidebar, bonus and player error, with reduced motion respected')
    ad=f.locator('.br-stack-modal-stage')
    ad.wait_for(timeout=15000)
    ad_id=ad.get_attribute('data-br-entry')
    assert f.locator('#site-root').evaluate('(node) => node.inert')
    last_ad_control=ad.locator('a[href]:visible, button:enabled:visible').last
    last_ad_control.focus()
    page.keyboard.press('Tab')
    assert f.locator('[data-booth-sound]').evaluate('(node) => node === document.activeElement')
    f.locator('#br-booth-bar [data-booth-task]').click()
    task_dialog=f.locator('#br-booth-task-dialog[open]')
    assert task_dialog.locator('.br-booth-conditions li').count()>0
    assert task_dialog.locator('details, [data-booth-second-hint], [data-booth-warmup]').count()==0
    assert f.evaluate('BROWSE_BOOTH.list()[0].deadline')==deadline
    f.locator('[data-booth-dialog-close]').click()
    assert ad.get_attribute('data-br-entry')==ad_id
    finish()
    score=game().evaluate('BROWSE_BOOTH_SCORE_LAST')
    assert score['guaranteed']=={'done':False,'floor':20,'applied':False}
    assert score['total']==50,score
    assert game().locator('.booth-score-split dt').all_text_contents()==['Task','Speed','Safe interaction']
    assert game().locator('#booth-review, #booth-staff, #booth-verdict').count()==0
    print('PASS: keyboard reaches the toolbar during an ad; View task and Submit work without closing it')
    assert page.evaluate("JSON.parse(sessionStorage.getItem('close-popups:demo:v1:practice')).status")=='ended'
    # A returning visitor can use the game brand to choose another task.
    game().locator('.booth-brand').click();game().wait_for_selector('#booth-random')
    start();finish();print('PASS: another task starts after returning through the game header')
    page.reload();game().wait_for_selector('.booth-score');game().locator('.booth-brand').click()
    start('minute3-search-official')
    f=game();f.locator('[data-official-result]').click()
    download=f.locator('[data-official-download]');download.press('Escape');download.click()
    listing=f.locator('#br-download-panel:popover-open li')
    listing.wait_for()
    assert 'phototools-getting-started.txt' in listing.inner_text()
    assert f.evaluate('BROWSE_BOOTH.assess(BROWSE_BOOTH.list()[0]).allMet')
    assert not downloads,downloads
    print('PASS: official TXT completes the task through the simulated download list')
    finish();print('PASS: another demo starts after refreshing a completed result')
    game().locator('.booth-brand').click();start()
    original=game().evaluate('BROWSE_BOOTH.list()[0]')
    page.reload();game().wait_for_selector('[data-booth-submit]')
    resumed=game().evaluate('BROWSE_BOOTH.list()[0]')
    assert original['id']==resumed['id'] and original['deadline']==resumed['deadline']
    game().goto(BASE+'/games/close-the-popups/browse/booth.html?lang=en');start()
    fresh=game().evaluate('BROWSE_BOOTH.list()[0]');assert fresh['id']!=original['id']
    finish();print('PASS: reload preserves a demo deadline; explicit Start replaces an unfinished rehearsal without event writes')
    assert not writes,writes
    assert not errors,errors
    browser.close()
  finally:server.terminate();server.wait(timeout=5)
if __name__=='__main__':run()
