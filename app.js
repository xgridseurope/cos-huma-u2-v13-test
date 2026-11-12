// COS-HUMA · Medi U2 · V1.3-fix (Claude) — test build, not the official site.
// Based on GPT V1.3 Complete (structure, ideas) with the defects found in browser QA fixed.
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { MeshoptDecoder } from './vendor/meshopt_decoder.module.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';

const VERSION = 'V1.4 (2026-11-12)';
const $ = id => document.getElementById(id);
// three.js sanitises node names (spaces -> "_", dots removed). V1.3 looked up "Left humerus"
// and therefore never found any arm bone. Every lookup here uses the normalised name.
const norm = s => s.replace(/_/g, ' ').toLowerCase();

// ---------- renderer / scene ----------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0f1b2a);
const camera = new THREE.PerspectiveCamera(30, 1, 0.005, 20);
scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(1, 2, 3); scene.add(sun);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.target.set(0, 0.95, 0);
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

// ---------- model loading (.glb when the host serves it, .glb.js otherwise) ----------
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
async function loadModel(base) {
  try {
    const r = await fetch(`./models/${base}.glb`);
    if (r.ok) { const buf = await r.arrayBuffer(); if (new TextDecoder().decode(new Uint8Array(buf, 0, 4)) === 'glTF') return loader.parseAsync(buf, ''); }
  } catch (e) { /* fall through */ }
  const m = await import(`./models/${base}.glb.js`);
  const bin = atob(m.default); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return loader.parseAsync(u.buffer, '');
}

const COL = { bone: 0xe9e2cf, brain: 0xe48aa0, spinal: 0xf2e6a0, nerves: 0xf2c230, eye: 0x9ec9e8, muscle: 0xc0444f, allMuscle: 0xc0444f };
const CA = { bone: 'os', brain: 'cervell', spinal: 'medul·la espinal', nerves: 'nervis', eye: 'ull · òrgan dels sentits', muscle: 'múscul', allMuscle: 'múscul' };
const mats = {};
for (const k in COL) mats[k] = new THREE.MeshStandardMaterial({ color: COL[k], roughness: .6, metalness: 0, transparent: true, side: THREE.DoubleSide });
mats.bone.opacity = 1;
const muscleMat = { biceps: mats.muscle.clone(), triceps: mats.muscle.clone(), brachialis: mats.muscle.clone() };
const hiMat = new THREE.MeshStandardMaterial({ color: 0x2fd3ff, emissive: 0x1aa6d6, emissiveIntensity: .8, side: THREE.DoubleSide });

const groups = { bone: [], brain: [], spinal: [], nerves: [], eye: [], muscle: [], allMuscle: [] };
const pickables = [];
let boneRoot, nerveRoot;
const byName = {};             // normalised name -> mesh (bones + arm muscles)
const nerveByName = {};        // normalised name -> mesh (nerve layer, world-space geometry)

const t0 = performance.now();
const [eco, nerv] = await Promise.all([loadModel('ecorche'), loadModel('nervous-light')]);
boneRoot = eco.scene; nerveRoot = nerv.scene;
scene.add(boneRoot); scene.updateMatrixWorld(true);

const ARM_MUSCLE = /^(long|short) head of (left|right) biceps brachii$|^(long|lateral|medial) head of (left|right) triceps brachii$/;
boneRoot.traverse(o => {
  if (!o.isMesh) return;
  const n = norm(o.name), layer = o.userData.layer;
  if (layer === 'skeleton') { o.material = mats.bone; o.userData.g = 'bone'; groups.bone.push(o); pickables.push(o); byName[n] = o; o.renderOrder = 2; }
  else if (ARM_MUSCLE.test(n)) { const k = n.includes('biceps') ? 'biceps' : n.includes('triceps') ? 'triceps' : 'brachialis'; o.material = muscleMat[k]; o.userData.g = 'muscle'; o.userData.muscle = k; groups.muscle.push(o); pickables.push(o); byName[n] = o; o.renderOrder = 3; }
  else { o.material = mats.allMuscle; o.userData.g = 'allMuscle'; groups.allMuscle.push(o); pickables.push(o); o.renderOrder = 3; }   // full musculature (static, shown with the arm at rest)
});

// Nerve layer: bake the "warp" morph (local registration into the Écorché frame, see ATTRIBUTION)
// into world-space Float32 geometry so it can be deformed on the CPU at the elbow.
const nerveFlat = new THREE.Group(); nerveFlat.name = 'nerve-layer'; scene.add(nerveFlat);
nerveRoot.updateMatrixWorld(true);
const nerveMeshes = []; nerveRoot.traverse(o => { if (o.isMesh) nerveMeshes.push(o); });
for (const o of nerveMeshes) {
  const g = o.geometry, pos = g.attributes.position, morph = g.morphAttributes.position && g.morphAttributes.position[0];
  const arr = new Float32Array(pos.count * 3); const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    if (morph) v.add(new THREE.Vector3(morph.getX(i), morph.getY(i), morph.getZ(i)));
    v.applyMatrix4(o.matrixWorld); arr.set([v.x, v.y, v.z], i * 3);
  }
  const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  if (g.index) ng.setIndex(g.index.clone()); ng.computeVertexNormals(); ng.computeBoundingSphere();
  const grp = o.userData.group || (o.parent && o.parent.userData.group) || 'nerves';
  const m = new THREE.Mesh(ng, mats[grp]); m.name = o.name; m.userData.g = grp; m.renderOrder = 1;
  m.userData.rest = arr.slice();
  nerveFlat.add(m); groups[grp].push(m); pickables.push(m); nerveByName[norm(o.name)] = m;
}
scene.remove(nerveRoot);
const loadMs = Math.round(performance.now() - t0);

