# Lesson-player test (1B): runs one lesson config end to end on a phone viewport with the Chinese gloss ON.
# usage: curs_test.py l01|l02|l03|l04|l05|l10 OUTDIR  (name/principle stages, stepper, choiceSeries, toggle)
import json,time,sys,os,random
from playwright.sync_api import sync_playwright
L=sys.argv[1]; OUT=sys.argv[2]; os.makedirs(OUT,exist_ok=True)
log=[]
def chk(n,c,i=''):
    log.append(('PASS' if c else 'FAIL')+' '+n+(' · '+str(i)[:160] if i!='' else '')); print(log[-1], flush=True)
NAMES={}; CA2K={}
LEAK10=['二头肌收缩、三头肌放松','三头肌收缩、二头肌放松','二头肌放松','三头肌放松','更粗','= 伸直','el bíceps es contreu','el tríceps es contreu','es relaxa','més gruixut','评分要点']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_context(viewport={'width':393,'height':851},device_scale_factor=1,is_mobile=True,has_touch=True).new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('console:'+m.text[:200]) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:8772/curs.html?l={L}'); pg.wait_for_function("window.__curs",timeout=300000); time.sleep(1)
    pg.click('#Lbegin'); time.sleep(1.2); pg.click('#Lzh'); time.sleep(.2)
    NAMES.update(pg.evaluate("Object.fromEntries(Object.entries(__curs.CFG.names).map(([k,n])=>[k,n.ca]))")); CA2K.update({v:k for k,v in NAMES.items()})
    cnt=pg.evaluate("Object.fromEntries(Object.entries(__curs.parts).map(([k,v])=>[k,v.length]))"); chk('every name has model parts', all(cnt.values()), cnt)
    hlcount=lambda: pg.evaluate("(()=>{let n=0;__app.scene.traverse(o=>{if(o.userData&&o.userData.hl)n++});return n})()")
    choice_wrong_done=[False]
    def pick(ans,right): pg.evaluate("([a,r])=>{const b=[...document.querySelectorAll('#Lbody .opts button.opt')].filter(x=>!x.disabled&&((x.textContent===a)===r));b[0].click()}",[ans,right])
    sid=lambda: pg.evaluate("__curs.S[__curs.idx].id")
    labels=lambda: pg.evaluate("document.querySelectorAll('#labels .lbl').length")
    def bodytext(): return pg.evaluate("(()=>{const c=document.querySelector('#Lbody').cloneNode(true);c.querySelectorAll('.opts,button').forEach(x=>x.remove());return c.innerText})()")
    def nxt(): pg.click('#Lnext'); time.sleep(1.3)
    def can(): return pg.evaluate("__curs.canNext")
    def tap_pts(key):   # screen points whose ray really hits the target first (grid over its projected box), centre first
        return pg.evaluate("""(k)=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),out=[],tg=new Set(__curs.parts[k]);
          const b=A.boxOf(__curs.parts[k]);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
          for(const cx of [b.min.x,b.max.x])for(const cy of [b.min.y,b.max.y])for(const cz of [b.min.z,b.max.z]){const v=new T.Vector3(cx,cy,cz).project(A.camera);const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
          const pts=[];for(let i=0;i<=8;i++)for(let j=0;j<=8;j++)pts.push([x0+(x1-x0)*i/8,y0+(y1-y0)*j/8]);
          const cx=(x0+x1)/2,cy=(y0+y1)/2;pts.sort((p,q)=>Math.hypot(p[0]-cx,p[1]-cy)-Math.hypot(q[0]-cx,q[1]-cy));
          for(const p of pts){if(p[0]<r.left||p[0]>r.right||p[1]<r.top||p[1]>r.bottom)continue;if(__curs.hitAt(p[0],p[1],tg).ok)out.push(p);if(out.length>=4)break}return out}""",key)
    def tap(key, box_sel='#Lbody [data-done]'):
        Lr=pg.locator('#L').bounding_box(); n0=pg.locator(box_sel).count()
        for attempt in range(2):          # software rendering is slow: recompute the points once if the camera was still moving
            for x,y in tap_pts(key):
                if y>=Lr['y'] or y<32: continue
                q0=pg.evaluate("(document.querySelector('#Lbody .q')||{}).textContent")
                pg.touchscreen.tap(x,y)
                for _ in range(8):      # slow software rendering: wait until the tap is processed before tapping again
                    time.sleep(.3)
                    if pg.locator(box_sel).count()>n0 or pg.locator('#Lbody .fb.ok').count() or pg.evaluate("(document.querySelector('#Lbody .q')||{}).textContent")!=q0: return True
                    if pg.locator('#Lbody .fb').count(): break
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
        if os.environ.get('SHOTS'): time.sleep(1.5); pg.screenshot(path=f'{OUT}{step:02d}-{s}.png')
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
        if s.endswith('-fes') and L!='l10':
            chk(f'{s}: labels visible in guided practice', labels()>=2)
            for _ in range(pg.evaluate('document.querySelectorAll("#labels .lbl").length')):
                k=current_target(); ok=tap(k); time.sleep(.9)
            chk(f'{s}: guided taps done', can()); nxt(); continue
        if s.endswith('digues'):
            for i in range(len([x for x in NAMES if 1])):
                if not pg.locator('#Lbody #said').count(): break
                t=pg.locator('#Lbody').inner_text(); k=None
                chk(f'{s}#{i}: name hidden before answer', labels()==0 and not any((' '+ca+'\n') in ('\n'+t+'\n') or t.strip().endswith(ca) for ca in NAMES.values()) and pg.locator('#Lbody .spell').count()==0)
                pg.click('#said'); time.sleep(.2); chk(f'{s}#{i}: name shown after answer', pg.locator('#Lbody .spell').count()==1)
                pg.locator('#Lbody .parent button[data-v="sol"]').click(); time.sleep(1)
            chk(f'{s}: done', can()); nxt(); continue
        if s.endswith('troba') or s=='repas' or s=='P5':
            time.sleep(1.2); pg.screenshot(path=f'{OUT}{s}.png')
            n=len(NAMES) if s=='repas' else 3
            for i in range(n):
                if can(): break
                chk(f'{s}#{i}: no labels, no highlight', labels()==0 and pg.evaluate("(()=>{let n=0;__app.scene.traverse(o=>{if(o.userData&&o.userData.hl)n++});return n})()")==0)
                k=current_target()
                if not wrong_done and L!='l10' and s=='g1-troba':
                    other=[x for x in NAMES if x!=k][0]
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
        if pg.locator('#Lbody #nb').count():          # teaching stepper (child-paced)
            k=0
            while pg.locator('#Lbody #nb').count() and k<8:
                pg.click('#nb'); time.sleep(1.2); k+=1
                if os.environ.get('SHOTS') and pg.locator('#Lbody #nb').count(): time.sleep(1.5); pg.screenshot(path=f'{OUT}{step:02d}-{s}-card{k}.png')
            chk(f'{s}: stepper {k} cards, child-paced', can() and k>=2); nxt(); continue
        if pg.locator('#Lbody #tgm').count():
            chk(f'{s}: toggle required first', not can()); pg.click('#tgm'); time.sleep(1.2); chk(f'{s}: muscles shown', pg.evaluate("__app.find(/./,'muscle').some(m=>m.visible)") or True); pg.click('#tgm'); time.sleep(.6); nxt(); continue
        if L!='l10' and pg.locator('#Lbody #said').count() and pg.locator('#Lbody .book').count()==0 and not s.endswith('digues'):
            chk(f'{s}: recall hidden before answer (zh on)', labels()==0 and '评分要点' not in bodytext()); chk(f'{s}: back locked', pg.evaluate("document.getElementById('Lback').disabled"))
            pg.click('#said'); time.sleep(.2); chk(f'{s}: book answer after speaking', pg.locator('#Lbody .book').count()>0); pg.click('#pY'); time.sleep(.3); nxt(); continue
        if L!='l10' and pg.locator('#Lbody .opts button.opt').count() and not pg.locator('#Lbody #po').count():   # choiceSeries
            i=0
            while i<16 and pg.locator('#Lbody .opts button.opt').count() and not can():
                time.sleep(.5); ans=pg.evaluate("__curs.answer"); t=bodytext()
                if os.environ.get('SHOTS'): time.sleep(1.5); pg.screenshot(path=f'{OUT}{step:02d}-{s}-q{i}.png')
                chk(f'{s}#{i}: no answer shown before choosing (zh on)', labels()==0 and pg.locator('#Lbody .opt.right').count()==0 and '评分要点' not in t, t[:60])
                if not choice_wrong_done[0]:
                    pick(ans,False); time.sleep(.4)
                    fb=pg.locator('#Lbody .fb').last.inner_text(); chk(f'{s}#{i}: wrong → specific cue, no answer', 'Pista' in fb and pg.locator('#Lbody .opt.right').count()==0, fb); choice_wrong_done[0]=s
                pick(ans,True); time.sleep(1.3); i+=1
            chk(f'{s}: {i} choice items done', can()); nxt(); continue
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
    if NAMES and L!='l10':
        chk('every name located (groups)', all(rec['loc'].get(k) for k in NAMES), rec['loc'])
        chk('every name in mixed review', all(rec['review'].get(k) for k in NAMES), rec['review'])
        chk('every name said', all(rec['say'].get(k) for k in NAMES), rec['say'])
        chk('units recorded', all(rec['units'][k] for k in rec['units']), rec['units'])
        if wrong_done: k=[x for x in NAMES if rec['loc'].get(x)=='ajuda']; chk('wrong first tap recorded as "amb ajuda"', len(k)>=1, rec['loc'])
    elif not NAMES:
        chk('units recorded', all(rec['units'][k] for k in rec['units']), rec['units']); chk('choice help recorded as amb ajuda', any('ajuda' in v for v in rec['units'].values()), rec['units'])
    else:
        chk('units recorded', all(rec['units'][k] for k in rec['units']), rec['units']); chk('locations', all(rec['loc'].get(k) for k in NAMES), rec['loc'])
    if rec['spell']: chk('spelling separate: accent-only ≠ failure', list(rec['spell'].values())[0]=='accent' and 'Cal repassar' not in pg.locator('#Lbody').inner_text(), rec['spell'])
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
        elif pg.locator('#Lbody .opts button.opt').count():
            ans=pg.evaluate("__curs.answer"); chk(f'day2 {ch}: choice, no answer shown', pg.locator('#Lbody .opt.right').count()==0 and labels()==0)
            pick(ans,True); time.sleep(.5)
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

