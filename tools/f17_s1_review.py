# F17 S1 technical review test (Codex round 3). Server: python3 -m http.server 8772 --bind 127.0.0.1 from the build under test.
# usage: python3 tools/f17_s1_review.py OUTDIR [N]     N = repeats per case (default 3). Exit 1 on any FAIL.
# The new step's state is recorded INSIDE the page, in the same task as the leave (the old S1 read it later over CDP,
# after the stale unlock had already happened → false PASS).
import json, sys, os, time
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); N = int(sys.argv[2]) if len(sys.argv) > 2 else 3
log = []
def chk(n, c, i=''):
    log.append(('PASS ' if c else 'FAIL ') + n + ('' if c or i == '' else ' · ' + str(i)[:300])); print(log[-1], flush=True)
PTS = """(k)=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),tg=new Set(__curs.parts[k]),b=A.boxOf(__curs.parts[k]);
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const cx of [b.min.x,b.max.x])for(const cy of [b.min.y,b.max.y])for(const cz of [b.min.z,b.max.z]){const v=new T.Vector3(cx,cy,cz).project(A.camera);
  const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
  const top=document.getElementById('L').getBoundingClientRect().top;const pts=[];for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)pts.push([x0+(x1-x0)*i/10,y0+(y1-y0)*j/10]);
  const cx=(x0+x1)/2,cy=(y0+y1)/2;pts.sort((p,q)=>Math.hypot(p[0]-cx,p[1]-cy)-Math.hypot(q[0]-cx,q[1]-cy));
  for(const p of pts){if(p[0]<r.left||p[0]>r.right||p[1]<40||p[1]>top-4)continue;if(__curs.hitAt(p[0],p[1],tg).ok)return p}return null}"""
TAP = ("const c=__app.renderer.domElement;for(const t of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(t,"
       "{clientX:p[0],clientY:p[1],bubbles:true,pointerId:1,pointerType:'touch',isPrimary:true}));"
       "window.__ans=!!document.querySelector('#Lbody .fb.ok');")
# watch #Lnext from now on; __init = state of the new step recorded in the same task as the leave
WATCH = """()=>{window.__nx=[];window.__t0=performance.now();const b=document.getElementById('Lnext');
  new MutationObserver(()=>window.__nx.push([Math.round(performance.now()-window.__t0),__curs.S[__curs.idx].id,!b.disabled])).observe(b,{attributes:true});}"""
LEAVE_REC = "document.querySelector(btn).click();window.__init=[__curs.S[__curs.idx].id,__curs.canNext];"

def page(br, L, stage):
    pg = br.new_context(viewport={'width': 393, 'height': 851}, is_mobile=True, has_touch=True).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(f'http://127.0.0.1:8772/curs.html?l={L}'); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(1)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(1)
    pg.click('#Lbegin'); time.sleep(1)
    for _ in range(60):
        if pg.evaluate("__curs.S[__curs.idx].id") == stage: break
        pg.click('#Lskip'); time.sleep(.25)
    time.sleep(3); return pg, errs, pg.evaluate("__curs.S[__curs.idx].id") == stage

def stale_unlock(pg, wait=3.5):
    time.sleep(wait); init = pg.evaluate("window.__init"); now = [pg.evaluate("__curs.S[__curs.idx].id"), pg.evaluate("__curs.canNext")]
    return init, now, pg.evaluate("window.__nx")

