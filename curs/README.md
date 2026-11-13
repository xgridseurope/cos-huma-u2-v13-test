# Lesson player — 12 small lessons, `curs.html?l=<lesson>`

## Current rules — phase 1, P24–29, l01–l12 (2026-11-13 · content version `P24-29·fase1·2026-11-13b`)
Authority: master doc «COS-HUMA U2 · P24–29 教学与实施方案», section 11 (rules R1–R20, F01–F16, N1). The sections below this one
are history: where they conflict with this section, this section wins. Each rule: date · basis · what it replaces.

1. **Textbook evidence first** (2026-11-13 · R1, gate 0). The textbook wording lives in `tools/textbook/` (transcription with page
   boxes and photo hashes). Course text is checked against it, never the other way round. Source labels: `lit` = verbatim (checked
   automatically by `tools/probe_test.mjs`), `res` = summary, `exp` = explanation (not book text), `act` = activity answer,
   `dib` = inference from a drawing, `rel` = classroom relay (not verified). Chinese aids are «课本内容·中文意译», never «原句».
   Replaces: «all sentences checked against the photos» claims without a register; «55 lit» (the export counts 59 `lit`, 55 verbatim).
2. **The child learns on her own** (2026-11-13 · R2, R10, R11, N1). No step needs a parent. Explanations, said names and paper
   spelling are self-checked and stored as `auto-*`, never as an independent right answer. «Més tard» skips a step (stored as
   `skip`/`salt`, never right); «Torna a mirar» goes back to the teaching step and later answers there count «amb ajuda».
   Replaces: family buttons («Per a la família», «Ho ha dit bé?», «Compara amb el paper», day-2 «Resposta per a la família»),
   parent-approved skipping, automatic skipping after a pre-test.
3. **Records** (2026-11-13 · R8, F02, F11, F12). Record v3 per lesson in `localStorage` (`cosHumaCurs_<id>`), with content version
   and current step: a reload offers «Continua»; «Comença de nou» archives the old record (`…_arxiu`); a record of another content
   version is archived, never mixed. Review rounds are an array with kind and date. Replaces: v2 single `day2` object, start = overwrite.
4. **No mastery from one answer** (R9). «Sol/a, sense ajuda» is one answer. 94 units are only a coverage count.
5. **Light reviews** (2026-11-13 · R14, F05). «Revisió curta» (suggested next day) and «Revisió de la setmana» (suggested about a
   week later): suggestions, never locks; at most 8 items by default, weak items first, the rest optional; each item skippable.
   Replaces: 16–23 obligatory day-2 items.
6. **Time** (2026-11-13 · R13). No countdown. Soft hints at about 12 and 15 minutes, dismissible. Replaces: fixed 15–20 min per lesson.
7. **maxil·lar** (2026-11-13 · D1, R18, evidence P25-16/P25-30). Scored location = the P25 leader line target, the lower jaw
   (model «Mandible»). The upper jaw is neutral: explained, scored neither right nor wrong. Term explanation (`exp`) and Emily's
   classroom relay (`rel`, «no comprovat») are separate. The teacher's words are NOT verified. Replaces every earlier maxil·lar
   rule below (both jaws / pending verification / teacher quote).
8. **abdominal** (2026-11-13 · D2, evidence P27-15/P27-16). Scored = rectus abdominis; external oblique neutral with explanation.
9. **Intervertebral discs** (F03). Not vertebrae, not short bones: a tap on a disc is wrong and named «un disc … (no és un os)».
10. **P25 Observa** (D4, F14). All six bones appear; omòplat, maxil·lar and falanges are observed and discussed, never scored.
11. **View buttons** (F09). 🎯 reset · 🔄 turn round · ＋/－ zoom · A+ text size, 44 px. Page zoom stays off (it fights the 3D gestures).
12. **Tests** (F04). `tools/probe_test.mjs` (scoring + literal labels vs `tools/expected/answer_key.json` and `tools/textbook`,
    `--selftest` proves it catches reverted fixes), `tools/geo_probe.py` (real taps on disc / vertebra / jaws / abdominals),
    `tools/b_scenarios.py` (resume, new round, skip, look again, old version, reviews, view buttons, time hints),
    `tools/curs_test.py <lesson>` (full lesson + reviews). All exit non-zero on any FAIL. Passing tests ≠ textbook accuracy ≠ learning.
13. **Not verified**: real phone, Emily's trial, Catalan proofreading by a person, the teacher's classroom wording.
14. **Phase boundary**: l13–l19 are phase 2 (P30–37), designed in a new window; the proposal at the end of this file is not binding.

