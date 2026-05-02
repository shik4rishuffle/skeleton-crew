/**
 * Unit tests for `getClientIp`.
 *
 * Harness: Vitest. See note in `rateLimit.test.ts` about the harness install
 * being owned by Phase 4 Foundation TASK-005 / TASK-008.
 *
 * Cases covered:
 *  11. X-Forwarded-For first-hop selection (multi-value chain)
 *  12. X-Forwarded-For single value
 *  13. X-Real-IP fallback when XFF is absent
 *  14. Whitespace trimming on first-hop XFF
 *  15. 'unknown' sentinel when no headers are present
 *  16. Both `Headers` instance and plain object header bags accepted
 */

import { describe, it, expect } from 'vitest';
import { getClientIp } from './getClientIp';

describe('getClientIp', () => {
  it('returns the first hop of X-Forwarded-For when chained', () => {
    const ip = getClientIp({
      headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
    });
    expect(ip).toBe('203.0.113.7');
  });

  it('returns the single-value X-Forwarded-For verbatim', () => {
    const ip = getClientIp({ headers: { 'x-forwarded-for': '203.0.113.7' } });
    expect(ip).toBe('203.0.113.7');
  });

  it('falls back to X-Real-IP when X-Forwarded-For is missing', () => {
    const ip = getClientIp({ headers: { 'x-real-ip': '198.51.100.4' } });
    expect(ip).toBe('198.51.100.4');
  });

  it('trims whitespace around the first XFF entry', () => {
    const ip = getClientIp({
      headers: { 'x-forwarded-for': ' 203.0.113.7 ,10.0.0.1' },
    });
    expect(ip).toBe('203.0.113.7');
  });

  it('returns "unknown" when no proxy headers are present', () => {
    const ip = getClientIp({ headers: {} });
    expect(ip).toBe('unknown');
  });

  it('accepts both a Headers instance and a plain object header bag', () => {
    const plain = getClientIp({
      headers: { 'x-forwarded-for': '203.0.113.7' },
    });
    expect(plain).toBe('203.0.113.7');

    const real = new Headers();
    real.set('X-Forwarded-For', '198.51.100.99, 10.0.0.1');
    const fromHeaders = getClientIp({ headers: real });
    expect(fromHeaders).toBe('198.51.100.99');
  });
});
