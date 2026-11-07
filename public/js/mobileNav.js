/**
 * mobileNav.js
 * On narrow screens the public pages hide `.topnav`, which left mobile visitors with no
 * navigation. This adds an accessible menu button to `.topbar` that shows the same links
 * as a drop-down panel. Desktop layout is unchanged.
 */
(function () {
  const topbar = document.querySelector('.topbar');
  const nav = topbar && topbar.querySelector('.topnav');
  if (!topbar || !nav) return;

  if (!nav.id) nav.id = 'site-navigation';

  const style = document.createElement('style');
  style.textContent = `
    .mnav-toggle { display: none; background: transparent; border: 1.5px solid rgba(255,255,255,0.35);
      color: #fff; border-radius: 10px; width: 44px; height: 44px; font-size: 1.15rem; cursor: pointer; }
    .mnav-toggle:focus-visible { outline: 3px solid #f3d014; outline-offset: 2px; }
    @media (max-width: 900px) {
      .mnav-toggle { display: inline-flex; align-items: center; justify-content: center; }
      .topbar .topnav.mnav-open { display: flex !important; flex-direction: column; align-items: stretch;
        position: absolute; top: 100%; left: 0; right: 0; padding: 0.75rem 1rem 1rem;
        background: rgba(8,34,65,0.98); box-shadow: 0 12px 24px rgba(8,34,65,0.35); gap: 0.25rem; }
      .topbar .topnav.mnav-open a { padding: 0.75rem 1rem; font-size: 1rem; }
      .topbar .topnav.mnav-open li { list-style: none; }
    }`;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mnav-toggle';
  btn.setAttribute('aria-controls', nav.id);
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Open menu');
  btn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i><span style="position:absolute;left:-9999px">Menu</span>';
  topbar.appendChild(btn);

  function setOpen(open) {
    nav.classList.toggle('mnav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
  }

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('mnav-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
})();
