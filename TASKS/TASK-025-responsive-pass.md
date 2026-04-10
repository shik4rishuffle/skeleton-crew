## Task 025: Responsive Design Pass
**Phase:** 6 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-008, TASK-009, TASK-012, TASK-013, TASK-014, TASK-015, TASK-016, TASK-017, TASK-018, TASK-020, TASK-022

### Context
Every page and component must look great on mobile (320px-480px), tablet (768px-1024px), and desktop (1200px+). This is a dedicated pass to catch and fix responsive issues across the entire site.

### What Needs Doing
1. Audit every page at 3 viewport sizes: 375px (mobile), 768px (tablet), 1440px (desktop)
2. Fix issues in component CSS files:
   - Nav: hamburger at mobile, full links at desktop
   - Hero: text sizing, CTA button stacking on mobile
   - "What we do" cards: side-by-side on desktop, stacked on mobile
   - Portfolio grid: 3 columns desktop, 2 tablet, 1 mobile
   - Pricing grid: 3 columns desktop, 1 mobile
   - Contact form: full-width inputs on mobile
   - Footer: stacked layout on mobile
   - Toggle demo: pill badge positioning on mobile
3. Check text does not overflow containers at any width
4. Check touch targets are at least 44x44px on mobile
5. Check images scale correctly with `max-width: 100%`
6. Test the toggle demo at all breakpoints - before CSS must also be responsive

### Files
- Multiple CSS component files (modify as needed)
- `css/before.css` (modify - add responsive overrides for before mode)

### How to Test
- Open every page in Chrome DevTools responsive mode at 375px, 768px, and 1440px.
- No horizontal scrollbar at any width.
- No text overflow or truncation.
- All interactive elements (buttons, links, form fields) are tappable on mobile (44px minimum).
- Toggle demo works and looks correct at all breakpoints.
- Portfolio and pricing grids reflow correctly.
- Nav hamburger works on mobile, full nav visible on desktop.

### Unexpected Outcomes
- If the toggle demo's "before" CSS looks acceptable at mobile widths (because generic templates are also responsive), flag - the "before" state should look bad at all sizes to make the point.

### On Completion
Responsive design is complete across all pages and breakpoints.
