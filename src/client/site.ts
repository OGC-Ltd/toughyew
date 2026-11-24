// Tough Yew Co. — page behaviour: header, menus, hero slideshow, reveals, gallery rail, FAQ, form.
// Everything here is an enhancement: the page reads and works with scripting off.

const root = document.documentElement;
root.classList.remove('no-js');
root.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => scope.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => Array.from(scope.querySelectorAll<T>(sel));

// ---------- Header: pinned to the top, turning solid once the page moves

function initHeader(): void {
  const header = $('[data-header]');
  if (!header) return;
  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
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
  const caption = $('[data-caption]', show);
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
    const text = $('figcaption', slides[index])?.textContent ?? '';
    if (caption && caption.textContent !== text) {
      caption.textContent = text;
      if (!reduceMotion.matches) {
        caption.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      }
    }
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
  // A wipe starts fully clipped, and the browser treats a fully clipped element as off screen, so its
  // reveal never fired. Watch its parent instead and reveal every wipe inside it together.
  const watched = new Map<Element, Element[]>();
  for (const el of items) {
    const target = el.dataset.reveal === 'wipe' && el.parentElement ? el.parentElement : el;
    watched.set(target, [...(watched.get(target) ?? []), el]);
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      (watched.get(entry.target) ?? []).forEach((el) => el.classList.add('is-visible'));
      io.unobserve(entry.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  watched.forEach((_, target) => io.observe(target));

  const steps = $('[data-steps]');
  if (steps) {
    const sio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { steps.classList.add('is-visible'); sio.disconnect(); } }, { threshold: 0.3 });
    sio.observe(steps);
  }
}

// ---------- Gallery rail: steps along by itself one photograph at a time, looping back to the start.
// It holds still while a photograph is hovered or focused, off-screen, in a hidden tab, under
// reduced motion (until Play is pressed), or once paused. The arrows page by hand.

function initRail(): void {
  const rail = $('[data-rail]');
  const stage = $('[data-rail-stage]');
  const prev = $<HTMLButtonElement>('[data-rail-prev]');
  const next = $<HTMLButtonElement>('[data-rail-next]');
  const pause = $<HTMLButtonElement>('[data-rail-pause]');
  if (!rail || !stage || !prev || !next || !pause) return;
  $$('[data-rail-ctrl]').forEach((el) => { el.hidden = false; });

  const interval = 4500;
  let timer = 0;
  let userPaused = reduceMotion.matches;
  let hovering = false;
  let focused = false;
  let onScreen = false;

  const step = () => {
    const item = $('.rail__item', rail);
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    return item ? item.getBoundingClientRect().width + gap : rail.clientWidth * 0.8;
  };
  const atStart = () => rail.scrollLeft <= 2;
  const atEnd = () => rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
  const behavior = (): ScrollBehavior => (reduceMotion.matches ? 'auto' : 'smooth');

  // Both directions wrap: past the last photograph is the first, before the first is the last.
  const advance = () => {
    if (atEnd()) rail.scrollTo({ left: 0, behavior: behavior() });
    else rail.scrollBy({ left: step(), behavior: behavior() });
  };
  const retreat = () => {
    if (atStart()) rail.scrollTo({ left: rail.scrollWidth, behavior: behavior() });
    else rail.scrollBy({ left: -step(), behavior: behavior() });
  };

  const running = () => !userPaused && !hovering && !focused && onScreen && !document.hidden;
  // Every call restarts the count, so a manual move earns a full interval before the next step.
  const sync = () => {
    window.clearInterval(timer);
    pause.setAttribute('aria-label', userPaused ? 'Play the gallery' : 'Pause the gallery');
    pause.classList.toggle('is-playing', !userPaused);
    if (running()) timer = window.setInterval(advance, interval);
  };

  prev.addEventListener('click', () => { retreat(); sync(); });
  next.addEventListener('click', () => { advance(); sync(); });
  pause.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  // The stage holds the photographs and both arrows, so aiming at an arrow also holds the rail still.
  stage.addEventListener('pointerenter', () => { hovering = true; sync(); });
  stage.addEventListener('pointerleave', () => { hovering = false; sync(); });
  rail.addEventListener('focusin', () => { focused = true; sync(); });
  rail.addEventListener('focusout', (e) => { if (!rail.contains(e.relatedTarget as Node | null)) { focused = false; sync(); } });
  rail.addEventListener('touchstart', sync, { passive: true });
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) userPaused = true; sync(); });
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }, { threshold: 0.4 }).observe(rail);

  sync();
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
  const submit = $<HTMLButtonElement>('[data-submit]', form ?? document);
  if (!form || !submit) return;
  form.addEventListener('submit', () => {
    submit.setAttribute('aria-busy', 'true');
    submit.classList.add('is-loading');
    const label = $('span', submit);
    if (label) label.textContent = 'Sending…';
    window.setTimeout(() => { submit.disabled = true; }, 0);
  });
}

