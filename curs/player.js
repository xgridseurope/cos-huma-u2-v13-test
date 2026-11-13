// COS-HUMA · Medi U2 · lesson player (1B). Shared by every small lesson; each lesson is a config module in /curs.
// Rules the player enforces for every lesson:
//  • the child controls the pace (no countdown); nothing that gives the answer is on screen before the child answers
//    (book sentences, labels, highlights that point at the answer, and the Chinese gloss included);
//  • help ladder: 1st error → a specific observation cue; 2nd error → watch the demo again; then help is hidden and the
//    child retries alone. Anything solved after a cue or a demo is recorded as "amb ajuda" (with help), never "sol";
//  • three separate records: understanding (units), location (names), spelling (names); feedback shown AFTER an answer
//    never changes how that answer is recorded.

const whenReady = new Promise(r => window.__app ? r() : addEventListener('app-ready', r, { once: true }));
await whenReady;
const A = window.__app, T = A.THREE, camera = A.camera, canvas = A.renderer.domElement;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const lessonId = new URLSearchParams(location.search).get('l') || 'l10';
const CFG = (await import(`./${lessonId}.js?v=1b`)).default;

// ---------------------------------------------------------------- camera framing for the area not covered by the card
const L = $('L'), body = $('Lbody');
function fitDist(h, w = h * .55) {
  const v = camera.view && camera.view.enabled ? camera.view : null, tf = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
  const visH = v ? (v.fullHeight > v.height ? v.height - v.offsetY : v.height) : innerHeight, visW = v ? (v.fullWidth > v.width ? v.width - v.offsetX : v.width) : innerWidth, fullH = v ? v.fullHeight : innerHeight;
  const tv = tf * visH / fullH, th = tv * visW / visH; return Math.max(h / tv, w / th) * 1.1;
}
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

// ---------------------------------------------------------------- the lesson's names (structures to locate / say / spell)
const parts = {};
const NM = { ...(CFG.targets || {}), ...CFG.names };   // targets = extra tap targets that are not names to learn (no record rows)
for (const [k, n] of Object.entries(NM)) parts[k] = A.find(n.re, n.g);
const PW = CFG.partWord || 'os';   // 'os' | 'múscul'
// what is highlighted when the name is shown/asked (e.g. ONE rib for «costella»); taps accept the whole set in `parts`
const showParts = Object.fromEntries(Object.entries(NM).map(([k, n]) => [k, n.show ? A.find(n.show, n.g) : parts[k]]));
// frame a set of names from a direction; pad = margin around their box
function frame(keys, dir = [0, .1, 1], pad = 1.25, ms) {
  const ms_ = keys.flatMap(k => parts[k]); const b = A.boxOf(ms_), c = b.getCenter(new T.Vector3()), sz = b.getSize(new T.Vector3());
  A.flyTo(c, new T.Vector3(...dir).normalize().multiplyScalar(fitDist(sz.y / 2 * pad, Math.max(sz.x, sz.z) / 2 * pad)), ms);
}
const view = name => CFG.views[name](ctx);

// ---------------------------------------------------------------- labels
const labelBox = $('labels'), labelList = [];
function label(text, src) { const el = document.createElement('div'); el.className = 'lbl'; el.textContent = text; labelBox.appendChild(el); labelList.push({ el, src }); }
function clearLabels() { labelBox.innerHTML = ''; labelList.length = 0; }
const centerOf = k => () => A.boxOf(showParts[k]).getCenter(new T.Vector3());
function nameLabels(keys) { for (const k of keys) label(NM[k].ca, NM[k].labelAt ? () => NM[k].labelAt(ctx) : centerOf(k)); }
A.tickers.push(() => {
  if (!labelList.length) return; const r = canvas.getBoundingClientRect(), pos = [];
  for (const Lb of labelList) {
    const v = Lb.src().project(camera), vis = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
    Lb.el.style.display = vis ? '' : 'none'; if (vis) pos.push({ Lb, x: (v.x + 1) / 2 * r.width, y: (1 - v.y) / 2 * r.height, w: Lb.el.offsetWidth || 60 });
  }
  pos.sort((a, b) => a.y - b.y);   // keep labels from covering each other
  for (let i = 0; i < pos.length; i++) for (let j = 0; j < i; j++) { const a = pos[j], b = pos[i]; if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 2 && Math.abs(a.y - b.y) < 21) b.y = a.y + 21; }
  for (const p of pos) p.Lb.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;
});

