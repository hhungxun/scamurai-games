# Station 2 scoring and task assignment

Status: Accepted, 15 November 2026.

## Context

The incoming popup game awarded 40/100 for no progress and up to 50 for closing ads without completing its task. Station 5 gives zero for no answers. Participants could select easier tasks from an explicitly unequal pool, and advertiser clicks did not reduce the score. Scores affect the shared prize leaderboard; changing their interpretation after play would be costly because the backend retains submitted totals rather than the complete task evidence.

## Decision

The user confirmed task evidence up to 60, completion-weighted speed up to 20, and completion-weighted safe interaction up to 20 minus five per misleading-ad click. Each click is counted once, including blocked tabs. Closing ads cannot erase deductions. No completed evidence means zero, except the later amendment below. Full safe completion through 30 seconds earns 100; at timeout it earns 80. The result screen and submitted score use the same calculator.

Assign each scored Round one persistent random task from all 13. Free choice remains in unscored Staff Practice. Include the recorded sponsored-search avoidance condition in task scoring. Retain the existing server duration tie-break without introducing a second duration contract.

## Consequences

This removes participation floors and ad-closing farming while preserving partial credit, safe-action credit and a modest speed bonus. It avoids new shared score API or timing semantics. Random assignment prevents choosing an easier task for points but introduces task-difficulty variance; equal score distributions across tasks or Stations are not established. Station 2 can earn 80 at timeout versus Station 5's approximately 60 for all slow correct answers. The confirmed 60/20/20 weights prioritize task completion and safe interaction over speed.

Alternatives considered were the PR's original 40/40/20 formula, retaining free task choice, and a 60/40 formula without a separate safety component. The user selected 60/20/20 and random assignment after reviewing the no-progress scoring mismatch and concrete examples.

Validation uses pure scoring checks plus local browser tests with throwaway participants and SQLite databases. Physical station hardware and real participant playtesting remain event preparation tasks.

## Amendment 2026-11-19: guaranteed warm-up floor

User request: every participant must be able to reach at least 20/100 per Station 2 game. Each task dialog now carries an untimed, retryable warm-up (tap this task's own top-bar label among three options). Completing it sets `round.guaranteed`; when the Round has ended, `total = max(task + speed + safe, 20)`. The cap stays 100 and weights stay 60/20/20. No warm-up and no evidence still scores 0, and void Rounds never score. This reverses the "no participation floor" consequence above, but only for participants who complete the warm-up. Covered by `node server/test/popup-score.js`.

## Amendment 2026-11-19: restore 40/40/20

Station 2 returns to the original 40 task / 40 speed / 20 safe interaction formula. With automatic scoring checks, the task score starts at 10. Valid timing earns a 20-point base plus a speed bonus. With an ad log, safety starts at 10, adds two for every real close, and subtracts one for each fake-close click. An untouched round with complete scoring data can therefore earn 40. The warm-up still guarantees a total of at least 20, which a valid timed round already reaches through its speed points. Keep the current task assignment and checks, including sponsored-search avoidance, and the server tie-break. See the [current rules](../../games/close-the-popups/docs/SCORING.md).