Each small lesson is one config file in this folder; `player.js` runs it. Lessons so far:
`l10` Bíceps i tríceps (principle lesson, ported from the 1A sample) · `l03` Els ossos del braç i de la mà (name lesson).
Muscle batch: `l06` El sistema muscular (p. 26–27, principle) · `l07` La forma dels músculs (p. 26, 4 types) · `l08` Músculs del cap i del tronc (p. 27, 9 names in 4 groups) · `l09` Músculs de les extremitats (p. 27, 6 names in 3 pairs; bíceps/tríceps only name + place, the pair mechanism stays in l10).
Skeleton batch: `l01` El sistema esquelètic (p. 24–25, principle) · `l02` Ossos del cap i del tronc (p. 25, 8 names in 4 pairs) · `l04` Ossos de la cama i del peu (p. 25, 7 names in 3 groups + activity 2) · `l05` Les articulacions (p. 24, principle).
The 1A sample (`sample.html`) stays as it is for Emily's trial.

## Catalogue (textbook pages 24–29; pp. 22–23 are only the unit opener)
| # | Lesson | Book | Type | Names to learn |
|---|---|---|---|---|
| l01 | El sistema esquelètic | p. 24–25 | principle | — |
| l02 | Ossos del cap i del tronc | p. 25 | names (4 pairs) | crani, maxil·lar\*, columna vertebral, vèrtebra, costella, estern, omòplat, pelvis |
| l03 | Ossos del braç i de la mà | p. 25 | names (2 groups) | húmer, cúbit, radi, carp, metacarp, falanges |
| l04 | Ossos de la cama i del peu | p. 25 | names (3 groups) + activity 2 | fèmur, ròtula, tíbia, peroné, tars, metatars, falanges |
| l05 | Les articulacions | p. 24 | principle | — |
| l06 | El sistema muscular | p. 26–27 | principle | — |
| l07 | La forma dels músculs | p. 26 | principle (4 types) | — |
| l08 | Músculs del cap i del tronc | p. 27 | names (4 groups) | orbicular de les parpelles, masseter, esternoclidomastoidal, trapezi, deltoide, pectoral, abdominal, dorsal, gluti |
| l09 | Músculs de les extremitats | p. 27 | names (3 pairs) | bíceps, tríceps, quàdriceps, bíceps femoral, tibial, bessó |
| l10 | Bíceps i tríceps | p. 27 (activity 4) | principle | — |
| l11 | Com ens movem: el sistema nerviós | p. 28 (+ activity 5, p. 29) | principle + names (1 group) | cervell, medul·la espinal, nervis |
| l12 | Moviments voluntaris i reflexos | p. 29 | principle | — |
**[Superseded 2026-11-13 — see «Current rules»]** \* maxil·lar (resolved 2026-11-13): the school teacher says «maxil·lar de dalt / maxil·lar de baix», so both jaws are the answer; a tap on either counts and location is scored again (l02 continuous run 125/125, qa/curs1f).

## Shared (player.js) — written once
| Piece | What it guarantees |
|---|---|
| Stage runner | child-paced «Continua»; no countdown; back button locked once recall/practice starts |
| Show/hide rules | before an answer: no book sentence, no labels, no highlight that points at the answer, Chinese gloss = question only; scoring points appear after «Ja ho he dit» / «Comprova» |
| Help ladder | 1st error → specific cue (names what was tapped + location hint); 2nd → demo again; then retry alone → recorded "amb ajuda" |
| Records | understanding units, location, mixed review, saying the name, spelling — separate; accent-only spelling ≠ failure; day 2 stored apart |
| Task types | prediction (not scored) · choice with ladder · tap without labels · say the name of a highlighted part · spell on paper · spoken recall with family check |
| Name-lesson template | `nameGroupStages()`: introduce one by one (child-paced) → tap with labels (practice, not recorded) → say names, labels hidden → locate from a NEW view without labels. `reviewStage()` only after every name was practised; `spellStage()`; `resultsStage()` |
| Added for the skeleton batch | `stepper()` child-paced teaching cards with their own 3D scene · `choiceSeries()` several choice items in a row (each with its own highlight `subject`, help ladder, «Continua» only after the last one) · `show` per name (e.g. one rib highlighted for «costella», the whole rib cage accepted when tapping) · day-2 `choice` items |
| Added for the muscle batch | `partWord` ('os' / 'múscul') in the say-the-name task · `targets` = tap targets that are not names to learn (l07 «toca un múscul anular») · `noLoc` names are taught, said and spelled but never an independent location item (l02 maxil·lar, pending verification) · `reviewStage(keys, view, viewFor)` front/back view per item · book source `dib` (deduction from the drawing) · `memo()` memory aid and `curio()` fun fact, both tagged «no s’avalua» |
| Day 2 | one item at a time from the lesson's `day2()` list (spoken part with the model hidden, locate, book page, spelling) |

