#!/usr/bin/env node

// Fallback Content Regeneration Script
// Fetches all Ghost CMS content and writes a static JSON fallback file.
// Run weekly: 0 3 * * 0 node /srv/skeleton/clients/skeleton-crew/scripts/regenerate-fallback.js

'use strict';

// --- Node version check ---
const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`Node.js 18+ is required (native fetch). Current version: ${process.version}`);
  process.exit(1);
}

const fs = require('fs/promises');
const path = require('path');

// --- Config ---

const API_BASE = 'https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost/api/content';
const API_KEY = '6a81932590f32d95416a5191a7';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'js', 'fallback-content.json');
const FETCH_TIMEOUT = 10000; // 10 seconds per request

// Site content page slugs - must match ghost-api.js getSiteContent()
const SITE_CONTENT_SLUGS = [
  'site-hero',
  'site-cta-strip',
  'site-about',
  'site-what-we-do-websites',
  'site-what-we-do-ai',
  'page-work-hero',
  'page-services-hero'
];

// --- Helpers ---

/**
 * Fetches a Ghost Content API endpoint with a timeout.
 * Returns the parsed response data or throws on failure.
 *
 * @param {string} resource - 'posts' or 'pages'
 * @param {Object} params - Query parameters (filter, include, order, etc.)
 * @param {string} responseKey - Key to extract from JSON response
 * @returns {Promise<Array>} Array of results
 */
async function fetchFromGhost(resource, params = {}, responseKey) {
  const queryParams = new URLSearchParams({ key: API_KEY, ...params });
  const url = `${API_BASE}/${resource}/?${queryParams}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json[responseKey] || [];
  } catch (error) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to fetch ${resource}: ${error.message}`);
  }
}

/**
 * Fetches portfolio posts from Ghost.
 */
async function fetchPortfolio() {
  return fetchFromGhost('posts', {
    filter: 'tag:portfolio',
    include: 'tags',
    order: 'published_at desc'
  }, 'posts');
}

/**
 * Fetches website pricing tiers from Ghost.
 */
async function fetchPricingWebsite() {
  return fetchFromGhost('posts', {
    filter: 'tag:pricing-website',
    include: 'tags',
    order: 'published_at asc'
  }, 'posts');
}

/**
 * Fetches AI pricing tiers from Ghost.
 */
async function fetchPricingAI() {
  return fetchFromGhost('posts', {
    filter: 'tag:pricing-ai',
    include: 'tags',
    order: 'published_at asc'
  }, 'posts');
}

/**
 * Fetches site content pages from Ghost and indexes them by slug.
 */
async function fetchSiteContent() {
  const pages = await fetchFromGhost('pages', {
    filter: `slug:[${SITE_CONTENT_SLUGS.join(',')}]`
  }, 'pages');

  // Index by slug for easy lookup
  const indexed = {};
  for (const page of pages) {
    indexed[page.slug] = page;
  }
  return indexed;
}

// --- Main ---

async function main() {
  console.log(`[${new Date().toISOString()}] Starting fallback content regeneration...`);

  let portfolio, pricingWebsite, pricingAI, siteContent;

  try {
    // Fetch all content types in parallel
    [portfolio, pricingWebsite, pricingAI, siteContent] = await Promise.all([
      fetchPortfolio(),
      fetchPricingWebsite(),
      fetchPricingAI(),
      fetchSiteContent()
    ]);
  } catch (error) {
    // Ghost is unreachable or returned an error - do NOT overwrite existing fallback
    console.warn(`[${new Date().toISOString()}] Ghost API error: ${error.message}`);
    console.warn('Existing fallback file has NOT been overwritten.');
    process.exit(1);
  }

  // Build the fallback content object
  const fallbackData = {
    generatedAt: new Date().toISOString(),
    portfolio,
    pricingWebsite,
    pricingAI,
    siteContent
  };

  // Write the JSON file
  try {
    const json = JSON.stringify(fallbackData, null, 2);
    await fs.writeFile(OUTPUT_PATH, json, 'utf8');
    console.log(`[${new Date().toISOString()}] Fallback content written to ${OUTPUT_PATH}`);
    console.log(`  - Portfolio entries: ${portfolio.length}`);
    console.log(`  - Website pricing tiers: ${pricingWebsite.length}`);
    console.log(`  - AI pricing tiers: ${pricingAI.length}`);
    console.log(`  - Site content pages: ${Object.keys(siteContent).length}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to write fallback file: ${error.message}`);
    process.exit(1);
  }
}

main();
