// COS-HUMA · Medi U2 · sample lesson 1A: "Bíceps i tríceps" (textbook pp. 27–28).
// Flow: small question → one textbook sentence → synced 3D demo → child operates → recall with help hidden → practice.
// Must-learn units (from the knowledge base): K1 bending, K2 straightening, K3 elbow joint, K4 contracted muscle is
// thicker, K5 the two muscles work together; names bíceps, tríceps (locate + spell).
// Text in 📘 boxes is the textbook sentence as transcribed; "Curiositat" lines are extra and never scored.

const whenReady = new Promise(r => window.__app ? r() : addEventListener('app-ready', r, { once: true }));
await whenReady;
const A = window.__app, T = A.THREE, camera = A.camera, canvas = A.renderer.domElement;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const E = A.elbows.Left, REST = E.restFlex;

// ---------------------------------------------------------------- textbook sentences (p. 27–28)
const BOOK = {
  doblegar: { p: 27, tx: 'Quan dobleguem el braç, el tríceps es relaxa. El bíceps es contreu.' },
  estirar: { p: 27, tx: 'Quan estirem el braç, el tríceps es contreu. El bíceps es relaxa.' },
  colze: { p: 27, tx: 'L’articulació que es doblega és el colze.' },
  gruixut: { p: 27, tx: 'El múscul contret és més gruixut.' },
  parella: { p: 28, tx: 'Quan fem un moviment, uns músculs es contreuen mentre que uns altres es relaxen, i així mouen els ossos.' },
};

// ---------------------------------------------------------------- parts, camera, labels
const parts = { biceps: A.find(/left biceps brachii/, 'muscle'), triceps: A.find(/left triceps brachii/, 'muscle') };   // the arm that moves (left)
const elbowPoint = () => E.center.clone();
function fitDist(h, w = h * .55) {
  const v = camera.view && camera.view.enabled ? camera.view : null, tf = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
  const visH = v ? (v.fullHeight > v.height ? v.height - v.offsetY : v.height) : innerHeight, visW = v ? (v.fullWidth > v.width ? v.width - v.offsetX : v.width) : innerWidth, fullH = v ? v.fullHeight : innerHeight;
  const tv = tf * visH / fullH, th = tv * visW / visH; return Math.max(h / tv, w / th) * 1.1;
}
const ARM = () => { const sx = Math.sign(E.center.x) || 1; A.flyTo(E.center.clone().add(new T.Vector3(0, .08, .05)), new T.Vector3(sx, .1, .3).normalize().multiplyScalar(fitDist(.25, .25))); };
const L = $('L'), body = $('Lbody');
function viewOffset(on) {
  const W = innerWidth, H = innerHeight;
  if (!on) { camera.clearViewOffset(); camera.aspect = W / H; camera.updateProjectionMatrix(); return; }
  const r = L.getBoundingClientRect();
  if (W <= 760) { const h = Math.max(0, H - r.top); camera.aspect = W / (H + h); camera.setViewOffset(W, H + h, 0, h, W, H); }
  else { const w = W - r.left + 10; camera.aspect = (W + w) / H; camera.setViewOffset(W + w, H, w, 0, W, H); }
  camera.updateProjectionMatrix();
}
addEventListener('resize', () => setTimeout(() => viewOffset(L.style.display !== 'none'), 0));
new ResizeObserver(() => { if (L.style.display !== 'none') viewOffset(true); }).observe(L);

const labelBox = $('labels'), labelList = [];
function label(text, src) { const el = document.createElement('div'); el.className = 'lbl'; el.textContent = text; labelBox.appendChild(el); labelList.push({ el, src }); }
function clearLabels() { labelBox.innerHTML = ''; labelList.length = 0; }
// biceps label on the front face of the muscle, triceps on the back face, so they never sit on top of each other
const face = (ms, front) => { const b = A.boxOf(ms), c = b.getCenter(new T.Vector3()); c.z = front ? b.max.z : b.min.z; return c; };
function showLabels() { clearLabels(); label('bíceps', () => face(parts.biceps, true)); label('tríceps', () => face(parts.triceps, false)); label('colze', elbowPoint); }
A.tickers.push(() => {
  if (!labelList.length) return; const r = canvas.getBoundingClientRect();
  for (const Lb of labelList) {
    const v = Lb.src().project(camera), vis = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
    Lb.el.style.display = vis ? '' : 'none'; Lb.el.style.transform = `translate(${(v.x + 1) / 2 * r.width}px,${(1 - v.y) / 2 * r.height}px) translate(-50%,-50%)`;
  }
});

