import json,time,os
from playwright.sync_api import sync_playwright
OUT='/home/claude/v13fix/qa/mobile/'; os.makedirs(OUT,exist_ok=True); R={}
def touch(cdp,typ,pts): cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in enumerate(pts)]})
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for name,cfg in {'android_393x851':dict(viewport={'width':393,'height':851},device_scale_factor=2.75,is_mobile=True,has_touch=True,user_agent='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'),
                     'tablet_800x1280':dict(viewport={'width':800,'height':1280},device_scale_factor=2,is_mobile=True,has_touch=True),
                     'desktop_1280x860':dict(viewport={'width':1280,'height':860})}.items():
        ctx=b.new_context(**cfg); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)[:200]))
        t0=time.time(); pg.goto('http://localhost:8771/index.html'); pg.wait_for_function("window.__app",timeout=240000); r={'wall_load_s':round(time.time()-t0,1),'app_load_ms':pg.evaluate('__app.loadMs')}
        time.sleep(1); pg.screenshot(path=f'{OUT}{name}-01-start.png')
        mobile=cfg.get('has_touch',False)
        # layout: no element outside viewport, lesson/card/panel overlap
        r['layout']=pg.evaluate("""(()=>{const vw=innerWidth,vh=innerHeight;const box=id=>{const e=document.querySelector(id);const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,vis:getComputedStyle(e).display!=='none'}};
          const P=box('#panel'),L=box('.lesson'),C=box('.card');const ov=(a,b)=>a.vis&&b.vis&&a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
          return {vw,vh,panel:P,lesson:L,card:C,overlap_panel_lesson:ov(P,L),overlap_lesson_card:ov(L,C),overlap_panel_card:ov(P,C),panel_collapsed:document.getElementById('panel').classList.contains('min')}})()""")
        if mobile:
            cdp=ctx.new_cdp_session(pg); W,H=cfg['viewport']['width'],cfg['viewport']['height']; cx,cy=W/2,H*0.55
            c0=pg.evaluate("__app.camera.position.toArray()")
            touch(cdp,'touchStart',[(cx,cy)])
            for i in range(1,16): touch(cdp,'touchMove',[(cx+i*8,cy)]); time.sleep(0.03)
            touch(cdp,'touchEnd',[]); time.sleep(1)
            c1=pg.evaluate("__app.camera.position.toArray()")
            r['touch_rotate_moved_m']=round(sum((a-b)**2 for a,b in zip(c0,c1))**.5,3)
            d0=pg.evaluate("__app.camera.position.distanceTo(__app.controls.target)")
            touch(cdp,'touchStart',[(cx-30,cy),(cx+30,cy)])
            for i in range(1,16): touch(cdp,'touchMove',[(cx-30-i*6,cy),(cx+30+i*6,cy)]); time.sleep(0.03)
            touch(cdp,'touchEnd',[]); time.sleep(1)
            d1=pg.evaluate("__app.camera.position.distanceTo(__app.controls.target)")
            r['pinch_zoom_distance']=[round(d0,3),round(d1,3)]
            pg.evaluate("__app.VIEWS.front()"); time.sleep(.5)
            # tap the menu, toggle a layer, press 90°, voluntary, reset
            pg.tap('#tg'); time.sleep(.5); pg.screenshot(path=f'{OUT}{name}-02-menu-open.png')
            r['menu_open']=not pg.evaluate("document.getElementById('panel').classList.contains('min')")
            pg.tap('[data-layer=nerves]'); time.sleep(.3); r['nerves_hidden_by_tap']=not pg.evaluate("__app.groups.nerves[0].visible"); pg.tap('[data-layer=nerves]')
            pg.tap('[data-a="90"]'); time.sleep(.5); r['angle_after_tap_90']=pg.evaluate("__app.elbows.Left.angle")
            pg.tap('#reset'); time.sleep(.5); r['angle_after_reset']=pg.evaluate("__app.elbows.Left.angle")
            pg.tap('#reflex'); time.sleep(.3); r['reflex_started']=pg.evaluate("__app.signal")
            pg.tap('#tg'); time.sleep(2.5); pg.screenshot(path=f'{OUT}{name}-03-reflex.png')
            time.sleep(6); r['reflex_end_angle']=pg.evaluate("__app.elbows.Left.angle"); pg.screenshot(path=f'{OUT}{name}-04-reflex-end.png')
            pg.evaluate("__app.resetAll();__app.VIEWS.front()"); time.sleep(.5)
            # tap-pick the left median nerve
            xy=pg.evaluate("""(()=>{const T=__app.THREE,m=__app.nerveByName['median nervel001'];const a=m.geometry.attributes.position.array;const i=Math.floor(a.length/6)*3;const v=new T.Vector3(a[i],a[i+1],a[i+2]).project(__app.camera);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]})()""")
            pg.touchscreen.tap(xy[0],xy[1]); time.sleep(.6)
            r['tap_pick']={'xy':[round(x) for x in xy],'card':pg.evaluate("document.getElementById('cName').textContent+' | '+document.getElementById('cEn').textContent")}
            pg.screenshot(path=f'{OUT}{name}-05-tap-pick.png')
        r['perf_swiftshader']=pg.evaluate("__app.measure(4)")
        r['errors']=errs; R[name]=r; ctx.close()
    b.close()
json.dump(R,open(OUT+'mobile_results.json','w'),indent=1,ensure_ascii=False)
for k,v in R.items():
    print(k,{kk:vv for kk,vv in v.items() if kk not in ('layout','perf_swiftshader')})
    print('  layout overlaps',{kk:v['layout'][kk] for kk in v['layout'] if kk.startswith('overlap') or kk=='panel_collapsed'})
    pf=v['perf_swiftshader']; print('  perf',pf['fps_avg'],pf['frame_ms_p50'],pf['frame_ms_p95'],pf['visible_triangles'],pf['draw_calls'],pf['gpu'][:60])
