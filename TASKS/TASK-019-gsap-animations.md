## Task 019: GSAP Animations (Scroll Triggers + Micro-Interactions)
**Phase:** 6 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** L | **Dependencies:** TASK-003, TASK-008, TASK-013, TASK-014, TASK-015, TASK-016, TASK-020

### Context
Animations bring the site to life. All scroll-triggered animations and micro-interactions defined in the brief are implemented here. Must respect `prefers-reduced-motion`.

### What Needs Doing
1. Create `js/animations.js`:
   - **Hero entrance** (on page load, not scroll):
     - Stagger in: headline first, then subheadline, then CTAs, then toggle button
     - Duration: 300-500ms per element, ease-out
     - Use GSAP `timeline` for sequencing
   - **Scroll-triggered animations** (using ScrollTrigger):
     - Section headings: slide up from below on scroll into view
     - Portfolio cards: fade + translateY up, staggered (100ms between cards)
     - Pricing cards: scale from 0.95 to 1.0 on scroll into view
     - CTA strip: fade in
   - **Micro-interactions** (CSS where possible, GSAP where needed):
     - Portfolio cards: lift on hover (`translateY(-4px)`, shadow) - CSS transition
     - CTA buttons: background fill animation on hover - CSS transition
     - Nav link underline: already handled in nav.css
   - **Optional 3D** (only if it adds genuine value):
     - Hero section subtle perspective tilt following mouse movement
     - Only include if performance impact is negligible
2. Register ScrollTrigger plugin: `gsap.registerPlugin(ScrollTrigger)`
3. All animations must check `prefers-reduced-motion`:
   ```javascript
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (prefersReducedMotion) return; // Skip all animations
   ```
4. Ensure no animation causes layout shift (use `transform` and `opacity` only, avoid animating `width`/`height`/`margin`)

### Files
- `js/animations.js` (create)
- `index.html` (modify - add script import)

### How to Test
- Load homepage: hero elements stagger in smoothly.
- Scroll down: section headings slide up, portfolio cards fade in staggered, pricing cards scale up.
- Hover a portfolio card: card lifts slightly with shadow.
- Enable `prefers-reduced-motion: reduce` in browser settings. Reload. No animations play - all elements are in their final position immediately.
- Open DevTools Performance tab. Record a scroll through the page. Confirm no layout shift events. Animation FPS stays above 55fps.
- Test on a throttled CPU (4x slowdown). Confirm animations remain smooth.

### Unexpected Outcomes
- If ScrollTrigger causes janky scroll on mobile Safari, flag - may need to use Intersection Observer as a fallback for iOS.
- If the 3D mouse-follow effect hurts performance measurably, remove it and flag.

### On Completion
Animations are complete. All pages benefit from the shared animation module.