// ---------- elbow kinematics ----------
// Axis from the distal humerus geometry: direction = medial→lateral epicondyle, centre = centroid of
// the articular end (lowest 15 mm). Sense chosen so that the fingertip moves anteriorly (flexion).
const CAL = await fetch('./config/elbow-calibration.json').then(r => r.ok ? r.json() : null).catch(() => null);
function worldVerts(mesh) {
  const p = mesh.geometry.attributes.position, out = [], v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld); out.push(v.clone()); }
  return out;
}
const isForearm = (n, s) => {
  s = s.toLowerCase();
  if (n === `${s} radius` || n === `${s} ulna`) return true;
  if (n.startsWith(s + ' ') && /(scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal)/.test(n)) return true;
  return /phalanx of (left|right) (thumb|index finger|middle finger|ring finger|little finger)$/.test(n) && n.includes(` of ${s} `);
};
const elbows = {};
function buildElbow(side) {
  const s = side.toLowerCase(), lat = side === 'Left' ? 1 : -1;
  const hum = byName[`${s} humerus`]; if (!hum) throw Error('humerus not found: ' + side);
  const H = worldVerts(hum); const minY = Math.min(...H.map(v => v.y)), maxY = Math.max(...H.map(v => v.y));
  const distal = H.filter(v => v.y < minY + 0.04), art = H.filter(v => v.y < minY + 0.015);
  let latEp = distal[0], medEp = distal[0];
  for (const v of distal) { if (lat * v.x > lat * latEp.x) latEp = v; if (lat * v.x < lat * medEp.x) medEp = v; }
  const axis = latEp.clone().sub(medEp).normalize();
  const center = art.reduce((a, v) => a.add(v), new THREE.Vector3()).divideScalar(art.length);
  const top = H.filter(v => v.y > maxY - 0.04).reduce((a, v) => a.add(v), new THREE.Vector3()).divideScalar(H.filter(v => v.y > maxY - 0.04).length);
  const down = center.clone().sub(top).normalize();
  const c = CAL && CAL[side];
  if (c) { center.add(new THREE.Vector3(...c.center_offset_mm).multiplyScalar(0.001)); if (c.axis_tilt_deg) axis.applyEuler(new THREE.Euler(...c.axis_tilt_deg.map(d => d * Math.PI / 180))).normalize(); }
  const meshes = groups.bone.filter(m => isForearm(norm(m.name), side));
  const tip = byName[`distal phalanx of ${s} middle finger`];
  const tipC = new THREE.Box3().setFromObject(tip).getCenter(new THREE.Vector3());
  const rot = (p, deg, sg) => p.clone().sub(center).applyAxisAngle(axis, sg * deg * Math.PI / 180).add(center);
  const sign = rot(tipC, 30, 1).z > rot(tipC, 30, -1).z ? 1 : -1;
  const rest = new Map(meshes.map(m => [m, m.matrixWorld.clone()]));
  // soft tissue that crosses the elbow and has to bend with it
  const softNames = [/^(median|ulnar|radial|musculocutaneous) nerve[rl]001$/, /^(deep|superficial) branch of radial nerve[rl]001$/];
  const soft = Object.entries(nerveByName).filter(([n]) => softNames.some(r => r.test(n)) && n.replace(/001$/, '').endsWith(s[0])).map(([, m]) => m);
  const muscles = groups.muscle.filter(m => norm(m.name).includes(` ${s} `) || norm(m.name).startsWith(s + ' '));
  for (const m of muscles) { m.updateMatrixWorld(true); m.userData.restWorld = worldVerts(m); }
  const wrist = new THREE.Box3(); for (const n of ['lunate', 'capitate', 'scaphoid']) wrist.expandByObject(byName[`${s} ${n}`]);
  const fdir = wrist.getCenter(new THREE.Vector3()).sub(center).normalize();
  const restFlex = Math.round(THREE.MathUtils.radToDeg(Math.acos(Math.min(1, Math.max(-1, fdir.dot(down))))));
  elbows[side] = { side, hum, axis, center, down, sign, meshes, rest, soft, muscles, angle: restFlex, restFlex, tipC, latEp, medEp };
  return elbows[side];
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpW = new THREE.Vector3();
// Optional external control of the biceps/triceps colours (used by the sample lesson, which colours by the
// DIRECTION of movement). null = default V1.4 behaviour (colour by angle).
let muscleColorOverride = null;
let bulgeScale = 1;                       // schematic biceps/triceps thickness change; 1 = V1.4 default, 0 = off (sample lessons)
function setBulge(v) { bulgeScale = v; for (const s of ['Left', 'Right']) setElbow(s, elbows[s].angle); }
function setMuscleColors(bState, tState) {   // 'on' (contracting) | 'off' (relaxing) | 'neutral'
  muscleColorOverride = { b: bState, t: tState };
  const C = { on: [0xd2202f, 0x400008], off: [0xe8a3aa, 0], neutral: [COL.muscle, 0] };
  muscleMat.biceps.color.setHex(C[bState][0]); muscleMat.biceps.emissive.setHex(C[bState][1]);
  muscleMat.triceps.color.setHex(C[tState][0]); muscleMat.triceps.emissive.setHex(C[tState][1]);
}
function clearMuscleColors() { muscleColorOverride = null; }
function setElbow(side, flex) {
  const e = elbows[side]; flex = Math.max(e.restFlex, Math.min(140, flex)); e.angle = flex;
  const deg = flex - e.restFlex;          // rotation away from the model's rest pose
  tmpQ.setFromAxisAngle(e.axis, e.sign * deg * Math.PI / 180);
  const R = new THREE.Matrix4().makeRotationFromQuaternion(tmpQ);
  const M = new THREE.Matrix4().makeTranslation(e.center.x, e.center.y, e.center.z).multiply(R).multiply(new THREE.Matrix4().makeTranslation(-e.center.x, -e.center.y, -e.center.z));
  for (const m of e.meshes) {
    const parentInv = m.parent.matrixWorld.clone().invert();
    m.matrix.copy(parentInv.multiply(tmpM.copy(M).multiply(e.rest.get(m))));
    m.matrix.decompose(m.position, m.quaternion, m.scale); m.updateMatrixWorld(true);
  }
  if (e.block) { e.block.matrix.copy(M); e.block.matrixWorldNeedsUpdate = true; }
  // nerves crossing the elbow: smooth linear-blend bend inside a 50 mm band around the joint
  for (const m of e.soft) {
    const rest = m.userData.rest, pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      tmpV.set(rest[i * 3], rest[i * 3 + 1], rest[i * 3 + 2]);
      const w = deg === 0 ? 0 : smooth(-0.02, 0.03, tmpW.copy(tmpV).sub(e.center).dot(e.down));
      if (w > 0) { tmpW.copy(tmpV).applyMatrix4(M); tmpV.lerp(tmpW, w); }
      pos.setXYZ(i, tmpV.x, tmpV.y, tmpV.z);
    }
    pos.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere();
  }
  // arm muscles: same bend (distal ends follow the forearm) + a SCHEMATIC thickness change
  // (biceps thicker when contracted, triceps thinner when stretched) — labelled as a teaching aid.
  const k = deg / (90 - e.restFlex);
  for (const m of e.muscles) {
    if (!m.visible && deg !== 0) continue;
    const rest = m.userData.restWorld, inv = m.matrixWorld.clone().invert(), pos = m.geometry.attributes.position;
    const isB = m.userData.muscle === 'biceps', isT = m.userData.muscle === 'triceps';
    const axisPt = new THREE.Vector3(), ctr = rest.reduce((a, v) => a.add(v), axisPt).divideScalar(rest.length);
    for (let i = 0; i < pos.count; i++) {
      tmpV.copy(rest[i]);
      const d = tmpW.copy(tmpV).sub(e.center).dot(e.down);
      if (deg !== 0) {
        const belly = smooth(-0.22, -0.12, d) * (1 - smooth(-0.07, -0.02, d));
        if (isB || isT) {
          const along = e.down.clone().multiplyScalar(tmpW.copy(tmpV).sub(ctr).dot(e.down));
          const radial = tmpW.copy(tmpV).sub(ctr).sub(along);
          tmpV.add(radial.multiplyScalar(belly * (isB ? 0.22 : -0.08) * Math.min(k, 1.3) * bulgeScale));
        }
        const w = smooth(-0.02, 0.03, d);
        if (w > 0) { tmpW.copy(tmpV).applyMatrix4(M); tmpV.lerp(tmpW, w); }
      }
      tmpV.applyMatrix4(inv); pos.setXYZ(i, tmpV.x, tmpV.y, tmpV.z);
    }
    pos.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere();
  }
  // muscle state colour (textbook p27): contracted = deep red, relaxed = pale
  if (e.muscles.length && !muscleColorOverride) {
    const b = muscleMat.biceps, t = muscleMat.triceps;
    b.color.setHex(deg > 5 ? 0xd2202f : COL.muscle); b.emissive.setHex(deg > 5 ? 0x400008 : 0);
    t.color.setHex(deg > 5 ? 0xe8a3aa : COL.muscle);
    t.emissive.setHex(0);
  }
  updateMuscleText();
}
buildElbow('Left'); buildElbow('Right');


