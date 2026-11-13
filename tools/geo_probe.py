# Geometric tap probe (gate A, re-run of the audit's probes): real touch taps on the rendered model, aimed at named meshes,
# through the lesson's own tapTask. For «neutral»/«wrong» cases the FIRST surface under the finger is that mesh; for «right» cases the tap scores through the normal picking rule. Expected outcomes come from tools/expected/answer_key.json (right / neutral / wrong).
# usage: python3 tools/geo_probe.py OUTDIR      (server: python3 -m http.server 8772 --bind 127.0.0.1)   exit 1 on any FAIL
import json, sys, os, time
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
CASES = [  # lesson, name key, mesh to tap, expected outcome, camera direction
 ('l02', 'vertebra', 'Third lumbar vertebra', 'right', [0, .1, -1]),
 ('l02', 'vertebra', 'Intervertebral disk of third lumbar vertebra', 'wrong', [1, 0, .15]),
 ('l02', 'maxillar', 'Mandible', 'right', [1, .05, .4]),
 ('l02', 'maxillar', 'Left maxilla', 'neutral', [1, .05, .4]),
 ('l08', 'abdominal', 'Left rectus abdominis', 'right', [0, .05, 1]),
 ('l08', 'abdominal', 'Left external oblique', 'neutral', [.6, .05, 1]),
 # C2 (11-13): the visible surface is another named part (brain) with a nerve < 2 cm behind it → wrong for «nervis»
 ('l11', 'nervis', '@cervell', 'wrong', 'cos'),
]
log = []
def chk(n, c, i=''): log.append(('PASS ' if c else 'FAIL ') + n + ('' if c or i == '' else ' · ' + str(i)[:200])); print(log[-1], flush=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for L in sorted({c[0] for c in CASES}):
        pg = b.new_context(viewport={'width': 393, 'height': 851}, is_mobile=True, has_touch=True).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto(f'http://127.0.0.1:8772/curs.html?l={L}'); pg.wait_for_function('window.__curs', timeout=300000); time.sleep(1)
        pg.click('#Lbegin'); time.sleep(1)
        for (l, key, mesh, want, d) in [c for c in CASES if c[0] == L]:
            if mesh.startswith('@'):   # sibling-part case: lesson view, point where the first surface is that part and a target lies within 2 cm behind
                sib = mesh[1:]
                pg.evaluate("""([key,v])=>{const c=__curs.ctx; c.hidden(); c.view(v); const el=document.querySelector('#Lbody'); el.removeAttribute('data-done'); el.innerHTML='';
                  window.__res=null; window.__cl&&window.__cl(); window.__cl=c.tapTask(el,{q:'probe',key,cue:'cue',onResult:v=>{window.__res=v}});}""", [key, d])
                time.sleep(4)
                pts = pg.evaluate("""([key,sib])=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),S=new Set(__curs.parts[sib]),G=new Set(__curs.parts[key]),rc=new T.Raycaster(),nd=new T.Vector2();
                  const b=A.boxOf(__curs.parts[sib]);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
                  for(const cx of [b.min.x,b.max.x])for(const cy of [b.min.y,b.max.y])for(const cz of [b.min.z,b.max.z]){const v=new T.Vector3(cx,cy,cz).project(A.camera);const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
                  for(let i=0;i<=24;i++)for(let j=0;j<=24;j++){const x=x0+(x1-x0)*i/24,y=y0+(y1-y0)*j/24;nd.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);rc.setFromCamera(nd,A.camera);
                    const hs=rc.intersectObjects(A.pickables.filter(o=>o.visible),false);if(!hs.length||!S.has(A.resolveHit(hs[0])))continue;
                    if(hs.some(h=>h.distance<=hs[0].distance+.02&&G.has(A.resolveHit(h))))return [[x,y]]}return []}""", [key, sib])
                if not pts: chk(f'{L}.{key}: tap «{sib}» (target < 2 cm behind) → {want}', False, 'no such point in this view'); continue
                pg.touchscreen.tap(pts[0][0], pts[0][1]); time.sleep(1.2)
                fb = pg.evaluate("(document.querySelector('#Lbody .fb')||{}).className||''"); txt = pg.evaluate("(document.querySelector('#Lbody .fb')||{}).textContent||''")
                got = 'right' if pg.evaluate('window.__res') else ('neutral' if 'info' in fb else ('wrong' if 'no' in fb else 'none'))
                pg.screenshot(path=f'{OUT}{L}-{key}-{sib}.png')
                chk(f'{L}.{key}: tap «{sib}» (target < 2 cm behind) → {want}', got == want and sib in txt, f'got {got} · {txt}'); continue
            pg.evaluate("""([key,mesh,d])=>{const c=__curs.ctx,A=c.A,T=c.T; c.hidden(); const el=document.querySelector('#Lbody'); el.removeAttribute('data-done'); el.innerHTML='';
              const m=A.find(new RegExp('^'+mesh.toLowerCase()+'$')); window.__pm=m; const bx=A.boxOf(m),ctr=bx.getCenter(new T.Vector3()),sz=bx.getSize(new T.Vector3());
              A.flyTo(ctr,new T.Vector3(...d).normalize().multiplyScalar(c.fitDist(Math.max(sz.y,.08)*1.4,Math.max(sz.x,sz.z,.08)*1.4)),1);
              window.__res=null; window.__cl&&window.__cl(); window.__cl=c.tapTask(el,{q:'probe',key,cue:'cue',onResult:v=>{window.__res=v}});}""", [key, mesh, d])
            time.sleep(2.5)
            pts = pg.evaluate("""(want)=>{const A=__app,T=A.THREE,r=A.renderer.domElement.getBoundingClientRect(),tg=new Set(window.__pm),b=A.boxOf(window.__pm);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
              for(const cx of [b.min.x,b.max.x])for(const cy of [b.min.y,b.max.y])for(const cz of [b.min.z,b.max.z]){const v=new T.Vector3(cx,cy,cz).project(A.camera);const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
              const out=[];for(let i=1;i<10;i++)for(let j=1;j<10;j++){const x=x0+(x1-x0)*i/10,y=y0+(y1-y0)*j/10;if(x<r.left||x>r.right||y<40||y>document.getElementById('L').getBoundingClientRect().top-4)continue;
                const h=__curs.hitAt(x,y,want==='right'?tg:new Set());if(want==='right'?h.ok:(h.obj&&tg.has(h.obj)))out.push([x,y,Math.hypot(x-(x0+x1)/2,y-(y0+y1)/2)])}out.sort((a,b)=>a[2]-b[2]);return out.slice(0,1)}""", want)
            if not pts: chk(f'{L}.{key}: tap «{mesh}» → {want}', False, 'mesh not reachable from this view'); continue
            pg.touchscreen.tap(pts[0][0], pts[0][1]); time.sleep(1.2)
            fb = pg.evaluate("(document.querySelector('#Lbody .fb')||{}).className||''"); txt = pg.evaluate("(document.querySelector('#Lbody .fb')||{}).textContent||''")
            res = pg.evaluate('window.__res'); got = 'right' if res else ('neutral' if 'info' in fb else ('wrong' if 'no' in fb else 'none'))
            pg.screenshot(path=f'{OUT}{L}-{key}-{mesh.replace(" ", "_")}.png')
            extra = (want != 'wrong' or 'disk' not in mesh.lower() or 'disc' in txt)
            chk(f'{L}.{key}: tap «{mesh}» → {want}', got == want and extra, f'got {got} · {txt}')
        rec = pg.evaluate('__curs.rec')
        if any(c[0] == L and c[3] == 'neutral' for c in CASES): chk(f'{L}: neutral taps counted apart, not as wrong', all(v >= 1 for v in (rec.get('neutral') or {}).values()) and bool(rec.get('neutral')), rec.get('neutral'))
        chk(f'{L}: no JS errors', not errs, errs)
    b.close()
fails = [l for l in log if l.startswith('FAIL')]
open(OUT + 'summary.txt', 'w').write('\n'.join(log) + f'\n\n{len(log) - len(fails)} PASS · {len(fails)} FAIL\n'); print(f'{len(log) - len(fails)} PASS · {len(fails)} FAIL')
sys.exit(1 if fails else 0)
