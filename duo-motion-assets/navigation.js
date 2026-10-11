(() => {
  'use strict';
  const progress = document.getElementById('portfolioProgress');
  const links = [...document.querySelectorAll('.project-pill [data-target]')];
  const targets = links.map(link => document.querySelector(link.dataset.target)).filter(Boolean);
  let ticking = false;
  function update(){
    ticking = false;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.width = `${Math.min(100, Math.max(0, scrollY / scrollable * 100)).toFixed(2)}%`;
    const probe = scrollY + innerHeight * .38;
    let current = targets[0];
    targets.forEach(target => { if (target.offsetTop <= probe) current = target; });
    links.forEach(link => {
      const on = link.dataset.target === `#${current?.id}`;
      link.classList.toggle('on', on);
      if (on) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
  }
  function schedule(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  update();
})();
