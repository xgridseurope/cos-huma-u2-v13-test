"""Build tools/expected/answer_key.json from the textbook register and the model's mesh names.
Written from the textbook meaning of each label (tools/textbook) and decisions D1/D2 — never from the lesson regexes.
usage: python3 tools/expected/make_key.py   (reads models/ecorche.glb)"""
import json, struct, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
f = open(f'{ROOT}/models/ecorche.glb', 'rb').read(); L = struct.unpack('<I', f[12:16])[0]
N = sorted({n.get('name', '').replace('_', ' ') for n in json.loads(f[20:20 + L])['nodes']})
def has(*subs, side=None, excl=()):
    out = [n for n in N if all(s in n.lower() for s in subs) and not any(e in n.lower() for e in excl) and (side is None or side in n.lower())]
    assert out, (subs, side); return out
disks = has('intervertebral disk')
verts = [n for n in N if n.lower().endswith('vertebra') and 'disk' not in n.lower()] + ['Atlas', 'Axis']
key = {
 "_about": "Answer key written from the textbook register (tools/textbook), NOT from the lesson configs. required = mesh names that must be scored right; forbidden = must NOT be scored right; neutral = must give an explanation without right/wrong (D1, D2). Exact mesh names of models/ecorche.glb (underscores shown as spaces).",
 "_source": "tools/textbook/register.json @ 21a3ded; decisions D1/D2 (user 11-13), R18",
 "l02": {
  "crani": {"required": has('parietal bone') + ['Frontal bone', 'Occipital bone'], "forbidden": ['Mandible'] + has('maxilla') + has('zygomatic bone')},
  "maxillar": {"arrow": "P25-30: end point below the teeth = mandible", "required": ['Mandible'], "forbidden": ['Frontal bone'] + has('zygomatic bone'), "neutral": has('maxilla')},
  "columna": {"required": verts[:3] + ['Sacrum'], "forbidden": has(' rib')[:2]},
  "vertebra": {"required": verts, "forbidden": disks},
  "costella": {"required": has(' rib'), "forbidden": ['Body of sternum'] + verts[:2]},
  "estern": {"required": ['Body of sternum', 'Manubrium'], "forbidden": has(' rib')[:2]},
  "omoplat": {"required": has('scapula', excl=('levator', 'subscap')), "forbidden": has('clavicle')},
  "pelvis": {"required": has('hip bone'), "forbidden": has('femur')}},
 "l03": {
  "humer": {"required": ['Left humerus'], "forbidden": ['Left radius', 'Left ulna']},
  "cubit": {"required": ['Left ulna'], "forbidden": ['Left radius']},
  "radi": {"required": ['Left radius'], "forbidden": ['Left ulna']},
  "carp": {"required": ['Left scaphoid', 'Left lunate', 'Left capitate', 'Left hamate'], "forbidden": has('metacarpal', side='left')[:2]},
  "metacarp": {"required": has('metacarpal', side='left'), "forbidden": ['Left capitate']},
  "falanges": {"required": has('phalanx of left', 'finger')[:3] + has('phalanx of left thumb'), "forbidden": has('metacarpal', side='left')[:1] + has('toe', side='left')[:1]}},
 "l04": {
  "femur": {"required": ['Left femur'], "forbidden": ['Left tibia', 'Left patella']},
  "rotula": {"required": ['Left patella'], "forbidden": ['Left femur']},
  "tibia": {"required": ['Left tibia'], "forbidden": ['Left fibula']},
  "perone": {"required": ['Left fibula'], "forbidden": ['Left tibia']},
  "tars": {"required": ['Left talus', 'Left calcaneus'], "forbidden": has('metatarsal', side='left')[:1]},
  "metatars": {"required": has('metatarsal', side='left'), "forbidden": ['Left talus']},
  "falangesPeu": {"required": has('phalanx of left', 'toe')[:3], "forbidden": has('metatarsal', side='left')[:1]}},
 "l08": {
  "orbicular": {"required": has('orbicularis oculi')[:2], "forbidden": has('orbicularis oris')},
  "masseter": {"required": has('masseter'), "forbidden": has('temporalis')},
  "ecm": {"required": has('sternocleidomastoid'), "forbidden": has('trapezius')[:1]},
  "trapezi": {"required": has('trapezius'), "forbidden": has('trapezium')},
  "deltoide": {"required": has('deltoid'), "forbidden": has('pectoralis major')[:1]},
  "pectoral": {"required": has('pectoralis major'), "forbidden": has('pectoralis minor')},
  "abdominal": {"arrow": "P27-16: midline = rectus abdominis", "required": has('rectus abdominis'), "forbidden": [], "neutral": has('external oblique')},
  "dorsal": {"required": has('latissimus dorsi'), "forbidden": has('trapezius')[:1]},
  "gluti": {"required": has('gluteus maximus'), "forbidden": has('gluteus medius')}},
 "l09": {
  "biceps": {"required": has('biceps brachii'), "forbidden": has('biceps femoris') + has('triceps brachii')[:1]},
  "triceps": {"required": has('triceps brachii'), "forbidden": has('biceps brachii')[:1]},
  "quadriceps": {"required": has('rectus femoris') + has('vastus lateralis'), "forbidden": has('biceps femoris')[:1]},
  "bicepsFem": {"required": has('biceps femoris'), "forbidden": has('biceps brachii')},
  "tibial": {"required": has('tibialis anterior'), "forbidden": has('tibialis posterior')},
  "besso": {"required": has('gastrocnemius'), "forbidden": has('soleus')}},
 "l10": {
  "biceps": {"required": has('left biceps brachii'), "forbidden": has('left biceps femoris')},
  "triceps": {"required": has('left triceps brachii'), "forbidden": has('left biceps brachii')}},
 "l01_RE": {
  "curts": {"note": "short-bone colouring (P24-13: com les vertebres)", "required": verts[:3], "forbidden": disks},
  "llargs": {"required": ['Left humerus', 'Left femur'], "forbidden": disks[:1]}}
}
json.dump(key, open(f'{ROOT}/tools/expected/answer_key.json', 'w'), ensure_ascii=False, indent=1)
print('answer key written:', sum(len(v) for k, v in key.items() if not k.startswith('_')), 'entries;', len(disks), 'disks,', len(verts), 'vertebrae')
