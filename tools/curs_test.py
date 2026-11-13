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
    order_wrong_done=[False]
    def do_order(allow_wrong):
        items=pg.evaluate("__curs.order")
        if allow_wrong and not order_wrong_done[0]:
            pg.evaluate("(t)=>{const b=[...document.querySelectorAll('#Lbody #pool button')].find(x=>x.textContent!==t);b.click()}", items[0]); time.sleep(.4)
            fb=pg.locator('#Lbody .fb').last.inner_text(); chk('order: wrong first pick → specific cue, order not revealed', 'Pista' in fb and pg.locator('#Lbody #ord li').count()==0, fb); order_wrong_done[0]=True
        for it in items:
            pg.evaluate("(t)=>{const b=[...document.querySelectorAll('#Lbody #pool button')].find(x=>x.textContent===t);b.click()}", it); time.sleep(.35)
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
        for attempt in range(4):          # software rendering is slow: recompute the points if the camera was still moving
            for x,y in tap_pts(key):
                if y>=Lr['y'] or y<32: continue
                q0=pg.evaluate("(document.querySelector('#Lbody .q')||{}).textContent")
                pg.touchscreen.tap(x,y)
                for _ in range(8):      # slow software rendering: wait until the tap is processed before tapping again
                    time.sleep(.3)
                    if pg.locator(box_sel).count()>n0 or pg.locator('#Lbody .fb.ok').count() or pg.evaluate("(document.querySelector('#Lbody .q')||{}).textContent")!=q0: return True
                    if pg.locator('#Lbody .fb').count(): break
            time.sleep(2.5)
        return False
    def current_target():
        k=pg.evaluate("__curs.tapKey")
        if k: return k
        q=pg.locator('#Lbody .q').last.inner_text()
        for ca,k in sorted(CA2K.items(),key=lambda x:-len(x[0])):
            if ca in q: return k
        return None
    wrong_done=False
    for step in range(0 if os.environ.get('D2ONLY') else 60):
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
            chk(f'{s}: labels visible in guided practice', labels()>=1)
            for _ in range(pg.evaluate('document.querySelectorAll("#labels .lbl").length')):
                k=current_target(); ok=tap(k); time.sleep(.9)
            chk(f'{s}: guided taps done', can()); nxt(); continue
        if s.endswith('digues'):
            for i in range(len([x for x in NAMES if 1])):
                if not pg.locator('#Lbody #said').count(): break
                t=pg.locator('#Lbody').inner_text(); k=None
                chk(f'{s}#{i}: name hidden before answer', labels()==0 and not any((' '+ca+'\n') in ('\n'+t+'\n') or t.strip().endswith(ca) for ca in NAMES.values()) and pg.locator('#Lbody .spell').count()==0)
                pg.click('#said'); time.sleep(.2); chk(f'{s}#{i}: name shown after answer', pg.locator('#Lbody .spell').count()==1)
                chk(f'{s}#{i}: no parent step (self-check)', pg.locator('#Lbody .parent').count()==0 and pg.locator('#Lbody .self button').count()==3)
                pg.locator('#Lbody .self button[data-v="auto-ok"]').click(); time.sleep(1)
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
                    if 'Això és' not in fb: pg.screenshot(path=f'{OUT}FAIL-{s}-wrongtap.png'); print('diag', json.dumps({'pt': pts[0], 'other': other, 'hit': pg.evaluate("([x,y])=>{const h=__curs.hitAt(x,y,new Set());return h.obj&&h.obj.name}", pts[0]), 'overlay': pg.evaluate("(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.id||e.className||e.tagName)})", pts[0])}), flush=True)
                    chk(f'{s}: wrong tap → names what was tapped + location hint, no answer highlight', 'Això és' in fb and labels()==0, fb); wrong_done=(k,)
                ok=tap(k)
                if not ok: pg.screenshot(path=f'{OUT}FAIL-{s}-{i}-tap.png')
                chk(f'{s}#{i}: tap {k}', ok); time.sleep(1)
            chk(f'{s}: done', can()); nxt(); continue
        if s=='escriu':
            for i in range(len(NAMES)):
                t=pg.locator('#Lbody').inner_text(); chk(f'escriu#{i}: word hidden before Comprova', not any(ca in t for ca in NAMES.values()) and labels()==0, t[:60])
                pg.click('#cmp'); time.sleep(.2); v='auto-accent' if i==0 else 'auto-ok'
                pg.locator(f'#Lbody .self button[data-v="{v}"]').click(); time.sleep(1)
            nxt(); continue
        if pg.locator('#Lbody #ob').count():            # l01 «Observa»: unscored observation (F14)
            k=0
            while pg.locator('#Lbody #ob').count() and k<4:
                chk(f'{s}#{k}: observation not marked right/wrong', pg.locator('#Lbody .opt.right,#Lbody .opt.wrong').count()==0)
                pg.locator('#Lbody #ob button').first.click(); time.sleep(.5); pg.click('#nb'); time.sleep(1.5); k+=1
            chk(f'{s}: three Observa items, child-paced', can() and k==3, k); nxt(); continue
        if pg.locator('#Lbody #pool').count():          # ordering task (l11/l12)
            t=bodytext(); chk(f'{s}: steps shown shuffled, no order revealed', pg.locator('#Lbody #ord li').count()==0 and '评分要点' not in t)
            do_order(True); chk(f'{s}: order completed', can()); nxt(); continue
        if pg.locator('#Lbody #nb').count():          # teaching stepper (child-paced)
            k=0
            while pg.locator('#Lbody #nb').count() and k<8:
                pg.click('#nb'); time.sleep(1.2); k+=1
                if os.environ.get('SHOTS') and pg.locator('#Lbody #nb').count(): time.sleep(1.5); pg.screenshot(path=f'{OUT}{step:02d}-{s}-card{k}.png')
            chk(f'{s}: stepper {k} cards, child-paced', can() and k>=2); nxt(); continue
        if pg.locator('#Lbody #bend').count():
            k=0
            while not can() and k<6: pg.click('#bend'); time.sleep(1.2); k+=1
            chk(f'{s}: child bends/stretches the arm ({k} taps)', can()); nxt(); continue
        if pg.locator('#Lbody #tgmus').count():
            chk(f'{s}: toggle required first', not can()); pg.click('#tgmus'); time.sleep(1.2); pg.click('#tgmus'); time.sleep(.6); chk(f'{s}: toggle done', can()); nxt(); continue
        if pg.locator('#Lbody #tgm').count():
            chk(f'{s}: toggle required first', not can()); pg.click('#tgm'); time.sleep(1.2); chk(f'{s}: muscles shown', pg.evaluate("__app.find(/./,'muscle').concat(__app.find(/./,'allMuscle')).some(m=>m.visible)")); pg.click('#tgm'); time.sleep(.6); nxt(); continue
        if L!='l10' and pg.locator('#Lbody #said').count() and pg.locator('#Lbody .book').count()==0 and not s.endswith('digues'):
            chk(f'{s}: recall hidden before answer (zh on)', labels()==0 and '评分要点' not in bodytext()); chk(f'{s}: back locked', pg.evaluate("document.getElementById('Lback').disabled"))
            pg.click('#said'); time.sleep(.2); chk(f'{s}: book answer after speaking', pg.locator('#Lbody .book').count()>0)
            if pg.locator('#Lbody .self').count()==0:      # unscored reflection (e.g. l06 «Pensa»): nothing to grade
                chk(f'{s}: unscored reflection, no grading, no parent step', 'no s’avalua' in pg.locator('#Lch').inner_text() and pg.locator('#Lbody .parent').count()==0)
            else:
                chk(f'{s}: self-check, no parent step', pg.locator('#Lbody .parent').count()==0 and pg.locator('#Lbody .self button').count()==3)
                pg.locator('#Lbody .self button[data-v="auto-ok"]').click(); time.sleep(.3)
            chk(f'{s}: done', can()); nxt(); continue
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
                pg.click('#said'); time.sleep(.2); pg.locator('#Lbody .self button[data-v="auto-ok"]').click(); time.sleep(.3); nxt(); continue
            if s in ('P1','P2','P3'):
                t=bodytext(); chk(f'{s}: no answer text (zh on)', not [w for w in LEAK10 if w in t], [w for w in LEAK10 if w in t])
                pg.locator('#Lbody button.opt',has_text={'P1':'S’estira','P2':'El colze','P3':'Més gruixut'}[s]).first.click(); time.sleep(.3); nxt(); continue
        # plain stages
        if can(): nxt(); continue
        chk(f'stuck at {s}', False); break
    pg.screenshot(path=f'{OUT}fi.png', full_page=True)
    rec=pg.evaluate("__curs.rec")
    D2=bool(os.environ.get('D2ONLY'))
    if not D2: chk('reached results', sid()=='fi')
    if not D2:
        if NAMES and L!='l10':
            NL=pg.evaluate("Object.keys(__curs.CFG.names).filter(k=>__curs.CFG.names[k].noLoc)"); chk('every name located (groups) — except noLoc '+str(NL), all(rec['loc'].get(k) for k in NAMES if k not in NL) and not any(k in rec['loc'] for k in NL), rec['loc'])
            if NL: chk('noLoc shown as «Pendent de verificar» in results', 'Pendent de verificar' in pg.locator('#Lbody').inner_text())
            chk('every name in mixed review', all(rec['review'].get(k) for k in NAMES if k not in NL), rec['review'])
            chk('every name said (self-checked, recorded as auto-*)', all(str(rec['say'].get(k,'')).startswith('auto-') for k in NAMES), rec['say'])
            chk('units recorded (question or self-check)', all(rec['units'][k] or rec['self'].get(k) for k in rec['units']), rec['units'])
            if wrong_done: k=[x for x in NAMES if rec['loc'].get(x)=='ajuda']; chk('wrong first tap recorded as "amb ajuda"', len(k)>=1, rec['loc'])
        elif not NAMES:
            chk('units recorded (question or self-check)', all(rec['units'][k] or rec['self'].get(k) for k in rec['units']), rec['units']); chk('choice help recorded as amb ajuda', any('ajuda' in v for v in rec['units'].values()), rec['units'])
        else:
            chk('units recorded (question or self-check)', all(rec['units'][k] or rec['self'].get(k) for k in rec['units']), rec['units']); chk('locations', all(rec['loc'].get(k) for k in NAMES), rec['loc'])
        print('INFO units with no in-app question (self-check only):', [k for k in rec['units'] if not rec['units'][k]], flush=True)
        chk('self-check never recorded as an independent right answer', not any(v=='sol' for v in rec['say'].values()) and not any(v=='sol' for a in rec['self'].values() for v in a))
        chk('record carries content version', rec.get('v')==3 and bool(rec.get('content')), rec.get('content'))
        if rec['spell']: chk('spelling separate: accent-only ≠ failure', list(rec['spell'].values())[0]=='auto-accent' and 'Cal repassar' not in pg.locator('#Lbody').inner_text(), rec['spell'])
        chk('results do not claim mastery', not any(w in pg.locator('#Lbody').inner_text() for w in ['Ho domines','Dominat','已经掌握','Ho saps tot']))
    # day 2
    print('before d2 tickers',pg.evaluate('__app.tickers.length'),'labels',pg.evaluate("document.querySelectorAll('#labels .lbl').length"),flush=True)
    (pg.evaluate("document.getElementById('Lday2').click()") if D2 else pg.click('#d2')); time.sleep(1); n=0
    total=pg.evaluate("__curs.CFG.day2(__curs.ctx).length"); first=None
    for step in range(40):
        ch=pg.locator('#Lch').inner_text()
        if 'Revisió acabada' in pg.locator('#Lbody').inner_text():
            if first is None: first=n; chk(f'day2: default round has at most 8 items ({n} of {total})', n==min(8,total), n)
            if pg.locator('#more').count(): pg.click('#more'); time.sleep(.8); continue
            break
        if pg.locator('#said').count():
            vis_=pg.evaluate("getComputedStyle(__app.renderer.domElement).visibility"); t=bodytext()
            chk(f'day2 {ch}: answer hidden before child answers', not ('评分要点' in t or '核对方法' in t) and (L not in ('l10','l11','l12') or vis_=='hidden'), (vis_,t[:50]))
            pg.click('#said'); time.sleep(.2)
            chk(f'day2 {ch}: child checks herself (no parent step)', pg.locator('#Lbody .parent').count()==0 and pg.locator('#Lbody .self button').count()==3)
            pg.locator('#Lbody .self button').first.click()
        elif pg.locator('#Lbody #pool').count():
            chk(f'day2 {ch}: order task, nothing pre-ordered', pg.locator('#Lbody #ord li').count()==0); do_order(False)
        elif pg.locator('#Lbody .opts button.opt').count():
            ans=pg.evaluate("__curs.answer"); chk(f'day2 {ch}: choice, no answer shown', pg.locator('#Lbody .opt.right').count()==0 and labels()==0)
            pick(ans,True); time.sleep(.5)
        elif pg.locator('#cmp').count():
            t=pg.locator('#Lbody').inner_text(); chk(f'day2 {ch}: word hidden before Comprova', not any(ca in t for ca in NAMES.values()))
            pg.click('#cmp'); time.sleep(.2); pg.locator('#Lbody .self button[data-v="auto-ok"]').click()
        else:
            k=current_target(); time.sleep(1.5); chk(f'day2 {ch}: locate {k} without labels', labels()==0 and tap(k,'#tb[data-done]'))
        time.sleep(.6)
        if not pg.locator('#nx').count(): chk('day2 stuck at '+ch, False, pg.locator('#Lbody').inner_text()[:200].replace('\n',' | ')); pg.screenshot(path=f'{OUT}day2-stuck.png'); break
        pg.evaluate("document.getElementById('nx').click()"); time.sleep(.9); n+=1
        print('d2 step',n,'tickers',pg.evaluate('__app.tickers.length'),flush=True)
    chk('day2 finished, one item at a time (default + optional extra)', 'Revisió acabada' in pg.locator('#Lbody').inner_text() and n==total, (n,total))
    pg.screenshot(path=f'{OUT}day2-end.png', full_page=True)
    rec2=pg.evaluate("__curs.rec"); rv=rec2.get('reviews') or []
    chk('review round stored with date and kind; day-1 records unchanged', rec2['loc']==rec['loc'] and len(rv)>=1 and rv[-1].get('date') and rv[-1].get('kind') and len(rv[-1]['items'])==n, (n, rv[-1] if rv else None))
    chk('no JS errors', not errs, errs)
    b.close()
fails=[l for l in log if l.startswith('FAIL')]
open(OUT+'summary.txt','w').write('\n'.join(log)+f'\n\n{len(log)-len(fails)} PASS · {len(fails)} FAIL\n')
print(f'{len(log)-len(fails)} PASS · {len(fails)} FAIL', flush=True)
sys.exit(1 if fails else 0)