// ---------------------------------------------------------------- arm motion + muscle colours by DIRECTION
let anim = null;
function stopAnim() { if (anim) { const i = A.tickers.indexOf(anim); if (i >= 0) A.tickers.splice(i, 1); anim = null; } }
function animateTo(target, ms = 2400) {
  stopAnim(); const from = E.angle, t0 = performance.now();
  return new Promise(res => { anim = now => { const u = Math.min(1, (now - t0) / ms), k = u * u * (3 - 2 * u); A.setElbow('Left', from + (target - from) * k); if (u >= 1) { stopAnim(); res(); } }; A.tickers.push(anim); });
}
const neutral = () => A.setMuscleColors('neutral', 'neutral');
const bending = () => A.setMuscleColors('on', 'off');
const straightening = () => A.setMuscleColors('off', 'on');
const TXT = {
  bend: 'Ara el braç es doblega: el bíceps es contreu 💪 i el tríceps es relaxa.',
  str: 'Ara el braç s’estira: el tríceps es contreu 💪 i el bíceps es relaxa.',
  bentDone: 'Fa un moment has doblegat el braç: el bíceps s’ha contret i el tríceps s’ha relaxat.',
  strDone: 'Fa un moment has estirat el braç: el tríceps s’ha contret i el bíceps s’ha relaxat.',
  idle: 'Mou la barra per moure el braç.',
};
// demos used for teaching and as "watch again" help
async function demo(kind, withLabels = true) {
  if (withLabels) showLabels();
  if (kind === 'bend' || kind === 'colze' || kind === 'thick') { A.setElbow('Left', REST); neutral(); await wait(250); bending(); await animateTo(105, 2600); neutral(); }
  else if (kind === 'straighten') { A.setElbow('Left', 105); neutral(); await wait(250); straightening(); await animateTo(REST, 2600); neutral(); }
  else if (kind === 'biceps' || kind === 'triceps') { A.highlight(parts[kind], 0x2fd3ff); await wait(2200); A.clearHighlights(); }
}
const wait = ms => new Promise(r => setTimeout(r, ms));

// slider whose text and colours follow the direction of movement; after ~1 s still: past-tense text, neutral colour
function sliderUI(el, { start = REST, showState = true, onMove } = {}) {
  A.setElbow('Left', start); neutral();
  el.insertAdjacentHTML('beforeend', `<input type="range" class="arm" min="${REST}" max="130" value="${start}" step="1"><div class="live">${showState ? TXT.idle : 'Mou la barra.'}</div>`);
  const r = el.querySelector('input.arm'), live = el.querySelector('.live');
  let last = start, dir = 0, idleT = null;
  r.oninput = () => {
    const v = +r.value, d = v - last; A.setElbow('Left', v);
    if (Math.abs(d) >= 2) {
      dir = d > 0 ? 1 : -1; last = v;
      if (showState) { (dir > 0 ? bending : straightening)(); live.textContent = dir > 0 ? TXT.bend : TXT.str; live.className = 'live ' + (dir > 0 ? 'bend' : 'str'); }
      onMove && onMove(dir, v);
    }
    clearTimeout(idleT);
    idleT = setTimeout(() => { neutral(); if (showState && dir) { live.textContent = dir > 0 ? TXT.bentDone : TXT.strDone; live.className = 'live'; } }, 1000);
  };
  return r;
}

// ---------------------------------------------------------------- picking (tap a muscle)
const ray = new T.Raycaster(), ndc = new T.Vector2();
function hitAt(x, y, targets) {
  const r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(A.pickables.filter(o => o.visible), false); if (!hits.length) return { obj: null, ok: false };
  const first = hits[0], obj = A.resolveHit(first);
  for (const h of hits) { if (h.distance > first.distance + .02) break; if (targets.has(A.resolveHit(h))) return { obj: A.resolveHit(h), ok: true }; }
  return { obj, ok: false };
}
const nameOf = o => !o ? 'res' : o.userData.muscle === 'biceps' ? 'el bíceps' : o.userData.muscle === 'triceps' ? 'el tríceps' : o.userData.g === 'muscle' ? 'un altre múscul' : 'un os';

