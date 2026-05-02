/**
 * makeRateLimit - tenant-agnostic in-memory sliding-window rate limiter.
 *
 * Lives at the top of `lib/middleware/` rather than under `lib/bj/` because
 * any tenant in the shared Payload can adopt it. Each call returns a fresh
 * `{ check, guard }` pair backed by a private `Map<string, number[]>` and a
 * private `setInterval` cleanup timer (with `.unref()` so it never blocks
 * process shutdown).
 *
 * Payload v3 endpoint handlers are plain async functions returning a
 * `Response`; there is no `next()` to call. So instead of returning a
 * classic `(req, res, next)` middleware, this returns:
 *
 *   - `check(clientIp)` - pure primitive: records the hit (when allowed),
 *     returns `{ allowed: true }` or `{ allowed: false, retryAfterSeconds }`.
 *     Easy to drive from unit tests with a fake clock.
 *   - `guard(clientIp)` - ergonomic wrapper: returns a ready-to-return
 *     `Response` (status 429, JSON body, `Retry-After` header) when denied,
 *     or `null` when allowed. Endpoint code becomes:
 *       const denied = limiter.guard(ip);
 *       if (denied) return denied;
 *
 * Bucket key format: `${bucketName}:${clientIp}`. Single shared store keeps
 * cleanup uniform; per-bucket isolation is achieved by the key prefix.
 *
 * 429 body shape (locked by the architect doc):
 *   { error: { code: 'too_many_requests', message: 'Too many requests' } }
 *
 * `Retry-After` calculation: seconds until the oldest hit in the active
 * window expires, i.e. `ceil((oldest + windowMs - now) / 1000)`, clamped >= 1.
 *
 * Memory bound: at the configured limits in BJ (20/min checkout, 10/min
 * membership), each key holds at most 20 numbers (~160 bytes). 10k unique
 * keys is bounded near 2 MB. If millions of unique attacker IPs ever become
 * a concern, swap the Map for an LRU cache (Phase 2; not built now).
 */

export type RateLimitOptions = {
  /** Bucket name used as the key prefix, e.g. `'bj:checkout'`. */
  bucketName: string;
  /** Max requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /**
   * Internal hook for tests: substitute `Date.now`. Defaults to `Date.now`.
   * Not part of the public contract.
   */
  now?: () => number;
};

export type RateLimitOutcome =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = {
  /**
   * Records a hit (when allowed) and returns the outcome. Pure-ish primitive
   * driven by tests. Does NOT mutate when denied - the existing window stays
   * as-is until the oldest entry rolls out.
   */
  check: (clientIp: string) => RateLimitOutcome;

  /**
   * Returns a ready-to-return 429 `Response` when the client is over the
   * limit, or `null` when the request is allowed. Calls `check` internally.
   */
  guard: (clientIp: string) => Response | null;

  /**
   * Stops the internal cleanup interval. Useful for tests. Calling this in
   * production is unnecessary because the timer is already `.unref()`-ed.
   */
  stop: () => void;
};

const TOO_MANY_REQUESTS_BODY = {
  error: { code: 'too_many_requests', message: 'Too many requests' },
};

export function makeRateLimit(opts: RateLimitOptions): RateLimiter {
  const { bucketName, limit, windowMs } = opts;
  const now = opts.now ?? Date.now;

  if (!bucketName || typeof bucketName !== 'string') {
    throw new Error('makeRateLimit: bucketName must be a non-empty string');
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('makeRateLimit: limit must be a positive integer');
  }
  if (!Number.isInteger(windowMs) || windowMs <= 0) {
    throw new Error('makeRateLimit: windowMs must be a positive integer');
  }

  const store = new Map<string, number[]>();

  const keyFor = (clientIp: string): string => `${bucketName}:${clientIp}`;

  const cleanup = (): void => {
    const cutoff = now() - windowMs;
    for (const [k, timestamps] of store) {
      const fresh = timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) {
        store.delete(k);
      } else if (fresh.length !== timestamps.length) {
        store.set(k, fresh);
      }
    }
  };

  const interval = setInterval(cleanup, windowMs);
  // Do not keep the Node process alive on shutdown.
  if (typeof interval.unref === 'function') interval.unref();

  const check = (clientIp: string): RateLimitOutcome => {
    const t = now();
    const cutoff = t - windowMs;
    const key = keyFor(clientIp);

    // Strict inequality: an entry exactly at the boundary has expired.
    const existing = store.get(key) ?? [];
    const inWindow = existing.filter((ts) => ts > cutoff);

    if (inWindow.length >= limit) {
      const oldest = inWindow[0]!;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + windowMs - t) / 1000),
      );
      // Persist the trimmed-down array so the next call doesn't re-scan stale
      // entries. Do NOT push the current denied hit - denied requests don't
      // count toward the budget (matches SSP behaviour).
      if (inWindow.length !== existing.length) store.set(key, inWindow);
      return { allowed: false, retryAfterSeconds };
    }

    inWindow.push(t);
    store.set(key, inWindow);
    return { allowed: true };
  };

  const guard = (clientIp: string): Response | null => {
    const outcome = check(clientIp);
    if (outcome.allowed) return null;
    return new Response(JSON.stringify(TOO_MANY_REQUESTS_BODY), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(outcome.retryAfterSeconds),
      },
    });
  };

  const stop = (): void => {
    clearInterval(interval);
  };

  return { check, guard, stop };
}
