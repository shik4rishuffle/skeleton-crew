# Frontend Output - Design Overhaul v3

## Summary

All changes from `frontend-plan.md` have been implemented. The before-mode test passes with 58 selectors covered.

---

## 1. Bug Fixes

### Bug 1: Toggle pill not pinning to bottom-right
- Moved `<button class="toggle__pill">` from inside `<section class="hero">` to a direct child of `<body>` (just before script tags) in `index.html`
- Removed all pill styles from `hero.css`
- Consolidated all pill styles into `toggle.css` with `z-index: 200` (above nav at 100)
- Merged the duplicate `transition` declarations into a single rule

### Bug 2: Toggle labels BEFORE/AFTER to THEIRS/OURS
- Changed pill text from `AFTER` to `OURS` in `index.html`
- Changed `toggle.js` label logic: `pill.textContent = isBeforeMode ? 'THEIRS' : 'OURS'`

### Bug 3: Remove 3D hero tilt
- Added `return;` as first line of `initHeroTilt()` in `effects.js` - function is now a no-op

### Bug 4: Neon green too bright
- `variables.css`: `--color-accent` changed from `#00FF41` to `#2ECC40`
- `variables.css`: `--color-accent-hover` changed from `#33ff66` to `#3DDB4F`
- `variables.css`: Added `--color-accent-muted: rgba(46, 204, 64, 0.15)`
- Updated all hardcoded `rgba(0, 255, 65, ...)` references to `rgba(46, 204, 64, ...)` in: `toggle.css`, `hero.css`, `pricing.css`
- Updated `toggle.js` hardcoded `#00FF41` to `#2ECC40` (featured pricing card GSAP transition)
- Updated `reset.css` fallback colour from `#00FF41` to `#2ECC40`

---