// ---------------------------------------------------------------- records (understanding / location / spelling)
const KEY = 'cosHumaSampleL10';
const loadRec = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
let rec = { v: 1, started: new Date().toISOString(), K: { K1: [], K2: [], K3: [], K4: [], K5: [] }, loc: { biceps: null, triceps: null }, spell: { biceps: null, triceps: null }, pred: {}, wrong: 0, stageTimes: {}, day2: {} };
const saveRec = () => { try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { /* storage blocked */ } };
const KNAME = { K1: 'Doblegar: bíceps es contreu, tríceps es relaxa', K2: 'Estirar: tríceps es contreu, bíceps es relaxa', K3: 'L’articulació que es doblega és el colze', K4: 'El múscul contret és més gruixut', K5: 'Els dos músculs treballen junts (un es contreu, l’altre es relaxa)' };
function evid(units, v) { for (const u of units) rec.K[u].push(v); saveRec(); }
function unitStatus(arr) { if (!arr.length) return ['vist', 'Vist (sense comprovar)', 'mid']; if (arr.includes('no')) return ['no', 'Cal repassar', 'bad']; if (arr.includes('ajuda')) return ['ajuda', 'Amb ajuda', 'mid']; return ['sol', 'Tot sol/a ✔', 'ok']; }

// ---------------------------------------------------------------- UI helpers
let showZh = false;
const book = keys => keys.map(k => `<div class="book"><span class="pg">📘 p. ${BOOK[k].p}</span>${esc(BOOK[k].tx)}</div>`).join('');
const ossi = t => `<div class="ossi"><span class="av">🦴</span><p>${esc(t)}</p></div>`;
const zh = t => `<div class="zh" style="display:${showZh ? '' : 'none'}">🇨🇳 ${esc(t)}</div>`;
let canNext = false;
function setNext(on, label) { canNext = on; $('Lnext').disabled = !on; $('Lnext').classList.toggle('ready', on); if (label) $('Lnext').textContent = label; }
function feedback(el, ok, msg) { const old = el.querySelector('.fb'); if (old) old.remove(); const f = document.createElement('div'); f.className = 'fb ' + (ok ? 'ok' : 'no'); f.textContent = msg; el.appendChild(f); f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function hidden() { clearLabels(); A.clearHighlights(); neutral(); }   // recall / practice: no labels, no colours, no book

// question with the help ladder: wrong 1 → specific cue; wrong 2 → watch the demo again; then help is hidden and the child retries alone
function ladderChoice(el, { q, opts, a, cue, demoKind, units }) {
  el.innerHTML = `<div class="q">${esc(q)}</div><div class="opts"></div>`;
  let wrongs = 0; const o = el.querySelector('.opts');
  const draw = () => { o.innerHTML = ''; for (const i of shuffle(opts.map((_, i) => i))) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = opts[i]; b.onclick = () => pick(i, b); o.appendChild(b); } };
  const pick = async (i, b) => {
    if (el.dataset.done) return;
    if (i === a) { b.classList.add('right'); el.dataset.done = 1; evid(units, wrongs ? 'ajuda' : 'sol'); feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐'); setNext(true); return; }
    wrongs++; rec.wrong++; b.classList.add('wrong'); b.disabled = true;
    if (wrongs === 1) feedback(el, false, '💡 Pista: ' + cue);
    else { feedback(el, false, '👀 Mira-ho una altra vegada…'); o.querySelectorAll('button').forEach(x => x.disabled = true); await demo(demoKind); hidden(); A.setElbow('Left', REST); feedback(el, false, 'Ara torna-ho a provar tu sol/a.'); draw(); }
  };
  draw();
}
function tapTask(el, { q, key, cue, onResult }) {
  el.innerHTML = `<div class="q">${esc(q)}</div><div class="cnt">Pots girar el model amb el dit.</div>`;
  const targets = new Set(parts[key]); let wrongs = 0, d = null;
  const down = e => { d = [e.clientX, e.clientY]; };
  const up = async e => {
    if (el.dataset.done || !d || Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 8) return;
    const h = hitAt(e.clientX, e.clientY, targets);
    if (h.ok) { el.dataset.done = 1; const v = wrongs ? 'ajuda' : 'sol'; if (onResult) onResult(v); else rec.loc[key] = v; saveRec(); A.highlight([...targets], 0x35c46a); feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐'); setTimeout(() => A.clearHighlights(), 900); cleanup(); setNext(true); return; }
    wrongs++; rec.wrong++;
    if (wrongs === 1) feedback(el, false, `Això és ${nameOf(h.obj)}. 💡 ${cue}`);
    else { feedback(el, false, '👀 Mira on és…'); await demo(key, false); feedback(el, false, 'Ara toca’l tu sol/a.'); }
  };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', up);
  const cleanup = () => { canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointerup', up); };
  return cleanup;
}

// ---------------------------------------------------------------- the lesson (stages)
// show: what the 3D shows; hide = recall/practice (no book, labels, state colours)
const S = [
  { id: 'intro', ph: 'Benvinguda', render(el) {
      ARM(); clearLabels();
      el.innerHTML = `<h2>Bíceps i tríceps 💪</h2>${ossi('Hola! Sóc l’Ossi. Avui descobrirem què passa dins del braç quan el dobleguem i quan l’estirem. Tu manes: passa a la pantalla següent quan estiguis a punt.')}
        ${zh('今天学：弯曲和伸直手臂时，手臂里的肌肉在做什么。孩子自己控制节奏。')}<div class="note">ℹ️ Els colors i el gruix dels músculs són un esquema per veure qui es contreu.</div>`;
      setNext(true);
    } },
  // ---- A: bending
  { id: 'A-pregunta', ph: '1 · Pregunta', render(el) {
      hidden(); A.setElbow('Left', REST);
      el.innerHTML = `<h2>Una pregunta abans de mirar</h2>${ossi('Posa la mà a la part de davant del teu braç i doblega’l a poc a poc. Després prova-ho amb la mà a la part de darrere.')}
        <div class="q">Quina part del braç es fa més dura i més gruixuda quan dobleguem el braç?</div><div class="opts" id="po"></div>${zh('先让孩子用自己的手臂摸一摸，再选。这一题是预测，不计分，也不显示对错。')}`;
      for (const [i, t] of ['La part de davant', 'La part de darrere', 'Cap de les dues'].entries()) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = t; b.onclick = () => { rec.pred.A = i; saveRec(); el.querySelectorAll('#po button').forEach(x => x.disabled = true); b.classList.add('hint'); feedback(el, true, 'D’acord! Ara ho comprovem 👀'); setNext(true); }; $('po').appendChild(b); }
      setNext(false);
    } },
  { id: 'A-llibre', ph: '2 · El llibre', render(el) {
      hidden(); A.setElbow('Left', REST); showLabels();
      el.innerHTML = `<h2>Què diu el llibre</h2>${book(['doblegar', 'colze'])}${ossi('Fixa’t en els noms del model: bíceps a davant, tríceps a darrere, i el colze al mig.')}${zh('读一遍课本原句，看模型上的名称。')}`;
      setNext(true);
    } },
  { id: 'A-demo', ph: '3 · Mira', render(el) {
      showLabels(); A.setElbow('Left', REST);
      el.innerHTML = `<h2>Mira què passa</h2><div class="live" id="lv">Toca «Mira» per veure-ho.</div><button class="opt go" id="pl">▶ Mira</button>${book(['gruixut'])}${zh('看演示：弯曲时二头肌（前面）变深红、变粗；三头肌（后面）放松。')}`;
      $('pl').onclick = async () => { $('pl').disabled = true; $('lv').textContent = TXT.bend; $('lv').className = 'live bend'; await demo('bend'); $('lv').textContent = 'El bíceps s’ha fet més gruixut: estava contret. Pots tornar-ho a mirar.'; $('lv').className = 'live'; $('pl').disabled = false; $('pl').textContent = '↻ Torna-ho a mirar'; setNext(true); };
      setNext(false);
    } },
  { id: 'A-fes', ph: '4 · Fes-ho tu', render(el) {
      showLabels();
      el.innerHTML = `<h2>Ara fes-ho tu</h2><div class="q">Doblega el braç fins a 90° amb la barra.</div>${zh('孩子拖动滑块把手臂弯到约 90°，文字和颜色会随动作方向变化。')}`;
      sliderUI(el, { onMove: (d, v) => { if (d > 0 && v >= REST + 72 && !el.dataset.done) { el.dataset.done = 1; feedback(el, true, 'Molt bé! Mentre doblegaves, el bíceps es contreia.'); setNext(true); } } });
      setNext(false);
    } },
  // ---- B: straightening
  { id: 'B-pregunta', ph: '1 · Pregunta', render(el) {
      hidden(); A.setElbow('Left', 105);
      el.innerHTML = `<h2>I quan estirem el braç?</h2>${ossi('Doblega el teu braç, posa la mà a la part de darrere i estira’l a poc a poc.')}<div class="q">Quin múscul es contreu quan estirem el braç?</div><div class="opts" id="po"></div>${zh('预测题，不计分。')}`;
      for (const [i, t] of ['El tríceps (a darrere)', 'El bíceps (a davant)', 'Cap dels dos'].entries()) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = t; b.onclick = () => { rec.pred.B = i; saveRec(); el.querySelectorAll('#po button').forEach(x => x.disabled = true); b.classList.add('hint'); feedback(el, true, 'D’acord! Ara ho comprovem 👀'); setNext(true); }; $('po').appendChild(b); }
      setNext(false);
    } },
  { id: 'B-llibre', ph: '2 · El llibre', render(el) {
      hidden(); A.setElbow('Left', 105); showLabels();
      el.innerHTML = `<h2>Què diu el llibre</h2>${book(['estirar', 'parella'])}${zh('读课本原句：伸直时三头肌收缩、二头肌放松；运动时一些肌肉收缩，另一些放松。')}`;
      setNext(true);
    } },
  { id: 'B-demo', ph: '3 · Mira', render(el) {
      showLabels(); A.setElbow('Left', 105);
      el.innerHTML = `<h2>Mira què passa</h2><div class="live" id="lv">Toca «Mira» per veure-ho.</div><button class="opt go" id="pl">▶ Mira</button>
        ${ossi('Treballen en parella: quan un es contreu, l’altre es relaxa. Com dos amics que estiren una corda per torns!')}
        <div class="fun">💡 <b>Curiositat</b> <span class="nb">no surt al llibre</span><br>Un múscul només fa força quan es contreu: pot estirar l’os, però no el pot empènyer. Per això en calen dos.</div>${zh('看演示：伸直时三头肌收缩。趣味补充不计分。')}`;
      $('pl').onclick = async () => { $('pl').disabled = true; $('lv').textContent = TXT.str; $('lv').className = 'live str'; await demo('straighten'); $('lv').textContent = 'El tríceps s’ha contret i el bíceps s’ha relaxat. Pots tornar-ho a mirar.'; $('lv').className = 'live'; $('pl').disabled = false; $('pl').textContent = '↻ Torna-ho a mirar'; setNext(true); };
      setNext(false);
    } },
  { id: 'B-fes', ph: '4 · Fes-ho tu', render(el) {
      showLabels();
      el.innerHTML = `<h2>Ara fes-ho tu</h2><div class="q">Estira el braç del tot. Després pots doblegar-lo i estirar-lo tantes vegades com vulguis.</div>${zh('孩子把手臂完全伸直；之后可以自由来回操作。')}`;
      sliderUI(el, { start: 105, onMove: (d, v) => { if (d < 0 && v <= REST + 4 && !el.dataset.done) { el.dataset.done = 1; feedback(el, true, 'Molt bé! Mentre estiraves, el tríceps es contreia.'); setNext(true); } } });
      setNext(false);
    } },
  // ---- 5: recall with help hidden (parent checks)
  { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { recallStage(el, 'Explica-ho en veu alta: quan dobleguem el braç, què fa el bíceps i què fa el tríceps? Com es veu el múscul que es contreu?', ['doblegar', 'gruixut'], ['K1', 'K4'], '孩子不看任何提示口头解释：弯曲时二头肌收缩、三头肌放松；收缩的肌肉更粗。说完后孩子点「Ja ho he dit」，家长对照答案判断。'); } },
  { id: 'R2', ph: '5 · Explica-ho tu', recall: true, render(el) { A.setElbow('Left', 105); recallStage(el, 'I quan estirem el braç? Per què calen dos músculs?', ['estirar', 'parella'], ['K2', 'K5'], '口头解释伸直时三头肌收缩、二头肌放松，以及两块肌肉一收一放配合。'); } },
  // ---- 6: practice (independent; help ladder)
  { id: 'P1', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); ladderChoice(el, { q: 'El tríceps es contreu. Què fa el braç?', opts: ['S’estira', 'Es doblega', 'No es mou'], a: 0, cue: 'el tríceps és a la part de darrere del braç. Estira el teu braç: quina part notes dura?', demoKind: 'straighten', units: ['K2', 'K5'] }); setNext(false); } },
  { id: 'P2', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); ladderChoice(el, { q: 'Quina articulació es doblega quan dobleguem el braç?', opts: ['El colze', 'El genoll', 'L’espatlla'], a: 0, cue: 'és al mig del braç, entre el braç i l’avantbraç.', demoKind: 'colze', units: ['K3'] }); setNext(false); } },
  { id: 'P3', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); ladderChoice(el, { q: 'Dobleguem el braç. Com és ara el bíceps?', opts: ['Més gruixut', 'Més prim', 'Igual'], a: 0, cue: 'toca’t el bíceps mentre dobleges el braç: es fa més petit o més gros?', demoKind: 'thick', units: ['K4'] }); setNext(false); } },
  { id: 'P4', ph: '6 · Practica', recall: true, render(el) {
      hidden();
      el.innerHTML = `<div class="q">Mou el braç perquè es contregui el <b>tríceps</b>.</div>${zh('滑块不显示状态文字和颜色，孩子要自己判断：三头肌收缩 = 伸直手臂。')}`;
      let wrongs = 0, maxV = 105, minV = 105;
      sliderUI(el, { start: 105, showState: false, onMove: async (d, v) => {
        if (el.dataset.done) return; maxV = Math.max(maxV, v); minV = Math.min(minV, v);
        if (minV <= 105 - 30) { el.dataset.done = 1; evid(['K2'], wrongs ? 'ajuda' : 'sol'); feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐ Estirar el braç = el tríceps es contreu.'); setNext(true); }
        else if (maxV >= 105 + 15 && !el.dataset.warned) {
          el.dataset.warned = 1; wrongs++; rec.wrong++;
          feedback(el, false, '💡 Pista: si dobleguem el braç es contreu el bíceps. El tríceps és a darrere… què ha de fer el braç?');
          if (wrongs >= 2) { await demo('straighten'); hidden(); }
          setTimeout(() => { maxV = v; delete el.dataset.warned; }, 400);
        }
      } });
      setNext(false);
    } },
  { id: 'P5', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); ARM(); cleanupTap = tapTask(el, { q: '👆 Toca el bíceps (sense noms).', key: 'biceps', cue: 'És a la part de davant del braç.' }); setNext(false); } },
  { id: 'P6', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); cleanupTap = tapTask(el, { q: '👆 Ara toca el tríceps.', key: 'triceps', cue: 'És a la part de darrere del braç.' }); setNext(false); } },
  { id: 'W1', ph: '6 · Escriu', recall: true, render(el) { spellStage(el, 'biceps', 'b<b>í</b>ceps'); } },
  { id: 'W2', ph: '6 · Escriu', recall: true, render(el) { spellStage(el, 'triceps', 'tr<b>í</b>ceps'); } },
  { id: 'fi', ph: 'Resultat', recall: true, render(el) { resultsStage(el); } },
];
let cleanupTap = null;

