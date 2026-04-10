## Task 021: Before-Mode Test Script
**Phase:** 6 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-009, TASK-025

### Context
A test script verifies that every styled element in the main CSS has a corresponding `.before-mode` rule in `before.css`. This ensures the toggle demo is comprehensive - no element should be unstyled in either state.

### What Needs Doing
1. Create `scripts/test-before-mode.js`:
   - Parse all component CSS files and extract selectors
   - Parse `css/before.css` and extract all `.before-mode` scoped selectors
   - For each significant selector in the main CSS (skip utility classes, keyframes, media queries), check that a corresponding `.before-mode` rule exists
   - Report: list of selectors missing from `before.css`
   - Exit code 0 if all selectors are covered, exit code 1 if any are missing
2. The script runs in Node.js (not the browser)
3. Add clear output: "PASS: All N selectors covered" or "FAIL: M selectors missing from before.css" with the list

### Files
- `scripts/test-before-mode.js` (create)

### How to Test
- Run `node scripts/test-before-mode.js`. If the before CSS is comprehensive, output is "PASS".
- Temporarily remove a rule from `before.css`. Run the script again. It reports the missing selector and exits with code 1.
- Add the rule back. Script passes again.

### Unexpected Outcomes
- If CSS parsing in Node.js is complex (nested selectors, custom properties), flag if a simpler heuristic approach is sufficient (e.g., checking class names rather than full selector matching).
- If some selectors intentionally should not have a before-mode override (e.g., utility classes), document the exclusion list in the script.

### On Completion
The toggle demo has verified coverage. The test can be run before any deploy.
