# CMS Discovery - Replacing Ghost with a Structured Headless CMS

## 1. Content Catalogue

Everything below is derived from `renderers.js`, `ghost-api.js`, `seed-ghost-content.js`, and the HTML templates. This is the complete set of content the frontend currently expects.

### Content Type: Site Content Pages

Stored as Ghost pages, fetched by slug, indexed into a lookup object. The frontend reads `title`, `custom_excerpt`, and `html` depending on the page.

| Slug | Ghost Fields Used | Frontend Target | Notes |
|---|---|---|---|
| `site-hero` | `title`, `custom_excerpt` | `hero-title`, `hero-subtitle` | Homepage hero headline and subheadline. Title also synced to `.hero__headline-reveal`. |
| `site-cta-strip` | `title`, `custom_excerpt` | `cta-title`, `cta-button` | CTA strip headline and button label. `custom_excerpt` is repurposed as button text. |
| `site-about` | `html` | Not currently rendered on frontend | Seeded but no `data-ghost` target found in any HTML file. May be unused or planned. |
| `site-what-we-do-websites` | `title`, `html` | `what-we-do-websites-title`, `what-we-do-websites-body` | Title rendered as textContent, html rendered as innerHTML (sanitized). |
| `site-what-we-do-ai` | `title`, `html` | `what-we-do-ai-title`, `what-we-do-ai-body` | Same pattern as websites card. |
| `page-work-hero` | `title`, `custom_excerpt` | `work-hero-title`, `work-hero-subtitle` | Work page hero. |
| `page-services-hero` | `title`, `custom_excerpt` | `services-hero-title`, `services-hero-subtitle` | Services page hero. |

### Content Type: Portfolio Entries

Stored as Ghost posts with tag `portfolio`. Fetched via `filter: 'tag:portfolio'`, ordered by `published_at desc`.

| Field | Used In Renderer | Purpose |
|---|---|---|
| `title` | `portfolio__title` | Project name |
| `custom_excerpt` | `portfolio__desc` | One-line project description |
| `feature_image` | `portfolio__image` | Screenshot/image of the project |
| `canonical_url` | `portfolio__link` | External link to the live site ("View site") |
| `tags` (array) | Brand colour extraction | Internal tags matching `#brand-XXXXXX` pattern are parsed to extract a hex colour for `--card-brand-color` CSS custom property |
| `featured` | Not used for portfolio | N/A |

Rendered in two contexts:
- Homepage: `[data-ghost="portfolio"]` - teaser grid (no explicit limit, shows all)
- Work page: `[data-ghost="portfolio-full"]` - full grid

### Content Type: Pricing Tiers (Website Builds)

Stored as Ghost posts with internal tag `#pricing-website`. Fetched via `filter: 'tag:pricing-website'`, ordered by `published_at asc` (publish date controls display order).

| Field | Used In Renderer | Purpose |
|---|---|---|
| `title` | `pricing__name` | Tier name (e.g. "The Starter") |
| `custom_excerpt` | `pricing__audience` | Who the tier is for - one sentence |
| `featured` (boolean) | `pricing__card--featured` modifier class | Highlights the middle/recommended tier |
| `html` (parsed) | `pricing__price` + `pricing__features` | Body HTML is parsed with DOMParser: first `[data-price]` element or first `<p>` becomes the price, first `<ul>` becomes the feature list |

Rendered in two contexts:
- Homepage: `[data-ghost="pricing-website"]` - preview
- Services page: `[data-ghost="pricing-website-full"]` - full display

Current tiers seeded: The Starter (from GBP 499), The Full Works (from GBP 1,500, featured), The Flagship (from GBP 3,500).

### Content Type: Pricing Tiers (AI Consulting)

Stored as Ghost posts with internal tag `#pricing-ai`. Same fetch and render pattern as website pricing.

| Field | Used In Renderer | Purpose |
|---|---|---|
| `title` | `pricing__name` | Tier name |
| `custom_excerpt` | `pricing__audience` | Who it is for |
| `featured` (boolean) | `pricing__card--featured` | Highlighted tier |
| `html` (parsed) | `pricing__price` + `pricing__features` | Same parsing as website pricing |

Rendered only on the Services page: `[data-ghost="pricing-ai-full"]`.

Current tiers seeded: The Audit (from GBP 299), The Build (GBP 800-2,500, featured), The Retainer (GBP 300-600/month).

### Tags Used

