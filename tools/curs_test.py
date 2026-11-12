# Lesson-player test (1B): runs one lesson config end to end on a phone viewport with the Chinese gloss ON.
# usage: curs_test.py l03|l10 OUTDIR
import json,time,sys,os,random
from playwright.sync_api import sync_playwright
L=sys.argv[1]; OUT=sys.argv[2]; os.makedirs(OUT,exist_ok=True)
log=[]
def chk(n,c,i=''):
    log.append(('PASS' if c else 'FAIL')+' '+n+(' · '+str(i)[:160] if i!='' else '')); print(log[-1], flush=True)
NAMES={'l03':{'humer':'húmer','cubit':'cúbit','radi':'radi','carp':'carp','metacarp':'metacarp','falanges':'falanges'},'l10':{'biceps':'bíceps','triceps':'tríceps'}}[L]
CA2K={v:k for k,v in NAMES.items()}
LEAK10=['二头肌收缩、三头肌放松','三头肌收缩、二头肌放松','二头肌放松','三头肌放松','更粗','= 伸直','el bíceps es contreu','el tríceps es contreu','es relaxa','més gruixut','评分要点']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_context(viewport={'width':393,'height':851},device_scale_factor=1,is_mobile=True,has_touch=True).new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('console:'+m.text[:200]) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:8772/curs.html?l={L}'); pg.wait_for_function("window.__curs",timeout=300000); time.sleep(1)
    pg.click('#Lbegin'); time.sleep(1.2); pg.click('#Lzh'); time.sleep(.2)
    sid=lambda: pg.evaluate("__curs.S[__curs.idx].id")
    labels=lambda: pg.evaluate("document.querySelectorAll('#labels .lbl').length")
    def bodytext(): return pg.evaluate("(()=>{const c=document.querySelector('#Lbody').cloneNode(true);c.querySelectorAll('.opts,button').forEach(x=>x.remove());return c.innerText})()")
    def nxt(): pg.click('#Lnext'); time.sleep(1.3)
    def can(): return pg.evaluate("__curs.canNext")
    def tap_pts(key):
        return pg.evaluate("""(k)=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),out=[];for(const m of __curs.parts[k]){const b=A.boxOf([m]);const c=b.getCenter(new T.Vector3());for(const f of [0,.2,-.2]){const q=c.clone();q.y+=(b.max.y-b.min.y)*f;const v=q.project(A.camera);if(v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1)out.push([(v.x+1)/2*r.width+r.left,(1-v.y)/2*r.height+r.top])}}return out}""",key)
    def tap(key, box_sel='#Lbody [data-done]'):
        Lr=pg.locator('#L').bounding_box(); n0=pg.locator(box_sel).count()
        for attempt in range(2):          # software rendering is slow: recompute the points once if the camera was still moving
            for x,y in tap_pts(key):
                if y>=Lr['y'] or y<32: continue
                pg.touchscreen.tap(x,y); time.sleep(.45)
                if pg.locator(box_sel).count()>n0 or pg.locator('#Lbody .fb.ok').count(): return True
            time.sleep(1.5)
        return False
    def current_target():
        q=pg.locator('#Lbody .q').last.inner_text()
        for ca,k in sorted(CA2K.items(),key=lambda x:-len(x[0])):
            if ca in q: return k
        return None
    wrong_done=False
    for step in range(60):
        s=sid(); time.sleep(.4)
        if s=='fi': break
        if 'pregunta' in s:
            chk(f'{s}: no labels/book before answering', labels()==0 and pg.locator('#Lbody .book').count()==0)
            if L=='l10': t=bodytext(); chk(f'{s}: no answer text (zh on)', not [w for w in LEAK10 if w in t], [w for w in LEAK10 if w in t])
            pg.locator('#Lbody #po button').first.click(); time.sleep(.3); chk(f'{s}: prediction not marked wrong', pg.locator('#Lbody .opt.wrong').count()==0); nxt(); continue
        if s.endswith('coneix'):
            pg.screenshot(path=f'{OUT}{s}.png')
            for _ in range(5):
                if can(): break
                pg.click('#nb'); time.sleep(.6)
            chk(f'{s}: introduced one by one, child-paced', can()); nxt(); continue
        if s.endswith('-fes') and L=='l03':
            chk(f'{s}: labels visible in guided practice', labels()==3)
            for _ in range(3):
                k=current_target(); ok=tap(k); time.sleep(.9)
            chk(f'{s}: guided taps done', can()); nxt(); continue
        if s.endswith('digues'):
            for i in range(3):
                t=pg.locator('#Lbody').inner_text(); k=None
                chk(f'{s}#{i}: name hidden before answer', labels()==0 and not any((' '+ca+'\n') in ('\n'+t+'\n') or t.strip().endswith(ca) for ca in NAMES.values()) and pg.locator('#Lbody .spell').count()==0)
                pg.click('#said'); time.sleep(.2); chk(f'{s}#{i}: name shown after answer', pg.locator('#Lbody .spell').count()==1)
                pg.locator('#Lbody .parent button[data-v="sol"]').click(); time.sleep(1)
            chk(f'{s}: done', can()); nxt(); continue
        if s.endswith('troba') or s=='repas' or s=='P5':
            time.sleep(1.2); pg.screenshot(path=f'{OUT}{s}.png')
            n=len(NAMES) if s=='repas' else (3 if L=='l03' else 2)
            for i in range(n):
                chk(f'{s}#{i}: no labels, no highlight', labels()==0 and pg.evaluate("(()=>{let n=0;__app.scene.traverse(o=>{if(o.userData&&o.userData.hl)n++});return n})()")==0)
                k=current_target()
                if not wrong_done and L=='l03' and s=='g1-troba':
                    other=[x for x in NAMES if x!=k and x in ('humer','cubit','radi')][0]
                    Lr=pg.locator('#L').bounding_box(); pts=[pt for pt in tap_pts(other) if 32<pt[1]<Lr['y']]
                    pg.touchscreen.tap(*pts[0]); time.sleep(.5)
                    fb=pg.locator('#Lbody .fb').last.inner_text() if pg.locator('#Lbody .fb').count() else ''
                    chk(f'{s}: wrong tap → names what was tapped + location hint, no answer highlight', 'Això és' in fb and labels()==0, fb); wrong_done=(k,)
                ok=tap(k); chk(f'{s}#{i}: tap {k}', ok); time.sleep(1)
            chk(f'{s}: done', can()); nxt(); continue
        if s=='escriu':
            for i in range(len(NAMES)):
                t=pg.locator('#Lbody').inner_text(); chk(f'escriu#{i}: word hidden before Comprova', not any(ca in t for ca in NAMES.values()) and labels()==0, t[:60])
                pg.click('#cmp'); time.sleep(.2); v='accent' if i==0 else 'ok'
                pg.locator(f'#Lbody .parent button[data-v="{v}"]').click(); time.sleep(1)
            nxt(); continue
        if L=='l10':
            if s in ('A-demo','B-demo'): pg.click('#pl'); time.sleep(3.5); nxt(); continue
            if s in ('A-fes','B-fes','P4'):
                rng=range(20,100,8) if s=='A-fes' else range(100,10,-8)
                for v in rng: pg.evaluate(f"(()=>{{const r=document.querySelector('#Lbody input.arm');r.value={v};r.dispatchEvent(new Event('input'))}})()"); time.sleep(.12)
                time.sleep(.4); chk(f'{s}: done', can()); nxt(); continue
            if s in ('R1','R2'):
                t=bodytext(); chk(f'{s}: hidden before answer (zh on)', labels()==0 and pg.locator('#Lbody .book').count()==0 and not [w for w in LEAK10 if w in t], [w for w in LEAK10 if w in t])
                chk(f'{s}: back locked', pg.evaluate("document.getElementById('Lback').disabled"))
                pg.click('#said'); time.sleep(.2); pg.click('#pY'); time.sleep(.3); nxt(); continue
            if s in ('P1','P2','P3'):
                t=bodytext(); chk(f'{s}: no answer text (zh on)', not [w for w in LEAK10 if w in t], [w for w in LEAK10 if w in t])
                pg.locator('#Lbody button.opt',has_text={'P1':'S’estira','P2':'El colze','P3':'Més gruixut'}[s]).first.click(); time.sleep(.3); nxt(); continue
        # plain stages
        if can(): nxt(); continue
        print(f'?? stuck at {s}', flush=True); break
    pg.screenshot(path=f'{OUT}fi.png', full_page=True)
    rec=pg.evaluate("__curs.rec")
    chk('reached results', sid()=='fi')
    if L=='l03':
        chk('every name located (groups)', all(rec['loc'].get(k) for k in NAMES), rec['loc'])
        chk('every name in mixed review', all(rec['review'].get(k) for k in NAMES), rec['review'])
        chk('every name said', all(rec['say'].get(k) for k in NAMES), rec['say'])
        if wrong_done: k=[x for x in NAMES if rec['loc'].get(x)=='ajuda']; chk('wrong first tap recorded as "amb ajuda"', len(k)>=1, rec['loc'])
    else:
        chk('units recorded', all(rec['units'][k] for k in rec['units']), rec['units']); chk('locations', all(rec['loc'].get(k) for k in NAMES), rec['loc'])
    chk('spelling separate: accent-only ≠ failure', list(rec['spell'].values())[0]=='accent' and 'Cal repassar' not in pg.locator('#Lbody').inner_text(), rec['spell'])
    # day 2
    print('before d2 tickers',pg.evaluate('__app.tickers.length'),'labels',pg.evaluate("document.querySelectorAll('#labels .lbl').length"),flush=True)
    pg.click('#d2'); time.sleep(1); n=0
    for step in range(30):
        ch=pg.locator('#Lch').inner_text()
        if 'Revisió acabada' in pg.locator('#Lbody').inner_text(): break
        if pg.locator('#said').count():
            vis_=pg.evaluate("getComputedStyle(__app.renderer.domElement).visibility"); t=bodytext()
            chk(f'day2 {ch}: answer hidden before child answers', not ('评分要点' in t or '核对方法' in t) and (L!='l10' or vis_=='hidden'), (vis_,t[:50]))
            pg.click('#said'); time.sleep(.2)
            if pg.locator('#rt button').count(): pg.locator('#rt button').first.click()
            else: pg.locator('#Lbody .parent button[data-v="sol"]').click()
        elif pg.locator('#cmp').count():
            t=pg.locator('#Lbody').inner_text(); chk(f'day2 {ch}: word hidden before Comprova', not any(ca in t for ca in NAMES.values()))
            pg.click('#cmp'); time.sleep(.2); pg.locator('#Lbody .parent button[data-v="ok"]').click()
        else:
            k=current_target(); time.sleep(1.5); chk(f'day2 {ch}: locate {k} without labels', labels()==0 and tap(k,'#tb[data-done]'))
        time.sleep(.6)
        if not pg.locator('#nx').count(): print('?? day2 no next at '+ch+' :: '+pg.locator('#Lbody').inner_text()[:200].replace('\n',' | ')); pg.screenshot(path=f'{OUT}day2-stuck.png'); break
        pg.click('#nx'); time.sleep(.9); n+=1
        print('d2 step',n,'tickers',pg.evaluate('__app.tickers.length'),flush=True)
    chk('day2 finished, one item at a time', 'Revisió acabada' in pg.locator('#Lbody').inner_text(), n)
    pg.screenshot(path=f'{OUT}day2-end.png', full_page=True)
    rec2=pg.evaluate("__curs.rec"); chk('day2 stored separately (day-1 records unchanged)', rec2['loc']==rec['loc'] and len([k for k in rec2['day2'] if k not in ('started','finished')])==n, n)
    chk('no JS errors', not errs, errs)
    b.close()

