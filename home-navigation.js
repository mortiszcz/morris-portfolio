(() => {
  'use strict';
  const links = [...document.querySelectorAll('.portfolio-side-nav__link')];
  const sections = links.map(link => ({ link, target:document.getElementById(link.hash.slice(1)) })).filter(item => item.target);
  let scheduled = false;
  const update = () => {
    scheduled = false;
    let active = sections[0];
    for (const item of sections) if (item.target.getBoundingClientRect().top <= innerHeight * .3) active = item;
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) active = sections.at(-1);
    for (const item of sections) {
      if (item === active) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  update();

  document.getElementById('project-duo')?.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    try { sessionStorage.setItem('morris-duo-entry', 'top'); } catch (_) {}
  });
})();
