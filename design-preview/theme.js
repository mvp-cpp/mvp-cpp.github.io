(() => {
  const root = document.documentElement;
  const systemAppearance = window.matchMedia('(prefers-color-scheme: dark)');
  const supported = new Set(['auto', 'light', 'dark']);
  const requested = new URLSearchParams(window.location.search).get('theme');
  let mode = supported.has(requested) ? requested : 'auto';

  function render() {
    root.dataset.theme = mode;
    const effective = mode === 'auto' ? (systemAppearance.matches ? 'dark' : 'light') : mode;
    const status = document.getElementById('theme-status');
    if (status) status.textContent = `${mode === 'auto' ? '跟随系统 · ' : ''}${effective === 'dark' ? '夜间模式' : '日间模式'}`;
    document.querySelectorAll('[data-theme-mode]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeMode === mode));
    });
  }

  render();
  document.addEventListener('DOMContentLoaded', () => {
    render();
    document.querySelectorAll('[data-theme-mode]').forEach(button => {
      button.addEventListener('click', () => {
        mode = button.dataset.themeMode;
        render();
        const url = new URL(window.location.href);
        if (mode === 'auto') url.searchParams.delete('theme');
        else url.searchParams.set('theme', mode);
        window.history.replaceState(null, '', url);
      });
    });
  });
  systemAppearance.addEventListener('change', () => {
    if (mode === 'auto') render();
  });
})();
