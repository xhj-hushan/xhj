const menu = document.querySelector('#menu');
const nav = document.querySelector('#nav');
menu?.addEventListener('click', () => {
  const expanded = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', expanded ? '关闭菜单' : '展开菜单');
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', '展开菜单');
}));
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const media = document.querySelectorAll(
    '.showcase-photo-frame, .moments-grid figure, .game-project-visual, .journal-page .entry-image, .credential-thumb'
  );
  const reveal = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 70px 0px' });
  media.forEach(element => {
    element.classList.add('media-reveal');
    reveal.observe(element);
  });
}

let navigating = false;
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || navigating || reducedMotion.matches) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target || link.hasAttribute('download')) return;
  const target = new URL(link.href, window.location.href);
  const current = new URL(window.location.href);
  if (target.protocol !== current.protocol || target.host !== current.host) return;
  if (target.pathname === current.pathname) return;
  if (!/\.html$/i.test(target.pathname)) return;
  event.preventDefault();
  navigating = true;
  document.body.classList.add('is-leaving');
  window.setTimeout(() => { window.location.href = target.href; }, 220);
});

window.addEventListener('pageshow', () => {
  navigating = false;
  document.body.classList.remove('is-leaving');
});
