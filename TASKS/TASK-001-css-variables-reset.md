## Task 001: Design System - CSS Variables and Reset
**Phase:** 1 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** none

### Context
Every component depends on the design tokens. Nothing else can be built until `variables.css` and `reset.css` exist and define the canonical colours, typography, spacing, and breakpoints.

### What Needs Doing
1. Create `css/variables.css` with all design tokens from the brief:
   - Colour palette: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-muted`, `--color-border`
   - Font families: `--font-hero` (Lacquer), `--font-display` (Bebas Neue), `--font-body` (DM Sans) with fallback stacks
   - Font sizes scale (fluid or fixed breakpoints - agent decides)
   - Spacing scale (consistent multiplier)
   - Breakpoints as custom properties or documented comment block
   - Border radius, transition durations, z-index layers
   - Comment the file clearly - label it as "the only file you need to edit per client"
2. Create `css/reset.css` with a modern CSS reset (box-sizing, margin reset, image defaults, accessible focus styles)

### Files
- `css/variables.css` (create)
- `css/reset.css` (create)

### How to Test
- Open a blank HTML page that imports both files. Inspect computed styles to confirm all custom properties resolve correctly.
- Confirm fallback font stacks render if Google Fonts are blocked.
- Confirm no default browser margins/padding remain on `body`, `h1`-`h6`, `p`, `ul`.

### Unexpected Outcomes
- If the fluid type scale produces unreadable sizes at any viewport width, flag for review rather than adding breakpoint overrides ad hoc.

### On Completion
Queue TASK-002 (Global Styles).
