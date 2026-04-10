# Task Breakdown - Skeleton Crew Frontend Site

---

## Phase 1: Foundation

---

## Task 001: Design System - CSS Variables and Reset
**Phase:** 1 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** none

### Context
Every component depends on the design tokens. Nothing else can be built until `variables.css` and `reset.css` exist and define the canonical colours, typography, spacing, and breakpoints.

### What Needs Doing
1. Create `css/variables.css` with all design tokens from the brief:
   - Colour palette: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-muted`, `--color-border`
   - Font families: `--font-hero` (Lacquer), `--font-display` (Bebas Neue), `--font-body` (DM Sans) with fallback stacks
   - Font sizes scale (fluid or fixed breakpoints - agent decides)
   - Spacing scale (consistent multiplier)
   - Breakpoints as custom properties or documented comment block
   - Border radius, transition durations, z-index layers
   - Comment the file clearly - label it as "the only file you need to edit per client"
2. Create `css/reset.css` with a modern CSS reset (box-sizing, margin reset, image defaults, accessible focus styles)

### Files
- `css/variables.css` (create)
- `css/reset.css` (create)

### How to Test
- Open a blank HTML page that imports both files. Inspect computed styles to confirm all custom properties resolve correctly.
- Confirm fallback font stacks render if Google Fonts are blocked.
- Confirm no default browser margins/padding remain on `body`, `h1`-`h6`, `p`, `ul`.

### Unexpected Outcomes
- If the fluid type scale produces unreadable sizes at any viewport width, flag for review rather than adding breakpoint overrides ad hoc.

### On Completion
Queue TASK-002 (Global Styles).

---

## Task 002: Design System - Global Styles
**Phase:** 1 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-001

### Context
Global styles establish the base typography, link styles, button patterns, section spacing, and skeleton loader CSS that every page and component inherits.

### What Needs Doing
1. Create `css/global.css`:
   - Google Fonts `@import` or `<link>` strategy (prefer `<link>` in HTML with `display=swap`)
   - Base body styles: background, colour, font-family, line-height
   - Heading styles: `h1` through `h4` with the correct font families (Lacquer for h1, Bebas Neue for h2-h4)
   - Link styles: default, hover (neon green), focus-visible
   - Button base classes: `.btn`, `.btn--primary`, `.btn--secondary` (ghost/outline variant)
   - Section layout utility: `.section` with consistent vertical padding
   - Container utility: `.container` with max-width and auto margins
   - Skeleton loader base styles: `.skeleton-image`, `.skeleton-line`, `.skeleton-line--title`, `.skeleton-line--text` with pulse animation keyframe
   - `.visually-hidden` utility class for accessible hidden elements
   - `prefers-reduced-motion` media query that disables all animations
2. Set up the Google Fonts `<link>` tag approach - document it as a note for use in all HTML pages

### Files
- `css/global.css` (create)

### How to Test
- Create a test HTML page with headings, paragraphs, buttons, and skeleton loaders. Confirm:
  - Lacquer renders on h1, Bebas Neue on h2-h4, DM Sans on body text
  - `.btn--primary` has neon green fill, `.btn--secondary` has neon green outline only
  - Skeleton loaders pulse correctly
  - With `prefers-reduced-motion: reduce` enabled in browser, pulse animation stops

### Unexpected Outcomes
- If Lacquer at large sizes looks pixelated or thin, flag for review - may need weight adjustment or alternative.

### On Completion
Queue TASK-003 (Vendor GSAP) and TASK-010 (Logo Design) in parallel.

---

## Task 003: Vendor GSAP Files
**Phase:** 1 | **Agent:** Architect
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** none

### Context
GSAP must be self-hosted to eliminate CDN dependency. The animation system (TASK-019) and toggle demo (TASK-009) both depend on these files being available locally.

### What Needs Doing
1. Download `gsap.min.js` and `ScrollTrigger.min.js` from the GSAP CDN or npm package (free tier, standard license)
2. Place both files in `js/vendor/`
3. Verify the files are the latest stable release (3.x line)
4. Add a comment at the top of each file noting the version and download date for future reference

### Files
- `js/vendor/gsap.min.js` (create)
- `js/vendor/ScrollTrigger.min.js` (create)

### How to Test
- Create a minimal HTML page that includes both scripts via `<script src="js/vendor/gsap.min.js">` and `<script src="js/vendor/ScrollTrigger.min.js">`. Open browser console and confirm `gsap` and `ScrollTrigger` are defined on `window`.
- Confirm file sizes are reasonable (gsap.min.js ~70-90KB, ScrollTrigger ~30-40KB).

### Unexpected Outcomes
- If the GSAP free license terms have changed since the architecture was approved, flag immediately. Do not vendor files with incompatible licensing.

### On Completion
GSAP is available for all animation tasks (TASK-009, TASK-019).

---

## Task 004: Ghost CMS Content Seeding - Tags
**Phase:** 1 | **Agent:** Architect
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** none

### Context
All Ghost tags must exist before any content posts can be created. The frontend filtering depends on these exact tag slugs.

### What Needs Doing
1. Log into Ghost Admin at `https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost`
2. Create the following tags:
   - `portfolio` (public tag) - name: "Portfolio", description: "Client portfolio entries"
   - `#pricing-website` (internal tag) - name: "#pricing-website"
   - `#pricing-ai` (internal tag) - name: "#pricing-ai"
   - `#tier-1` (internal tag) - name: "#tier-1"
   - `#tier-2` (internal tag) - name: "#tier-2"
   - `#tier-3` (internal tag) - name: "#tier-3"
3. Confirm internal tags are prefixed with `#` so they do not appear in public tag listings

### Files
- No code files - Ghost CMS admin only

### How to Test
- Navigate to Ghost Admin > Tags. Confirm all 6 tags exist.
- Navigate to the Internal tags tab. Confirm the 5 internal tags appear there.
- Hit the Content API: `GET /ghost/api/content/tags/?key=6a81932590f32d95416a5191a7` and confirm `portfolio` appears in the response. Internal tags should not appear in this public listing.

### Unexpected Outcomes
- If Ghost does not support internal tags in this version, flag immediately - the pricing tier sorting strategy needs revision.

### On Completion
Queue TASK-005 (Portfolio Content), TASK-006 (Pricing Content), TASK-007 (Site Content Pages).

---

## Task 005: Ghost CMS Content Seeding - Portfolio Entry
**Phase:** 1 | **Agent:** Architect
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-004

### Context
At least one real portfolio entry must exist for frontend development and testing. The mushroom grow business is the first real client and should be seeded now.

### What Needs Doing
1. In Ghost Admin, create a new post:
   - Title: The mushroom grow business name (use the actual business name from the live site)
   - Tag: `portfolio`
   - Custom excerpt: One-line description of what was built for them
   - Feature image: Screenshot of the live site (take a screenshot and upload)
   - Canonical URL: URL of the live mushroom grow business site
   - Status: Published
