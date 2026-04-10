## Task 011: Favicon Generation
**Phase:** 2 | **Agent:** Design
**Priority:** Medium | **Status:** TODO
**Est. Effort:** S | **Dependencies:** TASK-010

### Context
The favicon uses the skeleton character icon from the logo. Standard sizes needed for browser tabs, bookmarks, and mobile home screens.

### What Needs Doing
1. Using the `logo-icon.svg` skeleton character, generate:
   - `assets/favicon.ico` (multi-size ICO: 16x16, 32x32, 48x48)
   - `assets/favicon-32.png` (32x32 PNG)
   - `assets/favicon-16.png` (16x16 PNG)
   - `assets/apple-touch-icon.png` (180x180 PNG)
2. Ensure the icon reads clearly at 16x16 - simplify detail if necessary
3. Use neon green (`#00FF41`) on transparent background

### Files
- `assets/favicon.ico` (create)
- `assets/favicon-32.png` (create)
- `assets/favicon-16.png` (create)
- `assets/apple-touch-icon.png` (create)

### How to Test
- Set the favicon in a test HTML page using `<link rel="icon">` tags. View in Chrome, Firefox, and Safari.
- Confirm the icon is distinguishable at browser tab size.
- Confirm `apple-touch-icon.png` looks correct when added to iOS home screen (or simulated in a 180x180 preview).

### Unexpected Outcomes
- If the skeleton character is not recognizable at 16x16, flag for Design to produce a further-simplified icon variant.

### On Completion
Favicons are ready for inclusion in all HTML page `<head>` sections.
