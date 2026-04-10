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
