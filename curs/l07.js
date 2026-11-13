// Lesson 7 · La forma dels músculs (textbook p. 26, bottom). Four types: llargs, curts, anulars, plans.
// Only examples the book itself gives are scored: llarg = the arm muscle of the drawing; curts = hands or feet; anulars = around the
// eyes or the mouth; plans = trunk (p. 26 «com els que es troben al tronc», p. 27 «Tronc. Té músculs grans i plans»).
const M = 'allMuscle';
const SIDES = '(left|right)';
const RE = {
  llarg: /biceps brachii/,                                  // group 'muscle' (shown with the full musculature)
  ma: new RegExp(`^${SIDES} (abductor pollicis brevis|flexor pollicis brevis|opponens pollicis)$|adductor pollicis|abductor digiti minimi of ${SIDES} hand|interossei of ${SIDES} hand|lumbricals of ${SIDES} hand`),
  peu: new RegExp(`abductor hallucis|adductor hallucis|digiti minimi of ${SIDES} foot|lumbrical of ${SIDES} foot|interosseous of ${SIDES} foot|flexor digitorum brevis|extensor digitorum brevis|flexor hallucis brevis`),
  ull: /orbicularis oculi/,
  boca: /orbicularis oris/,
  obliqu: /external oblique$/,
  dorsal: /latissimus dorsi$/,
  tronc: /external oblique$|latissimus dorsi$|pectoralis major$|trapezius$|rectus abdominis$/,
};
const L = re => new RegExp(re.source.replace(/\(left\|right\)/g, 'left'));
export default {
  id: 'l07', title: 'La forma dels músculs 🔍', subtitle: 'Lliçó 7 (llibre p. 26). Els quatre tipus de músculs: llargs, curts, anulars i plans.',
  partWord: 'múscul',
  units: {
    T0: 'Hi ha quatre tipus principals de músculs esquelètics',
    T1: 'Llargs: extrems més fins i la part del mig més ampla (com al braç del dibuix)',
    T2: 'Curts: com els de les mans o els peus',
    T3: 'Anulars: amb forma d’anell; envolten obertures com els ulls o la boca',
    T4: 'Plans: amb forma de làmina; com els del tronc',
  },
  book: {
    quatre: { p: 26, src: 'lit', where: 'text', tx: 'Hi ha quatre tipus principals de músculs esquelètics.' },
    llargs: { p: 26, src: 'lit', where: 'text del dibuix', tx: 'Músculs llargs, amb els extrems més fins i la part del mig més ampla.' },
    curts: { p: 26, src: 'lit', where: 'text del dibuix', tx: 'Músculs curts, com els de les mans o els peus.' },
    anulars: { p: 26, src: 'lit', where: 'text del dibuix', tx: 'Músculs anulars, és a dir, amb forma d’anell. Envolten obertures com els ulls o la boca.' },
    plans: { p: 26, src: 'lit', where: 'text del dibuix', tx: 'Músculs plans, amb forma de làmina. Com els que es troben al tronc.' },
    troncP27: { p: 27, src: 'lit', where: 'text', tx: 'Tronc. Té músculs grans i plans.' },
    dibLlarg: { p: 26, src: 'dib', where: 'dibuix del nen', tx: 'La línia del múscul llarg acaba al braç.' },
  },
  names: {},
  targets: {   // tap targets for «find one» tasks (not names to learn)
    llarg: { ca: 'múscul llarg del braç', re: /(biceps|triceps) brachii/, g: 'muscle', show: /left biceps brachii/ },
    curt: { ca: 'múscul curt', re: new RegExp(RE.ma.source + '|' + RE.peu.source), g: M, show: L(RE.ma) },
    anular: { ca: 'múscul anular', re: /orbicularis (oculi|oris)/, g: M, show: /left .*orbicularis oculi/ },
    pla: { ca: 'múscul pla', re: RE.tronc, g: M, show: L(RE.obliqu) },
  },
  views: {
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
    braç: c => { const b = c.A.boxOf(c.A.find(/^left (humerus|ulna|radius)$/, 'bone')), m = b.getCenter(new c.T.Vector3()); c.A.flyTo(m, new c.T.Vector3(.35, .1, 1).normalize().multiplyScalar(c.fitDist(.36))); },
    mà: c => { const b = c.A.boxOf(c.A.find(/^left (.*metacarpal|scaphoid|capitate)|phalanx of left (thumb|.*finger)/, 'bone')), m = b.getCenter(new c.T.Vector3()); c.A.flyTo(m, new c.T.Vector3(.3, .05, 1).normalize().multiplyScalar(c.fitDist(.13))); },
    peu: c => { const b = c.A.boxOf(c.A.find(/^left .*metatarsal|^left calcaneus$|phalanx of left .*toe/, 'bone')), m = b.getCenter(new c.T.Vector3()); c.A.flyTo(m, new c.T.Vector3(.4, -.6, .7).normalize().multiplyScalar(c.fitDist(.16))); },
    cara: c => c.A.flyTo(new c.T.Vector3(0, 1.6, .03), new c.T.Vector3(.25, .05, 1).normalize().multiplyScalar(c.fitDist(.15))),
    mig: c => c.A.flyTo(new c.T.Vector3(.05, 1.2, 0), new c.T.Vector3(.3, .05, 1).normalize().multiplyScalar(c.fitDist(.58, .45))),
    tronc: c => c.A.flyTo(new c.T.Vector3(0, 1.15, 0), new c.T.Vector3(.6, .05, 1).normalize().multiplyScalar(c.fitDist(.42))),
    esquena: c => c.A.flyTo(new c.T.Vector3(0, 1.15, 0), new c.T.Vector3(.4, .05, -1).normalize().multiplyScalar(c.fitDist(.42))),
  },
  neutral(c) { c.A.setLayer('allMuscle', true); },
  setup(c) {
    for (const k of ['muscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setLayer('allMuscle', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    c.view('cos');
  },
  stages(c) {
    const A = c.A;
    const hl = (re, g = M, col = 0x2fd3ff) => A.highlight(A.find(re, g), col);
    const SC = {   // scene for each example (highlight only the example: never a colour that tells the type)
      llarg: () => { c.view('braç'); hl(/left biceps brachii/, 'muscle'); },
      ma: () => { c.view('mà'); hl(L(RE.ma)); },
      peu: () => { c.view('peu'); hl(L(RE.peu)); },
      ull: () => { c.view('cara'); hl(RE.ull); },
      boca: () => { c.view('cara'); hl(RE.boca); },
      obliqu: () => { c.view('tronc'); hl(L(RE.obliqu)); },
      dorsal: () => { c.view('esquena'); hl(L(RE.dorsal)); },
    };
    const card = (type, sceneKey, bookKeys, say, zhTxt, extra = '') => ({ scene: SC[sceneKey], html: `<div class="spell">${type}</div>${c.book(bookKeys)}${c.ossi(say)}${extra}${c.zh(zhTxt)}` });
    const find = (id, ph, keys, unitOf) => ({ id, ph, recall: true, render: async el => {
      c.hidden(); c.view('mig'); c.setNext(false);
      const Q = { llarg: 'un múscul llarg com el del dibuix del llibre', curt: 'un múscul curt', anular: 'un múscul anular', pla: 'un múscul pla' };
      const CUE = { llarg: 'és al braç, com al dibuix del llibre.', curt: 'mira la mà: al palmell, a sota del dit gros.', anular: 'busca un anell al voltant d’una obertura de la cara.', pla: 'busca una làmina gran al tronc.' };
      await c.sequence(el, c.shuffle(keys), (box, k) => { c.view('mig'); return c.tapTask(box, { q: '👆 Toca ' + Q[k], key: k, cue: CUE[k], onResult: v => c.evid([unitOf[k]], v) }); });
      c.hidden(); c.feedback(el, true, 'Molt bé! ⭐'); c.setNext(true);
    } });
    const item = (sceneKey, a, cue, unit) => ({ q: 'De quin tipus és el múscul blau?', opts: ['llarg', 'curt', 'anular', 'pla'], a, subject: SC[sceneKey], cue, units: [unit],
      demo: async () => { SC[sceneKey](); await c.wait(2400); } });
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>La forma dels músculs</h2>${c.ossi('Hola! Els músculs no són tots iguals: n’hi ha de llargs, de curts, en forma d’anell i plans. Avui els descobrirem en dos grups. Tu manes el ritme.')}${c.zh('今天学：肌肉的四种形状，分两组学。')}`; c.setNext(true); } },
      { id: 'pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cos'); c.predict(el, { id: 'forma', q: 'Mira’t la mà, el braç i la cara. Creus que tots els músculs tenen la mateixa forma?', zhq: '看看手、手臂和脸。你觉得所有肌肉形状都一样吗？', opts: ['Sí, tots iguals', 'No, tenen formes diferents', 'No ho sé'] }); } },
      { id: 'quatre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['quatre'])}${c.ossi('Primer en veurem dos: els llargs i els curts.')}${c.zh('课本内容·中文意译：骨骼肌主要有四种类型。')}`; c.setNext(true); } },
      { id: 'gA-coneix', ph: '2–4 · Llargs i curts', render(el) {
          c.stepper(el, [
            card('llargs', 'llarg', ['llargs', 'dibLlarg'], 'Mira el múscul blau del braç: és prim als extrems i ample al mig. Fes força amb el braç i toca’l!', '长肌：两端细、中间宽（课本图上在手臂）。', c.memo('Un múscul llarg és com un fus: prim, gruixut, prim.')),
            card('curts', 'ma', ['curts'], 'A la mà hi ha músculs petits i curts. Toca’t el palmell a sota del dit gros i mou el dit: notes com treballa?', '短肌：比如手上的肌肉。'),
            card('curts', 'peu', ['curts'], 'Al peu també n’hi ha. Mou els dits dels peus!', '短肌：脚上也有。'),
          ], { title: 'Llargs i curts', after: () => c.hidden() });
        } },
      find('gA-troba', '6 · Troba’ls', ['llarg', 'curt'], { llarg: 'T1', curt: 'T2' }),
      { id: 'gA-explica', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Com és un múscul llarg? On hi ha músculs curts?', keys: ['llargs', 'curts'], units: ['T1', 'T2'], zhq: '长肌是什么样的？哪里有短肌？', zkey: '评分要点：长肌两端细、中间宽；短肌在手和脚上。' }); } },
      { id: 'gB-llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Dos tipus més</h2>${c.ossi('Ara veurem els altres dos: els anulars i els plans.')}${c.zh('接下来学另外两种：环形肌和扁平肌。')}`; c.setNext(true); } },
      { id: 'gB-coneix', ph: '2–4 · Anulars i plans', render(el) {
          c.stepper(el, [
            card('anulars', 'ull', ['anulars'], 'El múscul blau fa un anell al voltant de l’ull. Tanca els ulls ben fort: aquest múscul treballa!', '环形肌：像戒指一样围着开口，比如眼睛。', c.memo('Anular ve d’anell 💍.')),
            card('anulars', 'boca', ['anulars'], 'Aquest envolta la boca. Fes un petó a l’aire 😗: ara treballa!', '环形肌：也围着嘴巴。'),
            card('plans', 'obliqu', ['plans', 'troncP27'], 'Al tronc hi ha músculs grans i plans, com un full de paper. Aquest és al costat de la panxa.', '扁平肌：像薄片，躯干上的肌肉。'),
            card('plans', 'dorsal', ['plans'], 'A l’esquena també n’hi ha un de molt gran i pla.', '扁平肌：背上也有一块很大的。'),
          ], { title: 'Anulars i plans', after: () => c.hidden() });
        } },
      find('gB-troba', '6 · Troba’ls', ['anular', 'pla'], { anular: 'T3', pla: 'T4' }),
      { id: 'gB-explica', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Com és un múscul anular i on n’hi ha? I un de pla?', keys: ['anulars', 'plans'], units: ['T3', 'T4'], zhq: '环形肌是什么样的，在哪里？扁平肌呢？', zkey: '评分要点：环形肌像戒指，围着眼睛或嘴巴；扁平肌像薄片，在躯干。' }); } },
      c.choiceSeries('P1', '6 · Barrejats', c.shuffle([
        item('llarg', 0, 'és al braç, com el del dibuix: prim als extrems i ample al mig.', 'T1'),
        item('ma', 1, 'és a la mà.', 'T2'),
        item('peu', 1, 'és al peu.', 'T2'),
        item('ull', 2, 'fa una rodona al voltant de l’ull.', 'T3'),
        item('boca', 2, 'fa una rodona al voltant de la boca.', 'T3'),
        item('obliqu', 3, 'és un múscul gran del tronc, com una làmina.', 'T4'),
        item('dorsal', 3, 'és un múscul gran de l’esquena, com una làmina.', 'T4'),
      ])),
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Digues els quatre tipus de músculs i un lloc on n’hi ha de cada.', keys: ['llargs', 'curts', 'anulars', 'plans'], units: ['T0'], zhq: '说出四种肌肉，并各说一个位置。', zkey: '评分要点：长肌（手臂）、短肌（手或脚）、环形肌（眼睛或嘴巴周围）、扁平肌（躯干）。' }); } },
      c.resultsStage(),
    ];
  },
  day2(c) {
    const A = c.A, hl = (re, g = M) => A.highlight(A.find(re, g), 0x2fd3ff);
    const it = (id, label, view, re, g, a) => ({ id, kind: 'choice', title: 'Al model', label, q: 'De quin tipus és el múscul blau?', opts: ['llarg', 'curt', 'anular', 'pla'], a, subject: () => { c.view(view); hl(re, g); }, cue: 'on és? Al braç, a la mà, al voltant d’una obertura o al tronc?', helpText: 'Mira el llibre, p. 26.' });
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Quatre tipus', ca: 'Sense mirar el model: quins són els quatre tipus de músculs?', zq: '不看模型：肌肉有哪四种？', key: 'Llargs, curts, anulars i plans.', zkey: '评分要点：长肌、短肌、环形肌、扁平肌。' },
      it('t_ull', 'Tipus: ull', 'cara', RE.ull, M, 2),
      it('t_ma', 'Tipus: mà', 'mà', L(RE.ma), M, 1),
      it('t_tronc', 'Tipus: tronc', 'tronc', L(RE.obliqu), M, 3),
      it('t_braç', 'Tipus: braç', 'braç', /left biceps brachii/, 'muscle', 0),
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Dibuix de la p. 26', ca: 'Obre el llibre a la pàgina 26. Tapa els textos dels quatre músculs i digues de quin tipus és cadascun.', zq: '打开课本第 26 页，盖住四种肌肉的文字，说出每一种是什么类型。', key: 'Braç: llarg. Mà: curt. Ull: anular. Tronc: pla.', zkey: '评分要点：手臂-长肌；手-短肌；眼睛-环形肌；躯干-扁平肌。' },
    ];
  },
};
