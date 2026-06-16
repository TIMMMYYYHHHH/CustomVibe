/* ====================================================
   CustomVibe — Animations & Interactivity
   ==================================================== */

/* ---------- CURSOR SPARKLES ---------- */
(function initSparkles() {
  const colors = ['#7C3AED','#A855F7','#EC4899','#F97316','#FBBF24'];
  let count = 0;
  document.addEventListener('mousemove', e => {
    if (count++ % 3 !== 0) return;
    const el = document.createElement('span');
    const size = Math.random() * 12 + 5;
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:${size}px; height:${size}px; border-radius:50%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${e.clientX - size/2}px; top:${e.clientY - size/2}px;
      box-shadow:0 0 8px currentColor;
      transition:transform 0.6s ease, opacity 0.6s ease;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `scale(0) translate(${(Math.random()-0.5)*36}px, ${(Math.random()-0.5)*36}px)`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 650);
  });
})();

/* ---------- NAV SHRINK ---------- */
(function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.padding = window.scrollY > 60 ? '12px 48px' : '';
    nav.style.boxShadow = window.scrollY > 60 ? '0 8px 30px rgba(0,0,0,0.4)' : '';
  }, { passive: true });
})();

/* ---------- SCROLL REVEAL ---------- */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity:0; transform:translateY(32px); transition:opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1); }
    .reveal.revealed { opacity:1; transform:translateY(0); }
  `;
  document.head.appendChild(style);

  const selectors = ['.step-card', '.price-card', '.feature-card', '.section-label', '.section-title', '.section-sub'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 80) + 'ms';
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---------- CONFETTI ---------- */
function launchConfetti() {
  const colors = ['#7C3AED','#A855F7','#EC4899','#F97316','#FBBF24','#fff'];
  for (let i = 0; i < 120; i++) {
    setTimeout(() => spawnConfettiPiece(colors), Math.random() * 700);
  }
}

function spawnConfettiPiece(colors) {
  const el = document.createElement('div');
  const size = Math.random() * 10 + 6;
  const startX = Math.random() * window.innerWidth;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const rotation = Math.random() * 360;
  const shape = Math.random() > 0.5 ? '50%' : '2px';
  el.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    width:${size}px; height:${size * (Math.random()*1.5+0.5)}px;
    background:${color}; border-radius:${shape};
    left:${startX}px; top:-20px; transform:rotate(${rotation}deg);
  `;
  document.body.appendChild(el);
  const duration = Math.random() * 1800 + 1000;
  const drift = (Math.random() - 0.5) * 200;
  const anim = el.animate([
    { top: '-20px', transform: `rotate(${rotation}deg)`, opacity: 1 },
    { top: '110vh', transform: `rotate(${rotation+720}deg) translateX(${drift}px)`, opacity: 0.2 },
  ], { duration, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards' });
  anim.onfinish = () => el.remove();
}
