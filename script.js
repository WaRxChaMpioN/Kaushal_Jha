/* ══════════════════════════════════════════════════════
   script.js — Kaushal Jha Portfolio
   Pure vanilla JS. No frameworks, no build tools.
   GitHub Pages compatible.

   Modules:
     1.  Lucide icon initialization
     2.  Scroll progress bar
     3.  Navbar scroll behavior
     4.  Hamburger menu (mobile)
     5.  Typing animation (hero, reduced-motion aware)
     6.  Fade-in on scroll
     7.  Active nav link tracking
     8.  Section progress rail
     9.  Smooth scroll with navbar offset
     10. Hero canvas
     11. Hero parallax
     12. Dark mode theme toggle
     13. Lazy research media
     14. Research comparison slider + preview controls
     15. Research image galleries
     16. Expandable research card details
     17. Animated skill progress bars
     18. Blog category filter
     19. Contact form — validation + Formspree
     20. Back-to-top button
     21. Stats counter animation
     22. Command palette (Cmd+K)
     23. Premium interaction layer (tilt, magnetic buttons, cursor)
     24. Interactive CFD demo (lid-driven cavity)
══════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────
   MODULE-LEVEL UTILITIES
   Exposed here so the command palette can call them.
────────────────────────────────────────── */
function setTheme(theme) {
  const dark = theme === 'dark';
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try { localStorage.setItem('kj-theme', dark ? 'dark' : 'light'); } catch (e) {}

  // Sync theme-toggle icon
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = dark
      ? '<i data-lucide="sun" aria-hidden="true"></i>'
      : '<i data-lucide="moon" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function scrollToSection(id) {
  const NAV_H = 64;
  const target = document.querySelector(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function supportsFinePointer() {
  return window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function rafThrottle(fn) {
  let queued = false;
  return (...args) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...args);
    });
  };
}

/* ──────────────────────────────────────────
   BOOT
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  initScrollProgress();
  initNavbar();
  initHamburger();
  initTypingAnimation();
  initFadeInSections();
  initActiveNavLinks();
  initSectionProgress();
  initSmoothScroll();
  initHeroCanvas();
  initHeroParallax();
  initThemeToggle();
  initLazyResearchMedia();
  initResearchComparisons();
  initResearchGalleries();
  initPreviewButtons();
  initExpandableCards();
  initSkillBars();
  initBlogFilter();
  initContactForm();
  initBackToTop();
  initStatsCounter();
  initCommandPalette();
  initCFDDemo();
  initCardTilt();
  initMagneticButtons();
  initCustomCursor();
});

/* ──────────────────────────────────────────
   1. SCROLL PROGRESS BAR
────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0).toFixed(2) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ──────────────────────────────────────────
   2. NAVBAR
────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ──────────────────────────────────────────
   3. HAMBURGER MENU
────────────────────────────────────────── */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  const open = () => {
    navLinks.classList.add('mobile-open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    navLinks.classList.remove('mobile-open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.contains('mobile-open') ? close() : open();
  });
  navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('mobile-open')
        && !navLinks.contains(e.target) && !hamburger.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) { close(); hamburger.focus(); }
  });
}

/* ──────────────────────────────────────────
   4. TYPING ANIMATION
────────────────────────────────────────── */
function initTypingAnimation() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const phrases = [
    'training continuity-aware 3D CNNs',
    'reproducing ML-CFD benchmarks',
    'turning pore geometry into velocity fields',
    'scaling experiments on Wendian HPC'
  ];
  if (prefersReducedMotion()) {
    el.textContent = phrases[0];
    const cursor = el.parentElement?.querySelector('.cursor');
    if (cursor) cursor.style.display = 'none';
    return;
  }
  let pi = 0, ci = 0, deleting = false, tid;
  const TYPE = 85, DEL = 48, PAUSE_END = 1900, PAUSE_START = 360;

  function tick() {
    const phrase = phrases[pi];
    deleting ? ci-- : ci++;
    el.textContent = phrase.substring(0, ci);
    let delay = deleting ? DEL : TYPE;
    if (!deleting && ci === phrase.length) { delay = PAUSE_END; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = PAUSE_START; }
    tid = setTimeout(tick, delay);
  }
  tid = setTimeout(tick, 700);
}

