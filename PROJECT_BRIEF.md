# Project Brief -- Skeleton Crew Frontend Site

## What Is Being Built

A bespoke static frontend site for skeleton-crew.co.uk -- the Skeleton Crew
business website. This is both a live business site AND a demonstration of
what Skeleton Crew builds for clients. It must be genuinely stunning.

The site is built as vanilla HTML/CSS/JS, consuming Ghost's Content API at
runtime. Static files are dropped into `/srv/skeleton/clients/skeleton-crew/public/`
and served by the Nginx container already configured on the VPS.

The Ghost CMS is already running at `https://cms-skeleton-crew.dev.skeleton-crew.co.uk`. The
infrastructure (Traefik, MySQL, Docker, SSL) is fully operational and must
not be touched by this project. See the VPS handover notes at
`/srv/skeleton/.agent/handover-notes.md` for full infrastructure state.

---

## The Business

**Skeleton Crew** -- bespoke web design and AI consulting for small UK
businesses that have no website or an embarrassingly outdated one.

**Tone of voice:** Witty, straight-talking, subversive. Like it was made by
someone who actually has taste. Not corporate. Not try-hard. Speaks to business
owners like a real person, not a pitch deck.

**Tagline:** The agent proposes 3 options and picks the strongest. Avoid
clichés like "taking your business to the next level." Must communicate
"we build sites that don't look like everyone else's."

---

## Brand

### Colours
```css
--color-bg:      #0a0a0a   /* near-black background */
--color-surface: #111111   /* slightly lighter for cards/containers */
--color-text:    #f5f5f5   /* off-white body text */
--color-accent:  #00FF41   /* neon green -- primary accent, use deliberately */
--color-muted:   #666666   /* secondary text, labels */
--color-border:  #222222   /* subtle borders */
```

The accent colour is loud. Use it sparingly -- headlines, key CTAs, hover
states, underlines. Not everywhere. The restraint is what makes it hit.

### Typography
- **H1/hero font:** Lacquer (Google Fonts, free) -- hand-painted, graffiti
  feel. Used for H1 headlines only. Not overused -- the impact comes from
  restraint.
- **Display/heading font:** Bebas Neue (Google Fonts, free) -- uppercase,
  condensed, bold. Used for nav, section titles, H2s and below.
- **Body font:** DM Sans (Google Fonts, free) -- clean, modern, readable.
  Used for all body copy, labels, form fields.
- **Accent moments:** Use Bebas Neue with letter-spacing and the neon green
  accent for visual punch. Not overused.
- **Three fonts maximum** -- Lacquer, Bebas Neue, DM Sans. No others.

### Logo
The logo is produced by the Design agent. Requirements:
- A skeleton character (simplified, graphic -- not anatomically accurate)
- "SKELETON CREW" in a graffiti-influenced style -- chunky, slightly irregular,
  like it was painted on the base of a skateboard deck
- Black and neon green only -- works on dark background
- Must work at small sizes (favicon) and large sizes (hero)
- The skeleton character can be inline with the text or above it
- Produce 3 variations and document which is recommended and why

### Overall aesthetic
Skateboard deck meets professional web studio. Think: Element, Palace, Supreme
-- graphic, confident, a bit rough around the edges but clearly intentional.
Dark background. Type does most of the heavy lifting. The neon accent appears
like a signature.

---

## Tech Stack

### Frontend
**Vanilla HTML/CSS/JS** -- no framework, no build step required.

Structure the code as if it were a component system:
- Each section of each page is a self-contained HTML partial (loaded via
  JS fetch or server-side include -- agent decides what is cleanest for Nginx)
- One `variables.css` for all design tokens
- One `components/` folder with individual CSS files per component
- One `scripts/` folder with individual JS files per feature
- No walls of code -- if a file exceeds ~150 lines, split it

