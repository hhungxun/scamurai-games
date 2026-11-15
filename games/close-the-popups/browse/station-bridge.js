/* Only the entry/brief/result document needs SDK access. Scene pages keep their
 * native routes and clock; the parent remains alive across their navigation. */
(() => {
  'use strict';
  const host = () => {
    if (window.parent === window || window.parent.location.origin !== location.origin || !window.parent.CLOSE_POPUPS_HOST)
      throw new Error('Open close the popups from its Station 2 entry page. / 请从第2站游戏入口打开。');
    return window.parent.CLOSE_POPUPS_HOST;
  };
  window.CLOSE_POPUPS_BRIDGE = {
    beforeStart: (mode, taskId) => host().prepare(window, mode, taskId),
    draw: ids => host().draw(window, ids),
    bind: round => host().bind(window, round),
    abort: () => host().abort(window),
    result: (round, score) => { try { host().result(window, round, score); } catch (error) { console.error(error); } },
    next: () => host().canNext(window)
  };
})();
