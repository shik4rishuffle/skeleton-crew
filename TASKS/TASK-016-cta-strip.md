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
