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
