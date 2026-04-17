/* ══════════════════════════════════════════════════════
   script.js — Kaushal Jha Portfolio
   Pure vanilla JS. No frameworks, no build tools.
   GitHub Pages compatible.

   Modules:
     1.  Lucide icon initialization
     2.  Scroll progress bar
     3.  Navbar — transparent → warm white on scroll
     4.  Hamburger menu (mobile)
     5.  Typing / typewriter animation (hero)
     6.  Fade-in on scroll (IntersectionObserver)
     7.  Active nav link highlighting (IntersectionObserver)
     8.  Smooth scroll with navbar offset
     9.  Hero canvas — animated particle network
     10. Dark mode theme toggle
     11. Expandable research card details
     12. Animated skill progress bars
     13. Blog category filter
     14. Contact form — validation + Formspree
     15. Back-to-top button
     16. Stats counter animation
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Lucide icons must be initialized before everything else
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initScrollProgress();
  initNavbar();
  initHamburger();
  initTypingAnimation();
  initFadeInSections();
  initActiveNavLinks();
  initSmoothScroll();
  initHeroCanvas();
  initThemeToggle();
  initExpandableCards();
  initSkillBars();
  initBlogFilter();
  initContactForm();
  initBackToTop();
  initStatsCounter();
});

/* ──────────────────────────────────────────
   1. SCROLL PROGRESS BAR
   Thin forest-green bar at top of page
   grows from 0 → 100% as user scrolls.
────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function updateBar() {
    const scrollTop  = window.scrollY || document.documentElement.scrollTop;
    const docHeight  = document.documentElement.scrollHeight
                     - document.documentElement.clientHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct.toFixed(2) + '%';
  }

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
}

/* ──────────────────────────────────────────
   2. NAVBAR — transparent over hero,
   warm white + shadow once scrolled past 60px.
────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ──────────────────────────────────────────
   3. HAMBURGER MENU
   Toggles .mobile-open on nav-links list.
   Also prevents body scroll while menu is open.
────────────────────────────────────────── */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('mobile-open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('mobile-open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.contains('mobile-open');
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('mobile-open')
        && !navLinks.contains(e.target)
        && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
}

/* ──────────────────────────────────────────
   4. TYPING / TYPEWRITER ANIMATION
   Cycles through phrases with type → pause → delete rhythm.
────────────────────────────────────────── */
function initTypingAnimation() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'I simulate fluids.',
    'I train neural networks.',
    'I climb mountains.',
    'I build things.',
  ];

  let phraseIdx   = 0;
  let charIdx     = 0;
  let isDeleting  = false;
  let timeoutId   = null;

  const SPEED_TYPE   = 85;
  const SPEED_DELETE = 48;
  const PAUSE_END    = 1900;
  const PAUSE_START  = 360;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
      el.textContent = phrase.substring(0, charIdx);
    } else {
      charIdx++;
      el.textContent = phrase.substring(0, charIdx);
    }

    let delay = isDeleting ? SPEED_DELETE : SPEED_TYPE;

    if (!isDeleting && charIdx === phrase.length) {
      delay      = PAUSE_END;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      delay      = PAUSE_START;
    }

    timeoutId = setTimeout(tick, delay);
  }

  timeoutId = setTimeout(tick, 700);
  return () => clearTimeout(timeoutId);
}

