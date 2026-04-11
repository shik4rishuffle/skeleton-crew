// main.js - entry point
// Conditionally initialize features based on DOM presence

import { initNav } from './nav.js';
import { initToggle } from './toggle.js';
import { initAnimations, animatePortfolioCards, animatePricingCards } from './animations.js';
import { initContactForm } from './contact-form.js';
import { initPageContent } from './cms-api.js';
import { initHeroTilt, initCardTilt, initParallax, initTextReveal } from './effects.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initToggle();
  initAnimations();
  initHeroTilt();
  initCardTilt();
  initParallax();
  initTextReveal();

  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // CMS content - detect page from body data attribute
  const pageSlug = document.body.dataset.page;
  if (pageSlug) {
    initPageContent(pageSlug);
  }

  // Observe portfolio and pricing grids for content changes - when CMS
  // data or fallback content replaces skeleton loaders, trigger scroll
  // animations on the new cards.
  observeGridForAnimation('.portfolio__grid', animatePortfolioCards);
  observeGridForAnimation('.pricing__grid', animatePricingCards);

  // Contact form
  initContactForm();
});

/**
 * Watches a grid container for child mutations (innerHTML replacement by
 * renderers.js) and calls the given animation function once when new
 * non-skeleton cards appear.
 */
function observeGridForAnimation(selector, animateFn) {
  const grids = document.querySelectorAll(selector);
  if (!grids.length) return;

  grids.forEach((grid) => {
    const observer = new MutationObserver(() => {
      // Only animate if skeleton loaders have been replaced with real content
      const hasRealCards = grid.querySelector(
        '.portfolio__card:not(.skeleton), .pricing__card:not(.skeleton), .portfolio__fallback'
      );
      if (hasRealCards) {
        observer.disconnect();
        animateFn();
      }
    });

    observer.observe(grid, { childList: true });
  });
}
