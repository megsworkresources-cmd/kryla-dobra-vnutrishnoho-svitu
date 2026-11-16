// Best-effort per-account cap on AI requests. Workers are stateless, so this
// limits bursts within one worker; it is not a hard billing cap.
const buckets = new Map<string, number[]>();

export function allowAi(kind: string, userId: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `${kind}:${userId}`;
  const list = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    buckets.set(key, list);
    return false;
  }
  list.push(now);
  buckets.set(key, list);
  if (buckets.size > 5000) buckets.clear();
  return true;
}