// ---------- draw-call reduction: merge everything that never moves, per layer ----------
// Keeps per-structure picking through a triangle-range table. Moving parts (forearm/hand bones,
// arm nerves that bend, biceps/triceps) stay separate meshes.
const moving = new Set(); for (const s of ['Left', 'Right']) { elbows[s].meshes.forEach(m => moving.add(m)); elbows[s].soft.forEach(m => moving.add(m)); }
const mergedInfo = new Map(), orig = {};
function mergeLayer(key, list, mat) {
  orig[key] = list.slice();
  const parts = list.filter(m => !moving.has(m));
  if (parts.length < 2) return;
  const geos = [], ranges = []; let tri = 0;
  for (const m of parts) {
    m.updateMatrixWorld(true);
    const g = new THREE.BufferGeometry(); const src = m.geometry;
    const pos = src.attributes.position, arr = new Float32Array(pos.count * 3), v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); arr.set([v.x, v.y, v.z], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const idx = src.index ? Array.from(src.index.array) : Array.from({ length: pos.count }, (_, i) => i);
    g.setIndex(idx); g.computeVertexNormals();
    const n = idx.length / 3; ranges.push({ start: tri, end: tri + n, mesh: m }); tri += n; geos.push(g);
  }
  const merged = new THREE.Mesh(mergeGeometries(geos, false), mat);
  merged.name = `merged-${key}`; merged.userData.g = key; merged.renderOrder = list[0].renderOrder; scene.add(merged);
  mergedInfo.set(merged, ranges);
  for (const m of parts) { m.visible = false; m.userData.mergedInto = merged; const i = pickables.indexOf(m); if (i >= 0) pickables.splice(i, 1); }
  groups[key] = [merged, ...list.filter(m => moving.has(m))];
  pickables.push(merged);
}
mergeLayer('bone', groups.bone, mats.bone);
for (const k of ['brain', 'spinal', 'nerves', 'eye', 'allMuscle']) mergeLayer(k, groups[k], mats[k]);
// each forearm+hand moves as one rigid block, so it can be one draw call too (transform = elbow matrix)
for (const s of ['Left', 'Right']) {
  const e = elbows[s], geos = [], ranges = []; let tri = 0;
  for (const m of e.meshes) {
    const g = new THREE.BufferGeometry(), pos = m.geometry.attributes.position, arr = new Float32Array(pos.count * 3), v = new THREE.Vector3(), rw = e.rest.get(m);
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(rw); arr.set([v.x, v.y, v.z], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3)); const idx = m.geometry.index ? Array.from(m.geometry.index.array) : Array.from({ length: pos.count }, (_, i) => i);
    g.setIndex(idx); g.computeVertexNormals(); const n = idx.length / 3; ranges.push({ start: tri, end: tri + n, mesh: m }); tri += n; geos.push(g);
  }
  const fm = new THREE.Mesh(mergeGeometries(geos, false), mats.bone); fm.name = `merged-forearm-${s}`; fm.userData.g = 'bone'; fm.renderOrder = 2; fm.matrixAutoUpdate = false; scene.add(fm);
  mergedInfo.set(fm, ranges); e.block = fm;
  for (const m of e.meshes) { m.visible = false; m.userData.mergedInto = fm; const i = pickables.indexOf(m); if (i >= 0) pickables.splice(i, 1); }
  groups.bone = groups.bone.filter(m => !e.meshes.includes(m)); groups.bone.push(fm); pickables.push(fm);
  e.blockMatrix = new THREE.Matrix4();
}
const hiOverlay = hiMat.clone(); hiOverlay.polygonOffset = true; hiOverlay.polygonOffsetFactor = -2; hiOverlay.polygonOffsetUnits = -2;

