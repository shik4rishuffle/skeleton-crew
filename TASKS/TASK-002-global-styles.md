## Task 002: Design System - Global Styles
**Phase:** 1 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-001

### Context
Global styles establish the base typography, link styles, button patterns, section spacing, and skeleton loader CSS that every page and component inherits.

### What Needs Doing
1. Create `css/global.css`:
   - Google Fonts `@import` or `<link>` strategy (prefer `<link>` in HTML with `display=swap`)
   - Base body styles: background, colour, font-family, line-height
   - Heading styles: `h1` through `h4` with the correct font families (Lacquer for h1, Bebas Neue for h2-h4)
   - Link styles: default, hover (neon green), focus-visible
   - Button base classes: `.btn`, `.btn--primary`, `.btn--secondary` (ghost/outline variant)
   - Section layout utility: `.section` with consistent vertical padding
   - Container utility: `.container` with max-width and auto margins
   - Skeleton loader base styles: `.skeleton-image`, `.skeleton-line`, `.skeleton-line--title`, `.skeleton-line--text` with pulse animation keyframe
   - `.visually-hidden` utility class for accessible hidden elements
   - `prefers-reduced-motion` media query that disables all animations
2. Set up the Google Fonts `<link>` tag approach - document it as a note for use in all HTML pages

### Files
- `css/global.css` (create)

### How to Test
- Create a test HTML page with headings, paragraphs, buttons, and skeleton loaders. Confirm:
  - Lacquer renders on h1, Bebas Neue on h2-h4, DM Sans on body text
  - `.btn--primary` has neon green fill, `.btn--secondary` has neon green outline only
  - Skeleton loaders pulse correctly
  - With `prefers-reduced-motion: reduce` enabled in browser, pulse animation stops

### Unexpected Outcomes
- If Lacquer at large sizes looks pixelated or thin, flag for review - may need weight adjustment or alternative.

### On Completion
Queue TASK-003 (Vendor GSAP) and TASK-010 (Logo Design) in parallel.
