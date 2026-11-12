import json,time,os,sys
from playwright.sync_api import sync_playwright
OUT=sys.argv[1] if len(sys.argv)>1 else '/home/claude/v13fix/qa/elbow/'; os.makedirs(OUT,exist_ok=True)
helpers=open('/home/claude/tools/elbow_metrics.js').read()
R={'runs':[]}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1100,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8771/index.html'); pg.wait_for_function("window.__app",timeout=180000)
    pg.evaluate("window.__probe={T:__app.THREE,boneRoot:()=>__app.scene}")
    pg.add_script_tag(content=helpers)
    # test-only rest-pose ghost of the forearm+hand (yellow) to see the motion against the start pose
    pg.evaluate("""(()=>{const T=__app.THREE;const g=new T.Group();g.name='qa-ghost';for(const s of ['Left','Right'])for(const m of __app.elbows[s].meshes){const c=new T.Mesh(m.geometry,new T.MeshBasicMaterial({color:0xffd06b,transparent:true,opacity:.22,depthWrite:false}));c.matrixAutoUpdate=false;c.matrix.copy(__app.elbows[s].rest.get(m));g.add(c);}__app.scene.add(g);
      const mk=(s)=>{const e=__app.elbows[s];const sp=new T.Mesh(new T.SphereGeometry(.006,12,8),new T.MeshBasicMaterial({color:0xff2a6d,depthTest:false}));sp.renderOrder=99;sp.position.copy(e.center);__app.scene.add(sp);
        const ln=new T.Line(new T.BufferGeometry().setFromPoints([e.center.clone().addScaledVector(e.axis,-.06),e.center.clone().addScaledVector(e.axis,.06)]),new T.LineBasicMaterial({color:0xff2a6d,depthTest:false}));ln.renderOrder=99;__app.scene.add(ln);};
      mk('Left');mk('Right');})()""")
    pg.add_style_tag(content='.panel,.lesson,.card,.banner{display:none!important}')
    snap0={s:pg.evaluate(f"JSON.stringify(__elbow.snapshot('{s}'))") for s in ['Left','Right']}
    for layer in ['brain','spinal','nerves','eye']: pg.evaluate(f"__app.setLayer('{layer}',false)")
    for side in ['Left','Right']:
        pg.evaluate(f"__app.setSide('{side}')")
        for ang in [0,45,90,120]:
            pg.evaluate(f"__app.setAngle({ang} || __app.elbows['{side}'].restFlex)")
            m=pg.evaluate(f"__elbow.metrics('{side}')")
            m['measured_flexion_deg']=pg.evaluate(f"""(()=>{{const T=__app.THREE,e=__app.elbows['{side}'],s='{side}'.toLowerCase();const w=new T.Box3();for(const n of ['lunate','capitate','scaphoid'])w.expandByObject(__app.byName[s+' '+n]);const f=w.getCenter(new T.Vector3()).sub(e.center).normalize();return +(Math.acos(f.dot(e.down))*180/Math.PI).toFixed(1)}})()""")
            c=pg.evaluate(f"__app.elbows['{side}'].center.toArray()")
            lat=1 if side=='Left' else -1
            for view,off in [('front',[0,0,0.95]),('side',[lat*0.95,0,0]),('threequarter',[lat*0.7,0.1,0.7])]:
                pg.evaluate(f"(()=>{{const T=__app.THREE;__app.controls.target.set({c[0]},{c[1]-0.06},{c[2]+0.12});__app.camera.position.set({c[0]+off[0]},{c[1]-0.06+off[1]},{c[2]+0.12+off[2]});__app.controls.update();}})()")
                time.sleep(0.7); pg.screenshot(path=f'{OUT}{side}-{ang:03d}-{view}.png')
            R['runs'].append({'side':side,'angle_requested':ang,'angle_applied':pg.evaluate(f"__app.elbows['{side}'].angle"),'restFlex':pg.evaluate(f"__app.elbows['{side}'].restFlex"),**m})
            print(side,ang,'meas',m['measured_flexion_deg'],'gap',m['gapMin_mm'],'p10',m['gapP10_mm'],'inside',m['insideHumerus'],'/',m['insideTested'],'pen',m['maxPenetration_mm'],'tip',m['fingertip'],'hum',m['humerusCenter'])
        pg.evaluate("__app.resetAll()")
        after=pg.evaluate(f"JSON.stringify(__elbow.snapshot('{side}'))")
        R[f'reset_maxdiff_mm_{side}']=pg.evaluate(f"__elbow.maxDiff(JSON.parse({json.dumps(snap0[side])}),JSON.parse({json.dumps(after)}))*1000")
    # with nerves + muscles at 90 (soft tissue bend)
    for layer in ['nerves','muscle']: pg.evaluate(f"__app.setLayer('{layer}',true)")
    for side in ['Left','Right']:
        pg.evaluate(f"__app.setSide('{side}');__app.setAngle(90)")
        c=pg.evaluate(f"__app.elbows['{side}'].center.toArray()"); lat=1 if side=='Left' else -1
        for view,off in [('front',[0,0,0.8]),('side',[lat*0.8,0,0])]:
            pg.evaluate(f"(()=>{{__app.controls.target.set({c[0]},{c[1]-0.08},{c[2]+0.02});__app.camera.position.set({c[0]+off[0]},{c[1]-0.08+off[1]},{c[2]+0.02+off[2]});__app.controls.update();}})()")
            time.sleep(0.7); pg.screenshot(path=f'{OUT}{side}-090-{view}-nerves-muscles.png')
        pg.evaluate("__app.resetAll()")
    pg.evaluate("__app.setLayer('nerves',true);__app.setLayer('brain',true);__app.setLayer('spinal',true);__app.setLayer('eye',true);__app.setSide('Left');__app.setAngle(90);__app.setSide('Right');__app.setAngle(45);__app.VIEWS.front()")
    time.sleep(1); pg.screenshot(path=f'{OUT}overview-L90-R45.png')
    R['errors']=errs; b.close()
json.dump(R,open(OUT+'elbow_metrics.json','w'),indent=1)
print('reset',R['reset_maxdiff_mm_Left'],R['reset_maxdiff_mm_Right'],errs)
