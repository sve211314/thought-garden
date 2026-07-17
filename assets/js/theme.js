(() => {
  const root = document.documentElement;
  try {
    root.dataset.theme = localStorage.getItem('thought-garden-theme')
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (_) {
    root.dataset.theme = 'light';
  }

  const bindToggle = () => {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;

    const updateLabel = () => {
      const dark = root.dataset.theme === 'dark';
      button.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
      button.title = dark ? '切换浅色模式' : '切换深色模式';
    };

    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('thought-garden-theme', next); } catch (_) { /* storage may be unavailable */ }
      updateLabel();
    });
    updateLabel();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindToggle, { once: true });
  else bindToggle();
})();
