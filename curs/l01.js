// Lesson 1 · El sistema esquelètic (textbook pp. 24–25). PRINCIPLE lesson: what the skeleton is, its jobs,
// what bones are like (rigid AND alive) and the three types of bones. All sentences checked against the p. 24/25 photos.
const show = (c, re, col = 0x2fd3ff) => c.A.highlight(c.A.find(re, 'bone'), col);
export const RE = {   // exported only so tools/probe_test.mjs can check it against tools/expected/answer_key.json
  llargs: /^left (humerus|ulna|radius|femur|tibia|fibula)$/, curts: /^(?!intervertebral).*vertebra$|^atlas$|^axis$/, plans: /(frontal|parietal|occipital|temporal|sphenoid) bone$|^ethmoid$/,
  braç: /^left (humerus|ulna|radius)$/, columnaCames: /vertebra$|sacrum|hip bone|femur|tibia|fibula/, crani: /(frontal|parietal|occipital|temporal|sphenoid) bone$|^ethmoid$/, costelles: / rib$|body of sternum|manubrium|xiphoid/,
  radi: /^left radius$/, omoplat: /^left scapula$/, maxillar: /^mandible$/, falanges: /phalanx of left (thumb|.*finger)/, tibia: /^left tibia$/, vertebra: /^third lumbar vertebra$/, crani1: /(frontal|parietal|occipital|temporal|sphenoid) bone$|^ethmoid$/,
};
export default {
  id: 'l01', title: 'El sistema esquelètic 🦴', subtitle: 'Lliçó 1 (llibre p. 24–25): per a què serveix l’esquelet, com són els ossos i quins tipus n’hi ha. Uns 15 minuts.',
  hasReview: false, hasSay: false,
  units: {
    U1: 'L’aparell locomotor = sistema esquelètic + sistema muscular', U2: 'El sistema esquelètic el formen els ossos, que componen l’esquelet',
    U3: 'Intervé en el moviment del cos', U4: 'Dona forma i suporta el pes del cos', U5: 'Protegeix dels cops els òrgans interns',
    U6: 'Els ossos són òrgans rígids i resistents', U7: 'Els ossos són òrgans vius: creixen i necessiten nutrients',
    U8: 'Més de 200 ossos, en tres zones', U9: 'Tres tipus: llargs, curts i plans',
  },
  book: {
    aparell: { p: 24, src: 'lit', where: 'text', tx: 'L’aparell locomotor permet el moviment del nostre cos. Està format pel sistema esquelètic i el sistema muscular.' },
    sistema: { p: 24, src: 'lit', where: 'text', tx: 'El sistema esquelètic el formen els ossos, que componen l’esquelet. Aquest sistema intervé en el moviment del cos, dona forma i suporta el pes del cos, protegeix dels cops els òrgans interns…' },
    ossos: { p: 24, src: 'lit', where: 'text', tx: 'Els ossos són òrgans rígids i resistents. Tots els ossos del cos formen l’esquelet. Tot i el seu aspecte rígid, els ossos són òrgans vius que creixen i necessiten nutrients.' },
    vius: { p: 25, src: 'act', where: 'activitat 1', q: 'Explica per què diem que els ossos són òrgans vius.', tx: 'Perquè creixen i necessiten nutrients (p. 24).' },
    dos_cents: { p: 25, src: 'lit', where: 'text', tx: 'El nostre esquelet està format per més de 200 ossos distribuïts pel cos en tres zones.' },
    tipus: { p: 24, src: 'lit', where: 'text', tx: 'Tenim tres tipus d’ossos.' },
    llargs: { p: 24, src: 'lit', where: 'text del dibuix', tx: 'Ossos llargs, com els de les extremitats.' },
    curts: { p: 24, src: 'lit', where: 'text del dibuix', tx: 'Ossos curts, com les vèrtebres que formen la columna vertebral.' },
    plans: { p: 24, src: 'lit', where: 'text del dibuix', tx: 'Ossos plans, com els que formen el crani.' },
    tipusAct: { p: 25, src: 'act', where: 'activitat «Observa»', q: 'De quin tipus són els ossos següents? omòplat · radi · maxil·lar · falanges · vèrtebra · tíbia', tx: 'Radi i tíbia: llargs (són de les extremitats). Vèrtebra: curt (p. 24). Omòplat, maxil·lar i falanges: el llibre no en dona la resposta; els observem i en parlem, sense nota.' },
  },
  names: {},
  views: {
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
    cap: c => c.A.flyTo(new c.T.Vector3(0, 1.58, 0), new c.T.Vector3(.4, .05, 1).normalize().multiplyScalar(c.fitDist(.2))),
    tronc: c => c.A.flyTo(new c.T.Vector3(0, 1.2, 0), new c.T.Vector3(.5, .05, 1).normalize().multiplyScalar(c.fitDist(.4))),
  },
  neutral(c) { c.A.setBoneOpacity(100); c.A.setLayer('allMuscle', false); c.A.setLayer('brain', false); },
  neutralPose: c => c.A.setElbow('Left', c.A.elbows.Left.restFlex),
  setup(c) {
    for (const k of ['allMuscle', 'muscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    for (const s of ['Left', 'Right']) c.A.setElbow(s, c.A.elbows[s].restFlex);
    c.view('cos');
  },
  stages(c) {
    const A = c.A, $ = c.$;
    let swing = null;
    const stopSwing = () => { if (swing) { A.tickers.splice(A.tickers.indexOf(swing), 1); swing = null; } A.setElbow('Left', A.elbows.Left.restFlex); };
    const startSwing = () => { stopSwing(); const e = A.elbows.Left, t0 = performance.now(); swing = now => A.setElbow('Left', e.restFlex + (95 - e.restFlex) * (.5 - .5 * Math.cos((now - t0) / 2600 * Math.PI * 2))); A.tickers.push(swing); };
    const typeColors = () => { show(c, RE.llargs, 0x35c46a); show(c, RE.curts, 0x3d8bfd); show(c, RE.plans, 0xff9f1c); };
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) {
          c.hidden(); c.view('cos');
          el.innerHTML = `<h2>El sistema esquelètic</h2>${c.ossi('Hola! Sóc l’Ossi. Avui veurem per a què serveix l’esquelet, com són els ossos i quins tipus d’ossos tenim. Tu manes el ritme.')}${c.zh('今天学：骨骼系统有什么作用、骨头是什么样的、骨头分几类。')}`;
          c.setNext(true);
        } },
      { id: 'p1-pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cos'); c.predict(el, { id: 'vius', q: 'Abans de començar: què creus que són els ossos?', zhq: '你觉得骨头是什么样的？', opts: ['Com pedres: no canvien mai', 'Són vius: creixen amb nosaltres', 'No ho sé'] }); } },
      { id: 'aparell', ph: '2–3 · L’aparell locomotor', render(el) {
          c.hidden(); c.view('cos'); let on = false;
          el.innerHTML = `<h2>L’aparell locomotor</h2>${c.book(['aparell'])}${c.ossi('Toca el botó per vestir i desvestir l’esquelet: ossos i músculs treballen junts.')}
            <button class="opt go" id="tgm">💪 Mostra els músculs</button>${c.zh('课本内容·中文意译：运动系统由骨骼系统和肌肉系统组成。点按钮看肌肉和骨头。')}`;
          $('tgm').onclick = () => { on = !on; A.setLayer('allMuscle', on); $('tgm').textContent = on ? '🦴 Mostra només els ossos' : '💪 Mostra els músculs'; c.setNext(true); };
          c.setNext(false);
        } },
      { id: 'funcions', ph: '2–4 · Per a què serveix', render(el) {
          c.stepper(el, [
            { scene: () => { stopSwing(); c.view('cos'); }, html: `${c.book(['sistema'])}${c.ossi('L’esquelet té tres feines. Les mirarem una per una.')}${c.zh('课本内容·中文意译：骨骼系统由骨头组成；它参与运动、塑造身形并支撑体重、保护内脏免受撞击。')}` },
            { scene: () => { c.view('cos'); show(c, RE.braç, 0x35c46a); startSwing(); }, html: `<div class="spell">① moviment</div>${c.ossi('Mira el braç: els ossos es mouen quan ens movem. Ara mou tu el teu braç!')}${c.zh('① 参与运动。')}` },
            { scene: () => { stopSwing(); c.view('cos'); show(c, RE.columnaCames, 0xff9f1c); }, html: `<div class="spell">② forma i pes</div>${c.ossi('La columna i les cames ens aguanten drets. Sense esquelet seríem com un flam! 🍮')}${c.zh('② 塑造身形、支撑体重。')}` },
            { scene: () => { stopSwing(); c.view('cap'); A.setLayer('brain', true); A.setBoneOpacity(35); }, html: `<div class="spell">③ protegeix</div>${c.ossi('Mira a dins del crani: hi ha el cervell (rosa). El crani el protegeix, com un casc. Les costelles també fan de protecció.')}${c.zh('③ 保护内脏免受撞击（例：颅骨保护大脑）。')}` },
          ], { title: 'Les feines de l’esquelet', after: () => { stopSwing(); c.hidden(); } });
        } },
      { id: 'ossos', ph: '2–3 · Com són els ossos', render(el) {
          c.hidden(); c.view('cos'); show(c, /^left femur$/, 0x35c46a);
          el.innerHTML = `<h2>Com són els ossos</h2>${c.book(['ossos', 'dos_cents'])}${c.ossi('Els ossos són durs, però no són pedres: són vius, creixen amb tu i necessiten aliment. Per això cada any ets més alt o alta!')}${c.zh('课本内容·中文意译：骨头坚硬结实，但它们是活的器官，会生长，需要营养。全身 200 多块骨头分布在三个区域。')}`;
          c.setNext(true);
        } },
      { id: 'tipus', ph: '2–4 · Tres tipus d’ossos', render(el) {
          c.hidden(); c.view('cos'); typeColors(); c.label('llarg', () => A.boxOf(A.find(/^left femur$/, 'bone')).getCenter(new c.T.Vector3())); c.label('curt', () => A.boxOf(A.find(RE.vertebra, 'bone')).getCenter(new c.T.Vector3())); c.label('pla', () => A.boxOf(A.find(/^frontal bone$/, 'bone')).getCenter(new c.T.Vector3()));
          el.innerHTML = `<h2>Tres tipus d’ossos</h2>${c.book(['tipus', 'llargs', 'curts', 'plans'])}<div class="legend"><span><i style="background:#35c46a"></i>llargs</span><span><i style="background:#3d8bfd"></i>curts</span><span><i style="background:#ff9f1c"></i>plans</span></div>
            ${c.ossi('Truc: llarg com un pal 📏, curt com un dau 🎲, pla com una galeta 🍪.')}<div class="q">Mira els colors i gira el model. Quan ho tinguis clar, continua.</div>${c.zh('课本：长骨（四肢）、短骨（椎骨）、扁骨（颅骨）。颜色和标签只在学习阶段显示。')}`;
          c.setNext(true);
        } },
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Explica en veu alta les tres feines de l’esquelet.', keys: ['sistema'], units: ['U3', 'U4', 'U5'], zhq: '说出骨骼的三大作用。', zkey: '评分要点：参与运动；塑造身形并支撑体重；保护内脏免受撞击。三点都说到 = 说对了。' }); } },
      { id: 'R2', ph: '5 · Explica-ho tu', recall: true, render(el) { c.recall(el, { q: 'Per què diem que els ossos són òrgans vius? (Activitat 1 del llibre)', keys: ['vius'], units: ['U7'], zhq: '为什么说骨头是活的器官？（课本活动 1）', zkey: '评分要点：骨头会生长，需要营养。' }); } },
      c.choiceSeries('P1', '6 · Practica', [
        { q: 'De què està format l’aparell locomotor?', opts: ['Del sistema esquelètic i del sistema muscular', 'Del cervell i dels nervis', 'Del cor i dels pulmons'], a: 0, cue: 'pensa en el que hem vist amb el botó: ossos i…', helpText: 'Torna a llegir el llibre, p. 24, primera frase.', units: ['U1'] },
        { q: 'Què forma el sistema esquelètic?', opts: ['Els ossos', 'Els músculs', 'La pell'], a: 0, cue: 'el seu nom ve d’«esquelet».', helpText: 'Llibre p. 24: «El sistema esquelètic el formen…».', units: ['U2'] },
        { q: 'Com són els ossos?', opts: ['Rígids i resistents', 'Tous com la gelatina', 'Transparents'], a: 0, cue: 'toca’t el genoll o el canell: com és l’os?', helpText: 'Llibre p. 24, apartat «Els ossos».', units: ['U6'] },
        { q: 'Quants ossos té el nostre esquelet?', opts: ['Més de 200', 'Uns 20', 'Més de 2.000'], a: 0, cue: 'són molts, però no milers.', helpText: 'Llibre p. 25, primera frase de «L’esquelet».', units: ['U8'] },
        { q: 'En quantes zones es distribueixen els ossos?', opts: ['En tres zones', 'En dues zones', 'En deu zones'], a: 0, cue: 'cap, tronc i…', helpText: 'Llibre p. 25: «…distribuïts pel cos en tres zones».', units: ['U8'] },
      ]),
      c.choiceSeries('P2', '6 · De quin tipus és?', [
        { q: 'De quin tipus és l’os blau?', opts: ['llarg', 'curt', 'pla'], a: 0, subject: () => { c.view('cos'); show(c, RE.radi); }, cue: 'és un os del braç (una extremitat).', demo: async () => { typeColors(); await c.wait(2200); }, units: ['U9'] },
        { q: 'De quin tipus és l’os blau?', opts: ['llarg', 'curt', 'pla'], a: 0, subject: () => { c.view('cos'); show(c, RE.tibia); }, cue: 'és un os de la cama (una extremitat).', demo: async () => { typeColors(); await c.wait(2200); }, units: ['U9'] },
        { q: 'De quin tipus és l’os blau?', opts: ['llarg', 'curt', 'pla'], a: 1, subject: () => { c.view('cos'); show(c, RE.vertebra); }, cue: 'és una de les vèrtebres de la columna.', demo: async () => { typeColors(); await c.wait(2200); }, units: ['U9'] },
        { q: 'De quin tipus són els ossos blaus?', opts: ['llargs', 'curts', 'plans'], a: 2, subject: () => { c.view('cap'); show(c, RE.crani1); }, cue: 'són els ossos del crani.', demo: async () => { typeColors(); await c.wait(2200); }, units: ['U9'] },
      ], { view: 'cos' }),
      // F14 / D4: the other three bones of the p. 25 «Observa» — observe, compare, explain; never scored (no answer in the book)
      { id: 'P2obs', ph: '6 · Observa', render(el) {
        const items = [
          { k: 'omoplat', re: RE.omoplat, dir: [0, .1, -1], ca: 'l’omòplat', look: 'És ample i prim, i té una vora com una cresta.' },
          { k: 'maxillar', re: RE.maxillar, dir: [1, .05, .3], ca: 'el maxil·lar (el de baix)', look: 'Té forma de ferradura i hi ha les dents de baix.' },
          { k: 'falanges', re: RE.falanges, dir: [0, .1, 1], ca: 'les falanges (de la mà)', look: 'Són ossets petits, però cada un és una mica allargat.' },
        ];
        const focus = (re, dir) => { const b = c.A.boxOf(c.A.find(re, 'bone')), ctr = b.getCenter(new c.T.Vector3()), sz = b.getSize(new c.T.Vector3());
          c.A.flyTo(ctr, new c.T.Vector3(...dir).normalize().multiplyScalar(c.fitDist(Math.max(sz.y, .12) * .8, Math.max(sz.x, sz.z, .12) * .8))); };
        let i = 0; c.setNext(false);
        const draw = () => { const it = items[i]; c.hidden(); focus(it.re, it.dir); show(c, it.re);
          el.innerHTML = `<h2>Observa · llibre p. 25 · ${i + 1}/3</h2>${i === 0 ? `${c.book(['tipusAct'])}${c.ossi('Tres ja els has classificat. Mirem els altres tres. No hi ha nota: digues què et sembla i per què.')}` : ''}
            <div class="q">Mira ${it.ca} (en blau). Com et sembla: llarg, curt o pla? Per què?</div><div class="opts" id="ob"></div>${c.zh('观察（不计分）：这块骨头看起来是长骨、短骨还是扁骨？为什么？课本没有给答案。')}`;
          for (const o of ['llarg', 'curt', 'pla', 'No ho sé']) { const b = document.createElement('button'); b.className = 'opt'; b.textContent = o;
            b.onclick = () => { const r = c.rec; (r.obs = r.obs || {})[it.k] = o; c.saveRec(); el.querySelectorAll('#ob button').forEach(x => x.disabled = true); b.classList.add('hint');
              el.insertAdjacentHTML('beforeend', `<div class="note">👀 ${it.look} El llibre no en dona la resposta: en pots parlar a classe.</div><button class="opt go" id="nb">${i < 2 ? 'Següent ▶' : 'Fet ✔'}</button>`);
              c.$('nb').onclick = () => { i++; if (i < 3) draw(); else { c.$('nb').remove(); c.hidden(); c.setNext(true); } }; };
            c.$('ob').appendChild(b); } };
        draw(); } },
      c.resultsStage(),
    ];
  },
  day2(c) {
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Les tres feines de l’esquelet', ca: 'Sense mirar el model: digues les tres feines de l’esquelet.', zq: '不看模型：说出骨骼的三大作用。', key: 'Intervé en el moviment del cos, dona forma i suporta el pes del cos, i protegeix dels cops els òrgans interns.', zkey: '评分要点：运动、形状与支撑体重、保护内脏。' },
      { id: 'oral2', kind: 'oral', title: 'Explica-ho', label: 'Els ossos són vius', ca: 'Per què diem que els ossos són òrgans vius?', zq: '为什么说骨头是活的？', key: 'Perquè creixen i necessiten nutrients.', zkey: '评分要点：会生长、需要营养。' },
      { id: 'oral3', kind: 'oral', title: 'Explica-ho', label: 'Tres tipus amb un exemple', ca: 'Digues els tres tipus d’ossos i un exemple de cada.', zq: '说出三类骨头，每类举一个例子。', key: 'Llargs (els de les extremitats), curts (les vèrtebres) i plans (els del crani).', zkey: '评分要点：长骨-四肢；短骨-椎骨；扁骨-颅骨。' },
      { id: 'tipus_radi', kind: 'choice', title: 'Al model', label: 'Tipus: radi', q: 'De quin tipus és l’os blau?', opts: ['llarg', 'curt', 'pla'], a: 0, subject: () => { c.view('cos'); show(c, RE.radi); }, cue: 'és un os del braç (una extremitat).', helpText: 'Mira el llibre, p. 24.' },
      { id: 'tipus_vert', kind: 'choice', title: 'Al model', label: 'Tipus: vèrtebra', q: 'De quin tipus és l’os blau?', opts: ['llarg', 'curt', 'pla'], a: 1, subject: () => { c.view('cos'); show(c, RE.vertebra); }, cue: 'és una vèrtebra.', helpText: 'Mira el llibre, p. 24.' },
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Fotos de la p. 24', ca: 'Obre el llibre a la pàgina 24. Tapa el text de les tres fotos d’ossos i digues de quin tipus és cada un.', zq: '打开课本第 24 页，盖住三张骨头照片的文字，说出每张是哪一类。', key: 'Fèmur: os llarg. Vèrtebra: os curt. Crani: os pla.', zkey: '评分要点：长骨（股骨照片）、短骨（椎骨照片）、扁骨（颅骨照片）。' },
    ];
  },
};