/* ──────────────────────────────────────────
   5. FADE-IN ON SCROLL
────────────────────────────────────────── */
function initFadeInSections() {
  const sections = document.querySelectorAll('.fade-in-section');

  if (!('IntersectionObserver' in window)) {
    sections.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:   0.12,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  sections.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────
   6. ACTIVE NAV LINK
────────────────────────────────────────── */
function initActiveNavLinks() {
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navLinks  = document.querySelectorAll('.nav-link');

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const intersecting = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          intersecting.add(entry.target.id);
        } else {
          intersecting.delete(entry.target.id);
        }
      });

      let activeId = null;
      for (const section of sections) {
        if (intersecting.has(section.id)) {
          activeId = section.id;
          break;
        }
      }

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${activeId}`);
      });
    },
    {
      rootMargin: `-${64}px 0px -35% 0px`,
      threshold:  0,
    }
  );

  sections.forEach(section => observer.observe(section));
}

/* ──────────────────────────────────────────
   7. SMOOTH SCROLL WITH NAVBAR OFFSET
────────────────────────────────────────── */
function initSmoothScroll() {
  const NAV_HEIGHT = 64;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top
                      + window.scrollY
                      - NAV_HEIGHT;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ──────────────────────────────────────────
   9. HERO CANVAS — PARTICLE NETWORK
   80 dots connected by lines when < 120px apart.
   Dots bounce off edges; mouse slightly repels them.
   Pauses when hero is not visible (IntersectionObserver).
────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animId, paused = false;

  const PARTICLE_COUNT = 80;
  const CONNECT_DIST   = 120;
  const REPEL_DIST     = 90;
  const REPEL_FORCE    = 1.2;
  const SPEED          = 0.45;

  let mouse = { x: -999, y: -999 };
  let particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = SPEED * (0.5 + Math.random());
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  1.5 + Math.random() * 1.5,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, mkParticle);
  }

  function getColor() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return dark ? '95, 163, 115' : '74, 124, 89';
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const col = getColor();

    // Update positions
    particles.forEach(p => {
      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_DIST && dist > 0) {
        const force = (REPEL_DIST - dist) / REPEL_DIST * REPEL_FORCE;
        p.vx += (dx / dist) * force * 0.08;
        p.vy += (dy / dist) * force * 0.08;
      }

      // Speed cap
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxSpd = SPEED * 3;
      if (spd > maxSpd) {
        p.vx = (p.vx / spd) * maxSpd;
        p.vy = (p.vy / spd) * maxSpd;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Edge bounce
      if (p.x < p.r)     { p.x = p.r;     p.vx *= -1; }
      if (p.x > W - p.r) { p.x = W - p.r; p.vx *= -1; }
      if (p.y < p.r)     { p.y = p.r;     p.vy *= -1; }
      if (p.y > H - p.r) { p.y = H - p.r; p.vy *= -1; }
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${col}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col}, 0.65)`;
      ctx.fill();
    });
  }

  function loop() {
    if (!paused) draw();
    animId = requestAnimationFrame(loop);
  }

  // Pause when hero is scrolled out of view
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      ([entry]) => { paused = !entry.isIntersecting; },
      { threshold: 0 }
    );
    obs.observe(hero);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -999;
    mouse.y = -999;
  });

  window.addEventListener('resize', () => {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, mkParticle);
  });

  init();
  loop();
}

/* ──────────────────────────────────────────
   10. DARK MODE THEME TOGGLE
   Reads/writes localStorage key 'kj-theme'.
   Swaps icon between moon and sun via Lucide.
────────────────────────────────────────── */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function setIcon(dark) {
    btn.innerHTML = dark
      ? '<i data-lucide="sun" aria-hidden="true"></i>'
      : '<i data-lucide="moon" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setIcon(dark);
    try { localStorage.setItem('kj-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  btn.addEventListener('click', () => applyTheme(!isDark()));

  // Sync icon with whatever the inline script already set
  setIcon(isDark());
}

/* ──────────────────────────────────────────
   11. EXPANDABLE RESEARCH CARD DETAILS
   One card open at a time (accordion).
   Toggles max-height via .expanded class.
────────────────────────────────────────── */
function initExpandableCards() {
  const btns = document.querySelectorAll('.card-expand-btn');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      const details  = document.getElementById(targetId);
      if (!details) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others first
      btns.forEach(b => {
        if (b !== btn) {
          const id = b.getAttribute('aria-controls');
          const d  = document.getElementById(id);
          if (d) {
            d.classList.remove('expanded');
            d.setAttribute('aria-hidden', 'true');
          }
          b.setAttribute('aria-expanded', 'false');
          b.querySelector('span').textContent = 'Show details';
        }
      });

      // Toggle this one
      if (isOpen) {
        details.classList.remove('expanded');
        details.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.querySelector('span').textContent = 'Show details';
      } else {
        details.classList.add('expanded');
        details.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        btn.querySelector('span').textContent = 'Hide details';
      }
    });
  });
}

/* ──────────────────────────────────────────
   12. ANIMATED SKILL PROGRESS BARS
   Builds HTML inside each .skill-bar div,
   then animates fill width on IntersectionObserver trigger.
   Uses easeOutCubic over 900ms with 100ms stagger.
────────────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar[data-skill]');
  if (!bars.length) return;

  // Build inner HTML for each bar
  bars.forEach((bar, i) => {
    const skill = bar.dataset.skill;
    const pct   = parseInt(bar.dataset.pct, 10) || 0;
    bar.innerHTML = `
      <div class="skill-bar-header">
        <span class="skill-bar-label">${skill}</span>
        <span class="skill-bar-pct">${pct}%</span>
      </div>
      <div class="skill-bar-track">
        <div class="skill-bar-fill" data-target-pct="${pct}" style="width:0%"></div>
      </div>
    `;
  });

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateFill(fill, targetPct, delay) {
    setTimeout(() => {
      const duration = 900;
      const start    = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = easeOutCubic(progress);
        fill.style.width = (eased * targetPct).toFixed(2) + '%';
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }, delay);
  }

  if (!('IntersectionObserver' in window)) {
    bars.forEach((bar, i) => {
      const fill = bar.querySelector('.skill-bar-fill');
      if (fill) animateFill(fill, parseInt(fill.dataset.targetPct, 10), i * 100);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const container = entry.target;
        const fills = container.querySelectorAll('.skill-bar-fill');
        fills.forEach((fill, i) => {
          animateFill(fill, parseInt(fill.dataset.targetPct, 10), i * 100);
        });
        observer.unobserve(container);
      });
    },
    { threshold: 0.15 }
  );

  // Observe the parent .skills-bars container if present,
  // else observe each bar individually
  const wrapper = document.querySelector('.skills-bars');
  if (wrapper) {
    observer.observe(wrapper);
  } else {
    bars.forEach(bar => observer.observe(bar));
  }
}

/* ──────────────────────────────────────────
   13. BLOG CATEGORY FILTER
   Filter buttons toggle .filtered-out on blog cards
   using opacity (no layout reflow).
────────────────────────────────────────── */
function initBlogFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const blogCards  = document.querySelectorAll('.blog-card[data-category]');
  if (!filterBtns.length || !blogCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show / hide cards
      blogCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('filtered-out', !match);
      });
    });
  });
}

