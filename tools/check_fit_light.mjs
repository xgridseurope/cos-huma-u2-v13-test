import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const doc=await io.read('/home/claude/v13fix/models/nervous-light.glb');
const E=JSON.parse(fs.readFileSync('/home/claude/nerv/ecorche.inspect.json')).items;
const S=JSON.parse(fs.readFileSync('/home/claude/nerv/skeleton.inspect.json')).items;
const G=JSON.parse(fs.readFileSync('/home/claude/nerv/warp_pairs.json')).global_translation_m;
const W=(M,p,t)=>[M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+t*M[12],M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+t*M[13],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]+t*M[14]];
const verts=(n)=>{const M=n.getWorldMatrix();const out=[];for(const pr of n.getMesh().listPrimitives()){const p=pr.getAttribute('POSITION'),d=pr.listTargets()[0].getAttribute('POSITION');const a=[0,0,0],b=[0,0,0];for(let i=0;i<p.getCount();i++){p.getElement(i,a);d.getElement(i,b);const w=W(M,a,1),dw=W(M,b,0);out.push([w[0],w[1],w[2],dw[0],dw[1],dw[2]]);}}return out;};
const get=(name)=>verts(doc.getRoot().listNodes().find(n=>n.getName()===name));
const cord=get('White matter of spinal cord.001');
const ord=['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth'];
const levels=[];
const ctr=i=>i.min.map((v,k)=>(v+i.max[k])/2);
for(const [L,cnt,word] of [['C',7,'cervical'],['T',12,'thoracic'],['L',5,'lumbar']]) for(let k=1;k<=cnt;k++){
  const en = L==='C'&&k===1?'Atlas':L==='C'&&k===2?'Axis':`${ord[k-1][0].toUpperCase()+ord[k-1].slice(1)} ${word} vertebra`;
  const zn = L==='C'&&k===1?'Atlas (C1).001':L==='C'&&k===2?S.find(s=>s.name.startsWith('Axis'))?.name:`Vertebra ${L}${k}.001`;
  const e=E.find(x=>x.name===en), z=S.find(x=>x.name===zn); if(!e||!z){console.log("miss",en,zn);continue;}
  // reference: cord verts within z vertebra y-range (raw Z frame)
  const zr=cord.filter(v=>v[1]>=z.min[1]&&v[1]<=z.max[1]); if(zr.length<5){console.log("few",en,zr.length);continue;}
  const zc=[0,2].map(k2=>zr.reduce((a,v)=>a+v[k2],0)/zr.length); const zv=ctr(z);
  const relZ=[zc[0]-zv[0], zc[1]-zv[2]];
  const ev=ctr(e);
  const sample=(mode)=>{ const pts=cord.map(v=>mode==='warp'?[v[0]+v[3],v[1]+v[4],v[2]+v[5]]:mode==='trans'?[v[0]+G[0],v[1]+G[1],v[2]+G[2]]:[v[0],v[1],v[2]]).filter(p=>p[1]>=e.min[1]&&p[1]<=e.max[1]);
    if(pts.length<5) return null; const c=[0,2].map(k2=>pts.reduce((a,p)=>a+p[k2],0)/pts.length); const rel=[c[0]-ev[0],c[1]-ev[2]]; return Math.hypot(rel[0]-relZ[0],rel[1]-relZ[1])*1000; };
  levels.push({level:L+k, raw_mm:sample('raw'), translation_mm:sample('trans'), warp_mm:sample('warp')});
}
const summ=k=>{const a=levels.map(l=>l[k]).filter(x=>x!=null).sort((a,b)=>a-b);return {n:a.length,median:+a[Math.floor(a.length/2)].toFixed(1),max:+a.at(-1).toFixed(1)};};
// brain vs skull: brain group warped bbox vs Écorché cranial bones bbox
const brainNodes=doc.getRoot().listNodes().filter(n=>n.getExtras()?.group==='brain');
let bmn=[1e9,1e9,1e9],bmx=[-1e9,-1e9,-1e9],rmn=[1e9,1e9,1e9],rmx=[-1e9,-1e9,-1e9];
for(const n of brainNodes) for(const v of verts(n)){for(let k=0;k<3;k++){bmn[k]=Math.min(bmn[k],v[k]+v[k+3]);bmx[k]=Math.max(bmx[k],v[k]+v[k+3]);rmn[k]=Math.min(rmn[k],v[k]);rmx[k]=Math.max(rmx[k],v[k]);}}
const skullBones=E.filter(x=>/^(Frontal bone|Occipital bone|Left parietal bone|Right parietal bone|Left temporal bone|Right temporal bone|Sphenoid bone)$/i.test(x.name));
const smn=[0,1,2].map(k=>Math.min(...skullBones.map(b=>b.min[k]))), smx=[0,1,2].map(k=>Math.max(...skullBones.map(b=>b.max[k])));
const margin=(mn,mx)=>[0,1,2].map(k=>[+((mn[k]-smn[k])*1000).toFixed(1),+((smx[k]-mx[k])*1000).toFixed(1)]);
const res={spinal_cord_levels:levels,spinal_summary:{raw:summ('raw_mm'),translation:summ('translation_mm'),warp:summ('warp_mm')},
 skull_bbox:{min:smn,max:smx}, brain_margin_inside_skull_mm:{note:'[min-side, max-side] per axis x,y,z; negative = brain bbox pokes outside skull bbox',raw:margin(rmn,rmx),warp:margin(bmn,bmx)}};
fs.writeFileSync('/home/claude/v13fix/qa/fit_check_light.json',JSON.stringify(res,null,1));
console.log(JSON.stringify(res.spinal_summary), JSON.stringify(res.brain_margin_inside_skull_mm));
