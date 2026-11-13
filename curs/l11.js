// Lesson 11 · Com ens movem: la funció de relació i el sistema nerviós (textbook p. 28, + activity 5 of p. 29).
// Names: cervell, medul·la espinal, nervis (one group of 3). The signal path on the model is a TEACHING SCHEMATIC.
import { signal, orderTask } from './relacio.js';

const neutral = c => {   // bones off (so the inner parts can be tapped), nervous layers on; signal cleared
  c.A.setLayer('bone', false); c.A.setLayer('allMuscle', false); c.A.setLayer('muscle', false);
  for (const k of ['brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, true);
  c.A.setBoneOpacity(100); if (c.sig) c.sig.clear();
};
const NOTE_PATH = '〰️ El camí del senyal és un esquema per aprendre: no és el recorregut exacte d’un nervi.';
export default {
  id: 'l11', title: 'Com ens movem: el sistema nerviós 🧠', subtitle: 'Lliçó 11 (llibre p. 28). Òrgans dels sentits, sistema nerviós i aparell locomotor. Tu manes el ritme.',
  partWord: 'part', hasReview: true, hasSay: true,
  units: {
    R1: 'La funció de relació ens permet percebre el que passa al nostre voltant i reaccionar-hi de manera adequada',
    R2: 'Hi intervenen: òrgans dels sentits → sistema nerviós → aparell locomotor',
    N1: 'El sistema nerviós està format pel cervell, els nervis i la medul·la espinal',
    N2: 'Cervell: al cap, protegit pel crani; dirigeix el funcionament del cos i els moviments; pensar i recordar',
    N3: 'Nervis: porten la informació dels sentits al cervell i les ordres del cervell a l’aparell locomotor; per tot el cos',
    N4: 'Medul·la espinal: a l’esquena, protegida per la columna; amb el cervell dirigeix alguns moviments i part del funcionament',
    L1: 'Aparell locomotor: ossos i músculs treballen junts; uns músculs es contreuen i uns altres es relaxen',
    A5: 'Activitat 5: ordenar com té lloc la funció de relació',
  },
  book: {
    exterior: { p: 28, src: 'lit', where: 'text', tx: 'Les persones captem el que passa a l’exterior: hi sentim, hi veiem... També ens comuniquem, ens movem i reaccionem quan hi ha canvis que ens afecten. Així per exemple, si veiem que cau una roca i ens pot fer mal, el nostre cos respon i es mou per allunyar-se’n.' },
    relacio: { p: 28, src: 'lit', where: 'text', tx: 'La funció de relació ens permet percebre el que passa al nostre voltant i reaccionar-hi de manera adequada.' },
    elements: { p: 28, src: 'lit', where: 'text i esquema', tx: 'En la funció de relació intervenen diversos elements: Òrgans dels sentits → Sistema nerviós → Aparell locomotor.' },
    format: { p: 28, src: 'lit', where: 'text', tx: 'El sistema nerviós està format per: cervell, nervis, medul·la espinal.' },
    cervell: { p: 28, src: 'lit', where: 'text', tx: 'Cervell. És al cap i està protegit pel crani. Dirigeix el funcionament del cos i els seus moviments ens permeten pensar i recordar.' },
    nervis: { p: 28, src: 'lit', where: 'text', tx: 'Nervis. Porten informació dels òrgans dels sentits al cervell i transmeten les ordres des del cervell fins a l’aparell locomotor, que és l’encarregat del moviment. N’hi ha per tot el cos.' },
    medulla: { p: 28, src: 'lit', where: 'text', tx: 'Medul·la espinal. És a l’esquena, protegida per la columna vertebral. Juntament amb el cervell dirigeix alguns moviments del cos i part del seu funcionament.' },
    aparell: { p: 28, src: 'lit', where: 'text', tx: 'L’aparell locomotor està format pels ossos i els músculs, que treballen de manera conjunta perquè ens moguem.' },
    contreuen: { p: 28, src: 'lit', where: 'text', tx: 'Quan fem un moviment, uns músculs es contreuen mentre que uns altres es relaxen, i així mouen els ossos. Per exemple quan caminem, els músculs de les cames es contreuen i es relaxen i estiren els ossos per aconseguir que caminem.' },
    dibuix: { p: 28, src: 'lit', where: 'noms del dibuix', tx: 'cervell · medul·la espinal · nervis' },
    a5: { p: 29, src: 'act', where: 'activitat 5', q: 'Copia i ordena com té lloc la funció de relació.', tx: '1. Els òrgans dels sentits capten la informació de l’entorn. 2. La informació viatja al cervell mitjançant els nervis. 3. El cervell analitza la informació i decideix què cal fer. 4. El cervell envia ordres a través dels nervis. 5. L’aparell locomotor rep les ordres i fa els moviments.' },
  },
  names: {
    cervell: { ca: 'cervell', g: 'brain', re: /./, aid: 'És al cap, dins del crani.', zh: 'cervell：大脑，在头里，被颅骨保护。' },
    medulla: { ca: 'medul·la espinal', html: 'medu<b>l·l</b>a espinal', g: 'spinal', re: /./, aid: 'És a l’esquena, dins de la columna vertebral.', zh: 'medul·la espinal：脊髓，在背部，被脊柱保护。' },
    nervis: { ca: 'nervis', g: 'nerves', re: /./, tol: 14, aid: 'Són els fils que arriben a tot el cos: als braços, a les cames…', zh: 'nervis：神经，像线一样遍布全身。' },
  },
  views: {
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
    cosCostat: c => c.A.flyTo(new c.T.Vector3(0, .95, 0), new c.T.Vector3(.85, .12, .55).normalize().multiplyScalar(c.fitDist(.95, .55))),
    cap: c => c.A.flyTo(new c.T.Vector3(0, 1.58, 0), new c.T.Vector3(.7, .1, .7).normalize().multiplyScalar(c.fitDist(.2))),
    esquena: c => c.A.flyTo(new c.T.Vector3(0, 1.2, 0), new c.T.Vector3(.6, .1, -1).normalize().multiplyScalar(c.fitDist(.5, .35))),
    senyal: c => c.A.flyTo(new c.T.Vector3(.12, 1.3, 0), new c.T.Vector3(.55, .1, 1).normalize().multiplyScalar(c.fitDist(.48, .4))),
  },
  neutral,
  neutralPose: c => c.A.setElbow('Left', c.A.elbows.Left.restFlex),
  setup(c) {
    c.sig = c.sig || signal(c); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    neutral(c); c.view('cos');
  },
  stages(c) {
    const A = c.A, $ = c.$, sig = new Proxy({}, { get: (_, k) => c.sig[k] });   // c.sig is created in setup(), after stages()
    const bones = (op = 22) => { A.setLayer('bone', true); A.setBoneOpacity(op); };
    const hl = (key, col = 0x2fd3ff) => A.highlight(c.parts[key], col);
    const STEPS5 = ['Els òrgans dels sentits capten la informació de l’entorn.', 'La informació viatja al cervell mitjançant els nervis.', 'El cervell analitza la informació i decideix què cal fer.', 'El cervell envia ordres a través dels nervis.', 'L’aparell locomotor rep les ordres i fa els moviments.'];
    const CUES5 = ['tot comença quan notem alguna cosa amb els sentits.', 'la informació ha d’arribar al cervell: per on hi va?', 'quan la informació arriba, què fa el cervell?', 'després de decidir, el cervell envia…', 'qui fa el moviment al final?'];
    const elems = ['Òrgans dels sentits', 'Sistema nerviós', 'Aparell locomotor'];
    const demo3 = async () => { c.hidden(); c.view('senyal'); sig.prop('voluntary'); sig.glow(['eye']); c.label('òrgans dels sentits', () => A.boxOf(A.find(/./, 'eye')).getCenter(new c.T.Vector3())); await c.wait(1500); c.clearLabels(); sig.glow(['brain', 'spinal', 'nerves']); await c.wait(1500); sig.glow([]); A.setLayer('muscle', true); bones(40); await sig.bend(); await c.wait(600); c.hidden(); };
    const demo5 = async () => { c.hidden(); c.view('senyal'); await sig.all('voluntary'); await c.wait(400); c.hidden(); };
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Com ens movem</h2>${c.ossi('Hola! Ja coneixes els ossos i els músculs. Però qui els diu quan s’han de moure? Avui ho descobrirem. Tu manes el ritme.')}${c.zh('今天学：感觉器官、神经系统、运动系统怎样一起让我们动起来。')}`; c.setNext(true); } },
      { id: 'pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cos'); c.predict(el, { id: 'roca', q: 'Imagina que veus caure una roca cap a tu. Què creus que passa primer?', zhq: '想象你看到一块石头朝你掉下来。你觉得最先发生的是什么？', opts: ['Els ulls la veuen', 'Les cames s’aparten', 'No ho sé'] }); } },
      { id: 'relacio', ph: '2–4 · La funció de relació', render(el) {
          c.stepper(el, [
            { scene: () => c.view('cos'), html: `${c.book(['exterior', 'relacio'])}${c.zh('课本原句：我们能感知外界，并做出适当反应——这就是「关系功能」。例：看到石头掉下来，身体会躲开。')}` },
            { scene: () => { c.view('senyal'); sig.prop('voluntary'); sig.glow(['eye']); }, html: `${c.book(['elements'])}<div class="spell">① Òrgans dels sentits</div>${c.ossi('Els ulls són òrgans dels sentits: veuen el que passa. Ara mira al teu voltant: què veus?')}${c.zh('① 感觉器官（比如眼睛）发现外面发生的事。')}` },
            { scene: () => { c.view('cos'); sig.glow(['brain', 'spinal', 'nerves']); }, html: `<div class="spell">② Sistema nerviós</div>${c.ossi('El sistema nerviós rep el que han captat els sentits i dona les ordres.')}${c.zh('② 神经系统接收信息并发出命令。')}` },
            { scene: () => { c.view('senyal'); bones(40); A.setLayer('muscle', true); }, html: `<div class="spell">③ Aparell locomotor</div>${c.book(['aparell', 'contreuen'])}${c.ossi('Toca el botó: el múscul es contreu i mou l’os. Després fes-ho tu amb el teu braç!')}<button class="opt go" id="bendL">💪 Mou el braç</button>${c.zh('③ 运动系统（骨骼和肌肉）做出动作：一些肌肉收缩，另一些放松，带动骨头。点按钮看手臂动。')}` },
          ], { title: 'Qui hi intervé', after: () => c.hidden() });
          const hook = () => { const b = $('bendL'); if (b) b.onclick = async () => { b.disabled = true; await sig.bend(); await c.wait(500); A.setElbow('Left', A.elbows.Left.restFlex); b.disabled = false; }; };
          new MutationObserver(hook).observe(el, { childList: true }); hook();
        } },
      { id: 'ordre3', ph: '5 · Ordena-ho tu', recall: true, render(el) {
          c.hidden(); c.view('cos'); c.setNext(false);
          const box = document.createElement('div'); el.innerHTML = '<h2>Ordena-ho tu</h2>'; el.appendChild(box);
          orderTask(c, box, { q: 'Toca els tres elements en l’ordre en què intervenen.', items: elems, cues: ['què ha de passar primer: notar el que passa o moure’s?', 'abans de moure’ns, algú ha de rebre la informació i decidir.', 'qui fa el moviment?'], demo: demo3, units: ['R2'] });
          box.addEventListener('done', () => c.setNext(true), { once: true });
        } },
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Què ens permet fer la funció de relació?', keys: ['relacio'], units: ['R1'], zhq: '关系功能让我们能做什么？', zkey: '评分要点：感知周围发生的事，并做出适当反应。' }); } },
      { id: 'g1-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cos'); c.predict(el, { id: 'g1', q: 'El sistema nerviós té tres parts. Una és al cap. On creus que són les altres?', zhq: '神经系统有三部分，一部分在头里。你觉得另外两部分在哪？', opts: ['A l’esquena i per tot el cos', 'Només a les mans', 'No ho sé'] }); } },
      { id: 'g1-llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['format', 'dibuix'])}${c.ossi('Al model hem amagat els ossos i els músculs perquè puguis veure el sistema nerviós.')}${c.zh('课本原句：神经系统由大脑、神经和脊髓组成。模型里暂时隐藏了骨头和肌肉。')}`; c.setNext(true); } },
      ...c.nameGroupStages({ id: 'g1', title: 'El sistema nerviós', keys: ['cervell', 'medulla', 'nervis'], view: 'cos', viewAlt: 'cosCostat' }),
      c.reviewStage(['cervell', 'medulla', 'nervis'], 'cos'),
      { id: 'parts', ph: '2–4 · Què fa cada part', render(el) {
          c.stepper(el, [
            { scene: () => { c.view('cap'); bones(25); hl('cervell'); }, html: `<div class="spell">cervell</div>${c.book(['cervell'])}${c.ossi('Mira: el crani (transparent) envolta el cervell i el protegeix. Toca’t el cap: a dins hi ha el teu cervell!')}${c.zh('课本原句：大脑在头里，被颅骨保护；它指挥身体的运作和动作，让我们能思考和记忆。')}` },
            { scene: () => { c.view('esquena'); bones(25); hl('medulla'); }, html: `<div class="spell">medul·la espinal</div>${c.book(['medulla'])}${c.ossi('La columna vertebral (transparent) protegeix la medul·la. Toca’t l’esquena: a dins de la columna hi ha la teva medul·la!')}${c.zh('课本原句：脊髓在背部，被脊柱保护；它和大脑一起指挥身体的一些动作和部分运作。')}` },
            { scene: () => { c.view('cos'); hl('nervis', 0xffd23f); }, html: `<div class="spell">nervis</div>${c.book(['nervis'])}${c.ossi('Mira quants n’hi ha! Arriben fins a les puntes dels dits.')}${c.zh('课本原句：神经把感觉器官的信息送到大脑，再把大脑的命令传到运动系统；全身都有神经。')}` },
          ], { title: 'Què fa cada part', after: () => c.hidden() });
        } },
      { id: 'R2', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'On és el cervell i què el protegeix? I la medul·la espinal?', keys: ['cervell', 'medulla'], units: ['N2', 'N4'], zhq: '大脑在哪里、被什么保护？脊髓呢？', zkey: '评分要点：大脑在头里、颅骨保护；脊髓在背部、脊柱保护。' }); } },
      { id: 'R3', ph: '5 · Explica-ho tu', recall: true, render(el) { c.recall(el, { q: 'Què porten els nervis, i d’on a on?', keys: ['nervis'], units: ['N3'], zhq: '神经传送什么？从哪里到哪里？', zkey: '评分要点：把感觉器官的信息送到大脑；把大脑的命令送到运动系统。' }); } },
      { id: 'cami', ph: '3–4 · El camí de la informació', render(el) {
          const S5 = [
            { scene: () => { c.view('senyal'); sig.prop('voluntary'); sig.glow(['eye']); }, html: `<div class="spell">1</div><div class="q">${c.esc(STEPS5[0])}</div>${c.ossi('Al model, els ulls veuen una llum verda.')}` },
            { scene: () => { c.view('senyal'); sig.prop('voluntary'); sig.leg('voluntary', 0); }, html: `<div class="spell">2</div><div class="q">${c.esc(STEPS5[1])}</div>` },
            { scene: () => { c.view('senyal'); sig.prop('voluntary'); sig.upto('voluntary', 1); sig.leg('voluntary', 1); }, html: `<div class="spell">3</div><div class="q">${c.esc(STEPS5[2])}</div>` },
            { scene: () => { c.view('senyal'); sig.prop('voluntary'); sig.upto('voluntary', 2); sig.leg('voluntary', 2, { move: false }); }, html: `<div class="spell">4</div><div class="q">${c.esc(STEPS5[3])}</div>` },
            { scene: () => { c.view('senyal'); bones(40); A.setLayer('muscle', true); sig.prop('voluntary'); sig.upto('voluntary', 3); sig.bend(); }, html: `<div class="spell">5</div><div class="q">${c.esc(STEPS5[4])}</div>` },
          ].map(x => ({ ...x, html: x.html + `<div class="note">📘 p. 29 · activitat 5 (frases del llibre, aquí ja ordenades)</div><div class="note">${NOTE_PATH}</div>${c.zh('信息传递示意（路径只是教学示意，不是真实神经的精确走向）。')}` }));
          c.stepper(el, S5, { title: 'El camí de la informació', after: () => c.hidden() });
        } },
      { id: 'A5', ph: '5 · Activitat 5', recall: true, render(el) {
          c.hidden(); c.view('cos'); c.setNext(false);
          const box = document.createElement('div'); el.innerHTML = `<h2>Activitat 5 (p. 29)</h2>`; el.appendChild(box);
          orderTask(c, box, { q: 'Ordena com té lloc la funció de relació: toca les frases de la primera a l’última.', items: STEPS5, cues: CUES5, demo: demo5, units: ['A5'] });
          box.addEventListener('done', () => c.setNext(true), { once: true });
        } },
      c.choiceSeries('P1', '6 · Practica', [
        { q: 'Quines parts formen el sistema nerviós?', opts: ['El cervell, els nervis i la medul·la espinal', 'El cervell, els ossos i els músculs', 'Els ulls, el nas i les orelles'], a: 0, cue: 'són les tres parts que has trobat al model.', helpText: 'Llibre p. 28: «El sistema nerviós està format per…».', units: ['N1'] },
        { q: 'Què protegeix el cervell?', opts: ['El crani', 'La columna vertebral', 'Les costelles'], a: 0, cue: 'el cervell és al cap.', helpText: 'Llibre p. 28, «Cervell».', units: ['N2'] },
        { q: 'Què protegeix la medul·la espinal?', opts: ['La columna vertebral', 'El crani', 'L’estern'], a: 0, cue: 'la medul·la és a l’esquena.', helpText: 'Llibre p. 28, «Medul·la espinal».', units: ['N4'] },
        { q: 'Què porten els nervis des del cervell fins a l’aparell locomotor?', opts: ['Les ordres', 'La informació dels sentits', 'Els ossos'], a: 0, cue: 'cap al cervell hi va la informació; des del cervell surten…', helpText: 'Llibre p. 28, «Nervis».', units: ['N3'] },
        { q: 'Qui és l’encarregat del moviment?', opts: ['L’aparell locomotor', 'Els òrgans dels sentits', 'El crani'], a: 0, cue: 'està format pels ossos i els músculs.', helpText: 'Llibre p. 28, «Nervis» i «L’aparell locomotor».', units: ['L1'] },
        { q: 'Com mouen els ossos els músculs?', opts: ['Uns músculs es contreuen mentre uns altres es relaxen', 'Tots els músculs es contreuen alhora', 'Els ossos es mouen sols'], a: 0, cue: 'recorda el braç: un múscul treballa i l’altre…', helpText: 'Llibre p. 28: «Quan fem un moviment…».', units: ['L1'] },
      ]),
      c.spellStage(['cervell', 'medulla', 'nervis']),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const ca = k => this.names[k].ca;
    const STEPS5 = ['Els òrgans dels sentits capten la informació de l’entorn.', 'La informació viatja al cervell mitjançant els nervis.', 'El cervell analitza la informació i decideix què cal fer.', 'El cervell envia ordres a través dels nervis.', 'L’aparell locomotor rep les ordres i fa els moviments.'];
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho (sense model)', label: 'Funció de relació', ca: 'Amb les teves paraules: què és la funció de relació i quins tres elements hi intervenen?', zq: '用自己的话：什么是关系功能？哪三个部分参与？', key: 'Ens permet percebre el que passa al nostre voltant i reaccionar-hi. Hi intervenen els òrgans dels sentits, el sistema nerviós i l’aparell locomotor.', zkey: '评分要点：感知并做出反应；感觉器官 → 神经系统 → 运动系统。' },
      { id: 'oral2', kind: 'oral', title: 'Explica-ho (sense model)', label: 'Les tres parts', ca: 'Digues les tres parts del sistema nerviós: on és cadascuna i què fa.', zq: '说出神经系统的三部分：各在哪里、做什么。', key: 'Cervell: al cap, protegit pel crani; dirigeix el cos i els moviments, pensar i recordar. Medul·la espinal: a l’esquena, dins la columna; amb el cervell dirigeix alguns moviments. Nervis: per tot el cos; porten la informació al cervell i les ordres a l’aparell locomotor.', zkey: '评分要点：大脑（头、颅骨、指挥、思考记忆）；脊髓（背、脊柱、和大脑一起指挥部分动作）；神经（全身、传信息和命令）。' },
      ...c.shuffle(['cervell', 'medulla', 'nervis']).map(k => ({ id: 'loc_' + k, kind: 'loc', key: k, view: 'cosCostat', title: 'Al model', label: 'Troba ' + ca(k) })),
      { id: 'a5', kind: 'custom', title: 'Ordena', label: 'Activitat 5: ordre', run: (box, done) => { const sig = c.sig; orderTask(c, box, { q: 'Ordena com té lloc la funció de relació.', items: STEPS5, cues: ['tot comença amb els sentits.', 'la informació viatja al cervell…', 'el cervell analitza i…', 'el cervell envia…', 'qui fa el moviment?'], demo: async () => { c.view('senyal'); await sig.all('voluntary'); sig.clear(); }, onResult: done }); } },
      ...['cervell', 'medulla', 'nervis'].map(k => ({ id: 'spell_' + k, kind: 'spell', key: k, view: 'cos', title: 'Escriu el nom', label: 'Escriu ' + ca(k) })),
    ];
  },
};
