(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const targets = Array.from(
    document.querySelectorAll(
      '.panel:not(.tutorial-sidebar):not(.tutorial-content), .note, .link-card, .feature-card, .person-card'
    )
  );

  if (!targets.length) return;

  targets.forEach((el, index) => {
    el.classList.add('float-in');
    el.style.setProperty('--float-delay', `${Math.min(index * 45, 360)}ms`);
    el.style.setProperty('--float-offset', `${(index % 4) * 0.35}s`);
  });

  if (reduceMotion) {
    targets.forEach(el => el.classList.add('float-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('float-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  targets.forEach((el) => observer.observe(el));
})();