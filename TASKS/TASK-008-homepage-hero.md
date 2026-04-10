## Task 008: Homepage HTML Shell and Hero Section
**Phase:** 3 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-001, TASK-002, TASK-003

### Context
The homepage is the primary page and container for all homepage sections. The hero is the first thing visitors see and contains the toggle demo button. Building the HTML shell establishes the page structure that all other homepage sections slot into.

### What Needs Doing
1. Create `index.html` with:
   - Proper `<!DOCTYPE html>`, lang attribute, meta tags (charset, viewport, description)
   - Favicon links (placeholder paths until TASK-011 completes)
   - Google Fonts `<link>` tags (Lacquer, Bebas Neue, DM Sans) with `display=swap`
   - CSS imports: `variables.css`, `reset.css`, `global.css`, component CSS files
   - Semantic structure: `<header>`, `<main>`, `<footer>`
   - Placeholder `<nav>` (built out in TASK-012)
   - GSAP script tags (defer): `js/vendor/gsap.min.js`, `js/vendor/ScrollTrigger.min.js`
   - JS module imports at the bottom
2. Build the hero section:
   - Full viewport height (`100vh`)
   - Headline element with `data-ghost="hero-title"` attribute and fallback text
   - Subheadline with `data-ghost="hero-subtitle"` and fallback text
   - Primary CTA: "See our work" linking to `/work/`
   - Secondary CTA: "Get a quote" linking to `/contact/`
   - Toggle demo button (ghost/outline style): initial label "See what everyone else gives you" - wired up in TASK-009
   - Subtle background: CSS-only animated noise texture or gradient (GSAP particle field added in TASK-019 if appropriate)
3. Create `css/components/hero.css` with hero-specific styles

### Files
- `index.html` (create)
- `css/components/hero.css` (create)

### How to Test
- Open `index.html` in a browser. Hero fills the viewport.
- Headline and subheadline render in correct fonts (Lacquer for h1, DM Sans for subheadline).
- Both CTA buttons are visible and link to the correct paths.
- Toggle button is visible below the CTAs.
- Page validates with no HTML errors (W3C validator or equivalent).
- Background has a subtle animated effect (not static, not distracting).

### Unexpected Outcomes
- If Google Fonts cause a significant FOUT (flash of unstyled text), flag - may need to add `font-display: optional` or preload critical fonts.

### On Completion
Queue TASK-009 (Toggle Demo) and TASK-012 (Nav). Homepage shell is ready for remaining sections.