// ---------------------------------------------------------------- records
const KEY = 'cosHumaCurs_' + CFG.id;
const loadRec = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
const freshRec = () => ({ v: 2, lesson: CFG.id, started: new Date().toISOString(), units: Object.fromEntries(Object.keys(CFG.units || {}).map(k => [k, []])), loc: {}, review: {}, say: {}, spell: {}, pred: {}, wrong: 0, stageTimes: {}, day2: {} });
let rec = freshRec();
const saveRec = () => { try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { /* storage may be blocked */ } };
function evid(units, v) { for (const u of units) (rec.units[u] = rec.units[u] || []).push(v); saveRec(); }
function unitStatus(arr) { if (!arr || !arr.length) return ['Vist (sense comprovar)', 'mid']; if (arr.includes('no')) return ['Cal repassar', 'bad']; if (arr.includes('ajuda')) return ['Amb ajuda', 'mid']; return ['Tot sol/a ✔', 'ok']; }

// ---------------------------------------------------------------- UI helpers
let showZh = false;
const book = keys => keys.map(k => { const b = CFG.book[k];
  if (b.src === 'dib') return `<div class="book r"><span class="pg">📘 p. ${b.p} · ${b.where} · deducció del dibuix (no és text literal)</span>${esc(b.tx)}</div>`;
  return b.src === 'lit' ? `<div class="book"><span class="pg">📘 p. ${b.p} · ${b.where}</span>${esc(b.tx)}</div>`
    : `<div class="book r"><span class="pg">📘 p. ${b.p} · ${b.where} · resposta (no és text literal)</span>${b.q ? `<i>${esc(b.q)}</i><br>` : ''}${esc(b.tx)}</div>`; }).join('');
