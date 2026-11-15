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
    browser=pw.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900},reduced_motion='reduce');writes=[];errors=[]
    page.on('request',lambda r:writes.append(r.url) if r.method=='POST' and '/api/' in r.url else None)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'/games/close-the-popups/?demo=1&lang=en')
    def game():return page.locator('#game').element_handle().content_frame()
    def start(task='minute2-movie-animation'):
     f=game();f.locator(f'[data-booth-task="{task}"]').click();f.click('#booth-start')
     try:f.wait_for_selector('[data-booth-submit]',timeout=2000)
     except PlaywrightTimeout:raise AssertionError('Start did not launch task: '+f.locator('#booth-start-note').inner_text())
    def finish():
     f=game();f.locator('[data-booth-submit]').click(force=True);f.wait_for_selector('.booth-score')
     skip=f.get_by_role('button',name='Skip animation')
     if skip.count():skip.click()
    start();finish();print('PASS: first demo task starts and finishes')
    assert page.evaluate("JSON.parse(sessionStorage.getItem('close-popups:demo:v1:practice')).status")=='ended'
    # A returning visitor can use the game brand to choose another task.
    game().locator('.booth-brand').click();game().wait_for_selector('#booth-random')
    start();finish();print('PASS: another task starts after returning through the game header')
    assert not writes,writes
    assert not errors,errors
    browser.close()
  finally:server.terminate();server.wait(timeout=5)
if __name__=='__main__':run()
