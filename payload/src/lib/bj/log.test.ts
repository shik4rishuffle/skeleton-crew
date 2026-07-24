/**
 * Unit tests for `logScrubbed` (TASK-005 / B-09).
 *
 * Ported by QA TASK-010 from the inline tsx harness recorded in
 * `AGENTS/backend-task-005-output.md` section 6 (17 cases, 52 assertions,
 * all passing). The helper itself (`log.ts`) is FROZEN under TASK-010 -
 * only the test file is written here.
 *
 * Cases covered:
 *   1. Prefix application across all 4 areas / 4 levels + console-method routing
 *   2. Empty / undefined context (no second console arg, scrubbedContext === {})
 *   3. Flat scrub of all 18 listed keys -> all values masked
 *   4. Pass-through allowlist (id, type, stripeSessionId, amount, currency, status, livemode, tenant, isRecurring)
 *   5. Mixed shape (customer_email masked, eventType / sessionId / amount_total preserved)
 *   6. Real Stripe `checkout.session.completed` shape
 *   7. PII at depth 5 (email masked, sibling id preserved)
 *   8. Array of objects (subscription items / line_items shape)
 *   9. Cycle detection (a.self = a)
 *  10. Max depth (15-deep object)
 *  11. Max nodes (6000-leaf object)
 *  12. Non-plain objects pass through (Date, Error - same instance)
 *  13. Falsy primitives preserved (null, undefined, 0, '', false)
 *  14. `customer` as string id (pass-through)
 *  15. `customer` as expanded object (id + livemode preserved, email + name masked)
 *  16. Honeypot / membership shape (ip + honeypotFilled preserved, fullName + email + motivation masked)
 *  17. Stack trace + error code (B-10 handleError shape)
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
import { logScrubbed, type LogArea, type LogLevel } from './log'

// Spy holders for each console method so we can assert routing per level.
let logSpy: MockInstance
let infoSpy: MockInstance
let warnSpy: MockInstance
let errorSpy: MockInstance

beforeEach(() => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Case 1: prefix + level routing
// ---------------------------------------------------------------------------
describe('logScrubbed / prefix + level routing (case 1)', () => {
  it('applies [BJ:<area>] prefix for every area and routes to the right console method', () => {
    const areas: LogArea[] = ['checkout', 'webhook', 'membership', 'stripe']
    const levels: LogLevel[] = ['info', 'warn', 'error', 'debug']

    for (const area of areas) {
      for (const level of levels) {
        const result = logScrubbed(level, area, 'msg')
        expect(result.prefixedMessage).toBe(`[BJ:${area}] msg`)
      }
    }

    // Each level routes to its dedicated console method:
    //   debug -> console.log (Node has no distinct console.debug)
    //   info  -> console.info
    //   warn  -> console.warn
    //   error -> console.error
    expect(logSpy).toHaveBeenCalled()
    expect(infoSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Case 2: undefined context
// ---------------------------------------------------------------------------
describe('logScrubbed / undefined context (case 2)', () => {
  it('logs the message only (no second console arg) and returns scrubbedContext === {}', () => {
    const result = logScrubbed('info', 'checkout', 'msg only')
    expect(result.scrubbedContext).toEqual({})

    // console.info called with one arg only.
    const lastCall = infoSpy.mock.calls[infoSpy.mock.calls.length - 1]
    expect(lastCall).toBeDefined()
    expect(lastCall!.length).toBe(1)
    expect(lastCall![0]).toBe('[BJ:checkout] msg only')
  })
})

// ---------------------------------------------------------------------------
// Case 3: flat scrub of the full key list
// ---------------------------------------------------------------------------
describe('logScrubbed / flat scrub (case 3)', () => {
  it('masks every value under a key in the SCRUB_KEYS set', () => {
    const ctx = {
      // brief-listed
      email: 'a@b.c',
      fullName: 'Alice',
      donorName: 'A',
      donorEmail: 'a@b.c',
      customer_email: 'a@b.c',
      receipt_email: 'a@b.c',
      motivation: 'long form text',
      relevantExperience: 'long form text',
      // added from Stripe webhook audit
      name: 'A',
      phone: '+44 7700 900000',
      customer_name: 'A',
      customer_phone: '+44 7700 900001',
      address: { line1: '1 Test St', postal_code: 'SW1A 1AA' },
      customer_address: { line1: '2 Test St' },
      shipping_details: { name: 'A', address: {} },
      billing_details: { name: 'A' },
      customer_details: { email: 'a@b.c' },
      account_name: 'BANK NAME',
    }

    const { scrubbedContext } = logScrubbed('info', 'checkout', 'flat scrub', ctx)

    for (const key of Object.keys(ctx)) {
      expect(scrubbedContext[key]).toBe('[scrubbed]')
    }
  })
})

// ---------------------------------------------------------------------------
// Case 4: pass-through allowlist
// ---------------------------------------------------------------------------
describe('logScrubbed / pass-through allowlist (case 4)', () => {
  it('keeps Stripe ids, event metadata, currency, amounts, tenant, isRecurring intact', () => {
    const ctx = {
      id: 'evt_abc',
      type: 'checkout.session.completed',
      stripeSessionId: 'cs_test_xyz',
      amount: 5000,
      currency: 'gbp',
      status: 'succeeded',
      livemode: false,
      tenant: 'betterjustice',
      isRecurring: '0',
    }
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'pass-through', ctx)
    expect(scrubbedContext).toEqual(ctx)
  })
})

// ---------------------------------------------------------------------------
// Case 5: mixed scrub + pass-through
// ---------------------------------------------------------------------------
describe('logScrubbed / mixed shape (case 5)', () => {
  it('masks PII keys and preserves siblings in the same object', () => {
    const ctx = {
      customer_email: 'a@b.c',
      eventType: 'checkout.session.completed',
      sessionId: 'cs_test_123',
      amount_total: 5000,
    }
    const { scrubbedContext } = logScrubbed('info', 'checkout', 'mixed', ctx)
    expect(scrubbedContext.customer_email).toBe('[scrubbed]')
    expect(scrubbedContext.eventType).toBe('checkout.session.completed')
    expect(scrubbedContext.sessionId).toBe('cs_test_123')
    expect(scrubbedContext.amount_total).toBe(5000)
  })
})

// ---------------------------------------------------------------------------
// Case 6: real Stripe checkout.session.completed shape
// ---------------------------------------------------------------------------
describe('logScrubbed / real Stripe shape (case 6)', () => {
  it('descends through data.object and masks customer_details whole-subtree', () => {
    const ctx = {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_x',
          object: 'checkout.session',
          amount_total: 5000,
          currency: 'gbp',
          customer_details: {
            email: 'donor@x.com',
            name: 'Alice',
            phone: '+44 7700 900000',
            address: { line1: '1 X St', postal_code: 'SW1' },
          },
          metadata: { tenant: 'betterjustice', isRecurring: '0', interval: '' },
          payment_intent: 'pi_xxx',
        },
      },
    }
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'webhook event', ctx)

    // top-level event metadata preserved
    expect(scrubbedContext.id).toBe('evt_1')
    expect(scrubbedContext.type).toBe('checkout.session.completed')

    const obj = (scrubbedContext.data as Record<string, unknown>).object as Record<string, unknown>
    expect(obj.id).toBe('cs_test_x')
    expect(obj.object).toBe('checkout.session')
    expect(obj.amount_total).toBe(5000)
    expect(obj.currency).toBe('gbp')
    // whole subtree masked, NOT descended into:
    expect(obj.customer_details).toBe('[scrubbed]')
    // metadata preserved verbatim
    expect(obj.metadata).toEqual({
      tenant: 'betterjustice',
      isRecurring: '0',
      interval: '',
    })
    // string payment_intent preserved
    expect(obj.payment_intent).toBe('pi_xxx')
  })
})

// ---------------------------------------------------------------------------
// Case 7: PII at depth 5
// ---------------------------------------------------------------------------
describe('logScrubbed / PII at depth (case 7)', () => {
  it('masks email even when nested 5 levels deep, sibling id preserved', () => {
    const ctx = {
      a: { b: { c: { d: { e: { id: 'cs_test_x', email: 'a@b.c' } } } } },
    }
    const { scrubbedContext } = logScrubbed('info', 'checkout', 'deep', ctx)
    const leaf = (((((scrubbedContext.a as Record<string, unknown>).b as Record<string, unknown>)
      .c as Record<string, unknown>).d as Record<string, unknown>).e as Record<string, unknown>)
    expect(leaf.email).toBe('[scrubbed]')
    expect(leaf.id).toBe('cs_test_x')
  })
})

// ---------------------------------------------------------------------------
// Case 8: array of objects
// ---------------------------------------------------------------------------
describe('logScrubbed / array of objects (case 8)', () => {
  it('walks arrays and masks PII inside each element', () => {
    const ctx = {
      items: {
        data: [
          {
            price: { unit_amount: 2000, recurring: { interval: 'month' } },
            customer: { id: 'cus_abc', email: 'a@b.c' },
          },
        ],
      },
    }
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'array', ctx)
    const data = ((scrubbedContext.items as Record<string, unknown>).data as Array<
      Record<string, unknown>
    >)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(1)
    const item = data[0]!
    const price = item.price as Record<string, unknown>
    expect(price.unit_amount).toBe(2000)
    expect((price.recurring as Record<string, unknown>).interval).toBe('month')
    const customer = item.customer as Record<string, unknown>
    expect(customer.id).toBe('cus_abc')
    expect(customer.email).toBe('[scrubbed]')
  })
})

// ---------------------------------------------------------------------------
// Case 9: cycle detection
// ---------------------------------------------------------------------------
describe('logScrubbed / cycle detection (case 9)', () => {
  it('does not throw on a.self = a; emits "[circular]"', () => {
    const c: Record<string, unknown> = { id: 'evt_x' }
    c.self = c
    expect(() => logScrubbed('info', 'webhook', 'cycle', c)).not.toThrow()
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'cycle', c)
    expect(scrubbedContext.id).toBe('evt_x')
    expect(scrubbedContext.self).toBe('[circular]')
  })
})

// ---------------------------------------------------------------------------
// Case 10: max depth
// ---------------------------------------------------------------------------
describe('logScrubbed / max depth (case 10)', () => {
  it('replaces beyond MAX_DEPTH (12) with "[max-depth]"', () => {
    // Build a 15-deep nested object: { d: { d: { ... } } }
    let leaf: Record<string, unknown> = { id: 'leaf' }
    for (let i = 0; i < 15; i++) {
      leaf = { d: leaf }
    }
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'deep', leaf)
    // Walk down and confirm a "[max-depth]" sentinel appears somewhere in the chain.
    let cursor: unknown = scrubbedContext
    let maxDepthHit = false
    for (let i = 0; i < 20; i++) {
      if (cursor === '[max-depth]') {
        maxDepthHit = true
        break
      }
      if (typeof cursor !== 'object' || cursor === null) break
      cursor = (cursor as Record<string, unknown>).d
    }
    expect(maxDepthHit).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Case 11: max nodes
// ---------------------------------------------------------------------------
describe('logScrubbed / max nodes (case 11)', () => {
  it('replaces beyond MAX_NODES (5000) with "[truncated]"', () => {
    // Build a flat object with 6000 keys.
    const big: Record<string, unknown> = {}
    for (let i = 0; i < 6000; i++) {
      big[`k${i}`] = i
    }
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'big', big)
    // At least one of the latter keys should be the truncation sentinel.
    const lateKeys = Object.keys(scrubbedContext).slice(-100)
    const truncatedSeen = lateKeys.some((k) => scrubbedContext[k] === '[truncated]')
    expect(truncatedSeen).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Case 12: non-plain objects pass through by reference
// ---------------------------------------------------------------------------
describe('logScrubbed / class instances pass through (case 12)', () => {
  it('does not descend into Date or Error - same instance returned', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const err = new Error('test error')
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'instances', {
      d: date,
      e: err,
    })
    expect(scrubbedContext.d).toBe(date)
    expect(scrubbedContext.e).toBe(err)
  })
})

// ---------------------------------------------------------------------------
// Case 13: falsy primitives preserved
// ---------------------------------------------------------------------------
describe('logScrubbed / falsy primitives (case 13)', () => {
  it('preserves null, undefined, 0, "", false at leaves', () => {
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'falsy', {
      a: null,
      b: undefined,
      c: 0,
      d: '',
      e: false,
    })
    expect(scrubbedContext.a).toBeNull()
    expect(scrubbedContext.b).toBeUndefined()
    expect(scrubbedContext.c).toBe(0)
    expect(scrubbedContext.d).toBe('')
    expect(scrubbedContext.e).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Case 14: customer as string id
// ---------------------------------------------------------------------------
describe('logScrubbed / customer-as-string passthrough (case 14)', () => {
  it('passes the customer id through verbatim when it is a string', () => {
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'cust-string', {
      customer: 'cus_abc',
    })
    expect(scrubbedContext.customer).toBe('cus_abc')
  })
})

// ---------------------------------------------------------------------------
// Case 15: customer expanded
// ---------------------------------------------------------------------------
describe('logScrubbed / customer expanded object (case 15)', () => {
  it('preserves id + livemode and masks email + name when customer is expanded', () => {
    const { scrubbedContext } = logScrubbed('info', 'webhook', 'cust-obj', {
      customer: {
        id: 'cus_abc',
        email: 'a@b.c',
        name: 'Alice',
        livemode: true,
      },
    })
    const customer = scrubbedContext.customer as Record<string, unknown>
    expect(customer.id).toBe('cus_abc')
    expect(customer.livemode).toBe(true)
    expect(customer.email).toBe('[scrubbed]')
    expect(customer.name).toBe('[scrubbed]')
  })
})

// ---------------------------------------------------------------------------
// Case 16: honeypot / membership shape
// ---------------------------------------------------------------------------
describe('logScrubbed / membership / honeypot shape (case 16)', () => {
  it('preserves ip + honeypotFilled, masks fullName + email + motivation', () => {
    const { scrubbedContext } = logScrubbed('info', 'membership', 'submitted', {
      fullName: 'Alice Example',
      email: 'alice@example.org',
      motivation: 'long-form text about why I want to apply',
      ip: '203.0.113.7',
      honeypotFilled: false,
    })
    expect(scrubbedContext.fullName).toBe('[scrubbed]')
    expect(scrubbedContext.email).toBe('[scrubbed]')
    expect(scrubbedContext.motivation).toBe('[scrubbed]')
    expect(scrubbedContext.ip).toBe('203.0.113.7')
    expect(scrubbedContext.honeypotFilled).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Case 17: B-10 handleError shape
// ---------------------------------------------------------------------------
describe('logScrubbed / handleError integration shape (case 17)', () => {
  it('preserves errName / errMessage / err stack and code', () => {
    const e = new Error('boom')
    const { scrubbedContext } = logScrubbed(
      'error',
      'checkout',
      'payment_service_unavailable',
      {
        err: String(e.stack ?? e),
        errName: 'Error',
        errMessage: 'boom',
        httpStatus: 502,
      },
    )
    expect(scrubbedContext.errName).toBe('Error')
    expect(scrubbedContext.errMessage).toBe('boom')
    expect(scrubbedContext.httpStatus).toBe(502)
    expect(typeof scrubbedContext.err).toBe('string')
  })
})
