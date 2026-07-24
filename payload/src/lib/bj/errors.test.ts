/**
 * Unit tests for `errorResponse` (B-10).
 *
 * Harness: Vitest. NOTE at write time the shared Payload does not yet have a
 * Vitest dev-dependency installed - that scaffold is owned by Phase 4
 * Foundation TASK-010. These tests are written to the contract documented
 * in `AGENTS/backend-task-006-plan.md` section 6.1 so they run unmodified
 * once the harness lands.
 *
 * Cases covered (15 total):
 *   1. Standard `Error` input - response shape (status, body, content-type)
 *   2. Standard `Error` input - log shape (prefix + context fields)
 *   3. Custom Error subclass - errName flows through
 *   4. String thrown - StringError name, no stack
 *   5. Plain object thrown - duck-typed message/name
 *   6. null / undefined thrown - String(err) fallback
 *   7. Circular object thrown - safeStringify fallback, no throw
 *   8. PII scrubbing in extraContext via logScrubbed integration
 *   9. PII in error message itself is logged verbatim (documented behaviour)
 *  10. All four LogArea values produce the right [BJ:<area>] prefix
 *  11. HTTP status passes through (400, 429, 500, 502)
 *  12. Body shape exactly matches architect doc
 *  13. Idempotent - two calls with same args produce two distinct Responses
 *  14. Caller extraContext cannot overwrite reserved keys
 *  15. logScrubbed throwing does not propagate
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from 'vitest'
import { errorResponse } from './errors'
import * as logModule from './log'

let errSpy: MockInstance<Parameters<typeof console.error>, void>

beforeEach(() => {
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Convenience: given a console.error spy, return the latest call's
// (prefixedMessage, scrubbedContext) tuple. logScrubbed at level 'error'
// routes to console.error. With a context arg it logs (msg, ctx); without
// one it logs (msg) only.
function lastErrorLog(): { msg: string; ctx: Record<string, unknown> | undefined } {
  expect(errSpy).toHaveBeenCalled()
  const call = errSpy.mock.calls[errSpy.mock.calls.length - 1]!
  const msg = call[0] as string
  const ctx = call[1] as Record<string, unknown> | undefined
  return { msg, ctx }
}

describe('errorResponse / response shape', () => {
  it('case 1: returns Response with supplied status, JSON body and content-type for an Error input', async () => {
    const resp = errorResponse(
      new Error('boom'),
      'checkout',
      'payment_service_unavailable',
      'Payment service unavailable',
      502,
    )
    expect(resp).toBeInstanceOf(Response)
    expect(resp.status).toBe(502)
    expect(resp.headers.get('Content-Type')).toContain('application/json')
    const body = await resp.json()
    expect(body).toEqual({
      error: {
        code: 'payment_service_unavailable',
        message: 'Payment service unavailable',
      },
    })
  })

  it('case 12: body shape is exactly { error: { code, message } } - no extra keys', async () => {
    const resp = errorResponse(
      new Error('x'),
      'membership',
      'invalid_request',
      'Invalid request',
      400,
    )
    const body = (await resp.json()) as Record<string, unknown>
    expect(Object.keys(body)).toEqual(['error'])
    const inner = body.error as Record<string, unknown>
    expect(Object.keys(inner).sort()).toEqual(['code', 'message'])
  })

  it('case 11: HTTP status passes through unmodified for 400/429/500/502', () => {
    for (const status of [400, 429, 500, 502]) {
      const r = errorResponse(new Error('x'), 'checkout', 'c', 'm', status)
      expect(r.status).toBe(status)
    }
  })

  it('case 13: two calls with the same args return two distinct Response objects with identical bodies', async () => {
    const a = errorResponse(new Error('x'), 'checkout', 'c', 'm', 500)
    const b = errorResponse(new Error('x'), 'checkout', 'c', 'm', 500)
    expect(a).not.toBe(b)
    expect(await a.json()).toEqual(await b.json())
  })
})

describe('errorResponse / log shape', () => {
  it('case 2: logs with [BJ:<area>] <userSafeCode> prefix and full context for a standard Error', () => {
    const e = new Error('detailed reason')
    errorResponse(e, 'checkout', 'payment_service_unavailable', 'Payment service unavailable', 502)
    const { msg, ctx } = lastErrorLog()
    expect(msg).toBe('[BJ:checkout] payment_service_unavailable')
    expect(ctx).toBeDefined()
    expect(ctx!.errName).toBe('Error')
    expect(ctx!.errMessage).toBe('detailed reason')
    expect(ctx!.httpStatus).toBe(502)
    // Stack present and references the test file (best-effort assertion -
    // V8 stacks always include the call frame).
    expect(typeof ctx!.err).toBe('string')
    expect(String(ctx!.err)).toContain('Error: detailed reason')
  })

  it('case 3: custom Error subclass keeps its constructor name in errName', () => {
    class StripeAPIError extends Error {
      constructor(message: string) {
        super(message)
        this.name = 'StripeAPIError'
      }
    }
    errorResponse(new StripeAPIError('boom'), 'stripe', 'payment_service_unavailable', 'Payment service unavailable', 502)
    const { ctx } = lastErrorLog()
    expect(ctx!.errName).toBe('StripeAPIError')
    expect(ctx!.errMessage).toBe('boom')
    expect(typeof ctx!.err).toBe('string')
  })

  it('case 4: bare string thrown becomes StringError with no stack', () => {
    errorResponse('plain string thrown', 'webhook', 'invalid_request', 'Invalid request', 400)
    const { ctx } = lastErrorLog()
    expect(ctx!.errName).toBe('StringError')
    expect(ctx!.errMessage).toBe('plain string thrown')
    expect(ctx!.err).toBeUndefined()
  })

  it('case 5: plain object thrown is duck-typed for message; name defaults to UnknownError', () => {
    errorResponse(
      { message: 'oops', code: 'X' },
      'webhook',
      'invalid_request',
      'Invalid request',
      400,
    )
    const { ctx } = lastErrorLog()
    expect(ctx!.errMessage).toBe('oops')
    expect(ctx!.errName).toBe('UnknownError')
    expect(ctx!.err).toBeUndefined()
  })

  it('case 6a: null thrown does not throw and surfaces "null" in errMessage', () => {
    expect(() =>
      errorResponse(null, 'webhook', 'invalid_request', 'Invalid request', 400),
    ).not.toThrow()
    const { ctx } = lastErrorLog()
    expect(ctx!.errMessage).toBe('null')
    expect(ctx!.errName).toBe('UnknownError')
    expect(ctx!.err).toBeUndefined()
  })

  it('case 6b: undefined thrown does not throw and surfaces "undefined" in errMessage', () => {
    expect(() =>
      errorResponse(undefined, 'webhook', 'invalid_request', 'Invalid request', 400),
    ).not.toThrow()
    const { ctx } = lastErrorLog()
    expect(ctx!.errMessage).toBe('undefined')
    expect(ctx!.errName).toBe('UnknownError')
  })

  it('case 7: circular object thrown does not crash the helper', () => {
    const c: Record<string, unknown> = {}
    c.self = c
    expect(() =>
      errorResponse(c, 'checkout', 'invalid_request', 'Invalid request', 400),
    ).not.toThrow()
    const { ctx } = lastErrorLog()
    // Without a `message` field, safeStringify is called; circular -> fallback.
    expect(ctx!.errMessage).toBe('[unserialisable]')
    expect(ctx!.errName).toBe('UnknownError')
  })

  it('case 10: each LogArea value produces the matching [BJ:<area>] prefix', () => {
    const areas: Array<logModule.LogArea> = ['checkout', 'webhook', 'membership', 'stripe']
    for (const area of areas) {
      errSpy.mockClear()
      errorResponse(new Error('x'), area, 'invalid_request', 'Invalid request', 400)
      const { msg } = lastErrorLog()
      expect(msg).toBe(`[BJ:${area}] invalid_request`)
    }
  })
})

describe('errorResponse / extraContext integration with logScrubbed', () => {
  it('case 8: PII keys in extraContext are scrubbed by logScrubbed; non-PII passes through', () => {
    errorResponse(
      new Error('boom'),
      'checkout',
      'payment_service_unavailable',
      'Payment service unavailable',
      502,
      {
        donorEmail: 'a@b.c',
        amount: 1000,
        customer_email: 'x@y.z',
        stripeSessionId: 'cs_test_123',
      },
    )
    const { ctx } = lastErrorLog()
    expect(ctx!.donorEmail).toBe('[scrubbed]')
    expect(ctx!.customer_email).toBe('[scrubbed]')
    expect(ctx!.amount).toBe(1000)
    expect(ctx!.stripeSessionId).toBe('cs_test_123')
  })

  it('case 9: PII embedded in err.message is logged verbatim (documented: scrubber operates on keys, not values)', () => {
    errorResponse(
      new Error('failed for donor a@b.c'),
      'checkout',
      'payment_service_unavailable',
      'Payment service unavailable',
      502,
    )
    const { ctx } = lastErrorLog()
    // Pinned behaviour - if value-level scrubbing is ever required, that is
    // an amendment to TASK-005, not a defect in this helper.
    expect(ctx!.errMessage).toBe('failed for donor a@b.c')
  })

  it('case 14: caller-supplied extraContext cannot overwrite reserved keys (err / errMessage / errName / httpStatus)', () => {
    errorResponse(
      new Error('real error'),
      'checkout',
      'invalid_request',
      'Invalid request',
      500,
      {
        err: 'PWNED_STACK',
        errMessage: 'PWNED_MSG',
        errName: 'PWNED_NAME',
        httpStatus: 999,
        // also include a real, allowable extra to confirm it survives
        amount: 1000,
      },
    )
    const { ctx } = lastErrorLog()
    expect(ctx!.errMessage).toBe('real error')
    expect(ctx!.errName).toBe('Error')
    expect(ctx!.httpStatus).toBe(500)
    expect(typeof ctx!.err).toBe('string')
    expect(String(ctx!.err)).toContain('Error: real error')
    expect(ctx!.amount).toBe(1000)
  })
})

describe('errorResponse / defensive', () => {
  it('case 15: a throwing logScrubbed does not propagate; helper still returns a valid Response', async () => {
    const stub = vi
      .spyOn(logModule, 'logScrubbed')
      .mockImplementation(() => {
        throw new Error('log crashed')
      })
    try {
      const resp = errorResponse(
        new Error('x'),
        'checkout',
        'invalid_request',
        'Invalid request',
        400,
      )
      expect(resp.status).toBe(400)
      const body = await resp.json()
      expect(body).toEqual({
        error: { code: 'invalid_request', message: 'Invalid request' },
      })
      // Fallback console.error from the catch should have fired.
      const fallback = errSpy.mock.calls.find(
        (c) => typeof c[0] === 'string' && (c[0] as string).includes('[BJ:errors] logScrubbed failed'),
      )
      expect(fallback).toBeDefined()
    } finally {
      stub.mockRestore()
    }
  })
})
