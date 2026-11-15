#!/usr/bin/env python3
"""Draw another public-demo task after leaving an unfinished one."""
import os
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright, TimeoutError
import e2e_participant as api
ROOT=Path(__file__).resolve().parents[2]
BASE=api.BASE='http://127.0.0.1:3056'

def run():
 with tempfile.TemporaryDirectory(prefix='popup-draw-') as data:
  server=subprocess.Popen(['node','server.js'],cwd=ROOT/'server',env=dict(os.environ,PORT='3056',DATA_DIR=data,ADMIN_PIN='9999',STAFF_PIN='1111',STATION_PINS='2:5002'),stdout=subprocess.DEVNULL)
  try:
   api.wait_server()
   with sync_playwright() as pw:
    browser=pw.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900},reduced_motion='reduce');writes=[]
    page.on('request',lambda r:writes.append(r.url) if r.method=='POST' and '/api/' in r.url else None)
    page.goto(BASE+'/games/close-the-popups/?demo=1&lang=en');page.clock.install()
    def game():return page.locator('#game').element_handle().content_frame()
    def draw_start():
     game().click('#booth-random');game().wait_for_selector('#booth-start');game().click('#booth-start')
     try:game().wait_for_selector('[data-booth-submit]',timeout=2000)
     except TimeoutError:raise AssertionError('Drawn task did not start: '+game().locator('#booth-start-note').inner_text())
    draw_start();first=game().evaluate('BROWSE_BOOTH.list()[0]')
    page.evaluate('history.back()');game().wait_for_selector('#booth-start');game().click('.booth-back')
    page.clock.fast_forward(61000)
    draw_start();second=game().evaluate('BROWSE_BOOTH.list()[0]')
    assert second['id']!=first['id'] and second['deadline']>first['deadline']
    assert not writes,writes
    print('PASS: Draw a task starts a new demo after leaving an unfinished/expired demo, without event writes')
    browser.close()
  finally:server.terminate();server.wait(timeout=5)
if __name__=='__main__':run()