**Animations:** Use **GSAP** (self-hosted, free tier) for all scroll animations,
transitions, and 3D effects. GSAP ScrollTrigger for scroll-based animations.
GSAP files (`gsap.min.js`, `ScrollTrigger.min.js`) are vendored into
`js/vendor/` -- no CDN dependency. This ensures animations work reliably
during client demos regardless of network conditions.
Three.js is optional if the agent wants genuine 3D -- use it only if it
adds real impact without killing performance.

### Ghost Content API
- Runtime fetch -- JavaScript fetches content from Ghost API on page load
- Ghost Content API base URL: `https://cms-skeleton-crew.dev.skeleton-crew.co.uk`
  (production: `https://cms-skeleton-crew.skeleton-crew.co.uk`)
- Content API key: `6a81932590f32d95416a5191a7`
- All Ghost API calls must have loading states (skeleton cards, not spinners)
  and graceful fallbacks if the API is unreachable -- the site must not break
  without Ghost
- API calls must not block initial page render -- fetch after first paint
- **Fallback content regeneration:** A weekly cron job script fetches current
  content from Ghost and writes a static JSON fallback file. This keeps
  fallback content current rather than stale from initial build. The script
  lives in `scripts/regenerate-fallback.js` and is run via system cron.

### Form handler
Evaluate lightweight form submission services (e.g. Formspark, Formspree,
Basin, Netlify Forms via proxy). Recommend one based on: free tier limits,
simplicity, no-redirect submission, spam protection. The chosen service must
support AJAX submission with an inline success message (no page redirect).

The form handler ID is a placeholder (`[FORM_HANDLER_ID]`) the operator
replaces before deploy.

---

## Ghost CMS Content Model

All user-facing copy must be editable in Ghost. The agent must configure
Ghost's content model so the operator can update everything without touching
code.

### Portfolio entries
- Stored as Ghost posts with tag `portfolio`
- Fields used: title, custom_excerpt (one-line description), feature_image
  (screenshot), url (external link to live site), primary_tag
- The frontend fetches these at runtime and renders portfolio cards
- Portfolio entries include live client sites -- the mushroom grow business
  is already built and should be the first real entry. All data (name, URL,
  description, screenshot) is managed in Ghost by the operator.
- No "coming soon" placeholder cards -- if there are fewer than 3 entries,
  the grid simply shows what exists

### Service tiers and pricing
- Stored as a Ghost page or structured data the operator can edit
- The agent decides the best Ghost content model for pricing tiers
  (custom page with structured content, multiple posts with a tag, or
  a single page with sections -- whatever is cleanest for CMS editing)
- Must be fully editable by the operator without touching code
- Two categories: Website Builds (3 tiers) and AI Consulting (3 tiers)
- AI consulting starting points: ~£299 audit, ~£800--2,500 build,
  ~£300--600/month retainer. Agent proposes final copy for all tiers.
- Website build tiers: agent proposes names, pricing, and copy
- All copy framed as outcomes for the client -- no tech jargon

### Other CMS-managed content
The agent should identify any other copy on the site that benefits from
being CMS-editable (hero tagline, CTA strip text, about copy) and wire
it up to Ghost. The goal is that the operator can update all meaningful
text content from Ghost without a code deploy.

---

## Folder Structure

```
public/
├── index.html
├── work/
│   └── index.html
├── services/
│   └── index.html
├── contact/
│   └── index.html
├── css/
│   ├── variables.css
│   ├── reset.css
│   ├── global.css
│   └── components/
│       ├── nav.css
│       ├── hero.css
│       ├── toggle.css
│       ├── portfolio.css
│       ├── pricing.css
│       ├── footer.css
│       └── [others as needed]
├── js/
│   ├── ghost-api.js
│   ├── toggle.js
│   ├── animations.js
│   ├── vendor/
│   │   ├── gsap.min.js
│   │   └── ScrollTrigger.min.js
│   └── [others as needed]
├── scripts/
│   ├── regenerate-fallback.js
│   └── test-before-mode.js
├── assets/
│   ├── logo.svg
│   ├── logo-icon.svg
│   └── favicon.ico
└── README.md
```

