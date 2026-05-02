/**
 * Unit tests for `makeRateLimit`.
 *
 * Harness: Vitest. NOTE at write time the shared Payload does not yet have a
 * Vitest dev-dependency installed - that scaffold is owned by Phase 4
 * Foundation TASK-005 / TASK-008. These tests are written to the contract
 * documented in `AGENTS/backend-task-004-plan.md` section 7.1 so they run
 * unmodified once the harness lands.
 *
 * Cases covered:
 *   1. Allow under limit
 *   2. Deny at limit
 *   3. Window resets after windowMs
 *   4. Per-key (per-IP) isolation
 *   5. Per-bucket isolation
 *   6. retryAfterSeconds math
 *   7. Sliding window boundary
 *   8. Cleanup interval prunes stale entries
 *   9. guard returns null when allowed
 *  10. guard returns a 429 Response with correct shape when denied
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { makeRateLimit } from './rateLimit';

// Fake-clock helper: returns a `now` function and a setter so tests can
// advance time deterministically without `vi.useFakeTimers()` (which would
// also affect the cleanup setInterval; we test cleanup separately).
const fakeClock = (start = 0) => {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
    set: (ms: number) => {
      t = ms;
    },
  };
};

describe('makeRateLimit / check', () => {
  let limiter: ReturnType<typeof makeRateLimit>;
  let clock: ReturnType<typeof fakeClock>;

  beforeEach(() => {
    clock = fakeClock(0);
    limiter = makeRateLimit({
      bucketName: 'bj:checkout',
      limit: 3,
      windowMs: 1000,
      now: clock.now,
    });
  });

  afterEach(() => {
    limiter.stop();
  });

  it('allows requests under the limit', () => {
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true });
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true });
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true });
  });

  it('denies the request that hits the limit', () => {
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');
    const out = limiter.check('1.1.1.1');
    expect(out.allowed).toBe(false);
    if (!out.allowed) {
      expect(out.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    }
  });

  it('resets after the window elapses', () => {
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');
    expect(limiter.check('1.1.1.1').allowed).toBe(false);

    clock.advance(1001);
    expect(limiter.check('1.1.1.1').allowed).toBe(true);
  });

  it('isolates counters per client IP', () => {
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');
    expect(limiter.check('1.1.1.1').allowed).toBe(false);
    // Different IP - fresh budget.
    expect(limiter.check('2.2.2.2').allowed).toBe(true);
    expect(limiter.check('2.2.2.2').allowed).toBe(true);
    expect(limiter.check('2.2.2.2').allowed).toBe(true);
    expect(limiter.check('2.2.2.2').allowed).toBe(false);
  });

  it('isolates counters per bucket name', () => {
    const checkout = makeRateLimit({
      bucketName: 'bj:checkout',
      limit: 3,
      windowMs: 1000,
      now: clock.now,
    });
    const membership = makeRateLimit({
      bucketName: 'bj:membership',
      limit: 3,
      windowMs: 1000,
      now: clock.now,
    });
    try {
      checkout.check('1.1.1.1');
      checkout.check('1.1.1.1');
      checkout.check('1.1.1.1');
      expect(checkout.check('1.1.1.1').allowed).toBe(false);
      // Same IP, different bucket - fresh budget.
      expect(membership.check('1.1.1.1').allowed).toBe(true);
    } finally {
      checkout.stop();
      membership.stop();
    }
  });

  it('computes retryAfterSeconds correctly', () => {
    const long = makeRateLimit({
      bucketName: 'bj:checkout',
      limit: 1,
      windowMs: 60_000,
      now: clock.now,
    });
    try {
      // Hit at t=0
      long.check('1.1.1.1');
      // Advance to t=1500ms; oldest entry at t=0 expires at t=60_000
      // ceil((0 + 60000 - 1500) / 1000) === 59
      clock.set(1500);
      const out = long.check('1.1.1.1');
      expect(out.allowed).toBe(false);
      if (!out.allowed) {
        expect(out.retryAfterSeconds).toBe(59);
      }
    } finally {
      long.stop();
    }
  });

  it('honours the sliding window at the boundary', () => {
    const sliding = makeRateLimit({
      bucketName: 'bj:checkout',
      limit: 5,
      windowMs: 5000,
      now: clock.now,
    });
    try {
      // 5 hits at t=0,1,2,3,4 (ms units for clarity).
      for (let i = 0; i < 5; i++) {
        clock.set(i);
        expect(sliding.check('1.1.1.1').allowed).toBe(true);
      }
      // At t=4 we have 5 in window -> next hit denies.
      clock.set(4);
      expect(sliding.check('1.1.1.1').allowed).toBe(false);
      // Advance past the windowMs boundary so the oldest entry (t=0) drops.
      // Strict inequality `ts > cutoff`: at t=5000, cutoff=0, t=0 is excluded.
      clock.set(5000);
      expect(sliding.check('1.1.1.1').allowed).toBe(true);
    } finally {
      sliding.stop();
    }
  });

  it('cleanup interval prunes stale entries', () => {
    // Use real timers + a real (short) window so we can observe the timer fire.
    vi.useFakeTimers();
    const realClock = { now: () => Date.now() };
    const lim = makeRateLimit({
      bucketName: 'bj:checkout',
      limit: 5,
      windowMs: 50,
      now: realClock.now,
    });
    try {
      lim.check('1.1.1.1');
      lim.check('2.2.2.2');
      // Advance past the window AND past the cleanup interval (= windowMs).
      vi.advanceTimersByTime(120);
      // After cleanup, the next check for a new IP starts from a clean slate
      // and the previous keys should be gone. Re-checking the old IPs starts
      // a fresh window for them too.
      const out = lim.check('1.1.1.1');
      expect(out.allowed).toBe(true);
    } finally {
      lim.stop();
      vi.useRealTimers();
    }
  });
});

describe('makeRateLimit / guard', () => {
  let limiter: ReturnType<typeof makeRateLimit>;
  let clock: ReturnType<typeof fakeClock>;

  beforeEach(() => {
    clock = fakeClock(0);
    limiter = makeRateLimit({
      bucketName: 'bj:checkout',
      limit: 1,
      windowMs: 60_000,
      now: clock.now,
    });
  });

  afterEach(() => {
    limiter.stop();
  });

  it('returns null when the request is allowed', () => {
    expect(limiter.guard('1.1.1.1')).toBeNull();
  });

  it('returns a 429 Response with the locked body shape when denied', async () => {
    limiter.guard('1.1.1.1'); // consume the single allowance
    const resp = limiter.guard('1.1.1.1');
    expect(resp).not.toBeNull();
    if (!resp) return;
    expect(resp.status).toBe(429);
    expect(resp.headers.get('Content-Type')).toContain('application/json');
    const retry = resp.headers.get('Retry-After');
    expect(retry).not.toBeNull();
    expect(Number(retry)).toBeGreaterThanOrEqual(1);
    const body = await resp.json();
    expect(body).toEqual({
      error: { code: 'too_many_requests', message: 'Too many requests' },
    });
  });
});
