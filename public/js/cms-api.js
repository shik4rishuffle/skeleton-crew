// cms-api.js - Payload CMS REST API client
// Fetches page-centric CMS content with caching, timeouts, and graceful fallbacks.

import {
  renderHeroBlock,
  renderServiceCardsBlock,
  renderPortfolioTeaserBlock,
  renderPortfolioGridBlock,
  renderPricingSectionBlock,
  renderCtaStripBlock,
  renderContactSectionBlock,
  renderNavigation,
  renderFooter,
  renderPortfolio,
  renderPortfolioFallback,
  renderPricing,
  renderPricingFallback,
  renderPricingAIFallback
} from './renderers.js';

// --- Config ---

const API_BASE = 'https://cms.skeleton-crew.co.uk/api';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 5000; // 5 seconds

// --- Internal: cached fetch with timeout and fallback ---

/**
 * Fetches data from the Payload REST API with sessionStorage caching and
 * AbortController timeout. Returns null on any failure to signal fallback.
 *
 * @param {string} collection - Payload collection slug (e.g. 'portfolio-entries')
 * @param {Object} params - Query parameters (sort, depth, where clauses, etc.)
 * @returns {Promise<Array|null>} Array of docs or null on failure
 */
async function fetchFromPayload(collection, params = {}) {
  // Sorted-key serialization for consistent cache keys
  const sortedParams = new URLSearchParams(
    Object.keys(params).sort().map(k => [k, params[k]])
  );
  const url = `${API_BASE}/${collection}?${sortedParams}`;
  const cacheKey = `cms_${collection}_${sortedParams}`;

  // Check sessionStorage cache (may be unavailable in private browsing)
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch {
    // sessionStorage unavailable - continue without cache
  }

  // Fetch with timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Payload API ${response.status}`);
    }

    const json = await response.json();
    const data = json.docs || [];

    // Cache the result in sessionStorage
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // sessionStorage full or unavailable - continue without caching
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Payload API fetch failed for ${collection}:`, error.message);
    return null;
  }
}

/**
 * Fetches a Payload global by slug. Globals return the object directly
 * (not wrapped in { docs: [] }), so this has its own fetch function.
 *
 * @param {string} slug - Global slug (e.g. 'site-settings')
 * @returns {Promise<Object|null>} The global object or null on failure
 */
async function fetchGlobal(slug) {
  const url = `${API_BASE}/globals/${slug}`;
  const cacheKey = `cms_global_${slug}`;

  // Check sessionStorage cache
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch {
    // sessionStorage unavailable - continue without cache
  }

  // Fetch with timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Payload API ${response.status}`);
    }

    const data = await response.json();

    // Cache the result in sessionStorage
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // sessionStorage full or unavailable - continue without caching
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Payload API fetch failed for global ${slug}:`, error.message);
    return null;
  }
}

// --- Public API ---

/**
 * Fetches a page by slug from the Pages collection.
 * Returns the first matching doc or null.
 */
export async function getPage(slug) {
  const docs = await fetchFromPayload('pages', {
    'where[slug][equals]': slug,
    depth: '0'
  });
  if (!docs || docs.length === 0) return null;
  return docs[0];
}

/**
 * Fetches site settings from the site-settings global.
 */
export async function getSiteSettings() {
  return fetchGlobal('site-settings');
}

/**
 * Fetches portfolio entries, ordered by sortOrder.
 * depth=1 populates the screenshot media relation.
 * If limit is provided, caps the number of returned entries.
 */
export async function getPortfolio(limit) {
  const params = {
    sort: 'sortOrder',
    depth: '1'
  };
  if (limit) params.limit = String(limit);
  return fetchFromPayload('portfolio-entries', params);
}

/**
 * Fetches pricing tiers filtered by category, ordered by sortOrder.
 */
export async function getPricingByCategory(category) {
  return fetchFromPayload('pricing-tiers', {
    'where[category][equals]': category,
    sort: 'sortOrder'
  });
}

// --- Fallback JSON loader ---

// Cached fallback JSON - loaded once, reused for all content types
let fallbackCache = null;

/**
 * Loads the static fallback-content.json file (generated weekly by
 * scripts/regenerate-fallback.js). Returns the parsed object or false
 * if the file is unavailable. Caches the result so it's only fetched once.
 */
async function loadFallbackJSON() {
  if (fallbackCache !== null) return fallbackCache;

  try {
    const response = await fetch('/js/fallback-content.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    fallbackCache = await response.json();
    return fallbackCache;
  } catch (error) {
    console.warn('Fallback JSON unavailable:', error.message);
    // Set to false (not null) so we don't retry on subsequent calls
    fallbackCache = false;
    return false;
  }
}

// --- Render orchestrator ---

/**
 * Main orchestrator - fetches page data and site settings, then iterates
 * over the page's layout blocks and calls the appropriate renderer for each.
 *
 * Falls back to static JSON, then to hardcoded HTML if the API is down.
 *
 * @param {string} slug - The page slug (e.g. 'home', 'work', 'services', 'contact')
 */
export function initPageContent(slug) {
  // Fire after first paint: rAF ensures we're past the current paint,
  // setTimeout(0) defers to the next task so the paint actually flushes.
  requestAnimationFrame(() => {
    setTimeout(async () => {
      const [page, siteSettings] = await Promise.all([
        getPage(slug),
        getSiteSettings()
      ]);

      // Render site settings (nav + footer) - try API data, then fallback JSON
      let settings = siteSettings;
      if (!settings) {
        const fallback = await loadFallbackJSON();
        if (fallback && fallback.siteSettings) settings = fallback.siteSettings;
      }
      if (settings) {
        renderNavigation(settings);
        renderFooter(settings);
      }

      // If page fetch succeeded, render blocks from the layout
      if (page && page.layout && page.layout.length > 0) {
        await renderBlocks(page.layout);
        return;
      }

      // Page fetch failed - try fallback JSON
      const fallback = await loadFallbackJSON();
      if (fallback && fallback.pages && fallback.pages[slug]) {
        const fallbackPage = fallback.pages[slug];
        if (fallbackPage.layout && fallbackPage.layout.length > 0) {
          await renderBlocks(fallbackPage.layout, fallback);
          return;
        }
      }

      // No page data at all - render fallbacks for known containers
      renderHardcodedFallbacks(slug);
    }, 0);
  });
}

/**
 * Iterates over layout blocks and calls the appropriate renderer for each.
 * For blocks that need additional data (portfolio, pricing), fires those
 * fetches and falls back appropriately.
 *
 * @param {Array} blocks - The page layout blocks array
 * @param {Object} fallbackData - Optional fallback JSON for portfolio/pricing
 */
async function renderBlocks(blocks, fallbackData = null) {
  let ctaStripIndex = 0;

  for (const block of blocks) {
    switch (block.blockType) {
      case 'heroBlock':
        renderHeroBlock(block);
        break;

      case 'serviceCardsBlock':
        renderServiceCardsBlock(block);
        break;

      case 'portfolioTeaserBlock': {
        const portfolioData = await fetchPortfolioWithFallback(fallbackData);
        renderPortfolioTeaserBlock(block, portfolioData);
        break;
      }

      case 'portfolioGridBlock': {
        const portfolioData = await fetchPortfolioWithFallback(fallbackData);
        renderPortfolioGridBlock(block, portfolioData);
        break;
      }

      case 'pricingSectionBlock': {
        const category = block.category || 'website';
        const containerSelector = findPricingContainer(category);
        const pricingData = await fetchPricingWithFallback(category, fallbackData);
        renderPricingSectionBlock(block, pricingData, containerSelector);
        break;
      }

      case 'ctaStripBlock':
        renderCtaStripBlock(block, ctaStripIndex);
        ctaStripIndex++;
        break;

      case 'contactSectionBlock':
        renderContactSectionBlock(block);
        break;

      default:
        console.warn(`Unknown block type: ${block.blockType}`);
    }
  }
}

/**
 * Fetches portfolio data from the API, falling back to the static JSON.
 */
async function fetchPortfolioWithFallback(fallbackData) {
  const data = await getPortfolio();
  if (data) return data;

  // Try fallback JSON
  if (fallbackData && fallbackData.portfolio) return fallbackData.portfolio;

  const fallback = await loadFallbackJSON();
  if (fallback && fallback.portfolio) return fallback.portfolio;

  return null;
}

/**
 * Fetches pricing data by category from the API, falling back to static JSON.
 */
async function fetchPricingWithFallback(category, fallbackData) {
  const data = await getPricingByCategory(category);
  if (data) return data;

  // Try fallback JSON
  const fallbackKey = category === 'ai' ? 'pricingAI' : 'pricingWebsite';
  if (fallbackData && fallbackData[fallbackKey]) return fallbackData[fallbackKey];

  const fallback = await loadFallbackJSON();
  if (fallback && fallback[fallbackKey]) return fallback[fallbackKey];

  return null;
}

/**
 * Determines the correct data-cms selector for a pricing grid based on
 * category and which containers exist on the current page.
 */
function findPricingContainer(category) {
  if (category === 'ai') {
    return '[data-cms="pricing-ai-full"]';
  }

  // Website pricing - check which container exists on this page
  if (document.querySelector('[data-cms="pricing-website-full"]')) {
    return '[data-cms="pricing-website-full"]';
  }
  return '[data-cms="pricing-website"]';
}

/**
 * Last-resort fallback when neither the API nor fallback JSON are available.
 * Renders hardcoded content into known containers based on the page slug.
 */
function renderHardcodedFallbacks(slug) {
  switch (slug) {
    case 'home':
      renderPortfolioFallback('[data-cms="portfolio"]');
      renderPricingFallback('[data-cms="pricing-website"]');
      break;
    case 'work':
      renderPortfolioFallback('[data-cms="portfolio-full"]');
      break;
    case 'services':
      renderPricingFallback('[data-cms="pricing-website-full"]');
      renderPricingAIFallback('[data-cms="pricing-ai-full"]');
      break;
    // Contact page has no dynamic grids - nothing to fall back on
  }
}
