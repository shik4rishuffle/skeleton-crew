## Task 022: Contact Page
**Phase:** 5 | **Agent:** Frontend
**Priority:** Medium | **Status:** TODO
**Est. Effort:** M | **Dependencies:** TASK-012, TASK-020

### Context
Contact page with Web3Forms AJAX submission. The form handler ID is a placeholder replaced by the operator before deploy.

### What Needs Doing
1. Create `contact/index.html`:
   - Same `<head>` setup as homepage
   - Reuse nav and footer markup
   - Short hero: "Let's talk." - nothing more
   - Form with fields: Name (required), Business name, Email (required), "What do you need?" (select with 4 options), "Anything else?" (textarea, optional)
   - Hidden fields: `access_key` with `[FORM_HANDLER_ID]` placeholder, `subject`, `from_name`, honeypot `botcheck`
   - Submit button
   - Status div with `role="status"` and `aria-live="polite"`
   - Below form: "Prefer email? f0xy_shambles@proton.me" (operator replaces before launch)
2. Create `js/contact-form.js`:
   - AJAX submission via `fetch` POST to `https://api.web3forms.com/submit`
   - JSON body from FormData
   - Disable button and show "Sending..." during submission
   - Success: show inline message, reset form
   - Error: show inline error message with email fallback
   - Re-enable button after completion
3. Create `css/components/contact.css` for form styles:
   - Input/select/textarea styles consistent with brand (dark surface background, light text, neon green focus border)
   - Error and success message styles

### Files
- `contact/index.html` (create)
- `js/contact-form.js` (create)
- `css/components/contact.css` (create)

### How to Test
- Navigate to `/contact/`. Form renders correctly with all fields.
- Submit with empty required fields: browser validation prevents submission.
- Submit with valid data but placeholder API key: Web3Forms returns an error - error message displays inline, no redirect.
- Form field focus states show neon green border.
- Form is keyboard navigable (Tab through all fields, Enter submits).
- Select dropdown shows all 4 options.
- Status message has `aria-live="polite"` for screen reader announcement.
- Email fallback text is visible below the form.

### Unexpected Outcomes
- If Web3Forms rejects the submission format, flag the specific error response. The AJAX pattern may need `Content-Type: application/json` vs `multipart/form-data` adjustment.

### On Completion
Contact page is complete. Operator must replace `[FORM_HANDLER_ID]` before deploy.
