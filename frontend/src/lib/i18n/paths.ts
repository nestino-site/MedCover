import { DEFAULT_LOCALE, type Locale } from './locales'

/** Normalize to leading slash, trailing slash (matches next.config trailingSlash). */
export function normalizePath(path: string): string {
  let p = path.startsWith('/') ? path : `/${path}`
  if (!p.endsWith('/')) p = `${p}/`
  return p
}

/** Strip locale prefix from pathname if present. */
export function stripLocalePrefix(pathname: string, locales: readonly string[] = ['en']): {
  locale: Locale
  pathname: string
} {
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  if (first && first !== DEFAULT_LOCALE && locales.includes(first)) {
    const rest = segments.slice(1).join('/')
    return {
      locale: first as Locale,
      pathname: rest ? `/${rest}/` : '/',
    }
  }
  return { locale: DEFAULT_LOCALE, pathname: normalizePath(pathname || '/') }
}

/**
 * Build a public URL for a locale.
 * English (default): /countries/
 * Future DE: /de/countries/
 */
export function localizedPath(path: string, locale: Locale = DEFAULT_LOCALE): string {
  const normalized = normalizePath(path)
  if (locale === DEFAULT_LOCALE) return normalized
  if (normalized === '/') return `/${locale}/`
  return `/${locale}${normalized}`
}

export function absoluteUrl(path: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
