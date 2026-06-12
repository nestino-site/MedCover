/** Next.js 16 Cache Components requires ≥1 static param for build validation. */
export function ensureStaticParams<T extends Record<string, string>>(
  params: T[],
  fallback: T,
): T[] {
  return params.length > 0 ? params : [fallback]
}
