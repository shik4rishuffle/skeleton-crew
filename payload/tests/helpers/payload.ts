/**
 * Boot a Payload instance against a per-file Postgres schema (TASK-010 / QA-01).
 *
 * Strategy:
 *   1. Create a fresh schema via `db.ts::createTestSchema`.
 *   2. Build a fresh Payload config object that:
 *        - imports the same collections/globals/editor as the production
 *          `src/payload.config.ts`,
 *        - swaps in a postgres adapter targeting the per-file schema with
 *          `push: true` (auto-derive tables from collection definitions -
 *          no migration files required),
 *        - shares the production `secret` so signing semantics match.
 *   3. Hand the test a `payload` object plus a `teardown` callback that
 *      tears down the pg pool and drops the schema.
 *
 * Side note on env vars:
 *   `src/payload.config.ts` imports `./lib/bj/stripe` which throws at
 *   boot if `STRIPE_SECRET_KEY` is unset. `bootTestPayload` avoids this
 *   pitfall by setting safe placeholder env vars BEFORE the dynamic
 *   `payload.config.ts` import is evaluated. Callers do not need to set
 *   these themselves.
 */

import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { createTestSchema, dropTestSchema } from './db'

export interface BootedTestPayload {
  payload: Payload
  schemaName: string
  databaseUri: string
  teardown: () => Promise<void>
}

let envInitialised = false
function ensureSafeBootEnv(): void {
  if (envInitialised) return
  // Stripe boot guard - placeholder satisfies `lib/bj/stripe.ts`'s presence
  // check; the SDK only validates the value at API-call time, which the
  // harness never reaches.
  process.env.STRIPE_SECRET_KEY ??= 'sk_test_harness_placeholder'
  process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_test_harness_placeholder'
  process.env.STRIPE_PUBLISHABLE_KEY ??= 'pk_test_harness_placeholder'
  process.env.PAYLOAD_SECRET ??=
    'test-harness-secret-deterministic-32-chars-or-more-for-payload-3'
  process.env.NEXT_PUBLIC_SERVER_URL ??= 'http://localhost:3000'
  process.env.BJ_FRONTEND_ORIGIN ??= 'http://localhost:8080'
  envInitialised = true
}

/**
 * Boot Payload pointed at a fresh per-file schema. Returns the `Payload`
 * instance plus a `teardown()` to tear down the connection pool and drop
 * the schema.
 *
 * `testFilePath` should be `__filename` from the calling test file so the
 * generated schema name carries the file's stem and is easy to identify
 * in `psql \dn`.
 */
export async function bootTestPayload(testFilePath: string): Promise<BootedTestPayload> {
  ensureSafeBootEnv()

  const { schemaName, databaseUri } = await createTestSchema(testFilePath)

  // Import the production config DYNAMICALLY (after env is set) so its
  // module-level Stripe boot does not throw, then shallow-clone and swap
  // the db adapter. We must not mutate the imported config object - other
  // tests in the same process may import it too.
  const { default: baseConfigPromise } = await import('@payload-config')
  const baseConfig = await baseConfigPromise

  const testConfig = {
    ...baseConfig,
    db: postgresAdapter({
      pool: { connectionString: databaseUri },
      push: true,
      schemaName,
    }),
  }

  const payload = await getPayload({
    // Each call needs its own cache key so getPayload doesn't return a
    // memoised instance from a previous test file.
    key: `bj-test-${schemaName}`,
    // getPayload's `config` accepts a sanitized config or a Promise
    // thereof. The shallow-clone-with-different-db pattern is a known
    // Payload-3 testing recipe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: testConfig as any,
  })

  const teardown = async (): Promise<void> => {
    try {
      // db.destroy() releases the pg pool. Payload exposes the adapter on
      // payload.db; the postgres adapter implements `destroy()`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = payload.db as any
      if (typeof db?.destroy === 'function') {
        await db.destroy()
      }
    } catch {
      // Swallow teardown errors; we still want to drop the schema below.
    }
    await dropTestSchema(schemaName)
  }

  return { payload, schemaName, databaseUri, teardown }
}
