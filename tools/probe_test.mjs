// Static content & scoring probe (gate C, F04/F15). No browser needed; exits 1 on any FAIL.
//   node tools/probe_test.mjs            check the lesson configs in curs/
//   node tools/probe_test.mjs --selftest  prove the checker fails on known-bad mutations (reverts F03, F15, F16, D1)
// Answers come from tools/expected/answer_key.json and tools/textbook/transcript.json (textbook side), never from the configs.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { pathToFileURL, fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const glb = fs.readFileSync(path.join(ROOT, 'models/ecorche.glb')); const jl = glb.readUInt32LE(12);
const MESH = [...new Set(JSON.parse(glb.subarray(20, 20 + jl).toString()).nodes.map(n => (n.name || '').replace(/_/g, ' ')))];
const norm = s => s.replace(/_/g, ' ').toLowerCase();
const KEY = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/expected/answer_key.json'), 'utf8'));
const TR = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/textbook/transcript.json'), 'utf8'));
const tnorm = s => s.replace(/’/g, "'").replace(/…/g, '...').replace(/–/g, '-').replace(/\s+/g, ' ').trim();
const PAGE = {}; for (const s of TR.segments) if (['text', 'box', 'label', 'figtext', 'activity', 'heading'].includes(s.kind)) PAGE[s.page] = (PAGE[s.page] || '') + ' ' + tnorm(s.text);

async function run(dir, quiet) {
  const log = []; const chk = (n, c, i = '') => { log.push((c ? 'PASS ' : 'FAIL ') + n + (c || i === '' ? '' : ' · ' + JSON.stringify(i).slice(0, 220))); };
  const L = {};
  for (let i = 1; i <= 12; i++) { const id = 'l' + String(i).padStart(2, '0'); L[id] = await import(pathToFileURL(path.join(dir, id + '.js')).href + '?t=' + Date.now()); }
  // 1. scoring against the independent key
  for (const [lid, names] of Object.entries(KEY)) {
    if (lid.startsWith('_')) continue;
    if (lid === 'l01_RE') {
      const RE = L.l01.RE; chk('l01 exports RE for probing', !!RE);
      for (const [k, e] of Object.entries(names)) { if (!RE || !RE[k]) { chk(`l01 RE.${k} exists`, false); continue; }
        const m = new Set(MESH.filter(n => RE[k].test(norm(n))));
        chk(`l01 RE.${k}: required shown`, e.required.every(n => m.has(n)), e.required.filter(n => !m.has(n)));
        chk(`l01 RE.${k}: counter-examples not shown`, e.forbidden.every(n => !m.has(n)), e.forbidden.filter(n => m.has(n))); }
      continue;
    }
    const cfg = L[lid].default;
    for (const [k, e] of Object.entries(names)) {
      const n = cfg.names[k]; if (!n) { chk(`${lid}.${k} exists`, false); continue; }
      const m = new Set(MESH.filter(x => n.re.test(norm(x)))); const neu = new Set(n.neutral ? MESH.filter(x => n.neutral.test(norm(x))) : []);
      chk(`${lid}.${k}: required meshes scored right`, !n.noLoc && e.required.every(x => m.has(x)), { noLoc: !!n.noLoc, missing: e.required.filter(x => !m.has(x)) });
      chk(`${lid}.${k}: counter-examples not scored right`, e.forbidden.every(x => !m.has(x)), e.forbidden.filter(x => m.has(x)));
      if (e.neutral) chk(`${lid}.${k}: neutral meshes explained, not scored (D1/D2)`, e.neutral.every(x => neu.has(x) && !m.has(x)) && typeof n.neutralMsg === 'string', e.neutral.filter(x => !neu.has(x) || m.has(x)));
    }
  }
  // 2. source labels against the transcription (F15/F07)
  let lit = 0;
  for (const [lid, mod] of Object.entries(L)) for (const [k, b] of Object.entries(mod.default.book || {})) {
    if (b.src !== 'lit') continue; lit++;
    const sents = tnorm(b.tx).split(/(?<=[.:])\s+/).filter(Boolean);
    const ok = sents.every(s => (PAGE[b.p] || '').includes(s)) || (b.tx.includes(' · ') && b.tx.split(' · ').every(x => (PAGE[b.p] || '').includes(tnorm(x))));
    chk(`${lid}.book.${k}: «lit» found verbatim on p.${b.p}`, ok, b.tx);
  }
  chk(`all literal entries checked (${lit})`, lit > 0);
  // 2b. each literal entry says what its key promises (catches a right sentence put on the wrong card)
  for (const [lid, k, w] of [['l05', 'immobils', 'immòbils'], ['l05', 'mobils', 'articulacions mòbils'], ['l11', 'cervell', 'Cervell.'], ['l11', 'medulla', 'Medul·la espinal.'], ['l11', 'nervis', 'Nervis.'], ['l10', 'doblegar', 'dobleguem'], ['l10', 'estirar', 'estirem'], ['l01', 'curts', 'curts'], ['l01', 'llargs', 'llargs'], ['l01', 'plans', 'plans']]) {
    const b = L[lid].default.book[k]; chk(`${lid}.book.${k} is about «${w}»`, !!b && b.tx.includes(w) && !(k === 'mobils' && b.tx.includes('immòbils')), b && b.tx); }
  // 3. no paraphrase labelled as original, no unverified classroom claim (F06/F15)
  for (let i = 1; i <= 12; i++) { const id = 'l' + String(i).padStart(2, '0'); const src = fs.readFileSync(path.join(dir, id + '.js'), 'utf8');
    chk(`${id}: no Chinese paraphrase labelled 课本原句`, !src.includes('课本原句'));
    chk(`${id}: no unverified «teacher says» claim`, !/teacher (uses|says)|老师(这么)?说|la mestra diu/.test(src)); }
  // 4. F08 wording
  chk('l06: no «No es trenca mai»', !fs.readFileSync(path.join(dir, 'l06.js'), 'utf8').includes('No es trenca mai'));
  const fails = log.filter(l => l.startsWith('FAIL'));
  if (!quiet) { log.forEach(l => console.log(l)); console.log(`\n${log.length - fails.length} PASS · ${fails.length} FAIL`); }
  return fails.length;
}

