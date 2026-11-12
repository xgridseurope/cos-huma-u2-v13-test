import json,time
from playwright.sync_api import sync_playwright
helpers=open('/home/claude/tools/elbow_metrics.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':800,'height':600})
    pg.goto('http://localhost:8771/index.html'); pg.wait_for_function("window.__app",timeout=180000)
    pg.evaluate("window.__probe={T:__app.THREE,boneRoot:()=>__app.scene}"); pg.add_script_tag(content=helpers)
    out={}
    for side in ['Left','Right']:
        res=pg.evaluate("""(side)=>{const T=__app.THREE,e=__app.elbows[side],c0=e.center.clone(),rows=[];
          for(let dy=-6;dy<=6;dy+=2)for(let dz=-6;dz<=6;dz+=2){e.center.copy(c0).add(new T.Vector3(0,dy/1000,dz/1000));
            const r={dy,dz};for(const a of [0,45,90,120]){__app.setElbow(side,a);const m=__elbow.metrics(side);r['pen'+a]=m.maxPenetration_mm;r['in'+a]=m.insideHumerus;r['gap'+a]=m.gapMin_mm;r['p10_'+a]=m.gapP10_mm;}
            rows.push(r);}
          e.center.copy(c0);__app.setElbow(side,0);return rows;}""",side)
        for r in res:
            r['score']=max(r['pen45'],r['pen90'],r['pen120'])+0.5*sum(abs(r['p10_'+str(a)]-r['p10_0']) for a in (45,90,120))/3
        res.sort(key=lambda r:r['score'])
        out[side]=res
        print(side,'default',[r for r in res if r['dy']==0 and r['dz']==0][0])
        for r in res[:4]: print(' best',r)
    b.close()
json.dump(out,open('/home/claude/v13fix/qa/calibration_search.json','w'),indent=1)
