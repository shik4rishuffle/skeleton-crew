## Task 004: Ghost CMS Content Seeding - Tags
**Phase:** 1 | **Agent:** Architect
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** none

### Context
All Ghost tags must exist before any content posts can be created. The frontend filtering depends on these exact tag slugs.

### What Needs Doing
1. Log into Ghost Admin at `https://cms-skeleton-crew.dev.skeleton-crew.co.uk/ghost`
2. Create the following tags:
   - `portfolio` (public tag) - name: "Portfolio", description: "Client portfolio entries"
   - `#pricing-website` (internal tag) - name: "#pricing-website"
   - `#pricing-ai` (internal tag) - name: "#pricing-ai"
   - `#tier-1` (internal tag) - name: "#tier-1"
   - `#tier-2` (internal tag) - name: "#tier-2"
   - `#tier-3` (internal tag) - name: "#tier-3"
3. Confirm internal tags are prefixed with `#` so they do not appear in public tag listings

### Files
- No code files - Ghost CMS admin only

### How to Test
- Navigate to Ghost Admin > Tags. Confirm all 6 tags exist.
- Navigate to the Internal tags tab. Confirm the 5 internal tags appear there.
- Hit the Content API: `GET /ghost/api/content/tags/?key=6a81932590f32d95416a5191a7` and confirm `portfolio` appears in the response. Internal tags should not appear in this public listing.

### Unexpected Outcomes
- If Ghost does not support internal tags in this version, flag immediately - the pricing tier sorting strategy needs revision.

### On Completion
Queue TASK-005 (Portfolio Content), TASK-006 (Pricing Content), TASK-007 (Site Content Pages).
