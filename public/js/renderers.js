// renderers.js - DOM rendering functions for CMS content rendering
// Each function takes CMS data and updates the corresponding page section.

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

// --- Site content renderer ---

/**
 * Updates elements with data-cms attributes using CMS page data.
 * Expects data shaped as { heroes: [...], ctaStrips: [...], services: [...] }.
 * Uses textContent for titles/excerpts, innerHTML for body content.
 */
export function renderSiteContent(data) {
  if (!data) return;

  // Hero
  const hero = data.heroes?.find(h => h.pageKey === 'homepage');
  if (hero) {
    const heroTitle = document.querySelector('[data-cms="hero-title"]');
    const heroSub = document.querySelector('[data-cms="hero-subtitle"]');
    if (heroTitle) {
      heroTitle.textContent = hero.headline || heroTitle.textContent;
      // Sync the reveal layer text for the text reveal effect
      const reveal = document.querySelector('.hero__headline-reveal');
      if (reveal) reveal.textContent = heroTitle.textContent;
    }
    if (heroSub) heroSub.textContent = hero.subheadline || heroSub.textContent;
  }

  // CTA strip
  const cta = data.ctaStrips?.[0];
  if (cta) {
    const ctaTitle = document.querySelector('[data-cms="cta-title"]');
    const ctaButton = document.querySelector('[data-cms="cta-button"]');
    if (ctaTitle) ctaTitle.textContent = cta.headline || ctaTitle.textContent;
    if (ctaButton) ctaButton.textContent = cta.buttonText || ctaButton.textContent;
  }

  // Work page hero
  const workHero = data.heroes?.find(h => h.pageKey === 'work');
  if (workHero) {
    const workTitle = document.querySelector('[data-cms="work-hero-title"]');
    const workSub = document.querySelector('[data-cms="work-hero-subtitle"]');
    if (workTitle) workTitle.textContent = workHero.headline || workTitle.textContent;
    if (workSub) workSub.textContent = workHero.subheadline || workSub.textContent;
  }

  // Services page hero
  const servicesHero = data.heroes?.find(h => h.pageKey === 'services');
  if (servicesHero) {
    const servicesTitle = document.querySelector('[data-cms="services-hero-title"]');
    const servicesSub = document.querySelector('[data-cms="services-hero-subtitle"]');
    if (servicesTitle) servicesTitle.textContent = servicesHero.headline || servicesTitle.textContent;
    if (servicesSub) servicesSub.textContent = servicesHero.subheadline || servicesSub.textContent;
  }

  // What we do - websites
  const websites = data.services?.find(s => s.serviceKey === 'websites');
  if (websites) {
    const title = document.querySelector('[data-cms="what-we-do-websites-title"]');
    const body = document.querySelector('[data-cms="what-we-do-websites-body"]');
    if (title) title.textContent = websites.title || title.textContent;
    if (body && websites.body) body.innerHTML = '<p>' + sanitizeHTML(websites.body) + '</p>';
  }

  // What we do - AI
  const ai = data.services?.find(s => s.serviceKey === 'ai');
  if (ai) {
    const title = document.querySelector('[data-cms="what-we-do-ai-title"]');
    const body = document.querySelector('[data-cms="what-we-do-ai-body"]');
    if (title) title.textContent = ai.title || title.textContent;
    if (body && ai.body) body.innerHTML = '<p>' + sanitizeHTML(ai.body) + '</p>';
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
