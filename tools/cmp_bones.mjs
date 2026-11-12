import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const load = async f => { const d = await io.read(f); const o = {}; for (const n of d.getRoot().listNodes()) { const m = n.getMesh(); if (!m || (n.getExtras()||{}).layer !== 'skeleton') continue; const M = n.getWorldMatrix(); const p = m.listPrimitives()[0].getAttribute('POSITION'); const a = []; const v = [0,0,0];
  for (let i = 0; i < p.getCount(); i++) { p.getElement(i, v); a.push([M[0]*v[0]+M[4]*v[1]+M[8]*v[2]+M[12], M[1]*v[0]+M[5]*v[1]+M[9]*v[2]+M[13], M[2]*v[0]+M[6]*v[1]+M[10]*v[2]+M[14]]); } o[n.getName()] = a; } return o; };
const A = await load(process.argv[2]), B = await load(process.argv[3]); let mx = 0, worst = '';
const key = p => p.map(x => Math.round(x * 2000)).join(',');
for (const k in A) { const a = A[k], b = B[k]; if (!b) { console.log('missing', k); continue; }
  // nearest-neighbour (grid) distance from each original vertex to the new vertex set
  const g = new Map(); const cell = p => p.map(x => Math.floor(x / .004)).join(',');
  for (const q of b) { const c = cell(q); if (!g.has(c)) g.set(c, []); g.get(c).push(q); }
  for (const p of a) { let best = 1e9; const c = p.map(x => Math.floor(x / .004));
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) { const L = g.get([c[0]+dx, c[1]+dy, c[2]+dz].join(',')); if (L) for (const q of L) best = Math.min(best, Math.hypot(p[0]-q[0], p[1]-q[1], p[2]-q[2])); }
    if (best > mx) { mx = best; worst = k; } } }
console.log('bones', Object.keys(A).length, 'max diff (m)', mx.toExponential(2), worst);
