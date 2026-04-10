# Frontend Design Overhaul Plan - v3

---

## 1. Skill Output Summary

### 1.1 frontend-design Skill

This skill provides guidance on building distinctive, production-grade frontend interfaces that avoid "AI slop" aesthetics.

**Key directives relevant to this project:**

1. **"Choose a clear conceptual direction and execute it with precision."** - The current site has no single conceptual spine. It has surface decorations (angled dividers, `//` prefixes, rotated CTA strip) bolted onto what is fundamentally a centred-content, evenly-spaced SaaS layout. The underlying rhythm and spatial logic is generic.

2. **"Dominant colors with sharp accents outperform timid, evenly-distributed palettes."** - Currently `--color-accent` (#00FF41) is applied uniformly across every component: card borders, pill, CTA strip background, button fills, feature dots, link colours. The accent is everywhere at equal intensity, which dilutes its impact. The skill says restraint in accent usage creates punch.

3. **"Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density."** - Every section currently follows the same spatial pattern: centred heading, evenly-spaced grid, centred "see more" link. No asymmetry, no overlap, no grid-breaking. The layout reads as a vertical stack of identical blocks.

4. **"Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures."** - The `--color-bg` (#0a0a0a) and `--color-surface` (#111111) give almost no visual separation. Cards sit on a background that is nearly the same tone. No grain, no texture, no depth.

5. **"NEVER converge on common choices... no design should be the same."** - The current approach converges on every dark-theme SaaS convention: centred hero, 3-column pricing grid, card hover lift, accent-coloured buttons, even spacing.

### 1.2 ui-ux-pro-max Skill

This skill provides production-grade UX rules with priority-ordered categories covering accessibility, interaction, performance, layout, typography, colour, and animation.

**Key directives relevant to this project:**

1. **"Use 4pt/8dp spacing scale" (Priority 5: Layout)** - The current spacing scale is 0.5rem-based (8px, 16px, 24px, 32px, 48px, 64px) which is correct, but section spacing is uniform. Every section uses `var(--space-section)` identically. The skill says spacing should create hierarchy - more space between unrelated sections, tighter grouping within related content.

2. **"Use font-weight to reinforce hierarchy: Bold headings (600-700), Regular body (400), Medium labels (500)" (Priority 6: Typography)** - Currently body text is uniform weight. Labels, descriptions, and body copy all render at the same visual weight. No medium-weight labels to create a middle tier.

3. **"Duration 150-300ms for micro-interactions; complex transitions <=400ms. Use ease-out for entering, ease-in for exiting" (Priority 7: Animation)** - The `--transition-base: 300ms ease-out` and `--transition-fast: 200ms ease-out` are correctly defined. However, the toggle GSAP animation is 500ms total which is borderline. Stagger timings need validation against the 30-50ms per item rule.

4. **"Define layered z-index scale (e.g. 0 / 10 / 20 / 40 / 100 / 1000)" (Priority 5: Layout)** - Currently nav uses z-index: 100 and toggle pill uses z-index: 100. These should be on separate layers (nav: 100, pill: 200, overlay: 1000).

5. **"Every animation must express a cause-effect relationship, not just be decorative" (Priority 7: Animation)** - The parallax shapes are purely decorative motion with no cause-effect. The hero background drift is decorative. These should be re-evaluated: keep only effects that reinforce user interaction (the text reveal is good - it responds to cursor intent).

---

## 2. Design Decisions Informed by Skills

### 2.1 Layout: Break the Centred-Block Pattern

**Decision:** Shift from centred, evenly-spaced, same-width sections to an asymmetric page rhythm. Specifically:
- Hero content left-aligned, not centred
- What-we-do cards given unequal visual weight (first card larger or different border treatment, second card distinct)
- Portfolio grid keeps 3-column but cards get editorial treatment (grayscale at rest, colour on hover)
- Pricing cards: featured card physically offset (scaled up, not just border-highlighted)
- CTA strip kept full-bleed but with left-aligned text (not centred)

**Skill citation:** frontend-design - "Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements."

**Why this requires skill guidance:** Without this directive, the natural instinct is to centre everything and make all columns equal width. The centred-block pattern is what makes the current site look like a SaaS template. Left-aligning the hero and CTA strip immediately breaks the template assumption.

### 2.2 Colour: Accent Restraint and Texture

**Decision:** Reduce accent colour to approximately #2ECC40 (less saturated, still neon-adjacent). More critically, restrict where the accent appears:
- Accent used only on: hero CTA primary button, toggle pill, featured pricing card border, individual hover states, one accent detail per section
- Everything else that currently uses accent at full intensity gets pulled back to either `--color-border` or a new muted-green token (`--color-accent-muted`: the accent at ~15% opacity)
- Add a subtle CSS noise texture overlay on `--color-bg` to create depth between background and surface elements

**Skill citation:** frontend-design - "Dominant colors with sharp accents outperform timid, evenly-distributed palettes."

**Why this requires skill guidance:** The instinct when you have a neon accent is to use it everywhere to "make it pop." The skill says the opposite - restraint makes it hit. Currently the accent is on 15+ different element types. Cutting it to 5-6 deliberate placements makes each one count.

### 2.3 Typography: Weight Hierarchy and Scale Differentiation

**Decision:** Introduce a clearer weight tier system:
- H1 (Permanent Marker): stays as-is, hero only
- H2 (Bebas Neue): increase letter-spacing to 0.15em on section headings for more air
- Body text: DM Sans 400 for paragraphs, DM Sans 500 for labels and card descriptions
- Pricing card price: Bebas Neue at a larger scale differential

**Skill citation:** ui-ux-pro-max Priority 6 - "Use font-weight to reinforce hierarchy."

**Why this requires skill guidance:** Without explicit weight tiers, everything reads at the same level. The current site has headings and body but no middle tier. Adding medium-weight labels creates a three-tier reading hierarchy that guides the eye.

### 2.4 Spacing: Varied Section Rhythm

**Decision:** Instead of uniform `--space-section` on every section:
- Hero: no explicit bottom padding, content flows into the next section
- What-we-do: tighter top padding (half of `--space-section`), grouping with the hero
- Portfolio: full `--space-section` top and bottom, standalone showcase
- Pricing: reduced top padding to group with portfolio as "what we do" content
- CTA strip: generous padding to create a visual break before the footer
- Footer: slightly tighter padding

**Skill citation:** ui-ux-pro-max Priority 5 - "Define clear vertical rhythm tiers by hierarchy."

**Why this requires skill guidance:** Uniform spacing makes every section feel equally important. The skill says to use spacing to signal hierarchy - related sections cluster together, independent sections have more breathing room.

### 2.5 Component Styling: Surface Differentiation

**Decision:** Create more visual separation between cards and background:
- Cards get a subtle top edge highlight (1px rgba(255,255,255,0.03) border-top or box-shadow inset) to simulate an edge catch
- Card borders default to transparent (not `--color-border`), with border only appearing on hover or for the featured card
- Add a very subtle noise/grain texture to the body background using a CSS pseudo-element with a tiny repeating SVG at low opacity (0.02-0.03)

**Skill citation:** frontend-design - "Create atmosphere and depth rather than defaulting to solid colors."

**Why this requires skill guidance:** Solid #0a0a0a to solid #111111 creates almost no perceived depth. A noise texture on the background plus a highlight edge on cards creates the "alive" feeling the brief demands without adding actual images.

### 2.6 Interaction: Purposeful Motion Only

**Decision:** Remove the parallax shapes (decorative-only, no cause-effect). Remove the hero 3D tilt (operator rejected). Keep the text reveal (responds to cursor, demonstrates the brand's "reveal what's underneath" concept). Reduce card hover lift from 4px to 2px. Keep the toggle animation as the centrepiece.

**Skill citation:** ui-ux-pro-max Priority 7 - "Every animation must express a cause-effect relationship, not just be decorative."

**Why this requires skill guidance:** The instinct is to add more effects for "wow factor." The skill says purposeless motion is worse than no motion. The text reveal is the best effect because it has conceptual meaning (revealing the real site underneath). The tilt was rejected. The parallax shapes are purely decorative.

---

## 3. Bug Fixes

### Bug 1: Toggle pill not pinning to bottom-right

**Current state:** The `.toggle__pill` CSS in `hero.css` already has `position: fixed; bottom: var(--space-sm); right: var(--space-sm); z-index: 100;`. However, the pill button lives inside the `<section class="hero">` element which has `overflow: hidden`. This can prevent fixed positioning from working correctly in some stacking contexts.

**Fix:**
- Move the `<button class="toggle__pill">` element out of the `<section class="hero">` and place it as a direct child of `<body>`, just before the closing `</body>` tag (before the script tags). This eliminates any stacking context or overflow issues.
- Set `z-index: 200` (higher than nav at 100) so the pill floats above everything.
- Remove the duplicate `transition` declaration in `toggle.css` and consolidate all pill styles into `toggle.css`, removing them from `hero.css`.

### Bug 2: Toggle labels - BEFORE/AFTER to THEIRS/OURS

**HTML (`index.html`, line 112):**
- Change pill text from `AFTER` to `OURS`

**JS (`toggle.js`, line 246):**
- Change `pill.textContent = isBeforeMode ? 'BEFORE' : 'AFTER';` to `pill.textContent = isBeforeMode ? 'THEIRS' : 'OURS';`
- The toggle button text labels ("See what we do differently" / "See what everyone else gives you") remain as-is - they already convey the right meaning.

### Bug 3: Remove 3D hero tilt

**JS (`effects.js`):**
- Make `initHeroTilt()` a no-op by adding `return;` as its first line inside the function body (after the export declaration). The function still exists, the export still works, `main.js` still calls it, but it does nothing. One-line change.

### Bug 4: Neon green too bright

**CSS (`variables.css`):**
- Change `--color-accent: #00FF41;` to `--color-accent: #2ECC40;`
- Change `--color-accent-hover: #33ff66;` to `--color-accent-hover: #3DDB4F;`

**Hardcoded references to update:**
- `toggle.css`: `rgba(0, 255, 65, ...)` in keyframe - update to `rgba(46, 204, 64, ...)`
- `hero.css`: `rgba(0, 255, 65, ...)` in `.hero__bg` radial gradients and `.toggle__pill:hover` box-shadow
- `toggle.js`: `#00FF41` on line ~200 (featured pricing card border in GSAP "after" transition) - change to `#2ECC40`

---

## 4. Component-by-Component Plan

### 4.1 Nav

**Current problem:** The nav is clean and functional. The -0.5deg rotated underline is a gimmicky touch that does not fit the skateboard aesthetic.

**Planned changes:**
- Increase letter-spacing on `.nav__link` from 0.1em to 0.15em
- Remove the rotation on `.nav__link::after` (set `transform: scaleX(0)` without rotate, `transform: scaleX(1)` on hover without rotate). Keep 3px height for thickness.
- No new selectors.

**Before-mode coverage:** Already covered. No changes needed.

### 4.2 Hero

**Current problem:** Centred text, centred CTAs, uniform spacing. This is the default layout of every template hero.

**Planned changes:**
- Desktop (1024px+): left-align `.hero__content` (`text-align: left; align-items: flex-start;`)
- Mobile: keep centred (the `text-align: center; align-items: center;` base styles stay)
- Change headline `max-width` from `14ch` to `18ch` (less forced line-break)
- Desktop headline `max-width`: change from `16ch` to `20ch`
- Add a subtle noise texture on `.hero__bg` using a CSS background-image with a base64-encoded tiny SVG noise pattern at very low opacity
- Update the hardcoded green rgba values in the `.hero__bg` radial gradients to match the new accent colour
- Remove the parallax shape `<div>` elements from the HTML (two of them in the what-we-do and portfolio sections)

**Before-mode coverage:** Existing `.before-mode .hero__content { text-align: center; }` already resets alignment. Covered.

### 4.3 Toggle (Button + Pill)

**Current problem:** Pill sits inside the hero section which has `overflow: hidden`. Labels say BEFORE/AFTER instead of THEIRS/OURS.

**Planned changes:**
- Move `<button class="toggle__pill">` to be a direct child of `<body>` in the HTML (just before `<script>` tags)
- Move all pill styles from `hero.css` into `toggle.css` for clean separation
- Rename labels (Bug 2)
- z-index raised to 200

**Before-mode coverage:** Toggle controls are excluded from the test. No changes needed.

### 4.4 What-We-Do Cards

**Current problem:** Two equal cards side by side with a double-border pseudo-element that reads as decoration on an otherwise standard layout.

**Planned changes:**
- Remove the `::before` double-border effect entirely
- First card: add a 3px left border in accent colour (`border-left: 3px solid var(--color-accent)`)
- Second card: no coloured border, use a subtle top-edge highlight (`border-top: 1px solid rgba(255,255,255,0.06)`)
- Card body text: add `font-weight: 500` for medium weight on `.what-we-do__body`
- Card padding stays at `--space-lg`

**Before-mode coverage:** Already covered. The `::before { display: none; }` rule stays. Add before-mode overrides for the new left-border (reset to `border-left: none; border: 2px solid #dddddd;`).

### 4.5 Portfolio Cards

**Current problem:** Standard 3-column grid with hover lift. Base state is flat and generic.

**Planned changes:**
- Add `filter: grayscale(30%); transition: filter var(--transition-base);` on `.portfolio__card-img`
- On hover: `filter: grayscale(0)`
- Reduce hover translateY from -4px to -2px
- Change `.portfolio__more` from `btn btn--ghost` to a simple text link style (remove the button class in HTML, style as inline link with arrow)

**Before-mode coverage:** Already covered for the card. Add `body.before-mode .portfolio__card-img { filter: none; }` to strip the grayscale in before-mode.

### 4.6 Pricing Cards

**Current problem:** Standard 3-column pricing table with SaaS conventions (green border + "RECOMMENDED" badge on featured).

**Planned changes:**
- Featured card: add `transform: scale(1.03)` at rest to make it physically larger
- Featured card: remove the `::before` "RECOMMENDED" text badge. The scale and border are sufficient visual distinction.
- Actually, keep the badge but change text to just `*` (an asterisk mark) - this is more graphic/editorial. Or remove entirely. Will remove entirely for cleaner look.
- Feature list markers: change green dot to a short dash in accent colour (`content: '-'; color: var(--color-accent); left: 0;`)
- Price text colour: change from `var(--color-accent)` to `var(--color-text)`. The price reads cleaner in white; the accent is reserved for the CTA button below it.
- Non-featured card borders: change from `1px solid var(--color-border)` to `1px solid transparent` at rest, `1px solid var(--color-border)` on hover. Creates a cleaner resting state.
- Hover lift: reduce from -4px to -2px

**Before-mode coverage:** Already covered. The `::before { content: none; }` rule stays. Add `transform: none;` to the featured card before-mode rule.

### 4.7 CTA Strip

**Current problem:** Neon green background makes it the loudest element on the page. The -1deg rotation with negative margins is hacky and creates overflow issues.

**Planned changes:**
- Remove the rotation (`transform: rotate(-1deg)`) and counter-rotation on inner
- Remove the `margin-inline: -2rem; padding-inline: 2rem;` hack
- Change background from `var(--color-accent)` to `var(--color-surface)` (#111111)
- Add a 1px top and bottom border in accent colour: `border-top: 1px solid var(--color-accent); border-bottom: 1px solid var(--color-accent);`
- Headline colour: change from `var(--color-bg)` (black, because it was on green bg) to `var(--color-text)` (white, now on dark bg)
- Button: change from inverted (dark bg / accent text) to standard `btn--primary` (accent bg / dark text)
- Text alignment: left-aligned on desktop (matching the hero's left-alignment for consistency)

**Before-mode coverage:** Already covered. Update the before-mode rules: background stays at `#e8e8e8`, remove the transform resets (no longer needed), ensure headline colour override is present.

### 4.8 Footer

**Current problem:** Functional, minor refinement only.

**Planned changes:**
- Reduce padding from `--space-xl` to `--space-lg`
- Keep the dashed top edge (it is a nice subtle detail)

**Before-mode coverage:** Already covered. No new selectors.

### 4.9 Contact Form

**Current problem:** Functional, whitespace was already fixed in v2.

**Planned changes:**
- Add a 3px accent left border on focused inputs for visual continuity:
  `.contact-form__input:focus, .contact-form__select:focus, .contact-form__textarea:focus { border-left: 3px solid var(--color-accent); }`

**Before-mode coverage:** Contact form selectors are excluded from the test. No changes needed.

### 4.10 Services Page

**Current problem:** Clean structure, just uses the shared heading and pricing styles.

**Planned changes:**
- The shared `section__heading::before` content change (from `//` to a horizontal line) applies here automatically
- No page-specific CSS changes needed

**Before-mode coverage:** Services selectors are excluded from the test. No changes needed.

### 4.11 Global Section Headings

**Current problem:** The `//` prefix is a text-based decoration. It reads as a dev convention, not a skateboard/Supreme brand mark.

**Planned changes:**
- Change `.section__heading::before` from `content: '//'` to `content: ''` styled as a short horizontal accent line:
  ```
  .section__heading::before {
    content: '';
    display: block;
    width: 24px;
    height: 3px;
    background-color: var(--color-accent);
  }
  ```
- This is a minimal graphic mark that is more inline with the Element/Palace/Supreme aesthetic (simple geometric details, not text decorations)

**Before-mode coverage:** Already covered with `body.before-mode .section__heading::before { display: none; }`.

### 4.12 Body Noise Texture

**Current problem:** Flat solid black background creates no atmosphere.

**Planned changes:**
- Add a `body::after` pseudo-element with a noise texture:
  ```
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,..."); /* tiny noise pattern */
    background-repeat: repeat;
  }
  ```
- The texture should be barely perceptible but add a tactile quality to the solid background
- In before-mode: `body.before-mode::after { display: none; }` (templates do not have texture)

**Before-mode coverage:** Need to add `body.before-mode::after { display: none; }` or `opacity: 0`. The `body` selector is already covered in before.css so the block-level check passes. But the `::after` pseudo-element is new. Since the test extracts class selectors (not pseudo-elements), and `body` is not a class selector, this should not trigger a test failure. Will validate.

---

## 5. Colour Adjustment

### Current: #00FF41
- RGB: 0, 255, 65
- Pure neon green. Maximum green channel saturation. Fatiguing at large sizes.

### Proposed: #2ECC40
- RGB: 46, 204, 64
- Still clearly green, still neon-adjacent. Green channel reduced from 255 to 204, red channel raised from 0 to 46. Warms it slightly, reduces peak luminance.
- On `#0a0a0a` background: contrast ratio ~10.5:1 (well above WCAG AAA 7:1)
- Reads as "neon green" but does not burn the retina

### Accent-hover: #3DDB4F
- Slightly brighter than base for hover states
- Still well below the original #00FF41 brightness

### New token: --color-accent-muted
- Value: `rgba(46, 204, 64, 0.15)`
- For subtle background tints, muted borders, glow effects at reduced intensity

### Rationale
The operator said "a touch too bright" - not "change the colour." This is a ~20% luminance reduction, not a hue shift. #2ECC40 is in the range the brief suggested (#39FF14 to #2ECC40), closer to the subdued end.

---

## 6. Before-Mode Test Strategy

### Current state
The test passes with all 61 component selectors covered.

### New properties on existing selectors
These do not create new selectors, so the test continues to pass:
- `.portfolio__card-img` gets `filter: grayscale(30%)` - add before-mode override `filter: none;`
- `.pricing__card--featured` gets `transform: scale(1.03)` - add before-mode override `transform: none;`
- `.cta-strip` background changes from accent to surface - before-mode already overrides to `#e8e8e8`
- `.hero__content` alignment changes - before-mode already overrides to centred

### New pseudo-element on body
`body::after` for noise texture - the test parses class selectors, not element selectors. `body` is not matched by the regex pattern `/\.(([a-zA-Z][\w-]*...)/`. So this does not affect the test. The before-mode override for body::after will be added to before.css but is not required by the test.

### Validation process
1. After all CSS changes, run `node scripts/test-before-mode.js`
2. Confirm PASS with the same or greater number of covered selectors
3. If new class selectors are somehow flagged, add corresponding before-mode rules

### Hardcoded colour values in toggle.js
`toggle.js` hardcodes `#00FF41` for the featured pricing card border in the GSAP "after" transition. This must be updated to `#2ECC40`.

---

## 7. Implementation Order

1. **Bug fixes** (all 4) - get the site functionally correct
2. **Colour token update** - accent, hover, muted; update all hardcoded references
3. **Layout changes** - hero left-alignment, section spacing variation, remove parallax shapes from HTML
4. **Component styling** - card treatments, CTA strip, section headings, pricing overhaul
5. **Texture and depth** - noise background, card edge highlights
6. **Before-mode updates** - add overrides for new properties
7. **Test validation** - run `node scripts/test-before-mode.js`, confirm PASS
8. **Final review** - visual logic check across all four pages

---

## 8. Files to Modify

| File | Changes |
|---|---|
| `public/css/variables.css` | Accent colour, accent-hover, add accent-muted token |
| `public/css/global.css` | Section heading prefix change (// to line), remove parallax shape styles, add body noise texture |
| `public/css/components/hero.css` | Left-align on desktop, headline max-width, update hardcoded rgba, remove pill styles (move to toggle.css) |
| `public/css/components/nav.css` | Letter-spacing, remove underline rotation |
| `public/css/components/toggle.css` | Update hardcoded rgba, consolidate all pill styles here |
| `public/css/components/what-we-do.css` | Remove double-border, asymmetric card borders, body font-weight |
| `public/css/components/portfolio.css` | Grayscale filter on images, reduced hover lift |
| `public/css/components/pricing.css` | Featured card scale, remove badge, dash markers, price colour, transparent resting borders, reduced hover lift |
| `public/css/components/cta-strip.css` | Dark bg, remove rotation, accent borders, colour resets |
| `public/css/components/footer.css` | Reduced padding |
| `public/css/before.css` | Add overrides for grayscale, scale, noise texture, updated CTA colours |
| `public/index.html` | Move pill button to body level, remove parallax shape divs |
| `public/js/toggle.js` | THEIRS/OURS labels, update hardcoded #00FF41 |
| `public/js/effects.js` | Disable initHeroTilt (early return) |

---

## 9. What This Plan Does NOT Change

- No JavaScript rewrite. Three minimal targeted JS changes only (labels, colour value, no-op function).
- No HTML restructure beyond moving the pill button and removing two parallax shape divs.
- No new fonts, frameworks, or dependencies.
- No changes to Ghost API integration, renderers, nav logic, contact form logic, or animations module.
- No changes to subpages beyond what cascades from global/component CSS changes.
- The before-mode test must continue to pass.
