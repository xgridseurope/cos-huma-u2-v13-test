// Lesson 8 · Els músculs del cap i del tronc (textbook p. 27). NAME lesson: 9 names in 4 groups (2 + 3 + 2 + 2).
// Zones follow the label colours of the p. 27 drawing (blue = cap, orange = tronc). The drawing colours deltoide, trapezi,
// esternoclidomastoidal and gluti as tronc: said once, never asked as a «which zone» question (the book has no activity on it).
const M = 'allMuscle';
const fs = (c, keys, dir, pad) => {   // frame the shown (left) parts; dir.x > 0 = towards the model's left side
  const ms = keys.flatMap(k => c.showParts[k]), b = c.A.boxOf(ms), m = b.getCenter(new c.T.Vector3()), sz = b.getSize(new c.T.Vector3());
  const s = Math.sign(m.x) || 1;
  c.A.flyTo(m, new c.T.Vector3(dir[0] * s, dir[1], dir[2]).normalize().multiplyScalar(c.fitDist(sz.y / 2 * pad, Math.max(sz.x, sz.z) / 2 * pad)));
};
export default {
  id: 'l08', title: 'Els músculs del cap i del tronc 🙂', subtitle: 'Lliçó 8 (llibre p. 27). Nou noms de músculs en quatre grups petits. Tu manes el ritme.',
  partWord: 'múscul', hasReview: true, hasSay: true,
  units: { U1: 'Cap: músculs plans i anulars; per parlar, mastegar i gesticular', U2: 'Tronc: músculs grans i plans; mantenen dreta la columna i la flexionen, protegeixen l’abdomen i ajuden a respirar' },
  book: {
    musculatura: { p: 27, src: 'lit', where: 'text', tx: 'La musculatura està formada per més de 600 músculs esquelètics que es distribueixen en tres zones del cos.' },
    cap: { p: 27, src: 'lit', where: 'text', tx: 'Cap. Hi ha músculs plans i anulars. Els utilitzem per parlar, mastegar i gesticular.' },
    tronc: { p: 27, src: 'lit', where: 'text', tx: 'Tronc. Té músculs grans i plans. Mantenen dreta la columna vertebral i la flexionen, protegeixen els òrgans de l’abdomen i ens ajuden a respirar.' },
    dibuix: { p: 27, src: 'lit', where: 'noms del dibuix', tx: 'orbicular de les parpelles · masseter · esternoclidomastoidal · deltoide · trapezi · dorsal · pectoral · abdominal · gluti' },
    colors: { p: 27, src: 'dib', where: 'colors dels noms', tx: 'Al dibuix, els noms del cap són blaus i els del tronc són taronja. L’esternoclidomastoidal, el deltoide, el trapezi i el gluti també estan pintats de color tronc.' },
  },
  names: {
    orbicular: { ca: 'orbicular de les parpelles', g: M, re: /orbicularis oculi/, show: /left (orbital|palpebral) part of orbicularis oculi/, aid: 'És el múscul en forma d’anell al voltant de l’ull.', zh: 'orbicular de les parpelles：眼睛周围环形的肌肉（眼轮匝肌）。' },
    masseter: { ca: 'masseter', g: M, re: /masseter/, show: /^left (deep|superficial) part of masseter$/, aid: 'És el múscul de la galta, damunt de la mandíbula. El notes si estrenys les dents.', zh: 'masseter：脸颊上、下颌骨上方的肌肉，咬紧牙齿能摸到（咬肌）。' },
    ecm: { ca: 'esternoclidomastoidal', g: M, re: /sternocleidomastoid/, show: /^left sternocleidomastoid$/, aid: 'És el múscul del costat del coll, de darrere l’orella fins a l’estern.', zh: 'esternoclidomastoidal：脖子侧面、从耳后斜到胸骨的肌肉（胸锁乳突肌）。' },
    trapezi: { ca: 'trapezi', g: M, re: /trapezius/, show: /part of left trapezius/, aid: 'És el múscul gran i pla de dalt de l’esquena i del clatell.', zh: 'trapezi：背上部和后颈的大块扁平肌肉（斜方肌）。' },
    deltoide: { ca: 'deltoide', g: M, re: /deltoid/, show: /part of left deltoid/, aid: 'És el múscul arrodonit de l’espatlla.', zh: 'deltoide：肩膀上圆圆的肌肉（三角肌）。' },
    pectoral: { ca: 'pectoral', g: M, re: /pectoralis major/, show: /part of left pectoralis major/, aid: 'És el múscul gran del pit.', zh: 'pectoral：胸前的大块肌肉（胸大肌）。' },
    abdominal: { ca: 'abdominal', g: M, re: /rectus abdominis/, neutral: /external oblique/, neutralMsg: 'Aquest també és un múscul de la panxa, el del costat. Al dibuix del llibre (p. 27), la línia d’«abdominal» va al del mig, el que va de dalt a baix. Busca’l!', show: /^left rectus abdominis$/, aid: 'És el múscul de la panxa, al davant.', zh: 'abdominal：肚子前面的肌肉（腹肌）。' },
    dorsal: { ca: 'dorsal', g: M, re: /latissimus dorsi/, show: /^left latissimus dorsi$/, aid: 'És el múscul gran i pla del costat de l’esquena, a sota de l’aixella.', zh: 'dorsal：背部两侧、腋下的大块扁平肌肉（背阔肌）。' },
    gluti: { ca: 'gluti', g: M, re: /gluteus maximus/, show: /^left gluteus maximus$/, aid: 'És el múscul gran de les natges.', zh: 'gluti：屁股上的大块肌肉（臀大肌）。' },
  },
  views: {
    cap: c => fs(c, ['orbicular', 'masseter'], [.35, .05, 1], 2.2),
    capCostat: c => fs(c, ['orbicular', 'masseter'], [1, .1, .5], 2.2),
    coll: c => fs(c, ['ecm', 'trapezi', 'deltoide'], [1, .65, .15], 1.15),
    collDarrere: c => fs(c, ['ecm', 'trapezi', 'deltoide'], [1, .35, -.35], 1.15),
    davant: c => fs(c, ['pectoral', 'abdominal'], [.3, .05, 1], 1.25),
    davantCostat: c => fs(c, ['pectoral', 'abdominal'], [1, .05, .6], 1.25),
    darrere: c => fs(c, ['dorsal', 'gluti'], [.3, .05, -1], 1.15),
    darrereCostat: c => fs(c, ['dorsal', 'gluti'], [1, .05, -.5], 1.15),
    totDavant: c => c.A.flyTo(new c.T.Vector3(0, 1.25, 0), new c.T.Vector3(.35, .05, 1).normalize().multiplyScalar(c.fitDist(.52, .4))),
    totDarrere: c => c.A.flyTo(new c.T.Vector3(0, 1.2, 0), new c.T.Vector3(.35, .05, -1).normalize().multiplyScalar(c.fitDist(.58, .4))),
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
    const N = ['orbicular', 'masseter', 'ecm', 'trapezi', 'deltoide', 'pectoral', 'abdominal', 'dorsal', 'gluti'];
    const bookStage = (id, keys, viewName, say, zhTxt) => ({ id, ph: '2 · El llibre', render(el) { c.hidden(); c.view(viewName); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(keys)}${say ? c.ossi(say) : ''}${c.zh(zhTxt)}`; c.setNext(true); } });
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Els músculs del cap i del tronc</h2>${c.ossi('Hola! Avui aprendrem nou noms de músculs del cap i del tronc, en quatre grups petits. Després de cada grup els buscarem i els direm.')}${c.zh('今天学头部和躯干的 9 块肌肉名称，分四组。')}`; c.setNext(true); } },
      bookStage('llibre', ['musculatura', 'dibuix', 'colors'], 'cos', 'Al dibuix del llibre cada zona té el seu color.', '课本内容·中文意译：全身 600 多块骨骼肌分布在三个区域。图上头部名称是蓝色，躯干是橙色（胸锁乳突肌、三角肌、斜方肌、臀大肌也画成躯干色）。'),
      { id: 'g1-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cap'); c.predict(el, { id: 'g1', q: 'Tanca els ulls ben fort i després estreny les dents. Creus que fas servir músculs de la cara?', zhq: '用力闭眼，再咬紧牙齿。你觉得用到了脸上的肌肉吗？', opts: ['Sí', 'No', 'No ho sé'] }); } },
      bookStage('g1-llibre', ['cap'], 'cap', 'L’orbicular de les parpelles és un múscul anular, com a la lliçó 7.', '课本内容·中文意译：头部有扁平肌和环形肌，用来说话、咀嚼和做表情。'),
      ...c.nameGroupStages({ id: 'g1', title: 'Músculs del cap', keys: ['orbicular', 'masseter'], view: 'cap', viewAlt: 'capCostat' }),
      bookStage('g2-llibre', ['tronc'], 'collDarrere', 'Ara, el coll i l’espatlla. El llibre els pinta de color tronc.', '课本内容·中文意译：躯干有大而扁平的肌肉：让脊柱保持直立并能弯曲，保护腹部器官，帮助我们呼吸。'),
      ...c.nameGroupStages({ id: 'g2', title: 'Coll i espatlla', keys: ['ecm', 'trapezi', 'deltoide'], view: 'collDarrere', viewAlt: 'coll' }),
      { id: 'g3-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('davant'); c.predict(el, { id: 'g3', q: 'Posa la mà a la panxa i respira fort. Creus que els músculs del tronc t’ajuden a respirar?', zhq: '把手放在肚子上用力呼吸。你觉得躯干的肌肉帮你呼吸吗？', opts: ['Sí', 'No', 'No ho sé'] }); } },
      ...c.nameGroupStages({ id: 'g3', title: 'Pit i panxa', keys: ['pectoral', 'abdominal'], view: 'davant', viewAlt: 'davantCostat' }),
      ...c.nameGroupStages({ id: 'g4', title: 'Esquena i natges', keys: ['dorsal', 'gluti'], view: 'darrere', viewAlt: 'darrereCostat' }),
      { id: 'mapa', ph: '2 · Tots junts', render(el) { c.hidden(); c.view('totDavant'); c.nameLabels(['orbicular', 'masseter', 'ecm', 'deltoide', 'pectoral', 'abdominal']); el.innerHTML = `<h2>Tots junts</h2>${c.ossi('Mira’ls tots. Gira el model per veure també el trapezi, el dorsal i el gluti, a l’esquena.')}${c.zh('全部名称一起看，转动模型看背面的斜方肌、背阔肌、臀大肌。')}`; c.setNext(true); } },
      c.reviewStage(N, 'totDavant', k => ['trapezi', 'dorsal', 'gluti'].includes(k) ? 'totDarrere' : 'totDavant'),
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Per a què fem servir els músculs del cap? I què fan els músculs del tronc?', keys: ['cap', 'tronc'], units: ['U1', 'U2'], zhq: '头部肌肉用来做什么？躯干肌肉有什么作用？', zkey: '评分要点：头部——说话、咀嚼、做表情；躯干——让脊柱直立并弯曲、保护腹部器官、帮助呼吸。' }); } },
      c.choiceSeries('P1', '6 · Practica', [
        { q: 'Quins tipus de músculs hi ha al cap?', opts: ['Plans i anulars', 'Llargs i curts', 'Només curts'], a: 0, cue: 'pensa en l’orbicular de les parpelles: té forma d’anell.', helpText: 'Llibre p. 27, requadre «Cap».', units: ['U1'] },
        { q: 'Per a què fem servir els músculs del cap?', opts: ['Per parlar, mastegar i gesticular', 'Per caminar', 'Per aguantar la columna'], a: 0, cue: 'pensa en el masseter quan menges.', helpText: 'Llibre p. 27, requadre «Cap».', units: ['U1'] },
        { q: 'Com són els músculs del tronc?', opts: ['Grans i plans', 'Petits i curts', 'En forma d’anell'], a: 0, cue: 'pensa en el dorsal: és com una làmina gran.', helpText: 'Llibre p. 27, requadre «Tronc».', units: ['U2'] },
        { q: 'Què NO fan els músculs del tronc, segons el llibre?', opts: ['Mastegar', 'Ajudar a respirar', 'Mantenir dreta la columna'], a: 0, cue: 'mastegar ho fan els músculs del cap.', helpText: 'Llibre p. 27, requadres «Cap» i «Tronc».', units: ['U2'] },
      ]),
      c.spellStage(N),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const N = ['orbicular', 'masseter', 'ecm', 'trapezi', 'deltoide', 'pectoral', 'abdominal', 'dorsal', 'gluti'], ca = k => this.names[k].ca;
    const vw = k => ['trapezi', 'dorsal', 'gluti'].includes(k) ? 'totDarrere' : 'totDavant';
    return [
      ...c.shuffle(N).map(k => ({ id: 'loc_' + k, kind: 'loc', key: k, view: vw(k), title: 'Al model', label: 'Troba ' + ca(k) })),
      ...c.shuffle(N).slice(0, 3).map(k => ({ id: 'say_' + k, kind: 'say', key: k, view: vw(k), title: 'Digues el nom', label: 'Diu el nom: ' + ca(k) })),
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Cap i tronc', ca: 'Sense mirar el model: per a què fem servir els músculs del cap? I els del tronc?', zq: '不看模型：头部肌肉和躯干肌肉各有什么用？', key: 'Cap: parlar, mastegar i gesticular. Tronc: mantenen dreta la columna i la flexionen, protegeixen l’abdomen i ajuden a respirar.', zkey: '评分要点：头部——说话、咀嚼、表情；躯干——脊柱直立和弯曲、保护腹部、呼吸。' },
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Dibuix de la p. 27', ca: 'Obre el llibre a la pàgina 27. Tapa els noms i assenyala els nou músculs del cap i del tronc.', zq: '打开课本第 27 页，盖住名称，指出头部和躯干的 9 块肌肉。', key: 'Destapa els noms del dibuix i comprova-ho tu mateix/a.', zkey: '核对方法：揭开图上的名称自己对照。九个都指对 = 说对了。' },
      ...N.map(k => ({ id: 'spell_' + k, kind: 'spell', key: k, view: vw(k), title: 'Escriu el nom', label: 'Escriu ' + ca(k) })),
    ];
  },
};
