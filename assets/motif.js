(function () {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    document.documentElement.setAttribute(
      'data-bs-theme',
      mql.matches ? 'dark' : 'light',
    );
  };
  apply();
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', apply);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(apply);
  }
})();
