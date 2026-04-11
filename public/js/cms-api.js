// cms-api.js - Payload CMS REST API client
// Fetches CMS content with caching, timeouts, and graceful fallbacks.

import {
  renderSiteContent,
  renderPortfolio,
  renderPricing,
  renderSiteContentFallback,
  renderPortfolioFallback,
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

// --- Public API ---

/**
 * Fetches portfolio entries, ordered by sortOrder.
 * depth=1 populates the screenshot media relation.
 */
export async function getPortfolio() {
  return fetchFromPayload('portfolio-entries', {
    sort: 'sortOrder',
    depth: '1'
  });
}

/**
 * Fetches website pricing tiers, ordered by sortOrder.
 */
export async function getPricingWebsite() {
  return fetchFromPayload('pricing-tiers', {
    'where[category][equals]': 'website',
    sort: 'sortOrder'
  });
}

/**
 * Fetches AI consulting pricing tiers, ordered by sortOrder.
 */
export async function getPricingAI() {
  return fetchFromPayload('pricing-tiers', {
    'where[category][equals]': 'ai',
    sort: 'sortOrder'
  });
}

/**
 * Fetches all site content from Payload's structured collections.
 * Returns { heroes, ctaStrips, services } or null if all fetches fail.
 */
export async function getSiteContent() {
  const [heroes, ctaStrips, services] = await Promise.all([
    fetchFromPayload('page-heroes'),
    fetchFromPayload('cta-strips'),
    fetchFromPayload('service-descriptions')
  ]);

  if (!heroes && !ctaStrips && !services) return null;

  return {
    heroes: heroes || [],
    ctaStrips: ctaStrips || [],
    services: services || []
  };
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

// --- Render orchestrators ---

/**
 * Initializes CMS content for the Work page after first paint.
 * Fetches portfolio entries and site content for the hero,
 * then renders or falls back. If the API fails, tries the static
 * fallback JSON before using hardcoded content in renderers.js.
 */
export function initWorkPageContent() {
  requestAnimationFrame(() => {
    setTimeout(async () => {
      const [portfolio, siteContent] = await Promise.all([
        getPortfolio(),
        getSiteContent()
      ]);

      // If any fetch failed, try loading the fallback JSON file
      const needsFallback = !portfolio || !siteContent;
      const fallback = needsFallback ? await loadFallbackJSON() : null;

      // Render full portfolio grid - API data, then fallback JSON, then hardcoded
      if (portfolio) {
        renderPortfolio(portfolio, '[data-cms="portfolio-full"]');
      } else if (fallback && fallback.portfolio) {
        renderPortfolio(fallback.portfolio, '[data-cms="portfolio-full"]');
      } else {
        renderPortfolioFallback('[data-cms="portfolio-full"]');
      }

      // Render work page hero - API data, then fallback JSON, then hardcoded
      if (siteContent) {
        renderSiteContent(siteContent);
      } else if (fallback && fallback.siteContent) {
        renderSiteContent(fallback.siteContent);
      } else {
        renderSiteContentFallback();
      }
    }, 0);
  });
}

/**
 * Initializes CMS content for the Services page after first paint.
 * Fetches both pricing categories and site content for the hero,
 * then renders or falls back. If the API fails, tries the static
 * fallback JSON before using hardcoded content in renderers.js.
 */
export function initServicesContent() {
  requestAnimationFrame(() => {
    setTimeout(async () => {
      const [pricingWeb, pricingAI, siteContent] = await Promise.all([
        getPricingWebsite(),
        getPricingAI(),
        getSiteContent()
      ]);

      // If any fetch failed, try loading the fallback JSON file
      const needsFallback = !pricingWeb || !pricingAI || !siteContent;
      const fallback = needsFallback ? await loadFallbackJSON() : null;

      // Render website pricing - API data, then fallback JSON, then hardcoded
      if (pricingWeb) {
        renderPricing(pricingWeb, '[data-cms="pricing-website-full"]');
      } else if (fallback && fallback.pricingWebsite) {
        renderPricing(fallback.pricingWebsite, '[data-cms="pricing-website-full"]');
      } else {
        renderPricingFallback('[data-cms="pricing-website-full"]');
      }

      // Render AI pricing - API data, then fallback JSON, then hardcoded
      if (pricingAI) {
        renderPricing(pricingAI, '[data-cms="pricing-ai-full"]');
      } else if (fallback && fallback.pricingAI) {
        renderPricing(fallback.pricingAI, '[data-cms="pricing-ai-full"]');
      } else {
        renderPricingAIFallback('[data-cms="pricing-ai-full"]');
      }

      // Render services page hero - API data, then fallback JSON, then leave defaults
      if (siteContent) {
        renderSiteContent(siteContent);
      } else if (fallback && fallback.siteContent) {
        renderSiteContent(fallback.siteContent);
      } else {
        renderSiteContentFallback();
      }
    }, 0);
  });
}

/**
 * Initializes CMS content loading for the homepage after first paint.
 * Fires all API fetches in parallel via Promise.all, then renders
 * each section. If the API fails, tries the static fallback JSON
 * before falling back to hardcoded content in renderers.js.
 */
export function initCMSContent() {
  // Fire after first paint: rAF ensures we're past the current paint,
  // setTimeout(0) defers to the next task so the paint actually flushes.
  requestAnimationFrame(() => {
    setTimeout(async () => {
      const [portfolio, pricingWeb, siteContent] = await Promise.all([
        getPortfolio(),
        getPricingWebsite(),
        getSiteContent()
      ]);

      // If any fetch failed, try loading the fallback JSON file
      const needsFallback = !portfolio || !pricingWeb || !siteContent;
      const fallback = needsFallback ? await loadFallbackJSON() : null;

      // Render portfolio - API data, then fallback JSON, then hardcoded
      if (portfolio) {
        renderPortfolio(portfolio, '[data-cms="portfolio"]');
      } else if (fallback && fallback.portfolio) {
        renderPortfolio(fallback.portfolio, '[data-cms="portfolio"]');
      } else {
        renderPortfolioFallback('[data-cms="portfolio"]');
      }

      // Render website pricing - API data, then fallback JSON, then hardcoded
      if (pricingWeb) {
        renderPricing(pricingWeb, '[data-cms="pricing-website"]');
      } else if (fallback && fallback.pricingWebsite) {
        renderPricing(fallback.pricingWebsite, '[data-cms="pricing-website"]');
      } else {
        renderPricingFallback('[data-cms="pricing-website"]');
      }

      // Render site content - API data, then fallback JSON, then hardcoded
      if (siteContent) {
        renderSiteContent(siteContent);
      } else if (fallback && fallback.siteContent) {
        renderSiteContent(fallback.siteContent);
      } else {
        renderSiteContentFallback();
      }
    }, 0);
  });
}
