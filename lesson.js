// COS-HUMA · Medi U2 · "Ens movem" (pp. 22–29) — guided lesson mode (V1.4, test build).
// Structure: Ossi explains one idea at a time → the 3D model shows it → the child does something →
// at the end: summary, "repeat it yourself" cards and a final challenge.
// Text marked 📘 is the textbook sentence (photo-transcribed, kept verbatim); "📘 · resum" = several book lines joined. Anything that is not in
// the book is tagged "💡 Curiositat · no surt al llibre".

const whenReady = new Promise(r => window.__app ? r() : addEventListener('app-ready', r, { once: true }));
await whenReady;
const A = window.__app, T = A.THREE;
const $ = id => document.getElementById(id);
const camera = A.camera, canvas = A.renderer.domElement;

// ---------------------------------------------------------------- parts of the model used by the lesson
const P = {
  // bones (textbook p. 25 labels)
  crani: { ca: 'crani', re: /(frontal|parietal|occipital|temporal|sphenoid) bone$|ethmoid$/, g: 'bone' },
  cara: { ca: 'ossos de la cara', re: /maxilla|mandible|zygomatic bone|nasal bone|lacrimal bone|palatine bone|vomer|inferior nasal concha/, g: 'bone' },
  maxillar: { ca: 'maxil·lar', re: /maxilla|mandible/, g: 'bone' },
  omoplat: { ca: 'omòplat', re: /scapula/, g: 'bone' },
  costella: { ca: 'costelles', re: / rib$/, g: 'bone' },
  estern: { ca: 'estern', re: /body of sternum|manubrium|xiphoid/, g: 'bone' },
  vertebra: { ca: 'vèrtebres', re: /vertebra$|^atlas$|^axis$/, g: 'bone' },
  columna: { ca: 'columna vertebral', re: /vertebra$|^atlas$|^axis$|sacrum|coccyx|intervertebral disk/, g: 'bone' },
  pelvis: { ca: 'pelvis', re: /hip bone|sacrum/, g: 'bone' },
  humer: { ca: 'húmer', re: /humerus/, g: 'bone' },
  cubit: { ca: 'cúbit', re: /ulna$/, g: 'bone' },
  radi: { ca: 'radi', re: /radius$/, g: 'bone' },
  carp: { ca: 'carp', re: /scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/, g: 'bone' },
  metacarp: { ca: 'metacarp', re: /metacarpal/, g: 'bone' },
  falangesMa: { ca: 'falanges (mà)', re: /phalanx of (left|right) (thumb|index finger|middle finger|ring finger|little finger)/, g: 'bone' },
  femur: { ca: 'fèmur', re: /femur/, g: 'bone' },
  rotula: { ca: 'ròtula', re: /patella/, g: 'bone' },
  tibia: { ca: 'tíbia', re: /tibia$/, g: 'bone' },
  perone: { ca: 'peroné', re: /fibula/, g: 'bone' },
  tars: { ca: 'tars', re: /talus|calcaneus|navicular|cuboid|cuneiform/, g: 'bone' },
  metatars: { ca: 'metatars', re: /metatarsal/, g: 'bone' },
  falangesPeu: { ca: 'falanges (peu)', re: /phalanx of (left|right) .*toe/, g: 'bone' },
  coll: { ca: 'coll', re: /cervical vertebra$|^atlas$|^axis$/, g: 'bone' },
  genoll: { ca: 'genoll', re: /patella/, g: 'bone' },
  colze: { ca: 'colze', re: /humerus|ulna$|radius$/, g: 'bone' },
  ossosLlargs: { ca: 'ossos llargs', re: /humerus|ulna$|radius$|femur|tibia$|fibula/, g: 'bone' },
  // muscles (textbook p. 27 labels)
  orbParpelles: { ca: 'orbicular de les parpelles', re: /orbicularis oculi/, g: 'allMuscle' },
  orbBoca: { ca: 'orbicular de la boca', re: /orbicularis oris/, g: 'allMuscle' },
  masseter: { ca: 'masseter', re: /masseter/, g: 'allMuscle' },
  ecm: { ca: 'esternoclidomastoidal', re: /sternocleidomastoid/, g: 'allMuscle' },
  deltoide: { ca: 'deltoide', re: /deltoid/, g: 'allMuscle' },
  pectoral: { ca: 'pectoral', re: /pectoralis major/, g: 'allMuscle' },
  abdominal: { ca: 'abdominal', re: /rectus abdominis/, g: 'allMuscle' },
  biceps: { ca: 'bíceps', re: /biceps brachii/, g: 'muscle' },
  triceps: { ca: 'tríceps', re: /triceps brachii/, g: 'muscle' },
  quadriceps: { ca: 'quàdriceps', re: /rectus femoris|vastus (lateralis|medialis|intermedius)/, g: 'allMuscle' },
  tibial: { ca: 'tibial', re: /tibialis anterior/, g: 'allMuscle' },
  trapezi: { ca: 'trapezi', re: /trapezius/, g: 'allMuscle' },
  dorsal: { ca: 'dorsal', re: /latissimus dorsi/, g: 'allMuscle' },
  gluti: { ca: 'gluti', re: /gluteus maximus/, g: 'allMuscle' },
  bicepsFem: { ca: 'bíceps femoral', re: /biceps femoris/, g: 'allMuscle' },
  besso: { ca: 'bessó', re: /gastrocnemius/, g: 'allMuscle' },
  tendo: { ca: 'tendó', re: /calcaneal tendon/, g: 'allMuscle' },
  maMusc: { ca: 'músculs de la mà', re: /lumbricals of (left|right) hand|interossei of (left|right) hand|opponens pollicis|opponens digiti minimi of (left|right) hand|abductor pollicis brevis|flexor pollicis brevis|abductor digiti minimi of (left|right) hand|flexor digiti minimi brevis of (left|right) hand|adductor pollicis/, g: 'allMuscle' },
  plans: { ca: 'músculs plans', re: /pectoralis major|latissimus dorsi|external oblique|trapezius/, g: 'allMuscle' },
  llargs: { ca: 'músculs llargs', re: /rectus femoris|sartorius|gracilis|vastus (lateralis|medialis)/, g: 'allMuscle' },
  cara_m: { ca: 'músculs de la cara', re: /orbicularis|zygomaticus|frontalis|risorius|depressor|levator labii|mentalis|nasalis|procerus|corrugator/, g: 'allMuscle' },
  postura: { ca: 'músculs de l’esquena', re: /iliocostalis|longissimus|spinalis|multifidus|semispinalis|rotatores|latissimus dorsi|trapezius/, g: 'allMuscle' },
  respirar: { ca: 'músculs per respirar', re: /intercostal/, g: 'allMuscle' },
  bessoSoli: { ca: 'bessó i soli', re: /gastrocnemius|soleus/, g: 'allMuscle' },
  // nervous system
  cervell: { ca: 'cervell', re: /./, g: 'brain' },
  medulla: { ca: 'medul·la espinal', re: /./, g: 'spinal' },
  nervis: { ca: 'nervis', re: /./, g: 'nerves' },
  ull: { ca: 'ull', re: /./, g: 'eye' },
};
const cache = {};
const parts = k => cache[k] || (cache[k] = A.find(P[k].re, P[k].g));
const leftOnly = ms => { const l = ms.filter(m => /left|l\d{3}$/.test(A.norm(m.name))); return l.length ? l : ms; };

// ---------------------------------------------------------------- colours
const C = { green: 0x35c46a, blue: 0x3d8bfd, orange: 0xff9f1c, yellow: 0xffd23f, pink: 0xff5c8a, cyan: 0x2fd3ff, purple: 0xa77bff, red: 0xe63946 };
const css = c => '#' + c.toString(16).padStart(6, '0');