// ---------- Photo viewer (New builds): each photograph opens large in a dialog, with previous,
// next, close, arrow keys and Escape. Without scripting each link opens the large file itself.

function initViewer(): void {
  const dialog = $<HTMLDialogElement>('[data-viewer]');
  const links = $$<HTMLAnchorElement>('[data-viewer-item]');
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const img = $<HTMLImageElement>('[data-viewer-img]', dialog);
  const caption = $('[data-viewer-caption]', dialog);
  const count = $('[data-viewer-count]', dialog);
  const prev = $<HTMLButtonElement>('[data-viewer-prev]', dialog);
  const next = $<HTMLButtonElement>('[data-viewer-next]', dialog);
  const close = $<HTMLButtonElement>('[data-viewer-close]', dialog);
  if (!img || !caption || !count || !prev || !next || !close) return;

  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const link = links[index];
    img.src = link.href;
    img.alt = link.dataset.alt ?? '';
    caption.textContent = link.dataset.caption ?? '';
    count.textContent = `${index + 1} of ${links.length}`;
    if (!reduceMotion.matches) {
      img.classList.remove('is-changing');
      void img.offsetWidth;
      img.classList.add('is-changing');
    }
    // Warm the neighbours so stepping along feels instant.
    for (const n of [index - 1, index + 1]) {
      const l = links[(n + links.length) % links.length];
      new Image().src = l.href;
    }
  };

  links.forEach((link, i) => link.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let new-tab clicks through
    e.preventDefault();
    opener = link;
    show(i);
    dialog.showModal();
    close.focus();
  }));

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });
  // A click on the dark surround (not the photograph or a button) closes the viewer.
  dialog.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t === dialog || t.classList.contains('viewer__frame')) dialog.close();
  });
  dialog.addEventListener('close', () => { opener?.focus(); });
}

// ---------- Supplier quotation: add and remove material lines, and keep the totals current

function initQuoteForm(): void {
  const form = $<HTMLFormElement>('[data-quote-form]');
  const body = $('[data-lines]');
  const add = $<HTMLButtonElement>('[data-add-line]');
  if (!form || !body || !add) return;
  add.hidden = false;

  const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(/[,\s]/g, '')));
  const money = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  const lines = () => $$('[data-line]', body);

  const renumber = () => lines().forEach((line, i) => {
    const n = $('[data-line-num]', line);
    if (n) n.textContent = String(i + 1);
    $$<HTMLInputElement | HTMLSelectElement>('input, select', line).forEach((el) => {
      el.id = `${el.name}-${i}`;
      const label = $<HTMLLabelElement>('label[for]', el.parentElement ?? line);
      if (label) label.htmlFor = el.id;
    });
    $('[data-remove-line]', line)?.setAttribute('aria-label', `Remove line ${i + 1}`);
  });

  const update = () => {
    let subtotal = 0;
    for (const line of lines()) {
      const q = num($<HTMLInputElement>('[data-qty]', line)?.value ?? '');
      const p = num($<HTMLInputElement>('[data-price]', line)?.value ?? '');
      const out = $('[data-line-total]', line);
      const total = q > 0 && p >= 0 ? Math.round(q * Math.round(p * 100)) : NaN;
      if (out) out.textContent = Number.isNaN(total) ? '—' : money.format(total / 100);
      if (!Number.isNaN(total)) subtotal += total;
    }
    const cents = (name: string) => { const v = num(field(name)?.value ?? ''); return v >= 0 ? Math.round(v * 100) : 0; };
    const discount = cents('discount');
    const delivery = cents('delivery');
    const rate = Number(field('vat')?.value ?? 0) || 0;
    const taxable = Math.max(0, subtotal - discount + delivery);
    const vat = Math.round((taxable * rate) / 100);
    const set = (key: string, text: string) => { const el = $(`[data-total="${key}"]`, form); if (el) el.textContent = text; };
    set('subtotal', money.format(subtotal / 100));
    set('discount', discount ? `− ${money.format(discount / 100)}` : '—');
    set('delivery', delivery ? money.format(delivery / 100) : 'Included');
    set('vat-label', rate ? `VAT ${rate}%` : 'VAT');
    set('vat', rate ? money.format(vat / 100) : 'Not charged');
    set('currency', ` (${field('currency')?.value || ''})`);
    set('total', money.format((taxable + vat) / 100));
  };

  const clear = (line: HTMLElement) => {
    $$<HTMLInputElement>('input', line).forEach((el) => { el.value = ''; el.removeAttribute('aria-invalid'); });
    $$<HTMLSelectElement>('select', line).forEach((el) => { el.selectedIndex = 0; el.removeAttribute('aria-invalid'); });
  };

  add.addEventListener('click', () => {
    const last = lines().at(-1);
    if (!last) return;
    const line = last.cloneNode(true) as HTMLElement;
    clear(line);
    $$('.field__error', line).forEach((el) => el.parentNode?.removeChild(el));
    $$('.field--error', line).forEach((el) => el.classList.toggle('field--error', false));
    body.append(line);
    renumber();
    update();
    $<HTMLInputElement>('input', line)?.focus();
  });

  body.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('[data-remove-line]');
    const line = btn?.closest<HTMLElement>('[data-line]');
    if (!line) return;
    if (lines().length > 1) {
      const next = (line.nextElementSibling ?? line.previousElementSibling) as HTMLElement | null;
      body.removeChild(line);
      renumber();
      $<HTMLInputElement>('input', next ?? body)?.focus();
    } else {
      clear(line);
    }
    update();
  });

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
}

