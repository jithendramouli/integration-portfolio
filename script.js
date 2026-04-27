/* ==========================================================
   Jithendra Mouli — Portfolio
   Lightweight, dependency-free interactivity
   ========================================================== */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav state + scroll progress ---------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 12);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = pct + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  const mobile = $('#navMobile');
  const closeMobile = () => {
    if (!toggle || !mobile) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobile.hidden = true;
    document.body.style.overflow = '';
  };

  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
      mobile.hidden = expanded;
      document.body.style.overflow = expanded ? '' : 'hidden';
    });

    $$('a', mobile).forEach((a) => a.addEventListener('click', closeMobile));
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 880) closeMobile();
    });
  }

  /* ---------- Smooth scroll for in-page links ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  /* ---------- Hero text reveal (staggered) ---------- */
  const heroLines = $$('.hero__title .line, .reveal-up');
  if ('IntersectionObserver' in window) {
    const heroIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        heroIo.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    heroLines.forEach((el) => heroIo.observe(el));
  } else {
    heroLines.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- General section reveal ---------- */
  const revealTargets = $$(
    '.section, .timeline__item, .project, .pillar, .skill-card, .cert'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger children inside the same parent block
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.children).filter((c) =>
                  c.classList.contains('reveal')
                )
              : [];
            const idx = siblings.indexOf(entry.target);
            const stagger = idx >= 0 ? Math.min(idx, 5) * 80 : 0;
            setTimeout(() => entry.target.classList.add('is-visible'), stagger);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Active nav link based on visible section ---------- */
  const navLinks = $$('.nav__links a');
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = '#' + entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Animated count-up for hero metrics ---------- */
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        counterIo.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => counterIo.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent = c.dataset.count + (c.dataset.suffix || '');
    });
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Project card spotlight (mouse glow) ---------- */
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
    $$('[data-project]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ---------- Project case-study expand/collapse ---------- */
  $$('[data-expand]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-project]');
      if (!card) return;
      const isOpen = card.dataset.expanded === 'true';
      card.dataset.expanded = String(!isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

})();
