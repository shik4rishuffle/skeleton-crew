## Task 003: Vendor GSAP Files
**Phase:** 1 | **Agent:** Architect
**Priority:** High | **Status:** TODO
**Est. Effort:** S | **Dependencies:** none

### Context
GSAP must be self-hosted to eliminate CDN dependency. The animation system (TASK-019) and toggle demo (TASK-009) both depend on these files being available locally.

### What Needs Doing
1. Download `gsap.min.js` and `ScrollTrigger.min.js` from the GSAP CDN or npm package (free tier, standard license)
2. Place both files in `js/vendor/`
3. Verify the files are the latest stable release (3.x line)
4. Add a comment at the top of each file noting the version and download date for future reference

### Files
- `js/vendor/gsap.min.js` (create)
- `js/vendor/ScrollTrigger.min.js` (create)

### How to Test
- Create a minimal HTML page that includes both scripts via `<script src="js/vendor/gsap.min.js">` and `<script src="js/vendor/ScrollTrigger.min.js">`. Open browser console and confirm `gsap` and `ScrollTrigger` are defined on `window`.
- Confirm file sizes are reasonable (gsap.min.js ~70-90KB, ScrollTrigger ~30-40KB).

### Unexpected Outcomes
- If the GSAP free license terms have changed since the architecture was approved, flag immediately. Do not vendor files with incompatible licensing.

### On Completion
GSAP is available for all animation tasks (TASK-009, TASK-019).
