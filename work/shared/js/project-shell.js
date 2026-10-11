/* Static HTML works without JS; this adds mobile disclosure and chapter state. */
(function () {
  'use strict';
  var nav = document.querySelector('.project-nav');
  if (!nav) return;
  var toggle = nav.querySelector('.project-nav__toggle');
  var links = Array.from(nav.querySelectorAll('.project-nav__link'));
  var chapters = links.map(function (link) {
    return { link: link, section: document.getElementById(link.hash.slice(1)) };
  }).filter(function (chapter) { return chapter.section; });
  var desktop = matchMedia('(min-width: 1200px)');
  var frame = 0;
  document.body.classList.add('project-navigation-page');
  nav.classList.add('is-ready');
  if (toggle) toggle.hidden = false;
  function closeMenu(returnFocus) {
    nav.classList.remove('is-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    }
  }
  function update() {
    frame = 0;
    nav.classList.toggle('is-stuck', window.scrollY > 26);
    var height = nav.classList.contains('is-open') ? (parseFloat(document.body.style.getPropertyValue('--project-nav-height')) || 66) : nav.getBoundingClientRect().height;
    document.body.style.setProperty('--project-nav-height', height + 'px');
    var active = chapters[0];
    chapters.forEach(function (chapter) {
      if (chapter.section.getBoundingClientRect().top <= height + 24) active = chapter;
    });
    links.forEach(function (link) {
      if (active && active.link === link) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  if (toggle) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target)) closeMenu(false);
  });
  nav.addEventListener('focusout', function () {
    setTimeout(function () { if (!nav.contains(document.activeElement)) closeMenu(false); }, 0);
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  window.addEventListener('hashchange', schedule);
  desktop.addEventListener('change', function () { closeMenu(false); schedule(); });
  update();
})();