function initPrint(): void {
  const btn = $<HTMLButtonElement>('[data-print]');
  if (!btn) return;
  btn.hidden = false;
  btn.addEventListener('click', () => window.print());
}

// ---------- Supplier quotation: a GPS position is required before the form may send

function initQuoteLocation(): void {
  const form = $<HTMLFormElement>('[data-quote-form]');
  const submit = $<HTMLButtonElement>('[data-submit]', form ?? document);
  const errorBox = $<HTMLDialogElement>('dialog[data-gps-error]');
  if (!form || !submit || !errorBox) return;
  const label = $('span', submit);
  const idle = label?.textContent ?? 'Send quotation';
  const gps = (k: string) => $<HTMLInputElement>(`[data-gps="${k}"]`, form);
  let located = false;

  const busy = (text: string | null) => {
    submit.classList.toggle('is-loading', text !== null);
    if (text === null) submit.removeAttribute('aria-busy'); else submit.setAttribute('aria-busy', 'true');
    submit.disabled = text !== null;
    if (label) label.textContent = text ?? idle;
  };

  const lead = $('[data-gps-lead]', errorBox);
  const steps = $('[data-gps-steps]', errorBox);
  const retry = $<HTMLButtonElement>('[data-gps-retry]', errorBox);

  // What went wrong, and the few steps that put it right, for each reason the browser can give.
  const help: Record<string, { lead: string; steps: string[]; retry: boolean }> = {
    denied: {
      lead: 'Location is blocked for this site, and a quotation can only be sent with it.',
      steps: ['Select the icon at the left of the address bar.', 'Set Location to Allow.', 'Press Try again.'],
      retry: true,
    },
    unavailable: {
      lead: 'Your device could not find its location.',
      steps: ['Turn on location (GPS) in your device settings.', 'Press Try again.'],
      retry: true,
    },
    timeout: {
      lead: 'Finding your location took too long.',
      steps: ['Check that location (GPS) is turned on.', 'Press Try again.'],
      retry: true,
    },
    unsupported: {
      lead: 'This browser cannot share a location.',
      steps: ['Open this page in an up-to-date browser, on a phone or computer with location turned on.'],
      retry: false,
    },
  };

  const fail = (reason: keyof typeof help) => {
    busy(null);
    const h = help[reason];
    if (lead) lead.textContent = h.lead;
    if (steps) steps.replaceChildren(...h.steps.map((t) => { const li = document.createElement('li'); li.textContent = t; return li; }));
    if (retry) retry.hidden = !h.retry;
    if (!errorBox.open) errorBox.showModal();
    // Record the failed attempt (IP and network location are added on the server).
    const field = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '';
    const payload = JSON.stringify({ reason, business: field('business'), contact: field('contact'), email: field('email'), phone: field('phone') });
    const blob = new Blob([payload], { type: 'application/json' });
    if (!navigator.sendBeacon?.('/supplier-quote/location-failed', blob)) {
      fetch('/supplier-quote/location-failed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
    }
  };

  // Try again closes the dialog and sends once more, which asks for the location afresh; Close just closes it.
  retry?.addEventListener('click', () => { errorBox.close(); form.requestSubmit(submit); });
  $$('[data-gps-close]', errorBox).forEach((btn) => btn.addEventListener('click', () => errorBox.close()));
  // A click on the dimmed surround (the dialog itself, outside its panel) closes it too.
  errorBox.addEventListener('click', (e) => { if (e.target === errorBox) errorBox.close(); });
  // After the server refused a quotation for want of a location, the dialog arrives filled: open it.
  if (errorBox.hasAttribute('data-gps-open')) errorBox.showModal();

  form.addEventListener('submit', (e) => {
    if (located) { busy('Sending…'); return; }
    e.preventDefault();
    if (!('geolocation' in navigator)) return fail('unsupported');
    busy('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gps('lat')!.value = String(pos.coords.latitude);
        gps('lng')!.value = String(pos.coords.longitude);
        gps('accuracy')!.value = String(pos.coords.accuracy);
        gps('at')!.value = new Date(pos.timestamp).toISOString();
        located = true;
        busy(null);
        form.requestSubmit(submit);
      },
      (err) => fail(err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });
}

initHeader();
initMenus();
initViewer();
initSlideshow();
initReveals();
initRail();
initFaq();
initForm();
initQuoteForm();
initPrint();
initQuoteLocation();