/* ──────────────────────────────────────────
   14. CONTACT FORM — VALIDATION + FORMSPREE
   Validates name, email, message.
   Shows inline field errors, spinner on submit,
   and success/error banners after fetch.
────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Formspree endpoint — replace YOUR_ID with actual form ID
  const ENDPOINT = 'https://formspree.io/f/xdkogvqb';

  const nameInput    = form.querySelector('#name');
  const emailInput   = form.querySelector('#email');
  const msgInput     = form.querySelector('#message');
  const submitBtn    = form.querySelector('button[type="submit"]');
  const spinner      = form.querySelector('.spinner');
  const successBanner = form.querySelector('.form-success');
  const errorBanner   = form.querySelector('.form-error-msg');

  function getError(id) { return form.querySelector(`#err-${id}`); }

  function showError(input, errEl, msg) {
    input.classList.add('invalid');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(input, errEl) {
    input.classList.remove('invalid');
    if (errEl) errEl.textContent = '';
  }

  function validate() {
    let valid = true;

    const nameErr  = getError('name');
    const emailErr = getError('email');
    const msgErr   = getError('message');

    if (!nameInput || nameInput.value.trim().length < 2) {
      if (nameInput) showError(nameInput, nameErr, 'Please enter your name.');
      valid = false;
    } else {
      if (nameInput) clearError(nameInput, nameErr);
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailRe.test(emailInput.value.trim())) {
      if (emailInput) showError(emailInput, emailErr, 'Please enter a valid email address.');
      valid = false;
    } else {
      if (emailInput) clearError(emailInput, emailErr);
    }

    if (!msgInput || msgInput.value.trim().length < 10) {
      if (msgInput) showError(msgInput, msgErr, 'Message must be at least 10 characters.');
      valid = false;
    } else {
      if (msgInput) clearError(msgInput, msgErr);
    }

    return valid;
  }

  // Live validation on blur
  [nameInput, emailInput, msgInput].forEach(input => {
    if (!input) return;
    input.addEventListener('blur', validate);
    input.addEventListener('input', () => {
      const errEl = getError(input.id);
      clearError(input, errEl);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Show spinner
    if (submitBtn) submitBtn.disabled = true;
    if (spinner)   spinner.classList.add('visible');
    if (successBanner) successBanner.classList.remove('visible');
    if (errorBanner)   errorBanner.classList.remove('visible');

    try {
      const res = await fetch(ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name:    nameInput ? nameInput.value.trim() : '',
          email:   emailInput ? emailInput.value.trim() : '',
          message: msgInput ? msgInput.value.trim() : '',
        }),
      });

      if (res.ok) {
        form.reset();
        if (successBanner) successBanner.classList.add('visible');
      } else {
        throw new Error('Server error');
      }
    } catch {
      if (errorBanner) errorBanner.classList.add('visible');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner)   spinner.classList.remove('visible');
    }
  });
}

/* ──────────────────────────────────────────
   15. BACK TO TOP BUTTON
   Appears after scrolling 400px. Smooth scrolls to top on click.
────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────
   16. STATS COUNTER ANIMATION
   Counts up from 0 to data-target over 1800ms
   using easeOutCubic. Supports decimals via data-decimals.
   Triggered once by IntersectionObserver.
────────────────────────────────────────── */
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target)  || 0;
    const suffix   = el.dataset.suffix              || '';
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = easeOutCubic(progress) * target;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const strip = document.querySelector('.stats-strip');
  if (!strip) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      counters.forEach(animateCounter);
      observer.unobserve(strip);
    },
    { threshold: 0.4 }
  );

  observer.observe(strip);
}