/* ──────────────────────────────────────────
   5. FADE-IN ON SCROLL
────────────────────────────────────────── */
function initFadeInSections() {
  document.querySelectorAll('.timeline-item').forEach(el => el.classList.add('fade-in-section'));
  const els = document.querySelectorAll('.fade-in-section');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
  // Stagger repeated lists for orientation; sections still reveal once for performance.
  document.querySelectorAll('.timeline-item, .research-card, .project-card, .blog-card').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 55}ms`);
  });
  const obs = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );
  els.forEach(el => obs.observe(el));
}

/* ──────────────────────────────────────────
   7. ACTIVE NAV LINK
────────────────────────────────────────── */
function initActiveNavLinks() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links    = document.querySelectorAll('.nav-link');
  if (!('IntersectionObserver' in window) || !sections.length) return;
  const active = new Set();
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => e.isIntersecting ? active.add(e.target.id) : active.delete(e.target.id));
      let id = null;
      for (const s of sections) { if (active.has(s.id)) id = s.id; }
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    },
    { rootMargin: '-64px 0px -35% 0px', threshold: 0 }
  );
  sections.forEach(s => obs.observe(s));
}

/* ──────────────────────────────────────────
   8. SECTION PROGRESS RAIL
   Lightweight section dots mirror nav state without scroll polling.
────────────────────────────────────────── */
function initSectionProgress() {
  const rail = document.getElementById('section-progress');
  if (!rail || !('IntersectionObserver' in window)) return;
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  if (!sections.length) return;

  sections.forEach(section => {
    const btn = document.createElement('button');
    btn.className = 'section-progress-dot';
    btn.type = 'button';
    btn.dataset.target = section.id;
    btn.setAttribute('aria-label', `Go to ${section.id.replace(/-/g, ' ')}`);
    btn.addEventListener('click', () => scrollToSection(`#${section.id}`));
    rail.appendChild(btn);
  });

  const dots = Array.from(rail.querySelectorAll('.section-progress-dot'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      dots.forEach(dot => dot.classList.toggle('active', dot.dataset.target === entry.target.id));
    });
  }, { rootMargin: '-35% 0px -50% 0px', threshold: 0 });
  sections.forEach(section => obs.observe(section));
}

/* ──────────────────────────────────────────
   9. SMOOTH SCROLL
────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToSection(id);
    });
  });
}

/* ──────────────────────────────────────────
   10. HERO CANVAS — ANIMATED FLOW FIELD
   Perlin-like vector field drives an adaptive particle
   count whose trails accumulate into fluid streamlines.
   Pauses when hero is off-screen or the tab is hidden.
────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (prefersReducedMotion()) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H, animId, visible = true;
  let particles = [];
  let particleTarget = 180;
  const SPEED = 0.8;
  let lastFpsCheck = performance.now();
  let framesSinceCheck = 0;

  /* Perlin-like flow field using layered sin/cos */
  function flowAngle(x, y, t) {
    const nx = x / W, ny = y / H;
    return (
      Math.sin(nx * 3.2 + t * 0.4) * Math.cos(ny * 2.1 + t * 0.25) * Math.PI +
      Math.sin(nx * 1.4 + ny * 2.8 + t * 0.18) * Math.PI * 0.6 +
      Math.cos(nx * 5.1 - ny * 1.7 + t * 0.3)  * Math.PI * 0.3
    );
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function computeParticleTarget() {
    const area = Math.max(W * H, 1);
    const cores = navigator.hardwareConcurrency || 4;
    const isSmall = W < 720;
    let target = Math.round(area / 4300);
    if (isSmall) target *= 0.68;
    if (cores <= 4) target *= 0.72;
    if ((window.devicePixelRatio || 1) > 1.5) target *= 0.85;
    return clamp(Math.round(target), 70, 260);
  }

  function syncParticles() {
    while (particles.length > particleTarget) particles.pop();
    while (particles.length < particleTarget) particles.push(makeParticle());
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      life: Math.random() * 120,
      maxLife: 80 + Math.random() * 100,
      speed: SPEED * (0.6 + Math.random() * 0.8),
      color: Math.random() > 0.75 ? 'rgba(139,105,20,' : 'rgba(74,124,89,',
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    particleTarget = computeParticleTarget();
    initParticles();
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleTarget; i++) particles.push(makeParticle());
  }

  let t = 0;

  function startCanvas() {
    if (!animId && visible && !document.hidden) animId = requestAnimationFrame(draw);
  }

  function stopCanvas() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function reduceParticlesIfNeeded(now) {
    framesSinceCheck++;
    const elapsed = now - lastFpsCheck;
    if (elapsed < 1200) return;
    const fps = framesSinceCheck / (elapsed / 1000);
    if (fps < 42 && particleTarget > 70) {
      particleTarget = clamp(Math.round(particleTarget * 0.78), 70, 260);
      syncParticles();
    }
    framesSinceCheck = 0;
    lastFpsCheck = now;
  }

  function draw(now) {
    reduceParticlesIfNeeded(now);

    /* Fade trail — accumulates into visible streams */
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = dark ? 'rgba(15,21,16,0.06)' : 'rgba(247,245,240,0.06)';
    ctx.fillRect(0, 0, W, H);

    t += 0.008;

    for (const p of particles) {
      p.life++;
      const angle = flowAngle(p.x, p.y, t);
      const prevX = p.x, prevY = p.y;
      p.x += Math.cos(angle) * p.speed;
      p.y += Math.sin(angle) * p.speed;

      const lr = p.life / p.maxLife;
      const alpha = lr < 0.15 ? lr / 0.15 : lr > 0.75 ? (1 - lr) / 0.25 : 1;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = p.color + (alpha * 0.55) + ')';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      /* Respawn when life ends or goes off-screen */
      if (p.life >= p.maxLife || p.x < -5 || p.x > W + 5 || p.y < -5 || p.y > H + 5) {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
        p.life = 0;
        p.maxLife = 80 + Math.random() * 100;
        p.speed = SPEED * (0.6 + Math.random() * 0.8);
        p.color = Math.random() > 0.75 ? 'rgba(139,105,20,' : 'rgba(74,124,89,';
      }
    }

    animId = requestAnimationFrame(draw);
  }

  /* Clear on theme switch so old-color trails don't linger */
  new MutationObserver(() => {
    ctx.clearRect(0, 0, W, H);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* Pause when hero is off-screen */
  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (entry.isIntersecting) {
        startCanvas();
      } else {
        stopCanvas();
      }
    }, { threshold: 0 }).observe(heroEl);
  }

  window.addEventListener('resize', () => {
    stopCanvas();
    resize();
    startCanvas();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCanvas();
    else startCanvas();
  });

  resize();
  startCanvas();
}