// ---------- helpers for the guided lesson (lesson.js) ----------
const tickers = [], pickListeners = []; let quietPick = false;
const allParts = () => [...(orig.bone || []), ...(orig.allMuscle || []), ...groups.muscle, ...(orig.brain || []), ...(orig.spinal || []), ...(orig.nerves || []), ...(orig.eye || [])];
function find(re, g) { const r = typeof re === 'string' ? new RegExp(re) : re; return allParts().filter(m => (!g || m.userData.g === g) && r.test(norm(m.name))); }
const hlList = [];
function highlight(meshes, color = 0x2fd3ff) {
  const mat = hiOverlay.clone(); mat.color.setHex(color); mat.emissive.setHex(color); mat.emissiveIntensity = .35;
  for (const m of meshes) { if (m.userData.hl) { m.material = mat; continue; } m.userData.hl = { mat: m.material, vis: m.visible, ro: m.renderOrder }; m.material = mat; m.visible = true; m.renderOrder = 6; hlList.push(m); }
}
function clearHighlights() { for (const m of hlList) { const h = m.userData.hl; m.material = h.mat; m.visible = h.vis; m.renderOrder = h.ro; delete m.userData.hl; } hlList.length = 0; if (sel) select(null); }
function boxOf(meshes) { const b = new THREE.Box3(); for (const m of meshes) { m.updateMatrixWorld(true); if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); } return b; }
let fly = null;
function flyTo(target, offset, ms = 900) {
  const t0 = controls.target.clone(), p0 = camera.position.clone(), t1 = target.clone(), p1 = target.clone().add(offset), start = performance.now();
  if (fly) tickers.splice(tickers.indexOf(fly), 1);
  fly = now => { const u = Math.min(1, (now - start) / ms), k = u * u * (3 - 2 * u); controls.target.lerpVectors(t0, t1, k); camera.position.lerpVectors(p0, p1, k); if (u >= 1) { tickers.splice(tickers.indexOf(fly), 1); fly = null; } };
  tickers.push(fly);
}
function flyToMeshes(meshes, dir = new THREE.Vector3(0, .1, 1), pad = 2.2, ms) {
  const b = boxOf(meshes), c = b.getCenter(new THREE.Vector3()), r = Math.max(.06, b.getSize(new THREE.Vector3()).length() / 2);
  const dist = r * pad / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.aspect < 1 ? 1 / Math.max(.45, camera.aspect) * .8 : 1);
  flyTo(c, dir.clone().normalize().multiplyScalar(Math.min(dist, 6)), ms);
}

