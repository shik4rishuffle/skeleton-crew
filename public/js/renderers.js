// renderers.js - DOM rendering functions for CMS content rendering
// Block-based renderers for Payload CMS Pages collection, plus portfolio
// and pricing card renderers that remain unchanged.

// --- Helpers ---

/**
 * Strips <script> and <iframe> tags from HTML strings as defence-in-depth.
 * CMS content is managed (not user input), but we sanitize anyway.
 */
function sanitizeHTML(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

// --- Block renderers ---

/**
 * Renders a hero block - updates headline, subheadline, CTAs, and toggle
 * button text using data-cms attributes in the existing HTML.
 */
export function renderHeroBlock(block) {
  if (!block) return;

  const heroTitle = document.querySelector('[data-cms="hero-title"]')
    || document.querySelector('[data-cms="work-hero-title"]')
    || document.querySelector('[data-cms="services-hero-title"]');
  const heroSub = document.querySelector('[data-cms="hero-subtitle"]')
    || document.querySelector('[data-cms="work-hero-subtitle"]')
    || document.querySelector('[data-cms="services-hero-subtitle"]');

  if (heroTitle && block.headline) {
    heroTitle.textContent = block.headline;
    // Sync the reveal layer text for the text reveal effect
    const reveal = document.querySelector('.hero__headline-reveal');
    if (reveal) reveal.textContent = heroTitle.textContent;
  }

  if (heroSub && block.subheadline) {
    heroSub.textContent = block.subheadline;
  }

  // Rebuild CTA links if provided
  if (block.ctas && block.ctas.length > 0) {
    const ctaContainer = document.querySelector('.hero__ctas');
    if (ctaContainer) {
      // Preserve the toggle button if it exists
      const toggleBtn = ctaContainer.querySelector('.toggle__btn');

      const ctaLinks = block.ctas.map(cta => {
        const style = cta.style || 'ghost';
        const url = cta.url || '#';
        const text = cta.text || '';
        return `<a href="${url}" class="btn btn--${style}">${sanitizeHTML(text)}</a>`;
      }).join('');

      ctaContainer.innerHTML = ctaLinks;

      // Re-append the toggle button if it existed
      if (toggleBtn) {
        ctaContainer.appendChild(toggleBtn);
      }
    }
  }

  // Update toggle button text if provided
  if (block.toggleButtonText) {
    const toggleBtn = document.querySelector('.toggle__btn');
    if (toggleBtn) toggleBtn.textContent = block.toggleButtonText;
  }
}

/**
 * Renders a service cards block - updates the what-we-do cards on the
 * homepage by matching cards array indices to DOM card elements.
 */
export function renderServiceCardsBlock(block) {
  if (!block || !block.cards) return;

  const cards = document.querySelectorAll('.what-we-do__card');
  block.cards.forEach((card, i) => {
    if (!cards[i]) return;

    const titleEl = cards[i].querySelector('.what-we-do__title');
    const bodyEl = cards[i].querySelector('.what-we-do__body');

    if (titleEl && card.title) titleEl.textContent = card.title;
    if (bodyEl && card.body) bodyEl.innerHTML = `<p>${sanitizeHTML(card.body)}</p>`;
  });
}

/**
 * Renders a portfolio teaser block - updates heading and "see more" link,
 * then delegates to renderPortfolio for the card grid.
 */
export function renderPortfolioTeaserBlock(block, portfolioData) {
  if (!block) return;

  const heading = document.querySelector('.portfolio__heading');
  if (heading && block.sectionHeading) heading.textContent = block.sectionHeading;

  const moreLink = document.querySelector('.portfolio__more');
  if (moreLink && block.linkText) {
    moreLink.textContent = block.linkText;
    if (block.linkUrl) moreLink.href = block.linkUrl;
  }

  if (portfolioData) {
    renderPortfolio(portfolioData, '[data-cms="portfolio"]');
  }
}

/**
 * Renders a portfolio grid block - the full portfolio page grid.
 * Optionally updates a heading, then delegates to renderPortfolio.
 */
export function renderPortfolioGridBlock(block, portfolioData) {
  if (!block) return;

  if (block.sectionHeading) {
    const heading = document.querySelector('.portfolio--full .section__heading');
    if (heading) heading.textContent = block.sectionHeading;
  }

  if (portfolioData) {
    renderPortfolio(portfolioData, '[data-cms="portfolio-full"]');
  }
}

/**
 * Renders a pricing section block - updates the section heading and intro
 * text near the target container, then delegates to renderPricing.
 *
 * @param {Object} block - The pricing section block from the layout
 * @param {Array} pricingData - Pricing tier docs from the API
 * @param {string} containerSelector - data-cms selector for the pricing grid
 */
export function renderPricingSectionBlock(block, pricingData, containerSelector) {
  if (!block) return;

  const container = document.querySelector(containerSelector);
  if (container) {
    const section = container.closest('section');
    if (section) {
      if (block.sectionHeading) {
        const heading = section.querySelector('.section__heading');
        if (heading) heading.textContent = block.sectionHeading;
      }
      if (block.introText) {
        const intro = section.querySelector('.services__intro');
        if (intro) intro.textContent = block.introText;
      }
    }
  }

  if (pricingData) {
    renderPricing(pricingData, containerSelector);
  }
}

/**
 * Renders a CTA strip block - updates headline and button text/href.
 * Targets the CTA strip at the given index among all .cta-strip elements.
 *
 * @param {Object} block - The CTA strip block from the layout
 * @param {number} ctaStripIndex - Zero-based index of which CTA strip on the page
 */
export function renderCtaStripBlock(block, ctaStripIndex) {
  if (!block) return;

  const strips = document.querySelectorAll('.cta-strip');
  const strip = strips[ctaStripIndex || 0];
  if (!strip) return;

  const headline = strip.querySelector('.cta-strip__headline');
  if (headline && block.headline) headline.textContent = block.headline;

  const btn = strip.querySelector('.cta-strip__btn');
  if (btn) {
    if (block.buttonText) btn.textContent = block.buttonText;
    if (block.buttonUrl) btn.href = block.buttonUrl;
  }
}

/**
 * Renders a contact section block - updates the email link and text.
 */
export function renderContactSectionBlock(block) {
  if (!block) return;

  if (block.contactEmail) {
    const emailLink = document.querySelector('.contact__email a');
    if (emailLink) {
      emailLink.href = `mailto:${block.contactEmail}`;
      emailLink.textContent = block.contactEmail;
    }
  }
}

// --- Navigation and footer renderers ---

/**
 * Renders navigation links from site settings.
 * Rebuilds both desktop and mobile nav while preserving aria-current on
 * the link matching the current page path.
 */
export function renderNavigation(settings) {
  if (!settings || !settings.navLinks || settings.navLinks.length === 0) return;

  const currentPath = window.location.pathname;
  const desktopNav = document.querySelector('.nav__links');
  const mobileNav = document.querySelector('.nav__overlay-links');

  if (desktopNav) {
    desktopNav.innerHTML = settings.navLinks.map(link => {
      const isCurrent = currentPath === link.url || currentPath === `${link.url}/`;
      const aria = isCurrent ? ' aria-current="page"' : '';
      return `<a href="${link.url}" class="nav__link"${aria}>${sanitizeHTML(link.label)}</a>`;
    }).join('');
  }

  if (mobileNav) {
    mobileNav.innerHTML = settings.navLinks.map(link => {
      const isCurrent = currentPath === link.url || currentPath === `${link.url}/`;
      const aria = isCurrent ? ' aria-current="page"' : '';
      return `<a href="${link.url}" class="nav__overlay-link"${aria}>${sanitizeHTML(link.label)}</a>`;
    }).join('');
  }
}

/**
 * Renders footer content from site settings - tagline, links, and copyright.
 * Preserves the dynamic year span.
 */
export function renderFooter(settings) {
  if (!settings) return;

  if (settings.footerTagline) {
    const tagline = document.querySelector('.footer__tagline');
    if (tagline) tagline.textContent = settings.footerTagline;
  }

  if (settings.footerLinks && settings.footerLinks.length > 0) {
    const footerNav = document.querySelector('.footer__nav');
    if (footerNav) {
      footerNav.innerHTML = settings.footerLinks.map(link =>
        `<a href="${link.url}" class="footer__link">${sanitizeHTML(link.label)}</a>`
      ).join('');
    }
  }

  if (settings.copyrightText) {
    const copyEl = document.querySelector('.footer__copy');
    if (copyEl) {
      const yearSpan = copyEl.querySelector('#footer-year');
      const yearText = yearSpan ? yearSpan.textContent : new Date().getFullYear();
      copyEl.innerHTML = `&copy; <span id="footer-year">${yearText}</span> ${sanitizeHTML(settings.copyrightText)}`;
    }
  }
}

// --- Portfolio renderer ---

/**
 * Replaces skeleton loader cards with real portfolio cards from CMS.
 * Only renders as many cards as exist - no placeholders.
 */
export function renderPortfolio(data, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !data || data.length === 0) {
    renderPortfolioFallback(containerSelector);
    return;
  }

  const cards = data.map(entry => {
    const title = entry.projectName || 'Untitled project';
    const excerpt = entry.description || '';
    const image = entry.screenshot?.url
      ? `https://cms.skeleton-crew.co.uk${entry.screenshot.url}`
      : '';
    const url = entry.liveUrl;

    // Brand colour is a direct field (e.g. '#ff6b35') or null
    const brandColor = entry.brandColour || null;

    // Build the link only if liveUrl is present and non-empty
    const linkHTML = url
      ? `<a href="${url}" class="portfolio__link" target="_blank" rel="noopener">View site</a>`
      : '';

    // Build the image only if screenshot is present
    const imageHTML = image
      ? `<img src="${image}" alt="${title}" class="portfolio__image" loading="lazy">`
      : '';

    return `
      <article class="portfolio__card"${brandColor ? ` style="--card-brand-color: ${brandColor}"` : ''}>
        ${imageHTML}
        <div class="portfolio__info">
          <h3 class="portfolio__title">${title}</h3>
          ${excerpt ? `<p class="portfolio__desc">${excerpt}</p>` : ''}
          ${linkHTML}
        </div>
      </article>
    `;
  });

  container.innerHTML = cards.join('');
}

