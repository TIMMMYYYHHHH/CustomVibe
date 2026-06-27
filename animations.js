/* CustomVibe — Animations */

/* Nav shadow on scroll */
(function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 60 ? '0 4px 20px rgba(0,0,0,0.06)' : '';
  }, { passive: true });
})();

/* Scroll reveal */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity:0; transform:translateY(24px); transition:opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1); }
    .reveal.revealed { opacity:1; transform:translateY(0); }
  `;
  document.head.appendChild(style);

  const selectors = ['.step-item', '.price-card', '.feature-card', '.section-eyebrow', '.section-title', '.section-sub'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 70) + 'ms';
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* Confetti (used on quote submit) */
function launchConfetti() {
  const colors = ['#FF6B6B','#4ECDC4','#FFE66D','#C3A6FF','#1A1A2E'];
  for (let i = 0; i < 100; i++) {
    setTimeout(() => spawnConfettiPiece(colors), Math.random() * 600);
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
