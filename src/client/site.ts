// Tough Yew Co. — page behaviour: header, menus, hero slideshow, reveals, gallery rail, FAQ, form.
// Everything here is an enhancement: the page reads and works with scripting off.

const root = document.documentElement;
root.classList.remove('no-js');
root.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => scope.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => Array.from(scope.querySelectorAll<T>(sel));

// ---------- Header: solid once the page moves, tucks away on the way down, returns on the way up

function initHeader(): void {
  const header = $('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    const menuOpen = !!$('[data-menu].is-open') || !!$<HTMLDetailsElement>('[data-drawer]')?.open;
    if (goingDown && y > 480 && !menuOpen && !header.matches(':focus-within')) header.classList.add('is-hidden');
    else if (goingUp || y <= 480) header.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

// ---------- "What we do" dropdown

function initMenus(): void {
  for (const item of $$('[data-menu]')) {
    const button = $<HTMLButtonElement>('button', item);
    if (!button) continue;
    const set = (open: boolean) => {
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    };
    button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { set(false); button.focus(); }
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget as Node | null)) set(false);
    });
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target as Node)) set(false);
    });
  }

  const drawer = $<HTMLDetailsElement>('[data-drawer]');
  drawer?.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) drawer.open = false;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.open) { drawer.open = false; $('summary', drawer)?.focus(); }
  });
}

// ---------- Hero slideshow: crossfade with a slow push-in, dots that fill, a pause control

function initSlideshow(): void {
  const show = $('[data-slideshow]');
  if (!show) return;
  const slides = $$('.hero__slide', show);
  const dots = $$<HTMLButtonElement>('[data-goto]', show);
  const pause = $<HTMLButtonElement>('[data-pause]', show);
  const controls = $('[data-controls]', show);
  if (slides.length < 2 || !pause || !controls) return;

  controls.hidden = false;
  const interval = 6500;
  show.style.setProperty('--slide-ms', `${interval}ms`);
  let index = 0;
  let timer = 0;
  let userPaused = reduceMotion.matches;
  let hovering = false;
  let onScreen = true;

  const go = (next: number) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle('is-active', active);
      if (active) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((d, i) => {
      if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
    restartFill();
  };

  // Restart the dot's fill animation so it tracks the current slide.
  const restartFill = () => {
    const fill = dots[index] ? $('.hero__dot-fill', dots[index]) : null;
    if (!fill) return;
    fill.style.animation = 'none';
    void fill.offsetWidth;
    fill.style.animation = '';
  };

  const running = () => !userPaused && !hovering && onScreen && !document.hidden;

  const sync = () => {
    window.clearInterval(timer);
    show.classList.toggle('is-paused', !running());
    pause.setAttribute('aria-label', userPaused ? 'Play the slideshow' : 'Pause the slideshow');
    pause.classList.toggle('is-playing', !userPaused);
    if (running()) timer = window.setInterval(() => go(index + 1), interval);
  };

  dots.forEach((d) => d.addEventListener('click', () => { go(Number(d.dataset.goto)); sync(); }));
  pause.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  show.addEventListener('pointerenter', () => { hovering = true; sync(); });
  show.addEventListener('pointerleave', () => { hovering = false; sync(); });
  show.addEventListener('focusin', () => { hovering = true; sync(); });
  show.addEventListener('focusout', (e) => { if (!show.contains(e.relatedTarget as Node | null)) { hovering = false; sync(); } });
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) userPaused = true; sync(); });
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }, { threshold: 0.1 }).observe(show);

  show.classList.add('is-ready');
  sync();
}

// ---------- Scroll reveals: sections rise into place once, in a short stagger

function initReveals(): void {
  const items = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => io.observe(el));

  const steps = $('[data-steps]');
  if (steps) {
    const sio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { steps.classList.add('is-visible'); sio.disconnect(); } }, { threshold: 0.3 });
    sio.observe(steps);
  }
}

// ---------- Gallery rail: arrow buttons that page through the photographs

function initRail(): void {
  const rail = $('[data-rail]');
  const nav = $('[data-rail-nav]');
  const prev = $<HTMLButtonElement>('[data-rail-prev]');
  const next = $<HTMLButtonElement>('[data-rail-next]');
  if (!rail || !nav || !prev || !next) return;
  nav.hidden = false;

  const step = () => {
    const item = $('.rail__item', rail);
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    return item ? item.getBoundingClientRect().width + gap : rail.clientWidth * 0.8;
  };
  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
  };
  const behavior: ScrollBehavior = reduceMotion.matches ? 'auto' : 'smooth';
  prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior }));
  next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior }));
  rail.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
  update();
}

// ---------- FAQ: the answer eases in when a question opens

function initFaq(): void {
  for (const item of $$<HTMLDetailsElement>('[data-faq]')) {
    const body = $('.faq__body', item);
    item.addEventListener('toggle', () => {
      if (!item.open || !body || reduceMotion.matches) return;
      body.animate(
        [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    });
  }
}

// ---------- Enquiry: a sending state on the button once the request starts

function initForm(): void {
  const form = $<HTMLFormElement>('form.enquiry');
  const submit = $<HTMLButtonElement>('[data-submit]');
  if (!form || !submit) return;
  form.addEventListener('submit', () => {
    submit.setAttribute('aria-busy', 'true');
    submit.classList.add('is-loading');
    const label = $('span', submit);
    if (label) label.textContent = 'Sending…';
    window.setTimeout(() => { submit.disabled = true; }, 0);
  });
}

initHeader();
initMenus();
initSlideshow();
initReveals();
initRail();
initFaq();
initForm();
