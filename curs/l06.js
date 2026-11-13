// Lesson 6 · El sistema muscular (textbook p. 26, top + first sentence of p. 27). PRINCIPLE lesson.
// What the system includes, what it does (3 functions), muscles are elastic, skeletal muscles, tendons.
// The «Pensa» question of p. 26 has no answer in the book: discussed, never scored.
const F = (c, re) => c.A.find(re, 'allMuscle');
const RE = {
  respira: /rectus abdominis|external oblique|^left (deep|superficial) part of masseter$/,
  posicio: /trapezius|latissimus dorsi|iliocostalis|longissimus|spinalis/,
  cara: /orbicularis|zygomaticus|frontalis|risorius|depressor|levator labii|mentalis|corrugator/,
  tendo: /^left calcaneal tendon$/,
  besso: /left gastrocnemius|^left soleus$/,
};
export default {
  id: 'l06', title: 'El sistema muscular 💪', subtitle: 'Lliçó 6 (llibre p. 26–27). Què és el sistema muscular, per a què serveix, els músculs elàstics i els tendons.',
  partWord: 'múscul',
  units: {
    U1: 'El sistema muscular inclou els músculs i els tendons',
    U2: 'Produeix moviments per a les funcions vitals, manté la posició i permet la mímica',
    U3: 'La mímica: els gestos corporals que serveixen per expressar els sentiments',
    U4: 'Els músculs són òrgans elàstics: es poden encongir i estirar sense trencar-se',
    U5: 'Els músculs de l’aparell locomotor són els músculs esquelètics (més de 600)',
    U6: 'Molts músculs s’uneixen als ossos amb els tendons, cordons de teixit molt resistent',
  },
  book: {
    inclou: { p: 26, src: 'lit', where: 'text', tx: 'El sistema muscular inclou els músculs i els tendons del cos.' },
    funcions: { p: 26, src: 'lit', where: 'text', tx: 'Aquest sistema produeix els moviments necessaris per fer les funcions vitals, manté la posició i permet la mímica, que és el conjunt de gestos corporals que serveixen per expressar els sentiments.' },
    elastics: { p: 26, src: 'lit', where: 'text', tx: 'Els músculs són òrgans elàstics que es poden encongir i estirar sense trencar-se.' },
    figura: { p: 26, src: 'lit', where: 'noms del dibuix', tx: 'múscul relaxat · múscul contret' },
    esqueletics: { p: 26, src: 'lit', where: 'text', tx: 'Els músculs que formen part de l’aparell locomotor reben el nom de músculs esquelètics.' },
    tendons: { p: 26, src: 'lit', where: 'text', tx: 'Molts músculs s’uneixen als ossos mitjançant els tendons, cordons de teixit molt resistent.' },
    sis_cents: { p: 27, src: 'lit', where: 'text', tx: 'La musculatura està formada per més de 600 músculs esquelètics que es distribueixen en tres zones del cos.' },
    pensa: { p: 26, src: 'act', where: 'CientíficaMENT · Pensa', q: 'Creieu que es pot comparar el funcionament d’un múscul amb el d’una goma elàstica o una molla? Per què?', tx: 'El llibre no dona la resposta: és per pensar i comentar. Una idea per comentar (deducció del text): com una goma, el múscul es pot encongir i estirar sense trencar-se.' },
  },
  names: {},
  views: {
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
    darrere: c => c.A.flyTo(new c.T.Vector3(0, 1.0, 0), new c.T.Vector3(0, .12, -c.fitDist(.8, .5))),
    cara: c => c.A.flyTo(new c.T.Vector3(0, 1.6, .03), new c.T.Vector3(.25, .05, 1).normalize().multiplyScalar(c.fitDist(.15))),
    braç: c => { const b = c.A.boxOf(c.A.find(/^left (humerus|ulna|radius)$/, 'bone')), m = b.getCenter(new c.T.Vector3()); c.A.flyTo(m, new c.T.Vector3(.35, .1, 1).normalize().multiplyScalar(c.fitDist(.36))); },
    taló: c => { const b = c.A.boxOf(F(c, RE.tendo)), m = b.getCenter(new c.T.Vector3()); c.A.flyTo(m, new c.T.Vector3(.8, .15, -1).normalize().multiplyScalar(c.fitDist(.22))); },
  },
  neutral(c) { c.A.setLayer('allMuscle', true); },
  neutralPose: c => { c.A.setBulge(1); c.A.setElbow('Left', c.A.elbows.Left.restFlex); },
  setup(c) {
    for (const k of ['muscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setLayer('allMuscle', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    c.view('cos');
  },
  stages(c) {
    const A = c.A, $ = c.$;
    const hl = (re, col = 0x2fd3ff) => A.highlight(F(c, re), col);
    const at = re => () => A.boxOf(F(c, re)).getCenter(new c.T.Vector3());
    let bent = false;
    const armOnly = () => { A.setLayer('allMuscle', false); A.setLayer('muscle', true); A.setBulge(0); };   // the full musculature is static: only biceps/triceps bend with the elbow
    const armBack = () => { bent = false; A.setElbow('Left', A.elbows.Left.restFlex); A.setLayer('muscle', false); A.setLayer('allMuscle', true); A.setBulge(1); };
    const tendonDemo = async () => { c.view('taló'); hl(RE.tendo, 0xffd23f); hl(RE.besso, 0xff5c8a); c.label('tendó', at(RE.tendo)); c.label('múscul', at(RE.besso)); await c.wait(2600); c.clearLabels(); };
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { armBack(); c.hidden(); c.view('cos'); el.innerHTML = `<h2>El sistema muscular</h2>${c.ossi('Hola! Ja coneixes els ossos. Avui descobrirem els músculs: què són, per a què serveixen i com s’uneixen als ossos. Tu manes el ritme.')}${c.zh('今天学：肌肉系统包括什么、有什么作用、肌肉有弹性、肌腱。')}`; c.setNext(true); } },
      { id: 'pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('braç'); c.predict(el, { id: 'mou', q: 'Fes força amb el braç i toca’l. Què creus que el fa moure?', zhq: '用力弯手臂摸一摸。你觉得是什么让手臂动起来？', opts: ['Els músculs', 'Només els ossos', 'No ho sé'] }); } },
      { id: 'inclou', ph: '2 · El llibre', render(el) {
          c.hidden(); c.view('cos'); let on = true;
          el.innerHTML = `<h2>Què és el sistema muscular</h2>${c.book(['inclou', 'esqueletics', 'sis_cents'])}${c.ossi('Toca el botó per treure i posar els músculs. Els ossos queden a sota!')}
            <button class="opt go" id="tgmus">🦴 Treu els músculs</button>${c.zh('课本内容·中文意译：肌肉系统包括全身的肌肉和肌腱。属于运动系统的肌肉叫骨骼肌；全身有 600 多块骨骼肌，分布在三个区域。')}`;
          $('tgmus').onclick = () => { on = !on; A.setLayer('allMuscle', on); $('tgmus').textContent = on ? '🦴 Treu els músculs' : '💪 Posa els músculs'; c.setNext(true); };
          c.setNext(false);
        } },
      { id: 'funcions', ph: '2–4 · Per a què serveix', render(el) {
          c.stepper(el, [
            { scene: () => c.view('cos'), html: `${c.book(['funcions'])}${c.ossi('El llibre diu tres feines. Les mirarem una per una.')}${c.zh('课本内容·中文意译：这个系统产生完成生命活动所需的动作，保持姿势，并让我们能做表情——表情就是用来表达情感的身体动作。')}` },
            { scene: () => { c.view('cos'); hl(RE.respira, 0x35c46a); }, html: `<div class="spell">① funcions vitals</div>${c.ossi('Respirar i mastegar també són moviments! Posa la mà a la panxa i respira fort: notes com es mou?')}<div class="note">📘 A la p. 27 el llibre diu que els músculs del tronc ens ajuden a respirar i que els del cap serveixen per mastegar.</div>${c.zh('① 生命活动所需的动作（例：呼吸、咀嚼——见课本 P27）。')}` },
            { scene: () => { c.view('darrere'); hl(RE.posicio, 0xff9f1c); }, html: `<div class="spell">② la posició</div>${c.ossi('Aquests músculs de l’esquena ens aguanten drets. Posa’t ben dret o dreta: ara treballen!')}${c.zh('② 保持姿势（背部肌肉让我们站直）。')}` },
            { scene: () => { c.view('cara'); hl(RE.cara, 0xff5c8a); }, html: `<div class="spell">③ la mímica</div>${c.ossi('Amb els músculs de la cara fem cares. Fes cara de content, d’enfadat i de sorpresa davant d’un mirall!')}${c.zh('③ 做表情：用面部肌肉表达高兴、生气、惊讶等情感。')}` },
          ], { title: 'Les feines dels músculs', after: () => c.hidden() });
        } },
      { id: 'elastics', ph: '3–4 · Músculs elàstics', render(el) {
          c.hidden(); armOnly(); c.view('braç'); bent = false;
          el.innerHTML = `<h2>Els músculs són elàstics</h2>${c.book(['elastics', 'figura'])}${c.ossi('Toca el botó: el braç es doblega i el múscul de davant s’encongeix. Torna-hi i s’estira. Es pot encongir i estirar sense trencar-se.')}
            <button class="opt go" id="bend">💪 Doblega el braç</button><div class="note">⚠️ Al model només es mouen els músculs del braç. Com treballen junts el bíceps i el tríceps ho veuràs a la lliçó 10.</div>${c.zh('课本内容·中文意译：肌肉是有弹性的器官，能收缩和拉长而不会断。图：放松的肌肉 · 收缩的肌肉。点按钮弯曲和伸直手臂。')}`;
          let n = 0;
          $('bend').onclick = () => { bent = !bent; n++; A.setElbow('Left', bent ? 95 : A.elbows.Left.restFlex); $('bend').textContent = bent ? '👋 Estira el braç' : '💪 Doblega el braç'; if (n >= 2) c.setNext(true); };
          c.setNext(false);
        } },
      { id: 'tendons', ph: '3–4 · Els tendons', render(el) {
          armBack(); c.hidden(); c.view('taló'); hl(RE.tendo, 0xffd23f); hl(RE.besso, 0xff5c8a); c.label('tendó', at(RE.tendo)); c.label('múscul', at(RE.besso));
          el.innerHTML = `<h2>Els tendons</h2>${c.book(['tendons'])}${c.ossi('El cordó groc és un tendó: uneix el múscul de la cama (rosa) amb l’os del taló. Toca’t el taló per darrere: aquest cordó dur és el teu tendó!')}
            ${c.curio('Aquest tendó del taló es diu tendó d’Aquil·les.')}${c.zh('课本内容·中文意译：很多肌肉通过肌腱连在骨头上，肌腱是非常结实的组织索。黄色的是脚跟上的肌腱（趣闻不考：它叫跟腱）。')}`;
          c.setNext(true);
        } },
      { id: 'pensa', ph: '4 · Pensa (no s’avalua)', recall: true, render(el) {
          c.hidden(); c.view('cos');
          el.innerHTML = `<h2>Pensa</h2><div class="q">${c.esc('Creieu que es pot comparar el funcionament d’un múscul amb el d’una goma elàstica o una molla? Per què?')}</div>${c.ossi('Pensa-ho i comenta-ho amb la família. No hi ha nota!')}
            <button class="opt go" id="said">🗣️ Ja ho hem comentat</button><div id="chk"></div>${c.zh('课本 P26 思考题：肌肉的工作方式能和橡皮筋或弹簧相比吗？为什么？（课本没有标准答案，不计分）')}`;
          $('said').onclick = () => { $('said').remove(); $('chk').innerHTML = c.book(['pensa']); c.setNext(true); };
          c.setNext(false);
        } },
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Explica en veu alta: què inclou el sistema muscular i quines tres coses fa?', keys: ['inclou', 'funcions'], units: ['U1', 'U2'], zhq: '说说肌肉系统包括什么，有哪三个作用。', zkey: '评分要点：肌肉和肌腱；产生生命活动所需的动作、保持姿势、做表情。' }); } },
      { id: 'R2', ph: '5 · Explica-ho tu', recall: true, render(el) { c.recall(el, { q: 'Què vol dir que els músculs són elàstics? I què és un tendó?', keys: ['elastics', 'tendons'], units: ['U4', 'U6'], zhq: '肌肉有弹性是什么意思？肌腱是什么？', zkey: '评分要点：能收缩和拉长而不断；肌腱把肌肉连在骨头上，是很结实的组织索。' }); } },
      c.choiceSeries('P1', '6 · Practica', [
        { q: 'Què inclou el sistema muscular?', opts: ['Els músculs i els tendons', 'Els ossos i les articulacions', 'El cervell i els nervis'], a: 0, cue: 'té dues parts: els músculs i uns cordons que els uneixen als ossos.', helpText: 'Llibre p. 26, primera frase.', units: ['U1'] },
        { q: 'Què és la mímica?', opts: ['Els gestos corporals que serveixen per expressar els sentiments', 'Una manera de respirar', 'Un tipus de múscul'], a: 0, cue: 'pensa en les cares que has fet davant del mirall.', helpText: 'Llibre p. 26, segona frase.', units: ['U3'] },
        { q: 'Què poden fer els músculs sense trencar-se?', opts: ['Encongir-se i estirar-se', 'Doblegar-se com un os', 'Res: no es mouen'], a: 0, cue: 'recorda el braç que es doblegava i s’estirava.', helpText: 'Llibre p. 26: «Els músculs són òrgans elàstics…».', units: ['U4'] },
        { q: 'Com es diuen els músculs de l’aparell locomotor?', opts: ['Músculs esquelètics', 'Tendons', 'Articulacions'], a: 0, cue: 'el nom s’assembla a «esquelet».', helpText: 'Llibre p. 26: «…reben el nom de…».', units: ['U5'] },
        { q: 'Què uneix molts músculs als ossos?', opts: ['Els tendons', 'Els lligaments', 'Els nervis'], a: 0, cue: 'els lligaments uneixen os amb os (lliçó 5). I múscul amb os?', helpText: 'Llibre p. 26: «…mitjançant els tendons…».', units: ['U6'] },
        { q: 'Quants músculs esquelètics tenim?', opts: ['Més de 600', 'Més de 200', 'Uns 60'], a: 0, cue: 'en tenim molts més que ossos (més de 200).', helpText: 'Llibre p. 27, primera frase.', units: ['U5'] },
        { q: 'Què és la part groga?', opts: ['Un tendó', 'Un múscul', 'Un os'], a: 0, subject: () => { c.view('taló'); hl(RE.tendo, 0xffd23f); }, cue: 'és un cordó que uneix el múscul de la cama amb l’os del taló.', demo: tendonDemo, units: ['U6'] },
      ]),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const A = c.A;
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Què inclou', ca: 'Sense mirar el model: què inclou el sistema muscular?', zq: '不看模型：肌肉系统包括什么？', key: 'Els músculs i els tendons del cos.', zkey: '评分要点：肌肉和肌腱。' },
      { id: 'oral2', kind: 'oral', title: 'Explica-ho', label: 'Tres feines', ca: 'Digues les tres feines del sistema muscular.', zq: '说出肌肉系统的三个作用。', key: 'Produeix els moviments per fer les funcions vitals, manté la posició i permet la mímica.', zkey: '评分要点：生命活动的动作、保持姿势、做表情。' },
      { id: 'oral3', kind: 'oral', title: 'Explica-ho', label: 'Músculs elàstics', ca: 'Què vol dir que els músculs són òrgans elàstics?', zq: '肌肉是有弹性的器官是什么意思？', key: 'Que es poden encongir i estirar sense trencar-se.', zkey: '评分要点：能收缩、拉长，不会断。' },
      { id: 'tendo', kind: 'choice', title: 'Pregunta', label: 'Tendons i lligaments', q: 'Què uneix molts músculs als ossos?', opts: ['Els tendons', 'Els lligaments', 'Els nervis'], a: 0, cue: 'els lligaments uneixen os amb os.', helpText: 'Mira el llibre, p. 26.' },
      { id: 'mimica', kind: 'choice', title: 'Pregunta', label: 'Mímica', q: 'Què és la mímica?', opts: ['Els gestos corporals que serveixen per expressar els sentiments', 'Una manera de respirar', 'Un tipus de múscul'], a: 0, cue: 'pensa en les cares que fem.', helpText: 'Mira el llibre, p. 26.' },
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Llibre p. 26', ca: 'Obre el llibre a la pàgina 26. Mira el dibuix del múscul relaxat i del múscul contret i explica què li passa al múscul.', zq: '打开课本第 26 页，看「放松的肌肉」和「收缩的肌肉」两张图，说说肌肉发生了什么变化。', key: 'Segons el dibuix: el múscul contret s’encongeix (es fa més curt) i el relaxat està estirat. No es trenca: és elàstic.', zkey: '评分要点：收缩时变短（缩起来），放松时变长；有弹性不会断。' },
    ];
  },
};
