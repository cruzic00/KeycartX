// api/_lib/cache.ts
// Minimal in-memory TTL cache, replacing Next's unstable_cache (which has no
// equivalent outside Next's server runtime). Each serverless function
// instance keeps its own cache — good enough for the short revalidate
// windows the original code used (60-120s), and falls back to a fresh fetch
// on every cold start.
export function withTtlCache<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
  ttlMs: number
) {
  const store = new Map<string, { value: T; expires: number }>();

  return async (...args: Args): Promise<T> => {
    const key = JSON.stringify(args);
    const hit = store.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;

    const value = await fn(...args);
    store.set(key, { value, expires: Date.now() + ttlMs });
    return value;
  };
}