/* ──────────────────────────────────────────
   11. HERO PARALLAX
   Scroll-linked transform is rAF-throttled and disabled for reduced motion.
────────────────────────────────────────── */
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const content = document.querySelector('.hero-content[data-parallax]');
  if (!hero || !content || prefersReducedMotion()) return;

  const rate = parseFloat(content.dataset.parallax) || 0.12;
  const update = rafThrottle(() => {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
    content.style.transform = `translate3d(0, ${progress * rect.height * rate}px, 0)`;
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) update();
  });
  update();
}

/* ──────────────────────────────────────────
   12. DARK MODE TOGGLE
────────────────────────────────────────── */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  // Sync icon with whatever the inline head script already set
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  const syncIcon = () => {
    const dark = isDark();
    btn.innerHTML = dark
      ? '<i data-lucide="sun" aria-hidden="true"></i>'
      : '<i data-lucide="moon" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };
  btn.addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));
  syncIcon();
}

/* ──────────────────────────────────────────
   13. LAZY RESEARCH MEDIA
   Native lazy-loading covers images; this module adds opt-in
   data-src support for heavier MP4/GIF previews.
────────────────────────────────────────── */
function initLazyResearchMedia() {
  const figures = document.querySelectorAll('.research-media');
  const media = document.querySelectorAll('.research-media img[data-src], .research-media video[data-src], .research-media source[data-src]');
  if (!figures.length) return;

  figures.forEach(figure => {
    const imgs = Array.from(figure.querySelectorAll('.research-gallery-main, .compare-slider > img, .research-media > img'));
    if (!imgs.length || imgs.every(img => img.complete)) {
      figure.classList.add('media-loaded');
      return;
    }
    let remaining = imgs.length;
    const markOne = () => {
      remaining--;
      if (remaining <= 0) figure.classList.add('media-loaded');
    };
    imgs.forEach(img => {
      img.addEventListener('load', markOne, { once: true });
      img.addEventListener('error', markOne, { once: true });
    });
  });

  function loadMedia(el) {
    if (el.dataset.src) {
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    }
    const video = el.tagName === 'VIDEO' ? el : el.closest('video');
    if (video) {
      video.load();
      video.addEventListener('loadeddata', () => video.closest('.research-media')?.classList.add('media-loaded'), { once: true });
    }
  }

  if (!('IntersectionObserver' in window)) {
    media.forEach(loadMedia);
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const root = entry.target;
      if (root.matches('[data-src]')) loadMedia(root);
      if (root.querySelectorAll) root.querySelectorAll('[data-src]').forEach(loadMedia);
      obs.unobserve(root);
    });
  }, { rootMargin: '250px 0px', threshold: 0.01 });

  document.querySelectorAll('.research-media').forEach(el => obs.observe(el));
}

/* ──────────────────────────────────────────
   14. RESEARCH COMPARISON + PREVIEW CONTROLS
   Range input updates a CSS split only; no canvas or heavy image processing.
────────────────────────────────────────── */
function initResearchComparisons() {
  document.querySelectorAll('[data-compare]').forEach(compare => {
    const input = compare.querySelector('input[type="range"]');
    if (!input) return;
    const update = () => compare.style.setProperty('--split', `${input.value}%`);
    input.addEventListener('input', update, { passive: true });
    update();
  });
}

/* ──────────────────────────────────────────
   15. RESEARCH IMAGE GALLERIES
   Swaps existing loaded images only; no extra dependencies or eager preloading.
────────────────────────────────────────── */
function initResearchGalleries() {
  document.querySelectorAll('.research-media').forEach(figure => {
    const main = figure.querySelector('.research-gallery-main');
    const thumbs = figure.querySelectorAll('.gallery-thumb[data-full]');
    if (!main || !thumbs.length) return;

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        main.src = thumb.dataset.full;
        main.alt = thumb.dataset.alt || main.alt;
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  });
}

function initPreviewButtons() {
  document.querySelectorAll('.media-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const figure = btn.closest('.research-media');
      const video = figure?.querySelector('video');
      if (video) {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
        btn.classList.toggle('is-active', !video.paused);
        return;
      }

      // Static fallback: confirms the affordance without inventing a fake animation.
      btn.classList.add('is-active');
      setTimeout(() => btn.classList.remove('is-active'), 900);
    });
  });
}

/* ──────────────────────────────────────────
   16. EXPANDABLE RESEARCH CARDS
────────────────────────────────────────── */
function initExpandableCards() {
  const btns = document.querySelectorAll('.card-expand-btn');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = btn.getAttribute('aria-controls');
      const details = document.getElementById(id);
      if (!details) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Close all others
      btns.forEach(b => {
        if (b !== btn) {
          const d = document.getElementById(b.getAttribute('aria-controls'));
          if (d) { d.classList.remove('expanded'); d.setAttribute('aria-hidden', 'true'); }
          b.setAttribute('aria-expanded', 'false');
          b.querySelector('span').textContent = 'Technical details';
        }
      });
      // Toggle this one
      details.classList.toggle('expanded', !isOpen);
      details.setAttribute('aria-hidden', String(isOpen));
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.querySelector('span').textContent = isOpen ? 'Technical details' : 'Hide details';
    });
  });
}

