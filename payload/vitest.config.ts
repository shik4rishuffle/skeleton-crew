/**
 * Vitest harness root config (TASK-010 / QA-01).
 *
 * Two projects under one config:
 *   - `backend`  - Node env, includes co-located `src/**\/*.test.ts` plus
 *                  `tests/backend/**\/*.test.ts` plus the smoke test.
 *                  Single-threaded so the Postgres-per-file boot harness
 *                  doesn't fight a concurrent peer for the same dev container.
 *   - `frontend` - jsdom env. Currently empty (placeholder); TASK-075 +
 *                  future BJ frontend tests land under `tests/frontend/`
 *                  and consume the BJ static-site source via the
 *                  `@bj-frontend` alias (see workspace assumption below).
 *
 * Workspace assumption (flagged for TASK-050 CI to handle):
 *   The frontend project resolves `@bj-frontend/*` to
 *   `../../BetterJustice/js/*` - i.e. it expects the BJ static-site repo
 *   to be a sibling of `skeleton-crew/`. Local dev satisfies this; CI
 *   (TASK-050) will arrange the same layout via a sibling checkout or an
 *   env-driven override.
 */

import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const BJ_FRONTEND = path.resolve(ROOT, '../../BetterJustice')

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(ROOT, 'src'),
      '@payload-config': path.resolve(ROOT, 'src/payload.config.ts'),
      '@bj-frontend': path.resolve(BJ_FRONTEND, 'js'),
    },
  },
  test: {
    // Top-level passWithNoTests so `--project frontend` exits 0 when the
    // frontend test directory is empty (the placeholder state today).
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'backend',
          environment: 'node',
          include: [
            'src/**/*.test.ts',
            'tests/backend/**/*.test.ts',
            'tests/smoke.test.ts',
          ],
          // Payload boot is slow; allow generous timeouts for the smoke test
          // and any future integration tests that boot Payload per file.
          testTimeout: 60_000,
          hookTimeout: 60_000,
          // Sequential to avoid concurrent Payload boots fighting over the
          // same dev Postgres container's connection pool.
          poolOptions: {
            threads: { singleThread: true },
            forks: { singleFork: true },
          },
          // Empty include match shouldn't fail the run - the smoke + co-located
          // tests are the primary surface; tests/backend/ is a placeholder.
          passWithNoTests: true,
        },
      },
      {
        extends: true,
        test: {
          name: 'frontend',
          environment: 'jsdom',
          include: ['tests/frontend/**/*.test.ts'],
          testTimeout: 5_000,
          // Frontend tests don't exist yet (TASK-075 + future BJ work fills
          // this); a clean exit with no matches is the expected state today.
          passWithNoTests: true,
        },
      },
    ],
  },
})
