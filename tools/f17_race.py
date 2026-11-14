# F17 regression: fast navigation must not let the OLD step's delayed callbacks touch the NEW step.
# Each scenario does a normal child action, leaves the step at once (no waiting), then only OBSERVES for 3.5 s
# (longer than every delay in player.js: 700, 900, 1400, 2200, 2500 ms). Nothing is slowed down or blocked.
# usage: python3 tools/f17_race.py OUTDIR     (server: python3 -m http.server 8772 --bind 127.0.0.1)   exit 1 on any FAIL
import json, sys, os, time
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
log = []
def chk(n, c, i=''):
    log.append(('PASS ' if c else 'FAIL ') + n + ('' if c or i == '' else ' · ' + str(i)[:240])); print(log[-1], flush=True)
HL = "(()=>{let n=0;__app.scene.traverse(o=>{if(o.userData&&o.userData.hl)n++});return n})()"
SNAP = "JSON.stringify({id:__curs.S[__curs.idx].id,can:__curs.canNext,loc:__curs.rec.loc,units:__curs.rec.units,self:__curs.rec.self,wrong:__curs.rec.wrong,say:__curs.rec.say,spell:__curs.rec.spell})"
PTS = """(k)=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),tg=new Set(__curs.parts[k]),b=A.boxOf(__curs.parts[k]);
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const cx of [b.min.x,b.max.x])for(const cy of [b.min.y,b.max.y])for(const cz of [b.min.z,b.max.z]){const v=new T.Vector3(cx,cy,cz).project(A.camera);
  const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
  const top=document.getElementById('L').getBoundingClientRect().top;const pts=[];for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)pts.push([x0+(x1-x0)*i/10,y0+(y1-y0)*j/10]);
  const cx=(x0+x1)/2,cy=(y0+y1)/2;pts.sort((p,q)=>Math.hypot(p[0]-cx,p[1]-cy)-Math.hypot(q[0]-cx,q[1]-cy));
  for(const p of pts){if(p[0]<r.left||p[0]>r.right||p[1]<40||p[1]>top-4)continue;if(__curs.hitAt(p[0],p[1],tg).ok)return p}return null}"""

def open_lesson(b, L):
    pg = b.new_context(viewport={'width': 393, 'height': 851}, is_mobile=True, has_touch=True).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(f'http://127.0.0.1:8772/curs.html?l={L}'); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(1)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(1)
    pg.click('#Lbegin'); time.sleep(1); return pg, errs

def goto(pg, sid):
    for _ in range(60):
        if pg.evaluate("__curs.S[__curs.idx].id") == sid: time.sleep(3); return True
        pg.click('#Lskip'); time.sleep(.25)
    return False

def tap_key(pg, k):
    p = pg.evaluate(PTS, k)
    if not p: return False
    pg.touchscreen.tap(p[0], p[1]); return True

# The child's action and the leave run in the SAME browser task (0 ms apart: the fastest possible double tap), so the
# old step's 700 / 900 / 1400 / 2200 / 2500 ms callbacks are always still pending. Deterministic on any machine speed.
ANS_JS = "const o=[...document.querySelectorAll('#Lbody .opts button.opt')].find(x=>!x.disabled&&x.textContent===a);o.click();"
WRONG_JS = "const o=[...document.querySelectorAll('#Lbody .opts button.opt')].find(x=>!x.disabled&&x.textContent!==a);o.click();"
TAP_JS = ("const c=__app.renderer.domElement;for(const t of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(t,"
          "{clientX:a[0],clientY:a[1],bubbles:true,pointerId:1,pointerType:'touch',isPrimary:true}));")
def act_and_leave(pg, js, a, btn='#Lskip'):
    pg._old_idx = pg.evaluate("__curs.idx")
    pg.evaluate("([a,btn])=>{" + js + "document.querySelector(btn).click();}", [a, btn])
