# Payload CMS Redesign - Page-Centric Content Model

## Problem

The current model is organized by content type (PageHeroes, CtaStrips, ServiceDescriptions, PricingTiers, PortfolioEntries). Editing "the homepage" means opening 4 separate collections. The goal is a Statamic-style experience: click a page, see every section on that page, edit it right there.

---

## 1. Content Model Design

### Overview

- **Pages collection** - one document per page, with a `layout` blocks field containing all sections in order
- **PricingTiers collection** - stays as its own collection (repeating data used on both Homepage and Services page)
- **PortfolioEntries collection** - stays as its own collection (repeating data used on both Homepage and Work page)
- **Media collection** - unchanged
- **SiteSettings global** - nav links, footer tagline, footer nav links, copyright text, contact email
- **Delete** PageHeroes, CtaStrips, ServiceDescriptions collections entirely (their data moves into page blocks)

### Pages Collection

```
slug: 'pages'
admin.useAsTitle: 'title'
```

**Fields:**

| Field | Type | Purpose |
|-------|------|---------|
| `title` | text, required | Page name shown in admin sidebar (e.g. "Homepage") |
| `slug` | text, required, unique | URL path identifier the frontend uses to fetch the page (e.g. `home`, `work`, `services`, `contact`) |
| `layout` | blocks | Ordered array of section blocks - this is where all page content lives |

### Block Types for the `layout` field

Each block type maps to one visual section on the page. The editor sees them in order, top to bottom, exactly matching the rendered page.

#### a) `heroBlock`

For the full hero (homepage) and short heroes (work, services, contact).

| Field | Type | Notes |
|-------|------|-------|
| `headline` | text, required | Main heading |
| `subheadline` | text | Optional subtitle |
| `style` | select: `full` / `short` | Controls which hero CSS variant renders. Default `short`. |
| `ctas` | array | Optional. Each item has `text` (text), `url` (text), `style` (select: `ghost` / `primary`). Homepage hero has 2 ghost CTAs. |
| `toggleButtonText` | text | Optional. If present, renders the before/after toggle button. Only used on homepage. |

#### b) `serviceCardsBlock`

The "What We Do" section on the homepage.

| Field | Type | Notes |
|-------|------|-------|
| `cards` | array, required, min 1, max 6 | Each item has `title` (text, required) and `body` (textarea, required) |

#### c) `portfolioTeaserBlock`

The homepage portfolio preview with a "See all work" link.

| Field | Type | Notes |
|-------|------|-------|
| `sectionHeading` | text, required | e.g. "Our Work" |
| `maxItems` | number, default 3 | How many portfolio entries to show |
| `linkText` | text | e.g. "See all work" |
| `linkUrl` | text | e.g. "/work/" |

This block does NOT inline portfolio data. The frontend fetches from the PortfolioEntries collection, limited by `maxItems`. The editor controls the heading and link text here; actual portfolio items are managed in the PortfolioEntries collection.

#### d) `portfolioGridBlock`

The full portfolio grid on the Work page.

| Field | Type | Notes |
|-------|------|-------|
| `sectionHeading` | text | Optional. Work page uses a visually-hidden heading. |
| `showAll` | checkbox, default true | If true, show all entries. Future: could add filters. |

Same approach - references PortfolioEntries collection, doesn't inline the data.

#### e) `pricingSectionBlock`

A pricing section with heading, intro, and a grid of pricing tiers filtered by category.

| Field | Type | Notes |
|-------|------|-------|
| `sectionHeading` | text, required | e.g. "Website Builds" or "What It Costs" |
| `introText` | text | Optional intro paragraph |
| `category` | select: `website` / `ai`, required | Which pricing tiers to pull in |
| `linkText` | text | Optional "See all services" link text |
| `linkUrl` | text | Optional link URL |

References PricingTiers collection filtered by `category`. Editor controls heading and intro text here; actual tiers are managed in PricingTiers.

#### f) `ctaStripBlock`

A call-to-action banner.

| Field | Type | Notes |
|-------|------|-------|
| `headline` | text, required | e.g. "Your competitors have a website. Do you?" |
| `buttonText` | text, required | e.g. "Let's talk" |
| `buttonUrl` | text, required, default `/contact/` | Link target |

#### g) `contactSectionBlock`

The contact page form area. Form fields are hardcoded in HTML (not CMS-managed), but the email address is editable.

| Field | Type | Notes |
|-------|------|-------|
| `contactEmail` | text | Displayed "prefer email?" address |

### SiteSettings Global

```
slug: 'site-settings'
```