/* ──────────────────────────────────────────
   17. SKILL BARS
────────────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar[data-skill]');
  if (!bars.length) return;
  bars.forEach(bar => {
    const skill = bar.dataset.skill, pct = parseInt(bar.dataset.pct, 10) || 0;
    bar.innerHTML = `
      <div class="skill-bar-header">
        <span class="skill-bar-label">${skill}</span>
        <span class="skill-bar-pct">${pct}%</span>
      </div>
      <div class="skill-bar-track">
        <div class="skill-bar-fill" data-target-pct="${pct}" style="width:0%"></div>
      </div>`;
  });

  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function animate(fill, target, delay) {
    if (prefersReducedMotion()) {
      fill.style.width = target + '%';
      return;
    }
    setTimeout(() => {
      const dur = 900, start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        fill.style.width = (ease(p) * target).toFixed(2) + '%';
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, delay);
  }

  if (!('IntersectionObserver' in window)) {
    bars.forEach((bar, i) => { const f = bar.querySelector('.skill-bar-fill'); if (f) animate(f, +f.dataset.targetPct, i * 100); });
    return;
  }
  const wrapper = document.querySelector('.skills-bars') || bars[0].parentElement;
  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    bars.forEach((bar, i) => { const f = bar.querySelector('.skill-bar-fill'); if (f) animate(f, +f.dataset.targetPct, i * 100); });
    obs.unobserve(entry.target);
  }, { threshold: 0.15 });
  obs.observe(wrapper);
}

/* ──────────────────────────────────────────
   18. BLOG FILTER
────────────────────────────────────────── */
function initBlogFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.blog-card[data-category]');
  if (!btns.length || !cards.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => c.classList.toggle('filtered-out', f !== 'all' && c.dataset.category !== f));
    });
  });
}

/* ──────────────────────────────────────────
   19. CONTACT FORM
────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const ENDPOINT = 'https://formspree.io/f/xyklevwa';
  const nameEl   = form.querySelector('#name');
  const emailEl  = form.querySelector('#email');
  const msgEl    = form.querySelector('#message');
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner   = form.querySelector('.spinner');
  const success   = form.querySelector('.form-success');
  const errBanner = form.querySelector('.form-error-msg');

  function errEl(id) { return form.querySelector(`#err-${id}`); }
  function setErr(input, el, msg) { input.classList.add('invalid'); if (el) el.textContent = msg; }
  function clrErr(input, el) { input.classList.remove('invalid'); if (el) el.textContent = ''; }

  function validate() {
    let ok = true;
    if (!nameEl || nameEl.value.trim().length < 2) { if (nameEl) setErr(nameEl, errEl('name'), 'Please enter your name.'); ok = false; }
    else if (nameEl) clrErr(nameEl, errEl('name'));

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailEl || !re.test(emailEl.value.trim())) { if (emailEl) setErr(emailEl, errEl('email'), 'Please enter a valid email.'); ok = false; }
    else if (emailEl) clrErr(emailEl, errEl('email'));

    if (!msgEl || msgEl.value.trim().length < 10) { if (msgEl) setErr(msgEl, errEl('message'), 'Message must be at least 10 characters.'); ok = false; }
    else if (msgEl) clrErr(msgEl, errEl('message'));

    return ok;
  }

  [nameEl, emailEl, msgEl].forEach(el => {
    if (!el) return;
    el.addEventListener('blur', validate);
    el.addEventListener('input', () => clrErr(el, errEl(el.id)));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (submitBtn) submitBtn.disabled = true;
    if (spinner)   spinner.classList.add('visible');
    if (success)   success.classList.remove('visible');
    if (errBanner) errBanner.classList.remove('visible');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: nameEl?.value.trim(), email: emailEl?.value.trim(), message: msgEl?.value.trim() }),
      });
      if (res.ok) { form.reset(); if (success) success.classList.add('visible'); }
      else throw new Error();
    } catch { if (errBanner) errBanner.classList.add('visible'); }
    finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner)   spinner.classList.remove('visible');
    }
  });
}

/* ──────────────────────────────────────────
   20. BACK TO TOP
────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
}

/* ──────────────────────────────────────────
   21. STATS COUNTER
────────────────────────────────────────── */
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function run(el) {
    const target = parseFloat(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    const dec    = parseInt(el.dataset.decimals, 10) || 0;
    if (prefersReducedMotion()) {
      el.textContent = target.toFixed(dec) + suffix;
      return;
    }
    const dur = 1800, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = (ease(p) * target).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }
  const strip = document.querySelector('.stats-strip');
  if (!strip) return;
  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    counters.forEach(run);
    obs.unobserve(strip);
  }, { threshold: 0.4 });
  obs.observe(strip);
}