| Tag | Visibility | Purpose |
|---|---|---|
| `portfolio` | Public | Identifies portfolio posts |
| `#pricing-website` | Internal | Identifies website pricing tier posts |
| `#pricing-ai` | Internal | Identifies AI pricing tier posts |
| `#brand-XXXXXX` | Internal | Per-portfolio-entry brand colour (convention, not seeded as a tag) |

### Summary of Hacks

The current Ghost model uses several workarounds because Ghost lacks structured content types:

1. **Tag-based content typing** - Posts are differentiated by tag (`portfolio`, `#pricing-website`, `#pricing-ai`) rather than having distinct content types.
2. **`custom_excerpt` as a general-purpose short text field** - Used for project descriptions, audience copy, and even CTA button labels.
3. **HTML body parsing for structured data** - Pricing posts encode price in a `<p data-price>` element and features in a `<ul>`, which the frontend extracts with DOMParser. The operator must write raw HTML with specific markup patterns.
4. **`canonical_url` repurposed** - Portfolio entries use this field to store the external project URL, not its intended purpose.
5. **`published_at` for sort order** - Pricing tier display order is controlled by publish date, requiring deliberate 1-second sleeps during seeding.
6. **`featured` boolean for visual treatment** - Only works because there is exactly one highlighted tier per category.
7. **Pages as key-value store** - Site content pages are essentially key-value pairs (slug -> title + excerpt + html), not pages in any meaningful sense.

---

## 2. Ideal Content Model

### Content Type: `page_hero`

One entry per page that has a hero section. Each entry is a discrete, labelled set of fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `page_key` | Enum / slug | Yes | One of: `homepage`, `work`, `services`, `contact` |
| `headline` | Short text | Yes | The H1 text |
| `subheadline` | Short text | No | One sentence below the headline |

### Content Type: `cta_strip`

Single entry (or one per page if expanded later).

| Field | Type | Required | Notes |
|---|---|---|---|
| `headline` | Short text | Yes | The bold CTA line |
| `button_text` | Short text | Yes | Button label |
| `button_url` | Short text | Yes | Link target (default `/contact/`) |

### Content Type: `service_description`

Two entries - one for website builds, one for AI consulting. Displayed in the "What we do" section.

| Field | Type | Required | Notes |
|---|---|---|---|
| `service_key` | Enum | Yes | `websites` or `ai` |
| `title` | Short text | Yes | Card heading |
| `body` | Rich text | Yes | One paragraph of copy |

### Content Type: `pricing_tier`

Six entries total (3 website, 3 AI). Each is a fully structured record - no HTML parsing needed.

| Field | Type | Required | Notes |
|---|---|---|---|
| `tier_name` | Short text | Yes | e.g. "The Full Works" |
| `category` | Enum / relation | Yes | `website` or `ai` |
| `audience` | Short text | Yes | Who this tier is for |
| `price` | Short text | Yes | e.g. "From GBP 1,500" - kept as text for flexibility |
| `features` | List of short text / repeatable component | Yes | 3-4 outcome bullet points |
| `is_featured` | Boolean | No | Highlights the recommended tier |
| `sort_order` | Integer | Yes | Explicit display order - no more publish-date hacks |
| `cta_text` | Short text | No | Button label, defaults to "Get started" |
| `cta_url` | Short text | No | Button link, defaults to `/contact/` |

### Content Type: `portfolio_entry`

Variable number of entries.

| Field | Type | Required | Notes |
|---|---|---|---|
| `project_name` | Short text | Yes | Display title |
| `description` | Short text | Yes | One-line description |
| `screenshot` | Image / media | No | Project screenshot |
| `live_url` | URL | No | External link to live site |
| `brand_colour` | Colour picker / short text | No | Hex colour for card accent |
| `sort_order` | Integer | No | Display order (fallback to creation date) |

### Content Type: `about_section` (if `site-about` is wired up)

| Field | Type | Required | Notes |
|---|---|---|---|
| `body` | Rich text | Yes | Multi-paragraph about copy |

### Total Field Count

- 4 page heroes (2 fields each) = 8 fields
- 1 CTA strip (3 fields) = 3 fields
- 2 service descriptions (3 fields each) = 6 fields
- 6 pricing tiers (9 fields each) = 54 fields
- N portfolio entries (6 fields each) = variable
- 1 about section (1 field) = 1 field

This is a small content model. Any CMS that handles this well is more than capable enough.

