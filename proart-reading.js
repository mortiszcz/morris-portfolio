(() => {
  const section = document.querySelector('#pa-scene-research');
  const dialog = document.querySelector('#pa-reading-dialog');
  if (!section || !dialog) return;

  const source = section.querySelector('img[data-pa-pdf-asset]');
  const image = dialog.querySelector('.pa-reading-dialog__image');
  const viewport = dialog.querySelector('.pa-reading-dialog__viewport');
  const fit = dialog.querySelector('[data-pa-reading-fit]');
  const original = dialog.querySelector('[data-pa-reading-original]');
  const close = dialog.querySelector('[data-pa-reading-close]');
  let opener = null;

  function setSize(fullSize) {
    dialog.classList.toggle('is-original-size', fullSize);
    fit.setAttribute('aria-pressed', String(!fullSize));
    original.setAttribute('aria-pressed', String(fullSize));
    viewport.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  image.addEventListener('load', () => {
    dialog.style.setProperty('--pa-reading-width', `${image.naturalWidth}px`);
  });

  section.querySelectorAll('[data-pa-reading-open]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      image.src = source.currentSrc || source.src;
      dialog.style.setProperty('--pa-reading-width', `${source.naturalWidth || 1234}px`);
      setSize(window.matchMedia('(max-width: 700px)').matches);
      dialog.showModal();
      document.documentElement.classList.add('pa-reading-open');
    });
  });

  fit.addEventListener('click', () => setSize(false));
  original.addEventListener('click', () => setSize(true));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('pa-reading-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
})();