## Per lesson (config) — still hand work
Textbook sentences with source type (`lit` word for word / `act` answer to a book activity) · units · names (regex on the model, Catalan name, spelling with accent marked, location hint) · camera views · question texts and cues · day-2 list. Principle lessons keep their own demos (e.g. the l10 slider), name lessons use the template.

## Tests (phone 393×851, touch, Chinese gloss ON) — `tools/curs_test.py <lesson> OUTDIR`
Skeleton batch (qa/curs1c): l01 36/36 · l02 124/124 · l04 116/116 · l05 33/33. Regression of the earlier lessons on the changed player: l03 85/85 · l10 39/39.
Checked: every name has model parts; predictions not marked wrong; teaching steppers child-paced; recall hidden before speaking, back locked; choice items show no answer before choosing, first error gives a specific cue, help is recorded "amb ajuda"; «Continua» only after the last item of a series; name lessons as in l03; day 2 one item at a time, stored apart; no JS errors.
Not re-run: V1.4 30-step suite and the 1A sample (app.js, sample.html/js unchanged in this batch).

## Still to calibrate with Emily (not validated)
Group size (3), text length, location hints. **[Superseded 2026-11-13 — see «Current rules»]** number of day-2 items (now ≤ 8 by default) and child self-check vs family check (now: child self-check).

## Skeleton batch — known limits
- **[Superseded 2026-11-13 — see «Current rules»]** l02: «maxil·lar» = the mandible (lower jaw), following the label line of the p. 25 photo. If the line points at the upper jaw, change one regex in `l02.js`.
- l04 activity 2: the answers come from the label colours of the p. 25 drawing (marked «resposta (no és text literal)»). Omòplat and pelvis count as tronc, as the drawing colours them.
- l05: the model has no ligaments (the child is told so and sent to the p. 24 drawing). The knee and elbow are shown by highlighting the bones around them.
- l04 hand↔foot comparison is a memory aid, tagged «no s’avalua».

## Muscle batch — tests (qa/curs1d, phone 393×851, touch, Chinese gloss ON)
New: l06 40/40 · l07 48/48 · l08 118/118 (lesson) + 27/27 (day 2, separate run: the first run hit the time limit at day-2 item 11 with no failure) · l09 97/97.
Regression after the player changes: l01 38/38 · l02 99/99 (new run; maxil·lar not in any location item, results show «Pendent de verificar»; its day 2 — 20 items — passed in the first run, whose only 2 failures were the old test expectation that maxil·lar is located) · l03 85/85 · l04 116/116 · l05 35/35 · l10 39/39.
Not re-run: V1.4 30-step suite and the 1A sample (app.js, sample.* untouched).

## Muscle batch — textbook coverage (p. 26–27, checked against the page photos)
| Book content | Where |
|---|---|
| p. 26 «El sistema muscular inclou…», 3 functions + mímica, músculs elàstics, figure «múscul relaxat / contret», músculs esquelètics, tendons | l06 (word for word) |
| p. 26 CientíficaMENT «Pensa» (goma / molla) | l06 — discussed, not scored (the book gives no answer) |
| p. 26 four types: llargs, curts, anulars, plans (+ drawing) | l07 (word for word; llarg example = arm, from the drawing, tagged `dib`) |
| p. 27 «La musculatura… més de 600… tres zones» | l06, l08 |
| p. 27 Cap / Tronc boxes | l08 |
| p. 27 Extremitats box | l09 |
| p. 27 15 muscle labels | l08 (9: orbicular de les parpelles, masseter, esternoclidomastoidal, deltoide, trapezi, dorsal, pectoral, abdominal, gluti) · l09 (6: bíceps, tríceps, quàdriceps, bíceps femoral, tibial, bessó) |
| p. 27 activity 3 (characteristics that allow movement) | l09 — answer built from the p. 26 text, marked as such |
| p. 27 activity 4 (elbow, biceps/triceps thickness) | l10 (unchanged) |

## Muscle batch — known limits
- The full musculature in the model is static; only biceps/triceps bend with the elbow (l06 elastic demo shows the arm muscles only, and says so).
- **[Superseded 2026-11-13 — see «Current rules»]** «abdominal» accepts the rectus abdominis and the external oblique; «quàdriceps» = rectus femoris + vasti; «bessó» = gastrocnemius (both heads).
- The book drawing colours deltoide, trapezi, esternoclidomastoidal and gluti as tronc: said once in l08, never asked as a zone question.
- Small structures (orbicular, hand muscles) are hard to tap on a phone; the player accepts a tap inside their on-screen box.
- **[Superseded 2026-11-13 — see «Current rules»]** l02 maxil·lar: pending verification (label line ends on the lower jaw, the drawing does not separate the jaws, and «maxil·lar» alone usually means the upper jaw). Both jaws highlighted; never an independent location item; results show «Pendent de verificar».

