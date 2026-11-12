import json,time,os
from playwright.sync_api import sync_playwright
OUT='/home/claude/v13/qa/baseline/'; os.makedirs(OUT,exist_ok=True)
LIB='/home/claude/three160/node_modules/three/'
helpers=open('/home/claude/tools/elbow_metrics.js').read()
def route(r):
    u=r.request.url; p=u.split('three@0.160.1/')[1]
    f=LIB+p
    r.fulfill(path=f,content_type='application/javascript') if os.path.exists(f) else r.fulfill(status=404)
R={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:300]))
    pg.route('https://cdn.jsdelivr.net/npm/three@0.160.1/**',route)
    pg.goto('http://localhost:8770/index_instrumented.html'); 
    pg.wait_for_function("window.__v13 && window.__v13.boneRoot && Object.keys(window.__v13.pivots).length===2",timeout=240000)
    pg.evaluate("window.__probe={T:__v13.T,boneRoot:()=>__v13.boneRoot,nerveRoot:()=>__v13.nerveRoot}")
    pg.add_script_tag(content=helpers)
    R['status']=pg.evaluate("document.getElementById('status').textContent")
    R['axis_default']=pg.evaluate("document.getElementById('axis').value")
    # default look screenshot
    time.sleep(1); pg.screenshot(path=OUT+'00-default.png')
    pg.evaluate("__v13.boneRoot.traverse(n=>{if(n.isMesh&&n.userData.layer!=='skeleton')n.visible=false}); document.getElementById('opacity').value=100; __v13.setLayers(); __v13.boneRoot.traverse(n=>{if(n.isMesh&&n.userData.layer!=='skeleton')n.visible=false}); __v13.nerveRoot.visible=false; document.getElementById('markers').checked=true;")
    snap0={s:pg.evaluate(f"JSON.stringify(__elbow.snapshot('{s}'))") for s in ['Left','Right']}
    res=[]
    for side in ['Left','Right']:
        for ang in [0,45,90]:
            pg.evaluate(f"document.getElementById('side').value='{side}';document.getElementById('angle').value={ang};__v13.setAngle();")
            m=pg.evaluate(f"__elbow.metrics('{side}')")
            piv=pg.evaluate(f"(()=>{{const v=__v13.pivots['{side}'].pivot.getWorldPosition(new __v13.T.Vector3());return [v.x,v.y,v.z]}})()")
            sx=0.75 if side=='Left' else -0.75
            for view,off in [('front',[0,0.02,0.75]),('side',[sx,0.02,0])]:
                pg.evaluate(f"(()=>{{const c=__v13.camera,o=__v13.orbit;o.target.set({piv[0]},{piv[1]-0.08},{piv[2]});c.position.set({piv[0]+off[0]},{piv[1]+off[1]-0.08},{piv[2]+off[2]});c.near=0.005;c.updateProjectionMatrix();o.update();}})()")
                time.sleep(0.6); pg.screenshot(path=f'{OUT}{side}-{ang:03d}-{view}.png')
            res.append({'side':side,'angle':ang,'pivot':piv,**m})
        pg.evaluate(f"document.getElementById('angle').value=0;__v13.setAngle();")
        after=pg.evaluate(f"JSON.stringify(__elbow.snapshot('{side}'))")
        R[f'reset_maxdiff_mm_{side}']=pg.evaluate(f"__elbow.maxDiff(JSON.parse({json.dumps(snap0[side])}),JSON.parse({json.dumps(after)}))*1000")
    R['results']=res; R['errors']=errs
    b.close()
json.dump(R,open(OUT+'baseline_metrics.json','w'),indent=1)
for r in R['results']: print(r['side'],r['angle'],'gap',r['gapMin_mm'],'inside',r['insideHumerus'],'/',r['insideTested'],'tip',r['fingertip'])
print('reset',R.get('reset_maxdiff_mm_Left'),R.get('reset_maxdiff_mm_Right'),R['errors'],R['status'][:120])
