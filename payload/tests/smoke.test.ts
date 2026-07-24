/**
 * Harness smoke test (TASK-010 / QA-01).
 *
 * Boots Payload via `bootTestPayload`, inserts a Users row, reads it back,
 * tears the schema down. Green = the harness wiring is correct end-to-end:
 *   - Postgres reachable (docker container or env-pointed instance)
 *   - per-file schema CREATE succeeded
 *   - Payload boot with `push: true` derived tables from the live config
 *   - getPayload returns a usable instance
 *   - Local-API create/findByID work against the test schema
 *   - teardown destroys the pool and DROPs the schema
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { fileURLToPath } from 'node:url'
import { bootTestPayload, type BootedTestPayload } from './helpers/payload'

const __filename_ = fileURLToPath(import.meta.url)

describe('harness smoke', () => {
  let booted: BootedTestPayload

  beforeAll(async () => {
    booted = await bootTestPayload(__filename_)
  })

  afterAll(async () => {
    if (booted) await booted.teardown()
  })

  it('boots Payload, inserts a Users row, reads it back', async () => {
    const created = await booted.payload.create({
      collection: 'users',
      data: {
        email: 'smoke@bj-test.local',
        password: 'smoke-test-password-1234',
        // The Users collection requires `tenant` and defaults `role` to
        // 'editor'; pass tenant explicitly so the row inserts cleanly
        // regardless of any future tightening of access checks.
        tenant: 'betterjustice',
        role: 'admin',
      },
      // Skip access control - the Users.access.create rule requires an
      // existing admin user in the same tenant which obviously can't exist
      // in a fresh test schema. overrideAccess is the canonical Payload-3
      // way to bypass for test setup.
      overrideAccess: true,
    })

    expect(created.id).toBeDefined()
    expect(created.email).toBe('smoke@bj-test.local')

    const read = await booted.payload.findByID({
      collection: 'users',
      id: created.id,
      overrideAccess: true,
    })

    expect(read.id).toBe(created.id)
    expect(read.email).toBe('smoke@bj-test.local')
    expect(read.tenant).toBe('betterjustice')
  })
})