---

## Pages

### 1. Homepage (`index.html`)

**Nav**
- Full-width, dark, sticky on scroll
- Logo left, nav links right (Work, Services, Contact)
- Nav links in Bebas Neue, spaced out, neon green on hover
- Mobile: hamburger, full-screen overlay menu

**Hero**
- Full viewport height
- Massive headline in Bebas Neue -- the proposed tagline
- Subheadline in DM Sans -- one sentence max, who this is for
- Two CTAs: primary "See our work" → /work, secondary "Get a quote" → /contact
- The toggle button lives here (see Toggle Demo spec below)
- Background: subtle animated noise texture or very slow-moving particle field
  in near-black -- not distracting, just alive
- Hero text animates in on load via GSAP -- staggered, fast, confident

**The Toggle Demo** ← most important feature on the site. Full spec below.

**What we do**
- Two cards side by side (stack on mobile):
  - Website builds -- one punchy paragraph, outcome-led
  - AI consulting -- one punchy paragraph, outcome-led
- No bullet points. No icons. Just strong type and a thin neon border.

**Portfolio teaser**
- 3 cards in a row (stack on mobile), fetched from Ghost Content API
  (posts tagged `portfolio`)
- Card: project name, business type, one-line description, screenshot
- If fewer than 3 entries exist in Ghost, show only what exists
- "See all work" link → /work

**Pricing preview**
- Three website build tiers, side by side (stack on mobile)
- Tier names proposed by the agent -- outcome-led, not tech-led
- Each tier: name, price, 3--4 outcome bullets, CTA button
- Middle tier highlighted with neon green border treatment
- Fetched from Ghost so operator can edit tiers in the CMS
- "See all services" link → /services

