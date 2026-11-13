// Lesson 12 · Moviments voluntaris i reflexos (textbook p. 29). PRINCIPLE lesson, no names.
// Each process is taught step by step with the book's own sentences and examples (traffic light; hot cup).
// Reflex: limited to what the book says («En molts d'aquests moviments no intervé el cervell, sinó la medul·la espinal»).
// The model cannot walk: the voluntary order is shown by bending the arm (stated on screen). Paths are a teaching schematic.
import { signal, orderTask } from './relacio.js';

const neutral = c => {
  c.A.setLayer('allMuscle', false); c.A.setLayer('muscle', true);
  for (const k of ['brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, true);
  c.A.setLayer('bone', true); c.A.setBoneOpacity(30); if (c.sig) c.sig.clear();
};
const NOTE = '〰️ El camí del senyal és un esquema per aprendre: no és el recorregut exacte d’un nervi.';
const VOL = ['Un òrgan dels sentits capta un estímul i envia la informació al cervell.', 'El cervell identifica l’estímul i decideix què fer.', 'El cervell envia ordres a través dels nervis als músculs. Els músculs fan els moviments.'];
const REF = ['Un òrgan dels sentits capta un estímul i envia la informació a la medul·la espinal.', 'La medul·la espinal rep la informació.', 'La medul·la envia les ordres pels nervis als músculs, que fan el moviment de manera immediata.'];
export default {
  id: 'l12', title: 'Moviments voluntaris i reflexos ⚡', subtitle: 'Lliçó 12 (llibre p. 29). Com fem un moviment que decidim i un moviment reflex. Tu manes el ritme.',
  units: {
    V0: 'Moviments voluntaris: els fem voluntàriament i de manera conscient',
    V1: 'Voluntari: sentit capta l’estímul → cervell identifica i decideix → cervell envia ordres pels nervis als músculs, que fan el moviment',
    F0: 'Moviments reflexos: involuntaris i ràpids; en molts no intervé el cervell, sinó la medul·la espinal',
    F1: 'Reflex: sentit capta l’estímul → medul·la rep la informació → medul·la envia ordres pels nervis als músculs (moviment immediat)',
    C1: 'Distingir els dos moviments amb els exemples del llibre',
  },
  book: {
    vol: { p: 29, src: 'lit', where: 'text', tx: 'Molts dels moviments els fem voluntàriament i de manera conscient. Són moviments voluntaris.' },
    v1: { p: 29, src: 'lit', where: 'dibuix 1', tx: VOL[0] }, v2: { p: 29, src: 'lit', where: 'dibuix 2', tx: VOL[1] }, v3: { p: 29, src: 'lit', where: 'dibuix 3', tx: VOL[2] },
    vEx: { p: 29, src: 'dib', where: 'dibuixos 1–3', tx: 'Exemple del llibre: la nena veu el semàfor vermell; quan es posa verd, travessa el carrer.' },
    ref: { p: 29, src: 'lit', where: 'text', tx: 'Hi ha moviments que fem de manera involuntària i ràpida, són moviments reflexos. En molts d’aquests moviments no intervé el cervell, sinó la medul·la espinal.' },
    r1: { p: 29, src: 'lit', where: 'dibuix 1', tx: REF[0] }, r2: { p: 29, src: 'lit', where: 'dibuix 2', tx: REF[1] }, r3: { p: 29, src: 'lit', where: 'dibuix 3', tx: REF[2] },
    rEx: { p: 29, src: 'dib', where: 'dibuixos 1–3', tx: 'Exemple del llibre: el nen toca una tassa calenta i aparta la mà de cop.' },
  },
  names: {},
  views: {
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
    senyal: c => c.A.flyTo(new c.T.Vector3(.12, 1.3, 0), new c.T.Vector3(.55, .1, 1).normalize().multiplyScalar(c.fitDist(.48, .4))),
    reflex: c => c.A.flyTo(new c.T.Vector3(.15, 1.15, .05), new c.T.Vector3(.75, .1, 1).normalize().multiplyScalar(c.fitDist(.55, .4))),
  },
  neutral,
  neutralPose: c => c.A.setElbow('Left', c.A.elbows.Left.restFlex),
  setup(c) {
    c.sig = c.sig || signal(c); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    neutral(c); c.view('cos');
  },
  stages(c) {
    const A = c.A, sig = new Proxy({}, { get: (_, k) => c.sig[k] });   // c.sig is created in setup(), after stages()
    const card = (type, i, html) => ({
      scene: () => { c.view(type === 'reflex' ? 'reflex' : 'senyal'); sig.prop(type); sig.upto(type, i); sig.leg(type, i); },
      html: `<div class="spell">${i + 1}</div>${html}<div class="note">${NOTE}</div>`,
    });
    const order = (id, ph, type) => ({ id, ph, recall: true, render(el) {
      c.hidden(); c.view('cos'); c.setNext(false);
      const box = document.createElement('div'); el.innerHTML = `<h2>Ordena els passos</h2>`; el.appendChild(box);
      const R = type === 'reflex';
      orderTask(c, box, { q: R ? 'Moviment reflex: toca els passos en ordre.' : 'Moviment voluntari: toca els passos en ordre.', items: R ? REF : VOL,
        cues: R ? ['tot comença quan la mà nota alguna cosa.', 'on arriba primer la informació en aquest moviment?', 'qui fa el moviment al final?'] : ['tot comença quan els ulls veuen alguna cosa.', 'qui decideix què fer?', 'qui fa el moviment al final?'],
        demo: async () => { c.view(R ? 'reflex' : 'senyal'); await sig.all(type); await c.wait(400); c.hidden(); }, units: [R ? 'F1' : 'V1'] });
      box.addEventListener('done', () => c.setNext(true), { once: true });
    } });
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Moviments voluntaris i reflexos</h2>${c.ossi('Hola! Hi ha moviments que decidim i moviments que passen tot sols, molt de pressa. Avui veurem com funciona cadascun. Tu manes el ritme.')}${c.zh('今天学：自主运动和反射运动的完整过程。')}`; c.setNext(true); } },
      { id: 'v-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cos'); c.predict(el, { id: 'vol', q: 'Quan el semàfor es posa verd i travesses el carrer, qui creus que decideix moure les cames?', zhq: '红绿灯变绿、你过马路时，你觉得是谁决定让腿动起来？', opts: ['El cervell', 'Les cames soles', 'No ho sé'] }); } },
      { id: 'v-llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('cos'); el.innerHTML = `<h2>Moviments voluntaris</h2>${c.book(['vol', 'vEx'])}<div class="note">⚠️ El model no pot caminar: per mostrar les ordres als músculs, doblegarà el braç.</div>${c.zh('课本内容·中文意译：很多动作是我们自愿、有意识地做的，叫自主运动。课本例子：女孩看红绿灯，绿灯时过马路。模型不能走路，用弯曲手臂来示意。')}`; c.setNext(true); } },
      { id: 'v-passos', ph: '3–4 · Pas a pas', render(el) {
          c.stepper(el, [
            card('voluntary', 0, `${c.book(['v1'])}${c.ossi('Els ulls veuen la llum verda del semàfor. Mira tu també alguna cosa verda!')}${c.zh('① 感觉器官发现刺激，把信息送到大脑。')}`),
            card('voluntary', 1, `${c.book(['v2'])}${c.ossi('El cervell pensa: «Verd! Ja puc passar.» Ara decideix tu: aixeca la mà quan vulguis.')}${c.zh('② 大脑识别刺激，决定做什么。')}`),
            card('voluntary', 2, `${c.book(['v3'])}${c.ossi('Les ordres baixen pels nervis fins als músculs, i el braç es mou.')}${c.zh('③ 大脑通过神经把命令送到肌肉，肌肉做出动作。')}`),
          ], { title: 'Moviment voluntari', after: () => c.hidden() });
        } },
      order('v-ordre', '5 · Ordena-ho tu', 'voluntary'),
      { id: 'v-explica', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Explica com fem un moviment voluntari, pas a pas. Pots fer servir l’exemple del semàfor.', keys: ['v1', 'v2', 'v3'], units: ['V0', 'V1'], zhq: '一步一步说说自主运动是怎样发生的（可以用红绿灯的例子）。', zkey: '评分要点：①感觉器官发现刺激并送信息到大脑 ②大脑识别、决定 ③大脑通过神经把命令送到肌肉，肌肉做动作。' }); } },
      { id: 'r-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('reflex'); c.predict(el, { id: 'ref', q: 'Si toques una tassa que crema, què creus que passa?', zhq: '如果你碰到一个很烫的杯子，你觉得会怎样？', opts: ['La mà s’aparta de cop, sense pensar-hi', 'Primer penso i després aparto la mà', 'No ho sé'] }); } },
      { id: 'r-llibre', ph: '2 · El llibre', render(el) { c.hidden(); c.view('reflex'); el.innerHTML = `<h2>Moviments reflexos</h2>${c.book(['ref', 'rEx'])}${c.ossi('Fixa’t: el llibre diu «en molts», no en tots.')}${c.zh('课本内容·中文意译：有些动作是不自主而且很快的，叫反射运动。很多反射运动不经过大脑，而是由脊髓负责（注意：课本说的是「很多」，不是全部）。课本例子：男孩碰到热杯子，一下子把手缩回。')}`; c.setNext(true); } },
      { id: 'r-passos', ph: '3–4 · Pas a pas', render(el) {
          c.stepper(el, [
            card('reflex', 0, `${c.book(['r1'])}${c.ossi('La mà toca la tassa calenta. La informació va cap a la medul·la espinal.')}${c.zh('① 感觉器官发现刺激，把信息送到脊髓。')}`),
            card('reflex', 1, `${c.book(['r2'])}${c.ossi('En aquest exemple, la informació arriba a la medul·la espinal, a l’esquena.')}${c.zh('② 脊髓接收信息。')}`),
            card('reflex', 2, `${c.book(['r3'])}${c.ossi('Les ordres van pels nervis als músculs i la mà s’aparta de cop!')}${c.zh('③ 脊髓通过神经把命令送到肌肉，肌肉立刻做出动作。')}`),
          ], { title: 'Moviment reflex', after: () => c.hidden() });
        } },
      order('r-ordre', '5 · Ordena-ho tu', 'reflex'),
      { id: 'r-explica', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Explica com fem un moviment reflex, pas a pas. Pots fer servir l’exemple de la tassa.', keys: ['ref', 'r1', 'r2', 'r3'], units: ['F0', 'F1'], zhq: '一步一步说说反射运动是怎样发生的（可以用热杯子的例子）。', zkey: '评分要点：不自主、很快；①感觉器官把信息送到脊髓 ②脊髓接收 ③脊髓通过神经把命令送到肌肉，立刻动作。' }); } },
      c.choiceSeries('P1', '6 · Practica', [
        { q: 'La nena veu que el semàfor es posa verd i travessa el carrer. Quin moviment és?', opts: ['Voluntari', 'Reflex'], a: 0, cue: 'ella mira, pensa i decideix quan passa.', helpText: 'Llibre p. 29, dibuixos dels moviments voluntaris.', units: ['C1'] },
        { q: 'El nen toca una tassa calenta i aparta la mà de cop. Quin moviment és?', opts: ['Voluntari', 'Reflex'], a: 1, cue: 'passa molt de pressa i sense pensar-hi.', helpText: 'Llibre p. 29, dibuixos dels moviments reflexos.', units: ['C1'] },
        { q: 'En un moviment voluntari, qui identifica l’estímul i decideix què fer?', opts: ['El cervell', 'La medul·la espinal', 'Els músculs'], a: 0, cue: 'decidir és feina de…', helpText: 'Llibre p. 29, pas 2 del moviment voluntari.', units: ['V1'] },
        { q: 'En el moviment reflex de la tassa, on arriba la informació?', opts: ['A la medul·la espinal', 'Als ossos', 'Als ulls'], a: 0, cue: 'en molts reflexos no intervé el cervell, sinó…', helpText: 'Llibre p. 29, pas 1 del moviment reflex.', units: ['F1'] },
        { q: 'Com són els moviments reflexos?', opts: ['Involuntaris i ràpids', 'Voluntaris i conscients', 'Lents i pensats'], a: 0, cue: 'pensa en la mà que s’aparta de cop.', helpText: 'Llibre p. 29: «Hi ha moviments que fem…».', units: ['F0'] },
        { q: 'En tots dos moviments, qui fa el moviment?', opts: ['Els músculs', 'Els nervis', 'Els òrgans dels sentits'], a: 0, cue: 'els nervis porten les ordres a…', helpText: 'Llibre p. 29, últim pas de cada moviment.', units: ['V1', 'F1'] },
      ]),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const ord = (id, label, type) => ({ id, kind: 'custom', title: 'Ordena', label, run: (box, done) => { const R = type === 'reflex', sig = c.sig;
      orderTask(c, box, { q: (R ? 'Moviment reflex' : 'Moviment voluntari') + ': toca els passos en ordre.', items: R ? REF : VOL, cues: R ? ['tot comença amb el tacte.', 'on arriba la informació?', 'qui fa el moviment?'] : ['tot comença amb la vista.', 'qui decideix?', 'qui fa el moviment?'],
        demo: async () => { c.view(R ? 'reflex' : 'senyal'); await sig.all(type); sig.clear(); }, onResult: done }); } });
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho (sense model)', label: 'Moviment voluntari', ca: 'Amb les teves paraules: com fem un moviment voluntari? Explica els tres passos.', zq: '用自己的话说说自主运动的三个步骤。', key: '1. Un òrgan dels sentits capta un estímul i envia la informació al cervell. 2. El cervell l’identifica i decideix què fer. 3. El cervell envia ordres pels nervis als músculs, que fan el moviment.', zkey: '评分要点：感觉器官→大脑；大脑识别并决定；大脑经神经命令肌肉。' },
      { id: 'oral2', kind: 'oral', title: 'Explica-ho (sense model)', label: 'Moviment reflex', ca: 'Ara un moviment reflex: com és i quins passos té?', zq: '再说说反射运动：它是什么样的？有哪几步？', key: 'És involuntari i ràpid. 1. Un òrgan dels sentits capta un estímul i envia la informació a la medul·la espinal. 2. La medul·la rep la informació. 3. La medul·la envia les ordres pels nervis als músculs, que fan el moviment de manera immediata.', zkey: '评分要点：不自主、快；感觉器官→脊髓；脊髓接收；脊髓经神经命令肌肉，立刻动作。' },
      ord('ord_v', 'Ordre: voluntari', 'voluntary'),
      ord('ord_r', 'Ordre: reflex', 'reflex'),
      { id: 'c_tassa', kind: 'choice', title: 'Pregunta', label: 'Exemple de la tassa', q: 'El nen toca una tassa calenta i aparta la mà de cop. Quin moviment és?', opts: ['Voluntari', 'Reflex'], a: 1, cue: 'passa de pressa i sense pensar-hi.', helpText: 'Mira el llibre, p. 29.' },
      { id: 'c_decideix', kind: 'choice', title: 'Pregunta', label: 'Qui decideix', q: 'En un moviment voluntari, qui decideix què fer?', opts: ['El cervell', 'La medul·la espinal', 'Els músculs'], a: 0, cue: 'decidir és feina de…', helpText: 'Mira el llibre, p. 29.' },
    ];
  },
};
