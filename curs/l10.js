// Lesson 10 · Bíceps i tríceps (textbook pp. 27–28). PRINCIPLE lesson, ported from the 1A sample (sample.js) to the
// shared player. Units K1–K5 + names bíceps, tríceps. Model: movement + colour by direction; thickening off (setBulge 0).
let E, REST, anim = null;
const TXT = {
  bend: 'Ara el braç es doblega: el bíceps es contreu 💪 i el tríceps es relaxa.',
  str: 'Ara el braç s’estira: el tríceps es contreu 💪 i el bíceps es relaxa.',
  bentDone: 'Fa un moment has doblegat el braç: el bíceps s’ha contret i el tríceps s’ha relaxat.',
  strDone: 'Fa un moment has estirat el braç: el tríceps s’ha contret i el bíceps s’ha relaxat.',
  idle: 'Mou la barra per moure el braç.',
};
export default {
  id: 'l10', title: 'Bíceps i tríceps 💪', subtitle: 'Lliçó 10 (llibre p. 27–28). Tu manes: avança quan estiguis a punt. Uns 15 minuts.',
  hasReview: false, hasSay: false,
  units: { K1: 'Doblegar: bíceps es contreu, tríceps es relaxa', K2: 'Estirar: tríceps es contreu, bíceps es relaxa', K3: 'L’articulació que es doblega és el colze', K4: 'El múscul contret és més gruixut', K5: 'Els dos músculs treballen junts (un es contreu, l’altre es relaxa)' },
  book: {
    doblegar: { p: 27, src: 'lit', where: 'text del dibuix', tx: 'Quan dobleguem el braç, el tríceps es relaxa. El bíceps es contreu.' },
    estirar: { p: 27, src: 'lit', where: 'text del dibuix', tx: 'Quan estirem el braç, el tríceps es contreu. El bíceps es relaxa.' },
    colze: { p: 27, src: 'act', where: 'activitat 4', q: 'Com es diu l’articulació que s’està doblegant?', tx: 'El colze.' },
    gruixut: { p: 27, src: 'act', where: 'activitat 4', q: 'Quan és més gruixut el bíceps, quan el braç està doblegat o quan està estès? I el tríceps?', tx: 'Mirant el dibuix: el bíceps és més gruixut amb el braç doblegat, i el tríceps, amb el braç estès. El múscul que es contreu es fa més gruixut.' },
    parella: { p: 28, src: 'lit', where: 'text', tx: 'Quan fem un moviment, uns músculs es contreuen mentre que uns altres es relaxen, i així mouen els ossos.' },
  },
  names: {
    biceps: { ca: 'bíceps', html: 'b<b>í</b>ceps', g: 'muscle', re: /left biceps brachii/, aid: 'És a la part de davant del braç.', labelAt: c => face(c, 'biceps', true) },
    triceps: { ca: 'tríceps', html: 'tr<b>í</b>ceps', g: 'muscle', re: /left triceps brachii/, aid: 'És a la part de darrere del braç.', labelAt: c => face(c, 'triceps', false) },
  },
  views: {
    arm: c => { const sx = Math.sign(E.center.x) || 1; c.A.flyTo(E.center.clone().add(new c.T.Vector3(0, .08, .05)), new c.T.Vector3(sx, .1, .3).normalize().multiplyScalar(c.fitDist(.25, .25))); },
  },
  neutral: c => c.A.setMuscleColors('neutral', 'neutral'),
  neutralPose: c => c.A.setElbow('Left', REST),
  setup(c) {
    E = c.A.elbows.Left; REST = E.restFlex;
    for (const k of ['allMuscle', 'brain', 'spinal', 'nerves', 'eye']) c.A.setLayer(k, false);
    c.A.setLayer('bone', true); c.A.setLayer('muscle', true); c.A.setBoneOpacity(100); c.A.controls.autoRotate = false;
    c.A.setBulge(0); c.A.setMuscleColors('neutral', 'neutral'); c.view('arm');
  },
  stages(c) {
    E = c.A.elbows.Left; REST = E.restFlex;
    const A = c.A, $ = c.$;
    const showLabels = () => { c.clearLabels(); c.nameLabels(['biceps', 'triceps']); c.label('colze', () => E.center.clone()); };
    const stopAnim = () => { if (anim) { const i = A.tickers.indexOf(anim); if (i >= 0) A.tickers.splice(i, 1); anim = null; } };
    const animateTo = (target, ms = 2400) => { stopAnim(); const from = E.angle, t0 = performance.now();
      return new Promise(res => { anim = now => { const u = Math.min(1, (now - t0) / ms), k = u * u * (3 - 2 * u); A.setElbow('Left', from + (target - from) * k); if (u >= 1) { stopAnim(); res(); } }; A.tickers.push(anim); }); };
    const neutral = () => A.setMuscleColors('neutral', 'neutral'), bending = () => A.setMuscleColors('on', 'off'), straightening = () => A.setMuscleColors('off', 'on');
    const demo = async (kind, withLabels = true) => {
      if (withLabels) showLabels();
      if (kind === 'bend') { A.setElbow('Left', REST); neutral(); await c.wait(250); bending(); await animateTo(105, 2600); neutral(); }
      else { A.setElbow('Left', 105); neutral(); await c.wait(250); straightening(); await animateTo(REST, 2600); neutral(); }
    };
    // slider: text + colour follow the DIRECTION of movement; after ~1 s still → past tense, neutral colour
    const sliderUI = (el, { start = REST, showState = true, onMove } = {}) => {
      A.setElbow('Left', start); neutral();
      el.insertAdjacentHTML('beforeend', `<input type="range" class="arm" min="${REST}" max="130" value="${start}" step="1"><div class="live">${showState ? TXT.idle : 'Mou la barra.'}</div>`);
      const r = el.querySelector('input.arm'), live = el.querySelector('.live'); let last = start, dir = 0, idleT = null;
      r.oninput = () => { const v = +r.value, d = v - last; A.setElbow('Left', v);
        if (Math.abs(d) >= 2) { dir = d > 0 ? 1 : -1; last = v; if (showState) { (dir > 0 ? bending : straightening)(); live.textContent = dir > 0 ? TXT.bend : TXT.str; live.className = 'live ' + (dir > 0 ? 'bend' : 'str'); } onMove && onMove(dir, v); }
        clearTimeout(idleT); idleT = setTimeout(() => { neutral(); if (showState && dir) { live.textContent = dir > 0 ? TXT.bentDone : TXT.strDone; live.className = 'live'; } }, 1000); };
      return r;
    };
    const predictStage = (id, pose, q, zhq, opts, say) => ({ id, ph: '1 · Pregunta', render(el) { c.hidden(); A.setElbow('Left', pose); c.predict(el, { id, q, zhq, opts, say }); } });
    return [
      { id: 'intro', ph: 'Benvinguda', render(el) {
          c.view('arm'); c.clearLabels();
          el.innerHTML = `<h2>Bíceps i tríceps 💪</h2>${c.ossi('Hola! Sóc l’Ossi. Avui descobrirem què passa dins del braç quan el dobleguem i quan l’estirem. Tu manes: passa a la pantalla següent quan estiguis a punt.')}
            ${c.zh('今天学：弯曲和伸直手臂时，手臂里的肌肉在做什么。孩子自己控制节奏。')}<div class="note">ℹ️ Els colors del model són un esquema per veure qui es contreu. El gruix dels músculs l’observaràs al teu braç i al dibuix de la p. 27.</div>`;
          c.setNext(true);
        } },
      predictStage('A-pregunta', REST, 'Quina part del braç es fa més dura i més gruixuda quan dobleguem el braç?', '弯曲手臂时，手臂哪一面变硬、变粗？（先用自己的手臂摸一摸）', ['La part de davant', 'La part de darrere', 'Cap de les dues'],
        'Posa la mà a la part de davant del teu braç i doblega’l a poc a poc. Després prova-ho amb la mà a la part de darrere.'),
      { id: 'A-llibre', ph: '2 · El llibre', render(el) { c.hidden(); A.setElbow('Left', REST); showLabels(); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['doblegar', 'colze'])}${c.ossi('Fixa’t en els noms del model: bíceps a davant, tríceps a darrere, i el colze al mig.')}${c.zh('读一遍课本 P27 图上的文字和活动 4 的答案，看模型上的名称。')}`; c.setNext(true); } },
      { id: 'A-demo', ph: '3 · Mira', render(el) {
          showLabels(); A.setElbow('Left', REST);
          el.innerHTML = `<h2>Mira què passa</h2><div class="live" id="lv">Toca «Mira» per veure-ho.</div><button class="opt go" id="pl">▶ Mira</button>${c.ossi('Ara posa la mà sobre el teu bíceps i doblega el braç. Què notes? Després mira el dibuix de la p. 27.')}${c.book(['gruixut'])}${c.zh('看演示：弯曲时二头肌颜色变深（收缩）。肌肉变粗请在自己的手臂和课本 P27 图上观察。')}`;
          $('pl').onclick = async () => { $('pl').disabled = true; $('lv').textContent = TXT.bend; $('lv').className = 'live bend'; await demo('bend'); $('lv').textContent = 'Mentre el braç es doblegava, el bíceps es contreia. Pots tornar-ho a mirar.'; $('lv').className = 'live'; $('pl').disabled = false; $('pl').textContent = '↻ Torna-ho a mirar'; c.setNext(true); };
          c.setNext(false);
        } },
      { id: 'A-fes', ph: '4 · Fes-ho tu', render(el) {
          showLabels(); el.innerHTML = `<h2>Ara fes-ho tu</h2><div class="q">Doblega el braç fins a 90° amb la barra.</div>${c.zh('孩子拖动滑块把手臂弯到约 90°，文字和颜色随动作方向变化。')}`;
          sliderUI(el, { onMove: (d, v) => { if (d > 0 && v >= REST + 72 && !el.dataset.done) { el.dataset.done = 1; c.feedback(el, true, 'Molt bé! Mentre doblegaves, el bíceps es contreia.'); c.setNext(true); } } });
          c.setNext(false);
        } },
      predictStage('B-pregunta', 105, 'Quin múscul es contreu quan estirem el braç?', '伸直手臂时，哪块肌肉收缩？', ['El tríceps (a darrere)', 'El bíceps (a davant)', 'Cap dels dos'],
        'Doblega el teu braç. Estira’l a poc a poc amb una mà a davant del braç, i després amb la mà a darrere.'),
      { id: 'B-llibre', ph: '2 · El llibre', render(el) { c.hidden(); A.setElbow('Left', 105); showLabels(); el.innerHTML = `<h2>Què diu el llibre</h2>${c.book(['estirar', 'parella'])}${c.zh('读课本 P27 图上的文字和 P28 原句。')}`; c.setNext(true); } },
      { id: 'B-demo', ph: '3 · Mira', render(el) {
          showLabels(); A.setElbow('Left', 105);
          el.innerHTML = `<h2>Mira què passa</h2><div class="live" id="lv">Toca «Mira» per veure-ho.</div><button class="opt go" id="pl">▶ Mira</button>${c.ossi('Treballen en parella: quan un es contreu, l’altre es relaxa. Com dos amics que estiren una corda per torns!')}
            <div class="fun">💡 <b>Curiositat</b> <span class="nb">no surt al llibre</span><br>Un múscul només fa força quan es contreu: pot estirar l’os, però no el pot empènyer. Per això en calen dos.</div>${c.zh('看演示：伸直时三头肌收缩。趣味补充不计分。')}`;
          $('pl').onclick = async () => { $('pl').disabled = true; $('lv').textContent = TXT.str; $('lv').className = 'live str'; await demo('straighten'); $('lv').textContent = 'El tríceps s’ha contret i el bíceps s’ha relaxat. Pots tornar-ho a mirar.'; $('lv').className = 'live'; $('pl').disabled = false; $('pl').textContent = '↻ Torna-ho a mirar'; c.setNext(true); };
          c.setNext(false);
        } },
      { id: 'B-fes', ph: '4 · Fes-ho tu', render(el) {
          showLabels(); el.innerHTML = `<h2>Ara fes-ho tu</h2><div class="q">Estira el braç del tot. Després pots doblegar-lo i estirar-lo tantes vegades com vulguis.</div>${c.zh('孩子把手臂完全伸直；之后可以自由来回操作。')}`;
          sliderUI(el, { start: 105, onMove: (d, v) => { if (d < 0 && v <= REST + 4 && !el.dataset.done) { el.dataset.done = 1; c.feedback(el, true, 'Molt bé! Mentre estiraves, el tríceps es contreia.'); c.setNext(true); } } });
          c.setNext(false);
        } },
      { id: 'R1', ph: '5 · Explica-ho tu', recall: true, render(el) { A.setElbow('Left', REST); c.recall(el, { q: 'Explica-ho en veu alta: quan dobleguem el braç, què fa el bíceps i què fa el tríceps? Com es veu el múscul que es contreu?', keys: ['doblegar', 'gruixut'], units: ['K1', 'K4'], zhq: '弯曲手臂时，二头肌和三头肌各在做什么？收缩的肌肉看起来怎样？', zkey: '评分要点：二头肌收缩、三头肌放松；收缩的肌肉更粗。两点都说对 = 说对了。' }); } },
      { id: 'R2', ph: '5 · Explica-ho tu', recall: true, render(el) { A.setElbow('Left', 105); c.recall(el, { q: 'I quan estirem el braç? Per què calen dos músculs?', keys: ['estirar', 'parella'], units: ['K2', 'K5'], zhq: '伸直手臂时呢？为什么需要两块肌肉？', zkey: '评分要点：三头肌收缩、二头肌放松；两块肌肉一块收缩时另一块放松，配合起来移动骨头。' }); } },
      { id: 'P1', ph: '6 · Practica', recall: true, render(el) { c.hidden(); A.setElbow('Left', REST); c.ladderChoice(el, { q: 'El tríceps es contreu. Què fa el braç?', opts: ['S’estira', 'Es doblega', 'No es mou'], a: 0, cue: 'el tríceps és a la part de darrere del braç. Estira el teu braç: quina part notes dura?', demo: () => demo('straighten'), units: ['K2', 'K5'] }); c.setNext(false); } },
      { id: 'P2', ph: '6 · Practica', recall: true, render(el) { c.hidden(); A.setElbow('Left', REST); c.ladderChoice(el, { q: 'Quina articulació es doblega quan dobleguem el braç?', opts: ['El colze', 'El genoll', 'L’espatlla'], a: 0, cue: 'és al mig del braç, entre el braç i l’avantbraç.', demo: () => demo('bend'), units: ['K3'] }); c.setNext(false); } },
      { id: 'P3', ph: '6 · Practica', recall: true, render(el) { c.hidden(); A.setElbow('Left', REST); c.ladderChoice(el, { q: 'Dobleguem el braç. Com és ara el bíceps?', opts: ['Més gruixut', 'Més prim', 'Igual'], a: 0, cue: 'toca’t el bíceps mentre dobleges el braç: es fa més petit o més gros?', helpText: 'Mira el dibuix de la p. 27 del llibre: compara el bíceps del braç doblegat i del braç estès.', units: ['K4'] }); c.setNext(false); } },
      { id: 'P4', ph: '6 · Practica', recall: true, render(el) {
          c.hidden(); el.innerHTML = `<div class="q">Mou el braç perquè es contregui el <b>tríceps</b>.</div>${c.zh('题目：移动手臂，让三头肌收缩。这一题不显示状态文字和颜色。')}`;
          let wrongs = 0, maxV = 105, minV = 105;
          sliderUI(el, { start: 105, showState: false, onMove: async (d, v) => {
            if (el.dataset.done) return; maxV = Math.max(maxV, v); minV = Math.min(minV, v);
            if (minV <= 105 - 30) { el.dataset.done = 1; c.evid(['K2'], wrongs ? 'ajuda' : 'sol'); c.feedback(el, true, wrongs ? 'Ara sí! 👍' : 'Molt bé! ⭐ Estirar el braç = el tríceps es contreu.'); c.setNext(true); }
            else if (maxV >= 105 + 15 && !el.dataset.warned) { el.dataset.warned = 1; wrongs++; c.rec.wrong++;
              c.feedback(el, false, '💡 Pista: si dobleguem el braç es contreu el bíceps. El tríceps és a darrere… què ha de fer el braç?');
              if (wrongs >= 2) { await demo('straighten'); c.hidden(); } setTimeout(() => { maxV = v; delete el.dataset.warned; }, 400); }
          } });
          c.setNext(false);
        } },
      { id: 'P5', ph: '6 · Troba’ls (sense noms)', recall: true, render: async el => {
          c.hidden(); A.setElbow('Left', REST); c.view('arm'); c.setNext(false);
          await c.sequence(el, ['biceps', 'triceps'], (box, k) => c.tapTask(box, { q: `👆 Toca el ${k === 'biceps' ? 'bíceps' : 'tríceps'} (sense noms).`, key: k, cue: this.names[k].aid, onResult: v => { c.rec.loc[k] = v; } }));
          c.feedback(el, true, 'Molt bé! ⭐'); c.setNext(true);
        } },
      c.spellStage(['biceps', 'triceps']),
      c.resultsStage(),
    ];
  },
  day2(c) {
    return [
      { id: 'oral1', kind: 'oral', title: 'Explica-ho', label: 'Doblegar (explicat i fet amb el braç)', ca: 'Sense mirar el model: explica què passa quan dobleguem el braç, i fes-ho amb el teu braç.', zq: '不看模型：说说弯曲手臂时发生什么，并用自己的手臂做一遍。', key: 'El bíceps es contreu i el tríceps es relaxa.', zkey: '评分要点：二头肌收缩、三头肌放松，并能用手臂演示。' },
      { id: 'oral2', kind: 'oral', title: 'Explica-ho', label: 'Estirar i els dos músculs', ca: 'Explica què passa quan estirem el braç. Per què calen dos músculs?', zq: '说说伸直手臂时发生什么；为什么需要两块肌肉？', key: 'El tríceps es contreu i el bíceps es relaxa. Quan un es contreu, l’altre es relaxa, i així mouen els ossos.', zkey: '评分要点：三头肌收缩、二头肌放松；一块收缩时另一块放松。' },
      { id: 'oral3', kind: 'oral', title: 'Explica-ho', label: 'El colze i el múscul contret', ca: 'Quina articulació es doblega? Com és el múscul quan es contreu?', zq: '哪个关节在弯？肌肉收缩时是什么样子？', key: 'El colze. El múscul contret és més gruixut.', zkey: '评分要点：肘关节（colze）；收缩的肌肉更粗。' },
      { id: 'loc_biceps', kind: 'loc', key: 'biceps', view: 'arm', title: 'Al model', label: 'Troba el bíceps' },
      { id: 'loc_triceps', kind: 'loc', key: 'triceps', view: 'arm', title: 'Al model', label: 'Troba el tríceps' },
      { id: 'book', kind: 'oral', title: 'El llibre', label: 'Dibuix de la p. 27', ca: 'Obre el llibre a la pàgina 27. Tapa el text i digues, a cada dibuix del braç, quin múscul es contreu.', zq: '打开课本第 27 页，盖住文字，说出每张手臂图里哪块肌肉在收缩。', key: 'Braç doblegat: es contreu el bíceps. Braç estirat: es contreu el tríceps.', zkey: '评分要点：弯曲图 = 二头肌收缩；伸直图 = 三头肌收缩。' },
      { id: 'spell_biceps', kind: 'spell', key: 'biceps', view: 'arm', title: 'Escriu el nom', label: 'Escriu «bíceps»' },
      { id: 'spell_triceps', kind: 'spell', key: 'triceps', view: 'arm', title: 'Escriu el nom', label: 'Escriu «tríceps»' },
    ];
  },
};
function face(c, k, front) { const b = c.A.boxOf(c.parts[k]), p = b.getCenter(new c.T.Vector3()); p.z = front ? b.max.z : b.min.z; return p; }
