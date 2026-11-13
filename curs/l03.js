// Lesson 3 · Els ossos del braç i de la mà (textbook p. 25). NAME lesson: six names in two groups.
// Must-learn: the six names of the p. 25 drawing (locate, say, spell). Location hints ("Pista per trobar-lo") help
// to find a bone and are never asked as knowledge.
export default {
  id: 'l03', title: 'Els ossos del braç i de la mà 🦴', subtitle: 'Lliçó 3 (llibre p. 25). Sis noms en dos grups. Tu manes el ritme. Uns 15 minuts.',
  hasReview: true, hasSay: true,
  units: {},
  book: {
    extremitats: { p: 25, src: 'lit', where: 'text', tx: 'Extremitats. Hi tenim ossos llargs, com l’húmer i el fèmur. A les mans i als peus tenim molts ossos petits, les falanges.' },
    dibuix: { p: 25, src: 'lit', where: 'noms del dibuix', tx: 'húmer · cúbit · radi · carp · metacarp · falanges' },
  },
  names: {
    humer: { ca: 'húmer', html: 'h<b>ú</b>mer', g: 'bone', re: /^left humerus$/, aid: 'És l’os llarg entre l’espatlla i el colze.', zh: 'húmer：肩膀到肘之间的长骨（肱骨）。' },
    cubit: { ca: 'cúbit', html: 'c<b>ú</b>bit', g: 'bone', re: /^left ulna$/, aid: 'És un dels dos ossos entre el colze i el canell, al costat del dit petit.', zh: 'cúbit：前臂两根骨头之一，靠小指一侧（尺骨）。' },
    radi: { ca: 'radi', g: 'bone', re: /^left radius$/, aid: 'És l’altre os entre el colze i el canell, al costat del dit gros.', zh: 'radi：前臂另一根骨头，靠大拇指一侧（桡骨）。' },
    carp: { ca: 'carp', g: 'bone', re: /^left (scaphoid|lunate|triquetr\w*|pisiform|trapezium|trapezoid|capitate|hamate)$/, aid: 'Són els ossets petits del canell.', zh: 'carp：手腕处的一群小骨头（腕骨）。' },
    metacarp: { ca: 'metacarp', g: 'bone', re: /^left .*metacarpal/, aid: 'Són els ossos del palmell de la mà.', zh: 'metacarp：手掌里的骨头（掌骨）。' },
    falanges: { ca: 'falanges', g: 'bone', re: /phalanx of left (thumb|.*finger)/, aid: 'Són els ossos dels dits.', zh: 'falanges：手指里的骨头（指骨）。' },
  },
  views: {
    braç: c => c.frame(['humer', 'cubit', 'radi'], [.35, .05, 1], 1.4),
    braçDarrere: c => c.frame(['humer', 'cubit', 'radi'], [.45, .05, -1], 1.4),
    ma: c => c.frame(['carp', 'metacarp', 'falanges'], [.35, 0, 1], 1.35),
    maDarrere: c => c.frame(['carp', 'metacarp', 'falanges'], [.45, 0, -1], 1.35),
    tot: c => c.frame(['humer', 'cubit', 'radi', 'carp', 'metacarp', 'falanges'], [1, .05, .3], 1.08),
  },
  setup(c) {
    for (const k of ['allMuscle', 'muscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    c.view('braç');
  },
  stages(c) {
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) {
          c.hidden(); c.view('braç');
          el.innerHTML = `<h2>Els ossos del braç i de la mà</h2>${c.ossi('Hola! Sóc l’Ossi. Avui aprendrem sis noms d’ossos, en dos grups de tres. Tu manes: passa endavant quan estiguis a punt.')}${c.zh('今天学手臂和手的 6 块骨头的名称，分两组，每组 3 个。孩子自己控制节奏。')}`;
          c.setNext(true);
        } },
      { id: 'g1-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('braç'); c.predict(el, { id: 'g1', q: 'Abans de mirar: saps com es diu l’os llarg del braç, entre l’espatlla i el colze?', zhq: '肩膀到肘之间的长骨叫什么？', opts: ['Húmer', 'Fèmur', 'No ho sé'] }); } },
      { id: 'g1-llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('braç'); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['extremitats', 'dibuix'])}${c.ossi('Primer grup: els tres ossos llargs del braç.')}${c.zh('读课本 P25 原句和图上的名称。')}`; c.setNext(true); } },
      ...c.nameGroupStages({ id: 'g1', title: 'Ossos del braç', keys: ['humer', 'cubit', 'radi'], view: 'braç', viewAlt: 'braçDarrere' }),
      { id: 'g2-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('ma'); c.predict(el, { id: 'g2', q: 'Mira la teva mà i mou els dits. Quants ossos creus que té: pocs o molts?', zhq: '看看自己的手，手里的骨头多还是少？', opts: ['Pocs', 'Molts', 'No ho sé'] }); } },
      { id: 'g2-llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('ma'); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['extremitats'])}${c.ossi('Segon grup: els ossos del canell, del palmell i dels dits.')}${c.zh('课本内容·中文意译：手和脚有很多小骨头，叫 falanges。')}`; c.setNext(true); } },
      ...c.nameGroupStages({ id: 'g2', title: 'Ossos de la mà', keys: ['carp', 'metacarp', 'falanges'], view: 'ma', viewAlt: 'maDarrere' }),
      c.reviewStage(['humer', 'cubit', 'radi', 'carp', 'metacarp', 'falanges'], 'tot'),
      c.spellStage(['humer', 'cubit', 'radi', 'carp', 'metacarp', 'falanges']),
      c.resultsStage(),
    ];
  },
  // day 2: locate all six (random) → say three names → book p. 25 → spell all six
  day2(c) {
    const N = ['humer', 'cubit', 'radi', 'carp', 'metacarp', 'falanges'], ca = k => this.names[k].ca;
    return [
      ...c.shuffle(N).map(k => ({ id: 'loc_' + k, kind: 'loc', key: k, view: 'tot', title: 'Al model', label: 'Troba ' + ca(k) })),
      ...c.shuffle(N).slice(0, 3).map(k => ({ id: 'say_' + k, kind: 'say', key: k, view: 'tot', title: 'Digues el nom', label: 'Diu el nom: ' + ca(k) })),
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Dibuix de la p. 25', ca: 'Obre el llibre a la pàgina 25. Tapa els noms i assenyala l’húmer, el cúbit, el radi, el carp, el metacarp i les falanges.', zq: '打开课本第 25 页，盖住名称，指出这 6 块骨头。',
        key: 'Destapa els noms del dibuix i comproveu-ho junts.', zkey: '核对方法：揭开图上的名称，一起对照。六个都指对 = 说对了。' },
      ...N.map(k => ({ id: 'spell_' + k, kind: 'spell', key: k, view: 'tot', title: 'Escriu el nom', label: 'Escriu ' + ca(k) })),
    ];
  },
};
