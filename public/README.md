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

### Pricing tiers

Payload Admin > Pricing Tiers > Create New.

- `tierName` - tier display name
- `category` - "website" or "ai"
- `audience` - who this tier is for (one sentence)
- `price` - price text (e.g. "From £499")
- `features` - add each feature as a separate item
- `isFeatured` - check for the highlighted/recommended tier
- `sortOrder` - display order within category (lower numbers first)
- `ctaText` - button label (defaults to "Get started")
- `ctaUrl` - button link (defaults to "/contact/")

### Site copy

Editable in three Payload collections:

**Page Heroes** (Payload Admin > Page Heroes):

| pageKey | Where it appears | headline = | subheadline = |
|---|---|---|---|
| homepage | Homepage hero | Headline | Subheadline |
| work | /work hero | Headline | Subheadline |
| services | /services hero | Headline | Subheadline |

**CTA Strips** (Payload Admin > CTA Strips):

Single entry with `headline`, `buttonText`, and `buttonUrl`.

**Service Descriptions** (Payload Admin > Service Descriptions):

| serviceKey | Where it appears | title = | body = |
|---|---|---|---|
| websites | "What we do" card | Card title | Card body text |
| ai | "What we do" card | Card title | Card body text |

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
  src/payload.config.ts   - CMS content model (collections and fields)
  src/seed.ts             - Seeds CMS with initial content
  Dockerfile              - Production build for Payload container
scripts/
  regenerate-fallback.js  - Cron script for fallback JSON
  test-before-mode.js     - Toggle demo CSS coverage test
```
