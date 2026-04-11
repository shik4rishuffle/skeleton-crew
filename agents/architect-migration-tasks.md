# Migration Task Breakdown - Ghost CMS to Payload CMS 3

---

## Phase A: Payload Application (new code)

---

## Task M-001: Payload Project Scaffolding
**Phase:** A | **Agent:** Architect
**Priority:** Critical | **Status:** TODO
**Est. Effort:** M | **Dependencies:** none

### Context
The Payload CMS 3 application needs a home in this repo. All config, types, and build tooling live in a `payload/` directory at the repo root. The VPS infrastructure (Postgres container, networking) is being stood up in parallel by a separate orchestrator - this task only covers the application code.

### What Needs Doing
1. Create `payload/` directory at the repo root.
2. Create `payload/package.json` with:
   - `name`: `skeleton-crew-cms`
   - Dependencies: `payload` (latest 3.x), `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/next` (Payload 3 is built on Next.js), `next`, `react`, `react-dom`, `sharp` (for image processing)
   - Dev dependencies: `typescript`, `@types/node`, `@types/react`
   - Scripts: `dev`, `build`, `start`, `seed` (see M-005)
3. Create `payload/tsconfig.json` - standard Next.js + Payload TypeScript config with strict mode enabled.
4. Create `payload/next.config.mjs` - import `withPayload` from `@payloadcms/next/withPayload` and wrap the Next.js config.
5. Create `payload/.env.example` with placeholder values:
   ```
   DATABASE_URI=postgres://payload:secret@localhost:5432/payload
   PAYLOAD_SECRET=replace-with-random-32-char-string
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   ```
6. Add `payload/node_modules/` and `payload/.env` to the repo's `.gitignore`.

### Files
- `payload/package.json` (create)
- `payload/tsconfig.json` (create)
- `payload/next.config.mjs` (create)
- `payload/.env.example` (create)
- `.gitignore` (modify - add payload entries)

### How to Test
- `cd payload && npm install` completes without errors.
- `npx tsc --noEmit` passes after M-002 is done (types depend on the config).

### On Completion
Queue M-002 (collections) and M-003 (Dockerfile) in parallel.

---

## Task M-002: Payload Collections and Config
**Phase:** A | **Agent:** Architect
**Priority:** Critical | **Status:** TODO
**Est. Effort:** L | **Dependencies:** M-001

### Context
This is the core of the Payload application - the `payload.config.ts` that defines all 5 collections (plus the built-in media collection) matching the content model from `architect-cms-recommendation.md` section 2. Every field must be typed correctly so the REST API response shape matches what the frontend will consume in Phase B.

### What Needs Doing
1. Create `payload/src/payload.config.ts`:
   - Import `buildConfig` from `payload`.
   - Import `postgresAdapter` from `@payloadcms/db-postgres`.
   - Import `lexicalEditor` from `@payloadcms/richtext-lexical`.
   - Configure `serverURL` from `NEXT_PUBLIC_SERVER_URL` env var.
   - Set `db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })`.
   - Set `editor: lexicalEditor({})`.
   - Define the following collections:

2. **Collection: `media`** (upload collection):
   - `slug: 'media'`
   - `upload: true` with `staticDir: 'media'`
   - `fields`: `alt` (text, required)
   - `access`: `read: () => true` (public)

3. **Collection: `page-heroes`**:
   - `slug: 'page-heroes'`
   - `admin: { useAsTitle: 'headline' }`
   - `access: { read: () => true }`
   - Fields:
     - `pageKey`: `type: 'select'`, required, options: `['homepage', 'work', 'services', 'contact']`, unique
     - `headline`: `type: 'text'`, required
     - `subheadline`: `type: 'text'`

4. **Collection: `cta-strips`**:
   - `slug: 'cta-strips'`
   - `admin: { useAsTitle: 'headline' }`
   - `access: { read: () => true }`
   - Fields:
     - `headline`: `type: 'text'`, required
     - `buttonText`: `type: 'text'`, required
     - `buttonUrl`: `type: 'text'`, required, defaultValue `'/contact/'`

5. **Collection: `service-descriptions`**:
   - `slug: 'service-descriptions'`
   - `admin: { useAsTitle: 'title' }`
   - `access: { read: () => true }`
   - Fields:
     - `serviceKey`: `type: 'select'`, required, options: `['websites', 'ai']`, unique
     - `title`: `type: 'text'`, required
     - `body`: `type: 'richText'`, required

6. **Collection: `pricing-tiers`**:
   - `slug: 'pricing-tiers'`
   - `admin: { useAsTitle: 'tierName' }`
   - `defaultSort: 'sortOrder'`
   - `access: { read: () => true }`
   - Fields:
     - `tierName`: `type: 'text'`, required
     - `category`: `type: 'select'`, required, options: `['website', 'ai']`
     - `audience`: `type: 'text'`, required
     - `price`: `type: 'text'`, required
     - `features`: `type: 'array'`, required, fields: `[{ name: 'feature', type: 'text', required: true }]`
     - `isFeatured`: `type: 'checkbox'`, defaultValue `false`
     - `sortOrder`: `type: 'number'`, required
     - `ctaText`: `type: 'text'`, defaultValue `'Get started'`
     - `ctaUrl`: `type: 'text'`, defaultValue `'/contact/'`

7. **Collection: `portfolio-entries`**:
   - `slug: 'portfolio-entries'`
   - `admin: { useAsTitle: 'projectName' }`
   - `defaultSort: 'sortOrder'`
   - `access: { read: () => true }`
   - Fields:
     - `projectName`: `type: 'text'`, required
     - `description`: `type: 'text'`, required
     - `screenshot`: `type: 'upload'`, relationTo `'media'`
     - `liveUrl`: `type: 'text'`
     - `brandColour`: `type: 'text'`
     - `sortOrder`: `type: 'number'`, defaultValue `0`

8. Set top-level `access` on all collections: `read: () => true` (public read, no API key needed). Write/update/delete should require authentication (the default - only logged-in admin users).

9. Create `payload/src/app/(payload)/` directory structure required by Payload 3's Next.js integration:
   - `layout.tsx` - root layout importing Payload admin
   - `admin/[[...segments]]/page.tsx` - catch-all admin route
   - `api/[...slug]/route.ts` - catch-all API route