## 2. Colour Token Update
- `--color-accent: #2ECC40` (was #00FF41)
- `--color-accent-hover: #3DDB4F` (was #33ff66)
- `--color-accent-muted: rgba(46, 204, 64, 0.15)` (new token)

---

## 3. Layout Changes

### Hero left-alignment (desktop)
- Added `text-align: left; align-items: flex-start;` to `.hero__content` at 1024px+ breakpoint
- Added `justify-content: flex-start;` to `.hero__ctas` at 1024px+
- Mobile remains centred (base styles unchanged)
- Headline `max-width` changed from `14ch` to `18ch` (mobile), `16ch` to `20ch` (desktop)

### H2 letter-spacing
- Increased from `0.05em` to `0.15em` in `global.css` for more air on section headings

### Parallax shapes removed
- Deleted both parallax shape `<div>` elements from `index.html` (circle in what-we-do, line in portfolio)
- Removed `.parallax-shape`, `.parallax-shape--circle`, `.parallax-shape--line` CSS from `global.css`
- Removed `body.before-mode .parallax-shape` override from `before.css`

---

## 4. Component Styling

### Nav
- `.nav__link` letter-spacing increased from `0.1em` to `0.15em`
- Removed `rotate(-0.5deg)` from `.nav__link::after` - underline is now clean horizontal
- Simplified `::after` positioning: `left: 0; width: 100%` (was `left: -2px; width: calc(100% + 4px)`)
- Added `<span class="nav__logo-text">SKELETON CREW</span>` inside `.nav__logo` anchor in all 4 HTML pages
- Styled `.nav__logo-text`: Permanent Marker font via `var(--font-display)`, `1.35rem`, uppercase, `0.05em` letter-spacing
- Added `.nav__logo` gap of `0.5rem` between logo img and text
- Before-mode override: Arial, no uppercase, normal letter-spacing, white text

### What-We-Do Cards
- Removed the `::before` double-border pseudo-element
- First card: `border-left: 3px solid var(--color-accent)` (accent highlight)
- Second card: `border-top: 1px solid rgba(255, 255, 255, 0.06)` (edge highlight)
- Card border default changed from `1px solid var(--color-accent)` to `1px solid transparent`
- Card background set to `var(--color-surface)` for separation from body
- `.what-we-do__body` font-weight set to `500` (medium weight tier)

### Portfolio Cards
- Added `filter: grayscale(30%)` on `.portfolio__card-img` with `transition: filter`
- Hover removes grayscale: `filter: grayscale(0)`
- Hover translateY reduced from `-4px` to `-2px`
- Added `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03)` edge highlight
- `.portfolio__more` restyled from `btn btn--ghost` to a text link - removed button classes from HTML, added arrow entity, styled with heading font

### Pricing Cards
- Featured card: added `transform: scale(1.03)` at rest
- Featured card: removed `::before` "RECOMMENDED" badge entirely
- Feature list markers: changed from green dot (`border-radius: 50%`) to dash (`content: '-'; color: var(--color-accent)`)
- Price colour: changed from `var(--color-accent)` to `var(--color-text)`
- Non-featured card borders: changed from `1px solid var(--color-border)` to `1px solid transparent` at rest, `var(--color-border)` on hover
- Hover translateY reduced from `-4px` to `-2px`
- Added `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03)` edge highlight

### CTA Strip
- Removed `transform: rotate(-1deg)` and counter-rotation on inner
- Removed `margin-inline: -2rem; padding-inline: 2rem` hack
- Background changed from `var(--color-accent)` to `var(--color-surface)`
- Added `border-top: 1px solid var(--color-accent); border-bottom: 1px solid var(--color-accent)`
- Headline colour changed from `var(--color-bg)` to `var(--color-text)`
- Button now standard `btn--primary` (no longer inverted)
- Desktop: left-aligned via `align-items: flex-start; text-align: left` on inner

### Section Headings
- Changed `.section__heading::before` from `content: '//'` text to a 24px x 3px accent-coloured bar

### Footer
- Padding reduced from `--space-xl` to `--space-lg`
- Replaced `::before` pseudo-element with real `<div class="footer__line">` in all 4 HTML pages
- `.footer__line` styled identically to the old `::before` (absolute positioned, dashed green gradient)
- Added GSAP ScrollTrigger animation: scales in from left (`scaleX: 0` to `1`) when footer enters viewport
- Before-mode override: `display: none`

### Contact Form
- Added `border-left: 3px solid var(--color-accent)` on focused inputs/select/textarea

---

## 5. Texture and Depth
- Added `body::after` pseudo-element with SVG noise texture at `opacity: 0.025`, `z-index: 9999`, `pointer-events: none`
- Before-mode override: `body.before-mode::after { display: none; }`

---

## 6. Scroll Animation Fix for Dynamic Cards

### Problem
Portfolio and pricing cards are skeleton loaders in static HTML. When Ghost CMS data loads (or fallback renders), `renderers.js` replaces them via `innerHTML`. The existing scroll animations in `animations.js` targeted the original skeleton elements - which get destroyed - so the new cards never animate.

### Solution
- Removed portfolio card and pricing card animations from `scrollAnimations()` in `animations.js`
- Added two new exported functions: `animatePortfolioCards()` and `animatePricingCards()`
- Each function has its own `prefers-reduced-motion` guard and GSAP/ScrollTrigger checks
- In `main.js`, added `observeGridForAnimation()` helper that creates a `MutationObserver` on each `.portfolio__grid` and `.pricing__grid`
- When the observer detects child mutations (non-skeleton cards appearing), it disconnects and calls the appropriate animation function
- This works for all three rendering paths: live Ghost API, fallback JSON, and hardcoded fallback content

---

## 7. Before-Mode Updates
- Added `body.before-mode::after { display: none; }` - strip noise texture
- Added `body.before-mode .portfolio__card-img { filter: none; }` - strip grayscale
- Added `transform: none;` to `.pricing__card--featured` and `.pricing__card` before-mode rules
- Updated `.what-we-do__card` before-mode: added `border-left` and `border-top` resets to override asymmetric borders
- Added `font-weight: 400` to `.what-we-do__body` before-mode
- Updated `.portfolio__more` before-mode from button overrides to text link overrides
- Updated `.cta-strip` before-mode: added border overrides for accent borders
- Updated `.cta-strip__inner` before-mode: reset to centred alignment
- Removed stale `.parallax-shape` before-mode rule (shapes no longer exist)
- Added `body.before-mode .nav__logo-text` override (Arial, no uppercase, white)
- Changed `body.before-mode .footer::before` to `body.before-mode .footer__line`

---

## 8. Test Validation
- `node scripts/test-before-mode.js` result: **PASS - All 58 component selectors have before-mode coverage**

---

## Files Modified

| File | Changes |
|---|---|
| `public/css/variables.css` | Accent colour, accent-hover, added accent-muted token |
| `public/css/reset.css` | Updated fallback accent colour |
| `public/css/global.css` | Section heading prefix changed to accent line, removed parallax shape styles, added body noise texture, H2 letter-spacing |
| `public/css/before.css` | Added overrides for grayscale, scale, noise texture, what-we-do borders/weight, pricing transform, CTA borders/alignment, portfolio more link, removed parallax override, added nav__logo-text override, changed footer::before to footer__line |
| `public/css/components/hero.css` | Left-align on desktop, headline max-width, updated hardcoded rgba, removed pill styles |
| `public/css/components/nav.css` | Letter-spacing increased, removed underline rotation, added nav__logo-text styles, added gap to nav__logo |
| `public/css/components/toggle.css` | Full rewrite - consolidated all pill styles here, updated rgba, z-index 200 |
| `public/css/components/what-we-do.css` | Removed double-border, asymmetric card borders, surface background, body font-weight 500 |
| `public/css/components/portfolio.css` | Grayscale filter on images, reduced hover lift, edge highlight, portfolio__more restyled as text link |
| `public/css/components/pricing.css` | Featured card scale, removed badge, dash markers, price colour to text, transparent resting borders, reduced hover lift, edge highlight |
| `public/css/components/cta-strip.css` | Full rewrite - dark bg, no rotation, accent borders, left-aligned on desktop |
| `public/css/components/footer.css` | Replaced ::before with .footer__line element, added transform-origin for animation |
| `public/css/components/contact.css` | Accent left border on focus |
| `public/index.html` | Moved pill button to body level, removed parallax shape divs, pill text OURS, portfolio more link no longer a button, added nav__logo-text span, added footer__line div |
| `public/work/index.html` | Added nav__logo-text span, added footer__line div |
| `public/services/index.html` | Added nav__logo-text span, added footer__line div |
| `public/contact/index.html` | Added nav__logo-text span, added footer__line div |
| `public/js/toggle.js` | THEIRS/OURS labels, #2ECC40 hardcoded colour |
| `public/js/effects.js` | initHeroTilt disabled with early return |
| `public/js/animations.js` | Moved portfolio/pricing card animations to exported functions, added footer__line scroll animation |
| `public/js/main.js` | Imported animatePortfolioCards/animatePricingCards, added MutationObserver-based observeGridForAnimation helper |