function recallStage(el, q, bookKeys, units, zhTxt) {
  hidden();
  el.innerHTML = `<h2>Explica-ho tu</h2><div class="q">${esc(q)}</div><div class="cnt">Pensa tot el temps que vulguis. Sense mirar cap pista!</div>
    <button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>${zh(zhTxt)}`;
  $('said').onclick = () => {
    $('said').remove();
    $('chk').innerHTML = `<div class="ans"><b>Resposta del llibre:</b>${book(bookKeys)}</div>
      <div class="parent"><div class="who">👨‍👩‍👧 Per a la família / 家长判断：</div><div class="row">
      <button class="opt right" id="pY">Ho ha dit bé ✓ 说对了</button><button class="opt" id="pH">Amb una mica d’ajuda 有提示才说对</button><button class="opt" id="pN">Encara no ✗ 还不会</button></div></div>`;
    const done = v => { evid(units, v); el.querySelectorAll('.parent button').forEach(b => b.disabled = true); feedback(el, true, v === 'sol' ? 'Fantàstic! ⭐' : v === 'ajuda' ? 'Molt bé, ho repassarem demà.' : 'Cap problema: ho tornarem a mirar demà.'); setNext(true); };
    $('pY').onclick = () => done('sol'); $('pH').onclick = () => done('ajuda'); $('pN').onclick = () => done('no');
  };
  setNext(false);
}
function spellStage(el, key, html) {
  hidden(); A.setElbow('Left', REST); A.highlight(parts[key], 0x2fd3ff);
  el.innerHTML = `<h2>Escriu el nom</h2><div class="q">Escriu en un paper el nom d’aquest múscul (el blau). Quan acabis, toca «Comprova».</div>
    <button class="opt go" id="cmp">✏️ Comprova</button><div id="sp"></div>${zh('孩子在纸上写高亮肌肉的名称，写完再点「Comprova」对照。只错重音记为「拼写需练」，不影响理解。')}`;
  $('cmp').onclick = () => {
    $('cmp').remove();
    $('sp').innerHTML = `<div class="spell">${html}</div><div class="cnt">Fixa’t en l’accent: í</div>
      <div class="parent"><div class="who">👨‍👩‍👧 Compara amb el paper / 对照纸上：</div><div class="row">
      <button class="opt right" id="sY">Escrit bé ✓ 全对</button><button class="opt" id="sA">Només l’accent 只错重音</button><button class="opt" id="sN">Cal practicar ✗ 需要练</button></div></div>`;
    const done = v => { rec.spell[key] = v; saveRec(); el.querySelectorAll('.parent button').forEach(b => b.disabled = true); feedback(el, true, v === 'ok' ? 'Perfecte! ⭐' : 'D’acord, el practicarem. La comprensió no canvia.'); setNext(true); };
    $('sY').onclick = () => done('ok'); $('sA').onclick = () => done('accent'); $('sN').onclick = () => done('no');
  };
  setNext(false);
}
function summaryRows() {
  const rows = Object.keys(KNAME).map(k => { const [, txt, c] = unitStatus(rec.K[k]); return `<tr><td>${esc(KNAME[k])}</td><td class="${c}">${txt}</td></tr>`; }).join('');
  const L1 = v => v === 'sol' ? ['Tot sol/a ✔', 'ok'] : v === 'ajuda' ? ['Amb ajuda', 'mid'] : ['Pendent', 'bad'];
  const S1 = v => v === 'ok' ? ['Bé ✔', 'ok'] : v === 'accent' ? ['Cal practicar l’accent', 'mid'] : v === 'no' ? ['Cal practicar', 'bad'] : ['Pendent', 'bad'];
  return `<div class="q">Comprensió</div><table class="res">${rows}</table>
    <div class="q">Localització</div><table class="res">${['biceps', 'triceps'].map(k => { const [t, c] = L1(rec.loc[k]); return `<tr><td>${k === 'biceps' ? 'bíceps' : 'tríceps'}</td><td class="${c}">${t}</td></tr>`; }).join('')}</table>
    <div class="q">Ortografia</div><table class="res">${['biceps', 'triceps'].map(k => { const [t, c] = S1(rec.spell[k]); return `<tr><td>${k === 'biceps' ? 'bíceps' : 'tríceps'}</td><td class="${c}">${t}</td></tr>`; }).join('')}</table>`;
}
function resultsStage(el) {
  rec.finished = new Date().toISOString(); saveRec();
  hidden(); A.setElbow('Left', REST); A.controls.autoRotate = false;
  const mins = Math.round((new Date(rec.finished) - new Date(rec.started)) / 60000);
  el.innerHTML = `<h2>Molt bé! 🎉</h2>${ossi('Demà farem una revisió curta per veure si ho recordes.')}${summaryRows()}
    <div class="cnt">Temps: ${mins} min · respostes equivocades: ${rec.wrong}</div>
    <div class="row"><button class="opt" id="cp">📋 Copia el resultat</button><button class="opt go" id="d2">📋 Revisió de demà</button></div>${zh('三条线分别记录：理解、定位、拼写。点「Copia el resultat」复制结果发给我。')}`;
  $('cp').onclick = () => copyResult($('cp'));
  $('d2').onclick = () => day2();
  setNext(false, 'Final ✔');
}
function copyResult(btn) {
  const t = JSON.stringify({ lesson: 'L10 bíceps i tríceps (1A)', version: A.VERSION, ...rec }, null, 1);
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { btn.textContent = 'Copiat ✔'; }).catch(() => { const ta = document.createElement('textarea'); ta.value = t; ta.style.width = '100%'; ta.rows = 8; btn.after(ta); ta.select(); });
}

