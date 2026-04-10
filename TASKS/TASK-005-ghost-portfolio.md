## Task 005: Ghost CMS Content Seeding - Portfolio Entry
**Phase:** 1 | **Agent:** Architect
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-004

### Context
At least one real portfolio entry must exist for frontend development and testing. The mushroom grow business is the first real client and should be seeded now.

### What Needs Doing
1. In Ghost Admin, create a new post:
   - Title: The mushroom grow business name (use the actual business name from the live site)
   - Tag: `portfolio`
   - Custom excerpt: One-line description of what was built for them
   - Feature image: Screenshot of the live site (take a screenshot and upload)
   - Canonical URL: URL of the live mushroom grow business site
   - Status: Published
2. Verify the post appears in a Content API query filtered by `tag:portfolio`

### Files
- No code files - Ghost CMS admin only

### How to Test
- Fetch `GET /ghost/api/content/posts/?key=6a81932590f32d95416a5191a7&filter=tag:portfolio&include=tags&fields=title,custom_excerpt,feature_image,canonical_url` and confirm the entry appears with all fields populated.
- Confirm `canonical_url` returns the external site URL.

### Unexpected Outcomes
- If `canonical_url` is not exposed via the Content API in this Ghost version, flag immediately - need an alternative field for storing external URLs.
- If the mushroom grow business details are not yet available, create a clearly-marked placeholder entry and flag for operator review.

### On Completion
Portfolio data is available for TASK-014 (Portfolio Section) and TASK-017 (Work Page).