def leave_and_watch(pg, name, after_leave=None):
    """leave fast («Més tard» or «Torna a mirar»), snapshot the new step, observe 3.5 s, compare."""
    for _ in range(100):   # snapshot as soon as the new step is really on screen (slow software rendering)
        if pg.evaluate("__curs.idx") != pg._old_idx: break
        time.sleep(.03)
    else: chk(f'{name}: the step changed', False); return
    s0, h0 = pg.evaluate(SNAP), pg.evaluate(HL)
    time.sleep(3.5)
    s1, h1 = pg.evaluate(SNAP), pg.evaluate(HL)
    a, b = json.loads(s0), json.loads(s1)
    chk(f'{name}: new step «{a["id"]}» keeps its «Continua» state', a['can'] == b['can'], f'{a["can"]} → {b["can"]}')
    chk(f'{name}: new step keeps its model highlights', h0 == h1, f'{h0} → {h1}')
    chk(f'{name}: no record changed without an action', {k: v for k, v in a.items() if k not in ('can',)} == {k: v for k, v in b.items() if k not in ('can',)}, (s0, s1))
    if after_leave: after_leave(a)

with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])

    # S1 · tap sequence (sequence + tapTask): answer the first «Troba» item, leave at once (inside the 700/900 ms window).
    pg, errs = open_lesson(br, 'l02')
    chk('S1: reached g1-troba', goto(pg, 'g1-troba'))
    k1 = pg.evaluate("__curs.tapKey"); keys = pg.evaluate("Object.keys(__curs.CFG.names)")
    p1 = pg.evaluate(PTS, k1); chk('S1: first item target visible', bool(p1))
    act_and_leave(pg, TAP_JS + "window.__s1=JSON.stringify(__curs.rec.loc);", p1)
    chk('S1: first item answered right by the tap', json.loads(pg.evaluate("window.__s1")).get(k1) in ('sol', 'ajuda'), pg.evaluate("window.__s1"))
    other = [k for k in ['crani', 'maxillar'] if k != k1][0]
    def tap_old(a):
        before = pg.evaluate("__curs.rec.loc")[other] if other in pg.evaluate("__curs.rec.loc") else None
        ok = tap_key(pg, other); time.sleep(1)
        after = pg.evaluate("__curs.rec.loc").get(other)
        chk(f'S1: a later tap on the new step is not scored for the old item «{other}»', (not ok) or after == before, f'{before} → {after}')
    leave_and_watch(pg, 'S1 tap sequence', tap_old)
    pg.screenshot(path=f'{OUT}S1.png'); chk('S1: no JS errors', not errs, errs); pg.context.close()

    # S2 · choiceSeries end = Codex F17 reproduction (l01 P1 → P2): answer every item at normal pace, leave right after
    # the LAST answer (inside the 700 ms step end). S2b: same, leaving with «Torna a mirar» (closure criterion).
    ANS = "(a)=>{const b=[...document.querySelectorAll('#Lbody .opts button.opt')].find(x=>!x.disabled&&x.textContent===a);if(b){b.click();return true}return false}"
    pg, errs = open_lesson(br, 'l01')
    chk('S2: reached P1 (count items)', goto(pg, 'P1')); n = 0
    while n < 14 and pg.evaluate(ANS, pg.evaluate("__curs.answer")):
        n += 1; time.sleep(1.4)
        if pg.evaluate("__curs.canNext"): break
    chk('S2: choiceSeries has items', n >= 2, n); pg.context.close()
    for tag, btn in [('S2', '#Lskip'), ('S2b', '#Llook')]:
        pg, errs = open_lesson(br, 'l01')
        chk(f'{tag}: reached P1', goto(pg, 'P1'))
        for i in range(n - 1):
            pg.evaluate(ANS, pg.evaluate("__curs.answer")); time.sleep(1.4)
        act_and_leave(pg, ANS_JS, pg.evaluate("__curs.answer"), btn)
        leave_and_watch(pg, f'{tag} choiceSeries end, leave with {btn}')
        if tag == 'S2':   # Codex: «Continua» must not let the child pass P2 unanswered and unrecorded
            pg.evaluate("document.getElementById('Lnext').click()"); time.sleep(.5)
            chk('S2: P2 still waits for an answer (Continua does not move on)', pg.evaluate("__curs.S[__curs.idx].id") == 'P2', pg.evaluate("__curs.S[__curs.idx].id"))
        pg.screenshot(path=f'{OUT}{tag}.png'); chk(f'{tag}: no JS errors', not errs, errs); pg.context.close()

    # S3 · leave during the model demo of a second wrong answer (l01 P2: typeColors + 2.2 s, then the old question is
    # redrawn with its own highlight). The new step (P2obs) highlights another bone; it must keep it.
    pg, errs = open_lesson(br, 'l01')
    chk('S3: reached P2', goto(pg, 'P2'))
    a = pg.evaluate("__curs.answer")
    WRONG = "(a)=>{const b=[...document.querySelectorAll('#Lbody .opts button.opt')].find(x=>!x.disabled&&x.textContent!==a);b&&b.click()}"
    pg.evaluate(WRONG, a); time.sleep(.6); act_and_leave(pg, WRONG_JS, a)
    leave_and_watch(pg, 'S3 model demo after two wrong answers')
    pg.screenshot(path=f'{OUT}S3.png'); chk('S3: no JS errors', not errs, errs); pg.context.close()

    # S4 · neutral tap (1400 ms highlight clear): l02 maxil·lar, tap the upper jaw (neutral), leave at once.
    pg, errs = open_lesson(br, 'l02')
    chk('S4: reached g1-troba', goto(pg, 'g1-troba'))
    for _ in range(3):
        if pg.evaluate("__curs.tapKey") == 'maxillar': break
        tap_key(pg, pg.evaluate("__curs.tapKey")); time.sleep(1.5)
    if pg.evaluate("__curs.tapKey") == 'maxillar':
        pg.evaluate("__app.flyTo&&0"); time.sleep(.5)
        p_ = pg.evaluate("""()=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),m=A.find(/maxilla$/,'bone'),S=new Set(m),b=A.boxOf(m);
          const top=document.getElementById('L').getBoundingClientRect().top;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
          for(const cx of [b.min.x,b.max.x])for(const cy of [b.min.y,b.max.y])for(const cz of [b.min.z,b.max.z]){const v=new T.Vector3(cx,cy,cz).project(A.camera);const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
          for(let i=1;i<10;i++)for(let j=1;j<10;j++){const x=x0+(x1-x0)*i/10,y=y0+(y1-y0)*j/10;if(y<40||y>top-4)continue;const h=__curs.hitAt(x,y,new Set());if(h.obj&&S.has(h.obj))return [x,y]}return null}""")
        chk('S4: an upper-jaw point is visible', bool(p_))
        if p_:
            act_and_leave(pg, TAP_JS, p_)
            leave_and_watch(pg, 'S4 neutral tap')
    else: chk('S4: maxil·lar item reached', False, 'order')
    pg.screenshot(path=f'{OUT}S4.png'); chk('S4: no JS errors', not errs, errs); pg.context.close()
    # ---- l10 (Codex round 2): slider idle timer (1 s → neutral colours) vs. the bend / straighten demo ----------------
    SPY = """()=>{window.__mc=[];const f=__app.setMuscleColors;__app.setMuscleColors=(b,t)=>{window.__mc.push([performance.now(),b,t]);return f(b,t)}}"""
    DRAG = "const r=document.querySelector('#Lbody input.arm');for(const v of a.vals){r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}))}"
    def demo_colours_kept(pg, name, want, observe=1.9):
        """after the demo set its contraction colours (want = [b,t]), nothing may reset them before the demo ends."""
        time.sleep(observe); t0 = pg.evaluate("window.__t0"); mc = [m for m in pg.evaluate("window.__mc") if m[0] >= t0]
        i = next((k for k in range(len(mc)) if mc[k][1:] == want), None)
        if i is None: chk(f'{name}: demo set its contraction colours {want}', False, mc[-6:]); return
        later_calls = [m for m in mc[i + 1:] if m[0] - mc[i][0] < 2500]   # demo animation lasts 2.6 s
        chk(f'{name}: demo contraction colours {want} not reset by an old timer', not later_calls, [(round(m[0] - mc[i][0]), m[1], m[2]) for m in later_calls])
    def l10_at(stage):
        pg, errs = open_lesson(br, 'l10'); ok = goto(pg, stage); pg.evaluate(SPY); return pg, errs, ok
    BACK_PLAY = "document.getElementById('Lback').click();window.__t0=performance.now();document.getElementById('pl').click();"

    # S5 · Codex: drag in «Fes-ho tu», go straight back to «Mira» and play the bend demo
    pg, errs, ok = l10_at('A-fes'); chk('S5: reached l10 A-fes', ok)
    pg.evaluate("(a)=>{" + DRAG + BACK_PLAY + "}", {'vals': [40, 60, 80]})
    chk('S5: back on A-demo, demo playing', pg.evaluate("__curs.S[__curs.idx].id") == 'A-demo')
    demo_colours_kept(pg, 'S5 drag → back → bend demo', ['on', 'off'])
    chk('S5: no JS errors', not errs, errs); pg.context.close()

    # S6 · fast repeated drags (both directions, 12 moves over ~0.6 s), then back + demo
    pg, errs, ok = l10_at('A-fes'); chk('S6: reached l10 A-fes', ok)
    for vals in ([30, 50], [70, 90], [60, 40], [80, 100], [90, 110], [70, 50]):
        pg.evaluate("(a)=>{" + DRAG + "}", {'vals': vals}); time.sleep(.1)
    pg.evaluate("(a)=>{" + BACK_PLAY + "}", {})
    demo_colours_kept(pg, 'S6 rapid drags → back → bend demo', ['on', 'off'])
    chk('S6: no JS errors', not errs, errs); pg.context.close()

    # S7 · re-enter the demo: play, leave mid-demo to «Fes-ho tu», drag, come back, play again
    pg, errs, ok = l10_at('A-demo'); chk('S7: reached l10 A-demo', ok)
    pg.evaluate("document.getElementById('pl').click()"); time.sleep(.6)
    pg.evaluate("(a)=>{document.getElementById('Lskip').click();" + DRAG + BACK_PLAY + "}", {'vals': [50, 90]})
    chk('S7: back on A-demo for the second demo', pg.evaluate("__curs.S[__curs.idx].id") == 'A-demo')
    demo_colours_kept(pg, 'S7 second demo after leaving the first', ['on', 'off'])
    chk('S7: no JS errors', not errs, errs); pg.context.close()

    # S8 · same step (P4): the second move in the wrong direction starts the straighten demo while the slider's 1 s
    # timer from that move is still pending
    pg, errs, ok = l10_at('P4'); chk('S8: reached l10 P4', ok)
    pg.evaluate("(a)=>{" + DRAG + "}", {'vals': [110, 125]}); time.sleep(.6)
    pg.evaluate("(a)=>{window.__t0=performance.now();" + DRAG + "}", {'vals': [110, 126]})
    demo_colours_kept(pg, 'S8 P4 straighten demo after wrong moves', ['off', 'on'])
    chk('S8: no JS errors', not errs, errs); pg.context.close()
    # S9 · unchanged rule: without a demo, the slider still turns the colours neutral and the text to the past tense after
    # the child has been still for ~1 s (the fix must not remove the normal behaviour)
    pg, errs, ok = l10_at('A-fes'); chk('S9: reached l10 A-fes', ok)
    pg.evaluate("(a)=>{window.__t0=performance.now();" + DRAG + "}", {'vals': [40, 60, 80]}); time.sleep(1.6)
    mc = [m for m in pg.evaluate("window.__mc") if m[0] >= pg.evaluate("window.__t0")]
    chk('S9: while dragging up, biceps contracting colours', any(m[1:] == ['on', 'off'] for m in mc), mc)
    chk('S9: still for ~1 s → neutral colours', bool(mc) and mc[-1][1:] == ['neutral', 'neutral'] and 800 <= mc[-1][0] - mc[0][0] <= 1500, [(round(m[0] - mc[0][0]), m[1], m[2]) for m in mc])
    chk('S9: live text in the past tense', pg.evaluate("document.querySelector('#Lbody .live').textContent") != '' and pg.evaluate("document.querySelector('#Lbody .live').className") == 'live', pg.evaluate("document.querySelector('#Lbody .live').textContent"))
    chk('S9: no JS errors', not errs, errs); pg.context.close()
    br.close()
fails = [l for l in log if l.startswith('FAIL')]
open(OUT + 'summary.txt', 'w').write('\n'.join(log) + f'\n\n{len(log) - len(fails)} PASS · {len(fails)} FAIL\n'); print(f'{len(log) - len(fails)} PASS · {len(fails)} FAIL')
sys.exit(1 if fails else 0)