/* ──────────────────────────────────────────
   22. COMMAND PALETTE (Cmd+K / Ctrl+K)
────────────────────────────────────────── */
function initCommandPalette() {
  const overlay = document.getElementById('cmd-palette-overlay');
  const input   = document.getElementById('cmd-input');
  const results = document.getElementById('cmd-results');
  const hint    = document.getElementById('cmd-hint');
  if (!overlay || !input || !results) return;

  // Registry — actions call module-level setTheme / scrollToSection
  const CMDS = [
    { id: 'nav-about',     label: 'Go to About',              icon: 'user',          group: 'Navigate', action: () => { scrollToSection('#about');    closePalette(); } },
    { id: 'nav-timeline',  label: 'Go to Timeline',           icon: 'git-branch',    group: 'Navigate', action: () => { scrollToSection('#timeline'); closePalette(); } },
    { id: 'nav-research',  label: 'Go to Research',           icon: 'flask-conical', group: 'Navigate', action: () => { scrollToSection('#research'); closePalette(); } },
    { id: 'nav-work',      label: 'Go to Selected Work',       icon: 'file-text',     group: 'Navigate', action: () => { scrollToSection('#selected-work'); closePalette(); } },
    { id: 'nav-projects',  label: 'Go to Projects',           icon: 'code-2',        group: 'Navigate', action: () => { scrollToSection('#projects'); closePalette(); } },
    { id: 'nav-blog',      label: 'Go to Writing',            icon: 'pen-line',      group: 'Navigate', action: () => { scrollToSection('#blog');     closePalette(); } },
    { id: 'nav-cv',        label: 'Go to CV',                 icon: 'file-text',     group: 'Navigate', action: () => { scrollToSection('#cv');       closePalette(); } },
    { id: 'nav-contact',   label: 'Go to Contact',            icon: 'mail',          group: 'Navigate', action: () => { scrollToSection('#contact');  closePalette(); } },
    { id: 'dl-cv',         label: 'Download CV',              icon: 'download',      group: 'Actions',  action: () => { const a = document.createElement('a'); a.href = 'cv.pdf'; a.download = ''; a.click(); closePalette(); } },
    { id: 'theme-light',   label: 'Switch to Light mode',     icon: 'sun',           group: 'Actions',  action: () => { setTheme('light'); closePalette(); } },
    { id: 'theme-dark',    label: 'Switch to Dark mode',      icon: 'moon',          group: 'Actions',  action: () => { setTheme('dark');  closePalette(); } },
    { id: 'run-cfd',       label: 'Trigger CFD demo',          icon: 'play',          group: 'Actions',  action: () => { triggerCFDDemo(); closePalette(); } },
    { id: 'link-github',   label: 'Open GitHub',              icon: 'github',        group: 'Links',    action: () => { window.open('https://github.com/WaRxChaMpioN', '_blank'); closePalette(); } },
    { id: 'link-linkedin', label: 'Open LinkedIn',            icon: 'linkedin',      group: 'Links',    action: () => { window.open('https://www.linkedin.com/in/kaushal-jha892/', '_blank'); closePalette(); } },
    { id: 'link-email',    label: 'Send Email',               icon: 'send',          group: 'Links',    action: () => { window.open('mailto:kaushal_jha@mines.edu'); closePalette(); } },
    { id: 'res-lbm',       label: 'Research: ML-LBM 3D CNN', icon: 'cpu',           group: 'Research', action: () => { scrollToSection('#research'); closePalette(); } },
    { id: 'res-solar',     label: 'Research: TPMS Solar',    icon: 'sun',           group: 'Research', action: () => { scrollToSection('#research'); closePalette(); } },
    { id: 'res-pipeline',  label: 'Research: Pipeline Risk', icon: 'activity',      group: 'Research', action: () => { scrollToSection('#research'); closePalette(); } },
  ];

  let focused = -1;

  function openPalette() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    focused = -1;
    renderList('');
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function fuzzyScore(text, q) {
    if (!q) return 1;
    const hay = text.toLowerCase();
    const needle = q.toLowerCase();
    let score = 0, last = -1;
    for (const ch of needle) {
      const at = hay.indexOf(ch, last + 1);
      if (at === -1) return -1;
      score += at === last + 1 ? 4 : 1;
      if (at === 0 || hay[at - 1] === ' ' || hay[at - 1] === '-') score += 2;
      last = at;
    }
    return score - hay.length * 0.01;
  }

  function filter(q) {
    if (!q) return CMDS;
    return CMDS
      .map(cmd => ({ cmd, score: Math.max(fuzzyScore(cmd.label, q), fuzzyScore(cmd.group, q)) }))
      .filter(item => item.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.cmd);
  }

  function makeItem(cmd) {
    const el = document.createElement('div');
    el.className = 'cmd-item';
    el.setAttribute('role', 'option');
    el.dataset.id = cmd.id;
    el.tabIndex = -1;
    el.innerHTML = `<span class="cmd-item-icon"><i data-lucide="${cmd.icon}" aria-hidden="true"></i></span><span class="cmd-item-label">${cmd.label}</span><span class="cmd-item-group">${cmd.group}</span>`;
    el.addEventListener('click', () => cmd.action());
    el.addEventListener('mouseenter', () => setFocused(el));
    return el;
  }

  function renderList(q) {
    results.innerHTML = '';
    focused = -1;
    const filtered = filter(q);
    if (!q) {
      const groups = {};
      filtered.forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });
      Object.entries(groups).forEach(([g, cmds]) => {
        const hdr = document.createElement('div');
        hdr.className = 'cmd-group-label'; hdr.textContent = g;
        results.appendChild(hdr);
        cmds.forEach(c => results.appendChild(makeItem(c)));
      });
    } else {
      filtered.forEach(c => results.appendChild(makeItem(c)));
    }
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'cmd-empty';
      empty.textContent = 'No matching command.';
      results.appendChild(empty);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons({ elements: [results] });
    const first = getItems()[0];
    if (first) setFocused(first);
  }

  function getItems() { return Array.from(results.querySelectorAll('.cmd-item')); }

  function setFocused(el) {
    getItems().forEach(i => i.classList.remove('focused'));
    el.classList.add('focused');
    focused = getItems().indexOf(el);
  }

  function moveFocus(dir) {
    const items = getItems();
    if (!items.length) return;
    focused = (focused + dir + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle('focused', i === focused));
    items[focused].scrollIntoView({ block: 'nearest' });
  }

  function execute() {
    const items = getItems();
    if (focused >= 0 && focused < items.length) items[focused].click();
  }

  // Keyboard shortcut to open
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? closePalette() : openPalette();
    }
  });

  input.addEventListener('input', () => renderList(input.value.trim()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); moveFocus(-1); }
    if (e.key === 'Enter')     { e.preventDefault(); execute(); }
    if (e.key === 'Escape')    { closePalette(); }
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePalette(); });

  if (hint) hint.addEventListener('click', openPalette);

  function triggerCFDDemo() {
    scrollToSection('#projects');
    window.setTimeout(() => {
      const run = document.getElementById('cfd-run');
      if (run && !/Pause/.test(run.textContent || '')) run.click();
    }, prefersReducedMotion() ? 0 : 520);
  }
}

