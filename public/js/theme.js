/* MunchiesSNHU — public page theme toggle */
(function () {
  'use strict';

  const KEY = 'munchies-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('.theme-toggle i').forEach(i => {
      i.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    document.querySelectorAll('.theme-toggle').forEach(b => {
      b.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      b.setAttribute('aria-label', b.title);
    });
  }

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark');
  };

  // Sync icon state on load (theme already set by inline <head> script)
  document.addEventListener('DOMContentLoaded', () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    apply(theme);
    // Enable transitions only after first paint — prevents background flash on load
    setTimeout(() => document.body.classList.add('theme-ready'), 80);
  });

  // Follow OS preference if user hasn't manually chosen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light');
  });
})();
