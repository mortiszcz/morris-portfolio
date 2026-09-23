(() => {
  const themeKey = 'morris-theme';
  const button = document.querySelector('[data-theme-toggle]');
  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    localStorage.setItem(themeKey, theme);
  };

  applyTheme(localStorage.getItem(themeKey) || 'dark');
  button.addEventListener('click', () => applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reducedMotion.matches) {
    items.forEach((item) => item.classList.add('is-visible'));
  } else {
    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((item) => observer.observe(item));
  }

  const productFlight = document.querySelector('[data-product-flight]');
  const groupElements = [...document.querySelectorAll('[data-flight-group]')];
  const replayButton = document.querySelector('[data-flight-replay]');

  if (!productFlight || groupElements.length === 0) return;

  let replayInProgress = false;
  const easeInOutSine = (progress) => -(Math.cos(Math.PI * progress) - 1) / 2;
  const easeOutCubic = (progress) => 1 - ((1 - progress) ** 3);

  const controllers = groupElements.map((group) => {
    const layers = [...group.querySelectorAll('[data-flight-item]')];
    const duration = Number(group.dataset.duration || 1800);
    const distance = Number(group.dataset.distance || .25);
    const startScale = Number(group.dataset.scale || 1);
    const easing = group.dataset.ease === 'out' ? easeOutCubic : easeInOutSine;
    let state = 'idle';
    let animationFrame = 0;
    let offsets = [];
    let currentProgress = 0;

    const measure = () => {
      offsets = layers.map((layer) => (
        group.clientWidth * distance * Number(layer.dataset.direction)
      ));
    };

    const render = (progress) => {
      currentProgress = progress;
      const eased = easing(progress);
      const scale = startScale + ((1 - startScale) * eased);
      layers.forEach((layer, index) => {
        const x = offsets[index] * (1 - eased);
        layer.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`;
        layer.style.opacity = .08 + (.92 * eased);
      });
    };

    const reset = () => {
      cancelAnimationFrame(animationFrame);
      measure();
      state = 'idle';
      render(reducedMotion.matches ? 1 : 0);
    };

    const play = () => {
      if (state === 'playing' || state === 'complete') return;
      if (reducedMotion.matches) {
        render(1);
        state = 'complete';
        return;
      }

      cancelAnimationFrame(animationFrame);
      measure();
      state = 'playing';
      const startedAt = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        render(progress);
        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
        } else {
          state = 'complete';
        }
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const checkPosition = () => {
      const rect = group.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      if (!replayInProgress && state === 'idle' && center <= window.innerHeight && rect.bottom > 0) play();
      if (state !== 'idle' && rect.top > window.innerHeight * 1.08) reset();
    };

    const resize = () => {
      measure();
      render(state === 'complete' ? 1 : currentProgress);
    };

    return { group, play, reset, resize, checkPosition };
  });

  let motionTicking = false;
  window.addEventListener('scroll', () => {
    if (motionTicking) return;
    motionTicking = true;
    requestAnimationFrame(() => {
      controllers.forEach((controller) => controller.checkPosition());
      motionTicking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', () => {
    controllers.forEach((controller) => controller.resize());
  });

  replayButton?.addEventListener('click', () => {
    replayInProgress = true;
    controllers.forEach((controller) => controller.reset());
    controllers[0].group.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => {
      replayInProgress = false;
      controllers[0].play();
    }, reducedMotion.matches ? 0 : 450);
  });

  const resetAllMotion = () => controllers.forEach((controller) => controller.reset());
  reducedMotion.addEventListener('change', resetAllMotion);
  resetAllMotion();
  controllers.forEach((controller) => controller.checkPosition());
})();
