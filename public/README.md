# Skeleton Crew

Static HTML/CSS/JS site that fetches all content from the Ghost Content API at runtime. No build step - serve the `public/` directory and everything works.

## Quick start

Serve `public/` with any static file server (Nginx, `python -m http.server`, etc.). Ghost API calls work automatically if the CMS is reachable; the site degrades gracefully with fallback content if it is not.

## Configuration

### Ghost API

File: `js/ghost-api.js` - edit the constants at the top:

```js
const API_BASE = 'https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost/api/content';
const API_KEY = '6a81932590f32d95416a5191a7';
```

- Dev: `https://cms-skeleton-crew.dev.skeleton-crew.co.uk`
- Prod: `https://cms-skeleton-crew.skeleton-crew.co.uk`

### Form handler

File: `contact/index.html` - replace `[FORM_HANDLER_ID]` with your Web3Forms access key. Get one free at [web3forms.com](https://web3forms.com).

### Accent colour

File: `css/variables.css` - change `--color-accent`. This is the only file to edit per client. All colours, fonts, spacing, and layout tokens live here.

## Content management

All user-facing copy is managed in Ghost Admin. The frontend fetches it via the Content API on page load.

### Portfolio entry

Ghost Admin > Posts > New post. Add the `portfolio` tag, then set:

- `title` - project name
- `custom_excerpt` - one-line description
- `feature_image` - screenshot
- `canonical_url` - link to the live site

Publish. The card appears on the homepage and /work page automatically.

### Pricing tiers

Each tier is a separate post tagged with an internal tag: `#pricing-website` or `#pricing-ai`. Publish order (ascending) controls display order.

Post body format:

```html
<p>From &pound;499</p>
<ul>
  <li>Feature one</li>
  <li>Feature two</li>
</ul>
```

The first `<p>` is parsed as the price and the `<ul>` as the feature list. Set `featured: true` on the highlighted/recommended tier.

### Site copy

Editable Ghost pages, fetched by slug:

| Slug | Where it appears | `title` = | `custom_excerpt` = |
|---|---|---|---|
| `site-hero` | Homepage hero | Headline | Subheadline |
| `site-cta-strip` | Homepage CTA strip | Headline | Button text |
| `site-about` | Homepage about | Headline | (body = content) |
| `site-what-we-do-websites` | "What we do" card | Card title | (body = content) |
| `site-what-we-do-ai` | "What we do" card | Card title | (body = content) |
| `page-work-hero` | /work hero | Headline | Subheadline |
| `page-services-hero` | /services hero | Headline | Subheadline |

## Toggle demo

The before/after toggle swaps a `.before-mode` class on `<body>` with a GSAP-animated transition. `css/before.css` contains all the "generic template" overrides.

When adding new components, add corresponding `.before-mode` rules in `css/before.css`. Run the coverage test to verify nothing is missing:

```
node scripts/test-before-mode.js
```

## Fallback content

`js/fallback-content.json` is a static snapshot of all Ghost content, used when the API is unreachable.

Regenerate weekly via cron:

```
0 3 * * 0 node scripts/regenerate-fallback.js
```

Manual regeneration:

```
node scripts/regenerate-fallback.js
```

The script will not overwrite the existing fallback file if Ghost is unreachable.

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
  js/ghost-api.js         - Ghost Content API client
  js/renderers.js         - DOM rendering for CMS content
  js/toggle.js            - Before/after toggle logic
  js/animations.js        - GSAP scroll animations
  js/nav.js               - Navigation (mobile menu, sticky)
  js/contact-form.js      - AJAX form submission
  js/main.js              - Entry point
  js/vendor/              - GSAP (self-hosted, no CDN)
  assets/                 - Logo SVGs and favicon
scripts/
  regenerate-fallback.js  - Cron script for fallback JSON
  seed-ghost-content.js   - Seeds Ghost with initial content
```
