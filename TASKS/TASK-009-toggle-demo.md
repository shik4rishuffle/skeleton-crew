## Task 009: Toggle Demo (CSS-Only Swap + GSAP Transition)
**Phase:** 3 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** L | **Dependencies:** TASK-008, TASK-003

### Context
The toggle demo is the star feature of the entire site. It swaps the page between a "before" (generic template) look and the "after" (Skeleton Crew) look using CSS class toggle and GSAP animated transitions. This is the core sales pitch.

### What Needs Doing
1. Create `css/before.css`:
   - All rules scoped under `body.before-mode` selector
   - Override every styled element to look like a generic Wix/Squarespace template:
     - Background: `#f0f0f0`
     - Fonts: Arial/system-serif only
     - Nav: full-width solid blue bar (`#003087`), white text, too tall
     - Hero: CSS gradient simulating bad stock photo feel, centred text
     - Buttons: `#003087` background, white text, square corners, too large, drop shadow
     - Content blocks: centred text, mismatched font sizes
     - Colours: royal blue, grey, that particular maroon (`#800020` territory) that only exists on old websites
   - Cover every component that has styles in the real CSS
2. Create `js/toggle.js`:
   - Toggle button click adds/removes `before-mode` class on `<body>`
   - Use GSAP to animate the transition (600-800ms):
     - Animate background colour, font sizes, element dimensions, colours, spacing simultaneously
     - Use GSAP `to`/`from` with custom properties or direct property animation
   - Button label swaps:
     - After state: "See what everyone else gives you"
     - Before state: "See what we do differently"
   - State pill/badge in bottom corner: shows "BEFORE" or "AFTER"
   - Button has a subtle pulsing animation on first load (GSAP) that stops after first click
3. Create `css/components/toggle.css` for toggle-specific UI (pill badge, button pulse)

### Files
- `css/before.css` (create)
- `js/toggle.js` (create)
- `css/components/toggle.css` (create)

### How to Test
- Click the toggle button. The page smoothly morphs to the "before" state over ~700ms.
- Click again. It smoothly morphs back to the "after" state.
- In "before" mode: page looks like a generic template site - blue nav bar, Arial fonts, grey background, maroon accents, square buttons.
- In "after" mode: page looks like the Skeleton Crew design.
- The pill badge in the bottom corner shows the correct state label.
- The button label changes correctly on each toggle.
- The transition does not cause layout shift or content reflow.
- The pulse animation on the button stops after first interaction.
- `prefers-reduced-motion`: transition is instant (no animation), but toggle still functions.

### Unexpected Outcomes
- If GSAP cannot smoothly animate between CSS custom property values (e.g., font-family cannot be interpolated), flag which properties need an alternative approach (e.g., crossfade opacity between two overlapping elements).
- If the before CSS conflicts with specific component styles in unexpected ways, flag the specific conflicts rather than broadening selectors.

### On Completion
Queue TASK-021 (Before-Mode Test Script). The toggle demo is functionally complete but should be revisited after each new section is added to ensure `before.css` covers it.