// ---------- UI wiring ----------
let side = 'Left';
function setLayer(k, on) {
  groups[k].forEach(o => o.visible = on); const cb = document.querySelector(`[data-layer=${k}]`); if (cb) cb.checked = on;
  if (k === 'allMuscle') { const mc = document.querySelector('[data-layer=muscle]'); groups.muscle.forEach(o => o.visible = on || !!(mc && mc.checked)); }
  if (k === 'muscle' || k === 'allMuscle') { for (const s of ['Left', 'Right']) setElbow(s, elbows[s].angle); }
}
const layerOn = k => groups[k].some(o => o.visible);
document.querySelectorAll('[data-layer]').forEach(cb => cb.onchange = () => setLayer(cb.dataset.layer, cb.checked));
function setBoneOpacity(v) { mats.bone.opacity = v / 100; mats.bone.transparent = v < 100; mats.bone.depthWrite = v >= 100; $('ov').textContent = v + '%'; }
$('opBone').oninput = e => setBoneOpacity(+e.target.value);
function setSide(s) { side = s; document.querySelectorAll('#sideSeg button').forEach(b => b.classList.toggle('on', b.dataset.s === s)); $('angle').min = elbows[s].restFlex; setAngle(elbows[s].angle); }
document.querySelectorAll('#sideSeg button').forEach(b => b.onclick = () => setSide(b.dataset.s));
function setAngle(deg) { const e = elbows[side]; deg = Math.max(e.restFlex, Math.min(140, Math.round(deg)));
  // the full musculature is static: when the arm bends, keep only biceps/triceps (which do bend)
  if (deg > e.restFlex + 2 && layerOn('allMuscle')) { setLayer('allMuscle', false); setLayer('muscle', true); } setElbow(side, deg); $('angle').value = deg; $('angleText').textContent = deg === e.restFlex ? `${deg}° (braç en repòs)` : deg + '°'; }
$('angle').oninput = e => setAngle(+e.target.value);
const autoHide = () => { if (innerWidth <= 640) $('panel').classList.add('min'); }; // phone: show the model after a tap
document.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { stopSignal(); setAngle(b.dataset.a === 'rest' ? elbows[side].restFlex : +b.dataset.a); autoHide(); });
function resetAll() { stopSignal(); for (const s of ['Left', 'Right']) setElbow(s, elbows[s].restFlex); setAngle(elbows[side].restFlex); }
$('reset').onclick = () => { resetAll(); autoHide(); };
function updateMuscleText() {
  const e = elbows[side]; if (!e) return; const a = e.angle - e.restFlex;
  $('muscleText').innerHTML = a > 5
    ? 'Quan dobleguem el braç, el tríceps es relaxa. El bíceps es contreu. <span class="tag">p. 27</span>'
    : 'Quan estirem el braç, el tríceps es contreu. El bíceps es relaxa. <span class="tag">p. 27</span>';
}

// camera views
function frameTo(target, offset) { controls.target.copy(target); camera.position.copy(target).add(offset); controls.update(); }
const far = () => innerWidth <= 640 ? 4.6 : 3.4;
const VIEWS = {
  front: () => frameTo(new THREE.Vector3(0, .92, 0), new THREE.Vector3(0, .08, far())),
  side: () => frameTo(new THREE.Vector3(0, .92, 0), new THREE.Vector3(far(), .08, 0)),
  elbow: () => { const e = elbows[side], lat = side === 'Left' ? 1 : -1; frameTo(e.center.clone().add(new THREE.Vector3(0, -.08, .02)), new THREE.Vector3(lat * .55, .05, .55)); },
  head: () => frameTo(new THREE.Vector3(0, 1.45, 0), new THREE.Vector3(.35, .05, 1.0)),
};
document.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { VIEWS[b.dataset.v](); autoHide(); });

// picking
let sel = null;
function select(o) {
  if (sel && !sel.userData.hl) { sel.material = sel.userData.g === 'muscle' ? muscleMat[sel.userData.muscle] : mats[sel.userData.g]; if (sel.userData.mergedInto) sel.visible = false; }
  sel = o;
  if (!o) { $('cName').textContent = 'Toca una estructura'; $('cEn').textContent = '—'; return; }
  if (o.userData.hl) { /* keep the lesson highlight */ } else if (o.userData.mergedInto) { o.visible = true; o.material = hiOverlay; } else o.material = hiMat;
  const m = o.name.match(/^(.*?)(l|r)?(\d{3})$/); const pretty = (m && o.userData.g !== 'bone' && o.userData.g !== 'muscle') ? m[1].replace(/_/g, ' ').trim() + (m[2] ? (m[2] === 'l' ? ' · esquerra' : ' · dreta') : '') : o.name.replace(/_/g, ' ');
  $('cName').textContent = CA[o.userData.g]; $('cEn').textContent = pretty;
}
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
canvas.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
canvas.addEventListener('pointerup', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 8) pickAt(e.clientX, e.clientY); });
function pickAt(x, y) {
  const r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
  const vis = pickables.filter(o => o.visible && !(o.userData.g === 'bone' && mats.bone.opacity < .5));
  const hit = ray.intersectObjects(vis, false)[0];
  let obj = hit ? hit.object : null;
  if (obj && mergedInfo.has(obj)) { const f = hit.faceIndex, r = mergedInfo.get(obj); obj = (r.find(x => f >= x.start && f < x.end) || {}).mesh || null; }
  if (!quietPick) select(obj); pickListeners.forEach(f => f(obj)); return obj ? { name: obj.name, group: obj.userData.g } : null;
}

