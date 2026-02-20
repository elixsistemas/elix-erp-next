export function createSimpleCache<T>(ttlMs: number) {
  const map = new Map<string, { v: T; exp: number }>();

  return {
    get(key: string) {
      const hit = map.get(key);
      if (!hit) return null;
      if (Date.now() > hit.exp) {
        map.delete(key);
        return null;
      }
      return hit.v;
    },
    set(key: string, value: T) {
      map.set(key, { v: value, exp: Date.now() + ttlMs });
    },
  };
}
