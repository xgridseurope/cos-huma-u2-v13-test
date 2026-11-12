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
// src: 'lit' = word for word (checked against the page photo); 'act' = answer to a book activity, deduced from its drawing
const BOOK = {
  doblegar: { p: 27, src: 'lit', where: 'text del dibuix', tx: 'Quan dobleguem el braç, el tríceps es relaxa. El bíceps es contreu.' },
  estirar: { p: 27, src: 'lit', where: 'text del dibuix', tx: 'Quan estirem el braç, el tríceps es contreu. El bíceps es relaxa.' },
  colze: { p: 27, src: 'act', where: 'activitat 4', q: 'Com es diu l’articulació que s’està doblegant?', tx: 'El colze.' },
  gruixut: { p: 27, src: 'act', where: 'activitat 4', q: 'Quan és més gruixut el bíceps, quan el braç està doblegat o quan està estès? I el tríceps?', tx: 'Mirant el dibuix: el bíceps és més gruixut amb el braç doblegat, i el tríceps, amb el braç estès. El múscul que es contreu es fa més gruixut.' },
  parella: { p: 28, src: 'lit', where: 'text', tx: 'Quan fem un moviment, uns músculs es contreuen mentre que uns altres es relaxen, i així mouen els ossos.' },
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
const book = keys => keys.map(k => { const b = BOOK[k];
  return b.src === 'lit' ? `<div class="book"><span class="pg">📘 p. ${b.p} · ${b.where}</span>${esc(b.tx)}</div>`
    : `<div class="book r"><span class="pg">📘 p. ${b.p} · ${b.where} · resposta (no és text literal)</span><i>${esc(b.q)}</i><br>${esc(b.tx)}</div>`; }).join('');
const ossi = t => `<div class="ossi"><span class="av">🦴</span><p>${esc(t)}</p></div>`;
const zh = t => `<div class="zh" style="display:${showZh ? '' : 'none'}">🇨🇳 ${esc(t)}</div>`;
let canNext = false;
function setNext(on, label) { canNext = on; $('Lnext').disabled = !on; $('Lnext').classList.toggle('ready', on); if (label) $('Lnext').textContent = label; }
function feedback(el, ok, msg) { const old = el.querySelector('.fb'); if (old) old.remove(); const f = document.createElement('div'); f.className = 'fb ' + (ok ? 'ok' : 'no'); f.textContent = msg; el.appendChild(f); f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function hidden() { clearLabels(); A.clearHighlights(); neutral(); }   // recall / practice: no labels, no colours, no book

// question with the help ladder: wrong 1 → specific cue; wrong 2 → watch the demo again; then help is hidden and the child retries alone
function ladderChoice(el, { q, opts, a, cue, demoKind, helpText, units }) {
  el.innerHTML = `<div class="q">${esc(q)}</div><div class="opts"></div>`;
  let wrongs = 0; const o = el.querySelector('.opts');
  const draw = () => { o.innerHTML = ''; for (const i of shuffle(opts.map((_, i) => i))) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = opts[i]; b.onclick = () => pick(i, b); o.appendChild(b); } };
  const pick = async (i, b) => {
    if (el.dataset.done) return;
    if (i === a) { b.classList.add('right'); el.dataset.done = 1; evid(units, wrongs ? 'ajuda' : 'sol'); feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐'); setNext(true); return; }
    wrongs++; rec.wrong++; b.classList.add('wrong'); b.disabled = true;
    if (wrongs === 1) feedback(el, false, '💡 Pista: ' + cue);
    else if (helpText) { feedback(el, false, '👀 ' + helpText + ' Després torna-ho a provar.'); o.querySelectorAll('button').forEach(x => x.disabled = true); await wait(2500); draw(); }
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
        ${zh('今天学：弯曲和伸直手臂时，手臂里的肌肉在做什么。孩子自己控制节奏。')}<div class="note">ℹ️ Els colors del model són un esquema per veure qui es contreu. El gruix dels músculs l’observaràs al teu braç i al dibuix de la p. 27.</div>`;
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
      el.innerHTML = `<h2>Mira què passa</h2><div class="live" id="lv">Toca «Mira» per veure-ho.</div><button class="opt go" id="pl">▶ Mira</button>${ossi('Ara posa la mà sobre el teu bíceps i doblega el braç. Què notes? Després mira el dibuix de la p. 27.')}${book(['gruixut'])}${zh('看演示：弯曲时二头肌颜色变深（收缩）。肌肉变粗请在自己的手臂和课本 P27 图上观察。')}`;
      $('pl').onclick = async () => { $('pl').disabled = true; $('lv').textContent = TXT.bend; $('lv').className = 'live bend'; await demo('bend'); $('lv').textContent = 'Mentre el braç es doblegava, el bíceps es contreia. Pots tornar-ho a mirar.'; $('lv').className = 'live'; $('pl').disabled = false; $('pl').textContent = '↻ Torna-ho a mirar'; setNext(true); };
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
      el.innerHTML = `<h2>I quan estirem el braç?</h2>${ossi('Doblega el teu braç. Estira’l a poc a poc amb una mà a davant del braç, i després amb la mà a darrere.')}<div class="q">Quin múscul es contreu quan estirem el braç?</div><div class="opts" id="po"></div>${zh('预测题，不计分。')}`;
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
  { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { recallStage(el, 'Explica-ho en veu alta: quan dobleguem el braç, què fa el bíceps i què fa el tríceps? Com es veu el múscul que es contreu?', ['doblegar', 'gruixut'], ['K1', 'K4'], '题目：弯曲手臂时，二头肌和三头肌各在做什么？收缩的肌肉看起来怎样？', '评分要点：二头肌收缩、三头肌放松；收缩的肌肉更粗。两点都说对 = 说对了。'); } },
  { id: 'R2', ph: '5 · Explica-ho tu', recall: true, render(el) { A.setElbow('Left', 105); recallStage(el, 'I quan estirem el braç? Per què calen dos músculs?', ['estirar', 'parella'], ['K2', 'K5'], '题目：伸直手臂时呢？为什么需要两块肌肉？', '评分要点：三头肌收缩、二头肌放松；两块肌肉一块收缩时另一块放松，配合起来移动骨头。'); } },
  // ---- 6: practice (independent; help ladder)
  { id: 'P1', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); ladderChoice(el, { q: 'El tríceps es contreu. Què fa el braç?', opts: ['S’estira', 'Es doblega', 'No es mou'], a: 0, cue: 'el tríceps és a la part de darrere del braç. Estira el teu braç: quina part notes dura?', demoKind: 'straighten', units: ['K2', 'K5'] }); setNext(false); } },
  { id: 'P2', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); ladderChoice(el, { q: 'Quina articulació es doblega quan dobleguem el braç?', opts: ['El colze', 'El genoll', 'L’espatlla'], a: 0, cue: 'és al mig del braç, entre el braç i l’avantbraç.', demoKind: 'colze', units: ['K3'] }); setNext(false); } },
  { id: 'P3', ph: '6 · Practica', recall: true, render(el) { hidden(); A.setElbow('Left', REST); ladderChoice(el, { q: 'Dobleguem el braç. Com és ara el bíceps?', opts: ['Més gruixut', 'Més prim', 'Igual'], a: 0, cue: 'toca’t el bíceps mentre dobleges el braç: es fa més petit o més gros?', helpText: 'Mira el dibuix de la p. 27 del llibre: compara el bíceps del braç doblegat i del braç estès.', units: ['K4'] }); setNext(false); } },
  { id: 'P4', ph: '6 · Practica', recall: true, render(el) {
      hidden();
      el.innerHTML = `<div class="q">Mou el braç perquè es contregui el <b>tríceps</b>.</div>${zh('题目：移动手臂，让三头肌收缩。这一题不显示状态文字和颜色。')}`;
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

function recallStage(el, q, bookKeys, units, zhQ, zhKey) {
  hidden();
  el.innerHTML = `<h2>Explica-ho tu</h2><div class="q">${esc(q)}</div><div class="cnt">Pensa tot el temps que vulguis. Sense mirar cap pista!</div>
    <button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>${zh(zhQ + '（孩子说完后才显示家长核对内容）')}`;
  $('said').onclick = () => {
    $('said').remove();
    $('chk').innerHTML = `<div class="ans"><b>Resposta del llibre:</b>${book(bookKeys)}</div>
      <div class="parent"><div class="who">👨‍👩‍👧 Per a la família / 家长判断：</div>${zh(zhKey)}<div class="row">
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

// ---------------------------------------------------------------- day-2 review: one item at a time, answers only after the child has answered
const D2 = [
  { id: 'oral1', kind: 'oral', ca: 'Sense mirar el model: explica què passa quan dobleguem el braç, i fes-ho amb el teu braç.', zq: '不看模型：说说弯曲手臂时发生什么，并用自己的手臂做一遍。',
    key: 'El bíceps es contreu i el tríceps es relaxa.', zkey: '评分要点：二头肌收缩、三头肌放松，并能用手臂演示。' },
  { id: 'oral2', kind: 'oral', ca: 'Explica què passa quan estirem el braç. Per què calen dos músculs?', zq: '说说伸直手臂时发生什么；为什么需要两块肌肉？',
    key: 'El tríceps es contreu i el bíceps es relaxa. Quan un es contreu, l’altre es relaxa, i així mouen els ossos.', zkey: '评分要点：三头肌收缩、二头肌放松；一块收缩时另一块放松。' },
  { id: 'oral3', kind: 'oral', ca: 'Quina articulació es doblega? Com és el múscul quan es contreu?', zq: '哪个关节在弯？肌肉收缩时是什么样子？',
    key: 'El colze. El múscul contret és més gruixut.', zkey: '评分要点：肘关节（colze）；收缩的肌肉更粗。' },
  { id: 'loc_biceps', kind: 'loc', key: 'biceps' },
  { id: 'loc_triceps', kind: 'loc', key: 'triceps' },
  { id: 'book', kind: 'oral', ca: 'Obre el llibre a la pàgina 27. Tapa el text i digues, a cada dibuix del braç, quin múscul es contreu.', zq: '打开课本第 27 页，盖住文字，说出每张手臂图里哪块肌肉在收缩。',
    key: 'Braç doblegat: es contreu el bíceps. Braç estirat: es contreu el tríceps.', zkey: '评分要点：弯曲图 = 二头肌收缩；伸直图 = 三头肌收缩。' },
  { id: 'spell_biceps', kind: 'spell', key: 'biceps', html: 'b<b>í</b>ceps' },
  { id: 'spell_triceps', kind: 'spell', key: 'triceps', html: 'tr<b>í</b>ceps' },
];
function day2() {
  showApp(); $('Lstart').style.display = 'none'; hidden(); A.setElbow('Left', REST); ARM();
  const r = loadRec(); if (r) rec = r; rec.day2 = rec.day2 || {}; rec.day2.started = new Date().toISOString(); saveRec();
  $('Lnext').style.display = 'none'; $('Lback').style.display = 'none';
  let k = 0;
  const go = () => {
    if (cleanupTap) { cleanupTap(); cleanupTap = null; } A.clearHighlights(); clearLabels();
    $('Lbar').style.width = `${k / D2.length * 100}%`; $('Lch').textContent = `Revisió de l’endemà · ${Math.min(k + 1, D2.length)}/${D2.length}`;
    if (k >= D2.length) { document.body.classList.remove('nomodel'); return finish(); }
    const it = D2[k], next = () => { k++; saveRec(); go(); };
    const rate = (box, labels, cb) => { box.insertAdjacentHTML('beforeend', `<div class="row" id="rt">${labels.map(([v, t], i) => `<button class="opt ${i ? '' : 'right'}" data-v="${v}">${t}</button>`).join('')}</div>`);
      box.querySelectorAll('#rt button').forEach(b => b.onclick = () => { cb(b.dataset.v); box.querySelectorAll('#rt button').forEach(x => x.disabled = true); body.insertAdjacentHTML('beforeend', '<button class="opt go" id="nx">Continua ▶</button>'); $('nx').onclick = next; }); };
    if (it.kind === 'oral') {
      document.body.classList.add('nomodel');      // the model stays hidden during the spoken part
      body.innerHTML = `<h2>${k < 3 ? 'Explica-ho' : 'El llibre'}</h2><div class="q">${esc(it.ca)}</div>${zh('题目：' + it.zq)}<button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>`;
      $('said').onclick = () => { $('said').remove(); const c = $('chk');
        c.innerHTML = `<div class="parent"><div class="who">👨‍👩‍👧 Resposta per a la família / 家长答案：</div><div class="ans">${esc(it.key)}</div>${zh(it.zkey)}</div>`;
        rate(c.querySelector('.parent'), [['sol', 'Ho ha dit bé ✓ 说对了'], ['ajuda', 'Amb ajuda 有提示才说对'], ['no', 'Encara no ✗ 还不会']], v => { rec.day2[it.id] = v; }); };
    } else if (it.kind === 'loc') {
      document.body.classList.remove('nomodel'); A.setElbow('Left', REST); ARM();
      body.innerHTML = '<h2>Al model</h2><div id="tb"></div>';
      cleanupTap = tapTask($('tb'), { q: it.key === 'biceps' ? '👆 Toca el bíceps (sense noms).' : '👆 Toca el tríceps (sense noms).', key: it.key, cue: it.key === 'biceps' ? 'És a la part de davant del braç.' : 'És a la part de darrere del braç.', onResult: v => { rec.day2[it.id] = v; } });
      const obs = setInterval(() => { if ($('tb') && $('tb').dataset.done) { clearInterval(obs); body.insertAdjacentHTML('beforeend', '<button class="opt go" id="nx">Continua ▶</button>'); $('nx').onclick = next; } }, 200);
    } else {
      document.body.classList.remove('nomodel'); A.setElbow('Left', REST); A.highlight(parts[it.key], 0x2fd3ff);
      body.innerHTML = `<h2>Escriu el nom</h2><div class="q">Escriu en un paper el nom del múscul blau.</div>${zh('题目：在纸上写出蓝色肌肉的名称（写完再核对）。')}<button class="opt go" id="cmp">✏️ Comprova</button><div id="sp"></div>`;
      $('cmp').onclick = () => { $('cmp').remove(); const c = $('sp'); c.innerHTML = `<div class="spell">${it.html}</div><div class="parent"><div class="who">👨‍👩‍👧 Compara amb el paper / 对照纸上：</div></div>`;
        rate(c.querySelector('.parent'), [['ok', 'Escrit bé ✓ 全对'], ['accent', 'Només l’accent 只错重音'], ['no', 'Cal practicar ✗ 需要练']], v => { rec.day2[it.id] = v; }); };
    }
  };
  const finish = () => {
    rec.day2.finished = new Date().toISOString(); saveRec();
    const T2 = { sol: ['Tot sol/a ✔', 'ok'], ajuda: ['Amb ajuda', 'mid'], no: ['Encara no', 'bad'], ok: ['Bé ✔', 'ok'], accent: ['Cal practicar l’accent', 'mid'] };
    const lbl = { oral1: 'Doblegar (explicat i fet amb el braç)', oral2: 'Estirar i els dos músculs', oral3: 'El colze i el múscul contret', loc_biceps: 'Localitza el bíceps', loc_triceps: 'Localitza el tríceps', book: 'Dibuix de la p. 27', spell_biceps: 'Escriu «bíceps»', spell_triceps: 'Escriu «tríceps»' };
    body.innerHTML = `<h2>Revisió acabada 🎉</h2><table class="res">${D2.map(it => { const [t, c] = T2[rec.day2[it.id]] || ['—', 'mid']; return `<tr><td>${lbl[it.id]}</td><td class="${c}">${t}</td></tr>`; }).join('')}</table>
      <div class="row"><button class="opt" id="cp">📋 Copia el resultat</button></div>`;
    $('cp').onclick = () => copyResult($('cp'));
  };
  go();
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
  A.setBulge(0);   // no schematic thickening here: the model shows movement + colour; thickness is observed on the own arm and on p. 27
  document.body.classList.add('lessonMode'); L.style.display = ''; viewOffset(true);
  for (const k of ['allMuscle', 'brain', 'spinal', 'nerves', 'eye']) A.setLayer(k, false);
  A.setLayer('bone', true); A.setLayer('muscle', true); A.setBoneOpacity(100); A.controls.autoRotate = false; neutral();
}
$('Lbegin').onclick = () => { $('Lstart').style.display = 'none'; showApp(); rec = { ...rec, started: new Date().toISOString() }; idx = 0; setNext(false, 'Continua ▶'); render(); ARM(); };
$('Lday2').onclick = () => day2();

// start screen
document.body.classList.add('lessonMode'); $('Lstart').style.display = '';
for (const k of ['allMuscle', 'brain', 'spinal', 'nerves', 'eye']) A.setLayer(k, false);
A.setBulge(0); A.setLayer('muscle', true); neutral(); ARM();

// test hook
window.__sample = { S, get idx() { return idx; }, get rec() { return rec; }, get canNext() { return canNext; }, next() { $('Lnext').click(); }, parts, hitAt, E, REST };
