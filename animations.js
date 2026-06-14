/* ====================================================
   CustomVibe — Animations & Interactivity
   ==================================================== */

/* ---------- CURSOR SPARKLES ---------- */
(function initSparkles() {
  const colors = ['#FF6B9D','#FFD93D','#4ECDC4','#A855F7','#FF6B35','#06D6A0'];
  let sparkleCount = 0;

  document.addEventListener('mousemove', e => {
    if (sparkleCount++ % 3 !== 0) return; // throttle
    const el = document.createElement('span');
    el.className = 'cursor-sparkle';
    const size = Math.random() * 14 + 6;
    el.style.cssText = `
      position:fixed;
      pointer-events:none;
      z-index:9999;
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${e.clientX - size/2}px;
      top:${e.clientY - size/2}px;
      transform:scale(1);
      opacity:1;
      transition:transform 0.6s ease, opacity 0.6s ease;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `scale(0) translate(${(Math.random()-0.5)*40}px, ${(Math.random()-0.5)*40}px)`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 650);
  });
})();


/* ---------- NAV SHRINK ON SCROLL ---------- */
(function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.padding = '10px 48px';
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
    } else {
      nav.style.padding = '';
      nav.style.boxShadow = '';
    }
  }, { passive: true });
})();


/* ---------- SCROLL REVEAL ---------- */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(36px);
      transition: opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1);
    }
    .reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-left {
      opacity: 0;
      transform: translateX(-40px);
      transition: opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1);
    }
    .reveal-left.revealed { opacity: 1; transform: translateX(0); }
    .reveal-right {
      opacity: 0;
      transform: translateX(40px);
      transition: opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1);
    }
    .reveal-right.revealed { opacity: 1; transform: translateX(0); }
  `;
  document.head.appendChild(style);

  // Tag elements
  const selectors = [
    { sel: '.step',         cls: 'reveal',       delay: (i) => i * 120 },
    { sel: '.feature-card', cls: 'reveal',       delay: (i) => i * 100 },
    { sel: '.hero-content', cls: 'reveal-left',  delay: () => 0 },
    { sel: '.hero-visual',  cls: 'reveal-right', delay: () => 0 },
    { sel: '.section-title',cls: 'reveal',       delay: () => 0 },
    { sel: '.cta-banner h2',cls: 'reveal',       delay: () => 0 },
    { sel: '.cta-banner p', cls: 'reveal',       delay: () => 100 },
    { sel: '.cta-banner .btn-white', cls: 'reveal', delay: () => 200 },
    { sel: '.stat-card',    cls: 'reveal',       delay: (i) => i * 100 },
  ];

  selectors.forEach(({ sel, cls, delay }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add(cls);
      el.style.transitionDelay = delay(i) + 'ms';
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el));
})();


/* ---------- TYPEWRITER (hero subtitle) ---------- */
(function initTypewriter() {
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  const original = el.textContent.trim();
  el.textContent = '';
  el.style.borderRight = '3px solid var(--purple)';
  el.style.display = 'inline-block';

  let i = 0;
  const tick = () => {
    if (i <= original.length) {
      el.textContent = original.slice(0, i++);
      setTimeout(tick, i < original.length ? 28 : 600);
    } else {
      // blink then remove cursor
      let blinks = 0;
      const blink = setInterval(() => {
        el.style.borderRight = blinks % 2 === 0 ? 'none' : '3px solid var(--purple)';
        if (++blinks >= 6) { clearInterval(blink); el.style.borderRight = 'none'; }
      }, 400);
    }
  };

  // Start after a short delay so page loads first
  setTimeout(tick, 600);
})();


/* ---------- PARALLAX HERO ---------- */
(function initParallax() {
  const grid = document.querySelector('.magnet-grid');
  const heroContent = document.querySelector('.hero-content');
  if (!grid) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    grid.style.transform = `translateY(${y * 0.18}px)`;
    if (heroContent) heroContent.style.transform = `translateY(${y * 0.08}px)`;
  }, { passive: true });
})();


/* ---------- ANIMATED STAT COUNTERS ---------- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // ease out
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();


/* ---------- CONFETTI ON QUOTE SUBMIT ---------- */
(function initConfetti() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    // Wait a tick so the success message check runs first
    setTimeout(launchConfetti, 50);
  });

  function launchConfetti() {
    const colors = ['#FF6B9D','#FFD93D','#4ECDC4','#A855F7','#FF6B35','#06D6A0','#fff'];
    for (let i = 0; i < 120; i++) {
      setTimeout(() => spawnPiece(colors), Math.random() * 800);
    }
  }

  function spawnPiece(colors) {
    const el = document.createElement('div');
    const size = Math.random() * 10 + 6;
    const startX = Math.random() * window.innerWidth;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = Math.random() * 360;
    const shape = Math.random() > 0.5 ? '50%' : '2px';

    el.style.cssText = `
      position:fixed;
      pointer-events:none;
      z-index:9999;
      width:${size}px;
      height:${size * (Math.random() * 1.5 + 0.5)}px;
      background:${color};
      border-radius:${shape};
      left:${startX}px;
      top:-20px;
      transform:rotate(${rotation}deg);
    `;
    document.body.appendChild(el);

    const duration = Math.random() * 1800 + 1000;
    const drift = (Math.random() - 0.5) * 200;
    const keyframes = [
      { top: '-20px',  transform: `rotate(${rotation}deg)`,        opacity: 1 },
      { top: '110vh', transform: `rotate(${rotation + 720}deg) translateX(${drift}px)`, opacity: 0.2 },
    ];
    const anim = el.animate(keyframes, { duration, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards' });
    anim.onfinish = () => el.remove();
  }
})();


/* ---------- MAGNET TILE CLICK RIPPLE ---------- */
(function initMagnetRipple() {
  document.querySelectorAll('.magnet-tile').forEach(tile => {
    tile.style.cursor = 'pointer';
    tile.style.overflow = 'hidden';
    tile.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(255,255,255,0.5);
        width:${size}px;
        height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        transform:scale(0);
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.appendChild(ripple);
      ripple.animate([
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(1)', opacity: 0 }
      ], { duration: 500, easing: 'ease-out', fill: 'forwards' }).onfinish = () => ripple.remove();
    });
  });
})();
