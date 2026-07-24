/**
 * Fake-clock helper (TASK-010 / QA-01).
 *
 * Formalises the inline `fakeClock` pattern in `rateLimit.test.ts` (TASK-004)
 * so future consumers (membership rate-limit tests, idempotency tests, etc.)
 * don't redefine the same six lines. The pattern is intentionally NOT built
 * on `vi.useFakeTimers()` - the rate-limiter has its own background
 * `setInterval` for cleanup which the test suite verifies separately. Using
 * Vitest's fake-timer hook would interfere with that.
 *
 * If a test legitimately needs to control `setInterval` / `setTimeout`,
 * call `vi.useFakeTimers()` directly - that's supported and the
 * `rateLimit.test.ts::cleanup` case shows the pattern.
 */

export interface FakeClock {
  /** Returns the current fake time in milliseconds. */
  now: () => number
  /** Advance by `ms` milliseconds. */
  advance: (ms: number) => void
  /** Set the clock to an absolute timestamp. */
  set: (timestamp: number) => void
}

export function fakeClock(start: number = 0): FakeClock {
  let t = start
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms
    },
    set: (timestamp: number) => {
      t = timestamp
    },
  }
}
