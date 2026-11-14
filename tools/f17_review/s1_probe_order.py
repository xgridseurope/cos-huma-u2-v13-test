# READ-ONLY probe of Codex S1 on the current code (no repo changes). l02 g1-troba: answer one item, leave with «Torna a mirar»
# to g1-digues (Continua starts disabled), then watch whether/when the new step's Continua gets unlocked.
import json, sys, time
from playwright.sync_api import sync_playwright
PTS = """(k)=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),tg=new Set(__curs.parts[k]),b=A.boxOf(__curs.parts[k]);
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const cx of [b.min.x,b.max.x])for(const cy of [b.min.y,b.max.y])for(const cz of [b.min.z,b.max.z]){const v=new T.Vector3(cx,cy,cz).project(A.camera);
  const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
  const top=document.getElementById('L').getBoundingClientRect().top;const pts=[];for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)pts.push([x0+(x1-x0)*i/10,y0+(y1-y0)*j/10]);
  const cx=(x0+x1)/2,cy=(y0+y1)/2;pts.sort((p,q)=>Math.hypot(p[0]-cx,p[1]-cy)-Math.hypot(q[0]-cx,q[1]-cy));
  for(const p of pts){if(p[0]<r.left||p[0]>r.right||p[1]<40||p[1]>top-4)continue;if(__curs.hitAt(p[0],p[1],tg).ok)return p}return null}"""
TAP = ("const c=__app.renderer.domElement;for(const t of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(t,"
       "{clientX:p[0],clientY:p[1],bubbles:true,pointerId:1,pointerType:'touch',isPrimary:true}));")
WATCH = """()=>{window.__nx=[];const b=document.getElementById('Lnext');new MutationObserver(()=>window.__nx.push([Math.round(performance.now()-window.__t0),__curs.S[__curs.idx].id,!b.disabled])).observe(b,{attributes:true});}"""
def run(br, variant):
    pg = br.new_context(viewport={'width':393,'height':851}, is_mobile=True, has_touch=True).new_page()
    pg.goto('http://127.0.0.1:8772/curs.html?l=l02'); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(1)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(1); pg.click('#Lbegin'); time.sleep(1)
    for _ in range(60):
        if pg.evaluate("__curs.S[__curs.idx].id") == 'g1-troba': break
        pg.click('#Lskip'); time.sleep(.25)
    time.sleep(3); k = pg.evaluate("__curs.tapKey"); p = pg.evaluate(PTS, k)
    pg.evaluate(WATCH)
    pg.evaluate("""()=>{window.__ev=[];const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>{if(ms===700)window.__ev.push(['wait700 created',Math.round(performance.now()-window.__t0)]);return st(f,ms,...a)};
      document.getElementById('Llook').addEventListener('click',()=>window.__ev.push(['leave click',Math.round(performance.now()-window.__t0)]),true)}""")
    if variant == 'A':   # Codex: tap + leave in ONE JavaScript task
        pg.evaluate("(p)=>{window.__t0=performance.now();" + TAP + "document.getElementById('Llook').click();}", p)
    elif variant == 'B': # native event boundary: tap task, then leave as a SEPARATE task 0 ms later
        pg.evaluate("(p)=>{window.__t0=performance.now();" + TAP + "setTimeout(()=>document.getElementById('Llook').click(),0);}", p)
    else:                # Playwright real touch tap, then leave right after (separate tasks)
        pg.evaluate("window.__t0=performance.now()"); pg.touchscreen.tap(p[0], p[1]); pg.evaluate("document.getElementById('Llook').click()")
    time.sleep(.3); s0 = (pg.evaluate("__curs.S[__curs.idx].id"), pg.evaluate("__curs.canNext"))
    time.sleep(3.2); s1 = (pg.evaluate("__curs.S[__curs.idx].id"), pg.evaluate("__curs.canNext"))
    out = {'variant': variant, 'item': k, 'answered': pg.evaluate("__curs.rec.loc"), 'after_0.3s': s0, 'after_3.5s': s1, 'Lnext_changes': pg.evaluate("window.__nx"),
           'stale_unlock': s0[1] is False and s1[1] is True, 'order': pg.evaluate('window.__ev')}
    pg.context.close(); return out
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for v in sys.argv[1:]:
        for i in range(int(__import__('os').environ.get('N','3'))): print(json.dumps(run(br, v)), flush=True)
    br.close()
