(() => {
  'use strict';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  let startAtTop = !location.hash || location.hash === '#top';
  let interacted = false;
  const consumeHomeEntry = () => {
    try {
      if (sessionStorage.getItem('morris-duo-entry') !== 'top') return false;
      sessionStorage.removeItem('morris-duo-entry');
      if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
      return true;
    } catch (_) { return false; }
  };
  if (consumeHomeEntry()) startAtTop = true;
  const reset = () => {
    if (startAtTop && !interacted) scrollTo({ left:0, top:0, behavior:'instant' });
  };
  const stopReset = () => { interacted = true; };
  for (const type of ['wheel','touchstart','pointerdown','keydown']) addEventListener(type, stopReset, { passive:true, once:true });
  reset();
  addEventListener('DOMContentLoaded', reset, { once:true });
  addEventListener('load', () => { reset(); requestAnimationFrame(reset); }, { once:true });
  addEventListener('pageshow', () => {
    if (consumeHomeEntry()) { startAtTop = true; interacted = false; }
    reset();
  });
})();
