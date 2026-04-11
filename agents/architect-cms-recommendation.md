# CMS Recommendation - Final Decision

## 1. Recommendation: Payload CMS 3

**Pick Payload CMS 3 on PostgreSQL.** Here is why.

The operator's answers create an apparent tension between Q2 (config-as-code, templatable per client, version-controlled content model) and Q3 (non-technical editors need a good UX). But this tension is smaller than it looks. Payload 3's admin panel is genuinely good for non-technical editors - it is clean, modern, and presents fields in a straightforward form layout. It is not as polished as Directus's Data Studio, but the gap is narrow and shrinking. More importantly, the gap between Payload and Directus on the *operator's* core requirement - per-client deployment from a single source of truth - is enormous.

The deciding factors:

- **Per-client templating is the killer requirement.** Q2 explicitly asks for "a CMS spun up per client, matching their site, with a single source of truth, easily deployable, easily customised." This is Payload's entire design philosophy. The content model lives in TypeScript config files inside the repo. To spin up a new client: clone the repo, adjust the config, deploy. The content model is version-controlled, diffable, and CI-friendly. Directus stores its schema in the database. You can export snapshots and apply them, but it is a workaround bolted onto a GUI-first system, not a native workflow.

- **Non-technical editing UX is good enough.** Payload's admin panel renders each collection as a clean list view, each entry as a form with labelled fields. For the content model in this project - short text fields, a rich text editor, image uploads, a boolean toggle, a dropdown - there is nothing confusing for a non-technical person. The fields are explicit and typed. No dynamic zones, no JSON blobs, no ambiguity. A client clicks into "Pricing Tiers," sees their three tiers listed, clicks one, edits the price text, hits save. That workflow is identical in Payload and Directus.

- **MySQL is not a constraint.** The operator said the database can change. Payload 3 requires PostgreSQL, which means adding a Postgres container and eventually dropping MySQL when Ghost goes. This is a clean break - no need to maintain two database engines long-term.

- **RAM is not a constraint.** With 2.6 GB free, running Payload + Postgres (~500 MB combined) leaves over 2 GB for everything else.

- **Media management is built in.** Payload has a first-class media library with upload handling, image resizing, and alt text fields. Clients can upload portfolio screenshots through the admin panel. Stored on disk by default, configurable to S3/R2 later.

---

## 2. Content Model Mapped to Payload Field Types

Payload defines collections in a TypeScript config file (`payload.config.ts`). Each content type below becomes a Payload **collection**. Field types use Payload's actual type names.

### Collection: `page-heroes`

```ts
{
  slug: 'page-heroes',
  admin: { useAsTitle: 'headline' },
  fields: [
    { name: 'pageKey', type: 'select', required: true,
      options: ['homepage', 'work', 'services', 'contact'] },
    { name: 'headline', type: 'text', required: true },
    { name: 'subheadline', type: 'text' },
  ],
}
```

4 entries. `pageKey` is unique per entry.

### Collection: `cta-strips`

```ts
{
  slug: 'cta-strips',
  admin: { useAsTitle: 'headline' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'buttonText', type: 'text', required: true },
    { name: 'buttonUrl', type: 'text', required: true, defaultValue: '/contact/' },
  ],
}
```

1 entry (expandable to per-page later).

### Collection: `service-descriptions`

```ts
{
  slug: 'service-descriptions',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'serviceKey', type: 'select', required: true,
      options: ['websites', 'ai'] },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'richText', required: true },
  ],
}
```

2 entries.

### Collection: `pricing-tiers`

```ts
{
  slug: 'pricing-tiers',
  admin: { useAsTitle: 'tierName' },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'tierName', type: 'text', required: true },
    { name: 'category', type: 'select', required: true,
      options: ['website', 'ai'] },
    { name: 'audience', type: 'text', required: true },
    { name: 'price', type: 'text', required: true },
    { name: 'features', type: 'array', required: true,
      fields: [
        { name: 'feature', type: 'text', required: true },
      ] },
    { name: 'isFeatured', type: 'checkbox' },
    { name: 'sortOrder', type: 'number', required: true },
    { name: 'ctaText', type: 'text', defaultValue: 'Get started' },
    { name: 'ctaUrl', type: 'text', defaultValue: '/contact/' },
  ],
}
```