| Field | Type | Notes |
|-------|------|-------|
| `navLinks` | array | Each item: `label` (text, required), `url` (text, required). e.g. `[{label: "Work", url: "/work/"}, ...]` |
| `footerTagline` | text | e.g. "Bespoke web design and AI consulting for small businesses that refuse to settle." |
| `footerLinks` | array | Each item: `label` (text, required), `url` (text, required). Separate from navLinks so nav and footer can differ. |
| `copyrightText` | text | e.g. "Skeleton Crew". Year is auto-generated by JS. |

### PricingTiers Collection - unchanged

Stays exactly as it is: `tierName`, `category`, `audience`, `price`, `features[]`, `isFeatured`, `sortOrder`, `ctaText`, `ctaUrl`. Slug: `pricing-tiers`.

### PortfolioEntries Collection - unchanged

Stays exactly as it is: `projectName`, `description`, `screenshot`, `liveUrl`, `brandColour`, `sortOrder`. Slug: `portfolio-entries`.

### Media Collection - unchanged

---

## 2. Admin UX Walkthrough

### What the editor sees in the sidebar

```
Collections
  Pages (4 items)
  Portfolio Entries
  Pricing Tiers
  Media
Globals
  Site Settings
```

### Editing the Homepage

1. Click **Pages** in the sidebar. See a list: Homepage, Work, Services, Contact.
2. Click **Homepage**. The edit screen shows:
   - **Title:** "Homepage" (read-only label at top)
   - **Slug:** "home"
   - **Layout:** An ordered list of blocks, top to bottom:
     1. **Hero** block - expanded, showing:
        - Headline: "Websites that don't look like everyone else's."
        - Subheadline: "Bespoke web design and AI consulting..."
        - Style: Full
        - CTAs: two items - "See our work" (/work/, ghost) and "Get a quote" (/contact/, ghost)
        - Toggle Button Text: "See what everyone else gives you"
     2. **Service Cards** block - showing cards array:
        - Card 1: title "Website Builds", body "We build websites that..."
        - Card 2: title "AI Consulting", body "We find the repetitive..."
     3. **Portfolio Teaser** block - showing:
        - Section Heading: "Our Work"
        - Max Items: 3
        - Link Text: "See all work"
        - Link URL: "/work/"
     4. **Pricing Section** block - showing:
        - Section Heading: "What It Costs"
        - Category: website
        - Link Text: "See all services"
        - Link URL: "/services/"
     5. **CTA Strip** block - showing:
        - Headline: "Your competitors have a website. Do you?"
        - Button Text: "Let's talk"
        - Button URL: "/contact/"

Every section is visible in one scrollable page. The editor can collapse/expand blocks, drag to reorder, and edit any field inline. This is identical to the Statamic experience.

### How the editor sees pricing "in context"

When looking at the Homepage's Pricing Section block, the editor sees the heading, intro text, and category selector. The actual tier cards (Starter, Growth, Premium) are managed in the Pricing Tiers collection. This is the correct tradeoff because:

- The same tiers appear on both the Homepage (preview) and Services page (full listing)
- Editing a tier's price once updates it everywhere
- The Pricing Tiers collection is a simple flat list - 6 items total, clearly named

The block labels in the admin will show the block type and section heading (e.g. "Pricing Section - What It Costs") so the editor always knows what they're looking at.

### Editing Site Settings

Click **Site Settings** in the sidebar. One screen with:
- Nav Links: Work (/work/), Services (/services/), Contact (/contact/)
- Footer Tagline: "Bespoke web design and AI consulting..."
- Footer Links: Work (/work/), Services (/services/), Contact (/contact/)
- Copyright Text: "Skeleton Crew"

---

## 3. API Response Shape

### Fetch a page

```
GET /api/pages?where[slug][equals]=home&depth=0
```

Response:
```json
{
  "docs": [
    {
      "id": "abc123",
      "title": "Homepage",
      "slug": "home",
      "layout": [
        {
          "blockType": "heroBlock",
          "headline": "Websites that don't look like everyone else's.",
          "subheadline": "Bespoke web design and AI consulting for small UK businesses that refuse to settle.",
          "style": "full",
          "ctas": [
            { "text": "See our work", "url": "/work/", "style": "ghost" },
            { "text": "Get a quote", "url": "/contact/", "style": "ghost" }
          ],
          "toggleButtonText": "See what everyone else gives you"
        },
        {
          "blockType": "serviceCardsBlock",
          "cards": [
            { "title": "Website Builds", "body": "We build websites that make your competitors nervous..." },
            { "title": "AI Consulting", "body": "We find the repetitive tasks eating your day..." }
          ]
        },
        {
          "blockType": "portfolioTeaserBlock",
          "sectionHeading": "Our Work",
          "maxItems": 3,
          "linkText": "See all work",
          "linkUrl": "/work/"
        },
        {
          "blockType": "pricingSectionBlock",
          "sectionHeading": "What It Costs",
          "introText": null,
          "category": "website",
          "linkText": "See all services",
          "linkUrl": "/services/"
        },
        {
          "blockType": "ctaStripBlock",
          "headline": "Your competitors have a website. Do you?",
          "buttonText": "Let's talk",
          "buttonUrl": "/contact/"
        }
      ]
    }
  ]
}
```