// ---------------------------------------------------------------- scene helpers
const loops = [];
function stopLoops() { for (const f of loops) { const i = A.tickers.indexOf(f); if (i >= 0) A.tickers.splice(i, 1); } loops.length = 0; }
function loop(fn) { loops.push(fn); A.tickers.push(fn); }
function layers(o) {
  const d = { bone: 1, muscle: 0, allMuscle: 0, brain: 0, spinal: 0, nerves: 0, eye: 0, ...o };
  for (const k in d) A.setLayer(k, !!d[k]);
}
function base(o = {}) {
  stopLoops(); A.stopSignal(); A.clearHighlights(); clearLabels(); A.controls.autoRotate = false;
  for (const s of ['Left', 'Right']) A.setElbow(s, A.elbows[s].restFlex);
  A.setBoneOpacity(100); A.mats.allMuscle.opacity = 1;
  layers(o);
}
const hl = (k, c = C.cyan) => A.highlight(Array.isArray(k) ? k.flatMap(parts) : parts(k), c);
function look(keys, dir = [0, .15, 1], pad = 1.25) { const ms = (Array.isArray(keys) ? keys : [keys]).flatMap(parts); const b = A.boxOf(ms), c = b.getCenter(new T.Vector3()), sz = b.getSize(new T.Vector3()); A.flyTo(c, new T.Vector3(...dir).normalize().multiplyScalar(fitDist(sz.y / 2 * pad, Math.max(sz.x, sz.z) / 2 * pad))); }
// frame a point with a given half-height (m) from a direction
const frame = (x, y, z, h, dir = [0, .1, 1]) => A.flyTo(new T.Vector3(x, y, z), new T.Vector3(...dir).normalize().multiplyScalar(fitDist(h)));
// distance that fits a half-height h (m) in the part of the screen not covered by the lesson card
function fitDist(h, w = h * .55) { const v = camera.view && camera.view.enabled ? camera.view : null; const tf = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
  const visH = v ? (v.fullHeight > v.height ? v.height - v.offsetY : v.height) : innerHeight, visW = v ? (v.fullWidth > v.width ? v.width - v.offsetX : v.width) : innerWidth, fullH = v ? v.fullHeight : innerHeight;
  const tv = tf * visH / fullH, th = tv * visW / visH; return Math.max(h / tv, w / th) * 1.1; }
const BODY = () => A.flyTo(new T.Vector3(0, .9, 0), new T.Vector3(0, .12, fitDist(.95, .55)));
const ELBOW = () => { const e = A.elbows.Left, sx = Math.sign(e.center.x) || 1; A.flyTo(e.center.clone().add(new T.Vector3(0, -.02, .06)), new T.Vector3(sx, .12, .45).normalize().multiplyScalar(fitDist(.3, .3))); };
const BODY_BACK = () => A.flyTo(new T.Vector3(0, .9, 0), new T.Vector3(0, .12, -fitDist(.95, .55)));
function spin(speed = 1.2) { A.controls.autoRotate = true; A.controls.autoRotateSpeed = speed; }
function swingElbow(sideName = 'Left', period = 3200, max = 100) {
  const e = A.elbows[sideName], t0 = performance.now();
  loop(now => { const u = .5 - .5 * Math.cos((now - t0) / period * Math.PI * 2); A.setElbow(sideName, e.restFlex + (max - e.restFlex) * u); });
}
function cycle(phases, ms = 1800) {   // phases: functions run in turn (e.g. highlight a different group each time)
  let i = -1, t = 0;
  loop(now => { if (now - t > ms) { t = now; i = (i + 1) % phases.length; phases[i](); } });
}

// ---------------------------------------------------------------- 3D labels
const labelBox = $('labels'); const labelList = [];
function label(key, text, color) {
  const ms = leftOnly(parts(key)); if (!ms.length) return;
  const el = document.createElement('div'); el.className = 'lbl'; el.textContent = text || P[key].ca;
  if (color) el.style.borderColor = css(color);
  labelBox.appendChild(el); labelList.push({ el, ms, key });
}
function labels(keys, color) { for (const k of keys) label(k, null, color); }
function clearLabels() { labelBox.innerHTML = ''; labelList.length = 0; }
const tmp = new T.Vector3();
A.tickers.push(() => {
  if (!labelList.length) return;
  const r = canvas.getBoundingClientRect(); const pos = [];
  for (const L of labelList) {
    if (!L.box || L.dyn) { L.box = A.boxOf(L.ms); L.dyn = /biceps|triceps/.test(L.key); }
    L.box.getCenter(tmp); tmp.project(camera);
    const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
    L.el.style.display = vis ? '' : 'none';
    if (vis) pos.push({ L, x: (tmp.x + 1) / 2 * r.width, y: (1 - tmp.y) / 2 * r.height, w: L.el.offsetWidth || 60 });
  }
  // keep labels from covering each other: push overlapping ones down
  pos.sort((a, b) => a.y - b.y);
  for (let i = 0; i < pos.length; i++) for (let j = 0; j < i; j++) {
    const a = pos[j], b = pos[i];
    if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 2 && Math.abs(a.y - b.y) < 21) b.y = a.y + 21;
  }
  for (const p of pos) p.L.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;
});

