/**
 * Unit tests for `isValidLinkUrl`.
 *
 * Harness: Vitest. NOTE at write time the shared Payload does not yet have a
 * Vitest dev-dependency installed - that scaffold is owned by Wave 3 TASK-010.
 * These tests are written to the contract documented in
 * `AGENTS/cms-task-002-plan.md` section 4.3 so they run unmodified once the
 * harness lands. Same precedent as the TASK-004 / TASK-005 test files already
 * sitting in `src/lib/middleware/`.
 *
 * Acceptance-criterion coverage from TASK-002 "How to Test":
 *   - Test 4: `javascript:alert(1)` -> rejected.
 *
 * Plus the broader scheme-rejection contract documented in the predicate's JSDoc.
 */

import { describe, it, expect } from 'vitest'
import { isValidLinkUrl } from './linkValidation'

describe('isValidLinkUrl - allowed URL forms', () => {
  it('allows an absolute https URL', () => {
    expect(isValidLinkUrl('https://example.com')).toBe(true)
  })

  it('allows an absolute http URL', () => {
    expect(isValidLinkUrl('http://example.com')).toBe(true)
  })

  it('allows an https URL with path, query and fragment', () => {
    expect(isValidLinkUrl('https://example.com/path/to/page?q=1#frag')).toBe(true)
  })

  it('allows an internal path beginning with a single /', () => {
    expect(isValidLinkUrl('/our-work')).toBe(true)
  })

  it('allows a deep internal path', () => {
    expect(isValidLinkUrl('/topics/safeguarding-children/research')).toBe(true)
  })

  it('allows the root path /', () => {
    expect(isValidLinkUrl('/')).toBe(true)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isValidLinkUrl('  https://example.com  ')).toBe(true)
    expect(isValidLinkUrl('  /our-work  ')).toBe(true)
  })
})

describe('isValidLinkUrl - rejected XSS / scheme-confusion vectors', () => {
  it('rejects javascript: URI (Test 4 from TASK-002 spec)', () => {
    expect(isValidLinkUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects data: URI', () => {
    expect(isValidLinkUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('rejects vbscript: URI', () => {
    expect(isValidLinkUrl('vbscript:msgbox(1)')).toBe(false)
  })

  it('rejects file: URI', () => {
    expect(isValidLinkUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects javascript: with whitespace padding', () => {
    expect(isValidLinkUrl('  javascript:alert(1)  ')).toBe(false)
  })
})

describe('isValidLinkUrl - rejected by Phase 1 policy', () => {
  it('rejects mailto: (Phase 1 policy; revisit if needed)', () => {
    expect(isValidLinkUrl('mailto:hello@example.com')).toBe(false)
  })

  it('rejects tel: (Phase 1 policy; revisit if needed)', () => {
    expect(isValidLinkUrl('tel:+441234567890')).toBe(false)
  })
})

describe('isValidLinkUrl - rejected ambiguous / malformed inputs', () => {
  it('rejects an empty string', () => {
    expect(isValidLinkUrl('')).toBe(false)
  })

  it('rejects whitespace-only input', () => {
    expect(isValidLinkUrl('   ')).toBe(false)
  })

  it('rejects bare domain (no scheme)', () => {
    expect(isValidLinkUrl('example.com')).toBe(false)
  })

  it('rejects protocol-relative // URLs (force explicit https)', () => {
    expect(isValidLinkUrl('//evil.com/path')).toBe(false)
  })

  it('rejects garbage strings', () => {
    expect(isValidLinkUrl('not a url at all')).toBe(false)
  })

  it('rejects ftp://', () => {
    expect(isValidLinkUrl('ftp://example.com/file.zip')).toBe(false)
  })

  it('rejects ws://', () => {
    expect(isValidLinkUrl('ws://example.com')).toBe(false)
  })
})
