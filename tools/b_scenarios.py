# Gate B scenario test: autonomous-learning flow and record reliability (F01 F02 F05 F09 F10 F11 F12 N1, R10 R13 R14).
# usage: python3 tools/b_scenarios.py OUTDIR    (server: python3 -m http.server 8772 --bind 127.0.0.1)   exit 1 on any FAIL
import json, sys, os, time, re, glob
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log = []
def chk(n, c, i=''): log.append(('PASS ' if c else 'FAIL ') + n + ('' if c or i == '' else ' · ' + str(i)[:220])); print(log[-1], flush=True)
# static: no parent-gated wording left in the player or the lessons (N1)
src = ''.join(open(f, encoding='utf8').read() for f in glob.glob(ROOT + '/curs/*.js')) + open(ROOT + '/curs.html', encoding='utf8').read()
chk('N1: no «Per a la família» / 家长判断 / 家长答案 / «per a la família» buttons anywhere', not re.search(r'Per a la família|家长判断|家长答案|per a la família|Ho ha dit bé', src))
URL = 'http://127.0.0.1:8772/curs.html?l='
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width': 393, 'height': 851}, is_mobile=True, has_touch=True); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    def load(q):
        pg.goto(URL + q, timeout=180000); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(.8)
    st = lambda: pg.evaluate('__curs.S[__curs.idx].id')
    rec = lambda L: pg.evaluate(f"JSON.parse(localStorage.getItem('cosHumaCurs_{L}')||'null')")
    vis = lambda sel: pg.evaluate(f"(()=>{{const e=document.querySelector('{sel}');return !!e && getComputedStyle(e).display!=='none'}})()")
    def forward(n):
        for _ in range(n):
            if pg.evaluate('__curs.canNext'): pg.click('#Lnext')
            else: pg.click('#Lskip')
            time.sleep(1.2)
    # ---- 1. fresh start, resume after reload (F02)
    load('l03'); pg.evaluate("localStorage.clear()"); load('l03')
    chk('start: «Comença», no resume/new-round/review buttons on a fresh device', 'Comença' in pg.inner_text('#Lbegin') and not vis('#Lnew') and not vis('#Lday2'))
    pg.click('#Lbegin'); time.sleep(1.2); forward(3); here = st(); r0 = rec('l03')
    chk('record v3 carries content version and current step', r0['v'] == 3 and r0['content'] and r0['idx'] == pg.evaluate('__curs.idx'), (r0.get('v'), r0.get('content'), r0.get('idx')))
    load('l03')
    chk('after reload: «Continua on ho has deixat» + «Comença de nou»', 'Continua' in pg.inner_text('#Lbegin') and vis('#Lnew'), pg.inner_text('#Lbegin'))
    pg.click('#Lbegin'); time.sleep(1.2)
    chk('resume returns to the same step with the same record', st() == here and rec('l03')['started'] == r0['started'], (st(), here))
    # ---- 2. skip for later (F01, R10)
    for _ in range(12):
        if pg.evaluate('__curs.S[__curs.idx].recall') and not pg.evaluate('__curs.canNext'): break
        forward(1)
    sid = st(); s_keys = pg.evaluate('__curs.S[__curs.idx].keys||[]'); rk = pg.evaluate('__curs.S[__curs.idx].recKey||""')
    chk(f'«Més tard» visible on a practice step ({sid})', vis('#Lskip'))
    pg.click('#Lskip'); time.sleep(1.2); r1 = rec('l03')
    chk('skip recorded with time; skipped names marked «salt», never «sol»', sid in r1['skip'] and all(r1[rk].get(k) == 'salt' for k in s_keys) if rk else sid in r1['skip'], (r1['skip'], {k: r1[rk].get(k) for k in s_keys} if rk else ''))
    # ---- 3. new round archives the old record (F02, F12)
    load('l03'); old_started = rec('l03')['started']; pg.click('#Lnew'); time.sleep(1.2)
    arch = pg.evaluate("JSON.parse(localStorage.getItem('cosHumaCurs_l03_arxiu')||'[]')"); rn = rec('l03')
    chk('«Comença de nou» archives the previous record, starts a fresh one', len(arch) == 1 and arch[0]['started'] == old_started and rn['started'] != old_started and rn['idx'] == 0, (len(arch), rn.get('idx')))
    # ---- 4. look again (F10): back to the teaching step; later answers there count as «amb ajuda»
    load('l01'); pg.evaluate("localStorage.removeItem('cosHumaCurs_l01')"); load('l01'); pg.click('#Lbegin'); time.sleep(1.2)
    for _ in range(25):
        if st() == 'P1': break
        forward(1)
    chk('reached l01 practice P1', st() == 'P1')
    chk('«Torna a mirar» visible on a practice step', vis('#Llook'))
    pg.click('#Llook'); time.sleep(1.2); back = st(); r2 = rec('l01')
    chk('look again → previous teaching step, recorded as a revisit', back != 'P1' and not pg.evaluate('__curs.S[__curs.idx].recall') and r2['revisit'].get('P1') == 1, (back, r2['revisit']))
    for _ in range(6):
        if st() == 'P1': break
        forward(1)
    ans = pg.evaluate('__curs.answer'); u = pg.evaluate("__curs.CFG.stages ? null : null")
    pg.evaluate("(a)=>{[...document.querySelectorAll('#Lbody .opts button.opt')].find(x=>x.textContent===a).click()}", ans); time.sleep(1)
    chk('first answer after looking again is recorded «amb ajuda», not «sol»', rec('l01')['units']['U1'][-1] == 'ajuda', rec('l01')['units'])
    # ---- 5. old-version record is kept apart (F12)
    load('l05'); pg.evaluate("localStorage.setItem('cosHumaCurs_l05', JSON.stringify({v:2,lesson:'l05',started:'2026-11-12T10:00:00Z',loc:{},units:{},day2:{}}))"); load('l05')
    chk('old-version record: notice shown, no resume offered', vis('#Lold') and 'Continua' not in pg.inner_text('#Lbegin'))
    pg.click('#Lbegin'); time.sleep(1)
    arch5 = pg.evaluate("JSON.parse(localStorage.getItem('cosHumaCurs_l05_arxiu')||'[]')")
    chk('old-version record archived unchanged; new record has the current version', len(arch5) == 1 and arch5[0]['v'] == 2 and rec('l05')['content'] == pg.evaluate('__curs.CONTENT'))
    # ---- 6. review rounds: suggested (never locked), dated, default ≤ 8, each item skippable (R14, F05, F11)
    pg.evaluate("(()=>{const r=JSON.parse(localStorage.getItem('cosHumaCurs_l05'));r.finished=new Date(Date.now()-8*864e5).toISOString();localStorage.setItem('cosHumaCurs_l05',JSON.stringify(r))})()"); load('l05')
    chk('finished lesson: «Revisió curta» and «Revisió de la setmana» offered as suggestions', vis('#Lday2') and vis('#Lweek') and 'suggerida' in pg.inner_text('#Lweek'), pg.inner_text('#Lweek'))
    pg.click('#Lweek'); time.sleep(1.5)
    chk('week review labelled as such; every item has «Ara no (salta)»', 'setmana' in pg.inner_text('#Lch') and pg.locator('#sk').count() == 1, pg.inner_text('#Lch'))
    first = pg.inner_text('#Lch'); pg.click('#sk'); time.sleep(1)
    rv = rec('l05')['reviews']
    chk('skipped review item stored as «salt» in a dated «setmana» round', rv and rv[-1]['kind'] == 'setmana' and rv[-1]['date'] and 'salt' in rv[-1]['items'].values(), rv[-1] if rv else None)
    tot = pg.evaluate('__curs.CFG.day2(__curs.ctx).length'); m = re.search(r'/(\d+)', pg.inner_text('#Lch'))
    chk(f'default round size = min(8, {tot})', m and int(m.group(1)) == min(8, tot), pg.inner_text('#Lch'))
    # ---- 7. view buttons + text size (F09) and soft time hints (R13)
    load('l04&tmul=60'); pg.click('#Lbegin'); T0 = time.time(); time.sleep(1.5)
    sz = pg.evaluate("[...document.querySelectorAll('#Vbox button')].map(b=>{const r=b.getBoundingClientRect();return [r.width,r.height]})")
    chk('5 view buttons, each ≥ 44 px', len(sz) == 5 and all(w >= 44 and h >= 44 for w, h in sz), sz)
    d0 = pg.evaluate("(()=>{const A=__app;return A.camera.position.clone().sub(A.controls.target).normalize().toArray()})()")
    pg.click('#Vturn'); time.sleep(1.5)
    d1 = pg.evaluate("(()=>{const A=__app;return A.camera.position.clone().sub(A.controls.target).normalize().toArray()})()")
    chk('🔄 turns the model round (view from behind) without gestures', d0[0] * d1[0] + d0[2] * d1[2] < -0.5, (d0, d1))
    pg.click('#Vin'); time.sleep(.8); pg.click('#Vtxt'); time.sleep(.3)
    chk('A+ enlarges the text', pg.evaluate("document.body.classList.contains('bigtext')"))
    time.sleep(max(0, T0 + 13.5 - time.time())); t1 = pg.locator('.toast').count() and pg.inner_text('.toast')
    time.sleep(max(0, T0 + 16.5 - time.time())); t2 = pg.locator('.toast').count() and pg.inner_text('.toast'); n2 = pg.locator('.toast').count()
    chk('time hints: «estona» at ~12 min, then «descansar» at ~15 min (scaled), one at a time, no lock', t1 and 'estona' in t1 and 'descansar' in t2 and n2 == 1 and pg.evaluate("getComputedStyle(document.querySelector('.toast')).pointerEvents") == 'none', (t1, t2, n2))
    pg.screenshot(path=OUT + 'b-view-toast.png')
    pg.locator('.toast button').first.click(); time.sleep(.3); chk('a hint closes with «D’acord»', pg.locator('.toast').count() == 0)
    chk('no JS errors', not errs, errs)
    b.close()
fails = [l for l in log if l.startswith('FAIL')]
open(OUT + 'summary.txt', 'w').write('\n'.join(log) + f'\n\n{len(log) - len(fails)} PASS · {len(fails)} FAIL\n'); print(f'{len(log) - len(fails)} PASS · {len(fails)} FAIL')
sys.exit(1 if fails else 0)
