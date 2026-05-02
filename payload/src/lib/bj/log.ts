/**
 * Better Justice PII-scrubbing log helper (B-09).
 *
 * Single funnel for backend logging across BJ modules. Strips known PII keys
 * from any context object before emission, prefixes messages with `[BJ:<area>]`,
 * and routes to the appropriate `console` method by level.
 *
 * Pass-through "safe" fields (Stripe ids, event ids, event types, error codes,
 * statuses, currencies, amounts, timestamps) are documented in the plan;
 * the scrubber operates on a deny-list, so anything not in `SCRUB_KEYS` is
 * preserved as-is.
 *
 * Defensive limits: max recursion depth of 12, max nodes scanned of 5000,
 * cycle detection via WeakSet. Class instances (Date, Error, Buffer) are
 * passed through without descent.
 *
 * Imported as: `import { logScrubbed } from '@/lib/bj/log'`
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogArea = 'checkout' | 'webhook' | 'membership' | 'stripe'

export type LogContext = Record<string, unknown>

export interface LogResult {
  level: LogLevel
  prefixedMessage: string
  scrubbedContext: LogContext
}

/**
 * Keys whose values are always replaced with `'[scrubbed]'`. Match is
 * case-sensitive and exact (not prefix/suffix). Both camelCase (BJ form
 * shapes) and snake_case (Stripe payload shapes) are present because both
 * land in logs unchanged.
 *
 * Whole-subtree keys (`address`, `customer_details`, `billing_details`,
 * `shipping_details`) replace the entire nested object rather than walking
 * into it. This is intentional: those subtrees are by definition donor PII,
 * and replacing the parent fails safe against future Stripe SDK additions.
 */
const SCRUB_KEYS = new Set<string>([
  // Brief-listed (architect spec)
  'email',
  'fullName',
  'donorName',
  'donorEmail',
  'customer_email',
  'receipt_email',
  'motivation',
  'relevantExperience',
  // Added from B-06a-f Stripe webhook payload audit
  'name',
  'phone',
  'customer_name',
  'customer_phone',
  'address',
  'customer_address',
  'shipping_details',
  'billing_details',
  'customer_details',
  'account_name',
])

const MAX_DEPTH = 12
const MAX_NODES = 5000

const SCRUBBED = '[scrubbed]'
const CIRCULAR = '[circular]'
const MAX_DEPTH_TOKEN = '[max-depth]'
const TRUNCATED = '[truncated]'

/**
 * Plain-object detector. Excludes class instances (Date, Error, Buffer,
 * Map, Set, RegExp, etc.) so the scrubber does not descend into them.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

interface ScrubCounter {
  n: number
}

function scrub(
  value: unknown,
  depth: number,
  seen: WeakSet<object>,
  counter: ScrubCounter,
): unknown {
  if (counter.n >= MAX_NODES) return TRUNCATED
  counter.n += 1
  if (depth > MAX_DEPTH) return MAX_DEPTH_TOKEN
  if (value === null || value === undefined) return value

  if (Array.isArray(value)) {
    if (seen.has(value)) return CIRCULAR
    seen.add(value)
    return value.map((item) => scrub(item, depth + 1, seen, counter))
  }

  if (isPlainObject(value)) {
    if (seen.has(value)) return CIRCULAR
    seen.add(value)
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      if (SCRUB_KEYS.has(k)) {
        out[k] = SCRUBBED
      } else {
        out[k] = scrub(v, depth + 1, seen, counter)
      }
    }
    return out
  }

  // Primitives, Dates, Errors, Buffers, RegExps, Maps, Sets, etc. - pass through.
  return value
}

function pickConsole(level: LogLevel): (...args: unknown[]) => void {
  if (level === 'error') return console.error
  if (level === 'warn') return console.warn
  if (level === 'info') return console.info
  return console.log
}

/**
 * Emit a PII-scrubbed log line.
 *
 * @param level   `'debug' | 'info' | 'warn' | 'error'` - routes to console method.
 * @param area    `'checkout' | 'webhook' | 'membership' | 'stripe'` - drives the
 *                `[BJ:<area>]` prefix and groups log lines for filtering.
 * @param message Human-readable message. Caller-supplied; not scrubbed.
 *                Do not interpolate PII into the message string itself - put
 *                anything sensitive into `context` instead so it can be scrubbed.
 * @param context Optional structured fields. Recursively walked: keys in
 *                `SCRUB_KEYS` have their values replaced with `'[scrubbed]'`;
 *                everything else passes through. Cycles, depth overruns, and
 *                node-count overruns are handled defensively (no throw).
 *
 * @returns       The level, the prefixed message, and the scrubbed context.
 *                Returned for unit-test assertions; runtime callers may ignore.
 */
export function logScrubbed(
  level: LogLevel,
  area: LogArea,
  message: string,
  context?: LogContext,
): LogResult {
  const prefixedMessage = `[BJ:${area}] ${message}`

  let scrubbedContext: LogContext = {}
  if (context !== undefined) {
    try {
      scrubbedContext = scrub(context, 0, new WeakSet(), { n: 0 }) as LogContext
    } catch {
      // Defensive: scrub() should never throw, but if it does we must not
      // take down the calling code-path. Fall back to an empty object and
      // continue logging the message.
      scrubbedContext = {}
    }
  }

  const fn = pickConsole(level)
  if (context !== undefined) {
    fn(prefixedMessage, scrubbedContext)
  } else {
    fn(prefixedMessage)
  }

  return { level, prefixedMessage, scrubbedContext }
}
