// Shared helpers for lessons 11–12 (funció de relació, p. 28–29). Not part of the player: older lessons do not load this file.
// 1) signal(c): the textbook steps shown one at a time on the model. The paths come from app.js `paths()`
//    (the V1.4 demo) and are a TEACHING SCHEMATIC, not the exact course of a real nerve.
// 2) orderTask(c, el, …): put steps in order, with the help ladder (clue → demo → retry alone).

export function signal(c) {
  const A = c.A, T = c.T, S = 'Left';
  const grp = new T.Group(), props = new T.Group(); A.scene.add(grp); A.scene.add(props);
  const dot = new T.Mesh(new T.SphereGeometry(.018, 16, 12), new T.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); dot.renderOrder = 50;
  let tick = null;
  const glow = ks => { for (const k of ['brain', 'spinal', 'nerves', 'eye']) { A.mats[k].emissive.setHex(ks.includes(k) ? 0x553300 : 0); A.mats[k].emissiveIntensity = 1; } };
  function clear() {
    if (tick) { const i = A.tickers.indexOf(tick); if (i >= 0) A.tickers.splice(i, 1); tick = null; }
    grp.clear(); props.clear(); glow([]); A.setElbow(S, A.elbows[S].restFlex);
  }
  function prop(type) {   // the stimulus of the book example, drawn as a simple schematic object
    props.clear();
    if (type === 'reflex') {
      const tip = A.boxOf(A.find(/^distal phalanx of left index finger$/, 'bone')).getCenter(new T.Vector3());
      const cup = new T.Mesh(new T.CylinderGeometry(.04, .034, .09, 28), new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff5a1f, emissiveIntensity: .35 }));
      cup.position.copy(tip).add(new T.Vector3(.045, -.02, .03)); props.add(cup);
      for (let i = 0; i < 3; i++) { const st = new T.Mesh(new T.TorusGeometry(.012, .002, 6, 20), new T.MeshBasicMaterial({ color: 0xffd0b0, transparent: true, opacity: .7 })); st.position.copy(cup.position).add(new T.Vector3(0, .06 + i * .02, 0)); st.rotation.x = Math.PI / 2; props.add(st); }
    } else {
      const pole = new T.Mesh(new T.BoxGeometry(.06, .13, .04), new T.MeshStandardMaterial({ color: 0x333a44 })); pole.position.set(0, 1.62, .6); props.add(pole);
      const g = new T.Mesh(new T.SphereGeometry(.02, 20, 14), new T.MeshBasicMaterial({ color: 0x33ff66 })); g.position.set(0, 1.59, .625); props.add(g);
    }
  }
  // play leg i of the textbook process (1-based steps match the book); resolves when the dot arrives
  function leg(type, i, { move = true } = {}) {
    const P = A.paths(S)[type][i]; if (!P) return Promise.resolve();
    if (tick) { const j = A.tickers.indexOf(tick); if (j >= 0) A.tickers.splice(j, 1); tick = null; }
    const pts = P.pts.length > 1 ? P.pts : [P.pts[0], P.pts[0].clone().add(new T.Vector3(0, .0001, 0))];
    const curve = new T.CatmullRomCurve3(pts, false, 'centripetal');
    const tube = new T.Mesh(new T.TubeGeometry(curve, Math.max(8, pts.length * 6), .0035, 6, false), new T.MeshBasicMaterial({ color: type === 'reflex' ? 0xffa040 : 0x4de2fa, transparent: true, opacity: .9, depthTest: false }));
    tube.renderOrder = 40; grp.add(tube); grp.add(dot);
    glow(P.hl); if (P.hl.includes('muscle')) A.setLayer('muscle', true);
    const dur = type === 'reflex' ? [900, 600, 1100][i] || 900 : [1600, 900, 2200][i] || 1500, rf = A.elbows[S].restFlex, t0 = performance.now();
    return new Promise(res => {
      tick = now => {
        const u = Math.min(1, Math.max(0, (now - t0) / dur)); dot.position.copy(curve.getPoint(u));
        if (move && type === 'reflex' && i === 2) A.setElbow(S, rf + (80 - rf) * Math.min(1, u * 2.2));
        if (move && type === 'voluntary' && i === 2 && u > .55) A.setElbow(S, rf + (90 - rf) * Math.min(1, (u - .55) / .45));
        if (u >= 1) { const j = A.tickers.indexOf(tick); if (j >= 0) A.tickers.splice(j, 1); tick = null; dot.removeFromParent(); res(); }
      };
      A.tickers.push(tick);
    });
  }
  // static tubes for the legs already explained (no dot, no movement)
  function upto(type, n) { for (let i = 0; i < n; i++) { const P = A.paths(S)[type][i]; const pts = P.pts.length > 1 ? P.pts : [P.pts[0], P.pts[0].clone().add(new T.Vector3(0, .0001, 0))];
    const tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, false, 'centripetal'), Math.max(8, pts.length * 6), .0035, 6, false), new T.MeshBasicMaterial({ color: type === 'reflex' ? 0xffa040 : 0x4de2fa, transparent: true, opacity: .45, depthTest: false }));
    tube.renderOrder = 39; grp.add(tube); } }
  function bend(deg = 85, ms = 900) { const rf = A.elbows[S].restFlex, t0 = performance.now(); return new Promise(res => { const f = now => { const u = Math.min(1, Math.max(0, (now - t0) / ms)); A.setElbow(S, rf + (deg - rf) * u); if (u >= 1) { A.tickers.splice(A.tickers.indexOf(f), 1); res(); } }; A.tickers.push(f); }); }
  async function all(type) { clear(); prop(type); for (let i = 0; i < 3; i++) { await leg(type, i); await c.wait(500); } }
  return { clear, prop, leg, all, upto, bend, glow };
}

// Order the steps. items = steps in the correct order (text). cues[i] = specific clue when step i is expected.
export function orderTask(c, el, { q, items, cues, demo, units = [], onResult }) {
  const $ = id => el.querySelector('#' + id);
  let wrongs = 0, k = 0;
  window.__curs && (window.__curs.order = items.slice());   // test hook only
  const draw = () => {
    k = 0;
    el.innerHTML = `<div class="q">${c.esc(q)}</div><ol class="ord" id="ord"></ol><div class="opts" id="pool"></div>`;
    for (const i of c.shuffle(items.map((_, i) => i))) {
      const b = document.createElement('button'); b.className = 'opt'; b.textContent = items[i]; b.dataset.i = i; b.onclick = () => pick(i, b); $('pool').appendChild(b);
    }
  };
  const pick = async (i, b) => {
    if (el.dataset.done) return;
    if (i === k) {
      b.remove(); const li = document.createElement('li'); li.textContent = items[i]; $('ord').appendChild(li); k++;
      const old = el.querySelector(':scope > .fb'); if (old) old.remove();
      if (k === items.length) { el.dataset.done = 1; const v = wrongs ? 'ajuda' : 'sol'; onResult ? onResult(v) : c.evid(units, v); c.feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐'); el.dispatchEvent(new Event('done')); }
      return;
    }
    wrongs++; b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 700);
    if (wrongs === 1) c.feedback(el, false, '💡 Pista: ' + cues[k]);
    else {
      c.feedback(el, false, '👀 Mira-ho una altra vegada…'); el.querySelectorAll('#pool button').forEach(x => x.disabled = true);
      await demo(); c.feedback(el, false, 'Ara torna-ho a provar tu sol/a, des del principi.'); const fb = el.querySelector(':scope > .fb'); draw(); if (fb) el.appendChild(fb);
    }
  };
  draw();
}