if (process.argv.includes('--selftest')) {
  const muts = [
    ['l02.js', /re: \/[^\n]*vertebra[^\n]*\n/, null, 'F03 vertebra accepts disks', s => s.replace(/(vertebra: \{[^}]*?re: )\/[^/]*\/(\w*)/, '$1/vertebra$|^atlas$|^axis$/')],
    ['l08.js', null, null, 'F16 abdominal scores external oblique', s => s.replace(/(abdominal: \{[^}]*?re: )\/[^/]*\//, '$1/rectus abdominis|external oblique/')],
    ['l02.js', null, null, 'D1 maxil·lar scores the upper jaw', s => s.replace(/(maxillar: \{[^}]*?re: )\/[^/]*\//, '$1/^mandible$|maxilla$/')],
    ['l05.js', null, null, 'F15 rearranged sentence labelled lit', s => s.replace(/(immobils: \{[^}]*?tx: ')[^']*/, "$1Articulacions immòbils: com les del crani, els ossos estan tan units que semblen només un.")],
    ['l06.js', null, null, 'F08 «No es trenca mai» back', s => s.replace('Es pot encongir i estirar sense trencar-se.', 'No es trenca mai!')],
  ];
  if (await run(path.join(ROOT, 'curs'), true)) { console.log('SELFTEST ABORT: the clean tree already fails'); process.exit(1); }
  let bad = 0;
  for (const [file, , , name, fn] of muts) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'probe-')); for (const f of fs.readdirSync(path.join(ROOT, 'curs'))) fs.copyFileSync(path.join(ROOT, 'curs', f), path.join(tmp, f));
    const before = fs.readFileSync(path.join(tmp, file), 'utf8'); const after = fn(before);
    if (after === before) { console.log(`FAIL selftest «${name}»: mutation did not apply`); bad++; continue; }
    fs.writeFileSync(path.join(tmp, file), after); const n = await run(tmp, true);
    console.log(`${n > 0 ? 'PASS' : 'FAIL'} selftest «${name}» → checker reports ${n} FAIL`); if (!n) bad++;
  }
  console.log(bad ? `\nselftest: ${bad} mutation(s) NOT caught` : '\nselftest: every mutation caught'); process.exit(bad ? 1 : 0);
} else process.exit((await run(path.join(ROOT, 'curs'), false)) ? 1 : 0);
