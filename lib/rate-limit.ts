interface Bucket { hits: number[] }

const buckets = new Map<string, Bucket>();

function prune(b: Bucket, windowMs: number, now: number) {
  const cutoff = now - windowMs;
  b.hits = b.hits.filter((t) => t > cutoff);
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) { b = { hits: [] }; buckets.set(key, b); }
  prune(b, windowMs, now);
  if (b.hits.length >= limit) {
    const oldest = b.hits[0] ?? now;
    return { ok: false, remaining: 0, limit, retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }
  b.hits.push(now);
  return { ok: true, remaining: limit - b.hits.length, limit, retryAfterSec: 0 };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    prune(b, 60_000, now);
    if (b.hits.length === 0) buckets.delete(k);
  }
}, 5 * 60_000).unref?.();