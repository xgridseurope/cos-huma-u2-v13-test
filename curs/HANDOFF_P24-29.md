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

**Codex second review of `6a1dfdd` (2026-11-14): F17 FAIL, F18 PASS.** The l01 race was confirmed fixed, but a new
l10 case was found: drag the slider, go straight back to «Mira» and play the demo; the slider's old 1 s timer then
resets the demo's contraction colours.

Root cause: in `sliderUI` (l10), the «still for 1 s → neutral colours» timer was a plain `setTimeout`. The F17
lifecycle only stops `wait()` / `later()`, so this timer was never covered. A second case had the same cause inside
one step: in P4, the second move in the wrong direction starts the straighten demo from within the slider's input
handler, and the handler then arms a new 1 s timer. The step's life number does not change there, so the lifecycle
alone cannot stop it.

Fix, `curs/l10.js` only:
- one shared slider timer (`idleT`) for the lesson;
- the timer belongs to the step that armed it (`c.alive()`);
- a new slider or a starting demo cancels it;
- while a demo plays (`demoOn`), no slider timer may reset the colours; the demo resets them itself when it ends.

No delay changed and no input blocked. Without a demo, the slider still turns neutral after about 1 s (test S9).

Other l10 timers checked:
- the demo's 250 ms wait and its animation were already covered;
- `c.hidden()` after the P4 demo never runs once the child has left;
- P4's 400 ms timer only resets the question's own counters.

Test: `tools/f17_race.py` S5–S9, which watch `__app.setMuscleColors` calls:
- S5: Codex's case;
- S6: rapid repeated drags;
- S7: re-entering the demo after leaving it mid-way;
- S8: P4, same step;
- S9: the normal slider behaviour is unchanged.

Results:
- before (`6a1dfdd`): 42/4 FAIL, twice; S1–S4 passed, and S5–S8 failed with a neutral reset 0.6–0.9 s after the
  demo colours;
- after: 46/0, twice, and then 51/0 with S9 added.

Logs: `tools/expected/evidence/f17b_*`.

**Codex third review of `b75f88a` (2026-11-14): F17 FAIL, S1 only.** l10 (S5–S9) and F18 passed. In Codex's S1
(l02 g1-troba → g1-maxil, tap and «Més tard» in the same JavaScript task, 3/3), the new step's disabled «Continua»
was unlocked about 1.2 s later. The native touch control passed.

Root cause (Claude's review confirms Codex's analysis, with source evidence). The answer fires `done`
synchronously, but `sequence()` resumes after `await new Promise(done)` only once the current script has finished.
In a single JS task, that script has already left the step and run `render()` → `newLife()`. So `await wait(700)` is
created after the leave, with the NEW life number, and resolves.

Measured order:
- same task: leave at 48 ms, wait created at 49 ms;
- native boundary: wait created at 55 ms, leave at 468 ms;
- real touch: wait created at 1729 ms, leave at 2738 ms.

Then the loop-top `if (!ok()) return` *resolved* the sequence ("finished"), and the caller (g1-troba, line 282) ran
`feedback()` + `setNext(true)` on the new step.

Verdict: both. Two user inputs never share one task, so real touch could not trigger S1 with this code (native
boundary 3/3 PASS, real touch PASS). But `sequence()` relied on that ordering instead of checking its own lifecycle,
and a stale sequence reported "finished".

Fix (approved P1, 4 logic lines):
- `curs/player.js` `sequence()`: re-check the step token right after `done`. A stale sequence returns a promise that
  never settles, so none of its 8 callers (player.js stages, l07.js:77, l10.js:118) runs its completion code. No
  caller and no lesson file changed.
- `curs/relacio.js` `bend()` (l11 «doblega el braç»): stop the arm animation when the step changes, and never
  resolve. This was a confirmed real-touch case: leaving mid-bend set the new step's arm to 85° and reset it ~0.5–1.4 s
  later.

Codex's caller-side alternative (prototype P2, token checks after each `await sequence()` in player.js) fixes
player.js but not the lesson-file callers. l07 still failed (T5), and l10.js:118 is frozen.

Why Claude's earlier S1 passed falsely: the new step's "initial" state was read over CDP several round trips after
the leave, after the stale unlock (0.9–1.7 s) had already happened. Both snapshots were "unlocked", so they compared
equal. Fix: record it in the page, in the same task as the leave (`window.__init_can`).

Other test corrections, test-only:
- S8 waits for P4's 400 ms reset before the second drag (a late timer under load meant the precondition was not met);
- the S9 upper bound went from 1.5 s to 4 s (a correct reset at 1.65 s failed once); the lower bound stays ≥ 0.8 s;
- `f17_s1_review.py` T6 now leaves from the first animation frame and counts all calls after the leave (it had missed
  a stale frame 18 ms after the leave);
- T7 observes for 12 s;
- T5 reads «answered» from the page feedback.

Tests (the committed curs/ and tools files are byte-identical to the tested prototype):
- `tools/f17_s1_review.py`, 3 repeats per case:
  - base `b75f88a`: 36/7 FAIL (S1 ×3 and both variants, l07, l11 bend);
  - fixed: **43/0**;
  - P2: 41/2.
- `tools/f17_race.py` (final version): base 50/1 (S1 only); fixed **51/0**.
- probe 217/0; selftest: every mutation caught; b_scenarios 24/0; geo_probe 12/0.
- curs_test: l01 56/0, l02 144/0, l07 57/0, l10 47/0, l11 92/0, l12 48/0.

Logs: `tools/expected/evidence/f17c_*`. Review report and probes: `tools/f17_review/`.

Checked and safe:
- l12 signal demo left mid-way: the next step's `recall()` calls `hidden()` → `sig.clear()`;
- the waits that `ladderChoice` / `tapTask` / the lesson demos create synchronously in the input handler.

Remaining risks, not changed in this round:
- `relacio.js` `leg()` relies on the next step calling `hidden()`. An optional hardening is in
  `f17c_P1_plus_leg_hardening_NOT_MERGED.diff`.
- `wait()` takes the life number when it is called. **Development rule:** after awaiting an external promise (an
  event, an animation), check the step token before any `wait()` or any state change.
- All tests run in a software-rendered phone emulation. Real devices and a trial with Emily are still not verified.

F17 is NOT declared closed: it is waiting for Codex's fourth independent review.

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
| 4c | `python3 tools/f17_s1_review.py OUT/ [N]` | F17 S1 review (N repeats): the Codex S1 path and its variants in one JS task; native boundary and real touch as controls; normal completion still unlocks; l07 lesson-file `c.sequence`; l11 bend left mid-animation; l12 signal demo. |
| 4b | `python3 tools/f17_race.py OUT/` | F17: fast exits (0 ms after an answer, tap, wrong answer or neutral tap) do not change the new step's «Continua», model highlights or records; a later tap is not scored for the old step (S1–S4). l10: no old slider timer resets a demo's contraction colours (S5–S8); the normal slider behaviour is unchanged (S9). |
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