/**
 * Fallback content when portfolio data is unavailable.
 */
export function renderPortfolioFallback(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `
    <div class="portfolio__fallback">
      <p>Check back soon for our latest work.</p>
    </div>
  `;
}

// --- Pricing renderer ---

/**
 * Replaces skeleton loader cards with pricing tier cards from CMS.
 * Uses direct fields for price, features array, CTA text, and CTA URL.
 * Uses the 'isFeatured' boolean for the highlighted tier modifier class.
 */
export function renderPricing(data, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !data || data.length === 0) {
    renderPricingFallback(containerSelector);
    return;
  }

  const cards = data.map(tier => {
    const title = tier.tierName || 'Untitled tier';
    const audience = tier.audience || '';
    const isFeatured = tier.isFeatured === true;
    const price = tier.price || 'Contact for pricing';
    const featuresHTML = tier.features?.length
      ? tier.features.map(f => `<li>${f.feature}</li>`).join('')
      : '';
    const ctaText = tier.ctaText || 'Get started';
    const ctaUrl = tier.ctaUrl || '/contact/';

    const featuredClass = isFeatured ? ' pricing__card--featured' : '';

    return `
      <article class="pricing__card${featuredClass}">
        <h3 class="pricing__name">${title}</h3>
        ${audience ? `<p class="pricing__audience">${audience}</p>` : ''}
        <p class="pricing__price">${price}</p>
        ${featuresHTML ? `<ul class="pricing__features">${featuresHTML}</ul>` : ''}
        <a href="${ctaUrl}" class="btn btn--primary pricing__cta">${ctaText}</a>
      </article>
    `;
  });

  container.innerHTML = cards.join('');
}