const ossi = t => `<div class="ossi"><span class="av">🦴</span><p>${esc(t)}</p></div>`;
const zh = t => t ? `<div class="zh" style="display:${showZh ? '' : 'none'}">🇨🇳 ${esc(t)}</div>` : '';
const memo = t => `<div class="note">🧠 <b>Truc per recordar</b> <span class="nb">no s’avalua</span><br>${esc(t)}</div>`;
const curio = t => `<div class="note">💡 <b>Curiositat</b> <span class="nb">no surt al llibre · no s’avalua</span><br>${esc(t)}</div>`;
const aid = t => `<div class="note">🧭 <b>Pista per trobar-lo</b> <span class="nb">no s’ha d’aprendre</span><br>${esc(t)}</div>`;
let canNext = false;
function setNext(on, labelTxt) { canNext = on; $('Lnext').disabled = !on; $('Lnext').classList.toggle('ready', on); if (labelTxt) $('Lnext').textContent = labelTxt; }
function feedback(el, ok, msg) { const old = el.querySelector(':scope > .fb'); if (old) old.remove(); const f = document.createElement('div'); f.className = 'fb ' + (ok ? 'ok' : 'no'); f.textContent = msg; el.appendChild(f); f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
function hidden() { clearLabels(); A.clearHighlights(); if (CFG.neutral) CFG.neutral(ctx); }

// ---------------------------------------------------------------- picking
const ray = new T.Raycaster(), ndc = new T.Vector2();
function hitAt(x, y, targets) {
  const r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(A.pickables.filter(o => o.visible), false); if (!hits.length) return { obj: null, ok: false };
  const first = hits[0], obj = A.resolveHit(first);
  for (const h of hits) { if (h.distance > first.distance + .02) break; if (targets.has(A.resolveHit(h))) return { obj: A.resolveHit(h), ok: true }; }
  return { obj, ok: false };
}
// small structures (wrist bones): a tap inside the on-screen box of one target piece also counts
function nearSmall(x, y, targets) {
  const r = canvas.getBoundingClientRect();
  for (const m of targets) { const b = A.boxOf([m]), xs = [], ys = [];
    for (const cx of [b.min.x, b.max.x]) for (const cy of [b.min.y, b.max.y]) for (const cz of [b.min.z, b.max.z]) { const v = new T.Vector3(cx, cy, cz).project(camera); xs.push((v.x + 1) / 2 * r.width + r.left); ys.push((1 - v.y) / 2 * r.height + r.top); }
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    if (w < 40 && h < 40 && x > Math.min(...xs) - 8 && x < Math.max(...xs) + 8 && y > Math.min(...ys) - 8 && y < Math.max(...ys) + 8) return true; }
  return false;
}
function nameOf(o) { if (!o) return 'res'; for (const k in parts) if (parts[k].includes(o)) return NM[k].noLoc ? (NM[k].pvName || 'una altra part') : '«' + NM[k].ca + '»'; return o.userData.g === 'bone' ? (PW === 'os' ? 'un altre os' : 'un os') : (o.userData.g === 'muscle' || o.userData.g === 'allMuscle') ? 'un altre múscul' : 'una altra part'; }

// tap a named structure without labels. Help ladder: cue → demo (highlight + name) → retry alone.
function tapTask(el, { q, key, cue, onResult, demo }) {
  el.innerHTML = `<div class="q">${esc(q)}</div><div class="cnt">Pots girar el model amb el dit.</div>`;
  const targets = new Set(parts[key]); let wrongs = 0, d = null;
  window.__curs && (window.__curs.tapKey = key);   // test hook only
  const down = e => { d = [e.clientX, e.clientY]; };
  const up = async e => {
    if (el.dataset.done || !d || Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 8) return;
    let h = hitAt(e.clientX, e.clientY, targets);
    const tol = NM[key].tol;   // thin structures (nerves): a tap within tol px of the target also counts
    if (!h.ok && tol && !h.obj) for (const rr of [tol / 2, tol]) for (let j = 0; j < 8 && !h.ok; j++) { const t = hitAt(e.clientX + rr * Math.cos(j * Math.PI / 4), e.clientY + rr * Math.sin(j * Math.PI / 4), targets); if (t.ok) h = t; }
    if (h.ok || nearSmall(e.clientX, e.clientY, targets)) {
      el.dataset.done = 1; const v = wrongs ? 'ajuda' : 'sol'; onResult && onResult(v); saveRec();
      A.highlight([...targets], 0x35c46a); feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐'); setTimeout(() => A.clearHighlights(), 900); cleanup(); el.dispatchEvent(new Event('done')); return;
    }
    wrongs++; rec.wrong++;
    if (wrongs === 1) feedback(el, false, `Això és ${nameOf(h.obj)}. 💡 ${cue}`);
    else { feedback(el, false, '👀 Mira on és…'); if (demo) await demo(); else { A.highlight(showParts[key], 0x2fd3ff); label(NM[key].ca, centerOf(key)); await wait(2200); A.clearHighlights(); clearLabels(); } feedback(el, false, 'Ara toca’l tu sol/a.'); }
  };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', up);
  const cleanup = () => { canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointerup', up); };
  return cleanup;
}
// multiple choice with the same help ladder
function ladderChoice(el, { q, opts, a, cue, demo, helpText, units = [], subject, onResult, series }) {
  el.innerHTML = `<div class="q">${esc(q)}</div><div class="opts"></div>`;
  let wrongs = 0; const o = el.querySelector('.opts'); window.__curs && (window.__curs.answer = opts[a]);   // test hook only (not in the page)
  const draw = () => { if (subject) { hidden(); subject(); } o.innerHTML = ''; for (const i of shuffle(opts.map((_, i) => i))) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = opts[i]; b.onclick = () => pick(i, b); o.appendChild(b); } };
  const pick = async (i, b) => {
    if (el.dataset.done) return;
    if (i === a) { b.classList.add('right'); el.dataset.done = 1; const v = wrongs ? 'ajuda' : 'sol'; if (onResult) onResult(v); else evid(units, v); saveRec(); feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐'); if (!onResult && !series) setNext(true); el.dispatchEvent(new Event('done')); return; }
    wrongs++; rec.wrong++; b.classList.add('wrong'); b.disabled = true;
    if (wrongs === 1) feedback(el, false, '💡 Pista: ' + cue);
    else if (helpText) { feedback(el, false, '👀 ' + helpText + ' Després torna-ho a provar.'); o.querySelectorAll('button').forEach(x => x.disabled = true); await wait(2500); draw(); }
    else { feedback(el, false, '👀 Mira-ho una altra vegada…'); o.querySelectorAll('button').forEach(x => x.disabled = true); await demo(); hidden(); feedback(el, false, 'Ara torna-ho a provar tu sol/a.'); draw(); }
  };
  draw();
}
// several classification / choice questions in a row (each with its own subject highlight and help ladder)
function choiceSeries(id, ph, items, { view: v, intro } = {}) {
  return { id, ph, recall: true, render: async el => {
    hidden(); if (v) view(v); setNext(false);
    await sequence(el, items, (box, it) => { ladderChoice(box, { ...it, series: true, q: (intro ? intro + ' ' : '') + it.q }); });
    hidden(); feedback(el, true, 'Fet! ⭐'); setNext(true);
  } };
}
// teaching stepper: the child advances one card at a time; each card runs its own 3D scene
function stepper(el, steps, { title, after } = {}) {
  let i = 0;
  const show = () => { const st = steps[i]; hidden(); st.scene && st.scene();
    el.innerHTML = `${title ? `<h2>${esc(title)} · ${i + 1}/${steps.length}</h2>` : ''}${st.html}<button class="opt go" id="nb">${i < steps.length - 1 ? 'Següent ▶' : 'Fet ✔'}</button>`;
    $('nb').onclick = () => { i++; if (i < steps.length) show(); else { $('nb').remove(); after && after(); setNext(true); } }; };
  show(); setNext(false);
}
// prediction: not scored, never marked right/wrong
function predict(el, { q, opts, say, zhq, id }) {
  el.innerHTML = `<h2>Una pregunta abans de mirar</h2>${say ? ossi(say) : ''}<div class="q">${esc(q)}</div><div class="opts" id="po"></div>${zh(zhq ? '题目：' + zhq + '（预测题，不计分）' : '')}`;
  for (const [i, t] of opts.entries()) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = t; b.onclick = () => { rec.pred[id] = i; saveRec(); el.querySelectorAll('#po button').forEach(x => x.disabled = true); b.classList.add('hint'); feedback(el, true, 'D’acord! Ara ho comprovem 👀'); setNext(true); }; $('po').appendChild(b); }
  setNext(false);
}
// spoken answer, then the family checks (scoring points only after the child has spoken)
function recall(el, { q, keys, units, zhq, zkey }) {
  hidden();
  el.innerHTML = `<h2>Explica-ho tu</h2><div class="q">${esc(q)}</div><div class="cnt">Pensa tot el temps que vulguis. Sense mirar cap pista!</div>
    <button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>${zh('题目：' + zhq + '（孩子说完后才显示家长核对内容）')}`;
  $('said').onclick = () => { $('said').remove();
    $('chk').innerHTML = `<div class="ans"><b>Resposta del llibre:</b>${book(keys)}</div><div class="parent"><div class="who">👨‍👩‍👧 Per a la família / 家长判断：</div>${zh(zkey)}<div class="row">
      <button class="opt right" id="pY">Ho ha dit bé ✓ 说对了</button><button class="opt" id="pH">Amb una mica d’ajuda 有提示才说对</button><button class="opt" id="pN">Encara no ✗ 还不会</button></div></div>`;
    const done = v => { evid(units, v); el.querySelectorAll('.parent button').forEach(b => b.disabled = true); feedback(el, true, v === 'sol' ? 'Fantàstic! ⭐' : 'D’acord, ho repassarem demà.'); setNext(true); };
    $('pY').onclick = () => done('sol'); $('pH').onclick = () => done('ajuda'); $('pN').onclick = () => done('no'); };
  setNext(false);
}
// say the name of the highlighted structure (no labels); check after
const PV = k => `<div class="note pv">⚠️ <b>La zona del model que correspon a aquest nom del llibre està pendent de verificar.</b> ${esc(CFG.names[k].pvNote || '')}${showZh ? '<br>🇨🇳 教材名称对应区域待核实。' : ''}</div>`;   // noLoc names
function sayName(el, key, { onResult } = {}) {
  hidden(); const nl = CFG.names[key].noLoc; if (!nl) A.highlight(showParts[key], 0x2fd3ff);
  el.innerHTML = nl ? `<div class="q">${esc(CFG.names[key].sayQ)} Digues-ho en veu alta.</div>${PV(key)}${zh('题目：按课本图说出名称（模型上对应区域待核实）。')}<button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>` : `<div class="q">Com es diu ${PW === 'os' ? 'l’os blau' : PW === 'múscul' ? 'el múscul blau' : 'la part blava'}? Digues-ho en veu alta.</div>${zh(PW === 'os' ? '题目：说出蓝色骨头的名称（说完再核对）。' : PW === 'múscul' ? '题目：说出蓝色肌肉的名称（说完再核对）。' : '题目：说出蓝色部位的名称（说完再核对）。')}<button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>`;
  $('said').onclick = () => { $('said').remove();
    $('chk').innerHTML = `<div class="spell">${esc(CFG.names[key].ca)}</div><div class="parent"><div class="who">👨‍👩‍👧 Ho ha dit bé? / 说对了吗？</div><div class="row">
      <button class="opt right" data-v="sol">Sí ✓ 对</button><button class="opt" data-v="ajuda">Amb ajuda 有提示</button><button class="opt" data-v="no">No ✗ 不对</button></div></div>`;
    el.querySelectorAll('.parent button').forEach(b => b.onclick = () => { onResult(b.dataset.v); saveRec(); el.querySelectorAll('.parent button').forEach(x => x.disabled = true); el.dispatchEvent(new Event('done')); }); };
}
// write on paper; the correct spelling appears only after «Comprova»
function spell(el, key, { onResult } = {}) {
  hidden(); const nl = CFG.names[key].noLoc; if (!nl) A.highlight(showParts[key], 0x2fd3ff);
  el.innerHTML = `<div class="q">${nl ? esc(CFG.names[key].sayQ).replace('Com es diu', 'Escriu en un paper el nom de') : 'Escriu en un paper el nom de la part blava.'} Quan acabis, toca «Comprova».</div>${zh('题目：在纸上写出蓝色部位的名称，写完再核对。只错重音记为「拼写需练」。')}<button class="opt go" id="cmp">✏️ Comprova</button><div id="sp"></div>`;
  $('cmp').onclick = () => { $('cmp').remove();
    $('sp').innerHTML = `<div class="spell">${CFG.names[key].html || esc(CFG.names[key].ca)}</div><div class="parent"><div class="who">👨‍👩‍👧 Compara amb el paper / 对照纸上：</div><div class="row">
      <button class="opt right" data-v="ok">Escrit bé ✓ 全对</button><button class="opt" data-v="accent">Només l’accent 只错重音</button><button class="opt" data-v="no">Cal practicar ✗ 需要练</button></div></div>`;
    el.querySelectorAll('.parent button').forEach(b => b.onclick = () => { onResult(b.dataset.v); saveRec(); el.querySelectorAll('.parent button').forEach(x => x.disabled = true); el.dispatchEvent(new Event('done')); }); };
}
// run a list of sub-tasks one after another inside one stage
async function sequence(el, items, run) {
  for (const it of items) { const box = document.createElement('div'); el.innerHTML = ''; el.appendChild(box);
    await new Promise(res => { box.addEventListener('done', res, { once: true }); cleanupTap = run(box, it) || null; });
    await wait(700); if (cleanupTap) { cleanupTap(); cleanupTap = null; } }
}

// ---------------------------------------------------------------- generic stages for NAME lessons (groups of 2–3)
function nameGroupStages(g) {   // g = { id, keys, view, viewAlt, title, predict? }
  const S = [];
  if (g.predict) S.push({ id: g.id + '-pregunta', ph: '1 · Pregunta', render: el => { hidden(); view(g.view); predict(el, { ...g.predict, id: g.id }); } });
  S.push({ id: g.id + '-coneix', ph: '2–3 · Coneix-los', render: el => {
    hidden(); view(g.view); let i = 0;
    const show = () => {
      A.clearHighlights(); clearLabels(); const k = g.keys[i], nl = CFG.names[k].noLoc;
      if (!nl) { A.highlight(showParts[k], 0x2fd3ff); nameLabels([k]); }
      el.innerHTML = `<h2>${esc(g.title)} · ${i + 1}/${g.keys.length}</h2>${g.book ? book(g.book) : ''}<div class="spell">${esc(CFG.names[k].ca)}</div>${nl ? PV(k) : ''}${aid(CFG.names[k].aid)}${zh(CFG.names[k].zh)}
        <button class="opt go" id="nb">${i < g.keys.length - 1 ? 'Següent ' + PW + ' ▶' : 'Tots junts ▶'}</button>`;
      $('nb').onclick = () => { i++; if (i < g.keys.length) show(); else { A.clearHighlights(); clearLabels(); nameLabels(g.keys.filter(k => !CFG.names[k].noLoc)); el.innerHTML = `<h2>${esc(g.title)}</h2>${ossi('Aquí els tens tots junts. Mira’ls bé abans de continuar.')}`; setNext(true); } };
    };
    show(); setNext(false);
  } });
  S.push({ id: g.id + '-fes', ph: '4 · Fes-ho tu (amb noms)', render: async el => {
    clearLabels(); A.clearHighlights(); view(g.view); const LK = g.keys.filter(k => !CFG.names[k].noLoc); nameLabels(LK); setNext(false);
    await sequence(el, shuffle(LK), (box, k) => tapTask(box, { q: `👆 Toca: ${CFG.names[k].ca} (pots mirar els noms)`, key: k, cue: CFG.names[k].aid }));   // with labels: practice only, not recorded
    feedback(el, true, 'Molt bé! Ara, sense noms…'); setNext(true);
  } });
  S.push({ id: g.id + '-digues', ph: '5 · Digues el nom', recall: true, render: async el => {
    hidden(); view(g.view); setNext(false);
    await sequence(el, shuffle(g.keys), (box, k) => { sayName(box, k, { onResult: v => { rec.say[k] = v; } }); });
    hidden(); feedback(el, true, 'Fet! Ara els buscarem des d’un altre costat.'); setNext(true);
  } });
  S.push({ id: g.id + '-troba', ph: '6 · Troba’ls (sense noms)', recall: true, render: async el => {
    hidden(); view(g.viewAlt); setNext(false);
    await sequence(el, shuffle(g.keys.filter(k => !CFG.names[k].noLoc)), (box, k) => tapTask(box, { q: `👆 Toca: ${CFG.names[k].ca}`, key: k, cue: CFG.names[k].aid, onResult: v => { rec.loc[k] = v; } }));
    feedback(el, true, 'Molt bé! ⭐'); setNext(true);
  } });
  return S;
}
// all names of the lesson, random order, from yet another view (only after every name has been practised)
function reviewStage(keys, viewName, viewFor) {   // viewFor(k): optional view per item (e.g. muscles of the back)
  return { id: 'repas', ph: 'Repàs barrejat', recall: true, render: async el => {
    hidden(); view(viewName); setNext(false);
    keys = keys.filter(k => !CFG.names[k].noLoc);
    const missing = keys.filter(k => !rec.loc[k]);
    if (missing.length) { el.innerHTML = `<div class="note">Encara falten: ${missing.map(k => CFG.names[k].ca).join(', ')}</div>`; return; }
    await sequence(el, shuffle(keys), (box, k) => { if (viewFor) view(viewFor(k)); return tapTask(box, { q: `👆 Toca: ${CFG.names[k].ca}`, key: k, cue: CFG.names[k].aid, onResult: v => { rec.review[k] = v; } }); });
    feedback(el, true, 'Repàs fet! 🎉'); setNext(true);
  } };
}
function spellStage(keys) {
  return { id: 'escriu', ph: 'Escriu', recall: true, render: async el => {
    hidden(); setNext(false);
    await sequence(el, keys, (box, k) => { spell(box, k, { onResult: v => { rec.spell[k] = v; } }); });
    hidden(); feedback(el, true, 'Fet! ✏️'); setNext(true);
  } };
}

// ---------------------------------------------------------------- results + day 2
const T1 = { pv: ['Pendent de verificar (no s’avalua)', 'mid'], sol: ['Tot sol/a ✔', 'ok'], ajuda: ['Amb ajuda', 'mid'], no: ['Encara no', 'bad'], ok: ['Bé ✔', 'ok'], accent: ['Cal practicar l’accent', 'mid'] };
const cell = v => { const [t, c] = T1[v] || ['Pendent', 'bad']; return `<td class="${c}">${t}</td>`; };
function resultsHTML() {
  let h = '';
  const U = Object.keys(CFG.units || {});
  if (U.length) h += `<div class="q">Comprensió</div><table class="res">${U.map(k => { const [t, c] = unitStatus(rec.units[k]); return `<tr><td>${esc(CFG.units[k])}</td><td class="${c}">${t}</td></tr>`; }).join('')}</table>`;
  const N = Object.keys(CFG.names);
  const cols = [['loc', 'Troba'], ...(CFG.hasReview ? [['review', 'Repàs']] : []), ...(CFG.hasSay ? [['say', 'Diu el nom']] : []), ['spell', 'Escriu']];
  h += `<div class="q">Noms</div><table class="res"><tr><th></th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr>${N.map(k => `<tr><td>${esc(CFG.names[k].ca)}</td>${cols.map(c => cell(CFG.names[k].noLoc && (c[0] === 'loc' || c[0] === 'review') ? 'pv' : rec[c[0]][k])).join('')}</tr>`).join('')}</table>`;
  return h;
}
function resultsStage() {
  return { id: 'fi', ph: 'Resultat', recall: true, render: el => {
    rec.finished = new Date().toISOString(); saveRec(); hidden(); if (CFG.neutralPose) CFG.neutralPose(ctx);
    const mins = Math.round((new Date(rec.finished) - new Date(rec.started)) / 60000);
    el.innerHTML = `<h2>Molt bé! 🎉</h2>${ossi('Demà farem una revisió curta per veure si ho recordes.')}${resultsHTML()}
      <div class="cnt">Temps: ${mins} min · respostes equivocades: ${rec.wrong}</div>
      <div class="row"><button class="opt" id="cp">📋 Copia el resultat</button><button class="opt go" id="d2">📋 Revisió de demà</button></div>${zh('理解、定位、拼写分开记录。点「Copia el resultat」复制结果发给我。')}`;
    $('cp').onclick = () => copyResult($('cp')); $('d2').onclick = () => day2();
    setNext(false, 'Final ✔');
  } };
}
function copyResult(btn) {
  const t = JSON.stringify({ lesson: CFG.id, title: CFG.title, version: A.VERSION, ...rec }, null, 1);
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { btn.textContent = 'Copiat ✔'; }).catch(() => { const ta = document.createElement('textarea'); ta.value = t; ta.style.width = '100%'; ta.rows = 8; btn.after(ta); ta.select(); });
}
// day 2: one item at a time; family answers only after the child has answered
function day2() {
  showApp(); $('Lstart').style.display = 'none'; hidden(); if (CFG.neutralPose) CFG.neutralPose(ctx);
  const r = loadRec(); if (r) rec = r; rec.day2 = rec.day2 || {}; rec.day2.started = new Date().toISOString(); saveRec();
  $('Lnext').style.display = 'none'; $('Lback').style.display = 'none';
  const items = CFG.day2(ctx); let k = 0;
  const go = () => {
    if (cleanupTap) { cleanupTap(); cleanupTap = null; } A.clearHighlights(); clearLabels();
    $('Lbar').style.width = `${k / items.length * 100}%`; $('Lch').textContent = `Revisió de l’endemà · ${Math.min(k + 1, items.length)}/${items.length}`;
    if (k >= items.length) { document.body.classList.remove('nomodel'); return finish(); }
    const it = items[k], next = () => { k++; saveRec(); go(); };
    const nextBtn = () => { body.insertAdjacentHTML('beforeend', '<button class="opt go" id="nx">Continua ▶</button>'); $('nx').onclick = next; };
    const rate = (box, labels) => { box.insertAdjacentHTML('beforeend', `<div class="row" id="rt">${labels.map(([v, t], i) => `<button class="opt ${i ? '' : 'right'}" data-v="${v}">${t}</button>`).join('')}</div>`);
      box.querySelectorAll('#rt button').forEach(b => b.onclick = () => { rec.day2[it.id] = b.dataset.v; box.querySelectorAll('#rt button').forEach(x => x.disabled = true); nextBtn(); }); };
    if (it.kind === 'oral') {
      document.body.classList.toggle('nomodel', !it.withModel);
      body.innerHTML = `<h2>${esc(it.title || 'Explica-ho')}</h2><div class="q">${esc(it.ca)}</div>${zh('题目：' + it.zq)}<button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>`;
      $('said').onclick = () => { $('said').remove(); const c = $('chk');
        c.innerHTML = `<div class="parent"><div class="who">👨‍👩‍👧 Resposta per a la família / 家长答案：</div><div class="ans">${esc(it.key)}</div>${zh(it.zkey)}</div>`;
        rate(c.querySelector('.parent'), [['sol', 'Ho ha dit bé ✓ 说对了'], ['ajuda', 'Amb ajuda 有提示才说对'], ['no', 'Encara no ✗ 还不会']]); };
    } else {
      document.body.classList.remove('nomodel'); if (it.view) view(it.view);
      body.innerHTML = `<h2>${esc(it.title || '')}</h2><div id="tb"></div>`; const box = $('tb');
      box.addEventListener('done', nextBtn, { once: true });
      if (it.kind === 'loc') cleanupTap = tapTask(box, { q: `👆 Toca: ${CFG.names[it.key].ca} (sense noms)`, key: it.key, cue: CFG.names[it.key].aid, onResult: v => { rec.day2[it.id] = v; } });
      else if (it.kind === 'say') sayName(box, it.key, { onResult: v => { rec.day2[it.id] = v; } });
      else if (it.kind === 'spell') spell(box, it.key, { onResult: v => { rec.day2[it.id] = v; } });
      else if (it.kind === 'choice') ladderChoice(box, { ...it, onResult: v => { rec.day2[it.id] = v; } });
      else if (it.kind === 'custom') it.run(box, v => { rec.day2[it.id] = v; saveRec(); });
    }
  };
  const finish = () => {
    rec.day2.finished = new Date().toISOString(); saveRec();
    body.innerHTML = `<h2>Revisió acabada 🎉</h2><table class="res">${items.map(it => `<tr><td>${esc(it.label)}</td>${cell(rec.day2[it.id])}</tr>`).join('')}</table><div class="row"><button class="opt" id="cp">📋 Copia el resultat</button></div>`;
    $('cp').onclick = () => copyResult($('cp'));
  };
  go();
}

