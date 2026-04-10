// ghost-api.js - Ghost Content API client
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

const API_BASE = 'https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost/api/content';
const API_KEY = '6a81932590f32d95416a5191a7';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 5000; // 5 seconds

// --- Internal: cached fetch with timeout and fallback ---

/**
 * Fetches data from the Ghost Content API with sessionStorage caching and
 * AbortController timeout. Returns null on any failure to signal fallback.
 *
 * @param {string} resource - API resource path ('posts' or 'pages')
 * @param {Object} params - Query parameters (filter, include, order, etc.)
 * @param {string} responseKey - Key to read from the JSON response ('posts' or 'pages')
 * @returns {Promise<Array|null>} Array of results or null on failure
 */
async function fetchFromGhost(resource, params = {}, responseKey) {
  const allParams = { key: API_KEY, ...params };

  // Sorted-key serialization for consistent cache keys
  const sortedParams = new URLSearchParams(
    Object.keys(allParams).sort().map(k => [k, allParams[k]])
  );
  const url = `${API_BASE}/${resource}/?${sortedParams}`;
  const cacheKey = `ghost_${resource}_${sortedParams}`;

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
      throw new Error(`Ghost API ${response.status}`);
    }

    const json = await response.json();
    const data = json[responseKey] || [];

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
    console.warn(`Ghost API fetch failed for ${resource}:`, error.message);
    return null;
  }
}

// --- Public API ---

/**
 * Fetches portfolio entries (posts tagged 'portfolio'), newest first.
 */
export async function getPortfolio() {
  return fetchFromGhost('posts', {
    filter: 'tag:portfolio',
    include: 'tags',
    order: 'published_at desc'
  }, 'posts');
}

/**
 * Fetches website pricing tiers (posts tagged 'pricing-website'),
 * ordered by publish date ascending (controls tier display order).
 */
export async function getPricingWebsite() {
  return fetchFromGhost('posts', {
    filter: 'tag:pricing-website',
    include: 'tags',
    order: 'published_at asc'
  }, 'posts');
}

/**
 * Fetches AI consulting pricing tiers (posts tagged 'pricing-ai'),
 * ordered by publish date ascending.
 */
export async function getPricingAI() {
  return fetchFromGhost('posts', {
    filter: 'tag:pricing-ai',
    include: 'tags',
    order: 'published_at asc'
  }, 'posts');
}

/**
 * Fetches all site content pages and returns them indexed by slug.
 * Includes hero, CTA strip, about, what-we-do, and subpage hero pages.
 */
export async function getSiteContent() {
  const slugs = [
    'site-hero',
    'site-cta-strip',
    'site-about',
    'site-what-we-do-websites',
    'site-what-we-do-ai',
    'page-work-hero',
    'page-services-hero'
  ];

  const pages = await fetchFromGhost('pages', {
    filter: `slug:[${slugs.join(',')}]`
  }, 'pages');

  if (!pages) return null;

  // Index by slug for easy lookup
  const indexed = {};
  for (const page of pages) {
    indexed[page.slug] = page;
  }
  return indexed;
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
 * Initializes Ghost content for the Work page after first paint.
 * Fetches portfolio entries (no limit) and site content for the hero,
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
        renderPortfolio(portfolio, '[data-ghost="portfolio-full"]');
      } else if (fallback && fallback.portfolio) {
        renderPortfolio(fallback.portfolio, '[data-ghost="portfolio-full"]');
      } else {
        renderPortfolioFallback('[data-ghost="portfolio-full"]');
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
 * Initializes Ghost content for the Services page after first paint.
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
        renderPricing(pricingWeb, '[data-ghost="pricing-website-full"]');
      } else if (fallback && fallback.pricingWebsite) {
        renderPricing(fallback.pricingWebsite, '[data-ghost="pricing-website-full"]');
      } else {
        renderPricingFallback('[data-ghost="pricing-website-full"]');
      }

      // Render AI pricing - API data, then fallback JSON, then hardcoded
      if (pricingAI) {
        renderPricing(pricingAI, '[data-ghost="pricing-ai-full"]');
      } else if (fallback && fallback.pricingAI) {
        renderPricing(fallback.pricingAI, '[data-ghost="pricing-ai-full"]');
      } else {
        renderPricingAIFallback('[data-ghost="pricing-ai-full"]');
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
 * Initializes Ghost content loading after first paint.
 * Fires all API fetches in parallel via Promise.all, then renders
 * each section. If the API fails, tries the static fallback JSON
 * before falling back to hardcoded content in renderers.js.
 */
export function initGhostContent() {
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
        renderPortfolio(portfolio, '[data-ghost="portfolio"]');
      } else if (fallback && fallback.portfolio) {
        renderPortfolio(fallback.portfolio, '[data-ghost="portfolio"]');
      } else {
        renderPortfolioFallback('[data-ghost="portfolio"]');
      }

      // Render website pricing - API data, then fallback JSON, then hardcoded
      if (pricingWeb) {
        renderPricing(pricingWeb, '[data-ghost="pricing-website"]');
      } else if (fallback && fallback.pricingWebsite) {
        renderPricing(fallback.pricingWebsite, '[data-ghost="pricing-website"]');
      } else {
        renderPricingFallback('[data-ghost="pricing-website"]');
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