/**
 * Fallback content when pricing data is unavailable.
 * Shows approximate website tiers based on the project brief.
 */
export function renderPricingFallback(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `
    <article class="pricing__card">
      <h3 class="pricing__name">Starter</h3>
      <p class="pricing__audience">For businesses getting online for the first time.</p>
      <p class="pricing__price">From &pound;499</p>
      <ul class="pricing__features">
        <li>One-page site that actually looks good</li>
        <li>Mobile-ready from day one</li>
        <li>Live in two weeks</li>
      </ul>
      <a href="/contact/" class="btn btn--primary pricing__cta">Get started</a>
    </article>
    <article class="pricing__card pricing__card--featured">
      <h3 class="pricing__name">Growth</h3>
      <p class="pricing__audience">For businesses ready to stand out.</p>
      <p class="pricing__price">From &pound;1,499</p>
      <ul class="pricing__features">
        <li>Multi-page bespoke design</li>
        <li>Content managed by you</li>
        <li>Built to grow with your business</li>
      </ul>
      <a href="/contact/" class="btn btn--primary pricing__cta">Get started</a>
    </article>
    <article class="pricing__card">
      <h3 class="pricing__name">Premium</h3>
      <p class="pricing__audience">For businesses that want the full package.</p>
      <p class="pricing__price">From &pound;3,000</p>
      <ul class="pricing__features">
        <li>Everything in Growth, plus</li>
        <li>Advanced features and integrations</li>
        <li>Priority support</li>
      </ul>
      <a href="/contact/" class="btn btn--primary pricing__cta">Get started</a>
    </article>
  `;
}

/**
 * Fallback content when AI pricing data is unavailable.
 * Shows approximate AI consulting tiers based on the project brief.
 */
export function renderPricingAIFallback(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `
    <article class="pricing__card">
      <h3 class="pricing__name">Audit</h3>
      <p class="pricing__audience">For businesses wondering where AI fits in.</p>
      <p class="pricing__price">From &pound;299</p>
      <ul class="pricing__features">
        <li>Full workflow review</li>
        <li>Written report with priorities</li>
        <li>Clear next steps - no fluff</li>
      </ul>
      <a href="/contact/" class="btn btn--primary pricing__cta">Get started</a>
    </article>
    <article class="pricing__card pricing__card--featured">
      <h3 class="pricing__name">Build</h3>
      <p class="pricing__audience">For businesses ready to automate what matters.</p>
      <p class="pricing__price">&pound;800 - &pound;2,500</p>
      <ul class="pricing__features">
        <li>One or two AI workflows built for you</li>
        <li>Integrated into your existing tools</li>
        <li>Trained to work without hand-holding</li>
      </ul>
      <a href="/contact/" class="btn btn--primary pricing__cta">Get started</a>
    </article>
    <article class="pricing__card">
      <h3 class="pricing__name">Retainer</h3>
      <p class="pricing__audience">For businesses that want ongoing AI support.</p>
      <p class="pricing__price">&pound;300 - &pound;600/mo</p>
      <ul class="pricing__features">
        <li>Ongoing maintenance and updates</li>
        <li>New automations as you grow</li>
        <li>Monthly strategy call</li>
      </ul>
      <a href="/contact/" class="btn btn--primary pricing__cta">Get started</a>
    </article>
  `;
}
