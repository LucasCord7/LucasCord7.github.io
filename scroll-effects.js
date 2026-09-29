(() => {
  // Content stays visible without JavaScript or browser animation support.
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const activeAnimations = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reducedMotion.matches || entry.target.contains(document.activeElement)) continue;

      const animation = entry.target.animate(
        [
          { opacity: 0.78, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
      activeAnimations.add(animation);
      const cleanup = () => activeAnimations.delete(animation);
      animation.onfinish = cleanup;
      animation.oncancel = cleanup;
    }
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

  const targets = document.querySelectorAll(
    '.section-heading, .featured-grid > article, .project-list > article, ' +
    '.expertise-grid > article, .about > div, .contact > h2, .contact > .actions',
  );

  const prepareReveal = () => {
    observer.disconnect();
    for (const animation of activeAnimations) animation.cancel();
    if (reducedMotion.matches) return;
    for (const target of targets) {
      // Keep the current screen readable; animate the next descent.
      if (target.getBoundingClientRect().top >= window.innerHeight) observer.observe(target);
    }
  };

  prepareReveal();
  let wasAtTop = window.scrollY <= 8;
  window.addEventListener('scroll', () => {
    const isAtTop = window.scrollY <= 8;
    if (isAtTop && !wasAtTop) prepareReveal();
    wasAtTop = isAtTop;
  }, { passive: true });

  reducedMotion.addEventListener('change', (event) => {
    if (!event.matches) {
      prepareReveal();
      return;
    }
    observer.disconnect();
    for (const animation of activeAnimations) animation.cancel();
  });

  document.addEventListener('focusin', (event) => {
    for (const animation of activeAnimations) {
      if (animation.effect.target.contains(event.target)) animation.cancel();
    }
  });
})();