def tap_leave_case(br, tag, L, stage, mode, btn='#Lskip', last=False):
    """answer one tap item and leave. mode: same (one JS task, Codex S1) | native (separate task, 0 ms) | touch (real touch)."""
    pg, errs, ok = page(br, L, stage)
    if not ok: chk(f'{tag}: reached {stage}', False); pg.context.close(); return
    if last:   # g1-troba has 2 items: answer the first at a normal pace, so the next one is the last
        k0 = pg.evaluate("__curs.tapKey"); p0 = pg.evaluate(PTS, k0); pg.touchscreen.tap(p0[0], p0[1]); time.sleep(1.8)
        chk(f'{tag}: first item answered normally, now on the last', pg.evaluate("__curs.tapKey") != k0)
    k = pg.evaluate("__curs.tapKey"); p = pg.evaluate(PTS, k)
    if not p: chk(f'{tag}: target visible', False); pg.context.close(); return
    pg.evaluate(WATCH)
    if mode == 'same':
        pg.evaluate("([p,btn])=>{" + TAP + LEAVE_REC + "}", [p, btn])
    elif mode == 'native':
        pg.evaluate("([p,btn])=>{" + TAP + "setTimeout(()=>{" + LEAVE_REC + "},0);}", [p, btn])
    else:
        pg.touchscreen.tap(p[0], p[1]); pg.evaluate("(btn)=>{window.__ans=!!document.querySelector('#Lbody .fb.ok');" + LEAVE_REC + "}", btn)
    init, now, nx = stale_unlock(pg)
    chk(f'{tag}: item «{k}» answered right (feedback right after the tap)', pg.evaluate("window.__ans"))
    chk(f'{tag}: new step «{init[0]}» keeps «Continua» {init[1]} (old sequence must not unlock it)', now[1] == init[1] and now[0] == init[0], (init, now, nx))
    chk(f'{tag}: no JS errors', not errs, errs); pg.context.close()

