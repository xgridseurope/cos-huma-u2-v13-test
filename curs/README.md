# Lesson player (1B + skeleton batch) — `curs.html?l=<lesson>`

Each small lesson is one config file in this folder; `player.js` runs it. Lessons so far:
`l10` Bíceps i tríceps (principle lesson, ported from the 1A sample) · `l03` Els ossos del braç i de la mà (name lesson).
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
| Day 2 | one item at a time from the lesson's `day2()` list (spoken part with the model hidden, locate, book page, spelling) |

## Per lesson (config) — still hand work
Textbook sentences with source type (`lit` word for word / `act` answer to a book activity) · units · names (regex on the model, Catalan name, spelling with accent marked, location hint) · camera views · question texts and cues · day-2 list. Principle lessons keep their own demos (e.g. the l10 slider), name lessons use the template.

## Tests (phone 393×851, touch, Chinese gloss ON)
- `tools/curs_test.py l03` — 83/83: every name introduced, located in its group, said, located again in the mixed review, spelled; a deliberate wrong tap is recorded as "amb ajuda"; nothing reveals a name before the answer; day 2 (19 items) one at a time.
- `tools/curs_test.py l10` — 38/38: same lesson as the 1A sample on the shared player.
- Not re-run: V1.4 30-step suite (V1.4 files untouched; `app.js` unchanged since the 1A revision, whose V1.4 regression passed).

## Still to calibrate with Emily (not validated)
Group size (3), text length, location hints, number of day-2 items for name lessons (19 is long), whether "say the name" should be child self-check or family check.
