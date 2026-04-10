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
