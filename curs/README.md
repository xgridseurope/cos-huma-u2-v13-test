# Lesson player (1B + skeleton batch) — `curs.html?l=<lesson>`

Each small lesson is one config file in this folder; `player.js` runs it. Lessons so far:
`l10` Bíceps i tríceps (principle lesson, ported from the 1A sample) · `l03` Els ossos del braç i de la mà (name lesson).
Muscle batch: `l06` El sistema muscular (p. 26–27, principle) · `l07` La forma dels músculs (p. 26, 4 types) · `l08` Músculs del cap i del tronc (p. 27, 9 names in 4 groups) · `l09` Músculs de les extremitats (p. 27, 6 names in 3 pairs; bíceps/tríceps only name + place, the pair mechanism stays in l10).
Skeleton batch: `l01` El sistema esquelètic (p. 24–25, principle) · `l02` Ossos del cap i del tronc (p. 25, 8 names in 4 pairs) · `l04` Ossos de la cama i del peu (p. 25, 7 names in 3 groups + activity 2) · `l05` Les articulacions (p. 24, principle).
The 1A sample (`sample.html`) stays as it is for Emily's trial.

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
Group size (3), text length, location hints, number of day-2 items for name lessons (19 is long), whether "say the name" should be child self-check or family check.

## Skeleton batch — known limits
- l02: «maxil·lar» = the mandible (lower jaw), following the label line of the p. 25 photo. If the line points at the upper jaw, change one regex in `l02.js`.
- l04 activity 2: the answers come from the label colours of the p. 25 drawing (marked «resposta (no és text literal)»). Omòplat and pelvis count as tronc, as the drawing colours them.
- l05: the model has no ligaments (the child is told so and sent to the p. 24 drawing). The knee and elbow are shown by highlighting the bones around them.
- l04 hand↔foot comparison is a memory aid, tagged «no s’avalua».

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
- «abdominal» accepts the rectus abdominis and the external oblique; «quàdriceps» = rectus femoris + vasti; «bessó» = gastrocnemius (both heads).
- The book drawing colours deltoide, trapezi, esternoclidomastoidal and gluti as tronc: said once in l08, never asked as a zone question.
- Small structures (orbicular, hand muscles) are hard to tap on a phone; the player accepts a tap inside their on-screen box.
- l02 maxil·lar: pending verification (label line ends on the lower jaw, the drawing does not separate the jaws, and «maxil·lar» alone usually means the upper jaw). Both jaws highlighted; never an independent location item; results show «Pendent de verificar».
