/**
 * Better Justice raw-body access utility for the Stripe webhook (B-04).
 *
 * Reinterpretation note: TASK-007's original brief described an Express-level
 * middleware (`express.raw({ type: 'application/json' })`) attached via a
 * Payload `express` config hook. That pattern is N/A in this stack - the
 * shared Payload runs Payload v3 on the Next.js App Router. There is no
 * Express layer to register middleware on, no global body-parsing default to
 * skip, and no `express` field on `buildConfig`. In the App Router, every
 * Route Handler (and every Payload custom endpoint registered via
 * `buildConfig.endpoints`) controls its own body parsing - `request.body` is
 * a `ReadableStream` until the handler explicitly consumes it. So the
 * "skip JSON parsing on the webhook path" requirement is satisfied
 * automatically; the only missing piece is a small, tested utility that
 * webhook handlers call to read the raw body once.
 *
 * Why a utility (vs. inlining `await request.text()` in TASK-037):
 *   - The body stream is single-use. Reading it in the wrong order, or
 *     reading it twice, is a silent footgun (the second read returns `''`).
 *     Centralising the call gives us one tested entry point.
 *   - The Stripe-Signature header is a pair-with-the-body concern; both reads
 *     belong in the same module so the contract is documented in one place.
 *   - The test for this module proves the round-trip through
 *     `stripe.webhooks.constructEvent` succeeds against a real `stripe` SDK
 *     instance, which is the security boundary we actually care about.
 *
 * Usage (TASK-037 webhook route):
 *
 * ```ts
 * export const runtime = 'nodejs';
 * export const dynamic = 'force-dynamic';
 *
 * export async function POST(request: Request): Promise<Response> {
 *   const rawBody = await readRawBody(request);
 *   const signature = getStripeSignature(request);
 *   if (!signature) return new Response(..., { status: 400 });
 *   const event = stripe.webhooks.constructEvent(
 *     rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!,
 *   );
 *   // ... idempotency log + dispatch
 * }
 * ```
 *
 * `readRawBody(request)` MUST be the first body-touching call on the request
 * - calling `request.json()` or `request.text()` after it will throw because
 * the stream has already been consumed.
 */

/**
 * Read the request body as a UTF-8 string.
 *
 * Stripe's `webhooks.constructEvent` accepts either a string or a Buffer for
 * the payload argument. We return a string because:
 *   - `request.text()` already produces a UTF-8 decoded string (the HTTP body
 *     bytes interpreted as UTF-8, the same encoding Stripe uses).
 *   - String values are easier to feed into the `[BJ:webhook]` log helper
 *     without buffer-to-base64 dancing.
 *   - The string round-trips byte-for-byte through `constructEvent` provided
 *     the original bytes were valid UTF-8 (they always are - Stripe sends
 *     JSON payloads).
 *
 * Defensive note on `request.body === null`: in the Node fetch / Web fetch
 * implementations, a POST with an empty body still produces a non-null
 * `body` stream that resolves to `''`. We do not need to guard against
 * `null` here - `request.text()` returns `''` for an empty body without
 * throwing. The downstream `constructEvent` call will reject an empty body
 * cleanly with a `StripeSignatureVerificationError`, which is the correct
 * outcome.
 *
 * @param request - The incoming `Request` (or any subclass, e.g. Payload v3's
 *                  `PayloadRequest`, which extends `Request`).
 * @returns       The body as a UTF-8 string. Empty bodies return `''`.
 */
export async function readRawBody(request: Request): Promise<string> {
  return await request.text()
}

/**
 * Read the Stripe-Signature header from the request.
 *
 * Returns `null` (not `undefined`) when the header is absent so callers can
 * pattern-match on a falsy value and return a clean 400 response without
 * passing `undefined` into `stripe.webhooks.constructEvent` (which would
 * throw a less-informative error).
 *
 * Header lookup is case-insensitive per the `Headers` web API spec, so
 * `Stripe-Signature`, `stripe-signature`, and `STRIPE-SIGNATURE` all match.
 *
 * @param request - The incoming `Request`.
 * @returns       The signature header value as a string, or `null` if missing.
 */
export function getStripeSignature(request: Request): string | null {
  return request.headers.get('stripe-signature')
}
