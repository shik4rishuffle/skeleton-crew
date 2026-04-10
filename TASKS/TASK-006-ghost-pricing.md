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
