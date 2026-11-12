# COS-HUMA Medi U2 · V1.3 接管验收与修复报告（2026-11-11）

## 结论
- GPT V1.3 Complete 原版：**FAIL**。真实浏览器中模型加载后立即报错 "Falten ossos del colze Left"，手臂运动、自主/反射演示和诊断按钮全部不可用。
- **最终结论（2026-11-12）：V1.3-fix.4 = PASS**（仅限测试仓库范围；肘部人工目测通过、真机性能通过，详见文末）。
- Claude 修复版 V1.3-fix.1：**CONDITIONAL**。真实 3D 下左右肘、手部联动、神经集成、教学演示和手机交互全部通过可复现测试。
  条件：①真实 Android 手机帧率尚未实测；②肘部动作需要你或老师目视签字；③二头肌、三头肌变形是标注过的教学示意。

## 1 文件与环境核查
| 项目 | 结果 |
|---|---|
| V1.3 包 | 已获得并解压：index.html、check.mjs、README、ACCEPTANCE.json、ATTRIBUTION、两个模型、浏览器 QA 记录 |
| 包的 sha256 | a173f704…7545（上传通道提示该路径已存在旧文件，未逐字节比对是否为你本次上传的版本） |
| 模型 | ecorche.glb 与 nervous.glb 和我 11-10 的文件字节级一致：cc43a8b4…b98e / aef617f7…9441 |
| 肘关节控制代码 | 有（makePivot/setAngle），但因命名错误无法运行 |
| 前臂与手部联动 | 有名单逻辑，同样因命名错误不生效 |
| 自主 / 反射演示 | 有，路径是写死的坐标点，与神经网格无关 |
| 现有 COS-HUMA 仓库 | 4 个仓库提交号未变：cos-huma 2f66191、cos-huma-test f0a2cc4、cos-huma-ecorche 1ca4bc5、cos-huma-ecorche-mobile-test 0e6be5c |
| 神经测试成果 | 原测试页未改动；本次复用同一模型与同一配准参数 |

## 2 V1.3 原版缺陷（真实浏览器）
1. three.js 加载模型时会把名字里的空格换成下划线（Left humerus → Left_humerus），V1.3 按空格名查找，所以找不到骨头 → 整页功能停止。
2. "骨骼透明度"作用于整个 Écorché，所有肌肉层都半透明显示。
3. X 轴旋转方向按左右翻转：右肘会反向过伸。
4. 关节中心取包围盒平均值，没有穿模检查（我的测试：不校准时 90° 穿入 3.4–4.0 mm，120° 达 5.6–6.0 mm）。
5. 神经不跟随前臂。
6. 自主运动从大脑开始，缺少教材 P29 第 1 步（感官捕获刺激）；信号路径与神经网格无关。
7. three.js 从 CDN 加载。

## 3 肘关节真实 3D 验收（左右各 4 个角度 × 正面 / 侧面 / 3/4 视角，共 24 张截图）
角度为真实肘角（上臂轴与前臂轴夹角）；模型休息姿势为 13°，即"自然伸直"。

| 侧 | 角度 | 实测角 | 最小间隙 mm | 穿入采样点 | 穿模深度 mm | 肱骨漂移 |
|---|---|---|---|---|---|---|
| 左 | 休息 | 13.1 | 1.02 | 0/127 | 0 | 0 |
| 左 | 45 | 45.1 | 1.76 | 0/128 | 0 | 0 |
| 左 | 90 | 90.1 | 1.84 | 0/129 | 0 | 0 |
| 左 | 120 | 119.6 | 0.98 | 0/130 | 0 | 0 |
| 右 | 休息 | 13.0 | 1.02 | 0/129 | 0 | 0 |
| 右 | 45 | 45.0 | 1.93 | 0/129 | 0 | 0 |
| 右 | 90 | 89.9 | 2.35 | 0/130 | 0 | 0 |
| 右 | 120 | 119.4 | 1.93 | 0/132 | 0 | 0 |

- 肱骨稳定：两侧中心全程不动。
- 旋转中心：肱骨远端内外上髁连线作轴，关节面质心上移 4 mm（网格搜索得出，左右对称）。
- 腕骨、掌骨、指骨：每侧 28 块与桡骨、尺骨作为一个刚体同步运动。
- 无脱节、无穿模；间隙保持在 1–2.4 mm（休息时为 1.0 mm）。
- 左右对称，方向正确：侧面看 45° 前臂向前下，90° 水平向前。
- 复位：所有顶点回到原位，误差 0 mm。

