import json,time,sys,os
from playwright.sync_api import sync_playwright
URL='http://127.0.0.1:8772/index.html'
OUT=sys.argv[2] if len(sys.argv)>2 else '/tmp/lesson/'
os.makedirs(OUT,exist_ok=True)
VP={'mobile':dict(viewport={'width':393,'height':851},device_scale_factor=1,is_mobile=True,has_touch=True),
    'desktop':dict(viewport={'width':1366,'height':860})}[sys.argv[1] if len(sys.argv)>1 else 'mobile']
JS_TARGET='''(k)=>{const L=__lesson,A=__app,T=A.THREE;const ms=L.parts(k);const r=A.renderer.domElement.getBoundingClientRect();
 // try several points: centre of each target mesh bbox, pick the first that the lesson raycast accepts
 const pts=[];for(const m of ms){const b=A.boxOf([m]);const c=b.getCenter(new T.Vector3());const v=c.clone().project(A.camera);
   if(v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1)pts.push([(v.x+1)/2*r.width+r.left,(1-v.y)/2*r.height+r.top]);}
 return pts.slice(0,40);}'''
def tap(pg,x,y,touch):
    if touch: pg.touchscreen.tap(x,y)
    else: pg.mouse.click(x,y)
def solve_tap(pg,key,touch,log):
    pts=pg.evaluate(JS_TARGET,key)
    L=pg.locator('#L').bounding_box()
    for (x,y) in pts:
        if L and L['x']<=x<=L['x']+L['width'] and L['y']<=y<=L['y']+L['height']: continue
        if y<30: continue
        before=pg.evaluate("document.querySelector('#Ltask .fb.ok')?1:0")
        tap(pg,x,y,touch); time.sleep(.35)
        if pg.evaluate("!!document.querySelector('#Ltask [data-solved]') || !!document.querySelector('#Ltask .fb.ok')"): return True
    log.append(f'TAP FAILED {key} ({len(pts)} pts visible)'); return False
def click_text(pg,text):
    pg.locator('#Ltask button.opt',has_text=text).first.click()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx=b.new_context(**VP); touch=VP.get('has_touch',False)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('console:'+m.text[:200]) if m.type=='error' else None)
    pg.goto(URL); pg.wait_for_function("window.__lesson",timeout=300000); time.sleep(1)
    pg.click('#Lbegin'); time.sleep(1.2)
    n=pg.evaluate("__lesson.S.length"); log=[]
    A0=int(os.environ.get('START','0')); A1=int(os.environ.get('END',str(n)))
    if A0: pg.evaluate(f'__lesson.go({A0})')
    for i in range(A0,A1):
        time.sleep(1.3)
        if os.environ.get('PHASES') and i==int(os.environ['PHASES']):
            for ph in range(5): pg.screenshot(path=f'{OUT}{i:02d}p{ph}.png'); time.sleep(3.2)
        t=pg.evaluate(f"(()=>{{const s=__lesson.S[{i}];return s.task?JSON.parse(JSON.stringify(s.task)):null}})()")
        pg.screenshot(path=f'{OUT}{i:02d}a.png')
        typ=t and t['type']
        try:
            if typ=='choice': click_text(pg,t['opts'][t['a']])
            elif typ=='tap': solve_tap(pg,t['target'],touch,log)
            elif typ=='classify':
                for _ in t['items']:
                    item=pg.locator('#Ltask .item').inner_text()
                    it=[x for x in t['items'] if (x.get('n') or pg.evaluate(f"__lesson.P['{x.get('k')}'].ca"))==item][0]
                    pg.locator('#Ltask button.opt',has_text=t['cats'][it['c']]).first.click(); time.sleep(.8)
            elif typ=='find':
                pg.click('#Lgo'); time.sleep(.5)
                for r in range(t['n']):
                    q=pg.locator('#Ltask .q').first.inner_text(); name=q.split('Toca: ')[1].strip()
                    key=pg.evaluate(f"Object.keys(__lesson.P).find(k=>__lesson.P[k].ca==={json.dumps(name)})")
                    solve_tap(pg,key,touch,log); time.sleep(1.2)
            elif typ=='slider':
                for v in [60,90,40,13]:
                    pg.evaluate(f"(()=>{{const e=document.getElementById('Lang');e.value=Math.max(+e.min,{v});e.dispatchEvent(new Event('input'))}})()"); time.sleep(.4)
            elif typ=='order':
                for it in t['items']: click_text(pg,it); time.sleep(.2)
            elif typ=='predict':
                click_text(pg,t['opts'][t['a']]); time.sleep(4.5); pg.screenshot(path=f'{OUT}{i:02d}c-play.png'); time.sleep(3)
            elif typ=='cards':
                for _ in t['cards']: pg.click('#Lrev'); time.sleep(.15); pg.click('#Lyes'); time.sleep(.15)
            elif typ=='quiz':
                Q=pg.evaluate("__lesson.QUIZ.map(q=>({type:q.type,q:q.q,opts:q.opts,a:q.a,target:q.target}))")
                for k,q in enumerate(Q):
                    time.sleep(2.2)
                    if q['type']=='choice': click_text(pg,q['opts'][q['a']])
                    else: solve_tap(pg,q['target'],touch,log)
                    if k==1: pg.screenshot(path=f'{OUT}{i:02d}c-quiz.png')
                time.sleep(1.5)
        except Exception as e: log.append(f'step {i} {typ} EXC {str(e)[:160]}')
        time.sleep(.6); pg.screenshot(path=f'{OUT}{i:02d}b.png')
        ok=pg.evaluate("__lesson.taskDone")
        log.append(f'{i:02d} {typ} done={ok}')
        if not ok: log.append(f'  !! step {i} not completed'); 
        pg.evaluate("__lesson.next()") if ok else pg.evaluate(f"__lesson.go({i+1})") if i+1<n else None
    time.sleep(1); pg.screenshot(path=f'{OUT}99-end.png')
    print('\n'.join(log)); print('errors',errs); print('stars',pg.evaluate("document.getElementById('Lstars').textContent"))
    b.close()