2. Verify the post appears in a Content API query filtered by `tag:portfolio`

### Files
- No code files - Ghost CMS admin only

### How to Test
- Fetch `GET /ghost/api/content/posts/?key=6a81932590f32d95416a5191a7&filter=tag:portfolio&include=tags&fields=title,custom_excerpt,feature_image,canonical_url` and confirm the entry appears with all fields populated.
- Confirm `canonical_url` returns the external site URL.

### Unexpected Outcomes
- If `canonical_url` is not exposed via the Content API in this Ghost version, flag immediately - need an alternative field for storing external URLs.
- If the mushroom grow business details are not yet available, create a clearly-marked placeholder entry and flag for operator review.

### On Completion
Portfolio data is available for TASK-014 (Portfolio Section) and TASK-017 (Work Page).

---

## Task 006: Ghost CMS Content Seeding - Pricing Tiers
**Phase:** 1 | **Agent:** Architect
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-004

### Context
Six pricing tier posts must be created in Ghost so the frontend can develop against real data. Copy must be outcome-led and match the brand tone.

### What Needs Doing
1. Create 3 website build tier posts in Ghost. For each post:
   - Assign tags: `pricing-website` + the appropriate `tier-N` tag
   - Set `custom_excerpt` to a one-line "who it's for" description
   - Set `featured: true` on the middle tier only
   - Post body uses the HTML template from the architecture doc:
     ```html
     <p data-price>From &pound;X</p>
     <ul>
       <li>Outcome bullet 1</li>
       <li>Outcome bullet 2</li>
       <li>Outcome bullet 3</li>
     </ul>
     ```
   - Propose tier names that are outcome-led (not "Basic/Pro/Enterprise"). Territory: "The Starter", "The Full Works", "The Flagship" or similar.
   - Propose pricing: entry-level around 499-799, mid around 1,500-2,500, premium around 3,500-5,000. All in GBP.
   - All copy framed as client outcomes - no tech jargon.
2. Create 3 AI consulting tier posts following the same pattern:
   - Tags: `pricing-ai` + `tier-N`
   - Tier 1: ~£299 audit
   - Tier 2: ~£800-2,500 build
   - Tier 3: ~£300-600/month retainer
   - Same outcome-led copy style
3. Publish all 6 posts in chronological order (tier-1 first) so `published_at asc` produces correct sort order

### Files
- No code files - Ghost CMS admin only

### How to Test
- Fetch `GET /ghost/api/content/posts/?key=6a81932590f32d95416a5191a7&filter=tag:pricing-website&include=tags&order=published_at%20asc` and confirm 3 posts return in correct tier order.
- Fetch the same for `tag:pricing-ai` and confirm 3 posts return.
- Confirm the middle tier of website builds has `featured: true`.
- Confirm each post body contains `data-price` paragraph and `<ul>` with outcome bullets.
- Confirm no tech jargon in any copy (no mentions of "CMS", "API", "Docker", "headless", etc.).

### Unexpected Outcomes
- If Ghost does not support the `featured` field on posts, flag - the frontend needs another way to identify the highlighted tier.
- If `published_at` ordering does not work reliably for controlling sort, flag - may need to use a different ordering strategy.

### On Completion
Pricing data is available for TASK-015 (Pricing Section) and TASK-018 (Services Page).

---

## Task 007: Ghost CMS Content Seeding - Site Content Pages
**Phase:** 1 | **Agent:** Architect
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-004

### Context
Five Ghost pages store editable site copy (hero, CTA strip, about, what-we-do cards). These must be seeded with real copy so the frontend can develop against actual content.

### What Needs Doing
1. Create the following Ghost pages (not posts) with exact slugs:
   - **`site-hero`**
     - Title: Propose 3 tagline options and select the strongest. Must communicate "we build sites that don't look like everyone else's." Avoid cliches. Territory: confident, subversive, witty.
     - Custom excerpt: One sentence - who Skeleton Crew is for (small UK businesses with no site or an embarrassing one)
   - **`site-cta-strip`**
     - Title: CTA headline. Territory: "your competitors have a website - do you?" Make it punchy and slightly provocative.
     - Custom excerpt: CTA button text (e.g., "Let's talk")
   - **`site-about`**
     - Title: About section headline
     - Body (html): About copy - a few paragraphs in the brand voice. Witty, straight-talking, no jargon.
   - **`site-what-we-do-websites`**
     - Title: "Website Builds" (or similar)
     - Body (html): One punchy, outcome-led paragraph about website builds. No bullet points.
   - **`site-what-we-do-ai`**
     - Title: "AI Consulting" (or similar)
     - Body (html): One punchy, outcome-led paragraph about AI consulting. No bullet points.
2. Publish all 5 pages
3. Document the chosen tagline options and which was selected, with reasoning

### Files
- No code files - Ghost CMS admin only

### How to Test
- Fetch `GET /ghost/api/content/pages/?key=6a81932590f32d95416a5191a7&filter=slug:[site-hero,site-cta-strip,site-about,site-what-we-do-websites,site-what-we-do-ai]` and confirm all 5 pages return.
- Confirm each page has the expected `title`, `custom_excerpt` (where used), and `html` body (where used).
- Read all copy aloud - confirm it sounds like a real person, not a pitch deck. No jargon, no "solutions", no cliches.

### Unexpected Outcomes
- If Ghost does not allow filtering pages by multiple slugs in a single query, flag - may need individual fetches per page (impacts API call count).
- If any copy feels generic or corporate, flag for operator review before proceeding.

### On Completion
Site content is available for TASK-008 (Hero), TASK-013 (What We Do), TASK-016 (CTA Strip).

---

## Phase 2: Design Assets

---

## Task 010: Logo SVG - Three Variants
**Phase:** 2 | **Agent:** Design
**Priority:** High | **Status:** TODO
**Est. Effort:** L | **Dependencies:** none

### Context
The logo is used in the nav, hero, footer, and as a favicon. Three variants are required so the operator can choose. The logo defines the brand's visual identity.

### What Needs Doing
1. Design 3 logo variants, each containing:
   - A skeleton character (simplified, graphic - not anatomically accurate)
   - "SKELETON CREW" in a graffiti-influenced style - chunky, slightly irregular, like it was painted on the base of a skateboard deck
   - Black and neon green (`#00FF41`) only - must work on dark (`#0a0a0a`) background
2. Variants should explore different arrangements:
   - Variant A: Skeleton character inline/beside the text
   - Variant B: Skeleton character above the text
   - Variant C: A different compositional approach (agent decides)
3. Each variant must work at:
   - Large size (hero placement, ~300px wide)
   - Small size (nav, ~120px wide)
   - Icon size (favicon, 32x32px - the skeleton character alone)
4. Export as clean, optimized SVG:
   - `assets/logo.svg` - recommended variant, full logo
   - `assets/logo-alt-1.svg` - alternative variant 1
   - `assets/logo-alt-2.svg` - alternative variant 2
   - `assets/logo-icon.svg` - skeleton character only (for favicon and small uses)
