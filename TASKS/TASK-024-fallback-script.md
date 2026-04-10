## Task 024: Fallback Content Regeneration Script
**Phase:** 4 | **Agent:** Architect
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-023

### Context
A weekly cron job script fetches current Ghost content and writes a static JSON fallback file. This keeps fallback content current rather than stale from the initial build. The frontend can import this JSON when the live API is unreachable.

### What Needs Doing
1. Create `scripts/regenerate-fallback.js`:
   - Node.js script (runs via system cron, not in the browser)
   - Fetches all 4 content types from Ghost Content API (portfolio, pricing-website, pricing-ai, site content pages)
   - Writes the responses to `js/fallback-content.json` as a structured JSON file
   - Handles errors gracefully - if Ghost is down, log a warning and do not overwrite the existing fallback file
   - Log success/failure to stdout for cron log capture
   - Include a timestamp in the JSON output so the frontend can display "last updated" if needed
2. Update `js/ghost-api.js` to import and use `fallback-content.json` when the live API returns `null`
3. Document the cron setup in a comment at the top of the script:
   ```
   # Run weekly: 0 3 * * 0 node /srv/skeleton/clients/skeleton-crew/public/scripts/regenerate-fallback.js
   ```

### Files
- `scripts/regenerate-fallback.js` (create)
- `js/fallback-content.json` (created by the script)
- `js/ghost-api.js` (modify - add fallback JSON import)

### How to Test
- Run the script manually: `node scripts/regenerate-fallback.js`
- Confirm `js/fallback-content.json` is created with valid JSON containing all content types.
- Confirm the JSON includes a `generatedAt` timestamp.
- Modify the Ghost API key to an invalid one and run again. Confirm the script logs a warning and does not overwrite the existing JSON file.
- In the browser, block Ghost API requests. Confirm the frontend loads content from the fallback JSON file.

### Unexpected Outcomes
- If the script runs in an environment without `fetch` (older Node.js), flag - may need `node-fetch` or a minimum Node version requirement.
- If the fallback JSON file is too large (>500KB), flag for discussion about trimming content.

### On Completion
Fallback system is complete and production-ready.
