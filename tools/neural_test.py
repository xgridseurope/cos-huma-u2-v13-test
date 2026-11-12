import time,os,json
from playwright.sync_api import sync_playwright
OUT='/home/claude/v13fix/qa/neural/'; os.makedirs(OUT,exist_ok=True); log={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':860}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8771/index.html'); pg.wait_for_function("window.__app",timeout=180000)
    pg.add_style_tag(content='.panel{display:none!important}')
    pg.evaluate("__app.setBoneOpacity(45); __app.setSide('Left'); __app.controls.target.set(0.08,1.25,0.05); __app.camera.position.set(0.9,1.45,1.6); __app.controls.update();")
    for typ in ['voluntary','reflex']:
        pg.evaluate("__app.resetAll()"); pg.evaluate("__app.timeScale=0.12"); pg.evaluate(f"__app.startSignal('{typ}')"); t0=time.time(); shots=[]; k=0
        while time.time()-t0<120:
            st=pg.evaluate("__app.signal")
            pg.screenshot(path=f'{OUT}{typ}-{k:02d}.png'); shots.append({'t':round(time.time()-t0,1),'signal':st,'angle':pg.evaluate("__app.elbows.Left.angle"),'stepText':pg.evaluate("[...document.querySelectorAll('#steps li.on')].map(l=>l.textContent)")})
            k+=1
            if st is None and k>2: break
            time.sleep(0.05)
        log[typ]=shots
    pg.evaluate("__app.resetAll()")
    log['errors']=errs
    log['path_check']=pg.evaluate("""(()=>{const T=__app.THREE;const P=__app.paths('Left');const pts=[];for(const n of [...__app.groups.nerves,...__app.groups.spinal,...__app.groups.brain,...__app.groups.eye]){const a=n.geometry.attributes.position.array;for(let i=0;i<a.length;i+=9)pts.push(new T.Vector3(a[i],a[i+1],a[i+2]));}
      const out={};for(const typ of ['voluntary','reflex']){const d=[];for(const leg of P[typ])for(const p of leg.pts){let m=1e9;for(const q of pts){const dd=p.distanceToSquared(q);if(dd<m)m=dd;}d.push(Math.sqrt(m)*1000);}d.sort((a,b)=>a-b);out[typ]={points:d.length,median_mm:+d[Math.floor(d.length/2)].toFixed(1),p90_mm:+d[Math.floor(d.length*.9)].toFixed(1),max_mm:+d.at(-1).toFixed(1)};}return out;})()""")
    b.close()
json.dump(log,open(OUT+'neural_log.json','w'),indent=1,ensure_ascii=False)
for typ in ['voluntary','reflex']:
    seen=[]
    for s in log[typ]:
        key=(s['signal'] and s['signal']['i'], round(s['angle']))
        if not seen or seen[-1]!=key: seen.append(key)
    print(typ,len(log[typ]),'frames; (step,angle):',seen[:24])
print(log['path_check'],log['errors'])
