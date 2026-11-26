/* Pure scoring for a finished booth round. No storage, no DOM, no globals read. */
(() => {
  'use strict';
  const CONFIG = Object.freeze({
    TASK_MAX: 40, TASK_BASE: 10, TIME_MAX: 40, TIME_BASE: 30,
    ROUND_MS: 90000, TIME_FULL_MS: 30000, SPEED_ZERO_MS: 60000,
    RESILIENCE_MAX: 20, RESILIENCE_BASE: 10,
    CLEAN_CLOSE: 2, DECOY: -1, GUARANTEED_FLOOR: 20
  });
  const count = v => Number.isInteger(v) && v > 0 ? Math.min(10000, v) : 0;
  const taskScore = assessment => {
    const checks = Array.isArray(assessment?.checks) ? assessment.checks : [];
    const total = checks.length, met = checks.filter(c => c?.met === true).length;
    return {score: total ? Math.max(CONFIG.TASK_BASE, Math.round(CONFIG.TASK_MAX * met / total)) : 0, met, total};
  };
  const timeScore = (assessment, round) => {
    if (round?.status !== 'ended' || !Number.isFinite(round.startedAt) || round.startedAt <= 0
      || !Number.isFinite(round.endedAt) || round.endedAt < round.startedAt) return null;
    const elapsedMs = Math.min(CONFIG.ROUND_MS, round.endedAt - round.startedAt);
    const task = taskScore(assessment), completion = task.total ? task.met / task.total : 0;
    // Full speed credit through 30s, then a normalized logarithmic decline to
    // the base score at 60s (unchanged when rounds grew to 90 s, so scores stay comparable).
    // Only the bonus is weighted by task progress.
    const speedMs = Math.min(CONFIG.SPEED_ZERO_MS, elapsedMs);
    const curve = speedMs <= CONFIG.TIME_FULL_MS ? 1
      : 1 - Math.log(speedMs / CONFIG.TIME_FULL_MS) / Math.log(CONFIG.SPEED_ZERO_MS / CONFIG.TIME_FULL_MS);
    const bonus = Math.round((CONFIG.TIME_MAX - CONFIG.TIME_BASE) * completion * curve);
    return {score: CONFIG.TIME_BASE + bonus, base: CONFIG.TIME_BASE, bonus, elapsedMs, completion};
  };
  const resilienceScore = reviewData => {
    const c = reviewData?.counts;
    if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
    const closed = count(c.closed), revealed = count(c.revealed), decoys = count(c.decoys), dodges = count(c.dodges);
    // Every genuine close earns credit, including after the designed close assist.
    // Motion and reveal counters remain observations and do not affect scoring.
    const cleanCloses = closed;
    const unsafeClicks = count(c.opened) + count(c.blocked) + count(c.native);
    const raw = CONFIG.RESILIENCE_BASE + CONFIG.CLEAN_CLOSE * cleanCloses
      + CONFIG.DECOY * decoys;
    return {score: Math.max(0, Math.min(CONFIG.RESILIENCE_MAX, raw)),
      cleanCloses, closed, decoys, dodges, revealed, unsafeClicks, shown: count(c.shown), opened: count(c.opened)};
  };
  const compute = (assessment, reviewData, round) => {
    const task = taskScore(assessment), time = timeScore(assessment, round), resilience = resilienceScore(reviewData);
    const raw = task.score + (time ? time.score : 0) + (resilience ? resilience.score : 0);
    // Guaranteed warm-up: a finished round never scores below the floor once the warm-up was completed.
    const done = round?.guaranteed === true && round?.status === 'ended';
    const total = done ? Math.max(raw, CONFIG.GUARANTEED_FLOOR) : raw;
    return {task, time, resilience, guaranteed: {done, floor: CONFIG.GUARANTEED_FLOOR, applied: done && total > raw}, total};
  };
  window.BROWSE_BOOTH_SCORE = Object.freeze({CONFIG, taskScore, timeScore, resilienceScore, compute});
})();