6 entries (3 website, 3 AI). The `features` array replaces the HTML-parsing hack - each feature is a discrete text field. `sortOrder` replaces the `published_at` hack.

### Collection: `portfolio-entries`

```ts
{
  slug: 'portfolio-entries',
  admin: { useAsTitle: 'projectName' },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'projectName', type: 'text', required: true },
    { name: 'description', type: 'text', required: true },
    { name: 'screenshot', type: 'upload', relationTo: 'media' },
    { name: 'liveUrl', type: 'text' },
    { name: 'brandColour', type: 'text' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}
```

Variable entries. `screenshot` is a relationship to the built-in `media` collection (Payload's upload handling). `brandColour` stores a hex string - a Payload `text` field with a custom admin component could render a colour picker, but a plain text field works fine for now.

### Collection: `media` (built-in)

Payload's default upload collection. Stores files on disk at `/media` inside the container. Serves images via the Payload API with automatic resizing. No custom config needed beyond enabling it.

---

## 3. Infrastructure Plan

### Containers (final state, after Ghost removal)

| Container | Image | Port | Purpose | Estimated RAM |
|---|---|---|---|---|
| `skeleton-traefik` | `traefik:v3` | 80, 443 | Reverse proxy, TLS termination | ~50 MB |
| `skeleton-nginx` | `nginx:alpine` | (internal) | Serves static frontend files | ~10 MB |
| `skeleton-payload` | `node:20-alpine` (custom build) | 3000 (internal) | Payload CMS - admin panel + REST API | ~250-350 MB |
| `skeleton-postgres` | `postgres:16-alpine` | 5432 (internal) | Database for Payload | ~100-150 MB |

**Total estimated RAM: ~450-560 MB.** Well within the 2.6 GB available.

### What changes from the current stack

- **Add:** `skeleton-postgres` container (PostgreSQL 16).
- **Add:** `skeleton-payload` container (Node 20 running Payload CMS 3).
- **Remove (eventually):** `skeleton-ghost` container (Ghost CMS).
- **Remove (eventually):** `skeleton-mysql` container (MySQL) - only used by Ghost. If other services need MySQL, keep it; otherwise drop it.
- **Keep:** `skeleton-traefik` (add a new router rule for `cms.skeleton-crew.co.uk` pointing to Payload).
- **Keep:** `skeleton-nginx` (serves the static frontend; no change).

### Traefik routing

- `skeleton-crew.co.uk` -> `skeleton-nginx` (static frontend, unchanged)
- `cms.skeleton-crew.co.uk` -> `skeleton-payload` (admin panel + API)

### Persistent volumes

- `payload-data`: Payload media uploads (`/app/media` in the container)
- `postgres-data`: PostgreSQL data directory

### Environment variables for the Payload container

```
DATABASE_URI=postgres://payload:secret@skeleton-postgres:5432/payload
PAYLOAD_SECRET=<random-32-char-string>
PAYLOAD_PUBLIC_SERVER_URL=https://cms.skeleton-crew.co.uk
```

---

## 4. Per-Client Deployment Pattern

This is where Payload earns its place.

### What is shared (the template)

The Payload config repo contains:
- `payload.config.ts` - all collection definitions (the content model above)
- `Dockerfile` - builds the Payload app
- `docker-compose.yml` - defines Payload + Postgres containers
- Any custom admin components, access control policies, hooks

This repo is the **single source of truth** for the content model. It is the template.

### What is per-client

- A **separate Postgres database** (or schema) per client
- A **separate Payload container** per client (with its own `PAYLOAD_SECRET`, `DATABASE_URI`, and `PAYLOAD_PUBLIC_SERVER_URL`)
- **Media uploads** are per-client (separate volume mount)
- **Seed data** may differ per client (different pricing tiers, portfolio entries, etc.)

### Spinning up a new client

1. Clone the Payload config repo (or use it as a git submodule / monorepo package).
2. Create a new Postgres database for the client: `CREATE DATABASE client_acme;`
3. Copy or extend the `docker-compose.yml` to add a new Payload service pointing at the new database.
4. Set client-specific env vars (`PAYLOAD_PUBLIC_SERVER_URL=https://cms.acme-client.co.uk`, etc.).
5. Run `docker compose up -d payload-acme`. Payload auto-migrates the schema on first start.
6. Optionally run a seed script to populate default content.
7. Add a Traefik router label for the client's CMS subdomain.

### Keeping the content model in sync

Because the schema lives in code:
- Update `payload.config.ts` in the template repo.
- Rebuild and redeploy each client's Payload container.
- Payload runs migrations automatically on startup - schema changes apply cleanly.
- If a field is added, existing entries get `null` for that field until edited.
- If a field is removed, the data stays in Postgres but Payload stops exposing it.

This is fundamentally better than Directus's approach of exporting schema snapshots from one instance and importing them into another. With Payload, the schema *is* the code. There is no drift, no manual export/import step, no "did I remember to sync the schema?" question.

### Scaling considerations

Each Payload + Postgres pair uses ~400-500 MB RAM. On the current VPS (2.6 GB free), you could run 3-4 client instances alongside the Skeleton Crew site. Beyond that, either upgrade the VPS or move to a container orchestrator. For the near term, this is fine - the operator is not running 20 clients on day one.

A future optimisation: share a single Postgres instance across clients (one database per client, one Postgres container). This saves ~100 MB per client. The Payload containers remain separate.

---

## 5. Migration Path from Ghost

### Files that change

**`public/js/ghost-api.js` - complete rewrite (rename to `cms-api.js` or `payload-api.js`)**

The current file is a Ghost Content API client with Ghost-specific URL construction, API key auth, and Ghost-shaped response parsing. Replace it with a Payload REST API client:

- Base URL changes from `https://cms.skeleton-crew.co.uk/ghost/api/content` to `https://cms.skeleton-crew.co.uk/api`.
- Authentication: Payload's REST API can be configured for public read access (no API key needed for content fetching). Remove the API key logic entirely.
- Each fetch function maps to a Payload collection endpoint:
  - `getPortfolio()` -> `GET /api/portfolio-entries?sort=sortOrder&depth=1` (depth=1 populates the media relation for `screenshot`)
  - `getPricingWebsite()` -> `GET /api/pricing-tiers?where[category][equals]=website&sort=sortOrder`
  - `getPricingAI()` -> `GET /api/pricing-tiers?where[category][equals]=ai&sort=sortOrder`
  - `getSiteContent()` -> Multiple calls or a single custom endpoint, but most cleanly: `GET /api/page-heroes`, `GET /api/cta-strips`, `GET /api/service-descriptions`
- Response shape changes from `{ posts: [...] }` / `{ pages: [...] }` to `{ docs: [...], totalDocs, page, ... }`.
- The caching logic (sessionStorage) and fallback pattern can stay the same - just change what is fetched and how the response is destructured.

**`public/js/renderers.js` - moderate changes**

- `renderSiteContent()` currently expects a slug-indexed object with Ghost page shapes (`title`, `custom_excerpt`, `html`). Refactor to accept Payload's field names (`headline`, `subheadline` for heroes; `headline`, `buttonText` for CTA; `title`, `body` for services). The DOM update logic stays identical.
- `renderPortfolio()` currently reads `post.title`, `post.custom_excerpt`, `post.feature_image`, `post.canonical_url`, and parses `post.tags` for brand colour. Map to `entry.projectName`, `entry.description`, `entry.screenshot.url` (populated media relation), `entry.liveUrl`, `entry.brandColour`. The tag-parsing hack for brand colour is eliminated entirely.
- `renderPricing()` currently calls `parsePricingHTML()` to extract price and features from raw HTML. **Delete `parsePricingHTML()` entirely.** Payload returns `tier.price` as a string and `tier.features` as an array of `{ feature: string }` objects. Build the `<li>` elements from the array directly. Also read `tier.ctaText` and `tier.ctaUrl` instead of hardcoding "Get started" and "/contact/".
- Fallback renderers (`renderPricingFallback`, etc.) stay the same - they are hardcoded HTML that does not depend on the CMS.

**`scripts/seed-ghost-content.js` - replace with a Payload seed script**

- Payload supports seed scripts via its Local API (Node.js). Write a new `scripts/seed-payload-content.js` that uses `payload.create()` for each collection.
- No JWT generation, no Ghost Admin API calls, no `sleep(1000)` hacks for ordering.
- Seed data maps directly to the structured fields - no HTML encoding of prices in `<p data-price>` elements.

**`scripts/regenerate-fallback.js` - update API calls**

- This script fetches current CMS content and writes `fallback-content.json`. Update the fetch calls to hit Payload's REST API instead of Ghost's.

**`public/js/main.js` - rename imports**

- Change `import { initGhostContent } from './ghost-api.js'` to the new module name.

**HTML files - optional cleanup**

- The `data-ghost` attributes on HTML elements are just CSS selectors used by `renderers.js`. They can be renamed to `data-cms` for clarity, but this is cosmetic. The rendering logic works the same either way.

### Migration order

1. Stand up Payload + Postgres alongside the existing Ghost stack.
2. Write the new `cms-api.js` and update `renderers.js`.
3. Seed Payload with the same content currently in Ghost.
4. Switch the frontend to fetch from Payload.
5. Verify everything works.
6. Remove Ghost and MySQL containers.

This can be done with zero downtime because the fallback system means the frontend degrades gracefully if the CMS is unavailable during the switchover.

---

## 6. Risks and Trade-offs

### What you give up by choosing Payload over Directus

- **Directus has a slightly better editing UX for non-technical users.** Directus's Data Studio is more polished, with inline editing, drag-and-drop for relationships, and a more intuitive layout builder. For this project's simple content model, the difference is marginal. But if a future client needs to manage complex nested content, Directus would be more forgiving.

- **Directus supports MySQL natively.** You could reuse the existing `skeleton-mysql` container without adding Postgres. Choosing Payload means running a new database engine. This is a one-time cost, not ongoing pain, but it is real.

- **Directus has a larger extension ecosystem.** More community-built interfaces, displays, and hooks. Payload's ecosystem is growing but smaller. For this project, no third-party extensions are needed.

- **Directus schema changes are instant via the GUI.** Adding a field in Directus is a click in the admin panel. In Payload, it requires editing the config file, rebuilding the container, and redeploying. For a solo developer operator, this is fine. For a team of non-developers, Directus would be more flexible.

### What you gain

- **The content model is code.** Version-controlled, reviewable, diffable, deployable. This is the foundation of the per-client strategy.
- **No schema drift.** Every client instance runs the same content model by definition - it is in the Docker image.
- **TypeScript everywhere.** The Payload config, seed scripts, and custom hooks are all TypeScript. One language across the entire stack.
- **Payload 3 is built on Next.js.** If the Skeleton Crew site ever moves from static HTML to a Next.js frontend, Payload can embed directly in the same app. This is not needed now but it is a free future option.
- **Simpler backup and restore.** The schema is in git. Only the data (Postgres dump) and media files need backing up. With Directus, you also need to back up and restore schema snapshots carefully.

### Other risks to watch

- **Payload 3 is relatively new.** Released in 2024, the Postgres adapter is production-ready but has a shorter track record than Directus on Postgres. Monitor the Payload GitHub for issues if you hit edge cases.
- **Rich text editor choice.** Payload 3 ships with Lexical (Meta's editor) as the default rich text editor. It is capable but the editing experience for rich text is less intuitive than Directus's or even Ghost's. For this project, rich text is only used for service description body copy and the about section - neither is complex. If clients struggle with Lexical, Payload also supports Slate as an alternative.
- **Per-client container overhead.** Running a separate Node.js process per client is the simplest deployment model but the least efficient. If you reach 5+ clients on one VPS, consider a shared Payload instance with tenant isolation (Payload supports multi-tenancy via access control), or move to a bigger server.
