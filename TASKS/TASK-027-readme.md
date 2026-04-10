## Task 027: README Documentation
**Phase:** 7 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-026

### Context
The README is for a developer audience. It must cover all operational tasks: API key replacement, form handler setup, accent colour swapping, adding portfolio entries, and deployment.

### What Needs Doing
1. Create `README.md` in the project root (`public/`):
   - **Overview**: What this site is and how it works (static HTML/CSS/JS + Ghost Content API)
   - **Quick start**: How to get it running locally (just open `index.html` or use a local server)
   - **Configuration**:
     - How to replace the Ghost Content API key (which file, which constant)
     - How to replace the form handler ID (which file, what to replace)
     - How to swap the accent colour for a different client (edit `variables.css`, list the relevant custom properties)
   - **Content management**:
     - How to add a new portfolio entry in Ghost (create post, tag it, set fields)
     - How to edit pricing tiers in Ghost (find the posts, edit body HTML)
     - How to edit site copy (hero, CTA, etc.) in Ghost (find the pages by slug)
   - **Deployment**: `skeleton deploy skeleton-crew`
   - **Fallback content**: How the regeneration script works, cron setup
   - **Toggle demo**: How it works, how to update `before.css` when adding new components, how to run the test script
   - **File structure**: Brief explanation of the folder layout
2. No lorem ipsum, no filler. Developer-grade, concise.
3. Mark any placeholders clearly: `[FORM_HANDLER_ID]`, `[OPERATOR: replace]`

### Files
- `README.md` (create)

### How to Test
- A developer unfamiliar with the project reads the README and can:
  - Find and replace the API key
  - Find and replace the form handler ID
  - Change the accent colour
  - Add a portfolio entry in Ghost
  - Deploy the site
- No broken internal references (file paths mentioned in README actually exist).

### Unexpected Outcomes
- None anticipated.

### On Completion
Documentation is complete. Queue TASK-028 (Final QA).