with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for r in range(1, N + 1):
        tap_leave_case(br, f'T1#{r} Codex S1 l02 g1-troba→g1-maxil, same task', 'l02', 'g1-troba', 'same')
    tap_leave_case(br, 'T1b l02 g1-troba, same task, «Torna a mirar»', 'l02', 'g1-troba', 'same', btn='#Llook')
    tap_leave_case(br, 'T1c l02 g1-troba LAST item, same task', 'l02', 'g1-troba', 'same', last=True)
    for r in range(1, N + 1):
        tap_leave_case(br, f'T2#{r} native event boundary (separate task, 0 ms)', 'l02', 'g1-troba', 'native')
    tap_leave_case(br, 'T3 real touch tap, then leave', 'l02', 'g1-troba', 'touch')
    tap_leave_case(br, 'T5 l07 gA-troba (c.sequence in a lesson file), same task', 'l07', 'gA-troba', 'same')

    # T4 · normal completion still unlocks «Continua» (the fix must not stop a live sequence)
    pg, errs, ok = page(br, 'l02', 'g1-troba'); chk('T4: reached g1-troba', ok)
    for _ in range(4):
        if pg.evaluate("__curs.canNext"): break
        k = pg.evaluate("__curs.tapKey"); p = pg.evaluate(PTS, k); pg.touchscreen.tap(p[0], p[1]); time.sleep(1.8)
    chk('T4: answering every item normally unlocks «Continua»', pg.evaluate("__curs.canNext"), pg.evaluate("__curs.rec.loc"))
    chk('T4: no JS errors', not errs, errs); pg.context.close()

    # T6 · l11 «doblega el braç»: leave while the arm is still moving (separate tasks, normal timing)
    pg, errs, ok = page(br, 'l11', 'relacio'); chk('T6: reached l11 relacio', ok)
    for _ in range(12):
        if pg.evaluate("!!document.getElementById('bendL')"): break
        pg.evaluate("(()=>{const b=[...document.querySelectorAll('#Lbody button')].find(x=>/Següent|▶/.test(x.textContent)&&!x.disabled&&x.id!=='bendL');b&&b.click()})()"); time.sleep(.6)
    if pg.evaluate("!!document.getElementById('bendL')"):
        pg.evaluate("""()=>{window.__el=[];window.__t0=performance.now();const f=__app.setElbow;__app.setElbow=(s,v)=>{window.__el.push([Math.round(performance.now()-window.__t0),__curs.S[__curs.idx].id,Math.round(v)]);return f(s,v)}}""")
        # leave from the arm's first animation frame (separate task = native boundary), so the leave is always mid-bend,
        # whatever the frame rate (software rendering: ~1 frame/s)
        pg.evaluate("""()=>{const g=__app.setElbow;let armed=true;__app.setElbow=(s,v)=>{const r=g(s,v);if(armed&&__curs.S[__curs.idx].id==='relacio'){armed=false;
          setTimeout(()=>{window.__leave=Math.round(performance.now()-window.__t0);window.__leftAt=Math.round(v);document.getElementById('Lskip').click()},0)}return r};
          document.getElementById('bendL').click()}""")
        time.sleep(4)
        chk('T6: the leave happened while the arm was still bending', pg.evaluate("window.__leftAt") is not None and pg.evaluate("window.__leftAt") < 85, pg.evaluate("window.__leftAt"))
        leave = pg.evaluate("window.__leave"); rest = pg.evaluate("Math.round(__app.elbows.Left.restFlex)")
        after = [e for e in pg.evaluate("window.__el") if e[0] >= leave]
        chk('T6: after leaving, the old bend animation does not move the arm on the new step', not any(e[2] != rest for e in after), {'leave': leave, 'rest': rest, 'after': after[-6:]})
    else: chk('T6: bend button reached', False)
    chk('T6: no JS errors', not errs, errs); pg.context.close()

    # T7 · l12 v-ordre: two wrong picks start the signal demo; leave during it (separate task) to v-explica (no hidden())
    pg, errs, ok = page(br, 'l12', 'v-ordre'); chk('T7: reached l12 v-ordre', ok)
    order = pg.evaluate("__curs.order")
    for _ in range(2):   # pick a wrong item (not the next expected one)
        pg.evaluate("(o)=>{const want=o[[...document.querySelectorAll('#ord li')].length];const b=[...document.querySelectorAll('#pool button')].find(x=>!x.disabled&&x.textContent!==want);b&&b.click()}", order); time.sleep(.4)
    time.sleep(.8)
    pg.evaluate("""()=>{window.__el=[];window.__t0=performance.now();const f=__app.setElbow;__app.setElbow=(s,v)=>{window.__el.push([Math.round(performance.now()-window.__t0),__curs.S[__curs.idx].id,Math.round(v)]);return f(s,v)};
      window.__g0=['brain','spinal','nerves','eye'].map(k=>__app.mats[k].emissive.getHex());
      document.getElementById('Lskip').click();window.__init=[__curs.S[__curs.idx].id,__app.tickers.length];
      window.__gl=[];window.__gi=setInterval(()=>{const g=['brain','spinal','nerves','eye'].map(k=>__app.mats[k].emissive.getHex());if(g.some(x=>x))window.__gl.push([Math.round(performance.now()-window.__t0),g])},150)}""")
    chk('T7: the signal demo was playing when the child left', any(pg.evaluate("window.__g0")), pg.evaluate("window.__g0"))
    time.sleep(12)
    init = pg.evaluate("window.__init"); glow = [g for g in pg.evaluate("window.__gl") if g[0] > 400]
    rest = pg.evaluate("Math.round(__app.elbows.Left.restFlex)"); moves = [e for e in pg.evaluate("window.__el") if e[0] > 50 and e[2] != rest]
    chk('T7: the old demo does not light up parts on the new step', not glow, glow[:4])
    chk('T7: no arm moves from the old demo after leaving', not moves, moves[-5:])
    chk('T7: no JS errors', not errs, errs); pg.context.close()
    br.close()
fails = [l for l in log if l.startswith('FAIL')]
open(OUT + 'summary.txt', 'w').write('\n'.join(log) + f'\n\n{len(log) - len(fails)} PASS · {len(fails)} FAIL\n'); print(f'{len(log) - len(fails)} PASS · {len(fails)} FAIL')
sys.exit(1 if fails else 0)
