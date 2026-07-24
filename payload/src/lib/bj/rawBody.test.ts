/**
 * Unit tests for `readRawBody` + `getStripeSignature`.
 *
 * Harness: Vitest. NOTE at write time the shared Payload does not yet have a
 * Vitest dev-dependency installed - that scaffold is owned by Phase 4
 * Foundation TASK-010. These tests are written to the contract documented in
 * `AGENTS/backend-task-007-plan.md` section 4 so they run unmodified once
 * the harness lands.
 *
 * Out-of-band verification while Vitest is unavailable: the same six cases
 * are exercised via a `tsx`-driven inline harness whose verbatim output is
 * recorded in `AGENTS/backend-task-007-output.md` section "Verification".
 *
 * Cases covered:
 *   1. Round-trip with valid signature -> constructEvent succeeds, event matches.
 *   2. Tampered body -> constructEvent throws StripeSignatureVerificationError.
 *   3. Tampered signature -> constructEvent throws StripeSignatureVerificationError.
 *   4. Missing Stripe-Signature header -> getStripeSignature returns null.
 *   5. Empty body -> readRawBody returns '' (and does not throw).
 *   6. UTF-8 multi-byte body -> round-trip is byte-stable, constructEvent passes.
 *
 * Hermetic: no env vars are read. The webhook secret is generated locally per
 * test (`whsec_test_local_only`), and the Stripe SDK is constructed with a
 * dummy `sk_test_dummy` key (the SDK only needs a non-empty key for object
 * construction; webhook signature verification is pure-crypto and never
 * touches the network).
 */

import { describe, it, expect } from 'vitest'
import Stripe from 'stripe'
import { readRawBody, getStripeSignature } from './rawBody'

// Local hermetic secret. Never the real STRIPE_WEBHOOK_SECRET. The `whsec_`
// prefix is convention; the SDK does not validate the prefix shape.
const TEST_WEBHOOK_SECRET = 'whsec_test_local_only'

// Dummy SDK instance. apiVersion matches `src/lib/bj/stripe.ts` for parity.
// The webhooks helpers (`generateTestHeaderString`, `constructEvent`) are
// pure-crypto and do not make network calls, so the secret key value is
// irrelevant for these tests.
const stripe = new Stripe('sk_test_dummy', {
  apiVersion: '2025-09-30.clover',
})

/**
 * Build a `Request` object for testing. Defaults are sensible for a Stripe
 * webhook POST: JSON content-type, POST method, BJ-style URL.
 */
function buildRequest(opts: {
  body?: string
  signature?: string | null
  url?: string
}): Request {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (opts.signature !== null && opts.signature !== undefined) {
    headers.set('stripe-signature', opts.signature)
  }
  return new Request(opts.url ?? 'https://example.test/api/bj/stripe-webhook', {
    method: 'POST',
    headers,
    body: opts.body ?? '',
  })
}

describe('readRawBody + getStripeSignature', () => {
  it('round-trips a valid signed body through stripe.webhooks.constructEvent', async () => {
    const payload = JSON.stringify({
      id: 'evt_test_001',
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_001', amount_total: 5000, currency: 'gbp' } },
    })
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: TEST_WEBHOOK_SECRET,
      timestamp,
    })

    const request = buildRequest({ body: payload, signature })

    const rawBody = await readRawBody(request)
    const sig = getStripeSignature(request)

    expect(rawBody).toBe(payload)
    expect(sig).toBe(signature)

    const event = stripe.webhooks.constructEvent(rawBody, sig!, TEST_WEBHOOK_SECRET)
    expect(event.id).toBe('evt_test_001')
    expect(event.type).toBe('checkout.session.completed')
  })

  it('rejects a tampered body with StripeSignatureVerificationError', async () => {
    const payload = JSON.stringify({ id: 'evt_test_002', amount: 1000 })
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: TEST_WEBHOOK_SECRET,
      timestamp,
    })

    // Mutate the body by one character after the signature was generated.
    const tamperedPayload = payload.replace('1000', '9999')
    const request = buildRequest({ body: tamperedPayload, signature })

    const rawBody = await readRawBody(request)
    const sig = getStripeSignature(request)

    expect(() =>
      stripe.webhooks.constructEvent(rawBody, sig!, TEST_WEBHOOK_SECRET),
    ).toThrow(Stripe.errors.StripeSignatureVerificationError)
  })

  it('rejects a tampered signature header with StripeSignatureVerificationError', async () => {
    const payload = JSON.stringify({ id: 'evt_test_003' })
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: TEST_WEBHOOK_SECRET,
      timestamp,
    })

    // Flip one hex character of the v1 signature so the HMAC fails.
    const tamperedSignature = signature.endsWith('a')
      ? signature.slice(0, -1) + 'b'
      : signature.slice(0, -1) + 'a'
    const request = buildRequest({ body: payload, signature: tamperedSignature })

    const rawBody = await readRawBody(request)
    const sig = getStripeSignature(request)

    expect(() =>
      stripe.webhooks.constructEvent(rawBody, sig!, TEST_WEBHOOK_SECRET),
    ).toThrow(Stripe.errors.StripeSignatureVerificationError)
  })

  it('returns null when the Stripe-Signature header is missing', () => {
    const request = buildRequest({ body: '{}', signature: null })
    expect(getStripeSignature(request)).toBeNull()
  })

  it('returns "" for an empty body without throwing', async () => {
    const request = buildRequest({ body: '', signature: 'whatever' })
    const rawBody = await readRawBody(request)
    expect(rawBody).toBe('')
  })

  it('round-trips a UTF-8 multi-byte body byte-stably', async () => {
    // Mix of emoji (4-byte UTF-8) and accented Latin (2-byte UTF-8) - the
    // kinds of characters that realistically appear in Stripe customer fields.
    const payload = JSON.stringify({
      id: 'evt_test_006',
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_test_006',
          email: 'tést@exämple.org',
          description: 'Donor: Renée 🎉 Müller — supporter since 2020',
        },
      },
    })
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: TEST_WEBHOOK_SECRET,
      timestamp,
    })

    const request = buildRequest({ body: payload, signature })

    const rawBody = await readRawBody(request)
    const sig = getStripeSignature(request)

    // Byte-stability assertion: the string we read out matches what we put in.
    expect(rawBody).toBe(payload)

    const event = stripe.webhooks.constructEvent(rawBody, sig!, TEST_WEBHOOK_SECRET)
    expect(event.id).toBe('evt_test_006')
    expect(event.type).toBe('customer.created')
  })
})
