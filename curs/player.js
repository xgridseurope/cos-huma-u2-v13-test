// COS-HUMA · Medi U2 · lesson player (1B). Shared by every small lesson; each lesson is a config module in /curs.
// Rules the player enforces for every lesson:
//  • the child controls the pace (no countdown); nothing that gives the answer is on screen before the child answers
//    (book sentences, labels, highlights that point at the answer, and the Chinese gloss included);
//  • help ladder: 1st error → a specific observation cue; 2nd error → watch the demo again; then help is hidden and the
//    child retries alone. Anything solved after a cue or a demo is recorded as "amb ajuda" (with help), never "sol";
//  • three separate records: understanding (units), location (names), spelling (names); feedback shown AFTER an answer
//    never changes how that answer is recorded.
//  • (phase-1 gate B, 2026-11-13, rules R2 R8–R16) the child learns on her own: no step needs a parent. Explanations,
//    said names and paper spelling are SELF-checked and recorded as «auto-*», never as an independent right answer;
//    the child may skip («Més tard») or go back to look again («Torna a mirar»); skipped ≠ right ≠ mastered; skipped
//    and helped items go first in the light review rounds (next day, about a week later, 8 items by default).
//    Records carry the content version, resume after a reload, and a new round archives the old record.

const whenReady = new Promise(r => window.__app ? r() : addEventListener('app-ready', r, { once: true }));
await whenReady;
const A = window.__app, T = A.THREE, camera = A.camera, canvas = A.renderer.domElement;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const QS = new URLSearchParams(location.search);
const lessonId = QS.get('l') || 'l10';
// content version of the phase-1 lessons (F12). Bump when lesson content or scoring changes; the handoff maps it to a commit.
export const CONTENT = 'P24-29·fase1·2026-11-13b';
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
// neutral parts (D1, D2): a related structure that is explained but scored neither right nor wrong (e.g. the upper jaw for «maxil·lar»)
const neutralParts = Object.fromEntries(Object.entries(NM).filter(([, n]) => n.neutral).map(([k, n]) => [k, A.find(n.neutral, n.g)]));
const PW = CFG.partWord || 'os';   // 'os' | 'múscul'
// what is highlighted when the name is shown/asked (e.g. ONE rib for «costella»); taps accept the whole set in `parts`
const showParts = Object.fromEntries(Object.entries(NM).map(([k, n]) => [k, n.show ? A.find(n.show, n.g) : parts[k]]));
// frame a set of names from a direction; pad = margin around their box
function frame(keys, dir = [0, .1, 1], pad = 1.25, ms) {
  const ms_ = keys.flatMap(k => parts[k]); const b = A.boxOf(ms_), c = b.getCenter(new T.Vector3()), sz = b.getSize(new T.Vector3());
  A.flyTo(c, new T.Vector3(...dir).normalize().multiplyScalar(fitDist(sz.y / 2 * pad, Math.max(sz.x, sz.z) / 2 * pad)), ms);
}
const view = name => { lastView = name; return CFG.views[name](ctx); };

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
const KEY = 'cosHumaCurs_' + CFG.id, AKEY = KEY + '_arxiu';
const loadRec = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
const freshRec = () => ({ v: 3, lesson: CFG.id, content: CONTENT, app: A.VERSION, started: new Date().toISOString(), idx: 0,
  units: Object.fromEntries(Object.keys(CFG.units || {}).map(k => [k, []])), self: {}, loc: {}, review: {}, say: {}, spell: {}, pred: {}, obs: {}, neutral: {},
  skip: {}, revisit: {}, wrong: 0, stageTimes: {}, reviews: [] });
