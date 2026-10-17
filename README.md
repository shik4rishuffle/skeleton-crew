# Skeleton Crew

The agency's own site, skeleton-crew.co.uk, and the demo piece for the block platform. Next.js
static export with TinaCMS visual editing on the shared block library. The old vanilla HTML
frontend and its Payload CMS are kept under `legacy-static/` and `payload/` until the Payload
container on the VPS is retired.

## Stack

- Next.js 16 (App Router, `output: "export"`), React 19
- TinaCMS 3 with visual editing
- `@skeleton-crew/blocks` pinned by git tag for schema, renderer and shared blocks
- Fonts via `next/font`: Permanent Marker (hero and logo), Bebas Neue (headings), DM Sans (body)

## Run it

```bash
npm install
npm run dev
```

Site at http://localhost:3200, editor at http://localhost:3200/admin (no login in local mode).

```bash
npm run build:local      # static export to out/, no Tina Cloud needed
npm run build            # production, needs PUBLIC_TINA_CLIENT_ID and TINA_TOKEN
npm run test:before-mode # every opted-in block has theirs/ours rules
```

## Content

- `content/pages/{home,work,services,contact}.json`: pages as block lists
- `content/globals/site.json`: name, logo, nav, footer, contact (email, Web3Forms endpoint and key)
- `content/portfolio/*.json`: one file per project, shown by the portfolio blocks

Opted-in blocks are listed in `site.blocks.ts`. Shared: pageHeading, richText, textWithImage,
cta, faq, serviceCards, pricing, portfolioTeaser, portfolioGrid, contactSection, testimonials,
logoStrip. Bespoke, in `src/blocks/agencyHero/`: the full-height home hero with the toggle button.

## Theirs/ours toggle

The star feature. `src/components/ThemeToggle.tsx` flips a `before-mode` class on `<body>`;
`src/app/before.css` overrides the design tokens (grey, royal blue, Arial, square corners) plus
a few rules the tokens cannot reach. Because every block only reads tokens, the whole site
transforms from one class. The fixed pill bottom right reads OURS or THEIRS and is reachable on
every page; the hero button toggles the same state.

## Deployment

`npm run build` writes plain files to `out/`. On the Skeleton Crew VPS that goes into
`clients/skeleton-crew/public/` for the `static-skeleton-crew` nginx container. Clean URLs
(`/work`, not `/work/`) need `try_files $uri $uri.html $uri/ =404;` in nginx; the old
trailing-slash URLs should get a redirect. The platform work (a `--type static` client, custom
nginx, CI build and rsync) is tracked in the vault's Tina migration plan.

## What changed from the old site

- Blocks now drive the layout: reorder, add or remove sections in the editor and the page changes.
- GSAP and the vendored ScrollTrigger are gone. Reveals and parallax come from the library.
- The Web3Forms access key moved from the HTML into Site settings in Tina. The Ghost-era keys in
  `PROJECT_BRIEF.md` should be revoked and removed.
- Design is unchanged in spirit and still not signed off (see `Feedback.md`).
