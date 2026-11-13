// Lesson 9 · Els músculs de les extremitats (textbook p. 27). NAME lesson: 6 names in 3 pairs.
// Bíceps and tríceps: only name and place here; how they work as a pair is lesson 10 (not repeated).
// Activity 3 of p. 27 («Explica quines característiques…») has no answer in the book: answer built from the p. 26 text, marked as such.
const M = 'allMuscle';
const face = (k, front) => c => { const b = c.A.boxOf(c.showParts[k]), m = b.getCenter(new c.T.Vector3()); m.z = b.min.z + (b.max.z - b.min.z) * (front ? .7 : .3); return m; };   // label towards the front / back face
const fs = (c, keys, dir, pad) => {
  const ms = keys.flatMap(k => c.showParts[k]), b = c.A.boxOf(ms), m = b.getCenter(new c.T.Vector3()), sz = b.getSize(new c.T.Vector3());
  const s = Math.sign(m.x) || 1;
  c.A.flyTo(m, new c.T.Vector3(dir[0] * s, dir[1], dir[2]).normalize().multiplyScalar(c.fitDist(sz.y / 2 * pad, Math.max(sz.x, sz.z) / 2 * pad)));
};
export default {
  id: 'l09', title: 'Els músculs dels braços i de les cames 🦵', subtitle: 'Lliçó 9 (llibre p. 27). Sis noms de músculs de les extremitats, en tres parelles. Tu manes el ritme.',
  partWord: 'múscul', hasReview: true, hasSay: true,
  units: { U1: 'Extremitats: molts músculs són llargs; mouen els braços, les cames, les mans i els peus', A3: 'Activitat 3: les característiques dels músculs que permeten el moviment' },
  book: {
    extremitats: { p: 27, src: 'lit', where: 'text', tx: 'Extremitats. Molts dels seus músculs són llargs. Mouen els braços, les cames, les mans i els peus.' },
    dibuix: { p: 27, src: 'lit', where: 'noms del dibuix', tx: 'bíceps · tríceps · quàdriceps · bíceps femoral · tibial · bessó' },
    act3: { p: 27, src: 'act', where: 'activitat 3', q: 'Explica quines característiques dels músculs els permeten produir moviment.', tx: 'El llibre no dona la resposta; es construeix amb el text de la p. 26: els músculs són elàstics (es poden encongir i estirar sense trencar-se) i molts s’uneixen als ossos mitjançant els tendons.' },
  },
  names: {
    biceps: { labelAt: face('biceps', true), ca: 'bíceps', html: 'b<b>í</b>ceps', g: 'muscle', re: /biceps brachii/, show: /left biceps brachii/, aid: 'És el múscul de davant del braç, entre l’espatlla i el colze.', zh: 'bíceps：上臂前面的肌肉（肱二头肌）。' },
    triceps: { labelAt: face('triceps', false), ca: 'tríceps', html: 'tr<b>í</b>ceps', g: 'muscle', re: /triceps brachii/, show: /left triceps brachii/, aid: 'És el múscul de darrere del braç.', zh: 'tríceps：上臂后面的肌肉（肱三头肌）。' },
    quadriceps: { labelAt: face('quadriceps', true), ca: 'quàdriceps', html: 'qu<b>à</b>driceps', g: M, re: /rectus femoris|vastus (lateralis|medialis|intermedius)/, show: /^left (rectus femoris|vastus (lateralis|medialis))$/, aid: 'És el múscul gran de davant de la cuixa.', zh: 'quàdriceps：大腿前面的大肌肉（股四头肌）。' },
    bicepsFem: { labelAt: face('bicepsFem', false), ca: 'bíceps femoral', html: 'b<b>í</b>ceps femoral', g: M, re: /biceps femoris/, show: /head of left biceps femoris/, aid: 'És a la part de darrere de la cuixa.', zh: 'bíceps femoral：大腿后面的肌肉（股二头肌）。' },
    tibial: { labelAt: face('tibial', true), ca: 'tibial', g: M, re: /tibialis anterior/, show: /^left tibialis anterior$/, aid: 'És a davant de la cama, al costat de l’os tíbia.', zh: 'tibial：小腿前面、胫骨旁边的肌肉（胫骨前肌）。' },
    besso: { labelAt: face('besso', false), ca: 'bessó', html: 'bess<b>ó</b>', g: M, re: /gastrocnemius/, show: /head of left gastrocnemius/, aid: 'És el múscul de darrere de la cama, la panxa de la cama.', zh: 'bessó：小腿后面鼓起的肌肉（腓肠肌）。' },
  },
  views: {
    braç: c => fs(c, ['biceps', 'triceps'], [1, .1, .2], 1.35),
    braçDarrere: c => fs(c, ['biceps', 'triceps'], [1, -.45, .05], 1.35),
    cuixa: c => fs(c, ['quadriceps', 'bicepsFem'], [1, .05, .35], 1.2),
    cuixaDarrere: c => fs(c, ['quadriceps', 'bicepsFem'], [1, .4, -.15], 1.2),
    cama: c => fs(c, ['tibial', 'besso'], [1, .05, .3], 1.2),
    camaDarrere: c => fs(c, ['tibial', 'besso'], [1, .35, -.2], 1.2),
    totDavant: c => c.A.flyTo(new c.T.Vector3(.12, .8, 0), new c.T.Vector3(.6, .05, 1).normalize().multiplyScalar(c.fitDist(.85, .45))),
    totDarrere: c => c.A.flyTo(new c.T.Vector3(.12, .8, 0), new c.T.Vector3(.6, .05, -1).normalize().multiplyScalar(c.fitDist(.85, .45))),
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
  },
  neutral(c) { c.A.setLayer('allMuscle', true); },
  setup(c) {
    for (const k of ['muscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setLayer('allMuscle', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    c.view('cos');
  },
  stages(c) {
    const N = ['biceps', 'triceps', 'quadriceps', 'bicepsFem', 'tibial', 'besso'];
    const back = k => ['triceps', 'bicepsFem', 'besso'].includes(k);
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Els músculs de les extremitats</h2>${c.ossi('Hola! Avui aprendrem sis noms de músculs dels braços i de les cames, en tres parelles.')}${c.zh('今天学四肢的 6 块肌肉名称，分三组，每组两个。')}`; c.setNext(true); } },
      { id: 'llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('totDavant'); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['extremitats', 'dibuix'])}${c.ossi('Recordes els músculs llargs de la lliçó 7? A les extremitats n’hi ha molts.')}${c.zh('课本内容·中文意译：四肢的很多肌肉是长肌，它们让手臂、腿、手和脚动起来。')}`; c.setNext(true); } },
      { id: 'g1-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('braç'); c.predict(el, { id: 'g1', q: 'Toca’t el braç per davant i per darrere i doblega’l. Creus que hi ha un múscul a cada banda?', zhq: '摸摸上臂前面和后面，再弯一弯。你觉得前后各有一块肌肉吗？', opts: ['Sí, un a cada banda', 'Només un al davant', 'No ho sé'] }); } },
      { id: 'g1-l10', ph: '2 · Del braç', render(el) { c.hidden(); c.view('braç'); el.innerHTML = `<h2>El bíceps i el tríceps</h2>${c.ossi('Aquí només aprendrem el nom i on són. Com treballen junts per doblegar i estirar el braç ho veuràs a la lliçó 10.')}${c.zh('这里只学名称和位置；二头肌和三头肌怎样配合弯曲、伸直手臂，在第 10 课学。')}`; c.setNext(true); } },
      ...c.nameGroupStages({ id: 'g1', title: 'El braç', keys: ['biceps', 'triceps'], view: 'braç', viewAlt: 'braçDarrere' }),
      ...c.nameGroupStages({ id: 'g2', title: 'La cuixa', keys: ['quadriceps', 'bicepsFem'], view: 'cuixa', viewAlt: 'cuixaDarrere' }),
      { id: 'g2-truc', ph: '2 · Truc', render(el) { c.hidden(); c.view('cuixa'); el.innerHTML = `<h2>Dos «bíceps»</h2>${c.memo('Hi ha dos bíceps: el bíceps del braç i el bíceps femoral de la cuixa. «Femoral» s’assembla a «fèmur», l’os de la cuixa.')}${c.zh('记忆技巧（不考）：有两个 bíceps——手臂的 bíceps 和大腿的 bíceps femoral；femoral 和大腿骨 fèmur 很像。')}`; c.setNext(true); } },
      ...c.nameGroupStages({ id: 'g3', title: 'La cama', keys: ['tibial', 'besso'], view: 'cama', viewAlt: 'camaDarrere' }),
      { id: 'g3-truc', ph: '2 · Truc', render(el) { c.hidden(); c.view('cama'); el.innerHTML = `<h2>Tibial i tíbia</h2>${c.memo('El múscul tibial és al costat de l’os tíbia (lliçó 4).')}${c.zh('记忆技巧（不考）：胫骨前肌 tibial 在胫骨 tíbia 旁边。')}`; c.setNext(true); } },
      c.reviewStage(N, 'totDavant', k => back(k) ? 'totDarrere' : 'totDavant'),
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Com són molts músculs de les extremitats i què mouen?', keys: ['extremitats'], units: ['U1'], zhq: '四肢的很多肌肉是什么样的？它们让什么动？', zkey: '评分要点：很多是长肌；让手臂、腿、手和脚动起来。' }); } },
      { id: 'R2', ph: '5 · Activitat 3', recall: true, render(el) { c.recall(el, { q: 'Activitat 3: explica quines característiques dels músculs els permeten produir moviment.', keys: ['act3'], units: ['A3'], zhq: '活动 3：说说肌肉的哪些特点让它们能产生动作。', zkey: '评分要点（课本无标准答案，按 P26 原文）：肌肉有弹性，能收缩和拉长不断；很多肌肉通过肌腱连在骨头上。' }); } },
      c.spellStage(N),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const N = ['biceps', 'triceps', 'quadriceps', 'bicepsFem', 'tibial', 'besso'], ca = k => this.names[k].ca;
    const vw = k => ['triceps', 'bicepsFem', 'besso'].includes(k) ? 'totDarrere' : 'totDavant';
    return [
      ...c.shuffle(N).map(k => ({ id: 'loc_' + k, kind: 'loc', key: k, view: vw(k), title: 'Al model', label: 'Troba ' + ca(k) })),
      ...c.shuffle(N).slice(0, 3).map(k => ({ id: 'say_' + k, kind: 'say', key: k, view: vw(k), title: 'Digues el nom', label: 'Diu el nom: ' + ca(k) })),
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Extremitats', ca: 'Sense mirar el model: com són molts músculs de les extremitats i què mouen?', zq: '不看模型：四肢的很多肌肉是什么样的，让什么动？', key: 'Molts són llargs. Mouen els braços, les cames, les mans i els peus.', zkey: '评分要点：很多是长肌；手臂、腿、手、脚。' },
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Dibuix de la p. 27', ca: 'Obre el llibre a la pàgina 27. Tapa els noms i assenyala els sis músculs dels braços i de les cames.', zq: '打开课本第 27 页，盖住名称，指出四肢的 6 块肌肉。', key: 'Destapa els noms del dibuix i comproveu-ho junts.', zkey: '核对方法：揭开图上的名称一起对照。六个都指对 = 说对了。' },
      ...N.map(k => ({ id: 'spell_' + k, kind: 'spell', key: k, view: vw(k), title: 'Escriu el nom', label: 'Escriu ' + ca(k) })),
    ];
  },
};
