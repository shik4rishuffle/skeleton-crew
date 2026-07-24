import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

if (!STRIPE_SECRET_KEY && !isBuildPhase) {
  throw new Error(
    '[BJ:stripe] STRIPE_SECRET_KEY is not set. Refusing to boot. Add it to .env (see .env.example) before starting Payload.',
  )
}

export const stripe = new Stripe(STRIPE_SECRET_KEY ?? 'sk_test_build_placeholder', {
  // Pin the Stripe API version for deterministic behaviour across SDK upgrades.
  // Bumping this is a deliberate, reviewed change - not a drive-by.
  apiVersion: '2025-09-30.clover',
  appInfo: {
    name: 'BetterJustice-Payload',
    version: '0.1.0',
  },
})
