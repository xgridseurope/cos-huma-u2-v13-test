"""Gate 0 evidence register for P24-P29 (COS-HUMA U2, lessons l01-l12).

Inputs (read-only):
  - the six textbook photos (uploads 1659x2212) and the audit-package copies (1152x1536)
  - transcript.py  (verbatim transcription typed from the photos, with page boxes)
  - config_export.json (book/names exported from the lesson files at BASE commit by export_config.mjs)
Outputs: transcript.json, register.json (+ crops/ when --crops DIR is given; crops are NOT committed).
The course configuration is only ever compared TO the transcription; nothing here derives textbook text from the course.
"""
import json, re, sys, hashlib, os, argparse
sys.path.insert(0, os.path.dirname(__file__))
from transcript import SEG
ap = argparse.ArgumentParser(); ap.add_argument('--uploads', required=True); ap.add_argument('--audit', required=True)
ap.add_argument('--config', required=True); ap.add_argument('--out', required=True); ap.add_argument('--crops'); ap.add_argument('--base', required=True)
a = ap.parse_args()
UP = {24:'2b34b1b2',25:'61cedede',26:'0eebbfbf',27:'5f75d844',28:'881325f9',29:'59c4becd'}
AUD = {24:'P24_1000052692(1).jpg',25:'P25_1000052693(2).jpg',26:'P26_1000052694(3).jpg',27:'P27_1000052695(1).jpg',28:'P28_1000052696(1).jpg',29:'P29_1000052697.jpg'}
sha = lambda p: hashlib.sha256(open(p,'rb').read()).hexdigest()
def norm(s):
    s = s.replace('’', "'").replace('…', '...').replace('–', '-')
    return re.sub(r'\s+', ' ', s).strip()
# ---- pages + segments ----
pages = [{'page':p,'upload_id':u,'upload_sha256':sha(f'{a.uploads}/{u}-image.jpg'),'upload_px':[1659,2212],
          'audit_file':'evidence/input/original_pages/'+AUD[p],'audit_sha256':sha(f'{a.audit}/{AUD[p]}'),'audit_px':[1152,1536]} for p,u in UP.items()]
segs, cnt = [], {}
if a.crops:
    from PIL import Image; os.makedirs(a.crops, exist_ok=True)
for p, kind, bb, tx in SEG:
    cnt[p] = cnt.get(p, 0) + 1; sid = f'P{p}-{cnt[p]:02d}'
    pad = (10, 28) if kind in ('text','heading','activity','map') else (6, 6)
    bb2 = [max(0,bb[0]-pad[0]), max(0,bb[1]-pad[1]), min(1659,bb[2]+pad[0]), min(2212,bb[3]+pad[1])]
    s = {'id':sid,'page':p,'kind':kind,'bbox_upload_px':bb2,'text':tx}
    if a.crops:
        fn = f'{a.crops}/{sid}.jpg'; Image.open(f'{a.uploads}/{UP[p]}-image.jpg').crop(tuple(bb2)).save(fn, quality=88); s['crop_sha256'] = sha(fn)
    segs.append(s)
json.dump({'base_commit':a.base,'pages':pages,'segments':segs}, open(f'{a.out}/transcript.json','w'), ensure_ascii=False, indent=1)
# ---- compare course entries to the transcription ----
D = json.load(open(a.config))
pagetext, labels = {}, {}
for s in segs:
    if s['kind'] in ('text','box','label','figtext','activity','heading'): pagetext[s['page']] = pagetext.get(s['page'],'') + ' ' + norm(s['text'])
    if s['kind'] == 'label': labels.setdefault(s['page'], {})[norm(re.sub(r' \((mà|peu)\)','',s['text']))] = s['id']