// ---------- neural signal demos (textbook p. 29 wording; paths are schematic) ----------
function centerline(mesh, axisIdx, bins = 22) {
  const a = mesh.userData.rest || mesh.geometry.attributes.position.array, n = a.length / 3; let lo = 1e9, hi = -1e9;
  for (let i = 0; i < n; i++) { lo = Math.min(lo, a[i * 3 + axisIdx]); hi = Math.max(hi, a[i * 3 + axisIdx]); }
  const acc = Array.from({ length: bins }, () => [0, 0, 0, 0]);
  for (let i = 0; i < n; i++) { const b = Math.min(bins - 1, Math.floor((a[i * 3 + axisIdx] - lo) / (hi - lo + 1e-9) * bins)); acc[b][0] += a[i * 3]; acc[b][1] += a[i * 3 + 1]; acc[b][2] += a[i * 3 + 2]; acc[b][3]++; }
  return acc.filter(b => b[3]).map(b => new THREE.Vector3(b[0] / b[3], b[1] / b[3], b[2] / b[3]));
}
const centroid = ms => { const v = new THREE.Vector3(); let n = 0; for (const m of ms) { const a = m.userData.rest; for (let i = 0; i < a.length; i += 3) { v.x += a[i]; v.y += a[i + 1]; v.z += a[i + 2]; n++; } } return v.divideScalar(n); };
const brainC = centroid(orig.brain || groups.brain);
const cordLine = centerline((orig.spinal || groups.spinal).find(m => /white matter of spinal cord/.test(norm(m.name))), 1, 40).sort((a, b) => b.y - a.y);
const cordAt = y => cordLine.reduce((best, p) => Math.abs(p.y - y) < Math.abs(best.y - y) ? p : best, cordLine[0]).clone();
const vy = n => new THREE.Box3().setFromObject(byName[n]).getCenter(new THREE.Vector3()).y;
function paths(s) {
  const c = s[0].toLowerCase(), low = s.toLowerCase(), e = elbows[s];
  const eye = new THREE.Box3().setFromObject(nerveByName[`sclera${c}001`]).getCenter(new THREE.Vector3());
  const optic = centerline(nerveByName[`optic nerve (ii)${c}001`], 2, 8).sort((a, b) => b.z - a.z);
  const mc = centerline(nerveByName[`musculocutaneous nerve${c}001`], 1, 14).sort((a, b) => b.y - a.y);
  const med = centerline(nerveByName[`median nerve${c}001`], 1, 26).sort((a, b) => a.y - b.y);   // hand -> axilla
  const sup = new THREE.Box3().setFromObject(nerveByName[`superior trunk of brachial plexus${c}001`]).getCenter(new THREE.Vector3());
  const inf = new THREE.Box3().setFromObject(nerveByName[`inferior trunk of brachial plexus${c}001`]).getCenter(new THREE.Vector3());
  const biceps = new THREE.Box3(); e.muscles.filter(m => m.userData.muscle === 'biceps').forEach(m => biceps.expandByObject(m));
  const bic = biceps.isEmpty() ? mc.at(-1) : biceps.getCenter(new THREE.Vector3());
  const tip = new THREE.Box3().setFromObject(byName[`distal phalanx of ${low} index finger`]).getCenter(new THREE.Vector3());
  const c6 = cordAt(vy('sixth cervical vertebra')), c8 = cordAt(inf.y);
  const top = cordLine[0];
  const cordDown = (y0, y1) => cordLine.filter(p => p.y <= y0 && p.y >= y1);
  return {
    voluntary: [
      { step: 1, pts: [eye, ...optic, brainC], hl: ['eye'] },
      { step: 2, pts: [brainC], hl: ['brain'] },
      { step: 3, pts: [brainC, top, ...cordDown(top.y, c6.y), c6, sup, ...mc, bic], hl: ['spinal', 'nerves', 'muscle'] },
    ],
    reflex: [
      { step: 1, pts: [tip, ...med, inf, c8], hl: ['nerves'] },
      { step: 2, pts: [c8], hl: ['spinal'] },
      { step: 3, pts: [c8, sup, ...mc, bic], hl: ['nerves', 'muscle'] },
      { step: 4, pts: [c8, ...cordLine.filter(p => p.y >= c8.y).reverse(), top, brainC], hl: ['brain'], extra: true },
    ],
  };
}
const STEPS = {
  voluntary: ['Un òrgan dels sentits capta un estímul i envia la informació al cervell.', 'El cervell identifica l’estímul i decideix què fer.', 'El cervell envia ordres a través dels nervis als músculs. Els músculs fan els moviments.'],
  reflex: ['Un òrgan dels sentits capta un estímul i envia la informació a la medul·la espinal.', 'La medul·la espinal rep la informació.', 'La medul·la envia les ordres pels nervis als músculs, que fan el moviment de manera immediata.',
    'Després, la informació també arriba al cervell i notem que la tassa crema.'],
};
let sig = null, timeScale = 1; const sigGroup = new THREE.Group(); scene.add(sigGroup);
const dot = new THREE.Mesh(new THREE.SphereGeometry(.018, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); dot.renderOrder = 50;
const props = new THREE.Group(); scene.add(props);
function stopSignal() { sig = null; if ($('example')) $('example').textContent = ''; sigGroup.clear(); props.clear(); for (const k of ['brain', 'spinal', 'nerves', 'eye']) mats[k].emissive.setHex(0); $('steps').querySelectorAll('li').forEach(li => li.classList.remove('on')); }
$('stop').onclick = () => { stopSignal(); };
function showSteps(type) {
  $('stepsTitle').textContent = type === 'reflex' ? 'Moviment reflex · p. 29' : 'Moviment voluntari · p. 29';
  $('example').textContent = type === 'reflex' ? 'Exemple (esquema): la mà toca una tassa calenta i la retirem de cop.' : 'Exemple (esquema): veiem el semàfor verd i decidim doblegar el braç.';
  $('steps').innerHTML = STEPS[type].map((t, i) => `<li data-i="${i}" class="${i === 3 ? 'extra' : ''}">${i === 3 ? '<em>Explicació addicional (no surt al llibre):</em> ' : ''}${t}</li>`).join('');
}
function startSignal(type) {
  stopSignal(); setAngle(elbows[side].restFlex); showSteps(type);
  const P = paths(side)[type];
  const legs = P.map(l => { const pts = l.pts.length > 1 ? l.pts : [l.pts[0], l.pts[0].clone().add(new THREE.Vector3(0, 0.0001, 0))];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(8, pts.length * 6), 0.0035, 6, false), new THREE.MeshBasicMaterial({ color: type === 'reflex' ? (l.extra ? 0xb9a6ff : 0xffa040) : 0x4de2fa, transparent: true, opacity: .0, depthTest: false }));
    tube.renderOrder = 40; sigGroup.add(tube); return { ...l, curve, tube }; });
  sigGroup.add(dot);
  // props: hot cup at the fingertip (reflex) or a green light in front of the eyes (voluntary)
  if (type === 'reflex') {
    const tip = new THREE.Box3().setFromObject(byName[`distal phalanx of ${side.toLowerCase()} index finger`]).getCenter(new THREE.Vector3());
    const lat = side === 'Left' ? 1 : -1;
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.04, .034, .09, 28), new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff2200, emissiveIntensity: .6 }));
    cup.position.copy(tip).add(new THREE.Vector3(lat * .045, -.02, .03)); props.add(cup);
    for (let i = 0; i < 3; i++) { const steam = new THREE.Mesh(new THREE.TorusGeometry(.012, .002, 6, 20), new THREE.MeshBasicMaterial({ color: 0xffd0b0, transparent: true, opacity: .7 })); steam.position.copy(cup.position).add(new THREE.Vector3(0, .06 + i * .02, 0)); steam.rotation.x = Math.PI / 2; props.add(steam); }
  } else {
    const light = new THREE.Mesh(new THREE.SphereGeometry(.025, 20, 14), new THREE.MeshBasicMaterial({ color: 0x33ff66 }));
    light.position.set(0, 1.6, .55); props.add(light);
  }
  const DUR = type === 'reflex' ? [700, 350, 600, 1800] : [1600, 900, 2200];
  sig = { type, legs, dur: DUR, i: 0, t: performance.now() };
}
$('voluntary').onclick = () => { startSignal('voluntary'); autoHide(); };
$('reflex').onclick = () => { startSignal('reflex'); autoHide(); };
function tickSignal(now) {
  if (!sig) return;
  const leg = sig.legs[sig.i]; if (!leg) return;
  const u = Math.min(1, Math.max(0, (now - sig.t) * timeScale / sig.dur[sig.i]));
  leg.tube.material.opacity = .85; dot.position.copy(leg.curve.getPoint(u));
  $('steps').querySelectorAll('li').forEach(li => li.classList.toggle('on', +li.dataset.i === sig.i));
  const glow = Math.sin(now / 90) * .5 + .5;
  for (const k of ['brain', 'spinal', 'nerves', 'eye']) mats[k].emissive.setHex(leg.hl.includes(k) ? 0x553300 : 0), mats[k].emissiveIntensity = .5 + glow;
  if (leg.hl.includes('muscle')) { setLayer('muscle', true); }
  // the movement itself
  const rf = elbows[side].restFlex;
  if (sig.type === 'reflex' && sig.i >= 2) sig.legs[0].tube.visible = false;   // the hand has left the stimulus
  if (sig.type === 'reflex' && sig.i === 2) setAngle(rf + (80 - rf) * Math.min(1, u * 2.2));
  if (sig.type === 'voluntary' && sig.i === 2 && u > .55) setAngle(rf + (90 - rf) * Math.min(1, (u - .55) / .45));
  if (u >= 1) { sig.i++; sig.t = now; if (sig.i >= sig.legs.length) { sig = null; dot.removeFromParent(); } }
}

