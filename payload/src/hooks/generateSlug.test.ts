/**
 * Unit tests for `generateSlug` and the `slugify` helper.
 *
 * Harness: Vitest. NOTE at write time the shared Payload does not yet have a
 * Vitest dev-dependency installed - that scaffold is owned by Wave 3 TASK-010.
 * These tests are written to the contract documented in
 * `AGENTS/cms-task-002-plan.md` sections 3 + 5 so they run unmodified once the
 * harness lands. Same precedent as the TASK-004 / TASK-005 test files already
 * sitting in `src/lib/middleware/`.
 *
 * Acceptance-criterion coverage from TASK-002 "How to Test":
 *   - Test 1: "Safeguarding Children" -> 'safeguarding-children'         (slugify)
 *   - Test 2: second same-named topic -> 'safeguarding-children-2'       (collision)
 *
 * Plus collision-strategy edge cases:
 *   - Third row -> '-3', non-blocking when a `-2` slug already exists
 *   - `update` operation excludes own id from the collision lookup
 *   - User-supplied slug short-circuits when alwaysRegenerate=false
 *   - alwaysRegenerate=true overrides
 *   - Empty / non-ASCII source returns data unchanged
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateSlug, slugify } from './generateSlug'

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------

describe('slugify', () => {
  it('lowercases and hyphenates a simple two-word string', () => {
    expect(slugify('Safeguarding Children')).toBe('safeguarding-children')
  })

  it('collapses internal whitespace runs to one hyphen', () => {
    expect(slugify('Hello   World')).toBe('hello-world')
  })

  it('strips punctuation', () => {
    expect(slugify("It's a test, really!")).toBe('its-a-test-really')
  })

  it('drops accents via NFKD decomposition (free Latin transliteration)', () => {
    // NFKD splits composed accents into base char + combining mark. The strip
    // drops the combining mark but keeps the ASCII base. `Café` -> `cafe`,
    // `naïve` -> `naive`. (Non-Latin scripts have no ASCII fallback and are
    // stripped entirely - see the next case.)
    expect(slugify('Café')).toBe('cafe')
    expect(slugify('naïve')).toBe('naive')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello')
  })

  it('collapses multiple consecutive hyphens', () => {
    expect(slugify('hello--world---again')).toBe('hello-world-again')
  })

  it('returns empty string for all-non-ASCII input', () => {
    expect(slugify('日本語')).toBe('')
  })

  it('preserves digits', () => {
    expect(slugify('Topic 2024 Update')).toBe('topic-2024-update')
  })
})

// ---------------------------------------------------------------------------
// generateSlug factory
// ---------------------------------------------------------------------------

/**
 * Minimal mock of the Payload hook arg shape. The hook only reads
 * `req.payload.find` and `collection.slug`; everything else is type satisfaction.
 */
type MockExisting = Array<Record<string, unknown>>

const makeReq = (existing: MockExisting) => ({
  payload: {
    find: vi.fn(async () => ({ docs: existing })),
  },
})

const makeCollection = (slug = 'bj-topics') => ({ slug })

describe('generateSlug factory - test 1 (single row)', () => {
  it('auto-fills slug from name on create when no slug provided', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])
    const data: Record<string, unknown> = { name: 'Safeguarding Children' }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBe('safeguarding-children')
  })
})

describe('generateSlug factory - test 2 (collision -> -2, -3)', () => {
  it('appends -2 when base slug already exists', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([{ slug: 'safeguarding-children' }])
    const data: Record<string, unknown> = { name: 'Safeguarding Children' }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBe('safeguarding-children-2')
  })

  it('appends -3 when base and -2 already exist', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([
      { slug: 'safeguarding-children' },
      { slug: 'safeguarding-children-2' },
    ])
    const data: Record<string, unknown> = { name: 'Safeguarding Children' }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBe('safeguarding-children-3')
  })

  it('finds the lowest unused suffix even with gaps', async () => {
    // base + -3 + -4 exist but -2 does not: the next slug is -2.
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([
      { slug: 'safeguarding-children' },
      { slug: 'safeguarding-children-3' },
      { slug: 'safeguarding-children-4' },
    ])
    const data: Record<string, unknown> = { name: 'Safeguarding Children' }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBe('safeguarding-children-2')
  })
})

describe('generateSlug factory - update operation', () => {
  it('excludes own id from the collision lookup so renaming-to-itself is a no-op', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])
    const data: Record<string, unknown> = { name: 'Safeguarding Children' }
    const originalDoc = { id: 'doc-123', name: 'Safeguarding Children', slug: '' }

    await hook({
      data,
      operation: 'update',
      originalDoc: originalDoc as never,
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect(req.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not_equals: 'doc-123' },
        }),
      }),
    )
  })

  it('does not add the id-exclusion clause on create', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])
    const data: Record<string, unknown> = { name: 'Safeguarding Children' }

    await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    const callArgs = req.payload.find.mock.calls[0]?.[0] as { where: Record<string, unknown> }
    expect(callArgs.where).not.toHaveProperty('id')
  })
})

describe('generateSlug factory - editor-supplied slug short-circuit', () => {
  it('does NOT regenerate when slug is already populated and alwaysRegenerate is false', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])
    const data: Record<string, unknown> = {
      name: 'Safeguarding Children',
      slug: 'custom-editor-slug',
    }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBe('custom-editor-slug')
    // No collision query should have been made.
    expect(req.payload.find).not.toHaveBeenCalled()
  })

  it('DOES regenerate when alwaysRegenerate is true', async () => {
    const hook = generateSlug({ sourceField: 'name', alwaysRegenerate: true })
    const req = makeReq([])
    const data: Record<string, unknown> = {
      name: 'Safeguarding Children',
      slug: 'custom-editor-slug',
    }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBe('safeguarding-children')
  })
})

describe('generateSlug factory - degenerate inputs', () => {
  it('returns data unchanged when source field is missing', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])
    const data: Record<string, unknown> = {}

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBeUndefined()
  })

  it('returns data unchanged when source field is empty string', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])
    const data: Record<string, unknown> = { name: '' }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).slug).toBeUndefined()
  })

  it('returns data unchanged when source slugifies to empty (e.g. all non-ASCII)', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])
    const data: Record<string, unknown> = { name: '日本語' }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    // Lets the field's `required` validator surface a plain-English error
    // rather than writing an empty slug.
    expect((out as Record<string, unknown>).slug).toBeUndefined()
  })

  it('returns data unchanged when data is null/undefined', async () => {
    const hook = generateSlug({ sourceField: 'name' })
    const req = makeReq([])

    const out = await hook({
      data: undefined,
      operation: 'create',
      req: req as never,
      collection: makeCollection() as never,
      context: {} as never,
    })

    expect(out).toBeUndefined()
  })
})

describe('generateSlug factory - custom slugField', () => {
  it('writes to a non-default slug field name when configured', async () => {
    const hook = generateSlug({ sourceField: 'title', slugField: 'permalink' })
    const req = makeReq([])
    const data: Record<string, unknown> = { title: 'Annual Report 2024' }

    const out = await hook({
      data,
      operation: 'create',
      req: req as never,
      collection: makeCollection('bj-research-papers') as never,
      context: {} as never,
    })

    expect((out as Record<string, unknown>).permalink).toBe('annual-report-2024')
    expect((out as Record<string, unknown>).slug).toBeUndefined()
  })
})