5. Document which variant is recommended and why

### Files
- `assets/logo.svg` (create)
- `assets/logo-alt-1.svg` (create)
- `assets/logo-alt-2.svg` (create)
- `assets/logo-icon.svg` (create)

### How to Test
- Open each SVG in a browser on a `#0a0a0a` background. Confirm legibility and visual impact.
- Scale each to 32px width. Confirm the skeleton character is still recognizable.
- Scale each to 300px width. Confirm detail and quality.
- Validate SVGs: no embedded raster images, no external font dependencies, viewBox set correctly.

### Unexpected Outcomes
- If the graffiti text style is not achievable in clean SVG paths (too complex), simplify to a bold hand-drawn style and flag the compromise.
- If the skeleton character is not recognizable at favicon size, flag - may need a separate simplified icon design.

### On Completion
Queue TASK-011 (Favicon Generation). Logo is available for TASK-008 (Hero), TASK-012 (Nav), TASK-020 (Footer).

---

## Task 011: Favicon Generation
**Phase:** 2 | **Agent:** Design
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-010

### Context
The favicon uses the skeleton character icon from the logo. Standard sizes needed for browser tabs, bookmarks, and mobile home screens.

### What Needs Doing
1. Using the `logo-icon.svg` skeleton character, generate:
   - `assets/favicon.ico` (multi-size ICO: 16x16, 32x32, 48x48)
   - `assets/favicon-32.png` (32x32 PNG)
   - `assets/favicon-16.png` (16x16 PNG)
   - `assets/apple-touch-icon.png` (180x180 PNG)
2. Ensure the icon reads clearly at 16x16 - simplify detail if necessary
3. Use neon green (`#00FF41`) on transparent background

### Files
- `assets/favicon.ico` (create)
- `assets/favicon-32.png` (create)
- `assets/favicon-16.png` (create)
- `assets/apple-touch-icon.png` (create)

### How to Test
- Set the favicon in a test HTML page using `<link rel="icon">` tags. View in Chrome, Firefox, and Safari.
- Confirm the icon is distinguishable at browser tab size.
- Confirm `apple-touch-icon.png` looks correct when added to iOS home screen (or simulated in a 180x180 preview).

### Unexpected Outcomes
- If the skeleton character is not recognizable at 16x16, flag for Design to produce a further-simplified icon variant.

### On Completion
Favicons are ready for inclusion in all HTML page `<head>` sections.

---

## Phase 3: Core Page Structure

---

## Task 008: Homepage HTML Shell and Hero Section
**Phase:** 3 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-001, TASK-002, TASK-003

### Context
The homepage is the primary page and container for all homepage sections. The hero is the first thing visitors see and contains the toggle demo button. Building the HTML shell establishes the page structure that all other homepage sections slot into.

### What Needs Doing
1. Create `index.html` with:
   - Proper `<!DOCTYPE html>`, lang attribute, meta tags (charset, viewport, description)
   - Favicon links (placeholder paths until TASK-011 completes)
   - Google Fonts `<link>` tags (Lacquer, Bebas Neue, DM Sans) with `display=swap`
   - CSS imports: `variables.css`, `reset.css`, `global.css`, component CSS files
   - Semantic structure: `<header>`, `<main>`, `<footer>`
   - Placeholder `<nav>` (built out in TASK-012)
   - GSAP script tags (defer): `js/vendor/gsap.min.js`, `js/vendor/ScrollTrigger.min.js`
   - JS module imports at the bottom
2. Build the hero section:
   - Full viewport height (`100vh`)
   - Headline element with `data-ghost="hero-title"` attribute and fallback text
   - Subheadline with `data-ghost="hero-subtitle"` and fallback text
   - Primary CTA: "See our work" linking to `/work/`
   - Secondary CTA: "Get a quote" linking to `/contact/`
   - Toggle demo button (ghost/outline style): initial label "See what everyone else gives you" - wired up in TASK-009
   - Subtle background: CSS-only animated noise texture or gradient (GSAP particle field added in TASK-019 if appropriate)
3. Create `css/components/hero.css` with hero-specific styles

### Files
- `index.html` (create)
- `css/components/hero.css` (create)

### How to Test
- Open `index.html` in a browser. Hero fills the viewport.
- Headline and subheadline render in correct fonts (Lacquer for h1, DM Sans for subheadline).
- Both CTA buttons are visible and link to the correct paths.
- Toggle button is visible below the CTAs.
- Page validates with no HTML errors (W3C validator or equivalent).
- Background has a subtle animated effect (not static, not distracting).

### Unexpected Outcomes
- If Google Fonts cause a significant FOUT (flash of unstyled text), flag - may need to add `font-display: optional` or preload critical fonts.

### On Completion
Queue TASK-009 (Toggle Demo) and TASK-012 (Nav). Homepage shell is ready for remaining sections.

---

## Task 009: Toggle Demo (CSS-Only Swap + GSAP Transition)
**Phase:** 3 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** L | **Dependencies:** TASK-008, TASK-003

### Context
The toggle demo is the star feature of the entire site. It swaps the page between a "before" (generic template) look and the "after" (Skeleton Crew) look using CSS class toggle and GSAP animated transitions. This is the core sales pitch.

### What Needs Doing
1. Create `css/before.css`:
   - All rules scoped under `body.before-mode` selector
   - Override every styled element to look like a generic Wix/Squarespace template:
     - Background: `#f0f0f0`
     - Fonts: Arial/system-serif only
     - Nav: full-width solid blue bar (`#003087`), white text, too tall
     - Hero: CSS gradient simulating bad stock photo feel, centred text
     - Buttons: `#003087` background, white text, square corners, too large, drop shadow
     - Content blocks: centred text, mismatched font sizes
     - Colours: royal blue, grey, that particular maroon (`#800020` territory) that only exists on old websites
   - Cover every component that has styles in the real CSS
2. Create `js/toggle.js`:
   - Toggle button click adds/removes `before-mode` class on `<body>`
   - Use GSAP to animate the transition (600-800ms):
     - Animate background colour, font sizes, element dimensions, colours, spacing simultaneously
     - Use GSAP `to`/`from` with custom properties or direct property animation
   - Button label swaps:
     - After state: "See what everyone else gives you"
     - Before state: "See what we do differently"
   - State pill/badge in bottom corner: shows "BEFORE" or "AFTER"
   - Button has a subtle pulsing animation on first load (GSAP) that stops after first click
3. Create `css/components/toggle.css` for toggle-specific UI (pill badge, button pulse)

### Files
- `css/before.css` (create)
- `js/toggle.js` (create)
- `css/components/toggle.css` (create)

