# short V1.4 regression after the shared app.js changes (colour override + bulge switch must be inert in V1.4)
import time
from playwright.sync_api import sync_playwright
log=[]
def chk(n,c,i=''): log.append(('PASS' if c else 'FAIL')+' '+n+(' · '+str(i) if i else ''))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_context(viewport={'width':393,'height':851},is_mobile=True,has_touch=True).new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:200]))
    pg.goto('http://127.0.0.1:8772/index.html'); pg.wait_for_function("window.__lesson",timeout=300000); time.sleep(1)
    chk('V1.4 version', pg.evaluate("__app.VERSION").startswith('V1.4'))
    pg.evaluate("__lesson.go(17)"); time.sleep(2)
    pg.evaluate("(()=>{const e=document.getElementById('Lang');e.value=60;e.dispatchEvent(new Event('input'))})()"); time.sleep(.3)
    c=pg.evaluate("(()=>{const m=__app.find(/left biceps brachii/,'muscle')[0];return m.material.color.getHexString()})()")
    chk('V1.4 slider still colours by angle (unchanged behaviour)', c=='d2202f', c)
    vol=lambda: pg.evaluate("(()=>{const ms=__app.find(/left biceps brachii/,'muscle');ms.forEach(m=>m.geometry.computeBoundingBox());const b=__app.boxOf(ms).getSize(new __app.THREE.Vector3());return b.x*b.y*b.z})()")
    pg.evaluate("__app.setElbow('Left',100)"); v1=vol(); pg.evaluate("__app.setBulge(0)"); v0=vol(); pg.evaluate("__app.setBulge(1)")
    chk('V1.4 schematic thickening still on by default', v1>v0*1.02, (round(v0*1e6,1),round(v1*1e6,1)))
    pg.evaluate("__lesson.go(0)"); time.sleep(1.5); chk('V1.4 lesson renders', 'Ossi' in pg.locator('#Lbody').inner_text())
    chk('no JS errors', not errs, errs)
    b.close()
print('\n'.join(log))
