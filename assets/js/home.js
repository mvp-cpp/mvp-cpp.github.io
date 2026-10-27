(() => {
  const systemAppearance = window.matchMedia('(prefers-color-scheme: dark)');
  const applyAppearance = () => {
    document.documentElement.dataset.theme = systemAppearance.matches ? 'dark' : 'light';
  };

  applyAppearance();
  systemAppearance.addEventListener('change', applyAppearance);
})();