### How to Test
- Click the toggle button. The page smoothly morphs to the "before" state over ~700ms.
- Click again. It smoothly morphs back to the "after" state.
- In "before" mode: page looks like a generic template site - blue nav bar, Arial fonts, grey background, maroon accents, square buttons.
- In "after" mode: page looks like the Skeleton Crew design.
- The pill badge in the bottom corner shows the correct state label.
- The button label changes correctly on each toggle.
- The transition does not cause layout shift or content reflow.
- The pulse animation on the button stops after first interaction.
- `prefers-reduced-motion`: transition is instant (no animation), but toggle still functions.

### Unexpected Outcomes
- If GSAP cannot smoothly animate between CSS custom property values (e.g., font-family cannot be interpolated), flag which properties need an alternative approach (e.g., crossfade opacity between two overlapping elements).
- If the before CSS conflicts with specific component styles in unexpected ways, flag the specific conflicts rather than broadening selectors.

### On Completion
Queue TASK-021 (Before-Mode Test Script). The toggle demo is functionally complete but should be revisited after each new section is added to ensure `before.css` covers it.

---

## Task 012: Nav Component
**Phase:** 3 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-008, TASK-010

### Context
The nav appears on every page. It must be sticky, responsive, and include the logo. The mobile hamburger menu is the primary mobile navigation pattern.

### What Needs Doing
1. Build the nav markup in `index.html` (and replicate in all page HTMLs):
   - `<nav>` element, full-width, dark background
   - Logo (SVG) on the left, linking to `/`
   - Nav links on the right: Work (`/work/`), Services (`/services/`), Contact (`/contact/`)
   - Links in Bebas Neue, letter-spaced
   - Mobile: hamburger icon button, full-screen overlay menu on click
2. Create `css/components/nav.css`:
   - Sticky positioning on scroll
   - Neon green underline slides in from left on hover (CSS transition, not GSAP - keep it lightweight)
   - Mobile breakpoint: hide links, show hamburger
   - Full-screen overlay: dark background, large centered links, close button
   - Appropriate z-index layering
3. Create `js/nav.js`:
   - Hamburger toggle: open/close overlay
   - Close overlay on link click
   - Close overlay on Escape key
   - Focus trap within overlay when open (accessibility)
   - Add/remove `aria-expanded` on hamburger button

### Files
- `index.html` (modify - add nav markup)
- `css/components/nav.css` (create)
- `js/nav.js` (create)

### How to Test
- Desktop (>768px): Logo left, links right, sticky on scroll. Hover a link - green underline slides in from left.
- Mobile (<768px): Only logo and hamburger visible. Click hamburger - full-screen overlay appears with links. Click a link - overlay closes. Press Escape - overlay closes.
- Keyboard navigation: Tab through nav links. Focus styles visible. Hamburger has `aria-expanded="false"` by default, `"true"` when open.
- Nav remains sticky after scrolling 1000px.

### Unexpected Outcomes
- If the logo SVG is not yet available (TASK-010 incomplete), use a text placeholder "SKELETON CREW" in Lacquer font and flag. Do not block on the logo.

### On Completion
Nav is complete. Replicate markup into other page HTML files as they are created (TASK-017, TASK-018, TASK-022).

---

## Task 013: "What We Do" Section
**Phase:** 3 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-008

### Context
Two side-by-side cards explaining website builds and AI consulting. Content comes from Ghost pages `site-what-we-do-websites` and `site-what-we-do-ai`.

### What Needs Doing
1. Add the "What we do" section to `index.html` below the hero:
   - Two cards in a flex/grid row (stack on mobile)
   - Each card: heading with `data-ghost` attribute, one paragraph body with `data-ghost` attribute, thin neon green border
   - Fallback text hardcoded in the HTML (replaced by JS when Ghost data loads)
   - No bullet points, no icons - strong type only
2. Create `css/components/what-we-do.css` with card styles

### Files
- `index.html` (modify - add section)
- `css/components/what-we-do.css` (create)

### How to Test
- Two cards side by side on desktop, stacked on mobile.
- Cards have a thin neon green border (`--color-accent`).
- Fallback text is visible on first load.
- When Ghost is reachable, content is replaced by CMS data.
- No bullet points or icons - just heading + paragraph per card.

### Unexpected Outcomes
- If the card text is too long/short and the cards are uneven heights, flag whether to use equal-height (CSS Grid) or auto-height.

### On Completion
Section complete. Will be integrated with Ghost API in TASK-023.

---

## Task 014: Portfolio Teaser Section
**Phase:** 3 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-008

### Context
Three portfolio cards on the homepage, fetched from Ghost. This is a teaser for the full Work page. Must handle 0-3 entries gracefully.

### What Needs Doing
1. Add the portfolio section to `index.html`:
   - Section heading
   - Grid container with `data-ghost="portfolio"` attribute
   - 3 skeleton loader cards (visible on first paint, replaced by JS)
   - "See all work" link to `/work/`
2. Create `css/components/portfolio.css`:
   - Card styles: image, project name, one-line description
   - 3-column grid on desktop, single column on mobile
   - Card hover: lift effect (`translateY(-4px)`, subtle shadow)
   - Skeleton card styles matching final card dimensions
3. The render function (in `ghost-api.js` or a separate renderer) should:
   - Replace skeleton cards with real cards when data arrives
   - Show only as many cards as exist (no placeholder cards for missing entries)
   - Link each card to the external site via `canonical_url`

### Files
- `index.html` (modify - add section)
- `css/components/portfolio.css` (create)

### How to Test
- On first load, 3 skeleton cards are visible and pulsing.
- When Ghost responds, skeletons are replaced with real portfolio cards.
- If Ghost is unreachable, skeleton cards are replaced with a minimal fallback message.
- If fewer than 3 portfolio entries exist in Ghost, only that many cards render (no empty slots).
- Cards link to the external site URL. Links open in a new tab.
- Hover effect works on desktop.
- Cards stack on mobile.

### Unexpected Outcomes
- If `canonical_url` is not available via the Content API, flag immediately - the card "View site" link has no URL source.

### On Completion
Portfolio teaser is complete. Depends on TASK-023 for Ghost API wiring.

---

## Task 015: Pricing Preview Section
**Phase:** 3 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-008

### Context
Three website build pricing tiers on the homepage, fetched from Ghost. The middle tier is visually highlighted. This is a preview - full pricing is on the Services page.

### What Needs Doing
1. Add the pricing section to `index.html`:
   - Section heading
   - Grid container with `data-ghost="pricing-website"` attribute
   - 3 skeleton loader cards
   - "See all services" link to `/services/`
2. Create `css/components/pricing.css`:
   - Tier card styles: name, price, feature bullets, CTA button
   - 3-column grid on desktop, single column on mobile
   - Middle (featured) tier: neon green border highlight treatment
   - Skeleton card styles matching final card dimensions
3. The render function should:
   - Parse `data-price` from each post's HTML body for the price element
   - Parse `<ul>` from each post's HTML body for feature bullets
   - Use `title` for tier name, `custom_excerpt` for "who it's for"
   - Apply the featured highlight to the post with `featured: true`

