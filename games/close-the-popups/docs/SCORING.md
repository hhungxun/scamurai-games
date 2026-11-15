# Station 2 scoring / 第 2 站计分

Approved event calibration: **task 60 + speed 20 + safe interaction 20 = 100**. The displayed total is submitted unchanged with `maxScore: 100`. Staff Practice is unscored. A cancelled Round never counts.

活动计分：**任务 60＋速度 20＋安全操作 20＝100**。显示总分原样提交，工作人员练习与作废轮次不计入活动。

Let `p` be the fraction of automatically verifiable task checks completed. Only `met === true` counts. An empty or unavailable checklist gives `p = 0`. The search task also requires its recorded sponsored-result avoidance condition; submission alone proves nothing. Sponsored-result avoidance only counts as progress once at least one positive task action is recorded.

```text
task = round(60 × p)
t = clamp(elapsed milliseconds, 0, 60000)
curve = t <= 30000 ? 1 : 1 − log₂(t / 30000)
speed = round(20 × p × curve)
unsafeClicks = opened + blocked + native
safeInteraction = clamp(round(20 × p) − 5 × unsafeClicks, 0, 20)
total = task + speed + safeInteraction
```

Every misleading-ad click has one recorded outcome: opened, blocked or native. A false-close/decoy click is already included in those outcomes and is not charged twice. Genuine closes, evasion chases and assisted closes remain observations; closing extra popups cannot erase deductions. Missing ad records earn zero safety credit. Missing or invalid timing earns zero speed credit.

每次误点广告按 opened、blocked 或 native 中的一种结果计入，包括浏览器拦截的标签页。假关闭按钮已经包含在内，不重复扣分。真正关闭、闪避和辅助关闭仅作记录，不能抵消扣分。缺少广告记录不获安全分；无效计时不获速度分。

| Scenario | Task | Speed | Safe interaction | Total |
|---|---:|---:|---:|---:|
| No evidence, including timeout or many popup closes | 0 | 0 | 0 | 0 |
| All evidence, safe, ≤30 seconds | 60 | 20 | 20 | 100 |
| Half evidence, safe, ≤30 seconds | 30 | 10 | 10 | 50 |
| All evidence, safe, 60-second timeout | 60 | 0 | 20 | 80 |
| All evidence, ≤30 seconds, one misleading-ad click | 60 | 20 | 15 | 95 |
| All evidence, ≤30 seconds, four or more misleading-ad clicks | 60 | 20 | 0 | 80 |

The 60-second deadline starts when the scene is ready and continues through navigation, reloads, task reminders and other tabs. Speed measures submission or timeout, rather than an inferred first-completion timestamp. The shared leaderboard tie-break continues using server Round duration from participant confirmation to saved finish, including briefing and loading.

Each scored Round draws one of all 13 tasks. Its assignment persists through refresh and redraw; manual task selection is reserved for Staff Practice. Random assignment removes selection of easier tasks for points, but does not prove that the tasks have equal difficulty. Before the event, use observed completion rates to assess whether the pool needs adjustment; these weights are an approved game rule, not an empirically validated skill test.

The calibration shares the event’s 0–100 range and zero for no progress with Station 5. Its full-completion timeout value is 80; Station 5’s all-correct slow value approaches 60. The stations measure different actions and intentionally have different reward curves. There is no claim of matched score distributions without participant playtesting.

See `docs/adr/0003-station2-event-scoring.md` at the repository root for the decision and trade-off. Run `node server/test/popup-score.js` for calibration and boundary assertions.
