/**
 * Better Justice central error-handling helper (B-10).
 *
 * Single helper called by every BJ custom endpoint handler (TASK-035 / 036 /
 * 037 / 044) on the catch-side of any try block. It:
 *
 *   1. Logs the full error server-side via `logScrubbed` (TASK-005). Stack,
 *      message, name and any caller-supplied `extraContext` go into the log
 *      line; PII keys in `extraContext` are masked by the scrubber.
 *   2. Returns a uniform user-safe `Response`:
 *        body:    { error: { code, message } }
 *        headers: Content-Type: application/json
 *        status:  the supplied httpStatus
 *
 * Signature pivots away from the task brief's Express-style
 * `handleError(res, err, code, message, status)`. Payload v3 endpoints on
 * Next.js are plain async functions returning a `Response` - there is no
 * `res.status().json()` to call. The pivoted shape mirrors
 * `lib/middleware/rateLimit.ts` `guard()` so call sites read identically:
 *
 *   try { ... } catch (err) {
 *     return errorResponse(err, 'checkout', 'payment_service_unavailable',
 *                         'Payment service unavailable', 502, { amount })
 *   }
 *
 * Imported as: `import { errorResponse } from '@/lib/bj/errors'`
 */

import { logScrubbed, type LogArea } from './log'

type ErrInfo = {
  stack: string | undefined
  message: string
  name: string
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    // Circular references, BigInt values, etc.
    return '[unserialisable]'
  }
}

/**
 * Narrow `unknown` into a stack/message/name triple without ever throwing.
 *
 * Order matters:
 *   1. Real `Error` instances - cleanest path, gives us a real stack.
 *   2. Bare strings - happens when code does `throw 'oops'`. No stack.
 *   3. Plain objects with `message`/`name`/`stack`-like shape - duck-type.
 *   4. Everything else (numbers, booleans, null, undefined, symbols) - last
 *      resort: `String(err)` so we always have something greppable.
 */
function extractErrInfo(err: unknown): ErrInfo {
  if (err instanceof Error) {
    return { stack: err.stack, message: err.message, name: err.name }
  }
  if (typeof err === 'string') {
    return { stack: undefined, message: err, name: 'StringError' }
  }
  if (err && typeof err === 'object') {
    const obj = err as { message?: unknown; name?: unknown; stack?: unknown }
    return {
      stack: typeof obj.stack === 'string' ? obj.stack : undefined,
      message:
        typeof obj.message === 'string' ? obj.message : safeStringify(err),
      name: typeof obj.name === 'string' ? obj.name : 'UnknownError',
    }
  }
  return { stack: undefined, message: String(err), name: 'UnknownError' }
}

/**
 * Log the error and return a user-safe JSON `Response`.
 *
 * @param err            The thrown value. Typed `unknown` to match TS 4.4+
 *                       catch-clause defaults; helper narrows safely.
 * @param area           `LogArea` (`'checkout' | 'webhook' | 'membership' |
 *                       'stripe'`). Drives the `[BJ:<area>]` log prefix.
 * @param userSafeCode   Wire-level error code returned to the caller. Also
 *                       used as the log-line message so log lines stay
 *                       greppable by code. Architect whitelist:
 *                       `'invalid_request' | 'payment_service_unavailable' |
 *                       'too_many_requests' | 'unable_to_submit_application' |
 *                       'signature_invalid'`. Helper does not validate; the
 *                       call site picks the right code.
 * @param userSafeMessage Human-readable message returned to the caller.
 * @param httpStatus     HTTP status code on the response. Helper does not
 *                       validate the range; caller picks the right status.
 * @param extraContext   Optional structured fields logged alongside the
 *                       error (e.g. `{ stripeSessionId, amount }`). Walked
 *                       by `logScrubbed`; PII keys are masked. Caller-
 *                       supplied keys NEVER overwrite the reserved fields
 *                       (`err`, `errMessage`, `errName`, `httpStatus`) - the
 *                       reserved keys are spread last on purpose.
 * @returns              `Response` with `{ error: { code, message } }`
 *                       JSON body and the supplied status.
 */
export function errorResponse(
  err: unknown,
  area: LogArea,
  userSafeCode: string,
  userSafeMessage: string,
  httpStatus: number,
  extraContext?: Record<string, unknown>,
): Response {
  const errInfo = extractErrInfo(err)

  // Spread extraContext FIRST so reserved keys win on collision. Adversarial
  // or accidental caller-supplied `err` / `errMessage` / `errName` /
  // `httpStatus` cannot mask the actual error metadata.
  const context: Record<string, unknown> = {
    ...(extraContext ?? {}),
    err: errInfo.stack,
    errMessage: errInfo.message,
    errName: errInfo.name,
    httpStatus,
  }

  // logScrubbed in TASK-005 already wraps its scrub() call in try/catch so it
  // does not throw. Belt-and-braces: if a future change ever lets an
  // exception escape, we must not let it take down the user-facing response
  // path - the whole point of this helper is uniform error handling. Fall
  // back to a single console.error and continue.
  try {
    logScrubbed('error', area, userSafeCode, context)
  } catch (logErr) {
    // eslint-disable-next-line no-console
    console.error('[BJ:errors] logScrubbed failed', String(logErr))
  }

  const body = JSON.stringify({
    error: { code: userSafeCode, message: userSafeMessage },
  })

  return new Response(body, {
    status: httpStatus,
    headers: { 'Content-Type': 'application/json' },
  })
}
