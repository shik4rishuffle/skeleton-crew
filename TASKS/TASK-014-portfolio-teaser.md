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