// ---------------------------------------------------------------- lesson content
// Each step: ch (chapter), t (title), say (Ossi), book [{p, tx}] verbatim, fun (curiosity, not in book),
// zh (Chinese gloss for parents), scene(), task.
const CH = ['Com ens movem?', 'L’esquelet', 'Els músculs', 'El sistema nerviós', 'Voluntari o reflex?', 'Repassem!'];
const S = [
  // ------------------------------------------------ 0 · intro
  { ch: 0, t: 'Hola! Sóc l’Ossi 🦴',
    say: 'Córrer, saltar, ballar, escriure… i fins i tot somriure! Avui descobrirem com ho fa el nostre cos per moure’s. Gira el model amb el dit i fes zoom amb dos dits.',
    zh: '今天学：身体是怎么动起来的。可以用手指转动模型、两指缩放。',
    scene() { base({ allMuscle: 1 }); BODY(); spin(1.4); },
    task: { type: 'choice', q: 'Recordem (p. 23): quins òrgans del nostre cos ens serveixen per moure’ns?', zh: '复习：哪些器官帮助我们运动？',
      opts: ['Els ossos i els músculs', 'Només el cor', 'Els cabells'], a: 0,
      ok: 'Exacte! I el sistema nerviós els dona les ordres.', no: { 2: 'Els cabells no et fan córrer… de moment! 😄' } } },
  { ch: 0, t: 'L’equip del moviment',
    say: 'Tres equips treballen junts: els ossos 🦴 fan l’estructura, els músculs 💪 estiren els ossos i el sistema nerviós 🧠 dona les ordres.',
    zh: '三支队伍合作：骨骼是支架，肌肉拉动骨骼，神经系统下命令。',
    scene() {
      base({ allMuscle: 0, brain: 1, spinal: 1, nerves: 1 }); BODY(); spin(.8);
      cycle([() => { A.clearHighlights(); hl(['crani', 'columna', 'costella', 'femur', 'humer'], C.yellow); },
             () => { A.clearHighlights(); hl(['biceps', 'triceps', 'quadriceps', 'pectoral', 'deltoide'], C.red); },
             () => { A.clearHighlights(); hl(['cervell', 'medulla', 'nervis'], C.cyan); }], 1700);
    } },

  // ------------------------------------------------ 1 · skeleton (pp. 24–25)
  { ch: 1, t: 'L’aparell locomotor',
    book: [{ p: 24, tx: 'L’aparell locomotor permet el moviment del nostre cos. Està format pel sistema esquelètic i el sistema muscular.' }],
    say: 'Truc per recordar-ho: aparell locomotor = ossos 🦴 + músculs 💪.',
    zh: '运动系统 = 骨骼系统 + 肌肉系统。',
    scene() { base(); BODY(); spin(.9); let on = false; cycle([() => { on = !on; A.setLayer('allMuscle', on); }], 1600); },
    task: { type: 'choice', q: 'De què està format l’aparell locomotor?', opts: ['Del sistema esquelètic i el sistema muscular', 'Del cervell i els nervis', 'Del cor i els pulmons'], a: 0, ok: 'Molt bé! Ossos + músculs.' } },
  { ch: 1, t: 'El sistema esquelètic',
    book: [{ p: 24, tx: 'El sistema esquelètic el formen els ossos, que componen l’esquelet.' }, { p: 25, tx: 'L’esquelet té més de 200 ossos.', r: 1 }],
    say: 'Més de 200 ossos! Si els posessis en fila… millor no ho provis 😅.',
    zh: '骨骼系统由骨头组成，人体有 200 多块骨头。',
    scene() { base(); BODY(); spin(1.2); },
    task: { type: 'choice', q: 'Quants ossos té l’esquelet?', opts: ['Uns 20', 'Més de 200', 'Més de 2.000'], a: 1, ok: 'Més de 200! 🦴' } },
  { ch: 1, t: 'Per a què serveix l’esquelet?',
    book: [{ p: 24, tx: 'L’esquelet intervé en el moviment del cos, dona forma i suporta el pes del cos i protegeix dels cops els òrgans interns.', r: 1 }],
    say: 'Sense esquelet seríem com un flam: tremolaríem i no ens podríem aguantar drets! 🍮 Mira les tres feines: 1 moure’s, 2 aguantar el pes, 3 protegir.',
    zh: '骨骼三大作用：参与运动、塑造身形并支撑体重、保护内脏免受撞击。',
    scene() {
      base({ brain: 1 }); BODY();
      const chip = (n) => { $('Lchip').innerHTML = ['① intervé en el moviment', '② dona forma i suporta el pes', '③ protegeix els òrgans interns'].map((t, i) => `<span class="${i === n ? 'on' : ''}">${t}</span>`).join(''); };
      swingElbow('Left', 2600, 95);
      cycle([() => { A.clearHighlights(); hl(['humer', 'cubit', 'radi'], C.green); chip(0); },
             () => { A.clearHighlights(); hl(['columna', 'pelvis', 'femur', 'tibia'], C.orange); chip(1); },
             () => { A.clearHighlights(); hl(['crani'], C.blue); hl(['costella'], C.blue); chip(2); }], 2200);
    },
    chips: true,
    task: { type: 'tap', q: '👆 Toca l’os que protegeix el cervell.', target: 'crani', ok: 'Sí! El crani és el casc 🪖 del cervell.' } },
  { ch: 1, t: 'Els ossos són vius!',
    book: [{ p: 24, tx: 'Els ossos són òrgans rígids i resistents.' }, { p: 24, tx: 'Els ossos són òrgans vius que creixen i necessiten nutrients.' }],
    say: 'Els ossos no són pedres: són vius i creixen amb tu. Per això cada any ets més alt o alta! 📏',
    zh: '骨头坚硬结实，而且是活的：会生长，需要营养。',
    scene() { base(); look(['femur'], [.6, .2, 1], 1.35); hl('femur', C.green); labels(['femur']); },
    task: { type: 'choice', q: 'Com són els ossos?', opts: ['Rígids, resistents i vius: creixen i necessiten nutrients', 'Tous com la gelatina', 'Pedres que no canvien mai'], a: 0, ok: 'Correcte!' } },
  { ch: 1, t: 'Tres tipus d’ossos',
    book: [{ p: 24, tx: 'Ossos llargs, com els de les extremitats.' }, { p: 24, tx: 'Ossos curts, com les vèrtebres que formen la columna vertebral.' }, { p: 24, tx: 'Ossos plans, com els que formen el crani.' }],
    say: 'Recorda: llarg com un pal 📏, curt com un dau 🎲, pla com una galeta 🍪.',
    zh: '骨头三类：长骨（四肢）、短骨（椎骨）、扁骨（颅骨）。',
    scene() {
      base(); BODY(); hl('ossosLlargs', C.green); hl('vertebra', C.blue); hl('crani', C.orange);
      label('femur', 'llarg', C.green); label('humer', 'llarg', C.green); label('vertebra', 'curts', C.blue); label('crani', 'pla', C.orange);
    },
    legend: [[C.green, 'llargs'], [C.blue, 'curts'], [C.orange, 'plans']],
    task: { type: 'classify', q: 'Classifica cada os (activitat p. 25):', cats: ['llarg', 'curt', 'pla'],
      items: [{ k: 'radi', c: 0 }, { k: 'tibia', c: 0 }, { k: 'vertebra', c: 1, n: 'vèrtebra' }, { k: 'crani', c: 2 }, { k: 'femur', c: 0 }] } },
  { ch: 1, t: 'Ossos del cap',
    book: [{ p: 25, tx: 'Hi tenim els ossos del crani i els de la cara. Els ossos del crani són plans i tenen la funció de protegir el cervell.' }],
    say: 'El crani és com un casc de fàbrica: ja el portes posat des que neixes! 🪖',
    zh: '头部：颅骨和面部骨。颅骨是扁骨，保护大脑。',
    scene() { base({ brain: 1 }); frame(0, 1.6, 0, .17, [.45, .05, .95]); A.setBoneOpacity(60); hl('crani', C.orange); hl('cara', C.yellow); label('crani', 'crani'); label('maxillar', 'maxil·lar'); },
    task: { type: 'choice', q: 'Quina feina fan els ossos del crani?', opts: ['Protegir el cervell', 'Ajudar a mastegar', 'Fer moure els ulls'], a: 0, ok: 'Molt bé! Són plans i protegeixen el cervell.' } },
  { ch: 1, t: 'Ossos del tronc',
    book: [{ p: 25, tx: 'Hi tenim la columna vertebral, que està formada per les vèrtebres i protegeix la medul·la espinal. La columna vertebral, les costelles i l’estern protegeixen el cor i els pulmons.' },
      { p: 25, tx: 'Les costelles s’uneixen a la columna vertebral i a l’estern.', r: 1 }],
    say: 'Les costelles fan una gàbia… però és una gàbia bona: protegeix el cor i els pulmons! ❤️',
    zh: '躯干：脊柱由椎骨组成，保护脊髓；脊柱、肋骨和胸骨保护心和肺。',
    scene() {
      base({ spinal: 1 }); frame(0, 1.2, 0, .42, [.6, .1, 1]);
      hl('columna', C.blue); hl('costella', C.orange); hl('estern', C.green);
      labels(['columna', 'costella', 'estern', 'omoplat', 'pelvis']);
    },
    legend: [[C.blue, 'columna vertebral'], [C.orange, 'costelles'], [C.green, 'estern']],
    task: { type: 'tap', q: '👆 Toca l’estern (l’os del mig del pit).', target: 'estern', ok: 'Perfecte! Les costelles s’hi uneixen.' } },
  { ch: 1, t: 'Ossos de les extremitats',
    book: [{ p: 25, tx: 'Hi tenim ossos llargs, com l’húmer i el fèmur. A les mans i als peus tenim molts ossos petits, les falanges.' }],
    say: 'Mira els noms dels ossos dels braços i les cames. Després jugarem a trobar-los! 🔎',
    fun: 'El fèmur és l’os més llarg del cos.',
    zh: '四肢：有长骨，比如肱骨和股骨；手脚有很多小骨头——指（趾）骨。',
    scene() {
      base(); BODY();
      labels(['humer', 'cubit', 'radi', 'carp', 'metacarp', 'falangesMa', 'femur', 'rotula', 'tibia', 'perone', 'tars', 'metatars', 'falangesPeu']);
    },
    task: { type: 'find', q: 'Joc: troba l’os!', pool: ['humer', 'femur', 'rotula', 'tibia', 'radi', 'falangesMa', 'costella', 'crani', 'pelvis'], n: 3 } },
  { ch: 1, t: 'Les articulacions',
    book: [{ p: 24, tx: 'Els ossos de l’esquelet s’uneixen entre si mitjançant les articulacions.' },
      { p: 24, tx: 'Articulacions immòbils: com les del crani, els ossos estan tan units que semblen només un.' },
      { p: 24, tx: 'Articulacions mòbils: els ossos es poden moure, com passa al colze, al coll o al genoll.' },
      { p: 24, tx: 'En les articulacions mòbils, els ossos estan units mitjançant els lligaments.' }],
    say: 'Prova-ho: mou el colze, el coll i el genoll. Ara intenta moure el crani… impossible! És un trencaclosques ben enganxat 🧩.',
    zh: '关节把骨头连在一起。不动关节：颅骨；可动关节：肘、颈、膝，由韧带连接。',
    note: 'El model no mostra els lligaments.',
    scene() {
      base(); BODY(); swingElbow('Left', 2600, 110);
      hl('coll', C.green); hl('rotula', C.green); hl('crani', C.red);
      label('crani', 'immòbil', C.red); label('coll', 'mòbil', C.green); label('rotula', 'mòbil (genoll)', C.green);
    },
    legend: [[C.green, 'articulacions mòbils'], [C.red, 'articulacions immòbils']],
    task: { type: 'classify', q: 'Mòbil o immòbil?', cats: ['mòbil', 'immòbil'],
      items: [{ k: 'crani', c: 1, n: 'les articulacions del crani' }, { k: 'colze', c: 0, n: 'el colze' }, { k: 'genoll', c: 0, n: 'el genoll' }, { k: 'coll', c: 0, n: 'el coll' }] } },

  // ------------------------------------------------ 2 · muscles (pp. 26–27)
  { ch: 2, t: 'Vestim l’esquelet: els músculs!',
    book: [{ p: 26, tx: 'El sistema muscular inclou els músculs i els tendons del cos.' }, { p: 27, tx: 'Tenim més de 600 músculs esquelètics.', r: 1 }],
    say: 'Ara posem la roba “de carn” a l’esquelet 👕. Més de 600 músculs! Fins i tot per somriure en fas servir uns quants.',
    zh: '肌肉系统包括肌肉和肌腱。我们有 600 多块骨骼肌。',
    scene() { base({ allMuscle: 1 }); BODY(); spin(1.1); const m = A.mats.allMuscle, t0 = performance.now(); m.opacity = 0; loop(now => { m.opacity = Math.min(1, (now - t0) / 1600); }); },
    task: { type: 'choice', q: 'Quants músculs esquelètics tenim?', opts: ['Només 6', 'Uns 60', 'Més de 600'], a: 2, ok: 'Més de 600! 💪' } },
  { ch: 2, t: 'Per a què serveixen els músculs?',
    book: [{ p: 26, tx: 'El sistema muscular produeix els moviments necessaris per fer les funcions vitals, manté la posició i permet la mímica, que és el conjunt de gestos corporals que serveixen per expressar els sentiments.', r: 1 }],
    say: 'Fes una cara de sorpresa 😮. I ara una de contenta 😁. Ho has fet amb músculs: això és la mímica!',
    zh: '肌肉作用：完成维持生命所需的运动（如呼吸、咀嚼）、保持姿势、做表情（面部表情表达情感）。',
    scene() {
      base({ allMuscle: 1 }); frame(0, 1.32, 0, .45, [.4, .05, 1]);
      const chip = n => { $('Lchip').innerHTML = ['① funcions vitals (respirar, mastegar)', '② mantenir la posició', '③ la mímica'].map((t, i) => `<span class="${i === n ? 'on' : ''}">${t}</span>`).join(''); };
      cycle([() => { A.clearHighlights(); hl(['respirar', 'masseter'], C.green); chip(0); },
             () => { A.clearHighlights(); hl(['postura', 'abdominal'], C.blue); chip(1); },
             () => { A.clearHighlights(); hl('cara_m', C.pink); chip(2); }], 2300);
    },
    chips: true,
    task: { type: 'choice', q: 'Què és la mímica?', opts: ['Els gestos del cos per expressar els sentiments', 'Un os de la cara', 'Un nervi'], a: 0, ok: 'Sí! Com quan arrufes el nas 😝.' } },
  { ch: 2, t: 'Músculs elàstics',
    book: [{ p: 26, tx: 'Els músculs són òrgans elàstics que es poden encongir i estirar sense trencar-se.' }, { p: 26, tx: 'Els músculs que formen part de l’aparell locomotor reben el nom de músculs esquelètics.' }],
    say: 'Un múscul s’assembla a una goma elàstica: s’encongeix i s’estira, però no es trenca. Quan s’encongeix diem que està contret; quan descansa, relaxat.',
    zh: '肌肉有弹性，可以收缩和伸长而不断裂。收缩=contret，放松=relaxat。',
    scene() { base({ muscle: 1 }); A.setSide('Left'); ELBOW(); swingElbow('Left', 3000, 100); labels(['biceps', 'triceps']); },
    task: { type: 'choice', q: 'Quan un múscul s’encongeix, està…', opts: ['contret', 'relaxat'], a: 0, ok: 'Correcte: contret!' } },
  { ch: 2, t: 'Els tendons',
    book: [{ p: 26, tx: 'Molts músculs s’uneixen als ossos mitjançant els tendons, cordons de teixit molt resistent.' }],
    say: 'Els tendons són les cordes que lliguen els músculs als ossos. Toca’t el darrere del turmell: hi notes un cordó dur? És un tendó!',
    fun: 'Aquest tendó del turmell es diu tendó d’Aquil·les.',
    zh: '肌腱：把肌肉连到骨头上的坚韧“绳子”。脚踝后面那根就是（跟腱）。',
    scene() { base(); frame(.1, .3, 0, .3, [.5, .1, -1]); hl('bessoSoli', C.red); hl('tendo', C.yellow); label('tendo', 'tendó'); label('besso', 'múscul (bessó)'); },
    task: { type: 'tap', q: '👆 Toca el tendó (el cordó groc).', target: 'tendo', ok: 'Molt bé! Uneix el múscul a l’os del taló.' } },
  { ch: 2, t: 'Quatre formes de músculs',
    book: [{ p: 26, tx: 'Músculs llargs, amb els extrems més fins i la part del mig més ampla.' }, { p: 26, tx: 'Músculs curts, com els de les mans o els peus.' },
      { p: 26, tx: 'Músculs anulars, amb forma d’anell; envolten obertures com els ulls o la boca.' }, { p: 26, tx: 'Músculs plans, amb forma de làmina, com els que es troben al tronc.' }],
    say: 'Llargs com un fus, curts com un botó, anulars com un anell 💍 i plans com un llençol.',
    zh: '肌肉四种形状：长肌（两头细中间粗）、短肌（手脚）、环形肌（眼、嘴周围）、扁肌（躯干）。',
    scene() { base({ allMuscle: 1 }); BODY(); hl(['biceps', 'llargs'], C.green); hl('maMusc', C.blue); hl(['orbParpelles', 'orbBoca'], C.yellow); hl('plans', C.orange); },
    legend: [[C.green, 'llargs'], [C.blue, 'curts'], [C.yellow, 'anulars'], [C.orange, 'plans']],
    task: { type: 'classify', q: 'De quin tipus és?', cats: ['llarg', 'curt', 'anular', 'pla'],
      items: [{ k: 'orbParpelles', c: 2 }, { k: 'biceps', c: 0 }, { k: 'pectoral', c: 3 }, { k: 'maMusc', c: 1 }] } },
  { ch: 2, t: 'Els músculs del cos',
    book: [{ p: 27, tx: 'Cap: hi ha músculs plans i anulars. Els utilitzem per parlar, mastegar i gesticular.', r: 1 },
      { p: 27, tx: 'Tronc: té músculs grans i plans. Mantenen dreta la columna vertebral i la flexionen, protegeixen els òrgans de l’abdomen i ens ajuden a respirar.', r: 1 },
      { p: 27, tx: 'Extremitats: molts dels seus músculs són llargs. Mouen els braços, les cames, les mans i els peus.', r: 1 }],
    say: 'Gira el model per veure els músculs de davant i de darrere. Després… a trobar-los! 🔎',
    zh: '头部：扁肌和环形肌（说话、咀嚼、做表情）；躯干：大而扁（挺直脊柱、保护腹部、帮助呼吸）；四肢：多为长肌。',
    scene() {
      base({ allMuscle: 1 }); BODY();
      // one zone at a time (as on p. 27), front and back, 3–4 labels per view so they stay readable
      const Z = [['Cap', 1, ['orbParpelles', 'masseter'], C.yellow], ['Tronc', 1, ['ecm', 'deltoide', 'pectoral', 'abdominal'], C.orange], ['Tronc', -1, ['trapezi', 'dorsal', 'gluti'], C.orange],
        ['Extremitats', 1, ['biceps', 'quadriceps', 'tibial'], C.green], ['Extremitats', -1, ['triceps', 'bicepsFem', 'besso'], C.green]];
      cycle(Z.map(([zone, f, ks, col]) => () => {
        A.clearHighlights(); clearLabels(); hl(ks, col); labels(ks, col);
        if (zone === 'Cap') frame(0, 1.6, 0, .17, [0, .05, 1]); else (f > 0 ? BODY : BODY_BACK)();
        $('Lchip').innerHTML = ['Cap', 'Tronc', 'Extremitats'].map(z => `<span class="${z === zone ? 'on' : ''}">${z}${z === zone ? (f > 0 ? ' · davant' : ' · darrere') : ''}</span>`).join('');
      }), 3200);
    },
    chips: true,
    task: { type: 'find', q: 'Joc: troba el múscul!', pool: ['deltoide', 'pectoral', 'abdominal', 'quadriceps', 'gluti', 'besso', 'trapezi', 'biceps'], n: 3, layers: { allMuscle: 1 } } },
  { ch: 2, t: 'Bíceps i tríceps',
    book: [{ p: 27, tx: 'Quan dobleguem el braç, el tríceps es relaxa. El bíceps es contreu.' }, { p: 27, tx: 'Quan estirem el braç, el tríceps es contreu. El bíceps es relaxa.' },
      { p: 27, tx: 'L’articulació que es doblega és el colze. El múscul contret és més gruixut.', r: 1 }],
    say: 'Cançoneta: «Si el braç vull doblegar, el bíceps s’ha d’inflar! 💪 Si el braç vull estirar, el tríceps ha de treballar!» Posa’t la mà sobre el braç i prova-ho tu també.',
    zh: '弯曲手臂：肱二头肌收缩、肱三头肌放松；伸直手臂：反过来。弯曲的关节是肘。收缩的肌肉更粗。',
    note: 'El gruix dels músculs és un esquema per veure qui es contreu.',
    scene() { base({ muscle: 1 }); A.setSide('Left'); ELBOW(); labels(['biceps', 'triceps']); },
    task: { type: 'slider', q: 'Mou el colze amb la barra:' } },
  { ch: 2, t: 'Treballen en parella',
    book: [{ p: 28, tx: 'Quan fem un moviment, uns músculs es contreuen mentre que uns altres es relaxen, i així mouen els ossos.' }],
    say: 'Quan camines, els músculs de les cames es van passant la feina: un es contreu, l’altre es relaxa. Com dos amics estirant una corda per torns 🪢.',
    fun: 'Un múscul només fa força quan es contreu: pot tibar, però no pot empènyer. Per això treballen en parella.',
    zh: '运动时一些肌肉收缩，另一些放松，从而拉动骨头。肌肉只能“拉”不能“推”，所以成对工作。',
    scene() { base({ muscle: 1 }); A.setSide('Left'); ELBOW(); swingElbow('Left', 2400, 110); labels(['biceps', 'triceps']); },
    task: { type: 'choice', q: 'Quan el bíceps es contreu, el tríceps…', opts: ['també es contreu', 'es relaxa', 'desapareix'], a: 1, ok: 'Exacte! Treballen per torns.', no: { 2: 'Ha ha, els músculs no fan màgia! 🎩' } } },

  // ------------------------------------------------ 3 · relation & nervous system (p. 28)
  { ch: 3, t: 'La funció de relació',
    book: [{ p: 28, tx: 'La funció de relació ens permet percebre el que passa al nostre voltant i reaccionar-hi de manera adequada.' }, { p: 28, tx: 'Òrgans dels sentits → Sistema nerviós → Aparell locomotor' }],
    say: 'Tres paraules màgiques: sento 👀 → penso 🧠 → em moc 💪.',
    zh: '关系功能：感知周围发生的事并作出恰当反应。感官 → 神经系统 → 运动系统。',
    scene() {
      base({ eye: 1, brain: 1, spinal: 1, nerves: 1, muscle: 1 }); frame(.1, 1.3, 0, .5, [.35, .05, 1]); A.setBoneOpacity(40);
      cycle([() => { A.clearHighlights(); hl('ull', C.cyan); }, () => { A.clearHighlights(); hl(['cervell', 'medulla', 'nervis'], C.yellow); },
             () => { A.clearHighlights(); hl(['biceps', 'humer', 'cubit', 'radi'], C.red); }], 1500);
      swingElbow('Left', 4500, 90);
    },
    task: { type: 'order', q: 'Posa-ho en ordre (toca en ordre):', items: ['Òrgans dels sentits', 'Sistema nerviós', 'Aparell locomotor'] } },
  { ch: 3, t: 'El sistema nerviós',
    book: [{ p: 28, tx: 'El sistema nerviós està format per: cervell, nervis, medul·la espinal.' }],
    say: 'El cervell és el cap de colla 🧠, la medul·la espinal és l’autopista principal 🛣️ i els nervis són els carrers que arriben a tot arreu.',
    zh: '神经系统由大脑、神经、脊髓组成。大脑像总指挥，脊髓像高速公路，神经像通往各处的小路。',
    scene() { base({ brain: 1, spinal: 1, nerves: 1 }); BODY(); A.setBoneOpacity(25); spin(.8); hl('cervell', C.pink); hl('medulla', C.yellow); label('cervell', 'cervell'); label('medulla', 'medul·la espinal'); label('nervis', 'nervis'); },
    task: { type: 'tap', q: '👆 Toca la medul·la espinal.', target: 'medulla', ok: 'Molt bé! És l’autopista dels missatges.', stopSpin: true } },
  { ch: 3, t: 'El cervell',
    book: [{ p: 28, tx: 'És al cap i està protegit pel crani. Dirigeix el funcionament del cos i els seus moviments; ens permet pensar i recordar.' }],
    say: 'El cervell és el director de l’orquestra del teu cos 🎼. Pensa, recorda i dona les ordres.',
    zh: '大脑：在头部，受颅骨保护；指挥身体运作和运动；让我们思考和记忆。',
    scene() { base({ brain: 1, eye: 1 }); frame(0, 1.6, 0, .16, [.55, .1, .9]); A.setBoneOpacity(35); hl('cervell', C.pink); label('cervell'); },
    task: { type: 'choice', q: 'Què ens permet fer el cervell?', opts: ['Pensar i recordar', 'Fer créixer les ungles', 'Bombar la sang'], a: 0, ok: 'Sí! I dirigeix els moviments.' } },
  { ch: 3, t: 'La medul·la espinal',
    book: [{ p: 28, tx: 'És a l’esquena, protegida per la columna vertebral. Juntament amb el cervell dirigeix alguns moviments del cos i part del seu funcionament.' }],
    say: 'La medul·la viatja dins de la columna vertebral, com un cable dins d’un tub protector 🔌.',
    zh: '脊髓：在背部，受脊柱保护；和大脑一起指挥部分动作和身体功能。',
    scene() { base({ spinal: 1, brain: 1 }); BODY_BACK(); A.setBoneOpacity(30); hl('medulla', C.yellow); hl('columna', C.blue); label('medulla'); },
    task: { type: 'choice', q: 'Què protegeix la medul·la espinal?', opts: ['El crani', 'La columna vertebral', 'Les costelles'], a: 1, ok: 'Correcte: la columna vertebral!' } },
  { ch: 3, t: 'Els nervis',
    book: [{ p: 28, tx: 'Porten informació dels òrgans dels sentits al cervell i transmeten les ordres des del cervell fins a l’aparell locomotor. N’hi ha per tot el cos.' }],
    say: 'Els nervis són com els cables del telèfon: porten missatges d’anada i tornada 📞.',
    zh: '神经：把感官的信息传给大脑，再把大脑的命令传到运动系统。全身都有。',
    scene() { base({ nerves: 1, spinal: 1, brain: 1 }); BODY(); A.setBoneOpacity(30); hl('nervis', C.yellow); spin(1); },
    task: { type: 'choice', q: 'Què fan els nervis?', opts: ['Porten informació i ordres', 'Fan créixer els ossos', 'Mouen la sang'], a: 0, ok: 'Exacte! Missatges d’anada i tornada.' } },

  // ------------------------------------------------ 4 · voluntary and reflex (p. 29)
  { ch: 4, t: 'Moviments voluntaris',
    book: [{ p: 29, tx: 'Molts dels moviments els fem voluntàriament i de manera conscient. Són moviments voluntaris.' }],
    say: 'Abans de mirar-ho: endevina qui mana! 🤔',
    zh: '自主运动：有意识、自己决定的动作。',
    scene() { base({ brain: 1, spinal: 1, nerves: 1, eye: 1 }); A.setBoneOpacity(55); A.setSide('Left'); frame(.1, 1.22, 0, .55, [.5, .05, 1]); },
    task: { type: 'predict', q: 'Veus el semàfor verd i decideixes doblegar el braç. Qui pren la decisió?', opts: ['El cervell', 'La medul·la espinal', 'El genoll'], a: 0, play: 'voluntary', ok: 'Sí! Ara mira el camí del missatge ▶' } },
  { ch: 4, t: 'Moviments reflexos',
    book: [{ p: 29, tx: 'Hi ha moviments que fem de manera involuntària i ràpida; en molts no intervé el cervell, sinó la medul·la espinal.', r: 1 }],
    say: 'Primer la mà fuig… i després el cervell diu: «Ai, que crema!» 🔥',
    zh: '反射：不由自主、非常快；很多反射不经过大脑，而是由脊髓指挥。',
    scene() { base({ brain: 1, spinal: 1, nerves: 1, eye: 1 }); A.setBoneOpacity(55); A.setSide('Left'); frame(.1, 1.15, 0, .62, [.5, .05, 1]); },
    task: { type: 'predict', q: 'Toques una tassa molt calenta. Qui envia l’ordre de retirar la mà?', opts: ['El cervell, després de pensar-hi', 'La medul·la espinal', 'L’orella'], a: 1, play: 'reflex', ok: 'Molt bé! Ara mira que ràpid ▶' } },
  { ch: 4, t: 'Voluntari o reflex?',
    say: 'Pensa: l’he decidit jo (voluntari) o ha passat sol i molt ràpid (reflex)?',
    zh: '判断：是自己决定的（自主），还是自动、很快发生的（反射）？',
    scene() { base({ brain: 1, spinal: 1, nerves: 1 }); A.setBoneOpacity(55); BODY(); spin(.6); },
    task: { type: 'classify', q: 'Classifica els moviments:', cats: ['voluntari', 'reflex'],
      items: [{ n: 'Xutar una pilota ⚽', c: 0 }, { n: 'Retirar la mà d’una tassa calenta ☕', c: 1 }, { n: 'Escriure el teu nom ✏️', c: 0 },
        { n: 'Tancar els ulls de cop quan una pilota s’hi acosta', c: 1 }, { n: 'Saludar un amic 👋', c: 0 }] } },

  // ------------------------------------------------ 5 · summary, repeat, challenge
  { ch: 5, t: 'Resum: el que has après',
    say: 'Mira el mapa de tot el que hem vist. Llegeix-lo en veu alta!',
    zh: '总结：大声读一遍知识地图。',
    summary: true,
    scene() { base({ brain: 1, spinal: 1, nerves: 1, eye: 1 }); BODY(); spin(1); } },
  { ch: 5, t: 'Ara explica-ho tu!',
    say: 'Respon en veu alta i després gira la targeta. Sigues sincer/a: si no ho sabies, la targeta tornarà al final.',
    zh: '孩子先大声说答案，再翻卡。不会的卡片会在最后再出现。',
    scene() { base({ allMuscle: 1 }); BODY(); spin(.6); },
    task: { type: 'cards', cards: [
      ['De què està format l’aparell locomotor?', 'Del sistema esquelètic (ossos) i del sistema muscular (músculs).'],
      ['Digues les tres feines de l’esquelet.', 'Intervé en el moviment, dona forma i suporta el pes, i protegeix els òrgans interns.'],
      ['Quins tres tipus d’ossos hi ha? Posa’n un exemple.', 'Llargs (fèmur, húmer), curts (vèrtebres) i plans (crani).'],
      ['Digues una articulació mòbil i una d’immòbil.', 'Mòbils: colze, coll, genoll. Immòbils: les del crani.'],
      ['Què uneix els músculs als ossos?', 'Els tendons.'],
      ['Doblego el braç: què fan el bíceps i el tríceps?', 'El bíceps es contreu i el tríceps es relaxa.'],
      ['Quines parts té el sistema nerviós?', 'El cervell, la medul·la espinal i els nervis.'],
      ['Quina diferència hi ha entre un moviment voluntari i un reflex?', 'Voluntari: el decidim amb el cervell. Reflex: involuntari i ràpid; sovint el dirigeix la medul·la espinal.'],
    ] } },
  { ch: 5, t: 'Repte final 🏆',
    say: 'Deu preguntes. Cada encert és una estrella ⭐. Som-hi!',
    zh: '最终挑战：10 题。',
    scene() { base(); BODY(); },
    task: { type: 'quiz' } },
];