### Fetch pricing tiers (separate call, same as today)

```
GET /api/pricing-tiers?where[category][equals]=website&sort=sortOrder
```

Response shape is unchanged from current implementation.

### Fetch portfolio entries (separate call, same as today)

```
GET /api/portfolio-entries?sort=sortOrder&depth=1&limit=3
```

Response shape is unchanged. The `limit` parameter corresponds to the `maxItems` field from the portfolioTeaserBlock.

### Fetch site settings

```
GET /api/globals/site-settings
```

Response:
```json
{
  "navLinks": [
    { "label": "Work", "url": "/work/" },
    { "label": "Services", "url": "/services/" },
    { "label": "Contact", "url": "/contact/" }
  ],
  "footerTagline": "Bespoke web design and AI consulting for small businesses that refuse to settle.",
  "footerLinks": [
    { "label": "Work", "url": "/work/" },
    { "label": "Services", "url": "/services/" },
    { "label": "Contact", "url": "/contact/" }
  ],
  "copyrightText": "Skeleton Crew"
}
```

### Frontend fetch strategy per page

Each page makes 2-3 parallel fetches:

| Page | Fetch 1 | Fetch 2 | Fetch 3 |
|------|---------|---------|---------|
| Homepage | `pages?where[slug][equals]=home` | `portfolio-entries?sort=sortOrder&depth=1&limit=3` | `pricing-tiers?where[category][equals]=website&sort=sortOrder` |
| Work | `pages?where[slug][equals]=work` | `portfolio-entries?sort=sortOrder&depth=1` | - |
| Services | `pages?where[slug][equals]=services` | `pricing-tiers?where[category][equals]=website&sort=sortOrder` | `pricing-tiers?where[category][equals]=ai&sort=sortOrder` |
| Contact | `pages?where[slug][equals]=contact` | - | - |

Site settings are fetched once on first page load (for nav/footer) and cached for the session.

---

## 4. Navigation

Nav links are managed in the **SiteSettings global**, not per-page. Rationale:

- Navigation is identical on every page - it must be a single source of truth
- Editing nav links should not require opening a specific page
- The global is fetched once, cached, and used to render both desktop and mobile nav on every page

The `navLinks` array is ordered - the editor can drag to reorder links in the admin. Each link has a `label` and `url`, which is enough for the current flat nav structure.

If a dropdown/nested nav is needed later, the array items can be extended with an optional `children` array field without breaking the existing structure.

---

## 5. Shared Content

| Content | Where it lives | Why |
|---------|---------------|-----|
| Nav links | SiteSettings global `navLinks` | Same on every page, single source of truth |
| Footer tagline | SiteSettings global `footerTagline` | Same on every page |
| Footer nav links | SiteSettings global `footerLinks` | Could differ from main nav (e.g. add "Privacy Policy" link later) |
| Copyright text | SiteSettings global `copyrightText` | Year is JS-generated, text is CMS-managed |
| Contact email | contactSectionBlock on Contact page | Only appears on one page, so it's per-page content |

---

## 6. Task Breakdown

### Phase 1: Payload config changes

#### 1.1 Create block definitions

Create a new file `payload/src/blocks/` directory with one file per block type:

- `payload/src/blocks/HeroBlock.ts` - heroBlock definition with headline, subheadline, style, ctas array, toggleButtonText
- `payload/src/blocks/ServiceCardsBlock.ts` - serviceCardsBlock with cards array (title + body each)
- `payload/src/blocks/PortfolioTeaserBlock.ts` - portfolioTeaserBlock with sectionHeading, maxItems, linkText, linkUrl
- `payload/src/blocks/PortfolioGridBlock.ts` - portfolioGridBlock with sectionHeading, showAll
- `payload/src/blocks/PricingSectionBlock.ts` - pricingSectionBlock with sectionHeading, introText, category, linkText, linkUrl
- `payload/src/blocks/CtaStripBlock.ts` - ctaStripBlock with headline, buttonText, buttonUrl
- `payload/src/blocks/ContactSectionBlock.ts` - contactSectionBlock with contactEmail

