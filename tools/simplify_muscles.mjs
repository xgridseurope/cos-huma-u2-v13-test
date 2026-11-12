import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { simplify, weld, meshopt, prune, dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
const [inp, out, ratio = '0.4', err = '0.002'] = process.argv.slice(2);
await MeshoptDecoder.ready; await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp); const root = doc.getRoot();
await doc.transform(dequantize());
const tri = m => m.listPrimitives().reduce((s, p) => s + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0);
const layerOf = n => (n.getExtras() && n.getExtras().layer) || (n.getMesh() && n.getMesh().getExtras() && n.getMesh().getExtras().layer);
const layers = {}; for (const n of root.listNodes()) if (n.getMesh()) { const l = layerOf(n) || '?'; layers[l] = (layers[l] || 0) + tri(n.getMesh()); }
console.log('before', layers);
const keepFull = /^(long|short|lateral|medial) head of (left|right) (biceps|triceps) brachii$/i;
const targets = new Set();
for (const n of root.listNodes()) { const m = n.getMesh(); if (!m) continue; if (layerOf(n) === 'skeleton') continue; if (keepFull.test(n.getName())) continue; targets.add(m); }
// simplify only the selected meshes: temporarily detach the others is complex; use the filter-less API per primitive instead
const { simplifyPrimitive } = await import('@gltf-transform/functions');
let b = 0, a = 0;
for (const m of targets) for (const p of m.listPrimitives()) { const t0 = (p.getIndices() ? p.getIndices().getCount() : 0) / 3; b += t0; simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio: +ratio, error: +err }); a += (p.getIndices() ? p.getIndices().getCount() : 0) / 3; }
console.log('muscle tris', b, '->', a, 'meshes', targets.size);
await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(out, doc);
const layers2 = {}; for (const n of root.listNodes()) if (n.getMesh()) { const l = layerOf(n) || '?'; layers2[l] = (layers2[l] || 0) + tri(n.getMesh()); }
console.log('after', layers2);