---

## 3. CMS Comparison

All options below are open-source, self-hostable via Docker, and provide a REST and/or GraphQL API for headless consumption.

### Comparison Table

| Criteria | Payload CMS 3 | Directus | Strapi v5 | KeystoneJS | Cockpit CMS |
|---|---|---|---|---|---|
| **Structured content modelling** | Excellent. Code-defined schemas in TypeScript config files. Fields, validations, hooks, conditional logic all in config. | Excellent. Schema built in the admin UI, stored in the database. Mirrors the DB schema directly. | Good. Content-Type Builder in the admin UI. Generates JSON schema files. Slightly clunky with nested/repeatable components. | Good. Schema defined in TypeScript (KeystoneJS list config). Developer-centric, less visual. | Basic. JSON-based schema definition. Simpler field types, fewer validations. Limited relational modelling. |
| **Editing UX** | Very good. Clean, modern admin panel. Custom field components possible. Inline relationship editing. Live preview support. | Very good. The admin app ("Data Studio") is polished and intuitive. Non-technical editors find it approachable. Inline editing, translations, revision history built in. | Good but inconsistent. The admin panel works but has UX rough edges - the component/dynamic zone editing can confuse non-technical users. Improved in v5 but still behind Directus/Payload. | Minimal. Admin UI is functional but basic. Not designed for non-developer editors. Best suited for developer-only content management. | Basic. Functional admin panel. Usable for simple models but lacks polish. No drag-and-drop, limited preview. |
| **Docker self-hosting** | Easy. Official Docker image. Single container + MongoDB or Postgres. Straightforward docker-compose setup. | Easy. Official Docker image. Single container + Postgres (or MySQL/SQLite). Well-documented docker-compose. Has an official cloud option but self-host is first-class. | Easy. Official Docker image. Single container + Postgres/MySQL/SQLite. docker-compose well documented. Migration management can be fiddly on upgrades. | Moderate. No official Docker image - you build your own from the Next.js app. Requires Node runtime + Postgres/SQLite. Workable but more manual. | Easy. Official Docker image. Single container + SQLite or MongoDB. Extremely lightweight. |
| **Resource footprint** | Moderate. Node.js runtime. ~200-350 MB RAM typical. MongoDB adds overhead if not already running; Postgres option is leaner. | Moderate. Node.js runtime. ~200-400 MB RAM typical. Postgres recommended. | Moderate. Node.js runtime. ~250-400 MB RAM typical. | Moderate. Node.js + Next.js runtime. ~250-400 MB RAM. Heavier because it bundles a Next.js frontend. | Light. PHP or Node.js runtime (v2 is PHP, v3/Cockpit Next is Node). SQLite mode needs ~80-150 MB RAM. Lightest option by far. |
| **Database** | MongoDB (default) or PostgreSQL (v3+). Postgres support is newer but production-ready. | PostgreSQL (recommended), MySQL, SQLite, MS SQL, MariaDB, CockroachDB. Most flexible. | PostgreSQL, MySQL, SQLite. All well-supported. | PostgreSQL (recommended), SQLite. | SQLite (default), MongoDB. SQLite is zero-config. |
| **API style** | REST + GraphQL both built in. Auto-generated from schema. REST is the default, GraphQL via config flag. | REST + GraphQL both built in. REST is primary, GraphQL via extension. API is auto-generated from schema and very clean. | REST (default) + GraphQL (plugin). REST is well-designed. GraphQL plugin is maintained but secondary. | GraphQL (primary) + REST (via extending the Next.js API routes). GraphQL is the native interface. | REST (primary). Simple JSON API. No built-in GraphQL. |
| **Maturity / community** | Growing fast. v3 released 2024. Backed by a funded company. Active Discord. Smaller ecosystem than Strapi/Directus but momentum is strong. TypeScript-first appeals to modern JS developers. | Mature. v10+. Large community. Backed by a funded company. Active GitHub + Discord. Strong ecosystem of extensions. Has been production-stable for years. | Most mature/popular. v5 released 2024. Largest community. Most plugins/integrations. Backed by a well-funded company. However, v4->v5 migration was bumpy and eroded some trust. | Mature framework, smaller community. Maintained by Thinkmill. Stable but niche. Updates are less frequent. Best for teams that want maximum code control. | Small community. Cockpit v1/v2 (PHP) is stable but aging. Cockpit Next (Node, v3) is early. Limited ecosystem. Single maintainer historically. |
| **Would the operator hate it?** | Unlikely. Config-as-code fits a developer operator. Admin UI is clean for when they want to just edit content. | Unlikely. Most intuitive admin panel of the lot. Would feel like a proper CMS, not a developer tool. | Possible. The operator described Strapi as "weak and clunky" from past experience. v5 is improved but the editing UX for components/dynamic zones still has friction. | Possible. Very developer-oriented. If the operator wants a clean editing experience for quick content changes, this may feel like overkill infrastructure for a simple content model. | Unlikely to hate it, but may find it limiting if the content model grows. Good for this exact use case but less room to grow. |

