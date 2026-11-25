#!/usr/bin/env python3
"""
e2e_dashboard.py - headless end-to-end test of the Station 5 multi-player dashboard.
LOCAL server only: it starts its own server (temp data dir, test PINs) and refuses non-local URLs.

Usage:  python3 tools/e2e_dashboard.py [--port 3041] [--base http://127.0.0.1:3041] [--headed]
  --base  use an already running local server instead (needs PINs admin 9999, staff 1111, station 5 = 5005)

Scenarios: 1 three simultaneous players, 2 per-round shuffle, 3 picker refuses a playing player,
4 second dashboard tab, 5 reload mid-round, 6 cancel, 7 End now, 8 phone robustness (reload mid-timer resumes,
a Verdict lost to the network is resent, someone else's Join QR asks first, a stale round is dropped), 9 Game Master
robustness (picker 409 hands back the open round, two phones on one round are flagged). Console errors fail the run,
except network errors a scenario provokes on purpose (EXPECT_NET).
"""
import argparse, json, math, os, random, re, shutil, signal, subprocess, sys, tempfile, time, urllib.request, urllib.error
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'server'))
ADMIN, STAFF, STATION = '9999', '1111', '5005'
N = 8

ap = argparse.ArgumentParser()
ap.add_argument('--port', type=int, default=3041)
ap.add_argument('--base')
ap.add_argument('--headed', action='store_true')
args = ap.parse_args()
BASE = args.base or f'http://127.0.0.1:{args.port}'
assert urlparse(BASE).hostname in ('127.0.0.1', 'localhost'), 'local server only'
GAME = BASE + '/games/scan-me-if-you-can/'

results, problems, console_errors = {}, [], []
EXPECT_NET = set()   # page labels whose failed requests are deliberate in the running scenario

def check(scn, cond, msg):
    results.setdefault(scn, True)
    if not cond:
        results[scn] = False
        problems.append(f'[S{scn}] {msg}')
        print('  FAIL', msg)
    else:
        print('  ok  ', msg)

def api(method, path, pin, body=None):
    req = urllib.request.Request(BASE + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Content-Type': 'application/json', 'X-Pin': pin})
    try:
        with urllib.request.urlopen(req) as r: return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read() or b'{}')

def wait_until(fn, secs=30, what='condition'):
    end = time.time() + secs
    while time.time() < end:
        try:
            v = fn()
            if v or (v == 0 and v is not False and v is not None): return v   # 0 % is a real score now (wrong calls cost 100)
        except Exception: pass
        time.sleep(0.25)
    raise TimeoutError(what)

# ---------- server ----------
srv = None
tmp = None
if not args.base:
    tmp = tempfile.mkdtemp(prefix='scamurai-e2e-')
    env = dict(os.environ, ADMIN_PIN=ADMIN, STAFF_PIN=STAFF, STATION_PINS='1:5001,2:5002,3:5003,4:5004,5:5005',
               PORT=str(args.port), DATA_DIR=tmp)
    srv = subprocess.Popen(['node', 'server.js'], cwd=SERVER_DIR, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
wait_until(lambda: urllib.request.urlopen(BASE + '/api/leaderboard').status == 200, 20, 'server up')

IDS = ['E2E%03d' % i for i in range(1, 9)]
for i, pid in enumerate(IDS):
    st, j = api('POST', '/api/participants', STAFF, {'id': pid, 'name': f'Tester {chr(65+i)}', 'ageGroup': '19–21',
                'pbbAccount': False, 'scamExposure': 'no', 'consent': True})
    assert st == 200, (st, j)
NAME = {pid: f'Tester {chr(65+i)}' for i, pid in enumerate(IDS)}

def overview_total(pid):
    return next(r for r in api('GET', '/api/admin/overview', ADMIN)[1]['rows'] if r['id'] == pid)['total']
def rounds_csv():
    req = urllib.request.Request(BASE + '/api/export/rounds.csv', headers={'X-Pin': ADMIN})
    return urllib.request.urlopen(req).read().decode('utf-8-sig')

# ---------- browser helpers ----------
def route(ctx):
    # fonts are cosmetic: answer with empty CSS so offline runs stay quiet; the QR lib comes from the CDN
    ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda r: r.fulfill(status=200, content_type='text/css', body=''))

