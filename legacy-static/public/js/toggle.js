// toggle.js - before/after demo toggle with GSAP animated transition
// The star feature: swaps body.before-mode class to transform the site
// from the real Skeleton Crew design into a generic template look.

export function initToggle() {
  const toggleBtn = document.querySelector('[data-toggle="before"]');
  const pill = document.querySelector('.toggle__pill');
  if (!toggleBtn || !pill) return;

  let isBeforeMode = false;
  let isAnimating = false;
  let hasInteracted = false;

  // Add the pulse animation to draw attention on first load
  toggleBtn.classList.add('toggle__btn--pulse');

  function handleToggle() {
    if (isAnimating) return;

    // Remove pulse after first click - it has done its job
    if (!hasInteracted) {
      toggleBtn.classList.remove('toggle__btn--pulse');
      hasInteracted = true;
    }

    isAnimating = true;
    isBeforeMode = !isBeforeMode;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || typeof gsap === 'undefined') {
      document.body.classList.toggle('before-mode', isBeforeMode);
      updateLabels();
      isAnimating = false;
      return;
    }

    animateTransition();
  }

  toggleBtn.addEventListener('click', handleToggle);
  if (pill) {
    pill.addEventListener('click', handleToggle);
  }

  function animateTransition() {
    // Collect all text elements that need the opacity cross-fade.
    // Font-family can't be smoothly interpolated, so we fade text out,
    // swap the class (which changes fonts), then fade back in.
    const textSelectors = [
      '.hero__headline',
      '.hero__sub',
      '.what-we-do__title',
      '.what-we-do__body',
      '.portfolio__heading',
      '.portfolio__card-title',
      '.portfolio__card-desc',
      '.pricing__heading',
      '.pricing__card-name',
      '.pricing__card-desc',
      '.pricing__card-price',
      '.pricing__card-features',
      '.cta-strip__headline',
      '.footer__tagline',
      '.footer__link',
      '.footer__copy'
    ].join(', ');

    // Card elements that transition backgrounds
    const cardSelectors = [
      '.what-we-do__card',
      '.portfolio__card',
      '.pricing__card'
    ].join(', ');

    // Target colours and backgrounds for each direction
    const isGoingBefore = isBeforeMode;

    const timeline = gsap.timeline({
      onComplete: () => {
        // Clear inline styles that GSAP set so the CSS classes take over.
        // This prevents stale inline styles from fighting the stylesheet.
        gsap.set('body', { clearProps: 'backgroundColor,color' });
        gsap.set('.nav', { clearProps: 'backgroundColor,boxShadow,height' });
        gsap.set('.hero', { clearProps: 'minHeight' });
        gsap.set(textSelectors, { clearProps: 'opacity' });
        gsap.set(cardSelectors, {
          clearProps: 'backgroundColor,borderColor,borderRadius,boxShadow'
        });
        gsap.set('.btn', { clearProps: 'borderRadius,backgroundColor,color,borderColor,boxShadow,padding' });
        gsap.set('.cta-strip', { clearProps: 'backgroundColor' });
        gsap.set('.footer', { clearProps: 'backgroundColor,borderColor' });
        gsap.set('.pricing__card--featured', { clearProps: 'borderColor' });
        gsap.set('.hero__bg', { clearProps: 'opacity' });
        isAnimating = false;
      }
    });

    if (isGoingBefore) {
      // --- Transitioning TO before mode (real site -> template) ---
      timeline
        // Phase 1: Start colour transitions and fade out text (0-250ms)
        .to('body', {
          backgroundColor: '#f0f0f0',
          color: '#333333',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.nav', {
          backgroundColor: '#003087',
          boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          height: '5rem',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.hero', {
          minHeight: '60vh',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.hero__bg', {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in'
        }, 0)
        .to(cardSelectors, {
          backgroundColor: '#ffffff',
          borderColor: '#dddddd',
          borderRadius: '0px',
          boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.pricing__card--featured', {
          borderColor: '#dddddd',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.cta-strip', {
          backgroundColor: '#e8e8e8',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.footer', {
          backgroundColor: '#e0e0e0',
          borderColor: '#cccccc',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        // Fade text out at 200ms mark
        .to(textSelectors, {
          opacity: 0,
          duration: 0.12,
          ease: 'power2.in'
        }, 0.2)
        // Apply the class at midpoint while text is hidden
        .call(() => {
          document.body.classList.add('before-mode');
          updateLabels();
        }, null, 0.32)
        // Fade text back in with the new fonts
        .to(textSelectors, {
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out'
        }, 0.35);
    } else {
      // --- Transitioning TO after mode (template -> real site) ---
      timeline
        // Phase 1: Start colour transitions and fade out text
        .to('body', {
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.nav', {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          boxShadow: 'none',
          height: '4rem',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.hero', {
          minHeight: '100vh',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to(cardSelectors, {
          backgroundColor: '#111111',
          borderColor: '#222222',
          borderRadius: '4px',
          boxShadow: 'none',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.pricing__card--featured', {
          borderColor: '#2ECC40',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.cta-strip', {
          backgroundColor: '#111111',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        .to('.footer', {
          backgroundColor: '#0a0a0a',
          borderColor: '#222222',
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0)
        // Fade text out
        .to(textSelectors, {
          opacity: 0,
          duration: 0.12,
          ease: 'power2.in'
        }, 0.2)
        // Remove the class at midpoint while text is hidden
        .call(() => {
          document.body.classList.remove('before-mode');
          updateLabels();
        }, null, 0.32)
        // Fade text back in with the real fonts
        .to(textSelectors, {
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out'
        }, 0.35)
        // Bring the animated background back
        .to('.hero__bg', {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        }, 0.3);
    }
  }

  function updateLabels() {
    toggleBtn.textContent = isBeforeMode
      ? 'See what we do differently'
      : 'See what everyone else gives you';
    toggleBtn.setAttribute('aria-pressed', String(isBeforeMode));
    pill.textContent = isBeforeMode ? 'THEIRS' : 'OURS';
  }
}
