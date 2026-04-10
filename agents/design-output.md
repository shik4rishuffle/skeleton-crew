# Design Output - Skeleton Crew Logo

---

## Round 2: Draft Logo Variants (For Operator Review)

**Status:** DRAFTS - awaiting operator feedback before production work.

Three new logo directions have been produced as draft SVGs for visual comparison. These address the feedback that Round 1 logos were "too formulaic" and lacked the "subversive punk" energy the brand requires. All three follow the technical constraints (viewBox-based, paths only, no raster, no blur filters, only #0a0a0a / #00FF41 / #f5f5f5).

See `AGENTS/design-plan.md` for full rationale on why each direction was chosen.

### Draft A: Stencil Bomb - `public/assets/logo-draft-a.svg`

**viewBox:** 0 0 600 500

A stencil-cut logo as if sprayed through rough cardboard onto a concrete wall. The skull sits inside a torn-edge rectangular frame tilted 2.5 degrees off-horizontal. "SKELETON" and "CREW" in heavy stencil capitals sit below the frame, dead straight - the tilt/straight tension is the compositional hook.

Key design features:
- Torn zigzag border simulating cut cardboard stencil edges
- Stencil bridges on closed letters (S, E, O) - the gaps real stencils need to stay connected
- Asymmetric skull: left eye socket larger than right, green dot in the smaller eye (knowing wink), cracked tooth, missing tooth gap, grin wider on one side
- Skull tilted with frame; text level below - creates visual tension
- References: stencil protest art, DIY zine culture, Banksy-era street graphics

**Why this direction:** Stencil = "we made this ourselves." The DIY ethos of stencil art directly maps to Skeleton Crew's positioning against template factories.

### Draft B: Deck Graphic - `public/assets/logo-draft-b.svg`

**viewBox:** 0 0 500 560

Classic skateboard deck / biker patch badge composition. Large, aggressive skull with full upper torso (collar bones, three rows of ribs, sternum) dominates the centre. "SKELETON" arcs above, "CREW" arcs below. Rough oval badge border with dashed inner line.

Key design features:
- Badge/oval silhouette - works for social media avatars, stickers, patches, merchandise
- Most detailed skull of the three: full upper torso, diagonal crack across cranium
- Neon green eye uses concentric circles at different opacities for a glow effect (no raster gradients)
- 80s/90s vintage deck typography - bold, condensed, arcing around the skull
- Small #00FF41 accent dots at badge poles
- References: Powell Peralta, Santa Cruz, Vision deck graphics, biker club patches

**Why this direction:** The most directly "skate" of the three. Badge shape is the most versatile for round/square contexts. Bolder and more confrontational than Round 1.

### Draft C: Wheat Paste - `public/assets/logo-draft-c.svg`

**viewBox:** 0 0 660 340

Layered poster composition. The skull is rendered entirely in neon green (#00FF41) as a background layer. Massive blocky off-white "SKELETON" text sits across the top, overlapping the skull. Even larger "CREW" text below obscures the skull's jaw. Only the cranium, eyes, nose, and upper teeth are visible through the text gaps.

Key design features:
- Text dominates - skull is discovered second, creating visual intrigue
- Green skull behind white text = striking two-tone layered effect
- Extremely bold, tight-tracked, blocky letterforms - as if cut from plywood
- Torn zigzag edges at top and bottom simulate wheat-paste paper
- Subtle diagonal neon green accent line at bottom
- References: wheat-paste poster advertising, screen-printed gig posters, construction hoarding layers

**Why this direction:** The most "underground" variant. Wheat-pasting is guerrilla marketing. The layered composition is more visually complex than a clean lockup and works at both small sizes (text is primary) and large sizes (skull detail rewards inspection).

### Open questions (still unanswered from design-plan.md)

1. Which direction appeals most? Or a combination of elements from multiple?
2. Skull personality - cheeky and confident vs battle-scarred and gnarly?
3. Stencil bridges (Draft A) - deliberate aesthetic or gimmick?
4. Green skull (Draft C) - does the all-green skull work, or should it always be off-white with green eye only?
5. How rough is too rough? Gallery-curated roughness or genuine found-on-a-wall roughness?
6. Anything about the existing skull to keep?

---

## Round 1: Original Assets (Superseded - kept for reference)

## Assets Produced

### Variant A: Stacked Lockup (recommended) - `public/assets/logo.svg`

Skeleton character (skull + upper torso) centred above "SKELETON CREW" text in a vertical stack. The skull has a rounded, slightly wider-than-anatomical shape with a flat cranium. Two eye sockets - the left one contains a neon green (#00FF41) dot as the brand's signature detail. Wide grin with blocky teeth. Below the skull: collar bones, three ribs, and a sternum line, cropped at the rib cage. "SKELETON" sits on one line, "CREW" beneath it, both in chunky hand-painted uppercase letterforms drawn as SVG paths.

- viewBox: 600x500
- Colours: #f5f5f5 (character and text), #00FF41 (eye dot only)

### Variant B: Inline Crew - `public/assets/logo-v2.svg`

Skeleton character positioned to the left, tilted approximately 7 degrees. "SKELETON" text on the first line to the right, "CREW" on the second line below it (slightly larger). A neon green accent line sits beneath "CREW". The horizontal layout is compact and works well in navigation bars or headers where vertical space is limited.

- viewBox: 700x260
- Colours: #f5f5f5 (character and text), #00FF41 (eye dot and accent line)

### Variant C: Tag Style - `public/assets/logo-v3.svg`

Text-dominant layout with "SKELETON" on the left, a neon green skull between the words, and "CREW" on the right. The skull is smaller and rendered entirely in #00FF41, creating a graphic break between the two words. A subtle neon green accent line runs along the bottom. This is the most compact variant and has a stencil/wheat-paste aesthetic.

- viewBox: 640x112
- Colours: #f5f5f5 (text), #00FF41 (skull, eye dot, accent line)

### Icon-Only Mark - `public/assets/logo-icon.svg`

Simplified skull only - no torso. Rounded cranium, two eye sockets (left with neon green dot), nose, and a row of four blocky teeth with a grin curve. Designed to remain recognisable at 32x32px and usable as a favicon source.

- viewBox: 100x100
- Colours: #f5f5f5 (skull outline), #00FF41 (eye dot)

---

## Recommendation

**Variant A (Stacked Lockup) is the recommended primary logo.** Reasons:

1. **Most versatile.** The vertical stack works at hero scale (600px+) and can be adapted for nav (drop the torso, use text-only or skull+text inline).
2. **Character prominence.** The skeleton sits above the text with clear visual hierarchy - the brand's most distinctive element leads.
3. **Favicon derivation.** The skull is designed as a standalone element from the start, so the icon mark is a natural extraction rather than a compromise.
4. **Aesthetic fit.** The stacked composition feels like a skateboard deck graphic - central image, brand name below - which matches the brief's visual direction.
5. **Separation of concerns.** Character and text are cleanly separable, allowing the Frontend agent to use each independently as needed.

Variant B is the strongest runner-up for horizontal layouts (nav bars, email signatures, letterheads). Variant C is the most compact option but sacrifices character prominence.

---

## Usage Notes for Frontend Agent

### File locations
- `public/assets/logo.svg` - primary logo (Variant A), use in hero and footer
- `public/assets/logo-v2.svg` - horizontal variant, consider for nav if vertical space is tight
- `public/assets/logo-v3.svg` - compact variant, available if a text-heavy treatment is needed
- `public/assets/logo-icon.svg` - skull icon, use for favicon generation and small-size contexts

### Technical details
- All SVGs use transparent backgrounds - they are designed to sit on #0a0a0a
- No `<text>` elements - all letterforms are SVG paths, no font dependencies
- No embedded raster images
- Colours used: only #f5f5f5, #00FF41, and #0a0a0a (Variant C only)
- All paths use integer coordinates (no decimal precision issues)
- Each file includes `<title>Skeleton Crew logo</title>` for accessibility

### Sizing guidance
- Hero usage: display at full width, max around 400-600px wide
- Nav usage: scale to approximately 140-200px wide; consider using just the text portion or the icon mark
- Favicon: use `logo-icon.svg` as the source; the skull is legible at 32x32px and recognisable at 16x16px

### Colour handling
- The neon green eye dot is the signature brand accent - it should always be present
- On any background other than near-black, the SVG fill colours would need inverting (swap #f5f5f5 to #0a0a0a)
- The site is dark-background throughout, so no inversion is needed for this project

### Favicon generation
- The icon mark (`logo-icon.svg`) should be used as the source for generating favicon PNGs and the ICO file
- At 16x16, the skull outline, two eye sockets, green dot, and teeth row should remain distinguishable
- Favicon PNG/ICO generation is a separate step outside SVG production

---

## Favicon

### Assets produced
- `public/assets/favicon.svg` - favicon-optimised SVG with dark background and rounded corners
- `public/site.webmanifest` - web app manifest referencing the favicon

### Differences from logo-icon.svg
The favicon SVG adds a `#0a0a0a` background with `rx="16"` rounded corners so the skull renders correctly on any OS chrome (light taskbars, browser tab bars, bookmark bars, etc.). The original `logo-icon.svg` has a transparent background and is intended for use on the site's dark canvas.

### HTML tags for every page's `<head>`

```html
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="icon" type="image/x-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0a0a0a">
```

### Browser support notes
- **Modern browsers** (Chrome, Firefox, Edge, Safari 15.4+) support SVG favicons via `type="image/svg+xml"`.
- **Legacy browsers** that require ICO or PNG favicons will fall back gracefully - they simply won't display a favicon.
- The `type="image/x-icon"` fallback line points to the same SVG; browsers that don't understand SVG favicons will ignore it.

### Generating ICO/PNG variants for production
For full cross-browser coverage (including older Safari, iOS home screen icons, and Windows pinned tiles), use a tool like [realfavicongenerator.net](https://realfavicongenerator.net/) to generate ICO and PNG variants from `favicon.svg`. Upload the SVG, download the generated package, and place the files in `public/assets/`. Then update the `<head>` tags to include the additional formats:

```html
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
```
