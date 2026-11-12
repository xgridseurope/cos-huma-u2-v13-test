# Sample lesson 1A · Bíceps i tríceps (textbook pp. 27–28)

Page: `sample.html` (+ `sample.js`). V1.4 is unchanged at `index.html` (git tag `v1.4`).
`app.js` gained one optional function (`setMuscleColors`), used only by the sample; V1.4 behaviour is unchanged when it is not called.

## Flow (child controls the pace, no countdown)
Intro → A: question (prediction, not scored) → book (p. 27) → demo (bend) → child bends with the slider →
B: question → book (p. 27–28) → demo (straighten) → child straightens →
recall ×2 (book, labels, colours hidden; parent checks) → practice ×4 (help ladder) → locate bíceps / tríceps without names →
spell both on paper (parent compares) → results (understanding / location / spelling recorded separately) → day-2 checklist.

## Must-learn coverage
| Unit | Taught | Independent check |
|---|---|---|
| K1 bending: biceps contracts, triceps relaxes | A book + demo + slider | Recall R1 (parent) |
| K2 straightening: triceps contracts, biceps relaxes | B book + demo + slider | R2 (parent), P1 choice, P4 hidden slider |
| K3 the elbow is the joint that bends | A book + label | P2 choice |
| K4 contracted muscle is thicker | A demo + book | R1 (parent), P3 choice |
| K5 the two muscles work together | B book (p. 28) + Ossi line | R2 (parent), P1 choice |
| Names bíceps, tríceps | labels in A/B | P5/P6 tap without names; W1/W2 spelling |
Not scored: predictions, the "Curiositat" (muscles pull, never push).

## Automated test (phone 393×851, touch) — 35/35 checks pass, 0 JS errors
Covers: answers hidden at prediction/recall/practice; book shown only after the recall answer; slider text + colour follow the
direction (straightening from a bent arm → triceps contracts); after 1 s still → past tense + neutral colour; wrong answer →
specific cue first, demo second, then retry alone; hidden slider task; tapping both muscles; spelling "accent only" recorded as
spelling-to-practise without failing understanding; day-2 checks stored separately from day 1. Log: `test-run.log`.

## Day 1 (≈15 min) — for the parent
- Let Emily use it alone; do not prompt. Only press the "family" buttons when asked (recall and spelling).
- Note: minutes, where she got stuck, wrong answers. At the end tap "Copia el resultat" and send it.

## Day 2 (≈5 min) — in this order (also inside the page: "Revisió de l'endemà")
1. Without the model: explain bending and straightening, show it with her own arm.
2. Say which joint bends and how the contracted muscle looks.
3. In the model without names: tap bíceps and tríceps.
4. Book p. 27: cover the text, say which muscle contracts in each drawing.
5. On paper: bíceps, tríceps (with accent).
