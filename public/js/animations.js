// animations.js - GSAP scroll triggers, hero entrance, and micro-interactions

/**
 * Initialize all GSAP-powered animations.
 * Hero entrance plays on load; scroll-triggered animations fire once
 * as each section enters the viewport.
 */
export function initAnimations() {
  // Guard - GSAP must be loaded as a global
  if (typeof gsap === 'undefined') return;

  // Respect reduced motion preference - skip all animations
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Register ScrollTrigger plugin
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  heroEntrance();
  scrollAnimations();
}

/**
 * Hero entrance - staggered fade-in on page load.
 * Sets initial hidden state via gsap.set(), then animates in sequence.
 */
function heroEntrance() {
  const headline = document.querySelector('.hero__headline');
  const sub = document.querySelector('.hero__sub');
  const ctas = document.querySelector('.hero__ctas');
  const toggle = document.querySelector('.toggle__btn');

  // Bail if hero elements are missing
  if (!headline) return;

  // Set initial hidden states
  const targets = [headline, sub, ctas, toggle].filter(Boolean);
  gsap.set(targets, { opacity: 0, y: 30 });

  // Build staggered timeline
  const tl = gsap.timeline();

  tl.to(headline, {
    opacity: 1,
    y: 0,
    duration: 0.4,
    ease: 'power2.out'
  });

  if (sub) {
    tl.to(sub, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.1'); // 300ms after headline start (0.4 - 0.1 = 0.3s delay)
  }

  if (ctas) {
    tl.to(ctas, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2'); // 200ms after sub start
  }

  if (toggle) {
    tl.to(toggle, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2'); // 200ms after CTAs start
  }
}

/**
 * Scroll-triggered animations - each section animates once on viewport entry.
 */
function scrollAnimations() {
  if (typeof ScrollTrigger === 'undefined') return;

  // Section headings - clip-path reveal from left
  const headings = document.querySelectorAll(
    '.what-we-do h2, .portfolio__heading, .pricing__heading, .cta-strip__headline'
  );

  headings.forEach((heading) => {
    gsap.set(heading, { opacity: 0, y: 40, clipPath: 'inset(0 100% 0 0)' });
    gsap.to(heading, {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        once: true
      }
    });
  });

  // What We Do cards - fade in + translateY, staggered with more drama
  const whatWeDoCards = document.querySelectorAll('.what-we-do__card');
  if (whatWeDoCards.length) {
    gsap.set(whatWeDoCards, { opacity: 0, y: 30 });
    gsap.to(whatWeDoCards, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.what-we-do__grid',
        start: 'top 85%',
        once: true
      }
    });
  }

  // Portfolio and pricing card animations are handled separately via
  // animatePortfolioCards() and animatePricingCards(), called after
  // Ghost content renders or fallback renders replace the skeleton loaders.

  // CTA strip - swipe across screen on scroll
  const ctaStrip = document.querySelector('.cta-strip');
  if (ctaStrip) {
    gsap.set(ctaStrip, { xPercent: -110, opacity: 0 });
    gsap.to(ctaStrip, {
      xPercent: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ctaStrip,
        start: 'top 90%',
        once: true
      }
    });
  }

  // Footer dashed line - scale in from left
  const footerLine = document.querySelector('.footer__line');
  if (footerLine) {
    gsap.set(footerLine, { scaleX: 0 });
    gsap.to(footerLine, {
      scaleX: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 95%',
        once: true
      }
    });
  }
}

/**
 * Animate portfolio cards after they are rendered into the DOM.
 * Called by main.js via MutationObserver after Ghost/fallback rendering.
 * Respects prefers-reduced-motion and requires GSAP + ScrollTrigger.
 */
export function animatePortfolioCards() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.portfolio__card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 30, scale: 0.97 });
  gsap.to(cards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.portfolio__grid',
      start: 'top 85%',
      once: true
    }
  });
}

/**
 * Animate pricing cards after they are rendered into the DOM.
 * Called by main.js via MutationObserver after Ghost/fallback rendering.
 * Respects prefers-reduced-motion and requires GSAP + ScrollTrigger.
 */
export function animatePricingCards() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.pricing__card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, scale: 0.95 });
  gsap.to(cards, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.15,
    scrollTrigger: {
      trigger: '.pricing__grid',
      start: 'top 85%',
      once: true
    }
  });
}
