// renderers.js - DOM rendering functions for Ghost CMS content
// Each function takes Ghost data and updates the corresponding page section.

// --- Helpers ---

/**
 * Strips <script> and <iframe> tags from HTML strings as defence-in-depth.
 * Ghost content is CMS-managed (not user input), but we sanitize anyway.
 */
function sanitizeHTML(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Parses a pricing post's HTML body to extract price and feature list.
 * Uses a cascading strategy for price extraction:
 *   1. Look for an element with [data-price] attribute
 *   2. Fall back to first <p> element content
 *   3. Fall back to "Contact for pricing"
 * Extracts the first <ul> for the feature list.
 */
function parsePricingHTML(html) {
  if (!html) {
    return { price: 'Contact for pricing', features: '' };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Price extraction - cascading fallback
  let price = 'Contact for pricing';
  const dataPriceEl = doc.querySelector('[data-price]');
  if (dataPriceEl) {
    price = dataPriceEl.textContent.trim();
  } else {
    const firstP = doc.querySelector('p');
    if (firstP) {
      price = firstP.textContent.trim();
    }
  }

  // Feature list extraction
  let features = '';
  const ul = doc.querySelector('ul');
  if (ul) {
    features = ul.innerHTML;
  }

  return { price, features };
}

// --- Site content renderer ---

/**
 * Updates elements with data-ghost attributes using CMS page data.
 * Uses textContent for titles/excerpts, innerHTML for HTML bodies.
 */
export function renderSiteContent(data) {
  if (!data) return;

  // Hero
  const hero = data['site-hero'];
  if (hero) {
    const heroTitle = document.querySelector('[data-ghost="hero-title"]');
    const heroSub = document.querySelector('[data-ghost="hero-subtitle"]');
    if (heroTitle) {
      heroTitle.textContent = hero.title || heroTitle.textContent;
      // Sync the reveal layer text for the text reveal effect
      const reveal = document.querySelector('.hero__headline-reveal');
      if (reveal) reveal.textContent = heroTitle.textContent;
    }
    if (heroSub) heroSub.textContent = hero.custom_excerpt || heroSub.textContent;
  }

  // CTA strip
  const cta = data['site-cta-strip'];
  if (cta) {
    const ctaTitle = document.querySelector('[data-ghost="cta-title"]');
    const ctaButton = document.querySelector('[data-ghost="cta-button"]');
    if (ctaTitle) ctaTitle.textContent = cta.title || ctaTitle.textContent;
    if (ctaButton) ctaButton.textContent = cta.custom_excerpt || ctaButton.textContent;
  }

  // Work page hero
  const workHero = data['page-work-hero'];
  if (workHero) {
    const workTitle = document.querySelector('[data-ghost="work-hero-title"]');
    const workSub = document.querySelector('[data-ghost="work-hero-subtitle"]');
    if (workTitle) workTitle.textContent = workHero.title || workTitle.textContent;
    if (workSub) workSub.textContent = workHero.custom_excerpt || workSub.textContent;
  }

  // Services page hero
  const servicesHero = data['page-services-hero'];
  if (servicesHero) {
    const servicesTitle = document.querySelector('[data-ghost="services-hero-title"]');
    const servicesSub = document.querySelector('[data-ghost="services-hero-subtitle"]');
    if (servicesTitle) servicesTitle.textContent = servicesHero.title || servicesTitle.textContent;
    if (servicesSub) servicesSub.textContent = servicesHero.custom_excerpt || servicesSub.textContent;
  }

  // What we do - websites
  const websites = data['site-what-we-do-websites'];
  if (websites) {
    const title = document.querySelector('[data-ghost="what-we-do-websites-title"]');
    const body = document.querySelector('[data-ghost="what-we-do-websites-body"]');
    if (title) title.textContent = websites.title || title.textContent;
    if (body && websites.html) body.innerHTML = sanitizeHTML(websites.html);
  }

  // What we do - AI
  const ai = data['site-what-we-do-ai'];
  if (ai) {
    const title = document.querySelector('[data-ghost="what-we-do-ai-title"]');
    const body = document.querySelector('[data-ghost="what-we-do-ai-body"]');
    if (title) title.textContent = ai.title || title.textContent;
    if (body && ai.html) body.innerHTML = sanitizeHTML(ai.html);
  }
}

/**
 * Fallback for site content - leaves existing HTML in place.
 * The static HTML already contains sensible default text for hero,
 * CTA strip, and what-we-do sections, so no action is needed.
 */
export function renderSiteContentFallback() {
  // Fallback text is already in the static HTML - nothing to do
}

// --- Portfolio renderer ---

/**
 * Replaces skeleton loader cards with real portfolio cards from Ghost.
 * Only renders as many cards as exist - no placeholders.
 */
export function renderPortfolio(data, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !data || data.length === 0) {
    renderPortfolioFallback(containerSelector);
    return;
  }

  const cards = data.map(post => {
    const title = post.title || 'Untitled project';
    const excerpt = post.custom_excerpt || '';
    const image = post.feature_image || '';
    const url = post.canonical_url;

    // Extract brand colour from internal tags (e.g. #brand-ff6b35)
    const brandTag = post.tags?.find(t => t.slug?.startsWith('hash-brand-'));
    const brandColor = brandTag ? `#${brandTag.slug.replace('hash-brand-', '')}` : null;

    // Build the link only if canonical_url is present and non-empty
    const linkHTML = url
      ? `<a href="${url}" class="portfolio__link" target="_blank" rel="noopener">View site</a>`
      : '';

    // Build the image only if feature_image is present
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
 * Replaces skeleton loader cards with pricing tier cards from Ghost.
 * Parses each post's HTML body for price and feature list.
 * Uses the 'featured' boolean for the highlighted tier modifier class.
 */
export function renderPricing(data, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !data || data.length === 0) {
    renderPricingFallback(containerSelector);
    return;
  }

  const cards = data.map(post => {
    const title = post.title || 'Untitled tier';
    const audience = post.custom_excerpt || '';
    const isFeatured = post.featured === true;
    const { price, features } = parsePricingHTML(post.html);

    const featuredClass = isFeatured ? ' pricing__card--featured' : '';

    return `
      <article class="pricing__card${featuredClass}">
        <h3 class="pricing__name">${title}</h3>
        ${audience ? `<p class="pricing__audience">${audience}</p>` : ''}
        <p class="pricing__price">${price}</p>
        ${features ? `<ul class="pricing__features">${features}</ul>` : ''}
        <a href="/contact/" class="btn btn--primary pricing__cta">Get started</a>
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
