import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  throw new Error(
    '[BJ:stripe] STRIPE_SECRET_KEY is not set. Refusing to boot. Add it to .env (see .env.example) before starting Payload.',
  )
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  // Pin the Stripe API version for deterministic behaviour across SDK upgrades.
  // Bumping this is a deliberate, reviewed change - not a drive-by.
  apiVersion: '2025-09-30.clover',
  appInfo: {
    name: 'BetterJustice-Payload',
    version: '0.1.0',
  },
})
