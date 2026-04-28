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

  const journeyStops = $$('.journey-rail__stop');
  const journeyTargets = journeyStops
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const setJourneyActive = (href) => {
    journeyStops.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === href);
    });
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = pct + '%';
    }
    if (journeyStops.length && y < 96) setJourneyActive('#home');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (journeyStops.length && journeyTargets.length && 'IntersectionObserver' in window) {
    const jSpy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setJourneyActive('#' + entry.target.id);
        });
      },
      { rootMargin: '-44% 0px -44% 0px', threshold: 0 }
    );
    journeyTargets.forEach((el) => jSpy.observe(el));
  }
  if (journeyStops.length && window.scrollY < 80) {
    setJourneyActive('#home');
  }

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
      { threshold: 0.08, rootMargin: '0px 0px -12px 0px' }
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

  /* ---------- Route Rush (lane game) ---------- */
  const routeGame = $('[data-route-game]');
  if (routeGame) {
    const arena = $('.route-game__arena', routeGame);
    const layer = $('[data-rs-packets]', routeGame);
    const startBtn = $('[data-rs-start]', routeGame);
    const scoreEl = $('[data-rs-score]', routeGame);
    const bestEl = $('[data-rs-best]', routeGame);
    const livesEl = $('[data-rs-lives]', routeGame);
    const fb = $('[data-rs-feedback]', routeGame);
    const taps = $$('[data-tap-lane]', routeGame);
    const LS_KEY = 'routeRushBest';

    const flash = (cls) => {
      routeGame.classList.remove('is-hit', 'is-miss');
      if (cls) routeGame.classList.add(cls);
      if (cls) setTimeout(() => routeGame.classList.remove(cls), 260);
    };

    if (prefersReduced) {
      if (startBtn) startBtn.disabled = true;
      if (fb) fb.textContent = 'Route Rush is off when “Reduce motion” is enabled in your system settings.';
    } else if (arena && layer && startBtn && scoreEl && bestEl && livesEl) {
      let running = false;
      let rafId = 0;
      let lastT = 0;
      let spawnAcc = 0;
      let score = 0;
      let lives = 3;
      let best = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
      bestEl.textContent = String(best);

      /** @type {{ el: HTMLElement, lane: number, y: number, speed: number }[]} */
      let packets = [];

      const arenaH = () => arena.clientHeight || 280;

      const catchBand = () => {
        const H = arenaH();
        return { top: H * 0.58, bottom: H * 0.78 };
      };

      const laneToPct = (lane) => 16.666 + lane * 33.333;

      const spawn = () => {
        const lane = Math.floor(Math.random() * 3);
        const el = document.createElement('div');
        el.className = 'route-game__packet';
        el.style.left = laneToPct(lane) + '%';
        el.style.top = '-8px';
        layer.appendChild(el);
        packets.push({ el, lane, y: -8, speed: 0.11 + Math.min(score, 40) * 0.0022 });
      };

      const clearPackets = () => {
        packets.forEach((p) => p.el.remove());
        packets = [];
      };

      const endGame = (msg) => {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        lastT = 0;
        clearPackets();
        startBtn.disabled = false;
        startBtn.textContent = 'Play again';
        if (fb) fb.textContent = msg;
        flash('');
      };

      const tick = (now) => {
        if (!running) return;
        if (!lastT) lastT = now;
        const dt = Math.min(48, now - lastT);
        lastT = now;

        const H = arenaH();
        const spawnEvery = Math.max(480, 1500 - score * 28);

        spawnAcc += dt;
        if (spawnAcc >= spawnEvery) {
          spawnAcc = 0;
          spawn();
        }

        for (let i = packets.length - 1; i >= 0; i -= 1) {
          const p = packets[i];
          p.y += p.speed * dt;
          p.el.style.top = p.y + 'px';
          const cy = p.y + 15;
          if (cy > H + 8) {
            lives -= 1;
            livesEl.textContent = String(lives);
            p.el.remove();
            packets.splice(i, 1);
            if (fb) fb.textContent = 'Missed — payload hit the floor.';
            flash('is-miss');
            if (lives <= 0) {
              endGame('Game over — backlog wins. Hit Play again when ready.');
              return;
            }
          }
        }

        rafId = requestAnimationFrame(tick);
      };

      const tryRoute = (lane) => {
        if (!running) return;
        const band = catchBand();
        const inBand = packets.filter((p) => {
          const cy = p.y + 15;
          return cy >= band.top && cy <= band.bottom;
        });
        if (!inBand.length) {
          if (fb) fb.textContent = 'Too early — wait until the dot crosses the purple band.';
          return;
        }
        inBand.sort((a, b) => b.y - a.y);
        const target = inBand[0];
        if (target.lane === lane) {
          score += 1;
          scoreEl.textContent = String(score);
          if (score > best) {
            best = score;
            localStorage.setItem(LS_KEY, String(best));
            bestEl.textContent = String(best);
          }
          target.el.remove();
          packets = packets.filter((p) => p !== target);
          if (fb) fb.textContent = 'Routed — nice timing.';
          flash('is-hit');
        } else {
          if (fb) fb.textContent = 'Wrong lane — that payload was in another column.';
          flash('is-miss');
        }
      };

      taps.forEach((btn) => {
        btn.addEventListener('click', () => {
          const lane = parseInt(btn.getAttribute('data-tap-lane') || '0', 10);
          tryRoute(lane);
        });
      });

      window.addEventListener('keydown', (e) => {
        if (!running) return;
        if (e.key === '1') tryRoute(0);
        else if (e.key === '2') tryRoute(1);
        else if (e.key === '3') tryRoute(2);
      });

      startBtn.addEventListener('click', () => {
        if (running) return;
        running = true;
        score = 0;
        lives = 3;
        spawnAcc = 0;
        lastT = 0;
        scoreEl.textContent = '0';
        livesEl.textContent = '3';
        clearPackets();
        startBtn.disabled = true;
        startBtn.textContent = 'Playing…';
        if (fb) fb.textContent = 'Go — route dots in the purple band.';
        flash('');
        arena.focus({ preventScroll: true });
        rafId = requestAnimationFrame(tick);
      });
    }
  }
})();