/* ──────────────────────────────────────────
   23. PREMIUM INTERACTION LAYER
   Pointer effects are opt-in for fine pointers and reduced-motion safe.
────────────────────────────────────────── */
function initCardTilt() {
  if (!supportsFinePointer() || prefersReducedMotion()) return;
  const cards = document.querySelectorAll('.research-card, .project-card, .blog-card');
  cards.forEach(card => {
    const update = rafThrottle((e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-y', `${px * 5}deg`);
      card.style.setProperty('--tilt-x', `${py * -4}deg`);
    });
    card.addEventListener('pointermove', update, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

function initMagneticButtons() {
  if (!supportsFinePointer() || prefersReducedMotion()) return;
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    const update = rafThrottle((e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.14;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
      btn.style.setProperty('--magnet-x', `${Math.max(-7, Math.min(7, x))}px`);
      btn.style.setProperty('--magnet-y', `${Math.max(-5, Math.min(5, y))}px`);
    });
    btn.addEventListener('pointermove', update, { passive: true });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--magnet-x', '0px');
      btn.style.setProperty('--magnet-y', '0px');
    });
  });
}

function initCustomCursor() {
  if (!supportsFinePointer() || prefersReducedMotion()) return;
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const move = rafThrottle((e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursor.classList.add('visible');
  });
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .cmd-item')) cursor.classList.add('cursor-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .cmd-item')) cursor.classList.remove('cursor-hover');
  });
}