### Files
- `index.html` (modify - add section)
- `css/components/pricing.css` (create)

### How to Test
- 3 skeleton cards visible on first load.
- When Ghost responds, skeletons replaced with real pricing cards.
- Middle tier has a distinct neon green border.
- Each card shows: tier name, price, 3-4 feature bullets, CTA button.
- Cards stack on mobile.
- CTA buttons link to `/contact/`.
- HTML parsing correctly extracts `data-price` paragraph and `<ul>` list.

### Unexpected Outcomes
- If the Ghost post body HTML structure does not match the expected template (operator edited it differently), flag - the parser needs to be resilient to minor HTML variations.

### On Completion
Pricing preview complete. Depends on TASK-023 for Ghost API wiring.

---

## Task 016: CTA Strip Section
**Phase:** 3 | **Agent:** Frontend
**Priority:** Low | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-008

### Context
A full-width call-to-action strip between the pricing section and footer. Copy fetched from Ghost page `site-cta-strip`.

### What Needs Doing
1. Add the CTA strip section to `index.html`:
   - Full-width, `--color-surface` background
   - Bold headline with `data-ghost="cta-title"` and fallback text
   - Single CTA button: text from `data-ghost="cta-button"`, links to `/contact/`
2. Create `css/components/cta-strip.css` with strip-specific styles

### Files
- `index.html` (modify - add section)
- `css/components/cta-strip.css` (create)

### How to Test
- CTA strip spans full width with surface background colour.
- Headline renders in Bebas Neue, bold, centered.
- Button links to `/contact/`.
- Fallback text visible when Ghost is unreachable.
- Ghost data replaces fallback text when available.

### Unexpected Outcomes
- None anticipated - this is a simple section.

### On Completion
CTA strip complete. Depends on TASK-023 for Ghost API wiring.

---

## Task 020: Footer Component
**Phase:** 3 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-008, TASK-010

### Context
The footer appears on every page. It contains the logo, nav links, and a one-liner about the business. No social links.

### What Needs Doing
1. Build the footer in `index.html` (replicate in all page HTMLs):
   - `<footer>` element
   - Logo (SVG, smaller version)
   - Nav links: Work, Services, Contact
   - One-liner about Skeleton Crew
   - Copyright line with dynamic year
2. Create `css/components/footer.css`

### Files
- `index.html` (modify - add footer)
- `css/components/footer.css` (create)

### How to Test
- Footer appears at the bottom of every page.
- Logo is visible and links to `/`.
- Nav links work and match the header nav.
- Copyright year is current (rendered via JS or hardcoded with a note to update).
- No social media links.
- Footer is visually distinct from page content (border or background difference).

### Unexpected Outcomes
- If the logo SVG is not yet available, use text placeholder and flag.

### On Completion
Footer is complete. Replicate into other page HTML files as they are created.

---

## Phase 4: Ghost API Integration

---

## Task 023: Ghost API Integration Module
**Phase:** 4 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** L | **Dependencies:** TASK-005, TASK-006, TASK-007, TASK-008

### Context
The central JavaScript module that fetches all content from Ghost and renders it into the page. This is the bridge between the CMS and the frontend. Every section that displays Ghost content depends on this module.

### What Needs Doing
1. Create `js/ghost-api.js` as an ES module following the architecture doc pattern:
   - Config constants: `API_BASE`, `API_KEY`, `CACHE_TTL` (5 min), `FETCH_TIMEOUT` (5s)
   - Internal `fetchFromGhost(resource, params)` function with:
     - `sessionStorage` caching with TTL
     - `AbortController` timeout (5s)
     - Returns `null` on failure (signals fallback)
   - Public functions: `getPortfolio()`, `getPricingWebsite()`, `getPricingAI()`, `getSiteContent()`
   - `initGhostContent()` - fires after first paint via `requestAnimationFrame` + `setTimeout(0)`, runs all fetches in parallel with `Promise.all`
   - Render functions for each section:
     - `renderPortfolio(data)` - replaces skeleton cards in portfolio grid
     - `renderPricing(category, data)` - replaces skeleton cards in pricing grid, parses `data-price` and `<ul>` from post body HTML
     - `renderSiteContent(data)` - replaces `data-ghost` attributed elements with CMS content
   - Fallback render functions: when data is `null`, replace skeletons with hardcoded fallback content
2. Wire `initGhostContent()` to fire on `DOMContentLoaded` in the homepage

### Files
- `js/ghost-api.js` (create)
- `index.html` (modify - add module script import)

### How to Test
- Load homepage with Ghost running: all sections populate with CMS content within 1-2 seconds. Skeleton loaders disappear.
- Load homepage with Ghost unreachable (simulate by changing API key temporarily): skeleton loaders are replaced with fallback content. No JS errors in console. Page remains navigable.
- Open DevTools > Network: confirm Ghost API calls fire after first paint, not during initial render.
- Open DevTools > Application > Session Storage: confirm cached responses appear with timestamps.
- Navigate away and back within 5 minutes: confirm content loads from cache (no new network requests to Ghost).
- Wait 5+ minutes and reload: confirm fresh fetch occurs.

### Unexpected Outcomes
- If Ghost returns unexpected response structure (different field names, pagination wrapping), flag the specific discrepancy. Do not silently ignore missing fields.
- If `sessionStorage` is unavailable (private browsing in some browsers), the module should degrade gracefully (fetch every time, no caching). Flag if this edge case is not handled.

### On Completion
All homepage sections now display Ghost content. Queue TASK-024 (Fallback Regeneration Script).

---

## Task 024: Fallback Content Regeneration Script
**Phase:** 4 | **Agent:** Architect
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-023

### Context
A weekly cron job script fetches current Ghost content and writes a static JSON fallback file. This keeps fallback content current rather than stale from the initial build. The frontend can import this JSON when the live API is unreachable.

### What Needs Doing
1. Create `scripts/regenerate-fallback.js`:
   - Node.js script (runs via system cron, not in the browser)
   - Fetches all 4 content types from Ghost Content API (portfolio, pricing-website, pricing-ai, site content pages)
   - Writes the responses to `js/fallback-content.json` as a structured JSON file
   - Handles errors gracefully - if Ghost is down, log a warning and do not overwrite the existing fallback file
   - Log success/failure to stdout for cron log capture
   - Include a timestamp in the JSON output so the frontend can display "last updated" if needed
2. Update `js/ghost-api.js` to import and use `fallback-content.json` when the live API returns `null`
3. Document the cron setup in a comment at the top of the script:
   ```
   # Run weekly: 0 3 * * 0 node /srv/skeleton/clients/skeleton-crew/public/scripts/regenerate-fallback.js
   ```

### Files
- `scripts/regenerate-fallback.js` (create)
- `js/fallback-content.json` (created by the script)
- `js/ghost-api.js` (modify - add fallback JSON import)