Each file exports a Payload `Block` object.

#### 1.2 Create Pages collection

Create `payload/src/collections/Pages.ts`:
- slug: `pages`
- admin.useAsTitle: `title`
- access.read: `() => true`
- fields: `title` (text), `slug` (text, unique), `layout` (blocks field referencing all 7 block types)

#### 1.3 Create SiteSettings global

Create `payload/src/globals/SiteSettings.ts`:
- slug: `site-settings`
- access.read: `() => true`
- fields: `navLinks` (array of label + url), `footerTagline` (text), `footerLinks` (array of label + url), `copyrightText` (text)

#### 1.4 Update payload.config.ts

- Import Pages collection and SiteSettings global
- Add `Pages` to `collections` array
- Add `globals: [SiteSettings]`
- Remove imports and references for PageHeroes, CtaStrips, ServiceDescriptions
- Keep PricingTiers, PortfolioEntries, Media

#### 1.5 Delete old collection files

Remove:
- `payload/src/collections/PageHeroes.ts`
- `payload/src/collections/CtaStrips.ts`
- `payload/src/collections/ServiceDescriptions.ts`

### Phase 2: Seed script

#### 2.1 Rewrite payload/src/seed.ts

Replace the current seed script with one that:

1. Creates 4 page documents in the Pages collection, each with the correct layout blocks matching the current HTML structure:
   - Homepage (slug: `home`) - heroBlock (full) + serviceCardsBlock + portfolioTeaserBlock + pricingSectionBlock (website) + ctaStripBlock
   - Work (slug: `work`) - heroBlock (short) + portfolioGridBlock
   - Services (slug: `services`) - heroBlock (short) + pricingSectionBlock (website) + pricingSectionBlock (ai) + ctaStripBlock
   - Contact (slug: `contact`) - heroBlock (short) + contactSectionBlock
2. Seeds the SiteSettings global with nav links, footer tagline, footer links, copyright text
3. Keeps the existing PricingTiers and PortfolioEntries seed data unchanged

All current text content from the existing seed data maps directly into the block fields - no content is lost.

### Phase 3: Database migration

#### 3.1 Run migration after config change

After updating the Payload config:
1. Run `npx payload migrate:create` to generate the migration for the new schema
2. Run `npx payload migrate` to apply it
3. Run the new seed script to populate pages
4. Verify in the admin panel that all 4 pages appear with correct content

The old tables (page_heroes, cta_strips, service_descriptions) can be dropped after verifying the new model works. Payload's migration system will handle the new tables automatically.

### Phase 4: Frontend changes

#### 4.1 Rewrite cms-api.js

The current `cms-api.js` makes collection-specific fetch calls (`getSiteContent`, `getPortfolio`, `getPricingWebsite`, etc.) and has page-specific orchestrators (`initCMSContent`, `initWorkPageContent`, `initServicesContent`).

Replace with:

- `getPage(slug)` - fetches `pages?where[slug][equals]=${slug}&depth=0`. Returns the page document with its layout blocks array.
- `getSiteSettings()` - fetches `globals/site-settings`. Returns the global with nav/footer data. Cached for session.
- Keep `getPortfolio(limit?)` - same as current but add optional `limit` param for the teaser vs. full grid distinction.
- Keep `getPricingByCategory(category)` - replaces `getPricingWebsite()` and `getPricingAI()` with a single function that takes `'website'` or `'ai'`.
- Replace the 3 page-specific orchestrators with one generic `initPageContent(slug)` that:
  1. Fetches page + site settings in parallel
  2. Iterates over the layout blocks array
  3. For each block, calls the appropriate renderer
  4. For portfolio/pricing blocks, fires additional fetches as needed

The fallback strategy stays the same: API -> fallback JSON -> hardcoded HTML. The fallback JSON shape will need updating to match the new page-based structure (see 4.3).

#### 4.2 Update renderers.js

Replace the current `renderSiteContent()` monolith (which hunts through arrays by `pageKey` and `serviceKey`) with block-specific renderers:

- `renderHeroBlock(block)` - finds `[data-cms="hero-title"]` / `[data-cms="hero-subtitle"]` and sets text. Also handles CTA buttons and toggle button text if present.
- `renderServiceCardsBlock(block)` - iterates `block.cards` and updates `[data-cms="what-we-do-*"]` elements.
- `renderPortfolioTeaserBlock(block, portfolioData)` - updates heading text and renders portfolio cards using existing `renderPortfolio()` logic.
- `renderPortfolioGridBlock(block, portfolioData)` - same card rendering, different container selector.
- `renderPricingSectionBlock(block, pricingData)` - updates heading/intro text and renders pricing cards using existing `renderPricing()` logic.
- `renderCtaStripBlock(block)` - updates CTA headline and button.
- `renderContactSectionBlock(block)` - updates the contact email address.
- `renderNavigation(settings)` - new function to render nav links from site settings.
- `renderFooter(settings)` - new function to render footer tagline, links, copyright from site settings.

The existing `renderPortfolio()` and `renderPricing()` card-rendering functions stay mostly unchanged - they already take data and a container selector. They just get called from within the block renderers instead of directly from the orchestrator.

#### 4.3 Update main.js

Replace the page-detection logic:

```js
// Current: detects page by which data-cms attributes exist
if (document.querySelector('[data-cms="portfolio-full"]')) {
  initWorkPageContent();
} ...
```

Replace with:

```js
// New: detect page slug from a data attribute on <body> or <main>
const pageSlug = document.body.dataset.page; // e.g. "home", "work", "services", "contact"
if (pageSlug) {
  initPageContent(pageSlug);
}
```

This requires adding `data-page="home"` (etc.) to the `<body>` tag in each HTML file.

#### 4.4 Update HTML files

For each of the 4 HTML files:

1. Add `data-page="..."` attribute to the `<body>` tag
2. Add `data-cms` attributes to nav link containers so `renderNavigation()` can target them
3. Add `data-cms` attributes to footer elements so `renderFooter()` can target them
4. Keep existing `data-cms` attributes for hero, portfolio, pricing, CTA sections - adjust naming if needed to match the new block-based renderers

Specific per-file changes:

- `public/index.html` - add `data-page="home"` to `<body>`
- `public/work/index.html` - add `data-page="work"` to `<body>`
- `public/services/index.html` - add `data-page="services"` to `<body>`
- `public/contact/index.html` - add `data-page="contact"` to `<body>`
- All 4 files: add `data-cms="nav"` to the nav container, `data-cms="footer-tagline"` to the footer tagline, `data-cms="footer-nav"` to the footer nav, `data-cms="footer-copy"` to the copyright text

#### 4.5 Update fallback-content.json generation

If a `scripts/regenerate-fallback.js` exists (referenced in cms-api.js comments but not found in the repo), update it to fetch from the new page-based API instead of the old collection endpoints.

### Phase 5: Cleanup and QA

#### 5.1 Drop old database tables

After confirming everything works:
- Create a Payload migration that drops the `page_heroes`, `cta_strips`, and `service_descriptions` tables

#### 5.2 Update fallback content

Generate a new `fallback-content.json` matching the new API shape.

#### 5.3 Test matrix

- [ ] Admin: can edit Homepage and see all sections in order
- [ ] Admin: can edit each page's hero, CTA, and section headings
- [ ] Admin: can reorder blocks within a page
- [ ] Admin: can edit nav links in Site Settings and see them update on all pages
- [ ] Admin: can edit footer content in Site Settings
- [ ] Admin: can edit pricing tiers in their collection and see changes reflected on Homepage and Services
- [ ] Admin: can edit portfolio entries and see changes reflected on Homepage and Work
- [ ] Frontend: Homepage renders all sections from the new API
- [ ] Frontend: Work page renders hero + full portfolio grid
- [ ] Frontend: Services page renders hero + both pricing sections + CTA
- [ ] Frontend: Contact page renders hero + email address
- [ ] Frontend: Nav and footer render from site settings on all pages
- [ ] Frontend: fallback to static JSON works when API is down
- [ ] Frontend: fallback to hardcoded HTML works when both API and JSON fail
- [ ] Before/after toggle still works on homepage

---

## Why This Design Works

**For the editor:** Every page is one click, one screen. All sections visible in order. No hunting through 4 collections to edit the homepage.

**For multi-client reuse:** The Pages collection + block types are config-as-code. New clients get the same block library. Pages can be created with different combinations of blocks. Adding a new block type (e.g. a testimonials section) means adding one block definition and one renderer - every client site can then use it.

**For the current frontend:** The vanilla JS fetch-and-render pattern stays the same. The main change is fetching one page document instead of 3 collection queries, then iterating its blocks. Portfolio and pricing data is still fetched separately from their own collections.

**For Payload specifically:** This uses Payload's blocks field exactly as intended. No custom components, no plugins, no workarounds. The admin UI for blocks is Payload's best-in-class feature - collapsible, reorderable, with clear labels per block type.