/* ──────────────────────────────────────────
   24. INTERACTIVE CFD DEMO
   Vorticity-streamfunction solver for lid-driven cavity.
   Grid: N×N, h = 1/(N-1)
   Top wall (j=N-1) moves at U=1 (lid).
   All other walls: u=v=0 (no-slip).
────────────────────────────────────────── */
function initCFDDemo() {
  const canvas   = document.getElementById('cfd-canvas');
  if (!canvas) return;

  const ctx       = canvas.getContext('2d');
  const reSlider  = document.getElementById('cfd-re');
  const reValEl   = document.getElementById('cfd-re-val');
  const vizSelect = document.getElementById('cfd-viz');
  const runBtn    = document.getElementById('cfd-run');
  const resetBtn  = document.getElementById('cfd-reset');
  if (!reSlider || !runBtn || !resetBtn) return;

  const N       = 64;
  const h       = 1.0 / (N - 1);
  const dt      = 0.001;
  const NSTEPS  = 5;     // simulation steps per animation frame
  const GS_ITER = 50;    // Gauss-Seidel iterations per step
  const U_LID   = 1.0;

  let Re      = 100;
  let running = false;
  let animId  = null;
  let resumeAfterVisibility = false;

  // Float32Arrays — all size N*N, indexed as j*N + i (i=col/x, j=row/y)
  let psi     = new Float32Array(N * N);
  let omega   = new Float32Array(N * N);
  let u       = new Float32Array(N * N);
  let v       = new Float32Array(N * N);
  let omgTmp  = new Float32Array(N * N);

  const idx = (i, j) => j * N + i;

  function reset() { psi.fill(0); omega.fill(0); u.fill(0); v.fill(0); omgTmp.fill(0); }

  /* ── Gauss-Seidel: ∇²ψ = -ω ── */
  function solvePoisson() {
    const h2 = h * h;
    for (let iter = 0; iter < GS_ITER; iter++) {
      for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
          psi[idx(i,j)] = 0.25 * (
            psi[idx(i+1,j)] + psi[idx(i-1,j)] +
            psi[idx(i,j+1)] + psi[idx(i,j-1)] +
            h2 * omega[idx(i,j)]
          );
        }
      }
    }
    // ψ = 0 on all walls (streamlines)
  }

  /* ── u = ∂ψ/∂y, v = -∂ψ/∂x ── */
  function computeVelocity() {
    const inv2h = 1 / (2 * h);
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        u[idx(i,j)] =  (psi[idx(i,j+1)] - psi[idx(i,j-1)]) * inv2h;
        v[idx(i,j)] = -(psi[idx(i+1,j)] - psi[idx(i-1,j)]) * inv2h;
      }
    }
    // Prescribed BCs
    for (let i = 0; i < N; i++) { u[idx(i,N-1)] = U_LID; v[idx(i,N-1)] = 0; u[idx(i,0)] = 0; v[idx(i,0)] = 0; }
    for (let j = 0; j < N; j++) { u[idx(0,j)] = 0; v[idx(0,j)] = 0; u[idx(N-1,j)] = 0; v[idx(N-1,j)] = 0; }
  }

  /* ── Thom's formula: wall vorticity from ψ ── */
  function updateBoundaryVorticity() {
    const h2 = h * h;
    for (let i = 0; i < N; i++) {
      omega[idx(i,0)]   = -2 * psi[idx(i,1)]   / h2;                       // bottom
      omega[idx(i,N-1)] = -2 * psi[idx(i,N-2)] / h2 - 2 * U_LID / h;      // top lid
    }
    for (let j = 0; j < N; j++) {
      omega[idx(0,j)]   = -2 * psi[idx(1,j)]   / h2;                       // left
      omega[idx(N-1,j)] = -2 * psi[idx(N-2,j)] / h2;                       // right
    }
  }

  /* ── Explicit advection-diffusion: ω advance ── */
  function advectVorticity() {
    const nu    = 1.0 / Re;
    const inv2h = 1 / (2 * h);
    const invh2 = 1 / (h * h);
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        const k  = idx(i,j);
        const ui = u[k], vi = v[k], w = omega[k];
        const dwdx = (omega[idx(i+1,j)] - omega[idx(i-1,j)]) * inv2h;
        const dwdy = (omega[idx(i,j+1)] - omega[idx(i,j-1)]) * inv2h;
        const lapW = (omega[idx(i+1,j)] + omega[idx(i-1,j)] + omega[idx(i,j+1)] + omega[idx(i,j-1)] - 4*w) * invh2;
        omgTmp[k] = w + dt * (-ui*dwdx - vi*dwdy + nu*lapW);
      }
    }
    for (let j = 1; j < N-1; j++) for (let i = 1; i < N-1; i++) omega[idx(i,j)] = omgTmp[idx(i,j)];
  }

  function step() {
    for (let s = 0; s < NSTEPS; s++) {
      solvePoisson();
      computeVelocity();
      advectVorticity();
      updateBoundaryVorticity();
    }
  }

  /* ── Colormaps ── */
  function colVelocity(t) {
    // warm white → light green → forest green → amber → dark brown
    const stops = [[247,245,240],[168,213,181],[74,124,89],[139,105,20],[61,40,0]];
    const n = stops.length - 1, seg = Math.min(Math.floor(t*n), n-1), f = t*n - seg;
    const a = stops[seg], b = stops[seg+1];
    return [a[0]+f*(b[0]-a[0]), a[1]+f*(b[1]-a[1]), a[2]+f*(b[2]-a[2])];
  }

  function colVorticity(t) {
    // Diverging colormap: negative vorticity (t<0.5) → deep blue/indigo,
    // zero vorticity (t=0.5) → warm off-white (site background),
    // positive vorticity (t>0.5) → deep amber/ochre.
    // t is already mapped as: bw/maxO * 0.5 + 0.5,
    // so t=0 → most negative, t=0.5 → zero, t=1 → most positive.

    // 5-stop diverging palette matching site colors:
    // [deep blue,  mid blue,    neutral white,  mid amber,  deep amber]
    const stops = [
      [25,  70, 140],   // deep blue   — strong negative vorticity (CCW)
      [100, 155, 210],  // light blue  — mild negative
      [245, 243, 238],  // warm white  — zero vorticity (site --color-bg)
      [210, 160,  45],  // light amber — mild positive
      [130,  75,  10],  // deep amber  — strong positive vorticity (CW)
    ];

    const n   = stops.length - 1;          // 4 segments
    const seg = Math.min(Math.floor(t * n), n - 1);
    const f   = t * n - seg;               // fractional position within segment
    const a   = stops[seg], b = stops[seg + 1];
    return [
      a[0] + f * (b[0] - a[0]),
      a[1] + f * (b[1] - a[1]),
      a[2] + f * (b[2] - a[2]),
    ];
  }

  /* ── Bilinear interpolation helper ── */
  function bilinearSample(arr, fi, fj) {
    const i0 = Math.max(0, Math.min(N-2, Math.floor(fi)));
    const j0 = Math.max(0, Math.min(N-2, Math.floor(fj)));
    const tx = fi - i0, ty = fj - j0;
    return (
      arr[idx(i0,   j0  )] * (1-tx) * (1-ty) +
      arr[idx(i0+1, j0  )] *    tx  * (1-ty) +
      arr[idx(i0,   j0+1)] * (1-tx) *    ty  +
      arr[idx(i0+1, j0+1)] *    tx  *    ty
    );
  }

  /* ── Render to canvas ── */
  function render() {
    const dpr  = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
    if (canvas.width  !== Math.round(cssW * dpr) ||
        canvas.height !== Math.round(cssH * dpr)) {
      canvas.width  = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    const W = canvas.width, H = canvas.height;
    const viz = vizSelect ? vizSelect.value : 'velocity';
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    let maxV = 0, minP = Infinity, maxP = -Infinity, maxO = 0;
    for (let k = 0; k < N*N; k++) {
      const spd = Math.sqrt(u[k]*u[k]+v[k]*v[k]);
      if (spd > maxV) maxV = spd;
      if (Math.abs(omega[k]) > maxO) maxO = Math.abs(omega[k]);
      if (psi[k] > maxP) maxP = psi[k];
      if (psi[k] < minP) minP = psi[k];
    }
    if (maxV < 1e-10) maxV = 1e-10;
    if (maxO < 1e-10) maxO = 1e-10;
    if (maxP - minP < 1e-10) maxP = minP + 1e-10;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        // Map pixel → float grid coords; y-flip (j=0 is bottom wall)
        const fi = (px / (W - 1)) * (N - 1);
        const fj = (1 - py / (H - 1)) * (N - 1);
        let r, g, b;

        if (viz === 'velocity') {
          const bu = bilinearSample(u, fi, fj);
          const bv = bilinearSample(v, fi, fj);
          const spd = Math.sqrt(bu*bu + bv*bv);
          [r,g,b] = colVelocity(Math.min(spd / maxV, 1));
        } else if (viz === 'vorticity') {
          const bw = bilinearSample(omega, fi, fj);
          [r,g,b] = colVorticity(bw / maxO * 0.5 + 0.5);
        } else {
          // Smooth sine-band streamlines
          const bp   = bilinearSample(psi, fi, fj);
          const t    = (bp - minP) / (maxP - minP);
          const band = Math.sin(t * Math.PI * 14) * 0.5 + 0.5;
          const a = [74,124,89], c = [168,213,181];
          r = a[0] + band*(c[0]-a[0]);
          g = a[1] + band*(c[1]-a[1]);
          b = a[2] + band*(c[2]-a[2]);
        }

        const p = (py*W + px)*4;
        data[p]   = r; data[p+1] = g; data[p+2] = b; data[p+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    drawVelocityArrows(W, H, maxV);
  }

  /* ── Velocity arrow overlay ── */
  function drawVelocityArrows(W, H, maxV) {
    const COLS = 12, ROWS = 12;
    const cw = W / COLS, ch = H / ROWS;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.72)';
    ctx.lineWidth = Math.max(1, W / 300);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const px = (col + 0.5) * cw;
        const py = (row + 0.5) * ch;
        const fi = (px / (W - 1)) * (N - 1);
        const fj = (1 - py / (H - 1)) * (N - 1);
        const bu  = bilinearSample(u, fi, fj);
        const bv  = bilinearSample(v, fi, fj);
        const spd = Math.sqrt(bu*bu + bv*bv);
        if (spd < 1e-6) continue;
        const scale = Math.min(spd / maxV, 1) * cw * 0.45;
        const dx =  bu / spd * scale;
        const dy = -bv / spd * scale;   // flip y for screen coords
        const ex = px + dx, ey = py + dy;
        // Arrow shaft
        ctx.beginPath();
        ctx.moveTo(px - dx*0.5, py - dy*0.5);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        // Arrowhead
        const hLen = scale * 0.35;
        const ang  = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hLen*Math.cos(ang - 0.45), ey - hLen*Math.sin(ang - 0.45));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hLen*Math.cos(ang + 0.45), ey - hLen*Math.sin(ang + 0.45));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ── Animation loop ── */
  function loop() {
    if (running) { step(); render(); }
    animId = requestAnimationFrame(loop);
  }
  function startLoop() { if (!animId) animId = requestAnimationFrame(loop); }
  function stopLoop()  { if (animId) { cancelAnimationFrame(animId); animId = null; } }

  /* ── Controls ── */
  runBtn.addEventListener('click', () => {
    running = !running;
    runBtn.textContent = running ? '⏸ Pause' : '▶ Run';
    if (running && !animId) startLoop();
  });

  resetBtn.addEventListener('click', () => {
    running = false; runBtn.textContent = '▶ Run';
    stopLoop(); reset(); render();
  });

  reSlider.addEventListener('input', () => {
    Re = parseInt(reSlider.value);
    if (reValEl) reValEl.textContent = Re;
    reset(); render();
  });

  if (vizSelect) vizSelect.addEventListener('change', render);

  /* ── Pause when off-screen ── */
  const demoEl = document.querySelector('.cfd-demo');
  if (demoEl && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { stopLoop(); }
      else if (running) { startLoop(); }
    }, { threshold: 0 });
    obs.observe(demoEl);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeAfterVisibility = running;
      stopLoop();
    } else if (resumeAfterVisibility && running) {
      startLoop();
    }
  });

  /* ── Re-render on resize (DPR-aware) ── */
  const resizeObs = new ResizeObserver(() => render());
  resizeObs.observe(canvas);

  /* ── Init ── */
  reset();
  render();
}