// final challenge (mix of tapping in 3D and choosing)
const QUIZ = [
  { type: 'choice', q: 'L’aparell locomotor està format pel sistema esquelètic i el sistema…', opts: ['muscular', 'nerviós', 'digestiu'], a: 0 },
  { type: 'tap', q: '👆 Toca el fèmur.', target: 'femur', setup() { base(); BODY(); } },
  { type: 'choice', q: 'Les vèrtebres són ossos…', opts: ['llargs', 'curts', 'plans'], a: 1 },
  { type: 'choice', q: 'Quina articulació és immòbil?', opts: ['El colze', 'El genoll', 'Les del crani'], a: 2 },
  { type: 'tap', q: '👆 Toca el bíceps.', target: 'biceps', setup() { base({ allMuscle: 1 }); frame(Math.sign(A.elbows.Left.center.x) * .2, 1.15, 0, .3, [Math.sign(A.elbows.Left.center.x) * .4, .05, 1]); } },
  { type: 'choice', q: 'Quan estirem el braç…', opts: ['el bíceps es contreu', 'el tríceps es contreu', 'tots dos es relaxen'], a: 1 },
  { type: 'choice', q: 'Els músculs s’uneixen als ossos mitjançant…', opts: ['els tendons', 'els nervis', 'les articulacions'], a: 0 },
  { type: 'tap', q: '👆 Toca el cervell.', target: 'cervell', setup() { base({ brain: 1, spinal: 1, nerves: 1 }); A.setBoneOpacity(25); frame(0, 1.5, 0, .2, [.4, .05, 1]); } },
  { type: 'choice', q: 'Qui dirigeix molts moviments reflexos?', opts: ['El cervell', 'La medul·la espinal', 'Els ulls'], a: 1 },
  { type: 'choice', q: 'Ordre correcte de la funció de relació:', opts: ['Sentits → sistema nerviós → aparell locomotor', 'Aparell locomotor → sentits → sistema nerviós', 'Sistema nerviós → sentits → aparell locomotor'], a: 0 },
];

