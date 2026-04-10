#!/usr/bin/env node

/**
 * Ghost CMS Seeding Script
 * Creates tags, portfolio entries, pricing tiers, and site content pages.
 * Covers TASK-004, TASK-005, TASK-006, TASK-007.
 *
 * Uses Node.js built-in modules only (crypto, native fetch).
 * Requires Node 18+.
 */

// Dev environment uses a staging SSL certificate - allow self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const crypto = require('crypto');

// --- Config ---
const API_URL = 'https://cms-skeleton-crew.dev.skeleton-crew.co.uk';
const ADMIN_KEY = '69d7d6005a7f310001fd4208:6e92b7e884de7cc51910bc24f3f513dc657ce04f5e9dc5dbfa680b0e37b9d8b2';

// --- JWT helpers ---

function base64url(buf) {
  return buf.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createToken() {
  const [id, secret] = ADMIN_KEY.split(':');
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
    kid: id,
  };

  const payload = {
    iat: now,
    exp: now + 300,
    aud: '/admin/',
  };

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const keyBytes = Buffer.from(secret, 'hex');
  const signature = crypto.createHmac('sha256', keyBytes).update(signingInput).digest();

  return `${signingInput}.${base64url(signature)}`;
}

// --- API helpers ---

async function apiRequest(method, path, body) {
  const token = createToken();
  const url = `${API_URL}${path}`;

  const options = {
    method,
    headers: {
      'Authorization': `Ghost ${token}`,
      'Content-Type': 'application/json',
      'Accept-Version': 'v5.0',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const errMsg = typeof data === 'object' && data.errors
      ? data.errors.map(e => e.message || e.type).join(', ')
      : text;
    const err = new Error(`API ${method} ${path} failed (${res.status}): ${errMsg}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

async function getExistingTags() {
  const data = await apiRequest('GET', '/ghost/api/admin/tags/?limit=all');
  return data.tags || [];
}

async function getExistingPosts() {
  const data = await apiRequest('GET', '/ghost/api/admin/posts/?limit=all&filter=status:published,status:draft');
  return data.posts || [];
}

async function getExistingPages() {
  const data = await apiRequest('GET', '/ghost/api/admin/pages/?limit=all&filter=status:published,status:draft');
  return data.pages || [];
}

// --- Sleep helper ---
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- TASK-004: Tags ---

async function createTags() {
  console.log('\n=== TASK-004: Creating Tags ===\n');

  const existingTags = await getExistingTags();
  const existingSlugs = new Set(existingTags.map(t => t.slug));

  const tags = [
    {
      name: 'Portfolio',
      slug: 'portfolio',
      description: 'Client portfolio entries',
    },
    {
      name: '#pricing-website',
      slug: 'hash-pricing-website',
      visibility: 'internal',
    },
    {
      name: '#pricing-ai',
      slug: 'hash-pricing-ai',
      visibility: 'internal',
    },
  ];

  const createdTags = {};

  for (const tag of tags) {
    if (existingSlugs.has(tag.slug)) {
      console.log(`  [skip] Tag "${tag.name}" already exists`);
      const existing = existingTags.find(t => t.slug === tag.slug);
      createdTags[tag.slug] = existing;
      continue;
    }

    try {
      const result = await apiRequest('POST', '/ghost/api/admin/tags/', { tags: [tag] });
      createdTags[tag.slug] = result.tags[0];
      console.log(`  [created] Tag "${tag.name}" (id: ${result.tags[0].id})`);
    } catch (err) {
      // If it's a validation error about duplicate slug, treat as existing
      if (err.status === 422) {
        console.log(`  [skip] Tag "${tag.name}" already exists (422)`);
        const refetch = await getExistingTags();
        const found = refetch.find(t => t.slug === tag.slug);
        if (found) createdTags[tag.slug] = found;
      } else {
        throw err;
      }
    }
  }

  return createdTags;
}

// --- TASK-005: Portfolio Entry ---

async function createPortfolioEntry(tags) {
  console.log('\n=== TASK-005: Creating Portfolio Entry ===\n');

  const existingPosts = await getExistingPosts();
  const existingSlugs = new Set(existingPosts.map(p => p.slug));

  const slug = 'fungi-and-forage';

  if (existingSlugs.has(slug)) {
    console.log(`  [skip] Portfolio post "${slug}" already exists`);
    return;
  }

  const portfolioTag = tags['portfolio'];

  const post = {
    title: 'Fungi & Forage',
    slug,
    custom_excerpt: 'A bespoke website for a small mushroom growing business in the UK.',
    status: 'published',
    canonical_url: 'https://fungi-and-forage.example.co.uk',
    tags: portfolioTag ? [{ id: portfolioTag.id }] : [{ name: 'Portfolio' }],
  };

  try {
    const result = await apiRequest('POST', '/ghost/api/admin/posts/', { posts: [post] });
    console.log(`  [created] Portfolio post "${result.posts[0].title}" (id: ${result.posts[0].id})`);
  } catch (err) {
    if (err.status === 422) {
      console.log(`  [skip] Portfolio post "${slug}" already exists (422)`);
    } else {
      throw err;
    }
  }
}

// --- TASK-006: Pricing Tiers ---

async function createPricingTiers(tags) {
  console.log('\n=== TASK-006: Creating Pricing Tiers ===\n');

  const existingPosts = await getExistingPosts();
  const existingSlugs = new Set(existingPosts.map(p => p.slug));

  const websiteTag = tags['hash-pricing-website'];
  const aiTag = tags['hash-pricing-ai'];

  const tiers = [
    // Website tiers
    {
      title: 'The Starter',
      slug: 'the-starter',
      custom_excerpt: "You need a website that doesn't embarrass you. Yesterday.",
      featured: false,
      status: 'published',
      html: `<p data-price>From £499</p>
<ul>
<li>One-page site that actually looks good</li>
<li>Mobile-ready from day one</li>
<li>Live in two weeks</li>
</ul>`,
      tags: websiteTag ? [{ id: websiteTag.id }] : [{ name: '#pricing-website' }],
    },
    {
      title: 'The Full Works',
      slug: 'the-full-works',
      custom_excerpt: 'You want a proper website that works as hard as you do.',
      featured: true,
      status: 'published',
      html: `<p data-price>From £1,500</p>
<ul>
<li>Multi-page site built around your business</li>
<li>Content you can update yourself</li>
<li>Search engines actually find you</li>
<li>Ready in four weeks</li>
</ul>`,
      tags: websiteTag ? [{ id: websiteTag.id }] : [{ name: '#pricing-website' }],
    },
    {
      title: 'The Flagship',
      slug: 'the-flagship',
      custom_excerpt: 'You want the best site in your industry. Full stop.',
      featured: false,
      status: 'published',
      html: `<p data-price>From £3,500</p>
<ul>
<li>Bespoke design that sets you apart</li>
<li>Custom features built for how you work</li>
<li>Performance that scores 90+ on every test</li>
<li>Ongoing support for the first three months</li>
</ul>`,
      tags: websiteTag ? [{ id: websiteTag.id }] : [{ name: '#pricing-website' }],
    },
    // AI tiers
    {
      title: 'The Audit',
      slug: 'the-audit',
      custom_excerpt: 'Find out where AI can save you time - without the sales pitch.',
      featured: false,
      status: 'published',
      html: `<p data-price>From £299</p>
<ul>
<li>Full review of your day-to-day workflows</li>
<li>Written report with priority recommendations</li>
<li>No commitment, no ongoing fees</li>
</ul>`,
      tags: aiTag ? [{ id: aiTag.id }] : [{ name: '#pricing-ai' }],
    },
    {
      title: 'The Build',
      slug: 'the-build',
      custom_excerpt: "Pick one or two workflows and we'll automate them properly.",
      featured: true,
      status: 'published',
      html: `<p data-price>£800 - £2,500</p>
<ul>
<li>One or two AI workflows built and tested</li>
<li>Hands-on training so your team can use them</li>
<li>30 days of support after delivery</li>
</ul>`,
      tags: aiTag ? [{ id: aiTag.id }] : [{ name: '#pricing-ai' }],
    },
    {
      title: 'The Retainer',
      slug: 'the-retainer',
      custom_excerpt: 'Ongoing AI support without hiring a full-time person.',
      featured: false,
      status: 'published',
      html: `<p data-price>£300 - £600/month</p>
<ul>
<li>Maintenance and updates to existing automations</li>
<li>New workflows added as your needs grow</li>
<li>Monthly call to review what is working</li>
</ul>`,
      tags: aiTag ? [{ id: aiTag.id }] : [{ name: '#pricing-ai' }],
    },
  ];

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];

    if (existingSlugs.has(tier.slug)) {
      console.log(`  [skip] Pricing post "${tier.title}" already exists`);
      // Wait between posts anyway to keep timing consistent
      if (i < tiers.length - 1) await sleep(1000);
      continue;
    }

    try {
      const result = await apiRequest('POST', '/ghost/api/admin/posts/', { posts: [tier] });
      console.log(`  [created] Pricing post "${result.posts[0].title}" (id: ${result.posts[0].id})`);
    } catch (err) {
      if (err.status === 422) {
        console.log(`  [skip] Pricing post "${tier.title}" already exists (422)`);
      } else {
        throw err;
      }
    }

    // Wait 1 second between posts for distinct published_at timestamps
    if (i < tiers.length - 1) {
      await sleep(1000);
    }
  }
}

// --- TASK-007: Site Content Pages ---

async function createSitePages() {
  console.log('\n=== TASK-007: Creating Site Content Pages ===\n');

  const existingPages = await getExistingPages();
  const existingSlugs = new Set(existingPages.map(p => p.slug));

  const pages = [
    {
      title: "Websites that don't look like everyone else's.",
      slug: 'site-hero',
      custom_excerpt: 'Bespoke web design and AI consulting for small UK businesses that refuse to settle.',
      status: 'published',
    },
    {
      title: 'Your competitors have a website. Do you?',
      slug: 'site-cta-strip',
      custom_excerpt: "Let's talk",
      status: 'published',
    },
    {
      title: 'Who we are',
      slug: 'site-about',
      status: 'published',
      html: `<p>We are a small web studio that builds websites for small businesses. Not the kind of websites you get from dragging boxes around on Squarespace at midnight. The kind that make people ask "who made that?"</p>
<p>We also help businesses figure out where AI actually fits into their day - not the buzzword version, the kind that saves you three hours on a Tuesday afternoon.</p>
<p>Based in the UK. Run by people who care about the details. No account managers, no ticket queues, no "your call is important to us."</p>`,
    },
    {
      title: 'Website Builds',
      slug: 'site-what-we-do-websites',
      status: 'published',
      html: `<p>We build websites that make your competitors nervous. No templates, no page builders, no compromise. Just a site that looks like yours and nobody else's.</p>`,
    },
    {
      title: 'AI Consulting',
      slug: 'site-what-we-do-ai',
      status: 'published',
      html: `<p>We find the repetitive tasks eating your day and replace them with AI that actually works. No hype, no jargon - just fewer hours wasted on things a machine should be doing.</p>`,
    },
    {
      title: 'Our Work',
      slug: 'page-work-hero',
      custom_excerpt: 'Real sites for real businesses. No templates, no compromise.',
      status: 'published',
    },
    {
      title: 'What We Offer',
      slug: 'page-services-hero',
      custom_excerpt: 'Two ways we help small businesses punch above their weight.',
      status: 'published',
    },
  ];

  for (const page of pages) {
    if (existingSlugs.has(page.slug)) {
      console.log(`  [skip] Page "${page.slug}" already exists`);
      continue;
    }

    try {
      const result = await apiRequest('POST', '/ghost/api/admin/pages/', { pages: [page] });
      console.log(`  [created] Page "${result.pages[0].slug}" (id: ${result.pages[0].id})`);
    } catch (err) {
      if (err.status === 422) {
        console.log(`  [skip] Page "${page.slug}" already exists (422)`);
      } else {
        throw err;
      }
    }
  }
}

// --- Main ---

async function main() {
  console.log('Ghost CMS Seeding Script');
  console.log(`API: ${API_URL}`);
  console.log('---');

  try {
    const tags = await createTags();
    await createPortfolioEntry(tags);
    await createPricingTiers(tags);
    await createSitePages();

    console.log('\n=== Done ===\n');
  } catch (err) {
    console.error('\nFATAL ERROR:', err.message);
    if (err.body) {
      console.error('Response body:', JSON.stringify(err.body, null, 2));
    }
    process.exit(1);
  }
}

main();
