## Task 023: Ghost API Integration Module
**Phase:** 4 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** L | **Dependencies:** TASK-005, TASK-006, TASK-007, TASK-008

### Context
The central JavaScript module that fetches all content from Ghost and renders it into the page. This is the bridge between the CMS and the frontend. Every section that displays Ghost content depends on this module.

### What Needs Doing
1. Create `js/ghost-api.js` as an ES module following the architecture doc pattern:
   - Config constants: `API_BASE`, `API_KEY`, `CACHE_TTL` (5 min), `FETCH_TIMEOUT` (5s)
   - Internal `fetchFromGhost(resource, params)` function with:
     - `sessionStorage` caching with TTL
     - `AbortController` timeout (5s)
     - Returns `null` on failure (signals fallback)
   - Public functions: `getPortfolio()`, `getPricingWebsite()`, `getPricingAI()`, `getSiteContent()`
   - `initGhostContent()` - fires after first paint via `requestAnimationFrame` + `setTimeout(0)`, runs all fetches in parallel with `Promise.all`
   - Render functions for each section:
     - `renderPortfolio(data)` - replaces skeleton cards in portfolio grid
     - `renderPricing(category, data)` - replaces skeleton cards in pricing grid, parses `data-price` and `<ul>` from post body HTML
     - `renderSiteContent(data)` - replaces `data-ghost` attributed elements with CMS content
   - Fallback render functions: when data is `null`, replace skeletons with hardcoded fallback content
2. Wire `initGhostContent()` to fire on `DOMContentLoaded` in the homepage

### Files
- `js/ghost-api.js` (create)
- `index.html` (modify - add module script import)

### How to Test
- Load homepage with Ghost running: all sections populate with CMS content within 1-2 seconds. Skeleton loaders disappear.
- Load homepage with Ghost unreachable (simulate by changing API key temporarily): skeleton loaders are replaced with fallback content. No JS errors in console. Page remains navigable.
- Open DevTools > Network: confirm Ghost API calls fire after first paint, not during initial render.
- Open DevTools > Application > Session Storage: confirm cached responses appear with timestamps.
- Navigate away and back within 5 minutes: confirm content loads from cache (no new network requests to Ghost).
- Wait 5+ minutes and reload: confirm fresh fetch occurs.

### Unexpected Outcomes
- If Ghost returns unexpected response structure (different field names, pagination wrapping), flag the specific discrepancy. Do not silently ignore missing fields.
- If `sessionStorage` is unavailable (private browsing in some browsers), the module should degrade gracefully (fetch every time, no caching). Flag if this edge case is not handled.

### On Completion
All homepage sections now display Ghost content. Queue TASK-024 (Fallback Regeneration Script).