// ---------------------------------------------------------------- UI
const L = $('L'), body = $('Lbody');
let idx = 0, stars = 0, showZh = false, done = new Set();
const save = () => { try { localStorage.setItem('cosHumaU2', JSON.stringify({ idx, stars, done: [...done] })); } catch (e) { /* storage may be blocked */ } };
const load = () => { try { return JSON.parse(localStorage.getItem('cosHumaU2') || 'null'); } catch (e) { return null; } };

function viewOffset(on) {
  const W = innerWidth, H = innerHeight;
  if (!on) { camera.clearViewOffset(); camera.aspect = W / H; camera.updateProjectionMatrix(); return; }
  const r = L.getBoundingClientRect();
  if (W <= 760) { const h = Math.max(0, H - r.top); camera.aspect = W / (H + h); camera.setViewOffset(W, H + h, 0, h, W, H); }
  else { const w = W - r.left + 10; camera.aspect = (W + w) / H; camera.setViewOffset(W + w, H, w, 0, W, H); }
  camera.updateProjectionMatrix();
}
let active = false;
addEventListener('resize', () => { if (active) setTimeout(() => viewOffset(true), 0); });
new ResizeObserver(() => { if (active) viewOffset(true); }).observe(L);

function speakable() { return 'speechSynthesis' in window && speechSynthesis.getVoices().some(v => /^ca/i.test(v.lang)); }
function speak(text) {
  if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'ca-ES'; const v = speechSynthesis.getVoices().find(v => /^ca/i.test(v.lang)); if (v) u.voice = v; u.rate = .95; speechSynthesis.speak(u);
}
const refreshSpeak = () => { $('Lspeak').style.display = speakable() ? '' : 'none'; };
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = refreshSpeak;

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function header() {
  const s = S[idx];
  $('Ldots').innerHTML = CH.map((c, i) => `<span class="${i < s.ch ? 'past' : i === s.ch ? 'now' : ''}" title="${esc(c)}"></span>`).join('');
  $('Lch').textContent = `${s.ch + 1}/${CH.length} · ${CH[s.ch]}`;
  $('Lstars').textContent = `⭐ ${stars}`;
  $('Lbar').style.width = `${(idx + 1) / S.length * 100}%`;
}
let taskDone = false;
function setNext(on) { taskDone = on; $('Lnext').disabled = !on; $('Lnext').classList.toggle('ready', on); }
function award(n = 1) { stars += n; $('Lstars').textContent = `⭐ ${stars}`; $('Lstars').classList.remove('pop'); void $('Lstars').offsetWidth; $('Lstars').classList.add('pop'); }

