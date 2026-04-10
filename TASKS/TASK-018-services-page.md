## Task 018: Services Page
**Phase:** 5 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-012, TASK-020, TASK-023

### Context
Full services page showing all six pricing tiers (3 website builds + 3 AI consulting) from Ghost. Two distinct sections.

### What Needs Doing
1. Create `services/index.html`:
   - Same `<head>` setup as homepage
   - Reuse nav and footer markup
   - Short page hero
   - "Website Builds" section: 3 pricing tier cards from Ghost (`tag:pricing-website`)
   - "AI Consulting" section: 3 pricing tier cards from Ghost (`tag:pricing-ai`)
   - Each section has skeleton loaders
2. Create `js/services.js` (or extend `ghost-api.js`):
   - Fetch both pricing categories
   - Render full tier cards: name, who it's for, price, feature bullets, CTA
   - Featured tier gets highlight treatment
3. Reuse `pricing.css` styles from homepage, extend if needed for full-page layout

### Files
- `services/index.html` (create)
- `js/services.js` (create, if needed)

### How to Test
- Navigate to `/services/`. Page loads with both pricing sections.
- Website Builds section shows 3 tiers in correct order.
- AI Consulting section shows 3 tiers in correct order.
- Featured tier has visual highlight.
- All CTAs link to `/contact/`.
- Skeleton loaders visible during fetch, replaced by real content.
- If Ghost is unreachable, fallback content displays.
- Responsive: cards stack on mobile.

### Unexpected Outcomes
- If the AI consulting tiers have a different structure (monthly pricing vs one-time), flag if the card template needs adaptation.

### On Completion
Services page is complete.
