// effects.js - 3D tilt, text reveal, and parallax effects
// All effects respect prefers-reduced-motion and are disabled on touch devices.

/**
 * Hero 3D perspective tilt - content subtly rotates toward the cursor.
 * Desktop only, non-touch only.
 */
export function initHeroTilt() {
  return;
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 1024) return;

  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero__content');
  if (!hero || !heroContent) return;

  hero.style.perspective = '1000px';

  hero.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('before-mode')) return;

    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 3;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 2;

    gsap.to(heroContent, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.6,
      ease: 'power2.out',
      transformPerspective: 1000
    });
  });

  hero.addEventListener('mouseleave', () => {
    gsap.to(heroContent, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
}

/**
 * Portfolio card 3D tilt on hover - uses event delegation for dynamic cards.
 * Desktop only, non-touch only.
 */
export function initCardTilt() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('before-mode')) return;

    const card = e.target.closest('.portfolio__card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 5;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 5;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 800
    });
  });

  // Use capture to catch mouseleave from card children
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.portfolio__card');
    if (!card) return;

    // Only reset if we are actually leaving the card
    const related = e.relatedTarget;
    if (related && card.contains(related)) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
}

/**
 * Scroll-triggered parallax for decorative shapes.
 * Moves shapes at a slower rate than scroll for depth.
 */
export function initParallax() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.parallax-shape').forEach(shape => {
    gsap.to(shape, {
      y: -100,
      scrollTrigger: {
        trigger: shape.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });
}

/**
 * Hero text reveal - circular mask follows cursor over headline,
 * revealing green text underneath the white text.
 * Desktop only, non-touch only.
 */
export function initTextReveal() {
  return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const wrap = document.querySelector('.hero__headline-wrap');
  const reveal = document.querySelector('.hero__headline-reveal');
  if (!wrap || !reveal) return;

  const RADIUS = 120;

  wrap.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('before-mode')) return;

    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    reveal.style.clipPath = `circle(${RADIUS}px at ${x}px ${y}px)`;
  });

  wrap.addEventListener('mouseleave', () => {
    reveal.style.clipPath = 'circle(0px at 0 0)';
  });
}
