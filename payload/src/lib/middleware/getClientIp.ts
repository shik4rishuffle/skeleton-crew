/**
 * getClientIp - read the originating client IP from a request.
 *
 * Replaces Express `req.ip` + `app.set('trust proxy', ...)` because the shared
 * Payload runs Payload v3 inside Next.js, not Express. There is no Express app
 * object to flip a global trust-proxy flag on.
 *
 * Trust model: Traefik is the only ingress in the Skeleton Crew topology. The
 * Payload container is not directly reachable from the public internet, so the
 * `X-Forwarded-For` header observed inside the handler is the value Traefik
 * wrote. Traefik populates `X-Forwarded-For` by default. If the topology ever
 * changes to expose Payload directly, harden this helper to require an inbound
 * source from a trusted-proxy CIDR list.
 *
 * Resolution order:
 *   1. `X-Forwarded-For` first hop (left-most entry, comma-split, trimmed).
 *   2. `X-Real-IP` (some proxies set this instead).
 *   3. `'unknown'` sentinel - the rate limiter still buckets, just imperfectly,
 *      which is the right behaviour for local dev / non-proxied hits.
 */

export type ClientIpRequest = {
  headers: Headers | Record<string, string | string[] | undefined>;
};

export function getClientIp(req: ClientIpRequest): string {
  const get = (name: string): string | undefined => {
    if (req.headers instanceof Headers) {
      return req.headers.get(name) ?? undefined;
    }
    const bag = req.headers as Record<string, string | string[] | undefined>;
    const v = bag[name.toLowerCase()];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  const xff = get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }

  const xri = get('x-real-ip');
  if (xri) {
    const trimmed = xri.trim();
    if (trimmed) return trimmed;
  }

  return 'unknown';
}
