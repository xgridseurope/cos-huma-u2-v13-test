// Lesson 5 · Les articulacions (textbook p. 24). PRINCIPLE lesson: joints, mobile / immobile, ligaments.
// The model has no ligaments (stated to the child; the book drawing is used instead).
const F = (c, re) => c.A.find(re, 'bone');
const fm = (c, re, dir, pad) => { const b = c.A.boxOf(F(c, re)), m = b.getCenter(new c.T.Vector3()), sz = b.getSize(new c.T.Vector3()); c.A.flyTo(m, new c.T.Vector3(...dir).normalize().multiplyScalar(c.fitDist(sz.y / 2 * pad, Math.max(sz.x, sz.z) / 2 * pad))); };
const RE = {
  colze: /^left (humerus|ulna|radius)$/,
  genoll: /^left (femur|patella|tibia|fibula)$/,
  coll: /cervical vertebra$|^atlas$|^axis$/,
  crani: /(frontal|parietal|occipital|temporal|sphenoid) bone$|^ethmoid$/,
};
const SKULL = [[/^frontal bone$/, 0xff9f1c], [/^left parietal bone$/, 0x3d8bfd], [/^right parietal bone$/, 0x8f6bff], [/^occipital bone$/, 0x35c46a], [/^left temporal bone$/, 0xff5c8a], [/^right temporal bone$/, 0xffd23f], [/sphenoid bone$|^ethmoid$/, 0x2fd3ff]];
export default {
  id: 'l05', title: 'Les articulacions 🦴🔗', subtitle: 'Lliçó 5 (llibre p. 24). Com s’uneixen els ossos: articulacions mòbils, immòbils i lligaments.',
  units: {
    U1: 'Els ossos s’uneixen entre si mitjançant les articulacions',
    U2: 'Articulacions immòbils: com les del crani, els ossos estan tan units que semblen només un',
    U3: 'Articulacions mòbils: els ossos es poden moure (colze, coll, genoll)',
    U4: 'En les articulacions mòbils, els ossos estan units mitjançant els lligaments',
  },
  book: {
    def: { p: 24, src: 'lit', where: 'text', tx: 'Els ossos de l’esquelet s’uneixen entre si mitjançant les articulacions.' },
    immobils: { p: 24, src: 'lit', where: 'text', tx: 'Articulacions immòbils: com les del crani, els ossos estan tan units que semblen només un.' },
    mobils: { p: 24, src: 'lit', where: 'text', tx: 'Articulacions mòbils: els ossos es poden moure, com passa al colze, al coll o al genoll.' },
    lligaments: { p: 24, src: 'lit', where: 'text', tx: 'En les articulacions mòbils, els ossos estan units mitjançant els lligaments.' },
  },
  names: {},
  views: {
    cos: c => c.A.flyTo(new c.T.Vector3(0, .9, 0), new c.T.Vector3(0, .12, c.fitDist(.95, .55))),
    cap: c => c.A.flyTo(new c.T.Vector3(0, 1.58, 0), new c.T.Vector3(.4, .05, 1).normalize().multiplyScalar(c.fitDist(.2))),
    capDalt: c => c.A.flyTo(new c.T.Vector3(0, 1.6, 0), new c.T.Vector3(.5, .6, .8).normalize().multiplyScalar(c.fitDist(.26))),
    colze: c => fm(c, RE.colze, [.2, .05, 1], 1.3),
    genoll: c => fm(c, /^left patella$/, [.6, .05, 1], 7),
    coll: c => fm(c, RE.coll, [1, .1, .35], 2.2),
  },
  neutral(c) { c.A.setBoneOpacity(100); c.A.setLayer('brain', false); },
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
    const hl = (re, col = 0x2fd3ff) => A.highlight(F(c, re), col);
    const skullColors = () => { for (const [re, col] of SKULL) hl(re, col); };
    const at = re => () => A.boxOf(F(c, re)).getCenter(new c.T.Vector3());
    const joint = (key) => ({ colze: () => { c.view('colze'); hl(RE.colze); }, genoll: () => { c.view('genoll'); hl(RE.genoll); }, coll: () => { c.view('coll'); hl(RE.coll); }, crani: () => { c.view('cap'); hl(RE.crani); } })[key];
    const demoTypes = async () => { c.view('cos'); hl(RE.colze, 0x35c46a); hl(RE.genoll, 0x35c46a); hl(RE.coll, 0x35c46a); hl(RE.crani, 0xff5c5c); c.label('mòbil', at(RE.colze)); c.label('mòbil', at(RE.genoll)); c.label('immòbil', at(RE.crani)); await c.wait(2600); c.clearLabels(); };
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) { stopSwing(); c.hidden(); c.view('cos'); el.innerHTML = `<h2>Les articulacions</h2>${c.ossi('Hola! Avui descobrirem com s’uneixen els ossos entre ells, i per què uns es mouen i d’altres no. Tu manes el ritme.')}${c.zh('今天学：骨头怎样连在一起（关节）、能动和不能动的关节、韧带。')}`; c.setNext(true); } },
      { id: 'pregunta', ph: '1 · Pregunta', render(el) { c.hidden(); c.view('cos'); c.predict(el, { id: 'mou', q: 'Prova-ho: doblega el colze, el genoll i gira el coll. Creus que TOTS els ossos del cos es poden moure entre ells?', zhq: '试试弯肘、弯膝、转脖子。你觉得全身所有骨头之间都能动吗？', opts: ['Sí, tots', 'No, alguns no es mouen', 'No ho sé'] }); } },
      { id: 'def', ph: '2 · El llibre', render(el) {
          stopSwing(); c.hidden(); c.view('colze'); hl(/^left humerus$/, 0x3d8bfd); hl(/^left (ulna|radius)$/, 0x35c46a);
          el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['def'])}${c.ossi('Mira el colze: l’os blau i els ossos verds es troben aquí. On es troben dos ossos hi ha una articulació.')}${c.zh('课本原句：骨骼中的骨头通过关节彼此相连。')}`;
          c.setNext(true);
        } },
      { id: 'mobils', ph: '3–4 · Articulacions mòbils', render(el) {
          c.stepper(el, [
            { scene: () => { stopSwing(); c.view('cos'); }, html: `${c.book(['mobils'])}${c.ossi('Mirarem els tres exemples del llibre, un per un.')}${c.zh('课本原句：能动的关节：骨头可以活动，比如肘、脖子、膝盖。')}` },
            { scene: () => { c.view('colze'); hl(RE.colze, 0x35c46a); startSwing(); }, html: `<div class="spell">el colze</div>${c.ossi('Mira com es mou el colze del model. Ara doblega i estira el teu braç!')}${c.zh('肘：看模型的手臂弯曲，再动动你自己的手臂。')}` },
            { scene: () => { stopSwing(); c.view('genoll'); hl(RE.genoll, 0x35c46a); }, html: `<div class="spell">el genoll</div>${c.ossi('Aquí hi ha el genoll. Asseu-te i doblega el teu genoll: sents com es mou?')}${c.zh('膝盖：坐下来弯弯你的膝盖。')}` },
            { scene: () => { stopSwing(); c.view('coll'); hl(RE.coll, 0x35c46a); }, html: `<div class="spell">el coll</div>${c.ossi('Aquests ossets són del coll. Gira el cap a un costat i a l’altre: és el coll el que es mou!')}${c.zh('脖子：左右转头——动的是脖子。')}` },
          ], { title: 'Les articulacions mòbils', after: () => { stopSwing(); c.hidden(); } });
        } },
      { id: 'immobils', ph: '3–4 · Articulacions immòbils', render(el) {
          stopSwing(); c.hidden(); c.view('capDalt'); skullColors();
          el.innerHTML = `<h2>Articulacions immòbils</h2>${c.book(['immobils'])}${c.ossi('He pintat cada os del crani d’un color. Mira les línies on es toquen: estan tan units que semblen un sol os, i no es poden moure entre ells.')}
            <div class="note">🧠 Quan gires el cap, els ossos del crani no es mouen entre ells: qui es mou és el <b>coll</b>, que és una articulació mòbil.</div>${c.zh('课本原句：不能动的关节：比如颅骨的关节，骨头连得非常紧，看起来像一块。转头时动的是脖子，颅骨之间并不动。')}`;
          c.setNext(true);
        } },
      { id: 'lligaments', ph: '2–3 · Els lligaments', render(el) {
          stopSwing(); c.hidden(); c.view('genoll');
          el.innerHTML = `<h2>Els lligaments</h2>${c.book(['lligaments'])}<div class="note">⚠️ El nostre model <b>no té lligaments</b>. Mira’ls al dibuix del llibre, a la pàgina 24.</div>${c.ossi('Els lligaments són com cintes que lliguen un os amb l’altre a les articulacions que es mouen.')}${c.zh('课本原句：在能动的关节里，骨头通过韧带相连。注意：本 3D 模型没有韧带，请看课本第 24 页的图。')}`;
          c.setNext(true);
        } },
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { c.view('cos'); c.recall(el, { q: 'Explica en veu alta: què és una articulació mòbil i una d’immòbil? Digues un exemple de cada.', keys: ['mobils', 'immobils'], units: ['U2', 'U3'], zhq: '说说能动和不能动的关节各是什么，各举一个例子。', zkey: '评分要点：能动——骨头可以动（肘/脖子/膝盖）；不能动——骨头连得很紧像一块（颅骨）。' }); } },
      { id: 'R2', ph: '5 · Explica-ho tu', recall: true, render(el) { c.recall(el, { q: 'Com s’uneixen els ossos a les articulacions mòbils?', keys: ['lligaments'], units: ['U4'], zhq: '在能动的关节里，骨头靠什么连在一起？', zkey: '评分要点：靠韧带（lligaments）。' }); } },
      c.choiceSeries('P1', '6 · Mòbil o immòbil?', [
        { q: 'L’articulació entre aquests ossos marcats és…', opts: ['mòbil', 'immòbil'], a: 0, subject: joint('genoll'), cue: 'doblega el teu genoll: es mou?', demo: demoTypes, units: ['U3'] },
        { q: 'Les articulacions entre aquests ossos marcats són…', opts: ['mòbils', 'immòbils'], a: 1, subject: joint('crani'), cue: 'són els ossos del crani: semblen un sol os.', demo: demoTypes, units: ['U2'] },
        { q: 'L’articulació entre aquests ossos marcats és…', opts: ['mòbil', 'immòbil'], a: 0, subject: joint('colze'), cue: 'doblega el teu braç: es mou?', demo: demoTypes, units: ['U3'] },
        { q: 'Les articulacions entre aquests ossos marcats són…', opts: ['mòbils', 'immòbils'], a: 0, subject: joint('coll'), cue: 'gira el cap: què es mou?', demo: demoTypes, units: ['U3'] },
      ]),
      c.choiceSeries('P2', '6 · Practica', [
        { q: 'Com s’uneixen entre si els ossos de l’esquelet?', opts: ['Mitjançant les articulacions', 'Mitjançant els nervis', 'No s’uneixen'], a: 0, cue: 'és el tema d’avui.', helpText: 'Llibre p. 24, primera frase de les articulacions.', units: ['U1'] },
        { q: 'Què uneix els ossos a les articulacions mòbils?', opts: ['Els lligaments', 'Els nervis', 'El cervell'], a: 0, cue: 'són com cintes; el model no els té.', helpText: 'Llibre p. 24: «En les articulacions mòbils…».', units: ['U4'] },
        { q: 'Quina d’aquestes articulacions és immòbil?', opts: ['Les del crani', 'El colze', 'El genoll'], a: 0, cue: 'pensa en ossos tan units que semblen un de sol.', helpText: 'Llibre p. 24: «Articulacions immòbils…».', units: ['U2'] },
        { q: 'Quan girem el cap, què es mou?', opts: ['El coll', 'Els ossos del crani', 'Les costelles'], a: 0, cue: 'els ossos del crani no es mouen entre ells.', helpText: 'Llibre p. 24: el coll és un exemple d’articulació mòbil.', units: ['U3'] },
      ], { view: 'cos' }),
      c.resultsStage(),
    ];
  },
  day2(c) {
    const hl = re => c.A.highlight(F(c, re), 0x2fd3ff);
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Què és una articulació', ca: 'Sense mirar el model: com s’uneixen entre si els ossos de l’esquelet?', zq: '不看模型：骨头之间怎样连在一起？', key: 'Mitjançant les articulacions.', zkey: '评分要点：通过关节。' },
      { id: 'oral2', kind: 'oral', title: 'Explica-ho', label: 'Mòbils i immòbils', ca: 'Digues tres articulacions mòbils i una d’immòbil.', zq: '说出三个能动的关节和一个不能动的关节。', key: 'Mòbils: colze, coll, genoll. Immòbils: les del crani.', zkey: '评分要点：能动——肘、脖子、膝盖；不能动——颅骨。' },
      { id: 'mob_genoll', kind: 'choice', title: 'Al model', label: 'Genoll: mòbil o immòbil', q: 'L’articulació entre aquests ossos marcats és…', opts: ['mòbil', 'immòbil'], a: 0, subject: () => { c.view('genoll'); hl(RE.genoll); }, cue: 'doblega el teu genoll.', helpText: 'Mira el llibre, p. 24.' },
      { id: 'mob_crani', kind: 'choice', title: 'Al model', label: 'Crani: mòbil o immòbil', q: 'Les articulacions entre aquests ossos marcats són…', opts: ['mòbils', 'immòbils'], a: 1, subject: () => { c.view('cap'); hl(RE.crani); }, cue: 'semblen un sol os.', helpText: 'Mira el llibre, p. 24.' },
      { id: 'lligament', kind: 'choice', title: 'Pregunta', label: 'Lligaments', q: 'Què uneix els ossos a les articulacions mòbils?', opts: ['Els lligaments', 'Els nervis', 'El cervell'], a: 0, cue: 'són com cintes.', helpText: 'Mira el llibre, p. 24.' },
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Llibre p. 24', ca: 'Obre el llibre a la pàgina 24 i busca l’apartat de les articulacions. Tapa’l i explica amb les teves paraules què diu.', zq: '打开课本第 24 页找到关节部分，盖住后用自己的话说出内容。', key: 'Els ossos s’uneixen per les articulacions. Immòbils: crani. Mòbils: colze, coll, genoll. A les mòbils, els ossos estan units pels lligaments.', zkey: '评分要点：关节连接骨头；不能动（颅骨）；能动（肘、脖子、膝盖）；韧带。' },
    ];
  },
};
