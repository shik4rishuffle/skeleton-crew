## Task 026: Cross-Page Integration and Link Verification
**Phase:** 7 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-017, TASK-018, TASK-022

### Context
All pages are built. Now verify they work together as a cohesive site - navigation between pages, consistent styling, shared components rendering identically.

### What Needs Doing
1. Click every link on every page and confirm it navigates correctly:
   - Nav links: Work, Services, Contact (from every page)
   - Logo link back to homepage (from every page)
   - Homepage CTAs: "See our work" to /work/, "Get a quote" to /contact/
   - Portfolio "See all work" to /work/
   - Pricing "See all services" to /services/
   - CTA strip button to /contact/
   - Footer nav links
   - Portfolio card external links (open in new tab)
2. Confirm nav, footer, and global styles are identical across all pages
3. Confirm Ghost API integration works on all pages (portfolio on /work/, pricing on /services/, site content on homepage)
4. Confirm favicon appears on all pages
5. Confirm page titles and meta descriptions are set appropriately per page

### Files
- All HTML files (modify if needed - fix broken links, missing meta tags)

### How to Test
- Navigate through the entire site clicking every link. No 404s, no broken paths.
- Compare nav and footer visually across all 4 pages - they must be pixel-identical.
- Ghost content loads on all pages that use it.
- Browser tab shows favicon and appropriate page title on each page.

### Unexpected Outcomes
- If relative paths break when navigating between `/work/` and `/` (e.g., CSS paths), flag - may need to use absolute paths from root.

### On Completion
Site integration is verified. Queue TASK-027 (README).