### Files
- `payload/src/payload.config.ts` (create)
- `payload/src/app/(payload)/layout.tsx` (create)
- `payload/src/app/(payload)/admin/[[...segments]]/page.tsx` (create)
- `payload/src/app/(payload)/api/[...slug]/route.ts` (create)

### How to Test
- `cd payload && npx tsc --noEmit` passes with no type errors.
- With a running Postgres instance, `npm run dev` starts the Payload admin panel at `http://localhost:3000/admin`.
- `GET http://localhost:3000/api/pricing-tiers` returns `{ docs: [], totalDocs: 0, ... }` (empty but valid JSON).
- `GET http://localhost:3000/api/portfolio-entries` returns the same shape.
- Unauthenticated requests to read endpoints succeed (public access).
- Unauthenticated POST/PATCH/DELETE requests are rejected with 401.

### On Completion
Queue M-004 (access control verification) and M-005 (seed script).

---

## Task M-003: Payload Dockerfile
**Phase:** A | **Agent:** Architect
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-001

### Context
The Payload app runs as a Docker container on the VPS. The Dockerfile builds the Next.js + Payload application into a production image. The separate infrastructure orchestrator will reference this Dockerfile in the docker-compose config.

### What Needs Doing
1. Create `payload/Dockerfile`:
   - Base image: `node:20-alpine`
   - Multi-stage build:
     - **Stage 1 (builder):** Copy `package.json` and `package-lock.json`, run `npm ci`, copy source, run `npm run build`.
     - **Stage 2 (runner):** Copy built output from stage 1, set `NODE_ENV=production`, expose port 3000, run `npm start`.
   - Install `sharp` dependencies for Alpine (`libc6-compat`).
   - Create a non-root user for the runtime stage.
   - Set working directory to `/app`.
2. Create `payload/.dockerignore`:
   - Exclude `node_modules`, `.env`, `.next`, `media/` (mounted as volume at runtime).

### Files
- `payload/Dockerfile` (create)
- `payload/.dockerignore` (create)

### How to Test
- `cd payload && docker build -t skeleton-payload .` completes without errors.
- `docker run -e DATABASE_URI=... -e PAYLOAD_SECRET=test -p 3000:3000 skeleton-payload` starts and responds to health checks.
- Image size is under 500 MB (target ~300-400 MB with multi-stage build).

### On Completion
Dockerfile is ready for the infrastructure orchestrator to reference.

---

## Task M-004: Payload Access Control Verification
**Phase:** A | **Agent:** Architect
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-002

### Context
The frontend fetches content from the Payload REST API without authentication. All collection read endpoints must be publicly accessible. Write endpoints must require admin authentication. This must be verified explicitly because a misconfiguration here breaks the entire frontend.

### What Needs Doing
1. With Payload running locally (from M-002), verify each endpoint:
   - `GET /api/page-heroes` - returns 200 with `docs` array (unauthenticated)
   - `GET /api/cta-strips` - returns 200 (unauthenticated)
   - `GET /api/service-descriptions` - returns 200 (unauthenticated)
   - `GET /api/pricing-tiers` - returns 200 (unauthenticated)
   - `GET /api/portfolio-entries` - returns 200 (unauthenticated)
   - `GET /api/media/:id` - returns 200 (unauthenticated)
   - `POST /api/pricing-tiers` (no auth header) - returns 401 or 403
   - `PATCH /api/pricing-tiers/:id` (no auth header) - returns 401 or 403
   - `DELETE /api/pricing-tiers/:id` (no auth header) - returns 401 or 403
2. If any read endpoint returns 401/403, fix the `access.read` config in `payload.config.ts`.
3. Document the full set of REST API endpoints and their response shapes in a brief reference section at the bottom of `architect-migration-tasks.md` (this file) for the Frontend agent.

### Files
- `payload/src/payload.config.ts` (modify if needed)
- `AGENTS/architect-migration-tasks.md` (modify - add API reference appendix)

### How to Test
- Run all curl commands listed above against the local Payload instance.
- Every read returns 200, every unauthenticated write returns 401/403.

### On Completion
Queue M-005 (seed script). The API contract is confirmed and the Frontend agent can begin Phase B.

---

## Task M-005: Payload Seed Script
**Phase:** A | **Agent:** Architect
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** M-002

### Context
Replaces `scripts/seed-ghost-content.js`. Uses Payload's Local API to create all initial content entries. No JWT generation, no Ghost Admin API, no `sleep()` hacks for ordering. The seed data is the same content currently in Ghost, structured to match the new Payload collections. The seed script must be idempotent - running it twice should not create duplicate entries.