let rec = freshRec();
const saveRec = () => { try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { /* storage may be blocked */ } };
// a new round never deletes: the previous record goes to the archive with its content version (F02, F12)
function archive(old) { if (!old) return; try { const a = JSON.parse(localStorage.getItem(AKEY) || '[]'); a.push({ archived: new Date().toISOString(), ...old }); localStorage.setItem(AKEY, JSON.stringify(a)); } catch (e) { } }
const sameContent = r => r && r.v === 3 && r.content === CONTENT;
const helpedNow = () => !!(S[idx] && rec.revisit && rec.revisit[S[idx].id]);   // after «Torna a mirar» a right answer counts as «amb ajuda»
function evid(units, v) { for (const u of units) (rec.units[u] = rec.units[u] || []).push(v); saveRec(); }
function unitStatus(arr) { if (!arr || !arr.length) return ['Vist (sense pregunta)', 'mid']; if (arr.includes('no')) return ['Cal repassar', 'bad']; if (arr.includes('ajuda')) return ['Amb ajuda', 'mid']; return ['Tot sol/a ✔', 'ok']; }

// ---------------------------------------------------------------- UI helpers
let showZh = false;
const book = keys => keys.map(k => { const b = CFG.book[k];
  if (b.src === 'exp') return `<div class="book x"><span class="pg">💬 explicació (no és text del llibre)</span>${esc(b.tx)}</div>`;
  if (b.src === 'res') return `<div class="book r"><span class="pg">📘 p. ${b.p} · ${b.where} · resum (no és text literal)</span>${esc(b.tx)}</div>`;
  if (b.src === 'rel') return `<div class="book x"><span class="pg">🗣️ ${esc(b.where)} · no comprovat</span>${esc(b.tx)}</div>`;
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
function feedback(el, ok, msg) { const old = el.querySelector(':scope > .fb'); if (old) old.remove(); const f = document.createElement('div'); f.className = 'fb ' + (ok === 'info' ? 'info' : ok ? 'ok' : 'no'); f.textContent = msg; el.appendChild(f); f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
function hidden() { clearLabels(); A.clearHighlights(); if (CFG.neutral) CFG.neutral(ctx); }

// ---------------------------------------------------------------- picking
const ray = new T.Raycaster(), ndc = new T.Vector2();
function hitAt(x, y, targets) {
  const r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(A.pickables.filter(o => o.visible), false); if (!hits.length) return { obj: null, ok: false };
  const first = hits[0], obj = A.resolveHit(first);
  // a part listed in CFG.partHints (e.g. an intervertebral disc) is a wrong answer in its own right: never let the
  // depth tolerance or the small-target box turn a tap on it into a hit on the neighbouring target (F03)
  if ((CFG.partHints || []).some(h => h.re.test(A.norm(obj.name)))) return { obj, ok: false, hard: true };
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
function nameOf(o) { if (!o) return 'res'; for (const h of CFG.partHints || []) if (h.re.test(A.norm(o.name))) return h.ca; for (const k in parts) if (parts[k].includes(o)) return NM[k].noLoc ? (NM[k].pvName || 'una altra part') : '«' + NM[k].ca + '»'; return o.userData.g === 'bone' ? (PW === 'os' ? 'un altre os' : 'un os') : (o.userData.g === 'muscle' || o.userData.g === 'allMuscle') ? 'un altre múscul' : 'una altra part'; }

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
    if (!h.ok && h.obj && neutralParts[key] && neutralParts[key].includes(h.obj)) {   // explained, not scored
      (rec.neutral = rec.neutral || {})[key] = (rec.neutral[key] || 0) + 1; saveRec();
      A.highlight([h.obj], 0xffd23f); setTimeout(() => A.clearHighlights(), 1400); feedback(el, 'info', 'ℹ️ ' + NM[key].neutralMsg); return;
    }
    if (h.ok || (!h.hard && nearSmall(e.clientX, e.clientY, targets))) {
      el.dataset.done = 1; const v = wrongs || helpedNow() ? 'ajuda' : 'sol'; onResult && onResult(v); saveRec();
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
    if (i === a) { b.classList.add('right'); el.dataset.done = 1; const v = wrongs || helpedNow() ? 'ajuda' : 'sol'; if (onResult) onResult(v); else evid(units, v); saveRec(); feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐'); if (!onResult && !series) setNext(true); el.dispatchEvent(new Event('done')); return; }
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
// spoken explanation, then the child compares it with the book herself (N1, R11, R15): recorded as self-assessment only
const selfRow = (opts) => `<div class="self"><div class="who">🪞 Compara-ho tu mateix/a / 自己对照：</div><div class="row">${opts.map(([v, t], i) => `<button class="opt ${i ? '' : 'right'}" data-v="${v}">${t}</button>`).join('')}</div></div>`;
const SELF_SAY = [['auto-ok', 'Ho he dit tot ✓ 都说到了'], ['auto-part', 'M’he deixat alguna cosa 漏了一点'], ['auto-no', 'Encara no ho sé 还不会']];
function recall(el, { q, keys, units, zhq, zkey }) {
  hidden();
  el.innerHTML = `<h2>Explica-ho tu</h2><div class="q">${esc(q)}</div><div class="cnt">Pensa tot el temps que vulguis. Sense mirar cap pista!</div>
    <button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>${zh('题目：' + zhq + '（说完后自己对照课本答案）')}`;
  $('said').onclick = () => { $('said').remove();
    $('chk').innerHTML = `<div class="ans"><b>Què diu el llibre:</b>${book(keys)}</div>${zh(zkey)}${selfRow(SELF_SAY)}`;
    el.querySelectorAll('.self button').forEach(b => b.onclick = () => { for (const u of units) (rec.self[u] = rec.self[u] || []).push(b.dataset.v); saveRec();
      el.querySelectorAll('.self button').forEach(x => x.disabled = true); feedback(el, true, b.dataset.v === 'auto-ok' ? 'Molt bé! ⭐' : 'D’acord: ho tornarem a mirar a la revisió.'); setNext(true); }); };
  setNext(false);
}
// say the name of the highlighted structure (no labels); check after
const PV = k => `<div class="note pv">⚠️ <b>La zona del model que correspon a aquest nom del llibre està pendent de verificar.</b> ${esc(CFG.names[k].pvNote || '')}${showZh ? '<br>🇨🇳 教材名称对应区域待核实。' : ''}</div>`;   // noLoc names
function sayName(el, key, { onResult } = {}) {
  hidden(); const nl = CFG.names[key].noLoc; if (!nl) A.highlight(showParts[key], 0x2fd3ff);
  el.innerHTML = nl ? `<div class="q">${esc(CFG.names[key].sayQ)} Digues-ho en veu alta.</div>${PV(key)}${zh('题目：按课本图说出名称（模型上对应区域待核实）。')}<button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>` : `<div class="q">Com es diu ${PW === 'os' ? 'l’os blau' : PW === 'múscul' ? 'el múscul blau' : 'la part blava'}? Digues-ho en veu alta.</div>${zh(PW === 'os' ? '题目：说出蓝色骨头的名称（说完再核对）。' : PW === 'múscul' ? '题目：说出蓝色肌肉的名称（说完再核对）。' : '题目：说出蓝色部位的名称（说完再核对）。')}<button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>`;
  $('said').onclick = () => { $('said').remove();
    $('chk').innerHTML = `<div class="spell">${esc(CFG.names[key].ca)}</div>${selfRow([['auto-ok', 'L’he dit bé ✓ 说对了'], ['auto-part', 'S’hi assemblava 差一点'], ['auto-no', 'No ho sabia 不知道']])}`;
    el.querySelectorAll('.self button').forEach(b => b.onclick = () => { onResult(b.dataset.v); saveRec(); el.querySelectorAll('.self button').forEach(x => x.disabled = true); el.dispatchEvent(new Event('done')); }); };
}
// write on paper; the correct spelling appears only after «Comprova»
function spell(el, key, { onResult } = {}) {
  hidden(); const nl = CFG.names[key].noLoc; if (!nl) A.highlight(showParts[key], 0x2fd3ff);
  el.innerHTML = `<div class="q">${nl ? esc(CFG.names[key].sayQ).replace('Com es diu', 'Escriu en un paper el nom de') : 'Escriu en un paper el nom de la part blava.'} Quan acabis, toca «Comprova».</div>${zh('题目：在纸上写出蓝色部位的名称，写完再核对。只错重音记为「拼写需练」。')}<button class="opt go" id="cmp">✏️ Comprova</button><div id="sp"></div>`;
  $('cmp').onclick = () => { $('cmp').remove();
    $('sp').innerHTML = `<div class="spell">${CFG.names[key].html || esc(CFG.names[key].ca)}</div><div class="cnt">Mira lletra per lletra el teu paper i la pantalla (també els accents i la l·l).</div>${selfRow([['auto-ok', 'És igual ✓ 一样'], ['auto-accent', 'Només l’accent o la l·l 只错重音'], ['auto-no', 'És diferent: el copio bé 不一样，抄一遍']])}`;
    el.querySelectorAll('.self button').forEach(b => b.onclick = () => { onResult(b.dataset.v); saveRec(); el.querySelectorAll('.self button').forEach(x => x.disabled = true); el.dispatchEvent(new Event('done')); }); };
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
  S.push({ id: g.id + '-digues', ph: '5 · Digues el nom', recall: true, keys: g.keys, recKey: 'say', render: async el => {
    hidden(); view(g.view); setNext(false);
    await sequence(el, shuffle(g.keys), (box, k) => { sayName(box, k, { onResult: v => { rec.say[k] = v; } }); });
    hidden(); feedback(el, true, 'Fet! Ara els buscarem des d’un altre costat.'); setNext(true);
  } });
  S.push({ id: g.id + '-troba', ph: '6 · Troba’ls (sense noms)', recall: true, keys: g.keys.filter(k => !CFG.names[k].noLoc), recKey: 'loc', render: async el => {
    hidden(); view(g.viewAlt); setNext(false);
    await sequence(el, shuffle(g.keys.filter(k => !CFG.names[k].noLoc)), (box, k) => tapTask(box, { q: `👆 Toca: ${CFG.names[k].ca}`, key: k, cue: CFG.names[k].aid, onResult: v => { rec.loc[k] = v; } }));
    feedback(el, true, 'Molt bé! ⭐'); setNext(true);
  } });
  return S;
}
// all names of the lesson, random order, from yet another view (only after every name has been practised)
function reviewStage(keys, viewName, viewFor) {   // viewFor(k): optional view per item (e.g. muscles of the back)
  return { id: 'repas', ph: 'Repàs barrejat', recall: true, keys: keys.filter(k => !CFG.names[k].noLoc), recKey: 'review', render: async el => {
    hidden(); view(viewName); setNext(false);
    keys = keys.filter(k => !CFG.names[k].noLoc);
    const missing = keys.filter(k => !rec.loc[k]);   // 'salt' (skipped) is allowed: the review is a second chance
    if (missing.length) { el.innerHTML = `<div class="note">Encara falten: ${missing.map(k => CFG.names[k].ca).join(', ')}</div>`; return; }
    await sequence(el, shuffle(keys), (box, k) => { if (viewFor) view(viewFor(k)); return tapTask(box, { q: `👆 Toca: ${CFG.names[k].ca}`, key: k, cue: CFG.names[k].aid, onResult: v => { rec.review[k] = v; } }); });
    feedback(el, true, 'Repàs fet! 🎉'); setNext(true);
  } };
}
function spellStage(keys) {
  return { id: 'escriu', ph: 'Escriu', recall: true, keys, recKey: 'spell', render: async el => {
    hidden(); setNext(false);
    await sequence(el, keys, (box, k) => { spell(box, k, { onResult: v => { rec.spell[k] = v; } }); });
    hidden(); feedback(el, true, 'Fet! ✏️'); setNext(true);
  } };
}

// ---------------------------------------------------------------- results + day 2
// «Tot sol/a» = answered right without any help in the app; it is ONE answer, not mastery (R9). auto-* = the child's own check.
const T1 = { pv: ['Pendent de verificar (no s’avalua)', 'mid'], sol: ['Sol/a, sense ajuda', 'ok'], ajuda: ['Amb ajuda', 'mid'], no: ['Encara no', 'bad'], ok: ['Bé ✔', 'ok'], accent: ['Cal practicar l’accent', 'mid'],
  'auto-ok': ['Bé (ho diu ell/a)', 'ok'], 'auto-part': ['Una part (ho diu ell/a)', 'mid'], 'auto-no': ['Encara no (ho diu ell/a)', 'bad'], 'auto-accent': ['Accent / l·l (ho diu ell/a)', 'mid'], salt: ['Saltat · per repassar', 'mid'] };
const cell = v => { const [t, c] = T1[v] || ['Encara no fet', 'bad']; return `<td class="${c}">${t}</td>`; };
function resultsHTML() {
  let h = '';
  const U = Object.keys(CFG.units || {});
  const selfOf = k => { const a = rec.self[k] || []; return a.length ? (T1[a[a.length - 1]] || [''])[0] : '—'; };
  if (U.length) h += `<div class="q">Comprensió</div><table class="res"><tr><th></th><th>Preguntes</th><th>Explicació</th></tr>${U.map(k => { const [t, c] = unitStatus(rec.units[k]); return `<tr><td>${esc(CFG.units[k])}</td><td class="${c}">${t}</td><td>${selfOf(k)}</td></tr>`; }).join('')}</table>`;
  const sk = Object.keys(rec.skip || {}); if (sk.length) h += `<div class="note">⏭ Has deixat per més tard: ${sk.map(id => esc((S.find(x => x.id === id) || { ph: id }).ph)).join(', ')}. Sortiran a la revisió.</div>`;
  const N = Object.keys(CFG.names);
  const cols = [['loc', 'Troba'], ...(CFG.hasReview ? [['review', 'Repàs']] : []), ...(CFG.hasSay ? [['say', 'Diu el nom']] : []), ['spell', 'Escriu']];
  h += `<div class="q">Noms</div><table class="res"><tr><th></th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr>${N.map(k => `<tr><td>${esc(CFG.names[k].ca)}</td>${cols.map(c => cell(CFG.names[k].noLoc && (c[0] === 'loc' || c[0] === 'review') ? 'pv' : rec[c[0]][k])).join('')}</tr>`).join('')}</table>`;
  return h;
}
function resultsStage() {
  return { id: 'fi', ph: 'Resultat', recall: true, render: el => {
    rec.finished = new Date().toISOString(); saveRec(); hidden(); if (CFG.neutralPose) CFG.neutralPose(ctx);
    const mins = Math.round((new Date(rec.finished) - new Date(rec.started)) / 60000);
    el.innerHTML = `<h2>Lliçó acabada 🎉</h2>${ossi('Demà, si vols, fem una revisió curta. I d’aquí a una setmana, una altra.')}${resultsHTML()}
      <div class="cnt">Temps: ${mins} min · respostes equivocades: ${rec.wrong} · versió ${esc(CONTENT)}</div>
      <div class="row"><button class="opt" id="cp">📋 Copia el resultat</button><button class="opt go" id="d2">📋 Revisió</button></div>${zh('理解、定位、拼写分开记录；「ho diu ell/a」= 孩子自己对照的结果，不等于独立答对；一次答对不代表已掌握。')}`;
    $('cp').onclick = () => copyResult($('cp')); $('d2').onclick = () => day2();
    setNext(false, 'Final ✔');
  } };
}
function copyResult(btn) {
  const t = JSON.stringify({ lesson: CFG.id, title: CFG.title, version: A.VERSION, content: CONTENT, ...rec }, null, 1);
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { btn.textContent = 'Copiat ✔'; }).catch(() => { const ta = document.createElement('textarea'); ta.value = t; ta.style.width = '100%'; ta.rows = 8; btn.after(ta); ta.select(); });
}
// light review rounds (R14): «next day» and «about a week later» are suggestions, never locks. Each round is stored with its
// date (F11). By default at most 8 items, weak ones first (skipped, helped, not yet, self-rated «not yet»); the rest are
// optional extra practice (F05, R12). Every item can be skipped. The child checks oral answers herself (N1).
const DEFAULT_ITEMS = 8;
const weakScore = it => { const k = it.key; if (!k) return 1; const vals = [rec.loc[k], rec.review[k], rec.say[k], rec.spell[k]];
  return vals.some(v => v === 'no' || v === 'salt' || v === 'auto-no' || v === undefined) ? 0 : vals.some(v => v === 'ajuda' || v === 'auto-part' || v === 'auto-accent') ? .5 : 1; };
function day2(kind) {
  showApp(); $('Lstart').style.display = 'none'; hidden(); if (CFG.neutralPose) CFG.neutralPose(ctx);
  const r = loadRec(); if (r && sameContent(r)) rec = r;
  rec.reviews = rec.reviews || []; const n = rec.reviews.filter(x => x.kind === kind).length;
  const round = { kind: kind || 'dia', n: rec.reviews.length + 1, date: new Date().toISOString(), items: {}, extra: false }; rec.reviews.push(round); saveRec();
  $('Lnext').style.display = 'none'; $('Lback').style.display = 'none'; navExtras(false);
  const all = CFG.day2(ctx).map((it, i) => ({ it, i, w: weakScore(it) })).sort((a, b) => a.w - b.w || a.i - b.i).map(x => x.it);
  let items = all.slice(0, DEFAULT_ITEMS); const rest = all.slice(DEFAULT_ITEMS); let k = 0;
  const go = () => {
    if (cleanupTap) { cleanupTap(); cleanupTap = null; } A.clearHighlights(); clearLabels();
    $('Lbar').style.width = `${k / items.length * 100}%`; $('Lch').textContent = `Revisió ${round.kind === 'setmana' ? 'de la setmana' : 'de l’endemà'} · ${Math.min(k + 1, items.length)}/${items.length}`;
    if (k >= items.length) { document.body.classList.remove('nomodel'); return finish(); }
    const it = items[k], next = () => { k++; saveRec(); go(); };
    const put = v => { round.items[it.id] = v; (rec.day2 = rec.day2 || {})[it.id] = v; };
    const nextBtn = () => { if ($('nx')) return; $('sk') && $('sk').remove(); body.insertAdjacentHTML('beforeend', '<button class="opt go" id="nx">Continua ▶</button>'); $('nx').onclick = next; };
    const skipBtn = () => { body.insertAdjacentHTML('beforeend', '<button class="opt" id="sk">⏭ Ara no (salta)</button>'); $('sk').onclick = () => { put('salt'); saveRec(); next(); }; };
    if (it.kind === 'oral') {
      document.body.classList.toggle('nomodel', !it.withModel);
      body.innerHTML = `<h2>${esc(it.title || 'Explica-ho')}</h2><div class="q">${esc(it.ca)}</div>${zh('题目：' + it.zq)}<button class="opt go" id="said">🗣️ Ja ho he dit</button><div id="chk"></div>`;
      $('said').onclick = () => { $('said').remove(); const c = $('chk');
        c.innerHTML = `<div class="ans"><b>Compara-ho amb això:</b> ${esc(it.key)}</div>${zh(it.zkey)}${selfRow(SELF_SAY)}`;
        c.querySelectorAll('.self button').forEach(b => b.onclick = () => { put(b.dataset.v); c.querySelectorAll('.self button').forEach(x => x.disabled = true); nextBtn(); }); };
    } else {
      document.body.classList.remove('nomodel'); if (it.view) view(it.view);
      body.innerHTML = `<h2>${esc(it.title || '')}</h2><div id="tb"></div>`; const box = $('tb');
      box.addEventListener('done', nextBtn, { once: true });
      if (it.kind === 'loc') cleanupTap = tapTask(box, { q: `👆 Toca: ${CFG.names[it.key].ca} (sense noms)`, key: it.key, cue: CFG.names[it.key].aid, onResult: put });
      else if (it.kind === 'say') sayName(box, it.key, { onResult: put });
      else if (it.kind === 'spell') spell(box, it.key, { onResult: put });
      else if (it.kind === 'choice') ladderChoice(box, { ...it, onResult: put });
      else if (it.kind === 'custom') it.run(box, v => { put(v); saveRec(); });
    }
    skipBtn();
  };
  const finish = () => {
    round.finished = new Date().toISOString(); saveRec();
    body.innerHTML = `<h2>Revisió acabada 🎉</h2><table class="res">${items.map(it => `<tr><td>${esc(it.label)}</td>${cell(round.items[it.id])}</tr>`).join('')}</table>
      ${rest.length ? `<button class="opt" id="more">➕ Més pràctica (opcional, ${rest.length})</button>` : ''}<div class="row"><button class="opt" id="cp">📋 Copia el resultat</button></div>${zh('复习默认最多 8 题，薄弱项优先；其余为可选练习。')}`;
    $('cp').onclick = () => copyResult($('cp'));
    if (rest.length) $('more').onclick = () => { round.extra = true; items = items.concat(rest.splice(0)); go(); };
  };
  go();
}

// ---------------------------------------------------------------- navigation
let idx = 0, cleanupTap = null, S = [];
function render() {
  A.clearHighlights(); if (cleanupTap) { cleanupTap(); cleanupTap = null; }
  const s = S[idx]; rec.idx = idx; rec.stageTimes[s.id] = rec.stageTimes[s.id] || new Date().toISOString(); saveRec();
  $('Lbar').style.width = `${(idx + 1) / S.length * 100}%`; $('Lch').textContent = s.ph; $('Ldots').innerHTML = ''; $('Lstars').textContent = '';
  body.innerHTML = '<div id="st"></div>'; const el = $('st');
  s.render(el, ctx);
  $('Lback').disabled = idx === 0 || !!s.recall;     // no going back to the answers once recall/practice starts
  navExtras(true); body.scrollTop = 0;
}
// «Més tard»: the child may leave any step for later (F01, R10). Recorded as skipped; never counted as right.
// «Torna a mirar»: from a practice step, back to the closest teaching step; the answers given there afterwards count as
// «amb ajuda» (F10). Results and day-2 review list the skipped steps first.
const lookBackTo = () => { for (let j = idx - 1; j >= 0; j--) if (!S[j].recall) return j; return -1; };
function navExtras(on) {
  const s = S[idx], last = s && s.id === 'fi';
  $('Lskip').style.display = on && !last ? '' : 'none';
  $('Llook').style.display = on && !last && s && s.recall && lookBackTo() >= 0 ? '' : 'none';
}
setInterval(() => { if ($('Lskip').style.display !== 'none') $('Lskip').classList.toggle('dim', canNext); }, 400);
$('Lskip').onclick = () => { const s = S[idx]; if (!s || s.id === 'fi') return;
  if (!canNext) { rec.skip[s.id] = new Date().toISOString(); if (s.recKey) for (const k of s.keys || []) rec[s.recKey][k] = rec[s.recKey][k] || 'salt'; }
  saveRec(); if (idx < S.length - 1) { idx++; setNext(false, 'Continua ▶'); render(); } };
$('Llook').onclick = () => { const j = lookBackTo(); if (j < 0) return; rec.revisit[S[idx].id] = (rec.revisit[S[idx].id] || 0) + 1; saveRec(); idx = j; setNext(false, 'Continua ▶'); render(); };
// gentle time hints (R13): suggestions only, never a countdown and never a lock
const TMUL = +(QS.get('tmul') || 1); let tHint = [];
function timeHints() { tHint.forEach(clearTimeout); tHint = [
  setTimeout(() => toast('⏱️ Ja portes una estona. Si vols, pots parar: tot queda guardat i després continues on ho has deixat.'), 12 * 60000 / TMUL),
  setTimeout(() => toast('🌿 És un bon moment per descansar una mica. Quan vulguis, continua.'), 15 * 60000 / TMUL)]; }
function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = `${esc(t)} <button class="opt" id="tok">D’acord</button>`; document.body.appendChild(d); d.querySelector('button').onclick = () => d.remove(); setTimeout(() => d.remove(), 25000); }   // over the model, never over the answer buttons; fades after 25 s
// view buttons for children who do not use two-finger gestures (F09); 44 px targets; text size switch
let lastView = null;
function viewBtns() {
  if ($('Vbox')) return; const d = document.createElement('div'); d.id = 'Vbox';
  d.innerHTML = `<button id="Vrst" title="Torna a la vista">🎯</button><button id="Vturn" title="Gira i mira per darrere">🔄</button><button id="Vin" title="Apropa">＋</button><button id="Vout" title="Allunya">－</button><button id="Vtxt" title="Lletra més gran">A+</button>`;
  document.body.appendChild(d);
  const tgt = () => A.controls.target, cam = A.camera;
  const move = f => { const v = cam.position.clone().sub(tgt()); A.flyTo(tgt().clone(), v.multiplyScalar(f), 450); };
  $('Vrst').onclick = () => { if (lastView) view(lastView); };
  $('Vturn').onclick = () => { const v = cam.position.clone().sub(tgt()); v.applyAxisAngle(new T.Vector3(0, 1, 0), Math.PI); A.flyTo(tgt().clone(), v, 700); };
  $('Vin').onclick = () => move(.75); $('Vout').onclick = () => move(1.33);
  $('Vtxt').onclick = () => { document.body.classList.toggle('bigtext'); try { localStorage.setItem('cosHumaBigText', document.body.classList.contains('bigtext') ? '1' : ''); } catch (e) { } };
  try { if (localStorage.getItem('cosHumaBigText')) document.body.classList.add('bigtext'); } catch (e) { }
}
$('Lnext').onclick = () => { if (!canNext) return; if (idx < S.length - 1) { idx++; setNext(false, 'Continua ▶'); render(); } };
$('Lback').onclick = () => { if (idx > 0 && !S[idx].recall) { idx--; render(); } };
$('Lzh').onclick = () => { showZh = !showZh; $('Lzh').classList.toggle('on', showZh); body.querySelectorAll('.zh').forEach(z => z.style.display = showZh ? '' : 'none'); };
$('Lexit').onclick = () => { location.href = './index.html'; };
$('Lspeak').style.display = 'none';
function showApp() { document.body.classList.add('lessonMode'); L.style.display = ''; viewOffset(true); CFG.setup(ctx); viewBtns(); timeHints(); }

// ---------------------------------------------------------------- context handed to lesson configs
const ctx = { A, T, $, esc, wait, shuffle, parts, memo, curio, frame, view, fitDist, label, clearLabels, nameLabels, centerOf, book, ossi, zh, aid, setNext, feedback, hidden,
  showParts, CONTENT, choiceSeries, stepper, tapTask, ladderChoice, predict, recall, sayName, spell, sequence, evid, get rec() { return rec; }, saveRec, nameGroupStages, reviewStage, spellStage, resultsStage };
S = CFG.stages(ctx);

$('Ltitle').textContent = CFG.title; $('Lsub').textContent = CFG.subtitle;
// start page (F02): continue where you stopped, or start a new round (the old record is archived, never overwritten)
const saved = loadRec();
const begin = (resume) => { $('Lstart').style.display = 'none'; showApp();
  if (resume) { rec = saved; idx = Math.min(saved.idx || 0, S.length - 1); } else { archive(saved); rec = freshRec(); idx = 0; }
  saveRec(); setNext(false, 'Continua ▶'); render(); };
const days = iso => Math.floor((Date.now() - new Date(iso)) / 864e5);
if (saved && sameContent(saved) && !saved.finished && (saved.idx || 0) > 0) {
  $('Lbegin').textContent = `▶ Continua on ho has deixat (${(S[saved.idx] || {}).ph || ''})`; $('Lbegin').onclick = () => begin(true);
  $('Lnew').style.display = ''; $('Lnew').onclick = () => begin(false);
} else { $('Lbegin').onclick = () => begin(false); if (saved && saved.finished) $('Lbegin').textContent = '▶ Torna a fer la lliçó'; }
if (saved && !sameContent(saved)) $('Lold').style.display = '';
const fin = saved && sameContent(saved) && saved.finished;
$('Lday2').style.display = fin ? '' : 'none'; $('Lweek').style.display = fin ? '' : 'none';
if (fin) { const d = days(saved.finished);
  $('Lday2').textContent = `📋 Revisió curta${d >= 1 ? ' (suggerida: ja toca)' : ' (suggerida: demà)'}`;
  $('Lweek').textContent = `📋 Revisió de la setmana${d >= 6 ? ' (suggerida: ja toca)' : ' (suggerida: d’aquí a uns dies)'}`; }
$('Lday2').onclick = () => day2('dia'); $('Lweek').onclick = () => day2('setmana');
document.body.classList.add('lessonMode'); $('Lstart').style.display = ''; CFG.setup(ctx);

window.__curs = { answer: null, CFG, CONTENT, day2, get S() { return S; }, get idx() { return idx; }, get rec() { return rec; }, get canNext() { return canNext; }, next() { $('Lnext').click(); }, parts, hitAt, ctx };