// ---------------------------------------------------------------- day-2 review (family checklist + one in-app locate check)
const D2 = [
  ['oral1', 'Sense mirar el model: explica què passa quan dobleguem el braç i fes-ho amb el teu braç.', '不看模型：口头解释弯曲手臂时发生什么，并用自己的手臂演示（bíceps es contreu, tríceps es relaxa）。'],
  ['oral2', 'Explica què passa quan estirem el braç i per què calen dos músculs.', '口头解释伸直时三头肌收缩、二头肌放松，以及两块肌肉一收一放配合。'],
  ['oral3', 'Digues quina articulació es doblega i com és el múscul contret.', '说出弯曲的关节是 colze，收缩的肌肉更粗。'],
  ['loc', 'Al model sense noms: toca el bíceps i el tríceps (botó de sota).', '在无标签模型上点出 bíceps 和 tríceps（用下面的按钮）。'],
  ['book', 'Llibre p. 27: tapa el text i digues en cada dibuix quin múscul es contreu.', '课本 P27：盖住文字，说出每张图里哪块肌肉在收缩。'],
  ['spell', 'Escriu en un paper: bíceps, tríceps (amb accent).', '在纸上写 bíceps、tríceps（注意重音）。'],
];
function day2() {
  showApp(); $('Lstart').style.display = 'none'; hidden(); A.setElbow('Left', REST); ARM();
  const r = loadRec(); if (r) rec = r;
  body.innerHTML = `<h2>Revisió de l’endemà 📋</h2><div class="cnt">Per fer amb la família, en aquest ordre / 按顺序和家长一起做：</div>
    <div class="check">${D2.map(([k, ca, z]) => `<label><input type="checkbox" data-k="${k}" ${rec.day2[k] ? 'checked' : ''}><span>${esc(ca)}<br><small>${esc(z)}</small></span></label>`).join('')}</div>
    <button class="opt go" id="dl">👆 Comprova al model (sense noms)</button><div id="dlt"></div>
    <div class="row"><button class="opt" id="cp">📋 Copia el resultat</button></div>`;
  body.querySelectorAll('.check input').forEach(cb => cb.onchange = () => { rec.day2[cb.dataset.k] = cb.checked; rec.day2.when = new Date().toISOString(); saveRec(); });
  let n = 0;
  $('dl').onclick = () => { $('dl').disabled = true; const run = key => { cleanupTap && cleanupTap(); const box = document.createElement('div'); $('dlt').innerHTML = ''; $('dlt').appendChild(box);
      cleanupTap = tapTask(box, { q: key === 'biceps' ? '👆 Toca el bíceps.' : '👆 Toca el tríceps.', key, cue: key === 'biceps' ? 'És a la part de davant del braç.' : 'És a la part de darrere del braç.', onResult: v => { rec.day2['loc_' + key] = v; } });
      const obs = setInterval(() => { if (box.dataset.done) { clearInterval(obs); rec.day2.when = new Date().toISOString(); saveRec(); if (++n < 2) setTimeout(() => run('triceps'), 900); else feedback($('dlt'), true, 'Fet! Marca la casella si ho ha fet sol/a.'); } }, 200); };
    run('biceps'); };
  $('cp').onclick = () => copyResult($('cp'));
  $('Lnext').style.display = 'none'; $('Lback').style.display = 'none';
}