**CTA strip**
- Full-width, dark surface background
- One bold line -- agent proposes copy (territory: "your competitors have
  a website -- do you?")
- Single button: "Let's talk" → /contact
- CTA strip copy fetched from Ghost

**Footer**
- Logo, nav links, copyright
- One-liner about what Skeleton Crew does
- No social links needed yet

---

### The Toggle Demo -- Full Spec

A button in the hero section triggers a full-page CSS swap between
two visual states: "Before" (generic template site) and "After"
(Skeleton Crew). The HTML content stays identical -- only the stylesheet
changes. This is the core pitch: same content, world of difference.

**The button:**
- Sits below the hero CTAs
- Agent proposes label options and picks the strongest. Territory:
  "See what everyone else gives you →" / "What does your competitor's site
  look like? →" / "See the difference →"
- Styled as a secondary/ghost button -- neon green outline, no fill

**How it works:**
- The site has two CSS modes: the real Skeleton Crew styles (default)
  and a "before" stylesheet that makes the same HTML look like a generic
  Squarespace/Wix template
- Toggle swaps which CSS is active -- no content changes, no DOM
  manipulation beyond the class/stylesheet swap
- The "before" CSS is a separate file (e.g. `css/before.css`) that
  overrides the real styles

**The "Before" CSS -- deliberately generic template:**
- Background: #f0f0f0 (flat grey-white)
- Font: Arial or system-serif -- no custom fonts loaded
- Navigation: full-width solid blue bar (#003087), white text, too tall
- Hero: CSS gradient simulating a bad stock photo feel, centred text
- Buttons: #003087 background, white text, square corners, too large,
  drop shadow
- Content blocks: centred text, mismatched font sizes
- Colours: royal blue, grey, that particular shade of maroon that only
  exists on old websites
- The goal: make it look like every Wix/Squarespace site a small
  business owner settled for. Clients should see their own current site
  and wince.

**The "After" state -- the real Skeleton Crew site:**
Everything as designed in this brief. The default stylesheet.

**The transition:**
- Smooth animated morph between states -- NOT an instant swap
- The transition itself is the demo -- it should feel like shedding a skin
- Use GSAP to animate: background colour, font families, element sizes,
  colours, spacing -- all simultaneously as the CSS swap takes effect
- Duration: approximately 600--800ms
- A small persistent pill/badge in the bottom corner shows the current state:
  "BEFORE" or "AFTER" -- toggles with each click
- The button label changes on toggle:
  Before → After: "See what we do differently →"
  After → Before: "See what everyone else gives you →"

---

### 2. Work / Portfolio (`work/index.html`)

- Page hero: short headline + subheadline, not full-viewport
- Grid of project cards fetched from Ghost API (tag: `portfolio`)
- Card contents: project name, business type, one-line description,
  screenshot or feature_image, "View site →" link (external)
- All portfolio data is managed in Ghost by the operator
- Masonry or equal-height grid -- agent decides what looks best

---

### 3. Services (`services/index.html`)

Two sections, both fetched from Ghost CMS:

**Website Builds**
Three tiers. Agent proposes tier names and copy. All framed as outcomes
for the client -- no tech jargon. Structure per tier:
- Tier name (not "Basic" -- something more interesting)
- Price
- Who it is for (one sentence)
- What they get (3--4 outcomes, no tech)
- CTA

**AI Consulting**
Three tiers. Starting points for the agent to build copy from:
- Tier 1: ~£299 audit -- workflow review, written report, priority
  recommendations
- Tier 2: ~£800--2,500 build -- one or two specific AI workflows implemented
- Tier 3: ~£300--600/month retainer -- ongoing maintenance, new automations,
  monthly call
Same format as website tiers -- outcomes only, no jargon.

---

### 4. Contact (`contact/index.html`)

- Short hero: "Let's talk." -- nothing more
- Simple form:
  - Name
  - Business name
  - Email
  - What do you need? (select: New website / AI consulting / Both / Not sure yet)
  - Anything else? (textarea, optional)
- Form handler: agent's recommended service (see Tech Stack section)
- On submit: inline success message -- no page redirect
- Below the form: "Prefer email? f0xy_shambles@proton.me"
  (operator replaces with final Skeleton Crew email when ready)

---

## Animations & Interactions

**Scroll animations (GSAP ScrollTrigger):**
- Hero elements: stagger in on load -- headline first, subheadline, CTAs
- Section headings: slide up from below on scroll into view
- Portfolio cards: fade and translate up, staggered
- Pricing cards: scale up slightly from 0.95 on scroll into view
- Keep animations fast and confident -- 300--500ms, ease-out

**Micro-interactions:**
- Nav links: neon green underline slides in from left on hover
- CTA buttons: subtle background fill animation on hover
- Portfolio cards: lift on hover (translateY -4px, subtle shadow)
- Toggle button: small pulsing animation on first load to draw attention
  -- stops after first interaction

**3D / advanced (optional):**
- Hero section could have a subtle 3D perspective tilt following mouse
  movement (GSAP mousemove listener)
- Only include if it looks genuinely good and does not hurt performance

**Performance rules:**
- All animations must respect `prefers-reduced-motion` media query
- No animation should cause layout shift
- Lazy load any images
- Target Lighthouse performance score >85

---

## Copy Guidelines

- All meaningful copy managed in Ghost CMS -- operator edits in Ghost,
  frontend renders at runtime
- No lorem ipsum anywhere
- No jargon (no "Ghost CMS", "Docker", "headless", "API")
- Everything framed as outcomes for the client
- Tone: like a mate who happens to be great at this -- not a salesperson
- Prices in GBP (£), not USD
- Any placeholder that needs operator input is clearly marked:
  `[OPERATOR: replace this text]`
- Do not use the word "solutions" anywhere

---

## Operator Profile

The operator is a developer. The README and configuration instructions
should be developer-grade, not simplified.

---

## Hard Constraints

- Clean, minimal DOM -- no unnecessary wrapper divs, no deep nesting.
  Semantic HTML5 elements (nav, main, section, article, footer) throughout.
- Code must be tidy, uniform, and legible. Consistent naming conventions
  (BEM or similar for CSS classes), consistent formatting, no dead code.
  Every file should read like it was written by one person.
- Reusable components -- CSS and JS structured so patterns (cards, buttons,
  section layouts) are defined once and reused. No copy-paste duplication.
- Modern best practices: CSS custom properties for all tokens, CSS logical
  properties where appropriate, modern JS (ES modules, async/await, no jQuery
  patterns), accessible markup (ARIA where needed, keyboard navigation, focus
  management).
- Vanilla HTML/CSS/JS only -- no CSS frameworks (no Bootstrap, Tailwind),
  no JS frameworks (no React, Vue)
- No stock photos or stock photo services
- No paid fonts or assets -- Google Fonts and self-hosted GSAP only
- No lorem ipsum
- Do not make the site look like a template
- Do not add social media links
- Do not handle DNS, Docker, or infrastructure -- already done
- Do not touch any file outside `/srv/skeleton/clients/skeleton-crew/public/`
- All user-facing copy must be CMS-editable via Ghost

## Success Criteria

- The site is visually stunning -- a genuine portfolio piece
- The toggle demo is the star feature and works flawlessly
- All copy is editable from Ghost CMS without touching code
- Portfolio entries are managed entirely from Ghost
- The site loads and renders correctly even if the Ghost API is unreachable
- Lighthouse performance >85
- Fully responsive -- looks great on mobile, tablet, and desktop
- A new developer can read the README, replace the API key and form handler
  ID, and deploy with `skeleton deploy skeleton-crew`
- **Toggle demo test coverage:** A test script verifies that every styled
  element in the main CSS has a corresponding `.before-mode` rule in
  `css/before.css`. No element should be unstyled in either state. This
  test must pass before the toggle demo is considered complete.

## Specialists

| Agent | Prompt file | Responsibility |
|---|---|---|
| Architect | `agents/agent-architect.md` | Content model design, Ghost API integration pattern, form handler evaluation |
| Design | `agents/agent-design.md` | Logo SVG (3 variants), favicon, skeleton character, any illustrated elements |
| Frontend | `agents/agent-frontend.md` | All HTML/CSS/JS, GSAP animations, toggle demo, responsive design |

The Backend, CMS, DevOps, and QA agents are not needed for this project.
Deployment is handled by the existing `skeleton deploy` command.

---

## Dev Environment

The dev instance of this site runs on the Skeleton Crew VPS:

- **Ghost CMS admin:** `https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost`
- **Ghost Content API:** `https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost/api/content/`
- **Content API key:** `6a81932590f32d95416a5191a7`
- **Static frontend (after deploy):** `https://skeleton-crew.dev.skeleton-crew.co.uk`
- **Deploy command:** `skeleton deploy skeleton-crew`

Note: Dev CMS domains use the hyphenated pattern `cms-{slug}.dev.skeleton-crew.co.uk`
(single-level subdomain, covered by the `*.dev.skeleton-crew.co.uk` wildcard).

**Production equivalents (for reference -- do not use during dev):**
- Ghost CMS: `https://cms-skeleton-crew.skeleton-crew.co.uk/ghost`
- Frontend: `https://skeleton-crew.co.uk`

## Deliverables

- Complete static site in `/srv/skeleton/clients/skeleton-crew/public/`
- All assets self-contained (except Google Fonts CDN and GSAP CDN)
- `css/variables.css` with all design tokens, clearly commented, labelled
  as "the only file you need to edit per client"
- Logo SVG with 3 variants produced by the Design agent, documented
- `README.md` in `/public/` covering:
  - How to replace the Ghost Content API key
  - How to replace the form handler ID
  - How to swap the accent colour for a different client
  - How to add a new portfolio entry in Ghost
  - How to deploy (`skeleton deploy skeleton-crew`)
- Ghost content model configured: portfolio tag, pricing content, CTA copy,
  hero text -- all editable by the operator
- All changes committed to the repo before signalling completion
