# Textbook evidence register · P24–P29 (gate 0)

Evidence for COS-HUMA U2, phase 1 (lessons l01–l12). Built on 2026-11-13 from base commit
`11e30038cd4bdd24859a840866f8de8599492663`. **No lesson source was changed in this commit.**

## Direction of proof

Textbook photo → transcription → course. The course configuration is only ever *compared to* the
transcription. Nothing here takes textbook wording from the course, so a later edit to the course cannot
prove itself correct.

## Files

| File | What it is |
|---|---|
| `transcript.json` | SHA-256 of the six page photos (the 1659×2212 uploads and the 1152×1536 copies in the Round 2 audit package). 140 segments: each has a page, a kind, a box in upload pixels, the text, and the SHA-256 of its crop. |
| `register.json` | Per-item results:<br>• every `book` entry (72) with file:line, source type and verdict<br>• the 39 textbook names mapped to 41 lesson slots<br>• which textbook sentences the course quotes literally<br>• the 8 textbook activities mapped to the course<br>• the 28 Chinese aids labelled 「课本原句」<br>• the maxil·lar «teacher said» claims<br>• a cross-check of the audit's independent excerpts |
| `config_export_11e3003.json` | Read-only export of the `book` and `names` objects from l01–l12 at the base commit. |
| `src/transcript.py` | The verbatim transcription, typed from the photos. This file is the authority. |
| `src/build_register.py` | Rebuilds the two JSON files, and the crops when `--crops DIR` is given. |
| `src/export_config.mjs` | Produces the config export. |

### Segment kinds

| Kind | Meaning |
|---|---|
| `text` | Body text |
| `box` | Framed text |
| `label` | Name on a drawing |
| `figtext` | Sentence printed inside a drawing |
| `fig` | Description of a drawing, in [brackets]; not book text |
| `activity` | Exercise |
| `heading`, `map` | Titles and concept maps |

### Transcription conventions

- Text is typed exactly as printed.
- Line breaks become spaces.
- `...` is printed as three dots.
- Printing errors are kept and marked [sic]. Two cases:
  - P28: «Òrgans del sentits»
  - P29: «El moviments»

## Crops are not committed

The 140 crop images reproduce the textbook pages almost entirely, and this repository is **public** (GitHub
Pages). They are delivered in the gate-0 attachment instead. The repository keeps each crop's box and SHA-256,
so anyone holding the photos can regenerate the crops byte-for-byte and verify them:

```
python3 tools/textbook/src/build_register.py --uploads <photos> --audit <audit original_pages> \
  --config tools/textbook/config_export_11e3003.json --out /tmp/tb --crops /tmp/tb/crops --base 11e3003
```

Some multi-line crops include neighbouring lines because the photos are slightly skewed. The transcription
line, not the crop edge, is the evidence.

## Result at 11e3003

### `book` entries (72)

| Class | Count | Meaning |
|---|---|---|
| verbatim | 48 | Every sentence is found word for word on the cited page. |
| labels-verbatim | 7 | Lists of drawing labels; every label is found. |
| activity-answer | 9 | Answers to activities. Shown as «resposta». |
| drawing-inference | 4 | Inferences from drawings. Shown as «deducció del dibuix». |
| rearranged | 2 | l05 `immobils` and `mobils` reorder the P24 sentences. Gate A replaces them with the verbatim text. |
| mixed | 1 | l11 `elements`: the sentence is literal; the diagram is redrawn (the book prints «del sentits»). |
| summary | 1 | l11 `format` condenses the P28 bullet list. |

The audit's earlier figure of «55 lit» came from a grep. The full export counts 59 `src:'lit'` entries.
Of these, 55 are literal and 4 are not.

### Other findings

- **Names:** all 39 textbook names map to a lesson slot. P25 has two `falanges` labels (hand and foot), which
  map to `l03.falanges` and `l04.falangesPeu`.
- **Activities:**
  - P25 Observa «De quin tipus són…» is covered for only 3 of its 6 bones (F14).
  - The other activities are covered.
- **Chinese aids:** 28 are labelled 「课本原句」 but are Chinese paraphrases. Gate A relabels them
  「课本内容 · 中文意译」.
- **maxil·lar:** the textbook has a single leader line, and its end point lies below the row of teeth, on the
  mandible (crop P25-30). The «teacher says de dalt / de baix» claims (l02.js:2, :21; README:24) are not
  textbook evidence. They are a relay of a classroom remark that has not been verified (F06).
- **abdominal:** the leader line ends in the middle of the abdomen (P27-16).
- **Cross-check:** all 38 of the Round 2 audit's independent excerpts for these pages are found in this
  transcription.