def sentences(t): return [x for x in re.split(r'(?<=[.:])\s+', norm(t)) if x]
FINAL = {  # manual decisions for entries the automatic check could not confirm (see README)
 ('l05','immobils'): ('rearranged', 'A: replace with the verbatim P24 sentences P24-17 + P24-18'),
 ('l05','mobils'):   ('rearranged', 'A: replace with the verbatim P24 sentences P24-19 + P24-20'),
 ('l11','elements'): ('mixed', 'A: keep the sentence P28-07 as literal; show the diagram P28-08 as «esquema del llibre» (the book prints «Òrgans del sentits» [sic])'),
 ('l11','format'):   ('summary', 'A: relabel as summary of P28-10 + the three bullet headings (not literal)'),
}
book = []
for l, v in D.items():
    for b in v['book']:
        tx, p = norm(b['tx']), b['p']; row = {'lesson':l,'key':b['key'],'file':f'curs/{l}.js','line':b['line'],'src':b['src'],'page':p,'where':b.get('where'),'tx':b['tx']}
        if b['src'] == 'lit':
            if all(x in pagetext.get(p,'') for x in sentences(tx)):
                row['class'] = 'verbatim'
                row['segments'] = sorted({s['id'] for s in segs if s['page']==p and any(norm(s['text']) in x or x in norm(s['text']) for x in sentences(tx))})
            elif ' · ' in tx and all(norm(x) in labels.get(p,{}) for x in tx.split(' · ')):
                row['class'] = 'labels-verbatim'; row['segments'] = [labels[p][norm(x)] for x in tx.split(' · ')]
            else:
                row['class'], row['action'] = FINAL[(l, b['key'])]; row['segments'] = []
        else:
            row['class'] = {'act':'activity-answer','dib':'drawing-inference'}[b['src']]
        book.append(row)
# names: every textbook name label -> lesson slots
names = []
for l, v in D.items():
    for n in v['names']:
        pg = 25 if l in ('l02','l03','l04') else 27 if l in ('l08','l09','l10') else 28
        sid = labels.get(pg,{}).get(norm(n['ca']))
        names.append({'lesson':l,'key':n['key'],'file':f'curs/{l}.js','line':n['line'],'ca':n['ca'],'page':pg,'label_segment':sid,'match':n['re']})
label_ids = {sid for d in labels.values() for sid in d.values()} | {s['id'] for s in segs if s['kind']=='label' and '(peu)' in s['text'] or '(mà)' in s['text']}
textbook_names = [s for s in segs if s['kind']=='label' and s['page'] in (25,27,28)]
covered = {n['label_segment'] for n in names}
name_cov = [{'segment':s['id'],'name':s['text'],'lesson_slots':[f"{n['lesson']}.{n['key']}" for n in names if n['label_segment']==s['id'] or (n['ca']=='falanges' and s['text'].startswith('falanges') and ((n['key']=='falanges')==('(mà)' in s['text'])))]} for s in textbook_names]
# literal coverage of each textbook sentence
seg_use = []
for s in segs:
    if s['kind'] not in ('text','box'): continue
    users = [f"{r['lesson']}.{r['key']}" for r in book if s['id'] in r.get('segments',[])]
    seg_use.append({'segment':s['id'],'text':s['text'],'quoted_literally_by':users})
activities = [
 {'textbook':'P25 activitat 1 (EXPLICA … òrgans vius)','segments':['P25-31'],'course':['l01.vius'],'status':'covered'},
 {'textbook':'P25 activitat 2 (CLASSIFICA … CAP / TRONC / EXTREMITATS)','segments':['P25-32'],'course':['l04.zones'],'status':'covered'},
 {'textbook':'P25 Observa · A quins ossos s’uneixen les costelles?','segments':['P25-34'],'course':['l02.unio'],'status':'covered'},
 {'textbook':'P25 Observa · De quin tipus són: omòplat, radi, maxil·lar, falanges, vèrtebra, tíbia','segments':['P25-35','P25-36'],'course':['l01.tipusAct'],'status':'partial: radi, tíbia, vèrtebra only (F14)'},
 {'textbook':'P26 CientíficaMENT · Pensa (goma / molla)','segments':['P26-17'],'course':['l06.pensa'],'status':'covered (no book answer; labelled)'},
 {'textbook':'P27 activitat 3 (EXPLICA característiques)','segments':['P27-22'],'course':['l09.act3'],'status':'covered (no book answer; labelled)'},
 {'textbook':'P27 activitat 4 (articulació; quan és més gruixut)','segments':['P27-23'],'course':['l10.colze','l10.gruixut'],'status':'covered'},
 {'textbook':'P29 activitat 5 (COPIA i ORDENA)','segments':['P29-14','P29-15'],'course':['l11.a5'],'status':'covered'},
]
json.dump({'base_commit':a.base,'book_entries':book,'names':name_cov,'name_slots':names,'textbook_sentences':seg_use,'activities':activities},
          open(f'{a.out}/register.json','w'), ensure_ascii=False, indent=1)
from collections import Counter
print('segments', len(segs), '| book', Counter(r['class'] for r in book), '| names', len(name_cov), 'uncovered', [n['name'] for n in name_cov if not n['lesson_slots']])
