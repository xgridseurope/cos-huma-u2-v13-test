import fs from 'fs';
const res={};
for (let i=1;i<=12;i++){const id='l'+String(i).padStart(2,'0');
 const m=(await import(`./${id}.mjs`)).default; const src=fs.readFileSync(`/home/claude/cos-huma-u2-v13-test/curs/${id}.js`,'utf8').split('\n');
 const ln=s=>{let k=src.findIndex(l=>l.includes(" "+s)&&/src:/.test(l));if(k<0)k=src.findIndex(l=>l.includes(" "+s));return k+1};
 const book=Object.entries(m.book||{}).map(([k,b])=>({key:k,...b,line:ln(`${k}:`)}));
 const names=Object.entries(m.names||{}).map(([k,n])=>({key:k,ca:n.ca,zh:n.zh,re:String(n.re||''),aid:n.aid,line:ln(`${k}:`)}));
 res[id]={title:m.title,book,names,units:m.units};}
fs.writeFileSync('/tmp/lx/dump.json',JSON.stringify(res,null,1));
let n=0;for(const v of Object.values(res))for(const b of v.book)n++;console.log('book entries',n);
const c={};for(const v of Object.values(res))for(const b of v.book)c[b.src]=(c[b.src]||0)+1;console.log(c);
