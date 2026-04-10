# QA Report - TASK-028

Final QA and performance audit completed 2026-04-09.

## Issues Found and Fixed

### 1. Heading hierarchy - work page (work/index.html)
**Problem:** The work page jumped from `<h1>` (hero) directly to `<h3>` (portfolio card titles rendered by renderers.js), skipping `<h2>` entirely. This breaks sequential heading hierarchy for screen readers.
**Fix:** Added `<h2 class="visually-hidden">Portfolio</h2>` inside the portfolio section before the grid container.

### 2. GSAP guard missing in toggle.js
**Problem:** `toggle.js` called `gsap.timeline()` inside `animateTransition()` without checking whether GSAP had loaded. If the vendor script failed to load, clicking the toggle button would throw a `ReferenceError`. `animations.js` had this guard but `toggle.js` did not.
**Fix:** Added `typeof gsap === 'undefined'` check to the existing `prefersReducedMotion` guard. When GSAP is unavailable, the toggle falls back to an instant class swap - same behaviour as reduced motion.

### 3. Hardcoded colour values in component CSS
**Problem:** Two hardcoded hex colours existed outside `variables.css` and `before.css`:
- `global.css` line 91: `#33ff66` for `.btn--primary:hover`
- `contact.css` line 89: `#ff4444` for `.contact-form__status--error`
**Fix:** Added `--color-accent-hover: #33ff66` and `--color-error: #ff4444` to `variables.css`. Updated both references to use `var(--color-accent-hover)` and `var(--color-error)` respectively.

## Issues Found - Not Fixable (Flag for Operator)

### 1. Form handler placeholder
`[FORM_HANDLER_ID]` exists in `contact/index.html` line 66 and is documented in `README.md`. Operator must replace this with a real Web3Forms access key before deploying to production.

## All Checks Passed

### HTML Validation
- All 4 pages have correct DOCTYPE, lang="en", charset, viewport meta
- One `<h1>` per page confirmed across all 4 pages
- Sequential heading hierarchy - now correct on all pages (work page fixed)
- All `id` attributes unique within each page
- All `<img>` tags have `alt` attributes
- No `target="_blank"` in static HTML; dynamically rendered links in renderers.js include `rel="noopener"`
- All form inputs in contact/index.html have associated `<label>` elements with matching `for`/`id` pairs
- ARIA attributes correct: `aria-expanded` on burger, `aria-hidden` on overlay, `aria-live="polite"` on form status, `aria-pressed` on toggle button, `aria-label` on logo links and burger
- No unclosed tags detected

### Accessibility
- Skip link (`<a href="#main" class="skip-link">Skip to content</a>`) present on all 4 pages
- Focus styles defined in both reset.css (`:focus-visible` rule) and global.css (`a:focus-visible`)
- `prefers-reduced-motion` respected in:
  - reset.css: blanket animation/transition duration override
  - global.css: skeleton pulse animation disabled
  - hero.css: hero background animation disabled
  - toggle.css: pulse animation disabled
  - animations.js: early return skips all GSAP animations
  - toggle.js: instant toggle without GSAP animation
- Colour contrast: `--color-muted` (#888888) on `--color-bg` (#0a0a0a) has a contrast ratio of approximately 5.58:1 - passes WCAG AA for both normal text (4.5:1 required) and large text (3:1 required)
- Form status region has `role="status"` and `aria-live="polite"`

### Code Quality - JavaScript
- No `console.log` statements (only `console.warn` and `console.error` which are acceptable)
- No TODO/FIXME/HACK comments
- No dead code or commented-out blocks
- All ES module imports resolve to existing files
- GSAP guarded with `typeof gsap` checks in both animations.js and toggle.js (toggle.js fixed in this audit)
- All sessionStorage access in ghost-api.js wrapped in try/catch blocks

### CSS Quality
- No duplicate property declarations within the same rule (besides intentional fallbacks like `-webkit-backdrop-filter`)
- All custom property references have matching definitions in variables.css
- No hardcoded colour values outside variables.css and before.css (fixed in this audit)
- BEM naming consistent throughout: block__element--modifier pattern used in all components

### Placeholder Verification
- `[FORM_HANDLER_ID]` present in contact/index.html and documented in README.md
- No `lorem ipsum` text found anywhere
- No undocumented `[OPERATOR: ...]` markers
- No other unmarked placeholders found

### File Completeness
All expected files verified present:
- HTML: index.html, work/index.html, services/index.html, contact/index.html
- CSS: variables.css, reset.css, global.css, before.css
- CSS components: nav, hero, toggle, what-we-do, portfolio, pricing, cta-strip, footer, contact, services
- JS: main.js, ghost-api.js, renderers.js, nav.js, toggle.js, animations.js, contact-form.js
- JS vendor: gsap.min.js, ScrollTrigger.min.js
- Assets: logo.svg, logo-v2.svg, logo-v3.svg, logo-icon.svg, favicon.svg
- site.webmanifest
- README.md
- Scripts: regenerate-fallback.js, test-before-mode.js, seed-ghost-content.js

### Before-Mode Test
```
PASS: All 54 component selectors have before-mode coverage
```
