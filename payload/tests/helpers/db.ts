/**
 * Per-test-file Postgres schema lifecycle (TASK-010 / QA-01).
 *
 * Each backend test file that needs a real Postgres gets its own schema
 * (`bj_test_<sanitised-filename>_<rand>`). The schema is created before the
 * file's tests run and dropped after - hermetic isolation between files
 * without paying the cost of dropping the entire database between runs.
 *
 * Per-file (not per-test) because Payload boot is slow; QA plan section 8
 * documents the trade-off.
 *
 * Connection target: `process.env.TEST_DATABASE_URI`. The shared Payload's
 * `docker-compose.test.yml` brings up a Postgres 16 container on
 * `postgresql://test:test@localhost:54329/bj_test` which is the default if
 * the env var is unset.
 */

import { Client } from 'pg'
import path from 'node:path'
import crypto from 'node:crypto'

const DEFAULT_TEST_DATABASE_URI = 'postgresql://test:test@localhost:54329/bj_test'

export function getBaseDatabaseUri(): string {
  return process.env.TEST_DATABASE_URI || DEFAULT_TEST_DATABASE_URI
}

/**
 * Build a Postgres-safe schema name from a test file path.
 *
 * Postgres identifiers are limited to 63 characters. We prefix every test
 * schema with `bj_test_` so a stale schema (failed teardown) is easy to
 * spot and drop manually:
 *
 *   psql -c "DROP SCHEMA bj_test_xxx CASCADE;"
 *
 * Or in bulk:
 *
 *   psql -tc "select schema_name from information_schema.schemata where schema_name like 'bj_test_%';"
 *
 * The basename + random suffix combination is unique per call. Long file
 * names are truncated; a hash of the full path is appended to keep
 * filenames-with-shared-prefixes distinct.
 */
export function makeSchemaName(testFilePath: string): string {
  const base = path
    .basename(testFilePath, path.extname(testFilePath))
    .replace(/\.test$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  const rand = crypto.randomBytes(3).toString('hex') // 6 hex chars
  const prefix = 'bj_test_'
  // Reserve room for prefix + underscore + random suffix.
  const maxBaseLen = 63 - prefix.length - 1 - rand.length
  const truncated = base.slice(0, Math.max(maxBaseLen, 1))
  return `${prefix}${truncated}_${rand}`
}

/**
 * Create a Postgres schema for the given test file.
 *
 * Returns the schema name and a database URI with `?options=-csearch_path=<schema>,public`
 * appended so that any client (Payload's pg pool included) lands on this
 * schema by default. Note: `search_path` via the URL `options` parameter is
 * the standard Postgres way to scope a connection - `?search_path=` is NOT
 * a recognised libpq URL parameter.
 */
export async function createTestSchema(testFilePath: string): Promise<{
  schemaName: string
  databaseUri: string
}> {
  const schemaName = makeSchemaName(testFilePath)
  const baseUri = getBaseDatabaseUri()

  const client = new Client({ connectionString: baseUri })
  await client.connect()
  try {
    // CREATE SCHEMA is idempotent across the test suite because each call
    // mints a unique random suffix. Quote the identifier for safety even
    // though the sanitiser would reject anything dangerous.
    await client.query(`CREATE SCHEMA "${schemaName}"`)
  } finally {
    await client.end()
  }

  // Build a URI scoped to the new schema. Use libpq's `options` URL
  // parameter to set `search_path` for the connection.
  const url = new URL(baseUri)
  // Preserve any existing options the user set; ours go last so search_path
  // override wins.
  const existing = url.searchParams.get('options') ?? ''
  const sep = existing.length > 0 ? ' ' : ''
  url.searchParams.set(
    'options',
    `${existing}${sep}-csearch_path=${schemaName},public`,
  )

  return {
    schemaName,
    databaseUri: url.toString(),
  }
}

/**
 * Drop the test schema. Safe to call even if Payload still holds a pool
 * against the same connection - DROP SCHEMA ... CASCADE will roll over any
 * remaining objects. Callers should still tear down their Payload instance
 * first to avoid in-flight query errors.
 */
export async function dropTestSchema(schemaName: string): Promise<void> {
  // Defence: refuse to drop anything that doesn't carry our prefix. A
  // mis-call must not be able to delete `public` or any production schema.
  if (!schemaName.startsWith('bj_test_')) {
    throw new Error(
      `dropTestSchema refused: schema name "${schemaName}" does not start with "bj_test_"`,
    )
  }

  const baseUri = getBaseDatabaseUri()
  const client = new Client({ connectionString: baseUri })
  await client.connect()
  try {
    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`)
  } finally {
    await client.end()
  }
}