### What Needs Doing
1. Create `payload/src/seed.ts` (TypeScript, runs via Payload's Local API):
   - Import `getPayload` from `payload` and the config.
   - Define a `seed()` async function that:
     - Checks for existing entries before creating (idempotent).
     - Creates a first admin user if none exists (email/password from env or defaults for dev).
     - Creates entries in this order:

2. **Page Heroes** (4 entries):
   - `{ pageKey: 'homepage', headline: "Websites that don't look like everyone else's.", subheadline: 'Bespoke web design and AI consulting for small UK businesses that refuse to settle.' }`
   - `{ pageKey: 'work', headline: 'Our Work', subheadline: 'Real sites for real businesses. No templates, no compromise.' }`
   - `{ pageKey: 'services', headline: 'What We Offer', subheadline: 'Two ways we help small businesses punch above their weight.' }`
   - `{ pageKey: 'contact', headline: "Let's talk.", subheadline: null }`

3. **CTA Strips** (1 entry):
   - `{ headline: 'Your competitors have a website. Do you?', buttonText: "Let's talk", buttonUrl: '/contact/' }`

4. **Service Descriptions** (2 entries):
   - `{ serviceKey: 'websites', title: 'Website Builds', body: <richText: "We build websites that make your competitors nervous. No templates, no page builders, no compromise. Just a site that looks like yours and nobody else's."> }`
   - `{ serviceKey: 'ai', title: 'AI Consulting', body: <richText: "We find the repetitive tasks eating your day and replace them with AI that actually works. No hype, no jargon - just fewer hours wasted on things a machine should be doing."> }`
   - Note: `body` is a Lexical rich text field. The seed must use the Lexical JSON format, not raw HTML. Construct a simple paragraph node for each.

5. **Pricing Tiers** (6 entries):
   - Website tiers:
     - `{ tierName: 'The Starter', category: 'website', audience: "You need a website that doesn't embarrass you. Yesterday.", price: 'From \u00a3499', features: [{feature: 'One-page site that actually looks good'}, {feature: 'Mobile-ready from day one'}, {feature: 'Live in two weeks'}], isFeatured: false, sortOrder: 1, ctaText: 'Get started', ctaUrl: '/contact/' }`
     - `{ tierName: 'The Full Works', category: 'website', audience: 'You want a proper website that works as hard as you do.', price: 'From \u00a31,500', features: [{feature: 'Multi-page site built around your business'}, {feature: 'Content you can update yourself'}, {feature: 'Search engines actually find you'}, {feature: 'Ready in four weeks'}], isFeatured: true, sortOrder: 2, ctaText: 'Get started', ctaUrl: '/contact/' }`
     - `{ tierName: 'The Flagship', category: 'website', audience: 'You want the best site in your industry. Full stop.', price: 'From \u00a33,500', features: [{feature: 'Bespoke design that sets you apart'}, {feature: 'Custom features built for how you work'}, {feature: 'Performance that scores 90+ on every test'}, {feature: 'Ongoing support for the first three months'}], isFeatured: false, sortOrder: 3, ctaText: 'Get started', ctaUrl: '/contact/' }`
   - AI tiers:
     - `{ tierName: 'The Audit', category: 'ai', audience: 'Find out where AI can save you time - without the sales pitch.', price: 'From \u00a3299', features: [{feature: 'Full review of your day-to-day workflows'}, {feature: 'Written report with priority recommendations'}, {feature: 'No commitment, no ongoing fees'}], isFeatured: false, sortOrder: 1, ctaText: 'Get started', ctaUrl: '/contact/' }`
     - `{ tierName: 'The Build', category: 'ai', audience: "Pick one or two workflows and we'll automate them properly.", price: '\u00a3800 - \u00a32,500', features: [{feature: 'One or two AI workflows built and tested'}, {feature: 'Hands-on training so your team can use them'}, {feature: '30 days of support after delivery'}], isFeatured: true, sortOrder: 2, ctaText: 'Get started', ctaUrl: '/contact/' }`
     - `{ tierName: 'The Retainer', category: 'ai', audience: 'Ongoing AI support without hiring a full-time person.', price: '\u00a3300 - \u00a3600/month', features: [{feature: 'Maintenance and updates to existing automations'}, {feature: 'New workflows added as your needs grow'}, {feature: 'Monthly call to review what is working'}], isFeatured: false, sortOrder: 3, ctaText: 'Get started', ctaUrl: '/contact/' }`

6. **Portfolio Entries** (1 entry):
   - `{ projectName: 'Fungi & Forage', description: 'A bespoke website for a small mushroom growing business in the UK.', liveUrl: 'https://fungi-and-forage.example.co.uk', brandColour: null, sortOrder: 1 }`
   - No screenshot (no media file to upload in seed).

7. Add a `seed` script to `payload/package.json` that runs `ts-node src/seed.ts` or equivalent Payload CLI command.

### Files
- `payload/src/seed.ts` (create)
- `payload/package.json` (modify - add seed script)

### How to Test
- With Payload running and an empty database: `npm run seed` completes without errors.
- `GET /api/page-heroes` returns 4 docs.
- `GET /api/cta-strips` returns 1 doc.
- `GET /api/service-descriptions` returns 2 docs.
- `GET /api/pricing-tiers` returns 6 docs.
- `GET /api/pricing-tiers?where[category][equals]=website&sort=sortOrder` returns 3 docs in correct order: The Starter, The Full Works, The Flagship.
- `GET /api/portfolio-entries` returns 1 doc.
- Run `npm run seed` again - no duplicates created (idempotent).

### On Completion
The Payload CMS is fully populated with seed data. Phase A is complete. Phase B can begin.

---

## Phase B: Frontend Migration (modify existing code)

---

## Task M-006: Create cms-api.js - Payload REST API Client
**Phase:** B | **Agent:** Frontend
**Priority:** Critical | **Status:** TODO
**Est. Effort:** L | **Dependencies:** M-004 (API contract confirmed)

### Context
Complete rewrite of `public/js/ghost-api.js`. The new file fetches from Payload's REST API instead of Ghost's Content API. The caching logic, timeout handling, and fallback pattern remain structurally identical - only the URLs, query parameters, response shapes, and authentication change.

### What Needs Doing
1. Create `public/js/cms-api.js` (new file, do not modify `ghost-api.js` yet - it gets deleted in Phase C).

2. **Config constants** (top of file):
   ```js
   const API_BASE = 'https://cms.skeleton-crew.co.uk/api';
   const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
   const FETCH_TIMEOUT = 5000; // 5 seconds
   ```
   - No `API_KEY` constant. Payload read endpoints are public.
   - Note: the base URL changes from `cms.skeleton-crew.co.uk/ghost/api/content` to `cms.skeleton-crew.co.uk/api`.

3. **`fetchFromPayload(collection, params, options)`** - internal fetch function:
   - Builds URL: `${API_BASE}/${collection}?${queryString}`
   - No `key` parameter appended (no API key needed).
   - Cache key format: `cms_${collection}_${sortedParams}` (changed prefix from `ghost_` to `cms_`).
   - SessionStorage caching: identical logic to current `fetchFromGhost`.
   - AbortController timeout: identical logic.
   - **Response shape change:** Payload returns `{ docs: [...], totalDocs, page, ... }`. Extract `json.docs` instead of `json[responseKey]`.
   - Return the `docs` array, or `null` on failure.

4. **`getPortfolio()`** - export:
   ```js
   return fetchFromPayload('portfolio-entries', {
     sort: 'sortOrder',
     depth: '1'  // populates the media relation for screenshot
   });
   ```
   - `depth=1` tells Payload to populate the `screenshot` relationship, returning the full media object (with `url`, `alt`, `width`, `height`) instead of just an ID.
   - No tag filter needed - portfolio entries are their own collection.

5. **`getPricingWebsite()`** - export:
   ```js
   return fetchFromPayload('pricing-tiers', {
     'where[category][equals]': 'website',
     sort: 'sortOrder'
   });
   ```

6. **`getPricingAI()`** - export:
   ```js
   return fetchFromPayload('pricing-tiers', {
     'where[category][equals]': 'ai',
     sort: 'sortOrder'
   });
   ```

7. **`getSiteContent()`** - export:
   - This function currently fetches Ghost pages by slug and indexes them. In Payload, the equivalent data lives across 3 collections: `page-heroes`, `cta-strips`, and `service-descriptions`. Fetch all three in parallel and assemble an object that `renderSiteContent()` can consume.
   - Implementation:
     ```js
     const [heroes, ctaStrips, services] = await Promise.all([
       fetchFromPayload('page-heroes'),
       fetchFromPayload('cta-strips'),
       fetchFromPayload('service-descriptions')
     ]);
     if (!heroes && !ctaStrips && !services) return null;
     return { heroes: heroes || [], ctaStrips: ctaStrips || [], services: services || [] };
     ```
   - This returns a different shape than the current slug-indexed object. Task M-007 (renderers update) accounts for this.

8. **Fallback JSON loader** - `loadFallbackJSON()`:
   - Identical to current implementation. The fallback file path stays `/js/fallback-content.json`. The internal structure of the JSON will change (see M-010), but the loader function itself is unchanged.

9. **Render orchestrators** - `initCMSContent()`, `initWorkPageContent()`, `initServicesContent()`:
   - Structurally identical to the current `initGhostContent()`, `initWorkPageContent()`, `initServicesContent()`.
   - Rename `initGhostContent` to `initCMSContent`.
   - Change the `data-ghost` selector strings to `data-cms` (matching M-008).
   - Import renderers from `./renderers.js` (same as before).

10. **Imports** - update to import from `./renderers.js` (same file, but the function signatures change per M-007).

### Files
- `public/js/cms-api.js` (create)

### How to Test
- Temporarily import `cms-api.js` instead of `ghost-api.js` in `main.js`.
- With Payload running and seeded (M-005), load the homepage.
- Portfolio cards render with correct project names.
- Pricing cards render with correct tier names, prices, and features.
- Hero title and subtitle render from CMS.
- CTA strip headline and button text render from CMS.
- "What we do" cards render titles and body text from CMS.
- Open DevTools Network tab: no requests to `/ghost/api/`. All requests go to `/api/` endpoints.
- Disable the Payload server: the site falls back to fallback JSON, then to hardcoded fallback content.

### On Completion
Queue M-007 (renderers update) immediately - the two are tightly coupled.

---

## Task M-007: Update renderers.js for Payload Field Names
**Phase:** B | **Agent:** Frontend
**Priority:** Critical | **Status:** TODO
**Est. Effort:** M | **Dependencies:** M-006

### Context
`public/js/renderers.js` currently reads Ghost field names (`title`, `custom_excerpt`, `feature_image`, `canonical_url`, `html`, `featured`, `tags`). These must be updated to Payload field names. The DOM update logic and HTML output structure remain identical - only the property names on the data objects change.

### What Needs Doing

1. **`renderSiteContent(data)`** - the `data` parameter changes shape:
   - **Current:** `data` is a slug-indexed object: `data['site-hero'].title`, `data['site-hero'].custom_excerpt`, etc.
   - **New:** `data` is `{ heroes: [...], ctaStrips: [...], services: [...] }`.
   - Update the function body:

   **Hero section:**
   ```js
   const hero = data.heroes?.find(h => h.pageKey === 'homepage');
   if (hero) {
     const heroTitle = document.querySelector('[data-cms="hero-title"]');
     const heroSub = document.querySelector('[data-cms="hero-subtitle"]');
     if (heroTitle) {
       heroTitle.textContent = hero.headline || heroTitle.textContent;
       const reveal = document.querySelector('.hero__headline-reveal');
       if (reveal) reveal.textContent = heroTitle.textContent;
     }
     if (heroSub) heroSub.textContent = hero.subheadline || heroSub.textContent;
   }
   ```

   **CTA strip:**
   ```js
   const cta = data.ctaStrips?.[0]; // single entry
   if (cta) {
     const ctaTitle = document.querySelector('[data-cms="cta-title"]');
     const ctaButton = document.querySelector('[data-cms="cta-button"]');
     if (ctaTitle) ctaTitle.textContent = cta.headline || ctaTitle.textContent;
     if (ctaButton) ctaButton.textContent = cta.buttonText || ctaButton.textContent;
   }
   ```

   **Work page hero:**
   ```js
   const workHero = data.heroes?.find(h => h.pageKey === 'work');
   if (workHero) {
     const workTitle = document.querySelector('[data-cms="work-hero-title"]');
     const workSub = document.querySelector('[data-cms="work-hero-subtitle"]');
     if (workTitle) workTitle.textContent = workHero.headline || workTitle.textContent;
     if (workSub) workSub.textContent = workHero.subheadline || workSub.textContent;
   }
   ```

   **Services page hero:**
   ```js
   const servicesHero = data.heroes?.find(h => h.pageKey === 'services');
   // Same pattern: .headline -> title element, .subheadline -> subtitle element
   ```

   **What we do - websites:**
   ```js
   const websites = data.services?.find(s => s.serviceKey === 'websites');
   if (websites) {
     const title = document.querySelector('[data-cms="what-we-do-websites-title"]');
     const body = document.querySelector('[data-cms="what-we-do-websites-body"]');
     if (title) title.textContent = websites.title || title.textContent;
     if (body && websites.body) {
       // body is Lexical rich text - Payload returns it as serialized HTML
       // when fetched via REST API with ?depth=0 (default)
       // Use the Payload-rendered HTML directly
       body.innerHTML = sanitizeHTML(websites.body_html || '');
     }
   }
   ```
   - **Important:** Payload's REST API returns rich text fields in two formats: the raw Lexical JSON (under the field name, e.g. `body`) and a pre-rendered HTML version (under `body_html` if the `generateHTMLField` feature is configured, or the frontend must handle Lexical serialization). The simplest approach: configure Payload to auto-generate an HTML field, OR use the raw Lexical JSON and serialize client-side. **Decision: use Payload's built-in HTML serialization by enabling `html: true` on the Lexical editor config in M-002.** The REST API will then return `body_html` alongside the raw `body` JSON. The renderer reads `body_html`.
   - If `body_html` is not available, the Frontend agent should check the Payload 3 docs for the correct rich text HTML output approach and adapt accordingly. The key constraint is: the renderer needs an HTML string it can set via `innerHTML`.

   **What we do - AI:**
   ```js
   const ai = data.services?.find(s => s.serviceKey === 'ai');
   // Same pattern as websites
   ```

2. **`renderPortfolio(data, containerSelector)`** - field name mapping:
   - `post.title` -> `entry.projectName`
   - `post.custom_excerpt` -> `entry.description`
   - `post.feature_image` -> `entry.screenshot?.url` (populated media relation - the `url` field is on the media object, prefixed with the Payload server URL)
   - `post.canonical_url` -> `entry.liveUrl`
   - Brand colour extraction changes completely:
     - **Current:** Parses `post.tags` array looking for a slug matching `hash-brand-XXXXXX`, extracts the hex value.
     - **New:** Read `entry.brandColour` directly. It is a plain string field containing a hex colour (e.g. `#ff6b35`) or null.
   - Update the card template to use `data-cms` selectors if any are referenced (currently the cards are built as raw HTML strings, so no selector changes needed inside the card template itself).
   - Change `containerSelector` references in the callers from `data-ghost` to `data-cms` (done in M-006 and M-008).

3. **`renderPricing(data, containerSelector)`** - the biggest change:
   - **Delete `parsePricingHTML()` entirely.** It is no longer needed.
   - Field name mapping:
     - `post.title` -> `tier.tierName`
     - `post.custom_excerpt` -> `tier.audience`
     - `post.featured` -> `tier.isFeatured`
     - `parsePricingHTML(post.html).price` -> `tier.price` (direct string field)
     - `parsePricingHTML(post.html).features` (raw HTML) -> `tier.features` (array of `{ feature: string }` objects)
   - Build feature list from the array:
     ```js
     const featuresHTML = tier.features?.length
       ? `<ul class="pricing__features">${tier.features.map(f => `<li>${f.feature}</li>`).join('')}</ul>`
       : '';
     ```
   - Use `tier.ctaText` and `tier.ctaUrl` instead of hardcoding "Get started" and "/contact/":
     ```js
     const ctaText = tier.ctaText || 'Get started';
     const ctaUrl = tier.ctaUrl || '/contact/';
     // ...
     <a href="${ctaUrl}" class="btn btn--primary pricing__cta">${ctaText}</a>
     ```

4. **All `data-ghost` selector strings inside renderers.js** - update to `data-cms`:
   - This is every `document.querySelector('[data-ghost="..."]')` call.
   - Full list of replacements:
     - `[data-ghost="hero-title"]` -> `[data-cms="hero-title"]`
     - `[data-ghost="hero-subtitle"]` -> `[data-cms="hero-subtitle"]`
     - `[data-ghost="cta-title"]` -> `[data-cms="cta-title"]`
     - `[data-ghost="cta-button"]` -> `[data-cms="cta-button"]`
     - `[data-ghost="work-hero-title"]` -> `[data-cms="work-hero-title"]`
     - `[data-ghost="work-hero-subtitle"]` -> `[data-cms="work-hero-subtitle"]`
     - `[data-ghost="services-hero-title"]` -> `[data-cms="services-hero-title"]`
     - `[data-ghost="services-hero-subtitle"]` -> `[data-cms="services-hero-subtitle"]`
     - `[data-ghost="what-we-do-websites-title"]` -> `[data-cms="what-we-do-websites-title"]`
     - `[data-ghost="what-we-do-websites-body"]` -> `[data-cms="what-we-do-websites-body"]`
     - `[data-ghost="what-we-do-ai-title"]` -> `[data-cms="what-we-do-ai-title"]`
     - `[data-ghost="what-we-do-ai-body"]` -> `[data-cms="what-we-do-ai-body"]`

5. **Fallback renderers** (`renderPricingFallback`, `renderPricingAIFallback`, `renderPortfolioFallback`, `renderSiteContentFallback`):
   - No changes needed. These render hardcoded HTML that does not depend on the CMS data shape.

6. **Update the file's top-of-file comment** from "Ghost CMS content" to "CMS content rendering".

### Files
- `public/js/renderers.js` (modify)

### How to Test
- With Payload seeded and `cms-api.js` wired up:
  - Homepage: hero, what-we-do cards, portfolio grid, pricing grid, CTA strip all render correctly.
  - /work: hero and full portfolio grid render correctly.
  - /services: hero, website pricing, and AI pricing render correctly.
- Portfolio card shows `projectName` not `title`, `description` not `custom_excerpt`.
- Pricing card shows `tierName`, `price` as plain text (no HTML parsing), features as bullet list from array.
- Pricing CTA buttons show `ctaText` and link to `ctaUrl`.
- `isFeatured: true` tier has the `pricing__card--featured` class.
- Brand colour renders as `--card-brand-color` inline style when `brandColour` is set.
- No console errors about `parsePricingHTML` (it should be deleted).

### On Completion
Queue M-008 (HTML data attributes) and M-009 (main.js update).

---

## Task M-008: Rename data-ghost Attributes to data-cms in HTML Files
**Phase:** B | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-007

### Context
The HTML files use `data-ghost="..."` attributes as hooks for the renderers. Renaming them to `data-cms="..."` removes the Ghost naming convention. This is a find-and-replace across 3 HTML files.

### What Needs Doing

1. **`public/index.html`** - 9 attribute replacements:
   - Line 86: `data-ghost="hero-title"` -> `data-cms="hero-title"`
   - Line 89: `data-ghost="hero-subtitle"` -> `data-cms="hero-subtitle"`
   - Line 106: `data-ghost="what-we-do-websites-title"` -> `data-cms="what-we-do-websites-title"`
   - Line 107: `data-ghost="what-we-do-websites-body"` -> `data-cms="what-we-do-websites-body"`
   - Line 112: `data-ghost="what-we-do-ai-title"` -> `data-cms="what-we-do-ai-title"`
   - Line 113: `data-ghost="what-we-do-ai-body"` -> `data-cms="what-we-do-ai-body"`
   - Line 124: `data-ghost="portfolio"` -> `data-cms="portfolio"`
   - Line 148: `data-ghost="pricing-website"` -> `data-cms="pricing-website"`
   - Line 174: `data-ghost="cta-title"` -> `data-cms="cta-title"`
   - Line 175: `data-ghost="cta-button"` -> `data-cms="cta-button"`

2. **`public/work/index.html`** - 3 attribute replacements:
   - Line 69: `data-ghost="work-hero-title"` -> `data-cms="work-hero-title"`
   - Line 70: `data-ghost="work-hero-subtitle"` -> `data-cms="work-hero-subtitle"`
   - Line 77: `data-ghost="portfolio-full"` -> `data-cms="portfolio-full"`

3. **`public/services/index.html`** - 4 attribute replacements:
   - Line 71: `data-ghost="services-hero-title"` -> `data-cms="services-hero-title"`
   - Line 72: `data-ghost="services-hero-subtitle"` -> `data-cms="services-hero-subtitle"`
   - Line 80: `data-ghost="pricing-website-full"` -> `data-cms="pricing-website-full"`
   - Line 107: `data-ghost="pricing-ai-full"` -> `data-cms="pricing-ai-full"`

### Files
- `public/index.html` (modify)
- `public/work/index.html` (modify)
- `public/services/index.html` (modify)

### How to Test
- `grep -r "data-ghost" public/` returns zero results.
- `grep -r "data-cms" public/*.html public/*/*.html` returns all expected attribute locations.
- All pages still render correctly (renderers.js and cms-api.js already use `data-cms` selectors from M-006 and M-007).

### On Completion
All Ghost naming is removed from the HTML layer.

---

## Task M-009: Update main.js Imports and Selectors
**Phase:** B | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-006, M-008

### Context
`public/js/main.js` imports from `ghost-api.js` and uses `data-ghost` selectors for page detection. Both need updating to reference the new module and attribute names.

### What Needs Doing
1. Change the import line:
   - **Current:** `import { initGhostContent, initWorkPageContent, initServicesContent } from './ghost-api.js';`
   - **New:** `import { initCMSContent, initWorkPageContent, initServicesContent } from './cms-api.js';`

2. Update the page detection selectors:
   - **Current:**
     ```js
     if (document.querySelector('[data-ghost="portfolio-full"]')) {
       initWorkPageContent();
     } else if (document.querySelector('[data-ghost="pricing-website-full"]')) {
       initServicesContent();
     } else if (document.querySelector('[data-ghost="portfolio"]')) {
       initGhostContent();
     }
     ```
   - **New:**
     ```js
     if (document.querySelector('[data-cms="portfolio-full"]')) {
       initWorkPageContent();
     } else if (document.querySelector('[data-cms="pricing-website-full"]')) {
       initServicesContent();
     } else if (document.querySelector('[data-cms="portfolio"]')) {
       initCMSContent();
     }
     ```

3. Update the comment on line 24 from "Ghost CMS content" to "CMS content".

### Files
- `public/js/main.js` (modify)

### How to Test
- No console errors on any page (homepage, /work, /services, /contact).
- The correct init function fires on each page:
  - Homepage: `initCMSContent()` (portfolio + pricing + site content)
  - /work: `initWorkPageContent()` (portfolio + site content)
  - /services: `initServicesContent()` (pricing + site content)
  - /contact: nothing (no CMS containers on page)

### On Completion
The frontend is fully wired to the new CMS API client.

---

## Task M-010: Update regenerate-fallback.js for Payload
**Phase:** B | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** M-004 (API contract confirmed)

### Context
`scripts/regenerate-fallback.js` fetches all CMS content and writes `public/js/fallback-content.json`. It currently calls the Ghost Content API. It must be updated to call the Payload REST API, and the output JSON structure must match what `cms-api.js` and `renderers.js` expect.

### What Needs Doing
1. **Config section** - replace Ghost constants:
   - **Current:**
     ```js
     const API_BASE = 'https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost/api/content';
     const API_KEY = '6a81932590f32d95416a5191a7';
     ```
   - **New:**
     ```js
     const API_BASE = 'https://cms.skeleton-crew.co.uk/api';
     ```
   - Remove `API_KEY` entirely. No key needed for Payload public read.
   - Remove the `SITE_CONTENT_SLUGS` array (no longer relevant).

2. **`fetchFromPayload(collection, params)`** - replace `fetchFromGhost`:
   - Build URL: `${API_BASE}/${collection}?${new URLSearchParams(params)}`
   - No `key` parameter appended.
   - Extract `json.docs` instead of `json[responseKey]`.
   - Timeout and error handling: same pattern.

3. **Fetch functions** - replace Ghost-specific fetches:
   - `fetchPortfolio()`: `GET /portfolio-entries?sort=sortOrder&depth=1`
   - `fetchPricingWebsite()`: `GET /pricing-tiers?where[category][equals]=website&sort=sortOrder`
   - `fetchPricingAI()`: `GET /pricing-tiers?where[category][equals]=ai&sort=sortOrder`
   - `fetchSiteContent()`: fetch `page-heroes`, `cta-strips`, `service-descriptions` in parallel. Return `{ heroes, ctaStrips, services }` (matching the shape from `cms-api.js` `getSiteContent()`).

4. **Output structure** - the JSON file must match what `cms-api.js` passes to the renderers:
   ```js
   const fallbackData = {
     generatedAt: new Date().toISOString(),
     portfolio,       // array of portfolio-entries docs
     pricingWebsite,  // array of pricing-tiers docs (category=website)
     pricingAI,       // array of pricing-tiers docs (category=ai)
     siteContent: { heroes, ctaStrips, services }  // matches getSiteContent() shape
   };
   ```

5. **Remove all Ghost-specific references** from comments and console output.

### Files
- `scripts/regenerate-fallback.js` (modify)

### How to Test
- With Payload running and seeded: `node scripts/regenerate-fallback.js` completes successfully.
- `public/js/fallback-content.json` is written.
- The JSON contains:
  - `portfolio`: array with 1 entry (Fungi & Forage), `projectName` field present.
  - `pricingWebsite`: array with 3 entries, `tierName` and `price` fields present.
  - `pricingAI`: array with 3 entries.
  - `siteContent.heroes`: array with 4 entries, `pageKey` and `headline` fields present.
  - `siteContent.ctaStrips`: array with 1 entry.
  - `siteContent.services`: array with 2 entries.
- Shut down Payload, load the site - fallback content renders correctly from the JSON file.
- Run with Payload unreachable: script exits with code 1 and does NOT overwrite the existing fallback file.

### On Completion
Fallback system is fully migrated. Weekly cron job will work with the new API.

---

## Phase C: Cleanup

---

## Task M-011: Delete ghost-api.js and Ghost Seed Script
**Phase:** C | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-006, M-007, M-008, M-009, M-010 (all Phase B tasks complete)

### Context
With `cms-api.js` fully operational and all imports updated, the Ghost-specific files are dead code. Remove them.

### What Needs Doing
1. Delete `public/js/ghost-api.js`.
2. Delete `scripts/seed-ghost-content.js`.
3. Verify no remaining imports or references to either file:
   - `grep -r "ghost-api" public/` should return nothing.
   - `grep -r "seed-ghost" scripts/` should return nothing.

### Files
- `public/js/ghost-api.js` (delete)
- `scripts/seed-ghost-content.js` (delete)

### How to Test
- `grep -r "ghost-api\|seed-ghost" public/ scripts/` returns zero results.
- All pages load without console errors.

### On Completion
Ghost client code is removed from the repo.

---

## Task M-012: Update README.md
**Phase:** C | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-011

### Context
`public/README.md` contains Ghost-specific instructions for configuration, content management, portfolio entries, pricing tiers, and the fallback system. All must be updated for Payload.

### What Needs Doing
1. **Quick start section** - change "Ghost API calls" reference to "CMS API calls".

2. **Configuration > Ghost API** - replace entirely:
   - **New title:** "CMS API"
   - **New content:**
     ```
     File: `js/cms-api.js` - edit the constant at the top:

     const API_BASE = 'https://cms.skeleton-crew.co.uk/api';

     No API key is needed - the Payload REST API is configured for public read access.
     ```

3. **Content management** - replace "Ghost Admin" references:
   - **New intro:** "All user-facing copy is managed in the Payload CMS admin panel. The frontend fetches it via the REST API on page load."

4. **Portfolio entry** - replace Ghost instructions:
   - **New:**
     ```
     Payload Admin > Portfolio Entries > Create New.
     - `projectName` - display title
     - `description` - one-line description
     - `screenshot` - upload project screenshot
     - `liveUrl` - link to the live site
     - `brandColour` - hex colour for card accent (e.g. #ff6b35)
     - `sortOrder` - display order (lower numbers first)

     Save. The card appears on the homepage and /work page automatically.
     ```

5. **Pricing tiers** - replace Ghost HTML parsing instructions:
   - **New:**
     ```
     Payload Admin > Pricing Tiers > Create New.
     - `tierName` - tier display name
     - `category` - "website" or "ai"
     - `audience` - who this tier is for (one sentence)
     - `price` - price text (e.g. "From GBP 499")
     - `features` - add each feature as a separate item
     - `isFeatured` - check for the highlighted/recommended tier
     - `sortOrder` - display order within category (lower numbers first)
     - `ctaText` - button label (defaults to "Get started")
     - `ctaUrl` - button link (defaults to "/contact/")
     ```

6. **Site copy** - replace the Ghost pages table:
   - **New:**
     ```
     Editable in three Payload collections:

     **Page Heroes** (Payload Admin > Page Heroes):
     | pageKey | Where it appears | headline = | subheadline = |
     |---|---|---|---|
     | homepage | Homepage hero | Headline | Subheadline |
     | work | /work hero | Headline | Subheadline |
     | services | /services hero | Headline | Subheadline |
     | contact | /contact hero | Headline | Subheadline |

     **CTA Strips** (Payload Admin > CTA Strips):
     Single entry with `headline`, `buttonText`, and `buttonUrl`.

     **Service Descriptions** (Payload Admin > Service Descriptions):
     | serviceKey | Where it appears | title = | body = |
     |---|---|---|---|
     | websites | "What we do" card | Card title | Card body (rich text) |
     | ai | "What we do" card | Card title | Card body (rich text) |
     ```

7. **Fallback content** - update the regeneration command reference (same command, just note it fetches from Payload now).

8. **File structure** - update:
   - `js/ghost-api.js` -> `js/cms-api.js - Payload REST API client`
   - `scripts/seed-ghost-content.js` -> remove (seed script is now in `payload/src/seed.ts`)
   - Add reference to `payload/` directory

### Files
- `public/README.md` (modify)

### How to Test
- Read the README. Every instruction should reference Payload, not Ghost.
- No occurrences of the word "Ghost" remain (except perhaps in git history context).
- A new developer reading the README can understand how to configure the CMS connection, add portfolio entries, and manage pricing tiers.

### On Completion
Documentation is current.

---

## Task M-013: Update test-before-mode.js (if needed)
**Phase:** C | **Agent:** Frontend
**Priority:** Low | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-008

### Context
`scripts/test-before-mode.js` checks that component CSS selectors have corresponding `.before-mode` rules in `before.css`. This script does not reference Ghost or data attributes directly, but verify there are no indirect dependencies on the `data-ghost` attribute name.

### What Needs Doing
1. Search `scripts/test-before-mode.js` for any reference to `ghost` or `data-ghost`.
2. If none found (likely - the script only parses CSS class selectors, not HTML attributes), no changes needed.
3. If any are found, update to `data-cms`.

### Files
- `scripts/test-before-mode.js` (modify only if references found)

### How to Test
- `node scripts/test-before-mode.js` passes (exit code 0).

### On Completion
All tests pass with the new naming convention.

---

## Task M-014: Remove Dead Code from renderers.js
**Phase:** C | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-007

### Context
After M-007, the `parsePricingHTML()` function should already be deleted. This task is a final sweep to ensure no Ghost-specific dead code remains in renderers.js or any other JS file.

### What Needs Doing
1. Confirm `parsePricingHTML()` is deleted from `renderers.js`.
2. Confirm `sanitizeHTML()` is still present (it is still used for rich text body content from service descriptions).
3. Search all JS files in `public/js/` for any remaining references to:
   - `ghost` (case-insensitive)
   - `custom_excerpt`
   - `feature_image`
   - `canonical_url`
   - `published_at`
   - `post.html`
   - `tags?.find`
   - `hash-brand-`
4. Remove or update any found references.
5. Update file-level JSDoc comments that reference Ghost.

### Files
- `public/js/renderers.js` (modify if needed)
- `public/js/cms-api.js` (modify if needed - comments only)

### How to Test
- `grep -ri "ghost\|custom_excerpt\|feature_image\|canonical_url\|published_at\|hash-brand" public/js/` returns zero results (excluding any comments that say "formerly Ghost" for historical context, if desired).
- All pages render correctly.

### On Completion
Codebase is clean of Ghost references.

---

## Task M-015: Regenerate Fallback Content JSON
**Phase:** C | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** M-005 (Payload seeded), M-010 (regenerate script updated)

### Context
The existing `public/js/fallback-content.json` (if it exists) contains Ghost-shaped data. It must be regenerated with Payload-shaped data so the offline fallback works correctly with the new renderers.

### What Needs Doing
1. With Payload running and seeded, run: `node scripts/regenerate-fallback.js`
2. Verify the output JSON matches the expected structure (see M-010 test criteria).
3. Commit the regenerated `public/js/fallback-content.json`.

### Files
- `public/js/fallback-content.json` (regenerate)

### How to Test
- Stop the Payload server.
- Load the homepage - fallback content renders correctly.
- Load /work - fallback portfolio renders.
- Load /services - fallback pricing renders.
- Restart Payload - live content takes over.

### On Completion
Fallback system verified end-to-end.

---

## Dependency Graph

```
Phase A (Payload Application):
  M-001 (scaffolding)
    ├── M-002 (collections + config) ── M-004 (access control) ── M-005 (seed)
    └── M-003 (Dockerfile)

Phase B (Frontend Migration) - starts after M-004:
  M-006 (cms-api.js) ── M-007 (renderers.js) ── M-008 (HTML data attrs)
                                                    └── M-009 (main.js)
  M-010 (regenerate-fallback.js) - can run in parallel with M-006/M-007

Phase C (Cleanup) - starts after all Phase B tasks:
  M-011 (delete ghost files)
  M-012 (update README)
  M-013 (test-before-mode check)
  M-014 (dead code sweep)
  M-015 (regenerate fallback JSON)
```

**Critical path:** M-001 -> M-002 -> M-004 -> M-006 -> M-007 -> M-008 -> M-009

---

## Appendix: Payload REST API Endpoint Reference

This section is for the Frontend agent. All endpoints are relative to `API_BASE` (`https://cms.skeleton-crew.co.uk/api`).

### GET /api/page-heroes

Returns all page hero entries.

**Query params:** none needed (4 entries total)

**Response shape:**
```json
{
  "docs": [
    {
      "id": "string",
      "pageKey": "homepage" | "work" | "services" | "contact",
      "headline": "string",
      "subheadline": "string | null",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "totalDocs": 4,
  "limit": 10,
  "totalPages": 1,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevPage": null,
  "nextPage": null
}
```

### GET /api/cta-strips

Returns CTA strip entries (currently 1).

**Response shape:**
```json
{
  "docs": [
    {
      "id": "string",
      "headline": "string",
      "buttonText": "string",
      "buttonUrl": "string",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "totalDocs": 1
}
```

### GET /api/service-descriptions

Returns service description entries (currently 2).

**Response shape:**
```json
{
  "docs": [
    {
      "id": "string",
      "serviceKey": "websites" | "ai",
      "title": "string",
      "body": { "Lexical JSON" },
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "totalDocs": 2
}
```

**Note on rich text:** The `body` field returns Lexical JSON by default. To get rendered HTML, either:
- Configure the Lexical editor in `payload.config.ts` with HTML generation, which adds a `body_html` field to the response.
- Or serialize the Lexical JSON to HTML client-side using `@payloadcms/richtext-lexical/client`.

The recommended approach is server-side HTML generation (configured in M-002). The Frontend agent should verify which field name contains the HTML output and use that in the renderer.

### GET /api/pricing-tiers

Returns all pricing tiers, or filtered by category.

**Query params:**
- `where[category][equals]=website` or `where[category][equals]=ai` - filter by category
- `sort=sortOrder` - sort by explicit order field

**Response shape:**
```json
{
  "docs": [
    {
      "id": "string",
      "tierName": "string",
      "category": "website" | "ai",
      "audience": "string",
      "price": "string",
      "features": [
        { "id": "string", "feature": "string" }
      ],
      "isFeatured": true | false,
      "sortOrder": 1,
      "ctaText": "string",
      "ctaUrl": "string",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "totalDocs": 6
}
```

### GET /api/portfolio-entries

Returns all portfolio entries.

**Query params:**
- `sort=sortOrder` - sort by explicit order field
- `depth=1` - populates the `screenshot` media relation

**Response shape (with depth=1):**
```json
{
  "docs": [
    {
      "id": "string",
      "projectName": "string",
      "description": "string",
      "screenshot": {
        "id": "string",
        "url": "/media/filename.jpg",
        "alt": "string",
        "width": 1200,
        "height": 800,
        "filename": "string",
        "mimeType": "string"
      } | null,
      "liveUrl": "string | null",
      "brandColour": "string | null",
      "sortOrder": 0,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "totalDocs": 1
}
```

**Note on screenshot URL:** The `screenshot.url` is a relative path. The full URL is `${PAYLOAD_SERVER_URL}${screenshot.url}`. When fetching from the frontend, construct the full image URL by prepending the CMS base URL (minus the `/api` path): `https://cms.skeleton-crew.co.uk${entry.screenshot.url}`.

### GET /api/media/:id

Returns a single media entry. Used by Payload internally when populating relations. The frontend does not need to call this directly - use `depth=1` on the parent collection instead.
