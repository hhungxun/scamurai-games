# Station 2 scoring and task assignment

Status: Accepted, 15 November 2026.

## Context

The incoming popup game awarded 40/100 for no progress and up to 50 for closing ads without completing its task. Station 5 gives zero for no answers. Participants could select easier tasks from an explicitly unequal pool, and advertiser clicks did not reduce the score. Scores affect the shared prize leaderboard; changing their interpretation after play would be costly because the backend retains submitted totals rather than the complete task evidence.

## Decision

The user confirmed task evidence up to 60, completion-weighted speed up to 20, and completion-weighted safe interaction up to 20 minus five per misleading-ad click. Each click is counted once, including blocked tabs. Closing ads cannot erase deductions. No completed evidence means zero. Full safe completion through 30 seconds earns 100; at timeout it earns 80. The result screen and submitted score use the same calculator.

Assign each scored Round one persistent random task from all 13. Free choice remains in unscored Staff Practice. Include the recorded sponsored-search avoidance condition in task scoring. Retain the existing server duration tie-break without introducing a second duration contract.

## Consequences

This removes participation floors and ad-closing farming while preserving partial credit, safe-action credit and a modest speed bonus. It avoids new shared score API or timing semantics. Random assignment prevents choosing an easier task for points but introduces task-difficulty variance; equal score distributions across tasks or Stations are not established. Station 2 can earn 80 at timeout versus Station 5's approximately 60 for all slow correct answers. The confirmed 60/20/20 weights prioritize task completion and safe interaction over speed.

Alternatives considered were the PR's original 40/40/20 formula, retaining free task choice, and a 60/40 formula without a separate safety component. The user selected 60/20/20 and random assignment after reviewing the no-progress scoring mismatch and concrete examples.

Validation uses pure scoring checks plus local browser tests with throwaway participants and SQLite databases. Physical station hardware and real participant playtesting remain event preparation tasks.