function render() {
  const s = S[idx]; header(); stopTask();
  const book = (s.book || []).map(b => `<div class="book${b.r ? ' r' : ''}"><span class="pg">📘 p. ${b.p}${b.r ? ' · resum' : ''}</span>${esc(b.tx)}</div>`).join('');
  const legend = s.legend ? `<div class="legend">${s.legend.map(([c, t]) => `<span><i style="background:${css(c)}"></i>${esc(t)}</span>`).join('')}</div>` : '';
  body.innerHTML = `<h2>${esc(s.t)}</h2>
    ${s.say ? `<div class="ossi"><span class="av">🦴</span><p>${esc(s.say)}</p></div>` : ''}
    ${book}
    ${s.chips ? '<div id="Lchip" class="chips"></div>' : ''}
    ${legend}
    ${s.fun ? `<div class="fun">💡 <b>Curiositat</b> <span class="nb">no surt al llibre</span><br>${esc(s.fun)}</div>` : ''}
    ${s.note ? `<div class="note">ℹ️ ${esc(s.note)}</div>` : ''}
    ${s.summary ? summaryHTML() : ''}
    <div class="zh" style="display:${showZh ? '' : 'none'}">🇨🇳 ${esc(s.zh || '')}</div>
    <div id="Ltask"></div>`;
  $('Lback').disabled = idx === 0;
  $('Lnext').textContent = idx === S.length - 1 ? 'Final 🎉' : 'Següent ▶';
  setNext(!s.task || done.has(idx));
  body.scrollTop = 0;
  s.scene && s.scene();
  if (s.task) startTask(s.task);
  save();
}
function summaryHTML() {
  return `<div class="map">
    <div><b>🦴 Aparell locomotor</b> = sistema esquelètic + sistema muscular.</div>
    <div><b>Esquelet</b>: més de 200 ossos · mou, sosté el pes i protegeix · ossos llargs, curts i plans · articulacions mòbils (colze, coll, genoll) i immòbils (crani).</div>
    <div><b>💪 Músculs</b>: més de 600 · elàstics · s’uneixen als ossos amb tendons · llargs, curts, anulars i plans · doblego el braç: bíceps contret, tríceps relaxat.</div>
    <div><b>🧠 Sistema nerviós</b>: cervell + medul·la espinal + nervis · sentits → sistema nerviós → aparell locomotor.</div>
    <div><b>⚡ Moviments</b>: voluntaris (decideix el cervell) · reflexos (involuntaris i ràpids; sovint la medul·la espinal).</div></div>`;
}