// ---------------------------------------------------------------- navigation
let idx = 0;
function render() {
  stopAnim(); A.clearHighlights(); if (cleanupTap) { cleanupTap(); cleanupTap = null; }
  const s = S[idx]; rec.stageTimes[s.id] = rec.stageTimes[s.id] || new Date().toISOString(); saveRec();
  $('Lbar').style.width = `${(idx + 1) / S.length * 100}%`;
  $('Lch').textContent = s.ph; $('Ldots').innerHTML = '';
  $('Lstars').textContent = '';
  body.innerHTML = '<div id="st"></div>'; const el = $('st'); el.className = 'stagebox';
  s.render(el);
  $('Lback').disabled = idx === 0 || !!s.recall;     // no going back to the answers once recall starts
  body.scrollTop = 0;
}
$('Lnext').onclick = () => { if (!canNext) return; if (idx < S.length - 1) { idx++; setNext(false, 'Continua ▶'); render(); } };
$('Lback').onclick = () => { if (idx > 0 && !S[idx].recall) { idx--; render(); } };
$('Lzh').onclick = () => { showZh = !showZh; $('Lzh').classList.toggle('on', showZh); body.querySelectorAll('.zh').forEach(z => z.style.display = showZh ? '' : 'none'); };
$('Lexit').onclick = () => { if (confirmExit()) location.href = './index.html'; };
const confirmExit = () => true;
$('Lspeak').style.display = 'none';

function showApp() {
  document.body.classList.add('lessonMode'); L.style.display = ''; viewOffset(true);
  for (const k of ['allMuscle', 'brain', 'spinal', 'nerves', 'eye']) A.setLayer(k, false);
  A.setLayer('bone', true); A.setLayer('muscle', true); A.setBoneOpacity(100); A.controls.autoRotate = false; neutral();
}
$('Lbegin').onclick = () => { $('Lstart').style.display = 'none'; showApp(); rec = { ...rec, started: new Date().toISOString() }; idx = 0; setNext(false, 'Continua ▶'); render(); ARM(); };
$('Lday2').onclick = () => day2();

// start screen
document.body.classList.add('lessonMode'); $('Lstart').style.display = '';
for (const k of ['allMuscle', 'brain', 'spinal', 'nerves', 'eye']) A.setLayer(k, false);
A.setLayer('muscle', true); neutral(); ARM();

// test hook
window.__sample = { S, get idx() { return idx; }, get rec() { return rec; }, get canNext() { return canNext; }, next() { $('Lnext').click(); }, parts, hitAt, E, REST };
