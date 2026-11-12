// Injected measurement helpers. Works with any page exposing THREE objects via window.__probe = {T, boneRoot(), nerveRoot()}.
window.__elbow = (function(){
  const P=()=>window.__probe;
  function worldVerts(mesh, every=1){ const T=P().T; const g=mesh.geometry, pos=g.attributes.position, out=[]; const v=new T.Vector3(); mesh.updateMatrixWorld(true);
    for(let i=0;i<pos.count;i+=every){ mesh.getVertexPosition(i,v); out.push(v.clone().applyMatrix4(mesh.matrixWorld)); } return out; }
  function get(name){ let o=null; P().boneRoot().traverse(n=>{ if(n.isMesh && n.name.replace(/_/g,' ')===name) o=n; }); return o; }
  function snapshot(side){ const S=side; const names=[]; P().boneRoot().traverse(n=>{ if(n.isMesh) names.push(n); });
    const sel=names.filter(n=>{const v=n.name.replace(/_/g,' ').toLowerCase(); return v.includes(S.toLowerCase());});
    const m={}; for(const n of sel){ const vs=worldVerts(n,4); m[n.name]=vs.map(v=>[v.x,v.y,v.z]); } return m; }
  function metrics(side){
    const T=P().T; const hum=get(side+' humerus'), rad=get(side+' radius'), uln=get(side+' ulna');
    const H=worldVerts(hum), R=worldVerts(rad), U=worldVerts(uln);
    const hminY=Math.min(...H.map(v=>v.y));
    const Hd=H.filter(v=>v.y<hminY+0.035);
    // proximal forearm = verts within 4 cm of the distal humerus region (in world space, after motion)
    const c=new T.Vector3(); Hd.forEach(v=>c.add(v)); c.divideScalar(Hd.length);
    const near=[...R,...U].filter(v=>v.distanceTo(c)<0.05);
    let gapMin=1e9; const dists=[];
    for(const f of near){ let m=1e9; for(const h of Hd){ const d=f.distanceToSquared(h); if(d<m)m=d; } m=Math.sqrt(m); dists.push(m); if(m<gapMin)gapMin=m; }
    dists.sort((a,b)=>a-b);
    // penetration proxy: proximal ulna/radius verts inside the humerus (ray parity, DoubleSide)
    const ray=new T.Raycaster(); hum.material.side=T.DoubleSide; let inside=0, tested=0;
    let maxDepth=0; for(const f of near.filter((_,i)=>i%2===0)){ ray.set(f,new T.Vector3(0.123,0.987,0.1).normalize()); const hits=ray.intersectObject(hum,false); tested++; if(hits.length%2===1){ inside++; let m=1e9; for(const h of H){const d=f.distanceTo(h); if(d<m)m=d;} if(m>maxDepth)maxDepth=m; } }
    // hand position: middle finger distal phalanx centre
    const tip=get('Distal phalanx of '+side.toLowerCase()+' middle finger'); const tb=new T.Box3().setFromObject(tip).getCenter(new T.Vector3());
    const hb=new T.Box3().setFromObject(hum).getCenter(new T.Vector3());
    return {gapMin_mm:+(gapMin*1000).toFixed(2), gapP10_mm:+((dists[Math.floor(dists.length*0.1)]||0)*1000).toFixed(2), nearCount:near.length,
      insideHumerus:inside, insideTested:tested, maxPenetration_mm:+(maxDepth*1000).toFixed(2), humerusCenter:[hb.x,hb.y,hb.z].map(x=>+x.toFixed(4)), fingertip:[tb.x,tb.y,tb.z].map(x=>+x.toFixed(4)), distalHumerusCenter:[c.x,c.y,c.z].map(x=>+x.toFixed(4))};
  }
  function maxDiff(a,b){ let m=0; for(const k in a){ const A=a[k],B=b[k]; if(!B) continue; for(let i=0;i<A.length;i++){ const d=Math.hypot(A[i][0]-B[i][0],A[i][1]-B[i][1],A[i][2]-B[i][2]); if(d>m)m=d; } } return m; }
  return {metrics,snapshot,maxDiff,get};
})();