### How to Test
- Run the script manually: `node scripts/regenerate-fallback.js`
- Confirm `js/fallback-content.json` is created with valid JSON containing all content types.
- Confirm the JSON includes a `generatedAt` timestamp.
- Modify the Ghost API key to an invalid one and run again. Confirm the script logs a warning and does not overwrite the existing JSON file.
- In the browser, block Ghost API requests. Confirm the frontend loads content from the fallback JSON file.

### Unexpected Outcomes
- If the script runs in an environment without `fetch` (older Node.js), flag - may need `node-fetch` or a minimum Node version requirement.
- If the fallback JSON file is too large (>500KB), flag for discussion about trimming content.

### On Completion
Fallback system is complete and production-ready.

---

## Phase 5: Additional Pages

---

## Task 017: Work/Portfolio Page
**Phase:** 5 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-012, TASK-020, TASK-023

### Context
Full portfolio page showing all project entries from Ghost. Standalone page with its own HTML file, reusing nav and footer components.

### What Needs Doing
1. Create `work/index.html`:
   - Same `<head>` setup as homepage (fonts, CSS, favicons)
   - Reuse nav and footer markup
   - Short page hero: headline + subheadline (not full-viewport)
   - Grid container for portfolio cards with skeleton loaders
2. Create `js/work.js` (or extend `ghost-api.js`):
   - Fetch all portfolio posts (no limit - show all entries)
   - Render cards: project name, business type/tag, one-line description, screenshot, "View site" external link
   - Masonry or equal-height grid (agent decides which looks best)
3. Add page-specific CSS if needed (or reuse `portfolio.css` from homepage)

### Files
- `work/index.html` (create)
- `js/work.js` (create, if needed)

### How to Test
- Navigate to `/work/`. Page loads with nav, hero, portfolio grid, footer.
- All portfolio entries from Ghost appear as cards.
- Cards show: image, title, description, external link.
- "View site" links open in new tabs.
- Grid is responsive: multi-column on desktop, single column on mobile.
- Skeleton loaders appear while fetching, replaced by real content.
- If Ghost is unreachable, fallback content displays.

### Unexpected Outcomes
- If there are many portfolio entries (10+), consider lazy loading images and flag if pagination is needed.

### On Completion
Work page is complete.

---

## Task 018: Services Page
**Phase:** 5 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-012, TASK-020, TASK-023

### Context
Full services page showing all six pricing tiers (3 website builds + 3 AI consulting) from Ghost. Two distinct sections.

### What Needs Doing
1. Create `services/index.html`:
   - Same `<head>` setup as homepage
   - Reuse nav and footer markup
   - Short page hero
   - "Website Builds" section: 3 pricing tier cards from Ghost (`tag:pricing-website`)
   - "AI Consulting" section: 3 pricing tier cards from Ghost (`tag:pricing-ai`)
   - Each section has skeleton loaders
2. Create `js/services.js` (or extend `ghost-api.js`):
   - Fetch both pricing categories
   - Render full tier cards: name, who it's for, price, feature bullets, CTA
   - Featured tier gets highlight treatment
3. Reuse `pricing.css` styles from homepage, extend if needed for full-page layout

### Files
- `services/index.html` (create)
- `js/services.js` (create, if needed)

### How to Test
- Navigate to `/services/`. Page loads with both pricing sections.
- Website Builds section shows 3 tiers in correct order.
- AI Consulting section shows 3 tiers in correct order.
- Featured tier has visual highlight.
- All CTAs link to `/contact/`.
- Skeleton loaders visible during fetch, replaced by real content.
- If Ghost is unreachable, fallback content displays.
- Responsive: cards stack on mobile.

### Unexpected Outcomes
- If the AI consulting tiers have a different structure (monthly pricing vs one-time), flag if the card template needs adaptation.

### On Completion
Services page is complete.

---

## Task 022: Contact Page
**Phase:** 5 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-012, TASK-020

### Context
Contact page with Web3Forms AJAX submission. The form handler ID is a placeholder replaced by the operator before deploy.

### What Needs Doing
1. Create `contact/index.html`:
   - Same `<head>` setup as homepage
   - Reuse nav and footer markup
   - Short hero: "Let's talk." - nothing more
   - Form with fields: Name (required), Business name, Email (required), "What do you need?" (select with 4 options), "Anything else?" (textarea, optional)
   - Hidden fields: `access_key` with `[FORM_HANDLER_ID]` placeholder, `subject`, `from_name`, honeypot `botcheck`
   - Submit button
   - Status div with `role="status"` and `aria-live="polite"`
   - Below form: "Prefer email? f0xy_shambles@proton.me" (operator replaces before launch)
2. Create `js/contact-form.js`:
   - AJAX submission via `fetch` POST to `https://api.web3forms.com/submit`
   - JSON body from FormData
   - Disable button and show "Sending..." during submission
   - Success: show inline message, reset form
   - Error: show inline error message with email fallback
   - Re-enable button after completion
3. Create `css/components/contact.css` for form styles:
   - Input/select/textarea styles consistent with brand (dark surface background, light text, neon green focus border)
   - Error and success message styles

### Files
- `contact/index.html` (create)
- `js/contact-form.js` (create)
- `css/components/contact.css` (create)

### How to Test
- Navigate to `/contact/`. Form renders correctly with all fields.
- Submit with empty required fields: browser validation prevents submission.
- Submit with valid data but placeholder API key: Web3Forms returns an error - error message displays inline, no redirect.
- Form field focus states show neon green border.
- Form is keyboard navigable (Tab through all fields, Enter submits).
- Select dropdown shows all 4 options.
- Status message has `aria-live="polite"` for screen reader announcement.
- Email fallback text is visible below the form.

### Unexpected Outcomes
- If Web3Forms rejects the submission format, flag the specific error response. The AJAX pattern may need `Content-Type: application/json` vs `multipart/form-data` adjustment.

### On Completion
Contact page is complete. Operator must replace `[FORM_HANDLER_ID]` before deploy.

---

## Phase 6: Animations and Polish

---

## Task 019: GSAP Animations (Scroll Triggers + Micro-Interactions)
**Phase:** 6 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** L | **Dependencies:** TASK-003, TASK-008, TASK-013, TASK-014, TASK-015, TASK-016, TASK-020

### Context
Animations bring the site to life. All scroll-triggered animations and micro-interactions defined in the brief are implemented here. Must respect `prefers-reduced-motion`.

### What Needs Doing
1. Create `js/animations.js`:
   - **Hero entrance** (on page load, not scroll):
     - Stagger in: headline first, then subheadline, then CTAs, then toggle button
     - Duration: 300-500ms per element, ease-out
     - Use GSAP `timeline` for sequencing
   - **Scroll-triggered animations** (using ScrollTrigger):
     - Section headings: slide up from below on scroll into view
     - Portfolio cards: fade + translateY up, staggered (100ms between cards)
     - Pricing cards: scale from 0.95 to 1.0 on scroll into view
     - CTA strip: fade in
   - **Micro-interactions** (CSS where possible, GSAP where needed):
     - Portfolio cards: lift on hover (`translateY(-4px)`, shadow) - CSS transition
     - CTA buttons: background fill animation on hover - CSS transition
     - Nav link underline: already handled in nav.css
   - **Optional 3D** (only if it adds genuine value):
     - Hero section subtle perspective tilt following mouse movement
     - Only include if performance impact is negligible