// ---------------------------------------------------------------- navigation
let idx = 0, cleanupTap = null, S = [];
function render() {
  A.clearHighlights(); if (cleanupTap) { cleanupTap(); cleanupTap = null; }
  const s = S[idx]; rec.stageTimes[s.id] = rec.stageTimes[s.id] || new Date().toISOString(); saveRec();
  $('Lbar').style.width = `${(idx + 1) / S.length * 100}%`; $('Lch').textContent = s.ph; $('Ldots').innerHTML = ''; $('Lstars').textContent = '';
  body.innerHTML = '<div id="st"></div>'; const el = $('st');
  s.render(el, ctx);
  $('Lback').disabled = idx === 0 || !!s.recall;     // no going back to the answers once recall/practice starts
  body.scrollTop = 0;
}
$('Lnext').onclick = () => { if (!canNext) return; if (idx < S.length - 1) { idx++; setNext(false, 'Continua ▶'); render(); } };
$('Lback').onclick = () => { if (idx > 0 && !S[idx].recall) { idx--; render(); } };
$('Lzh').onclick = () => { showZh = !showZh; $('Lzh').classList.toggle('on', showZh); body.querySelectorAll('.zh').forEach(z => z.style.display = showZh ? '' : 'none'); };
$('Lexit').onclick = () => { location.href = './index.html'; };
$('Lspeak').style.display = 'none';
function showApp() { document.body.classList.add('lessonMode'); L.style.display = ''; viewOffset(true); CFG.setup(ctx); }

// ---------------------------------------------------------------- context handed to lesson configs
const ctx = { A, T, $, esc, wait, shuffle, parts, memo, curio, frame, view, fitDist, label, clearLabels, nameLabels, centerOf, book, ossi, zh, aid, setNext, feedback, hidden,
  showParts, choiceSeries, stepper, tapTask, ladderChoice, predict, recall, sayName, spell, sequence, evid, get rec() { return rec; }, saveRec, nameGroupStages, reviewStage, spellStage, resultsStage };
S = CFG.stages(ctx);

$('Ltitle').textContent = CFG.title; $('Lsub').textContent = CFG.subtitle;
$('Lbegin').onclick = () => { $('Lstart').style.display = 'none'; showApp(); rec = freshRec(); idx = 0; setNext(false, 'Continua ▶'); render(); };
$('Lday2').onclick = () => day2();
document.body.classList.add('lessonMode'); $('Lstart').style.display = ''; CFG.setup(ctx);

window.__curs = { answer: null, CFG, get S() { return S; }, get idx() { return idx; }, get rec() { return rec; }, get canNext() { return canNext; }, next() { $('Lnext').click(); }, parts, hitAt, ctx };
