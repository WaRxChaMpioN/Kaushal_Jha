/* ══════════════════════════════════════════════════════
   script.js — Kaushal Jha Portfolio
   Pure vanilla JS. No frameworks, no build tools.
   GitHub Pages compatible.

   Modules:
     1.  Lucide icon initialization
     2.  Scroll progress bar
     3.  Navbar scroll behavior
     4.  Hamburger menu (mobile)
     5.  Typing animation (hero)
     6.  Fade-in on scroll
     7.  Active nav link tracking
     8.  Smooth scroll with navbar offset
     9.  Dark mode theme toggle
     10. Expandable research card details
     11. Animated skill progress bars
     12. Blog category filter
     13. Contact form — validation + Formspree
     14. Back-to-top button
     15. Stats counter animation
     16. Command palette (Cmd+K)
     17. Interactive CFD demo (lid-driven cavity)
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
  window.scrollTo({ top, behavior: 'smooth' });
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
  initSmoothScroll();
  initThemeToggle();
  initExpandableCards();
  initSkillBars();
  initBlogFilter();
  initContactForm();
  initBackToTop();
  initStatsCounter();
  initCommandPalette();
  initCFDDemo();
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
  const phrases = ['I simulate fluids.', 'I train neural networks.', 'I climb mountains.', 'I build things.'];
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
  const els = document.querySelectorAll('.fade-in-section');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
  const obs = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );
  els.forEach(el => obs.observe(el));
}

/* ──────────────────────────────────────────
   6. ACTIVE NAV LINK
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
      for (const s of sections) { if (active.has(s.id)) { id = s.id; break; } }
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    },
    { rootMargin: '-64px 0px -35% 0px', threshold: 0 }
  );
  sections.forEach(s => obs.observe(s));
}

/* ──────────────────────────────────────────
   7. SMOOTH SCROLL
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
   8. DARK MODE TOGGLE
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
   9. EXPANDABLE RESEARCH CARDS
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
          b.querySelector('span').textContent = 'Show details';
        }
      });
      // Toggle this one
      details.classList.toggle('expanded', !isOpen);
      details.setAttribute('aria-hidden', String(isOpen));
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.querySelector('span').textContent = isOpen ? 'Show details' : 'Hide details';
    });
  });
}

/* ──────────────────────────────────────────
   10. SKILL BARS
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
   11. BLOG FILTER
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
   12. CONTACT FORM
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
   13. BACK TO TOP
────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ──────────────────────────────────────────
   14. STATS COUNTER
────────────────────────────────────────── */
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function run(el) {
    const target = parseFloat(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    const dec    = parseInt(el.dataset.decimals, 10) || 0;
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
   15. COMMAND PALETTE (Cmd+K / Ctrl+K)
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
    { id: 'nav-projects',  label: 'Go to Projects',           icon: 'code-2',        group: 'Navigate', action: () => { scrollToSection('#projects'); closePalette(); } },
    { id: 'nav-blog',      label: 'Go to Writing',            icon: 'pen-line',      group: 'Navigate', action: () => { scrollToSection('#blog');     closePalette(); } },
    { id: 'nav-cv',        label: 'Go to CV',                 icon: 'file-text',     group: 'Navigate', action: () => { scrollToSection('#cv');       closePalette(); } },
    { id: 'nav-contact',   label: 'Go to Contact',            icon: 'mail',          group: 'Navigate', action: () => { scrollToSection('#contact');  closePalette(); } },
    { id: 'dl-cv',         label: 'Download CV',              icon: 'download',      group: 'Actions',  action: () => { const a = document.createElement('a'); a.href = 'cv.pdf'; a.download = ''; a.click(); closePalette(); } },
    { id: 'theme-light',   label: 'Switch to Light mode',     icon: 'sun',           group: 'Actions',  action: () => { setTheme('light'); closePalette(); } },
    { id: 'theme-dark',    label: 'Switch to Dark mode',      icon: 'moon',          group: 'Actions',  action: () => { setTheme('dark');  closePalette(); } },
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

  function filter(q) {
    if (!q) return CMDS;
    const lq = q.toLowerCase();
    return CMDS.filter(c => c.label.toLowerCase().includes(lq) || c.group.toLowerCase().includes(lq));
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
    if (typeof lucide !== 'undefined') lucide.createIcons({ elements: [results] });
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
}

/* ──────────────────────────────────────────
   16. INTERACTIVE CFD DEMO
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
    // blue → white → red (diverging)
    if (t < 0.5) {
      const f = t * 2;
      return [26+f*(255-26), 74+f*(255-74), 138+f*(255-138)];
    }
    const f = (t-0.5)*2;
    return [255, 255+f*(32-255), 255+f*(32-255)];
  }

  /* ── Render to canvas ── */
  function render() {
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
        const i  = Math.min(Math.floor(px / W * N), N-1);
        const j  = Math.min(N-1 - Math.floor(py / H * N), N-1);  // flip y: j=0 is bottom
        const k  = idx(Math.max(0,i), Math.max(0,j));
        let r, g, b;

        if (viz === 'velocity') {
          const spd = Math.sqrt(u[k]*u[k]+v[k]*v[k]);
          [r,g,b] = colVelocity(Math.min(spd/maxV, 1));
        } else if (viz === 'vorticity') {
          [r,g,b] = colVorticity((omega[k]/maxO * 0.5 + 0.5));
        } else {
          // Streamlines: alternating bands of ψ
          const t = (psi[k] - minP) / (maxP - minP);
          const band = Math.floor(t * 14);
          [r,g,b] = band % 2 === 0 ? [74,124,89] : [168,213,181];
        }

        const p = (py*W + px)*4;
        data[p]   = r; data[p+1] = g; data[p+2] = b; data[p+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
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

  /* ── Init ── */
  reset();
  render();
}
