// main.js - entry point
// Conditionally initialize features based on DOM presence

import { initNav } from './nav.js';
import { initToggle } from './toggle.js';
import { initAnimations, animatePortfolioCards, animatePricingCards } from './animations.js';
import { initContactForm } from './contact-form.js';
import { initGhostContent, initWorkPageContent, initServicesContent } from './ghost-api.js';
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

  // Ghost CMS content - conditionally load based on which page we are on
  if (document.querySelector('[data-ghost="portfolio-full"]')) {
    initWorkPageContent();
  } else if (document.querySelector('[data-ghost="pricing-website-full"]')) {
    initServicesContent();
  } else if (document.querySelector('[data-ghost="portfolio"]')) {
    initGhostContent();
  }
  // Contact page (and any page without Ghost containers) skips CMS loading

  // Observe portfolio and pricing grids for content changes - when Ghost
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