2. Register ScrollTrigger plugin: `gsap.registerPlugin(ScrollTrigger)`
3. All animations must check `prefers-reduced-motion`:
   ```javascript
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (prefersReducedMotion) return; // Skip all animations
   ```
4. Ensure no animation causes layout shift (use `transform` and `opacity` only, avoid animating `width`/`height`/`margin`)

### Files
- `js/animations.js` (create)
- `index.html` (modify - add script import)

### How to Test
- Load homepage: hero elements stagger in smoothly.
- Scroll down: section headings slide up, portfolio cards fade in staggered, pricing cards scale up.
- Hover a portfolio card: card lifts slightly with shadow.
- Enable `prefers-reduced-motion: reduce` in browser settings. Reload. No animations play - all elements are in their final position immediately.
- Open DevTools Performance tab. Record a scroll through the page. Confirm no layout shift events. Animation FPS stays above 55fps.
- Test on a throttled CPU (4x slowdown). Confirm animations remain smooth.

### Unexpected Outcomes
- If ScrollTrigger causes janky scroll on mobile Safari, flag - may need to use Intersection Observer as a fallback for iOS.
- If the 3D mouse-follow effect hurts performance measurably, remove it and flag.

### On Completion
Animations are complete. All pages benefit from the shared animation module.

---

## Task 025: Responsive Design Pass
**Phase:** 6 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-008, TASK-009, TASK-012, TASK-013, TASK-014, TASK-015, TASK-016, TASK-017, TASK-018, TASK-020, TASK-022

### Context
Every page and component must look great on mobile (320px-480px), tablet (768px-1024px), and desktop (1200px+). This is a dedicated pass to catch and fix responsive issues across the entire site.

### What Needs Doing
1. Audit every page at 3 viewport sizes: 375px (mobile), 768px (tablet), 1440px (desktop)
2. Fix issues in component CSS files:
   - Nav: hamburger at mobile, full links at desktop
   - Hero: text sizing, CTA button stacking on mobile
   - "What we do" cards: side-by-side on desktop, stacked on mobile
   - Portfolio grid: 3 columns desktop, 2 tablet, 1 mobile
   - Pricing grid: 3 columns desktop, 1 mobile
   - Contact form: full-width inputs on mobile
   - Footer: stacked layout on mobile
   - Toggle demo: pill badge positioning on mobile
3. Check text does not overflow containers at any width
4. Check touch targets are at least 44x44px on mobile
5. Check images scale correctly with `max-width: 100%`
6. Test the toggle demo at all breakpoints - before CSS must also be responsive

### Files
- Multiple CSS component files (modify as needed)
- `css/before.css` (modify - add responsive overrides for before mode)

### How to Test
- Open every page in Chrome DevTools responsive mode at 375px, 768px, and 1440px.
- No horizontal scrollbar at any width.
- No text overflow or truncation.
- All interactive elements (buttons, links, form fields) are tappable on mobile (44px minimum).
- Toggle demo works and looks correct at all breakpoints.
- Portfolio and pricing grids reflow correctly.
- Nav hamburger works on mobile, full nav visible on desktop.

### Unexpected Outcomes
- If the toggle demo's "before" CSS looks acceptable at mobile widths (because generic templates are also responsive), flag - the "before" state should look bad at all sizes to make the point.

### On Completion
Responsive design is complete across all pages and breakpoints.

---

## Task 021: Before-Mode Test Script
**Phase:** 6 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-009, TASK-025

### Context
A test script verifies that every styled element in the main CSS has a corresponding `.before-mode` rule in `before.css`. This ensures the toggle demo is comprehensive - no element should be unstyled in either state.

### What Needs Doing
1. Create `scripts/test-before-mode.js`:
   - Parse all component CSS files and extract selectors
   - Parse `css/before.css` and extract all `.before-mode` scoped selectors
   - For each significant selector in the main CSS (skip utility classes, keyframes, media queries), check that a corresponding `.before-mode` rule exists
   - Report: list of selectors missing from `before.css`
   - Exit code 0 if all selectors are covered, exit code 1 if any are missing
2. The script runs in Node.js (not the browser)
3. Add clear output: "PASS: All N selectors covered" or "FAIL: M selectors missing from before.css" with the list

### Files
- `scripts/test-before-mode.js` (create)

### How to Test
- Run `node scripts/test-before-mode.js`. If the before CSS is comprehensive, output is "PASS".
- Temporarily remove a rule from `before.css`. Run the script again. It reports the missing selector and exits with code 1.
- Add the rule back. Script passes again.

### Unexpected Outcomes
- If CSS parsing in Node.js is complex (nested selectors, custom properties), flag if a simpler heuristic approach is sufficient (e.g., checking class names rather than full selector matching).
- If some selectors intentionally should not have a before-mode override (e.g., utility classes), document the exclusion list in the script.

### On Completion
The toggle demo has verified coverage. The test can be run before any deploy.

---

## Phase 7: Final Integration and Documentation

---

## Task 026: Cross-Page Integration and Link Verification
**Phase:** 7 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-017, TASK-018, TASK-022

### Context
All pages are built. Now verify they work together as a cohesive site - navigation between pages, consistent styling, shared components rendering identically.

### What Needs Doing
1. Click every link on every page and confirm it navigates correctly:
   - Nav links: Work, Services, Contact (from every page)
   - Logo link back to homepage (from every page)
   - Homepage CTAs: "See our work" to /work/, "Get a quote" to /contact/
   - Portfolio "See all work" to /work/
   - Pricing "See all services" to /services/
   - CTA strip button to /contact/
   - Footer nav links
   - Portfolio card external links (open in new tab)
2. Confirm nav, footer, and global styles are identical across all pages
3. Confirm Ghost API integration works on all pages (portfolio on /work/, pricing on /services/, site content on homepage)
4. Confirm favicon appears on all pages
5. Confirm page titles and meta descriptions are set appropriately per page

### Files
- All HTML files (modify if needed - fix broken links, missing meta tags)

### How to Test
- Navigate through the entire site clicking every link. No 404s, no broken paths.
- Compare nav and footer visually across all 4 pages - they must be pixel-identical.
- Ghost content loads on all pages that use it.
- Browser tab shows favicon and appropriate page title on each page.

### Unexpected Outcomes
- If relative paths break when navigating between `/work/` and `/` (e.g., CSS paths), flag - may need to use absolute paths from root.

### On Completion
Site integration is verified. Queue TASK-027 (README).

