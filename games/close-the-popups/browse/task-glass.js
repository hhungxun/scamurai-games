/* Progressive interaction polish; task state and native navigation stay with each site. */
(() => {
  'use strict';
  const root = document.getElementById('site-root');
  // Glass applies only once the Station 2 tab has been refreshed onto the nine-task release (see booth-tasks.js).
  let legacyHost = false;
  try { const host = window.parent !== window ? window.parent.CLOSE_POPUPS_HOST : null; legacyHost = Boolean(host) && host.taskPool !== 9; } catch {}
  if (!root || legacyHost) return;
  document.body.classList.add('task-glass');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const segments = '.swb-header nav, .swb-filter, .jg-nav, .jt-header nav, .tm-header nav, .fl-tabs';
  const popovers = '.swb-facets details[open], .jg-more-filters[open]';
  let frame = 0;
  const paint = () => {
    frame = 0;
    for (const group of root.querySelectorAll(segments)) {
      const active = group.querySelector(':scope > a.active, :scope > a[aria-current="page"]');
      let marker = group.querySelector(':scope > .glass-selection-indicator');
      if (!active) { marker?.remove(); continue; }
      if (!marker) {
        group.classList.add('glass-segments');
        marker = document.createElement('span');
        marker.className = 'glass-selection-indicator';
        marker.setAttribute('aria-hidden', 'true');
        group.append(marker);
      }
      marker.style.width = `${active.offsetWidth}px`;
      marker.style.height = `${active.offsetHeight}px`;
      marker.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node =>
      node.nodeType !== 1 || !node.classList.contains('glass-selection-indicator')))) schedule();
  }).observe(root, {childList: true, subtree: true});
  new ResizeObserver(schedule).observe(root);
  window.addEventListener('resize', schedule, {passive: true});
  window.addEventListener('pageshow', schedule);
  document.fonts?.ready.then(schedule);
  root.addEventListener('click', event => {
    const control = event.target.closest('button, .swb-button, .ot-button, .jg-primary, .jt-primary, .fl-download');
    if (!control || control.disabled || reduced.matches ||
      control.closest('[data-host-sponsored], [data-context-ad], .br-inline-ad, [data-br-ad]')) return;
    control.classList.remove('glass-pressed');
    // Restart feedback without changing the control's contents or click handling.
    void control.offsetWidth;
    control.classList.add('glass-pressed');
    control.addEventListener('animationend', () => control.classList.remove('glass-pressed'), {once: true});
  });
  document.addEventListener('pointerdown', event => {
    for (const panel of root.querySelectorAll(popovers)) {
      if (!panel.contains(event.target)) panel.open = false;
    }
  }, {passive: true});
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const panel = event.target.closest(popovers);
    if (panel) { panel.open = false; panel.querySelector('summary')?.focus(); }
  });
  schedule();
})();
