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

## Codex acceptance of `e981b8a` and the F17/F18 fix (2026-11-13)

Codex independent acceptance of `e981b8a`: **FAIL**, with 1 Major (F17) and 1 Minor (F18). Everything else in
F01–F16 and N1 was accepted, within the evidence levels stated in Codex's report. This round fixes **only** F17 and F18.

**F17: asynchronous navigation race (Major).** A step's delayed callbacks kept running after the child left the
step, and they changed the new step. Examples:
- `sequence()` waits 700 ms after an answer; it then removed the new step's tap listener and installed one for the
  old step's next item, so later taps were scored for the old item;
- `choiceSeries` then ran `hidden()` + `setNext(true)` on the new step (Codex: l01 P1 → P2, «Continua» unlocked,
  P2 passed unanswered and unrecorded);
- the tap highlight clears (900 / 1400 ms), the 2.2 s / 2.5 s help demos and the l10 arm demo could land on the new
  step.

Fix (`curs/player.js`, `curs/l10.js`):
- every step (`render()`) and every review item gets a new life number;
- `wait()` and `later()` only go on while the step that started them is still on screen; an old wait never
  resolves;
- `sequence()` removes only its own tap listener;
- `choiceSeries`, `ladderChoice` and `tapTask` stop after a demo if the step has changed;
- lessons get `c.alive()`; the l10 demo uses it.

No delay was lengthened and no input is blocked. The rules for answering, skipping, looking again, resuming,
self-check and review are unchanged.

Test: `python3 tools/f17_race.py OUT/`. The child's action and «Més tard» / «Torna a mirar» run in the same browser
task (0 ms apart), so the old callbacks are always pending, whatever the machine speed. The test then observes for
3.5 s and checks the new step's «Continua» state, its model highlights and the records. It covers:
- S1: «Troba» tap, then a later tap on the old item;
- S2 and S2b: last choiceSeries answer, leaving with «Més tard» (Codex's case) and with «Torna a mirar»;
- S3: leaving during the model demo after a second wrong answer;
- S4: neutral tap.

Results:
- before the fix (`e981b8a`): 27/5 and 26/6 FAIL;
- after the fix: 32/0, twice.

Logs: `tools/expected/evidence/f17_race_*`.

**F18: evidence index (Minor).** Three corrections:
- README rule 7 (and the matching `l02.js` comment) cited P25-16 for maxil·lar. P25-16 is the vèrtebra label; the
  maxil·lar label is P25-10, and the leader line is still P25-30.
- In `register.json`, the foot «falanges» (P25-29) also listed `l03.falanges` (hand). It now lists only
  `l04.falangesPeu`, and `l03.falanges` now points to P25-22. The generator `build_register.py` was fixed the same
  way.
- The known-limits note on l11 taps now names the `geo_probe` @cervell case.

Neither the textbook content nor the 39/39 writing coverage changed.

**Not in this round.** F19 (desktop- and tablet-first UI/UX: teaching panel, lesson cameras, device fit) is
registered in the master doc as a separate work package. A design proposal comes first, for the user to approve. No
interface was changed.

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
| 4b | `python3 tools/f17_race.py OUT/` | F17: fast exits (0 ms after an answer, tap, wrong answer or neutral tap) do not change the new step's «Continua», model highlights or records; a later tap is not scored for the old step. |
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
  are not in `answer_key.json`. Their taps are covered by `curs_test.py l11` (full lesson flow) and by one
  `tools/geo_probe.py` case, `l11.nervis / @cervell` (brain surface with a nerve < 2 cm behind → wrong). There is no
  per-name answer-key check for l11. (F18 fix, 2026-11-13: this line used to say «only» curs_test.)

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