// ---------- performance probe (for real phones) ----------
const frameTimes = []; let last = performance.now();
function visibleTris() { let t = 0; scene.traverse(o => { if (o.isMesh && o.visible) { let p = o.parent, vis = true; while (p) { if (!p.visible) vis = false; p = p.parent; } if (vis) t += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } }); return Math.round(t); }
async function measure(seconds = 10) {
  frameTimes.length = 0; const startT = performance.now(); controls.autoRotate = true; controls.autoRotateSpeed = 6;
  await new Promise(r => setTimeout(r, seconds * 1000)); controls.autoRotate = false;
  const ft = frameTimes.slice().sort((a, b) => a - b), n = ft.length; const gl = renderer.getContext(); const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const res = { version: VERSION, when: new Date().toISOString(), seconds, frames: n, fps_avg: +(n / ((performance.now() - startT) / 1000)).toFixed(1),
    frame_ms_p50: +ft[Math.floor(n * .5)].toFixed(1), frame_ms_p95: +ft[Math.floor(n * .95)].toFixed(1), visible_triangles: visibleTris(), draw_calls: renderer.info.render.calls,
    pixel_ratio: renderer.getPixelRatio(), viewport: [innerWidth, innerHeight], gpu: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'n/a', ua: navigator.userAgent, load_ms: loadMs, muscles_on: layerOn('allMuscle') };
  $('perfOut').textContent = JSON.stringify(res, null, 1); return res;
}
$('perf').onclick = async () => { $('perfOut').textContent = 'Mesurant 10 s… no toquis la pantalla.'; const pn = $('panel'), wasMin = pn.classList.contains('min'); pn.classList.add('min'); VIEWS.front(); await measure(10); if (!wasMin) pn.classList.remove('min'); $('perfOut').scrollIntoView({ block: 'nearest' }); };
$('perfCopy').onclick = () => { navigator.clipboard?.writeText($('perfOut').textContent).catch(() => {}); };

