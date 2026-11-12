# Single-lesson test for the 1A sample (bíceps i tríceps). Mobile viewport, touch.
import json,time,sys,os
from playwright.sync_api import sync_playwright
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/sample/'; os.makedirs(OUT,exist_ok=True)
VP=dict(viewport={'width':393,'height':851},device_scale_factor=1,is_mobile=True,has_touch=True)
log=[]; 
def chk(name,cond,info=''): log.append(('PASS' if cond else 'FAIL')+' '+name+(' · '+str(info) if info else ''))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx=b.new_context(**VP); pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('console:'+m.text[:200]) if m.type=='error' else None)
    pg.goto('http://127.0.0.1:8772/sample.html'); pg.wait_for_function("window.__sample",timeout=300000); time.sleep(1)
    pg.screenshot(path=OUT+'00-start.png'); pg.click('#Lbegin'); time.sleep(1.5)
    st=lambda: pg.evaluate("__sample.S[__sample.idx].id")
    vis=lambda: pg.evaluate("({labels:document.querySelectorAll('#labels .lbl').length, book:document.querySelectorAll('#Lbody .book').length, hl:(()=>{let n=0;__app.scene.traverse(o=>{if(o.userData&&o.userData.hl)n++});return n})(), bcol:__app.scene.getObjectByProperty?0:0})")
    def nxt(): pg.click('#Lnext'); time.sleep(1.2)
    def opt(text): pg.locator('#Lbody button.opt',has_text=text).first.click(); time.sleep(.5)
    def slide(v):
        pg.evaluate(f"(()=>{{const r=document.querySelector('#Lbody input.arm');r.value={v};r.dispatchEvent(new Event('input'))}})()"); time.sleep(.15)
    def live(): return pg.evaluate("document.querySelector('#Lbody .live')?.textContent||''")
    def colors(): return pg.evaluate("(()=>{const m=__sample.parts.biceps[0].material,t=__sample.parts.triceps[0].material;return [m.color.getHexString(),t.color.getHexString()]})()")
    def tap(key):
        pts=pg.evaluate("""(k)=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),out=[];for(const m of __sample.parts[k]){const b=A.boxOf([m]);const c=b.getCenter(new T.Vector3());for(const f of [0,.25,-.25]){const q=c.clone();q.y+=(b.max.y-b.min.y)*f;const v=q.project(A.camera);if(v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1)out.push([(v.x+1)/2*r.width+r.left,(1-v.y)/2*r.height+r.top])}}return out}""",key)
        Lr=pg.locator('#L').bounding_box()
        for x,y in pts:
            if Lr['y']<=y: continue
            pg.touchscreen.tap(x,y); time.sleep(.5)
            if pg.evaluate("!!document.querySelector('#Lbody [data-done]')"): return True
        return False
    # intro
    chk('intro', st()=='intro'); nxt()
    # A-pregunta: no labels, no book, no answer marked
    v=vis(); chk('A-pregunta hides answer', v['labels']==0 and v['book']==0 and v['hl']==0, v); pg.screenshot(path=OUT+'01-predict.png')
    chk('next locked before answering', pg.evaluate("document.getElementById('Lnext').disabled"))
    opt('La part de darrere'); chk('prediction not marked wrong', pg.locator('#Lbody .opt.wrong').count()==0); nxt()
    v=vis(); chk('A-llibre shows book + labels', v['book']>=2 and v['labels']==3, v); nxt()
    pg.click('#pl'); time.sleep(1.2); c=colors(); chk('demo bend colours biceps on', c[0]=='d2202f' and c[1]=='e8a3aa', c); pg.screenshot(path=OUT+'02-demo.png'); time.sleep(3); nxt()
    # A-fes slider direction
    for v_ in range(20,96,8): slide(v_)
    t=live(); c=colors(); chk('bending: text+colour', 'doblega' in t and c==['d2202f','e8a3aa'], (t[:40],c))
    slide(80); slide(70); t=live(); c=colors(); chk('straightening from bent: triceps contracts', 'estira' in t and c==['e8a3aa','d2202f'], (t[:40],c))
    pg.screenshot(path=OUT+'03-slider-straighten.png')
    time.sleep(1.4); t=live(); c=colors(); chk('after stop: past tense + neutral colour', t.startswith('Fa un moment has estirat') and c[0]==c[1], (t[:50],c))
    for v_ in range(70,100,6): slide(v_)
    time.sleep(.3); chk('A-fes completes', pg.evaluate("__sample.canNext")); nxt()
    # B
    v=vis(); chk('B-pregunta hides answer', v['labels']==0 and v['book']==0, v); opt('El tríceps'); nxt(); nxt()
    pg.click('#pl'); time.sleep(1.2); c=colors(); chk('demo straighten colours triceps on', c==['e8a3aa','d2202f'], c); time.sleep(3); nxt()
    for v_ in range(100,10,-8): slide(v_)
    time.sleep(.3); chk('B-fes completes', pg.evaluate("__sample.canNext")); nxt()
    # recall R1 R2
    for r in ['R1','R2']:
        v=vis(); chk(f'{r} hides book/labels/highlight', v['labels']==0 and v['book']==0 and v['hl']==0, v)
        chk(f'{r} back locked', pg.evaluate("document.getElementById('Lback').disabled"))
        pg.click('#said'); time.sleep(.3); chk(f'{r} reveals book after answer', vis()['book']>=1)
        pg.click('#pY'); time.sleep(.4); nxt()
    pg.screenshot(path=OUT+'04-practice.png')
    # P1: one wrong to exercise the cue, then right
    v=vis(); chk('P1 hidden', v['labels']==0 and v['book']==0, v)
    opt('Es doblega'); chk('wrong 1 → specific cue (not the answer)', 'Pista' in pg.locator('#Lbody .fb').inner_text() and pg.locator('#Lbody .opt.hint').count()==0)
    opt('S’estira'); time.sleep(.3); nxt()
    opt('El colze'); nxt()
    # P3 two wrongs → demo → retry
    opt('Més prim'); opt('Igual'); time.sleep(6.5); opt('Més gruixut'); time.sleep(.3); chk('P3 solved after demo', pg.evaluate("__sample.canNext")); nxt()
    # P4 hidden slider: first bend (wrong), then straighten
    chk('P4 state text hidden', 'contreu' not in live(), live())
    for v_ in range(105,125,4): slide(v_)
    time.sleep(.6); chk('P4 wrong direction → cue', 'Pista' in pg.locator('#Lbody .fb').inner_text())
    for v_ in range(124,60,-6): slide(v_)
    time.sleep(.3); chk('P4 completes by straightening', pg.evaluate("__sample.canNext")); nxt()
    # P5 P6 taps
    time.sleep(1.2); pg.screenshot(path=OUT+'05-locate.png'); chk('P5 tap biceps', tap('biceps')); nxt(); time.sleep(.5); chk('P6 tap triceps', tap('triceps')); nxt()
    # spelling: biceps ok, triceps accent only
    chk('W1 highlight, no label', vis()['labels']==0); pg.click('#cmp'); time.sleep(.3); pg.screenshot(path=OUT+'06-spell.png'); pg.click('#sY'); nxt()
    pg.click('#cmp'); time.sleep(.3); pg.click('#sA'); nxt()
    time.sleep(.5); pg.screenshot(path=OUT+'07-result.png', full_page=True)
    rec=pg.evaluate("__sample.rec")
    chk('understanding recorded', all(len(rec['K'][k])>0 for k in rec['K']), {k:rec['K'][k] for k in rec['K']})
    chk('spelling separate (accent ≠ failure)', rec['spell']=={'biceps':'ok','triceps':'accent'} and 'Cal repassar' not in pg.locator('#Lbody').inner_text())
    chk('location recorded', rec['loc'], rec['loc'])
    # day 2
    pg.click('#d2'); time.sleep(1); pg.screenshot(path=OUT+'08-day2.png'); chk('day2 checklist 6 items', pg.locator('#Lbody .check input').count()==6)
    pg.locator('#Lbody .check input').first.check(); pg.click('#dl'); time.sleep(1); ok1=tap('biceps'); time.sleep(1.4)
    chk('day2 locate biceps', ok1)
    rec2=pg.evaluate("__sample.rec"); chk('day2 does not overwrite day1 location', rec2['loc']==rec['loc'] and rec2['day2'].get('oral1') and rec2['day2'].get('loc_biceps'), rec2['day2'])
    chk('no JS errors', not errs, errs)
    b.close()
print('\n'.join(log))