### Notes on Strapi Specifically

The operator's past experience was with an older Strapi version (likely v3 or early v4). Strapi v5 (released late 2024) is a significant rewrite with a new design system, improved content-type builder, and better performance. However, the core editing paradigm for components and dynamic zones - the features needed for structured content like pricing tiers with repeatable feature lists - is still the weakest part of the Strapi UX. The operator's prior negative impression combined with the fact that Directus and Payload both handle this use case with less friction makes Strapi hard to justify as the top recommendation here.

### Shortlist

Given the requirements (small content model, self-hosted Docker, developer operator, clean editing UX for quick content updates, small VPS):

1. **Directus** - Best editing UX, most database flexibility, mature, clean API. The "Data Studio" admin panel is genuinely good. If the operator already has MySQL running on the VPS (which they do - the Ghost MySQL container), Directus can share it.
2. **Payload CMS 3** - Best developer experience, config-as-code TypeScript schemas, modern architecture. Slightly higher learning curve for initial setup but the content model would be extremely clean. Postgres required (or MongoDB).
3. **Cockpit CMS** - Lightest footprint, simplest setup, SQLite-based. Good enough for this content model. Risk is limited community and ceiling if requirements grow.

---

## 4. Discovery Questions for the Operator

These are questions where the answer changes the recommendation.

### Q1: Is your VPS already running PostgreSQL, or only MySQL (from Ghost)?

**Why this matters:** Directus can use your existing MySQL instance - zero new database infrastructure. Payload CMS 3 requires PostgreSQL or MongoDB, meaning you would need to add a new database container. If your VPS is tight on RAM, avoiding a new database service is a meaningful advantage for Directus. If you are already running Postgres (or planning to drop MySQL when Ghost goes), Payload becomes equally viable.

### Q2: Do you want to define the content model in code (version-controlled config files) or in a GUI (admin panel)?

**Why this matters:** This is the core split between Payload and Directus. Payload defines content types in TypeScript config files that live in your repo - you get version control, diffs, and CI. Directus defines content types in its admin UI and stores the schema in the database - faster to iterate but not natively version-controlled (schema snapshots can be exported, but it is not the same as config-as-code). For a solo developer operator, either works. But if you plan to template this setup for future clients (spin up a new CMS per client from a shared config), Payload's code-first approach is significantly better.

### Q3: Will you be managing content yourself (developer editing fields), or do you expect non-technical people to edit content in this CMS in future?

**Why this matters:** If it is always you, a developer-centric tool like Payload (or even just a JSON file with a deploy step) is fine. If you envision handing CMS access to a client, a VA, or a future team member, the quality of the editing UX matters more. Directus has the most intuitive admin panel for non-technical editors. Payload is good but slightly more developer-flavoured.

### Q4: How much RAM is available on the VPS after your existing containers (Traefik, Nginx, Ghost, MySQL)?

**Why this matters:** If you have 1 GB free, any option works. If you are under 512 MB free, Cockpit CMS with SQLite (~100 MB) becomes the pragmatic choice and Payload + Postgres (~500-600 MB combined) is too heavy. Directus + existing MySQL (~250-350 MB for the Directus container alone) sits in the middle. This is a hard constraint that could override all other preferences.

### Q5: When you drop Ghost, do you want the new CMS to also serve as the image/media host for portfolio screenshots, or will you handle images separately (e.g. S3, Cloudflare R2, filesystem)?

**Why this matters:** If the CMS needs to be the media library (upload screenshots in the admin panel, serve them via API), Directus and Payload both have solid built-in media management with image transformations. Cockpit's media handling is more basic. If you plan to manage images outside the CMS (object storage, local filesystem served by Nginx), this becomes irrelevant and the lightest-weight option wins. This also affects disk I/O and storage planning on the VPS.