## 4 神经系统集成（Cervell / Medul·la espinal / Nervis）
- 复用 11-10 的局部配准神经模型。为手机重新简化，三角面从 44 万降到 25 万；配准不变（脊髓逐节误差中位 0.5 mm、最大 1.9 mm；大脑在颅骨内）。
- 正中、尺、桡、肌皮神经在肘部 5 cm 范围内平滑弯曲，跟随前臂。
- 自主运动（P29 原文三步）：眼 → 视神经 → 大脑（识别、决定）→ 脊髓 → 臂丛 → 肌皮神经 → 二头肌收缩 → 肘到 90°。
- 反射运动（P29 原文三步）：手碰热杯 → 正中神经 → 脊髓（就地折返）→ 肌皮神经 → 二头肌 → 肘快速到 80°。第 4 步"之后信息也到达大脑，我们感到烫"标为"教材以外的补充说明"。
- 信号路径沿真实神经网格中心线生成：90% 的点距离神经网格 ≤ 4.9–7.6 mm。指尖到手掌一段没有指神经网格（最大 124 mm）。页面标明"示意，不是精确的神经走行"。

## 5 肌肉
- 只显示教材 P27 的二头肌和三头肌，默认关闭。
- 弯曲时远端跟随前臂，二头肌加粗、颜色加深（收缩），三头肌变浅（放松），配 P27 原句。
- 这是示意：肌腹没有真实缩短。页面上已标注。

## 6 手机兼容性（无头 Chrome，触控模拟；393×851 @2.75x、800×1280 @2x、1280×860）
| 项目 | Android | 平板 | 桌面 |
|---|---|---|---|
| 加载 | 0.8 s（本机服务器） | 1.7 s | 3.1 s |
| 单指旋转 | 相机移动 2.66 m | 1.31 m | — |
| 双指缩放 | 距离 4.60 → 1.15 | 3.40 → 0.85 | — |
| 点击命中 | 正中神经 · 左 ✔ | ✔ | — |
| 图层 / 90° / 复位 / 反射按钮 | 全部 ✔ | ✔ | ✔ |
| 界面元素互相遮挡 | 无 | 无 | 无 |

性能（可复现数据）：
- 绘制调用 719–757 → 35（静态网格按图层合并，前臂合为一个刚体块）。
- 可见三角面 69 万 → 50 万。
- 软件渲染（CPU）帧率约 1 fps，不代表手机。
- 真实手机帧率：未测。页面内"Mesura 10 s"按钮可在手机上测出帧率、P95 帧时、GPU 型号并复制结果。

## 7 剩余问题
1. 真实 Android 帧率（必须在你的手机上测，目标 ≥ 30 fps）。
2. 肘部动作的人工目视签字（看 qa/elbow/contact-*.png）。
3. 二头肌、三头肌是示意形变，不是真实缩短。
4. 指神经未纳入，反射路径从指尖到手掌是直线。
5. 大脑皮层逐网格来源核对（Brainder）。
6. 稳定的 GitHub Pages 链接需要一个新的测试仓库，本会话无法创建仓库。
7. P27/P29 原文由照片转录，需要对照纸质书最终核对。

## Real-device performance (2026-11-12)
| Device | Version | fps avg | P95 ms | Verdict |
|---|---|---|---|---|
| Android, Adreno 830 (flagship) | fix.3 | 69.9 | 16.7 | PASS (≥30) |
| Android, Adreno 830 (flagship) | fix.1 | 84.8 | 16.6 | PASS |
| Desktop RTX 4080 | fix.3 | 59.7 (vsync) | 16.8 | PASS |
| Desktop, software renderer | fix.1 | 25.7 | 50.1 | excluded (no GPU acceleration) |

Raw data: qa/perf/real_devices_2026-11-12.json. Mid-range Android not yet measured (recommended, not blocking).
Elbow visual sign-off: **OK** by Simon Peng on Android (Left/Right, 45°/90°/140°), 2026-11-12. Hand-to-thorax clearance at 140°: Left 72.8 mm, Right 74.5 mm (no collision).

## Final verdict (2026-11-12): **PASS** — V1.3-fix.4, test repository scope
All acceptance conditions are met: elbow kinematics (automated + human sign-off), nerve layer integration, textbook P28–29 demos, mobile interaction, real-device performance.
PASS applies to this test build only; it is not a merge into the official COS-HUMA site.
Known limitations (documented, not blocking): biceps/triceps are a labelled schematic; elbow-region nerve/muscle bending is an approximation; digital nerves (fingertip→palm) missing, shown as a straight schematic line; Brainder cortex provenance per mesh to confirm; textbook wording to be checked against the printed book; mid-range Android not yet measured.
fix.4 (UX only): on phones (≤640 px) the panel auto-collapses after angle, view, reset and demo buttons so the model is visible.
