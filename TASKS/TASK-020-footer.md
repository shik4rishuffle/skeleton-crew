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
