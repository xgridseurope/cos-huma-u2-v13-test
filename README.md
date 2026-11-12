# COS-HUMA · Medi U2 «Ens movem» · V1.3-fix (test build)

Independent test page — not the official COS-HUMA site, not merged anywhere.

## Run locally
```
cd cos-huma-u2-v13-fix
python3 -m http.server 8000
# open http://localhost:8000/
```
No CDN and no build step: three.js r169 is in `vendor/`. Models load from `models/*.glb`;
if the host refuses .glb files (e.g. the claude.ai artifact host) the page falls back to `models/*.glb.js`.

## Publish on GitHub Pages (test repo)
Create an empty repository (e.g. `xgridseurope/cos-huma-u2-v13-test`), copy this folder to its root,
enable Pages from `main / root`. The `.glb.js` copies can be deleted there to halve the download.

## What is in it
| File | Purpose |
|---|---|
| index.html | UI (Catalan), layout for phone / tablet / desktop |
| app.js | scene, elbow kinematics, soft-tissue bend, neural demos, perf probe, test hook `window.__app` |
| config/elbow-calibration.json | per-side elbow centre offset (+4 mm up), found by penetration search |
| models/ecorche.glb | Écorché B model from cos-huma-ecorche main 1ca4bc5. **V1.4:** muscle meshes simplified to ~50 % triangles (meshoptimizer, `tools/simplify_muscles.mjs`, ratio 0.4, error 0.002) for phone performance; bones unchanged (max vertex deviation 0.03 mm, checked with `tools/cmp_bones.mjs`). Original kept in git history (commit before V1.4). |
| models/nervous-light.glb | the registered nerve layer of 2026-11-10, re-simplified to 249k triangles (same source, same registration) |
| ATTRIBUTION.txt | sources and licences |
| qa/ | screenshots, metrics JSON, logs (see QA_REPORT.md) |

## Elbow model in one paragraph
Axis = medial→lateral epicondyle of the distal humerus. Centre = centroid of the lowest 15 mm of the humerus,
+4 mm (calibrated). Sense = the one that moves the fingertip forward. The slider shows the real elbow angle
(humerus axis vs forearm axis); the model's rest pose is 13°. Radius, ulna, 7 carpals, 5 metacarpals and
14 phalanges per side move as one rigid block. Arm nerves and biceps/triceps bend in a 50 mm band around
the joint; the biceps thickening is a schematic teaching aid and is labelled as such.
