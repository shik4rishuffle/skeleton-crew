// nav.js - hamburger menu, overlay, keyboard handling, focus trap

export function initNav() {
  // Mark current page in nav for screen readers
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__link, .nav__overlay-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const burger = document.querySelector('.nav__burger');
  const overlay = document.getElementById('nav-overlay');

  if (!burger || !overlay) return;

  const overlayLinks = overlay.querySelectorAll('.nav__overlay-link');
  const focusableEls = [burger, ...overlayLinks];

  function openOverlay() {
    burger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Focus first overlay link after transition
    requestAnimationFrame(() => {
      if (overlayLinks.length) overlayLinks[0].focus();
    });
  }

  function closeOverlay() {
    burger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
    burger.focus();
  }

  function isOpen() {
    return burger.getAttribute('aria-expanded') === 'true';
  }

  // Toggle on burger click
  burger.addEventListener('click', () => {
    if (isOpen()) {
      closeOverlay();
    } else {
      openOverlay();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      closeOverlay();
    }
  });

  // Close on overlay link click
  overlayLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeOverlay();
    });
  });

  // Focus trap when overlay is open
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isOpen()) return;

    const firstFocusable = focusableEls[0];
    const lastFocusable = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}
