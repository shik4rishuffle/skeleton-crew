# Seed Data Corrections - Use Fallback Content as Source of Truth

The original Ghost seed data (and the proposed Payload seed data in M-005) does
NOT match what's actually rendering on the live site. The operator has confirmed:
use the fallback content from `renderers.js` as the canonical source.

This file overrides the seed data in `architect-migration-tasks.md` task M-005.

---

## Page Heroes (no changes needed - these already match)

- `homepage`: "Websites that don't look like everyone else's." / "Bespoke web design and AI consulting for small UK businesses that refuse to settle."
- `work`: "Our Work" / "Real sites for real businesses. No templates, no compromise."
- `services`: "What We Offer" / "Two ways we help small businesses punch above their weight."
- `contact`: **DROP THIS ENTRY.** The contact page hero (`contact/index.html:69`) has no `data-ghost`/`data-cms` attribute. It's hardcoded. Creating a CMS entry for it is wasted - nothing on the frontend consumes it.

## CTA Strip (no changes needed)

- "Your competitors have a website. Do you?" / "Let's talk" / "/contact/"

**Note:** The services page has a separate hardcoded CTA strip ("Ready to talk?" / "Get in touch") with no CMS hook. This is not covered by the seed data. Consider adding a `data-cms` attribute and a second CTA strip entry in a future pass.

## Service Descriptions (no changes needed - these already match)

- `websites`: "Website Builds" / "We build websites that make your competitors nervous..."
- `ai`: "AI Consulting" / "We find the repetitive tasks eating your day..."

## Pricing Tiers - Website (CORRECTED - use fallback content)

```
Tier 1:
  tierName: "Starter"
  category: "website"
  audience: "For businesses getting online for the first time."
  price: "From £499"
  features:
    - "One-page site that actually looks good"
    - "Mobile-ready from day one"
    - "Live in two weeks"
  isFeatured: false
  sortOrder: 1

Tier 2:
  tierName: "Growth"
  category: "website"
  audience: "For businesses ready to stand out."
  price: "From £1,499"
  features:
    - "Multi-page bespoke design"
    - "Content managed by you"
    - "Built to grow with your business"
  isFeatured: true
  sortOrder: 2

Tier 3:
  tierName: "Premium"
  category: "website"
  audience: "For businesses that want the full package."
  price: "From £3,000"
  features:
    - "Everything in Growth, plus"
    - "Advanced features and integrations"
    - "Priority support"
  isFeatured: false
  sortOrder: 3
```

## Pricing Tiers - AI (CORRECTED - use fallback content)

```
Tier 1:
  tierName: "Audit"
  category: "ai"
  audience: "For businesses wondering where AI fits in."
  price: "From £299"
  features:
    - "Full workflow review"
    - "Written report with priorities"
    - "Clear next steps - no fluff"
  isFeatured: false
  sortOrder: 1

Tier 2:
  tierName: "Build"
  category: "ai"
  audience: "For businesses ready to automate what matters."
  price: "£800 - £2,500"
  features:
    - "One or two AI workflows built for you"
    - "Integrated into your existing tools"
    - "Trained to work without hand-holding"
  isFeatured: true
  sortOrder: 2

Tier 3:
  tierName: "Retainer"
  category: "ai"
  audience: "For businesses that want ongoing AI support."
  price: "£300 - £600/mo"
  features:
    - "Ongoing maintenance and updates"
    - "New automations as you grow"
    - "Monthly strategy call"
  isFeatured: false
  sortOrder: 3
```

## Portfolio Entry (no changes needed)

```
  projectName: "Fungi & Forage"
  description: "A bespoke website for a small mushroom growing business in the UK."
  liveUrl: "https://fungi-and-forage.example.co.uk"
  brandColour: null
  sortOrder: 1
```
