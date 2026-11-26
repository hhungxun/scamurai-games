/* In-round downloads land in the game's toolbar instead of the browser's file picker. */
(() => {
  'use strict';
  const icon = paths => '<svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  const arrow = icon('<path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4"/>');
  const file = icon('<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 13h6m-6 4h6"/>');
  let request;

  function mount(actions, {t,read,write}) {
    const storageKey = 'booth-downloads';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'br-download-toggle';
    button.title = t('Simulated downloads','模拟下载');
    button.setAttribute('aria-label',button.title);
    button.setAttribute('aria-controls','br-download-panel');
    button.setAttribute('aria-expanded','false');
    button.innerHTML = arrow + '<span class="br-download-count" aria-hidden="true"></span>';
    actions.append(button);

    const panel = document.createElement('section');
    panel.id = 'br-download-panel';
    panel.className = 'br-download-panel';
    panel.setAttribute('popover','manual');
    panel.setAttribute('aria-label',button.title);
    panel.innerHTML = '<header><div><h2>' + button.title + '</h2><p>' +
      t('Files from this round','本轮下载的文件') + '</p></div><button type="button">×</button></header><ul></ul>';
    const closePanel = panel.querySelector('button');
    closePanel.setAttribute('aria-label',t('Close downloads','关闭下载列表'));
    const list = panel.querySelector('ul');
    document.body.append(panel);

    let revision = 0;
    function position() {
      const anchor = button.getBoundingClientRect();
      panel.style.top = Math.round(anchor.bottom + 12) + 'px';
      panel.style.right = Math.max(12,Math.round(window.innerWidth - anchor.right)) + 'px';
    }

    function drawList(recent) {
      list.replaceChildren();
      button.querySelector('.br-download-count').textContent = recent.length || '';
      if (!recent.length) {
        const row = document.createElement('li');
        row.className = 'br-download-empty';
        row.textContent = t('No files yet.','还没有下载记录。');
        list.append(row);
        return;
      }
      for (const entry of recent) {
        const row = document.createElement('li');
        row.innerHTML = '<span class="br-download-file">' + file + '</span><div><strong></strong><small></small></div><span class="br-download-done" aria-hidden="true">✓</span>';
        row.querySelector('strong').textContent = entry.name;
        row.querySelector('small').textContent = entry.details ? entry.details + ' · ' + t('Complete','已完成') : t('Complete','已完成');
        list.append(row);
      }
    }

    function showPanel() {
      position();
      if (!panel.matches(':popover-open')) panel.showPopover();
      button.setAttribute('aria-expanded','true');
    }

    function hidePanel() {
      if (panel.matches(':popover-open')) panel.hidePopover();
      button.setAttribute('aria-expanded','false');
    }
    button.addEventListener('click',() => {
      if (panel.matches(':popover-open')) hidePanel();
      else showPanel();
    });
    closePanel.addEventListener('click',() => { hidePanel(); button.focus(); });
    window.addEventListener('resize',position);
    document.addEventListener('pointerdown',event => {
      if (!button.contains(event.target) && !panel.contains(event.target)) hidePanel();
    });
    document.addEventListener('keydown',event => {
      if (event.key !== 'Escape' || !panel.matches(':popover-open')) return;
      hidePanel();
      button.focus();
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);
    window.addEventListener('browse:booth-dialog',event => { if (event.detail.open) hidePanel(); });
    const clearPresentation = () => {
      revision++;
      hidePanel();
    };
    window.addEventListener('browse:booth-end',clearPresentation);
    window.addEventListener('pagehide',clearPresentation);
    const savedFiles = () => {
      const stored = read(storageKey,[]);
      return Array.isArray(stored) ? stored : [];
    };
    window.addEventListener('pageshow',event => { if (event.persisted) drawList(savedFiles()); });

    function fly(start, label) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
      const end = button.getBoundingClientRect();
      const particle = document.createElement('div');
      particle.className = 'br-download-flight';
      particle.setAttribute('aria-hidden','true');
      particle.innerHTML = file + '<span></span>';
      particle.querySelector('span').textContent = label;
      const x = start.left + start.width / 2, y = start.top + start.height / 2;
      const dx = end.left + end.width / 2 - x, dy = end.top + end.height / 2 - y;
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      document.body.append(particle);
      const motion = particle.animate([
        {transform:'translate(-50%,-50%) scale(.84)', opacity:0, offset:0},
        {transform:'translate(-50%,-50%) scale(1)', opacity:1, offset:.15},
        {transform:'translate(calc(-50% + ' + (.54 * dx) + 'px),calc(-50% + ' + (.6 * dy - 36) + 'px)) scale(.83) rotate(-7deg)', opacity:1, offset:.52},
        {transform:'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(.28)', opacity:0, offset:1}
      ],{duration:610,easing:'cubic-bezier(.24,.59,.29,1)'});
      return motion.finished.catch(() => {}).finally(() => particle.remove());
    }

    drawList(savedFiles());
    list.setAttribute('aria-live','polite');
    request = (entry,source,record) => {
      if (window.BROWSE_BOOTH.canAct() === false || record() === false) return true;
      const recent = [entry,...savedFiles().filter(previous => previous.name !== entry.name)].slice(0,6);
      if (write(storageKey,recent) === false) return true;
      const ticket = ++revision;
      fly(source.getBoundingClientRect(),entry.label).then(() => {
        if (ticket !== revision) return;
        drawList(recent);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          button.animate([{transform:'scale(1)'},{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:260});
        }
        if (!document.querySelector('dialog[open]')) showPanel();
      });
      return true;
    };
  }

  window.BROWSE_BOOTH_DOWNLOADS = {mount, request: (...args) => request?.(...args) === true};
})();
