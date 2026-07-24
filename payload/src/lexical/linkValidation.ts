/**
 * URL-validation predicate for the restricted Lexical link drawer.
 *
 * Returns true when value is one of:
 *   - an absolute http(s) URL: `http://example.com/path` or `https://example.com`.
 *   - an internal path beginning with a single `/` but not `//` (the latter is a
 *     protocol-relative URL and is rejected to avoid scheme-confusion attacks).
 *
 * Returns false for everything else, including:
 *   - `javascript:alert(1)`     (XSS vector)
 *   - `data:text/html,<script>` (XSS vector)
 *   - `vbscript:msgbox(1)`      (legacy XSS vector)
 *   - `file:///etc/passwd`      (filesystem)
 *   - `mailto:x@y.z`            (Phase 1 reject; Paul's body copy doesn't currently
 *                                inline mailto links - team contact emails live in
 *                                dedicated TeamMembers / SiteSettings fields)
 *   - `tel:+44...`              (same Phase 1 reject as mailto)
 *   - bare `example.com`        (ambiguous; force editor to be explicit)
 *   - protocol-relative `//evil.com/...` (modern browsers fold these onto the parent
 *                                page's protocol; reject and force `https://`)
 *
 * Co-located with `restrictedToolbar.ts` so the predicate can be reused if a future
 * non-Lexical block needs the same URL rule, and so it's unit-testable in isolation.
 */
export const isValidLinkUrl = (value: string): boolean => {
  const trimmed = value.trim()
  if (trimmed === '') return false

  // Internal path: starts with a single '/', not '//'.
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//')
  }

  // Absolute URL - WHATWG parser rejects malformed strings and surfaces the
  // protocol in normalised form. Only http and https pass.
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