def watch(page, label):
    page.on('console', lambda m: m.type == 'error' and not (label in EXPECT_NET and m.text.startswith('Failed to load resource'))
            and console_errors.append(f'{label}: {m.text} @ {m.location.get("url","")}'))
    page.on('pageerror', lambda e: console_errors.append(f'{label}: pageerror {e} {getattr(e, "stack", "")[:300]}'))

def new_ctx(b, label, mobile):
    kw = dict(viewport={'width': 390, 'height': 800}, is_mobile=True, has_touch=True, device_scale_factor=2) if mobile else dict(viewport={'width': 1300, 'height': 900})
    ctx = b.new_context(**kw)
    route(ctx)
    ctx.on('page', lambda p: watch(p, label))
    return ctx

def open_dash(ctx, label):
    p = ctx.new_page()
    p.goto(GAME + 'index.html')
    p.wait_for_selector('input[type=password]')
    p.fill('input[type=password]', STATION)
    p.click('.scm .go')
    p.wait_for_selector('#new')
    p.wait_for_function('window.S5_ROUNDS !== undefined')
    return p

def start_player(dash, pid):
    dash.evaluate('window.S5_JOIN = null')
    dash.click('#new')
    dash.wait_for_selector('.scm .find')
    dash.fill('.scm .find', pid)
    dash.wait_for_function("!document.querySelector('.scm .go').disabled")
    dash.click('.scm .go')
    dash.wait_for_function('window.S5_JOIN')
    join = dash.evaluate('window.S5_JOIN')
    rid = int(join.split('#')[1].split('.')[0])
    return rid, join

def close_modal(dash):
    wait_until(lambda: dash.evaluate("!document.querySelector('#modal .modal')"), 20, 'join modal closes when phone joins')

def phone_join(phone, join):
    phone.goto(join)
    phone.wait_for_selector('.big', timeout=20000)
    return phone.evaluate('S5.get()')

def judge(phone, k, pick=None):
    """judge the next k cards on this phone via the board-number URL; returns list of (n, verdict)"""
    out = []
    for _ in range(k):
        r = phone.evaluate('S5.get()')
        n = next((c for c in r['cards'] if str(c) not in r['done']), None)
        if n is None: break
        phone.goto(f'{GAME}c.html?n={n}')
        if not phone.evaluate(f'(S5.get().started || {{}})[{n}]') and (not r.get('firstCard') or r.get('firstCard') == n):
            phone.click('#go', timeout=15000)
        phone.wait_for_selector('.vbar', timeout=15000)
        phone.wait_for_function("document.querySelector('.vbar .real') && !document.querySelector('.vbar .real').disabled", timeout=15000)
        v = pick or random.choice(['real', 'fake'])
        phone.click(f'.vbar .{v}')
        phone.wait_for_function("document.getElementById('sent') && /Saved/.test(document.getElementById('sent').textContent)", timeout=15000)
        out.append((n, v))
    return out

def phone_sum(phone):
    r = phone.evaluate('S5.get()')
    return max(0, sum(d['pts'] for d in r['done'].values())), len(r['done'])

def tile_text(dash, rid):
    return dash.evaluate(f"(document.querySelector('.tile[data-id=\"{rid}\"]')||{{}}).innerText || ''")

def tile_pct(dash, rid, secs=30):
    def f():
        m = re.search(r'(\d+(?:\.\d+)?)%', tile_text(dash, rid))
        return float(m.group(1)) if m else None
    return wait_until(f, secs, f'tile {rid} shows %')

def pct_of(score): return math.floor(score / (N * 100) * 1000 + 0.5) / 10

deals = {}   # round id -> {n: slug}

