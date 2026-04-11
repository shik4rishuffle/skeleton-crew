#!/usr/bin/env node

// Fallback Content Regeneration Script
// Fetches all Payload CMS content and writes a static JSON fallback file.
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

const API_BASE = 'https://cms.skeleton-crew.co.uk/api';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'js', 'fallback-content.json');
const FETCH_TIMEOUT = 10000; // 10 seconds per request

// --- Helpers ---

/**
 * Fetches a Payload REST API collection endpoint with a timeout.
 * Returns the parsed docs array or throws on failure.
 *
 * @param {string} collection - Collection slug (e.g. 'portfolio-entries')
 * @param {Object} params - Query parameters (sort, where, depth, etc.)
 * @returns {Promise<Array>} Array of docs
 */
async function fetchFromPayload(collection, params = {}) {
  const url = `${API_BASE}/${collection}?${new URLSearchParams(params)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json.docs || [];
  } catch (error) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to fetch ${collection}: ${error.message}`);
  }
}

/**
 * Fetches a Payload global by slug. Globals return the object directly
 * (not wrapped in { docs: [] }).
 *
 * @param {string} slug - Global slug (e.g. 'site-settings')
 * @returns {Promise<Object>} The global object
 */
async function fetchGlobal(slug) {
  const url = `${API_BASE}/globals/${slug}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to fetch global ${slug}: ${error.message}`);
  }
}

/**
 * Fetches all pages from Payload and returns them keyed by slug.
 */
async function fetchPages() {
  const docs = await fetchFromPayload('pages', { depth: 0 });
  const pages = {};
  for (const doc of docs) {
    if (doc.slug) {
      pages[doc.slug] = doc;
    }
  }
  return pages;
}

/**
 * Fetches portfolio entries from Payload.
 */
async function fetchPortfolio() {
  return fetchFromPayload('portfolio-entries', {
    sort: 'sortOrder',
    depth: 1
  });
}

/**
 * Fetches website pricing tiers from Payload.
 */
async function fetchPricingWebsite() {
  return fetchFromPayload('pricing-tiers', {
    'where[category][equals]': 'website',
    sort: 'sortOrder'
  });
}

/**
 * Fetches AI pricing tiers from Payload.
 */
async function fetchPricingAI() {
  return fetchFromPayload('pricing-tiers', {
    'where[category][equals]': 'ai',
    sort: 'sortOrder'
  });
}

/**
 * Fetches site settings global from Payload.
 */
async function fetchSiteSettings() {
  return fetchGlobal('site-settings');
}

// --- Main ---

async function main() {
  console.log(`[${new Date().toISOString()}] Starting fallback content regeneration...`);

  let pages, siteSettings, portfolio, pricingWebsite, pricingAI;

  try {
    // Fetch all content types in parallel
    [pages, siteSettings, portfolio, pricingWebsite, pricingAI] = await Promise.all([
      fetchPages(),
      fetchSiteSettings(),
      fetchPortfolio(),
      fetchPricingWebsite(),
      fetchPricingAI()
    ]);
  } catch (error) {
    // Payload is unreachable or returned an error - do NOT overwrite existing fallback
    console.warn(`[${new Date().toISOString()}] Payload API error: ${error.message}`);
    console.warn('Existing fallback file has NOT been overwritten.');
    process.exit(1);
  }

  // Build the fallback content object
  const fallbackData = {
    generatedAt: new Date().toISOString(),
    pages,
    siteSettings,
    portfolio,
    pricingWebsite,
    pricingAI
  };

  // Write the JSON file
  try {
    const json = JSON.stringify(fallbackData, null, 2);
    await fs.writeFile(OUTPUT_PATH, json, 'utf8');
    console.log(`[${new Date().toISOString()}] Fallback content written to ${OUTPUT_PATH}`);
    console.log(`  - Pages: ${Object.keys(pages).join(', ')}`);
    console.log(`  - Site settings: ${siteSettings ? 'yes' : 'no'}`);
    console.log(`  - Portfolio entries: ${portfolio.length}`);
    console.log(`  - Website pricing tiers: ${pricingWebsite.length}`);
    console.log(`  - AI pricing tiers: ${pricingAI.length}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to write fallback file: ${error.message}`);
    process.exit(1);
  }
}

main();
