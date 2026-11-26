/* Station rule: the Escape key never closes popups, ads or dialogs.
   Loaded first (synchronously, in <head>) so this window capture listener runs before
   every other keydown handler. Cancelling keydown also stops native <dialog>/popover
   light-dismiss, which only fires for an uncancelled Escape. */
(()=>{
  const isEsc=e=>e.key==='Escape'||e.key==='Esc'||e.keyCode===27;
  const block=e=>{if(isEsc(e)){e.preventDefault();e.stopImmediatePropagation();}};
  for(const type of ['keydown','keyup','keypress'])window.addEventListener(type,block,true);
  // Belt and braces for native dialogs: refuse the cancel that Escape would trigger.
  window.addEventListener('cancel',e=>{if(e.target instanceof HTMLDialogElement)e.preventDefault();},true);
})();
