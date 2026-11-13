// Lesson 2 · Els ossos del cap i del tronc (textbook p. 25). NAME lesson (8 names in four pairs) + what each part protects.
// maxil·lar: resolved 2026-11-13 — the school teacher uses «maxil·lar de dalt» and «maxil·lar de baix»: both jaws are the answer
// (upper jaw = maxil·les, lower jaw = mandíbula in the model). Location is scored again; either jaw counts.
// Zone of omòplat and pelvis = trunk, as coloured in the p. 25 drawing.
export default {
  id: 'l02', title: 'Els ossos del cap i del tronc 💀', subtitle: 'Lliçó 2 (llibre p. 25). Vuit noms en quatre parelles i què protegeixen. Tu manes el ritme.',
  hasReview: true, hasSay: true,
  units: {
    U1: 'Al cap hi ha els ossos del crani i els de la cara', U2: 'Els ossos del crani són plans i protegeixen el cervell',
    U3: 'La columna vertebral està formada per les vèrtebres i protegeix la medul·la espinal', U4: 'La columna, les costelles i l’estern protegeixen el cor i els pulmons',
    U5: 'Les costelles s’uneixen a la columna vertebral (vèrtebres) i a l’estern',
  },
  book: {
    cap: { p: 25, src: 'lit', where: 'text', tx: 'Cap. Hi tenim els ossos del crani i els de la cara. Els ossos del crani són plans i tenen la funció de protegir el cervell.' },
    tronc: { p: 25, src: 'lit', where: 'text', tx: 'Tronc. Hi tenim la columna vertebral, que està formada per les vèrtebres i protegeix la medul·la espinal. La columna vertebral, les costelles i l’estern protegeixen el cor i els pulmons.' },
    unio: { p: 25, src: 'act', where: 'activitat «Observa»', q: 'A quins ossos s’uneixen les costelles?', tx: 'Mirant el dibuix: a la columna vertebral (a les vèrtebres) i a l’estern.' },
    dibuix: { p: 25, src: 'lit', where: 'noms del dibuix', tx: 'crani · maxil·lar · costella · estern · vèrtebra · columna vertebral · pelvis · omòplat' },
  },
  names: {
    crani: { ca: 'crani', g: 'bone', re: /(frontal|parietal|occipital|temporal|sphenoid) bone$|^ethmoid$/, aid: 'És la part de dalt i del darrere del cap.', zh: 'crani：头顶和后脑的骨头（颅骨）。' },
    maxillar: { ca: 'maxil·lar', html: 'maxi<b>l·l</b>ar', g: 'bone', re: /^mandible$|maxilla$/, aid: 'És l’os de la boca, on hi ha les dents: hi ha el maxil·lar de dalt i el maxil·lar de baix.', zh: 'maxil·lar：嘴部长牙齿的骨头，分上面的和下面的（学校老师的说法：maxil·lar de dalt / de baix），点上颌或下颌都算对。' },
    columna: { ca: 'columna vertebral', g: 'bone', re: /vertebra$|^atlas$|^axis$|sacrum|coccyx|intervertebral disk/, aid: 'És tota la filera d’ossos del mig de l’esquena.', zh: 'columna vertebral：背部中间一整列骨头（脊柱）。' },
    vertebra: { ca: 'vèrtebra', html: 'v<b>è</b>rtebra', g: 'bone', re: /vertebra$|^atlas$|^axis$/, show: /^third lumbar vertebra$/, aid: 'És un dels ossets que, un sobre l’altre, formen la columna.', zh: 'vèrtebra：组成脊柱的一块块小骨头（椎骨）。' },
    costella: { ca: 'costella', g: 'bone', re: / rib$/, show: /^left fifth rib$/, aid: 'Són els ossos corbats que fan com una gàbia al pit.', zh: 'costella：胸部弯弯的、像笼子一样的骨头（肋骨）。' },
    estern: { ca: 'estern', g: 'bone', re: /body of sternum|manubrium|xiphoid/, aid: 'És l’os pla del mig del pit, al davant.', zh: 'estern：胸前正中间的扁骨（胸骨）。' },
    omoplat: { ca: 'omòplat', html: 'om<b>ò</b>plat', g: 'bone', re: /scapula$/, show: /^left scapula$/, aid: 'És l’os pla de l’esquena, a sota de l’espatlla.', zh: 'omòplat：背上、肩膀下面的扁骨（肩胛骨）。' },
    pelvis: { ca: 'pelvis', g: 'bone', re: /hip bone$/, aid: 'És l’os ample de sota la panxa, on comencen les cames.', zh: 'pelvis：肚子下面、连接双腿的宽骨（骨盆）。' },
  },
  views: {
    cap: c => c.frame(['crani', 'maxillar'], [.35, .05, 1], 1.5),
    capCostat: c => c.frame(['crani', 'maxillar'], [1, .05, .15], 1.5),
    columna: c => c.frame(['columna'], [1, .05, -.35], 1.08),
    troncDarrere: c => c.frame(['columna', 'omoplat', 'pelvis'], [.15, .05, -1], 1.1),
    tronc: c => c.frame(['costella', 'estern'], [.25, .05, 1], 1.2),
    troncCostat: c => c.frame(['costella', 'estern'], [1, .05, .45], 1.2),
    omoPel: c => c.frame(['omoplat', 'pelvis'], [.3, .05, -1], 1.15),
    omoPelAlt: c => c.frame(['omoplat', 'pelvis'], [1, .05, -.35], 1.15),
    tot: c => c.frame(['crani', 'maxillar', 'costella', 'estern', 'columna', 'omoplat', 'pelvis'], [.6, .05, .8], 1.05),
  },
  neutral(c) { c.A.setBoneOpacity(100); c.A.setLayer('brain', false); c.A.setLayer('spinal', false); },
  setup(c) {
    for (const k of ['allMuscle', 'muscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    c.view('tot');
  },
  stages(c) {
    const A = c.A;
    const bookStage = (id, keys, viewName, say, zhTxt, scene) => ({ id, ph: '2 · El llibre', render(el) { c.hidden(); c.view(viewName); scene && scene(); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(keys)}${say ? c.ossi(say) : ''}${c.zh(zhTxt)}`; c.setNext(true); } });
    const N = ['crani', 'maxillar', 'columna', 'vertebra', 'costella', 'estern', 'omoplat', 'pelvis'];
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { c.hidden(); c.view('tot'); el.innerHTML = `<h2>Els ossos del cap i del tronc</h2>${c.ossi('Hola! Avui aprendrem vuit noms d’ossos, de dos en dos, i veurem què protegeix cada part. Tu manes el ritme.')}${c.zh('今天学头部和躯干的 8 块骨头名称（两个一组），以及它们保护什么。')}`; c.setNext(true); } },
      // pair 1 · head
      { id: 'g1-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cap'); c.predict(el, { id: 'g1', q: 'Toca’t el cap amb les mans. Què creus que hi ha a dins, protegit pels ossos?', zhq: '摸摸自己的头：骨头里面保护着什么？', opts: ['El cervell', 'El cor', 'No ho sé'] }); } },
      bookStage('g1-llibre', ['cap'], 'cap', 'Mira: el crani és transparent i a dins hi ha el cervell (rosa).', '课本原句：头部有颅骨和面部骨；颅骨是扁骨，保护大脑。', () => { A.setLayer('brain', true); A.setBoneOpacity(35); }),
      ...c.nameGroupStages({ id: 'g1', title: 'Ossos del cap', keys: ['crani', 'maxillar'], view: 'cap', viewAlt: 'capCostat' }),
      // pair 2 · spine
      bookStage('g2-llibre', ['tronc'], 'columna', 'La medul·la espinal (groga) passa per dins de la columna vertebral, ben protegida.', '课本原句：脊柱由椎骨组成，保护脊髓；脊柱、肋骨和胸骨保护心和肺。', () => { A.setLayer('spinal', true); A.setBoneOpacity(40); }),
      ...c.nameGroupStages({ id: 'g2', title: 'La columna', keys: ['columna', 'vertebra'], view: 'columna', viewAlt: 'troncDarrere' }),
      // pair 3 · chest
      { id: 'g3-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('tronc'); c.predict(el, { id: 'g3', q: 'Toca’t el pit. Notes uns ossos corbats? On creus que s’uneixen?', zhq: '摸摸胸口，弯弯的骨头连在哪里？', opts: ['Al mig del pit i a l’esquena', 'Al cap', 'No ho sé'] }); } },
      bookStage('g3-llibre', ['tronc', 'unio'], 'tronc', 'El model no té cor ni pulmons: imagina’ls dins de la gàbia de les costelles.', '课本原句 + 活动答案：肋骨连到脊柱（椎骨）和胸骨上；它们一起保护心和肺（模型里没有心和肺）。'),
      ...c.nameGroupStages({ id: 'g3', title: 'El pit', keys: ['costella', 'estern'], view: 'tronc', viewAlt: 'troncCostat' }),
      // pair 4 · shoulder blade and pelvis
      bookStage('g4-llibre', ['dibuix'], 'omoPel', 'Al dibuix del llibre, l’omòplat i la pelvis tenen el color del tronc.', '课本 P25 图上，肩胛骨和骨盆用的是躯干的颜色。'),
      ...c.nameGroupStages({ id: 'g4', title: 'Omòplat i pelvis', keys: ['omoplat', 'pelvis'], view: 'omoPel', viewAlt: 'omoPelAlt' }),
      c.reviewStage(N, 'tot'),
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('tot'); c.recall(el, { q: 'Explica-ho en veu alta: què protegeix el crani? I la columna vertebral? I què protegeixen junts la columna, les costelles i l’estern?', keys: ['cap', 'tronc'], units: ['U2', 'U3', 'U4'], zhq: '颅骨保护什么？脊柱保护什么？脊柱、肋骨和胸骨一起保护什么？', zkey: '评分要点：颅骨—大脑；脊柱—脊髓；脊柱+肋骨+胸骨—心和肺。' }); } },
      c.choiceSeries('P1', '6 · Practica', [
        { q: 'Què hi ha al cap, a més dels ossos del crani?', opts: ['Els ossos de la cara', 'Les vèrtebres', 'Les costelles'], a: 0, cue: 'el crani és només una part del cap; a la cara també hi ha ossos.', helpText: 'Llibre p. 25, requadre «Cap».', units: ['U1'] },
        { q: 'Com són els ossos del crani?', opts: ['Plans', 'Llargs', 'Curts'], a: 0, cue: 'són com plaques que fan un casc.', helpText: 'Llibre p. 25, requadre «Cap».', units: ['U2'] },
        { q: 'De què està formada la columna vertebral?', opts: ['De vèrtebres', 'De costelles', 'De falanges'], a: 0, cue: 'el nom s’hi assembla: columna verte…', helpText: 'Llibre p. 25, requadre «Tronc».', units: ['U3'] },
        { q: 'A quins ossos s’uneixen les costelles?', opts: ['A la columna vertebral i a l’estern', 'Al crani', 'A la pelvis'], a: 0, cue: 'segueix una costella amb el dit: per davant i per darrere.', demo: async () => { c.view('troncCostat'); A.highlight(c.parts.costella, 0x2fd3ff); A.highlight(c.parts.estern, 0x35c46a); A.highlight(c.parts.columna, 0x35c46a); await c.wait(2500); }, units: ['U5'] },
        { q: 'Què protegeixen la columna, les costelles i l’estern?', opts: ['El cor i els pulmons', 'El cervell', 'Els peus'], a: 0, cue: 'són a dins del pit.', helpText: 'Llibre p. 25, requadre «Tronc».', units: ['U4'] },
      ]),
      c.spellStage(N),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const N = ['crani', 'maxillar', 'columna', 'vertebra', 'costella', 'estern', 'omoplat', 'pelvis'], ca = k => this.names[k].ca;
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Què protegeix cada part', ca: 'Sense mirar el model: què protegeix el crani? I la columna vertebral? I la columna, les costelles i l’estern junts?', zq: '不看模型：颅骨、脊柱、以及脊柱+肋骨+胸骨分别保护什么？', key: 'El crani protegeix el cervell. La columna vertebral protegeix la medul·la espinal. La columna, les costelles i l’estern protegeixen el cor i els pulmons.', zkey: '评分要点：大脑；脊髓；心和肺。' },
      ...c.shuffle(N).map(k => ({ id: 'loc_' + k, kind: 'loc', key: k, view: 'tot', title: 'Al model', label: 'Troba ' + ca(k) })),
      ...c.shuffle(N).slice(0, 3).map(k => ({ id: 'say_' + k, kind: 'say', key: k, view: 'tot', title: 'Digues el nom', label: 'Diu el nom: ' + ca(k) })),
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Dibuix de la p. 25', ca: 'Obre el llibre a la pàgina 25. Tapa els noms i assenyala el crani, el maxil·lar, una costella, l’estern, una vèrtebra, la columna vertebral, l’omòplat i la pelvis.', zq: '打开课本第 25 页，盖住名称，指出这 8 块骨头。', key: 'Destapa els noms del dibuix i comproveu-ho junts.', zkey: '核对方法：揭开图上的名称一起对照。八个都指对 = 说对了。' },
      ...N.map(k => ({ id: 'spell_' + k, kind: 'spell', key: k, view: 'tot', title: 'Escriu el nom', label: 'Escriu ' + ca(k) })),
    ];
  },
};
