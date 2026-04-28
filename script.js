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

  /* ---------- Sticky nav + scroll progress ---------- */
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
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
      mobile.hidden = expanded;
      document.body.style.overflow = expanded ? '' : 'hidden';
    });
    $$('a', mobile).forEach((a) => a.addEventListener('click', closeMobile));

    document.addEventListener('click', (e) => {
      if (mobile.hidden) return;
      if (!mobile.contains(e.target) && !toggle.contains(e.target)) closeMobile();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobile.hidden) closeMobile();
    });

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

  /* ---------- Hero/eyebrow staggered reveal ---------- */
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

  /* ---------- Section reveal ---------- */
  const revealTargets = $$('.section, .timeline__item, .project, .focus, .skill-group');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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

  /* ---------- Active nav link (scroll spy) ---------- */
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

  /* ---------- Animated count-up for hero stats ---------- */
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

  /* ---------- Stack strip: scroll-linked parallax ---------- */
  const stackStrip = $('.stack-strip');
  if (stackStrip && !prefersReduced) {
    let ticking = false;
    const updateStackParallax = () => {
      const r = stackStrip.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) {
        stackStrip.style.setProperty('--scroll-shift', '0px');
        stackStrip.style.setProperty('--scroll-tilt', '0deg');
        ticking = false;
        return;
      }
      const center = (r.top + r.height / 2 - vh / 2) / (vh * 0.85);
      const shift = Math.max(-26, Math.min(26, -center * 34));
      const tilt = Math.max(-3.5, Math.min(3.5, center * 4.5));
      stackStrip.style.setProperty('--scroll-shift', shift + 'px');
      stackStrip.style.setProperty('--scroll-tilt', tilt + 'deg');
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateStackParallax);
        }
      },
      { passive: true }
    );
    updateStackParallax();
  }

  /* ---------- Deploy window mini-game ---------- */
  const game = $('[data-deploy-game]');
  if (game) {
    const marker = $('.playground__marker', game);
    const btnDeploy = $('.playground__deploy', game);
    const scoreEl = $('[data-score]', game);
    const bestEl = $('[data-best]', game);
    const fb = $('[data-feedback]', game);
    const LS_KEY = 'deployWindowBest';

    if (prefersReduced) {
      if (btnDeploy) btnDeploy.disabled = true;
      if (fb) fb.textContent = 'Mini-game is off when “Reduce motion” is enabled in your system settings.';
    } else if (marker && btnDeploy && scoreEl && bestEl) {
      const track = $('.playground__track', game);
      let pos = 0;
      let dir = 1;
      let speed = 1;
      let score = 0;
      let best = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
      bestEl.textContent = String(best);
      let rafId = 0;
      const zoneMin = 0.38;
      const zoneMax = 0.62;

      const trackUsable = () => Math.max(40, (track ? track.clientWidth : 320) - 16);

      const loop = () => {
        pos += 0.0068 * speed * dir;
        if (pos >= 1) {
          pos = 1;
          dir = -1;
        } else if (pos <= 0) {
          pos = 0;
          dir = 1;
        }
        marker.style.transform = `translate3d(${pos * trackUsable()}px, -50%, 0)`;
        rafId = requestAnimationFrame(loop);
      };

      marker.style.top = '50%';
      rafId = requestAnimationFrame(loop);

      btnDeploy.addEventListener('click', () => {
        const hit = pos >= zoneMin && pos <= zoneMax;
        if (hit) {
          score += 1;
          speed = Math.min(speed + 0.1, 2.35);
          scoreEl.textContent = String(score);
          if (score > best) {
            best = score;
            localStorage.setItem(LS_KEY, String(best));
            bestEl.textContent = String(best);
          }
          if (fb) fb.textContent = 'Shipped — green deploy window.';
          game.classList.add('is-hit');
          setTimeout(() => game.classList.remove('is-hit'), 320);
        } else if (fb) {
          fb.textContent = 'Miss — align the pulse with the dashed lane, then deploy.';
        }
      });
    }
  }
})();