def run(pw):
    b = pw.chromium.launch(headless=not args.headed)
    dctx = new_ctx(b, 'dash1', False)
    D = open_dash(dctx, 'dash1')
    phones = {}
    def mk_phone(pid):
        c = new_ctx(b, 'phone-' + pid, True); phones[pid] = (c, c.new_page()); return phones[pid][1]

    # ===== Scenario 1 + 2 + 3: three players at once =====
    print('S1 three simultaneous players')
    rid = {}
    rid[IDS[0]], j1 = start_player(D, IDS[0])
    ph1 = mk_phone(IDS[0]); phone_join(ph1, j1); close_modal(D)
    judge(ph1, 3)                                         # player 1 is mid-round
    rid[IDS[1]], j2 = start_player(D, IDS[1])
    ph2 = mk_phone(IDS[1]); phone_join(ph2, j2); close_modal(D)

    print('S3 picker shows playing now and API refuses a second open round')
    D.click('#new'); D.wait_for_selector('.scm .find')
    D.fill('.scm .find', IDS[0])
    D.wait_for_selector('.scm .it.sel')
    check(3, 'resume or restart' in D.inner_text('.scm .go').lower(), 'dashboard picker offers resume/restart for an active round')
    check(3, 'playing now' in D.inner_text('.scm .list'), 'picker shows the "playing now" pill')
    st, j = api('POST', '/api/rounds', STATION, {'participantId': IDS[0]})
    check(3, st == 409, f'API refuses a second open round (got {st})')
    D.click('.scm .close'); D.wait_for_function("getComputedStyle(document.querySelector('.scm')).display==='none'")

    judge(ph2, 2)
    rid[IDS[2]], j3 = start_player(D, IDS[2])
    ph3 = mk_phone(IDS[2]); phone_join(ph3, j3); close_modal(D)

    print('S2 board number not in the phone\'s deal')
    r3 = ph3.evaluate('S5.get()')
    foreign = next(n for n in range(1, 26) if n not in r3['cards'])
    ph3.goto(f'{GAME}c.html?n={foreign}')
    ph3.wait_for_selector('.box')
    check(2, "isn't one of yours" in ph3.inner_text('main'), f'phone says #{foreign} is not theirs')
    check(2, f"#{r3['cards'][0]}" in ph3.inner_text('main'), 'and points to the next number to find')

    # finish all three, interleaved
    ph1.goto(GAME + 'phone.html'); ph2.goto(GAME + 'phone.html')
    for _ in range(N):
        for ph in (ph1, ph2, ph3):
            if phone_sum(ph)[1] < N: judge(ph, 1)
    for pid, ph in ((IDS[0], ph1), (IDS[1], ph2), (IDS[2], ph3)):
        s, c = phone_sum(ph)
        check(1, c == N, f'{pid} judged {N} cards')
        got = tile_pct(D, rid[pid], 40)
        check(1, abs(got - pct_of(s)) < 0.06, f'{pid}: tile {got}% == phone {s} pts = {pct_of(s)}%')
        check(1, f'{s}' in D.inner_text(f'.tile[data-id="{rid[pid]}"] .pts'), f'{pid}: tile points show {s}')
    for pid, ph in ((IDS[0], ph1), (IDS[1], ph2), (IDS[2], ph3)):
        deals[rid[pid]] = ph.evaluate('S5.get().deal')
    for ph in (ph1, ph2, ph3): ph.context.close()

    # ===== Scenario 4: second dashboard tab =====
    print('S4 second dashboard tab')
    rid4, j4 = start_player(D, IDS[3])
    ph4 = mk_phone(IDS[3]); phone_join(ph4, j4); close_modal(D)
    D2ctx = new_ctx(b, 'dash2', False)
    D2 = open_dash(D2ctx, 'dash2')
    try:
        wait_until(lambda: D2.evaluate(f"!!document.querySelector('.tile[data-id=\"{rid4}\"]')"), 12, 'dash2 sees round')
        check(4, True, 'second tab shows the open round within ~10 s')
    except TimeoutError:
        check(4, False, 'second tab shows the open round within ~10 s')
    # dash2 deals nothing new: its deal must equal dash1's
    judge(ph4, 4)
    wait_until(lambda: 'judged' in tile_text(D2, rid4) and '4 of 8' in tile_text(D2, rid4), 15, 'dash2 scores')
    judge(ph4, 4)
    s4, _ = phone_sum(ph4)
    p1 = tile_pct(D, rid4, 40); p2 = tile_pct(D2, rid4, 40)
    check(4, p1 == p2 == pct_of(s4), f'both tabs show {p1}%/{p2}% == phone {pct_of(s4)}%')
    csv4 = [l for l in rounds_csv().splitlines() if l.startswith(f'{rid4},')]
    check(4, len(csv4) == 1 and csv4[0].split(',')[-2] == str(s4), f'server holds one finished round, score {s4}: {csv4}')
    check(4, sum(1 for l in rounds_csv().splitlines() if f',{IDS[3]},' in l) == 1, 'participant has exactly one round (no double count)')
    check(4, overview_total(IDS[3]) == pct_of(s4), 'overview total matches the Station Score, including a zero score')
    deals[rid4] = ph4.evaluate('S5.get().deal')
    ph4.context.close(); D2ctx.close()

    # ===== Scenario 5: reload mid-round =====
    print('S5 reload dashboard mid-round')
    rid5, j5 = start_player(D, IDS[4])
    ph5 = mk_phone(IDS[4]); phone_join(ph5, j5); close_modal(D)
    judge(ph5, 3)
    wait_until(lambda: '3 of 8' in tile_text(D, rid5), 15, 'tile counts 3')
    D.reload(); D.wait_for_selector('#new'); D.wait_for_function('window.S5_ROUNDS !== undefined')
    wait_until(lambda: D.evaluate(f"!!document.querySelector('.tile[data-id=\"{rid5}\"]')"), 15, 'tile back after reload')
    wait_until(lambda: '3 of 8' in tile_text(D, rid5), 15, 'reloaded tile counts 3')
    check(5, True, 'tile returns after reload with 3 of 8 judged')
    s_mid, _ = phone_sum(ph5)
    check(5, str(s_mid) in D.inner_text(f'.tile[data-id="{rid5}"] .pts'), f'reloaded tile score == {s_mid}')
    judge(ph5, 5)
    s5, _ = phone_sum(ph5)
    got = tile_pct(D, rid5, 40)
    check(5, abs(got - pct_of(s5)) < 0.06, f'after reload tile {got}% == phone {pct_of(s5)}%')
    deals[rid5] = ph5.evaluate('S5.get().deal'); ph5.context.close()

    # ===== Scenario 6: cancel =====
    print('S6 cancel')
    tot0 = overview_total(IDS[5])
    rid6, j6 = start_player(D, IDS[5])
    ph6 = mk_phone(IDS[5]); phone_join(ph6, j6); close_modal(D)
    judge(ph6, 2)
    wait_until(lambda: '2 of 8' in tile_text(D, rid6), 15, 'tile counts 2')
    D.once('dialog', lambda d: d.accept())
    D.click(f'.tile[data-id="{rid6}"] [data-a=cancel]')
    wait_until(lambda: 'Cancelled' in tile_text(D, rid6), 10, 'tile cancelled')
    ph6.goto(GAME + 'phone.html')
    try:
        ph6.wait_for_function("/cancelled this round/.test(document.body.innerText)", timeout=15000)
        check(6, True, 'phone shows the cancelled message')
    except Exception:
        check(6, False, 'phone shows the cancelled message')
    check(6, overview_total(IDS[5]) == tot0, f'player total unchanged ({tot0})')
    deals[rid6] = ph6.evaluate('S5.get().deal')

    # ===== Scenario 7: restart + End now =====
    print('S7 End now (same player restarts after cancel)')
    rid7, j7 = start_player(D, IDS[5])
    check(6, rid7 != rid6, 'cancelled player can start again (new round)')
    phone_join(ph6, j7); close_modal(D)
    judge(ph6, 3)
    wait_until(lambda: '3 of 8' in tile_text(D, rid7), 15, 'tile counts 3')
    D.once('dialog', lambda d: d.accept())
    D.click(f'.tile[data-id="{rid7}"] [data-a=end]')
    s7, c7 = phone_sum(ph6)
    got = tile_pct(D, rid7, 20)
    check(7, abs(got - pct_of(s7)) < 0.06, f'End now: tile {got}% == 3 judged ({s7} pts) over 800 = {pct_of(s7)}%, unjudged = 0')
    csv7 = [l for l in rounds_csv().splitlines() if l.startswith(f'{rid7},')]
    check(7, len(csv7) == 1 and csv7[0].split(',')[-2] == str(s7) and csv7[0].split(',')[-1] == '800', f'server stored {csv7}')
    deals[rid7] = ph6.evaluate('S5.get().deal')
    ph6.goto(GAME + 'phone.html')
    ph6.wait_for_function("/ended at the laptop|done|points/.test(document.body.innerText)", timeout=15000)

    # ===== Scenario 8: phone robustness =====
    print('S8 phone: reload mid-timer, lost verdict, foreign Join QR, stale round')
    rid8, j8 = start_player(D, IDS[6])
    ph8 = mk_phone(IDS[6]); phone_join(ph8, j8); close_modal(D)
    r8 = ph8.evaluate('S5.get()'); n1, n2 = r8['cards'][0], r8['cards'][1]
    ph8.goto(f'{GAME}c.html?n={n1}'); ph8.click('#go', timeout=15000); ph8.wait_for_selector('.vbar', timeout=15000)
    time.sleep(3.2)
    ph8.reload()
    ph8.wait_for_selector('.vbar', timeout=15000)
    shown = int(ph8.inner_text('.vbar .t b'))
    check(8, shown <= 9, f'reload resumes the existing 12-second timer automatically ({shown} s)')
    check(8, ph8.get_by_role('button', name='Start timer', exact=True).count() == 0, 'reload does not offer another Start timer button')
    ph8.click('.vbar .fake')
    ph8.wait_for_function("/Saved/.test(document.getElementById('sent').textContent)", timeout=15000)
    ms = ph8.evaluate(f"S5.get().done[{n1}].ms")
    check(8, ms >= 3000, f'the Verdict time counts from the first start ({ms} ms)')

    EXPECT_NET.add('phone-' + IDS[6])
    ph8.route('**/api/rounds/*/events', lambda rt: rt.fulfill(status=503, body='{}') if rt.request.method == 'POST' else rt.continue_())
    ph8.goto(f'{GAME}c.html?n={n2}'); ph8.wait_for_selector('.vbar', timeout=15000)
    ph8.click('.vbar .real')
    ph8.wait_for_function("/No connection yet/.test(document.getElementById('sent').textContent)", timeout=25000)
    check(8, ph8.evaluate(f"S5.get().done[{n2}].sent") is False, 'a Verdict the laptop did not get is kept as unsent')
    check(8, '1 of 8' in tile_text(D, rid8), 'the laptop has only the first Verdict so far')
    ph8.unroute('**/api/rounds/*/events')
    ph8.goto(GAME + 'phone.html')
    try:
        wait_until(lambda: '2 of 8' in tile_text(D, rid8), 20, 'resent verdict reaches the laptop')
        check(8, True, 'opening the phone page again resends it: the laptop counts 2 of 8')
    except TimeoutError:
        check(8, False, 'opening the phone page again resends it: the laptop counts 2 of 8')
    check(8, ph8.evaluate(f"S5.get().done[{n2}].sent") == 'ok', 'and the phone marks it delivered')

    # ===== Scenario 9: picker 409 + two phones on one round =====
    print('S9 Game Master: picker 409 returns the open round; two phones flagged')
    EXPECT_NET.add('dash1')
    D.evaluate('window.S5_JOIN = null')
    D.click('#new'); D.wait_for_selector('.scm .find'); D.fill('.scm .find', IDS[7])
    D.wait_for_function("!document.querySelector('.scm .go').disabled")
    st, other = api('POST', '/api/rounds', STATION, {'participantId': IDS[7]})   # "another laptop" starts them first
    D.click('.scm .go')
    D.wait_for_function('window.S5_JOIN', timeout=15000)
    j9 = D.evaluate('window.S5_JOIN')
    check(9, f"#{other['roundId']}.{other['token']}" in j9, 'Start on a stale list shows the already open round\'s Join QR, no dead end')
    EXPECT_NET.discard('dash1')
    ph9 = mk_phone(IDS[7]); phone_join(ph9, j9); close_modal(D)
    check(9, len(ph9.evaluate('Object.keys(S5.get().deal)')) == N, 'the open round got a deal')
    # the S8 phone (still mid-round) scans this Join QR: it must ask before dropping its own round
    msgs = []
    ph8.once('dialog', lambda d: (msgs.append(d.message), d.dismiss()))
    ph8.goto('about:blank'); ph8.goto(j9); ph8.wait_for_timeout(3000)   # a camera opens the Join URL fresh; wait_for_timeout lets the dialog handler run
    check(8, msgs and 'still playing' in msgs[0], f'someone else\'s Join QR asks first ({msgs[:1]})')
    check(8, ph8.evaluate('S5.get().id') == rid8, 'declining keeps the phone\'s own round')
    ph8.once('dialog', lambda d: d.accept())
    ph8.goto('about:blank'); ph8.goto(j9); ph8.wait_for_function(f"S5.get() && S5.get().id === {other['roundId']}", timeout=20000)
    try:
        wait_until(lambda: '2 phones' in tile_text(D, other['roundId']), 15, 'two phones flagged')
        check(9, True, 'a second phone joining the same round is flagged on the tile')
    except TimeoutError:
        check(9, False, 'a second phone joining the same round is flagged on the tile: ' + tile_text(D, other['roundId']))
    # a round the server no longer knows (wiped rehearsal database) is dropped, not polled for ever
    ph8.evaluate("S5.save({ id: 999999, token: 'stale', cards: [1,2], deal: {1: 'x', 2: 'y'}, done: {} })")
    ph8.goto(GAME + 'phone.html')
    ph8.wait_for_function("/Scan the Join QR/.test(document.body.innerText)", timeout=15000)
    check(8, ph8.evaluate('S5.get()') is None, 'a stale round from a wiped database is forgotten')
    st, _ = api('POST', '/api/auth', STATION)
    check(8, st == 200, f'and its polling never locks out the shared IP (auth {st})')
    ph8.context.close(); ph9.context.close()

    # ===== Scenario 2 across all rounds =====
    print('S2 per-round shuffle across', len(deals), 'rounds')
    ds = list(deals.items())
    check(2, len({json.dumps(d, sort_keys=True) for _, d in ds}) == len(ds), 'every round has a different deal')
    check(2, len({tuple(sorted(d)) for _, d in ds}) > 1, 'the set of board numbers differs between rounds')
    diff = [(a, b_, n) for i, (a, da) in enumerate(ds) for (b_, db) in ds[i + 1:] for n in da if n in db and da[n] != db[n]]
    check(2, len(diff) >= 1, f'same board number maps to different cards in different rounds (e.g. {diff[:2]})')
    check(2, all(len(d) == N for _, d in ds), 'each deal has 8 numbers')
    b.close()

if True:
    try:
        with sync_playwright() as pw:
            run(pw)
    except Exception as e:
        import traceback; traceback.print_exc()
        problems.append(f'crash: {e!r}')
    finally:
        if srv:
            srv.send_signal(signal.SIGTERM)
            try: srv.wait(5)
            except Exception: srv.kill()
        if tmp: shutil.rmtree(tmp, ignore_errors=True)

check(0, not console_errors, f'no browser console errors ({len(console_errors)})')
for e in console_errors[:20]: print('   console:', e)
print('\n=== SUMMARY ===')
for s in sorted(results): print(f'  S{s}: {"PASS" if results[s] else "FAIL"}' if s else f'  console: {"PASS" if results[s] else "FAIL"}')
sys.exit(1 if problems else 0)
