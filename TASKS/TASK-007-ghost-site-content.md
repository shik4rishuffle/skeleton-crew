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