---

## Task 027: README Documentation
**Phase:** 7 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-026

### Context
The README is for a developer audience. It must cover all operational tasks: API key replacement, form handler setup, accent colour swapping, adding portfolio entries, and deployment.

### What Needs Doing
1. Create `README.md` in the project root (`public/`):
   - **Overview**: What this site is and how it works (static HTML/CSS/JS + Ghost Content API)
   - **Quick start**: How to get it running locally (just open `index.html` or use a local server)
   - **Configuration**:
     - How to replace the Ghost Content API key (which file, which constant)
     - How to replace the form handler ID (which file, what to replace)
     - How to swap the accent colour for a different client (edit `variables.css`, list the relevant custom properties)
   - **Content management**:
     - How to add a new portfolio entry in Ghost (create post, tag it, set fields)
     - How to edit pricing tiers in Ghost (find the posts, edit body HTML)
     - How to edit site copy (hero, CTA, etc.) in Ghost (find the pages by slug)
   - **Deployment**: `skeleton deploy skeleton-crew`
   - **Fallback content**: How the regeneration script works, cron setup
   - **Toggle demo**: How it works, how to update `before.css` when adding new components, how to run the test script
   - **File structure**: Brief explanation of the folder layout
2. No lorem ipsum, no filler. Developer-grade, concise.
3. Mark any placeholders clearly: `[FORM_HANDLER_ID]`, `[OPERATOR: replace]`

### Files
- `README.md` (create)

### How to Test
- A developer unfamiliar with the project reads the README and can:
  - Find and replace the API key
  - Find and replace the form handler ID
  - Change the accent colour
  - Add a portfolio entry in Ghost
  - Deploy the site
- No broken internal references (file paths mentioned in README actually exist).

### Unexpected Outcomes
- None anticipated.

### On Completion
Documentation is complete. Queue TASK-028 (Final QA).

---

## Task 028: Final QA and Performance Audit
**Phase:** 7 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-025, TASK-026, TASK-027

### Context
Final verification that the site meets all success criteria before handoff. Lighthouse audit, accessibility check, and toggle demo completeness.

### What Needs Doing
1. Run Lighthouse audit on all 4 pages. Target: Performance >85, Accessibility >90, Best Practices >90, SEO >90.
2. Fix any issues that bring scores below targets:
   - Performance: image optimization, render-blocking resources, unused CSS
   - Accessibility: missing alt text, contrast ratios, ARIA attributes, focus management
   - SEO: meta descriptions, heading hierarchy, canonical URLs
3. Run the before-mode test script (`node scripts/test-before-mode.js`). Must pass.
4. Test Ghost API fallback: block Ghost API in DevTools Network panel. Confirm site renders with fallback content on all pages.
5. Validate HTML on all pages (W3C validator).
6. Check for console errors on all pages (both with Ghost available and unavailable).
7. Confirm no dead code, no commented-out blocks, no TODO comments left in shipped code.
8. Confirm all `[OPERATOR: ...]` and `[FORM_HANDLER_ID]` placeholders are clearly marked and documented in README.

### Files
- Multiple files (modify as needed to fix issues found)

### How to Test
- Lighthouse scores meet targets on all pages.
- Before-mode test script outputs "PASS".
- Site renders correctly with Ghost blocked.
- W3C validation passes with no errors (warnings acceptable).
- No console errors on any page in any state.
- `grep -r "TODO\|FIXME\|HACK" --include="*.js" --include="*.css" --include="*.html"` returns no results (excluding README and scripts).

### Unexpected Outcomes
- If Lighthouse Performance scores are below 85 due to Google Fonts loading, flag - may need to subset fonts or use `font-display: optional`.
- If accessibility audit reveals structural issues (heading order, landmark regions), flag specific issues rather than restructuring pages autonomously.

### On Completion
Site is ready for operator review and deployment. Signal completion to the orchestrator.

---

## Task Dependency Graph

```
Phase 1 - Foundation:
  TASK-001 (Variables/Reset) ─── no deps
  TASK-003 (Vendor GSAP) ────── no deps
  TASK-004 (Ghost Tags) ─────── no deps
  TASK-002 (Global CSS) ─────── depends on TASK-001
  TASK-005 (Portfolio Seed) ──── depends on TASK-004
  TASK-006 (Pricing Seed) ────── depends on TASK-004
  TASK-007 (Site Content Seed) ─ depends on TASK-004

Phase 2 - Design Assets:
  TASK-010 (Logo SVG) ─────── no deps
  TASK-011 (Favicon) ──────── depends on TASK-010

Phase 3 - Core Page Structure:
  TASK-008 (Homepage + Hero) ── depends on TASK-001, TASK-002, TASK-003
  TASK-009 (Toggle Demo) ────── depends on TASK-008, TASK-003
  TASK-012 (Nav) ──────────── depends on TASK-008, TASK-010
  TASK-013 (What We Do) ────── depends on TASK-008
  TASK-014 (Portfolio Teaser) ─ depends on TASK-008
  TASK-015 (Pricing Preview) ── depends on TASK-008
  TASK-016 (CTA Strip) ─────── depends on TASK-008
  TASK-020 (Footer) ─────────── depends on TASK-008, TASK-010

Phase 4 - Ghost API Integration:
  TASK-023 (Ghost API Module) ── depends on TASK-005, TASK-006, TASK-007, TASK-008
  TASK-024 (Fallback Script) ── depends on TASK-023

Phase 5 - Additional Pages:
  TASK-017 (Work Page) ──────── depends on TASK-012, TASK-020, TASK-023
  TASK-018 (Services Page) ──── depends on TASK-012, TASK-020, TASK-023
  TASK-022 (Contact Page) ───── depends on TASK-012, TASK-020

Phase 6 - Animations and Polish:
  TASK-019 (GSAP Animations) ── depends on TASK-003, TASK-008, TASK-013-016, TASK-020
  TASK-025 (Responsive Pass) ── depends on all page/component tasks
  TASK-021 (Before-Mode Test) ─ depends on TASK-009, TASK-025

Phase 7 - Final Integration:
  TASK-026 (Cross-Page Check) ── depends on TASK-017, TASK-018, TASK-022
  TASK-027 (README) ──────────── depends on TASK-026
  TASK-028 (Final QA) ────────── depends on TASK-025, TASK-026, TASK-027
```

## Agent Summary

| Agent | Tasks | Total |
|---|---|---|
| Architect | TASK-003, TASK-004, TASK-005, TASK-006, TASK-007, TASK-024 | 6 |
| Design | TASK-010, TASK-011 | 2 |
| Frontend | TASK-001, TASK-002, TASK-008, TASK-009, TASK-012, TASK-013, TASK-014, TASK-015, TASK-016, TASK-017, TASK-018, TASK-019, TASK-020, TASK-021, TASK-022, TASK-023, TASK-025, TASK-026, TASK-027, TASK-028 | 20 |
