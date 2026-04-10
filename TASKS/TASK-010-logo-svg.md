## Task 010: Logo SVG - Three Variants
**Phase:** 2 | **Agent:** Design
**Priority:** High | **Status:** TODO
**Est. Effort:** L | **Dependencies:** none

### Context
The logo is used in the nav, hero, footer, and as a favicon. Three variants are required so the operator can choose. The logo defines the brand's visual identity.

### What Needs Doing
1. Design 3 logo variants, each containing:
   - A skeleton character (simplified, graphic - not anatomically accurate)
   - "SKELETON CREW" in a graffiti-influenced style - chunky, slightly irregular, like it was painted on the base of a skateboard deck
   - Black and neon green (`#00FF41`) only - must work on dark (`#0a0a0a`) background
2. Variants should explore different arrangements:
   - Variant A: Skeleton character inline/beside the text
   - Variant B: Skeleton character above the text
   - Variant C: A different compositional approach (agent decides)
3. Each variant must work at:
   - Large size (hero placement, ~300px wide)
   - Small size (nav, ~120px wide)
   - Icon size (favicon, 32x32px - the skeleton character alone)
4. Export as clean, optimized SVG:
   - `assets/logo.svg` - recommended variant, full logo
   - `assets/logo-alt-1.svg` - alternative variant 1
   - `assets/logo-alt-2.svg` - alternative variant 2
   - `assets/logo-icon.svg` - skeleton character only (for favicon and small uses)
5. Document which variant is recommended and why

### Files
- `assets/logo.svg` (create)
- `assets/logo-alt-1.svg` (create)
- `assets/logo-alt-2.svg` (create)
- `assets/logo-icon.svg` (create)

### How to Test
- Open each SVG in a browser on a `#0a0a0a` background. Confirm legibility and visual impact.
- Scale each to 32px width. Confirm the skeleton character is still recognizable.
- Scale each to 300px width. Confirm detail and quality.
- Validate SVGs: no embedded raster images, no external font dependencies, viewBox set correctly.

### Unexpected Outcomes
- If the graffiti text style is not achievable in clean SVG paths (too complex), simplify to a bold hand-drawn style and flag the compromise.
- If the skeleton character is not recognizable at favicon size, flag - may need a separate simplified icon design.

### On Completion
Queue TASK-011 (Favicon Generation). Logo is available for TASK-008 (Hero), TASK-012 (Nav), TASK-020 (Footer).
