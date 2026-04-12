# Skeleton Crew

Static HTML/CSS/JS site that fetches all content from the Payload CMS REST API at runtime. No build step - serve the `public/` directory and everything works.

## Quick start

Serve `public/` with any static file server (Nginx, `python -m http.server`, etc.). CMS API calls work automatically if Payload is reachable; the site degrades gracefully with fallback content if it is not.

## Configuration

### CMS API

File: `js/cms-api.js` - edit the constant at the top:

```js
const API_BASE = 'https://cms.skeleton-crew.co.uk/api';
```

No API key is needed - the Payload REST API is configured for public read access.

### Form handler

File: `contact/index.html` - the Web3Forms access key is already configured. To change it, replace the `access_key` value in the hidden input field.

### Accent colour

File: `css/variables.css` - change `--color-accent`. This is the only file to edit per client. All colours, fonts, spacing, and layout tokens live here.

## Content management

All user-facing copy is managed in the Payload CMS admin panel. The frontend fetches it via the REST API on page load.

### Portfolio entry

Payload Admin > Portfolio Entries > Create New.

- `projectName` - display title
- `description` - one-line description
- `screenshot` - upload project screenshot
- `liveUrl` - link to the live site
- `brandColour` - hex colour for card accent (e.g. #ff6b35)
- `sortOrder` - display order (lower numbers first)

Save. The card appears on the homepage and /work page automatically.

### Pages

Payload Admin > Pages. Each page has a `layout` field with content blocks you can add, remove, and reorder.

**Available block types:**

| Block | What it does |
|---|---|
| Hero | Page hero with headline, subheadline, and optional CTA buttons |
| Service Cards | "What we do" cards with title and body |
| Portfolio Teaser | Portfolio preview with heading, max items, and "see all" link |
| Portfolio Grid | Full portfolio grid (work page) |
| Pricing Section | Pricing tiers with heading, intro, and embedded tier cards (name, price, features, CTA) |
| CTA Strip | Call-to-action banner with headline and button |
| Contact Section | Contact page email address |

### Site Settings

Payload Admin > Site Settings (under Globals).

- `navLinks` - navigation links shown on every page
- `footerTagline` - footer description text
- `footerLinks` - footer navigation links
- `copyrightText` - copyright holder name (year is auto-generated)

## Toggle demo

The before/after toggle swaps a `.before-mode` class on `<body>` with a GSAP-animated transition. `css/before.css` contains all the "generic template" overrides.

When adding new components, add corresponding `.before-mode` rules in `css/before.css`. Run the coverage test to verify nothing is missing:

```
node scripts/test-before-mode.js
```

## Fallback content

`js/fallback-content.json` is a static snapshot of all CMS content, used when the API is unreachable.

Regenerate weekly via cron:

```
0 3 * * 0 node scripts/regenerate-fallback.js
```

Manual regeneration:

```
node scripts/regenerate-fallback.js
```

The script will not overwrite the existing fallback file if the CMS is unreachable.

## Deploy

```
skeleton deploy skeleton-crew
```

## File structure

```
public/
  index.html              - Homepage
  work/index.html         - Portfolio page
  services/index.html     - Pricing/services page
  contact/index.html      - Contact form
  css/variables.css       - Design tokens (single file to reskin)
  css/reset.css           - CSS reset
  css/global.css          - Base styles
  css/before.css          - Toggle demo "before" overrides
  css/components/         - Per-component stylesheets
  js/cms-api.js           - Payload CMS REST API client
  js/renderers.js         - DOM rendering for CMS content
  js/toggle.js            - Before/after toggle logic
  js/animations.js        - GSAP scroll animations
  js/nav.js               - Navigation (mobile menu, sticky)
  js/contact-form.js      - AJAX form submission
  js/main.js              - Entry point
  js/vendor/              - GSAP (self-hosted, no CDN)
  assets/                 - Logo SVGs and favicon
payload/
  src/payload.config.ts   - CMS config (collections, globals, blocks)
  src/blocks/             - Block type definitions for the page builder
  src/collections/        - Payload collections (Pages, PortfolioEntries, Media)
  src/globals/            - Payload globals (SiteSettings)
  src/seed.ts             - Seeds CMS with initial content
  Dockerfile              - Production build for Payload container
scripts/
  regenerate-fallback.js  - Cron script for fallback JSON
  test-before-mode.js     - Toggle demo CSS coverage test
```
