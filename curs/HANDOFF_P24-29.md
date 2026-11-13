# Phase 1 handoff — COS-HUMA U2, textbook pp. 24–29, lessons l01–l12

Date: 2026-11-13. Content version: `P24-29·fase1·2026-11-13b`.

**Authority.** The master doc «COS-HUMA U2 · P24–29 教学与实施方案（V1.4 之后）», section 11
(https://claude.ai/artifact/91gvtowzP5qxC1d1bYJvP9). This file only summarises it for the repository.

**Scope.** This phase covers lessons l01–l12. Lessons l13–l19 (pp. 30–37) are **phase 2** and are designed in a new
window.

**Kept unchanged:**
- the official COS-HUMA site;
- the 1A trial (`sample.html`);
- the 30-step course (`index.html` / `lesson.js` / `app.js`). None of these files was modified in this phase.

## Commits (base `11e3003`)

| Commit | Gate | What |
|---|---|---|
| `21a3ded` | 0 | Textbook evidence register `tools/textbook/`. No lesson source changed. |
| `151a927` | A + C1 | Textbook content and scoring (F03 F06 F07 F08 F14 F15 F16).<br>Test reliability (F04): `tools/probe_test.mjs`, `tools/expected/`, `tools/geo_probe.py`, `tools/curs_test.py` fixes. |
| `0f1108d` | B + F13 | Autonomous learning and records (F01 F02 F05 F09 F10 F11 F12 N1).<br>README current rules. `tools/b_scenarios.py`. |
| (this file's commit) | C2 | **Scoring fix found by the regression:** a tap whose visible surface is another named part of the lesson is wrong (before: a brain tap with a nerve < 2 cm behind scored as «nervis»; 2 of 78 brain points in the l11 body view). Touch-probe case + counter-example.<br>Probe: each of the 39 names keeps a writing exercise (+ mutation).<br>`curs_test.py`: screenshot on a failed tap.<br>Regression evidence (`tools/expected/evidence/*_C2*`) and this handoff. |

## How to re-verify (independent reviewer)

Start the local server:

```
python3 -m http.server 8772 --bind 127.0.0.1
```

Then run each check. Every test exits 1 on any FAIL.

| # | Command | What it checks |
|---|---|---|
| 1 | `node tools/probe_test.mjs` | Scoring of the 38 bone and muscle name slots (+ the l01 colour regexes) against `tools/expected/answer_key.json`.<br>Every `lit` sentence against the transcription.<br>No Chinese paraphrase labelled 课本原句.<br>No teacher-quote claim.<br>Each of the 39 textbook names (from `register.json`) keeps a writing exercise (user decision 11-13). |
| 2 | `node tools/probe_test.mjs --selftest` | Re-introduces six defects (F03, F16, D1, F15, F08, a name losing its writing exercise). Each must be caught. |
| 3 | `python3 tools/geo_probe.py OUT/` | Real touch taps:<br>• disc → wrong, named<br>• vertebra → right<br>• mandible → right<br>• maxilla → neutral<br>• rectus abdominis → right<br>• external oblique → neutral<br>• brain surface with a nerve < 2 cm behind, while looking for the nerves → wrong (fails if the C2 picking fix is removed) |
| 4 | `python3 tools/b_scenarios.py OUT/` | • Resume after reload<br>• New round archives<br>• Skip («Més tard»)<br>• Look again («Torna a mirar») → «amb ajuda»<br>• Old-version record kept apart<br>• Week review: dated, ≤ 8, skippable<br>• View buttons<br>• Soft time hints<br>• No parent wording |
| 5 | `python3 tools/curs_test.py lXX OUT/` | Each lesson, full flow plus review rounds. About 8–20 min per lesson with software rendering. |

**Checking the textbook evidence itself.**
- `tools/textbook/README.md` explains the register.
- The page photos and the crop images are in the delivery attachment, not in this public repository. Every crop is
  traceable by SHA-256.
- Do not use the lesson files to prove the textbook wording.

## What is NOT verified (do not report as done)

- **Real phone:** not tested; only a 393×851 touch emulation with software rendering. This covers:
  - the view buttons and their 44 px targets;
  - the time hints;
  - frame rate.
- **Emily's trial:** not done. This covers learning effect, time per lesson, default review size, and whether
  self-check works for her.
- **Catalan proofreading by a person:** not done. This covers all new child-facing sentences:
  - the maxil·lar and abdominal explanations;
  - the Observa stage;
  - the R11 questions in l01;
  - the self-check buttons, hints and start page.
- **The teacher's classroom wording for maxil·lar:** only Emily's relay, labelled «no comprovat».
- **Textbook transcription:** typed from photos by Claude.
  - Cross-checked against the Round 2 audit's 38 independent excerpts (38/38).
  - Not proofread against the paper book.
- **Timing parameters (R13, R14):** suggestions approved by the user, not measured.

## Known limits

- **l11 names** (cervell, medul·la espinal, nervis) are scored by nervous-system layer, not by mesh name, so they
  are not in `answer_key.json`. Their taps are covered by `curs_test.py l11` only.

- **Records** stay in this browser's `localStorage`: there is no sync across devices, and clearing site data
  loses them.
- **Mesh overlap:** the model's external oblique overlaps the rectus abdominis. A tap in the middle of the belly
  scores through the picking depth tolerance (2 cm). A tap on the side is neutral.
- **Self-check data:** self-check answers (`auto-*`) are not evidence of independent recall. Only in-app
  no-help answers are «Sol/a, sense ajuda», and even those are single answers, not mastery (R9).
- **Archived records:** the archive (`cosHumaCurs_<id>_arxiu`) grows without limit. Not an issue at expected use.

## Next window (phase 2)

Start from the textbook pages P30–P37 and design l13–l19.

**Reuse:**
- `player.js`;
- the evidence method of `tools/textbook`;
- the probe tests.

**Inherit:** only the confirmed rules R1–R12 and R17–R19, plus the decisions in force. Do not copy phase-1 lesson
content as rules.
