import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression, KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { weld, simplify, prune, dedup, meshopt } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import fs from 'fs';
const [inp,self,pairsf,out,statsf]=process.argv.slice(2);
await MeshoptDecoder.ready; await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(inp); const root=doc.getRoot();
const sel=JSON.parse(fs.readFileSync(self)); const P=JSON.parse(fs.readFileSync(pairsf)).pairs;
const group={}; for(const g of ['brain','spinal','nerves','eye']) for(const n of sel[g]) group[n]=g;
const CA={brain:'cervell',spinal:'medul·la espinal',nerves:'nervis',eye:'òrgans dels sentits (ull)'};
const scene=root.listScenes()[0];
const keep=[];
for(const n of root.listNodes()){ if(n.getMesh() && group[n.getName()]) keep.push(n); }
// flatten: bake world matrix into positions, reparent to scene
const mul=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
for(const n of keep){ const M=n.getWorldMatrix(); const mesh=n.getMesh();
  for(const pr of mesh.listPrimitives()){ for(const s of ['NORMAL','TANGENT','TEXCOORD_0','COLOR_0']){ const a=pr.getAttribute(s); if(a) pr.setAttribute(s,null);} 
    const pos=pr.getAttribute('POSITION'); const arr=new Float32Array(pos.getCount()*3); const v=[0,0,0];
    for(let i=0;i<pos.getCount();i++){pos.getElement(i,v); const w=mul(M,v); arr.set(w,i*3);} 
    pos.setArray(arr); pr.setMaterial(null); }
  n.setMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]); n.setExtras({group:group[n.getName()],ca:CA[group[n.getName()]]});
}
for(const sc of root.listScenes()) for(const c of sc.listChildren()) sc.removeChild(c);
for(const n of root.listNodes()) { for(const c of n.listChildren()) n.removeChild(c); }
for(const n of keep) scene.addChild(n);
await doc.transform(prune(), dedup(), weld(), simplify({simplifier:MeshoptSimplifier, ratio:0.12, error:0.0015}), prune());
// warp as morph target
const Z=P.map(p=>p.z), D=P.map(p=>p.d);
function idw(p){ const ds=Z.map((z,i)=>[Math.hypot(z[0]-p[0],z[1]-p[1],z[2]-p[2]),i]).sort((a,b)=>a[0]-b[0]).slice(0,6);
  let sw=0,o=[0,0,0]; for(const [d,i] of ds){const w=1/Math.max(d,1e-4)**2; sw+=w; for(let k=0;k<3;k++) o[k]+=w*D[i][k];} return o.map(x=>x/sw); }
const stats=[]; let tris=0, verts=0;
for(const n of keep){ const mesh=n.getMesh(); if(!mesh) continue;
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9],wmn=[1e9,1e9,1e9],wmx=[-1e9,-1e9,-1e9],cen=[0,0,0],wcen=[0,0,0],cnt=0;
  for(const pr of mesh.listPrimitives()){ const pos=pr.getAttribute('POSITION'); const c=pos.getCount(); verts+=c; tris+=(pr.getIndices()?pr.getIndices().getCount():c)/3;
    const disp=new Float32Array(c*3); const v=[0,0,0];
    for(let i=0;i<c;i++){pos.getElement(i,v); const d=idw(v); disp.set(d,i*3);
      for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],v[k]);mx[k]=Math.max(mx[k],v[k]);const w=v[k]+d[k];wmn[k]=Math.min(wmn[k],w);wmx[k]=Math.max(wmx[k],w);cen[k]+=v[k];wcen[k]+=w;} cnt++;}
    const acc=doc.createAccessor().setType('VEC3').setArray(disp).setBuffer(root.listBuffers()[0]);
    const t=doc.createPrimitiveTarget('warp').setAttribute('POSITION',acc); pr.addTarget(t);
    pr.setMaterial(null);
  }
  mesh.setWeights([0]); mesh.setExtras({targetNames:['warp']});
  stats.push({name:n.getName(),group:group[n.getName()],verts:mesh.listPrimitives().reduce((a,p)=>a+p.getAttribute('POSITION').getCount(),0),min:mn,max:mx,warp_min:wmn,warp_max:wmx,centroid:cen.map(x=>x/cnt),warp_centroid:wcen.map(x=>x/cnt)});
}
doc.createExtension(KHRDracoMeshCompression).dispose();
await doc.transform(meshopt({encoder:MeshoptEncoder, level:'medium'}));
await io.write(out,doc);
fs.writeFileSync(statsf,JSON.stringify({meshes:stats.length,tris:Math.round(tris),verts,stats},null,1));
console.log('meshes',stats.length,'tris',Math.round(tris),'verts',verts,'bytes',fs.statSync(out).size);
