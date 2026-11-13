// Lesson 4 · Els ossos de la cama i del peu (textbook p. 25). NAME lesson (7 names: 2 + 2 + 3) + activity 2
// (classify bones by zone; answers from the colours of the p. 25 drawing). The hand↔foot comparison is a memory aid only.
const Z = ['Cap', 'Tronc', 'Extremitats'];
const ZONE_ITEMS = [   // activitat 2, p. 25 (answer = colour of the label in the drawing)
  ['falanges', 2, /phalanx of left /], ['pelvis', 1, /hip bone$/], ['crani', 0, /(frontal|parietal|occipital|temporal|sphenoid) bone$|^ethmoid$/], ['omòplat', 1, /^left scapula$/],
  ['peroné', 2, /^left fibula$/], ['maxil·lar', 0, /^mandible$/], ['estern', 1, /body of sternum|manubrium|xiphoid/], ['húmer', 2, /^left humerus$/],
  ['tars', 2, /^left (talus|calcaneus|cuboid bone|(medial|intermediate|lateral) cuneiform bone)$|^navicular bone of left foot$/], ['ròtula', 2, /^left patella$/], ['carp', 2, /^left (scaphoid|lunate|triquetr\w*|pisiform|trapezium|trapezoid|capitate|hamate)$/],
];
export default {
  id: 'l04', title: 'Els ossos de la cama i del peu 🦵', subtitle: 'Lliçó 4 (llibre p. 25). Set noms en tres grups i l’activitat 2 de les zones. Tu manes el ritme.',
  hasReview: true, hasSay: true,
  units: { U1: 'A les extremitats hi ha ossos llargs, com l’húmer i el fèmur', U2: 'A les mans i als peus hi ha molts ossos petits, les falanges', A2: 'Activitat 2: classificar ossos per zones (cap, tronc, extremitats)' },
  book: {
    extremitats: { p: 25, src: 'lit', where: 'text', tx: 'Extremitats. Hi tenim ossos llargs, com l’húmer i el fèmur. A les mans i als peus tenim molts ossos petits, les falanges.' },
    dibuix: { p: 25, src: 'lit', where: 'noms del dibuix', tx: 'fèmur · ròtula · tíbia · peroné · tars · metatars · falanges' },
    zones: { p: 25, src: 'act', where: 'activitat 2', q: 'Classifica els ossos següents: falanges, pelvis, crani, omòplat, peroné, maxil·lar, estern, húmer, tars, ròtula, carp.', tx: 'Resposta segons els colors dels noms del dibuix: blau = cap, taronja = tronc, verd = extremitats.' },
  },
  names: {
    femur: { ca: 'fèmur', html: 'f<b>è</b>mur', g: 'bone', re: /^left femur$/, aid: 'És l’os llarg de la cuixa, entre el maluc i el genoll.', zh: 'fèmur：大腿里的长骨（股骨）。' },
    rotula: { ca: 'ròtula', html: 'r<b>ò</b>tula', g: 'bone', re: /^left patella$/, aid: 'És l’os petit i rodó del davant del genoll.', zh: 'ròtula：膝盖前面圆圆的小骨（髌骨）。' },
    tibia: { ca: 'tíbia', html: 't<b>í</b>bia', g: 'bone', re: /^left tibia$/, aid: 'És l’os gros de la cama, entre el genoll i el turmell, a la banda de dins.', zh: 'tíbia：小腿内侧较粗的骨头（胫骨）。' },
    perone: { ca: 'peroné', html: 'peron<b>é</b>', g: 'bone', re: /^left fibula$/, aid: 'És l’os prim de la cama, al costat de la tíbia, a la banda de fora.', zh: 'peroné：小腿外侧较细的骨头（腓骨）。' },
    tars: { ca: 'tars', g: 'bone', re: /^left (talus|calcaneus|cuboid bone|(medial|intermediate|lateral) cuneiform bone)$|^navicular bone of left foot$/, aid: 'Són els ossos del turmell i del taló.', zh: 'tars：脚踝和脚跟的骨头（跗骨）。' },
    metatars: { ca: 'metatars', g: 'bone', re: /^left .*metatarsal/, aid: 'Són els ossos llargs del mig del peu.', zh: 'metatars：脚掌中间的骨头（跖骨）。' },
    falangesPeu: { ca: 'falanges', g: 'bone', re: /phalanx of left .*toe/, aid: 'Són els ossos dels dits del peu.', zh: 'falanges：脚趾里的骨头（趾骨）。' },
  },
  views: {
    cama: c => c.frame(['femur', 'rotula', 'tibia', 'perone'], [.3, .05, 1], 1.12),
    camaCostat: c => c.frame(['femur', 'rotula', 'tibia', 'perone'], [1, .05, .2], 1.12),
    camaDarrere: c => c.frame(['femur', 'rotula', 'tibia', 'perone'], [.3, .05, -1], 1.12),
    peu: c => c.frame(['tars', 'metatars', 'falangesPeu'], [.35, .8, 1], 1.4),
    peuCostat: c => c.frame(['tars', 'metatars', 'falangesPeu'], [1, .3, .1], 1.4),
    tot: c => c.frame(['femur', 'rotula', 'tibia', 'perone', 'tars', 'metatars', 'falangesPeu'], [.7, .05, .7], 1.05),
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
  },
  neutral(c) { c.A.setBoneOpacity(100); },
  setup(c) {
    for (const k of ['allMuscle', 'muscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    c.view('tot');
  },
  stages(c) {
    const A = c.A, N = ['femur', 'rotula', 'tibia', 'perone', 'tars', 'metatars', 'falangesPeu'];
    const hand = re => A.find(re, 'bone');
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { c.hidden(); c.view('tot'); el.innerHTML = `<h2>Els ossos de la cama i del peu</h2>${c.ossi('Hola! Avui aprendrem set noms d’ossos de la cama i del peu, en tres grups petits. Tu manes el ritme.')}${c.zh('今天学腿和脚的 7 块骨头名称，分三组。')}`; c.setNext(true); } },
      { id: 'llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('cama'); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['extremitats', 'dibuix'])}${c.zh('课本内容·中文意译：四肢有长骨，比如肱骨和股骨；手和脚有很多小骨头，叫 falanges。')}`; c.setNext(true); } },
      { id: 'g1-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cama'); c.predict(el, { id: 'g1', q: 'Toca’t la cuixa i el genoll. Quin os creus que és el més llarg de la cama?', zhq: '摸摸大腿和膝盖，哪块骨头最长？', opts: ['El de la cuixa', 'El del genoll', 'No ho sé'] }); } },
      ...c.nameGroupStages({ id: 'g1', title: 'Cuixa i genoll', keys: ['femur', 'rotula'], view: 'cama', viewAlt: 'camaCostat' }),
      ...c.nameGroupStages({ id: 'g2', title: 'La cama', keys: ['tibia', 'perone'], view: 'cama', viewAlt: 'camaDarrere' }),
      { id: 'g3-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('peu'); c.predict(el, { id: 'g3', q: 'Recordes la mà? Creus que el peu té pocs ossos o molts ossos petits, com la mà?', zhq: '还记得手吗？脚的骨头多还是少？', opts: ['Molts ossos petits, com la mà', 'Pocs ossos', 'No ho sé'] }); } },
      { id: 'g3-compara', ph: '2 · Compara amb la mà', render(el) {
          c.hidden();
          { const ms = [...hand(/^left .*metacarpal|phalanx of left (thumb|.*finger)|^left (scaphoid|lunate|pisiform|trapezium|trapezoid|capitate|hamate)$/), ...c.parts.tars, ...c.parts.metatars, ...c.parts.falangesPeu];
            const b = A.boxOf(ms), m = b.getCenter(new c.T.Vector3()), sz = b.getSize(new c.T.Vector3());
            A.flyTo(m, new c.T.Vector3(.35, .1, 1).normalize().multiplyScalar(c.fitDist(sz.y / 2 * 1.1, Math.max(sz.x, sz.z) / 2 * 1.1))); }
          A.highlight(hand(/^left (scaphoid|lunate|pisiform|trapezium|trapezoid|capitate|hamate)$/), 0xff9f1c); A.highlight(c.parts.tars, 0xff9f1c);
          A.highlight(hand(/^left .*metacarpal/), 0x3d8bfd); A.highlight(c.parts.metatars, 0x3d8bfd);
          A.highlight(hand(/phalanx of left (thumb|.*finger)/), 0x35c46a); A.highlight(c.parts.falangesPeu, 0x35c46a);
          el.innerHTML = `<h2>La mà i el peu s’assemblen</h2>${c.book(['extremitats'])}<div class="legend"><span><i style="background:#ff9f1c"></i>carp ↔ tars</span><span><i style="background:#3d8bfd"></i>metacarp ↔ metatars</span><span><i style="background:#35c46a"></i>falanges ↔ falanges</span></div>
            <div class="note">🧭 <b>Truc per recordar</b> <span class="nb">no s’avalua</span><br>La mà i el peu tenen tres parts semblants. Els noms del peu s’assemblen als de la mà: carp → tars, metacarp → metatars, i les falanges tenen el mateix nom.</div>${c.zh('记忆技巧（不考）：手和脚结构相似：carp ↔ tars，metacarp ↔ metatars，指骨和趾骨都叫 falanges。')}`;
          c.setNext(true);
        } },
      ...c.nameGroupStages({ id: 'g3', title: 'El peu', keys: ['tars', 'metatars', 'falangesPeu'], view: 'peu', viewAlt: 'peuCostat' }),
      c.reviewStage(N, 'tot'),
      c.choiceSeries('P1', '6 · Practica', [
        { q: 'Com és el fèmur?', opts: ['Un os llarg', 'Un os curt', 'Un os pla'], a: 0, cue: 'és l’os de la cuixa, d’una extremitat.', helpText: 'Llibre p. 25, requadre «Extremitats».', units: ['U1'] },
        { q: 'On tenim molts ossos petits, les falanges?', opts: ['A les mans i als peus', 'Només a les mans', 'Al cap'], a: 0, cue: 'pensa en els dits… de la mà i de…', helpText: 'Llibre p. 25, requadre «Extremitats».', units: ['U2'] },
      ]),
      { id: 'A2-llibre', ph: '2 · Activitat 2', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Activitat 2: les zones</h2>${c.book(['zones'])}${c.ossi('Ara classificaràs ossos que ja coneixes de les lliçons 2, 3 i 4.')}${c.zh('课本活动 2：把骨头按头部、躯干、四肢分类（答案按 P25 图上名称的颜色）。')}`; c.setNext(true); } },
      c.choiceSeries('A2', '6 · Classifica per zones', ZONE_ITEMS.map(([name, z, re]) => ({ q: `A quina zona hi ha: ${name}?`, opts: Z, a: z, cue: 'pensa on és al cos: al cap, al tronc o en un braç o una cama?', demo: async () => { c.view('cos'); A.highlight(A.find(re, 'bone'), 0x2fd3ff); c.label(name, () => A.boxOf(A.find(re, 'bone')).getCenter(new c.T.Vector3())); await c.wait(2400); }, units: ['A2'] }))),
      c.spellStage(N),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const N = ['femur', 'rotula', 'tibia', 'perone', 'tars', 'metatars', 'falangesPeu'], ca = k => this.names[k].ca;
    return [
      ...c.shuffle(N).map(k => ({ id: 'loc_' + k, kind: 'loc', key: k, view: 'tot', title: 'Al model', label: 'Troba ' + ca(k) })),
      ...c.shuffle(N).slice(0, 3).map(k => ({ id: 'say_' + k, kind: 'say', key: k, view: 'tot', title: 'Digues el nom', label: 'Diu el nom: ' + ca(k) })),
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'On hi ha falanges', ca: 'Sense mirar el model: on tenim molts ossos petits, les falanges?', zq: '不看模型：哪里有很多小骨头（falanges）？', key: 'A les mans i als peus.', zkey: '评分要点：手和脚。' },
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Dibuix de la p. 25', ca: 'Obre el llibre a la pàgina 25. Tapa els noms i assenyala el fèmur, la ròtula, la tíbia, el peroné, el tars, el metatars i les falanges del peu.', zq: '打开课本第 25 页，盖住名称，指出腿和脚的 7 块骨头。', key: 'Destapa els noms del dibuix i comproveu-ho junts.', zkey: '核对方法：揭开图上的名称一起对照。七个都指对 = 说对了。' },
      ...N.map(k => ({ id: 'spell_' + k, kind: 'spell', key: k, view: 'tot', title: 'Escriu el nom', label: 'Escriu ' + ca(k) })),
    ];
  },
};