## Nervous-system batch (l11, l12) — textbook coverage (p. 28–29, checked against the page photos)
| Book content | Where | Source type |
|---|---|---|
| p. 28 opening text (we perceive, react; falling-rock example) and «La funció de relació…» | l11 | textbook sentence |
| p. 28 scheme Òrgans dels sentits → Sistema nerviós → Aparell locomotor | l11 (order task) | textbook sentence + scheme |
| p. 28 «El sistema nerviós està format per…», Cervell / Nervis / Medul·la espinal paragraphs, labels of the drawing | l11 (names group + «Què fa cada part») | textbook sentence |
| p. 28 L’aparell locomotor (ossos + músculs; uns es contreuen, uns altres es relaxen) | l11 | textbook sentence |
| p. 29 activity 5 (order the 5 sentences) | l11 (A5) + day 2 | activity reference answer |
| p. 29 moviments voluntaris: definition + 3 steps of the drawings | l12 | textbook sentence; the traffic-light example = textbook drawing |
| p. 29 moviments reflexos: definition («en molts… no intervé el cervell, sinó la medul·la espinal») + 3 steps | l12 | textbook sentence; the hot-cup example = textbook drawing |
Not added: no claim that all involuntary movements are controlled by the spinal cord; the V1.4 extra step «then the brain notices the burn» is not used.

## Nervous-system batch — model notes and limits
- The signal paths reuse the V1.4 `paths()` and are labelled on every step as a teaching schematic, not the real course of a nerve.
- The model cannot walk: in the voluntary example the order to the muscles is shown by bending the arm (said on screen). The stimulus objects (traffic light, cup) are simple schematic shapes.
- In l11 the bones and muscles are hidden while the child taps the brain, spinal cord and nerves (bones would block the taps); they are shown semi-transparent while their protective role is explained.
- Nerves are thin: a tap within 14 px of a nerve counts **only** when the tap hits nothing else (tapping the brain is still «cervell»).
- Shared helpers for l11/l12 live in `curs/relacio.js` (signal demo + ordering task); older lessons do not load it.
- Player changes this batch: `noLoc` names no longer highlighted/labelled as an answer (book-based say/spell prompts); `tol` for thin targets; day-2 `custom` items; say-the-name wording for `partWord` other than os/múscul.

## Nervous-system batch — tests (qa/curs1e, phone 393×851, touch, Chinese gloss ON)
| Lesson | Result | How |
|---|---|---|
| l11 | 80/80 | one continuous full run (lesson + day 2), after two fixes found by earlier runs: signal crash (negative animation time) and nerve tap tolerance accepting a tap on the brain |
| l12 | 40/40 | one continuous full run (lesson + day 2); afterwards one Ossi sentence on card 2 of the reflex steps was reworded (text only, not re-run) |
| l02 (regression) | 120/121 continuous run; the 1 failure is the old test expectation «≥ 2 labels in guided practice» (now only crani has a label, because maxil·lar is no longer labelled) | after the run, two more l02 changes were checked with a targeted script, not a full re-run: a wrong tap on the jaw now says «un os de la boca» (it said «maxil·lar»), and the pending-verification banner wording |
Earlier results kept as they were: l08 lesson 118/118 + day 2 27/27 in two separate parts (the first run hit the time limit at day-2 item 11 with no failure). Not re-run this time: l01, l03–l10 (the player changes only act on `noLoc`, `tol`, day-2 `custom` items and partWord ≠ os/múscul, which those lessons do not use), the V1.4 30-step suite and the 1A sample.
Not verified: real phone, Catalan proofreading, Emily's trial.

## Proposal — l13–l19 (textbook pp. 30–37 + final review; not built yet) — phase 2, to be redesigned in a new window; not binding
| # | Lesson | Book |
|---|---|---|
| l13 | La salut de l’aparell locomotor (exercici, dieta, sol, postura) | p. 30 |
| l14 | Les lesions (fractura, esquinç, contractura) + postures correctes | p. 31 |
| l15 | Taller científic: observar i interpretar una radiografia | p. 32 |
| l16 | Taller tecnològic: taula d’estiraments | p. 33 |
| l17 | Racons: lectura (esport femení) + oratòria / escriptura | p. 34–35 |
| l18 | Comprova el que has après | p. 36–37 |
| l19 | Repàs final de la unitat (**[Superseded 2026-11-13 — see «Current rules»]** «items a parent marked mastered, skip» — parents no longer mark mastery) | pp. 22–37 |
