## Task 028: Final QA and Performance Audit
**Phase:** 7 | **Agent:** Frontend
**Priority:** High | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-025, TASK-026, TASK-027

### Context
Final verification that the site meets all success criteria before handoff. Lighthouse audit, accessibility check, and toggle demo completeness.

### What Needs Doing
1. Run Lighthouse audit on all 4 pages. Target: Performance >85, Accessibility >90, Best Practices >90, SEO >90.
2. Fix any issues that bring scores below targets:
   - Performance: image optimization, render-blocking resources, unused CSS
   - Accessibility: missing alt text, contrast ratios, ARIA attributes, focus management
   - SEO: meta descriptions, heading hierarchy, canonical URLs
3. Run the before-mode test script (`node scripts/test-before-mode.js`). Must pass.
4. Test Ghost API fallback: block Ghost API in DevTools Network panel. Confirm site renders with fallback content on all pages.
5. Validate HTML on all pages (W3C validator).
6. Check for console errors on all pages (both with Ghost available and unavailable).
7. Confirm no dead code, no commented-out blocks, no TODO comments left in shipped code.
8. Confirm all `[OPERATOR: ...]` and `[FORM_HANDLER_ID]` placeholders are clearly marked and documented in README.

### Files
- Multiple files (modify as needed to fix issues found)

### How to Test
- Lighthouse scores meet targets on all pages.
- Before-mode test script outputs "PASS".
- Site renders correctly with Ghost blocked.
- W3C validation passes with no errors (warnings acceptable).
- No console errors on any page in any state.
- `grep -r "TODO\|FIXME\|HACK" --include="*.js" --include="*.css" --include="*.html"` returns no results (excluding README and scripts).

### Unexpected Outcomes
- If Lighthouse Performance scores are below 85 due to Google Fonts loading, flag - may need to subset fonts or use `font-display: optional`.
- If accessibility audit reveals structural issues (heading order, landmark regions), flag specific issues rather than restructuring pages autonomously.

### On Completion
Site is ready for operator review and deployment. Signal completion to the orchestrator.
