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
