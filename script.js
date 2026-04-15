/* ══════════════════════════════════════════════════════
   script.js — Kaushal Jha Portfolio
   Pure vanilla JS. No frameworks, no build tools.
   GitHub Pages compatible.

   Modules:
     1. Lucide icon initialization
     2. Scroll progress bar
     3. Navbar — transparent → warm white on scroll
     4. Hamburger menu (mobile)
     5. Typing / typewriter animation (hero)
     6. Fade-in on scroll (IntersectionObserver)
     7. Active nav link highlighting (IntersectionObserver)
     8. Smooth scroll with navbar offset
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
  updateBar(); // initialize on load
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
  onScroll(); // run on load in case page is already scrolled
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

  // Close when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('mobile-open')
        && !navLinks.contains(e.target)
        && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
}

/* ──────────────────────────────────────────
   4. TYPING / TYPEWRITER ANIMATION
   Cycles through 4 phrases with type → pause → delete rhythm.
   Targets #typed-text span; cursor is a separate .cursor span.
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

  // Speeds (ms)
  const SPEED_TYPE   = 85;
  const SPEED_DELETE = 48;
  const PAUSE_END    = 1900;  // pause at full phrase
  const PAUSE_START  = 360;   // pause before next phrase

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

    // Finished typing full phrase — start pause then delete
    if (!isDeleting && charIdx === phrase.length) {
      delay      = PAUSE_END;
      isDeleting = true;

    // Finished deleting — move to next phrase
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      delay      = PAUSE_START;
    }

    timeoutId = setTimeout(tick, delay);
  }

  // Small initial delay so fonts load first
  timeoutId = setTimeout(tick, 700);

  // Clean up if the element is ever removed
  // (defensive — not strictly needed for a single-page site)
  return () => clearTimeout(timeoutId);
}

/* ──────────────────────────────────────────
   5. FADE-IN ON SCROLL
   Uses IntersectionObserver to add .visible
   to any element with .fade-in-section
   once it enters the viewport.
   Falls back to immediate visibility if IO not supported.
────────────────────────────────────────── */
function initFadeInSections() {
  const sections = document.querySelectorAll('.fade-in-section');

  if (!('IntersectionObserver' in window)) {
    // Graceful fallback for older browsers
    sections.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after first animation — fire once only
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
   Watches each <section id="..."> with IntersectionObserver.
   The most recently intersected section drives the active
   nav link highlight (green underline).
────────────────────────────────────────── */
function initActiveNavLinks() {
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navLinks  = document.querySelectorAll('.nav-link');

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  // Track which sections are currently intersecting
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

      // Activate nav link whose section appears earliest in DOM order
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
      // Top margin accounts for fixed navbar; bottom margin keeps
      // the active link accurate as sections enter from below.
      rootMargin: `-${64}px 0px -35% 0px`,
      threshold:  0,
    }
  );

  sections.forEach(section => observer.observe(section));
}

/* ──────────────────────────────────────────
   7. SMOOTH SCROLL WITH NAVBAR OFFSET
   CSS scroll-behavior:smooth handles most cases,
   but we need a JS offset to account for the
   fixed 64px navbar so sections aren't hidden behind it.
────────────────────────────────────────── */
function initSmoothScroll() {
  const NAV_HEIGHT = 64; // keep in sync with --nav-h in style.css

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
