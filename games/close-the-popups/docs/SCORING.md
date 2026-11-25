# Station 2 scoring / 第 2 站计分

**Task 40 + speed 40 + safe interaction 20 = 100.** The host submits the total shown on the results screen with `maxScore: 100`. Staff Practice and cancelled rounds stay off the event leaderboard.

**任务 40 分＋速度 40 分＋安全操作 20 分，满分 100。** 活动成绩以结算页显示的总分为准。工作人员练习和作废轮次不计入排行榜。

Let `p` be the fraction of automatic scoring checks passed. Only `met === true` counts. The search task gives credit for avoiding sponsored results once the player has also completed a positive task action.

```text
task = max(10, round(40 × p)) if scoring checks exist, otherwise 0
t = elapsed milliseconds, capped at 60000
curve = 1 through 30000 ms, then 1 − log₂(t / 30000)
speed = 30 + round(10 × p × curve) with valid timing, otherwise 0
safeInteraction = clamp(10 + 2 × realCloses − fakeCloseClicks, 0, 20) with an ad log, otherwise 0
total = task + speed + safeInteraction
```

Each real close counts, including one made after the game reveals the close button. A fake-close click costs one point. Other ad clicks, close-button moves and reveals are recorded for review. With a recorded checklist, valid timing and an ad log, an untouched round earns 50 from the three starting scores.

有自动计分项时，任务分最低 10 分。速度有 30 分基础分，另按完成比例和用时最多再奖 10 分。安全操作有广告记录时从 10 分起算，每正确关闭一次加 2 分（包括辅助关闭按钮），每误点一次假关闭扣 1 分。其他广告点击和闪避记录供复盘参考。计分项、计时和广告记录齐全时，即使没动手，本轮也有 50 分基础分。

| Scenario | Task | Speed | Safe interaction | Total |
|---|---:|---:|---:|---:|
| No task checks passed and no ad interactions | 10 | 30 | 10 | 50 |
| Half the checks, submitted within 30 seconds, no ad interactions | 20 | 35 | 10 | 65 |
| All checks, submitted within 30 seconds, one real close | 40 | 40 | 12 | 92 |
| All checks, submitted within 30 seconds, five real closes | 40 | 40 | 20 | 100 |
| All checks at timeout, five real closes | 40 | 30 | 20 | 90 |

## Warm-up / 热身保底

After entering the task site, open **View task** and pick the label from the top bar. You can retry before the round ends. Completing the warm-up keeps the total at or above 20 on submission or timeout. If the regular total is already 20 or higher, that total stands.

进入任务网站后，点顶部栏的「查看任务」，在「热身 · 保底20分」里选出顶部栏显示的标签。倒计时结束前可以重试。完成后，提交或超时时，本轮总分至少是 20 分。原本已达 20 分的轮次按实际总分结算。

The 60-second clock starts when the scene is ready and keeps running through the task dialog, navigation, reloads and tab switches. Speed is based on when the player submits or times out. The shared leaderboard uses server round duration as its tie-break, from participant confirmation through the saved finish.

Each scored round draws one of the 12 active tasks. The assignment survives refresh and redraw. Staff can pick a task in Staff Practice. See the [decision record](../../../docs/adr/0003-station2-event-scoring.md) and run `node server/test/popup-score.js` to check the scoring boundaries.