// ---------------------------------------------------------------- tasks
let cleanupTask = null;
function stopTask() { if (cleanupTask) { cleanupTask(); cleanupTask = null; } }
const box = () => $('Ltask');
function feedback(ok, msg) {
  const f = document.createElement('div'); f.className = 'fb ' + (ok ? 'ok' : 'no'); f.textContent = msg;
  const old = box().querySelector('.fb'); if (old) old.remove(); box().appendChild(f);
  if (ok) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function choiceUI(el, q, opts, a, onDone, opt = {}) {
  el.innerHTML = `<div class="q">${esc(q)}</div><div class="opts"></div>`;
  let tries = 0; const o = el.querySelector('.opts');
  const order = opt.keepOrder ? opts.map((_, i) => i) : shuffle(opts.map((_, i) => i));
  for (const i of order) {
    const b = document.createElement('button'); b.className = 'opt'; b.textContent = opts[i];
    b.onclick = () => {
      if (el.dataset.solved) return;
      if (i === a) { b.classList.add('right'); el.dataset.solved = 1; onDone(tries === 0); }
      else { tries++; b.classList.add('wrong'); b.disabled = true; feedback(false, (opt.no && opt.no[i]) || 'Gairebé! Torna-ho a provar 🙂'); if (tries >= 2) [...o.children].find(x => x.textContent === opts[a]).classList.add('hint'); }
    };
    o.appendChild(b);
  }
}
const ray = new T.Raycaster(), ndc = new T.Vector2();
function hitAt(x, y, targets) {
  const r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
  const boneSolid = A.mats.bone.opacity >= .5;
  const cand = A.pickables.filter(o => o.visible && (boneSolid || o.userData.g !== 'bone'));
  for (const m of targets) if (m.userData.hl && !cand.includes(m)) cand.push(m);   // highlighted parts are always tappable
  const hits = ray.intersectObjects(cand, false); if (!hits.length) return { obj: null, ok: false };
  const first = hits[0], obj = A.resolveHit(first);
  if (targets.has(obj)) return { obj, ok: true };
  for (const h of hits) { if (h.distance > first.distance + .03) break; if (targets.has(A.resolveHit(h))) return { obj: A.resolveHit(h), ok: true }; }
  return { obj, ok: false };
}
function tapUI(el, q, key, onDone) {
  el.innerHTML = `<div class="q">${esc(q)}</div><div class="row"><button class="opt small" id="Lhint">💡 Pista</button></div>`;
  const targets = new Set(parts(key)); let tries = 0, hintOn = false, d = null;
  const near = (x, y) => { const r = canvas.getBoundingClientRect(); for (const m of targets) { const b = A.boxOf([m]); const pts = [];
      for (const cx of [b.min.x, b.max.x]) for (const cy of [b.min.y, b.max.y]) for (const cz of [b.min.z, b.max.z]) { const v = new T.Vector3(cx, cy, cz).project(camera); pts.push([(v.x + 1) / 2 * r.width + r.left, (1 - v.y) / 2 * r.height + r.top]); }
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const pad = 14;
      if (Math.max(...xs) - Math.min(...xs) < 60 && x > Math.min(...xs) - pad && x < Math.max(...xs) + pad && y > Math.min(...ys) - pad && y < Math.max(...ys) + pad) return true; } return false; };
  const down = e => { d = [e.clientX, e.clientY]; };
  const up = e => {
    if (el.dataset.solved || !d || Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 8) return;
    const h = hitAt(e.clientX, e.clientY, targets);
    if (h.ok || near(e.clientX, e.clientY)) { el.dataset.solved = 1; if (hintOn) A.clearHighlights(); onDone(tries === 0); }
    else { tries++; feedback(false, h.obj ? `Això és ${nameOf(h.obj)}. Torna-ho a provar!` : 'Toca just a sobre del model 🙂'); if (tries >= 2) showHint(); }
  };
  const showHint = () => { hintOn = true; A.highlight([...targets], C.pink); };
  el.querySelector('#Lhint').onclick = showHint;
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', up);
  return () => { canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointerup', up); };
}
function nameOf(m) {
  for (const k in P) { if (['ossosLlargs', 'colze', 'genoll', 'coll', 'plans', 'llargs', 'cara_m', 'postura', 'respirar', 'bessoSoli', 'cara', 'vertebra'].includes(k)) continue; if (parts(k).includes(m)) return `«${P[k].ca}»`; }
  return { bone: 'un altre os', allMuscle: 'un altre múscul', muscle: 'un múscul del braç', brain: 'el cervell', spinal: 'la medul·la espinal', nerves: 'un nervi', eye: 'l’ull' }[m.userData.g] || 'una altra part';
}

function startTask(t) {
  const el = box(); const s = S[idx];
  const finish = (first, msg) => { if (!done.has(idx)) { done.add(idx); if (first) award(); } feedback(true, msg || t.ok || 'Molt bé! 🎉'); setNext(true); save(); };
  if (t.type === 'choice') choiceUI(el, t.q, t.opts, t.a, f => finish(f), { no: t.no });
  else if (t.type === 'tap') { if (t.stopSpin) A.controls.autoRotate = false; cleanupTask = tapUI(el, t.q, t.target, f => finish(f)); }
  else if (t.type === 'classify') {
    let i = 0, first = true; const items = shuffle(t.items);
    const next = () => {
      if (i >= items.length) { finish(first, 'Ho has classificat tot! 🎉'); return; }
      const it = items[i]; const name = it.n || P[it.k].ca;
      if (it.k) { A.clearHighlights(); A.highlight(parts(it.k), C.purple); }
      el.innerHTML = `<div class="q">${esc(t.q)} <span class="cnt">${i + 1}/${items.length}</span></div><div class="item">${esc(name)}</div><div class="opts row"></div>`;
      const o = el.querySelector('.opts');
      t.cats.forEach((c, ci) => { const b = document.createElement('button'); b.className = 'opt'; b.textContent = c; b.onclick = () => {
        if (ci === it.c) { b.classList.add('right'); i++; setTimeout(next, 550); } else { first = false; b.classList.add('wrong'); b.disabled = true; feedback(false, 'Mmm… pensa-hi una altra vegada!'); } }; o.appendChild(b); });
    };
    next();
    cleanupTask = () => { /* scene() re-highlights on revisit */ };
  }
  else if (t.type === 'find') {
    const pool = shuffle(t.pool).slice(0, t.n); let i = 0, first = true;
    el.innerHTML = `<div class="q">${esc(t.q)}</div><button class="opt go" id="Lgo">▶ Juga (amago els noms)</button>`;
    el.querySelector('#Lgo').onclick = () => { stopLoops(); clearLabels(); A.clearHighlights(); A.controls.autoRotate = false; BODY(); round(); };
    let off = null;
    const round = () => {
      if (off) off(); if (i >= pool.length) { finish(first, 'Quin ull de detectiu! 🔎'); return; }
      const k = pool[i]; const sub = document.createElement('div'); el.innerHTML = ''; el.appendChild(sub);
      const cz = A.boxOf(parts(k)).getCenter(new T.Vector3()).z; (cz < -.03 ? BODY_BACK : BODY)();   // turn the body if the target is on the back
      off = tapUI(sub, `👆 (${i + 1}/${pool.length}) Toca: ${P[k].ca}`, k, f => { if (!f) first = false; feedback(true, `Sí, és ${P[k].ca}! ✔`); A.highlight(parts(k), C.green); i++; setTimeout(() => { A.clearHighlights(); round(); }, 900); });
    };
    cleanupTask = () => { if (off) off(); };
  }
  else if (t.type === 'slider') {
    const e = A.elbows.Left, rf = e.restFlex;
    el.innerHTML = `<div class="q">${esc(t.q)}</div><input type="range" id="Lang" min="${rf}" max="140" value="${rf}">
      <div class="state"><span id="Lb">bíceps: relaxat</span><span id="Lt">tríceps: contret</span></div>
      <ol class="goals"><li id="g1">Doblega el braç fins a 90°</li><li id="g2">Ara estira’l del tot</li></ol>`;
    let stage = 0, first = true;
    const upd = v => {
      A.setSide('Left'); A.setAngle(v); const bent = v - rf > 5;
      $('Lb').textContent = 'bíceps: ' + (bent ? 'contret 💪' : 'relaxat'); $('Lb').className = bent ? 'on' : '';
      $('Lt').textContent = 'tríceps: ' + (bent ? 'relaxat' : 'contret 💪'); $('Lt').className = bent ? '' : 'on';
      if (stage === 0 && v >= 85) { stage = 1; $('g1').classList.add('ok'); feedback(true, 'Mira: el bíceps s’ha fet més gruixut. Està contret!'); }
      if (stage === 1 && v <= rf + 3) { stage = 2; $('g2').classList.add('ok'); finish(first, 'Ara treballa el tríceps! «Si el braç vull estirar, el tríceps ha de treballar!»'); }
    };
    el.querySelector('#Lang').oninput = ev => upd(+ev.target.value);
  }
  else if (t.type === 'order') {
    let k = 0, first = true; el.innerHTML = `<div class="q">${esc(t.q)}</div><div class="opts"></div><div class="chain"></div>`;
    const o = el.querySelector('.opts'), ch = el.querySelector('.chain');
    for (const it of shuffle(t.items)) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = it; b.onclick = () => {
      if (it === t.items[k]) { b.classList.add('right'); b.disabled = true; ch.innerHTML += (k ? ' → ' : '') + `<b>${esc(it)}</b>`; k++; if (k === t.items.length) finish(first, 'Sento → penso → em moc! 🎉'); }
      else { first = false; feedback(false, 'Pensa: primer què passa? 👀'); } }; o.appendChild(b); }
  }
  else if (t.type === 'predict') {
    const pred = document.createElement('div'); el.innerHTML = ''; el.appendChild(pred);
    choiceUI(pred, t.q, t.opts, t.a, f => { if (!done.has(idx) && f) award(); feedback(true, t.ok); showPlay(); });
    const showPlay = () => {
      const p = document.createElement('div'); p.className = 'play';
      p.innerHTML = `<button class="opt go" id="Lplay">▶ Mira el camí del missatge</button><ol class="steps"></ol>`; el.appendChild(p);
      const ol = p.querySelector('ol');
      ol.innerHTML = A.STEPS[t.play].map((x, i) => `<li class="${i === 3 ? 'extra' : ''}">${i === 3 ? '<em>Explicació addicional (no surt al llibre):</em> ' : ''}${esc(x)}</li>`).join('');
      const go = () => { A.startSignal(t.play); };
      p.querySelector('#Lplay').onclick = () => { go(); p.querySelector('#Lplay').textContent = '↻ Torna-ho a veure'; };
      const poll = () => { const sg = A.signal; [...ol.children].forEach((li, i) => li.classList.toggle('on', !!sg && sg.i === i)); if (sg && sg.i >= 2 && !taskDone) { done.add(idx); setNext(true); save(); } };
      loop(poll); go(); p.querySelector('#Lplay').textContent = '↻ Torna-ho a veure';
    };
  }
  else if (t.type === 'cards') {
    let queue = t.cards.map((c, i) => i), known = 0;
    const show = () => {
      if (!queue.length) { finish(true, `Fantàstic! Ho has explicat tot tu sol/a 🌟`); return; }
      const c = t.cards[queue[0]];
      el.innerHTML = `<div class="q">Targeta ${known + 1}/${t.cards.length}</div><div class="flash"><div class="fq">${esc(c[0])}</div><div class="fa" style="display:none">✅ ${esc(c[1])}</div></div>
        <div class="row"><button class="opt go" id="Lrev">👀 Gira la targeta</button></div>`;
      el.querySelector('#Lrev').onclick = () => {
        el.querySelector('.fa').style.display = ''; const r = el.querySelector('.row');
        r.innerHTML = '<button class="opt right" id="Lyes">Ho sabia ✅</button><button class="opt" id="Lno">Encara no 🔁</button>';
        r.querySelector('#Lyes').onclick = () => { queue.shift(); known++; show(); };
        r.querySelector('#Lno').onclick = () => { queue.push(queue.shift()); show(); };
      };
    };
    show();
  }
  else if (t.type === 'quiz') {
    let i = 0, score = 0; const wrong = [];
    let off = null;
    const q = () => {
      if (off) { off(); off = null; }
      if (i >= QUIZ.length) {
        base(); BODY(); spin(1.5);
        const medal = score >= 9 ? '🥇' : score >= 7 ? '🥈' : '🥉';
        el.innerHTML = `<div class="result">${medal}<br><b>${score} / ${QUIZ.length}</b><br>${score >= 9 ? 'Ets un/a expert/a del moviment!' : score >= 7 ? 'Molt bé! Repassa les que has fallat.' : 'Bon intent! Torna a fer la lliçó i ho clavaràs.'}</div>
          ${wrong.length ? `<div class="note">Per repassar: ${wrong.map(w => esc(QUIZ[w].q.replace('👆 ', ''))).join(' · ')}</div>` : ''}
          <div class="row"><button class="opt" id="Lagain">↻ Repeteix el repte</button></div>`;
        el.querySelector('#Lagain').onclick = () => startTask(t);
        if (!done.has(idx)) { done.add(idx); award(score); }
        setNext(true); save(); return;
      }
      const Q = QUIZ[i]; const sub = document.createElement('div');
      el.innerHTML = `<div class="q cnt">Pregunta ${i + 1}/${QUIZ.length} · ✔ ${score}</div>`; el.appendChild(sub);
      if (Q.setup) Q.setup(); else { base(); BODY(); }
      const next = ok => { if (ok) score++; else wrong.push(i); i++; setTimeout(q, 800); };
      if (Q.type === 'choice') { let fails = 0; choiceUI(sub, Q.q, Q.opts, Q.a, f => { feedback(true, f ? 'Correcte! ⭐' : 'Ara sí!'); next(f); }); }
      else off = tapUI(sub, Q.q, Q.target, f => { feedback(true, f ? 'Correcte! ⭐' : 'Ara sí!'); A.highlight(parts(Q.target), C.green); next(f); });
    };
    q();
    cleanupTask = () => { if (off) off(); };
  }
}

// ---------------------------------------------------------------- navigation & modes
$('Lnext').onclick = () => { if (!taskDone) return; if (idx < S.length - 1) { idx++; render(); } else endScreen(); };
$('Lback').onclick = () => { if (idx > 0) { idx--; render(); } };
$('Lzh').onclick = () => { showZh = !showZh; $('Lzh').classList.toggle('on', showZh); body.querySelectorAll('.zh').forEach(z => z.style.display = showZh ? '' : 'none'); };
$('Lspeak').onclick = () => { const s = S[idx]; speak([s.t, s.say, ...(s.book || []).map(b => b.tx)].filter(Boolean).join('. ')); };
$('Lexit').onclick = () => exitLesson();

function endScreen() {
  base({ allMuscle: 1 }); BODY(); spin(2);
  body.innerHTML = `<div class="result">🎉🦴💪🧠<br><b>Lliçó acabada!</b><br>Has aconseguit ⭐ ${stars} estrelles.</div>
    <div class="row"><button class="opt go" id="Lfree">🔍 Explora el model lliurement</button><button class="opt" id="Lrestart">↻ Torna a començar</button></div>`;
  $('Lfree').onclick = exitLesson; $('Lrestart').onclick = () => { idx = 0; stars = 0; done = new Set(); render(); };
  setNext(false);
}

function enterLesson(from = 0) {
  active = true; document.body.classList.add('lessonMode'); $('Lstart').style.display = 'none'; L.style.display = '';
  A.quietPick = false; refreshSpeak(); idx = from; viewOffset(true); render();
}
function exitLesson() {
  active = false; stopTask(); base(); A.controls.autoRotate = false; clearLabels(); L.style.display = 'none'; $('Lstart').style.display = 'none';
  document.body.classList.remove('lessonMode'); viewOffset(false);
  layers({ brain: 1, spinal: 1, nerves: 1, eye: 1 }); A.VIEWS.front(); A.resetAll();
}
$('Lopen').onclick = () => { $('Lstart').style.display = ''; };

// start screen
const saved = load();
if (saved && saved.idx > 0 && saved.idx < S.length) {
  const c = $('Lcont'); c.style.display = ''; c.textContent = `⏯ Continua on ho vas deixar (${saved.idx + 1}/${S.length})`;
  c.onclick = () => { stars = saved.stars || 0; done = new Set(saved.done || []); enterLesson(saved.idx); };
}
$('Lbegin').onclick = () => { stars = 0; done = new Set(); enterLesson(0); };
$('Lfree0').onclick = () => { $('Lstart').style.display = 'none'; exitLesson(); };
const params = new URLSearchParams(location.search);
if (params.has('perf') || params.has('free')) { $('Lstart').style.display = 'none'; }
else { $('Lstart').style.display = ''; document.body.classList.add('lessonMode'); base({ allMuscle: 1 }); BODY(); spin(1.2); }

// test hook
window.__lesson = { hitAt, QUIZ_SETUP: i => QUIZ[i].setup && QUIZ[i].setup(), S, QUIZ, P, parts, get idx() { return idx; }, go(i) { enterLesson(i); }, get taskDone() { return taskDone; }, next() { $('Lnext').click(); }, exit: exitLesson, viewOffset };
