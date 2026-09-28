/**
 * Minimal in-memory fixed-window rate limiter for login attempts.
 * Good enough for a single server; swap for Redis/Upstash when running
 * multiple instances.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 5, windowMs = 60_000, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