// ---------- loop ----------
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
renderer.setAnimationLoop(now => { frameTimes.push(now - last); last = now; if (frameTimes.length > 4000) frameTimes.shift(); for (const f of tickers.slice()) f(now); controls.update(); tickSignal(now); renderer.render(scene, camera); });
$('load').remove();
const panel = $('panel'); if (innerWidth <= 640) panel.classList.add('min'); $('tg').onclick = () => panel.classList.toggle('min');
for (const s of ['Left', 'Right']) setElbow(s, elbows[s].restFlex);
setLayer('muscle', false); setLayer('allMuscle', false); VIEWS.front(); setSide('Left'); updateMuscleText(); setBoneOpacity(+$('opBone').value);
$('ver').textContent = VERSION;

// ?perf=1 : phone-friendly automatic measurement (no menu needed)
if (new URLSearchParams(location.search).has('perf')) {
  panel.classList.add('min'); document.querySelector('.lesson').style.display = 'none';
  setLayer('allMuscle', true);   // heaviest scene of the lesson (full musculature + skeleton + nervous system)
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;left:10px;right:10px;top:40%;z-index:9;background:#f7f5ef;border-radius:12px;padding:12px 14px;font:14px system-ui;box-shadow:0 4px 18px rgba(0,0,0,.4)';
  ov.innerHTML = '<b>Mesurant el rendiment (10 s)…</b><br>No toquis la pantalla.';
  document.body.appendChild(ov);
  setTimeout(async () => {
    const r = await measure(10);
    const ok = r.fps_avg >= 30;
    ov.innerHTML = `<b style="font-size:18px">${r.fps_avg} fps</b> <span style="color:${ok ? '#167a3a' : '#b3261e'}">${ok ? '✔ ≥ 30' : '✘ < 30'}</span><br>
      P95: ${r.frame_ms_p95} ms · ${r.visible_triangles.toLocaleString()} triangles · ${r.draw_calls} draw calls<br>
      <span style="font-size:11px;color:#5b6673">${r.gpu}</span>
      <div style="display:flex;gap:6px;margin-top:8px"><button id="pc" style="flex:1;min-height:40px">Copia el resultat</button><button id="px" style="flex:1;min-height:40px">Tanca</button></div>`;
    ov.querySelector('#pc').onclick = () => navigator.clipboard?.writeText(JSON.stringify(r, null, 1)).then(() => ov.querySelector('#pc').textContent = 'Copiat ✔').catch(() => {});
    ov.querySelector('#px').onclick = () => ov.remove();
  }, 1500);
}

// test hook
window.__app = { setBulge, setMuscleColors, clearMuscleColors, resolveHit: h => { if (h && mergedInfo.has(h.object)) { const r = mergedInfo.get(h.object); return (r.find(x => h.faceIndex >= x.start && h.faceIndex < x.end) || {}).mesh || null; } return h ? h.object : null; }, pickables, STEPS, find, highlight, clearHighlights, flyTo, flyToMeshes, boxOf, tickers, pickListeners, layerOn, norm, get side() { return side; }, set quietPick(v) { quietPick = v; }, VERSION, THREE, scene, camera, controls, renderer, elbows, setElbow, setSide, setAngle, setLayer, setBoneOpacity, resetAll, VIEWS, pickAt, startSignal, stopSignal, measure, visibleTris, loadMs, byName, nerveByName, groups, orig, mats, paths,
  get signal() { return sig ? { type: sig.type, i: sig.i } : null }, set timeScale(v) { timeScale = v; } };
window.dispatchEvent(new Event('app-ready'));
